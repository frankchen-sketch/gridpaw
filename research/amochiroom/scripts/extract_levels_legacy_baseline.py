#!/usr/bin/env python3
"""
从 Amochiroom APK 解包数据生成关卡数据集。

数据源（全部来自 assets/www/）：
  assets/data/storage-legacy/level-<N>.json   135 个关卡快照（order=箱子需求，content=盘面物品）
  assets/data/storage-legacy/index.json       关卡目录
  assets/i18n/system/en.json                  level.<N> 房间名 / type.<id> 物品类别名
  game/src/services/level-sequence.js         REMOVED_LEVELS 扣除规则（compact-v11）

玩家可见编号 = legacy 编号扣掉 REMOVED_LEVELS 后重排（服务端 LEVEL_SEQUENCE_VERSION=compact-v11）。
"""
import json, os, sys, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # research/amochiroom
WWW = os.path.join(ROOT, "unpack", "www", "assets", "www")
LEG = os.path.join(WWW, "assets", "data", "storage-legacy")
I18N = os.path.join(WWW, "assets", "i18n", "system", "en.json")
OUT = os.path.join(ROOT, "data", "levels.json")

REMOVED = [53, 73, 79, 98, 133]


def current_level(legacy: int) -> int:
    return legacy - sum(1 for r in REMOVED if r < legacy)


def main() -> int:
    en = json.load(open(I18N, encoding="utf-8"))
    rows, missing_name, missing_type = [], [], set()

    for n in range(1, 136):
        if n in REMOVED:
            continue
        path = os.path.join(LEG, f"level-{n}.json")
        if not os.path.exists(path):
            print(f"!! 缺文件 legacy {n}", file=sys.stderr)
            continue
        d = json.load(open(path, encoding="utf-8"))

        # 房间名：优先 level.<legacy>，其次解析 nameKey
        name = en.get(f"level.{n}")
        if not name:
            nk = d.get("nameKey") or ""
            name = en.get(nk)
        if not name:
            missing_name.append(n)

        boxes = []
        for o in d.get("order", []):
            t, c = o.get("type"), o.get("count")
            label = en.get(f"type.{t}")
            if not label:
                missing_type.add(t)
            boxes.append({"type": t, "count": c, "name": label})

        items = d.get("content", [])
        rows.append({
            "level": current_level(n),
            "sourceLevel": n,
            "name": name or f"Level {n}",
            "bg": d.get("bgFile"),
            "bgId": d.get("bg"),
            "boxes": boxes,
            "boxCount": len(boxes),
            "itemCount": len(items),
        })

    rows.sort(key=lambda r: r["level"])
    expected = list(range(1, len(rows) + 1))
    got = [r["level"] for r in rows]
    assert got == expected, f"编号不连续: {set(expected) ^ set(got)}"

    meta = {
        "game": "Amochiroom Puzzle: Room Sort",
        "package": "com.gamefactory.roomsort",
        "apkVersion": "1.0.20",
        "sequenceVersion": "compact-v11",
        "removedLegacyLevels": REMOVED,
        "bufferSlots": 7,
        "bufferOpen": 5,
        "orderSlots": 3,
        "orderOpen": 2,
        "hintTimes": 3,
        "source": "APK assets/www/assets/data/storage-legacy + i18n/system/en.json",
        "generatedAt": "2026-11-24",
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"meta": meta, "levels": rows}, open(OUT, "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))

    print(f"写出 {OUT}: {len(rows)} 关")
    print(f"缺房间名: {missing_name or '无'}")
    print(f"缺物品名 type: {sorted(missing_type) or '无'}")
    print("\n抽样:")
    for r in rows[:3] + rows[-1:]:
        print(f"  L{r['level']:>3} (src {r['sourceLevel']:>3}) {r['name']:<22} "
              f"箱 {r['boxCount']:>2} 物品 {r['itemCount']:>3}  | "
              + ", ".join(f"{b['name']}×{b['count']}" for b in r["boxes"][:4]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
