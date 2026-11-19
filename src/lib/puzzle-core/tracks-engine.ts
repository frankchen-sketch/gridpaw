/**
 * GridPaw — Tracks (Train Tracks) Engine
 *
 * Eighth game on puzzle-core. Rules are Simon Tatham's (public), the code and
 * the algorithm are ours.
 *
 * RULES, precisely:
 *  - The board is a grid of squares. Each square either has a rail piece
 *    (straight or 90° curve) or nothing. A rail piece occupies the square and
 *    joins EXACTLY TWO of its four sides. Entrance A and exit B are the
 *    exception: their piece joins exactly one side, because the line runs off
 *    the board there.
 *  - Two squares are connected only when the shared side carries rail on both
 *    sides of the boundary. Two track squares that merely sit next to each
 *    other are parallel rails, NOT a connection. This is the trap the first
 *    implementation fell into: modelling the solved board as a connected cell
 *    path silently forbids parallel rails and therefore mis-measures
 *    uniqueness. The state is the EDGE set, not the cell set.
 *  - All rails form one unbroken line A → B: no branches (a square holds at
 *    most two joints), no detached loops.
 *  - Each row/column clue counts the SQUARES in it that contain rail — not the
 *    number of joints, and not the length of the line.
 *
 * ENCODING (same lattice-edge scheme as the slitherlink engine, so the UI
 * layer can reuse its hit-testing):
 *   H[r][c]  horizontal edge between cells (r,c-1) and (r,c)  → r∈[0,rows], c∈[0,cols-1]
 *   V[r][c]  vertical edge   between cells (r-1,c) and (r,c)  → r∈[0,rows-1], c∈[0,cols]
 *   hIdx = r*cols + c ; vIdx = (rows+1)*cols + r*(cols+1) + c
 *   edgeCount = (rows+1)*cols + rows*(cols+1)
 *   edge value: 1 rail, 0 no rail (-1 = undecided, solver only)
 *   cell (r,c) edges = [H(r,c), H(r+1,c), V(r,c), V(r,c+1)]
 *
 * SOLVER: cell-mask propagation (degree, clue counts on non-empty cells, and
 * rail-graph connectivity: no closed loop, no stranded piece, "A and B joined
 * ⇒ everything else is empty") then a most-constrained-cell branching search.
 * The competitor's solver caps out at 9×9 and says so on its own page; this
 * one is aimed at 12×12 and, more importantly, is explainable — every
 * assignment carries the rule that produced it, which is what /solver/ shows.
 */

export interface TracksPuzzle {
  id: string;
  rows: number;
  cols: number;
  rowClues: Int8Array;       // squares containing rail, per row
  colClues: Int8Array;       // squares containing rail, per column
  start: number;             // cell index of A, always on row 0
  end: number;               // cell index of B, always on row rows-1
  solution: Uint8Array;      // edges, 0/1
  solutionCells: Uint8Array; // cells, 0/1 (derived: the cell holds rail)
  pathLen: number;           // number of squares holding rail
  difficulty: 'easy' | 'medium' | 'hard';
}

export type TracksDeductionLevel = 'sums' | 'degree' | 'connect' | 'refute' | 'stalled';

export const UNSET = -1;

// ── Lattice indices ─────────────────────────────────────────────────────────
export function ci(cols: number, r: number, c: number): number { return r * cols + c; }
export function hIdx(rows: number, cols: number, r: number, c: number): number { return r * cols + c; }
export function vIdx(rows: number, cols: number, r: number, c: number): number {
  return (rows + 1) * cols + r * (cols + 1) + c;
}
export function edgeCount(rows: number, cols: number): number {
  return (rows + 1) * cols + rows * (cols + 1);
}
/** The four edges of a cell, in the order used by the masks below. */
export function cellEdges(rows: number, cols: number, r: number, c: number): [number, number, number, number] {
  return [
    hIdx(rows, cols, r, c),          // 0 top
    hIdx(rows, cols, r + 1, c),      // 1 bottom
    vIdx(rows, cols, r, c),          // 2 left
    vIdx(rows, cols, r, c + 1),      // 3 right
  ];
}

