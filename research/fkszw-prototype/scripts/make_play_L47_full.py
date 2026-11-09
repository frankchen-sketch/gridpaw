#!/usr/bin/env python3
"""「疯狂收杂物」完整版试玩 —— L47 全部 34 桶 × 207 件物品
- 全部物品可交互(按真实 z 序遮挡); 场景=纯背景+207 精灵
- 34 桶按 order 队列; 每桶收自己家族; 同家族多个桶=剩余物品等桶开回来
- 家族名从 {icon,name,type} 目录文档取
"""
import json, pickle, math, base64, io, os, sys
from collections import Counter, defaultdict
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from PIL import Image
import render_levels_v7 as R

# 路径基线（原会话在 ~/.hermes/cache/scratch；workspace 化后统一到 ../build + ../）
BUILD = os.environ.get('FKSZW_BUILD', os.path.join(HERE, '..', 'build'))
OUTDIR = os.path.join(HERE, '..')
SCR = BUILD
CW, CH = 1460, 1560
id2file = R.build_maps()
levels = R.load_levels()
d = levels[47]
items = d['items']

# ---- order + 家族名目录 ----
docs = pickle.load(open(f'{BUILD}/config_docs.pkl','rb'))
idxmap = {}
for _, v in docs:
    if isinstance(v,dict) and set(v.keys())=={'bg','end','level','name','theme'}:
        idxmap[int(v['bg'])] = int(v['level'])
order = None
for _, v in docs:
    if isinstance(v,dict) and 'order' in v and 'content' in v and idxmap.get(int(v['bg']))==47:
        order = v['order']; break
catalog = {}
for _, v in docs:
    if isinstance(v,dict) and set(v.keys())=={'icon','name','type'}:
        catalog[str(v['type'])] = v['name']

fam_of = [c['id'].split('-')[0] for c in items]
fam_count = Counter(fam_of)
fams_needed = Counter()
for o in order: fams_needed[str(o['type'])] += o['count']
assert fams_needed == fam_count, f'家族不匹配: {set(fams_needed)^set(fam_count)}'
print(f'34 桶=家族分区验证 PASS; 家族数 {len(fam_count)}')
named = sum(1 for f in fam_count if f in catalog)
print(f'家族名命中: {named}/{len(fam_count)}')

# ---- 遮挡(逐像素 alpha，原版精髓：有上层物品压着就拿不出，边缘露出也不行) ----
# 只算 z 更高者(数组序在后)压 z 更低者；覆盖率=交叠不透明像素/下层不透明像素，≥15% 判被压
from PIL import ImageChops

