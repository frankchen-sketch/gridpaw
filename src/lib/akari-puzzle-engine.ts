/**
 * MeowTrail — Akari (Light Up) Puzzle Engine
 *
 * Complete implementation of the Akari/Light Up logic puzzle rules:
 * - Grid with black cells (wall with optional number 0-4) and white cells
 * - Place light bulbs on white cells
 * - Each bulb illuminates row/column until blocked by a black cell
 * - No two bulbs may illuminate each other
 * - Numbered black cells must have exactly N adjacent bulbs
 * - All white cells must be illuminated
 *
 * Sizes: 5×5 to 12×12
 * Difficulties: easy, medium, hard, ultra
 */

// =============================================================================
// Types
// =============================================================================

/** Cell types on the grid */
export enum CellType {
  White = 0,       // Illuminable white cell
  Black = 1,       // Black wall cell (no number)
  Black0 = 2,      // Black cell with number 0
  Black1 = 3,      // Black cell with number 1
  Black2 = 4,      // Black cell with number 2
  Black3 = 5,      // Black cell with number 3
  Black4 = 6,      // Black cell with number 4
}

/** A single cell in the puzzle grid */
export interface Cell {
  type: CellType;
  bulb: boolean;       // Is a light bulb placed here?
  illuminated: boolean; // Is this white cell illuminated by any bulb?
}

/** A complete puzzle grid */
export interface Puzzle {
  size: number;
  difficulty: Difficulty;
  grid: Cell[][];
  seed?: string;       // Seed for reproducible generation
}

/** The result of a move validation */
export interface ValidationResult {
  valid: boolean;
  message: string;
  /** If invalid, the positions of conflicting bulbs or other issues */
  conflicts?: { row: number; col: number; reason: string }[];
}

/** A solved puzzle — one or more solutions */
export interface Solution {
  puzzle: Puzzle;
  solutions: { row: number; col: number }[][];
  unique: boolean;     // Is the solution unique?
  count: number;
}

/** Difficulty level */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'ultra';

/** Direction offsets for adjacency and illumination */
const DIRECTIONS = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
] as const;

/** Adjacent positions (orthogonal neighbors) */
const ADJACENT = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

// =============================================================================
// Seeded random number generator (Mulberry32)
// =============================================================================

/**
 * Creates a deterministic PRNG from a string seed.
 * Uses Mulberry32 algorithm.
 */
export function createSeededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  let state = h >>> 0;
  if (state === 0) state = 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a daily seed from a date string (YYYY-MM-DD).
 */
export function dailySeed(date: string): string {
  return `meowtrail-${date}`;
}

// =============================================================================
// Grid utilities
// =============================================================================

/**
 * Create an empty grid of the given size, filled with white cells.
 */
export function createEmptyGrid(size: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < size; c++) {
      row.push({ type: CellType.White, bulb: false, illuminated: false });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Deep-clone a grid.
 */
export function cloneGrid(grid: Cell[][]): Cell[][] {
  return grid.map((row) =>
    row.map((cell) => ({ ...cell }))
  );
}

/**
 * Check if a cell is a black cell (any variant).
 */
export function isBlack(type: CellType): boolean {
  return type !== CellType.White;
}

/**
 * Check if a cell is a numbered black cell.
 */
export function isNumberedBlack(type: CellType): boolean {
  return type >= CellType.Black0 && type <= CellType.Black4;
}

/**
 * Get the number on a black cell (0-4), or -1 if not numbered.
 */
export function getBlackNumber(type: CellType): number {
  if (type >= CellType.Black0 && type <= CellType.Black4) {
    return type - CellType.Black0;
  }
  return -1;
}

/**
 * Convert a number (0-4) to a CellType for black cells.
 */
export function numberToBlackType(n: number): CellType {
  if (n < 0 || n > 4) throw new Error(`Invalid black number: ${n}`);
  return (CellType.Black0 + n) as CellType;
}

// =============================================================================
// Illumination engine
// =============================================================================

/**
 * Recalculate illumination for all white cells in the grid.
 * Scans from each bulb in all four directions.
 * Returns the grid with updated `illuminated` flags (mutates in place).
 */
export function computeIllumination(grid: Cell[][]): Cell[][] {
  const size = grid.length;

  // Reset all illumination
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type === CellType.White) {
        grid[r][c].illuminated = false;
      }
    }
  }

  // For each bulb, cast light in four directions
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type === CellType.White && grid[r][c].bulb) {
        // The bulb cell itself is illuminated
        grid[r][c].illuminated = true;

        // Cast light in all four directions
        for (const [dr, dc] of DIRECTIONS) {
          let nr = r + dr;
          let nc = c + dc;
          while (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (isBlack(grid[nr][nc].type)) break;
            grid[nr][nc].illuminated = true;
            nr += dr;
            nc += dc;
          }
        }
      }
    }
  }

  return grid;
}