/** Cell neighbours, each with the edge that joins them. */
function cellLinks(rows: number, cols: number, r: number, c: number): { cell: number; edge: number }[] {
  const out: { cell: number; edge: number }[] = [];
  if (r > 0) out.push({ cell: ci(cols, r - 1, c), edge: hIdx(rows, cols, r, c) });
  if (r < rows - 1) out.push({ cell: ci(cols, r + 1, c), edge: hIdx(rows, cols, r + 1, c) });
  if (c > 0) out.push({ cell: ci(cols, r, c - 1), edge: vIdx(rows, cols, r, c) });
  if (c < cols - 1) out.push({ cell: ci(cols, r, c + 1), edge: vIdx(rows, cols, r, c + 1) });
  return out;
}

function shuffled<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

// ── Line generation: Warnsdorff-ordered self-avoiding walk of cells ─────────
/**
 * Builds one random simple cell path A→B with at least `minLen` cells. Ordering
 * candidates "fewest onward moves first" (the knight's-tour trick) gives long
 * winding lines instead of the first short diagonal.
 *
 * The path is a sequence of cells; parallel rails (two line cells sitting next
 * to each other without being consecutive) are allowed and do happen — that is
 * legal in Tracks, and the solver below is what decides whether the clue set
 * pins the board down.
 */
export function makePath(
  rows: number, cols: number, start: number, end: number,
  rng: () => number, minLen: number, budget = 120_000,
): number[] | null {
  const total = rows * cols;
  const visited = new Uint8Array(total);
  const path: number[] = [start];
  visited[start] = 1;
  let nodes = 0;
  let aborted = false;
  let found: number[] | null = null;

  const neigh = (v: number): number[] => {
    const r = (v / cols) | 0, c = v % cols;
    const out: number[] = [];
    if (r > 0) out.push(v - cols);
    if (r < rows - 1) out.push(v + cols);
    if (c > 0) out.push(v - 1);
    if (c < cols - 1) out.push(v + 1);
    return out;
  };
  const onward = (v: number): number => neigh(v).reduce((n, u) => n + (visited[u] ? 0 : 1), 0);

  const step = (v: number): boolean => {
    if (v === end) {
      // B is terminal. Accept only once the line is long enough, otherwise
      // treat B as a dead end and keep looking.
      if (path.length >= minLen) { found = path.slice(); return true; }
      return false;
    }
    const cand: number[] = [];
    for (const u of neigh(v)) {
      if (visited[u]) continue;
      if (u === end && path.length + 1 < minLen) continue; // do not rush to B
      cand.push(u);
    }
    shuffled(cand, rng);
    cand.sort((a, b) => onward(a) - onward(b));
    for (const u of cand) {
      if (++nodes > budget) { aborted = true; return false; }
      visited[u] = 1;
      path.push(u);
      if (step(u)) return true;
      path.pop();
      visited[u] = 0;
      if (aborted) return false;
    }
    return false;
  };

  step(start);
  return aborted ? null : found;
}

/** Cell sequence → the edge set that draws it. */
export function pathToEdges(rows: number, cols: number, path: number[]): Uint8Array {
  const edges = new Uint8Array(edgeCount(rows, cols));
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i], b = path[i + 1];
    const ar = (a / cols) | 0, ac = a % cols;
    const br = (b / cols) | 0, bc = b % cols;
    if (ar === br) edges[vIdx(rows, cols, ar, Math.max(ac, bc))] = 1;  // side by side
    else edges[hIdx(rows, cols, Math.max(ar, br), ac)] = 1;            // stacked
  }
  return edges;
}

/** Cells holding rail, derived from the edges. */
export function cellsFromEdges(rows: number, cols: number, edges: Int8Array): Uint8Array {
  const cells = new Uint8Array(rows * cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const e of cellEdges(rows, cols, r, c)) if (edges[e] === 1) { cells[ci(cols, r, c)] = 1; break; }
    }
  }
  return cells;
}

export function deriveClues(rows: number, cols: number, cells: Uint8Array): {
  rowClues: Int8Array; colClues: Int8Array; pathLen: number;
} {
  const rowClues = new Int8Array(rows);
  const colClues = new Int8Array(cols);
  let pathLen = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[ci(cols, r, c)]) { rowClues[r]++; colClues[c]++; pathLen++; }
    }
  }
  return { rowClues, colClues, pathLen };
}

