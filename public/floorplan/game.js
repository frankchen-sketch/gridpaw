/* Room Sort · Floor Plan —— 自研平面图谜题引擎（机制仿 Gamincat 的 Room Sort，代码/关卡/美术全部自造）
 *
 * 规则（玩家可见）：
 *   1. 米色格子 = 房子的 footprint，内部每一格都要被房间块盖住，块不能重叠
 *   2. 房间块边缘有门洞；门必须和邻格的门对上，不能对着墙，也不能朝向房子外面
 *   3. 拖动时绿格 = 落点合法，红格 = 不合法
 *
 * 数据由 scripts/gen-floorplan-levels.mjs 生成：先造解再拆，所以每关都有解且已验证。
 * 存档：localStorage 记已通关的关号与上次玩的关号。
 */
(() => {
  'use strict';

  const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };
  const COLORS = [
    '#FCD9A8', '#C9E4D0', '#D9D2F5', '#F8C7C7', '#BFE3F2', '#F3E1B0',
    '#E2D3C0', '#CDE7E2', '#F5D0E0', '#D6E2B8', '#E7D2F0', '#FFE0B8',
  ];
  const K = 'gridpaw.floorplan.v1';

  const $ = (id) => document.getElementById(id);
  const board = $('board');
  const tray = $('tray');
  const statusEl = $('status');

  const state = {
    levels: [],
    idx: 0,
    cell: 56,
    placed: new Map(),        // roomId -> [gx, gy]
    selected: null,           // roomId awaiting a click target
    hints: 3,
    drag: null,
    done: new Set(),
  };

  // ---------- 存档 ----------
  function loadSave() {
    try {
      const s = JSON.parse(localStorage.getItem(K) || '{}');
      state.done = new Set(Array.isArray(s.done) ? s.done : []);
      state.idx = Math.min(Math.max(0, s.last | 0 || 0), 59);
    } catch (_) { /* 忽略坏档 */ }
  }
  function saveSave() {
    try {
      localStorage.setItem(K, JSON.stringify({ done: [...state.done], last: state.idx }));
    } catch (_) { /* 隐私模式忽略 */ }
  }

  // ---------- 小工具 ----------
  const cellKey = (x, y) => x + ',' + y;
  const lv = () => state.levels[state.idx];
  const inPlan = (x, y) => lv()._cellSet.has(cellKey(x, y));

  function occupancy() {
    const m = new Map();
    for (const [rid, [gx, gy]] of state.placed) {
      const r = lv().rooms[rid];
      for (const [sx, sy] of r.shape) m.set(cellKey(gx + sx, gy + sy), rid);
    }
    return m;
  }

  // ---------- 校验 ----------
  /** 返回 {ok:true} 或 {ok:false, why, badCells:[[x,y]...]} */
  function validate(rid, gx, gy) {
    const r = lv().rooms[rid];
    const occ = occupancy();
    const bad = [];
    for (const [sx, sy] of r.shape) {
      const x = gx + sx, y = gy + sy;
      if (!inPlan(x, y)) return { ok: false, why: 'That goes outside the plan', badCells: [[x, y]] };
      if (occ.has(cellKey(x, y))) {
        return { ok: false, why: 'That spot is already taken', badCells: [[x, y]] };
      }
    }
    // 门：朝屋里算合法；朝外的只有入户门洞算合法；对门若已摆好必须也有门
    for (const [dx, dy, side] of r.doors) {
      const ax = gx + dx, ay = gy + dy;
      const [vx, vy] = DIRS[side];
      const nx = ax + vx, ny = ay + vy;
      if (!inPlan(nx, ny)) {
        if (lv()._entrySet.has(`${ax},${ay},${side}`)) continue; // 入户门洞，合法
        return { ok: false, why: 'A door would open onto nothing — only the entry gaps are allowed', badCells: [[ax, ay]] };
      }
      const other = occ.get(cellKey(nx, ny));
      if (other !== undefined) {
        const or = lv().rooms[other];
        const [ogx, ogy] = state.placed.get(other);
        const need = [nx - ogx, ny - ogy, OPP[side]];
        const has = or.doors.some(([a, b, c]) => a === need[0] && b === need[1] && c === need[2]);
        if (!has) return { ok: false, why: 'A door would open into a wall', badCells: [[ax, ay], [nx, ny]] };
      }
    }
    void bad;
    return { ok: true };
  }

  // ---------- 布局 ----------
  function layout() {
    const L = lv();
    const card = board.parentElement;
    const pad = 8;
    const availW = Math.max(180, card.clientWidth - pad * 2);
    const vh = window.innerHeight || 700;
    const availH = Math.max(200, Math.round(vh * (window.innerWidth < 520 ? 0.42 : 0.56)));
    const cell = Math.max(22, Math.min(64, Math.floor(availW / L.w), Math.floor(availH / L.h)));
    state.cell = cell;
    board.style.setProperty('--cell', cell + 'px');
    board.style.setProperty('--gw', L.w);
    board.style.setProperty('--gh', L.h);
  }

  function chipLabel(room) {
    // 标签放在形状里最靠近 bbox 中心的格子
    const cx = (room.bw - 1) / 2, cy = (room.bh - 1) / 2;
    let best = room.shape[0], bestD = Infinity;
    for (const c of room.shape) {
      const d = Math.abs(c[0] - cx) + Math.abs(c[1] - cy);
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  }

  // ---------- 画图工具（房间块与平面图都用同一套门窗画法）----------
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  /** 一条格子边的两个端点 + 指向房间内部的法线 */
  function wallGeom(x, y, side, c) {
    const x0 = x * c, y0 = y * c, x1 = x0 + c, y1 = y0 + c;
    if (side === 'N') return { a: [x0, y0], b: [x1, y0], n: [0, 1] };
    if (side === 'S') return { a: [x0, y1], b: [x1, y1], n: [0, -1] };
    if (side === 'W') return { a: [x0, y0], b: [x0, y1], n: [1, 0] };
    return { a: [x1, y0], b: [x1, y1], n: [-1, 0] };
  }
  /**
   * 门户：在墙上挖一段缺口，画一扇打开的门板 + 它的圆弧摆幅。
   * 真机（Gamincat Room Sort）就是这个画法——缺口是通口，弧线是门开的轨迹。
   * 返回缺口两端 p1/p2、门板尖端 tip、墙方向 (ux,uy)、内法线 n，调用方据此补画两段墙。
   */
  function drawDoor(parent, x, y, side, cell, stroke, gapFill) {
    const { a, b, n } = wallGeom(x, y, side, cell);
    const g = cell * 0.6;
    const ux = (b[0] - a[0]) / cell, uy = (b[1] - a[1]) / cell;
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const p1 = [mid[0] - ux * g / 2, mid[1] - uy * g / 2];
    const p2 = [mid[0] + ux * g / 2, mid[1] + uy * g / 2];
    const tip = [p1[0] + n[0] * g, p1[1] + n[1] * g];
    const band = stroke * 1.8;
    const gap = side === 'N' || side === 'S'
      ? { x: Math.min(p1[0], p2[0]), y: a[1] - band / 2, width: g, height: band }
      : { x: a[0] - band / 2, y: Math.min(p1[1], p2[1]), width: band, height: g };
    parent.appendChild(svgEl('rect', { x: gap.x, y: gap.y, width: gap.width, height: gap.height, fill: gapFill }));
    return { p1, p2, tip, n, ux, uy, g };
  }
  /** 门板 + 摆弧（细线，深色门板 / 浅色轨迹）*/
  function drawDoorLeaf(parent, d, stroke, leafColor, arcColor) {
    const cross = d.ux * d.n[1] - d.uy * d.n[0];
    parent.appendChild(svgEl('line', {
      x1: d.p1[0], y1: d.p1[1], x2: d.tip[0], y2: d.tip[1],
      stroke: leafColor, 'stroke-width': Math.max(1.2, stroke * 0.6), 'stroke-linecap': 'round',
    }));
    parent.appendChild(svgEl('path', {
      d: `M ${d.p2[0]} ${d.p2[1]} A ${d.g} ${d.g} 0 0 ${cross > 0 ? 1 : 0} ${d.tip[0]} ${d.tip[1]}`,
      fill: 'none', stroke: arcColor, 'stroke-width': Math.max(1, stroke * 0.5), 'stroke-linecap': 'round',
    }));
  }

  /** 房间块：整块外墙用直角折线画（棱角），门做成墙洞 + 门板 + 摆弧 */
  function buildTile(room, cell, opts) {
    const el = document.createElement('div');
    el.className = 'tile' + (opts && opts.placed ? ' placed' : '');
    el.dataset.room = room.id;
    const w = room.bw * cell, h = room.bh * cell;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    const fill = COLORS[room.id % COLORS.length];
    el.style.setProperty('--tc', fill);
    const own = new Set(room.shape.map(([x, y]) => cellKey(x, y)));
    const stroke = Math.max(2, cell * 0.062);
    const svg = svgEl('svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
    const gFill = svgEl('g', { fill });
    for (const [sx, sy] of room.shape) {
      gFill.appendChild(svgEl('rect', { x: sx * cell - .6, y: sy * cell - .6, width: cell + 1.2, height: cell + 1.2 }));
    }
    svg.appendChild(gFill);
    const doorSet = new Set(room.doors.map(([x, y, s]) => `${x},${y},${s}`));
    const gWall = svgEl('g', { stroke: '#3A2C22', 'stroke-width': stroke, 'stroke-linecap': 'butt' });
    const gDoor = svgEl('g', {});
    for (const [sx, sy] of room.shape) {
      for (const side of ['N', 'E', 'S', 'W']) {
        const [vx, vy] = DIRS[side];
        if (own.has(cellKey(sx + vx, sy + vy))) continue; // 房间内部不留线，整间才读得出来
        const { a, b } = wallGeom(sx, sy, side, cell);
        if (doorSet.has(`${sx},${sy},${side}`)) {
          const d = drawDoor(gDoor, sx, sy, side, cell, stroke, '#FFFDF7');
          gWall.appendChild(svgEl('line', { x1: a[0], y1: a[1], x2: d.p1[0], y2: d.p1[1] }));
          gWall.appendChild(svgEl('line', { x1: d.p2[0], y1: d.p2[1], x2: b[0], y2: b[1] }));
          drawDoorLeaf(gDoor, d, stroke, '#3A2C22', '#B45309');
        } else {
          gWall.appendChild(svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }));
        }
      }
    }
    svg.appendChild(gWall);
    svg.appendChild(gDoor);
    el.appendChild(svg);
    // 名字：放在形状里最靠中心的那一格，允许溢到相邻格（还是同一间房）
    if (cell >= 34 && !(opts && opts.noLabel)) {
      const at = chipLabel(room);
      const lbl = document.createElement('div');
      lbl.className = 'lbl';
      lbl.textContent = room.name;
      lbl.style.left = (at[0] * cell + cell / 2) + 'px';
      lbl.style.top = (at[1] * cell + cell / 2) + 'px';
      lbl.style.width = Math.max(cell * 1.9, 46) + 'px';
      el.appendChild(lbl);
    }
    return el;
  }

  // ---------- 渲染 ----------
  function renderBoard() {
    const L = lv();
    const cell = state.cell;
    board.querySelectorAll('.cell,.tile,.plan').forEach((n) => n.remove());
    for (const [x, y] of L.cells) {
      const c = document.createElement('div');
      c.className = 'cell floor';
      c.dataset.cx = x; c.dataset.cy = y;
      c.style.left = x * cell + 'px'; c.style.top = y * cell + 'px';
      c.style.width = cell + 'px'; c.style.height = cell + 'px';
      board.appendChild(c);
    }
    // 平面图外框：黄线沿 footprint 外墙走，入户门洞在外框上开口（真机的标志性画法）
    const pw = L.w * cell, ph = L.h * cell;
    const plan = svgEl('svg', { width: pw, height: ph, viewBox: `0 0 ${pw} ${ph}`, class: 'plan' });
    const stroke = Math.max(2.5, cell * 0.07);
    const gWall = svgEl('g', { stroke: '#D97706', 'stroke-width': stroke, 'stroke-linecap': 'butt' });
    const gDoor = svgEl('g', {});
    for (const [x, y] of L.cells) {
      for (const side of ['N', 'E', 'S', 'W']) {
        const [vx, vy] = DIRS[side];
        if (L._cellSet.has(cellKey(x + vx, y + vy))) continue;
        const { a, b } = wallGeom(x, y, side, cell);
        if (L._entrySet.has(`${x},${y},${side}`)) {
          const d = drawDoor(gDoor, x, y, side, cell, stroke, '#FFFFFF');
          gWall.appendChild(svgEl('line', { x1: a[0], y1: a[1], x2: d.p1[0], y2: d.p1[1] }));
          gWall.appendChild(svgEl('line', { x1: d.p2[0], y1: d.p2[1], x2: b[0], y2: b[1] }));
          drawDoorLeaf(gDoor, d, stroke, '#8A5A12', '#B45309');
        } else {
          gWall.appendChild(svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }));
        }
      }
    }
    plan.appendChild(gWall);
    plan.appendChild(gDoor);
    board.appendChild(plan);
    for (const [rid, [gx, gy]] of state.placed) {
      const t = buildTile(L.rooms[rid], cell, { placed: true });
      t.style.left = gx * cell + 'px';
      t.style.top = gy * cell + 'px';
      board.appendChild(t);
    }
  }

  function renderTray() {
    const L = lv();
    tray.innerHTML = '';
    const unplaced = L.tray.filter((rid) => !state.placed.has(rid));
    if (!unplaced.length) {
      const d = document.createElement('div');
      d.style.cssText = 'font-size:13px;color:var(--muted);padding:6px';
      d.textContent = 'All rooms placed.';
      tray.appendChild(d);
      return;
    }
    const cell = Math.max(16, Math.min(34, Math.round(state.cell * 0.55)));
    for (const rid of unplaced) {
      const room = L.rooms[rid];
      const slot = document.createElement('div');
      slot.className = 'tile-slot' + (state.selected === rid ? ' on' : '');
      slot.dataset.rid = rid;
      slot.dataset.sel = state.selected === rid ? '1' : '0';
      const inner = document.createElement('div');
      inner.className = 'inner';
      inner.style.width = room.bw * cell + 'px';
      inner.style.height = room.bh * cell + 'px';
      const t = buildTile(room, cell, { noLabel: true });
      t.style.left = '0'; t.style.top = '0';
      inner.appendChild(t);
      slot.appendChild(inner);
      const nm = document.createElement('div');
      nm.className = 'nm'; nm.textContent = room.name;
      slot.appendChild(nm);
      tray.appendChild(slot);
    }
  }

  function renderHud() {
    const L = lv();
    $('lvlLabel').textContent = L.id;
    $('lvlTotal').textContent = state.levels.length;
    $('hintN').textContent = state.hints;
    $('btnHint').disabled = state.hints <= 0 || state.placed.size === L.rooms.length;
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = 'status' + (kind ? ' ' + kind : '');
  }

  function renderAll() {
    layout();
    renderBoard();
    renderTray();
    renderHud();
  }

  // ---------- 落子 ----------
  function place(rid, gx, gy) {
    const v = validate(rid, gx, gy);
    if (!v.ok) { setStatus(v.why, 'bad'); return false; }
    state.placed.set(rid, [gx, gy]);
    state.selected = null;
    renderBoard(); renderTray(); renderHud();
    setStatus('');
    if (state.placed.size === lv().rooms.length) win();
    return true;
  }

  function unplace(rid) {
    state.placed.delete(rid);
    state.selected = null;
    renderBoard(); renderTray(); renderHud();
    setStatus('');
  }

  function win() {
    const L = lv();
    state.done.add(L.id);
    saveSave();
    $('winTitle').textContent = L.hard ? 'Hard plan done!' : 'Plan complete!';
    $('winSub').textContent = `${L.rooms.length} rooms · ${L.cells.length} squares · every door matched.`;
    $('btnNext').style.display = state.idx < state.levels.length - 1 ? '' : 'none';
    $('winOverlay').classList.add('on');
  }

  // ---------- 提示 ----------
  function hint() {
    const L = lv();
    if (state.hints <= 0) return;
    const rid = L.rooms.findIndex((r) => !state.placed.has(r.id));
    if (rid < 0) return;
    const room = L.rooms[rid];
    // 解里的位置若被别的块占着，先把冲突块退回托盘
    const need = new Set(room.shape.map(([sx, sy]) => cellKey(room.at[0] + sx, room.at[1] + sy)));
    const occ = occupancy();
    const evict = new Set();
    for (const k of need) {
      const other = occ.get(k);
      if (other !== undefined && other !== rid) evict.add(other);
    }
    evict.forEach((id) => state.placed.delete(id));
    state.hints--;
    state.placed.set(rid, [room.at[0], room.at[1]]);
    state.selected = null;
    renderBoard(); renderTray(); renderHud();
    setStatus(`Hint: ${room.name} goes here.`, 'ok');
    if (state.placed.size === L.rooms.length) win();
  }

  // ---------- 拖拽 ----------
  function cellFromPoint(clientX, clientY, grabDX, grabDY) {
    const rect = board.getBoundingClientRect();
    const cell = state.cell;
    const gx = Math.round((clientX - grabDX - rect.left) / cell);
    const gy = Math.round((clientY - grabDY - rect.top) / cell);
    return [gx, gy];
  }

  function clearPreview() {
    board.querySelectorAll('.cell.preview-ok,.cell.preview-bad').forEach((c) => {
      c.classList.remove('preview-ok', 'preview-bad');
    });
  }

  function preview(rid, gx, gy) {
    clearPreview();
    const room = lv().rooms[rid];
    const v = validate(rid, gx, gy);
    const cls = v.ok ? 'preview-ok' : 'preview-bad';
    for (const [sx, sy] of room.shape) {
      const c = board.querySelector(`.cell[data-cx="${gx + sx}"][data-cy="${gy + sy}"]`);
      if (c) c.classList.add(cls);
    }
  }

  tray.addEventListener('pointerdown', (e) => {
    const slot = e.target.closest('.tile-slot');
    if (!slot) return;
    const rid = +slot.dataset.rid;
    const tileEl = slot.querySelector('.tile');
    const r = tileEl.getBoundingClientRect();
    const grabDX = e.clientX - r.left;
    const grabDY = e.clientY - r.top;
    const moved = { v: false };
    const ghost = buildTile(lv().rooms[rid], state.cell);
    ghost.classList.add('drag-ghost');
    ghost.style.left = r.left + 'px';
    ghost.style.top = r.top + 'px';
    document.body.appendChild(ghost);
    slot.style.opacity = '.35';
    state.drag = { rid, grabDX, grabDY, ghost, slot, moved };

    const onMove = (ev) => {
      if (!state.drag) return;
      const dx = ev.clientX - e.clientX, dy = ev.clientY - e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved.v = true;
      ghost.style.left = ev.clientX - grabDX + 'px';
      ghost.style.top = ev.clientY - grabDY + 'px';
      const [gx, gy] = cellFromPoint(ev.clientX, ev.clientY, grabDX, grabDY);
      preview(rid, gx, gy);
      ev.preventDefault();
    };
    const onUp = (ev) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      slot.style.opacity = '';
      ghost.remove();
      clearPreview();
      const d = state.drag; state.drag = null;
      if (!d) return;
      // 手指/鼠标还停在托盘上 = 取消这次拖拽（不是「丢到图纸外面」），顺手当成点选
      const trayRect = tray.getBoundingClientRect();
      const overTray = ev.clientX >= trayRect.left && ev.clientX <= trayRect.right &&
                       ev.clientY >= trayRect.top && ev.clientY <= trayRect.bottom;
      if (!moved.v || overTray) { // 点击/抖动 = 选中，等下再点目标格
        state.selected = overTray && moved.v ? state.selected : (state.selected === rid ? null : rid);
        renderTray();
        setStatus(state.selected == null ? '' : `${lv().rooms[rid].name} selected — tap a square to drop it.`);
        return;
      }
      const [gx, gy] = cellFromPoint(ev.clientX, ev.clientY, grabDX, grabDY);
      place(rid, gx, gy);
    };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
  });

  // 已放置的块：点一下搬回托盘
  board.addEventListener('click', (e) => {
    const t = e.target.closest('.tile.placed');
    if (t) { unplace(+t.dataset.room); return; }
    const c = e.target.closest('.cell.floor');
    if (c && state.selected != null) {
      place(state.selected, +c.dataset.cx, +c.dataset.cy);
    }
  });

  // ---------- 关卡 ----------
  function start(idx) {
    state.idx = Math.max(0, Math.min(state.levels.length - 1, idx));
    state.placed = new Map();
    state.selected = null;
    state.hints = 3;
    $('winOverlay').classList.remove('on');
    setStatus('Drag a room onto the plan — every square must be covered and every door must meet another door.');
    renderAll();
    saveSave();
  }

  function buildLevels() {
    const g = $('levelsGrid');
    g.innerHTML = '';
    state.levels.forEach((L) => {
      const b = document.createElement('button');
      b.textContent = L.id;
      if (state.done.has(L.id)) b.classList.add('done');
      if (L.hard) b.classList.add('hard');
      b.addEventListener('click', () => { $('levelsOverlay').classList.remove('on'); start(L.id - 1); });
      g.appendChild(b);
    });
  }

  $('btnHint').addEventListener('click', hint);
  $('btnReset').addEventListener('click', () => start(state.idx));
  $('btnLevels').addEventListener('click', () => { buildLevels(); $('levelsOverlay').classList.add('on'); });
  $('btnCloseLevels').addEventListener('click', () => $('levelsOverlay').classList.remove('on'));
  $('btnNext').addEventListener('click', () => start(state.idx + 1));
  $('btnReplay').addEventListener('click', () => start(state.idx));
  window.addEventListener('resize', () => { renderAll(); });

  // ---------- 启动 ----------
  fetch('levels.json').then((r) => r.json()).then((data) => {
    state.levels = data.levels;
    state.levels.forEach((L) => {
      L._cellSet = new Set(L.cells.map(([x, y]) => cellKey(x, y)));
      L._entrySet = new Set((L.entries || []).map(([x, y, s]) => x + ',' + y + ',' + s));
    });
    loadSave();
    start(state.idx);
    // QA 钩子（自动化验收用，不影响玩家）
    window.__FP = {
      state, validate, place, unplace, hint, start, occupancy, lv,
      solveAll() { // 按解一次性摆满，用来验证通关判定
        const L = lv();
        L.rooms.forEach((r) => state.placed.set(r.id, [r.at[0], r.at[1]]));
        renderBoard(); renderTray(); renderHud();
        if (state.placed.size === L.rooms.length) win();
        return state.placed.size === L.rooms.length;
      },
    };
  }).catch((err) => {
    setStatus('Could not load the plans: ' + err.message, 'bad');
  });
})();
