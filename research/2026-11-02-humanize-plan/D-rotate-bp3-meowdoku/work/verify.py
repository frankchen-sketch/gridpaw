#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""改前/改后自检：正文 dash 计数、数字多重集、不动清单行一致性。"""
import glob, json, os, re, sys
from collections import Counter

BASE = '/Users/frank/workspace/gridpaw'
OUT = os.path.join(BASE, 'research/2026-11-02-humanize-plan/D-rotate-bp3-meowdoku')
PROP = os.path.join(OUT, 'proposed')
DASH = '\u2014'


def split_fm(s):
    m = re.match(r'^---\n(.*?)\n---\n', s, re.S)
    return (m.group(1), s[m.end():]) if m else ('', s)


def classify_bp3(s):
    fm, body = split_fm(s)
    fm_l = [l for l in fm.split('\n') if DASH in l]
    faq_l, attr_l, body_n = [], [], 0
    for line in body.split('\n'):
        if DASH not in line:
            continue
        st = line.strip()
        if st.startswith('<details>') or st.startswith('<summary'):
            faq_l.append(line)
        elif 'alt="' in line or 'title="' in line:
            attr_l.append(line)
        elif re.match(r'<h[1-6]', st) or st.startswith('<strong>'):
            attr_l.append(line)          # 标题类，等同于不动
        else:
            body_n += line.count(DASH)
    return dict(fm=sum(l.count(DASH) for l in fm_l),
                faq=sum(l.count(DASH) for l in faq_l),
                attr=sum(l.count(DASH) for l in attr_l),
                body=body_n,
                fm_lines=fm_l, faq_lines=faq_l, attr_lines=attr_l)


def digits(s):
    return sorted(c for c in s if c.isdigit())


def protected_astro(s):
    """不动清单里的整行：取行内容做集合比对"""
    keys = []
    for line in s.split('\n'):
        st = line.strip()
        if ('<details>' in st or st.startswith('<summary') or 'alt="' in st
                or re.match(r'<h[1-6]', st) or st.startswith('<strong>')
                or re.match(r'const (title|description|faqJsonLd)', st)):
            keys.append(st)
    return keys


def main():
    ok = True
    rows = []
    files = sorted(glob.glob(os.path.join(BASE, 'src/pages/brain-puzzle-3-level-*/index.astro'))) + \
            sorted(glob.glob(os.path.join(BASE, 'src/pages/rotate-rings/**/*.astro'), recursive=True))
    for f in files:
        rel = os.path.relpath(f, BASE)
        before = open(f, encoding='utf-8').read()
        after_path = os.path.join(PROP, rel)
        after = open(after_path, encoding='utf-8').read() if os.path.exists(after_path) else before
        b, a = classify_bp3(before), classify_bp3(after)
        d_ok = digits(before) == digits(after)
        p_ok = protected_astro(before) == protected_astro(after)
        if not d_ok or not p_ok:
            ok = False
        rows.append((rel, b['body'], a['body'], b['faq'], a['faq'], b['fm'], a['fm'], b['attr'], d_ok, p_ok))
    # meowdoku
    p = os.path.join(BASE, 'src/data/meowdoku-levels.json')
    bj = open(p, encoding='utf-8').read()
    aj = open(os.path.join(PROP, 'src/data/meowdoku-levels.json'), encoding='utf-8').read()
    d_ok = digits(bj) == digits(aj)
    dl = json.loads(bj); al = json.loads(aj)
    def body_count(levels):
        c = 0
        for lv in levels:
            for k in ('anchor', 'close', 'strategic', 'trap'):
                c += lv['solve'][k].count(DASH) if k in ('anchor', 'close') else lv[k].count(DASH)
            c += sum(s.count(DASH) for s in lv['solve']['steps'])
            c += sum(s.count(DASH) for s in lv['regionsGuide'])
            c += sum(s.count(DASH) for s in lv['contacts'])
            c += sum(s.count(DASH) for s in lv['hints'])
        return c
    mb, ma = body_count(dl), body_count(al)
    # 事实守恒：除标点/连接词外内容一致 —— 简化校验：去标点后字符序列长度与词集合
    def words(levels):
        import itertools
        w = Counter()
        for lv in levels:
            for k in ('anchor', 'close', 'strategic', 'trap'):
                s = lv['solve'][k] if k in ('anchor', 'close') else lv[k]
                w.update(x.lower() for x in re.findall(r'[A-Za-z0-9]+', s))
            for s in lv['solve']['steps'] + lv['regionsGuide'] + lv['contacts'] + lv['hints']:
                w.update(x.lower() for x in re.findall(r'[A-Za-z0-9]+', s))
        return w
    wb, wa = words(dl), words(al)
    added = wa - wb
    removed = wb - wa
    print('meowdoku body dashes %d -> %d ; digits_same=%s' % (mb, ma, d_ok))
    print('words added:', dict(added), 'removed:', dict(removed))
    if ma != 0 or not d_ok:
        ok = False
    # 允许的连接词增删（句号拆句后句首大写另算，已统一小写）
    allowed_add = {'and', 'so', 'but'}
    if set(added) - allowed_add or set(removed) - {'and', 'so'}:
        ok = False
        print('!! 词表变化超范围')
    tb = sum(r[1] for r in rows); ta = sum(r[2] for r in rows)
    tfaq_b = sum(r[3] for r in rows); tfaq_a = sum(r[4] for r in rows)
    tfm_b = sum(r[5] for r in rows); tfm_a = sum(r[6] for r in rows)
    tattr_b = sum(r[7] for r in rows)
    print('astro pages: %d ; body dashes %d -> %d ; faq %d->%d ; fm %d->%d ; attr(heading/alt) %d' %
          (len(rows), tb, ta, tfaq_b, tfaq_a, tfm_b, tfm_a, tattr_b))
    bad = [r for r in rows if not (r[8] and r[9])]
    print('digit/protected mismatches:', len(bad))
    for r in bad[:5]:
        print('  ', r)
    changed = [r for r in rows if r[1] != r[2]]
    print('astro files changed:', len(changed))
    left = [r for r in rows if r[2] != 0]
    print('files with body dashes left:', [(r[0], r[2]) for r in left])
    print('RESULT', 'OK' if ok and ta == 0 and not left else 'CHECK')
    json.dump(rows, open(os.path.join(OUT, 'work', 'verify_rows.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