/**
 * Tatham's cosmetic default: never put a 1 clue next to another 1, and never
 * let A's or B's row/column be a 1. Stops long boring straights and "one
 * square, where can it go" boards. Applied as a preference, not a law.
 */
export function cluesLookNatural(
  rows: number, cols: number,
  rowClues: Int8Array, colClues: Int8Array, start: number, end: number,
): boolean {
  for (let i = 0; i + 1 < rows; i++) if (rowClues[i] === 1 && rowClues[i + 1] === 1) return false;
  for (let i = 0; i + 1 < cols; i++) if (colClues[i] === 1 && colClues[i + 1] === 1) return false;
  if (rowClues[0] === 1 || rowClues[rows - 1] === 1) return false;
  if (colClues[start % cols] === 1 || colClues[end % cols] === 1) return false;
  return true;
}
// ── Solver state and propagation ────────────────────────────────────────────
export interface TracksState { e: Int8Array }   // per edge: -1 undecided / 0 / 1

export function initState(p: TracksPuzzle): TracksState {
  const e = new Int8Array(edgeCount(p.rows, p.cols)).fill(UNSET);
  // The board edge never carries rail: the line leaves the board through A and
  // B, which are cells, not through a lattice edge on the rim.
  for (let c = 0; c < p.cols; c++) { e[hIdx(p.rows, p.cols, 0, c)] = 0; e[hIdx(p.rows, p.cols, p.rows, c)] = 0; }
  for (let r = 0; r < p.rows; r++) { e[vIdx(p.rows, p.cols, r, 0)] = 0; e[vIdx(p.rows, p.cols, r, p.cols)] = 0; }
  return { e };
}

export function cloneState(st: TracksState): TracksState {
  return { e: Int8Array.from(st.e) };
}

export interface TracksStep {
  edge: number;
  value: 0 | 1;
  rule: 'row-full' | 'row-needed' | 'col-full' | 'col-needed' | 'cell-full' | 'cell-needed' | 'cell-empty' | 'end-full' | 'connect' | 'refuted';
  reason: string;
}

function cellView(p: TracksPuzzle, st: TracksState, r: number, c: number): {
  on: number; unk: number[]; off: number;
} {
  let on = 0, off = 0;
  const unk: number[] = [];
  for (const e of cellEdges(p.rows, p.cols, r, c)) {
    if (st.e[e] === 1) on++;
    else if (st.e[e] === 0) off++;
    else unk.push(e);
  }
  return { on, unk, off };
}

function setEdge(p: TracksPuzzle, st: TracksState, e: number, v: 0 | 1): boolean {
  const cur = st.e[e];
  if (cur === v) return true;
  if (cur !== UNSET) return false;
  st.e[e] = v;
  return true;
}

/** Masks a cell may legally carry, given what is already decided on its edges. */
function legalMasks(p: TracksPuzzle, st: TracksState, r: number, c: number): number[] {
  const edges = cellEdges(p.rows, p.cols, r, c);
  const idx = ci(p.cols, r, c);
  const isEnd = idx === p.start || idx === p.end;
  const out: number[] = [];
  for (let m = 0; m < 16; m++) {
    const bits = (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1);
    if (isEnd ? bits !== 1 : (bits !== 0 && bits !== 2)) continue;
    let ok = true;
    for (let b = 0; b < 4; b++) {
      const want = (m >> b) & 1;
      const cur = st.e[edges[b]];
      if (cur !== UNSET && cur !== want) { ok = false; break; }
    }
    if (ok) out.push(m);
  }
  return out;
}

function applyMask(p: TracksPuzzle, st: TracksState, r: number, c: number, m: number): boolean {
  const edges = cellEdges(p.rows, p.cols, r, c);
  for (let b = 0; b < 4; b++) {
    if (!setEdge(p, st, edges[b], ((m >> b) & 1) as 0 | 1)) return false;
  }
  return true;
}

/**
 * Connectivity over the rail graph: a cell is only joined to a neighbour when
 * the shared edge carries rail on both sides. A component whose cells all have
 * two joints is a closed loop (the line runs A→B, it never closes); a
 * component that cannot grow has been stranded.
 */
