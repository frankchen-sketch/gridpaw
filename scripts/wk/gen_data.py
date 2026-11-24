#!/usr/bin/env python3
"""托盘字母 → 站点数据（词表自动生成）。

输入：scripts/wk/raw/<pack>.json，形如
  {"pack": "Bebinca", "slug": "bebinca", "source": {"video": "...", "channel": "Go Answer"},
   "levels": [{"level": 1, "letters": "PARTY"}, ...]}

输出：src/data/word-kitchen-packs.json
  {"packs": [{"slug","name","source","levels":[{"level","letters","key","full_length","words","all_count"}]}]}

词表口径（2026-11-24 定，法老同意）：ENABLE ∩ 词频前 20000（hermitdave en_50k），
3 字母起，去掉少量词典但游戏基本不收的边角词。
"""
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "scripts/wk/raw"
WORDS = ROOT / "public/data/wk-words.txt"
FREQ = Path.home() / ".hermes/cache/scratch/en_50k.txt"
OUT = ROOT / "src/data/word-kitchen-packs.json"

JUNK = {"dah", "hae", "rom", "rec", "lear", "goa", "ley", "lar", "yar",
        "eff", "fer", "cis", "mis", "mus", "bey", "eta", "ora"}
MAX_RANK = 20000
MIN_LEN = 3


def load_rank():
    rank = {}
    for i, line in enumerate(FREQ.read_text().splitlines(), 1):
        p = line.split()
        if p and p[0].lower() not in rank:
            rank[p[0].lower()] = i
    return rank


def main():
    if not WORDS.exists():
        sys.exit(f"missing {WORDS}")
    words = [w.strip() for w in WORDS.read_text().split() if w.strip()]
    wcount = {w: Counter(w) for w in words}
    rank = load_rank()

    packs = []
    for f in sorted(RAW.glob("*.json")):
        raw = json.loads(f.read_text())
        levels = []
        for lv in sorted(raw["levels"], key=lambda x: x["level"]):
            letters = lv["letters"].upper().replace(" ", "")
            c = Counter(letters.lower())
            hits = [w for w in words if not (wcount[w] - c)]
            common = sorted(
                {w for w in hits
                 if len(w) >= MIN_LEN and w not in JUNK and rank.get(w, 10**9) <= MAX_RANK},
                key=lambda w: (-len(w), w),
            )
            if not common:
                sys.exit(f"{raw['slug']} L{lv['level']}: no words for tray {letters}")
            full = [w for w in common if len(w) == len(letters)]
            key = lv.get("key") or (full[0] if full else common[0])
            # 全字母词必须能解释托盘（否则说明读错了一个字母）
            if full and key not in full:
                key = full[0]
            if not full:
                print(f"WARN {raw['slug']} L{lv['level']} tray {letters}: no full-length word "
                      f"(tray may be misread; key={key})", file=sys.stderr)
            levels.append({
                "level": lv["level"], "letters": letters, "key": key,
                "full_length": full, "words": common, "all_count": len(hits),
                "t": lv.get("t"), "end": lv.get("end"),
            })
        packs.append({
            "slug": raw["slug"], "name": raw["pack"],
            "source": raw.get("source", {}), "levels": levels,
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"packs": packs}, ensure_ascii=False, indent=1))
    for p in packs:
        print(f"{p['name']:14} {len(p['levels']):3} levels, "
              f"{sum(len(l['words']) for l in p['levels']):5} words")


if __name__ == "__main__":
    main()
