/**
 * GridPaw — Murdoku (Murder Sudoku) Engine
 *
 * Suspect Latin-square placement + irregular rooms + floor objects (blocker/
 * rug/table) + witness clues; killer = the suspect alone in the victim's room.
 * Generation guarantees a provably unique solution (solver == independent
 * brute-force count, cross-verified in the spike: 4x4 100% unique, 6x6 ~57%
 * per call -> caller must retry; 8x8 not supported with the current clue set).
 *
 * API (global MurdokuEngine):
 *   generatePuzzle(N, seed)    -> puzzle | null  (N = 4 | 6)
 *   checkSolution(N, lay, clues, personCell) -> bool
 * Sources: validated spike (scratch/murdoku-spike/engine.js, 2026-10-13);
 * clue vocabulary + uniqueness budgets live in this file.
 */

'use strict';
/* ============================================================================
 * Murdoku-style logic puzzle engine spike (gridpaw tech validation)
 *
 * Rules modeled:
 *  - N×N grid partitioned into irregular named rooms; cells carry objects
 *    (0 plain, 1 blocker(not standable), 2 rug(standable), 3 table(standable))
 *  - People = (N-1) suspects (0..N-2) + victim V (N-1); each exactly one cell
 *  - Latin layer: all people in distinct rows AND distinct columns (N people
 *    over N rows/cols => each row and col holds exactly one person)
 *  - Victim rule: the room containing V holds exactly V+1 = 2 people (V + the
 *    single killer suspect); other rooms unbounded
 *  - Each suspect gives exactly ONE testimony; all testimonies are true
 *  - Testimony types:
 *      loc_in / loc_not_in        (room membership)
 *      on_rug / at_table / at_wall / in_corner   (object-spatial)
 *      same_room / only_me_and_x  (social)
 *      room_has_k / room_empty    (global room-count)
 *
 * Generation pipeline (per skill puzzle-game-engine):
 *  constructive placement -> derive true clue pools -> measured-greedy clue
 *  selection -> uniqueness proof (countSolutions maxCount=2, node budget,
 *  deadline retry) -> pad to one-clue-per-suspect -> weaken-minimize ->
 *  independent brute-force cross-check. Every puzzle REALLY solved for
 *  uniqueness; no constructive shortcuts.
 * ==========================================================================*/

const ROOM_NAMES = ['kitchen','study','bedroom','bathroom','living-room','dining-room','pantry','garage','attic','cellar','nursery','gallery','parlor','den','library','foyer','conservatory','laundry','sauna','observatory','greenhouse','gym','wine-cellar','music-room'];

/* ---------------- PRNG (mulberry32) ---------------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

/* ---------------- bitset helpers (BigInt masks, ≤64 cells) ---------------- */
const bit = (i) => 1n << BigInt(i);
function popcount(m) { let c = 0; while (m) { c += Number(m & 1n); m >>= 1n; } return c; }
function bits(m) {
  const out = []; let i = 0;
  while (m) { if (m & 1n) out.push(i); m >>= 1n; i++; }
  return out;
}
function binom(n, k) { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; }