/**
 * Check if any two bulbs illuminate each other (i.e., are in the same
 * row or column with no black cell between them).
 */
export function bulbsSeeEachOther(grid: Cell[][]): { row: number; col: number }[] {
  const size = grid.length;
  const conflicts: { row: number; col: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type === CellType.White && grid[r][c].bulb) {
        // Check all four directions for another bulb
        for (const [dr, dc] of DIRECTIONS) {
          let nr = r + dr;
          let nc = c + dc;
          while (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (isBlack(grid[nr][nc].type)) break;
            if (grid[nr][nc].type === CellType.White && grid[nr][nc].bulb) {
              conflicts.push({ row: nr, col: nc });
              break; // Don't report beyond the first conflict in this direction
            }
            nr += dr;
            nc += dc;
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Count adjacent bulbs around a black cell.
 */
export function countAdjacentBulbs(grid: Cell[][], row: number, col: number): number {
  const size = grid.length;
  let count = 0;
  for (const [dr, dc] of ADJACENT) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      if (grid[nr][nc].type === CellType.White && grid[nr][nc].bulb) {
        count++;
      }
    }
  }
  return count;
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate a move: placing or removing a bulb at (row, col).
 *
 * @param puzzle - The current puzzle state
 * @param row - Row index
 * @param col - Column index
 * @param action - 'place' to add a bulb, 'remove' to remove one
 * @returns ValidationResult with conflicts if any rules are violated
 */
export function validateMove(
  puzzle: Puzzle,
  row: number,
  col: number,
  action: 'place' | 'remove'
): ValidationResult {
  const { grid, size } = puzzle;

  // Bounds check
  if (row < 0 || row >= size || col < 0 || col >= size) {
    return { valid: false, message: 'Position is out of bounds.' };
  }

  const cell = grid[row][col];

  // Can only place/remove on white cells
  if (isBlack(cell.type)) {
    return { valid: false, message: 'Cannot place a bulb on a black cell.' };
  }

  if (action === 'place') {
    if (cell.bulb) {
      return { valid: false, message: 'A bulb is already placed here.' };
    }

    // Check if this bulb would see another bulb
    const testGrid = cloneGrid(grid);
    testGrid[row][col].bulb = true;
    testGrid[row][col].illuminated = true;

    const seeConflicts = bulbsSeeEachOther(testGrid);
    if (seeConflicts.length > 0) {
      return {
        valid: false,
        message: 'Two bulbs cannot illuminate each other!',
        conflicts: [{ row, col, reason: 'This bulb would see another bulb' }, ...seeConflicts.map(c => ({ ...c, reason: 'This bulb is seen by another bulb' }))],
      };
    }

    // C4: Check number constraints — placing this bulb must not exceed any adjacent numbered black cell's count
    for (const [dr, dc] of ADJACENT) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && isNumberedBlack(testGrid[nr][nc].type)) {
        const expected = getBlackNumber(testGrid[nr][nc].type);
        const actual = countAdjacentBulbs(testGrid, nr, nc);
        if (actual > expected) {
          return {
            valid: false,
            message: `Placing a bulb here would exceed the ${expected} bulb(s) required by the adjacent black cell.`,
            conflicts: [{ row: nr, col: nc, reason: `Black cell expects ${expected} bulb(s), would have ${actual}` }],
          };
        }
      }
    }
  }

  if (action === 'remove') {
    if (!cell.bulb) {
      return { valid: false, message: 'No bulb to remove here.' };
    }
  }

  return { valid: true, message: 'Move is valid.' };
}

/**
 * Validate the entire puzzle solution.
 * Checks:
 * 1. No two bulbs see each other
 * 2. All numbered black cells have correct adjacent bulb count
 * 3. All white cells are illuminated
 *
 * Returns a list of all violations found.
 */
export function validatePuzzle(puzzle: Puzzle): ValidationResult {
  const { grid, size } = puzzle;

  // 1. Check bulbs don't see each other
  const seeConflicts = bulbsSeeEachOther(grid);
  if (seeConflicts.length > 0) {
    return {
      valid: false,
      message: `${seeConflicts.length} bulb(s) see each other.`,
      conflicts: seeConflicts.map(c => ({ ...c, reason: 'Bulbs see each other' })),
    };
  }

  // 2. Check numbered black cells
  const numberConflicts: { row: number; col: number; reason: string }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isNumberedBlack(grid[r][c].type)) {
        const expected = getBlackNumber(grid[r][c].type);
        const actual = countAdjacentBulbs(grid, r, c);
        if (actual !== expected) {
          numberConflicts.push({
            row: r,
            col: c,
            reason: `Black cell expects ${expected} bulb(s), found ${actual}`,
          });
        }
      }
    }
  }

  if (numberConflicts.length > 0) {
    return {
      valid: false,
      message: `${numberConflicts.length} number constraint(s) violated.`,
      conflicts: numberConflicts,
    };
  }

  // 3. Check all white cells are illuminated
  // W6: Clone grid before calling computeIllumination so we don't mutate the original
  const illumGrid = cloneGrid(grid);
  computeIllumination(illumGrid);
  const darkCells: { row: number; col: number; reason: string }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (illumGrid[r][c].type === CellType.White && !illumGrid[r][c].illuminated) {
        darkCells.push({ row: r, col: c, reason: 'White cell is not illuminated' });
      }
    }
  }

  if (darkCells.length > 0) {
    return {
      valid: false,
      message: `${darkCells.length} white cell(s) are not illuminated.`,
      conflicts: darkCells,
    };
  }

  return { valid: true, message: 'Puzzle is solved correctly! 🎉' };
}

