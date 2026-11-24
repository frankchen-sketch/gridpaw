#!/usr/bin/env python3
"""校验托盘字母：变位词一致性 + 与自有视频真值比对。

用法：
  python3 scripts/wk/validate_letters.py               # 校验 raw_spider/*
  python3 scripts/wk/validate_letters.py --truth       # 额外与 raw/*（视频读帧）逐关比对

判定：
  ok        = 字母能拼出该页标称 KEY 词（大小写无关）
  key_miss  = 拼不出（说明竞品页有错，或我们解析错了）
  no_key    = 该页没给 KEY，只能做"能拼出词典里某个等长词"的弱校验
  truth_*   = 与视频真值逐关比对结果
"""
import argparse
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPIDER = Path(__file__).resolve().parent / "raw_spider"
RAW = Path(__file__).resolve().parent / "raw"

# 自有视频真值（vision 逐帧读过、变位词自检过）
TRUTH = {
    "bebinca": {1: "PARTY", 2: "LRAYE", 3: "FREOF", 4: "EAMBY", 5: "SMCUI",
                6: "ATEDH", 7: "MAROJ", 8: "OALGN", 9: "ARTEH", 10: "CEIPR"},
    "tuna-mousse": {2: "DEUMRR", 9: "ITEVCA", 14: "GNIEEN", 18: "TOKPCE"},
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--truth", action="store_true")
    args = ap.parse_args()

    words = set(w.strip() for w in (ROOT / "public/data/wk-words.txt").read_text().split())
    wc = {w: Counter(w) for w in words}

    tot = ok = miss = nokey = 0
    bad = []
    for f in sorted(SPIDER.glob("*.json")):
        d = json.loads(f.read_text())
        for lv in d["levels"]:
            tot += 1
            L, K = lv["letters"], (lv.get("spider_key") or "").upper()
            if K:
                if Counter(L.lower()) == Counter(K.lower()):
                    ok += 1
                else:
                    miss += 1
                    bad.append((d["slug"], lv["level"], L, K))
            else:
                c = Counter(L.lower())
                if any(len(w) == len(L) and not (wc[w] - c) for w in words):
                    nokey += 1
                else:
                    miss += 1
                    bad.append((d["slug"], lv["level"], L, "—"))
    print(f"总计 {tot} 关：ok {ok} / no_key {nokey} / 冲突 {miss}")
    for b in bad[:20]:
        print("  冲突", b)

    if args.truth:
        t_ok = t_bad = 0
        for slug, levels in TRUTH.items():
            f = SPIDER / f"{slug}.json"
            if not f.exists():
                print(f"  (无 {slug} 的 spider 数据)")
                continue
            d = json.loads(f.read_text())
            got = {lv["level"]: lv["letters"] for lv in d["levels"]}
            for n, truth in levels.items():
                g = got.get(n)
                if g == truth:
                    t_ok += 1
                else:
                    t_bad += 1
                    print(f"  真值不符 {slug} L{n}: 视频={truth} 竞品={g}")
        print(f"真值比对：一致 {t_ok} / 不符 {t_bad}")


if __name__ == "__main__":
    main()