function connectivityPass(
  p: TracksPuzzle, st: TracksState,
  put: (e: number, v: 0 | 1, rule: TracksStep['rule'], reason: string) => boolean,
): { ok: boolean; changed: boolean } {
  const { rows, cols, start, end } = p;
  const total = rows * cols;
  const comp = new Int16Array(total).fill(-1);
  const comps: { cells: number[]; hasA: boolean; hasB: boolean }[] = [];

  for (let i = 0; i < total; i++) {
    if (comp[i] >= 0) continue;
    const r = (i / cols) | 0, c = i % cols;
    const view = cellView(p, st, r, c);
    if (view.on === 0) continue;
    const id = comps.length;
    const cells: number[] = [];
    const stack = [i];
    comp[i] = id;
    let hasA = false, hasB = false;
    while (stack.length) {
      const v = stack.pop()!;
      cells.push(v);
      if (v === start) hasA = true;
      if (v === end) hasB = true;
      const vr = (v / cols) | 0, vc = v % cols;
      for (const link of cellLinks(rows, cols, vr, vc)) {
        if (st.e[link.edge] !== 1 || comp[link.cell] >= 0) continue;
        comp[link.cell] = id;
        stack.push(link.cell);
      }
    }
    comps.push({ cells, hasA, hasB });
  }

  let changed = false;
  for (const compInfo of comps) {
    // NOTE: "can this piece still grow?" is the only loop/strand test. Judging
    // by degree alone is wrong — a fresh square with two joints and undecided
    // neighbours looks closed, but its rail may still continue outward.
    if (compInfo.hasA && compInfo.hasB) {
      if (comps.length > 1) return { ok: false, changed };      // a stray piece survived
      // everything outside the finished line is empty
      for (let i = 0; i < total; i++) {
        if (comp[i] >= 0) continue;
        const r = (i / cols) | 0, c = i % cols;
        for (const e of cellEdges(rows, cols, r, c)) {
          if (st.e[e] !== UNSET) continue;
          if (!put(e, 0, 'connect', 'The A–B line is already complete, so this square stays empty')) return { ok: false, changed };
          changed = true;
        }
      }
      continue;
    }
    // unfinished piece: it must still be able to grow somewhere legal
    let grow = false;
    for (const v of compInfo.cells) {
      const vr = (v / cols) | 0, vc = v % cols;
      for (const link of cellLinks(rows, cols, vr, vc)) {
        if (st.e[link.edge] !== UNSET) continue;
        const ur = (link.cell / cols) | 0, uc = link.cell % cols;
        const uv = cellView(p, st, ur, uc);
        const need = link.cell === start || link.cell === end ? 1 : 2;
        if (uv.on >= need) continue;
        grow = true;
        break;
      }
      if (grow) break;
    }
    if (!grow) return { ok: false, changed };                   // stranded piece
  }
  return { ok: true, changed };
}

