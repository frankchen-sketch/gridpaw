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
 * Colour maths for the perceptual ramp. Why it exists: the original ramp
 * stepped the rows in HSL lightness, which is not perceptual. The same 8-point
 * HSL step measures ΔL* 6.1 on a warm hue but only 3.0 at cyan, so the cyan
 * column's row pairs fell to ΔE00 2.1–2.7 on 22 of 28 real daily boards —
 * visible, but it reads as "the same colour with dirt on it", and on the last
 * row it turns sorting into guesswork. Stepping the rows in CIELAB L* instead
 * gives every column the same perceived step, whatever its hue.
 */
function hslToRgbUnit(h: number, s: number, l: number): [number, number, number] {
  const hh = ((((h % 360) + 360) % 360) / 360);
  const ss = s / 100;
  const ll = l / 100;
  const a = ss * Math.min(ll, 1 - ll);
  const f = (n: number): number => {
    const k = (n + hh * 12) % 12;
    return ll - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

/** CIELAB L* (0–100) of an HSL colour, D65. */
function labL(h: number, s: number, l: number): number {
  const [r0, g0, b0] = hslToRgbUnit(h, s, l);
  const lin = (c: number): number => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const y = lin(r0) * 0.2126729 + lin(g0) * 0.7151522 + lin(b0) * 0.072175;
  const f = y > 216 / 24389 ? Math.cbrt(y) : (841 / 108) * y + 4 / 29;
  return 116 * f - 16;
}

/** HSL lightness (0–100) whose CIELAB L* equals `target` at this hue/sat. */
function lightForLabL(h: number, s: number, target: number): number {
  let lo = 0;
  let hi = 100;
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2;
    if (labL(h, s, mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Boards whose id sorts on/after this date use the perceptual ramp. Older ids
 * keep the original HSL ramp because the 30-day archive re-generates a board
 * from its id — a player should see the shades they actually solved.
 */
export const PERCEPTUAL_FROM = "2026-11-24";

/**
 * Build the canonical gradient: hue sweeps left→right, lightness sweeps
 * top→bottom.
 *
 * `perceptual` steps the rows in CIELAB L* (top 84–86 → bottom 45–48, with a
 * +12 saturation ramp) instead of HSL lightness. Measured over 300 seeds per
 * size, min row-to-row ΔE00 goes 4.8 / 3.0 / 2.2 / 2.5 → 13.6 / 9.2 / 6.1 /
 * 4.6 for 3×3…6×6, and the 6×6 special-case range is no longer needed.
 */
export function buildTarget(size: number, seed: number, perceptual: boolean): string[] {
  const rand = mulberry32(seed);
  // A little seeded jitter on the ramp endpoints so daily puzzles differ in
  // mood, not just in shuffle order. Same three rand() draws either way, so
  // an older id reproduces its palette to the digit.
  const hueStart = 12 + Math.floor(rand() * 24); // 12–36  (warm)
  const hueEnd = 268 + Math.floor(rand() * 34); // 268–302 (violet)
  const rTop = rand();
  const rBottom = rand();
  const sat = 62 + Math.floor(rand() * 10);

  const span = size === 1 ? 1 : size - 1;
  const hues: number[] = [];
  for (let c = 0; c < size; c++) hues.push(Math.round(hueStart + ((hueEnd - hueStart) * c) / span));
  const out: string[] = [];

  if (!perceptual) {
    // Legacy ramp — frozen: 3–5 walk 74–78% → 46–50%, 6×6 walks 80–83% → 36–39%.
    const wide = size >= 6;
    const lightTop = (wide ? 80 : 74) + Math.floor(rTop * 4);
    const lightBottom = wide ? 36 + Math.floor(rBottom * 4) : 46 + Math.floor(rBottom * 5);
    for (let r = 0; r < size; r++) {
      const light = lightTop + ((lightBottom - lightTop) * r) / span;
      for (let c = 0; c < size; c++) out.push(`hsl(${hues[c]} ${sat}% ${Math.round(light)}%)`);
    }
    return out;
  }

  // Perceptual ramp: equal L* steps for every column, any size. Bottom stops at
  // L* 45 rather than 40 and gains up to 12 points of saturation on the way:
  // at L* 40 a warm hue turns into muddy brown, which reads as "dirty" even
  // though the step is the largest one on the board.
  const lTop = 84 + Math.floor(rTop * 3); // L* 84–86
  // Span is pinned at 38–39 L* so rounding HSL lightness to whole points can
  // never squeeze a step under ~5.9 L*; the bottom lands at L* 46–49, which is
  // dark enough to read as "the deepest row" without turning warm hues to mud.
  const lBottom = lTop - 38 + Math.floor(rBottom * 2); // L* 46–49
  for (let r = 0; r < size; r++) {
    const targetL = lTop + ((lBottom - lTop) * r) / span;
    const rowSat = Math.round(sat + (12 * r) / span);
    for (let c = 0; c < size; c++) {
      out.push(`hsl(${hues[c]} ${rowSat}% ${Math.round(lightForLabL(hues[c], rowSat, targetL))}%)`);
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
  // ISO dates and the practice ids both sort correctly against the cutover:
  // anything that is not an older date ("practice-…", "board-…") gets the
  // perceptual ramp, i.e. every board a player can meet from here on.
  const target = buildTarget(n, seed, id >= PERCEPTUAL_FROM);
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
