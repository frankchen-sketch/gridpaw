/**
 * Nonogram (Picross / Griddler) engine — GridPaw.
 *
 * Rules: row/col clues are run-lengths of filled cells; fill every cell so all
 * clues match. Cells: 1 = filled, 0 = empty, unknown handled separately.
 *
 * Solver architecture (mirrors puzzle-game-engine skill):
 * 1. lineOptions(clues, states) — enumerate ALL placements of one line's runs
 *    consistent with known cell states. n ≤ 15 keeps this cheap (capped 5000).
 * 2. lineSolve — fixpoint propagation: intersect every line's options; cells
 *    where all options agree become known (filled/empty). 0 options = fail.
 * 3. solveNonogram — lineSolve + MRV backtracking (branch unknown cells),
 *    count solutions up to maxCount for uniqueness checks.
 *
 * Generator: random density fill → derive clues → solve count=2. Easy/Medium
 * additionally require PURE lineSolve solvability (human-friendly); Hard allows
 * light backtracking. Non-unique grids are simply retried (unlike kakuro, where
 * random fills were ~0% unique and a repair loop was mandatory — nonogram line
 * constraints are much tighter, uniqueness hit-rate is high).
 *
 * Authored CAT_PATTERNS power tutorials + early campaign: the reveal IS a cat
 * (nonogram's payoff no other GridPaw game has).
 */

export interface NonogramPuzzle {
  rows: number;
  cols: number;
  rowClues: number[][];
  colClues: number[][];
  solution: number[]; // flat, 1 = filled, 0 = empty
  name: string; // art label ("Cat", "Random #123")
  daily?: boolean;
}

export const CELL_UNKNOWN = 0;
export const CELL_FILLED = 1;
export const CELL_EMPTY = 2;

export function makeRng(seed?: number): () => number {
  if (seed === undefined) return Math.random;
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Derive run-length clues for one line of 0/1 values. */
function lineClues(line: number[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === 1) run++;
    else if (run > 0) { out.push(run); run = 0; }
  }
  if (run > 0) out.push(run);
  return out.length ? out : [0]; // 0 = empty line convention
}

/** Extract row/col clues from a flat solution grid. */
export function deriveClues(rows: number, cols: number, solution: number[]): { rowClues: number[][]; colClues: number[][] } {
  const rowClues: number[][] = [];
  const colClues: number[][] = [];
  for (let r = 0; r < rows; r++) rowClues.push(lineClues(solution.slice(r * cols, r * cols + cols)));
  for (let c = 0; c < cols; c++) {
    const col: number[] = [];
    for (let r = 0; r < rows; r++) col.push(solution[r * cols + c]);
    colClues.push(lineClues(col));
  }
  return { rowClues, colClues };
}

/**
 * All arrangements of `clues` on a line of `states` length.
 * states: CELL_UNKNOWN / CELL_FILLED / CELL_EMPTY.
 * Each returned line: 1 = filled, 2 = empty (full assignment, no unknowns).
 * Cap 5000 options (safety for huge clue sets).
 */
export function lineOptions(clues: number[], states: number[]): number[][] {
  const n = states.length;
  const out: number[][] = [];
  const effective = clues.filter((c) => c > 0);
  if (effective.length === 0) {
    // empty line: every cell must be empty-able
    for (let i = 0; i < n; i++) if (states[i] === CELL_FILLED) return out;
    const res: number[] = new Array(n).fill(CELL_EMPTY);
    out.push(res);
    return out;
  }
  const cur = new Array(n).fill(0);

  function rec(idx: number, pos: number): void {
    if (out.length >= 5000) return;
    if (idx >= effective.length) {
      for (let i = pos; i < n; i++) if (states[i] === CELL_FILLED) return;
      const res = cur.slice();
      for (let i = pos; i < n; i++) res[i] = CELL_EMPTY;
      for (let i = 0; i < pos; i++) if (res[i] === 0) res[i] = CELL_EMPTY;
      out.push(res);
      return;
    }
    const len = effective[idx];
    let rem = 0;
    for (let k = idx; k < effective.length; k++) rem += effective[k];
    rem += effective.length - idx - 1; // separators
    for (let p = pos; p + len <= n && p + rem <= n; p++) {
      // gap cells [pos, p): cannot be filled
      let ok = true;
      for (let i = pos; i < p; i++) if (states[i] === CELL_FILLED) { ok = false; break; }
      if (!ok) continue;
      // run cells [p, p+len): cannot be known-empty
      for (let i = p; i < p + len; i++) if (states[i] === CELL_EMPTY) { ok = false; break; }
      if (!ok) continue;
      // separator cell p+len (when it exists and more runs follow) cannot be filled;
      // for the LAST run, a trailing separator is required whenever p+len < n
      if (p + len < n && states[p + len] === CELL_FILLED) continue;
      // place run
      for (let i = p; i < p + len; i++) cur[i] = CELL_FILLED;
      rec(idx + 1, p + len + 1);
      // restore only cells we own (unknown ones)
      for (let i = p; i < p + len; i++) if (states[i] === CELL_UNKNOWN) cur[i] = 0;
    }
  }
  rec(0, 0);
  return out;
}

