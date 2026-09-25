/**
 * Nurikabe engine — GridPaw.
 *
 * Rules: number clues give the size of their island (connected white cells,
 * exactly one clue per island); all sea (black) cells form one connected mass;
 * no 2×2 block of sea; islands may not touch orthogonally.
 *
 * Cell states: CELL_UNKNOWN=0, CELL_SEA=1, CELL_ISLAND=2.
 *
 * Solver architecture (mirrors puzzle-game-engine skill):
 * 1. propagateNurikabe — pure constraint deductions to a fixpoint:
 *    a) per-clue island region BFS (can't cross sea or other clues);
 *       region too small → fail; region exactly full → all island; island
 *       count complete → rest of region is sea.
 *    b) 2×2 sea rule: three sea in a 2×2 forces the fourth island.
 *    c) island adjacency: an island cell touching another clue, or an island
 *       cell of a different clue region, is a contradiction.
 * 2. solveNurikabe — propagate + MRV backtracking, count solutions (cap 2)
 *    for uniqueness; complete grids get a final sea-connectivity + island
 *    shape validation.
 *
 * Generation (unlike kakuro/nonogram there is no line algebra, so we build
 * valid solutions directly): place islands by random-walk growth, remaining
 * cells are sea; validate sea connectivity + no 2×2 sea; derive clues; then
 * require unique solution (and pure-propagation solvability for Easy/Medium).
 * Rejection sampling — each attempt is sub-millisecond.
 */

export const CELL_UNKNOWN = 0;
export const CELL_SEA = 1;
export const CELL_ISLAND = 2;

export interface NurikabePuzzle {
  rows: number;
  cols: number;
  clues: { idx: number; size: number }[]; // idx = flat cell index
  solution: number[]; // flat 1=sea 2=island
  name: string;
  daily?: boolean;
}

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

const NEI = (rows: number, cols: number, idx: number): number[] => {
  const r = Math.floor(idx / cols), c = idx % cols;
  const out: number[] = [];
  if (r > 0) out.push(idx - cols);
  if (r < rows - 1) out.push(idx + cols);
  if (c > 0) out.push(idx - 1);
  if (c < cols - 1) out.push(idx + 1);
  return out;
};

/** Flat index of a clue's island cells in the SOLUTION (for adjacency tests). */
function islandOf(p: { rows: number; cols: number }, clues: { idx: number; size: number }[], solution: number[], clueIdx: number): Set<number> {
  const seen = new Set<number>([clueIdx]);
  const stack = [clueIdx];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const n of NEI(p.rows, p.cols, cur)) {
      if (!seen.has(n) && solution[n] === CELL_ISLAND) { seen.add(n); stack.push(n); }
    }
  }
  return seen;
}

export function cluesMatchSolution(p: NurikabePuzzle): boolean {
  const { rows, cols, clues, solution } = p;
  // 1. every clue cell is island
  for (const c of clues) if (solution[c.idx] !== CELL_ISLAND) return false;
  // 2. island components == clue count, each exactly one clue, correct size
  const total = rows * cols;
  const seen = new Array(total).fill(false);
  let comps = 0;
  for (let i = 0; i < total; i++) {
    if (solution[i] !== CELL_ISLAND || seen[i]) continue;
    comps++;
    let cells = 0, clueCount = 0;
    const stack = [i];
    seen[i] = true;
    while (stack.length) {
      const cur = stack.pop()!;
      cells++;
      if (clues.some((c) => c.idx === cur)) clueCount++;
      for (const n of NEI(rows, cols, cur)) {
        if (!seen[n] && solution[n] === CELL_ISLAND) { seen[n] = true; stack.push(n); }
      }
    }
    if (clueCount !== 1) return false;
    const clue = clues.find((c) => c.idx >= 0 && islandContains(p, clues, solution, c.idx, i));
    if (!clue || clue.size !== cells) return false;
  }
  if (comps !== clues.length) return false;
  // 3. sea connected + no 2×2 sea
  let seaStart = -1;
  for (let i = 0; i < total; i++) if (solution[i] === CELL_SEA) { seaStart = i; break; }
  if (seaStart < 0) return false;
  const seenSea = new Array(total).fill(false);
  let seaCount = 0;
  const stack = [seaStart];
  seenSea[seaStart] = true;
  while (stack.length) {
    const cur = stack.pop()!;
    seaCount++;
    for (const n of NEI(rows, cols, cur)) {
      if (!seenSea[n] && solution[n] === CELL_SEA) { seenSea[n] = true; stack.push(n); }
    }
  }
  for (let i = 0; i < total; i++) if (solution[i] === CELL_SEA && !seenSea[i]) return false;
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const i = r * cols + c;
      if (solution[i] === CELL_SEA && solution[i + 1] === CELL_SEA && solution[i + cols] === CELL_SEA && solution[i + cols + 1] === CELL_SEA) return false;
    }
  }
  return true;
}