/* ---------------- Layout: rooms + objects ---------------- */
function genLayout(N, rng, opt = {}) {
  const C = N * N;
  const minRooms = opt.minRooms ?? (N === 4 ? 3 : N === 6 ? 7 : 12);
  const numRooms = Math.max(minRooms, Math.round((C / (opt.roomArea ?? 3.8)) * (0.8 + rng() * 0.4)));
  const minArea = N === 4 ? 2 : 3;

  const cellRoom = new Int16Array(C).fill(-1);
  const rooms = [];
  const all = [...Array(C).keys()];
  shuffle(all, rng);
  for (let i = 0; i < numRooms; i++) { const c = all[i]; rooms.push({ cells: [c], name: '', id: i }); cellRoom[c] = i; }

  // smallest-room-first growth, connectivity preserved (Lemmy 2026-10-17,
  // pfjarschel: disconnected rooms made room-membership clues unplayable —
  // orig engine shipped disconnected rooms in 90% of 4x4 / 100% of 6x6
  // puzzles). A room only grows by absorbing an ADJACENT free cell; rooms
  // that are fully enclosed stop growing instead of teleporting to a far
  // free cell, then get merged into their smallest neighbor below.
  let remaining = C - numRooms;
  while (remaining > 0) {
    const growable = [];
    for (let r = 0; r < rooms.length; r++) {
      let grow = false;
      for (const c of rooms[r].cells) {
        const rr = (c / N) | 0, cc = c % N;
        if ((rr > 0 && cellRoom[c - N] < 0) || (rr < N - 1 && cellRoom[c + N] < 0) ||
            (cc > 0 && cellRoom[c - 1] < 0) || (cc < N - 1 && cellRoom[c + 1] < 0)) { grow = true; break; }
      }
      if (grow) growable.push(r);
    }
    if (!growable.length) return null; // unreachable on a connected grid; safety
    let ri = growable[0], minSz = rooms[ri].cells.length;
    for (const r of growable) {
      const sz = rooms[r].cells.length;
      if (sz < minSz) { minSz = sz; ri = r; }
      else if (sz === minSz && rng() < 0.3) ri = r;
    }
    const cands = [];
    for (const c of rooms[ri].cells) {
      const r = (c / N) | 0, cc = c % N;
      if (r > 0 && cellRoom[c - N] < 0) cands.push(c - N);
      if (r < N - 1 && cellRoom[c + N] < 0) cands.push(c + N);
      if (cc > 0 && cellRoom[c - 1] < 0) cands.push(c - 1);
      if (cc < N - 1 && cellRoom[c + 1] < 0) cands.push(c + 1);
    }
    const pick = cands[(rng() * cands.length) | 0];
    rooms[ri].cells.push(pick); cellRoom[pick] = ri; remaining--;
  }
  // merge any room that ended below minArea into its smallest adjacent room
  // (enclosed rooms used to trigger a full null-retry, tanking 6x6 success;
  // merging preserves connectivity and keeps more, smaller rooms, which the
  // uniqueness ceiling gate depends on)
  for (let i = 0; i < rooms.length; ) {
    if (rooms[i].cells.length >= minArea) { i++; continue; }
    let best = null;
    for (const cand of rooms) {
      if (cand.id === rooms[i].id || cand.cells.length < minArea) continue;
      let adj = false;
      for (const c of rooms[i].cells) {
        const r = (c / N) | 0, cc = c % N;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = cc + dc;
          if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
          if (cellRoom[nr * N + nc] === cand.id) { adj = true; break; }
        }
        if (adj) break;
      }
      if (adj && (!best || cand.cells.length < best.cells.length)) best = cand;
    }
    if (!best) return null; // isolated room: no adjacent room to merge into
    for (const c of rooms[i].cells) { cellRoom[c] = best.id; best.cells.push(c); }
    rooms.splice(i, 1); // do not advance: array shifted
  }
  // compact room ids after merges — cellsInRoom/roomOf are indexed by id
  // position, so id gaps would corrupt the derived masks
  rooms.forEach((room, idx) => {
    if (room.id !== idx) for (const c of room.cells) cellRoom[c] = idx;
    room.id = idx;
  });
  for (const room of rooms) if (room.cells.length < minArea) return null;

  const namePool = ROOM_NAMES.slice();
  shuffle(namePool, rng);
  rooms.forEach((room, i) => { room.name = namePool[i % namePool.length]; });

  // objects: blocker / rug / table
  const obj = new Uint8Array(C); // 0 plain, 1 blocker, 2 rug, 3 table
  for (const room of rooms) {
    const cells = room.cells.slice();
    shuffle(cells, rng);
    let stand = cells.length;
    const keep = cells.length >= 4 ? 3 : 2;
    for (const c of cells) {
      if (stand <= keep) break;
      if (rng() < (opt.blockerProb ?? 0.16)) { obj[c] = 1; stand--; }
    }
    for (const c of cells) { if (obj[c] === 1) continue; if (rng() < (opt.rugProb ?? 0.13)) obj[c] = 2; }
    for (const c of cells) { if (obj[c] !== 0) continue; if (rng() < (opt.tableProb ?? 0.13)) obj[c] = 3; }
  }
  // feasibility: every row / every column keeps >= 1 standable cell
  for (let r = 0; r < N; r++) { let s = 0; for (let c = 0; c < N; c++) if (obj[r * N + c] !== 1) s++; if (s === 0) return null; }
  for (let c = 0; c < N; c++) { let s = 0; for (let r = 0; r < N; r++) if (obj[r * N + c] !== 1) s++; if (s === 0) return null; }

  // derived masks
  const cellsInRoom = new Array(rooms.length).fill(0n);
  const roomOf = new Int16Array(C);
  let standMask = 0n, rugMask = 0n, tableMask = 0n, rugCount = 0, tableCount = 0;
  for (let i = 0; i < C; i++) {
    roomOf[i] = cellRoom[i];
    if (obj[i] !== 1) standMask |= bit(i);
    if (obj[i] === 2) { rugMask |= bit(i); rugCount++; }
    if (obj[i] === 3) { tableMask |= bit(i); tableCount++; }
    cellsInRoom[cellRoom[i]] |= bit(i);
  }
  const roomStand = rooms.map((room) => popcount(cellsInRoom[room.id] & standMask));

  let atTableMask = 0n, atTableCount = 0, wallMask = 0n, wallCount = 0, cornerMask = 0n, cornerCount = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const i = r * N + c;
    if (obj[i] === 1) continue;
    let wallDir = 0, tab = false;
    const nb = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of nb) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N) { wallDir++; continue; }
      const ni = nr * N + nc;
      // "at a wall" / "in a corner" mean what the player SEES: only the grid
      // border is a wall. Interior room seams are drawn as thin partition
      // lines, not walls (pfjarschel/Lemmy 2026-10-17 bug report — counting
      // them made mid-grid cells satisfy in_corner, 13/16 cells on 4x4).
      if (obj[ni] === 3) tab = true;
    }
    if (tab) { atTableMask |= bit(i); atTableCount++; }
    if (wallDir >= 1) { wallMask |= bit(i); wallCount++; }
    if (wallDir >= 2) { cornerMask |= bit(i); cornerCount++; }
  }

  const rowMask = [], colMask = [];
  for (let r = 0; r < N; r++) { let m = 0n; for (let c = 0; c < N; c++) m |= bit(r * N + c); rowMask.push(m); }
  for (let c = 0; c < N; c++) { let m = 0n; for (let r = 0; r < N; r++) m |= bit(r * N + c); colMask.push(m); }

  return {
    N, C, rooms, cellRoom, roomOf, obj,
    cellsInRoom, roomStand, standMask, rugMask, tableMask, atTableMask, wallMask, cornerMask,
    rugCount, tableCount, atTableCount, wallCount, cornerCount, rowMask, colMask,
  };
}

/* ---------------- Placement: constructive Latin + victim rule ---------------- */

function cellFeatures(lay, cell) {
  const N = lay.N;
  const r = (cell / N) | 0, c = cell % N;
  let wallDir = 0, tab = false;
  const rug = lay.obj[cell] === 2;
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= N || nc < 0 || nc >= N) { wallDir++; continue; }
    const ni = nr * N + nc;
    // wall = grid border only, mirroring the mask computation in genLayout —
    // interior room seams are partitions, not walls (Lemmy 2026-10-17)
    if (lay.obj[ni] === 3) tab = true;
  }
  // presence features only (absence is never assertable)
  return {
    rug, tab, wall: wallDir >= 1, corner: wallDir >= 2,
    featured: lay.obj[cell] === 2 || tab || wallDir >= 1,
  };
}
// # of cells in the same room whose features are a SUPERSET of the cell's features
// (cells that could host the same person in an alternative solution)
function altCount(lay, feats, cell) {
  const R = lay.roomOf[cell];
  let n = 0;
  for (let j = 0; j < lay.C; j++) {
    if (lay.roomOf[j] !== R || !(lay.standMask & bit(j))) continue;
    if (j !== cell) {
      const f = cellFeatures(lay, j);
      if (f.rug >= feats.rug && f.tab >= feats.tab && f.wall >= feats.wall && f.corner >= feats.corner) n++;
    }
  }
  return n;
}