export interface LineSolveResult {
  states: number[]; // full grid, flat
  complete: boolean;
  failed: boolean;
}

/**
 * Pure line-logic fixpoint propagation. Returns complete=true when every cell
 * is known; failed=true when some line has zero valid arrangements.
 */
export function lineSolve(p: { rows: number; cols: number; rowClues: number[][]; colClues: number[][] }, initial?: number[]): LineSolveResult {
  const { rows, cols, rowClues, colClues } = p;
  const states: number[] = initial ? initial.slice() : new Array(rows * cols).fill(CELL_UNKNOWN);
  let changed = true;
  while (changed) {
    changed = false;
    // rows
    for (let r = 0; r < rows; r++) {
      const line = states.slice(r * cols, r * cols + cols);
      const opts = lineOptions(rowClues[r], line);
      if (opts.length === 0) return { states, complete: false, failed: true };
      for (let c = 0; c < cols; c++) {
        if (states[r * cols + c] !== CELL_UNKNOWN) continue;
        const first = opts[0][c];
        let agree = true;
        for (let k = 1; k < opts.length; k++) {
          if (opts[k][c] !== first) { agree = false; break; }
        }
        if (agree) {
          states[r * cols + c] = first === 1 ? CELL_FILLED : CELL_EMPTY;
          changed = true;
        }
      }
    }
    // cols
    for (let c = 0; c < cols; c++) {
      const line: number[] = [];
      for (let r = 0; r < rows; r++) line.push(states[r * cols + c]);
      const opts = lineOptions(colClues[c], line);
      if (opts.length === 0) return { states, complete: false, failed: true };
      for (let r = 0; r < rows; r++) {
        if (states[r * cols + c] !== CELL_UNKNOWN) continue;
        const first = opts[0][r];
        let agree = true;
        for (let k = 1; k < opts.length; k++) {
          if (opts[k][r] !== first) { agree = false; break; }
        }
        if (agree) {
          states[r * cols + c] = first === 1 ? CELL_FILLED : CELL_EMPTY;
          changed = true;
        }
      }
    }
  }
  let complete = true;
  for (let i = 0; i < states.length; i++) {
    if (states[i] === CELL_UNKNOWN) { complete = false; break; }
  }
  return { states, complete, failed: false };
}

export interface NonogramSolveResult {
  count: number; // -1 = aborted (node budget)
  solution: number[] | null; // first solution, flat 0/1
}

/**
 * Count solutions (up to maxCount) via lineSolve propagation + MRV backtracking.
 * maxNodes caps work (aborted → count -1).
 */
