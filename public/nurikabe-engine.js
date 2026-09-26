const CELL_UNKNOWN = 0;
const CELL_SEA = 1;
const CELL_ISLAND = 2;
function makeRng(seed) {
  if (seed === void 0) return Math.random;
  let s = seed >>> 0;
  return function() {
    s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const NEI = (rows, cols, idx) => {
  const r = Math.floor(idx / cols), c = idx % cols;
  const out = [];
  if (r > 0) out.push(idx - cols);
  if (r < rows - 1) out.push(idx + cols);
  if (c > 0) out.push(idx - 1);
  if (c < cols - 1) out.push(idx + 1);
  return out;
};
function islandOf(p, clues, solution, clueIdx) {
  const seen = /* @__PURE__ */ new Set([clueIdx]);
  const stack = [clueIdx];
  while (stack.length) {
    const cur = stack.pop();
    for (const n of NEI(p.rows, p.cols, cur)) {
      if (!seen.has(n) && solution[n] === CELL_ISLAND) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return seen;
}
function cluesMatchSolution(p) {
  const { rows, cols, clues, solution } = p;
  for (const c of clues) if (solution[c.idx] !== CELL_ISLAND) return false;
  const total = rows * cols;
  const seen = new Array(total).fill(false);
  let comps = 0;
  for (let i = 0; i < total; i++) {
    if (solution[i] !== CELL_ISLAND || seen[i]) continue;
    comps++;
    let cells = 0, clueCount = 0;
    const stack2 = [i];
    seen[i] = true;
    while (stack2.length) {
      const cur = stack2.pop();
      cells++;
      if (clues.some((c) => c.idx === cur)) clueCount++;
      for (const n of NEI(rows, cols, cur)) {
        if (!seen[n] && solution[n] === CELL_ISLAND) {
          seen[n] = true;
          stack2.push(n);
        }
      }
    }
    if (clueCount !== 1) return false;
    const clue = clues.find((c) => c.idx >= 0 && islandContains(p, clues, solution, c.idx, i));
    if (!clue || clue.size !== cells) return false;
  }
  if (comps !== clues.length) return false;
  let seaStart = -1;
  for (let i = 0; i < total; i++) if (solution[i] === CELL_SEA) {
    seaStart = i;
    break;
  }
  if (seaStart < 0) return false;
  const seenSea = new Array(total).fill(false);
  let seaCount = 0;
  const stack = [seaStart];
  seenSea[seaStart] = true;
  while (stack.length) {
    const cur = stack.pop();
    seaCount++;
    for (const n of NEI(rows, cols, cur)) {
      if (!seenSea[n] && solution[n] === CELL_SEA) {
        seenSea[n] = true;
        stack.push(n);
      }
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
function islandContains(p, clues, solution, clueIdx, cell) {
  return islandOf(p, clues, solution, clueIdx).has(cell);
}
function propagateNurikabe(p, states) {
  const { rows, cols, clues } = p;
  const total = rows * cols;
  const clueAt = /* @__PURE__ */ new Map();
  for (const c of clues) clueAt.set(c.idx, c.size);
  let changed = true;
  while (changed) {
    changed = false;
    for (const clue of clues) {
      const comp = /* @__PURE__ */ new Set([clue.idx]);
      const cstack = [clue.idx];
      while (cstack.length) {
        const cur = cstack.pop();
        for (const n of NEI(rows, cols, cur)) {
          if (comp.has(n) || states[n] !== CELL_ISLAND) continue;
          if (clueAt.has(n)) continue;
          comp.add(n);
          cstack.push(n);
        }
      }
      const islandCount = comp.size;
      if (islandCount > clue.size) return { complete: false, failed: true };
      const need = clue.size - islandCount;
      const region = /* @__PURE__ */ new Set();
      const rstack = [...comp];
      while (rstack.length) {
        const cur = rstack.pop();
        for (const n of NEI(rows, cols, cur)) {
          if (region.has(n) || comp.has(n)) continue;
          if (states[n] !== CELL_UNKNOWN) continue;
          if (clueAt.has(n)) continue;
          region.add(n);
          rstack.push(n);
        }
      }
      const unknownInRegion = [...region].filter((i) => states[i] === CELL_UNKNOWN);
      if (region.size < need) return { complete: false, failed: true };
      if (need === 0) {
        for (const c of comp) {
          for (const n of NEI(rows, cols, c)) {
            if (states[n] === CELL_UNKNOWN && !comp.has(n)) {
              states[n] = CELL_SEA;
              changed = true;
            }
          }
        }
      } else if (unknownInRegion.length === need) {
        for (const i of unknownInRegion) {
          states[i] = CELL_ISLAND;
          changed = true;
        }
      }
    }
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
    {
      const best = new Int16Array(total).fill(9999);
      const inComp = /* @__PURE__ */ new Set();
      for (const clue of clues) {
        const comp = /* @__PURE__ */ new Set([clue.idx]);
        const cstack = [clue.idx];
        while (cstack.length) {
          const cur = cstack.pop();
          for (const n of NEI(rows, cols, cur)) {
            if (comp.has(n) || states[n] !== CELL_ISLAND) continue;
            if (clueAt.has(n)) continue;
            comp.add(n);
            cstack.push(n);
          }
        }
        for (const c of comp) inComp.add(c);
        const need = clue.size - comp.size;
        if (need <= 0) continue;
        const dist = /* @__PURE__ */ new Map();
        const q = [...comp].map((c) => [c, 0]);
        for (const [c] of q) dist.set(c, 0);
        while (q.length) {
          const [cur, d] = q.shift();
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
          states[i] = CELL_SEA;
          changed = true;
        }
      }
    }
    for (const clue of clues) {
      for (const n of NEI(rows, cols, clue.idx)) {
        if (states[n] === CELL_ISLAND && clueAt.has(n)) return { complete: false, failed: true };
      }
    }
  }
  let complete = true;
  for (let i = 0; i < total; i++) if (states[i] === CELL_UNKNOWN) {
    complete = false;
    break;
  }
  return { complete, failed: false };
}
function solveNurikabe(p, maxCount = 2, maxNodes = 2e5) {
  const { rows, cols } = p;
  const total = rows * cols;
  let nodes = 0;
  let aborted = false;
  let count = 0;
  const solutions = [];
  function finalValid(st) {
    const full = { rows, cols, clues: p.clues };
    return cluesMatchSolution({ ...full, clues: p.clues, solution: st.map((v) => v === CELL_ISLAND ? CELL_ISLAND : CELL_SEA) });
  }
  function search(st) {
    if (count >= maxCount || aborted) return;
    nodes++;
    if (nodes > maxNodes) {
      aborted = true;
      return;
    }
    const st2 = st.slice();
    const res = propagateNurikabe(p, st2);
    if (res.failed) return;
    let pick = -1;
    for (let i = 0; i < total; i++) {
      if (st2[i] !== CELL_UNKNOWN) continue;
      if (NEI(rows, cols, i).some((n) => p.clues.some((c) => c.idx === n))) {
        pick = i;
        break;
      }
    }
    if (pick < 0) {
      for (let i = 0; i < total; i++) if (st2[i] === CELL_UNKNOWN) {
        pick = i;
        break;
      }
    }
    if (pick < 0) {
      if (finalValid(st2)) {
        count++;
        solutions.push(st2.map((v) => v === CELL_ISLAND ? CELL_ISLAND : CELL_SEA));
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
function repairToUnique(p, rng, deadline) {
  let cur = { ...p, clues: p.clues.map((c) => ({ ...c })), solution: p.solution.slice() };
  let rounds = 0;
  while (Date.now() < deadline) {
    rounds++;
    if (rounds > 400) return null;
    const res = solveNurikabe(cur, 2, 8e6);
    if (res.count === 1) return cur;
    if (res.count === 0) return null;
    const s0 = cur.solution;
    if (res.count !== 2 || res.solutions.length < 2) return null;
    const s1 = res.solutions[1];
    const diff = [];
    for (let i = 0; i < s0.length; i++) if (s0[i] !== s1[i]) diff.push(i);
    for (let i = diff.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [diff[i], diff[j]] = [diff[j], diff[i]];
    }
    let edited = false;
    for (const c of diff) {
      if (s0[c] === CELL_SEA && s1[c] === CELL_ISLAND) {
        const touching = /* @__PURE__ */ new Set();
        for (const n of NEI(cur.rows, cur.cols, c)) {
          if (s0[n] !== CELL_ISLAND) continue;
          const clueIdx = cur.clues.find((cl) => islandOf(cur, cur.clues, s0, cl.idx).has(n))?.idx;
          if (clueIdx !== void 0) touching.add(clueIdx);
        }
        if (touching.size === 1) {
          const clueIdx = [...touching][0];
          const clue = cur.clues.find((cl) => cl.idx === clueIdx);
          const next = {
            ...cur,
            clues: cur.clues.map((cl) => cl.idx === clueIdx ? { idx: clueIdx, size: cl.size + 1 } : cl),
            solution: s0.map((v, i) => i === c ? CELL_ISLAND : v)
          };
          if (cluesMatchSolution(next)) {
            cur = next;
            edited = true;
            break;
          }
        }
      } else if (s0[c] === CELL_ISLAND && s1[c] === CELL_SEA) {
        const clue = cur.clues.find((cl) => islandOf(cur, cur.clues, s0, cl.idx).has(c));
        if (!clue) continue;
        if (clue.size <= 2) continue;
        const next = {
          ...cur,
          clues: cur.clues.map((cl) => cl.idx === clue.idx ? { idx: clue.idx, size: cl.size - 1 } : cl),
          solution: s0.map((v, i) => i === c ? CELL_SEA : v)
        };
        if (cluesMatchSolution(next)) {
          cur = next;
          edited = true;
          break;
        }
      }
    }
    if (!edited) return null;
  }
  return null;
}
function checkNurikabeWin(p, grid) {
  for (let i = 0; i < p.solution.length; i++) {
    const markedIsland = grid[i] === CELL_ISLAND;
    if (markedIsland !== (p.solution[i] === CELL_ISLAND)) return false;
  }
  return true;
}
function growIsland(rows, cols, rng, owner, clue, size, startIdx) {
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
    const touchingOther = NEI(rows, cols, pick).some((n) => owner[n] === 2);
    if (touchingOther) continue;
    owner[pick] = 1;
    cells.push(pick);
  }
  return cells.length === size;
}
function buildSeaSnake(rows, cols, rng, targetSea) {
  const total = rows * cols;
  const sea = new Array(total).fill(false);
  const makes2x2 = (idx) => {
    const r = Math.floor(idx / cols), c = idx % cols;
    for (const [r0, c0] of [[r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c]]) {
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
  const inPath = /* @__PURE__ */ new Set([cur]);
  let idle = 0;
  while (count < targetSea && path.length > 0) {
    const nbs = NEI(rows, cols, cur).filter((n) => !sea[n] && !inPath.has(n) && !makes2x2(n));
    if (nbs.length === 0) {
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
  const islands = [];
  const seen = new Array(total).fill(false);
  for (let i = 0; i < total; i++) {
    if (sea[i] || seen[i]) continue;
    const cells = [];
    const stack = [i];
    seen[i] = true;
    while (stack.length) {
      const c = stack.pop();
      cells.push(c);
      for (const n of NEI(rows, cols, c)) {
        if (!seen[n] && !sea[n]) {
          seen[n] = true;
          stack.push(n);
        }
      }
    }
    if (cells.length > 9) return null;
    islands.push(cells);
  }
  if (islands.length < 1) return null;
  return { sea, islands };
}
function generateNurikabePuzzle(opts) {
  const rng = makeRng(opts.seed);
  const budget = opts.timeBudgetMs ?? 2e4;
  const t0 = Date.now();
  const { rows, cols } = opts;
  const total = rows * cols;
  while (Date.now() - t0 < budget) {
    const built = buildSeaSnake(rows, cols, rng, Math.round(total * (0.66 + rng() * 0.12)));
    if (!built) continue;
    const solution = built.sea.map((s) => s ? CELL_SEA : CELL_ISLAND);
    const clues = built.islands.map((cells) => ({ idx: cells[0], size: cells.length }));
    if (!cluesMatchSolution({ rows, cols, clues, solution, name: "x" })) continue;
    const sliceEnd = Math.min(Date.now() + 5e3, t0 + budget);
    const final = repairToUnique({ rows, cols, clues, solution, name: "x" }, rng, sliceEnd);
    if (!final) continue;
    return {
      rows,
      cols,
      clues: final.clues,
      solution: final.solution,
      name: opts.name || (opts.seed !== void 0 ? "Daily" : "Generated"),
      daily: opts.seed !== void 0
    };
  }
  return null;
}
const NURIKABE_DIFFICULTIES = {
  easy: { key: "easy", rows: 5, cols: 5, requirePropSolvable: false, label: "Easy" },
  medium: { key: "medium", rows: 7, cols: 7, requirePropSolvable: false, label: "Medium" },
  hard: { key: "hard", rows: 9, cols: 9, requirePropSolvable: false, label: "Hard" }
};
const NURIKABE_TUTORIALS = [
  {
    title: "Islands and sea",
    lesson: "A number is an island of exactly that many cells. On this 2\xD72, tap every other cell once \u2014 it becomes sea \u2248 and the board is solved. That is the whole game: islands grow to their number, everything else drowns.",
    seed: 20260926,
    rows: 2,
    cols: 2
  },
  {
    title: "The sea stays connected",
    lesson: "The sea must be one single mass \u2014 an island may never cut it in two. On this 3\xD73, grow the island to its number, then flood the rest and check: can every \u2248 reach every other \u2248?",
    seed: 20260927,
    rows: 3,
    cols: 3
  },
  {
    title: "No 2\xD72 sea",
    lesson: "The sea may never fill a 2\xD72 square. Three sea cells around one corner force the fourth cell to be island \u2014 on this 4\xD74, watch for corners where three \u2248 already meet.",
    seed: 20260928,
    rows: 4,
    cols: 4
  },
  {
    title: "Corner pinning",
    lesson: "A clue in a corner has very few ways to grow. Pin the corners first, watch which sea cells would get sealed off, and this 5\xD75 falls into place.",
    seed: 20260929,
    rows: 5,
    cols: 5
  }
];
function generateNurikabeTutorial(def) {
  return generateNurikabePuzzle({
    rows: def.rows,
    cols: def.cols,
    seed: def.seed,
    timeBudgetMs: 3e4,
    name: "Tutorial"
  });
}
