/**
 * GridPaw Puzzle Core — L1 constraint primitives + generic backtracking solver
 *
 * Shared by: Calcudoku / Star Battle / Binary / Hashi / Slitherlink / Connect Tracks
 * Design contract:
 *  - No DOM access (node-testable, esbuild-bundlable)
 *  - Pure functions; caller owns board representation
 *  - Board = Int8Array (index = r*N+c), -1 = empty
 */

// ── connectivity: flood-fill group count over a cell predicate ──────────────
// Returns number of connected groups among cells where pred(idx) is true.
export function countGroups(N: number, pred: (idx: number) => boolean): number {
  const seen = new Uint8Array(N * N);
  let groups = 0;
  const stack: number[] = [];
  for (let i = 0; i < N * N; i++) {
    if (seen[i] || !pred(i)) continue;
    groups++;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const cur = stack.pop()!;
      const r = (cur / N) | 0, c = cur % N;
      const nbrs = [r > 0 ? cur - N : -1, r < N - 1 ? cur + N : -1, c > 0 ? cur - 1 : -1, c < N - 1 ? cur + 1 : -1];
      for (const nb of nbrs) {
        if (nb >= 0 && !seen[nb] && pred(nb)) { seen[nb] = 1; stack.push(nb); }
      }
    }
  }
  return groups;
}

// ── exactlyN: row/col/region exact count of a value ─────────────────────────
// fills: array of "value used" flags per line. Used by Star Battle / Tracks.
export function countInRow(vals: Int8Array, N: number, row: number, target: number): number {
  let n = 0;
  for (let c = 0; c < N; c++) if (vals[row * N + c] === target) n++;
  return n;
}

export function countInCol(vals: Int8Array, N: number, col: number, target: number): number {
  let n = 0;
  for (let r = 0; r < N; r++) if (vals[r * N + col] === target) n++;
  return n;
}

// ── adjacencyBan: no two marked cells (optionally diagonal) touch ───────────
export function hasAdjacent(vals: Int8Array, N: number, target: number, idx: number, diagonal: boolean): boolean {
  const r = (idx / N) | 0, c = idx % N;
  const ortho = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
  const diag = [[r - 1, c - 1], [r - 1, c + 1], [r + 1, c - 1], [r + 1, c + 1]];
  for (const [rr, cc] of diagonal ? ortho.concat(diag) : ortho) {
    if (rr >= 0 && rr < N && cc >= 0 && cc < N && vals[rr * N + cc] === target) return true;
  }
  return false;
}

// ── noThreeRun: no three equal values consecutive in row/col ────────────────
// Binary puzzle. vals>0 only; -1 ignored.
export function noThreeRunViolation(vals: Int8Array, N: number, idx: number): boolean {
  const r = (idx / N) | 0, c = idx % N, v = vals[idx];
  if (v < 0) return false;
  let run = 1;
  for (let cc = c - 1; cc >= 0 && vals[r * N + cc] === v; cc--) run++;
  for (let cc = c + 1; cc < N && vals[r * N + cc] === v; cc++) run++;
  if (run >= 3) return true;
  run = 1;
  for (let rr = r - 1; rr >= 0 && vals[rr * N + c] === v; rr--) run++;
  for (let rr = r + 1; rr < N && vals[rr * N + c] === v; rr++) run++;
  return run >= 3;
}

// ── cageCalc: KenKen cage arithmetic check (partial-safe) ───────────────────
export interface Cage {
  target: number;
  op: '+' | '-' | '×' | '÷' | '=';
  cells: number[]; // board indices
}

// Full-cage evaluation once all cells filled.
export function cageSatisfied(cage: Cage, vals: Int8Array): boolean {
  const vs = cage.cells.map(i => vals[i]);
  if (vs.some(v => v < 0)) return false;
  switch (cage.op) {
    case '=': return vs[0] === cage.target;
    case '+': return vs.reduce((a, b) => a + b, 0) === cage.target;
    case '×': return vs.reduce((a, b) => a * b, 1) === cage.target;
    case '-': {
      if (vs.length !== 2) return false;
      return Math.abs(vs[0] - vs[1]) === cage.target;
    }
    case '÷': {
      if (vs.length !== 2) return false;
      const a = Math.max(vs[0], vs[1]), b = Math.min(vs[0], vs[1]);
      return b > 0 && a % b === 0 && a / b === cage.target;
    }
  }
}

