#!/usr/bin/env python3
"""抓 wordkitchenanswers.com 的「Letter Ingredients」托盘字母（事实字段），
用于把 WK 覆盖面从 7 个包扩到全部包。正文/文案一概不抓、不复用。

产出 scripts/wk/raw_spider/<slug>.json：
  {"pack","slug","levels":[{"level","letters","spider_key","url"}]}

纪律：只取字母序列 + 该页标题里的 KEYWORD 用作交叉校验，其它文本丢弃。
"""
import json
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

OUT = Path(__file__).resolve().parent / "raw_spider"
SITEMAP = "https://wordkitchenanswers.com/sitemap.xml"
PROXY = "http://127.0.0.1:7882"

opener = urllib.request.build_opener(
    urllib.request.ProxyHandler({"http": PROXY, "https": PROXY}),
)
opener.addheaders = [("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36")]


def fetch(url: str, tries: int = 3) -> str:
    for i in range(tries):
        try:
            with opener.open(url, timeout=45) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            if i == tries - 1:
                raise
            time.sleep(1.5 * (i + 1))
    return ""


def text_of(html: str) -> str:
    t = re.sub(r"<script.*?</script>", " ", html, flags=re.S)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t)


def parse(html: str, url: str):
    t = text_of(html)
    m = re.search(r"Letter Ingredients:\s*((?:[A-Z]\s+){2,12}[A-Z])", t)
    if not m:
        return None
    letters = re.sub(r"[^A-Z]", "", m.group(1))
    km = re.search(r"\(([A-Z]{3,})\)\s*Answers", t) or re.search(r"Level \d+\s*\(([A-Z]{3,})\)", t)
    key = km.group(1) if km else None
    lv = re.search(r"/level-(\d+)/?$", url)
    nm = re.search(r"Word Kitchen\s+(.+?)\s+Level\s+\d+", t)
    return {"letters": letters, "spider_key": key, "pack_name": nm.group(1) if nm else None,
            "level": int(lv.group(1)) if lv else None}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sm = fetch(SITEMAP)
    urls = re.findall(r"<loc>([^<]+)</loc>", sm)
    levels = [u for u in urls if "/level-" in u]
    packs = {}
    for u in levels:
        m = re.search(r"/pack-([a-z0-9-]+)/level-(\d+)", u)
        if m:
            packs.setdefault(m.group(1), []).append(u)
    print(f"{len(levels)} level urls in {len(packs)} packs", file=sys.stderr)

    def work(item):
        slug, u = item
        try:
            rec = parse(fetch(u), u)
        except Exception as e:
            return slug, u, None, str(e)
        return slug, u, rec, None

    results = {}
    errors = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        for slug, u, rec, err in ex.map(work, [(s, u) for s, us in packs.items() for u in us]):
            if err or not rec:
                errors.append((u, err or "no letters"))
                continue
            results.setdefault(slug, {})[rec["level"]] = rec

    for slug, lvmap in results.items():
        names = [d["pack_name"] for d in lvmap.values() if d.get("pack_name")]
        name = max(set(names), key=names.count) if names else slug.replace("-", " ").title()
        recs = [{"level": lv, **{k: v for k, v in d.items() if k not in ("level", "pack_name")}}
                for lv, d in sorted(lvmap.items())]
        (OUT / f"{slug}.json").write_text(json.dumps(
            {"pack": name, "slug": slug, "levels": recs}, ensure_ascii=False, indent=1))
    print(f"packs written {len(results)}, errors {len(errors)}", file=sys.stderr)
    for u, e in errors[:10]:
        print("  ERR", u, e, file=sys.stderr)


if __name__ == "__main__":
    main()