def placed_mask(c):
    im = Image.open(id2file[c['id']]).convert('RGBA')
    w = max(1, int(abs(im.width*c['scaleX']))); h = max(1, int(abs(im.height*c['scaleY'])))
    ss = im.resize((w, h), Image.LANCZOS)
    if c['scaleX'] < 0: ss = ss.transpose(Image.FLIP_LEFT_RIGHT)
    if c['scaleY'] < 0: ss = ss.transpose(Image.FLIP_TOP_BOTTOM)
    ss = ss.rotate(-(c['angle'] or 0), expand=True, resample=Image.BICUBIC)
    a = ss.getchannel('A').point(lambda p: 255 if p > 64 else 0)
    px, py = int(CW/2 + c['x']), int(CH/2 - c['y'])
    return a, (px - a.width//2, py - a.height//2)

_masks = [placed_mask(c) for c in items]
blockers = []
for i in range(len(items)):
    ai, (ix0, iy0) = _masks[i]
    out = []
    for j in range(i+1, len(items)):
        aj, (jx0, jy0) = _masks[j]
        x1 = max(ix0, jx0); y1 = max(iy0, jy0)
        x2 = min(ix0+ai.width, jx0+aj.width); y2 = min(iy0+ai.height, jy0+aj.height)
        if x2 <= x1 or y2 <= y1: continue
        ci = ai.crop((x1-ix0, y1-iy0, x2-ix0, y2-iy0))
        cj = aj.crop((x1-jx0, y1-jy0, x2-jx0, y2-jy0))
        and_px = ImageChops.multiply(ci, cj).histogram()[255]
        if and_px == 0: continue
        area_i = ci.histogram()[255]
        if area_i and and_px/area_i >= 0.15: out.append(j)
    blockers.append(out)
_blocked = sum(1 for b in blockers if b)
print(f'被压判定(逐像素15%): {_blocked}/207 被压, 开局可收 {len(items)-_blocked} 件')


# ---- 物品数据 ----
# 遮挡语义=原版精髓：上层(z序在后)物品不透明像素压住 ≥15% 即拿不出（边缘露出也没用）；
# 点击命中交给 DOM z-index（数组序=绘制序=视觉上层），上层先收、下层自然露出。
DATA = []
for i, c in enumerate(items):
    im = Image.open(id2file[c['id']])
    w = abs(im.width*c['scaleX']); h = abs(im.height*c['scaleY'])
    DATA.append({'t': c['id'], 'f': fam_of[i],
                 'left': round((CW/2+c['x'])/CW*100, 3), 'top': round((CH/2-c['y'])/CH*100, 3),
                 'w': round(w/CW*100, 3), 'h': round(h/CH*100, 3),
                 'sx': 1 if c['scaleX']>=0 else -1, 'sy': 1 if c['scaleY']>=0 else -1,
                 'a': c['angle'] or 0, 'b': blockers[i]})

def b64img(im, fmt='WEBP', q=82):
    buf = io.BytesIO()
    im.convert('RGBA').save(buf, fmt, quality=q)
    return base64.b64encode(buf.getvalue()).decode()

def sprite(iid, px=64):
    im = Image.open(id2file[iid]).convert('RGBA')
    s = px/max(im.size)
    if s < 1: im = im.resize((max(1,int(im.width*s)), max(1,int(im.height*s))), Image.LANCZOS)
    return b64img(im)

sprites = {}
for it in DATA:
    if it['t'] not in sprites: sprites[it['t']] = sprite(it['t'])

fam_icon, fam_name = {}, {}
fam_first = {}
for i, f in enumerate(fam_of):
    if f not in fam_first: fam_first[f] = items[i]['id']
EN_FAM = {
    '700': 'Drone', '704': 'Camera', '702': 'Phone Case', '706': 'Smartwatch',
    '219': 'Disc', '256': 'Laptop', '15': 'PC Parts', '705': 'Cable',
    '701': 'Earbuds', '72': 'Game Console', '218': 'Remote', '56': 'Calculator',
    '18': 'Phone', '204': 'Power Strip', '85': 'Paper Bag', '50': 'Backpack',
    '54': 'Stationery', '53': 'Notebook', '6': 'Waste Paper', '33': 'Tissue',
    '59': 'Paper Cup', '48': 'Tools',
}
for f in fam_count:
    fam_icon[f] = sprite(fam_first[f], 48)
    fam_name[f] = EN_FAM.get(f, catalog.get(f, f'Cat{f}'))
# 大类映射（对齐原版小程序词汇；试玩版输出英文）
FAMCAT = {
    '700': 'Electronics', '704': 'Electronics', '18': 'Electronics', '72': 'Electronics',
    '706': 'Electronics', '56': 'Electronics', '218': 'Electronics', '702': 'Electronics',
    '256': 'Electronics', '15': 'Electronics', '705': 'Electronics', '701': 'Electronics',
    '219': 'Electronics', '204': 'Electronics',
    '85': 'Bags', '50': 'Bags',
    '54': 'Stationery', '53': 'Stationery',
    '6': 'Daily Items', '33': 'Daily Items', '59': 'Daily Items',
    '48': 'Tools',
}
BUCKETS = [{'fam': str(o['type']), 'need': o['count'],
            'icon': fam_icon[str(o['type'])], 'name': fam_name[str(o['type'])],
            'cat': FAMCAT.get(str(o['type']), 'Misc')} for o in order]
cats = sorted(set(b['cat'] for b in BUCKETS))
print(f'大类覆盖: {cats}')

# ---- 底图 = 纯背景(全部物品都是精灵) ----
canvas = Image.new('RGBA', (CW, CH), (240, 234, 221, 255))
bg = Image.open(f'{BUILD}/fkszw_bg/gamebg_47.jpg').convert('RGBA')
canvas.alpha_composite(bg, ((CW-bg.width)//2 + int(d['bgPosX'] or 0), 0))
scene = canvas.convert('RGB').resize((800, int(800*CH/CW)), Image.LANCZOS)
buf = io.BytesIO(); scene.save(buf, 'JPEG', quality=72)
scene_b64 = base64.b64encode(buf.getvalue()).decode()

data_js = json.dumps(DATA, separators=(',',':'))
buck_js = json.dumps(BUCKETS, separators=(',',':'))
spr_js = json.dumps(sprites, separators=(',',':'))
total = len(scene_b64)+len(spr_js)+len(data_js)+len(buck_js)
print(f'体积: bg {len(scene_b64)//1024}K + 精灵 {len(spr_js)//1024}K + 数据 {len(data_js)//1024}K = {total//1024}K')

HTML = open(f'{HERE}/play_template_v4.html').read()
html = (HTML.replace('__BG__', scene_b64).replace('__SPR__', spr_js)
            .replace('__DATA__', data_js).replace('__BUCKETS__', buck_js))
out = f'{OUTDIR}/fkszw_play_L47_full_v2.html'
open(out,'w').write(html)
print('写出:', out, os.path.getsize(out)//1024, 'KB')