// =============================================================================
// Solver (backtracking constraint solver)
// =============================================================================

/**
 * Apply constraint propagation as a pre-pass to the solver.
 *
 * For each numbered black cell:
 *  - If N = remaining adjacent candidates, place bulbs in all of them
 *  - If N = 0, block all remaining adjacent candidates (no bulbs allowed)
 *
 * Returns { forcedBulbs, blockedCells } as Sets of "row,col" keys, or null
 * if the puzzle is over-constrained (no solution possible).
 */
function propagateConstraints(
  grid: Cell[][],
  existingBulbs: Set<string>
): { forcedBulbs: Set<string>; blockedCells: Set<string> } | null {
  const size = grid.length;
  const forcedBulbs = new Set<string>();
  const blockedCells = new Set<string>();

  let changed = true;
  while (changed) {
    changed = false;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isNumberedBlack(grid[r][c].type)) continue;

        const expected = getBlackNumber(grid[r][c].type);

        // Count already-placed bulbs adjacent (existing + forced)
        let placedCount = 0;
        const adjacentCandidates: { row: number; col: number }[] = [];

        for (const [dr, dc] of ADJACENT) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (grid[nr][nc].type !== CellType.White) continue;

          const key = `${nr},${nc}`;
          if (grid[nr][nc].bulb || existingBulbs.has(key) || forcedBulbs.has(key)) {
            placedCount++;
          } else if (!blockedCells.has(key)) {
            adjacentCandidates.push({ row: nr, col: nc });
          }
        }

        // Over-constrained: more bulbs already placed than expected
        if (placedCount > expected) {
          return null;
        }

        const remaining = expected - placedCount;

        if (remaining === 0 && adjacentCandidates.length > 0) {
          // Block all remaining adjacent candidates
          for (const a of adjacentCandidates) {
            const key = `${a.row},${a.col}`;
            if (!blockedCells.has(key)) {
              blockedCells.add(key);
              changed = true;
            }
          }
        } else if (remaining === adjacentCandidates.length && adjacentCandidates.length > 0) {
          // Force bulbs in all adjacent candidates
          for (const a of adjacentCandidates) {
            const key = `${a.row},${a.col}`;
            if (!forcedBulbs.has(key)) {
              forcedBulbs.add(key);
              changed = true;
            }
          }
        }
      }
    }
  }

  return { forcedBulbs, blockedCells };
}

