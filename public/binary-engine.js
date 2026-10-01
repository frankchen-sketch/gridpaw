var BinaryEngine = (() => {
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

  // src/lib/puzzle-core/binary-engine.ts
  var binary_engine_exports = {};
  __export(binary_engine_exports, {
    countSolutions: () => countSolutions,
    generate: () => generate,
    hintLookup: () => hintLookup,
    validate: () => validate
  });

  // src/lib/puzzle-core/constraints.ts
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

  // src/lib/puzzle-core/binary-engine.ts
  function makeSolution(N, takuzu, rng) {
    const vals = new Int8Array(N * N).fill(-1);
    const rows = Array.from({ length: N }, () => /* @__PURE__ */ new Set());
    const cols = Array.from({ length: N }, () => /* @__PURE__ */ new Set());
    const rowKey = (r) => Array.from({ length: N }, (_, c) => vals[r * N + c]).join("");
    const colKey = (c) => Array.from({ length: N }, (_, r) => vals[r * N + c]).join("");
    const fill = (idx) => {
      if (idx === N * N) return true;
      const r = idx / N | 0, c = idx % N;
      const order = rng() < 0.5 ? [0, 1] : [1, 0];
      for (const v of order) {
        vals[idx] = v;
        if (noThreeRunViolation(vals, N, idx)) {
          vals[idx] = -1;
          continue;
        }
        rows[r].add(String(v));
        cols[c].add(String(v));
        if (rows[r].size > 2 || cols[c].size > 2) {
          rows[r].delete(String(v));
          cols[c].delete(String(v));
          vals[idx] = -1;
          continue;
        }
        let rc = 0, cc = 0;
        for (let i = 0; i < N; i++) {
          if (vals[r * N + i] === v) rc++;
          if (vals[i * N + c] === v) cc++;
        }
        if (rc > N / 2 || cc > N / 2) {
          rows[r].delete(String(v));
          cols[c].delete(String(v));
          vals[idx] = -1;
          continue;
        }
        if (fill(idx + 1)) return true;
        rows[r].delete(String(v));
        cols[c].delete(String(v));
        vals[idx] = -1;
      }
      return false;
    };
    if (!fill(0)) return null;
    if (takuzu) {
      const seenR = /* @__PURE__ */ new Set(), seenC = /* @__PURE__ */ new Set();
      for (let r = 0; r < N; r++) {
        const k = rowKey(r);
        if (seenR.has(k)) return makeSolution(N, takuzu, rng);
        seenR.add(k);
      }
      for (let c = 0; c < N; c++) {
        const k = colKey(c);
        if (seenC.has(k)) return makeSolution(N, takuzu, rng);
        seenC.add(k);
      }
    }
    return vals;
  }
  function makeCandidateFn(N, takuzu) {
    return (idx, vals, v) => {
      vals[idx] = v;
      if (noThreeRunViolation(vals, N, idx)) {
        vals[idx] = -1;
        return false;
      }
      const r = idx / N | 0, c = idx % N;
      if (balanceViolated(vals, N, "row", r, [0, 1]) || balanceViolated(vals, N, "col", c, [0, 1])) {
        vals[idx] = -1;
        return false;
      }
      if (takuzu) {
        const rowFull = Array.from({ length: N }, (_, i) => vals[r * N + i]).every((x) => x >= 0);
        if (rowFull) {
          const key = Array.from({ length: N }, (_, i) => vals[r * N + i]).join("");
          for (let rr = 0; rr < N; rr++) {
            if (rr === r) continue;
            if (Array.from({ length: N }, (_, i) => vals[rr * N + i]).every((x) => x >= 0) && Array.from({ length: N }, (_, i) => vals[rr * N + i]).join("") === key) {
              vals[idx] = -1;
              return false;
            }
          }
        }
        const colFull = Array.from({ length: N }, (_, i) => vals[i * N + c]).every((x) => x >= 0);
        if (colFull) {
          const key = Array.from({ length: N }, (_, i) => vals[i * N + c]).join("");
          for (let cc = 0; cc < N; cc++) {
            if (cc === c) continue;
            if (Array.from({ length: N }, (_, i) => vals[i * N + cc]).every((x) => x >= 0) && Array.from({ length: N }, (_, i) => vals[i * N + cc]).join("") === key) {
              vals[idx] = -1;
              return false;
            }
          }
        }
      }
      vals[idx] = -1;
      return true;
    };
  }
  function countSolutions(N, takuzu, givens, limit = 2) {
    const vals = new Int8Array(N * N).fill(-1);
    for (const [i, v] of givens) vals[i] = v;
    const empties = Array.from({ length: N * N }, (_, i) => i).filter((i) => vals[i] === -1);
    const res = solveBoard(
      N,
      [0, 1],
      empties,
      makeCandidateFn(N, takuzu),
      (v, emit) => emit(v),
      limit,
      vals
    );
    return { count: res.count, first: res.solution };
  }
  function hintLookup(puzzle, idx) {
    return puzzle.solution[idx];
  }
  function validate(puzzle, vals) {
    const { size: N, takuzu } = puzzle;
    const errors = [];
    for (let r = 0; r < N; r++) if (balanceViolated(vals, N, "row", r, [0, 1])) errors.push(`Row ${r + 1} unbalanced`);
    for (let c = 0; c < N; c++) if (balanceViolated(vals, N, "col", c, [0, 1])) errors.push(`Col ${c + 1} unbalanced`);
    for (let i = 0; i < N * N; i++) if (vals[i] >= 0 && noThreeRunViolation(vals, N, i)) {
      errors.push(`Three-in-a-row at ${i}`);
      break;
    }
    if (takuzu) {
      const rk = /* @__PURE__ */ new Map(), ck = /* @__PURE__ */ new Map();
      for (let r = 0; r < N; r++) {
        const key = Array.from({ length: N }, (_, i) => vals[r * N + i]).join("");
        if (key.includes("-")) continue;
        if (rk.has(key)) errors.push(`Rows ${rk.get(key) + 1} and ${r + 1} identical`);
        rk.set(key, r);
      }
      for (let c = 0; c < N; c++) {
        const key = Array.from({ length: N }, (_, i) => vals[i * N + c]).join("");
        if (key.includes("-")) continue;
        if (ck.has(key)) errors.push(`Cols ${ck.get(key) + 1} and ${c + 1} identical`);
        ck.set(key, c);
      }
    }
    return { ok: errors.length === 0, errors };
  }
  function generate(size, difficulty, seed = Date.now(), takuzu = true) {
    if (size % 2 !== 0) throw new Error("Binary puzzle size must be even");
    let s = seed >>> 0 || 1;
    const rng = () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
    const solution = makeSolution(size, takuzu, rng);
    if (!solution) throw new Error("binary gen failed");
    const stopDensity = difficulty === "easy" ? 0.55 : difficulty === "medium" ? 0.32 : 0.15;
    const minGivens = Math.max(4, Math.round(size * size * stopDensity));
    let givens = Array.from({ length: size * size }, (_, i) => [i, solution[i]]);
    const order = Array.from({ length: size * size }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = rng() * (i + 1) | 0;
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (const idx of order) {
      if (givens.length <= minGivens) break;
      const kept = [];
      for (const g of givens) if (g[0] !== idx) kept.push(g);
      if (countSolutions(size, takuzu, kept).count === 1) givens = kept;
    }
    return { id: `bin-${size}-${difficulty}-${seed}`, size, takuzu, givens, solution, difficulty };
  }
  return __toCommonJS(binary_engine_exports);
})();