function genPlacement(N, lay, rng) {
  const V = N - 1;
  const sig = new Array(lay.C);
  for (let i = 0; i < lay.C; i++) sig[i] = cellFeatures(lay, i);

  const vCands = [];
  for (let i = 0; i < lay.C; i++) {
    if ((lay.standMask & bit(i)) && lay.roomStand[lay.roomOf[i]] >= 2) vCands.push(i);
  }
  if (!vCands.length) return null;
  // prefer victim cells whose signature is rare within their room (distinct from a possible killer)
  vCands.sort((a, b) => roomSigDup(lay, sig, a) - roomSigDup(lay, sig, b));
  const vcell = vCands[Math.min(vCands.length - 1, (rng() * Math.min(4, vCands.length)) | 0)];
  const Rv = lay.roomOf[vcell];
  const rv = (vcell / N) | 0, cv = vcell % N;

  const kCands = [];
  for (let i = 0; i < lay.C; i++) {
    if ((lay.standMask & bit(i)) && lay.roomOf[i] === Rv && i !== vcell && ((i / N) | 0) !== rv && (i % N) !== cv) kCands.push(i);
  }
  if (!kCands.length) return null;
  // prefer killer cells with a DIFFERENT signature than the victim's
  kCands.sort((a, b) => (sig[a] === sig[vcell] ? 1 : 0) - (sig[b] === sig[vcell] ? 1 : 0));
  const kcell = kCands[Math.min(kCands.length - 1, (rng() * Math.min(3, kCands.length)) | 0)];
  const killer = (rng() * (N - 1)) | 0;

  const rowUsed = new Array(N).fill(false), colUsed = new Array(N).fill(false);
  rowUsed[(vcell / N) | 0] = true; colUsed[vcell % N] = true;
  rowUsed[(kcell / N) | 0] = true; colUsed[kcell % N] = true;
  const rowsL = [], colsL = [];
  for (let i = 0; i < N; i++) { if (!rowUsed[i]) rowsL.push(i); if (!colUsed[i]) colsL.push(i); }
  const rest = [];
  for (let s = 0; s < N - 1; s++) if (s !== killer) rest.push(s);

  // Kuhn matching; edge: standable & outside victim room
  const edge = (r, c) => { const cell = r * N + c; return (lay.standMask & bit(cell)) && lay.roomOf[cell] !== Rv; };

  function tryMatch(rowOrder, colOrder) {
    const matchR = {};
    const match = {}, seen = {};
    function dfs(r) {
      for (const c of colOrder) {
        if (edge(r, c) && !seen[c]) {
          seen[c] = true;
          if (match[c] === undefined || dfs(match[c])) { match[c] = r; matchR[r] = c; return true; }
        }
      }
      return false;
    }
    for (const r of rowOrder) { for (const c of colOrder) seen[c] = false; if (!dfs(r)) return null; }
    return matchR;
  }

  function score(matchR) {
    // suspect cells: killer fixed; rest from matchR
    const cells = new Array(N).fill(-1);
    cells[V] = vcell; cells[killer] = kcell;
    for (let idx = 0; idx < rowsL.length; idx++) cells[rest[idx]] = rowsL[idx] * N + matchR[rowsL[idx]];
    let pen = 0;
    for (let p = 0; p < N; p++) {
      // alternative cells that could host this person in an alternate solution
      pen += altCount(lay, sig[cells[p]], cells[p]);
      // unfeatured cells are only pinned by interactions: penalize
      if (!sig[cells[p]].featured) pen += 2;
    }
    for (let p = 0; p < N; p++) for (let q = p + 1; q < N; q++) {
      if (lay.roomOf[cells[p]] === lay.roomOf[cells[q]]) {
        const sp = sig[cells[p]], sq = sig[cells[q]];
        const swapOK = (sp.rug === sq.rug && sp.tab === sq.tab && sp.wall === sq.wall && sp.corner === sq.corner);
        pen += swapOK ? 3 : 1;
      }
    }
    const roomCount = new Map();
    for (const c of cells) roomCount.set(lay.roomOf[c], (roomCount.get(lay.roomOf[c]) ?? 0) + 1);
    for (const n of roomCount.values()) if (n > 2) pen += 2 * (n - 2);
    return { pen, cells };
  }

  let best = null;
  const trials = N <= 4 ? 10 : 24;
  for (let trial = 0; trial < trials; trial++) {
    const ro = rowsL.slice(), co = colsL.slice();
    shuffle(ro, rng); shuffle(co, rng);
    const m = tryMatch(ro, co);
    if (!m) continue;
    const s = score(m);
    if (!best || s.pen < best.pen) best = s;
  }
  if (!best) return null;
  const assigned = best.cells;
  if (!checkSolution(N, lay, [], assigned)) return null;
  return { personCell: assigned, killer };
}
function roomSigDup(lay, sig, cell) {
  const R = lay.roomOf[cell];
  let d = 0;
  for (let i = 0; i < lay.C; i++) {
    if (lay.roomOf[i] === R && (lay.standMask & bit(i)) && sig[i] === sig[cell]) d++;
  }
  return d;
}

/* ---------------- Clue pools (all TRUE of the placement, scored) ---------------- */
function derivePools(N, lay, pl, opt = {}) {
  const T = popcount(lay.standMask);
  const V = N - 1;
  const cap = opt.poolCap ?? 24;
  const peopleInRoom = (R) => { let k = 0; for (let p = 0; p < N; p++) if (lay.roomOf[pl.personCell[p]] === R) k++; return k; };
  let sameRoomProb = 0;
  for (const room of lay.rooms) sameRoomProb += Math.pow(lay.roomStand[room.id] / T, 2);

  const pools = [];
  for (let s = 0; s < N - 1; s++) {
    const cell = pl.personCell[s];
    const Rs = lay.roomOf[cell];
    const RsSz = lay.roomStand[Rs];
    const pool = [];
    const add = (type, extra, score) => { extra.type = type; extra.suspect = s; extra.score = score; pool.push(extra); };

    add('loc_in', { room: Rs }, Math.log2(T / RsSz));
    for (let R = 0; R < lay.rooms.length; R++) {
      if (R === Rs) continue;
      const S = lay.roomStand[R];
      add('loc_not_in', { room: R }, 0.6 * Math.log2(1 / (1 - S / T)));
    }
    if (lay.obj[cell] === 2) add('on_rug', {}, Math.log2(T / lay.rugCount));
    if (lay.atTableMask & bit(cell)) add('at_table', {}, Math.log2(T / lay.atTableCount));
    if (lay.wallMask & bit(cell)) add('at_wall', {}, Math.log2(T / lay.wallCount));
    if (lay.cornerMask & bit(cell)) add('in_corner', {}, Math.log2(T / lay.cornerCount));

    for (let t = 0; t < N - 1; t++) {
      if (t === s) continue;
      if (lay.roomOf[pl.personCell[t]] === Rs) {
        add('same_room', { person: t }, Math.log2(1 / sameRoomProb));
        add('same_room_in', { person: t, room: Rs }, 2 * Math.log2(T / RsSz) + Math.log2(1 / sameRoomProb));
      }
    }
    const inR = [];
    let vInR = false;
    for (let p = 0; p < N - 1; p++) if (lay.roomOf[pl.personCell[p]] === Rs) inR.push(p);
    if (lay.roomOf[pl.personCell[V]] === Rs) vInR = true;
    if (inR.length === 2 && !vInR) {
      const t = inR[0] === s ? inR[1] : inR[0];
      add('only_me_and_x', { person: t }, 12);
    }

    for (let R = 0; R < lay.rooms.length; R++) {
      const S = lay.roomStand[R];
      const k = peopleInRoom(R);
      if (k === 0) {
        add('room_empty', { room: R }, Math.log2(1 / Math.pow(1 - S / T, N)));
      } else {
        const p = S / T;
        const pr = binom(N, k) * Math.pow(p, k) * Math.pow(1 - p, N - k);
        add('room_has_k', { room: R, k }, pr > 0 ? Math.log2(1 / pr) : 24);
      }
    }

    pool.sort((a, b) => b.score - a.score);
    pools.push(pool.slice(0, cap));
  }
  return pools;
}