/**
 * Solve an Akari puzzle using backtracking with constraint propagation.
 *
 * Returns all solutions found (up to `maxSolutions` to avoid infinite loops
 * on puzzles with many solutions).
 */
export function solvePuzzle(
  puzzle: Puzzle,
  maxSolutions: number = 2
): Solution {
  const grid = cloneGrid(puzzle.grid);
  const size = puzzle.size;
  const solutions: { row: number; col: number }[][] = [];
  const allBulbs: { row: number; col: number }[] = [];

  // Collect existing bulbs
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type === CellType.White && grid[r][c].bulb) {
        allBulbs.push({ row: r, col: c });
      }
    }
  }

  // C2: Constraint propagation pre-pass
  const existingBulbSet = new Set(allBulbs.map(b => `${b.row},${b.col}`));
  const propagationResult = propagateConstraints(grid, existingBulbSet);

  // If over-constrained, return no solutions immediately
  if (propagationResult === null) {
    return {
      puzzle,
      solutions: [],
      unique: false,
      count: 0,
    };
  }

  const { forcedBulbs, blockedCells } = propagationResult;

  // Build the initial bulb list from existing bulbs + forced bulbs
  const initialBulbs: { row: number; col: number }[] = [...allBulbs];
  forcedBulbs.forEach((key: string) => {
    const [r, c] = key.split(',').map(Number);
    initialBulbs.push({ row: r, col: c });
  });

  // Find all white cells that could potentially hold a bulb
  // Exclude blocked cells and cells that already have bulbs or are forced
  const candidates: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type !== CellType.White) continue;
      const key = `${r},${c}`;
      if (grid[r][c].bulb || forcedBulbs.has(key)) continue;
      if (blockedCells.has(key)) continue;
      candidates.push({ row: r, col: c });
    }
  }

  // Backtracking solver
  function backtrack(index: number, currentBulbs: { row: number; col: number }[]): void {
    if (solutions.length >= maxSolutions) return;

    // Try placing a bulb at this candidate position
    if (index >= candidates.length) {
      // Check if the current configuration is a valid solution
      const testGrid = cloneGrid(grid);
      // Clear bulbs first, then set our current set
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (testGrid[r][c].type === CellType.White) {
            testGrid[r][c].bulb = false;
            testGrid[r][c].illuminated = false;
          }
        }
      }
      for (const b of currentBulbs) {
        testGrid[b.row][b.col].bulb = true;
      }
      computeIllumination(testGrid);

      const seeConflicts = bulbsSeeEachOther(testGrid);
      if (seeConflicts.length > 0) return;

      // Check number constraints
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (isNumberedBlack(testGrid[r][c].type)) {
            const expected = getBlackNumber(testGrid[r][c].type);
            const actual = countAdjacentBulbs(testGrid, r, c);
            if (actual !== expected) return;
          }
        }
      }

      // Check all white cells illuminated
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (testGrid[r][c].type === CellType.White && !testGrid[r][c].illuminated) {
            return;
          }
        }
      }

      // Valid solution found
      solutions.push([...currentBulbs]);
      return;
    }

    const { row, col } = candidates[index];

    // Optimisation: skip if this cell is already illuminated (no need to place a bulb)
    // but we still need to consider it if adjacent constraints require it
    // Prune: if placing a bulb here would violate number constraints, skip
    const canPlace = (() => {
      // Check if this cell would see another bulb
      for (const b of currentBulbs) {
        if (b.row === row) {
          // Check if any black cell between them
          const minC = Math.min(b.col, col);
          const maxC = Math.max(b.col, col);
          let blocked = false;
          for (let cc = minC + 1; cc < maxC; cc++) {
            if (isBlack(grid[row][cc].type)) { blocked = true; break; }
          }
          if (!blocked) return false;
        }
        if (b.col === col) {
          const minR = Math.min(b.row, row);
          const maxR = Math.max(b.row, row);
          let blocked = false;
          for (let rr = minR + 1; rr < maxR; rr++) {
            if (isBlack(grid[rr][col].type)) { blocked = true; break; }
          }
          if (!blocked) return false;
        }
      }

      // Check if placing would exceed any adjacent number constraint
      for (const [dr, dc] of ADJACENT) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && isNumberedBlack(grid[nr][nc].type)) {
          const expected = getBlackNumber(grid[nr][nc].type);
          let adjacentCount = 0;
          for (const b of currentBulbs) {
            if (Math.abs(b.row - nr) + Math.abs(b.col - nc) === 1) adjacentCount++;
          }
          // Also count if we're placing a bulb adjacent to this black cell
          if (adjacentCount + 1 > expected) return false;
        }
      }

      return true;
    })();

    // Branch 1: Place a bulb here
    if (canPlace) {
      backtrack(index + 1, [...currentBulbs, { row, col }]);
    }

    // Branch 2: Don't place a bulb here
    backtrack(index + 1, currentBulbs);
  }

  backtrack(0, [...initialBulbs]);

  // Restore original bulbs
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      grid[r][c].bulb = puzzle.grid[r][c].bulb;
    }
  }

  return {
    puzzle,
    solutions,
    unique: solutions.length === 1,
    count: solutions.length,
  };
}

