#!/usr/bin/env python3
"""把 L47 用到的物品纹理导出成 WebP 精灵集 -> build/sprites_webp/

编码参数与 make_play_L47_full.py 内联精灵完全一致（最长边 64px、WEBP q=82、
RGBA），因此每个 .webp 文件的字节 == HTML 里 SPR[id] 的 base64 解码结果。
同时导出 34 个桶的家族样图（48px）-> build/sprites_webp/_family_icons/
产物:
  build/sprites_webp/<id>.webp          136 张物品精灵
  build/sprites_webp/_family_icons/<fam>.webp
  build/sprites_webp/manifest.json      尺寸/字节/sha256
用法: python3 build_sprites_webp.py
"""
import base64
import hashlib
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from PIL import Image

import render_levels_v7 as R

BUILD = os.environ.get('FKSZW_BUILD', os.path.join(HERE, '..', 'build'))
OUT = f'{BUILD}/sprites_webp'


def b64img(im, fmt='WEBP', q=82):
    buf = io.BytesIO()
    im.convert('RGBA').save(buf, fmt, quality=q)
    return base64.b64encode(buf.getvalue()).decode()


def encode(iid, px, id2file):
    im = Image.open(id2file[iid]).convert('RGBA')
    s = px / max(im.size)
    if s < 1:
        im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    b64 = b64img(im)
    return b64, im.size


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(f'{OUT}/_family_icons', exist_ok=True)
    id2file = R.build_maps()
    levels = R.load_levels()
    items = levels[47]['items']
    fam_first = {}
    for c in items:
        fam_first.setdefault(c['id'].split('-')[0], c['id'])

    used = {c['id'] for c in items}
    manifest = {'level': 47, 'name': levels[47]['name'], 'sprites': {}, 'family_icons': {}}
    bad = []
    for iid in sorted(used):
        try:
            b64, size = encode(iid, 64, id2file)
        except Exception as e:
            bad.append((iid, str(e)))
            continue
        raw = base64.b64decode(b64)
        open(f'{OUT}/{iid}.webp', 'wb').write(raw)
        manifest['sprites'][iid] = {
            'file': f'{iid}.webp', 'w': size[0], 'h': size[1], 'bytes': len(raw),
            'sha256': hashlib.sha256(raw).hexdigest()[:16],
        }
    for fam, iid in fam_first.items():
        b64, size = encode(iid, 48, id2file)
        raw = base64.b64decode(b64)
        open(f'{OUT}/_family_icons/{fam}.webp', 'wb').write(raw)
        manifest['family_icons'][fam] = {
            'file': f'_family_icons/{fam}.webp', 'src_item': iid,
            'w': size[0], 'h': size[1], 'bytes': len(raw),
        }

    json.dump(manifest, open(f'{OUT}/manifest.json', 'w'), ensure_ascii=False, indent=1)
    total = sum(v['bytes'] for v in manifest['sprites'].values())
    print(f'物品精灵: {len(manifest["sprites"])} 张, 原始 {total//1024}KB -> {OUT}/')
    print(f'家族样图: {len(manifest["family_icons"])} 张 -> {OUT}/_family_icons/')
    if bad:
        print('失败:', bad)

    # 与已生成 HTML 的 SPR 对账（若存在）
    html = os.path.join(HERE, '..', 'fkszw_play_L47_full.html')
    if os.path.exists(html):
        import re
        h = open(html, encoding='utf-8').read()
        m = re.search(r'\bSPR\s*=\s*\{', h)
        if m:
            start = m.end() - 1
            depth = 0
            for i in range(start, len(h)):
                if h[i] == '{':
                    depth += 1
                elif h[i] == '}':
                    depth -= 1
                    if depth == 0:
                        SPR = json.loads(h[start:i + 1])
                        break
            same = sum(1 for k, v in manifest['sprites'].items()
                       if k in SPR and base64.b64decode(SPR[k]) == open(f"{OUT}/{v['file']}", 'rb').read())
            print(f'与 HTML SPR 对账: {same}/{len(manifest["sprites"])} 张字节一致 (HTML 共 {len(SPR)} 张)')


if __name__ == '__main__':
    main()