function islandContains(p: { rows: number; cols: number }, clues: { idx: number; size: number }[], solution: number[], clueIdx: number, cell: number): boolean {
  return islandOf(p, clues, solution, clueIdx).has(cell);
}

/**
 * Pure propagation to a fixpoint. Mutates and returns states.
 * complete = no unknowns left; failed = contradiction.
 */
export function propagateNurikabe(
  p: { rows: number; cols: number; clues: { idx: number; size: number }[] },
  states: number[]
): { complete: boolean; failed: boolean } {
  const { rows, cols, clues } = p;
  const total = rows * cols;
  const clueAt = new Map<number, number>();
  for (const c of clues) clueAt.set(c.idx, c.size);

  let changed = true;
  while (changed) {
    changed = false;

    // (a) per-clue island analysis — SOUND formulation:
    // comp    = clue + island cells connected to it through ISLAND cells only
    //           (two adjacent island cells are always the same island in any
    //            valid completion, so this traversal cannot jump to a foreign
    //            island — that would be an adjacency contradiction already)
    // region  = UNKNOWN cells reachable from comp through UNKNOWN cells only;
    //           sea, other clues, and foreign island cells are all walls.
    // The island must grow exclusively into `region`.
    for (const clue of clues) {
      const comp = new Set<number>([clue.idx]);
      const cstack = [clue.idx];
      while (cstack.length) {
        const cur = cstack.pop()!;
        // the clue cell itself is an island member even while state=unknown:
        // traverse from it; only add ISLAND-state neighbors
        for (const n of NEI(rows, cols, cur)) {
          if (comp.has(n) || states[n] !== CELL_ISLAND) continue;
          if (clueAt.has(n)) continue; // foreign clue cell → adjacency fail anyway
          comp.add(n);
          cstack.push(n);
        }
      }
      const islandCount = comp.size; // clue counts as 1 even while state unknown
      if (islandCount > clue.size) return { complete: false, failed: true };
      const need = clue.size - islandCount;
      // growth region through UNKNOWN cells
      const region = new Set<number>();
      const rstack: number[] = [...comp];
      while (rstack.length) {
        const cur = rstack.pop()!;
        for (const n of NEI(rows, cols, cur)) {
          if (region.has(n) || comp.has(n)) continue;
          if (states[n] !== CELL_UNKNOWN) continue; // sea / island / (foreign) all walls
          if (clueAt.has(n)) continue; // other clue = wall
          region.add(n);
          rstack.push(n);
        }
      }
      const unknownInRegion = [...region].filter((i) => states[i] === CELL_UNKNOWN);
      if (region.size < need) return { complete: false, failed: true };
      if (need === 0) {
        // island complete: only the frontier (unknown cells ADJACENT to comp)
        // is forced sea — farther unknowns may belong to other islands;
        // comp cells themselves (e.g. an unknown-state clue) stay island
        for (const c of comp) {
          for (const n of NEI(rows, cols, c)) {
            if (states[n] === CELL_UNKNOWN && !comp.has(n)) { states[n] = CELL_SEA; changed = true; }
          }
        }
      } else if (unknownInRegion.length === need) {
        // room is exactly exhausted: every region cell MUST join this island
        for (const i of unknownInRegion) { states[i] = CELL_ISLAND; changed = true; }
      }
    }

    // (b) 2×2 sea rule
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const i = r * cols + c;
        const q = [i, i + 1, i + cols, i + cols + 1];
        const sea = q.filter((x) => states[x] === CELL_SEA);
        const unknown = q.filter((x) => states[x] === CELL_UNKNOWN);
        if (sea.length === 3 && unknown.length === 1) {
          states[unknown[0]] = CELL_ISLAND;
          changed = true;
        } else if (sea.length === 4) {
          return { complete: false, failed: true };
        }
      }
    }

    // (d) unreachable cells must be sea: for each unknown cell, if for EVERY
    // clue the cell lies farther (BFS through unknowns) than that clue's
    // remaining growth capacity, no island can ever claim it
    {
      // multi-source BFS per clue would be costly; do one BFS per clue but
      // bounded by its need (cells beyond need need no distance record)
      const best = new Int16Array(total).fill(9999); // min over clues of dist
      const inComp = new Set<number>();
      for (const clue of clues) {
        const comp = new Set<number>([clue.idx]);
        const cstack = [clue.idx];
        while (cstack.length) {
          const cur = cstack.pop()!;
          for (const n of NEI(rows, cols, cur)) {
            if (comp.has(n) || states[n] !== CELL_ISLAND) continue;
            if (clueAt.has(n)) continue;
            comp.add(n);
            cstack.push(n);
          }
        }
        const need = clue.size - comp.size;
        if (need <= 0) continue;
        // BFS from comp through unknown cells, depth-capped at need
        const dist = new Map<number, number>();
        const q: [number, number][] = [...comp].map((c) => [c, 0]);
        for (const [c] of q) dist.set(c, 0);
        while (q.length) {
          const [cur, d] = q.shift()!;
          if (d >= need) continue;
          for (const n of NEI(rows, cols, cur)) {
            if (dist.has(n) || states[n] !== CELL_UNKNOWN) continue;
            if (clueAt.has(n)) continue;
            dist.set(n, d + 1);
            q.push([n, d + 1]);
          }
        }
        for (const c of comp) inComp.add(c);
        for (const [n, d] of dist) {
          if (n === clue.idx || comp.has(n)) continue;
          if (d < best[n]) best[n] = d;
        }
      }
      for (let i = 0; i < total; i++) {
        if (states[i] !== CELL_UNKNOWN || inComp.has(i)) continue;
        if (best[i] === 9999) {
          // no clue can reach this cell within its remaining capacity → sea
          states[i] = CELL_SEA;
          changed = true;
        }
      }
    }
    // two clue cells orthogonally adjacent = their islands touch = contradiction.
    // (a non-clue island cell next to a clue cell may legally be that clue's own
    // island — connectivity can be established later, so we must not fail here.)
    for (const clue of clues) {
      for (const n of NEI(rows, cols, clue.idx)) {
        if (states[n] === CELL_ISLAND && clueAt.has(n)) return { complete: false, failed: true };
      }
    }
  }
  let complete = true;
  for (let i = 0; i < total; i++) if (states[i] === CELL_UNKNOWN) { complete = false; break; }
  return { complete, failed: false };
}

