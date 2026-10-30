#!/usr/bin/env python3
"""疯狂收杂物 web 版——1-20 关生产打包器
从解包数据(fkszw_levels_all.json + config_docs.pkl)产出:
  game/packs/level-XX.js   window.__PACK = {seq, theme, bg, sprites, famIcons, items, buckets, config}
  game/levels.js           window.__LEVELS = [{seq, theme, themeEn, items, buckets}]
算法与 L47 试玩原型完全一致: 逐像素遮挡 ≥15% 判被压; 精灵 64px webp q82; 坐标 1460x1560 设计空间。
用法: python3 make_game_packs.py [seq范围，默认1-20]
"""
import base64, io, json, os, pickle, re, sys
from collections import Counter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageChops
import render_levels_v7 as R
import game_families as G

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.environ.get('FKSZW_BUILD', os.path.join(HERE, '..', 'build'))
OUT = os.path.join(HERE, '..', 'game', 'packs')
CW, CH = 1460, 1560
SEQ_RANGE = range(1, 21)

THEME_EN = {
    '默认': 'Classic', '数码产品店': 'Gadget Store', '服装店': 'Clothing Store', '便利店': 'Convenience Store',
    '厨房': 'Kitchen', '超市': 'Supermarket', '杂货铺': 'General Store', '玩具店': 'Toy Store',
    '文具店': 'Stationery Shop', '美发店': 'Hair Salon', '诊室': 'Clinic', '修车厂': 'Auto Garage',
    '客厅': 'Living Room', '卧室': 'Bedroom', '奶茶店': 'Milk Tea Shop', '咖啡店': 'Coffee Shop',
    '药房': 'Pharmacy', '水果店': 'Fruit Shop', '電玩城': 'Arcade', '电玩城': 'Arcade',
    '会议室': 'Meeting Room', '办公区': 'Office', '化妆后台': 'Backstage', '校园理发室': 'Campus Salon',
    'KTV包厢': 'KTV Room', '玄关': 'Entryway', '餐厅后厨': 'Restaurant Kitchen', '手工体验店': 'Craft Studio',
    '生鲜区': 'Fresh Market', '棋牌室': 'Game Parlor', '健身房': 'Gym', '我的书房': 'My Study',
    '游戏厅': 'Arcade', '汽车工厂': 'Car Factory', '游戏机厅': 'Arcade', '咖啡厅': 'Cafe', '电影院': 'Cinema',
}

def b64img(im, fmt='WEBP', q=82):
    buf = io.BytesIO()
    im.convert('RGBA').save(buf, fmt, quality=q)
    return base64.b64encode(buf.getvalue()).decode()

def load_docs():
    docs = pickle.load(open(f'{BUILD}/config_docs.pkl', 'rb'))
    idxmap, catalog, orders = {}, {}, {}
    for _, v in docs:
        if not isinstance(v, dict):
            continue
        ks = set(v.keys())
        if ks == {'bg', 'end', 'level', 'name', 'theme'}:
            idxmap[int(v['bg'])] = int(v['level'])
            orders[int(v['bg'])] = v.get('name', '默认')
        elif ks == {'icon', 'name', 'type'}:
            catalog[str(v['type'])] = v['name']
    order_docs = {}
    for _, v in docs:
        if isinstance(v, dict) and 'order' in v and 'content' in v and v.get('bg') is not None:
            order_docs[int(v['bg'])] = v['order']
    return idxmap, catalog, orders, order_docs