export function solveNonogram(
  p: { rows: number; cols: number; rowClues: number[][]; colClues: number[][] },
  maxCount = 2,
  maxNodes = 200000
): NonogramSolveResult {
  const { rows, cols } = p;
  const total = rows * cols;
  let nodes = 0;
  let aborted = false;
  let count = 0;
  let first: number[] | null = null;
  const states = new Array(total).fill(CELL_UNKNOWN);

  function toBinary(): number[] {
    const out: number[] = new Array(total).fill(0);
    for (let i = 0; i < total; i++) out[i] = states[i] === CELL_FILLED ? 1 : 0;
    return out;
  }

  function search(): void {
    if (count >= maxCount || aborted) return;
    nodes++;
    if (nodes > maxNodes) { aborted = true; return; }
    const ls = lineSolve(p, states);
    if (ls.failed) return;
    // merge deduced states
    let unknownAt: number[] = [];
    for (let i = 0; i < total; i++) {
      if (ls.states[i] !== CELL_UNKNOWN) states[i] = ls.states[i];
      else if (states[i] === CELL_UNKNOWN) unknownAt.push(i);
    }
    if (unknownAt.length === 0) {
      count++;
      if (!first) first = toBinary();
      return;
    }
    // MRV-lite: branch on the unknown cell adjacent to the most constrained
    // area — cheap heuristic: first unknown (line constraints dominate anyway)
    const pick = unknownAt[0];
    for (const v of [CELL_FILLED, CELL_EMPTY]) {
      states[pick] = v;
      search();
      states[pick] = CELL_UNKNOWN;
      if (count >= maxCount || aborted) return;
    }
  }

  search();
  return { count: aborted ? -1 : count, solution: first };
}

/** Player-facing win check: player grid (0/1/2) filled cells match solution. */
export function checkNonogramWin(
  p: { rows: number; cols: number; solution: number[] },
  grid: number[] // 0/1/2 player states
): boolean {
  for (let i = 0; i < p.rows * p.cols; i++) {
    const filled = grid[i] === CELL_FILLED;
    const should = p.solution[i] === 1;
    if (filled !== should) return false;
  }
  return true;
}

/** Cross-check: solution satisfies its own clues (generator sanity). */
export function cluesMatchSolution(p: NonogramPuzzle): boolean {
  const { rowClues, colClues } = deriveClues(p.rows, p.cols, p.solution);
  const eq = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);
  for (let r = 0; r < p.rows; r++) if (!eq(rowClues[r], p.rowClues[r])) return false;
  for (let c = 0; c < p.cols; c++) if (!eq(colClues[c], p.colClues[c])) return false;
  return true;
}

// ── Authored cat patterns (tutorial + early campaign payoff) ────────────────

function pat(rows: string[]): number[] {
  const out: number[] = [];
  for (const row of rows) for (const ch of row) out.push(ch === '#' ? 1 : 0);
  return out;
}

/** 5×5 patterns */
const CAT_FACE_5: number[] = pat([
  '.#.#.',
  '#####',
  '.###.',
  '.#.#.',
  '.###.',
]);
const HEART_5: number[] = pat([
  '.#.#.',
  '#####',
  '#####',
  '.###.',
  '..#..',
]);
const CAT_FACE_7: number[] = pat([
  '..#.#..',
  '.#####.',
  '#######',
  '#.###.#',
  '#######',
  '.#####.',
  '..#.#..',
]);
const CAT_10: number[] = pat([
  '..#...#...',
  '.###.###..',
  '#########.',
  '#########.',
  '#########.',
  '.#######..',
  '.#######..',
  '..#####...',
  '..#...#...',
  '.#.....#..',
]);

export const CAT_PATTERNS: { name: string; rows: number; cols: number; solution: number[] }[] = [
  { name: 'Cat Face', rows: 5, cols: 5, solution: CAT_FACE_5 },
  { name: 'Heart', rows: 5, cols: 5, solution: HEART_5 },
  { name: 'Cat Whiskers', rows: 7, cols: 7, solution: CAT_FACE_7 },
  { name: 'Big Cat', rows: 10, cols: 10, solution: CAT_10 },
];

/** Build a puzzle from an authored pattern (clues derived + validated). */
export function fromPattern(pattern: { name: string; rows: number; cols: number; solution: number[] }): NonogramPuzzle | null {
  const { rowClues, colClues } = deriveClues(pattern.rows, pattern.cols, pattern.solution);
  const p: NonogramPuzzle = {
    rows: pattern.rows,
    cols: pattern.cols,
    rowClues,
    colClues,
    solution: pattern.solution.slice(),
    name: pattern.name,
  };
  return cluesMatchSolution(p) ? p : null;
}

// ── Generator ────────────────────────────────────────────────────────────────