/** Can island cell i reach clue cell n through island cells (same island)? */

export interface NurikabeSolveResult {
  count: number; // -1 = aborted
  solution: number[] | null;
  solutions: number[][]; // up to maxCount distinct solutions
}

/** Count solutions up to maxCount (2) via propagation + backtracking. */
export function solveNurikabe(
  p: { rows: number; cols: number; clues: { idx: number; size: number }[] },
  maxCount = 2,
  maxNodes = 200000
): NurikabeSolveResult {
  const { rows, cols } = p;
  const total = rows * cols;
  let nodes = 0;
  let aborted = false;
  let count = 0;
  const solutions: number[][] = [];

  function finalValid(st: number[]): boolean {
    // sea connected, no 2×2 (implied by propagation but verify), islands valid
    const full = { rows, cols, clues: p.clues };
    return cluesMatchSolution({ ...full, clues: p.clues, solution: st.map((v) => (v === CELL_ISLAND ? CELL_ISLAND : CELL_SEA)) as number[] });
  }

  function search(st: number[]): void {
    if (count >= maxCount || aborted) return;
    nodes++;
    if (nodes > maxNodes) { aborted = true; return; }
    const st2 = st.slice();
    const res = propagateNurikabe(p, st2);
    if (res.failed) return;
    // MRV-lite: branch on an unknown cell adjacent to a clue first (most constrained)
    let pick = -1;
    for (let i = 0; i < total; i++) {
      if (st2[i] !== CELL_UNKNOWN) continue;
      if (NEI(rows, cols, i).some((n) => p.clues.some((c) => c.idx === n))) { pick = i; break; }
    }
    if (pick < 0) for (let i = 0; i < total; i++) if (st2[i] === CELL_UNKNOWN) { pick = i; break; }
    if (pick < 0) {
      if (finalValid(st2)) {
        count++;
        solutions.push(st2.map((v) => (v === CELL_ISLAND ? CELL_ISLAND : CELL_SEA)));
      }
      return;
    }
    for (const v of [CELL_ISLAND, CELL_SEA]) {
      st2[pick] = v;
      search(st2);
      st2[pick] = CELL_UNKNOWN;
      if (count >= maxCount || aborted) return;
    }
  }

  search(new Array(total).fill(CELL_UNKNOWN));
  return { count: aborted ? -1 : count, solution: solutions[0] ?? null, solutions };
}

