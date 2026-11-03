#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""只读扫描 dist/akari 渲染页的 U+2014，按 DOM 上下文归类。"""
import os, re, json, html, collections
from html.parser import HTMLParser

ROOT = '/Users/frank/workspace/gridpaw/dist/akari'
EM = '\u2014'
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []   # (tag, attrs dict)
        self.nodes = []   # (text, chain list of (tag, cls, id))
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style'):
            self.skip += 1
            self.stack.append((tag, a))
            return
        if tag in VOID:
            return
        self.stack.append((tag, a))
    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = max(0, self.skip - 1)
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break
    def handle_data(self, data):
        if self.skip or EM not in data:
            return
        chain = [(t, a.get('class',''), a.get('id','')) for t, a in self.stack]
        self.nodes.append((data, chain))

def chain_sig(chain):
    parts = []
    for t, c, i in chain:
        s = t
        if c: s += '.' + '.'.join(c.split())
        if i: s += '#' + i
        parts.append(s)
    return '>'.join(parts)

def cls_of(chain, tag):
    for t, c, i in reversed(chain):
        if t == tag:
            return c, i
    return None, None

def inside(chain, tag):
    return any(t == tag for t, _, _ in chain)

def category(text, chain):
    tags = [t for t, _, _ in chain]
    if 'title' in tags:
        return 'head'
    if any(t in ('h1','h2','h3','h4','h5','h6') for t in tags):
        return 'head'
    if any(t == 'details' and ('steps-section' in c or i == 'steps-section') for t, c, i in chain):
        return 'steps'
    if any(t == 'details' for t in tags) or any('faq-answer' in c.split() for _, c, _ in chain):
        return 'faq'
    if 'footer' in tags:
        return 'brand-footer'
    if 'GridPaw ' + EM in text or 'GridPaw' + EM in text:
        return 'brand-footer'
    if any('ext-' in c for _, c, _ in chain):
        return 'brand-footer'
    if any(t == 'a' for t in tags):
        return 'anchor'
    # T1 About 段：section.seo-content 内、About 标题后的 p
    if any(t == 'p' for t in tags):
        for t, c, i in chain:
            if t == 'section' and 'seo-content' in c.split():
                return 'about'
    return 'body'

def scan_page(path):
    raw = open(path, encoding='utf-8', errors='ignore').read()
    p = P()
    p.feed(raw)
    p.close()
    rows = []
    for text, chain in p.nodes:
        if EM not in text:
            continue
        cat = category(text, chain)
        for _ in range(text.count(EM)):
            rows.append({
                'page': os.path.relpath(path, ROOT).replace('/index.html','').replace('index.html','').strip('/') or '(root)',
                'cat': cat,
                'text': ' '.join(text.split())[:220],
                'chain': chain_sig(chain)[-260:],
            })
    return rows

def main():
    allrows = []
    for dp, _, fs in os.walk(ROOT):
        for f in fs:
            if f.endswith('.html'):
                allrows.extend(scan_page(os.path.join(dp, f)))
    out = '/Users/frank/.hermes/cache/scratch/g-akari/nodes.json'
    json.dump(allrows, open(out,'w'), ensure_ascii=False, indent=1)
    print('total vis em dashes:', len(allrows))
    print('pages with em:', len({r['page'] for r in allrows}))
    print('by cat:', dict(collections.Counter(r['cat'] for r in allrows)))
    print('by page:')
    for pg, n in sorted(collections.Counter(r['page'] for r in allrows).items()):
        cats = collections.Counter(r['cat'] for r in allrows if r['page']==pg)
        print(f'  {pg:42s} {n:4d}  {dict(cats)}')

if __name__ == '__main__':
    main()
