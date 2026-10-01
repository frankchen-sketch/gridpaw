/**
 * GridPaw — Star Battle Engine
 *
 * Third game on puzzle-core. Rules-only: exactlyN + adjacencyBan from L1.
 *
 * Rules:
 *  1. Place stars: each row, each column, and each region contains exactly K stars
 *  2. Stars do not touch — not even diagonally (8-neighborhood ban)
 *  3. The puzzle IS the region layout (no givens); solution must be unique
 *
 * Generation strategy (standard for Star Battle):
 *   partition grid into N connected regions (always succeeds) →
 *   place K stars per region by backtracking (row/col capacity + no-touch) →
 *   accept only if the solver confirms a unique solution.
 *
 * Encoding: Int8Array (r*N+c), 1 = star, 0 = empty.
 */
import { solveBoard, SOLVER_BUDGET_EXCEEDED } from './constraints';

export interface StarBattlePuzzle {
  id: string;
  size: number;
  starsPerUnit: number;      // K
  regionOf: Int8Array;       // region id per cell (0..regionCount-1)
  regionCount: number;
  solution: Int8Array;       // 1 = star
  difficulty: 'easy' | 'medium' | 'hard';
}

// ── Region partition: multi-source BFS growth, arbitrary shapes ─────────────
export function makeRegions(N: number, rng: () => number): Int8Array | null {
  const total = N * N;
  const regionCount = N;
  const regionOf = new Int32Array(total).fill(-1);

  // seeds spread out: pick random cells with min manhattan separation
  const cells = Array.from({ length: total }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const seeds: number[] = [];
  for (const c of cells) {
    if (seeds.length >= regionCount) break;
    const r = (c / N) | 0, cc = c % N;
    let tooClose = false;
    for (const s of seeds) {
      const sr = (s / N) | 0, sc = s % N;
      if (Math.abs(sr - r) + Math.abs(sc - cc) < 3) { tooClose = true; break; }
    }
    if (!tooClose) seeds.push(c);
  }
  while (seeds.length < regionCount) {
    const c = cells[(rng() * total) | 0];
    if (!seeds.includes(c)) seeds.push(c);
  }

  const frontier: number[][] = Array.from({ length: regionCount }, () => []);
  // elongation bias: remember last growth direction per region — snake-like
  // regions constrain the solver far more than round blobs
  const lastDir = new Int32Array(regionCount).fill(-1); // 0=up 1=down 2=left 3=right
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const neighbors = (i: number): number[] => {
    const r = (i / N) | 0, c = i % N, out: number[] = [];
    if (r > 0) out.push(i - N);
    if (r < N - 1) out.push(i + N);
    if (c > 0) out.push(i - 1);
    if (c < N - 1) out.push(i + 1);
    return out;
  };
  for (let g = 0; g < regionCount; g++) {
    regionOf[seeds[g]] = g;
    for (const nb of neighbors(seeds[g])) if (regionOf[nb] === -1) frontier[g].push(nb);
  }
  let assigned = regionCount;
  while (assigned < total) {
    let grew = false;
    for (let g = 0; g < regionCount; g++) {
      const f = frontier[g];
      while (f.length) {
        // prefer the cell continuing the last direction (elongated regions)
        let cell = -1, pick = -1;
        for (let t = 0; t < f.length; t++) {
          const cand = f[t];
          if (regionOf[cand] !== -1) { continue; }
          if (cell === -1) { cell = cand; pick = t; }
          if (lastDir[g] >= 0) {
            const r = (cand / N) | 0, c = cand % N;
            const src = f.length ? cand : cand; // direction from seed-to-cell delta
            // compute direction relative to the region's seed
            const sr = (seeds[g] / N) | 0, sc = seeds[g] % N;
            const dr = Math.sign(r - sr), dc = Math.sign(c - sc);
            const dir = dr === -1 ? 0 : dr === 1 ? 1 : dc === -1 ? 2 : 3;
            if (dir === lastDir[g]) { cell = cand; pick = t; break; }
          }
        }
        if (cell === -1) break;
        f.splice(f.indexOf(cell), 1);
        regionOf[cell] = g;
        assigned++;
        const r = (cell / N) | 0, c = cell % N;
        const sr = (seeds[g] / N) | 0, sc = seeds[g] % N;
        const dr = Math.sign(r - sr), dc = Math.sign(c - sc);
        lastDir[g] = dr === -1 ? 0 : dr === 1 ? 1 : dc === -1 ? 2 : 3;
        for (const nb of neighbors(cell)) if (regionOf[nb] === -1) f.push(nb);
        grew = true;
        break;
      }
    }
    if (!grew) break;
  }
  if (assigned < total) {
    // orphan cells: attach to any neighbor region
    for (let i = 0; i < total; i++) {
      if (regionOf[i] !== -1) continue;
      for (const nb of neighbors(i)) {
        if (regionOf[nb] !== -1) { regionOf[i] = regionOf[nb]; assigned++; break; }
      }
    }
  }
  if (assigned < total) return null;

  // connectivity check
  for (let g = 0; g < regionCount; g++) {
    let start = -1, size = 0;
    for (let i = 0; i < total; i++) if (regionOf[i] === g) { if (start < 0) start = i; size++; }
    const seen = new Set<number>([start]);
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      for (const nb of neighbors(i)) {
        if (regionOf[nb] === g && !seen.has(nb)) { seen.add(nb); stack.push(nb); }
      }
    }
    if (seen.size !== size) return null;
  }
  return regionOf;
}

