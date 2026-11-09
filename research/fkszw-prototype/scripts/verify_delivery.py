#!/usr/bin/env python3
"""交付自检：JS 语法 + 结构计数 + 精灵完整性 + 体积

用法: python3 verify_delivery.py [html路径]
输出每条 PASS/FAIL，任一 FAIL 退出码非 0。
"""
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.environ.get('FKSZW_BUILD', os.path.join(HERE, '..', 'build'))
HTML = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'fkszw_play_L47_full.html')


def grab(text, name):
    m = re.search(r'\b' + name + r'\s*=\s*([\{\[])', text)
    if not m:
        return None
    start = m.start(1)
    op = text[start]
    cl = '}' if op == '{' else ']'
    depth = 0
    for i in range(start, len(text)):
        if text[i] == op:
            depth += 1
        elif text[i] == cl:
            depth -= 1
            if depth == 0:
                return json.loads(text[start:i + 1])
    return None


def main():
    h = open(HTML, encoding='utf-8').read()
    ok = True

    def check(label, cond, detail):
        nonlocal ok
        ok = ok and bool(cond)
        print(('PASS' if cond else 'FAIL'), label, detail)

    scripts = re.findall(r'<script[^>]*>(.*?)</script>', h, re.S)
    js_ok = False
    with tempfile.TemporaryDirectory() as td:
        for i, s in enumerate(scripts):
            p = os.path.join(td, f's{i}.js')
            open(p, 'w').write(s)
            r = subprocess.run(['node', '--check', p], capture_output=True, text=True)
            js_ok = js_ok or r.returncode == 0
            if r.returncode:
                print('  node stderr:', r.stderr.strip()[:300])
    check('JS 语法', js_ok and len(scripts) == 1, f'{len(scripts)} 个 script 块, node --check 通过')

    SPR = grab(h, 'SPR')
    ITEMS = grab(h, 'ITEMS')
    BUCKETS = grab(h, 'BUCKETS')
    check('物品数据 207 条', len(ITEMS or []) == 207, f'{len(ITEMS or [])}')
    check('桶 34 个', len(BUCKETS or []) == 34, f'{len(BUCKETS or [])}')
    fams = {i['f'] for i in (ITEMS or [])}
    check('家族 22 个', len(fams) == 22, f'{len(fams)}')
    check('桶需求合计 = 物品数', sum(b['need'] for b in (BUCKETS or [])) == len(ITEMS or []),
          f"{sum(b['need'] for b in (BUCKETS or []))} / {len(ITEMS or [])}")
    check('桶家族 ⊆ 物品家族', {b['fam'] for b in (BUCKETS or [])} <= fams,
          f"{len({b['fam'] for b in (BUCKETS or [])})} 桶家族")
    missing = [i['t'] for i in (ITEMS or []) if i['t'] not in (SPR or {})]
    check('精灵引用无缺失', not missing, f'{len(set(i["t"] for i in ITEMS or []))} 种纹理 / SPR {len(SPR or {})}')
    b64 = re.findall(r'[A-Za-z0-9+/]{200,}={0,2}', h)
    check('base64 data URI > 170', len(b64) > 170, f'{len(b64)} 段（精灵 {len(SPR or {})} + 桶样图 {len(BUCKETS or [])} + 背景 1）')
    check('无未替换占位符', not any(p in h for p in ('__BG__', '__SPR__', '__DATA__', '__BUCKETS__')), '')
    blockers = sum(1 for i in (ITEMS or []) if i['b'])
    print(f'INFO 有遮挡依赖的物品: {blockers}/207')
    print(f'INFO 体积: {os.path.getsize(HTML)//1024} KB ({os.path.getsize(HTML)} B)')
    print('ALL PASS' if ok else 'HAS FAILURES')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
