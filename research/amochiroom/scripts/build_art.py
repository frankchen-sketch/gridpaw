#!/usr/bin/env python3
"""Amochiroom 美术落地 + 数据重建（单一流水线）。

从 APK 解包产物生成：
  public/amochiroom/art/i/<slug>.webp   物品贴图（最长边 112px）
  public/amochiroom/art/b/<file>.webp   房间背景（宽 720px）
  src/data/amochiroom-levels.json       页面用的完整数据集

坐标口径与游戏一致：原点在背景图中心，单位=背景像素（rooms/<room>_vN 那批为 bg_logical_size
相机尺寸）；物品显示尺寸 = catalog 的 w/h × |scaleX|/|scaleY|，scale 的符号位 = 镜像，
angle 为旋转角度。rooms 关的 scale 是 0.18~0.85 的绝对缩放，不能只取符号。

用法（在 gridpaw worktree 根目录）：
  /usr/bin/python3 research/amochiroom/scripts/build_art.py
  （homebrew 的 python3 没装 Pillow；系统自带的 /usr/bin/python3 有）
"""
import io
import json
import os
import sys
import zipfile

try:
    from PIL import Image
except ModuleNotFoundError:  # homebrew 的 python3 没装 Pillow，系统自带的那个有
    sys.exit('缺 Pillow：改用 /usr/bin/python3 跑本脚本（实测 3.9.6 + Pillow 11.3 可用），'
             '或 pip install Pillow 到当前解释器。')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
UNPACK = os.path.join(ROOT, 'research/amochiroom/unpack')
SRC = os.path.join(UNPACK, 'amochiroom_levels.json')
APK = os.path.join(UNPACK, 'com.gamefactory.roomsort.apk')
CATALOG = os.path.join(UNPACK, 'apk_data/assets/www/assets/art/v3_review_20261104/catalog.json')
OUT_DATA = os.path.join(ROOT, 'src/data/amochiroom-levels.json')
PUB = os.path.join(ROOT, 'public/amochiroom/art')

ITEM_MAX = 96
ITEM_Q = 76
BG_W = 720
BG_Q = 76
THUMB_W = 240
THUMB_Q = 74


def slug(path):
    """items/103-2.webp -> 103-2.webp；items/variants/1-10.webp -> variants-1-10.webp"""
    p = path[len('items/'):] if path.startswith('items/') else path
    return p.replace('/', '-')