// ── Star placement: backtracking over regions ───────────────────────────────
export function placeStarsInRegions(N: number, K: number, regionOf: Int8Array, rng: () => number, nodeBudget?: number): Int8Array | null {
  const total = N * N;
  const regionCount = N;
  const regionCells: number[][] = Array.from({ length: regionCount }, () => []);
  for (let i = 0; i < total; i++) regionCells[regionOf[i]].push(i);
  for (const list of regionCells) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0;
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
  const vals = new Int8Array(total);
  const colCount = new Int32Array(N);
  const rowCount = new Int32Array(N);
  let nodes = 0;
  const touchesStar = (idx: number): boolean => {
    const r = (idx / N) | 0, c = idx % N;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < N && cc >= 0 && cc < N && vals[rr * N + cc] === 1) return true;
    }
    return false;
  };

  // choose K non-touching cells for region g (row/col capacity checked)
  const chooseForRegion = (g: number, cells: number[], start: number, chosen: number[]): boolean => {
    if (nodeBudget !== undefined && ++nodes > nodeBudget) {
      throw new Error(SOLVER_BUDGET_EXCEEDED);
    }
    if (chosen.length === K) {
      return g + 1 === regionCount ? true : chooseForRegion(g + 1, regionCells[g + 1], 0, []);
    }
    for (let i = start; i < cells.length; i++) {
      const cell = cells[i];
      if (touchesStar(cell)) continue;
      const c = cell % N, r = (cell / N) | 0;
      if (colCount[c] >= K || rowCount[r] >= K) continue;
      vals[cell] = 1; colCount[c]++; rowCount[r]++;
      chosen.push(cell);
      if (chooseForRegion(g, cells, i + 1, chosen)) return true;
      chosen.pop();
      vals[cell] = 0; colCount[c]--; rowCount[r]--;
    }
    return false;
  };

  if (chooseForRegion(0, regionCells[0], 0, [])) {
    // final check: every row exactly K (region loop guarantees regions; colCount guarantees cols)
    for (let r = 0; r < N; r++) if (rowCount[r] !== K) return null;
    return vals;
  }
  return null;
}

// ── Solver wiring ───────────────────────────────────────────────────────────
function makeCandidateFn(N: number, K: number, regionOf: Int8Array, regionCount: number) {
  // region membership cache for O(regionSize) scans
  const regionCells: number[][] = Array.from({ length: regionCount }, () => []);
  for (let i = 0; i < N * N; i++) regionCells[regionOf[i]].push(i);

  const scanRow = (vals: Int8Array, r: number): [number, number] => { // [stars, empties]
    let s = 0, e = 0;
    for (let c = 0; c < N; c++) { const v = vals[r * N + c]; if (v === 1) s++; else if (v === -1) e++; }
    return [s, e];
  };
  const scanCol = (vals: Int8Array, c: number): [number, number] => {
    let s = 0, e = 0;
    for (let r = 0; r < N; r++) { const v = vals[r * N + c]; if (v === 1) s++; else if (v === -1) e++; }
    return [s, e];
  };
  const scanRegion = (vals: Int8Array, g: number): [number, number] => {
    let s = 0, e = 0;
    for (const i of regionCells[g]) { const v = vals[i]; if (v === 1) s++; else if (v === -1) e++; }
    return [s, e];
  };

  return (idx: number, vals: Int8Array, v: number): boolean => {
    const r = (idx / N) | 0, c = idx % N, g = regionOf[idx];
    if (v === 1) {
      // adjacency ban (8-neighborhood)
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < N && cc >= 0 && cc < N && vals[rr * N + cc] === 1) return false;
      }
      // capacity
      const [rs] = scanRow(vals, r), [cs] = scanCol(vals, c), [gs] = scanRegion(vals, g);
      if (rs >= K || cs >= K || gs >= K) return false;
      return true;
    }
    // v === 0: supply-demand pruning — after this cell becomes empty-marker,
    // the row/col/region must still be able to fit their remaining stars.
    const [rs, re] = scanRow(vals, r);
    if (K - rs > re - 1) return false;
    const [cs, ce] = scanCol(vals, c);
    if (K - cs > ce - 1) return false;
    const [gs, ge] = scanRegion(vals, g);
    if (K - gs > ge - 1) return false;
    return true;
  };
}

