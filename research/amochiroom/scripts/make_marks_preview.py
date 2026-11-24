#!/usr/bin/env python3
"""生成标注方案 A/B/C 的 1:1 预览页（只写进 dist，不进仓库）。

A = 现状：房间整体变暗 + 橙色矩形描边
B = 圈选 + 顺序号：不变暗，每个目标物品一圈琥珀色圆环，按阅读顺序编号
C = 纯圈选：只有圆环，不编号，靠盒子卡片上的数量
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA = os.path.join(ROOT, 'src/data/amochiroom-levels.json')
OUT = os.path.join(ROOT, 'dist/amochiroom/_marks.html')
LV = 1

d = json.load(open(DATA))
levels = {l['level']: l for l in d['levels']}


def box_groups(L):
    """按 label 归组（与线上页面同口径）。"""
    g = {}
    for b in L['boxes']:
        e = g.setdefault(b['name'], {'name': b['name'], 'types': [], 'total': 0, 'queues': []})
        e['total'] += b['count']
        e['queues'].append(b['queue'])
        if b['type'] not in e['types']:
            e['types'].append(b['type'])
    out = []
    for e in g.values():
        q = e['queues']
        e['queueLabel'] = ', '.join('#%d' % x for x in q[:4]) + (' …' if len(q) > 4 else '')
        out.append(e)
    return sorted(out, key=lambda x: -x['total'])


L = levels[LV]
groups = box_groups(L)
board = []
for it in L['items']:
    fn, x, y, fx, fy, ang, w, h, t = it
    board.append({
        'src': '/amochiroom/art/i/' + fn,
        'left': round(((L['bgW'] / 2 + x) / L['bgW']) * 100, 2),
        'top': round(((L['bgH'] / 2 - y) / L['bgH']) * 100, 2),
        'w': round((w / L['bgW']) * 100, 2),
        'h': round((h / L['bgH']) * 100, 2),
        'tf': 'translate(-50%%,-50%%) rotate(%gdeg) scale(%d,%d)' % (-ang, fx, fy),
        't': t,
    })

TPL = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amochiroom 标注方案 A/B/C 预览 · Level __LV__</title>
<style>
:root{--amber:#D97706;--amber-ink:#8A4A05;--border:#F2E4D4;--text:#2E2419;--muted:#7A6A57}
*{box-sizing:border-box}
body{margin:0;padding:18px;background:#FFFBF5;color:var(--text);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
h1{font-size:1.3rem;margin:0 0 .3rem}
p.lede{margin:0 0 1rem;color:var(--muted);font-size:.9rem;max-width:60rem}
.strip{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1.1rem}
.boxcard{display:flex;align-items:center;gap:.5rem;padding:.4rem .6rem;border:1.5px solid var(--border);border-radius:10px;background:#fff;font-size:.8rem;cursor:pointer;font-family:inherit;color:inherit}
.boxcard[aria-pressed="true"]{border-color:var(--amber);box-shadow:0 0 0 2px rgba(217,119,6,.18)}
.boxcard b{font-size:.82rem}
.boxcard .q{color:var(--muted);font-size:.72rem}
.boxcard .n{font-weight:900;color:var(--amber-ink)}
.variants{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.1rem;align-items:start}
.v{background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:.7rem}
.v h2{font-size:.95rem;margin:.1rem 0 .1rem}
.v .tag{display:inline-block;font-size:.68rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--amber);border-radius:6px;padding:.1rem .35rem;margin-right:.35rem}
.v small{display:block;color:var(--muted);font-size:.74rem;margin:.15rem 0 .55rem}
.board{position:relative;width:100%;max-width:420px;margin:0 auto;background:#f7ece0 center/cover no-repeat;border-radius:10px;overflow:hidden;aspect-ratio:__BW__/__BH__}
.board .it{position:absolute;transform-origin:center;transition:opacity .18s,filter .18s}
.board .ring{position:absolute;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;display:none}
.board .bnum{position:absolute;transform:translate(-50%,-50%);display:none;min-width:18px;height:18px;border-radius:9px;background:var(--amber);color:#fff;font:900 11px/18px -apple-system,Arial,sans-serif;text-align:center;padding:0 4px;box-shadow:0 1px 3px rgba(0,0,0,.25);pointer-events:none}
.v-a .board.dim .it{opacity:.22;filter:saturate(.3)}
.v-a .board.dim .it.on{opacity:1;filter:none;z-index:3;outline:2px solid rgba(217,119,6,.75);outline-offset:1px;border-radius:6px}
.v-b .board.dim .it,.v-c .board.dim .it{opacity:.34;filter:saturate(.55)}
.v-b .board.dim .it.on,.v-c .board.dim .it.on{opacity:1;filter:none;z-index:3}
.v-b .board.dim .ring.on{display:block;border:2.5px solid var(--amber);background:rgba(217,119,6,.10)}
.v-c .board.dim .ring.on{display:block;border:2.5px dashed var(--amber);background:rgba(217,119,6,.06)}
.v-b .board.dim .bnum.on{display:block}
.hint{text-align:center;font-size:.76rem;font-weight:800;color:var(--amber-ink);margin:.5rem 0 .1rem}
</style></head><body>
<h1>Amochiroom 标注方案对比 · Level __LV__ __NAME__</h1>
<p class="lede">点上面任意一个箱子，三块板同时切到对应标注 —— 圈选方案按「阅读顺序」（先上后下、先左后右）编号。</p>
<div class="strip" id="strip"></div>
<div class="variants">
  <div class="v v-a"><h2><span class="tag">A 现状</span>矩形描边 + 整体变暗</h2><small>选中后其它物品压到 22% 不透明度，目标物品套橙色圆角矩形</small>
    <div class="board" id="bA" style="background-image:url(__BG__)"></div><p class="hint">Tap a box above</p></div>
  <div class="v v-b"><h2><span class="tag">B 圈选 + 顺序号</span>圆环 + 编号</h2><small>其它物品只压到 34%；目标物品画琥珀圆环，编号=阅读顺序</small>
    <div class="board" id="bB" style="background-image:url(__BG__)"></div><p class="hint">Tap a box above</p></div>
  <div class="v v-c"><h2><span class="tag">C 纯圈选</span>只画环，不编号</h2><small>环是虚线，数量看盒子卡片的 ×N；适合物品密集关</small>
    <div class="board" id="bC" style="background-image:url(__BG__)"></div><p class="hint">Tap a box above</p></div>
</div>
<script>
const ITEMS = __ITEMS__, GROUPS = __GROUPS__;
const boards = {A: document.getElementById('bA'), B: document.getElementById('bB'), C: document.getElementById('bC')};
for (const key in boards) {
  const b = boards[key];
  ITEMS.forEach((it, i) => {
    const img = document.createElement('img');
    img.className = 'it'; img.src = it.src; img.alt = ''; img.loading = 'eager'; img.dataset.t = it.t;
    img.dataset.i = i;
    img.style.cssText = 'left:' + it.left + '%;top:' + it.top + '%;width:' + it.w + '%;transform:' + it.tf.replace('%%', '%');
    b.appendChild(img);
    // 圈：贴着物品外框的椭圆（不是正圆），留 12% 余量
    const ring = document.createElement('span');
    ring.className = 'ring'; ring.dataset.t = it.t; ring.dataset.i = i;
    ring.style.cssText = 'left:' + it.left + '%;top:' + it.top + '%;width:' + (it.w * 1.24) + '%;height:' + (it.h * 1.24) + '%';
    b.appendChild(ring);
    // 编号徽标：贴在圈的左上角
    const num = document.createElement('span');
    num.className = 'bnum'; num.dataset.t = it.t; num.dataset.i = i;
    num.style.cssText = 'left:' + (it.left - it.w * 0.62) + '%;top:' + (it.top - it.h * 0.62) + '%';
    b.appendChild(num);
  });
}
const strip = document.getElementById('strip');
let active = null;
GROUPS.forEach(g => {
  const el = document.createElement('button');
  el.className = 'boxcard'; el.type = 'button'; el.setAttribute('aria-pressed', 'false');
  el.innerHTML = '<b>' + g.name + '</b><span class="q">' + g.queueLabel + '</span><span class="n">×' + g.total + '</span>';
  el.onclick = () => {
    const on = active !== g.name;
    active = on ? g.name : null;
    document.querySelectorAll('.boxcard').forEach(c => c.setAttribute('aria-pressed', 'false'));
    if (on) el.setAttribute('aria-pressed', 'true');
    const types = on ? g.types.join(',').split(',') : [];
    for (const key in boards) {
      const b = boards[key];
      b.classList.toggle('dim', on);
      b.querySelectorAll('.it,.ring,.bnum').forEach(n => {
        n.classList.toggle('on', on && types.indexOf(n.dataset.t) >= 0);
      });
      // 编号只数「这一箱要的物品」，按阅读顺序 1..N
      const hit = [...b.querySelectorAll('.it.on')]
        .map(n => ({n: +n.dataset.i, top: ITEMS[+n.dataset.i].top, left: ITEMS[+n.dataset.i].left}))
        .sort((a, c) => (a.top - c.top) || (a.left - c.left));
      const rank = {};
      hit.forEach((o, k) => { rank[o.n] = k + 1; });
      b.querySelectorAll('.bnum').forEach(nm => { nm.textContent = rank[nm.dataset.i] || ''; });
    }
  };
  strip.appendChild(el);
});
</script></body></html>
"""

html = (TPL
        .replace('__LV__', str(LV))
        .replace('__NAME__', L['name'])
        .replace('__BW__', str(L['bgW']))
        .replace('__BH__', str(L['bgH']))
        .replace('__BG__', L['bg'])
        .replace('__ITEMS__', json.dumps(board))
        .replace('__GROUPS__', json.dumps(groups)))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w').write(html)
print('wrote', OUT, len(html), 'bytes')
