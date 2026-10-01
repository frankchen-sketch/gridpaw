/**
 * GridPaw — Calcudoku (KenKen-style) Engine
 *
 * First game on the puzzle-core constraint layer.
 * Rules: N×N grid, rows/cols contain 1..N exactly once (Latin square),
 * cages carry + - × ÷ targets; cage values may repeat but rows/cols may not.
 *
 * Encoding: vals Int8Array (r*N+c), -1 empty. Cage op '=' for 1-cell cages.
 * API surface mirrors existing engines (generate/validate/solve/hintLookup).
 */
import {
  Cage, cageSatisfied, cageReachable, solveBoard, countGroups,
  balanceViolated, noThreeRunViolation,
} from './constraints';

export interface CalcudokuPuzzle {
  id: string;
  size: number;
  cages: Cage[];
  /** Givens as [idx, value] pairs */
  givens: [number, number][];
  solution: Int8Array;
  difficulty: 'easy' | 'medium' | 'hard';
}

const OPS_SMALL: Cage['op'][] = ['+', '×'];
const OPS_PAIR: Cage['op'][] = ['+', '-', '×', '÷'];

// ── Latin square generation (randomized backtracking) ───────────────────────
function makeLatinSquare(N: number, rng: () => number): Int8Array {
  const vals = new Int8Array(N * N).fill(-1);
  const rows: number[][] = Array.from({ length: N }, () => []);
  const usedCol: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
  const digits = Array.from({ length: N }, (_, i) => i + 1);

  const rowFill = (r: number): boolean => {
    // shuffle digits
    for (let i = digits.length - 1; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0;
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    for (const v of digits) {
      if (usedCol[v - 1][r]) continue;
      vals[r * N + r] === -1; // noop; index math below
    }
    // backtracking over columns
    const usedRow = new Set<number>();
    const fillCol = (c: number): boolean => {
      if (c === N) return true;
      for (const v of digits) {
        if (usedCol[v - 1][c] || usedRow.has(v)) continue;
        vals[r * N + c] = v;
        usedCol[v - 1][c] = true;
        usedRow.add(v);
        if (fillCol(c + 1)) return true;
        vals[r * N + c] = -1;
        usedCol[v - 1][c] = false;
        usedRow.delete(v);
      }
      return false;
    };
    return fillCol(0);
  };

  for (let r = 0; r < N; r++) {
    if (!rowFill(r)) throw new Error('latin gen failed');
  }
  return vals;
}

// ── Cage partition: randomized region growth, 1-4 cells, connected ──────────
function partitionCages(N: number, rng: () => number): number[][] {
  const total = N * N;
  const assigned = new Int8Array(total).fill(-1);
  const cageCells: number[][] = [];
  const idxs = Array.from({ length: total }, (_, i) => i);
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
  }
  const neighbors = (i: number): number[] => {
    const r = (i / N) | 0, c = i % N;
    const out: number[] = [];
    if (r > 0) out.push(i - N);
    if (r < N - 1) out.push(i + N);
    if (c > 0) out.push(i - 1);
    if (c < N - 1) out.push(i + 1);
    return out;
  };
  for (const seed of idxs) {
    if (assigned[seed] !== -1) continue;
    const cageId = cageCells.length;
    const cells = [seed];
    assigned[seed] = cageId;
    const max = 1 + ((rng() * 4) | 0); // 1..4
    while (cells.length < max) {
      // pick random frontier cell's neighbor not yet assigned
      const frontier: number[] = [];
      for (const cell of cells) for (const nb of neighbors(cell)) if (assigned[nb] === -1) frontier.push(nb);
      if (!frontier.length) break;
      const pick = frontier[(rng() * frontier.length) | 0];
      assigned[pick] = cageId;
      cells.push(pick);
    }
    cageCells.push(cells);
  }
  return cageCells;
}

// ── Cage op assignment based on cell count and value pattern ────────────────
function assignCageOps(cells: number[][], solution: Int8Array, rng: () => number): Cage[] {
  return cells.map(list => {
    const vs = list.map(i => solution[i]);
    let op: Cage['op'];
    if (list.length === 1) {
      op = '=';
    } else if (list.length === 2) {
      const [a, b] = vs;
      const candidates: Cage['op'][] = [...OPS_PAIR];
      if (a % b !== 0 && b % a !== 0) { // remove impossible ÷
        const ci = candidates.indexOf('÷'); candidates.splice(ci, 1);
      }
      if (a === b) { const ci = candidates.indexOf('-'); candidates.splice(ci, 1); }
      op = candidates[(rng() * candidates.length) | 0];
    } else {
      op = OPS_SMALL[(rng() * OPS_SMALL.length) | 0];
    }
    let target: number;
    switch (op) {
      case '=': target = vs[0]; break;
      case '+': target = vs.reduce((a, b) => a + b, 0); break;
      case '×': target = vs.reduce((a, b) => a * b, 1); break;
      case '-': target = Math.abs(vs[0] - vs[1]); break;
      case '÷': { const a = Math.max(vs[0], vs[1]), b = Math.min(vs[0], vs[1]); target = a / b; break; }
    }
    return { op, target, cells: list };
  });
}

