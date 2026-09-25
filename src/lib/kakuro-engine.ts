/**
 * GridPaw — Kakuro Puzzle Engine
 *
 * Rules:
 * 1. Grid with clue border: row 0 and col 0 are always black (clue cells)
 * 2. White cells: fill digits 1-9
 * 3. Each horizontal/vertical white run must sum to its clue
 * 4. Digits never repeat within a run
 *
 * Encoding (flat arrays, rows*cols):
 * - white[i]: true = playable white cell
 * - rightSum[i]: clue on black cell — sum of the horizontal run starting to its right (0 = none)
 * - downSum[i]:  clue on black cell — sum of the vertical run starting below it (0 = none)
 * - solution[i]: digit for white cells (0 = black cell), filled by generator/tutorial def
 *
 * Grid encoding note (skill rule): digits live in 1..9; 0 means "not a digit"
 * and doubles as the black/empty marker — white cells never share values with
 * clue digits because clues are stored in separate arrays, not in the digit grid.
 */

// =============================================================================
// Types
// =============================================================================

export interface KakuroPuzzle {
  rows: number; // full grid rows (interior + 1 border each side)
  cols: number;
  white: boolean[]; // rows*cols
  rightSum: number[]; // rows*cols, 0 = not a clue cell
  downSum: number[]; // rows*cols
  solution: number[]; // digits on white cells (0 on black)
  difficulty?: string;
  fogSplit?: number; // grid line of the full-black splitter (col for 'v' axis, row for 'h')
  fogAxis?: 'v' | 'h'; // fog splitter orientation
}

export interface KakuroRun {
  dir: 'h' | 'v';
  sum: number;
  cells: number[]; // flat white-cell indices
  clueIdx: number; // flat index of the black cell carrying the clue
}

export interface KakuroSolveResult {
  count: number;
  solution: number[] | null; // first solution found (digits on white cells)
  solutions?: number[][]; // up to maxCount solutions (for debugging/repair)
}

export interface KakuroRequiredRun {
  dir: 'h' | 'v';
  len: number;
  sum: number;
}

export interface KakuroTutorialDef {
  id: string;
  title: string;
  lesson: string;
  pattern: string[]; // interior rows: '.' = white, '#' = black
  requiredRuns?: KakuroRequiredRun[]; // teaching anchors: fills must contain these runs
  maxAttempts?: number;
}

// =============================================================================
// RNG (mulberry32) — same pattern as daily-challenge seeding
// =============================================================================

export function makeRng(seed?: number): () => number {
  let s = (seed === undefined ? Date.now() : seed) >>> 0;
  if (s === 0) s = 0x9e3779b9;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ri(rng: () => number, n: number): number {
  return Math.floor(rng() * n);
}

function shuffledDigits(rng: () => number): number[] {
  const d = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = d.length - 1; i > 0; i--) {
    const j = ri(rng, i + 1);
    const t = d[i];
    d[i] = d[j];
    d[j] = t;
  }
  return d;
}

// =============================================================================
// Geometry: runs
// =============================================================================

export function cellIdx(p: { cols: number }, r: number, c: number): number {
  return r * p.cols + c;
}

/** Geometric white runs (no sums): every white run with the black cell before/above it. */
export function whiteRuns(p: { rows: number; cols: number; white: boolean[] }): KakuroRun[] {
  const runs: KakuroRun[] = [];
  // horizontal
  for (let r = 0; r < p.rows; r++) {
    let c = 1;
    while (c < p.cols) {
      if (p.white[cellIdx(p, r, c)]) {
        const clueIdx = cellIdx(p, r, c - 1);
        const cells: number[] = [];
        while (c < p.cols && p.white[cellIdx(p, r, c)]) {
          cells.push(cellIdx(p, r, c));
          c++;
        }
        runs.push({ dir: 'h', sum: 0, cells, clueIdx });
      } else {
        c++;
      }
    }
  }
  // vertical
  for (let c = 1; c < p.cols; c++) {
    let r = 1;
    while (r < p.rows) {
      if (p.white[cellIdx(p, r, c)]) {
        const clueIdx = cellIdx(p, r - 1, c);
        const cells: number[] = [];
        while (r < p.rows && p.white[cellIdx(p, r, c)]) {
          cells.push(cellIdx(p, r, c));
          r++;
        }
        runs.push({ dir: 'v', sum: 0, cells, clueIdx });
      } else {
        r++;
      }
    }
  }
  return runs;
}

/** All runs with clue sums read from the puzzle. Runs without a clue are invalid (sum 0). */
export function computeRuns(p: KakuroPuzzle): KakuroRun[] {
  const runs = whiteRuns(p);
  for (const run of runs) {
    run.sum = run.dir === 'h' ? p.rightSum[run.clueIdx] : p.downSum[run.clueIdx];
  }
  return runs;
}

