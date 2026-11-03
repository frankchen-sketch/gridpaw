#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""对 nodes.json 做归类汇总；并用 seo_guard.vis 复核总数。"""
import os, re, json, html, collections, importlib.util

ROOT = '/Users/frank/workspace/gridpaw/dist/akari'
EM = '\u2014'
spec = importlib.util.spec_from_file_location('sg', '/Users/frank/workspace/gridpaw/research/2026-11-02-humanize-plan/tools/seo_guard.py')
sg = importlib.util.module_from_spec(spec); spec.loader.exec_module(sg)

rows = json.load(open('/Users/frank/.hermes/cache/scratch/g-akari/nodes.json'))

def fix_cat(r):
    # about 只限 T1 题目页
    if r['cat'] == 'about' and not r['page'].startswith('puzzle/'):
        r['cat'] = 'body'
    return r
rows = [fix_cat(r) for r in rows]

# vis 复核
vis_total = 0
pages = {}
for dp, _, fs in os.walk(ROOT):
    for f in fs:
        if f.endswith('.html'):
            p = os.path.join(dp, f)
            h = open(p, encoding='utf-8', errors='ignore').read()
            n = sg.vis(h).count(EM)
            vis_total += n
            rel = os.path.relpath(p, ROOT).replace('/index.html', '').replace('index.html', '').strip('/') or '(root)'
            pages[rel] = n
mine = collections.Counter(r['page'] for r in rows)
print('vis total', vis_total, 'mine', len(rows))
diff = {p: (vis_total, mine[p]) for p in pages if pages[p] != mine[p]}
print('page mismatch:', diff or 'none')

print('\n== 分类汇总 ==')
print(collections.Counter(r['cat'] for r in rows))

print('\n== body 明细（27 条）==')
for r in rows:
    if r['cat'] == 'body':
        print(f"[{r['page']}] {r['text']}")

print('\n== head 明细 ==')
for r in rows:
    if r['cat'] == 'head':
        print(f"[{r['page']}] {r['text']}")

print('\n== faq 明细 ==')
for r in rows:
    if r['cat'] == 'faq':
        print(f"[{r['page']}] {r['text']}")

print('\n== anchor 明细 ==')
for r in rows:
    if r['cat'] == 'anchor':
        print(f"[{r['page']}] {r['text']}")

print('\n== brand-footer 去重 ==')
print(collections.Counter(r['text'] for r in rows if r['cat'] == 'brand-footer'))

print('\n== steps 去重句式（前 20）==')
sc = collections.Counter(re.sub(r'\d+', 'N', r['text']) for r in rows if r['cat'] == 'steps')
for k, v in sc.most_common(20):
    print(v, k)
print('steps total', sum(sc.values()), 'patterns', len(sc))

# meta / JSON-LD / 注释（非 vis）
meta_n = ld_n = comment_n = attr_n = 0
for dp, _, fs in os.walk(ROOT):
    for f in fs:
        if not f.endswith('.html'):
            continue
        h = open(os.path.join(dp, f), encoding='utf-8', errors='ignore').read()
        head = re.search(r'(?is)<head\b.*?</head>', h)
        if head:
            meta_n += sum(m.group(0).count(EM) for m in re.finditer(r'(?is)<meta\s[^>]*>', head.group(0)))
        ld_n += sum(b.count(EM) for b in re.findall(r'(?is)<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', h))
        comment_n += sum(c.count(EM) for c in re.findall(r'(?s)<!--(.*?)-->', h))
        attr_n += sum(len(re.findall('\\b(?:alt|aria-label|title)="([^"]*)"', a)[0].count(EM)) for a in re.findall(r'(?is)<(?:img|a|button|input)\b[^>]*>', h))
print('\n== 非 vis 计数 ==')
print('meta(content) em:', meta_n, ' JSON-LD em:', ld_n, ' HTML 注释 em:', comment_n)
