var TracksEngine = (() => {
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

  // src/lib/puzzle-core/tracks-engine.ts
  var tracks_engine_exports = {};
  __export(tracks_engine_exports, {
    UNSET: () => UNSET,
    cellEdges: () => cellEdges,
    cellsFromEdges: () => cellsFromEdges,
    ci: () => ci,
    cloneState: () => cloneState,
    cluesLookNatural: () => cluesLookNatural,
    countSolutions: () => countSolutions,
    deduce: () => deduce,
    deriveClues: () => deriveClues,
    edgeCount: () => edgeCount,
    edgeHint: () => edgeHint,
    generate: () => generate,
    hIdx: () => hIdx,
    hintLookup: () => hintLookup,
    initState: () => initState,
    makePath: () => makePath,
    pathToEdges: () => pathToEdges,
    propagate: () => propagate,
    sizeDifficulty: () => sizeDifficulty,
    vIdx: () => vIdx,
    validate: () => validate
  });
  var UNSET = -1;
  function sizeDifficulty(rows, cols) {
    const n = Math.max(rows, cols);
    if (n <= 6) return "easy";
    if (n <= 8) return "medium";
    return "hard";
  }
  function ci(cols, r, c) {
    return r * cols + c;
  }
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
      // 0 top
      hIdx(rows, cols, r + 1, c),
      // 1 bottom
      vIdx(rows, cols, r, c),
      // 2 left
      vIdx(rows, cols, r, c + 1)
      // 3 right
    ];
  }
  function cellLinks(rows, cols, r, c) {
    const out = [];
    if (r > 0) out.push({ cell: ci(cols, r - 1, c), edge: hIdx(rows, cols, r, c) });
    if (r < rows - 1) out.push({ cell: ci(cols, r + 1, c), edge: hIdx(rows, cols, r + 1, c) });
    if (c > 0) out.push({ cell: ci(cols, r, c - 1), edge: vIdx(rows, cols, r, c) });
    if (c < cols - 1) out.push({ cell: ci(cols, r, c + 1), edge: vIdx(rows, cols, r, c + 1) });
    return out;
  }
  function shuffled(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = rng() * (i + 1) | 0;
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }
  function makePath(rows, cols, start, end, rng, minLen, budget = 12e4) {
    const total = rows * cols;
    const visited = new Uint8Array(total);
    const path = [start];
    visited[start] = 1;
    let nodes = 0;
    let aborted = false;
    let found = null;
    const neigh = (v) => {
      const r = v / cols | 0, c = v % cols;
      const out = [];
      if (r > 0) out.push(v - cols);
      if (r < rows - 1) out.push(v + cols);
      if (c > 0) out.push(v - 1);
      if (c < cols - 1) out.push(v + 1);
      return out;
    };
    const onward = (v) => neigh(v).reduce((n, u) => n + (visited[u] ? 0 : 1), 0);
    const step = (v) => {
      if (v === end) {
        if (path.length >= minLen) {
          found = path.slice();
          return true;
        }
        return false;
      }
      const cand = [];
      for (const u of neigh(v)) {
        if (visited[u]) continue;
        if (u === end && path.length + 1 < minLen) continue;
        cand.push(u);
      }
      shuffled(cand, rng);
      cand.sort((a, b) => onward(a) - onward(b));
      for (const u of cand) {
        if (++nodes > budget) {
          aborted = true;
          return false;
        }
        visited[u] = 1;
        path.push(u);
        if (step(u)) return true;
        path.pop();
        visited[u] = 0;
        if (aborted) return false;
      }
      return false;
    };
    step(start);
    return aborted ? null : found;
  }
  function pathToEdges(rows, cols, path) {
    const edges = new Uint8Array(edgeCount(rows, cols));
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1];
      const ar = a / cols | 0, ac = a % cols;
      const br = b / cols | 0, bc = b % cols;
      if (ar === br) edges[vIdx(rows, cols, ar, Math.max(ac, bc))] = 1;
      else edges[hIdx(rows, cols, Math.max(ar, br), ac)] = 1;
    }
    return edges;
  }
  function cellsFromEdges(rows, cols, edges) {
    const cells = new Uint8Array(rows * cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        for (const e of cellEdges(rows, cols, r, c)) if (edges[e] === 1) {
          cells[ci(cols, r, c)] = 1;
          break;
        }
      }
    }
    return cells;
  }
  function deriveClues(rows, cols, cells) {
    const rowClues = new Int8Array(rows);
    const colClues = new Int8Array(cols);
    let pathLen = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (cells[ci(cols, r, c)]) {
          rowClues[r]++;
          colClues[c]++;
          pathLen++;
        }
      }
    }
    return { rowClues, colClues, pathLen };
  }
  function cluesLookNatural(rows, cols, rowClues, colClues, start, end) {
    for (let i = 0; i + 1 < rows; i++) if (rowClues[i] === 1 && rowClues[i + 1] === 1) return false;
    for (let i = 0; i + 1 < cols; i++) if (colClues[i] === 1 && colClues[i + 1] === 1) return false;
    if (rowClues[0] === 1 || rowClues[rows - 1] === 1) return false;
    if (colClues[start % cols] === 1 || colClues[end % cols] === 1) return false;
    return true;
  }
  function initState(p) {
    const e = new Int8Array(edgeCount(p.rows, p.cols)).fill(UNSET);
    for (let c = 0; c < p.cols; c++) {
      e[hIdx(p.rows, p.cols, 0, c)] = 0;
      e[hIdx(p.rows, p.cols, p.rows, c)] = 0;
    }
    for (let r = 0; r < p.rows; r++) {
      e[vIdx(p.rows, p.cols, r, 0)] = 0;
      e[vIdx(p.rows, p.cols, r, p.cols)] = 0;
    }
    return { e };
  }
  function cloneState(st) {
    return { e: Int8Array.from(st.e) };
  }
  function cellView(p, st, r, c) {
    let on = 0, off = 0;
    const unk = [];
    for (const e of cellEdges(p.rows, p.cols, r, c)) {
      if (st.e[e] === 1) on++;
      else if (st.e[e] === 0) off++;
      else unk.push(e);
    }
    return { on, unk, off };
  }
  function setEdge(p, st, e, v) {
    const cur = st.e[e];
    if (cur === v) return true;
    if (cur !== UNSET) return false;
    st.e[e] = v;
    return true;
  }
  function legalMasks(p, st, r, c) {
    const edges = cellEdges(p.rows, p.cols, r, c);
    const idx = ci(p.cols, r, c);
    const isEnd = idx === p.start || idx === p.end;
    const out = [];
    for (let m = 0; m < 16; m++) {
      const bits = (m & 1) + (m >> 1 & 1) + (m >> 2 & 1) + (m >> 3 & 1);
      if (isEnd ? bits !== 1 : bits !== 0 && bits !== 2) continue;
      let ok = true;
      for (let b = 0; b < 4; b++) {
        const want = m >> b & 1;
        const cur = st.e[edges[b]];
        if (cur !== UNSET && cur !== want) {
          ok = false;
          break;
        }
      }
      if (ok) out.push(m);
    }
    return out;
  }
  function applyMask(p, st, r, c, m) {
    const edges = cellEdges(p.rows, p.cols, r, c);
    for (let b = 0; b < 4; b++) {
      if (!setEdge(p, st, edges[b], m >> b & 1)) return false;
    }
    return true;
  }
  function connectivityPass(p, st, put) {
    const { rows, cols, start, end } = p;
    const total = rows * cols;
    const comp = new Int16Array(total).fill(-1);
    const comps = [];
    for (let i = 0; i < total; i++) {
      if (comp[i] >= 0) continue;
      const r = i / cols | 0, c = i % cols;
      const view = cellView(p, st, r, c);
      if (view.on === 0) continue;
      const id = comps.length;
      const cells = [];
      const stack = [i];
      comp[i] = id;
      let hasA = false, hasB = false;
      while (stack.length) {
        const v = stack.pop();
        cells.push(v);
        if (v === start) hasA = true;
        if (v === end) hasB = true;
        const vr = v / cols | 0, vc = v % cols;
        for (const link of cellLinks(rows, cols, vr, vc)) {
          if (st.e[link.edge] !== 1 || comp[link.cell] >= 0) continue;
          comp[link.cell] = id;
          stack.push(link.cell);
        }
      }
      comps.push({ cells, hasA, hasB });
    }
    let changed = false;
    for (const compInfo of comps) {
      if (compInfo.hasA && compInfo.hasB) {
        if (comps.length > 1) return { ok: false, changed };
        for (let i = 0; i < total; i++) {
          if (comp[i] >= 0) continue;
          const r = i / cols | 0, c = i % cols;
          for (const e of cellEdges(rows, cols, r, c)) {
            if (st.e[e] !== UNSET) continue;
            if (!put(e, 0, "connect", "The A\u2013B line is already complete, so this square stays empty")) return { ok: false, changed };
            changed = true;
          }
        }
        continue;
      }
      let grow = false;
      for (const v of compInfo.cells) {
        const vr = v / cols | 0, vc = v % cols;
        for (const link of cellLinks(rows, cols, vr, vc)) {
          if (st.e[link.edge] !== UNSET) continue;
          const ur = link.cell / cols | 0, uc = link.cell % cols;
          const uv = cellView(p, st, ur, uc);
          const need = link.cell === start || link.cell === end ? 1 : 2;
          if (uv.on >= need) continue;
          grow = true;
          break;
        }
        if (grow) break;
      }
      if (!grow) return { ok: false, changed };
    }
    return { ok: true, changed };
  }
  function propagate(p, st, steps = null) {
    const { rows, cols, rowClues, colClues } = p;
    const total = rows * cols;
    const used = [];
    const mark = (l) => {
      if (!used.includes(l)) used.push(l);
    };
    const put = (e, v, rule, reason) => {
      if (st.e[e] !== UNSET) return true;
      if (!setEdge(p, st, e, v)) return false;
      if (steps) steps.push({ edge: e, value: v, rule, reason });
      return true;
    };
    const mustFill = new Uint8Array(total);
    for (; ; ) {
      let changed = false;
      mustFill.fill(0);
      for (let r = 0; r < rows; r++) {
        const clue = rowClues[r];
        let filled = 0;
        const maybeCells = [];
        for (let c = 0; c < cols; c++) {
          const { on, unk } = cellView(p, st, r, c);
          if (on > 0) filled++;
          else if (unk.length > 0) maybeCells.push(c);
        }
        if (filled > clue || filled + maybeCells.length < clue) return { ok: false, used };
        if (maybeCells.length === 0) continue;
        if (filled === clue) {
          mark("sums");
          for (const c of maybeCells) {
            for (const e of cellView(p, st, r, c).unk) {
              if (!put(e, 0, "row-full", `Row ${r + 1} needs ${clue} square(s) and already has ${filled}`)) return { ok: false, used };
            }
          }
          changed = true;
        } else if (filled + maybeCells.length === clue) {
          mark("sums");
          for (const c of maybeCells) mustFill[ci(cols, r, c)] = 1;
        }
      }
      for (let c = 0; c < cols; c++) {
        const clue = colClues[c];
        let filled = 0;
        const maybeCells = [];
        for (let r = 0; r < rows; r++) {
          const { on, unk } = cellView(p, st, r, c);
          if (on > 0) filled++;
          else if (unk.length > 0) maybeCells.push(r);
        }
        if (filled > clue || filled + maybeCells.length < clue) return { ok: false, used };
        if (maybeCells.length === 0) continue;
        if (filled === clue) {
          mark("sums");
          for (const r of maybeCells) {
            for (const e of cellView(p, st, r, c).unk) {
              if (!put(e, 0, "col-full", `Column ${c + 1} needs ${clue} square(s) and already has ${filled}`)) return { ok: false, used };
            }
          }
          changed = true;
        } else if (filled + maybeCells.length === clue) {
          mark("sums");
          for (const r of maybeCells) mustFill[ci(cols, r, c)] = 1;
        }
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = ci(cols, r, c);
          const need = idx === p.start || idx === p.end ? 1 : 2;
          const forced = mustFill[idx] === 1;
          const { on, unk } = cellView(p, st, r, c);
          const where = `r${r + 1}c${c + 1}`;
          if (on > need) return { ok: false, used };
          if (unk.length === 0) {
            if (on !== 0 && on !== need) return { ok: false, used };
            continue;
          }
          if (on === need) {
            mark("degree");
            for (const e of unk) if (!put(e, 0, "cell-full", `${where} already has ${need} rail joint(s)`)) return { ok: false, used };
            changed = true;
          } else if ((on > 0 || forced || need === 1) && on + unk.length === need) {
            mark("degree");
            for (const e of unk) if (!put(e, 1, "cell-needed", `${where} still needs ${need - on} rail joint(s) and has only ${unk.length} undecided side(s)`)) return { ok: false, used };
            changed = true;
          } else if (on + unk.length < need) {
            if (on > 0) return { ok: false, used };
            if (forced) return { ok: false, used };
            mark("degree");
            for (const e of unk) if (!put(e, 0, "cell-empty", `${where} cannot reach ${need} joints, so it holds no rail`)) return { ok: false, used };
            changed = true;
          }
        }
      }
      const conn = connectivityPass(p, st, put);
      if (!conn.ok) return { ok: false, used };
      if (conn.changed) {
        mark("connect");
        changed = true;
      }
      if (!changed) break;
    }
    return { ok: true, used };
  }
  function validate(p, edges) {
    const { rows, cols, rowClues, colClues, start, end } = p;
    const total = rows * cols;
    const errors = [];
    const on = new Int16Array(total);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let n = 0;
        for (const e of cellEdges(rows, cols, r, c)) n += edges[e] === 1 ? 1 : 0;
        on[ci(cols, r, c)] = n;
        const need = ci(cols, r, c) === start || ci(cols, r, c) === end;
        if (need) {
          if (n !== 1) errors.push(`r${r + 1}c${c + 1} is an endpoint and must have exactly 1 rail joint (has ${n})`);
        } else if (n !== 0 && n !== 2) {
          errors.push(`r${r + 1}c${c + 1} has ${n} rail joint(s): a square holds either no rail or exactly 2`);
        }
      }
    }
    for (let r = 0; r < rows; r++) {
      let n = 0;
      for (let c = 0; c < cols; c++) if (on[ci(cols, r, c)] > 0) n++;
      if (n !== rowClues[r]) errors.push(`Row ${r + 1}: ${n} square(s) with rail, clue says ${rowClues[r]}`);
    }
    for (let c = 0; c < cols; c++) {
      let n = 0;
      for (let r = 0; r < rows; r++) if (on[ci(cols, r, c)] > 0) n++;
      if (n !== colClues[c]) errors.push(`Column ${c + 1}: ${n} square(s) with rail, clue says ${colClues[c]}`);
    }
    if (!errors.length) {
      const seen = new Uint8Array(total);
      const stack = [start];
      seen[start] = 1;
      let reach = 0;
      while (stack.length) {
        const v = stack.pop();
        reach++;
        const vr = v / cols | 0, vc = v % cols;
        for (const link of cellLinks(rows, cols, vr, vc)) {
          if (edges[link.edge] !== 1 || seen[link.cell]) continue;
          seen[link.cell] = 1;
          stack.push(link.cell);
        }
      }
      let track = 0;
      for (let i = 0; i < total; i++) if (on[i] > 0) track++;
      if (reach !== track) errors.push(`The rails split into pieces: ${track - reach} square(s) are not connected to A`);
      if (!seen[end]) errors.push("B is not connected to A");
    }
    return { ok: errors.length === 0, errors };
  }
  function hintLookup(p, cellIdx) {
    return p.solutionCells[cellIdx];
  }
  function edgeHint(p, edge) {
    return p.solution[edge];
  }
  function countSolutions(p, limit = 2, budget = 6e4) {
    const root = initState(p);
    if (!propagate(p, root)) return { count: 0, first: null, truncated: false };
    let count = 0;
    let first = null;
    let nodes = 0;
    let truncated = false;
    const dfs = (st) => {
      if (++nodes > budget) {
        truncated = true;
        return true;
      }
      if (!propagate(p, st)) return false;
      let pickR = -1, pickC = -1, pickMasks = null;
      for (let r = 0; r < p.rows; r++) {
        for (let c = 0; c < p.cols; c++) {
          const { unk } = cellView(p, st, r, c);
          if (unk.length === 0) continue;
          const masks = legalMasks(p, st, r, c);
          if (masks.length === 0) return false;
          if (!pickMasks || masks.length < pickMasks.length) {
            pickR = r;
            pickC = c;
            pickMasks = masks;
          }
          if (pickMasks.length === 1) break;
        }
        if (pickMasks && pickMasks.length === 1) break;
      }
      if (!pickMasks) {
        if (validate(p, st.e).ok) {
          count++;
          if (!first) first = Uint8Array.from(st.e);
        }
        return count >= limit;
      }
      for (const m of pickMasks) {
        const nxt = cloneState(st);
        if (!applyMask(p, nxt, pickR, pickC, m)) continue;
        if (dfs(nxt)) return true;
      }
      return false;
    };
    dfs(root);
    return { count, first, truncated };
  }
  function deduce(p, maxRounds = 40, refuteTries = 160) {
    const st = initState(p);
    const steps = [];
    const families = [];
    const mark = (l) => {
      if (!families.includes(l)) families.push(l);
    };
    const settle = () => {
      const r = propagate(p, st, steps);
      for (const f of r.used) mark(f);
      return r.ok;
    };
    let ok = settle();
    let rounds = 0;
    while (ok && rounds < maxRounds) {
      let unknown2 = 0;
      for (let i = 0; i < st.e.length; i++) if (st.e[i] === UNSET) unknown2++;
      if (unknown2 === 0) break;
      let refuted = false;
      let tries = 0;
      for (let e = 0; e < st.e.length && !refuted && tries < refuteTries; e++) {
        if (st.e[e] !== UNSET) continue;
        tries++;
        for (const guess of [1, 0]) {
          const trial = cloneState(st);
          setEdge(p, trial, e, guess);
          if (propagate(p, trial).ok) continue;
          setEdge(p, st, e, guess === 1 ? 0 : 1);
          steps.push({
            edge: e,
            value: guess === 1 ? 0 : 1,
            rule: "refuted",
            reason: `Assuming ${guess === 1 ? "rail" : "no rail"} on this side leads to a contradiction`
          });
          mark("refute");
          refuted = true;
          break;
        }
      }
      if (!refuted) break;
      rounds++;
      ok = settle();
    }
    let unknown = 0;
    for (let i = 0; i < st.e.length; i++) if (st.e[i] === UNSET) unknown++;
    const solved = ok && unknown === 0;
    const level = !solved ? "stalled" : families.includes("refute") ? "refute" : families.includes("degree") || families.includes("connect") ? "degree" : "sums";
    return { steps, solved, level, state: st.e };
  }
  function generate(rows, cols, _difficulty = "medium", seed = Date.now(), naturalClues = true) {
    let s = seed >>> 0 || 1;
    const rng = () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
    const totalCells = rows * cols;
    const minLen = Math.max(4, Math.round(totalCells * 0.32));
    const label = sizeDifficulty(rows, cols);
    for (let attempt = 0; attempt < 220; attempt++) {
      const start = ci(cols, 0, rng() * cols | 0);
      const end = ci(cols, rows - 1, rng() * cols | 0);
      const path = makePath(rows, cols, start, end, rng, minLen);
      if (!path) continue;
      const edges = pathToEdges(rows, cols, path);
      const cells = cellsFromEdges(rows, cols, edges);
      const { rowClues, colClues, pathLen } = deriveClues(rows, cols, cells);
      if (naturalClues && !cluesLookNatural(rows, cols, rowClues, colClues, start, end)) continue;
      const candidate = {
        id: `tracks-${rows}x${cols}-${seed}-${attempt}`,
        rows,
        cols,
        rowClues,
        colClues,
        start,
        end,
        solution: edges,
        solutionCells: cells,
        pathLen,
        difficulty: label,
        grade: "stalled"
      };
      const uniq = countSolutions(candidate, 2);
      if (uniq.truncated || uniq.count !== 1) continue;
      const d = deduce(candidate);
      if (!d.solved) continue;
      return { ...candidate, grade: d.level };
    }
    for (let attempt = 0; attempt < 120; attempt++) {
      const start = ci(cols, 0, rng() * cols | 0);
      const end = ci(cols, rows - 1, rng() * cols | 0);
      const path = makePath(rows, cols, start, end, rng, minLen);
      if (!path) continue;
      const edges = pathToEdges(rows, cols, path);
      const cells = cellsFromEdges(rows, cols, edges);
      const { rowClues, colClues, pathLen } = deriveClues(rows, cols, cells);
      const candidate = {
        id: `tracks-${rows}x${cols}-${seed}-relaxed-${attempt}`,
        rows,
        cols,
        rowClues,
        colClues,
        start,
        end,
        solution: edges,
        solutionCells: cells,
        pathLen,
        difficulty: label,
        grade: "stalled"
      };
      const uniq = countSolutions(candidate, 2);
      if (uniq.truncated || uniq.count !== 1) continue;
      const d = deduce(candidate);
      if (!d.solved) continue;
      return { ...candidate, grade: d.level };
    }
    throw new Error(`tracks: no board for ${rows}x${cols} at seed ${seed} \u2014 retry with another seed`);
  }
  return __toCommonJS(tracks_engine_exports);
})();
