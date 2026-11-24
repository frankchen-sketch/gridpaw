#!/usr/bin/env python3
"""抓 puzzlegamemaster 的「Word Kitchen <Pack> Answers [All Levels in One Page]」
里的每关答案表，只用来**给每关选 KEY 词**（游戏真正要的最长答案），
并记录该关答案数量用于交叉校验。不复制其正文。

产出 scripts/wk/raw_pgm/<slug>.json: {"pack","slug","levels":[{"level","answers":[...]}]}
"""
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

OUT = Path(__file__).resolve().parent / "raw_pgm"
PROXY = "http://127.0.0.1:7882"
BASE = "https://puzzlegamemaster.com/"

opener = urllib.request.build_opener(
    urllib.request.ProxyHandler({"http": PROXY, "https": PROXY}))
opener.addheaders = [("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36")]


def fetch(url, tries=3):
    for i in range(tries):
        try:
            with opener.open(url, timeout=45) as r:
                return r.read().decode("utf-8", "replace")
        except Exception:
            if i == tries - 1:
                return ""
    return ""


def text_of(html):
    t = re.sub(r"<script.*?</script>", " ", html, flags=re.S)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    idx = fetch(BASE + "word-kitchen-all-answers/")
    links = sorted(set(re.findall(r"https?://[^\"' ]*word-kitchen-[a-z0-9-]+-answers-all/?", idx)))
    print(f"{len(links)} pack pages", file=sys.stderr)
    if not links:
        sys.exit("no pack links found (index page changed?)")

    def work(url):
        t = text_of(fetch(url))
        slug = re.search(r"word-kitchen-([a-z0-9-]+)-answers-all", url).group(1)
        name = re.search(r"Word Kitchen ([A-Za-z][A-Za-z ]{1,30}?) Level 1", t)
        levels = {}
        for m in re.finditer(r"Word Kitchen ([A-Za-z][A-Za-z ]{1,30}?) Level (\d+)\s*(.*?)(?=Word Kitchen [A-Za-z]|Level Switcher|$)", t):
            lv = int(m.group(2))
            words = [w.strip().lower() for w in re.split(r"[,|]", m.group(3)) if re.fullmatch(r"[A-Za-z]{2,}", w.strip())]
            if words:
                levels.setdefault(lv, words)
        return slug, name.group(1).strip() if name else slug, levels

    with ThreadPoolExecutor(max_workers=8) as ex:
        for slug, name, levels in ex.map(work, links):
            if not levels:
                print("  EMPTY", slug, file=sys.stderr)
                continue
            (OUT / f"{slug}.json").write_text(json.dumps(
                {"pack": name, "slug": slug,
                 "levels": [{"level": k, "answers": v} for k, v in sorted(levels.items())]},
                ensure_ascii=False, indent=1))
    print(f"wrote {len(list(OUT.glob('*.json')))} packs", file=sys.stderr)


if __name__ == "__main__":
    main()