/* ---------------- Solver: propagation + MRV backtracking ---------------- */
class Solver {
  constructor(N, lay, clues) {
    this.N = N; this.lay = lay;
    const cand = new Array(N);
    for (let p = 0; p < N; p++) cand[p] = lay.standMask;
    for (const cl of clues) {
      const s = cl.suspect;
      switch (cl.type) {
        case 'loc_in': cand[s] &= lay.cellsInRoom[cl.room]; break;
        case 'loc_not_in': cand[s] &= ~lay.cellsInRoom[cl.room]; break;
        case 'on_rug': cand[s] &= lay.rugMask; break;
        case 'at_table': cand[s] &= lay.atTableMask; break;
        case 'at_wall': cand[s] &= lay.wallMask; break;
        case 'in_corner': cand[s] &= lay.cornerMask; break;
        case 'same_room_in':
          cand[s] &= lay.cellsInRoom[cl.room];
          cand[cl.person] &= lay.cellsInRoom[cl.room];
          break;
        case 'room_empty': for (let p = 0; p < N; p++) cand[p] &= ~lay.cellsInRoom[cl.room]; break;
      }
    }
    // victim can never sit in a room that cannot host V + 1 killer
    for (let R = 0; R < lay.rooms.length; R++) {
      if (lay.roomStand[R] < 2) cand[N - 1] &= ~lay.cellsInRoom[R];
    }
    this.sameRoom = clues.filter((c) => c.type === 'same_room').map((c) => ({ s: c.suspect, t: c.person }));
    this.onlyPair = clues.filter((c) => c.type === 'only_me_and_x').map((c) => ({ s: c.suspect, t: c.person }));
    this.hasK = clues.filter((c) => c.type === 'room_has_k').map((c) => ({ R: c.room, k: c.k }));
    this.baseCand = cand;
  }

