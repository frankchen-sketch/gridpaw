var CalcudokuEngine = (() => {
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

  // src/lib/puzzle-core/calcudoku-engine.ts
  var calcudoku_engine_exports = {};
  __export(calcudoku_engine_exports, {
    balanceViolated: () => balanceViolated,
    countGroups: () => countGroups,
    countSolutions: () => countSolutions,
    generate: () => generate,
    hintLookup: () => hintLookup,
    noThreeRunViolation: () => noThreeRunViolation,
    solveBoard: () => solveBoard,
    validate: () => validate
  });

  // src/lib/puzzle-core/constraints.ts
  function countGroups(N, pred) {
    const seen = new Uint8Array(N * N);
    let groups = 0;
    const stack = [];
    for (let i = 0; i < N * N; i++) {
      if (seen[i] || !pred(i)) continue;
      groups++;
      stack.push(i);
      seen[i] = 1;
      while (stack.length) {
        const cur = stack.pop();
        const r = cur / N | 0, c = cur % N;
        const nbrs = [r > 0 ? cur - N : -1, r < N - 1 ? cur + N : -1, c > 0 ? cur - 1 : -1, c < N - 1 ? cur + 1 : -1];
        for (const nb of nbrs) {
          if (nb >= 0 && !seen[nb] && pred(nb)) {
            seen[nb] = 1;
            stack.push(nb);
          }
        }
      }
    }
    return groups;
  }
  function noThreeRunViolation(vals, N, idx) {
    const r = idx / N | 0, c = idx % N, v = vals[idx];
    if (v < 0) return false;
    let run = 1;
    for (let cc = c - 1; cc >= 0 && vals[r * N + cc] === v; cc--) run++;
    for (let cc = c + 1; cc < N && vals[r * N + cc] === v; cc++) run++;
    if (run >= 3) return true;
    run = 1;
    for (let rr = r - 1; rr >= 0 && vals[rr * N + c] === v; rr--) run++;
    for (let rr = r + 1; rr < N && vals[rr * N + c] === v; rr++) run++;
    return run >= 3;
  }
  function cageSatisfied(cage, vals) {
    const vs = cage.cells.map((i) => vals[i]);
    if (vs.some((v) => v < 0)) return false;
    switch (cage.op) {
      case "=":
        return vs[0] === cage.target;
      case "+":
        return vs.reduce((a, b) => a + b, 0) === cage.target;
      case "\xD7":
        return vs.reduce((a, b) => a * b, 1) === cage.target;
      case "-": {
        if (vs.length !== 2) return false;
        return Math.abs(vs[0] - vs[1]) === cage.target;
      }
      case "\xF7": {
        if (vs.length !== 2) return false;
        const a = Math.max(vs[0], vs[1]), b = Math.min(vs[0], vs[1]);
        return b > 0 && a % b === 0 && a / b === cage.target;
      }
    }
  }
  function cageReachable(cage, vals, N) {
    const filled = cage.cells.map((i) => vals[i]).filter((v) => v >= 0);
    const empty = cage.cells.length - filled.length;
    if (empty === 0) return cageSatisfied(cage, vals);
    switch (cage.op) {
      case "=":
        return false;
      // single cell must be filled
      case "+": {
        const sum = filled.reduce((a, b) => a + b, 0);
        return sum + empty * N <= cage.target && sum + empty * 1 >= cage.target;
      }
      case "\xD7": {
        const prod = filled.reduce((a, b) => a * b, 1);
        return prod * Math.pow(N, empty) >= cage.target;
      }
      case "-": {
        return true;
      }
      case "\xF7":
        return true;
    }
  }
  function balanceViolated(vals, N, line, li, symbols) {
    const counts = /* @__PURE__ */ new Map();
    let empty = 0;
    for (let i = 0; i < N; i++) {
      const v = line === "row" ? vals[li * N + i] : vals[i * N + li];
      if (v < 0) {
        empty++;
        continue;
      }
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    if (symbols.length !== 2) return false;
    const c1 = counts.get(symbols[0]) || 0, c2 = counts.get(symbols[1]) || 0;
    const half = N / 2;
    if (c1 > half || c2 > half) return true;
    return half - c1 + (half - c2) !== empty;
  }
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

  // src/lib/puzzle-core/calcudoku-engine.ts
  var OPS_SMALL = ["+", "\xD7"];
  var OPS_PAIR = ["+", "-", "\xD7", "\xF7"];
  function makeLatinSquare(N, rng) {
    const vals = new Int8Array(N * N).fill(-1);
    const rows = Array.from({ length: N }, () => []);
    const usedCol = Array.from({ length: N }, () => Array(N).fill(false));
    const digits = Array.from({ length: N }, (_, i) => i + 1);
    const rowFill = (r) => {
      for (let i = digits.length - 1; i > 0; i--) {
        const j = rng() * (i + 1) | 0;
        [digits[i], digits[j]] = [digits[j], digits[i]];
      }
      for (const v of digits) {
        if (usedCol[v - 1][r]) continue;
        vals[r * N + r] === -1;
      }
      const usedRow = /* @__PURE__ */ new Set();
      const fillCol = (c) => {
        if (c === N) return true;
        for (const v of digits) {
          if (usedCol[v - 1][c] || usedRow.has(v)) continue;
          vals[r * N + c] = v;
          usedCol[v - 1][c] = true;
          usedRow.add(v);
          if (fillCol(c + 1)) return true;
          vals[r * N + c] = -1;
          usedCol[v - 1][c] = false;
          usedRow.delete(v);
        }
        return false;
      };
      return fillCol(0);
    };
    for (let r = 0; r < N; r++) {
      if (!rowFill(r)) throw new Error("latin gen failed");
    }
    return vals;
  }
  function partitionCages(N, rng) {
    const total = N * N;
    const assigned = new Int8Array(total).fill(-1);
    const cageCells = [];
    const idxs = Array.from({ length: total }, (_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = rng() * (i + 1) | 0;
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    const neighbors = (i) => {
      const r = i / N | 0, c = i % N;
      const out = [];
      if (r > 0) out.push(i - N);
      if (r < N - 1) out.push(i + N);
      if (c > 0) out.push(i - 1);
      if (c < N - 1) out.push(i + 1);
      return out;
    };
    for (const seed of idxs) {
      if (assigned[seed] !== -1) continue;
      const cageId = cageCells.length;
      const cells = [seed];
      assigned[seed] = cageId;
      const max = 1 + (rng() * 4 | 0);
      while (cells.length < max) {
        const frontier = [];
        for (const cell of cells) for (const nb of neighbors(cell)) if (assigned[nb] === -1) frontier.push(nb);
        if (!frontier.length) break;
        const pick = frontier[rng() * frontier.length | 0];
        assigned[pick] = cageId;
        cells.push(pick);
      }
      cageCells.push(cells);
    }
    return cageCells;
  }
  function assignCageOps(cells, solution, rng) {
    return cells.map((list) => {
      const vs = list.map((i) => solution[i]);
      let op;
      if (list.length === 1) {
        op = "=";
      } else if (list.length === 2) {
        const [a, b] = vs;
        const candidates = [...OPS_PAIR];
        if (a % b !== 0 && b % a !== 0) {
          const ci = candidates.indexOf("\xF7");
          candidates.splice(ci, 1);
        }
        if (a === b) {
          const ci = candidates.indexOf("-");
          candidates.splice(ci, 1);
        }
        op = candidates[rng() * candidates.length | 0];
      } else {
        op = OPS_SMALL[rng() * OPS_SMALL.length | 0];
      }
      let target;
      switch (op) {
        case "=":
          target = vs[0];
          break;
        case "+":
          target = vs.reduce((a, b) => a + b, 0);
          break;
        case "\xD7":
          target = vs.reduce((a, b) => a * b, 1);
          break;
        case "-":
          target = Math.abs(vs[0] - vs[1]);
          break;
        case "\xF7": {
          const a = Math.max(vs[0], vs[1]), b = Math.min(vs[0], vs[1]);
          target = a / b;
          break;
        }
      }
      return { op, target, cells: list };
    });
  }
  function makeCandidateFn(N, cages, cageOf) {
    const cageAt = (idx) => cages[cageOf[idx]];
    return (idx, vals, v) => {
      const r = idx / N | 0, c = idx % N;
      for (let i = 0; i < N; i++) {
        if (vals[r * N + i] === v) return false;
        if (vals[i * N + c] === v) return false;
      }
      vals[idx] = v;
      const ok = cageReachable(cageAt(idx), vals, N);
      vals[idx] = -1;
      return ok;
    };
  }
  function countSolutions(N, cages, cageOf, givens, limit = 2) {
    const vals = new Int8Array(N * N).fill(-1);
    for (const [i, v] of givens) vals[i] = v;
    const empties = Array.from({ length: N * N }, (_, i) => i).filter((i) => vals[i] === -1);
    const res = solveBoard(
      N,
      Array.from({ length: N }, (_, i) => i + 1),
      empties,
      makeCandidateFn(N, cages, cageOf),
      // full-board check: all cages satisfied
      (v, emit) => {
        for (const cage of cages) if (!cageSatisfied(cage, v)) return;
        emit(v);
      },
      limit,
      vals
    );
    return { count: res.count, first: res.solution };
  }
  function hintLookup(puzzle, idx) {
    return puzzle.solution[idx];
  }
  function validate(puzzle, vals) {
    const { size: N, cages } = puzzle;
    const errors = [];
    for (let r = 0; r < N; r++) {
      const seen = /* @__PURE__ */ new Set();
      for (let c = 0; c < N; c++) {
        const v = vals[r * N + c];
        if (v > 0 && seen.has(v)) errors.push(`Row ${r + 1} has duplicate ${v}`);
        seen.add(v);
      }
    }
    for (let c = 0; c < N; c++) {
      const seen = /* @__PURE__ */ new Set();
      for (let r = 0; r < N; r++) {
        const v = vals[r * N + c];
        if (v > 0 && seen.has(v)) errors.push(`Col ${c + 1} has duplicate ${v}`);
        seen.add(v);
      }
    }
    for (const cage of cages) {
      if (!cageReachable(cage, vals, N)) errors.push(`Cage ${cage.target}${cage.op} impossible`);
    }
    return { ok: errors.length === 0, errors };
  }
  function generate(size, difficulty, seed = Date.now()) {
    let s = seed >>> 0;
    const rng = () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
    const solution = makeLatinSquare(size, rng);
    const cageCellLists = partitionCages(size, rng);
    const cages = assignCageOps(cageCellLists, solution, rng);
    const cageOf = new Int8Array(size * size).fill(-1);
    cages.forEach((cage, ci) => cage.cells.forEach((i) => {
      cageOf[i] = ci;
    }));
    const stopDensity = difficulty === "easy" ? 0.55 : difficulty === "medium" ? 0.3 : 0.12;
    const minGivens = Math.max(2, Math.round(size * size * stopDensity));
    let givens = Array.from({ length: size * size }, (_, i) => [i, solution[i]]);
    const order = Array.from({ length: size * size }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = rng() * (i + 1) | 0;
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (const idx of order) {
      if (givens.length <= minGivens) break;
      const kept = [];
      const removed = [];
      for (const g of givens) (g[0] === idx ? removed : kept).push(g);
      const check = countSolutions(size, cages, cageOf, kept);
      if (check.count === 1) givens = kept;
    }
    return {
      id: `calc-${size}-${difficulty}-${seed}`,
      size,
      cages,
      givens,
      solution,
      difficulty
    };
  }
  return __toCommonJS(calcudoku_engine_exports);
})();
