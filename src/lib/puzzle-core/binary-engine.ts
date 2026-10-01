/**
 * GridPaw — Binary Puzzle (Binairo / Takuzu) Engine
 *
 * Second game on the puzzle-core constraint layer. Rules-only file:
 * every constraint comes from L1 primitives — no custom solver code.
 *
 * Rules:
 *  1. Fill 0/1: each row and column has equal count of both (even N only)
 *  2. No three identical values consecutive in a row or column
 *  3. (Takuzu variant) No two rows/columns identical
 *
 * Encoding: Int8Array (r*N+c), -1 empty, values 0/1.
 */
import {
  solveBoard, noThreeRunViolation, balanceViolated, countGroups,
} from './constraints';

export interface BinaryPuzzle {
  id: string;
  size: number;
  takuzu: boolean;           // extra rule: unique rows/cols
  givens: [number, number][];
  solution: Int8Array;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ── Solution generation: random valid completed board ───────────────────────
// Backtracking with rule-3 uniqueness handled by rejection (takuzu) or skipped.
function makeSolution(N: number, takuzu: boolean, rng: () => number): Int8Array | null {
  const vals = new Int8Array(N * N).fill(-1);
  const rows: Set<string>[] = Array.from({ length: N }, () => new Set());
  const cols: Set<string>[] = Array.from({ length: N }, () => new Set());

  const rowKey = (r: number) => Array.from({ length: N }, (_, c) => vals[r * N + c]).join('');
  const colKey = (c: number) => Array.from({ length: N }, (_, r) => vals[r * N + c]).join('');

  const fill = (idx: number): boolean => {
    if (idx === N * N) return true;
    const r = (idx / N) | 0, c = idx % N;
    const order = rng() < 0.5 ? [0, 1] : [1, 0];
    for (const v of order) {
      vals[idx] = v;
      if (noThreeRunViolation(vals, N, idx)) { vals[idx] = -1; continue; }
      rows[r].add(String(v)); cols[c].add(String(v));
      if (rows[r].size > 2 || cols[c].size > 2) { rows[r].delete(String(v)); cols[c].delete(String(v)); vals[idx] = -1; continue; }
      // balance prune: count in this row/col
      let rc = 0, cc = 0;
      for (let i = 0; i < N; i++) { if (vals[r * N + i] === v) rc++; if (vals[i * N + c] === v) cc++; }
      if (rc > N / 2 || cc > N / 2) { rows[r].delete(String(v)); cols[c].delete(String(v)); vals[idx] = -1; continue; }
      if (fill(idx + 1)) return true;
      rows[r].delete(String(v)); cols[c].delete(String(v));
      vals[idx] = -1;
    }
    return false;
  };
  if (!fill(0)) return null;

  if (takuzu) {
    // regenerate with uniqueness check: simple retry loop (rare collisions at random fill)
    const seenR = new Set<string>(), seenC = new Set<string>();
    for (let r = 0; r < N; r++) {
      const k = rowKey(r);
      if (seenR.has(k)) return makeSolution(N, takuzu, rng);
      seenR.add(k);
    }
    for (let c = 0; c < N; c++) {
      const k = colKey(c);
      if (seenC.has(k)) return makeSolution(N, takuzu, rng);
      seenC.add(k);
    }
  }
  return vals;
}

// ── Candidate fn: pure L1 composition ───────────────────────────────────────
function makeCandidateFn(N: number, takuzu: boolean) {
  return (idx: number, vals: Int8Array, v: number): boolean => {
    vals[idx] = v;
    if (noThreeRunViolation(vals, N, idx)) { vals[idx] = -1; return false; }
    const r = (idx / N) | 0, c = idx % N;
    if (balanceViolated(vals, N, 'row', r, [0, 1]) || balanceViolated(vals, N, 'col', c, [0, 1])) {
      vals[idx] = -1; return false;
    }
    if (takuzu) {
      // completed line must not duplicate another completed line
      const rowFull = Array.from({ length: N }, (_, i) => vals[r * N + i]).every(x => x >= 0);
      if (rowFull) {
        const key = Array.from({ length: N }, (_, i) => vals[r * N + i]).join('');
        for (let rr = 0; rr < N; rr++) {
          if (rr === r) continue;
          if (Array.from({ length: N }, (_, i) => vals[rr * N + i]).every(x => x >= 0)
            && Array.from({ length: N }, (_, i) => vals[rr * N + i]).join('') === key) {
            vals[idx] = -1; return false;
          }
        }
      }
      const colFull = Array.from({ length: N }, (_, i) => vals[i * N + c]).every(x => x >= 0);
      if (colFull) {
        const key = Array.from({ length: N }, (_, i) => vals[i * N + c]).join('');
        for (let cc = 0; cc < N; cc++) {
          if (cc === c) continue;
          if (Array.from({ length: N }, (_, i) => vals[i * N + cc]).every(x => x >= 0)
            && Array.from({ length: N }, (_, i) => vals[i * N + cc]).join('') === key) {
            vals[idx] = -1; return false;
          }
        }
      }
    }
    vals[idx] = -1;
    return true;
  };
}

export function countSolutions(N: number, takuzu: boolean, givens: [number, number][], limit = 2): { count: number; first: Int8Array | null } {
  const vals = new Int8Array(N * N).fill(-1);
  for (const [i, v] of givens) vals[i] = v;
  const empties = Array.from({ length: N * N }, (_, i) => i).filter(i => vals[i] === -1);
  const res = solveBoard(N, [0, 1], empties, makeCandidateFn(N, takuzu),
    (v, emit) => emit(v), limit, vals);
  return { count: res.count, first: res.solution };
}

export function hintLookup(puzzle: BinaryPuzzle, idx: number): number {
  return puzzle.solution[idx];
}

export function validate(puzzle: BinaryPuzzle, vals: Int8Array): { ok: boolean; errors: string[] } {
  const { size: N, takuzu } = puzzle;
  const errors: string[] = [];
  for (let r = 0; r < N; r++) if (balanceViolated(vals, N, 'row', r, [0, 1])) errors.push(`Row ${r + 1} unbalanced`);
  for (let c = 0; c < N; c++) if (balanceViolated(vals, N, 'col', c, [0, 1])) errors.push(`Col ${c + 1} unbalanced`);
  for (let i = 0; i < N * N; i++) if (vals[i] >= 0 && noThreeRunViolation(vals, N, i)) { errors.push(`Three-in-a-row at ${i}`); break; }
  if (takuzu) {
    const rk = new Map<string, number>(), ck = new Map<string, number>();
    for (let r = 0; r < N; r++) {
      const key = Array.from({ length: N }, (_, i) => vals[r * N + i]).join('');
      if (key.includes('-')) continue;
      if (rk.has(key)) errors.push(`Rows ${rk.get(key)! + 1} and ${r + 1} identical`);
      rk.set(key, r);
    }
    for (let c = 0; c < N; c++) {
      const key = Array.from({ length: N }, (_, i) => vals[i * N + c]).join('');
      if (key.includes('-')) continue;
      if (ck.has(key)) errors.push(`Cols ${ck.get(key)! + 1} and ${c + 1} identical`);
      ck.set(key, c);
    }
  }
  return { ok: errors.length === 0, errors };
}

// ── Generate: dig-out uniqueness (same pattern as calcudoku) ────────────────
export function generate(size: number, difficulty: BinaryPuzzle['difficulty'], seed = Date.now(), takuzu = true): BinaryPuzzle {
  if (size % 2 !== 0) throw new Error('Binary puzzle size must be even');
  let s = (seed >>> 0) || 1;
  const rng = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };

  const solution = makeSolution(size, takuzu, rng);
  if (!solution) throw new Error('binary gen failed');

  const stopDensity = difficulty === 'easy' ? 0.55 : difficulty === 'medium' ? 0.32 : 0.15;
  const minGivens = Math.max(4, Math.round(size * size * stopDensity));
  let givens: [number, number][] = Array.from({ length: size * size }, (_, i) => [i, solution[i]]);
  const order = Array.from({ length: size * size }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (const idx of order) {
    if (givens.length <= minGivens) break;
    const kept: [number, number][] = [];
    for (const g of givens) if (g[0] !== idx) kept.push(g);
    if (countSolutions(size, takuzu, kept).count === 1) givens = kept;
  }

  return { id: `bin-${size}-${difficulty}-${seed}`, size, takuzu, givens, solution, difficulty };
}