/**
 * Repair a structurally valid puzzle to a UNIQUE solution (kakuro
 * repairToUnique strategy): solve for 2 solutions; while 2 exist, apply a
 * structure edit on a differing cell — grow a neighbouring island into a
 * disputed sea cell, or shrink/remove a disputed island cell — validate the
 * edited grid with cluesMatchSolution, and re-solve. Converges fast because
 * every edit directly eliminates a difference between the two solutions.
 */
function repairToUnique(
  p: NurikabePuzzle,
  rng: () => number,
  deadline: number
): NurikabePuzzle | null {
  let cur: NurikabePuzzle = { ...p, clues: p.clues.map((c) => ({ ...c })), solution: p.solution.slice() };
  let rounds = 0;
  while (Date.now() < deadline) {
    rounds++;
    if (rounds > 400) return null;
    const res = solveNurikabe(cur, 2, 8000000);
    if (res.count === 1) return cur;
    if (res.count === 0) return null;
    const s0 = cur.solution;
    if (res.count !== 2 || res.solutions.length < 2) return null; // aborted or 0 → rebuild
    const s1 = res.solutions[1];
    const diff: number[] = [];
    for (let i = 0; i < s0.length; i++) if (s0[i] !== s1[i]) diff.push(i);
    // shuffle candidates
    for (let i = diff.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [diff[i], diff[j]] = [diff[j], diff[i]];
    }
    let edited = false;
    for (const c of diff) {
      if (s0[c] === CELL_SEA && s1[c] === CELL_ISLAND) {
        // grow: attach c to an adjacent island (if exactly one candidate island
        // touches c — attaching where two islands touch is invalid anyway)
        const touching = new Set<number>();
        for (const n of NEI(cur.rows, cur.cols, c)) {
          if (s0[n] !== CELL_ISLAND) continue;
          const clueIdx = cur.clues.find((cl) => islandOf(cur, cur.clues, s0, cl.idx).has(n))?.idx;
          if (clueIdx !== undefined) touching.add(clueIdx);
        }
        if (touching.size === 1) {
          const clueIdx = [...touching][0];
          const clue = cur.clues.find((cl) => cl.idx === clueIdx)!;
          const next = {
            ...cur,
            clues: cur.clues.map((cl) => (cl.idx === clueIdx ? { idx: clueIdx, size: cl.size + 1 } : cl)),
            solution: s0.map((v, i) => (i === c ? CELL_ISLAND : v)),
          };
          if (cluesMatchSolution(next)) { cur = next; edited = true; break; }
        }
      } else if (s0[c] === CELL_ISLAND && s1[c] === CELL_SEA) {
        // shrink: remove c from its island (drop island if it would vanish)
        const clue = cur.clues.find((cl) => islandOf(cur, cur.clues, s0, cl.idx).has(c));
        if (!clue) continue;
        if (clue.size <= 2) continue; // island would vanish; skip (keep it simple)
        const next = {
          ...cur,
          clues: cur.clues.map((cl) => (cl.idx === clue.idx ? { idx: clue.idx, size: cl.size - 1 } : cl)),
          solution: s0.map((v, i) => (i === c ? CELL_SEA : v)),
        };
        if (cluesMatchSolution(next)) { cur = next; edited = true; break; }
      }
    }
    if (!edited) return null;
  }
  return null;
}