  count(maxCount = 2, nodeBudget = 3e6) {
    const { N, lay } = this;
    const rowMask = lay.rowMask, colMask = lay.colMask, cellsInRoom = lay.cellsInRoom, roomOf = lay.roomOf, roomStand = lay.roomStand;
    const sameRoom = this.sameRoom, onlyPair = this.onlyPair, hasK = this.hasK;
    const V = N - 1;
    let count = 0, nodes = 0;
    const pcCache = new Map();

    function pcount(m) {
      let v = pcCache.get(m);
      if (v === undefined) { v = popcount(m); pcCache.set(m, v); }
      return v;
    }

    let cand = this.baseCand.slice();
    const fixed = new Int32Array(N).fill(-1);
    let rowUsed = 0, colUsed = 0;

    function search() {
      if (++nodes > nodeBudget) throw { budget: true, nodes };
      // ---------- propagation to fixpoint ----------
      for (;;) {
        let changed = false;
        // person singles
        for (let p = 0; p < N; p++) {
          if (fixed[p] >= 0) continue;
          const pc = pcount(cand[p]);
          if (pc === 0) return;
          if (pc === 1) {
            const cell = bits(cand[p])[0];
            fixed[p] = cell; cand[p] = bit(cell);
            const r = (cell / N) | 0, c = cell % N;
            rowUsed |= 1 << r; colUsed |= 1 << c;
            const kill = rowMask[r] | colMask[c];
            for (let q = 0; q < N; q++) if (q !== p) cand[q] &= ~kill;
            changed = true;
          }
        }
        // hidden singles: each row / col must host exactly one person
        for (let r = 0; r < N; r++) {
          if (rowUsed & (1 << r)) continue;
          let who = -1, many = false;
          for (let p = 0; p < N; p++) {
            if (fixed[p] >= 0) continue;
            if ((cand[p] & rowMask[r]) !== 0n) { if (who >= 0) { many = true; break; } who = p; }
          }
          if (who === -1) return; // nobody can fill row r
          if (!many) { const m = cand[who] & rowMask[r]; if (m !== cand[who]) { cand[who] = m; changed = true; } }
        }
        for (let c = 0; c < N; c++) {
          if (colUsed & (1 << c)) continue;
          let who = -1, many = false;
          for (let p = 0; p < N; p++) {
            if (fixed[p] >= 0) continue;
            if ((cand[p] & colMask[c]) !== 0n) { if (who >= 0) { many = true; break; } who = p; }
          }
          if (who === -1) return;
          if (!many) { const m = cand[who] & colMask[c]; if (m !== cand[who]) { cand[who] = m; changed = true; } }
        }
        // same_room propagation
        for (const { s, t } of sameRoom) {
          if (fixed[s] >= 0) {
            const m = cand[t] & cellsInRoom[roomOf[fixed[s]]];
            if (m !== cand[t]) { cand[t] = m; changed = true; }
            if (cand[t] === 0n) return;
          }
          if (fixed[t] >= 0) {
            const m = cand[s] & cellsInRoom[roomOf[fixed[t]]];
            if (m !== cand[s]) { cand[s] = m; changed = true; }
            if (cand[s] === 0n) return;
          }
        }
        // only_me_and_x propagation
        for (const { s, t } of onlyPair) {
          if (fixed[s] >= 0) {
            const R = roomOf[fixed[s]], cellsR = cellsInRoom[R];
            let fixInR = 0;
            for (let p = 0; p < N; p++) {
              if (p === s || p === t) continue;
              if (fixed[p] >= 0 && roomOf[fixed[p]] === R) fixInR++;
            }
            if (fixInR > 0) return;
            const m = cand[t] & cellsR;
            if (m !== cand[t]) { cand[t] = m; changed = true; }
            if (cand[t] === 0n) return;
            for (let p = 0; p < N; p++) {
              if (p === s || p === t || fixed[p] >= 0) continue;
              const nm = cand[p] & ~cellsR;
              if (nm !== cand[p]) { cand[p] = nm; changed = true; }
              if (nm === 0n) return;
            }
          }
          if (fixed[t] >= 0) {
            const R = roomOf[fixed[t]], cellsR = cellsInRoom[R];
            let fixInR = 0;
            for (let p = 0; p < N; p++) {
              if (p === s || p === t) continue;
              if (fixed[p] >= 0 && roomOf[fixed[p]] === R) fixInR++;
            }
            if (fixInR > 0) return;
            const m = cand[s] & cellsR;
            if (m !== cand[s]) { cand[s] = m; changed = true; }
            if (cand[s] === 0n) return;
            for (let p = 0; p < N; p++) {
              if (p === s || p === t || fixed[p] >= 0) continue;
              const nm = cand[p] & ~cellsR;
              if (nm !== cand[p]) { cand[p] = nm; changed = true; }
              if (nm === 0n) return;
            }
          }
        }
        // room_has_k propagation
        for (const { R, k } of hasK) {
          const cellsR = cellsInRoom[R];
          if (k > roomStand[R]) return;
          let fx = 0, poss = 0;
          const possible = [];
          for (let p = 0; p < N; p++) {
            if (fixed[p] >= 0) { if (roomOf[fixed[p]] === R) fx++; }
            else if ((cand[p] & cellsR) !== 0n) { poss++; possible.push(p); }
          }
          if (fx > k) return;
          if (fx + poss < k) return;
          if (fx + poss === k) {
            for (const p of possible) {
              const m = cand[p] & cellsR;
              if (m !== cand[p]) { cand[p] = m; changed = true; }
            }
          } else if (fx === k) {
            for (const p of possible) {
              const nm = cand[p] & ~cellsR;
              if (nm !== cand[p]) { cand[p] = nm; changed = true; }
              if (nm === 0n) return;
            }
          }
        }
        // victim-room rule: room(V) holds exactly V + 1 = 2 people
        {
          let Rv = -1;
          if (fixed[V] >= 0) Rv = roomOf[fixed[V]];
          else {
            const cv = cand[V];
            if (cv !== 0n) {
              for (let R = 0; R < lay.rooms.length; R++) {
                if ((cv & ~cellsInRoom[R]) === 0n) { Rv = R; break; }
              }
            }
          }
          if (Rv >= 0) {
            const cellsR = cellsInRoom[Rv];
            let fxS = 0, oneWho = -1;
            for (let p = 0; p < N - 1; p++) {
              if (fixed[p] >= 0 && roomOf[fixed[p]] === Rv) { fxS++; oneWho = p; }
            }
            if (fxS > 1) return;
            if (fxS === 1) {
              for (let p = 0; p < N; p++) {
                if (p === oneWho || p === V || fixed[p] >= 0) continue;
                const nm = cand[p] & ~cellsR;
                if (nm !== cand[p]) { cand[p] = nm; changed = true; }
                if (nm === 0n) return;
              }
            }
          }
        }
        if (!changed) break;
      }
      // ---------- leaf ----------
      let allFixed = true;
      for (let p = 0; p < N; p++) if (fixed[p] < 0) { allFixed = false; break; }
      if (allFixed) {
        const Rv = roomOf[fixed[V]];
        let sInRv = 0;
        for (let p = 0; p < N - 1; p++) if (roomOf[fixed[p]] === Rv) sInRv++;
        if (sInRv !== 1) return;
        for (const { s, t } of sameRoom) if (roomOf[fixed[s]] !== roomOf[fixed[t]]) return;
        for (const { s, t } of onlyPair) {
          const R = roomOf[fixed[s]];
          let cnt = 0, hasT = false;
          for (let p = 0; p < N; p++) { if (roomOf[fixed[p]] === R) cnt++; if (p === t && roomOf[fixed[t]] === R) hasT = true; }
          if (cnt !== 2 || !hasT) return;
        }
        for (const { R, k } of hasK) {
          let cnt = 0;
          for (let p = 0; p < N; p++) if (roomOf[fixed[p]] === R) cnt++;
          if (cnt !== k) return;
        }
        count++;
        return;
      }
      // ---------- MRV branch ----------
      let bp = -1, bc = Infinity;
      for (let p = 0; p < N; p++) {
        if (fixed[p] >= 0) continue;
        const pc = pcount(cand[p]);
        if (pc < bc) { bc = pc; bp = p; }
      }
      if (bp < 0) return;
      const cands = bits(cand[bp]);
      cands.sort((a, b) => roomStand[roomOf[a]] - roomStand[roomOf[b]] || a - b);
      const savedCand = cand.slice(), savedFixed = fixed.slice(), savedRU = rowUsed, savedCU = colUsed;
      for (const cell of cands) {
        for (let i = 0; i < N; i++) { cand[i] = savedCand[i]; fixed[i] = savedFixed[i]; }
        rowUsed = savedRU; colUsed = savedCU;
        fixed[bp] = cell; cand[bp] = bit(cell);
        const r = (cell / N) | 0, c = cell % N;
        rowUsed |= 1 << r; colUsed |= 1 << c;
        const kill = rowMask[r] | colMask[c];
        for (let q = 0; q < N; q++) if (q !== bp) cand[q] &= ~kill;
        search();
        if (count >= maxCount) return;
      }
      for (let i = 0; i < N; i++) { cand[i] = savedCand[i]; fixed[i] = savedFixed[i]; }
    }

    search();
    return { count, nodes };
  }