// =============================================================================
// Puzzle Generator
// =============================================================================

/**
 * Difficulty configuration: controls the density of black cells and clues.
 * Easier puzzles have more numbered clues; harder puzzles have fewer.
 */
const DIFFICULTY_CONFIG: Record<Difficulty, {
  /** Base percentage of cells that are black */
  blackDensity: [number, number]; // [min, max] as fraction of total cells
  /** Probability that a black cell gets a number */
  numberProbability: [number, number]; // [min, max]
  /** Additional bulb removal for difficulty */
  extraBulbRemoval: number; // 0..1, fraction of bulbs to try removing beyond minimum
}> = {
  easy: {
    blackDensity: [0.25, 0.35],
    numberProbability: [0.6, 0.8],
    extraBulbRemoval: 0.1,
  },
  medium: {
    blackDensity: [0.30, 0.40],
    numberProbability: [0.5, 0.7],
    extraBulbRemoval: 0.2,
  },
  hard: {
    blackDensity: [0.35, 0.45],
    numberProbability: [0.3, 0.5],
    extraBulbRemoval: 0.3,
  },
  ultra: {
    blackDensity: [0.35, 0.50],
    numberProbability: [0.2, 0.4],
    extraBulbRemoval: 0.4,
  },
};

/**
 * Generate an Akari puzzle.
 *
 * Algorithm:
 * 1. Start with an empty grid and place black cells
 * 2. Place bulbs on white cells to form a valid solution
 * 3. Add numbers on black cells based on adjacent bulbs
 * 4. Remove bulbs one by one, ensuring unique solution remains
 *
 * @param size - Grid size (5-12)
 * @param difficulty - Difficulty level
 * @param seed - Optional seed for reproducible generation
 * @returns A fully generated puzzle (with an internal solution stored)
 */
