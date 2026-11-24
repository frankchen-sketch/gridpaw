#!/usr/bin/env python3
"""托盘字母 → 站点数据（1.6k 关量级：子-多重集查表，不做全词表扫描）。"""
import json, sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "scripts/wk/raw"
WORDS = ROOT / "public/data/wk-words.txt"
FREQ = Path.home() / ".hermes/cache/scratch/en_50k.txt"
OUT = ROOT / "src/data/word-kitchen-packs.json"

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


def main():
    words = [w.strip() for w in WORDS.read_text().split() if w.strip()]
    rank = load_rank()
    index = defaultdict(list)
    for w in words:
        if len(w) < MIN_LEN or w in JUNK or rank.get(w, 10**9) > MAX_RANK:
            continue
        index["".join(sorted(w))].append(w)

    packs = []
    SKIP = {"malicoco"}  # 该包竞品页格式不同（3 字母托盘），数据不可信
    for f in sorted(RAW.glob("*.json")):
        raw = json.loads(f.read_text())
        if raw["slug"] in SKIP:
            continue
        levels = []
        for lv in sorted(raw["levels"], key=lambda x: x["level"]):
            letters = lv["letters"].upper().replace(" ", "")
            if len(letters) < 5:
                continue  # 3-4 字母托盘在游戏里不存在，是抓取噪声
            c = Counter(letters.lower())
            hits = set()
            for sig in submultisets(c):
                for w in index.get("".join(sorted(sig)), ()):
                    hits.add(w)
            # 最长词里取词频最高的那个当 key（更接近游戏真实答案，避免 NIRVANA 这类冷词抢标题）
            common = sorted(hits, key=lambda w: (-len(w), rank.get(w, 10**9), w))
            if not common:
                sys.exit(f"{raw['slug']} L{lv['level']}: no words for tray {letters}")
            full = [w for w in common if len(w) == len(letters)]
            key = full[0] if full else common[0]   # 没有全字母词时取最长词
            if len(key) < 5:
                continue
            levels.append({"level": lv["level"], "letters": letters, "key": key,
                           "has_full": bool(full), "full_length": full,
                           "words": common, "all_count": len(common),
                           "t": lv.get("t"), "end": lv.get("end")})
        if not levels:
            print(f"SKIP pack {raw['slug']}: no usable levels", file=sys.stderr)
            continue
        packs.append({"slug": raw["slug"], "name": raw["pack"],
                      "source": raw.get("source", {}), "levels": levels})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"packs": packs}, ensure_ascii=False, indent=1))
    tl = sum(len(p["levels"]) for p in packs)
    tw = sum(len(l["words"]) for p in packs for l in p["levels"])
    print(f"{len(packs)} packs, {tl} levels, {tw} word entries")


if __name__ == "__main__":
    main()
