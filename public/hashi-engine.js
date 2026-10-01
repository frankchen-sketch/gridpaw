var HashiEngine = (() => {
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

  // src/lib/puzzle-core/hashi-engine.ts
  var hashi_engine_exports = {};
  __export(hashi_engine_exports, {
    computeEdges: () => computeEdges,
    countSolutions: () => countSolutions,
    generate: () => generate,
    hintLookup: () => hintLookup,
    makeLayout: () => makeLayout,
    makeSolution: () => makeSolution,
    validate: () => validate
  });
  function computeEdges(islands) {
    const edges = [];
    const n = islands.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const A = islands[i], B = islands[j];
        if (A.r === B.r || A.c === B.c) {
          const between = islands.some((k) => {
            if (A.r === B.r) return k.r === A.r && k.c > Math.min(A.c, B.c) && k.c < Math.max(A.c, B.c);
            return k.c === A.c && k.r > Math.min(A.r, B.r) && k.r < Math.max(A.r, B.r);
          });
          if (!between) edges.push({ a: i, b: j });
        }
      }
    }
    return edges;
  }
  function makeLayout(rows, cols, target, rng) {
    const islands = [];
    const taken = /* @__PURE__ */ new Set();
    let r = rows / 2 + (rng() * 3 | 0) - 1 | 0;
    let c = cols / 2 + (rng() * 3 | 0) - 1 | 0;
    r = Math.max(0, Math.min(rows - 1, r));
    c = Math.max(0, Math.min(cols - 1, c));
    islands.push({ r, c, degree: 0 });
    taken.add(r + "," + c);
    let guard = 0;
    while (islands.length < target && guard++ < target * 60) {
      const anchor = islands[rng() * islands.length | 0];
      const dir = rng() * 4 | 0;
      const dist = 2 + (rng() * 4 | 0);
      const nr = anchor.r + (dir === 0 ? -dist : dir === 1 ? dist : 0);
      const nc = anchor.c + (dir === 2 ? -dist : dir === 3 ? dist : 0);
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const key = nr + "," + nc;
      if (taken.has(key)) continue;
      const blocked = islands.some((isl) => {
        if (isl.r === anchor.r && anchor.r === nr && isl.c > Math.min(anchor.c, nc) && isl.c < Math.max(anchor.c, nc)) return true;
        if (isl.c === anchor.c && anchor.c === nc && isl.r > Math.min(anchor.r, nr) && isl.r < Math.max(anchor.r, nr)) return true;
        return false;
      });
      if (blocked) continue;
      let tooClose = false;
      for (const isl of islands) {
        const dr = Math.abs(isl.r - nr), dc = Math.abs(isl.c - nc);
        if (dr + dc < 2 || dr === 0 && dc === 1 || dc === 0 && dr === 1) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;
      islands.push({ r: nr, c: nc, degree: 0 });
      taken.add(key);
    }
    if (islands.length < Math.max(6, target * 0.8)) return null;
    for (const isl of islands) isl.degree = 2 + (rng() * 7 | 0);
    return islands;
  }
  function makeSolution(rows, cols, islands, edges, rng) {
    const rem = islands.map((i) => i.degree);
    const sol = new Int8Array(edges.length);
    const idxOf = /* @__PURE__ */ new Map();
    edges.forEach((e, i) => idxOf.set(e.a + "," + e.b, i));
    const adj = islands.map(() => []);
    edges.forEach((e, i) => {
      adj[e.a].push(i);
      adj[e.b].push(i);
    });
    const order = islands.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = rng() * (i + 1) | 0;
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (const isl of order) {
      while (rem[isl] > 0) {
        const cands = adj[isl].filter((ei) => {
          const e = edges[ei];
          const other2 = e.a === isl ? e.b : e.a;
          return sol[ei] < 2 && rem[other2] > 0;
        });
        if (!cands.length) return null;
        cands.sort((x, y) => {
          const ox = edges[x].a === isl ? edges[x].b : edges[x].a;
          const oy = edges[y].a === isl ? edges[y].b : edges[y].a;
          return rem[ox] - rem[oy];
        });
        const pick = cands[rng() * Math.min(3, cands.length) | 0];
        const other = edges[pick].a === isl ? edges[pick].b : edges[pick].a;
        sol[pick]++;
        rem[isl]--;
        rem[other]--;
      }
    }
    if (rem.some((x) => x !== 0)) return null;
    const parent = islands.map((_, i) => i);
    const findU = (x) => parent[x] === x ? x : parent[x] = findU(parent[x]);
    edges.forEach((e, i) => {
      if (sol[i] > 0) {
        const ra = findU(e.a), rb = findU(e.b);
        if (ra !== rb) parent[ra] = rb;
      }
    });
    const root = findU(0);
    for (let i = 1; i < islands.length; i++) if (findU(i) !== root) return null;
    return sol;
  }
  function countSolutions(puzzle, limit = 2) {
    const { islands, edges } = puzzle;
    const degrees = islands.map((i) => i.degree);
    const sol = new Int8Array(edges.length);
    const rem = degrees.slice();
    const adj = islands.map(() => []);
    edges.forEach((e, i) => {
      adj[e.a].push(i);
      adj[e.b].push(i);
    });
    let count = 0;
    let firstSol = null;
    const canStillConnect = () => {
      const parent = islands.map((_, i) => i);
      const find = (x) => parent[x] === x ? x : parent[x] = find(parent[x]);
      const union = (a, b) => {
        const ra = find(a), rb = find(b);
        if (ra !== rb) parent[ra] = rb;
      };
      edges.forEach((e, i) => {
        if (sol[i] > 0) union(e.a, e.b);
        else {
          const cap = Math.min(2 - sol[i], rem[e.a], rem[e.b]);
          if (cap > 0) {
          }
        }
      });
      for (let pass = 0; pass < edges.length + 2; pass++) {
        let changed = false;
        for (let i = 0; i < edges.length; i++) {
          if (sol[i] > 0) continue;
          const e = edges[i];
          const cap = Math.min(2 - sol[i], rem[e.a], rem[e.b]);
          if (cap > 0) {
            const ra = find(e.a), rb = find(e.b);
            if (ra !== rb) {
              union(e.a, e.b);
              changed = true;
            }
          }
        }
        if (!changed) break;
      }
      const root = find(0);
      for (let i = 1; i < islands.length; i++) if (find(i) !== root) return false;
      return true;
    };
    const rec = (ei) => {
      if (count >= limit) return true;
      if (ei === edges.length) {
        if (rem.some((x) => x !== 0)) return false;
        const parent = islands.map((_, i) => i);
        const find = (x) => parent[x] === x ? x : parent[x] = find(parent[x]);
        edges.forEach((e2, i) => {
          if (sol[i] > 0) {
            const ra = find(e2.a), rb = find(e2.b);
            if (ra !== rb) parent[ra] = rb;
          }
        });
        const root = find(0);
        for (let i = 1; i < islands.length; i++) if (find(i) !== root) return false;
        count++;
        if (count === 1) firstSol = sol.slice();
        return count >= limit;
      }
      const e = edges[ei];
      for (let v = 0; v <= 2; v++) {
        if (rem[e.a] < v || rem[e.b] < v) continue;
        sol[ei] = v;
        rem[e.a] -= v;
        rem[e.b] -= v;
        let feasible = true;
        for (let isl = 0; isl < islands.length && feasible; isl++) {
          if (rem[isl] === 0) continue;
          let cap = 0;
          for (let k = ei + 1; k < edges.length; k++) {
            const ek = edges[k];
            if ((ek.a === isl || ek.b === isl) && sol[k] === 0) cap += 2;
          }
          if (rem[isl] > cap) feasible = false;
        }
        if (feasible && rec(ei + 1)) {
          rem[e.a] += v;
          rem[e.b] += v;
          sol[ei] = 0;
          return true;
        }
        rem[e.a] += v;
        rem[e.b] += v;
        sol[ei] = 0;
      }
      return false;
    };
    rec(0);
    return { count, first: firstSol };
  }
  function hintLookup(puzzle, edgeIdx) {
    return puzzle.solution[edgeIdx];
  }
  function validate(puzzle, counts) {
    const { islands, edges } = puzzle;
    const errors = [];
    const deg = new Int32Array(islands.length);
    edges.forEach((e, i) => {
      const v = counts[i];
      if (v < 0 || v > 2) errors.push(`Edge ${i} invalid count ${v}`);
      deg[e.a] += v;
      deg[e.b] += v;
    });
    islands.forEach((isl, i) => {
      if (deg[i] !== isl.degree) errors.push(`Island (${isl.r},${isl.c}) has ${deg[i]} bridges, needs ${isl.degree}`);
    });
    const parent = islands.map((_, i) => i);
    const find = (x) => parent[x] === x ? x : parent[x] = find(parent[x]);
    edges.forEach((e, i) => {
      if (counts[i] > 0) {
        const ra = find(e.a), rb = find(e.b);
        if (ra !== rb) parent[ra] = rb;
      }
    });
    const root = find(0);
    for (let i = 1; i < islands.length; i++) if (find(i) !== root) errors.push("Network is not connected");
    return { ok: errors.length === 0, errors };
  }
  function generate(rows, cols, islandCount, difficulty, seed = Date.now()) {
    let s = seed >>> 0 || 1;
    const rng = () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
    for (let attempt = 0; attempt < 500; attempt++) {
      const islands = makeLayout(rows, cols, islandCount, rng);
      if (!islands) continue;
      islands.forEach((isl) => {
        isl.degree = 0;
      });
      const edges = computeEdges(islands);
      if (edges.length < islands.length - 1) continue;
      const sol = new Int8Array(edges.length);
      for (let i = 0; i < edges.length; i++) {
        const t = rng();
        sol[i] = t < 0.45 ? 0 : t < 0.8 ? 1 : 2;
      }
      const parent = islands.map((_, i) => i);
      const find = (x) => parent[x] === x ? x : parent[x] = find(parent[x]);
      edges.forEach((e, i) => {
        if (sol[i] > 0) {
          const ra = find(e.a), rb = find(e.b);
          if (ra !== rb) parent[ra] = rb;
        }
      });
      for (let pass = 0; pass < islands.length + 2; pass++) {
        const root = find(0);
        let merged = false;
        for (let i = 1; i < islands.length; i++) {
          if (find(i) !== root) {
            const link = edges.findIndex((e, ei) => sol[ei] < 2 && (find(e.a) === root && find(e.b) === find(i) || find(e.b) === root && find(e.a) === find(i)));
            if (link >= 0) {
              sol[link]++;
              const e = edges[link];
              parent[find(e.a)] = root;
              merged = true;
              break;
            }
          }
        }
        if (!merged) break;
      }
      {
        const p2 = islands.map((_, i) => i);
        const f2 = (x) => p2[x] === x ? x : p2[x] = f2(p2[x]);
        edges.forEach((e, i) => {
          if (sol[i] > 0) {
            const ra = f2(e.a), rb = f2(e.b);
            if (ra !== rb) p2[ra] = rb;
          }
        });
        const root = f2(0);
        if (islands.some((_, i) => f2(i) !== root)) continue;
      }
      edges.forEach((e, i) => {
        islands[e.a].degree += sol[i];
        islands[e.b].degree += sol[i];
      });
      if (islands.some((i) => i.degree < 1 || i.degree > 8)) continue;
      const puzzle = {
        id: `hashi-${rows}x${cols}-${islandCount}-${difficulty}-${seed}-${attempt}`,
        rows,
        cols,
        islands,
        edges,
        solution: sol,
        difficulty
      };
      const check = countSolutions(puzzle);
      if (check.count === 1) return puzzle;
    }
    throw new Error(`hashi gen failed: ${rows}x${cols} islands=${islandCount} seed=${seed}`);
  }
  return __toCommonJS(hashi_engine_exports);
})();