// Partial check: prune states that can no longer reach the target (upper bound).
export function cageReachable(cage: Cage, vals: Int8Array, N: number): boolean {
  const filled = cage.cells.map(i => vals[i]).filter(v => v >= 0);
  const empty = cage.cells.length - filled.length;
  if (empty === 0) return cageSatisfied(cage, vals);
  switch (cage.op) {
    case '=': return false; // single cell must be filled
    case '+': {
      const sum = filled.reduce((a, b) => a + b, 0);
      return sum + empty * N <= cage.target && sum + empty * 1 >= cage.target;
    }
    case '×': {
      const prod = filled.reduce((a, b) => a * b, 1);
      // upper bound: multiply by max digit N for each empty; loose but safe prune
      return prod * Math.pow(N, empty) >= cage.target;
    }
    case '-': {
      // two cells, one empty: |a-b| can be 1..N-1; always reachable unless equal constraint impossible
      return true;
    }
    case '÷': return true;
  }
}

// ── pairwiseBalance: row/col have equal counts of each symbol (Binary) ──────
// For symbol set {1,2}: |count1 - count2| must not exceed remaining empty cells' parity allowance.
export function balanceViolated(vals: Int8Array, N: number, line: 'row' | 'col', li: number, symbols: number[]): boolean {
  const counts = new Map<number, number>();
  let empty = 0;
  for (let i = 0; i < N; i++) {
    const v = line === 'row' ? vals[li * N + i] : vals[i * N + li];
    if (v < 0) { empty++; continue; }
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  if (symbols.length !== 2) return false;
  const c1 = counts.get(symbols[0]) || 0, c2 = counts.get(symbols[1]) || 0;
  const half = N / 2;
  if (c1 > half || c2 > half) return true;
  return (half - c1) + (half - c2) !== empty; // leftover must split evenly
}

// ── Generic backtracking solver with MRV ────────────────────────────────────
// candidateFn(idx, vals) -> iterable of legal values for empty cell idx.
// boardCheck(vals) -> false if the current partial board violates a global
// constraint that candidate-level checks cannot see (e.g. full-line counts).
export interface SolveResult {
  solution: Int8Array | null;
  count: number; // number of solutions found (bounded by limit)
}

// Tagged error: the search exceeded its node budget without a definitive
// answer. Callers treat this as "result unknown" (e.g. generation retries
// with the next candidate layout — never as an accepted solution).
export const SOLVER_BUDGET_EXCEEDED = 'SOLVER_BUDGET_EXCEEDED';

export function solveBoard(
  N: number,
  domain: number[],
  empties: number[],
  candidateFn: (idx: number, vals: Int8Array, v: number) => boolean,
  onComplete: (vals: Int8Array, emit: (s: Int8Array) => void) => void,
  limit: number,
  vals: Int8Array,
  nodeBudget?: number
): SolveResult {
  let count = 0;
  let first: Int8Array | null = null;
  let nodes = 0;
  const emit = (s: Int8Array) => {
    if (count === 0) first = s.slice();
    count++;
  };

  // MRV: pick empty cell with fewest candidates
  const candBuf: number[] = [];
  const dfs = (): boolean => {
    if (nodeBudget !== undefined && ++nodes > nodeBudget) {
      throw new Error(SOLVER_BUDGET_EXCEEDED);
    }
    if (count >= limit) return true; // stop signal
    // find MRV cell
    let bestIdx = -1, bestCands: number[] | null = null, bestLen = Infinity;
    for (const idx of empties) {
      if (vals[idx] >= 0) continue;
      candBuf.length = 0;
      for (const v of domain) if (candidateFn(idx, vals, v)) candBuf.push(v);
      const len = candBuf.length;
      if (len === 0) return false; // dead end
      if (len < bestLen) { bestLen = len; bestIdx = idx; bestCands = candBuf.slice(); if (len === 1) break; }
    }
    if (bestIdx === -1) { onComplete(vals, emit); return count >= limit; }
    for (const v of bestCands!) {
      vals[bestIdx] = v;
      const stop = dfs();
      vals[bestIdx] = -1;
      if (stop) return true;
    }
    return false;
  };

  dfs();
  return { solution: first, count };
}