export function generatePuzzle(
  size: number,
  difficulty: Difficulty,
  seed?: string
): Puzzle {
  // Validate size
  const clampedSize = Math.max(5, Math.min(12, size));
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // C1: Use a modified seed per attempt so retries produce different layouts
    const attemptSeed = seed
      ? `${seed}-${attempt}`
      : `fallback-${Math.random()}`;
    const rng = createSeededRandom(attemptSeed);

    const config = DIFFICULTY_CONFIG[difficulty];

    // Step 1: Create empty grid
    const grid = createEmptyGrid(clampedSize);

    // Step 2: Place black cells
    const blackDensity = config.blackDensity[0] + rng() * (config.blackDensity[1] - config.blackDensity[0]);
    const targetBlackCount = Math.floor(clampedSize * clampedSize * blackDensity);

    // Place black cells with some structure (avoiding too many isolated white cells)
    let blackPlaced = 0;
    let attempts = 0;
    while (blackPlaced < targetBlackCount && attempts < targetBlackCount * 5) {
      attempts++;
      const r = Math.floor(rng() * clampedSize);
      const c = Math.floor(rng() * clampedSize);
      if (!isBlack(grid[r][c].type)) {
        // Don't place black cells adjacent to each other too often
        // (Akari puzzles need corridors for light to travel)
        let adjacentBlack = 0;
        for (const [dr, dc] of ADJACENT) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < clampedSize && nc >= 0 && nc < clampedSize && isBlack(grid[nr][nc].type)) {
            adjacentBlack++;
          }
        }
        if (adjacentBlack <= 2 || rng() > 0.7) {
          grid[r][c].type = CellType.Black;
          blackPlaced++;
        }
      }
    }

    // Step 3: Place bulbs to form a valid solution
    // We use a heuristic: place bulbs greedily, then refine
    const bulbs = placeBulbsHeuristic(grid, rng);
    for (const b of bulbs) {
      grid[b.row][b.col].bulb = true;
    }

    // Verify the heuristic found a valid solution
    computeIllumination(grid);

    // Check if any white cells are unilluminated — add more bulbs if needed
    const unlit = findUnlitWhiteCells(grid);
    for (const u of unlit) {
      grid[u.row][u.col].bulb = true;
    }
    computeIllumination(grid);

    // C1: Check if any bulbs conflict (see each other)
    const bulbConflicts = bulbsSeeEachOther(grid);
    if (bulbConflicts.length > 0) {
      // Retry generation with a different seed
      continue;
    }

    // Step 4: Assign numbers to black cells
    for (let r = 0; r < clampedSize; r++) {
      for (let c = 0; c < clampedSize; c++) {
        if (isBlack(grid[r][c].type)) {
          const adjacent = countAdjacentBulbs(grid, r, c);
          if (adjacent > 0) {
            // Decide whether to show the number
            const numberProb = config.numberProbability[0] + rng() * (config.numberProbability[1] - config.numberProbability[0]);
            if (rng() < numberProb) {
              grid[r][c].type = numberToBlackType(adjacent);
            }
          }
          // If adjacent is 0, can still show "0" to help players
          // (decided by probability)
        }
      }
    }

    // Step 5: Remove bulbs while preserving unique solution
    const bulbPositions = getAllBulbPositions(grid);
    // Shuffle bulbs for removal order
    shuffleArray(bulbPositions, rng);

    let removed = 0;
    const targetRemoval = Math.max(1, Math.floor(bulbPositions.length * (0.3 + config.extraBulbRemoval)));

    for (const b of bulbPositions) {
      if (removed >= targetRemoval) break;

      // Temporarily remove this bulb
      grid[b.row][b.col].bulb = false;

      // Check if solution is still unique
      const testPuzzle: Puzzle = {
        size: clampedSize,
        difficulty,
        grid: cloneGrid(grid),
      };

      const solution = solvePuzzle(testPuzzle, 2);
      if (solution.unique && solution.count === 1) {
        // Also verify the solution is the same as our original
        removed++;
      } else {
        // Restore the bulb — it's essential for uniqueness
        grid[b.row][b.col].bulb = true;
      }
    }

    // C3: Validate the final puzzle has at least one solution
    const finalPuzzle: Puzzle = {
      size: clampedSize,
      difficulty,
      grid: cloneGrid(grid),
    };
    const finalSolution = solvePuzzle(finalPuzzle, 1);
    if (finalSolution.count === 0) {
      // No solution — retry generation
      continue;
    }

    // Reset illumination for the puzzle state (player will compute it)
    for (let r = 0; r < clampedSize; r++) {
      for (let c = 0; c < clampedSize; c++) {
        if (grid[r][c].type === CellType.White) {
          grid[r][c].illuminated = false;
        }
      }
    }

    return {
      size: clampedSize,
      difficulty,
      grid,
      seed,
    };
  }

  // Should rarely happen — fallback to a simple puzzle
  throw new Error('Failed to generate a valid puzzle after maximum attempts.');
}

/**
 * Generate a daily puzzle seeded by date.
 *
 * @param date - Date string in YYYY-MM-DD format
 * @param size - Grid size (default 7 for daily challenge)
 * @returns A deterministic puzzle for that date
 */
export function generateDailyPuzzle(date: string, size: number = 7): Puzzle {
  const seed = dailySeed(date);
  // Daily puzzles are medium difficulty
  return generatePuzzle(size, 'medium', seed);
}