// =============================================================================
// Solver — constraint propagation via run bounds + MRV-ish cell order
// =============================================================================

/** Reachable-sum bounds for a run, computed from its AVAILABLE digits — exact, not loose. */
function runFeasible(t: RunTally): boolean {
  if (t.count < 0 || t.sum < 0) return false;
  if (t.count === 0) return t.sum === 0;
  let min = 0;
  let max = 0;
  let needMin = t.count;
  let needMax = t.count;
  for (let d = 1; d <= 9; d++) {
    if (t.mask & (1 << d)) continue;
    if (needMin > 0) {
      min += d;
      needMin--;
    }
  }
  for (let d = 9; d >= 1; d--) {
    if (t.mask & (1 << d)) continue;
    if (needMax > 0) {
      max += d;
      needMax--;
    }
  }
  if (needMin > 0 || needMax > 0) return false; // not enough distinct digits left
  return t.sum >= min && t.sum <= max;
}

interface RunTally {
  sum: number; // remaining sum
  mask: number; // bitmask of used digits (bit d = digit d)
  count: number; // remaining unfilled cells
}

interface SearchCtx {
  cellOrder: number[];
  hRunOf: number[]; // per cell (flat idx) → h run index, -1 n/a (cells are always in an h run)
  vRunOf: number[];
  hTally: RunTally[];
  vTally: RunTally[];
  assign: number[]; // flat → digit (0 unfilled)
  digitOrder: number[];
  maxCount: number;
  count: number;
  first: number[] | null;
  nodes: number;
  maxNodes: number; // 0 = unlimited
  aborted: boolean;
  all: number[][];
}

/** Pick the unfilled cell with the fewest legal digits (dynamic MRV). -1 = all filled. */
function selectCell(ctx: SearchCtx): number {
  let best = -1;
  let bestCount = 10;
  for (const ci of ctx.cellOrder) {
    if (ctx.assign[ci]) continue;
    const ht = ctx.hTally[ctx.hRunOf[ci]];
    const vt = ctx.vTally[ctx.vRunOf[ci]];
    let cands = 0;
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      if (ht.mask & bit || vt.mask & bit) continue;
      ht.sum -= d;
      ht.count--;
      vt.sum -= d;
      vt.count--;
      const ok = runFeasible(ht) && runFeasible(vt);
      ht.sum += d;
      ht.count++;
      vt.sum += d;
      vt.count++;
      if (ok) {
        cands++;
        if (cands >= bestCount) break;
      }
    }
    if (cands === 0) return ci; // dead end — fail this branch here
    if (cands < bestCount) {
      bestCount = cands;
      best = ci;
      if (cands === 1) break;
    }
  }
  return best;
}

function search(ctx: SearchCtx, depth: number): void {
  if (ctx.count >= ctx.maxCount || ctx.aborted) return;
  ctx.nodes++;
  if (ctx.maxNodes > 0 && ctx.nodes > ctx.maxNodes) {
    ctx.aborted = true;
    return;
  }
  const ci = selectCell(ctx);
  if (ci === -1) {
    ctx.count++;
    if (ctx.first === null) ctx.first = ctx.assign.slice();
    if (ctx.all.length < ctx.maxCount) ctx.all.push(ctx.assign.slice());
    return;
  }
  const ht = ctx.hTally[ctx.hRunOf[ci]];
  const vt = ctx.vTally[ctx.vRunOf[ci]];
  for (const d of ctx.digitOrder) {
    const bit = 1 << d;
    if (ht.mask & bit || vt.mask & bit) continue;
    ht.sum -= d;
    ht.mask |= bit;
    ht.count--;
    vt.sum -= d;
    vt.mask |= bit;
    vt.count--;
    if (runFeasible(ht) && runFeasible(vt)) {
      ctx.assign[ci] = d;
      search(ctx, depth + 1);
      ctx.assign[ci] = 0;
      if (ctx.aborted) {
        // unwind placement bookkeeping before bailing out
        ht.sum += d;
        ht.mask &= ~bit;
        ht.count++;
        vt.sum += d;
        vt.mask &= ~bit;
        vt.count++;
        return;
      }
    }
    ht.sum += d;
    ht.mask &= ~bit;
    ht.count++;
    vt.sum += d;
    vt.mask &= ~bit;
    vt.count++;
    if (ctx.count >= ctx.maxCount || ctx.aborted) return;
  }
}

