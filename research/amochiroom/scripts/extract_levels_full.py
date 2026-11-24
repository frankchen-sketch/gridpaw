#!/usr/bin/env python3
"""Export Amochiroom Puzzle: Room Sort bundled level data from the APK.

Sources (all inside com.gamefactory.roomsort.apk):
  assets/www/assets/art/v3_review_20261104/catalog.json   -> levels / types / item geometry
  assets/www/assets/art/v3_review_20261104/manifest.json  -> item id -> sprite path
  assets/www/assets/i18n/en.json                          -> English type/level labels
  assets/www/game/src/core/rules.js                       -> buffer/order slot rules
  assets/www/game/src/core/buffer-failure.js               -> buffer slot variants
  assets/www/game/src/services/star-rating.js              -> star time thresholds
  assets/www/game/src/core/meta.js                         -> star3PerItem / star2PerItem
  assets/www/assets/data/storage-legacy/level-N.json       -> legacy copy, used for cross-check
"""
import json, hashlib, os, re, collections, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
WWW = os.path.join(ROOT, "apk_data/assets/www")
APK = os.path.join(ROOT, "com.gamefactory.roomsort.apk")
XAPK = os.path.join(ROOT, "amochiroom_1.0.20.xapk")

def sha256(path, limit=None):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(1 << 20)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()

cat_path = os.path.join(WWW, "assets/art/v3_review_20261104/catalog.json")
man_path = os.path.join(WWW, "assets/art/v3_review_20261104/manifest.json")
catalog = json.load(open(cat_path))
manifest = json.load(open(man_path))
en = json.load(open(os.path.join(WWW, "assets/i18n/en.json")))

types_zh = {str(k): v for k, v in catalog["types"].items()}
types_en = {k.split(".", 1)[1]: v for k, v in en.items() if k.startswith("type.")}
levels_en = {k.split(".", 1)[1]: v for k, v in en.items() if k.startswith("level.")}
item_sprites = manifest["items"]
bg_sprites = manifest["backgrounds"]

# ---- rules (values transcribed from the listed source files; see README) ----
rules = {
    "order_slots": 3,
    "order_open_at_start": 2,
    "order_capacity_default": 3,
    "order_capacity_experiment": 4,
    "buffer_slots": 7,
    "buffer_open_at_start": 5,
    "hint_idle_seconds": 15,
    "hint_times": 3,
    "clear_count": 3,
    "eagle_max": 5,
    "cover_contact_min": 0.01,
    "cover_block_min": 0.045,
    "star_control": {"seconds_per_item_for_3": 3, "seconds_per_item_for_2": 5},
    "star_treatment": {"three_star_max_seconds": 720, "two_star_max_seconds": 960},
    "buffer_failure_variants": {
        "control": {"base_slots": 5, "total_slots": 7, "fail_when_full": False},
        "deadlock_notice": {"base_slots": 5, "total_slots": 7, "fail_when_full": False},
        "full_fail": {"base_slots": 5, "total_slots": 7, "fail_when_full": True},
        "full_fail_plus_one": {"base_slots": 6, "total_slots": 8, "fail_when_full": True},
    },
}

odds_src = open(os.path.join(WWW, "game/src/data/level-odds.js")).read()
build_src = open(os.path.join(WWW, "game/src/view/build-info.js")).read()
mbuild = re.search(r"\{.*\}", build_src)
build = json.loads(mbuild.group(0)) if mbuild else {}
mb = re.search(r"bands:\{easy:(\d+),middle:(\d+)\}", odds_src)
odds_bands = {"easy": int(mb.group(1)), "middle": int(mb.group(2))} if mb else {"easy": 60, "middle": 25}
ml = re.search(r"levels:\{([0-9:,.]+)\}", odds_src)
odds_levels = {int(k): int(v) for k, v in re.findall(r"(\d+):(\d+)", ml.group(1))} if ml else {}

def difficulty(p):
    if p is None:
        return None
    if p >= odds_bands.get("easy", 60):
        return "easy"
    if p >= odds_bands.get("middle", 25):
        return "middle"
    return "hard"

levels_out = []
problems = []
for L in catalog["levels"]:
    lvl = L["level"]
    src = L.get("sourceLevel", lvl)
    boxes = []
    cap_by_type = collections.Counter()
    for qi, o in enumerate(L["order"], start=1):
        t = o["type"]
        cap_by_type[t] += o["count"]
        boxes.append({
            "queue_index": qi,
            "type": t,
            "label_zh": types_zh.get(str(t)),
            "label_en": types_en.get(str(t)),
            "capacity": o["count"],
        })
    items = []
    cnt_by_type = collections.Counter()
    missing_sprite = 0
    for it in L["content"]:
        t = int(it["id"].split("-")[0])
        cnt_by_type[t] += 1
        sprite = item_sprites.get(it["id"])
        if sprite is None:
            missing_sprite += 1
        items.append({
            "id": it["id"],
            "type": t,
            "label_zh": types_zh.get(str(t)),
            "label_en": types_en.get(str(t)),
            "sprite": sprite,
            "x": it["x"], "y": it["y"],
            "scaleX": it.get("scaleX", 1), "scaleY": it.get("scaleY", 1),
            "angle": it.get("angle", 0),
        })
    if cap_by_type != cnt_by_type:
        problems.append({"level": lvl, "missing_items": {str(k): v for k, v in (cap_by_type - cnt_by_type).items()},
                         "extra_items": {str(k): v for k, v in (cnt_by_type - cap_by_type).items()}})
    p = odds_levels.get(lvl)
    levels_out.append({
        "level": lvl,
        "source_level": src,
        "name_zh": L.get("name"),
        "name_en": (levels_en.get(L["nameKey"].split(".", 1)[1]) if L.get("nameKey") else None) or levels_en.get(str(src)),
        "name_key": L.get("nameKey") or f"level.{src}",
        "bg": L.get("bg"),
        "bg_file": L.get("bgFile"),
        "bg_sprite": bg_sprites.get(L.get("bgFile")),
        "bg_pos_x": L.get("bgPosX", 0),
        "bg_logical_size": L.get("bgLogicalSize"),
        "room_view": L.get("roomView"),
        "fixed_order": L.get("fixedOrder"),
        "fixed_item_colors": L.get("fixedItemColors"),
        "box_count": len(boxes),
        "item_count": len(items),
        "total_capacity": sum(b["capacity"] for b in boxes),
        "category_count": len(cap_by_type),
        "categories": [{"type": t, "label_zh": types_zh.get(str(t)), "label_en": types_en.get(str(t)),
                        "items": cnt_by_type[t], "capacity": cap_by_type[t]}
                       for t in sorted(cnt_by_type)],
        "boxes": boxes,
        "items": items,
        "est_pass_rate_pct": p,
        "difficulty": difficulty(p),
    })