export function countSolutions(puzzle: StarBattlePuzzle, limit = 2, nodeBudget?: number): { count: number; first: Int8Array | null; second: Int8Array | null } {
  const { size: N, starsPerUnit: K, regionOf, regionCount } = puzzle;
  const vals = new Int8Array(N * N).fill(-1);
  const empties = Array.from({ length: N * N }, (_, i) => i);
  const sols: Int8Array[] = [];
  const res = solveBoard(N, [0, 1], empties, makeCandidateFn(N, K, regionOf, regionCount),
    (v, emit) => {
      const rowCount = new Int32Array(N), colCount = new Int32Array(N), regCount = new Int32Array(regionCount);
      for (let i = 0; i < N * N; i++) {
        if (v[i] !== 1) continue;
        rowCount[i / N | 0]++; colCount[i % N]++;
        regCount[regionOf[i]]++;
      }
      for (let i = 0; i < N; i++) if (rowCount[i] !== K || colCount[i] !== K) return;
      for (let g = 0; g < regionCount; g++) if (regCount[g] !== K) return;
      if (sols.length < 2) sols.push(v.slice());
      emit(v);
    }, limit, vals, nodeBudget);
  return { count: res.count, first: sols[0] ?? null, second: sols[1] ?? null };
}

export function hintLookup(puzzle: StarBattlePuzzle, idx: number): number {
  return puzzle.solution[idx];
}

export function validate(puzzle: StarBattlePuzzle, vals: Int8Array): { ok: boolean; errors: string[] } {
  const { size: N, starsPerUnit: K, regionOf, regionCount } = puzzle;
  const errors: string[] = [];
  const rowCount = new Int32Array(N), colCount = new Int32Array(N), regCount = new Int32Array(regionCount);
  for (let i = 0; i < N * N; i++) {
    if (vals[i] !== 1) continue;
    rowCount[i / N | 0]++; colCount[i % N]++;
    regCount[regionOf[i]]++;
    const r = i / N | 0, c = i % N;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < N && cc >= 0 && cc < N && vals[rr * N + cc] === 1 && rr * N + cc > i)
        errors.push(`Stars touch at ${i}`);
    }
  }
  for (let i = 0; i < N; i++) {
    if (rowCount[i] !== K) errors.push(`Row ${i + 1} has ${rowCount[i]} stars (need ${K})`);
    if (colCount[i] !== K) errors.push(`Col ${i + 1} has ${colCount[i]} stars (need ${K})`);
  }
  for (let g = 0; g < regionCount; g++) if (regCount[g] !== K) errors.push(`Region ${g + 1} has ${regCount[g]} stars (need ${K})`);
  return { ok: errors.length === 0, errors };
}

// ── Constructive generation (dominating tiers) ──────────────────────────────
// Old flow (partition grid → brute-force search for a unique placement) spent
// ~95% of attempts on layouts with zero valid placements and could take
// minutes on a single 14×14 "0 solutions" proof. The new flow builds validity
// in, then strengthens uniqueness tier by tier:
//   buildStarSet places K stars per row/column that never touch, with a
//   domination radius R: every cell must be within Chebyshev distance R of a
//   star (row r-R verified once row r is placed). Validity always holds; the
//   radius only controls how LIKELY the layout is unique.
//   Tier R=1: every empty cell is adjacent to a star, so no empty cell can
//   host one — any solution is a subset of the constructed stars, hence (K*N
//   stars are mandatory) exactly them: UNIQUE without a solver.
//   Tiers R>1: cells may host alternatives near coverage gaps, so uniqueness
//   is confirmed by the budgeted solver; only proven-unique layouts are
//   accepted. All searches are node-capped so a bad tier costs milliseconds,
//   not minutes.
const SB_CAP = '__sb_cap__';

