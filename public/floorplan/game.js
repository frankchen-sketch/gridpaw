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
    // 门：必须朝屋里；对门若已摆好必须也有门
    for (const [dx, dy, side] of r.doors) {
      const ax = gx + dx, ay = gy + dy;
      const [vx, vy] = DIRS[side];
      const nx = ax + vx, ny = ay + vy;
      if (!inPlan(nx, ny)) return { ok: false, why: 'A door would face the outside', badCells: [[ax, ay]] };
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

  function buildTile(room, cell, opts) {
    const el = document.createElement('div');
    el.className = 'tile' + (opts && opts.placed ? ' placed' : '');
    el.dataset.room = room.id;
    el.style.width = room.bw * cell + 'px';
    el.style.height = room.bh * cell + 'px';
    el.style.setProperty('--cell', cell + 'px');
    const fill = COLORS[room.id % COLORS.length];
    el.style.setProperty('--tc', fill);
    const own = new Set(room.shape.map(([x, y]) => x + ',' + y));
    const WALL = 'rgba(74,48,18,.55)';
    const T = Math.max(1.5, cell * 0.045);
    for (const [sx, sy] of room.shape) {
      const p = document.createElement('div');
      p.className = 'part';
      p.style.left = sx * cell + 'px';
      p.style.top = sy * cell + 'px';
      p.style.width = cell + 'px';
      p.style.height = cell + 'px';
      p.style.background = fill;
      // 只画「房间外墙」：同一房间内部的相邻格不画线，房间才读起来是一整间而不是一堆格子
      const sh = [];
      if (!own.has(sx + ',' + (sy - 1))) sh.push(`inset 0 ${T}px 0 ${WALL}`);
      if (!own.has(sx + ',' + (sy + 1))) sh.push(`inset 0 -${T}px 0 ${WALL}`);
      if (!own.has(sx - 1 + ',' + sy)) sh.push(`inset ${T}px 0 0 ${WALL}`);
      if (!own.has(sx + 1 + ',' + sy)) sh.push(`inset -${T}px 0 0 ${WALL}`);
      p.style.boxShadow = sh.join(',');
      el.appendChild(p);
    }
    // 门：画在格子内侧边缘，一整条通口（贴边不留缝），两端加门框小竖线
    for (const [dx, dy, side] of room.doors) {
      const d = document.createElement('div');
      d.className = 'dr ' + (side === 'N' || side === 'S' ? 'h' : 'v');
      const cx2 = dx * cell + cell / 2, cy2 = dy * cell + cell / 2;
      const th = Math.max(4, cell * 0.18), len = cell * 0.54;
      if (side === 'N') { d.style.left = cx2 - len / 2 + 'px'; d.style.top = cy2 - cell / 2 + 'px'; d.style.width = len + 'px'; d.style.height = th + 'px'; }
      if (side === 'S') { d.style.left = cx2 - len / 2 + 'px'; d.style.top = cy2 + cell / 2 - th + 'px'; d.style.width = len + 'px'; d.style.height = th + 'px'; }
      if (side === 'W') { d.style.left = cx2 - cell / 2 + 'px'; d.style.top = cy2 - len / 2 + 'px'; d.style.width = th + 'px'; d.style.height = len + 'px'; }
      if (side === 'E') { d.style.left = cx2 + cell / 2 - th + 'px'; d.style.top = cy2 - len / 2 + 'px'; d.style.width = th + 'px'; d.style.height = len + 'px'; }
      el.appendChild(d);
    }
    // 房间名：贴在形状里最靠中心的那一格上，允许溢到相邻格（还是同一间房），不裁剪
    if (cell >= 30) {
      const at = chipLabel(room);
      const lbl = document.createElement('div');
      lbl.className = 'lbl';
      lbl.textContent = room.name;
      lbl.style.left = (at[0] * cell + cell / 2) + 'px';
      lbl.style.top = (at[1] * cell + cell / 2) + 'px';
      lbl.style.width = Math.max(cell * 1.7, 44) + 'px';
      el.appendChild(lbl);
    }
    return el;
  }

  // ---------- 渲染 ----------
  function renderBoard() {
    const L = lv();
    const cell = state.cell;
    board.querySelectorAll('.cell,.tile').forEach((n) => n.remove());
    for (const [x, y] of L.cells) {
      const c = document.createElement('div');
      c.className = 'cell floor';
      c.dataset.cx = x; c.dataset.cy = y;
      c.style.left = x * cell + 'px'; c.style.top = y * cell + 'px';
      c.style.width = cell + 'px'; c.style.height = cell + 'px';
      board.appendChild(c);
    }
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
      const t = buildTile(room, cell);
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
    state.levels.forEach((L) => { L._cellSet = new Set(L.cells.map(([x, y]) => cellKey(x, y))); });
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