/** Player win: player grid (0/1/2) — island cells match solution islands. */
export function checkNurikabeWin(p: NurikabePuzzle, grid: number[]): boolean {
  for (let i = 0; i < p.solution.length; i++) {
    const markedIsland = grid[i] === CELL_ISLAND;
    if (markedIsland !== (p.solution[i] === CELL_ISLAND)) return false;
  }
  return true;
}

// ── Generation ───────────────────────────────────────────────────────────────

export interface NurikabeGenOptions {
  rows: number;
  cols: number;
  minIsland?: number; // default 2
  maxIsland?: number; // default 5
  seed?: number;
  timeBudgetMs?: number;
  requirePropSolvable?: boolean;
  name?: string;
}

/** Grow one island by random walk; returns false on collision/edge failure. */
function growIsland(
  rows: number, cols: number, rng: () => number,
  owner: Int8Array, clue: number[], size: number, startIdx: number
): boolean {
  // start cell must not touch a completed island either
  if (NEI(rows, cols, startIdx).some((n) => owner[n] === 2)) return false;
  const cells = [startIdx];
  owner[startIdx] = 1;
  clue[startIdx] = size;
  let guard = 0;
  while (cells.length < size && guard++ < 200) {
    const from = cells[Math.floor(rng() * cells.length)];
    const nbs = NEI(rows, cols, from).filter((n) => owner[n] === 0);
    if (nbs.length === 0) continue;
    const pick = nbs[Math.floor(rng() * nbs.length)];
    // island cells must not orthogonally touch other islands: all free neighbors of pick must not be island... they aren't (owner 0). But pick's OTHER neighbors must not belong to another island:
    const touchingOther = NEI(rows, cols, pick).some((n) => owner[n] === 2);
    if (touchingOther) continue;
    owner[pick] = 1;
    cells.push(pick);
  }
  return cells.length === size;
}

/**
 * Sea-snake construction: the sea is a single self-avoiding walk (connected by
 * construction) that never completes a 2×2 all-sea block (incremental check).
 * The complement's connected components are the islands — automatically
 * non-touching, one clue each. Rejection is then only over island sizes, so
 * nearly every construction is structurally valid and the budget is spent on
 * repairToUnique instead of rejection sampling.
 */
function buildSeaSnake(rows: number, cols: number, rng: () => number, targetSea: number): { sea: boolean[]; islands: number[][] } | null {
  const total = rows * cols;
  const sea = new Array<boolean>(total).fill(false);
  const makes2x2 = (idx: number): boolean => {
    const r = Math.floor(idx / cols), c = idx % cols;
    for (const [r0, c0] of [[r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c]] as const) {
      if (r0 < 0 || c0 < 0 || r0 + 1 >= rows || c0 + 1 >= cols) continue;
      const base = r0 * cols + c0;
      const q = [base, base + 1, base + cols, base + cols + 1];
      if (q.every((x) => x === idx || sea[x])) return true;
    }
    return false;
  };
  let count = 0;
  let cur = Math.floor(rng() * total);
  sea[cur] = true;
  count++;
  const path = [cur];
  const inPath = new Set<number>([cur]);
  let idle = 0;
  while (count < targetSea && path.length > 0) {
    const nbs = NEI(rows, cols, cur).filter((n) => !sea[n] && !inPath.has(n) && !makes2x2(n));
    if (nbs.length === 0) {
      // retreat; the abandoned cell stays sea as a connected dead-end leaf
      path.pop();
      if (path.length === 0) break;
      cur = path[path.length - 1];
      if (++idle > total * 4) break;
      continue;
    }
    idle = 0;
    cur = nbs[Math.floor(rng() * nbs.length)];
    sea[cur] = true;
    count++;
    path.push(cur);
    inPath.add(cur);
  }
  if (count < targetSea * 0.7) return null;
  // complement components = islands
  const islands: number[][] = [];
  const seen = new Array<boolean>(total).fill(false);
  for (let i = 0; i < total; i++) {
    if (sea[i] || seen[i]) continue;
    const cells: number[] = [];
    const stack = [i];
    seen[i] = true;
    while (stack.length) {
      const c = stack.pop()!;
      cells.push(c);
      for (const n of NEI(rows, cols, c)) {
        if (!seen[n] && !sea[n]) { seen[n] = true; stack.push(n); }
      }
    }
    if (cells.length > 9) return null; // island too big — retry construction
    islands.push(cells);
  }
  if (islands.length < 2) return null;
  return { sea, islands };
}