/** Propagate to a fixpoint; records every assignment when `steps` is given. */
export function propagate(p: TracksPuzzle, st: TracksState, steps: TracksStep[] | null = null): {
  ok: boolean; used: TracksDeductionLevel[];
} {
  const { rows, cols, rowClues, colClues } = p;
  const total = rows * cols;
  const used: TracksDeductionLevel[] = [];
  const mark = (l: TracksDeductionLevel): void => { if (!used.includes(l)) used.push(l); };

  const put = (e: number, v: 0 | 1, rule: TracksStep['rule'], reason: string): boolean => {
    if (st.e[e] !== UNSET) return true;
    if (!setEdge(p, st, e, v)) return false;
    if (steps) steps.push({ edge: e, value: v, rule, reason });
    return true;
  };

  const mustFill = new Uint8Array(total);

  for (;;) {
    let changed = false;
    mustFill.fill(0);

    // 1. row clues → count squares holding rail; a saturated row empties the
    //    rest, a row with no slack forces every undecided square to hold rail
    for (let r = 0; r < rows; r++) {
      const clue = rowClues[r];
      let filled = 0;
      const maybeCells: number[] = [];
      for (let c = 0; c < cols; c++) {
        const { on, unk } = cellView(p, st, r, c);
        if (on > 0) filled++;
        else if (unk.length > 0) maybeCells.push(c);
      }
      if (filled > clue || filled + maybeCells.length < clue) return { ok: false, used };
      if (maybeCells.length === 0) continue;
      if (filled === clue) {
        mark('sums');
        for (const c of maybeCells) {
          for (const e of cellView(p, st, r, c).unk) {
            if (!put(e, 0, 'row-full', `Row ${r + 1} needs ${clue} square(s) and already has ${filled}`)) return { ok: false, used };
          }
        }
        changed = true;
      } else if (filled + maybeCells.length === clue) {
        mark('sums');
        for (const c of maybeCells) mustFill[ci(cols, r, c)] = 1;
      }
    }

    // 2. column clues, same rules
    for (let c = 0; c < cols; c++) {
      const clue = colClues[c];
      let filled = 0;
      const maybeCells: number[] = [];
      for (let r = 0; r < rows; r++) {
        const { on, unk } = cellView(p, st, r, c);
        if (on > 0) filled++;
        else if (unk.length > 0) maybeCells.push(r);
      }
      if (filled > clue || filled + maybeCells.length < clue) return { ok: false, used };
      if (maybeCells.length === 0) continue;
      if (filled === clue) {
        mark('sums');
        for (const r of maybeCells) {
          for (const e of cellView(p, st, r, c).unk) {
            if (!put(e, 0, 'col-full', `Column ${c + 1} needs ${clue} square(s) and already has ${filled}`)) return { ok: false, used };
          }
        }
        changed = true;
      } else if (filled + maybeCells.length === clue) {
        mark('sums');
        for (const r of maybeCells) mustFill[ci(cols, r, c)] = 1;
      }
    }

    // 3. per-cell degree. `mustFill` is what makes this bite: a square that
    //    MUST hold rail and has only two undecided sides has both of them on.
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = ci(cols, r, c);
        const need = (idx === p.start || idx === p.end) ? 1 : 2;
        const forced = mustFill[idx] === 1;
        const { on, unk } = cellView(p, st, r, c);
        const where = `r${r + 1}c${c + 1}`;
        if (on > need) return { ok: false, used };
        if (unk.length === 0) {
          if (on !== 0 && on !== need) return { ok: false, used };
          continue;
        }
        if (on === need) {
          mark('degree');
          for (const e of unk) if (!put(e, 0, 'cell-full', `${where} already has ${need} rail joint(s)`)) return { ok: false, used };
          changed = true;
        } else if ((on > 0 || forced || need === 1) && on + unk.length === need) {
          mark('degree');
          for (const e of unk) if (!put(e, 1, 'cell-needed', `${where} still needs ${need - on} rail joint(s) and has only ${unk.length} undecided side(s)`)) return { ok: false, used };
          changed = true;
        } else if (on + unk.length < need) {
          if (on > 0) return { ok: false, used };          // stub with nowhere to go
          if (forced) return { ok: false, used };          // must hold rail, cannot reach 2 joints
          mark('degree');
          for (const e of unk) if (!put(e, 0, 'cell-empty', `${where} cannot reach ${need} joints, so it holds no rail`)) return { ok: false, used };
          changed = true;
        }
      }
    }

    // 4. connectivity
    const conn = connectivityPass(p, st, put);
    if (!conn.ok) return { ok: false, used };
    if (conn.changed) { mark('connect'); changed = true; }

    if (!changed) break;
  }
  return { ok: true, used };
}

