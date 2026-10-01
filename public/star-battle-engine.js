var StarBattleEngine = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/lib/puzzle-core/star-battle-engine.ts
  var star_battle_engine_exports = {};
  __export(star_battle_engine_exports, {
    countSolutions: () => countSolutions,
    generate: () => generate,
    hintLookup: () => hintLookup,
    makeRegions: () => makeRegions,
    placeStarsInRegions: () => placeStarsInRegions,
    validate: () => validate
  });

  // src/lib/puzzle-core/constraints.ts
  var SOLVER_BUDGET_EXCEEDED = "SOLVER_BUDGET_EXCEEDED";
  function solveBoard(N, domain, empties, candidateFn, onComplete, limit, vals, nodeBudget) {
    let count = 0;
    let first = null;
    let nodes = 0;
    const emit = (s) => {
      if (count === 0) first = s.slice();
      count++;
    };
    const candBuf = [];
    const dfs = () => {
      if (nodeBudget !== void 0 && ++nodes > nodeBudget) {
        throw new Error(SOLVER_BUDGET_EXCEEDED);
      }
      if (count >= limit) return true;
      let bestIdx = -1, bestCands = null, bestLen = Infinity;
      for (const idx of empties) {
        if (vals[idx] >= 0) continue;
        candBuf.length = 0;
        for (const v of domain) if (candidateFn(idx, vals, v)) candBuf.push(v);
        const len = candBuf.length;
        if (len === 0) return false;
        if (len < bestLen) {
          bestLen = len;
          bestIdx = idx;
          bestCands = candBuf.slice();
          if (len === 1) break;
        }
      }
      if (bestIdx === -1) {
        onComplete(vals, emit);
        return count >= limit;
      }
      for (const v of bestCands) {
        vals[bestIdx] = v;
        const stop = dfs();
        vals[bestIdx] = -1;
        if (stop) return true;
      }
      return false;
    };
    dfs();
    return { solution: first, count };
  }

  // src/lib/puzzle-core/star-battle-engine.ts
  function makeRegions(N, rng) {
    const total = N * N;
    const regionCount = N;
    const regionOf = new Int32Array(total).fill(-1);
    const cells = Array.from({ length: total }, (_, i) => i);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = rng() * (i + 1) | 0;
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    const seeds = [];
    for (const c of cells) {
      if (seeds.length >= regionCount) break;
      const r = c / N | 0, cc = c % N;
      let tooClose = false;
      for (const s of seeds) {
        const sr = s / N | 0, sc = s % N;
        if (Math.abs(sr - r) + Math.abs(sc - cc) < 3) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) seeds.push(c);
    }
    while (seeds.length < regionCount) {
      const c = cells[rng() * total | 0];
      if (!seeds.includes(c)) seeds.push(c);
    }
    const frontier = Array.from({ length: regionCount }, () => []);
    const lastDir = new Int32Array(regionCount).fill(-1);
    const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const neighbors = (i) => {
      const r = i / N | 0, c = i % N, out = [];
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
          let cell = -1, pick = -1;
          for (let t = 0; t < f.length; t++) {
            const cand = f[t];
            if (regionOf[cand] !== -1) {
              continue;
            }
            if (cell === -1) {
              cell = cand;
              pick = t;
            }
            if (lastDir[g] >= 0) {
              const r2 = cand / N | 0, c2 = cand % N;
              const src = f.length ? cand : cand;
              const sr2 = seeds[g] / N | 0, sc2 = seeds[g] % N;
              const dr2 = Math.sign(r2 - sr2), dc2 = Math.sign(c2 - sc2);
              const dir = dr2 === -1 ? 0 : dr2 === 1 ? 1 : dc2 === -1 ? 2 : 3;
              if (dir === lastDir[g]) {
                cell = cand;
                pick = t;
                break;
              }
            }
          }
          if (cell === -1) break;
          f.splice(f.indexOf(cell), 1);
          regionOf[cell] = g;
          assigned++;
          const r = cell / N | 0, c = cell % N;
          const sr = seeds[g] / N | 0, sc = seeds[g] % N;
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
      for (let i = 0; i < total; i++) {
        if (regionOf[i] !== -1) continue;
        for (const nb of neighbors(i)) {
          if (regionOf[nb] !== -1) {
            regionOf[i] = regionOf[nb];
            assigned++;
            break;
          }
        }
      }
    }
    if (assigned < total) return null;
    for (let g = 0; g < regionCount; g++) {
      let start = -1, size = 0;
      for (let i = 0; i < total; i++) if (regionOf[i] === g) {
        if (start < 0) start = i;
        size++;
      }
      const seen = /* @__PURE__ */ new Set([start]);
      const stack = [start];
      while (stack.length) {
        const i = stack.pop();
        for (const nb of neighbors(i)) {
          if (regionOf[nb] === g && !seen.has(nb)) {
            seen.add(nb);
            stack.push(nb);
          }
        }
      }
      if (seen.size !== size) return null;
    }
    return regionOf;
  }
  function placeStarsInRegions(N, K, regionOf, rng, nodeBudget) {
    const total = N * N;
    const regionCount = N;
    const regionCells = Array.from({ length: regionCount }, () => []);
    for (let i = 0; i < total; i++) regionCells[regionOf[i]].push(i);
    for (const list of regionCells) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = rng() * (i + 1) | 0;
        [list[i], list[j]] = [list[j], list[i]];
      }
    }
    const vals = new Int8Array(total);
    const colCount = new Int32Array(N);
    const rowCount = new Int32Array(N);
    let nodes = 0;
    const touchesStar = (idx) => {
      const r = idx / N | 0, c = idx % N;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < N && cc >= 0 && cc < N && vals[rr * N + cc] === 1) return true;
      }
      return false;
    };
    const chooseForRegion = (g, cells, start, chosen) => {
      if (nodeBudget !== void 0 && ++nodes > nodeBudget) {
        throw new Error(SOLVER_BUDGET_EXCEEDED);
      }
      if (chosen.length === K) {
        return g + 1 === regionCount ? true : chooseForRegion(g + 1, regionCells[g + 1], 0, []);
      }
      for (let i = start; i < cells.length; i++) {
        const cell = cells[i];
        if (touchesStar(cell)) continue;
        const c = cell % N, r = cell / N | 0;
        if (colCount[c] >= K || rowCount[r] >= K) continue;
        vals[cell] = 1;
        colCount[c]++;
        rowCount[r]++;
        chosen.push(cell);
        if (chooseForRegion(g, cells, i + 1, chosen)) return true;
        chosen.pop();
        vals[cell] = 0;
        colCount[c]--;
        rowCount[r]--;
      }
      return false;
    };
    if (chooseForRegion(0, regionCells[0], 0, [])) {
      for (let r = 0; r < N; r++) if (rowCount[r] !== K) return null;
      return vals;
    }
    return null;
  }
  function makeCandidateFn(N, K, regionOf, regionCount) {
    const regionCells = Array.from({ length: regionCount }, () => []);
    for (let i = 0; i < N * N; i++) regionCells[regionOf[i]].push(i);
    const scanRow = (vals, r) => {
      let s = 0, e = 0;
      for (let c = 0; c < N; c++) {
        const v = vals[r * N + c];
        if (v === 1) s++;
        else if (v === -1) e++;
      }
      return [s, e];
    };
    const scanCol = (vals, c) => {
      let s = 0, e = 0;
      for (let r = 0; r < N; r++) {
        const v = vals[r * N + c];
        if (v === 1) s++;
        else if (v === -1) e++;
      }
      return [s, e];
    };
    const scanRegion = (vals, g) => {
      let s = 0, e = 0;
      for (const i of regionCells[g]) {
        const v = vals[i];
        if (v === 1) s++;
        else if (v === -1) e++;
      }
      return [s, e];
    };
    return (idx, vals, v) => {
      const r = idx / N | 0, c = idx % N, g = regionOf[idx];
      if (v === 1) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const rr = r + dr, cc = c + dc;
          if (rr >= 0 && rr < N && cc >= 0 && cc < N && vals[rr * N + cc] === 1) return false;
        }
        const [rs2] = scanRow(vals, r), [cs2] = scanCol(vals, c), [gs2] = scanRegion(vals, g);
        if (rs2 >= K || cs2 >= K || gs2 >= K) return false;
        return true;
      }
      const [rs, re] = scanRow(vals, r);
      if (K - rs > re - 1) return false;
      const [cs, ce] = scanCol(vals, c);
      if (K - cs > ce - 1) return false;
      const [gs, ge] = scanRegion(vals, g);
      if (K - gs > ge - 1) return false;
      return true;
    };
  }
  function countSolutions(puzzle, limit = 2, nodeBudget) {
    const { size: N, starsPerUnit: K, regionOf, regionCount } = puzzle;
    const vals = new Int8Array(N * N).fill(-1);
    const empties = Array.from({ length: N * N }, (_, i) => i);
    const sols = [];
    const res = solveBoard(
      N,
      [0, 1],
      empties,
      makeCandidateFn(N, K, regionOf, regionCount),
      (v, emit) => {
        const rowCount = new Int32Array(N), colCount = new Int32Array(N), regCount = new Int32Array(regionCount);
        for (let i = 0; i < N * N; i++) {
          if (v[i] !== 1) continue;
          rowCount[i / N | 0]++;
          colCount[i % N]++;
          regCount[regionOf[i]]++;
        }
        for (let i = 0; i < N; i++) if (rowCount[i] !== K || colCount[i] !== K) return;
        for (let g = 0; g < regionCount; g++) if (regCount[g] !== K) return;
        if (sols.length < 2) sols.push(v.slice());
        emit(v);
      },
      limit,
      vals,
      nodeBudget
    );
    return { count: res.count, first: sols[0] ?? null, second: sols[1] ?? null };
  }
  function hintLookup(puzzle, idx) {
    return puzzle.solution[idx];
  }
  function validate(puzzle, vals) {
    const { size: N, starsPerUnit: K, regionOf, regionCount } = puzzle;
    const errors = [];
    const rowCount = new Int32Array(N), colCount = new Int32Array(N), regCount = new Int32Array(regionCount);
    for (let i = 0; i < N * N; i++) {
      if (vals[i] !== 1) continue;
      rowCount[i / N | 0]++;
      colCount[i % N]++;
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
  var SB_CAP = "__sb_cap__";
  function buildStarSet(N, K, R, rng) {
    const board = new Int8Array(N * N);
    const colCnt = new Int32Array(N);
    let nodes = 0;
    const NODE_CAP = 12e4;
    const rowCovered = (r) => {
      for (let c = 0; c < N; c++) {
        let ok = false;
        for (let dr = -R; dr <= R && !ok; dr++) {
          const rr = r + dr;
          if (rr < 0 || rr >= N) continue;
          for (let dc = -R; dc <= R; dc++) {
            const cc = c + dc;
            if (cc < 0 || cc >= N) continue;
            if (board[rr * N + cc] === 1) {
              ok = true;
              break;
            }
          }
        }
        if (!ok) return false;
      }
      return true;
    };
    const placeRow = (ri) => {
      const r = ri;
      if (++nodes > NODE_CAP) throw new Error(SB_CAP);
      const cols = [];
      for (let c = 0; c < N; c++) {
        if (colCnt[c] >= K) continue;
        let blocked = false;
        for (let dr = -1; dr <= 1 && !blocked; dr++) {
          const rr = r + dr;
          if (rr < 0 || rr >= N) continue;
          for (let dc = -1; dc <= 1; dc++) {
            const cc = c + dc;
            if (cc < 0 || cc >= N) continue;
            if (board[rr * N + cc] === 1) {
              blocked = true;
              break;
            }
          }
        }
        if (!blocked) cols.push(c);
      }
      if (cols.length < K) return false;
      for (let i = cols.length - 1; i > 0; i--) {
        const j = rng() * (i + 1) | 0;
        [cols[i], cols[j]] = [cols[j], cols[i]];
      }
      const pick = (start, need, chosen) => {
        if (++nodes > NODE_CAP) throw new Error(SB_CAP);
        if (need === 0) {
          for (const c of chosen) {
            board[r * N + c] = 1;
            colCnt[c]++;
          }
          let ok = R === 0 || r - R < 0 || rowCovered(r - R);
          if (ok) {
            if (ri + 1 < N) {
              if (placeRow(ri + 1)) return true;
            } else {
              let finalOk = R === 0 || ok;
              for (let rr = Math.max(0, N - R); R > 0 && rr < N && finalOk; rr++) {
                finalOk = rowCovered(rr);
              }
              if (finalOk) return true;
            }
          }
          for (const c of chosen) {
            board[r * N + c] = 0;
            colCnt[c]--;
          }
          return false;
        }
        for (let i = start; i < cols.length; i++) {
          let ok = true;
          for (const pc of chosen) if (Math.abs(pc - cols[i]) < 2) {
            ok = false;
            break;
          }
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
  function growRegionsFromStars(N, K, starBoard, rng) {
    const total = N * N;
    const regionOf = new Int8Array(total).fill(-1);
    const frontier = Array.from({ length: N }, () => []);
    let assigned = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (starBoard[r * N + c] !== 1) continue;
        const i = r * N + c;
        regionOf[i] = r;
        assigned++;
        for (const nb of cellNeighbors(N, i)) {
          if (regionOf[nb] === -1) frontier[r].push(nb);
        }
      }
    }
    const pool = [];
    for (let g = 0; g < N; g++) for (let k = 0; k < frontier[g].length; k++) pool.push(g);
    while (assigned < total) {
      if (pool.length === 0) break;
      const gi = rng() * pool.length | 0;
      const g = pool[gi];
      pool[gi] = pool[pool.length - 1];
      pool.pop();
      const cells = frontier[g];
      if (!cells || cells.length === 0) continue;
      const idx = rng() * cells.length | 0;
      const cell = cells[idx];
      cells[idx] = cells[cells.length - 1];
      cells.pop();
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
  function cellNeighbors(N, i) {
    const r = i / N | 0, c = i % N, out = [];
    if (r > 0) out.push(i - N);
    if (r < N - 1) out.push(i + N);
    if (c > 0) out.push(i - 1);
    if (c < N - 1) out.push(i + 1);
    return out;
  }
  function generate(size, starsPerUnit, difficulty, seed = Date.now(), timeBudgetMs) {
    let s = seed >>> 0 || 1;
    const rng = () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
    const isBudget = (e) => e instanceof Error && e.message === SOLVER_BUDGET_EXCEEDED;
    const SOLVE_BUDGET = 3e5;
    const buildPuzzle = (starBoard, attempt) => {
      const regionOf = growRegionsFromStars(size, starsPerUnit, starBoard, rng);
      return {
        id: `sb-${size}-${starsPerUnit}-${difficulty}-${seed}-${attempt}`,
        size,
        starsPerUnit,
        regionOf,
        regionCount: size,
        solution: starBoard,
        // valid by construction (rows/cols/regions/no-touch)
        difficulty
      };
    };
    const verifyUnique = (starBoard, attempt) => {
      const puzzle = buildPuzzle(starBoard, attempt);
      try {
        if (countSolutions(puzzle, 2, SOLVE_BUDGET).count === 1) return puzzle;
      } catch (e) {
        if (!isBudget(e)) throw e;
      }
      return null;
    };
    const disambiguate = (p) => {
      const PROBE_BUDGET = 6e4;
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
          if (cs.count === 1) {
            try {
              const full = countSolutions(p, 2, 1e7);
              if (full.count === 1) return p;
              continue;
            } catch (e) {
              if (!isBudget(e)) throw e;
              continue;
            }
          }
          if (cs.count === 0) return null;
        }
        const s0 = cs?.first, s1 = cs?.second;
        let diff;
        if (s0 && s1) {
          diff = [];
          for (let i = 0; i < size * size; i++) if (s0[i] !== s1[i]) diff.push(i);
        } else {
          diff = [];
          for (let i = 0; i < size * size; i++) {
            const r = i / size | 0, c = i % size;
            if (r > 0 && p.regionOf[i] !== p.regionOf[i - size]) {
              diff.push(i);
              continue;
            }
            if (r < size - 1 && p.regionOf[i] !== p.regionOf[i + size]) {
              diff.push(i);
              continue;
            }
            if (c > 0 && p.regionOf[i] !== p.regionOf[i - 1]) {
              diff.push(i);
              continue;
            }
            if (c < size - 1 && p.regionOf[i] !== p.regionOf[i + 1]) {
              diff.push(i);
            }
          }
        }
        if (!diff.length) return null;
        const order = diff.slice();
        for (let k = order.length - 1; k > 0; k--) {
          const j = rng() * (k + 1) | 0;
          [order[k], order[j]] = [order[j], order[k]];
        }
        let moved = false;
        for (const x of order) {
          const r = x / size | 0, c = x % size;
          const g = p.regionOf[x];
          const nbs = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([rr, cc]) => rr >= 0 && rr < size && cc >= 0 && cc < size).map(([rr, cc]) => rr * size + cc).filter((i2) => p.regionOf[i2] !== g);
          if (!nbs.length) continue;
          const nbsShuffled = nbs.slice();
          for (let k = nbsShuffled.length - 1; k > 0; k--) {
            const j = rng() * (k + 1) | 0;
            [nbsShuffled[k], nbsShuffled[j]] = [nbsShuffled[j], nbsShuffled[k]];
          }
          for (const n of nbsShuffled) {
            const gSize = p.regionOf.reduce((acc, v, i2) => acc + (v === g && i2 !== x ? 1 : 0), 0);
            const gStar = [...Array(size * size).keys()].filter((i2) => i2 !== x && p.regionOf[i2] === g && p.solution[i2] === 1).length;
            if (gSize < 1 || gStar < 1) continue;
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
    const tStart = Date.now();
    for (let attempt = 0; attempt < 60; attempt++) {
      if (timeBudgetMs && Date.now() - tStart > timeBudgetMs) break;
      const starBoard = buildStarSet(size, starsPerUnit, 0, rng);
      if (!starBoard) continue;
      const base = buildPuzzle(starBoard, attempt);
      const ok = disambiguate(base);
      if (ok) return ok;
    }
    for (let attempt = 0; attempt < 400; attempt++) {
      if (timeBudgetMs && Date.now() - tStart > timeBudgetMs) break;
      const starBoard = buildStarSet(size, starsPerUnit, 2, rng);
      if (!starBoard) continue;
      const ok = verifyUnique(starBoard, attempt);
      if (ok) return ok;
    }
    for (let attempt = 0; attempt < 600; attempt++) {
      if (timeBudgetMs && Date.now() - tStart > timeBudgetMs) break;
      const starBoard = buildStarSet(size, starsPerUnit, 4, rng);
      if (!starBoard) continue;
      const ok = verifyUnique(starBoard, attempt);
      if (ok) return ok;
    }
    throw new Error(`star-battle gen failed: size=${size} K=${starsPerUnit} seed=${seed}`);
  }
  return __toCommonJS(star_battle_engine_exports);
})();