/**
 * Generate a unique Nurikabe: sea-snake construction + repairToUnique.
 */
export function generateNurikabePuzzle(opts: NurikabeGenOptions): NurikabePuzzle | null {
  const rng = makeRng(opts.seed);
  const budget = opts.timeBudgetMs ?? 20000;
  const t0 = Date.now();
  const { rows, cols } = opts;
  const total = rows * cols;

  while (Date.now() - t0 < budget) {
    const built = buildSeaSnake(rows, cols, rng, Math.round(total * (0.66 + rng() * 0.12)));
    if (!built) continue;
    const solution = built.sea.map((s) => (s ? CELL_SEA : CELL_ISLAND));
    const clues = built.islands.map((cells) => ({ idx: cells[0], size: cells.length }));
    if (!cluesMatchSolution({ rows, cols, clues, solution, name: 'x' })) continue;

    // uniqueness: repair with a bounded slice per construction, then rebuild
    const sliceEnd = Math.min(Date.now() + 5000, t0 + budget);
    const final = repairToUnique({ rows, cols, clues, solution, name: 'x' }, rng, sliceEnd);
    if (!final) continue;
    return {
      rows, cols, clues: final.clues, solution: final.solution,
      name: opts.name || (opts.seed !== undefined ? 'Daily' : 'Generated'),
      daily: opts.seed !== undefined,
    };
  }
  return null;
}

// ── Difficulty presets & tutorials ──────────────────────────────────────────

export interface NurikabeDifficultyPreset {
  key: string;
  rows: number;
  cols: number;
  requirePropSolvable: boolean;
  label: string;
}

export const NURIKABE_DIFFICULTIES: Record<string, NurikabeDifficultyPreset> = {
  easy: { key: 'easy', rows: 5, cols: 5, requirePropSolvable: false, label: 'Easy' },
  medium: { key: 'medium', rows: 6, cols: 6, requirePropSolvable: false, label: 'Medium' },
  hard: { key: 'hard', rows: 7, cols: 7, requirePropSolvable: false, label: 'Hard' },
};

export interface NurikabeTutorialDef {
  title: string;
  lesson: string;
  seed: number;
  rows: number;
  cols: number;
}

/**
 * Tutorials use seeded generation (deterministic, validated by selftest —
 * hand-authored Nurikabe grids are error-prone, seeds are not).
 */
export const NURIKABE_TUTORIALS: NurikabeTutorialDef[] = [
  {
    title: 'Islands and sea',
    lesson: 'Each number is the size of its island: that many connected white cells, and no other island may touch it. Everything else becomes sea. Fill a whole line island first — a 2 next to a wall can only grow one way.',
    seed: 20260926, rows: 5, cols: 5,
  },
  {
    title: 'The sea stays connected',
    lesson: 'All black cells must form one unbroken mass. Watch for sea cells that would get cut off — and remember: islands may never touch, even diagonally-unrelated corners.',
    seed: 20260927, rows: 5, cols: 5,
  },
  {
    title: 'No 2×2 sea',
    lesson: 'The sea can never contain a 2×2 square. Three black cells around one corner force the fourth cell to be island — this rule finishes more boards than any other.',
    seed: 20260928, rows: 6, cols: 6,
  },
  {
    title: 'Corner pinning',
    lesson: 'A clue in a corner has very few ways to grow. Pin the corners first, watch which sea cells would get sealed off, and the whole board falls into place.',
    seed: 20260929, rows: 6, cols: 6,
  },
];

export function generateNurikabeTutorial(def: NurikabeTutorialDef): NurikabePuzzle | null {
  return generateNurikabePuzzle({
    rows: def.rows, cols: def.cols, seed: def.seed,
    timeBudgetMs: 30000, name: 'Tutorial',
  });
}