function makeCtx(
  h: KakuroRun[],
  v: KakuroRun[],
  p: { rows: number; cols: number; white: boolean[] },
  digitOrder: number[],
  maxCount: number
): SearchCtx {
  const total = p.rows * p.cols;
  const hRunOf = new Array<number>(total).fill(-1);
  const vRunOf = new Array<number>(total).fill(-1);
  h.forEach((run, i) => run.cells.forEach((ci) => (hRunOf[ci] = i)));
  v.forEach((run, i) => run.cells.forEach((ci) => (vRunOf[ci] = i)));
  const cells: number[] = [];
  for (const run of h) cells.push(...run.cells);
  // MRV-ish static order: fewest run-mates first
  const mates = (ci: number) =>
    h[hRunOf[ci]].cells.length - 1 + v[vRunOf[ci]].cells.length - 1;
  cells.sort((a, b) => mates(a) - mates(b) || a - b);
  return {
    cellOrder: cells,
    hRunOf,
    vRunOf,
    hTally: h.map((r) => ({ sum: r.sum, mask: 0, count: r.cells.length })),
    vTally: v.map((r) => ({ sum: r.sum, mask: 0, count: r.cells.length })),
    assign: new Array<number>(total).fill(0),
    digitOrder,
    maxCount,
    count: 0,
    first: null,
    nodes: 0,
    maxNodes: 0,
    aborted: false,
    all: [],
  };
}

/**
 * Count solutions (up to maxCount) of a fully-clued puzzle.
 * maxCount=2 → uniqueness check (count===1 means unique).
 * maxNodes bounds the search; exceeding it returns count=-1 (unproven, not
 * "no solution") so generators can skip hard-to-prove fills.
 */
export function solveKakuro(p: KakuroPuzzle, maxCount = 2, maxNodes = 200000): KakuroSolveResult {
  const runs = computeRuns(p);
  if (runs.length === 0) {
    return { count: 0, solution: null }; // degenerate: no white cells
  }
  for (const run of runs) {
    if (run.sum <= 0 || run.cells.length < 1) {
      return { count: 0, solution: null }; // malformed puzzle
    }
  }
  const h = runs.filter((r) => r.dir === 'h');
  const v = runs.filter((r) => r.dir === 'v');
  const ctx = makeCtx(h, v, p, [1, 2, 3, 4, 5, 6, 7, 8, 9], maxCount);
  ctx.maxNodes = maxNodes;
  search(ctx, 0);
  return { count: ctx.aborted ? -1 : ctx.count, solution: ctx.first, solutions: ctx.all };
}

// =============================================================================
// Validation helpers (player-facing)
// =============================================================================

/**
 * Check a player fill against all clues. digits: flat array (0 = empty).
 * Returns true iff every white cell is filled 1-9, every run sums to its clue,
 * and no run contains duplicate digits.
 */
export function checkKakuroWin(p: KakuroPuzzle, digits: number[]): boolean {
  for (let i = 0; i < p.rows * p.cols; i++) {
    if (p.white[i] && (digits[i] < 1 || digits[i] > 9)) return false;
  }
  for (const run of computeRuns(p)) {
    let sum = 0;
    let mask = 0;
    for (const ci of run.cells) {
      const d = digits[ci];
      if (d < 1 || d > 9) return false;
      sum += d;
      if (mask & (1 << d)) return false; // duplicate in run
      mask |= 1 << d;
    }
    if (sum !== run.sum) return false;
  }
  return true;
}

/**
 * Error type for a single cell's current digit (0 = no error):
 * 'dup' — digit already used in one of its runs
 * 'over' — its run's partial sum already exceeds the clue
 */
export function getCellError(p: KakuroPuzzle, digits: number[], i: number): '' | 'dup' | 'over' {
  const d = digits[i];
  if (!p.white[i] || d < 1) return '';
  const runs = computeRuns(p);
  for (const run of runs) {
    if (run.cells.indexOf(i) === -1) continue;
    let sum = 0;
    let mask = 0;
    for (const ci of run.cells) {
      const cd = digits[ci];
      if (cd >= 1) {
        sum += cd;
        if (mask & (1 << cd)) {
          if (ci === i || d === cd) return 'dup';
        }
        mask |= 1 << cd;
      }
    }
    if (sum > run.sum) return 'over';
  }
  return '';
}

// =============================================================================
// Generator
// =============================================================================

export interface KakuroGenOptions {
  rows: number; // interior playable rows (grid = rows+1 x cols+1)
  cols: number;
  blackProb?: number; // probability a random interior cell starts as black
  seed?: number;
  maxLayoutAttempts?: number;
  maxFillAttempts?: number;
  requireUnique?: boolean; // default true
  timeBudgetMs?: number; // default 3000
  fogBlocks?: number; // 2 = force a splitter column and require per-block unique solvability
}

interface InteriorLayout {
  white: boolean[]; // rows*cols interior-only flat
}