// ── Counting ────────────────────────────────────────────────────────────────
export function validate(p: TracksPuzzle, edges: Int8Array): { ok: boolean; errors: string[] } {
  const { rows, cols, rowClues, colClues, start, end } = p;
  const total = rows * cols;
  const errors: string[] = [];

  const on = new Int16Array(total);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let n = 0;
      for (const e of cellEdges(rows, cols, r, c)) n += edges[e] === 1 ? 1 : 0;
      on[ci(cols, r, c)] = n;
      const need = ci(cols, r, c) === start || ci(cols, r, c) === end;
      if (need) {
        if (n !== 1) errors.push(`r${r + 1}c${c + 1} is an endpoint and must have exactly 1 rail joint (has ${n})`);
      } else if (n !== 0 && n !== 2) {
        errors.push(`r${r + 1}c${c + 1} has ${n} rail joint(s): a square holds either no rail or exactly 2`);
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    let n = 0;
    for (let c = 0; c < cols; c++) if (on[ci(cols, r, c)] > 0) n++;
    if (n !== rowClues[r]) errors.push(`Row ${r + 1}: ${n} square(s) with rail, clue says ${rowClues[r]}`);
  }
  for (let c = 0; c < cols; c++) {
    let n = 0;
    for (let r = 0; r < rows; r++) if (on[ci(cols, r, c)] > 0) n++;
    if (n !== colClues[c]) errors.push(`Column ${c + 1}: ${n} square(s) with rail, clue says ${colClues[c]}`);
  }

  if (!errors.length) {
    // walk the rail graph from A: everything must be reachable and B must be the far end
    const seen = new Uint8Array(total);
    const stack = [start];
    seen[start] = 1;
    let reach = 0;
    while (stack.length) {
      const v = stack.pop()!;
      reach++;
      const vr = (v / cols) | 0, vc = v % cols;
      for (const link of cellLinks(rows, cols, vr, vc)) {
        if (edges[link.edge] !== 1 || seen[link.cell]) continue;
        seen[link.cell] = 1;
        stack.push(link.cell);
      }
    }
    let track = 0;
    for (let i = 0; i < total; i++) if (on[i] > 0) track++;
    if (reach !== track) errors.push(`The rails split into pieces: ${track - reach} square(s) are not connected to A`);
    if (!seen[end]) errors.push('B is not connected to A');
  }
  return { ok: errors.length === 0, errors };
}

export function hintLookup(p: TracksPuzzle, cellIdx: number): number {
  return p.solutionCells[cellIdx];
}

export function edgeHint(p: TracksPuzzle, edge: number): number {
  return p.solution[edge];
}

/**
 * Count solutions, capped at `limit`. `truncated` means the node budget ran
 * out, i.e. the count is only a lower bound — generation treats that as
 * "unknown" and retries instead of believing the number.
 */
export function countSolutions(p: TracksPuzzle, limit = 2, budget = 60_000): {
  count: number; first: Uint8Array | null; truncated: boolean;
} {
  const root = initState(p);
  if (!propagate(p, root)) return { count: 0, first: null, truncated: false };

  let count = 0;
  let first: Uint8Array | null = null;
  let nodes = 0;
  let truncated = false;

  const dfs = (st: TracksState): boolean => {
    if (++nodes > budget) { truncated = true; return true; }
    if (!propagate(p, st)) return false;

    let pickR = -1, pickC = -1, pickMasks: number[] | null = null;
    for (let r = 0; r < p.rows; r++) {
      for (let c = 0; c < p.cols; c++) {
        const { unk } = cellView(p, st, r, c);
        if (unk.length === 0) continue;
        const masks = legalMasks(p, st, r, c);
        if (masks.length === 0) return false;
        if (!pickMasks || masks.length < pickMasks.length) { pickR = r; pickC = c; pickMasks = masks; }
        if (pickMasks.length === 1) break;
      }
      if (pickMasks && pickMasks.length === 1) break;
    }

    if (!pickMasks) {
      if (validate(p, st.e).ok) {
        count++;
        if (!first) first = Uint8Array.from(st.e);
      }
      return count >= limit;
    }
    for (const m of pickMasks!) {
      const nxt = cloneState(st);
      if (!applyMask(p, nxt, pickR, pickC, m)) continue;
      if (dfs(nxt)) return true;
    }
    return false;
  };

  dfs(root);
  return { count, first, truncated };
}
// ── Explainable solver: propagate, then refute assumptions ──────────────────
/**
 * Same propagation as the counter, but every assignment is recorded — that is
 * exactly what the /solver/ page renders. When propagation stalls we try a
 * refutation step (assume rail / assume no rail and watch the rules explode);
 * that keeps the explanation honest: no guessing is ever shown to the player.
 *
 * `level` is the hardest rule family the puzzle needed, which is the label we
 * ship: sums → easy, degrees/connectivity → medium, refutation → hard.
 */
