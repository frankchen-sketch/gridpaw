#!/usr/bin/env python3
"""按 v7 模型导出 L47 纯背景（1460×1560）与内联用 800px 场景图

规则与 render_levels_v7.py / make_play_L47_full.py 完全一致：
  背景原生尺寸水平居中 + bgPosX，竖直贴顶；物品原点 = 背景图中心
产物:
  build/fkszw_v7/L47_数码产品店_bg.png    1460×1560 纯背景（无物品）
  build/fkszw_v7/L47_scene_800.jpg       800×854 JPEG q72（HTML 内联的那张）
用法: python3 make_v7_bg.py
"""
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from PIL import Image

import render_levels_v7 as R

BUILD = os.environ.get('FKSZW_BUILD', os.path.join(HERE, '..', 'build'))
CW, CH = 1460, 1560


def main():
    levels = R.load_levels()
    d = levels[47]
    outdir = f'{BUILD}/fkszw_v7'
    os.makedirs(outdir, exist_ok=True)
    canvas = Image.new('RGBA', (CW, CH), (240, 234, 221, 255))
    bg = Image.open(f'{BUILD}/fkszw_bg/gamebg_{d["bg"]:02d}.jpg').convert('RGBA')
    bx = (CW - bg.width) // 2 + int(d['bgPosX'] or 0)
    canvas.alpha_composite(bg, (bx, 0))
    p1 = f'{outdir}/L47_{d["name"]}_bg.png'
    canvas.convert('RGB').save(p1)
    scene = canvas.convert('RGB').resize((800, int(800 * CH / CW)), Image.LANCZOS)
    buf = io.BytesIO()
    scene.save(buf, 'JPEG', quality=72)
    p2 = f'{outdir}/L47_scene_800.jpg'
    open(p2, 'wb').write(buf.getvalue())
    print(f'v7 背景: {p1} {CW}x{CH}, bg 原生 {bg.size} 居中偏移 {bx}')
    print(f'内联场景: {p2} {scene.size} {len(buf.getvalue())//1024}KB')


if __name__ == '__main__':
    main()