/** Random layout with all runs >= 2 cells and connected whites. null = attempt failed. */
function randomLayout(
  rows: number,
  cols: number,
  blackProb: number,
  rng: () => number
): InteriorLayout | null {
  const total = rows * cols;
  const white = new Array<boolean>(total);
  for (let i = 0; i < total; i++) white[i] = rng() >= blackProb;

  const fixSingleRuns = (): boolean => {
    // returns true if stable (no single-length runs)
    for (let iter = 0; iter < 14; iter++) {
      let changed = false;
      // horizontal singles
      for (let r = 0; r < rows; r++) {
        let c = 0;
        while (c < cols) {
          if (white[r * cols + c]) {
            let end = c;
            while (end < cols && white[r * cols + end]) end++;
            const len = end - c;
            if (len === 1) {
              white[r * cols + c] = false;
              changed = true;
            }
            c = end;
          } else c++;
        }
      }
      // vertical singles
      for (let c = 0; c < cols; c++) {
        let r = 0;
        while (r < rows) {
          if (white[r * cols + c]) {
            let end = r;
            while (end < rows && white[end * cols + c]) end++;
            const len = end - r;
            if (len === 1) {
              white[r * cols + c] = false;
              changed = true;
            }
            r = end;
          } else r++;
        }
      }
      if (!changed) return true;
    }
    return false;
  };

  if (!fixSingleRuns()) return null;

  // connectivity: keep only the largest white component
  const comp = new Array<number>(total).fill(-1);
  let nComp = 0;
  const sizes: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!white[i] || comp[i] !== -1) continue;
    let size = 0;
    const stack = [i];
    comp[i] = nComp;
    while (stack.length) {
      const cur = stack.pop() as number;
      size++;
      const r = Math.floor(cur / cols);
      const c = cur % cols;
      const nb = [
        r > 0 ? cur - cols : -1,
        r < rows - 1 ? cur + cols : -1,
        c > 0 ? cur - 1 : -1,
        c < cols - 1 ? cur + 1 : -1,
      ];
      for (const n of nb) {
        if (n >= 0 && white[n] && comp[n] === -1) {
          comp[n] = nComp;
          stack.push(n);
        }
      }
    }
    sizes.push(size);
    nComp++;
  }
  if (nComp === 0) return null;
  if (nComp > 1) {
    let big = 0;
    for (let i = 1; i < nComp; i++) if (sizes[i] > sizes[big]) big = i;
    for (let i = 0; i < total; i++) if (white[i] && comp[i] !== big) white[i] = false;
    if (!fixSingleRuns()) return null;
  }

  let nWhite = 0;
  for (let i = 0; i < total; i++) if (white[i]) nWhite++;
  if (nWhite < Math.max(6, total * 0.4)) return null;

  return { white };
}

/**
 * Random valid digit fill (distinct digits per run, no sum targets — sums come later).
 * Uses DFS with shuffled digit order. Returns null if the layout is unsatisfiable
 * (practically never for run-length>=2 layouts, but guard anyway).
 */
/** All combos of `len` distinct digits 1-9 summing to `sum`. */
export function digitCombos(len: number, sum: number): number[][] {
  const out: number[][] = [];
  const rec = (start: number, left: number, sumLeft: number, acc: number[]) => {
    if (left === 0) {
      if (sumLeft === 0) out.push(acc.slice());
      return;
    }
    for (let d = start; d <= 9; d++) {
      if (d > sumLeft) break;
      acc.push(d);
      rec(d + 1, left - 1, sumLeft - d, acc);
      acc.pop();
    }
  };
  rec(1, len, sum, []);
  return out;
}

function randomFill(
  layout: InteriorLayout,
  rows: number,
  cols: number,
  rng: () => number,
  preset?: Record<number, number>
): number[] | null {
  // whiteRuns expects a bordered grid — build one around the interior layout,
  // then map run cells back to interior indices.
  const R = rows + 1;
  const C = cols + 1;
  const w2 = new Array<boolean>(R * C).fill(false);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (layout.white[r * cols + c]) w2[(r + 1) * C + (c + 1)] = true;
    }
  }
  const runs = whiteRuns({ rows: R, cols: C, white: w2 });
  const runsOfInterior: number[][] = new Array(rows * cols);
  const cells: number[] = [];
  runs.forEach((run, i) =>
    run.cells.forEach((gi) => {
      const r = Math.floor(gi / C) - 1;
      const c = (gi % C) - 1;
      const ii = r * cols + c;
      if (!runsOfInterior[ii]) {
        runsOfInterior[ii] = [];
        cells.push(ii); // dedupe: each interior cell appears in one h + one v run
      }
      runsOfInterior[ii].push(i);
    })
  );
  // most-constrained first
  const sorted = cells
    .slice()
    .sort((a, b) => runsOfInterior[a].length - runsOfInterior[b].length || a - b);
  const masks = new Array<number>(runs.length).fill(0);
  const fill = new Array<number>(rows * cols).fill(0);
  // apply preset digits first (they seed the run masks and are skipped by the DFS)
  if (preset) {
    for (const [iiStr, d] of Object.entries(preset)) {
      const ii = Number(iiStr);
      fill[ii] = d;
      for (const ri2 of runsOfInterior[ii]) masks[ri2] |= 1 << d;
    }
  }
  const sortedFree = preset
    ? sorted.filter((ii) => !preset[ii])
    : sorted;

  const dfs = (pos: number): boolean => {
    if (pos === sortedFree.length) return true;
    const ii = sortedFree[pos];
    const runIds = runsOfInterior[ii];
    const digitOrder = shuffledDigits(rng);
    for (const d of digitOrder) {
      const bit = 1 << d;
      let ok = true;
      for (const ri2 of runIds) if (masks[ri2] & bit) { ok = false; break; }
      if (!ok) continue;
      for (const ri2 of runIds) masks[ri2] |= bit;
      fill[ii] = d;
      if (dfs(pos + 1)) return true;
      fill[ii] = 0;
      for (const ri2 of runIds) masks[ri2] &= ~bit;
    }
    return false;
  };

  return dfs(0) ? fill : null;
}