  // enumerate solutions (with arrays), for guided search: stops at maxCount
  countSolutions(maxCount = 2, nodeBudget = 3e6) {
    const { N, lay } = this;
    const rowMask = lay.rowMask, colMask = lay.colMask, cellsInRoom = lay.cellsInRoom, roomOf = lay.roomOf, roomStand = lay.roomStand;
    const sameRoom = this.sameRoom, onlyPair = this.onlyPair, hasK = this.hasK;
    const V = N - 1;
    let nodes = 0;
    const sols = [];
    const pcCache = new Map();

    function pcount(m) {
      let v = pcCache.get(m);
      if (v === undefined) { v = popcount(m); pcCache.set(m, v); }
      return v;
    }

    let cand = this.baseCand.slice();
    const fixed = new Int32Array(N).fill(-1);
    let rowUsed = 0, colUsed = 0;

    function search() {
      if (sols.length >= maxCount) return;
      if (++nodes > nodeBudget) throw { budget: true, nodes };
      // ---------- propagation to fixpoint ----------
      for (;;) {
        let changed = false;
        for (let p = 0; p < N; p++) {
          if (fixed[p] >= 0) continue;
          const pc = pcount(cand[p]);
          if (pc === 0) return;
          if (pc === 1) {
            const cell = bits(cand[p])[0];
            fixed[p] = cell; cand[p] = bit(cell);
            const r = (cell / N) | 0, c = cell % N;
            rowUsed |= 1 << r; colUsed |= 1 << c;
            const kill = rowMask[r] | colMask[c];
            for (let q = 0; q < N; q++) if (q !== p) cand[q] &= ~kill;
            changed = true;
          }
        }
        for (let r = 0; r < N; r++) {
          if (rowUsed & (1 << r)) continue;
          let who = -1, many = false;
          for (let p = 0; p < N; p++) {
            if (fixed[p] >= 0) continue;
            if ((cand[p] & rowMask[r]) !== 0n) { if (who >= 0) { many = true; break; } who = p; }
          }
          if (who === -1) return;
          if (!many) { const m = cand[who] & rowMask[r]; if (m !== cand[who]) { cand[who] = m; changed = true; } }
        }
        for (let c = 0; c < N; c++) {
          if (colUsed & (1 << c)) continue;
          let who = -1, many = false;
          for (let p = 0; p < N; p++) {
            if (fixed[p] >= 0) continue;
            if ((cand[p] & colMask[c]) !== 0n) { if (who >= 0) { many = true; break; } who = p; }
          }
          if (who === -1) return;
          if (!many) { const m = cand[who] & colMask[c]; if (m !== cand[who]) { cand[who] = m; changed = true; } }
        }
        for (const { s, t } of sameRoom) {
          if (fixed[s] >= 0) {
            const m = cand[t] & cellsInRoom[roomOf[fixed[s]]];
            if (m !== cand[t]) { cand[t] = m; changed = true; }
            if (cand[t] === 0n) return;
          }
          if (fixed[t] >= 0) {
            const m = cand[s] & cellsInRoom[roomOf[fixed[t]]];
            if (m !== cand[s]) { cand[s] = m; changed = true; }
            if (cand[s] === 0n) return;
          }
        }
        for (const { s, t } of onlyPair) {
          if (fixed[s] >= 0) {
            const R = roomOf[fixed[s]], cellsR = cellsInRoom[R];
            let fixInR = 0;
            for (let p = 0; p < N; p++) {
              if (p === s || p === t) continue;
              if (fixed[p] >= 0 && roomOf[fixed[p]] === R) fixInR++;
            }
            if (fixInR > 0) return;
            const m = cand[t] & cellsR;
            if (m !== cand[t]) { cand[t] = m; changed = true; }
            if (cand[t] === 0n) return;
            for (let p = 0; p < N; p++) {
              if (p === s || p === t || fixed[p] >= 0) continue;
              const nm = cand[p] & ~cellsR;
              if (nm !== cand[p]) { cand[p] = nm; changed = true; }
              if (nm === 0n) return;
            }
          }
          if (fixed[t] >= 0) {
            const R = roomOf[fixed[t]], cellsR = cellsInRoom[R];
            let fixInR = 0;
            for (let p = 0; p < N; p++) {
              if (p === s || p === t) continue;
              if (fixed[p] >= 0 && roomOf[fixed[p]] === R) fixInR++;
            }
            if (fixInR > 0) return;
            const m = cand[s] & cellsR;
            if (m !== cand[s]) { cand[s] = m; changed = true; }
            if (cand[s] === 0n) return;
            for (let p = 0; p < N; p++) {
              if (p === s || p === t || fixed[p] >= 0) continue;
              const nm = cand[p] & ~cellsR;
              if (nm !== cand[p]) { cand[p] = nm; changed = true; }
              if (nm === 0n) return;
            }
          }
        }
        for (const { R, k } of hasK) {
          const cellsR = cellsInRoom[R];
          if (k > roomStand[R]) return;
          let fx = 0, poss = 0;
          const possible = [];
          for (let p = 0; p < N; p++) {
            if (fixed[p] >= 0) { if (roomOf[fixed[p]] === R) fx++; }
            else if ((cand[p] & cellsR) !== 0n) { poss++; possible.push(p); }
          }
          if (fx > k) return;
          if (fx + poss < k) return;
          if (fx + poss === k) {
            for (const p of possible) {
              const m = cand[p] & cellsR;
              if (m !== cand[p]) { cand[p] = m; changed = true; }
            }
          } else if (fx === k) {
            for (const p of possible) {
              const nm = cand[p] & ~cellsR;
              if (nm !== cand[p]) { cand[p] = nm; changed = true; }
              if (nm === 0n) return;
            }
          }
        }
        {
          let Rv = -1;
          if (fixed[V] >= 0) Rv = roomOf[fixed[V]];
          else {
            const cv = cand[V];
            if (cv !== 0n) {
              for (let R = 0; R < lay.rooms.length; R++) {
                if ((cv & ~cellsInRoom[R]) === 0n) { Rv = R; break; }
              }
            }
          }
          if (Rv >= 0) {
            const cellsR = cellsInRoom[Rv];
            let fxS = 0, oneWho = -1;
            for (let p = 0; p < N - 1; p++) {
              if (fixed[p] >= 0 && roomOf[fixed[p]] === Rv) { fxS++; oneWho = p; }
            }
            if (fxS > 1) return;
            if (fxS === 1) {
              for (let p = 0; p < N; p++) {
                if (p === oneWho || p === V || fixed[p] >= 0) continue;
                const nm = cand[p] & ~cellsR;
                if (nm !== cand[p]) { cand[p] = nm; changed = true; }
                if (nm === 0n) return;
              }
            }
          }
        }
        if (!changed) break;
      }
      let allFixed = true;
      for (let p = 0; p < N; p++) if (fixed[p] < 0) { allFixed = false; break; }
      if (allFixed) {
        const Rv = roomOf[fixed[V]];
        let sInRv = 0;
        for (let p = 0; p < N - 1; p++) if (roomOf[fixed[p]] === Rv) sInRv++;
        if (sInRv !== 1) return;
        for (const { s, t } of sameRoom) if (roomOf[fixed[s]] !== roomOf[fixed[t]]) return;
        for (const { s, t } of onlyPair) {
          const R = roomOf[fixed[s]];
          let cnt = 0, hasT = false;
          for (let p = 0; p < N; p++) { if (roomOf[fixed[p]] === R) cnt++; if (p === t && roomOf[fixed[t]] === R) hasT = true; }
          if (cnt !== 2 || !hasT) return;
        }
        for (const { R, k } of hasK) {
          let cnt = 0;
          for (let p = 0; p < N; p++) if (roomOf[fixed[p]] === R) cnt++;
          if (cnt !== k) return;
        }
        sols.push(fixed.slice()); // copy: never leak the shared working buffer
        return;
      }
      let bp = -1, bc = Infinity;
      for (let p = 0; p < N; p++) {
        if (fixed[p] >= 0) continue;
        const pc = pcount(cand[p]);
        if (pc < bc) { bc = pc; bp = p; }
      }
      if (bp < 0) return;
      const cands = bits(cand[bp]);
      cands.sort((a, b) => roomStand[roomOf[a]] - roomStand[roomOf[b]] || a - b);
      const savedCand = cand.slice(), savedFixed = fixed.slice(), savedRU = rowUsed, savedCU = colUsed;
      for (const cell of cands) {
        for (let i = 0; i < N; i++) { cand[i] = savedCand[i]; fixed[i] = savedFixed[i]; }
        rowUsed = savedRU; colUsed = savedCU;
        fixed[bp] = cell; cand[bp] = bit(cell);
        const r = (cell / N) | 0, c = cell % N;
        rowUsed |= 1 << r; colUsed |= 1 << c;
        const kill = rowMask[r] | colMask[c];
        for (let q = 0; q < N; q++) if (q !== bp) cand[q] &= ~kill;
        search();
        if (sols.length >= maxCount) return;
      }
      for (let i = 0; i < N; i++) { cand[i] = savedCand[i]; fixed[i] = savedFixed[i]; }
    }

    search();
    return { sols, nodes };
  }
}