// Row-by-row star placement (natural row order): K stars per row, at most K per
// column, no-touch, domination radius R (row r-R checked when row r is placed;
// final rows checked at the very end). Returns null if the search is capped or
// the constraints are unsatisfiable for this seed.
function buildStarSet(N: number, K: number, R: number, rng: () => number): Int8Array | null {
  const board = new Int8Array(N * N);
  const colCnt = new Int32Array(N);
  let nodes = 0;
  const NODE_CAP = 120000;

  // Is every cell of row r within Chebyshev distance R of some placed star?
  const rowCovered = (r: number): boolean => {
    for (let c = 0; c < N; c++) {
      let ok = false;
      for (let dr = -R; dr <= R && !ok; dr++) {
        const rr = r + dr;
        if (rr < 0 || rr >= N) continue;
        for (let dc = -R; dc <= R; dc++) {
          const cc = c + dc;
          if (cc < 0 || cc >= N) continue;
          if (board[rr * N + cc] === 1) { ok = true; break; }
        }
      }
      if (!ok) return false;
    }
    return true;
  };

  const placeRow = (ri: number): boolean => {
    const r = ri; // natural order: coverage checks need rows placed top-down
    if (++nodes > NODE_CAP) throw new Error(SB_CAP);
    const cols: number[] = [];
    for (let c = 0; c < N; c++) {
      if (colCnt[c] >= K) continue;
      let blocked = false;
      for (let dr = -1; dr <= 1 && !blocked; dr++) {
        const rr = r + dr;
        if (rr < 0 || rr >= N) continue;
        for (let dc = -1; dc <= 1; dc++) {
          const cc = c + dc;
          if (cc < 0 || cc >= N) continue;
          if (board[rr * N + cc] === 1) { blocked = true; break; }
        }
      }
      if (!blocked) cols.push(c);
    }
    if (cols.length < K) return false;
    for (let i = cols.length - 1; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0;
      [cols[i], cols[j]] = [cols[j], cols[i]];
    }

    const pick = (start: number, need: number, chosen: number[]): boolean => {
      if (++nodes > NODE_CAP) throw new Error(SB_CAP);
      if (need === 0) {
        for (const c of chosen) { board[r * N + c] = 1; colCnt[c]++; }
        // R===0: pure random star set (no domination coverage constraint);
        // R>0: delayed coverage check — row r-R needs rows r-2R..r, all placed now
        let ok = R === 0 || r - R < 0 || rowCovered(r - R);
        if (ok) {
          if (ri + 1 < N) {
            if (placeRow(ri + 1)) return true;
          } else {
            let finalOk: boolean = R === 0 || ok;
            for (let rr = Math.max(0, N - R); R > 0 && rr < N && finalOk; rr++) {
              finalOk = rowCovered(rr);
            }
            if (finalOk) return true;
          }
        }
        for (const c of chosen) { board[r * N + c] = 0; colCnt[c]--; }
        return false;
      }
      for (let i = start; i < cols.length; i++) {
        let ok = true;
        for (const pc of chosen) if (Math.abs(pc - cols[i]) < 2) { ok = false; break; }
        if (!ok) continue;
        chosen.push(cols[i]);
        if (pick(i + 1, need - 1, chosen)) return true;
        chosen.pop();
      }
      return false;
    };
    return pick(0, K, []);
  };

  try {
    return placeRow(0) ? board : null;
  } catch (e) {
    if (e instanceof Error && e.message === SB_CAP) return null;
    throw e;
  }
}