def main():
    z = zipfile.ZipFile(APK)
    geom = json.load(open(CATALOG))['items']
    src = json.load(open(SRC))
    os.makedirs(os.path.join(PUB, 'i'), exist_ok=True)
    os.makedirs(os.path.join(PUB, 'b'), exist_ok=True)

    item_cache = {}   # 原始 sprite 路径 -> 落地文件名
    bg_cache = {}     # 原始背景路径 -> (落地文件名, w, h)
    raw_bytes = out_bytes = 0
    missing_sprite = set()

    def land_item(sprite):
        nonlocal raw_bytes, out_bytes
        if sprite in item_cache:
            return item_cache[sprite]
        name = slug(sprite)
        dst = os.path.join(PUB, 'i', name)
        if os.path.exists(dst) and os.path.getsize(dst) > 0:
            item_cache[sprite] = name
            return name
        try:
            raw = z.read('assets/www/assets/' + sprite)
        except KeyError:
            missing_sprite.add(sprite)
            return None
        raw_bytes += len(raw)
        im = Image.open(io.BytesIO(raw)).convert('RGBA')
        im.thumbnail((ITEM_MAX, ITEM_MAX), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=ITEM_Q, method=5)
        out_bytes += len(buf.getvalue())
        open(os.path.join(PUB, 'i', name), 'wb').write(buf.getvalue())
        item_cache[sprite] = name
        return name

    def land_bg(sprite):
        nonlocal raw_bytes, out_bytes
        if sprite in bg_cache:
            return bg_cache[sprite]
        # rooms/<room>_vN/background.webp 这类重名（L131-133）必须带房间名，否则互相覆盖
        if sprite.startswith('rooms/'):
            room = sprite.split('/')[1]
            name = f'{room}-bg.webp'
        else:
            name = os.path.basename(sprite)
        raw = z.read('assets/www/assets/' + sprite)
        raw_bytes += len(raw)
        im = Image.open(io.BytesIO(raw)).convert('RGB')
        w, h = im.size
        big = im.copy()
        big.thumbnail((BG_W, 4000), Image.LANCZOS)
        buf = io.BytesIO()
        big.save(buf, 'WEBP', quality=BG_Q, method=5)
        out_bytes += len(buf.getvalue())
        open(os.path.join(PUB, 'b', name), 'wb').write(buf.getvalue())
        # 索引页缩略图（240 宽）
        thumb = im.copy()
        thumb.thumbnail((THUMB_W, 4000), Image.LANCZOS)
        tbuf = io.BytesIO()
        thumb.save(tbuf, 'WEBP', quality=THUMB_Q, method=5)
        open(os.path.join(PUB, 'b', 't-' + name), 'wb').write(tbuf.getvalue())
        bg_cache[sprite] = (name, w, h)
        return bg_cache[sprite]

    levels_out = []
    for lvl in src['levels']:
        bgname, bgw, bgh = land_bg(lvl['bg_sprite'])
        # 画布口径：rooms/<room>_vN 用 bg_logical_size（= 相机逻辑尺寸，bg 按 cover 填进去），
        # 其余关用背景原始像素 —— 物品坐标都以这个画布为单位、原点在画布中心
        logical = lvl.get('bg_logical_size')
        if logical:
            bgw, bgh = int(logical[0]), int(logical[1])
        items = []
        by_type = {}
        for it in lvl['items']:
            fn = land_item(it['sprite'])
            if fn is None:
                continue
            g = geom.get(it['id']) or {}
            cw, ch = int(g.get('w') or 100), int(g.get('h') or 100)
            # 显示尺寸 = catalog w/h × |scale|（scale 不只是镜像：rooms/<room>_vN 那 40 关
            # 逐件给 0.18~0.85 的绝对缩放，丢了就会把物品放大 5 倍糊满整块板）
            sx, sy = abs(it['scaleX']), abs(it['scaleY'])
            w = max(1, round(cw * sx))
            h = max(1, round(ch * sy))
            fx = -1 if it['scaleX'] < 0 else 1
            fy = -1 if it['scaleY'] < 0 else 1
            ang = it['angle'] or 0
            items.append([fn, it['x'], it['y'], fx, fy, ang, w, h, it['type']])
            by_type.setdefault(it['type'], []).append(fn)

        boxes = []
        for b in lvl['boxes']:
            seen, thumbs = set(), []
            for fn in by_type.get(b['type'], []):
                if fn not in seen:
                    seen.add(fn)
                    thumbs.append(fn)
                if len(thumbs) == 3:
                    break
            boxes.append({
                'name': b['label_en'],
                'nameZh': b['label_zh'],
                'count': b['capacity'],
                'type': b['type'],
                'queue': b['queue_index'],
                'thumbs': thumbs,
            })

        levels_out.append({
            'level': lvl['level'],
            'sourceLevel': lvl['source_level'],
            'name': lvl['name_en'],
            'nameZh': lvl['name_zh'],
            'difficulty': lvl.get('difficulty'),
            'passRate': lvl.get('est_pass_rate_pct'),
            'boxCount': lvl['box_count'],
            'itemCount': lvl['item_count'],
            'categoryCount': lvl['category_count'],
            'bg': '/amochiroom/art/b/' + bgname,
            'thumb': '/amochiroom/art/b/t-' + bgname,
            'bgW': bgw,
            'bgH': bgh,
            'boxes': boxes,
            'items': items,
        })

    # 几何审计：单件占板面积（>25% 基本等于摆错或尺寸口径错，历史上 L131-133 就是这样露的）
    worst = []
    for L in levels_out:
        area = L['bgW'] * L['bgH']
        mx = max((i[6] * i[7] / area for i in L['items']), default=0)
        worst.append((round(mx * 100, 1), L['level'], L['name']))
    worst.sort(reverse=True)
    print('单件占板面积 Top5:', worst[:5])

    meta = {
        'game': 'Amochiroom Puzzle: Room Sort',
        'package': 'com.gamefactory.roomsort',
        'publisher': 'ABF ALPENHOF',
        'apkVersion': '1.0.20',
        'apkVersionCode': 20,
        'source': 'APK assets/www/assets/art/v3_review_20261104/catalog.json (levelSequence=compact-v11)',
        'note': 'Positions/sizes as shipped; some levels are re-dealt per player.',
        'levelCount': len(levels_out),
        'boxCount': sum(len(l['boxes']) for l in levels_out),
        'itemCount': sum(len(l['items']) for l in levels_out),
        'itemImages': len(item_cache),
        'backgrounds': len(bg_cache),
        'itemBytes': out_bytes,
    }
    json.dump({'meta': meta, 'levels': levels_out}, open(OUT_DATA, 'w'),
              ensure_ascii=False, separators=(',', ':'))
    print(f'关卡 {len(levels_out)} | 箱 {meta["boxCount"]} | 物品 {meta["itemCount"]}')
    print(f'贴图 {len(item_cache)} 个 / 背景 {len(bg_cache)} 张')
    print(f'原始 {raw_bytes/1024/1024:.1f} MB -> 落地 {out_bytes/1024/1024:.1f} MB')
    print(f'数据文件 {os.path.getsize(OUT_DATA)/1024/1024:.2f} MB')
    if missing_sprite:
        print('⚠ 缺贴图', len(missing_sprite), sorted(missing_sprite)[:5])


if __name__ == '__main__':
    main()
