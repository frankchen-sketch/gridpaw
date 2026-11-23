/**
 * Gradient Puzzle engine — GridPaw's daily colour-gradient tile sorter.
 *
 * Board model: `target` is the canonical colour list in row-major order
 * (index i belongs to cell i). `board[cell] = colourIndex` is a permutation of
 * 0..n-1. The puzzle is solved when board[i] === i for every cell, and a tile
 * sitting in its home cell is LOCKED: the UI must not move it again, and
 * hint() never proposes moving a locked cell either.
 *
 * Deterministic: `generate(size, id)` with a date id produces the same puzzle
 * for every visitor on that local date; `id = 'practice-<rand>'` gives a fresh
 * one. The day boundary is the player's LOCAL midnight (product decision — the
 * FAQ on /huepaw/ must say so, and must NOT claim a single worldwide board).
 *
 * No DOM access here — bundling is done by scripts/bundle-engine.mjs into
 * public/gradient-engine.js (global `GradientEngine`).
 */

export interface GradientPuzzle {
  id: string;
  size: number;
  /** CSS colours, canonical order (index = correct cell). */
  target: string[];
  /** board[cell] = colour index currently sitting in that cell. */
  board: number[];
}

/** 32-bit string hash (FNV-1a variant) so a date string seeds a PRNG. */
function hash32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Local-time YYYY-MM-DD — the daily puzzle id (rolls over at local midnight). */
export function dailyId(d?: Date): string {
  const date = d || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Daily board size by weekday (Date#getDay(): 0=Sun … 6=Sat) → [3,5,4,5,4,5,4].
 * Sunday 3×3, Monday 5×5, Tuesday 4×4, Wednesday 5×5, Thursday 4×4,
 * Friday 5×5, Saturday 4×4. The page FAQ must quote this mapping verbatim.
 */
const DAILY_SIZES = [3, 5, 4, 5, 4, 5, 4];

export function dailySize(d?: Date): number {
  const date = d || new Date();
  return DAILY_SIZES[date.getDay()];
}

/**
 * Build the canonical gradient: hue sweeps left→right, lightness sweeps
 * top→bottom. Two axes keep neighbouring swatches distinguishable at 3×3
 * (9 tiles) up to 5×5 (25 tiles).
 */
export function buildTarget(size: number, seed: number): string[] {
  const rand = mulberry32(seed);
  // A little seeded jitter on the ramp endpoints so daily puzzles differ in
  // mood, not just in shuffle order.
  const hueStart = 12 + Math.floor(rand() * 24); // 12–36  (warm)
  const hueEnd = 268 + Math.floor(rand() * 34); // 268–302 (violet)
  // 6×6 的明度只有 5 段台阶时，相邻两行 ΔE00 会掉到 1.33（人眼不可辨 = 只能瞎换），
  // 所以只对 size>=6 放宽区间（80–83 → 36–39，相邻行 ΔE00 ≈ 4）；3–5 保持原参数，
  // 历史盘逐位不变（rand() 调用次数相同，determinism 不受影响）。
  const wide = size >= 6;
  const lightTop = (wide ? 80 : 74) + Math.floor(rand() * 4); // 3–5: 74–78% / 6×6: 80–83%
  const lightBottom = wide ? 36 + Math.floor(rand() * 4) : 46 + Math.floor(rand() * 5); // 3–5: 46–51% / 6×6: 36–39%
  const sat = 62 + Math.floor(rand() * 10);

  const out: string[] = [];
  const span = size === 1 ? 1 : size - 1;
  for (let r = 0; r < size; r++) {
    const light = lightTop + ((lightBottom - lightTop) * r) / span;
    for (let c = 0; c < size; c++) {
      const hue = hueStart + ((hueEnd - hueStart) * c) / span;
      out.push(`hsl(${Math.round(hue)} ${sat}% ${Math.round(light)}%)`);
    }
  }
  return out;
}

function misplacedRatio(board: number[]): number {
  let wrong = 0;
  for (let i = 0; i < board.length; i++) if (board[i] !== i) wrong++;
  return wrong / board.length;
}

/** Deterministic shuffle: never returns an already-solved board. */
function shuffled(n: number, rand: () => number): number[] {
  const order: number[] = [];
  for (let i = 0; i < n; i++) order.push(i);
  for (let attempt = 0; attempt < 40; attempt++) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }
    if (misplacedRatio(order) >= 0.85) break;
  }
  if (misplacedRatio(order) === 0) {
    // Degenerate guard: rotate by one so the board is never solved on load.
    order.push(order.shift() as number);
  }
  return order;
}

/** Generate a puzzle. `size` is clamped to 3..6; `id` seeds the shuffle. */
export function generate(size: number, id: string): GradientPuzzle {
  const n = Math.max(3, Math.min(6, Math.floor(size) || 5));
  const seed = hash32(id);
  const target = buildTarget(n, seed);
  const board = shuffled(n * n, mulberry32(seed ^ 0x9e3779b9));
  return { id, size: n, target, board };
}

export function misplacedCount(p: GradientPuzzle, board?: number[]): number {
  const b = board || p.board;
  let wrong = 0;
  for (let i = 0; i < b.length; i++) if (b[i] !== i) wrong++;
  return wrong;
}

export function isSolved(p: GradientPuzzle, board?: number[]): boolean {
  const b = board || p.board;
  // 长度必须对得上：截短/空的棋板（[0,1]、[]）不能被当成"已解"
  if (b.length !== p.target.length) return false;
  return misplacedCount(p, b) === 0;
}

/** A tile is locked once it sits in its home cell. Locked tiles never move. */
export function isLocked(board: number[], cell: number): boolean {
  return board[cell] === cell;
}

/** Swap two cells (returns a new array). Locked cells are rejected. */
export function swap(board: number[], a: number, b: number): number[] {
  if (a === b || isLocked(board, a) || isLocked(board, b)) return board.slice();
  const out = board.slice();
  const tmp = out[a];
  out[a] = out[b];
  out[b] = tmp;
  return out;
}

/**
 * Hint: return the pair of unlocked tiles whose swap removes the most
 * misplaced tiles, guaranteeing a strict decrease.
 *
 * Why the rewrite: the previous version walked to the first cell whose colour
 * sat in another cell and returned that pair. It could hand back a no-op —
 * 3 of 6,000 generated boards kept the same misplaced count after the
 * suggested swap, and the constructed board [3,2,1,0] returned {0,1}, which
 * changed nothing. The UI copy promises a hint that advances the board, so the
 * algorithm has to hold that promise. Locked (already-correct) cells are never
 * proposed — swapping one would break the lock rule.
 */
export function hint(p: GradientPuzzle, board?: number[]): { from: number; to: number } | null {
  const b = board || p.board;
  const before = misplacedCount(p, b);
  if (before === 0) return null;

  const movable: number[] = [];
  for (let i = 0; i < b.length; i++) if (!isLocked(b, i)) movable.push(i);

  let best: { from: number; to: number; wrong: number } | null = null;
  for (let a = 0; a < movable.length; a++) {
    for (let c = a + 1; c < movable.length; c++) {
      const i = movable[a];
      const j = movable[c];
      const after = misplacedCount(p, swap(b, i, j));
      if (best === null || after < best.wrong) best = { from: i, to: j, wrong: after };
      if (after === before - 2) return { from: i, to: j }; // both tiles land home
    }
  }
  if (best && best.wrong < before) return { from: best.from, to: best.to };
  return null; // unreachable for a permutation board; kept as a safety net
}
