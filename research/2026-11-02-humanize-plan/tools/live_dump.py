#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""线上验收：把 urls.json 里的每个 URL 用 curl -sL 下载到目录（结构与 dist 一致：/x/ -> x/index.html）。
    python3 live_dump.py --urls <urls.json> --site https://gridpaw.com --out <目录>
输出：目录内的页面文件 + 标准输出的 200/非200 统计。
之后用 seo_guard.py dist --base <改前dist> --cand <目录> 做守恒比对。
"""
import argparse
import concurrent.futures as cf
import json
import os
import re
import subprocess


def path_for(u):
    if u == '/':
        return 'index.html'
    if u.endswith('/'):
        return u.strip('/') + '/index.html'
    return u.lstrip('/')


def get(site, u):
    r = subprocess.run(['curl', '-sL', '--max-time', '40', '-H', 'Cache-Control: no-cache',
                        '-w', '\n__CODE__%{http_code}', site + u], capture_output=True)
    out = r.stdout.decode('utf-8', 'ignore')
    m = re.search(r'\n__CODE__(\d+)$', out)
    if not m:
        return u, 0, ''
    return u, int(m.group(1)), out[:m.start()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--urls', required=True)
    ap.add_argument('--site', default='https://gridpaw.com')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    urls = json.load(open(a.urls, encoding='utf-8'))
    with cf.ThreadPoolExecutor(8) as ex:
        res = list(ex.map(lambda u: get(a.site, u), urls))
    bad = [(u, c) for u, c, _ in res if c != 200]
    for u, c, body in res:
        if c != 200:
            continue
        p = os.path.join(a.out, path_for(u))
        os.makedirs(os.path.dirname(p) or a.out, exist_ok=True)
        with open(p, 'w', encoding='utf-8') as fh:
            fh.write(body)
    print(f'URL {len(urls)} | 200: {len(urls) - len(bad)} | 非200: {bad[:8] or 0}')


if __name__ == '__main__':
    main()