// ── Solver wiring: candidates = row/col Latin + cage partial safety ─────────
function makeCandidateFn(N: number, cages: Cage[], cageOf: Int8Array) {
  const cageAt = (idx: number) => cages[cageOf[idx]];
  return (idx: number, vals: Int8Array, v: number): boolean => {
    const r = (idx / N) | 0, c = idx % N;
    // Latin row/col
    for (let i = 0; i < N; i++) {
      if (vals[r * N + i] === v) return false;
      if (vals[i * N + c] === v) return false;
    }
    // cage partial reachability (cheap: check the cage of idx only)
    vals[idx] = v;
    const ok = cageReachable(cageAt(idx), vals, N);
    vals[idx] = -1;
    return ok;
  };
}

export function countSolutions(N: number, cages: Cage[], cageOf: Int8Array, givens: [number, number][], limit = 2): { count: number; first: Int8Array | null } {
  const vals = new Int8Array(N * N).fill(-1);
  for (const [i, v] of givens) vals[i] = v;
  const empties = Array.from({ length: N * N }, (_, i) => i).filter(i => vals[i] === -1);
  const res = solveBoard(N, Array.from({ length: N }, (_, i) => i + 1), empties, makeCandidateFn(N, cages, cageOf),
    // full-board check: all cages satisfied
    (v, emit) => {
      for (const cage of cages) if (!cageSatisfied(cage, v)) return;
      emit(v);
    }, limit, vals);
  return { count: res.count, first: res.solution };
}

// ── Hint: exact cell answer lookup (法老规范：hint 直接给答案数字) ─────────────
export function hintLookup(puzzle: CalcudokuPuzzle, idx: number): number {
  return puzzle.solution[idx];
}

// ── Validation ──────────────────────────────────────────────────────────────
export function validate(puzzle: CalcudokuPuzzle, vals: Int8Array): { ok: boolean; errors: string[] } {
  const { size: N, cages } = puzzle;
  const errors: string[] = [];
  // rows & cols
  for (let r = 0; r < N; r++) {
    const seen = new Set<number>();
    for (let c = 0; c < N; c++) {
      const v = vals[r * N + c];
      if (v > 0 && seen.has(v)) errors.push(`Row ${r + 1} has duplicate ${v}`);
      seen.add(v);
    }
  }
  for (let c = 0; c < N; c++) {
    const seen = new Set<number>();
    for (let r = 0; r < N; r++) {
      const v = vals[r * N + c];
      if (v > 0 && seen.has(v)) errors.push(`Col ${c + 1} has duplicate ${v}`);
      seen.add(v);
    }
  }
  for (const cage of cages) {
    if (!cageReachable(cage, vals, N)) errors.push(`Cage ${cage.target}${cage.op} impossible`);
  }
  return { ok: errors.length === 0, errors };
}

// ── Generate ────────────────────────────────────────────────────────────────
// difficulty → given density: easy 0.55, medium 0.4, hard 0.28
export function generate(size: number, difficulty: CalcudokuPuzzle['difficulty'], seed = Date.now()): CalcudokuPuzzle {
  let s = seed >>> 0;
  const rng = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };

  const solution = makeLatinSquare(size, rng);
  const cageCellLists = partitionCages(size, rng);
  const cages = assignCageOps(cageCellLists, solution, rng);
  const cageOf = new Int8Array(size * size).fill(-1);
  cages.forEach((cage, ci) => cage.cells.forEach(i => { cageOf[i] = ci; }));

  // Dig-out uniqueness: start from the full solution as givens (trivially unique),
  // then remove cells one-by-one in random order; keep removal only if still unique.
  // This minimizes givens naturally (difficulty = how far we're allowed to dig).
  const stopDensity = difficulty === 'easy' ? 0.55 : difficulty === 'medium' ? 0.3 : 0.12;
  const minGivens = Math.max(2, Math.round(size * size * stopDensity));
  let givens: [number, number][] = Array.from({ length: size * size }, (_, i) => [i, solution[i]]);
  const order = Array.from({ length: size * size }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (const idx of order) {
    if (givens.length <= minGivens) break;
    const kept: [number, number][] = [];
    const removed: [number, number][] = [];
    for (const g of givens) (g[0] === idx ? removed : kept).push(g);
    const check = countSolutions(size, cages, cageOf, kept);
    if (check.count === 1) givens = kept; // dig succeeded
  }

  return {
    id: `calc-${size}-${difficulty}-${seed}`,
    size, cages, givens, solution, difficulty,
  };
}

// re-exported primitives for the next games (Star Battle / Binary / …)
export { solveBoard, countGroups, balanceViolated, noThreeRunViolation };