/** Build a full puzzle (with clue border) from an interior white map + digit fill. */
function buildPuzzle(
  interiorWhite: boolean[],
  fill: number[] | null,
  rows: number,
  cols: number,
  difficulty?: string
): KakuroPuzzle {
  const R = rows + 1;
  const C = cols + 1;
  const white = new Array<boolean>(R * C).fill(false);
  const rightSum = new Array<number>(R * C).fill(0);
  const downSum = new Array<number>(R * C).fill(0);
  const solution = new Array<number>(R * C).fill(0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (interiorWhite[r * cols + c]) {
        white[(r + 1) * C + (c + 1)] = true;
        if (fill) solution[(r + 1) * C + (c + 1)] = fill[r * cols + c];
      }
    }
  }
  const p: KakuroPuzzle = { rows: R, cols: C, white, rightSum, downSum, solution, difficulty };
  // derive clues from the fill (solution is grid-indexed and already filled above)
  for (const run of whiteRuns({ rows: R, cols: C, white })) {
    const sum = run.cells.reduce((acc, ci) => acc + solution[ci], 0);
    if (run.dir === 'h') rightSum[run.clueIdx] = sum;
    else downSum[run.clueIdx] = sum;
  }
  return p;
}

/**
 * Repair loop: random fills of a layout almost always carry "rectangle trade"
 * ambiguities (two rows/cols swapping a digit pair). Perturb the fill by
 * swapping a cell where solution #2 differs, keep run-distinctness, re-count.
 * Returns a unique puzzle or null (budget exhausted).
 */
