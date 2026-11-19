var SudokuEngine = (() => {
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

  // src/lib/puzzle-core/sudoku-engine.ts
  var sudoku_engine_exports = {};
  __export(sudoku_engine_exports, {
    countSolutions: () => countSolutions,
    generate: () => generate,
    givenTarget: () => givenTarget,
    hintLookup: () => hintLookup,
    symbolsForSize: () => symbolsForSize,
    validate: () => validate
  });
  var EMPTY = -1;
  var DIFFICULTIES = ["easy", "medium", "hard", "expert"];
  var GIVEN_DENSITY = {
    9: { easy: 0.5, medium: 0.42, hard: 0.35, expert: 0.29 },
    12: { easy: 0.55, medium: 0.47, hard: 0.4, expert: 0.34 },
    16: { easy: 0.7, medium: 0.58, hard: 0.48, expert: 0.4 },
    25: { easy: 0.64, medium: 0.58, hard: 0.54, expert: 0.5 }
  };
  var DEFAULT_DENSITY = {
    easy: 0.6,
    medium: 0.52,
    hard: 0.45,
    expert: 0.38
  };
  function givenTarget(size, difficulty) {
    const table = GIVEN_DENSITY[size] ?? DEFAULT_DENSITY;
    const d = table[difficulty] ?? DEFAULT_DENSITY[difficulty];
    return Math.max(2, Math.round(size * size * d));
  }
  function symbolsForSize(size) {
    const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (size === 16) return ("0123456789" + LETTERS.slice(0, 6)).split("");
    const out = [];
    const digits = Math.min(size, 9);
    for (let i = 0; i < digits; i++) out.push(String(i + 1));
    for (let i = 0; out.length < size; i++) out.push(LETTERS[i]);
    return out;
  }
  function makeRng(seed) {
    let s = seed >>> 0 || 2654435769;
    return () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
  }
  function mixSeed(seed, salt) {
    let h = (seed ^ 2654435769) >>> 0;
    h = Math.imul(h ^ salt + 2246822507, 3266489909) >>> 0;
    h ^= h >>> 16;
    return h >>> 0 || 1;
  }
  function shuffled(items, rng) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = rng() * (i + 1) | 0;
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  function range(n) {
    return Array.from({ length: n }, (_, i) => i);
  }
  function makeSolution(size, blockW, blockH, rng) {
    const bands = shuffled(range(size / blockH), rng);
    const rowOrder = [];
    for (const band of bands) {
      const rows = shuffled(range(blockH).map((i) => band * blockH + i), rng);
      for (const r of rows) rowOrder.push(r);
    }
    const stacks = shuffled(range(size / blockW), rng);
    const colOrder = [];
    for (const stack of stacks) {
      const cols = shuffled(range(blockW).map((i) => stack * blockW + i), rng);
      for (const c of cols) colOrder.push(c);
    }
    const digits = shuffled(range(size), rng);
    const out = new Array(size * size);
    for (let r = 0; r < size; r++) {
      const src = rowOrder[r];
      for (let c = 0; c < size; c++) {
        const base = (blockW * (src % blockH) + Math.floor(src / blockH) + colOrder[c]) % size;
        out[r * size + c] = digits[base] + 1;
      }
    }
    return out;
  }
  function popcount(x) {
    let v = x - (x >> 1 & 1431655765);
    v = (v & 858993459) + (v >> 2 & 858993459);
    v = v + (v >> 4) & 252645135;
    return v * 16843009 >>> 24;
  }
  var EXHAUSTED = -1;
  var GEOMETRY = /* @__PURE__ */ new Map();
  function geometryFor(size, blockW, blockH) {
    const key = `${size}:${blockW}:${blockH}`;
    const cached = GEOMETRY.get(key);
    if (cached) return cached;
    const n = size * size;
    const boxesPerRow = Math.max(1, Math.round(size / blockW));
    const boxOf = new Uint16Array(n);
    for (let i = 0; i < n; i++) {
      const r = i / size | 0;
      const c = i % size;
      boxOf[i] = (r / blockH | 0) * boxesPerRow + (c / blockW | 0);
    }
    const units = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) row.push(r * size + c);
      units.push(row);
    }
    for (let c = 0; c < size; c++) {
      const col = [];
      for (let r = 0; r < size; r++) col.push(r * size + c);
      units.push(col);
    }
    for (let br = 0; br < size / blockH; br++) {
      for (let bc = 0; bc < boxesPerRow; bc++) {
        const box = [];
        for (let dr = 0; dr < blockH; dr++) {
          for (let dc = 0; dc < blockW; dc++) box.push((br * blockH + dr) * size + bc * blockW + dc);
        }
        units.push(box);
      }
    }
    const geo = { size, n, fullMask: (1 << size) - 1, boxOf, units };
    GEOMETRY.set(key, geo);
    return geo;
  }
  function countSolutionsBounded(size, blockW, blockH, values, limit, maxNodes) {
    const geo = geometryFor(size, blockW, blockH);
    const { n, fullMask, boxOf, units } = geo;
    const board = new Int8Array(n).fill(EMPTY);
    const rowMask = new Uint32Array(size);
    const colMask = new Uint32Array(size);
    const boxMask = new Uint32Array(size);
    for (let i = 0; i < n; i++) {
      const v = values[i];
      if (v <= 0) continue;
      if (v > size) return 0;
      const bit = 1 << v - 1;
      const r = i / size | 0;
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
    const stack = [];
    const undoTo = (mark) => {
      while (stack.length > mark) {
        const idx = stack.pop();
        const v = board[idx];
        board[idx] = EMPTY;
        const bit = 1 << v - 1;
        rowMask[idx / size | 0] &= ~bit;
        colMask[idx % size] &= ~bit;
        boxMask[boxOf[idx]] &= ~bit;
      }
    };
    const posMasks = new Uint32Array(size);
    const fillHiddenSingles = () => {
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
            unitMask |= 1 << v - 1;
            continue;
          }
          const avail = fullMask & ~(rowMask[i / size | 0] | colMask[i % size] | boxMask[boxOf[i]]);
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
            if (p === 0) return -1;
            if ((p & p - 1) === 0) {
              const i = unit[31 - Math.clz32(p)];
              board[i] = 31 - Math.clz32(bit) + 1;
              rowMask[i / size | 0] |= bit;
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
    const search = () => {
      if (++nodes > maxNodes) {
        exhausted = true;
        return false;
      }
      const base = stack.length;
      for (; ; ) {
        let filled = 0;
        for (let i = 0; i < n; i++) {
          if (board[i] !== EMPTY) continue;
          const r = i / size | 0;
          const c = i % size;
          const b = boxOf[i];
          const avail = fullMask & ~(rowMask[r] | colMask[c] | boxMask[b]);
          if (avail === 0) {
            undoTo(base);
            return true;
          }
          if ((avail & avail - 1) === 0) {
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
      let bestCell = -1;
      let bestMask = 0;
      let bestCount = size + 1;
      for (let i = 0; i < n; i++) {
        if (board[i] !== EMPTY) continue;
        const r = i / size | 0;
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
      const r0 = bestCell / size | 0;
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
  function countSolutions(p, limit = 2) {
    const size = p.size;
    const n = size * size;
    const values = new Int8Array(n).fill(EMPTY);
    for (const [idx, v] of p.givens) {
      if (Number.isInteger(idx) && idx >= 0 && idx < n) values[idx] = v;
    }
    const lim = Math.max(1, Math.floor(limit) || 2);
    let cap = 2e5;
    let res = countSolutionsBounded(size, p.blockW, p.blockH, values, lim, cap);
    while (res === EXHAUSTED && cap < 64e5) {
      cap *= 4;
      res = countSolutionsBounded(size, p.blockW, p.blockH, values, lim, cap);
    }
    return { count: res === EXHAUSTED ? -1 : res };
  }
  function validate(p, vals) {
    const size = p.size;
    const n = size * size;
    const errors = [];
    if (!vals || vals.length !== n) {
      return { ok: false, errors: [`Board must have ${n} cells (got ${vals ? vals.length : 0})`] };
    }
    const symbol = (v) => p.symbols[v - 1] ?? String(v);
    for (let i = 0; i < n; i++) {
      const v = vals[i];
      if (v > size || v < EMPTY) {
        errors.push(`Cell r${(i / size | 0) + 1}c${i % size + 1} has invalid value ${v}`);
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
        errors.push(`Cell r${(idx / size | 0) + 1}c${idx % size + 1} is given ${symbol(v)} but has ${symbol(cur)}`);
      }
    }
    return { ok: errors.length === 0, errors };
  }
  function hintLookup(p, idx) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= p.size * p.size) return -1;
    const v = p.solution[idx];
    if (!Number.isInteger(v) || v < 1 || v > p.size) return -1;
    return v;
  }
  function checkNodeCap(size) {
    if (size >= 20) return 1e4;
    if (size >= 14) return 2e4;
    return 6e4;
  }
  function digHoles(size, blockW, blockH, solution, target, rng, deadline) {
    const n = size * size;
    const values = new Int8Array(n);
    for (let i = 0; i < n; i++) values[i] = solution[i];
    let givens = n;
    const cap = checkNodeCap(size);
    const tryRemove = (batch) => {
      if (batch.length === 0 || givens <= target) return;
      if (Date.now() > deadline) return;
      if (batch.length > 1 && givens - batch.length < target) {
        const mid2 = batch.length >> 1;
        tryRemove(batch.slice(0, mid2));
        tryRemove(batch.slice(mid2));
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
  function assertParams(size, blockW, blockH) {
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
  function tierForGivens(size, givens) {
    for (let i = DIFFICULTIES.length - 1; i >= 0; i--) {
      if (givens <= givenTarget(size, DIFFICULTIES[i])) return DIFFICULTIES[i];
    }
    return "easy";
  }
  function buildPuzzle(size, blockW, blockH, values, solution, difficulty, seed) {
    const givens = [];
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
      difficulty
    };
  }
  function generate(size, blockW, blockH, difficulty, seed = Date.now(), timeBudgetMs = 8e3) {
    assertParams(size, blockW, blockH);
    const n = size * size;
    const budget = Number.isFinite(timeBudgetMs) && timeBudgetMs > 0 ? timeBudgetMs : 8e3;
    const deadline = Date.now() + budget;
    const rootSeed = seed >>> 0 || 1;
    const startIdx = DIFFICULTIES.indexOf(difficulty);
    const startTier = startIdx >= 0 ? startIdx : 1;
    let best = null;
    for (let tier = startTier; tier >= 0; tier--) {
      const target = givenTarget(size, DIFFICULTIES[tier]);
      if (best !== null && best.givens <= target) break;
      for (let attempt = 0; attempt < 20; attempt++) {
        const now = Date.now();
        if (now >= deadline) break;
        const slice = Math.max(300, Math.min(deadline - now, Math.round(budget / 3)));
        const attemptSeed = mixSeed(rootSeed, (tier + 1) * 1e3 + attempt);
        const rng2 = makeRng(attemptSeed);
        const solution2 = makeSolution(size, blockW, blockH, rng2);
        const dug = digHoles(size, blockW, blockH, solution2, target, rng2, Math.min(deadline, now + slice));
        if (dug.givens <= target) {
          const proven = Date.now() >= deadline || countSolutionsBounded(size, blockW, blockH, dug.values, 2, checkNodeCap(size) * 2) === 1;
          if (proven) return buildPuzzle(size, blockW, blockH, dug.values, solution2, DIFFICULTIES[tier], attemptSeed);
        } else if (best === null || dug.givens < best.givens) {
          best = { values: dug.values, solution: solution2, givens: dug.givens, seed: attemptSeed };
        }
      }
      if (Date.now() >= deadline) break;
    }
    if (best !== null && best.givens < n) {
      const tier = tierForGivens(size, best.givens);
      return buildPuzzle(size, blockW, blockH, best.values, best.solution, tier, best.seed);
    }
    const rng = makeRng(rootSeed);
    const solution = makeSolution(size, blockW, blockH, rng);
    const values = new Int8Array(n);
    for (let i = 0; i < n; i++) values[i] = solution[i];
    return buildPuzzle(size, blockW, blockH, values, solution, "easy", rootSeed);
  }
  return __toCommonJS(sudoku_engine_exports);
})();
