// 平面图谜题关卡生成器（自研，仿 Room Sort - Floor Plan 的玩法机制，图纸/门/素材全部自造）
// 用法：node scripts/gen-floorplan-levels.mjs
// 输出：public/floorplan/levels.json
//
// 机制来源（2026-11-25 取证，见 STATUS.md）：
//   · 黄色轮廓 = 房子footprint，内部每个格子都必须被房间块铺满，块不能重叠
//   · 每个房间块边缘画着门洞；门必须与邻格的门对上，不能对着墙或房子外面
//   · 拖动时绿格预览落点
// 我们加的一条：生成即带解（先造解再拆），所以每关天然可通关。

import fs from 'node:fs';
import path from 'node:path';

const OUT = 'public/floorplan/levels.json';
const SEED = 20261125;

// ---------- 可复现随机 ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry32(SEED);
const ri = (n) => Math.floor(rnd() * n);
const pick = (arr) => arr[ri(arr.length)];

const DIRS = [
  { s: 'N', dx: 0, dy: -1 },
  { s: 'E', dx: 1, dy: 0 },
  { s: 'S', dx: 0, dy: 1 },
  { s: 'W', dx: -1, dy: 0 },
];
const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };
const key = (x, y) => `${x},${y}`;

const ROOM_NAMES = [
  'Bedroom', 'Kitchen', 'Bathroom', 'Living Room', 'Hallway', 'Closet',
  'Dining Room', 'Kids Room', 'Study', 'Laundry', 'Balcony', 'Garden',
  'Pantry', 'Foyer', 'Garage', 'Sunroom', 'Playroom', 'Library',
];

// ---------- 轮廓（随机生长的 polyomino）----------
function makeOutline(boxW, boxH, targetCells) {
  const cells = new Set();
  let x = ri(boxW), y = ri(boxH);
  cells.add(key(x, y));
  let guard = 0;
  while (cells.size < targetCells && guard++ < 5000) {
    // 从已有格子出发随机扩张一格（偏向横向，让房间更像平面图而不是方块）
    const list = [...cells].map((k) => k.split(',').map(Number));
    const [bx, by] = pick(list);
    const d = pick(DIRS.map((v) => (v.s === 'N' || v.s === 'S' ? { ...v, w: 1 } : { ...v, w: 2 })));
    // 加权抽样
    let s = 0;
    const pool = DIRS.map((v) => ({ ...v, w: v.s === 'E' || v.s === 'W' ? 2 : 1 }));
    pool.forEach((p) => (s += p.w));
    let r = rnd() * s, chosen = pool[0];
    for (const p of pool) { if (r < p.w) { chosen = p; break; } r -= p.w; }
    const nx = bx + chosen.dx, ny = by + chosen.dy;
    if (nx < 0 || ny < 0 || nx >= boxW || ny >= boxH) continue;
    cells.add(key(nx, ny));
    void d;
  }
  return cells;
}

// ---------- 把轮廓切成 K 个房间（随机多源生长）----------
function partition(cells, K) {
  const list = [...cells].map((k) => k.split(',').map(Number));
  if (K > list.length) K = list.length;
  // 种子：最远点采样（保证房间散开）
  const seeds = [pick(list)];
  while (seeds.length < K) {
    let best = null, bestD = -1;
    for (const c of list) {
      if (seeds.some((s) => s[0] === c[0] && s[1] === c[1])) continue;
      const d = Math.min(...seeds.map((s) => Math.abs(s[0] - c[0]) + Math.abs(s[1] - c[1])));
      if (d > bestD) { bestD = d; best = c; }
    }
    if (!best) break;
    seeds.push(best);
  }
  const owner = new Map();
  seeds.forEach((s, i) => owner.set(key(s[0], s[1]), i));
  let changed = true, guard = 0;
  while (changed && guard++ < 500) {
    changed = false;
    // 逐轮：每个未归属格子看邻居，谁的邻居多归谁
    for (const c of list) {
      if (owner.has(key(c[0], c[1]))) continue;
      const votes = new Map();
      for (const d of DIRS) {
        const o = owner.get(key(c[0] + d.dx, c[1] + d.dy));
        if (o !== undefined) votes.set(o, (votes.get(o) || 0) + 1);
      }
      if (votes.size) {
        const ranked = [...votes.entries()].sort((a, b) => b[1] - a[1]);
        owner.set(key(c[0], c[1]), ranked[0][0]);
        changed = true;
      }
    }
  }
  // 兜底：仍无归属的塞给最近房间
  for (const c of list) {
    if (!owner.has(key(c[0], c[1]))) owner.set(key(c[0], c[1]), ri(seeds.length));
  }
  // 合并过小的房间（<2 格）到邻居，避免 1 格房间毫无意义
  const groups = new Map();
  owner.forEach((v, k) => {
    if (!groups.has(v)) groups.set(v, []);
    groups.get(v).push(k.split(',').map(Number));
  });
  for (const [id, g] of [...groups]) {
    if (g.length >= 2) continue;
    const [cx, cy] = g[0];
    const nb = new Map();
    for (const d of DIRS) {
      const o = owner.get(key(cx + d.dx, cy + d.dy));
      if (o !== undefined && o !== id) nb.set(o, (nb.get(o) || 0) + 1);
    }
    if (nb.size) {
      const target = [...nb.entries()].sort((a, b) => b[1] - a[1])[0][0];
      g.forEach(([x, y]) => owner.set(key(x, y), target));
      groups.delete(id);
    }
  }
  // 重新归一化 id
  const remap = new Map();
  const out = new Map();
  for (const [k, v] of owner) {
    if (!remap.has(v)) remap.set(v, remap.size);
    const id = remap.get(v);
    if (!out.has(id)) out.set(id, []);
    out.get(id).push(k.split(',').map(Number));
  }
  return [...out.values()];
}

