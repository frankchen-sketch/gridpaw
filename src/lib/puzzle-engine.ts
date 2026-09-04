/**
 * MeowBlock — Rectangle Partition Puzzle Engine
 *
 * Rules:
 * 1. N×M grid, some cells have numbers (1-9)
 * 2. Player drags to draw rectangles
 * 3. Rectangle area = the number it contains
 * 4. Each rectangle contains exactly one number
 * 5. Rectangles don't overlap
 * 6. All cells must be covered
 */

// =============================================================================
// Types
// =============================================================================

export interface NumberCell {
  row: number;
  col: number;
  value: number;
}

export interface Rect {
  top: number;
  left: number;
  height: number;
  width: number;
  value: number;
}

export interface Puzzle {
  width: number;
  height: number;
  numbers: NumberCell[];
  /** 答案分区（生成时即确定）：hint 直接查表，避免运行时求解卡死主线程 */
  solutionRects?: Rect[];
}

export interface PuzzleSolution {
  rects: Rect[];
  unique: boolean;
  count: number;
}

// =============================================================================
// Solver (Backtracking + MRV)
// =============================================================================

/**
 * Get all legal rectangles for a number cell on the current grid state.
 */
export function getCandidateRects(
  num: NumberCell,
  occupied: boolean[][],
  W: number,
  H: number
): Rect[] {
  const { row, col, value } = num;
  const candidates: Rect[] = [];

  for (let a = 1; a <= value; a++) {
    if (value % a !== 0) continue;
    const b = value / a;

    for (const [rh, rw] of [[a, b], [b, a]]) {
      if (rh > H || rw > W) continue;

      const topMin = Math.max(0, row - rh + 1);
      const topMax = Math.min(row, H - rh);
      const leftMin = Math.max(0, col - rw + 1);
      const leftMax = Math.min(col, W - rw);

      if (topMin > topMax || leftMin > leftMax) continue;

      for (let top = topMin; top <= topMax; top++) {
        for (let left = leftMin; left <= leftMax; left++) {
          const rect: Rect = { top, left, height: rh, width: rw, value };
          if (canPlace(rect, occupied, W, H)) {
            candidates.push(rect);
          }
        }
      }
    }
  }

  return candidates;
}

function canPlace(rect: Rect, occupied: boolean[][], W: number, H: number): boolean {
  if (rect.top < 0 || rect.left < 0) return false;
  if (rect.top + rect.height > H || rect.left + rect.width > W) return false;
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      if (occupied[r][c]) return false;
    }
  }
  return true;
}

function placeRect(rect: Rect, occupied: boolean[][]): void {
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      occupied[r][c] = true;
    }
  }
}

function removeRect(rect: Rect, occupied: boolean[][]): void {
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      occupied[r][c] = false;
    }
  }
}

/**
 * Solve puzzle with MRV heuristic. Returns all solutions (up to maxSolutions).
 */
export function solve(puzzle: Puzzle, maxSolutions = 2): Rect[][] {
  const { width: W, height: H, numbers } = puzzle;
  const occupied: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));
  const solutions: Rect[][] = [];
  const remaining = new Set(numbers.map((_, i) => i));

  backtrackMRV(numbers, remaining, occupied, [], solutions, W, H, maxSolutions);
  return solutions;
}

function backtrackMRV(
  numbers: NumberCell[],
  remaining: Set<number>,
  occupied: boolean[][],
  placed: Rect[],
  solutions: Rect[][],
  W: number,
  H: number,
  maxSolutions: number
): void {
  if (solutions.length >= maxSolutions) return;

  if (remaining.size === 0) {
    if (occupied.every(row => row.every(cell => cell))) {
      // Deduplicate: sort rects by position to create canonical form
      const key = placed.map(r => `${r.top},${r.left},${r.height},${r.width}`).sort().join('|');
      const isDupe = solutions.some(existing => {
        const ek = existing.map(r => `${r.top},${r.left},${r.height},${r.width}`).sort().join('|');
        return ek === key;
      });
      if (!isDupe) solutions.push([...placed]);
    }
    return;
  }

  // MRV: find number with fewest candidates
  let bestIdx = -1;
  let bestCandidates: Rect[] = [];
  let minOptions = Infinity;

  for (const idx of remaining) {
    const candidates = getCandidateRects(numbers[idx], occupied, W, H);
    if (candidates.length < minOptions) {
      minOptions = candidates.length;
      bestIdx = idx;
      bestCandidates = candidates;
      if (minOptions === 0) return; // dead end
    }
  }

  remaining.delete(bestIdx);

  for (const rect of bestCandidates) {
    placeRect(rect, occupied);
    placed.push(rect);
    backtrackMRV(numbers, remaining, occupied, placed, solutions, W, H, maxSolutions);
    removeRect(rect, occupied);
    placed.pop();
    if (solutions.length >= maxSolutions) break;
  }

  remaining.add(bestIdx);
}

// =============================================================================
// Generator
// =============================================================================

/**
 * Generate a valid rectangle partition, then pick one number per rectangle.
 */
export function generatePuzzle(W: number, H: number): Puzzle | null {
  const rects = partitionGrid(W, H);
  if (!rects || rects.length === 0) return null;

  const numbers: NumberCell[] = rects.map(rect => {
    const r = rect.top + Math.floor(Math.random() * rect.height);
    const c = rect.left + Math.floor(Math.random() * rect.width);
    return { row: r, col: c, value: rect.height * rect.width };
  });

  const puzzle: Puzzle = { width: W, height: H, numbers, solutionRects: rects };
  const solutions = solve(puzzle, 2);

  if (solutions.length === 1) {
    return puzzle;
  }

  return null; // not unique, retry
}

/**
 * Recursively partition a grid into rectangles.
 */
