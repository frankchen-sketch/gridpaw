/**
 * Gradient Puzzle engine — GridPaw's daily colour-gradient tile sorter.
 *
 * Board model: `target` is the canonical colour list in row-major order
 * (index i belongs to cell i). `board[cell] = colourIndex` is a permutation of
 * 0..n-1. The puzzle is solved when board[i] === i for every cell.
 *
 * Deterministic: `generate(size, id)` with a date id produces the same puzzle
 * for every visitor (daily mode), while `id = 'practice-<rand>'` gives a fresh
 * one. No DOM access here — bundling is done by scripts/bundle-engine.mjs into
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

/** Local-time YYYY-MM-DD — the daily puzzle id. */
export function dailyId(d?: Date): string {
  const date = d || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  const lightTop = 74 + Math.floor(rand() * 4); // ~74–78%
  const lightBottom = 46 + Math.floor(rand() * 5); // ~46–51%
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

export function isSolved(p: GradientPuzzle, board?: number[]): boolean {
  const b = board || p.board;
  if (b.length !== p.target.length) return false;
  for (let i = 0; i < b.length; i++) if (b[i] !== i) return false;
  return true;
}

export function misplacedCount(p: GradientPuzzle, board?: number[]): number {
  const b = board || p.board;
  let wrong = 0;
  for (let i = 0; i < b.length; i++) if (b[i] !== i) wrong++;
  return wrong;
}

/**
 * Hint: find a cell that is wrong whose colour belongs in another wrong cell,
 * so swapping the two fixes exactly one tile. Returns null when solved.
 */
export function hint(p: GradientPuzzle, board?: number[]): { from: number; to: number } | null {
  const b = board || p.board;
  for (let i = 0; i < b.length; i++) {
    if (b[i] === i) continue;
    const wanted = i;
    for (let j = 0; j < b.length; j++) {
      if (j === i) continue;
      if (b[j] === wanted && b[i] !== j) return { from: i, to: j };
    }
  }
  // Fallback: any two misplaced cells.
  const wrong: number[] = [];
  for (let i = 0; i < b.length; i++) if (b[i] !== i) wrong.push(i);
  if (wrong.length >= 2) return { from: wrong[0], to: wrong[1] };
  return null;
}

/** Swap two cells in place-safe fashion (returns a new array). */
export function swap(board: number[], a: number, b: number): number[] {
  const out = board.slice();
  const tmp = out[a];
  out[a] = out[b];
  out[b] = tmp;
  return out;
}