function repairToUnique(
  interiorWhite: boolean[],
  fill: number[],
  rows: number,
  cols: number,
  rng: () => number,
  difficulty?: string,
  maxIters?: number,
  protectedInterior?: number[] // cells whose run-sums must not change (teaching anchors)
): KakuroPuzzle | null {
  const cur = fill.slice();
  const iters = maxIters || Math.max(60, rows * cols * 3);
  const prot = new Set<number>(protectedInterior || []);

  // static run structure (layout fixed): bordered grid runs
  const R = rows + 1;
  const C = cols + 1;
  const w2 = new Array<boolean>(R * C).fill(false);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (interiorWhite[r * cols + c]) w2[(r + 1) * C + (c + 1)] = true;
    }
  }
  const runs = whiteRuns({ rows: R, cols: C, white: w2 });
  const runsOf: number[][] = new Array(rows * cols);
  runs.forEach((run, i) =>
    run.cells.forEach((gi) => {
      const r = Math.floor(gi / C) - 1;
      const c = (gi % C) - 1;
      const ii = r * cols + c;
      if (!runsOf[ii]) runsOf[ii] = [];
      runsOf[ii].push(i);
    })
  );

  const distinctOk = (ii: number, jj: number): boolean => {
    const ids = [...new Set([...(runsOf[ii] || []), ...(runsOf[jj] || [])])];
    for (const ri of ids) {
      let mask = 0;
      for (const gi of runs[ri].cells) {
        const r = Math.floor(gi / C) - 1;
        const c = (gi % C) - 1;
        const d = cur[r * cols + c];
        if (mask & (1 << d)) return false;
        mask |= 1 << d;
      }
    }
    return true;
  };

  for (let iter = 0; iter < iters; iter++) {
    const p = buildPuzzle(interiorWhite, cur, rows, cols, difficulty);
    const res = solveKakuro(p, 2);
    if (res.count === 1) return p;
    const s2 =
      res.count === 2 && res.solutions && res.solutions.length >= 2 ? res.solutions[1] : null;

    if (s2) {
      // differing cells (grid-flat s2 → interior)
      const diff: number[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ii = r * cols + c;
          if (interiorWhite[ii] && cur[ii] !== s2[(r + 1) * C + (c + 1)]) diff.push(ii);
        }
      }
      if (diff.length === 0) return null;
      const freeDiff = diff.filter((d) => !prot.has(d));
      if (!freeDiff.length) return null; // only anchor cells differ — cannot repair
      // targeted swap: collect all swaps that provably invalidate s2, pick one at
      // random (deterministic first-pick oscillates); fallback to random walk
      const breaking: { ii: number; jj: number }[] = [];
      for (const ii of freeDiff) {
        const ids = runsOf[ii] || [];
        for (const rid of ids) {
          const run = runs[rid];
          for (const gi of run.cells) {
            const r = Math.floor(gi / C) - 1;
            const c = (gi % C) - 1;
            const jj = r * cols + c;
            if (jj === ii || prot.has(jj)) continue;
            const tmp = cur[ii];
            cur[ii] = cur[jj];
            cur[jj] = tmp;
            if (distinctOk(ii, jj)) {
              // s2 breaks iff some affected run's cur-sum ≠ s2-sum after the swap
              const affected = [...new Set([...(runsOf[ii] || []), ...(runsOf[jj] || [])])];
              let breaks = false;
              for (const ar of affected) {
                let sSum = 0;
                let cSum = 0;
                for (const gi2 of runs[ar].cells) {
                  sSum += s2[gi2];
                  const rr = Math.floor(gi2 / C) - 1;
                  const cc = (gi2 % C) - 1;
                  cSum += cur[rr * cols + cc];
                }
                if (sSum !== cSum) {
                  breaks = true;
                  break;
                }
              }
              if (breaks) breaking.push({ ii, jj });
            }
            cur[jj] = cur[ii];
            cur[ii] = tmp;
          }
        }
      }
      if (breaking.length) {
        const pick = breaking[ri(rng, breaking.length)];
        const tmp = cur[pick.ii];
        cur[pick.ii] = cur[pick.jj];
        cur[pick.jj] = tmp;
        continue;
      }
    }

    // random walk (no s2 — abort/contradiction — or no breaking swap found)
    {
      const allFree: number[] = [];
      for (let ii = 0; ii < rows * cols; ii++) {
        if (interiorWhite[ii] && !prot.has(ii) && (runsOf[ii] || []).length) allFree.push(ii);
      }
      if (!allFree.length) return null;
      for (let attempt = 0; attempt < 6; attempt++) {
        const ii = allFree[ri(rng, allFree.length)];
        const ids = runsOf[ii] || [];
        const run = runs[ids[ri(rng, ids.length)]];
        const mates: number[] = [];
        for (const gi of run.cells) {
          const r = Math.floor(gi / C) - 1;
          const c = (gi % C) - 1;
          const jj = r * cols + c;
          if (jj !== ii && !prot.has(jj)) mates.push(jj);
        }
        if (!mates.length) continue;
        const jj = mates[ri(rng, mates.length)];
        const tmp = cur[ii];
        cur[ii] = cur[jj];
        cur[jj] = tmp;
        if (distinctOk(ii, jj)) break;
        // revert and retry
        cur[jj] = cur[ii];
        cur[ii] = tmp;
      }
    }
  }
  return null;
}

/** Fog block membership: [blockA, blockB] as grid-flat indices. Requires p.fogSplit. */
export function fogBlockCells(p: KakuroPuzzle): number[][] {
  if (p.fogSplit === undefined) return [[], []];
  const vertical = p.fogAxis !== 'h';
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < p.white.length; i++) {
    if (!p.white[i]) continue;
    const line = vertical ? i % p.cols : Math.floor(i / p.cols);
    (line < p.fogSplit ? a : b).push(i);
  }
  return [a, b];
}

/**
 * Generate a unique-solution kakuro puzzle.
 * Returns null if all attempts fail (caller should retry with a new seed).
 */