function partitionGrid(W: number, H: number): Rect[] | null {
  if (W <= 0 || H <= 0) return null;
  if (W === 1 && H === 1) return [{ top: 0, left: 0, height: 1, width: 1, value: 1 }];

  // Small areas: return as single rectangle
  if (W * H <= 6) {
    return [{ top: 0, left: 0, height: H, width: W, value: W * H }];
  }

  // Randomly choose split direction
  const splitVertical = W >= H ? (Math.random() > 0.3) : (Math.random() < 0.3);

  if (splitVertical && W > 1) {
    const cut = 1 + Math.floor(Math.random() * (W - 1));
    const left = partitionGridRects(0, 0, H, cut);
    const right = partitionGridRects(0, cut, H, W - cut);
    if (left && right) return [...left, ...right];
  } else if (H > 1) {
    const cut = 1 + Math.floor(Math.random() * (H - 1));
    const top = partitionGridRects(0, 0, cut, W);
    const bottom = partitionGridRects(cut, 0, H - cut, W);
    if (top && bottom) return [...top, ...bottom];
  }

  return [{ top: 0, left: 0, height: H, width: W, value: W * H }];
}

function partitionGridRects(topOff: number, leftOff: number, H: number, W: number): Rect[] | null {
  if (W <= 0 || H <= 0) return null;
  if (W === 1 && H === 1) return [{ top: topOff, left: leftOff, height: 1, width: 1, value: 1 }];
  if (W * H <= 6) return [{ top: topOff, left: leftOff, height: H, width: W, value: W * H }];

  const splitVertical = W >= H ? (Math.random() > 0.3) : (Math.random() < 0.3);

  if (splitVertical && W > 1) {
    const cut = 1 + Math.floor(Math.random() * (W - 1));
    const left = partitionGridRects(topOff, leftOff, H, cut);
    const right = partitionGridRects(topOff, leftOff + cut, H, W - cut);
    if (left && right) return [...left, ...right];
  } else if (H > 1) {
    const cut = 1 + Math.floor(Math.random() * (H - 1));
    const top = partitionGridRects(topOff, leftOff, cut, W);
    const bottom = partitionGridRects(topOff + cut, leftOff, H - cut, W);
    if (top && bottom) return [...top, ...bottom];
  }

  return [{ top: topOff, left: leftOff, height: H, width: W, value: W * H }];
}

/**
 * Generate a puzzle WITHOUT uniqueness verification (instant, any size).
 * The partition itself IS a valid solution, so the puzzle is always solvable.
 */
export function generatePuzzleFast(W: number, H: number): Puzzle | null {
  const rects = partitionGrid(W, H);
  if (!rects || rects.length === 0) return null;

  const numbers: NumberCell[] = rects.map(rect => {
    const r = rect.top + Math.floor(Math.random() * rect.height);
    const c = rect.left + Math.floor(Math.random() * rect.width);
    return { row: r, col: c, value: rect.height * rect.width };
  });

  return { width: W, height: H, numbers, solutionRects: rects };
}

/**
 * Generate with retry.
 */
export function generatePuzzleWithRetry(W: number, H: number, maxAttempts = 100): Puzzle | null {
  for (let i = 0; i < maxAttempts; i++) {
    const puzzle = generatePuzzle(W, H);
    if (puzzle) return puzzle;
  }
  return null;
}

// =============================================================================
// Seeded Random (for daily puzzles)
// =============================================================================

/** Simple seeded PRNG (mulberry32) */
export function createSeededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a date string into a numeric seed */
function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a daily puzzle seeded by date string (YYYY-MM-DD).
 * Same date always produces the same puzzle worldwide.
 */
export function generateDailyPuzzle(dateStr: string, size: number): Puzzle | null {
  const seed = dateSeed(dateStr);
  const rng = createSeededRandom(seed);

  // Override Math.random temporarily for generation
  const origRandom = Math.random;
  Math.random = rng;

  try {
    // For large grids (>7), use fast generation (no uniqueness check)
    // The partition itself is a valid solution
    if (size > 7) {
      for (let i = 0; i < 50; i++) {
        const puzzle = generatePuzzleFast(size, size);
        if (puzzle) return puzzle;
      }
      return null;
    }

    // For small grids, use full generation with uniqueness verification
    for (let i = 0; i < 200; i++) {
      const puzzle = generatePuzzle(size, size);
      if (puzzle) return puzzle;
    }
    return null;
  } finally {
    Math.random = origRandom;
  }
}

// =============================================================================
// Validation (for runtime player checking)
// =============================================================================

/**
 * Check if a player's rectangle placement is valid.
 */
export function validatePlacement(
  rect: Rect,
  puzzle: Puzzle,
  occupied: boolean[][]
): { valid: boolean; reason?: string } {
  const { width: W, height: H } = puzzle;

  // Bounds check
  if (rect.top < 0 || rect.left < 0 ||
      rect.top + rect.height > H || rect.left + rect.width > W) {
    return { valid: false, reason: 'Out of bounds' };
  }

  // Overlap check
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      if (occupied[r][c]) return { valid: false, reason: 'Overlaps existing rectangle' };
    }
  }

  // Must contain exactly one number
  const numsInside = puzzle.numbers.filter(n =>
    n.row >= rect.top && n.row < rect.top + rect.height &&
    n.col >= rect.left && n.col < rect.left + rect.width
  );
  if (numsInside.length !== 1) {
    return { valid: false, reason: `Contains ${numsInside.length} numbers (need exactly 1)` };
  }

  // Area must match
  const area = rect.height * rect.width;
  if (area !== numsInside[0].value) {
    return { valid: false, reason: `Area ${area} ≠ number ${numsInside[0].value}` };
  }

  return { valid: true };
}