def placed_mask(c, id2file):
    im = Image.open(id2file[c['id']]).convert('RGBA')
    w = max(1, int(abs(im.width * c['scaleX']))); h = max(1, int(abs(im.height * c['scaleY'])))
    ss = im.resize((w, h), Image.LANCZOS)
    if c['scaleX'] < 0: ss = ss.transpose(Image.FLIP_LEFT_RIGHT)
    if c['scaleY'] < 0: ss = ss.transpose(Image.FLIP_TOP_BOTTOM)
    ss = ss.rotate(-(c['angle'] or 0), expand=True, resample=Image.BICUBIC)
    a = ss.getchannel('A').point(lambda p: 255 if p > 64 else 0)
    px, py = int(CW / 2 + c['x']), int(CH / 2 - c['y'])
    return a, (px - a.width // 2, py - a.height // 2)

def compute_blockers(items, id2file):
    masks = [placed_mask(c, id2file) for c in items]
    blockers = []
    for i in range(len(items)):
        ai, (ix0, iy0) = masks[i]
        out = []
        for j in range(i + 1, len(items)):
            aj, (jx0, jy0) = masks[j]
            x1 = max(ix0, jx0); y1 = max(iy0, jy0)
            x2 = min(ix0 + ai.width, jx0 + aj.width); y2 = min(iy0 + ai.height, jy0 + aj.height)
            if x2 <= x1 or y2 <= y1: continue
            ci = ai.crop((x1 - ix0, y1 - iy0, x2 - ix0, y2 - iy0))
            cj = aj.crop((x1 - jx0, y1 - jy0, x2 - jx0, y2 - jy0))
            and_px = ImageChops.multiply(ci, cj).histogram()[255]
            if and_px == 0: continue
            area_i = ci.histogram()[255]
            if area_i and and_px / area_i >= 0.15: out.append(j)
        blockers.append(out)
    return blockers

def sprite(id2file, iid, px=64):
    im = Image.open(id2file[iid]).convert('RGBA')
    s = px / max(im.size)
    if s < 1: im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    return b64img(im)

def main():
    os.makedirs(OUT, exist_ok=True)
    id2file = R.build_maps()
    all_levels = json.load(open(f'{BUILD}/fkszw_levels_all.json'))
    by_seq = {e['seq']: e for e in all_levels if e.get('seq')}
    idxmap, catalog, themes, order_docs = load_docs()
    bg_dir = f'{BUILD}/fkszw_bg'
    manifest = []
    total_bytes = 0
    for seq in SEQ_RANGE:
        e = by_seq[seq]
        bg = e['bg']
        order = order_docs.get(int(bg))
        assert order, f'seq{seq} bg{bg} 无 order 文档'
        items = e['items']
        fam_of = [c['id'].split('-')[0] for c in items]
        fam_count = Counter(fam_of)
        fams_needed = Counter()
        for o in order: fams_needed[str(o['type'])] += o['count']
        assert fams_needed == fam_count, f'seq{seq} 家族不匹配: {set(fams_needed) ^ set(fam_count)}'
        blockers = compute_blockers(items, id2file)
        blocked = sum(1 for b in blockers if b)
        data = []
        for i, c in enumerate(items):
            im = Image.open(id2file[c['id']])
            w = abs(im.width * c['scaleX']); h = abs(im.height * c['scaleY'])
            data.append({'t': c['id'], 'f': fam_of[i],
                         'left': round((CW / 2 + c['x']) / CW * 100, 3),
                         'top': round((CH / 2 - c['y']) / CH * 100, 3),
                         'w': round(w / CW * 100, 3), 'h': round(h / CH * 100, 3),
                         'sx': 1 if c['scaleX'] >= 0 else -1, 'sy': 1 if c['scaleY'] >= 0 else -1,
                         'a': c['angle'] or 0, 'b': blockers[i]})
        sprites = {}
        for it in data:
            if it['t'] not in sprites: sprites[it['t']] = sprite(id2file, it['t'])
        fam_icon, fam_first = {}, {}
        for i, f in enumerate(fam_of):
            if f not in fam_first: fam_first[f] = items[i]['id']
        buckets = []
        for o in order:
            f = str(o['type'])
            fam_icon[f] = sprite(id2file, fam_first[f], 48)
            buckets.append({'fam': f, 'need': o['count'], 'name': G.en_name(f), 'cat': G.cat(f), 'icon': fam_icon[f]})
        # 背景
        bg_files = [f for f in os.listdir(bg_dir) if f.startswith(f'gamebg_{bg}.')]
        bg_fallback = False
        if bg_files:
            raw = open(os.path.join(bg_dir, bg_files[0]), 'rb').read()
        else:
            raw = open(os.path.join(bg_dir, 'gamebg_47.jpg'), 'rb').read()
            bg_fallback = True
        theme_cn = themes.get(int(bg), '默认')
        pack = {
            'seq': seq, 'bgId': bg, 'theme': theme_cn, 'themeEn': THEME_EN.get(theme_cn, 'Classic'),
            'bg': 'data:image/jpeg;base64,' + base64.b64encode(raw).decode(),
            'sprites': sprites, 'items': data, 'buckets': buckets,
            'config': {'hints': 3, 'pliers': 3, 'tray': 6, 'openBuckets': 2, 'denyRatio': 0.15},
        }
        js = 'window.__PACK=' + json.dumps(pack, ensure_ascii=False, separators=(',', ':')) + ';\n'
        path = f'{OUT}/level-{seq:02d}.js'
        open(path, 'w', encoding='utf-8').write(js)
        size = os.path.getsize(path)
        total_bytes += size
        manifest.append({'seq': seq, 'bgId': bg, 'theme': theme_cn, 'themeEn': pack['themeEn'],
                         'items': len(data), 'buckets': len(buckets), 'blocked': blocked,
                         'clean': len(data) - blocked, 'bytes': size, 'bgFallback': bg_fallback})
        print(f"seq{seq:>2} bg{bg:<3} {theme_cn:<6} {len(data):>3}件 {len(buckets):>2}桶 "
              f"被压{blocked:>3} 可收{len(data)-blocked:>3} {size//1024}KB{' [bg回退]' if bg_fallback else ''}")
    levels_js = 'window.__LEVELS=' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(os.path.join(HERE, '..', 'game', 'levels.js'), 'w', encoding='utf-8').write(levels_js)
    print(f"\n共 {len(manifest)} 关, 总 {total_bytes // 1024}KB; levels.js 已写出")

if __name__ == '__main__':
    main()
