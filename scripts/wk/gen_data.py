#!/usr/bin/env python3
"""托盘字母 + 本关答案集（真值） → 站点数据。

数据来源分工：
  raw/<pack>.json          托盘字母（视频帧或另一站字母行）
  raw_answers/<pack>.json  本关答案集（第二来源），用于定 key、算「本关要填的词」
  public/data/wk-words.txt + en_50k  额外词（字典反推，标为 extra）

用法: gen_data.py [--only <slug>[,<slug>...]]
"""
import json, sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "scripts/wk/raw"
ANS = ROOT / "scripts/wk/raw_answers"
WORDS = ROOT / "public/data/wk-words.txt"
FREQ = Path.home() / ".hermes/cache/scratch/en_50k.txt"
OUT = ROOT / "src/data/word-kitchen-packs.json"
VIDEO_MAP = ROOT / "scripts/wk/video_map.json"
VIDEOS = json.loads(VIDEO_MAP.read_text()) if VIDEO_MAP.exists() else {}

JUNK = {"dah","hae","rom","rec","lear","goa","ley","lar","yar","eff","fer","cis","mis","mus","bey","eta","ora"}
MAX_RANK = 20000
MIN_LEN = 3


def load_rank():
    rank = {}
    for i, line in enumerate(FREQ.read_text().splitlines(), 1):
        p = line.split()
        if p and p[0].lower() not in rank:
            rank[p[0].lower()] = i
    return rank


def submultisets(counter):
    items = list(counter.items())
    out = [()]

    def rec(i, cur):
        if i == len(items):
            if cur:
                out.append(tuple(cur))
            return
        ch, n = items[i]
        for k in range(n + 1):
            rec(i + 1, cur + [ch] * k)
    rec(0, [])
    return out


def spellable(word, tray_counter):
    c = Counter(word)
    return all(tray_counter[ch] >= n for ch, n in c.items())


def main():
    only = None
    if "--only" in sys.argv:
        only = {s.strip() for s in sys.argv[sys.argv.index("--only") + 1].split(",") if s.strip()}

    words = [w.strip() for w in WORDS.read_text().split() if w.strip()]
    ALL_WORDS = set(words)          # 答案词只要求「是英文词」，不受词频砍杀
    rank = load_rank()
    index = defaultdict(list)
    for w in words:
        if len(w) < MIN_LEN or w in JUNK or rank.get(w, 10**9) > MAX_RANK:
            continue
        index["".join(sorted(w))].append(w)

    packs, mismatches, total_ans = [], [], 0
    for f in sorted(RAW.glob("*.json")):
        raw = json.loads(f.read_text())
        slug = raw["slug"]
        if only and slug not in only:
            continue
        ans_file = ANS / f"{slug}.json"
        answers = {}
        if ans_file.exists():
            for lv in json.loads(ans_file.read_text())["levels"]:
                answers[lv["level"]] = [w.lower() for w in lv["answers"]]

        levels = []
        for lv in sorted(raw["levels"], key=lambda x: x["level"]):
            letters = lv["letters"].upper().replace(" ", "")
            c = Counter(letters.lower())
            hits = set()
            for sig in submultisets(c):
                for w in index.get("".join(sorted(sig)), ()):
                    hits.add(w)
            common = sorted(hits, key=lambda w: (-len(w), rank.get(w, 10**9), w))
            if not common:
                sys.exit(f"{slug} L{lv['level']}: no words for tray {letters}")

            truth = answers.get(lv["level"])
            if truth is not None:
                bad = [w for w in truth if not spellable(w, c)]
                if bad:
                    mismatches.append((slug, lv["level"], letters, bad))
                truth = [w for w in truth if spellable(w, c) and w in ALL_WORDS]
                if not truth:
                    sys.exit(f"{slug} L{lv['level']}: 答案集与托盘对不上，且清洗后为空")
            else:
                truth = []

            truth_sorted = sorted(truth, key=lambda w: (-len(w), rank.get(w, 10**9), w))
            pool = truth_sorted if truth_sorted else common
            full = [w for w in pool if len(w) == len(letters)]
            key = full[0] if full else pool[0]
            extra = [w for w in common if w not in set(truth)] if truth else []
            total_ans += len(truth)
            levels.append({
                "level": lv["level"], "letters": letters, "key": key,
                "has_full": bool(full), "full_length": full,
                "answers": truth_sorted, "answer_count": len(truth_sorted),
                "extra": extra, "extra_count": len(extra),
                "words": common, "all_count": len(common),
            })
        if not levels:
            print(f"SKIP pack {slug}: no usable levels", file=sys.stderr)
            continue
        packs.append({"slug": slug, "name": raw["pack"], "video": VIDEOS.get(slug),
                      "source": raw.get("source", {}), "has_answers": bool(answers),
                      "levels": levels})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"packs": packs}, ensure_ascii=False, indent=1))
    tl = sum(len(p["levels"]) for p in packs)
    tw = sum(len(l["words"]) for p in packs for l in p["levels"])
    print(f"{len(packs)} packs, {tl} levels, {tw} dictionary entries, {total_ans} true answers")
    if mismatches:
        print("⚠ 答案集与托盘不一致:", file=sys.stderr)
        for m in mismatches[:10]:
            print("   ", m, file=sys.stderr)


if __name__ == "__main__":
    main()
