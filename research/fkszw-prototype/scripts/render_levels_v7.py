#!/usr/bin/env python3
"""疯狂收杂物 关卡渲染器 v7 —— bg 原生坐标模型（81 关结构验证 + 真实截图双重实证）
模型:
- 游戏设计空间 = 1460×1560（game.js setDesignResolutionSize(1460,1560,FIXED_HEIGHT)）
- 背景原生尺寸（1220 或 1440 宽×1560）水平居中 + bgPosX
- 物品按背景原生坐标摆放: screen=(730+x, 780−y), k=1（全 81 关场地宽≤bg宽, 0 例外）
  统一规则=物品坐标原点=背景图中心（bg1 1220→中心610, bg47 1440→中心720; 已验证与旧 720 画布模型对 L01 渲染像素 100% 一致）
- 关卡编号以索引文档为准（bg==level）; 绘制序=content 数组序; scale<0 翻转; rotate(−angle)
用法: python3 render_levels_v7.py <输出目录> <关卡号,逗号分隔|all>
"""
import json, pickle, re, glob, os, sys
from PIL import Image

# 路径基线：脚本同级 ../build（原会话在 ~/.hermes/cache/scratch，24h 清理会吃，已迁到 workspace）
BUILD = os.environ.get('FKSZW_BUILD', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
BASE = f'{BUILD}/unpack'
B = f'{BASE}/assets/subpackages/assets_bundle'
BG_DIR = f'{BUILD}/fkszw_bg'
CW, CH = 1460, 1560

def dec_uuid(cu):
    b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    bits = 0; nbits = 0; out = []
    for ch in cu[2:]:
        bits = (bits << 6) | b64.index(ch); nbits += 6
        while nbits >= 4:
            nbits -= 4; out.append('0123456789abcdef'[(bits >> nbits) & 0xF])
    return (cu[:2] + ''.join(out)).lower()

def build_maps():
    aidx = json.load(open(f'{B}/config.fa0c8.json'))
    allf = {os.path.basename(f).split('.')[0].replace('-', '').lower(): f
            for f in glob.glob(f'{B}/native/*/*')}
    id2file = {}
    for k, v in aidx['paths'].items():
        m = re.match(r'texture/type/([\d-]+)$', v[0])
        if m and dec_uuid(aidx['uuids'][int(k)]) in allf:
            id2file[m.group(1)] = allf[dec_uuid(aidx['uuids'][int(k)])]
    return id2file

def load_levels():
    docs = pickle.load(open(f'{BUILD}/config_docs.pkl', 'rb'))
    idx = {}
    for _, v in docs:
        if isinstance(v, dict) and set(v.keys()) == {'bg','end','level','name','theme'}:
            idx[int(v['bg'])] = (int(v['level']), v['name'])
    lvj = json.load(open(f'{BUILD}/fkszw_levels_all.json'))
    out = {}
    for L in lvj:
        bg = int(L['bg'])
        if bg in idx:
            lvl, name = idx[bg]
        else:
            match = [(lv, nm) for b, (lv, nm) in idx.items() if nm == L['levelName']]
            lvl, name = match[0] if match else (L['seq'], L['levelName'])
            bg = lvl
        out[lvl] = {'name': name, 'bg': bg, 'items': L['items'], 'bgPosX': L.get('bgPosX') or 0}
    return out

def main():
    outdir = sys.argv[1] if len(sys.argv) > 1 else 'fkszw_v7'
    which = sys.argv[2] if len(sys.argv) > 2 else 'all'
    os.makedirs(outdir, exist_ok=True)
    id2file = build_maps()
    cache = {}
    def get_img(iid):
        if iid not in cache:
            f = id2file.get(iid)
            if not f: return None
            cache[iid] = Image.open(f).convert('RGBA')
        return cache[iid]
    levels = load_levels()
    todo = sorted(levels) if which == 'all' else [int(x) for x in which.split(',')]
    for lv in todo:
        d = levels[lv]
        items = d['items']
        def item_img(c):
            im = get_img(c['id'])
            if im is None: return None
            w = max(1, int(abs(im.width*c['scaleX']))); h = max(1, int(abs(im.height*c['scaleY'])))
            img = im.resize((w, h), Image.LANCZOS)
            if c['scaleX'] < 0: img = img.transpose(Image.FLIP_LEFT_RIGHT)
            if c['scaleY'] < 0: img = img.transpose(Image.FLIP_TOP_BOTTOM)
            if c['angle']: img = img.rotate(-c['angle'], expand=True, resample=Image.BICUBIC)
            return img
        imgs = []
        for c in items:
            im = item_img(c)
            if im is not None: imgs.append((c, im))
        canvas = Image.new('RGBA', (CW, CH), (240, 234, 221, 255))
        try:
            bg = Image.open(f"{BG_DIR}/gamebg_{d['bg']:02d}.jpg").convert('RGBA')
            bgox = (CW - bg.width)//2 + int(d['bgPosX'])
            canvas.alpha_composite(bg, (bgox, 0))
        except Exception:
            pass
        vis = 0
        for c, im in imgs:
            px = int(CW/2 + c['x'] - im.width/2)
            py = int(CH/2 - c['y'] - im.height/2)
            if -im.width < px < CW and -im.height < py < CH: vis += 1
            canvas.alpha_composite(im, (px, py))
        name = f"L{lv:02d}_{d['name']}"
        canvas.convert('RGB').save(f'{outdir}/{name}.png')
        xs=[c['x'] for c in items]; ys=[c['y'] for c in items]
        print(f"{name}: 可见 {vis}/{len(items)} 场地{max(xs)-min(xs):.0f}×{max(ys)-min(ys):.0f} 堆底py={(CH/2-min(ys))/CH:.1%}")

if __name__ == '__main__':
    main()