export function deduce(p: TracksPuzzle, maxRounds = 40, refuteTries = 160): {
  steps: TracksStep[]; solved: boolean; level: TracksDeductionLevel; state: Int8Array;
} {
  const st = initState(p);
  const steps: TracksStep[] = [];
  const families: TracksDeductionLevel[] = [];
  const mark = (l: TracksDeductionLevel): void => { if (!families.includes(l)) families.push(l); };

  const settle = (): boolean => {
    const r = propagate(p, st, steps);
    for (const f of r.used) mark(f);
    return r.ok;
  };

  let ok = settle();
  let rounds = 0;
  while (ok && rounds < maxRounds) {
    let unknown = 0;
    for (let i = 0; i < st.e.length; i++) if (st.e[i] === UNSET) unknown++;
    if (unknown === 0) break;

    let refuted = false;
    let tries = 0;
    for (let e = 0; e < st.e.length && !refuted && tries < refuteTries; e++) {
      if (st.e[e] !== UNSET) continue;
      tries++;
      for (const guess of [1, 0] as const) {
        const trial = cloneState(st);
        setEdge(p, trial, e, guess);
        if (propagate(p, trial).ok) continue;
        setEdge(p, st, e, (guess === 1 ? 0 : 1) as 0 | 1);
        steps.push({
          edge: e, value: (guess === 1 ? 0 : 1) as 0 | 1, rule: 'refuted',
          reason: `Assuming ${guess === 1 ? 'rail' : 'no rail'} on this side leads to a contradiction`,
        });
        mark('refute');
        refuted = true;
        break;
      }
    }
    if (!refuted) break;
    rounds++;
    ok = settle();
  }

  let unknown = 0;
  for (let i = 0; i < st.e.length; i++) if (st.e[i] === UNSET) unknown++;
  const solved = ok && unknown === 0;
  const level: TracksDeductionLevel = !solved
    ? 'stalled'
    : families.includes('refute') ? 'refute'
      : families.includes('degree') || families.includes('connect') ? 'degree'
        : 'sums';
  return { steps, solved, level, state: st.e };
}

// ── Generate ────────────────────────────────────────────────────────────────
export function generate(
  rows: number, cols: number, difficulty: TracksPuzzle['difficulty'],
  seed = Date.now(), naturalClues = true,
): TracksPuzzle {
  let s = (seed >>> 0) || 1;
  const rng = (): number => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  const totalCells = rows * cols;
  const minLen = Math.max(4, Math.round(totalCells * 0.32));
  let fallback: TracksPuzzle | null = null;

  // Big boards find a clue-unique line far less often; a 300-attempt budget on
  // 12×12 means minutes, so cap it and let the caller retry with another seed.
  const maxAttempts = totalCells > 100 ? 50 : 140;
  // Hitting an exact difficulty grade is expensive (the grade only shows up
  // after the puzzle is uniqueness-proved). Spend the first stretch of the
  // budget hunting the requested grade, then take the first accepted puzzle and
  // let its honest grade stand — the label on the shipped board is always the
  // solver's own grade, never what the caller asked for.
  const exactUntil = Math.round(maxAttempts * 0.4);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const strict = naturalClues;
    const start = ci(cols, 0, (rng() * cols) | 0);
    const end = ci(cols, rows - 1, (rng() * cols) | 0);

    const path = makePath(rows, cols, start, end, rng, minLen);
    if (!path) continue;
    const edges = pathToEdges(rows, cols, path);
    const cells = cellsFromEdges(rows, cols, edges);
    const { rowClues, colClues, pathLen } = deriveClues(rows, cols, cells);
    if (strict && !cluesLookNatural(rows, cols, rowClues, colClues, start, end)) continue;

    const candidate: TracksPuzzle = {
      id: `tracks-${rows}x${cols}-${difficulty}-${seed}-${attempt}`,
      rows, cols, rowClues, colClues, start, end,
      solution: edges, solutionCells: cells, pathLen, difficulty,
    };
    const uniq = countSolutions(candidate, 2);
    if (uniq.truncated || uniq.count !== 1) continue;

    const d = deduce(candidate);
    if (!d.solved) continue;
    const label: TracksPuzzle['difficulty'] =
      d.level === 'sums' ? 'easy' : d.level === 'degree' ? 'medium' : 'hard';
    const graded = { ...candidate, difficulty: label };
    if (label === difficulty) return graded;
    if (!fallback) fallback = graded;
    else if (attempt >= exactUntil) return fallback;
  }
  if (fallback) return fallback;
  throw new Error(`tracks: no puzzle for ${rows}x${cols} ${difficulty}`);
}
