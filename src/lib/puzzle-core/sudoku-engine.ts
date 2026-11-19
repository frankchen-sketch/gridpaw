/**
 * GridPaw — Sudoku Engine (parameterized 9 / 12 / 16 / 25)
 *
 * Contract: docs/sudoku-cluster-contract.md §1 (frozen). Same shape as
 * StarBattleEngine / SlitherEngine: no DOM, pure functions, esbuild-bundlable.
 *
 * Encoding: flat board index = r*size + c, `-1` = empty (a stray `0` from a
 * zero-filled typed array is also treated as empty, never as a value).
 *
 * Generation:
 *   1. build a solved grid from the canonical pattern, then randomize by
 *      permuting digits, bands of rows and stacks of columns
 *   2. dig holes in randomized batches: a batch is kept removed only when the
 *      budgeted solver proves the remaining board still has exactly ONE
 *      solution. A batch that breaks uniqueness is split in halves and retried,
 *      so digging stays cheap on large boards (25×25 needs ~600 uniqueness
 *      checks if dug cell-by-cell, but only a few dozen batched checks).
 *   3. retry with a fresh seed up to 20 times, then fall back one difficulty
 *      tier (easier = more givens). A returned puzzle therefore has
 *      countSolutions() === 1 by construction.
 *
 * `timeBudgetMs` (default 8000) caps the whole call: when it runs out the
 * best-so-far unique board is returned labelled with the difficulty tier its
 * given count actually matches — a lower difficulty, never an exception.
 */
export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuPuzzle {
  id: string;                  // `sudoku-${size}-${difficulty}-${seed}`
  size: number;                // 9 | 12 | 16 | 25
  blockW: number;              // block width
  blockH: number;              // block height
  symbols: string[];           // display chars, length = size
  givens: [number, number][];  // [cellIndex, value(1..size)]
  solution: number[];          // length size*size, values 1..size
  difficulty: SudokuDifficulty;
}

const EMPTY = -1;
const DIFFICULTIES: SudokuDifficulty[] = ['easy', 'medium', 'hard', 'expert'];

/**
 * Fraction of cells kept as clues, per size. Bigger grids need a much denser
 * board to stay uniquely solvable: a 25×25 random hole pattern loses
 * uniqueness around 60% givens, a 9×9 keeps it down to ~28%. These values were
 * measured with the engine's own solver (see the delivery report). Easier =
 * more clues, so within one size the given counts run easy > medium > hard >
 * expert, the standard sudoku convention.
 */
const GIVEN_DENSITY: Record<number, Record<SudokuDifficulty, number>> = {
  9: { easy: 0.5, medium: 0.42, hard: 0.35, expert: 0.29 },
  12: { easy: 0.55, medium: 0.47, hard: 0.4, expert: 0.34 },
  16: { easy: 0.7, medium: 0.58, hard: 0.48, expert: 0.4 },
  25: { easy: 0.64, medium: 0.58, hard: 0.54, expert: 0.5 },
};

const DEFAULT_DENSITY: Record<SudokuDifficulty, number> = {
  easy: 0.6,
  medium: 0.52,
  hard: 0.45,
  expert: 0.38,
};

/** Target number of givens for a size/difficulty pair (exported for tests + level gen). */
export function givenTarget(size: number, difficulty: SudokuDifficulty): number {
  const table = GIVEN_DENSITY[size] ?? DEFAULT_DENSITY;
  const d = table[difficulty] ?? DEFAULT_DENSITY[difficulty];
  return Math.max(2, Math.round(size * size * d));
}

/** Symbol set per the frozen contract: 9→1-9, 12→1-9+ABC, 16→0-9+A-F, 25→1-9+A-P. */
export function symbolsForSize(size: number): string[] {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (size === 16) return ('0123456789' + LETTERS.slice(0, 6)).split('');
  const out: string[] = [];
  const digits = Math.min(size, 9);
  for (let i = 0; i < digits; i++) out.push(String(i + 1));
  for (let i = 0; out.length < size; i++) out.push(LETTERS[i]);
  return out;
}