/* ---------------- independent full solution check ---------------- */
function checkSolution(N, lay, clues, personCell) {
  const seenR = new Set(), seenC = new Set();
  for (let p = 0; p < N; p++) {
    const cell = personCell[p];
    if (cell < 0 || cell >= lay.C) return false;
    if (!(lay.standMask & bit(cell))) return false;
    const r = (cell / N) | 0, c = cell % N;
    if (seenR.has(r) || seenC.has(c)) return false;
    seenR.add(r); seenC.add(c);
  }
  const RV = lay.roomOf[personCell[N - 1]];
  let cntV = 0;
  for (let p = 0; p < N; p++) if (lay.roomOf[personCell[p]] === RV) cntV++;
  if (cntV !== 2) return false;
  for (const cl of clues) {
    const s = cl.suspect, cs = personCell[s];
    switch (cl.type) {
      case 'loc_in': if (lay.roomOf[cs] !== cl.room) return false; break;
      case 'loc_not_in': if (lay.roomOf[cs] === cl.room) return false; break;
      case 'on_rug': if (lay.obj[cs] !== 2) return false; break;
      case 'at_table': if (!(lay.atTableMask & bit(cs))) return false; break;
      case 'at_wall': if (!(lay.wallMask & bit(cs))) return false; break;
      case 'in_corner': if (!(lay.cornerMask & bit(cs))) return false; break;
      case 'same_room': if (lay.roomOf[cs] !== lay.roomOf[personCell[cl.person]]) return false; break;
      case 'same_room_in':
        if (lay.roomOf[cs] !== cl.room || lay.roomOf[personCell[cl.person]] !== cl.room) return false;
        break;
      case 'only_me_and_x': {
        let cnt = 0;
        for (let p = 0; p < N; p++) if (lay.roomOf[personCell[p]] === lay.roomOf[cs]) cnt++;
        if (cnt !== 2 || lay.roomOf[personCell[cl.person]] !== lay.roomOf[cs]) return false;
        break;
      }
      case 'room_has_k': {
        let cnt = 0;
        for (let p = 0; p < N; p++) if (lay.roomOf[personCell[p]] === cl.room) cnt++;
        if (cnt !== cl.k) return false;
        break;
      }
      case 'room_empty': {
        for (let p = 0; p < N; p++) if (lay.roomOf[personCell[p]] === cl.room) return false;
        break;
      }
    }
  }
  return true;
}

/* ---------------- independent brute-force counter (plain backtracker) ---------------- */
function bruteCount(N, lay, clues, cap = 2, budget = 5e7) {
  let count = 0, nodes = 0;
  const ass = new Int32Array(N).fill(-1);
  function rec(p, rows, cols) {
    if (++nodes > budget) throw { budget: true, nodes };
    if (p === N) {
      if (checkSolution(N, lay, clues, ass)) count++;
      return count >= cap;
    }
    for (let r = 0; r < N; r++) {
      if (rows & (1 << r)) continue;
      for (let c = 0; c < N; c++) {
        if (cols & (1 << c)) continue;
        const cell = r * N + c;
        if (!(lay.standMask & bit(cell))) continue;
        ass[p] = cell;
        if (rec(p + 1, rows | (1 << r), cols | (1 << c))) return true;
      }
    }
    return false;
  }
  rec(0, 0, 0);
  return { count, nodes };
}

/* ---------------- wrappers ---------------- */
function solveCount(N, lay, clues, cap, budget = 3e6) {
  try { return new Solver(N, lay, clues).count(cap, budget).count; }
  catch (e) { if (e && e.budget) return -1; throw e; }
}
function solveCountNodes(N, lay, clues, cap, budget = 3e6) {
  const r = new Solver(N, lay, clues).count(cap, budget);
  return { count: r.count, nodes: r.nodes };
}

/* ---------------- repair local search (greedy stall fallback) ---------------- */
function repairSearch(N, lay, pools, cur, cnt, rng) {
  let best = null;
  let budget = 600;
  const greedyCap = N <= 4 ? 300 : N <= 6 ? 150 : 80;
  const suspects = [...Array(N - 1).keys()];
  shuffle(suspects, rng);
  for (const s of suspects) {
    const hasClue = cur.some((c) => c.suspect === s);
    let tried = 0;
    for (const clue of pools[s]) {
      if (budget-- <= 0) break;
      if (tried++ >= 8) break;
      const test = hasClue ? cur.map((c) => (c.suspect === s ? clue : c)) : cur.concat(clue);
      const c2 = solveCount(N, lay, test, greedyCap);
      if (c2 === 1) return { clues: test, cnt: 1, changed: true };
      if (c2 !== -1 && (!best || c2 < best.c2)) best = { clues: test, cnt: c2, changed: true };
    }
    if (budget <= 0) break;
  }
  if (best && best.cnt < cnt) return best;
  return null;
}