# ---- cross-check against the separate legacy per-level JSON export ----
legacy_dir = os.path.join(WWW, "assets/data/storage-legacy")
checked = matched = 0
legacy_diffs = []
for rec in levels_out:
    f = os.path.join(legacy_dir, f"level-{rec['source_level']}.json")
    if not os.path.exists(f):
        continue
    checked += 1
    leg = json.load(open(f))
    same_order = leg.get("order") == [{"type": b["type"], "count": b["capacity"]} for b in rec["boxes"]]
    same_items = ([{"id": i["id"], "x": i["x"], "y": i["y"], "scaleX": i["scaleX"],
                    "scaleY": i["scaleY"], "angle": i["angle"]} for i in rec["items"]] == leg.get("content"))
    if same_order and same_items:
        matched += 1
    else:
        legacy_diffs.append({"level": rec["level"], "source_level": rec["source_level"],
                             "order_match": same_order, "items_match": same_items})

total_items = sum(r["item_count"] for r in levels_out)
total_boxes = sum(r["box_count"] for r in levels_out)
out = {
    "meta": {
        "game": "Amochiroom Puzzle: Room Sort",
        "package": "com.gamefactory.roomsort",
        "publisher": "ABF ALPENHOF",
        "apk_version": build.get("version", "1.0.20"),
        "apk_version_code": build.get("code"),
        "build_info_source": "assets/www/game/src/view/build-info.js",
        "xapk_file": os.path.basename(XAPK),
        "xapk_bytes": os.path.getsize(XAPK),
        "xapk_sha256": sha256(XAPK),
        "base_apk_file": os.path.basename(APK),
        "base_apk_bytes": os.path.getsize(APK),
        "base_apk_sha256": sha256(APK),
        "engine": "Android WebView hybrid (io.ionic style assets/www) + HTML5 canvas game; no Unity assets",
        "level_catalog_source": "assets/www/assets/art/v3_review_20261104/catalog.json",
        "level_catalog_sha256": sha256(cat_path),
        "level_sequence": catalog.get("levelSequence"),
        "level_count": len(levels_out),
        "item_count": total_items,
        "box_count": total_boxes,
        "type_label_count_zh": len(types_zh),
        "type_label_count_en": len(types_en),
        "sprite_manifest_source": "assets/www/assets/art/v3_review_20261104/manifest.json",
        "sprite_manifest_items": len(item_sprites),
        "legacy_cross_check": {"levels_checked": checked, "levels_identical": matched, "diffs": legacy_diffs},
        "integrity": {"levels_with_capacity_mismatch": problems},
        "extracted_by": "UnityPy not required; plain zip + JSON",
    },
    "rules": rules,
    "types": {"zh": types_zh, "en": types_en},
    "levels": levels_out,
}
out_path = os.path.join(ROOT, "amochiroom_levels.json")
json.dump(out, open(out_path, "w"), ensure_ascii=False, indent=1)
print("wrote", out_path, os.path.getsize(out_path), "bytes")
print("levels", len(levels_out), "items", total_items, "boxes", total_boxes)
print("capacity mismatches", len(problems))
print("legacy checked", checked, "matched", matched, "diffs", len(legacy_diffs))
print("levels missing en name", [r["level"] for r in levels_out if not r["name_en"]][:10])
print("items without sprite", sum(1 for r in levels_out for i in r["items"] if not i["sprite"]))

# compact CSV index for quick eyeballing / spreadsheet use
import csv
csv_path = os.path.join(ROOT, "levels_index.csv")
with open(csv_path, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["level", "source_level", "name_zh", "name_en", "bg_file", "box_count",
                "item_count", "total_capacity", "category_count", "est_pass_rate_pct", "difficulty"])
    for r in levels_out:
        w.writerow([r["level"], r["source_level"], r["name_zh"], r["name_en"], r["bg_file"],
                    r["box_count"], r["item_count"], r["total_capacity"], r["category_count"],
                    r["est_pass_rate_pct"] if r["est_pass_rate_pct"] is not None else "",
                    r["difficulty"] or ""])
print("wrote", csv_path)