// ── RNG (xorshift32, same family as the other engines) ─────────────────────
function makeRng(seed: number): () => number {
  let s = (seed >>> 0) || 0x9e3779b9;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function mixSeed(seed: number, salt: number): number {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (salt + 0x85ebca6b), 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) || 1;
}

function shuffled<T>(items: T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

// ── Solved grid: canonical pattern + band/stack/digit shuffles ──────────────
// Every transformation below preserves sudoku validity, so the result is a
// random valid solution without any solver call (O(size²), even for 25×25).
function makeSolution(size: number, blockW: number, blockH: number, rng: () => number): number[] {
  const bands = shuffled(range(size / blockH), rng);
  const rowOrder: number[] = [];
  for (const band of bands) {
    const rows = shuffled(range(blockH).map(i => band * blockH + i), rng);
    for (const r of rows) rowOrder.push(r);
  }
  const stacks = shuffled(range(size / blockW), rng);
  const colOrder: number[] = [];
  for (const stack of stacks) {
    const cols = shuffled(range(blockW).map(i => stack * blockW + i), rng);
    for (const c of cols) colOrder.push(c);
  }
  const digits = shuffled(range(size), rng);
  const out = new Array<number>(size * size);
  for (let r = 0; r < size; r++) {
    const src = rowOrder[r];
    for (let c = 0; c < size; c++) {
      const base = (blockW * (src % blockH) + Math.floor(src / blockH) + colOrder[c]) % size;
      out[r * size + c] = digits[base] + 1;
    }
  }
  return out;
}

// ── Constraint primitives (bitmasks; size ≤ 30 so one 32-bit mask per unit) ──
function popcount(x: number): number {
  let v = x - ((x >> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
  v = (v + (v >> 4)) & 0x0f0f0f0f;
  return (v * 0x01010101) >>> 24;
}

const EXHAUSTED = -1;

interface Geometry {
  size: number;
  n: number;
  fullMask: number;
  boxOf: Uint16Array;
  units: number[][];   // all rows, then all columns, then all boxes
}

const GEOMETRY = new Map<string, Geometry>();

function geometryFor(size: number, blockW: number, blockH: number): Geometry {
  const key = `${size}:${blockW}:${blockH}`;
  const cached = GEOMETRY.get(key);
  if (cached) return cached;
  const n = size * size;
  const boxesPerRow = Math.max(1, Math.round(size / blockW));
  const boxOf = new Uint16Array(n);
  for (let i = 0; i < n; i++) {
    const r = (i / size) | 0;
    const c = i % size;
    boxOf[i] = ((r / blockH) | 0) * boxesPerRow + ((c / blockW) | 0);
  }
  const units: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) row.push(r * size + c);
    units.push(row);
  }
  for (let c = 0; c < size; c++) {
    const col: number[] = [];
    for (let r = 0; r < size; r++) col.push(r * size + c);
    units.push(col);
  }
  for (let br = 0; br < size / blockH; br++) {
    for (let bc = 0; bc < boxesPerRow; bc++) {
      const box: number[] = [];
      for (let dr = 0; dr < blockH; dr++) {
        for (let dc = 0; dc < blockW; dc++) box.push((br * blockH + dr) * size + bc * blockW + dc);
      }
      units.push(box);
    }
  }
  const geo: Geometry = { size, n, fullMask: (1 << size) - 1, boxOf, units };
  GEOMETRY.set(key, geo);
  return geo;
}

/**
 * Count solutions of `values` (givens only) up to `limit`, with a node cap.
 * Returns the count, or EXHAUSTED (-1) when the cap was hit before the search
 * finished — callers must treat that as "not proven".
 *
 * Search: naked + hidden singles to fixpoint, then MRV branching; row/col/box
 * candidate masks as 32-bit words.
 */
function countSolutionsBounded(
  size: number,
  blockW: number,
  blockH: number,
  values: ArrayLike<number>,
  limit: number,
  maxNodes: number,
): number {
  const geo = geometryFor(size, blockW, blockH);
  const { n, fullMask, boxOf, units } = geo;

  const board = new Int8Array(n).fill(EMPTY);
  const rowMask = new Uint32Array(size);
  const colMask = new Uint32Array(size);
  const boxMask = new Uint32Array(size);

  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (v <= 0) continue; // -1 (or 0 from a fresh typed array) = empty
    if (v > size) return 0;
    const bit = 1 << (v - 1);
    const r = (i / size) | 0;
    const c = i % size;
    const b = boxOf[i];
    if ((rowMask[r] & bit) !== 0 || (colMask[c] & bit) !== 0 || (boxMask[b] & bit) !== 0) return 0;
    rowMask[r] |= bit;
    colMask[c] |= bit;
    boxMask[b] |= bit;
    board[i] = v;
  }

  let nodes = 0;
  let found = 0;
  let exhausted = false;
  const stack: number[] = [];

  const undoTo = (mark: number): void => {
    while (stack.length > mark) {
      const idx = stack.pop() as number;
      const v = board[idx];
      board[idx] = EMPTY;
      const bit = 1 << (v - 1);
      rowMask[(idx / size) | 0] &= ~bit;
      colMask[idx % size] &= ~bit;
      boxMask[boxOf[idx]] &= ~bit;
    }
  };

  const posMasks = new Uint32Array(size);

  // Place every hidden single (a value that has exactly one spot in a unit).
  // Returns placements count, or -1 when a unit cannot place some value.
  const fillHiddenSingles = (): number => {
    let placed = 0;
    for (let u = 0; u < units.length; u++) {
      const unit = units[u];
      posMasks.fill(0);
      let unitMask = 0;
      let dead = false;
      for (let k = 0; k < unit.length; k++) {
        const i = unit[k];
        const v = board[i];
        if (v !== EMPTY) {
          unitMask |= 1 << (v - 1);
          continue;
        }
        const avail = fullMask & ~(rowMask[(i / size) | 0] | colMask[i % size] | boxMask[boxOf[i]]);
        if (avail === 0) {
          dead = true;
          break;
        }
        let m = avail;
        while (m !== 0) {
          const bit = m & -m;
          m ^= bit;
          posMasks[31 - Math.clz32(bit)] |= 1 << k;
        }
      }
      if (dead) return -1;

      let missing = fullMask & ~unitMask;
      while (missing !== 0) {
        let picked = false;
        let m = missing;
        while (m !== 0) {
          const bit = m & -m;
          m ^= bit;
          const p = posMasks[31 - Math.clz32(bit)];
          if (p === 0) return -1; // no place for this value in this unit
          if ((p & (p - 1)) === 0) {
            const i = unit[31 - Math.clz32(p)];
            board[i] = 31 - Math.clz32(bit) + 1;
            rowMask[(i / size) | 0] |= bit;
            colMask[i % size] |= bit;
            boxMask[boxOf[i]] |= bit;
            stack.push(i);
            placed++;
            missing &= ~bit;
            const clear = ~p;
            for (let t = 0; t < size; t++) posMasks[t] &= clear;
            picked = true;
            break;
          }
        }
        if (!picked) break;
      }
    }
    return placed;
  };

  // Returns false only when the whole search must stop (limit reached or node cap).
  const search = (): boolean => {
    if (++nodes > maxNodes) {
      exhausted = true;
      return false;
    }
    const base = stack.length;

    // forced moves to fixpoint: naked singles, then hidden singles
    for (;;) {
      let filled = 0;
      for (let i = 0; i < n; i++) {
        if (board[i] !== EMPTY) continue;
        const r = (i / size) | 0;
        const c = i % size;
        const b = boxOf[i];
        const avail = fullMask & ~(rowMask[r] | colMask[c] | boxMask[b]);
        if (avail === 0) {
          undoTo(base);
          return true; // dead branch, keep searching elsewhere
        }
        if ((avail & (avail - 1)) === 0) {
          board[i] = 31 - Math.clz32(avail) + 1;
          rowMask[r] |= avail;
          colMask[c] |= avail;
          boxMask[b] |= avail;
          stack.push(i);
          filled++;
        }
      }
      if (filled > 0) continue;
      const hidden = fillHiddenSingles();
      if (hidden < 0) {
        undoTo(base);
        return true;
      }
      if (hidden === 0) break;
    }

    // MRV: pick the empty cell with the fewest candidates
    let bestCell = -1;
    let bestMask = 0;
    let bestCount = size + 1;
    for (let i = 0; i < n; i++) {
      if (board[i] !== EMPTY) continue;
      const r = (i / size) | 0;
      const c = i % size;
      const b = boxOf[i];
      const avail = fullMask & ~(rowMask[r] | colMask[c] | boxMask[b]);
      if (avail === 0) {
        undoTo(base);
        return true;
      }
      const cnt = popcount(avail);
      if (cnt < bestCount) {
        bestCount = cnt;
        bestCell = i;
        bestMask = avail;
      }
    }
    if (bestCell === -1) {
      found++;
      undoTo(base);
      return found < limit;
    }

    const afterProp = stack.length;
    const r0 = (bestCell / size) | 0;
    const c0 = bestCell % size;
    const b0 = boxOf[bestCell];
    let mask = bestMask;
    while (mask !== 0) {
      const bit = mask & -mask;
      mask ^= bit;
      board[bestCell] = 31 - Math.clz32(bit) + 1;
      rowMask[r0] |= bit;
      colMask[c0] |= bit;
      boxMask[b0] |= bit;
      stack.push(bestCell);
      const ok = search();
      undoTo(afterProp);
      if (!ok) {
        undoTo(base);
        return false;
      }
    }
    undoTo(base);
    return true;
  };

  search();
  if (exhausted) return EXHAUSTED;
  return found;
}