/* ---------------- full puzzle generation ---------------- */
function generatePuzzle(N, seed, opt = {}) {
  const rng = mulberry32(seed);
  const maxAttempts = opt.maxAttempts ?? (N === 4 ? 150 : N === 6 ? 120 : 80);
  const proofBudget = opt.proofBudget ?? 6e6;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const lay = genLayout(N, rng, opt);
    if (!lay) continue;
    const pl = genPlacement(N, lay, rng);
    if (!pl) continue;
    const pools = derivePools(N, lay, pl, opt);

    // ---- ceiling gate: the FUSED clue set must be unique, else this attempt can
    // never converge (structural ambiguity). Cheap single solve per attempt. ----
    const fusedAll = [];
    for (const pool of pools) for (const cl of pool) fusedAll.push(cl);
    let fused;
    try { fused = solveCountNodes(N, lay, fusedAll, 2, proofBudget); }
    catch (e) { if (e && e.budget) continue; throw e; }
    if (fused.count !== 1) continue;

    // ---- dig-out: delete clues from the unique fused set while uniqueness holds ----
    let cur = fusedAll.slice();
    const delIdx = [...cur.keys()];
    shuffle(delIdx, rng);
    for (const i of delIdx) {
      const test = cur.filter((_, j) => j !== i);
      let c;
      try { c = solveCountNodes(N, lay, test, 2, proofBudget).count; }
      catch (e) { if (e && e.budget) continue; throw e; }
      if (c === 1) cur = test;
    }
    const M = cur.length;

    // ---- one-clue-per-suspect search: step-down descent + diff-guided last mile ----
    let assignment = null;
    {
      // stratified pool: discriminating personal types first, then score order
      const poolView = pools.map((p) => {
        const personal = ['on_rug', 'at_table', 'at_wall', 'in_corner', 'same_room', 'same_room_in', 'only_me_and_x'];
        const had = new Set();
        const extra = [];
        for (const cl of p) {
          if (personal.includes(cl.type) && !had.has(cl.type)) { had.add(cl.type); extra.push(cl); }
        }
        return extra.concat(p.slice(0, Math.max(0, 14 - extra.length)));
      });
      const restarts = N <= 4 ? 8 : N <= 6 ? 6 : 6;
      const searchCap = 8;
      let usedCounts = 0;
      const capCounts = N <= 6 ? 700 : 500;
      let curCount = searchCap;
      const countSafe = (set) => {
        if (usedCounts++ > capCounts) return -2;
        const r = solveCount(N, lay, set, searchCap, N >= 8 ? Math.min(proofBudget, 1e6) : proofBudget);
        // node-budget overrun: candidate is near-unique; skip it without aborting the descent
        return r === -1 ? curCount : r;
      };
      const hardVerify = (set) => solveCount(N, lay, set, 2, proofBudget) === 1 && checkSolution(N, lay, set, pl.personCell);
      for (let r = 0; r < restarts && !assignment; r++) {
        let curSet = [];
        for (let s = 0; s < N - 1; s++) {
          const pv = poolView[s];
          const cl = pv[(rng() * pv.length) | 0];
          if (!cl) break;
          curSet.push(cl);
        }
        if (curSet.length !== N - 1) continue;
        curCount = countSafe(curSet);
        if (curCount === -2) break;
        // step-down descent (count 8 -> ... -> 2)
        for (let pass = 0; pass < 8 && curCount > 1; pass++) {
          let improved = false;
          const order = [...Array(N - 1).keys()];
          shuffle(order, rng);
          for (const s of order) {
            const cands = poolView[s].slice();
            shuffle(cands, rng);
            for (const clue of cands) {
              const test = curSet.map((c) => (c.suspect === s ? clue : c));
              const c2 = countSafe(test);
              if (c2 === -2) { improved = false; break; }
              if (c2 < curCount) {
                curSet = test; curCount = c2; improved = true;
                if (curCount === 1) break;
                break; // first improvement -> next pass
              }
            }
            if (curCount === 1 || !improved) break;
          }
          if (curCount === 1) break;
          if (!improved) break; // local minimum
        }
        if (curCount === 1) {
          if (hardVerify(curSet)) assignment = curSet;
          continue;
        }
        if (curCount === 2) {
          // diff-guided last mile: collapse the solution pair directly
          let res;
          try { res = new Solver(N, lay, curSet).countSolutions(2, Math.min(proofBudget, 4e6)); }
          catch (e) { if (e && e.budget) continue; throw e; }
          if (res.sols.length === 1) { if (hardVerify(curSet)) assignment = curSet; continue; }
          if (res.sols.length >= 2) {
            const [s1, s2] = res.sols;
            const diff = [];
            for (let p = 0; p < N - 1; p++) if (s1[p] !== s2[p]) diff.push(p);
            const order = diff.slice();
            shuffle(order, rng);
            let won = false, stuck = false;
            for (const s of order) {
              const cands = poolView[s].slice();
              shuffle(cands, rng);
              for (const clue of cands) {
                const test = curSet.map((c) => (c.suspect === s ? clue : c));
                const rr = countSafe(test);
                if (rr === -2) { stuck = true; break; }
                if (rr === 1 && hardVerify(test)) { curSet = test; won = true; break; }
              }
              if (won || stuck) break;
            }
            if (won && hardVerify(curSet)) assignment = curSet;
          }
        }
      }
    }
    if (!assignment) continue;
    cur = assignment;

    // ---- weaken-minimize (replace with weaker true clues while unique) ----
    const idsInOrder = [...new Set(cur.map((c) => c.suspect))];
    shuffle(idsInOrder, rng);
    for (const s of idsInOrder) {
      const curClue = cur.find((c) => c.suspect === s);
      for (const alt of pools[s]) {
        if (alt === curClue || alt.score >= curClue.score) continue;
        const test = cur.map((c) => (c.suspect === s ? alt : c));
        if (solveCount(N, lay, test, 2, proofBudget) === 1) { cur = test; break; }
      }
    }

    // ---- metric: fully-minimized clue count (drop any removable clue) ----
    let mini = cur.slice();
    {
      const idxs = [...mini.keys()];
      shuffle(idxs, rng);
      for (const i of idxs) {
        const test = mini.filter((_, j) => j !== i);
        if (solveCount(N, lay, test, 2, proofBudget) === 1) mini = test;
      }
    }
    const m2 = mini.length;

    // ---- final verification ----
    const v1 = solveCount(N, lay, cur, 2, proofBudget);
    if (v1 !== 1) continue;
    if (!checkSolution(N, lay, cur, pl.personCell)) throw new Error(`seed=${seed} attempt=${attempt}: clue not true of placement`);
    let brute;
    try { brute = bruteCount(N, lay, cur, 2, N >= 8 ? 2e6 : 5e7); }
    catch (e) { if (e && e.budget) brute = { count: -2, nodes: e.nodes }; else throw e; }
    if (brute.count !== 1 && brute.count !== -2) throw new Error(`seed=${seed}: solver says unique (${v1}) but brute found ${brute.count}`);

    return {
      N, seed, attempt, layout: lay, clues: cur, placement: pl, M, m2,
      fusedNodes: fused.nodes, brute,
    };
  }
  return null;
}

export {
  mulberry32, shuffle, genLayout, genPlacement, derivePools, Solver,
  checkSolution, bruteCount, solveCount, solveCountNodes, generatePuzzle, bit, popcount,
  cellFeatures, altCount,
};