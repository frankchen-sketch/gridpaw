var SlitherEngine = (() => {
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

  // src/lib/puzzle-core/slitherlink-engine.ts
  var slitherlink_engine_exports = {};
  __export(slitherlink_engine_exports, {
    countSolutions: () => countSolutions,
    edgeCount: () => edgeCount,
    generate: () => generate,
    hIdx: () => hIdx,
    hintLookup: () => hintLookup,
    makeLoop: () => makeLoop,
    vIdx: () => vIdx,
    validate: () => validate
  });
  function hIdx(rows, cols, r, c) {
    return r * cols + c;
  }
  function vIdx(rows, cols, r, c) {
    return (rows + 1) * cols + r * (cols + 1) + c;
  }
  function edgeCount(rows, cols) {
    return (rows + 1) * cols + rows * (cols + 1);
  }
  function cellEdges(rows, cols, r, c) {
    return [
      hIdx(rows, cols, r, c),
      // top
      hIdx(rows, cols, r + 1, c),
      // bottom
      vIdx(rows, cols, r, c),
      // left
      vIdx(rows, cols, r, c + 1)
      // right
    ];
  }
  function makeLoop(rows, cols, rng, minLen) {
    const N = rows * cols;
    let s = new Uint8Array(N);
    for (let i = 0; i < N; i++) s[i] = rng() < 0.5 ? 1 : 0;
    const compOf = new Int32Array(N).fill(-1);
    let comps = [];
    for (let i = 0; i < N; i++) {
      if (!s[i] || compOf[i] >= 0) continue;
      const comp = [];
      const stack2 = [i];
      compOf[i] = comps.length;
      while (stack2.length) {
        const v = stack2.pop();
        comp.push(v);
        const r = v / cols | 0, c = v % cols;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const u = nr * cols + nc;
          if (s[u] && compOf[u] < 0) {
            compOf[u] = compOf[i];
            stack2.push(u);
          }
        }
      }
      comps.push(comp);
    }
    if (comps.length > 1) {
      const keep = comps.reduce((a, b) => b.length > a.length ? b : a);
      const keepSet = new Set(keep);
      for (const comp of comps) {
        if (comp === keep) continue;
        for (const v of comp) s[v] = 1;
        for (const v of comp) {
          const r = v / cols | 0, c = v % cols;
          for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            const u = nr * cols + nc;
            if (keepSet.has(u)) {
              s[v] = 1;
              break;
            }
          }
        }
      }
      s = s;
    }
    const outside = new Uint8Array(N);
    const stack = [];
    for (let c = 0; c < cols; c++) {
      if (!s[c]) {
        outside[c] = 1;
        stack.push(c);
      }
      const b = (rows - 1) * cols + c;
      if (!s[b]) {
        outside[b] = 1;
        stack.push(b);
      }
    }
    for (let r = 0; r < rows; r++) {
      const l = r * cols;
      if (!s[l]) {
        outside[l] = 1;
        stack.push(l);
      }
      const rr = r * cols + cols - 1;
      if (!s[rr]) {
        outside[rr] = 1;
        stack.push(rr);
      }
    }
    while (stack.length) {
      const v = stack.pop();
      const r = v / cols | 0, c = v % cols;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const u = nr * cols + nc;
        if (!s[u] && !outside[u]) {
          outside[u] = 1;
          stack.push(u);
        }
      }
    }
    for (let i = 0; i < N; i++) if (!s[i] && !outside[i]) s[i] = 1;
    {
      const seen = new Uint8Array(N);
      const start = s.findIndex((x) => x === 1);
      if (start < 0) return null;
      const st = [start];
      seen[start] = 1;
      let cnt = 1;
      while (st.length) {
        const v = st.pop();
        const r = v / cols | 0, c = v % cols;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const u = nr * cols + nc;
          if (s[u] && !seen[u]) {
            seen[u] = 1;
            cnt++;
            st.push(u);
          }
        }
      }
      let total = 0;
      for (let i = 0; i < N; i++) total += s[i];
      if (cnt !== total) return null;
    }
    const sol = new Uint8Array(edgeCount(rows, cols));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const inS = s[r * cols + c];
        const above = r > 0 ? s[(r - 1) * cols + c] : 0;
        if (inS !== above) sol[hIdx(rows, cols, r, c)] = 1;
        const left = c > 0 ? s[r * cols + c - 1] : 0;
        if (inS !== left) sol[vIdx(rows, cols, r, c)] = 1;
        if (c === cols - 1 && inS !== 0) sol[vIdx(rows, cols, r, c + 1)] = 1;
        if (r === rows - 1 && inS !== 0) sol[hIdx(rows, cols, r + 1, c)] = 1;
      }
    }
    let len = 0;
    for (let i = 0; i < sol.length; i++) len += sol[i];
    if (len < minLen) return null;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        let d = 0;
        if (c < cols) d += sol[hIdx(rows, cols, r, c)];
        if (c > 0) d += sol[hIdx(rows, cols, r, c - 1)];
        if (r < rows) d += sol[vIdx(rows, cols, r, c)];
        if (r > 0) d += sol[vIdx(rows, cols, r - 1, c)];
        if (d !== 0 && d !== 2) return null;
      }
    }
    return sol;
  }
  function countSolutions(puzzle, limit = 2) {
    const { rows, cols, clues } = puzzle;
    const E = edgeCount(rows, cols);
    const sol = new Int8Array(E).fill(-1);
    const vdeg = new Int16Array((rows + 1) * (cols + 1));
    let count = 0;
    let first = null;
    const cellTop = (r, c) => hIdx(rows, cols, r, c);
    const cellBottom = (r, c) => hIdx(rows, cols, r + 1, c);
    const cellLeft = (r, c) => vIdx(rows, cols, r, c);
    const cellRight = (r, c) => vIdx(rows, cols, r, c + 1);
    const combosFor = (clue) => {
      const out = [];
      for (let m = 0; m < 16; m++) {
        let bits = 0;
        for (let b = 0; b < 4; b++) if (m & 1 << b) bits++;
        if (bits === clue) out.push(m);
      }
      return out;
    };
    const applyCell = (r, c, mask) => {
      const eIdx = [cellTop(r, c), cellBottom(r, c), cellLeft(r, c), cellRight(r, c)];
      for (let b = 0; b < 4; b++) {
        const want = mask >> b & 1;
        const ei = eIdx[b];
        if (sol[ei] !== -1 && sol[ei] !== want) return null;
      }
      const introduced = [];
      for (let b = 0; b < 4; b++) {
        const want = mask >> b & 1;
        const ei = eIdx[b];
        if (sol[ei] === -1) {
          sol[ei] = want;
          introduced.push(ei);
        }
      }
      const verts = [r * (cols + 1) + c, r * (cols + 1) + c + 1, (r + 1) * (cols + 1) + c, (r + 1) * (cols + 1) + c + 1];
      let degreeFailed = false;
      for (const ei of introduced) {
        if (sol[ei] !== 1) continue;
        if (ei < (rows + 1) * cols) {
          const rr = ei / cols | 0, cc = ei % cols;
          vdeg[rr * (cols + 1) + cc]++;
          vdeg[rr * (cols + 1) + cc + 1]++;
        } else {
          const i2 = ei - (rows + 1) * cols;
          const rr = i2 / (cols + 1) | 0, cc = i2 % (cols + 1);
          vdeg[rr * (cols + 1) + cc]++;
          vdeg[(rr + 1) * (cols + 1) + cc]++;
        }
      }
      for (const v of verts) if (vdeg[v] > 2) {
        degreeFailed = true;
        break;
      }
      if (degreeFailed) {
        for (const ei of introduced) {
          if (sol[ei] !== 1) {
            sol[ei] = -1;
            continue;
          }
          if (ei < (rows + 1) * cols) {
            const rr = ei / cols | 0, cc = ei % cols;
            vdeg[rr * (cols + 1) + cc]--;
            vdeg[rr * (cols + 1) + cc + 1]--;
          } else {
            const i2 = ei - (rows + 1) * cols;
            const rr = i2 / (cols + 1) | 0, cc = i2 % (cols + 1);
            vdeg[rr * (cols + 1) + cc]--;
            vdeg[(rr + 1) * (cols + 1) + cc]--;
          }
          sol[ei] = -1;
        }
        return null;
      }
      return { introduced };
    };
    const undoCell = (applied, r, c, mask) => {
      if (!applied) return;
      const eIdx = [cellTop(r, c), cellBottom(r, c), cellLeft(r, c), cellRight(r, c)];
      const introducedSet = new Set(applied.introduced);
      for (const ei of applied.introduced) {
        if (sol[ei] !== 1) {
          if (introducedSet.has(ei)) sol[ei] = -1;
          continue;
        }
        if (ei < (rows + 1) * cols) {
          const rr = ei / cols | 0, cc = ei % cols;
          vdeg[rr * (cols + 1) + cc]--;
          vdeg[rr * (cols + 1) + cc + 1]--;
        } else {
          const i2 = ei - (rows + 1) * cols;
          const rr = i2 / (cols + 1) | 0, cc = i2 % (cols + 1);
          vdeg[rr * (cols + 1) + cc]--;
          vdeg[(rr + 1) * (cols + 1) + cc]--;
        }
      }
      for (let b = 0; b < 4; b++) {
        const ei = eIdx[b];
        if (introducedSet.has(ei)) sol[ei] = -1;
      }
    };
    const finalize = () => {
      for (let v = 0; v < vdeg.length; v++) if (vdeg[v] !== 0 && vdeg[v] !== 2) return false;
      const par = /* @__PURE__ */ new Map();
      const find = (x) => {
        if (!par.has(x)) par.set(x, x);
        let r = x;
        while (par.get(r) !== r) r = par.get(r);
        par.set(x, r);
        return r;
      };
      let firstDot = -1;
      let usedAny = false;
      for (let ei = 0; ei < E; ei++) {
        if (sol[ei] !== 1) continue;
        usedAny = true;
        let a, b;
        if (ei < (rows + 1) * cols) {
          const r = ei / cols | 0, c = ei % cols;
          a = r * (cols + 1) + c;
          b = r * (cols + 1) + c + 1;
        } else {
          const i2 = ei - (rows + 1) * cols;
          const r = i2 / (cols + 1) | 0, c = i2 % (cols + 1);
          a = r * (cols + 1) + c;
          b = (r + 1) * (cols + 1) + c;
        }
        const ra = find(a), rb = find(b);
        if (ra !== rb) par.set(ra, rb);
        if (firstDot < 0) firstDot = a;
      }
      if (!usedAny) return false;
      const root = find(firstDot);
      for (let ei = 0; ei < E; ei++) {
        if (sol[ei] !== 1) continue;
        let a, b;
        if (ei < (rows + 1) * cols) {
          const r = ei / cols | 0, c = ei % cols;
          a = r * (cols + 1) + c;
          b = r * (cols + 1) + c + 1;
        } else {
          const i2 = ei - (rows + 1) * cols;
          const r = i2 / (cols + 1) | 0, c = i2 % (cols + 1);
          a = r * (cols + 1) + c;
          b = (r + 1) * (cols + 1) + c;
        }
        if (find(a) !== root || find(b) !== root) return false;
      }
      return true;
    };
    const cellCombos = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cellCombos.push(combosFor(clues[r * cols + c]));
    const rec = (ci) => {
      if (count >= limit) return true;
      if (ci === rows * cols) {
        if (finalize()) {
          count++;
          if (count === 1) first = Uint8Array.from(sol, (x) => x === 1 ? 1 : 0);
        }
        return count >= limit;
      }
      const r = ci / cols | 0, c = ci % cols;
      for (const mask of cellCombos[ci]) {
        const applied = applyCell(r, c, mask);
        if (!applied) continue;
        const v = r * (cols + 1) + c;
        if (vdeg[v] !== 0 && vdeg[v] !== 2) {
          undoCell(applied, r, c, mask);
          continue;
        }
        rec(ci + 1);
        undoCell(applied, r, c, mask);
        if (count >= limit) return true;
      }
      return false;
    };
    rec(0);
    return { count, first };
  }
  function hintLookup(puzzle, edgeIdx) {
    return puzzle.solution[edgeIdx];
  }
  function validate(puzzle, edges) {
    const { rows, cols, clues } = puzzle;
    const errors = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        let d = 0;
        if (c < cols) d += edges[hIdx(rows, cols, r, c)];
        if (c > 0) d += edges[hIdx(rows, cols, r, c - 1)];
        if (r < rows) d += edges[vIdx(rows, cols, r, c)];
        if (r > 0) d += edges[vIdx(rows, cols, r - 1, c)];
        if (d !== 0 && d !== 2) errors.push(`Vertex (${r},${c}) has degree ${d}`);
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ci = r * cols + c;
        if (clues[ci] < 0) continue;
        const sum = cellEdges(rows, cols, r, c).reduce((a, ei) => a + edges[ei], 0);
        if (sum !== clues[ci]) errors.push(`Cell (${r},${c}) has ${sum} loop edges, needs ${clues[ci]}`);
      }
    }
    const E = edgeCount(rows, cols);
    const used = [];
    for (let i = 0; i < E; i++) if (edges[i]) used.push(i);
    if (!used.length) errors.push("Loop is empty");
    else {
      const dot = (ei) => {
        if (ei < (rows + 1) * cols) {
          const r = ei / cols | 0, c = ei % cols;
          return [r, c];
        }
        const i2 = ei - (rows + 1) * cols;
        return [i2 / (cols + 1) | 0, i2 % (cols + 1)];
      };
      const id = (r, c) => r * (cols + 1) + c;
      const par = /* @__PURE__ */ new Map();
      const find = (x) => {
        if (!par.has(x)) par.set(x, x);
        let r = x;
        while (par.get(r) !== r) r = par.get(r);
        par.set(x, r);
        return r;
      };
      for (const ei of used) {
        const [r, c] = dot(ei);
        let b;
        if (ei < (rows + 1) * cols) b = [r, c + 1];
        else b = [r + 1, c];
        const ra = find(id(r, c)), rb = find(id(b[0], b[1]));
        if (ra !== rb) par.set(ra, rb);
      }
      const [r0, c0] = dot(used[0]);
      const root = find(id(r0, c0));
      for (const ei of used) {
        const [r, c] = dot(ei);
        if (find(id(r, c)) !== root) {
          errors.push("Loop is not connected (multiple loops)");
          break;
        }
      }
    }
    return { ok: errors.length === 0, errors };
  }
  function generate(rows, cols, difficulty, seed = Date.now()) {
    let s = seed >>> 0 || 1;
    const rng = () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
    const minLen = difficulty === "easy" ? Math.max(10, rows + cols) : difficulty === "medium" ? Math.max(16, (rows + cols) * 3 / 2) : Math.max(22, rows + cols * 2);
    for (let attempt = 0; attempt < 300; attempt++) {
      const sol = makeLoop(rows, cols, rng, minLen);
      if (!sol) continue;
      const clues = new Int8Array(rows * cols);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sum = cellEdges(rows, cols, r, c).reduce((a, ei) => a + sol[ei], 0);
          clues[r * cols + c] = sum;
        }
      }
      const puzzle = {
        id: `slither-${rows}x${cols}-${difficulty}-${seed}-${attempt}`,
        rows,
        cols,
        clues,
        solution: sol,
        loopLen: sol.reduce((a, v) => a + v, 0),
        difficulty
      };
      const check = countSolutions(puzzle);
      if (check.count === 1) return puzzle;
    }
    throw new Error(`slither gen failed: ${rows}x${cols} ${difficulty} seed=${seed}`);
  }
  return __toCommonJS(slitherlink_engine_exports);
})();