// ---------- 房间之间的墙边 ----------
function sharedEdges(rooms) {
  const at = new Map();
  rooms.forEach((cells, id) => cells.forEach(([x, y]) => at.set(key(x, y), id)));
  const edges = []; // {a:roomId, b:roomId, cell:[x,y], side}
  rooms.forEach((cells, id) => {
    for (const [x, y] of cells) {
      for (const d of DIRS) {
        const o = at.get(key(x + d.dx, y + d.dy));
        if (o !== undefined && o !== id && o > id) {
          edges.push({ a: id, b: o, x, y, side: d.s });
        }
      }
    }
  });
  return edges;
}

// ---------- 选门（房间图上取一棵随机生成树）----------
function chooseDoors(rooms, edges) {
  const n = rooms.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const shuffled = [...edges].sort(() => rnd() - 0.5);
  const doors = [];
  for (const e of shuffled) {
    const ra = find(e.a), rb = find(e.b);
    if (ra === rb) continue;
    parent[ra] = rb;
    doors.push(e);
    if (doors.length === n - 1) break;
  }
  return doors;
}

// ---------- 关卡 ----------
function makeLevel(id, opts) {
  const { boxW, boxH, roomsTarget, hard } = opts;
  const cellsTarget = Math.min(opts.cellsTarget, boxW * boxH);
  let rooms = [], doors = [], outline = null;
  for (let attempt = 0; attempt < 300; attempt++) {
    const cells = makeOutline(boxW, boxH, cellsTarget);
    if (cells.size < cellsTarget) continue;
    const parts = partition(cells, roomsTarget);
    if (parts.length < 3) continue;
    if (parts.some((p) => p.length < 2)) continue;
    const es = sharedEdges(parts);
    const ds = chooseDoors(parts, es);
    if (ds.length !== parts.length - 1) continue; // 房间图必须连通
    rooms = parts; doors = ds; outline = cells;
    break;
  }
  if (!outline) throw new Error(`level ${id} 生成失败`);

  const xs = [...outline].map((k) => +k.split(',')[0]);
  const ys = [...outline].map((k) => +k.split(',')[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const w = Math.max(...xs) - minX + 1, h = Math.max(...ys) - minY + 1;
  const norm = ([x, y]) => [x - minX, y - minY];

  const doorSet = new Map(); // roomId -> ["x,y,side"]
  doors.forEach((d) => {
    const [ax, ay] = norm([d.x, d.y]);
    if (!doorSet.has(d.a)) doorSet.set(d.a, []);
    doorSet.get(d.a).push(`${ax},${ay},${d.side}`);
    // 对面房间的门
    const dv = DIRS.find((v) => v.s === d.side);
    const [bx, by] = norm([d.x + dv.dx, d.y + dv.dy]);
    if (!doorSet.has(d.b)) doorSet.set(d.b, []);
    doorSet.get(d.b).push(`${bx},${by},${OPP[d.side]}`);
  });

  const names = [...ROOM_NAMES].sort(() => rnd() - 0.5);
  const roomObjs = rooms.map((cells, i) => {
    const nc = cells.map(norm).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const bx = Math.min(...nc.map((c) => c[0])), by = Math.min(...nc.map((c) => c[1]));
    const bw = Math.max(...nc.map((c) => c[0])) - bx + 1;
    const bh = Math.max(...nc.map((c) => c[1])) - by + 1;
    return {
      id: i,
      name: names[i % names.length],
      // 解里的绝对位置（提示/自动校验用）
      at: [bx, by],
      // 形状（相对左上角）
      shape: nc.map(([x, y]) => [x - bx, y - by]),
      doors: (doorSet.get(i) || []).map((s) => {
        const [x, y, side] = s.split(',');
        return [+x - bx, +y - by, side];
      }),
      bw, bh,
    };
  });

  return {
    id,
    hard: !!hard,
    w, h,
    cells: [...outline].map((k) => k.split(',').map(Number).map((v, i) => v - (i === 0 ? minX : minY))),
    rooms: roomObjs,
    // 托盘顺序（打乱，玩家拿到的顺序）
    tray: [...roomObjs.keys()].sort(() => rnd() - 0.5),
  };
}

// 难度阶梯：格子数 / 房间数 / 画布
const PLAN = [];
for (let i = 1; i <= 12; i++) PLAN.push({ boxW: 5, boxH: 4, cellsTarget: 10 + i, roomsTarget: 4 + Math.floor(i / 5) });
for (let i = 13; i <= 26; i++) PLAN.push({ boxW: 6, boxH: 5, cellsTarget: 16 + Math.floor((i - 13) / 2), roomsTarget: 5 + Math.floor((i - 13) / 6) });
for (let i = 27; i <= 44; i++) PLAN.push({ boxW: 7, boxH: 6, cellsTarget: 22 + Math.floor((i - 27) / 2), roomsTarget: 6 + Math.floor((i - 27) / 7), hard: (i - 27) % 6 === 5 });
for (let i = 45; i <= 60; i++) PLAN.push({ boxW: 8, boxH: 6, cellsTarget: 28 + Math.floor((i - 45) / 2), roomsTarget: 7 + Math.floor((i - 45) / 6), hard: true });

const levels = PLAN.map((p, i) => makeLevel(i + 1, p));

// ---------- 生成即验解：把解摆回去必须合法 ----------
function verify(lv) {
  const inb = new Set(lv.cells.map(([x, y]) => `${x},${y}`));
  const occ = new Map();
  for (const r of lv.rooms) {
    for (const [sx, sy] of r.shape) {
      const x = r.at[0] + sx, y = r.at[1] + sy;
      if (!inb.has(`${x},${y}`)) return `L${lv.id}: 房间 ${r.name} 越界`;
      if (occ.has(`${x},${y}`)) return `L${lv.id}: 格子 (${x},${y}) 重叠`;
      occ.set(`${x},${y}`, r.id);
    }
  }
  if (occ.size !== lv.cells.length) return `L${lv.id}: 未铺满 ${occ.size}/${lv.cells.length}`;
  // 门必须成对
  for (const r of lv.rooms) {
    for (const [x, y, side] of r.doors) {
      const ax = r.at[0] + x, ay = r.at[1] + y;
      const d = DIRS.find((v) => v.s === side);
      const nx = ax + d.dx, ny = ay + d.dy;
      if (!inb.has(`${nx},${ny}`)) return `L${lv.id}: 门朝房外 (${ax},${ay})${side}`;
      const other = occ.get(`${nx},${ny}`);
      const or = lv.rooms[other];
      const need = [nx - or.at[0], ny - or.at[1], OPP[side]];
      if (!or.doors.some(([a, b, c]) => a === need[0] && b === need[1] && c === need[2]))
        return `L${lv.id}: 门没对上 (${ax},${ay})${side}`;
    }
  }
  return null;
}

let bad = 0;
for (const lv of levels) {
  const err = verify(lv);
  if (err) { console.error('✗', err); bad++; }
}
if (bad) { console.error(`[gen-floorplan] ${bad} 关校验失败，中止`); process.exit(1); }

const doorsTotal = levels.reduce((s, l) => s + l.rooms.reduce((a, r) => a + r.doors.length, 0), 0) / 2;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedBy: 'scripts/gen-floorplan-levels.mjs', count: levels.length, levels }));
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
const flat = levels.map((l) => `${l.rooms.length}r/${l.cells.length}c`);
console.log(`[gen-floorplan] ${levels.length} 关 → ${OUT}（${kb} KB）`);
console.log(`  房间 ${levels.reduce((s, l) => s + l.rooms.length, 0)} 个 / 格子 ${levels.reduce((s, l) => s + l.cells.length, 0)} 个 / 门 ${doorsTotal} 个`);
console.log('  规模：' + flat.slice(0, 6).join(' ') + ' … ' + flat.slice(-3).join(' '));
console.log('  每题都带解且校验通过（铺满 + 门成对 + 不越界）');