// ── Public: countSolutions ──────────────────────────────────────────────────
/**
 * Count solutions of the puzzle's givens (limit defaults to 2, enough for a
 * uniqueness test). Returns `-1` when the search budget is exhausted on a very
 * under-constrained board — generated puzzles always answer exactly.
 */
export function countSolutions(p: SudokuPuzzle, limit = 2): { count: number } {
  const size = p.size;
  const n = size * size;
  const values = new Int8Array(n).fill(EMPTY);
  for (const [idx, v] of p.givens) {
    if (Number.isInteger(idx) && idx >= 0 && idx < n) values[idx] = v;
  }
  const lim = Math.max(1, Math.floor(limit) || 2);
  let cap = 200_000;
  let res = countSolutionsBounded(size, p.blockW, p.blockH, values, lim, cap);
  while (res === EXHAUSTED && cap < 6_400_000) {
    cap *= 4;
    res = countSolutionsBounded(size, p.blockW, p.blockH, values, lim, cap);
  }
  return { count: res === EXHAUSTED ? -1 : res };
}

// ── Public: validate ────────────────────────────────────────────────────────
/** Validate a player board: duplicates per row/col/block, bad values, givens overwritten. */
export function validate(p: SudokuPuzzle, vals: Int8Array | number[]): { ok: boolean; errors: string[] } {
  const size = p.size;
  const n = size * size;
  const errors: string[] = [];
  if (!vals || vals.length !== n) {
    return { ok: false, errors: [`Board must have ${n} cells (got ${vals ? vals.length : 0})`] };
  }
  const symbol = (v: number): string => p.symbols[v - 1] ?? String(v);

  for (let i = 0; i < n; i++) {
    const v = vals[i];
    if (v > size || v < EMPTY) {
      errors.push(`Cell r${((i / size) | 0) + 1}c${(i % size) + 1} has invalid value ${v}`);
    }
  }
  if (errors.length > 0) return { ok: false, errors };

  for (let r = 0; r < size; r++) {
    const seen = new Uint8Array(size + 1);
    for (let c = 0; c < size; c++) {
      const v = vals[r * size + c];
      if (v <= 0) continue;
      if (seen[v] !== 0) errors.push(`Row ${r + 1} has duplicate ${symbol(v)}`);
      else seen[v] = 1;
    }
  }
  for (let c = 0; c < size; c++) {
    const seen = new Uint8Array(size + 1);
    for (let r = 0; r < size; r++) {
      const v = vals[r * size + c];
      if (v <= 0) continue;
      if (seen[v] !== 0) errors.push(`Col ${c + 1} has duplicate ${symbol(v)}`);
      else seen[v] = 1;
    }
  }
  const boxesPerRow = Math.max(1, Math.round(size / p.blockW));
  for (let br = 0; br < size / p.blockH; br++) {
    for (let bc = 0; bc < boxesPerRow; bc++) {
      const seen = new Uint8Array(size + 1);
      for (let dr = 0; dr < p.blockH; dr++) {
        for (let dc = 0; dc < p.blockW; dc++) {
          const idx = (br * p.blockH + dr) * size + bc * p.blockW + dc;
          const v = vals[idx];
          if (v <= 0) continue;
          if (seen[v] !== 0) {
            errors.push(`Block r${br + 1}c${bc + 1} has duplicate ${symbol(v)}`);
          } else seen[v] = 1;
        }
      }
    }
  }
  for (const [idx, v] of p.givens) {
    const cur = vals[idx];
    if (cur > 0 && cur !== v) {
      errors.push(`Cell r${((idx / size) | 0) + 1}c${(idx % size) + 1} is given ${symbol(v)} but has ${symbol(cur)}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

// ── Public: hintLookup ──────────────────────────────────────────────────────
/** Correct value for a cell; -1 when the index is invalid or no solution exists. */
export function hintLookup(p: SudokuPuzzle, idx: number): number {
  if (!Number.isInteger(idx) || idx < 0 || idx >= p.size * p.size) return -1;
  const v = p.solution[idx];
  if (!Number.isInteger(v) || v < 1 || v > p.size) return -1;
  return v;
}

// ── Digging ─────────────────────────────────────────────────────────────────
interface DigResult {
  values: Int8Array;   // -1 = removed
  givens: number;
}

/** Node cap per uniqueness check — tuned so one slow check stays in the ms range. */
function checkNodeCap(size: number): number {
  if (size >= 20) return 10_000;
  if (size >= 14) return 20_000;
  return 60_000;
}

function digHoles(
  size: number,
  blockW: number,
  blockH: number,
  solution: number[],
  target: number,
  rng: () => number,
  deadline: number,
): DigResult {
  const n = size * size;
  const values = new Int8Array(n);
  for (let i = 0; i < n; i++) values[i] = solution[i];
  let givens = n;
  const cap = checkNodeCap(size);

  const tryRemove = (batch: number[]): void => {
    if (batch.length === 0 || givens <= target) return;
    if (Date.now() > deadline) return;
    // never overshoot the target: split down until the batch fits
    if (batch.length > 1 && givens - batch.length < target) {
      const mid = batch.length >> 1;
      tryRemove(batch.slice(0, mid));
      tryRemove(batch.slice(mid));
      return;
    }
    for (const idx of batch) values[idx] = EMPTY;
    const res = countSolutionsBounded(size, blockW, blockH, values, 2, cap);
    if (res === 1) {
      givens -= batch.length;
      return;
    }
    for (const idx of batch) values[idx] = solution[idx];
    if (batch.length === 1) return;
    // ambiguity (or an unproven check): split and retry smaller subsets
    const mid = batch.length >> 1;
    tryRemove(batch.slice(0, mid));
    tryRemove(batch.slice(mid));
  };

  const order = shuffled(range(n), rng);
  const batchSize = size >= 20 ? 8 : size >= 14 ? 5 : size >= 12 ? 4 : 3;
  for (let i = 0; i < order.length && givens > target; i += batchSize) {
    tryRemove(order.slice(i, i + batchSize));
  }
  return { values, givens };
}

// ── Generate ────────────────────────────────────────────────────────────────
function assertParams(size: number, blockW: number, blockH: number): void {
  if (!Number.isInteger(size) || size < 4 || size > 30) {
    throw new Error(`sudoku: unsupported size ${size}`);
  }
  if (!Number.isInteger(blockW) || !Number.isInteger(blockH) || blockW < 1 || blockH < 1 || blockW * blockH !== size) {
    throw new Error(`sudoku: block ${blockW}x${blockH} does not tile size ${size}`);
  }
  if (size % blockW !== 0 || size % blockH !== 0) {
    throw new Error(`sudoku: size ${size} is not divisible by block ${blockW}x${blockH}`);
  }
}

/** Difficulty tier whose target is at least `givens` (hardest such tier). */
function tierForGivens(size: number, givens: number): SudokuDifficulty {
  for (let i = DIFFICULTIES.length - 1; i >= 0; i--) {
    if (givens <= givenTarget(size, DIFFICULTIES[i])) return DIFFICULTIES[i];
  }
  return 'easy';
}

function buildPuzzle(
  size: number,
  blockW: number,
  blockH: number,
  values: Int8Array,
  solution: number[],
  difficulty: SudokuDifficulty,
  seed: number,
): SudokuPuzzle {
  const givens: [number, number][] = [];
  for (let i = 0; i < size * size; i++) {
    if (values[i] > 0) givens.push([i, values[i]]);
  }
  return {
    id: `sudoku-${size}-${difficulty}-${seed}`,
    size,
    blockW,
    blockH,
    symbols: symbolsForSize(size),
    givens,
    solution: solution.slice(),
    difficulty,
  };
}

export function generate(
  size: number,
  blockW: number,
  blockH: number,
  difficulty: SudokuDifficulty,
  seed = Date.now(),
  timeBudgetMs = 8000,
): SudokuPuzzle {
  assertParams(size, blockW, blockH);

  const n = size * size;
  const budget = Number.isFinite(timeBudgetMs) && timeBudgetMs > 0 ? timeBudgetMs : 8000;
  const deadline = Date.now() + budget;
  const rootSeed = (seed >>> 0) || 1;
  const startIdx = DIFFICULTIES.indexOf(difficulty);
  const startTier = startIdx >= 0 ? startIdx : 1; // unknown value → medium

  let best: { values: Int8Array; solution: number[]; givens: number; seed: number } | null = null;

  for (let tier = startTier; tier >= 0; tier--) {
    const target = givenTarget(size, DIFFICULTIES[tier]);
    // already dug deep enough on a previous (harder) tier: just relabel
    if (best !== null && best.givens <= target) break;

    for (let attempt = 0; attempt < 20; attempt++) {
      const now = Date.now();
      if (now >= deadline) break;
      // Per-attempt slice: a stuck dig must not eat the whole budget, otherwise
      // the retry (fresh seed) never gets a chance. Cap at 1/3 of the budget.
      const slice = Math.max(300, Math.min(deadline - now, Math.round(budget / 3)));
      const attemptSeed = mixSeed(rootSeed, (tier + 1) * 1000 + attempt);
      const rng = makeRng(attemptSeed);
      const solution = makeSolution(size, blockW, blockH, rng);
      const dug = digHoles(size, blockW, blockH, solution, target, rng, Math.min(deadline, now + slice));
      if (dug.givens <= target) {
        // Final proof is a safety net only: the digging already proved this
        // exact board unique. Skip it when the budget is spent so the whole
        // call stays inside timeBudgetMs.
        const proven = Date.now() >= deadline
          || countSolutionsBounded(size, blockW, blockH, dug.values, 2, checkNodeCap(size) * 2) === 1;
        if (proven) return buildPuzzle(size, blockW, blockH, dug.values, solution, DIFFICULTIES[tier], attemptSeed);
        // unproven board: never carry it into the fallback
      } else if (best === null || dug.givens < best.givens) {
        best = { values: dug.values, solution, givens: dug.givens, seed: attemptSeed };
      }
    }
    if (Date.now() >= deadline) break;
  }

  if (best !== null && best.givens < n) {
    const tier = tierForGivens(size, best.givens);
    return buildPuzzle(size, blockW, blockH, best.values, best.solution, tier, best.seed);
  }

  // Last resort (budget used up before any hole was dug): a full board is
  // trivially unique, so it still satisfies the contract instead of throwing.
  const rng = makeRng(rootSeed);
  const solution = makeSolution(size, blockW, blockH, rng);
  const values = new Int8Array(n);
  for (let i = 0; i < n; i++) values[i] = solution[i];
  return buildPuzzle(size, blockW, blockH, values, solution, 'easy', rootSeed);
}