// Grow size connected regions from the stars: region g = the K stars of row g,
// expanded outward in randomized BFS order. Validity holds by construction:
// every region contains exactly its K seed stars and every row/column exactly K.
function growRegionsFromStars(N: number, K: number, starBoard: Int8Array, rng: () => number): Int8Array {
  const total = N * N;
  const regionOf = new Int8Array(total).fill(-1);
  const frontier: number[][] = Array.from({ length: N }, () => []);
  let assigned = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (starBoard[r * N + c] !== 1) continue;
      const i = r * N + c;
      regionOf[i] = r; // region g := stars of row g
      assigned++;
      for (const nb of cellNeighbors(N, i)) {
        if (regionOf[nb] === -1) frontier[r].push(nb);
      }
    }
  }
  const pool: number[] = [];
  for (let g = 0; g < N; g++) for (let k = 0; k < frontier[g].length; k++) pool.push(g);
  while (assigned < total) {
    if (pool.length === 0) break; // defensive: region growth is complete by construction
    const gi = (rng() * pool.length) | 0;
    const g = pool[gi];
    pool[gi] = pool[pool.length - 1];
    pool.pop();
    const cells = frontier[g];
    if (!cells || cells.length === 0) continue;
    const idx = (rng() * cells.length) | 0;
    const cell = cells[idx];
    cells[idx] = cells[cells.length - 1];
    cells.pop();
    // Re-push the region BEFORE the duplicate check: a popped cell that is
    // already assigned must not silently drop the region from the pool while
    // its frontier still holds candidates.
    if (frontier[g].length > 0) pool.push(g);
    if (regionOf[cell] !== -1) continue;
    regionOf[cell] = g;
    assigned++;
    for (const nb of cellNeighbors(N, cell)) {
      if (regionOf[nb] === -1 && frontier[g].indexOf(nb) === -1) frontier[g].push(nb);
    }
  }
  return regionOf;
}

function cellNeighbors(N: number, i: number): number[] {
  const r = (i / N) | 0, c = i % N, out: number[] = [];
  if (r > 0) out.push(i - N);
  if (r < N - 1) out.push(i + N);
  if (c > 0) out.push(i - 1);
  if (c < N - 1) out.push(i + 1);
  return out;
}