// =============================================================================
// Internal helpers
// =============================================================================

/**
 * Place bulbs greedily on a grid to form a valid solution skeleton.
 * This is a heuristic — not guaranteed to find a perfect solution.
 *
 * W4: Considers both horizontal (row) and vertical (column) runs to
 * place bulbs more evenly across the grid.
 */
function placeBulbsHeuristic(grid: Cell[][], rng: () => number): { row: number; col: number }[] {
  const size = grid.length;
  const bulbs: { row: number; col: number }[] = [];

  // Strategy: scan rows and columns, place bulbs to cover gaps
  // For each row, find runs of white cells and place bulbs strategically

  // --- Horizontal pass: scan rows ---
  for (let r = 0; r < size; r++) {
    const row = grid[r];
    // Find runs of consecutive white cells
    let runStart = -1;
    for (let c = 0; c <= size; c++) {
      if (c < size && !isBlack(row[c].type)) {
        if (runStart === -1) runStart = c;
      } else {
        if (runStart !== -1) {
          const runEnd = c - 1;
          const runLength = runEnd - runStart + 1;
          // Place a bulb in the middle-ish of each run
          if (runLength >= 1) {
            const bulbCol = runStart + Math.floor(runLength / 2);
            // Check if placing here would conflict with existing bulbs vertically
            let conflict = false;
            for (const b of bulbs) {
              if (b.row === r && b.col === bulbCol) { conflict = true; break; }
              // Check vertical line of sight
              if (b.col === bulbCol) {
                const minR = Math.min(b.row, r);
                const maxR = Math.max(b.row, r);
                let blocked = false;
                for (let rr = minR + 1; rr < maxR; rr++) {
                  if (isBlack(grid[rr][bulbCol].type)) { blocked = true; break; }
                }
                if (!blocked) { conflict = true; break; }
              }
            }
            if (!conflict) {
              bulbs.push({ row: r, col: bulbCol });
            }
          }
          runStart = -1;
        }
      }
    }
  }

  // --- Vertical pass: scan columns ---
  // This catches runs that horizontal scanning missed, ensuring better coverage
  for (let c = 0; c < size; c++) {
    // Find runs of consecutive white cells in this column
    let runStart = -1;
    for (let r = 0; r <= size; r++) {
      if (r < size && !isBlack(grid[r][c].type)) {
        if (runStart === -1) runStart = r;
      } else {
        if (runStart !== -1) {
          const runEnd = r - 1;
          const runLength = runEnd - runStart + 1;
          // Place a bulb in the middle of each run
          if (runLength >= 1) {
            const bulbRow = runStart + Math.floor(runLength / 2);
            // Check if placing here would conflict with existing bulbs horizontally
            let conflict = false;
            for (const b of bulbs) {
              if (b.row === bulbRow && b.col === c) { conflict = true; break; }
              // Check horizontal line of sight
              if (b.row === bulbRow) {
                const minC = Math.min(b.col, c);
                const maxC = Math.max(b.col, c);
                let blocked = false;
                for (let cc = minC + 1; cc < maxC; cc++) {
                  if (isBlack(grid[bulbRow][cc].type)) { blocked = true; break; }
                }
                if (!blocked) { conflict = true; break; }
              }
            }
            if (!conflict) {
              bulbs.push({ row: bulbRow, col: c });
            }
          }
          runStart = -1;
        }
      }
    }
  }

  return bulbs;
}

/**
 * Find all white cells that are not illuminated.
 */
function findUnlitWhiteCells(grid: Cell[][]): { row: number; col: number }[] {
  const size = grid.length;
  const unlit: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type === CellType.White && !grid[r][c].bulb && !grid[r][c].illuminated) {
        unlit.push({ row: r, col: c });
      }
    }
  }
  return unlit;
}

/**
 * Get all bulb positions from the grid.
 */
function getAllBulbPositions(grid: Cell[][]): { row: number; col: number }[] {
  const size = grid.length;
  const positions: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type === CellType.White && grid[r][c].bulb) {
        positions.push({ row: r, col: c });
      }
    }
  }
  return positions;
}

/**
 * Fisher-Yates shuffle using a seeded RNG.
 */
function shuffleArray<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}