export function generateKakuroPuzzle(opts: KakuroGenOptions): KakuroPuzzle | null {
  const blackProb = opts.blackProb === undefined ? 0.2 : opts.blackProb;
  const rng = makeRng(opts.seed);
  const maxLayout = opts.maxLayoutAttempts || 40;
  const maxFill = opts.maxFillAttempts || 20;
  const requireUnique = opts.requireUnique !== false;
  const started = Date.now();
  const timeBudget = opts.timeBudgetMs || 3000;
  const fogMode = opts.fogBlocks === 2;

  for (let la = 0; la < maxLayout; la++) {
    if (Date.now() - started > timeBudget) return null;
    if (fogMode) {
      // Fog = two independent standard puzzles joined by a full-black splitter
      // (zero shared runs → whole-board uniqueness follows from per-block uniqueness).
      // 7x7 → vertical split (3+3 cols); 6x6 → horizontal split (3+3 rows).
      const vertical = opts.cols >= 7;
      const base = (opts.seed === undefined ? Date.now() : opts.seed) + la * 7919;
      const blockProb = Math.max(opts.blackProb, 0.26);
      const pW = vertical
        ? generateKakuroPuzzle({ rows: opts.rows, cols: Math.floor(opts.cols / 2), blackProb: blockProb, seed: base, timeBudgetMs: timeBudget })
        : generateKakuroPuzzle({ rows: Math.floor(opts.rows / 2), cols: opts.cols, blackProb: blockProb, seed: base, timeBudgetMs: timeBudget });
      if (!pW) continue;
      const pE = vertical
        ? generateKakuroPuzzle({ rows: opts.rows, cols: opts.cols - Math.floor(opts.cols / 2) - 1, blackProb: blockProb, seed: base + 104729, timeBudgetMs: timeBudget })
        : generateKakuroPuzzle({ rows: opts.rows - Math.floor(opts.rows / 2) - 1, cols: opts.cols, blackProb: blockProb, seed: base + 104729, timeBudgetMs: timeBudget });
      if (!pE) continue;
      return vertical
        ? mergeFogHalves(pW, pE, opts.rows, opts.cols, Math.floor(opts.cols / 2), 'v', 'seeded-fog')
        : mergeFogHalves(pW, pE, opts.rows, opts.cols, Math.floor(opts.rows / 2), 'h', 'seeded-fog');
    }
    const layout = randomLayout(opts.rows, opts.cols, blackProb, rng);
    if (!layout) continue;
    for (let fa = 0; fa < maxFill; fa++) {
      if (Date.now() - started > timeBudget) return null;
      const fill = randomFill(layout, opts.rows, opts.cols, rng);
      if (!fill) continue;
      const p = repairToUnique(layout.white, fill, opts.rows, opts.cols, rng, opts.seed === undefined ? undefined : 'seeded');
      if (p) return p;
    }
  }
  return null;
}

/**
 * Join two independently-unique block puzzles with a full-black splitter line
 * (axis 'v': splitter column; axis 'h': splitter row). Zero shared runs across
 * the splitter, so the merged puzzle's solution set is the product of the
 * blocks' — per-block uniqueness ⇒ whole-board uniqueness.
 */
function mergeFogHalves(
  pW: KakuroPuzzle,
  pE: KakuroPuzzle,
  rows: number,
  cols: number,
  splitInt: number, // interior index (col for 'v', row for 'h') of the splitter
  axis: 'v' | 'h',
  difficulty?: string
): KakuroPuzzle {
  const R = rows + 1;
  const C = cols + 1;
  const white = new Array<boolean>(R * C).fill(false);
  const solution = new Array<number>(R * C).fill(0);
  const rightSum = new Array<number>(R * C).fill(0);
  const downSum = new Array<number>(R * C).fill(0);
  const copyBlock = (src: KakuroPuzzle, dr: number, dc: number) => {
    for (let r = 0; r < src.rows; r++) {
      for (let c = 0; c < src.cols; c++) {
        const gi = r * src.cols + c;
        // copy white cells AND black clue cells (they carry the run sums)
        if (!src.white[gi] && !src.rightSum[gi] && !src.downSum[gi]) continue;
        const ti = (r + dr) * C + (c + dc);
        white[ti] = src.white[gi];
        solution[ti] = src.solution[gi];
        rightSum[ti] = src.rightSum[gi];
        downSum[ti] = src.downSum[gi];
      }
    }
  };
  if (axis === 'v') {
    copyBlock(pW, 0, 0);                       // west: grid cols 1..westCols
    copyBlock(pE, 0, splitInt + 1);            // east: clue border lands on the splitter column
  } else {
    copyBlock(pW, 0, 0);                       // top: grid rows 1..splitRows
    copyBlock(pE, splitInt + 1, 0);            // bottom: clue border lands on the splitter row
  }
  return {
    rows: R,
    cols: C,
    white,
    rightSum,
    downSum,
    solution,
    difficulty,
    fogSplit: splitInt + 1, // grid line (col for 'v', row for 'h')
    fogAxis: axis,
  };
}

// =============================================================================
// Tutorial levels — fixed boards, every board MUST pass solveKakuro count===1
// (enforced by scripts/selftest-kakuro.mjs; do not edit solutions casually)
//
// Pedagogy: one concept per board, escalating.
//   t1: what a clue means (sum of the run) — smallest board
//   t2: the scary rule — no repeats: 4 in 2 cells is 1+3, NEVER 2+2
//   t3: extreme sums force combos — 17 in 2 cells must be 8+9
//   t4: combine + scale up
// =============================================================================