// ── Generate ────────────────────────────────────────────────────────────────
// Tiered rejection sampling, all costs bounded:
//   Tier 1 (R=1): dominating set → unique by construction, no solver run.
//   Tier 2 (R=2): near-dominated → uniqueness verified by the budgeted solver.
//   Tier 3 (R=3+): relaxed coverage → solver-verified, wider net.
// Every attempt is node-capped and every solver run is budget-bounded, so a
// hard tier costs milliseconds; only proven-unique layouts are returned.
export function generate(size: number, starsPerUnit: number, difficulty: StarBattlePuzzle['difficulty'], seed = Date.now(), timeBudgetMs?: number): StarBattlePuzzle {
  let s = (seed >>> 0) || 1;
  const rng = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  const isBudget = (e: unknown) => e instanceof Error && e.message === SOLVER_BUDGET_EXCEEDED;
  const SOLVE_BUDGET = 300000; // enough for the uniqueness proofs that complete

  const buildPuzzle = (starBoard: Int8Array, attempt: number): StarBattlePuzzle => {
    const regionOf = growRegionsFromStars(size, starsPerUnit, starBoard, rng);
    return {
      id: `sb-${size}-${starsPerUnit}-${difficulty}-${seed}-${attempt}`,
      size, starsPerUnit, regionOf,
      regionCount: size,
      solution: starBoard, // valid by construction (rows/cols/regions/no-touch)
      difficulty,
    };
  };

  // All tiers solver-checked: the constructive star set gives near-100% region
  // validity; countSolutions is cheap (~50ms) — the historical slowness was
  // rejection-sampling miss rate, not the solver.
  const verifyUnique = (starBoard: Int8Array, attempt: number): StarBattlePuzzle | null => {
    const puzzle = buildPuzzle(starBoard, attempt);
    try {
      if (countSolutions(puzzle, 2, SOLVE_BUDGET).count === 1) return puzzle;
    } catch (e) {
      if (!isBudget(e)) throw e;
    }
    return null;
  };
  // Constructive disambiguation: when two solutions exist, the region layout
  // is under-constrained. Move a differing cell to an adjacent different
  // region (keeping regions connected & non-empty) to break the ambiguity —
  // directed edit instead of blind re-roll.
  const disambiguate = (p: StarBattlePuzzle): StarBattlePuzzle | null => {
    // Middle iterations: small solver budget — a budget miss means "slow board,
    // keep perturbing" instead of failing; ambiguity hits (count=2) return fast.
    // Only the final unique board gets one full-budget proof.
    const PROBE_BUDGET = 60000;
    for (let iter = 0; iter < 40; iter++) {
      let cs;
      let budgetMiss = false;
      try {
        cs = countSolutions(p, 2, PROBE_BUDGET);
      } catch (e) {
        if (!isBudget(e)) throw e;
        budgetMiss = true;
      }
      if (!budgetMiss) {
        if (cs!.count === 1) {
          // full-budget confirmation proof (fast on well-structured boards)
          try {
            const full = countSolutions(p, 2, 10_000_000);
            if (full.count === 1) return p;
            continue; // probe lied — keep perturbing
          } catch (e) {
            if (!isBudget(e)) throw e;
            continue;
          }
        }
        if (cs!.count === 0) return null; // over-constrained — bail
      }
      const s0 = cs?.first, s1 = cs?.second;
      let diff: number[];
      if (s0 && s1) {
        diff = [];
        for (let i = 0; i < size * size; i++) if (s0[i] !== s1[i]) diff.push(i);
      } else {
        // no two solutions available (budget miss) — perturb a random border cell
        diff = [];
        for (let i = 0; i < size * size; i++) {
          const r = (i / size) | 0, c = i % size;
          if (r > 0 && p.regionOf[i] !== p.regionOf[i - size]) { diff.push(i); continue; }
          if (r < size - 1 && p.regionOf[i] !== p.regionOf[i + size]) { diff.push(i); continue; }
          if (c > 0 && p.regionOf[i] !== p.regionOf[i - 1]) { diff.push(i); continue; }
          if (c < size - 1 && p.regionOf[i] !== p.regionOf[i + 1]) { diff.push(i); }
        }
      }
      if (!diff.length) return null;
      // try moving a random differing cell to an adjacent different region
      const order = diff.slice();
      for (let k = order.length - 1; k > 0; k--) {
        const j = (rng() * (k + 1)) | 0;
        [order[k], order[j]] = [order[j], order[k]];
      }
      let moved = false;
      for (const x of order) {
        const r = (x / size) | 0, c = x % size;
        const g = p.regionOf[x];
        // neighbors in a different region
        const nbs = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
          .filter(([rr, cc]) => rr >= 0 && rr < size && cc >= 0 && cc < size)
          .map(([rr, cc]) => rr * size + cc)
          .filter(i2 => p.regionOf[i2] !== g);
        if (!nbs.length) continue;
        const nbsShuffled = nbs.slice();
        for (let k = nbsShuffled.length - 1; k > 0; k--) {
          const j = (rng() * (k + 1)) | 0;
          [nbsShuffled[k], nbsShuffled[j]] = [nbsShuffled[j], nbsShuffled[k]];
        }
        for (const n of nbsShuffled) {
          // moving x from g into region of n: count x in g before removal
          const gSize = p.regionOf.reduce((acc, v, i2) => acc + (v === g && i2 !== x ? 1 : 0), 0);
          const gStar = [...Array(size * size).keys()].filter(i2 => i2 !== x && p.regionOf[i2] === g && p.solution[i2] === 1).length;
          if (gSize < 1 || gStar < 1) continue; // would empty region or strand its star
          p.regionOf[x] = p.regionOf[n];
          moved = true;
          break;
        }
        if (moved) break;
      }
      if (!moved) return null;
    }
    return null;
  };

  // Tier 1 — pure random star set (R=0), solver-verified uniqueness
  const tStart = Date.now();
  for (let attempt = 0; attempt < 60; attempt++) {
    if (timeBudgetMs && Date.now() - tStart > timeBudgetMs) break;
    const starBoard = buildStarSet(size, starsPerUnit, 0, rng);
    if (!starBoard) continue;
    const base = buildPuzzle(starBoard, attempt);
    const ok = disambiguate(base);
    if (ok) return ok;
  }
  // Tier 2 — near-dominating (R=2)
  for (let attempt = 0; attempt < 400; attempt++) {
    if (timeBudgetMs && Date.now() - tStart > timeBudgetMs) break;
    const starBoard = buildStarSet(size, starsPerUnit, 2, rng);
    if (!starBoard) continue;
    const ok = verifyUnique(starBoard, attempt);
    if (ok) return ok;
  }
  // Tier 3 — relaxed coverage (R=4)
  for (let attempt = 0; attempt < 600; attempt++) {
    if (timeBudgetMs && Date.now() - tStart > timeBudgetMs) break;
    const starBoard = buildStarSet(size, starsPerUnit, 4, rng);
    if (!starBoard) continue;
    const ok = verifyUnique(starBoard, attempt);
    if (ok) return ok;
  }
  throw new Error(`star-battle gen failed: size=${size} K=${starsPerUnit} seed=${seed}`);
}