export interface NonogramGenOptions {
  rows: number;
  cols: number;
  density?: number; // fill probability (default 0.5)
  requireLineSolvable?: boolean; // pure line-logic solvable (no backtracking)
  seed?: number;
  timeBudgetMs?: number;
  name?: string;
}

/**
 * Generate a unique nonogram. Retries random grids; each attempt costs one
 * solve (fast: line constraints prune aggressively). Requires pure lineSolve
 * solvability when asked (Easy/Medium = guaranteed human-solvable by logic).
 */
export function generateNonogramPuzzle(opts: NonogramGenOptions): NonogramPuzzle | null {
  const rng = makeRng(opts.seed);
  const density = opts.density === undefined ? 0.5 : opts.density;
  const budget = opts.timeBudgetMs === undefined ? 20000 : opts.timeBudgetMs;
  const t0 = Date.now();
  const total = opts.rows * opts.cols;
  let tries = 0;
  while (Date.now() - t0 < budget) {
    tries++;
    const solution: number[] = new Array(total).fill(0);
    for (let i = 0; i < total; i++) solution[i] = rng() < density ? 1 : 0;
    // avoid degenerate (near-empty / near-full) grids
    let filled = 0;
    for (let i = 0; i < total; i++) filled += solution[i];
    if (filled < total * 0.35 || filled > total * 0.65) continue;
    const { rowClues, colClues } = deriveClues(opts.rows, opts.cols, solution);
    const p = { rows: opts.rows, cols: opts.cols, rowClues, colClues };
    if (opts.requireLineSolvable) {
      const ls = lineSolve(p);
      if (!ls.complete || ls.failed) continue;
    } else {
      const res = solveNonogram(p, 2);
      if (res.count !== 1) continue;
    }
    return {
      rows: opts.rows,
      cols: opts.cols,
      rowClues,
      colClues,
      solution,
      name: opts.name || (opts.seed !== undefined ? 'Daily' : 'Generated'),
      daily: opts.seed !== undefined,
    };
  }
  return null;
}

// ── Difficulty presets & campaign ───────────────────────────────────────────

export interface NonogramDifficultyPreset {
  key: string;
  rows: number;
  cols: number;
  density: number;
  requireLineSolvable: boolean;
  label: string;
}

export const NONOGRAM_DIFFICULTIES: Record<string, NonogramDifficultyPreset> = {
  easy: { key: 'easy', rows: 5, cols: 5, density: 0.5, requireLineSolvable: true, label: 'Easy' },
  medium: { key: 'medium', rows: 10, cols: 10, density: 0.5, requireLineSolvable: true, label: 'Medium' },
  hard: { key: 'hard', rows: 15, cols: 15, density: 0.55, requireLineSolvable: false, label: 'Hard' },
};

/** Tutorials: authored cats, escalating concepts. */
export interface NonogramTutorialDef {
  title: string;
  lesson: string;
  pattern: { name: string; rows: number; cols: number; solution: number[] };
}

export const NONOGRAM_TUTORIALS: NonogramTutorialDef[] = [
  {
    title: 'Clues are run lengths',
    lesson: 'Each number is the length of a filled block in that line, in order. A "3" means 3 filled cells in a row. Try filling a line to match its clue.',
    pattern: CAT_PATTERNS[1], // Heart 5×5 — symmetric, forgiving
  },
  {
    title: 'Gaps must exist',
    lesson: 'Blocks never touch: "2 2" means a 2-block, at least one empty cell, then another 2-block. Watch the spaces between numbers.',
    pattern: CAT_PATTERNS[0], // Cat Face 5×5
  },
  {
    title: 'Edge pinning',
    lesson: 'A big clue that touches an edge pins cells instantly: 5 in a 5-wide line fills the whole line. Corners and edges are free deductions.',
    pattern: CAT_PATTERNS[2], // Cat Whiskers 7×7
  },
  {
    title: 'Cross logic',
    lesson: 'Rows and rows alone stall — but a column clue can finish what a row started. Alternate between them and the picture emerges.',
    pattern: CAT_PATTERNS[3], // Big Cat 10×10
  },
];

/** Build a tutorial puzzle (clues derived at runtime — never hardcoded). */
export function generateNonogramTutorial(def: NonogramTutorialDef): NonogramPuzzle | null {
  return fromPattern(def.pattern);
}