export const KAKURO_TUTORIALS: KakuroTutorialDef[] = [
  {
    id: 't1',
    title: 'Clues are sums',
    lesson:
      'Each clue is the SUM of the white run beside or below it. The top row must sum to 4 — two cells. Try digits and watch the clues: cross clues pin every digit down.',
    pattern: ['..#', '..#'],
    requiredRuns: [{ dir: 'h', len: 2, sum: 4 }],
  },
  {
    id: 't2',
    title: 'No repeats',
    lesson:
      'Digits never repeat inside a run. The top-left run sums to 4 with two cells — 2+2 would add up, but repeats are banned: it must be 1+3.',
    pattern: ['..#', '...', '#..'],
    requiredRuns: [{ dir: 'h', len: 2, sum: 4 }],
  },
  {
    id: 't3',
    title: 'Extreme sums',
    lesson:
      'Extreme clues pin combos down. A 2-cell run of 17 can ONLY be 8+9 — no other pair of distinct digits gets that high. Watch for 3, 4, 16, 17: they fix digits immediately.',
    pattern: ['..#', '...', '...'],
    requiredRuns: [{ dir: 'h', len: 2, sum: 17 }],
  },
  {
    id: 't4',
    title: 'Put it together',
    lesson:
      'Bigger board, same three rules: runs sum to their clue, digits 1-9, no repeats. The row summing to 10 can only be 1+2+3+4 — start there.',
    pattern: ['..##', '..##', '....', '#...'],
    requiredRuns: [{ dir: 'h', len: 4, sum: 10 }],
  },
];

/**
 * Build a tutorial puzzle: fixed layout, random fill at runtime, filtered by
 * teaching anchors (requiredRuns) + solver uniqueness. Deterministic with seed.
 */
export function generateTutorialPuzzle(def: KakuroTutorialDef, seed?: number): KakuroPuzzle | null {
  const rows = def.pattern.length;
  const cols = def.pattern[0].length;
  const interiorWhite = new Array<boolean>(rows * cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) interiorWhite[r * cols + c] = def.pattern[r][c] !== '#';
  }
  const rng = makeRng(seed);
  const attempts = def.maxAttempts || 400;
  const started = Date.now();
  const timeBudget = 1500; // ms

  // protected cells: all cells of the first run matching each requiredRun (dir+len) —
  // repairToUnique never touches them, so teaching anchors survive by construction
  const R = rows + 1;
  const C = cols + 1;
  const w2 = new Array<boolean>(R * C).fill(false);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (interiorWhite[r * cols + c]) w2[(r + 1) * C + (c + 1)] = true;
    }
  }
  const runs = whiteRuns({ rows: R, cols: C, white: w2 });
  const protectedInterior: number[] = [];
  const anchorSpecs: { req: KakuroRequiredRun; cells: number[] }[] = [];
  for (const req of def.requiredRuns || []) {
    const run = runs.find((r) => r.dir === req.dir && r.cells.length === req.len);
    if (!run) return null; // pattern cannot host this anchor
    const cells: number[] = [];
    for (const gi of run.cells) {
      const r = Math.floor(gi / C) - 1;
      const c = (gi % C) - 1;
      const ii = r * cols + c;
      protectedInterior.push(ii);
      cells.push(ii);
    }
    anchorSpecs.push({ req, cells });
  }

  for (let i = 0; i < attempts; i++) {
    if (Date.now() - started > timeBudget) return null;
    // seed each anchor run with a random valid combo (order shuffled) so its
    // sum is the teaching value from birth; repair never touches these cells
    const preset: Record<number, number> = {};
    let presetOk = true;
    for (const spec of anchorSpecs) {
      const combos = digitCombos(spec.req.len, spec.req.sum);
      if (!combos.length) { presetOk = false; break; }
      const combo = combos[ri(rng, combos.length)].slice();
      for (let k = combo.length - 1; k > 0; k--) {
        const j = ri(rng, k + 1);
        const t = combo[k];
        combo[k] = combo[j];
        combo[j] = t;
      }
      spec.cells.forEach((ii, idx) => { preset[ii] = combo[idx]; });
    }
    if (!presetOk) continue;
    const fill = randomFill({ white: interiorWhite }, rows, cols, rng, preset);
    if (!fill) continue;
    // repair to unique with anchors protected
    const p = repairToUnique(interiorWhite, fill, rows, cols, rng, 'tutorial-' + def.id, undefined, protectedInterior);
    if (!p) continue;
    return p;
  }
  return null;
}

// =============================================================================
// Difficulty presets
// =============================================================================

export interface KakuroDifficultyPreset {
  key: string;
  label: string;
  rows: number;
  cols: number;
  blackProb: number;
}

export const KAKURO_DIFFICULTIES: Record<string, KakuroDifficultyPreset> = {
  easy: { key: 'easy', label: 'Easy', rows: 5, cols: 5, blackProb: 0.14 },
  medium: { key: 'medium', label: 'Medium', rows: 6, cols: 6, blackProb: 0.26 },
  hard: { key: 'hard', label: 'Hard', rows: 7, cols: 7, blackProb: 0.34 },
};

