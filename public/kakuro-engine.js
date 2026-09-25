function makeRng(seed) {
  let s = (seed === void 0 ? Date.now() : seed) >>> 0;
  if (s === 0) s = 2654435769;
  return function() {
    s |= 0;
    s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function ri(rng, n) {
  return Math.floor(rng() * n);
}
function shuffledDigits(rng) {
  const d = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = d.length - 1; i > 0; i--) {
    const j = ri(rng, i + 1);
    const t = d[i];
    d[i] = d[j];
    d[j] = t;
  }
  return d;
}
function cellIdx(p, r, c) {
  return r * p.cols + c;
}
function whiteRuns(p) {
  const runs = [];
  for (let r = 0; r < p.rows; r++) {
    let c = 1;
    while (c < p.cols) {
      if (p.white[cellIdx(p, r, c)]) {
        const clueIdx = cellIdx(p, r, c - 1);
        const cells = [];
        while (c < p.cols && p.white[cellIdx(p, r, c)]) {
          cells.push(cellIdx(p, r, c));
          c++;
        }
        runs.push({ dir: "h", sum: 0, cells, clueIdx });
      } else {
        c++;
      }
    }
  }
  for (let c = 1; c < p.cols; c++) {
    let r = 1;
    while (r < p.rows) {
      if (p.white[cellIdx(p, r, c)]) {
        const clueIdx = cellIdx(p, r - 1, c);
        const cells = [];
        while (r < p.rows && p.white[cellIdx(p, r, c)]) {
          cells.push(cellIdx(p, r, c));
          r++;
        }
        runs.push({ dir: "v", sum: 0, cells, clueIdx });
      } else {
        r++;
      }
    }
  }
  return runs;
}
function computeRuns(p) {
  const runs = whiteRuns(p);
  for (const run of runs) {
    run.sum = run.dir === "h" ? p.rightSum[run.clueIdx] : p.downSum[run.clueIdx];
  }
  return runs;
}
function runFeasible(t) {
  if (t.count < 0 || t.sum < 0) return false;
  if (t.count === 0) return t.sum === 0;
  let min = 0;
  let max = 0;
  let needMin = t.count;
  let needMax = t.count;
  for (let d = 1; d <= 9; d++) {
    if (t.mask & 1 << d) continue;
    if (needMin > 0) {
      min += d;
      needMin--;
    }
  }
  for (let d = 9; d >= 1; d--) {
    if (t.mask & 1 << d) continue;
    if (needMax > 0) {
      max += d;
      needMax--;
    }
  }
  if (needMin > 0 || needMax > 0) return false;
  return t.sum >= min && t.sum <= max;
}
function selectCell(ctx) {
  let best = -1;
  let bestCount = 10;
  for (const ci of ctx.cellOrder) {
    if (ctx.assign[ci]) continue;
    const ht = ctx.hTally[ctx.hRunOf[ci]];
    const vt = ctx.vTally[ctx.vRunOf[ci]];
    let cands = 0;
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      if (ht.mask & bit || vt.mask & bit) continue;
      ht.sum -= d;
      ht.count--;
      vt.sum -= d;
      vt.count--;
      const ok = runFeasible(ht) && runFeasible(vt);
      ht.sum += d;
      ht.count++;
      vt.sum += d;
      vt.count++;
      if (ok) {
        cands++;
        if (cands >= bestCount) break;
      }
    }
    if (cands === 0) return ci;
    if (cands < bestCount) {
      bestCount = cands;
      best = ci;
      if (cands === 1) break;
    }
  }
  return best;
}
function search(ctx, depth) {
  if (ctx.count >= ctx.maxCount || ctx.aborted) return;
  ctx.nodes++;
  if (ctx.maxNodes > 0 && ctx.nodes > ctx.maxNodes) {
    ctx.aborted = true;
    return;
  }
  const ci = selectCell(ctx);
  if (ci === -1) {
    ctx.count++;
    if (ctx.first === null) ctx.first = ctx.assign.slice();
    if (ctx.all.length < ctx.maxCount) ctx.all.push(ctx.assign.slice());
    return;
  }
  const ht = ctx.hTally[ctx.hRunOf[ci]];
  const vt = ctx.vTally[ctx.vRunOf[ci]];
  for (const d of ctx.digitOrder) {
    const bit = 1 << d;
    if (ht.mask & bit || vt.mask & bit) continue;
    ht.sum -= d;
    ht.mask |= bit;
    ht.count--;
    vt.sum -= d;
    vt.mask |= bit;
    vt.count--;
    if (runFeasible(ht) && runFeasible(vt)) {
      ctx.assign[ci] = d;
      search(ctx, depth + 1);
      ctx.assign[ci] = 0;
      if (ctx.aborted) {
        ht.sum += d;
        ht.mask &= ~bit;
        ht.count++;
        vt.sum += d;
        vt.mask &= ~bit;
        vt.count++;
        return;
      }
    }
    ht.sum += d;
    ht.mask &= ~bit;
    ht.count++;
    vt.sum += d;
    vt.mask &= ~bit;
    vt.count++;
    if (ctx.count >= ctx.maxCount || ctx.aborted) return;
  }
}
function makeCtx(h, v, p, digitOrder, maxCount) {
  const total = p.rows * p.cols;
  const hRunOf = new Array(total).fill(-1);
  const vRunOf = new Array(total).fill(-1);
  h.forEach((run, i) => run.cells.forEach((ci) => hRunOf[ci] = i));
  v.forEach((run, i) => run.cells.forEach((ci) => vRunOf[ci] = i));
  const cells = [];
  for (const run of h) cells.push(...run.cells);
  const mates = (ci) => h[hRunOf[ci]].cells.length - 1 + v[vRunOf[ci]].cells.length - 1;
  cells.sort((a, b) => mates(a) - mates(b) || a - b);
  return {
    cellOrder: cells,
    hRunOf,
    vRunOf,
    hTally: h.map((r) => ({ sum: r.sum, mask: 0, count: r.cells.length })),
    vTally: v.map((r) => ({ sum: r.sum, mask: 0, count: r.cells.length })),
    assign: new Array(total).fill(0),
    digitOrder,
    maxCount,
    count: 0,
    first: null,
    nodes: 0,
    maxNodes: 0,
    aborted: false,
    all: []
  };
}
function solveKakuro(p, maxCount = 2, maxNodes = 2e5) {
  const runs = computeRuns(p);
  if (runs.length === 0) {
    return { count: 0, solution: null };
  }
  for (const run of runs) {
    if (run.sum <= 0 || run.cells.length < 1) {
      return { count: 0, solution: null };
    }
  }
  const h = runs.filter((r) => r.dir === "h");
  const v = runs.filter((r) => r.dir === "v");
  const ctx = makeCtx(h, v, p, [1, 2, 3, 4, 5, 6, 7, 8, 9], maxCount);
  ctx.maxNodes = maxNodes;
  search(ctx, 0);
  return { count: ctx.aborted ? -1 : ctx.count, solution: ctx.first, solutions: ctx.all };
}
function solveKakuroFromState(p, digits, maxCount = 2, maxNodes = 12e4) {
  const runs = computeRuns(p);
  if (runs.length === 0) return { count: 0, solution: null };
  const h = runs.filter((r) => r.dir === "h");
  const v = runs.filter((r) => r.dir === "v");
  const ctx = makeCtx(h, v, p, [1, 2, 3, 4, 5, 6, 7, 8, 9], maxCount);
  ctx.maxNodes = maxNodes;
  for (let i = 0; i < digits.length && i < p.rows * p.cols; i++) {
    const d = digits[i];
    if (!p.white[i] || d < 1 || d > 9) continue;
    const bit = 1 << d;
    const ht = ctx.hTally[ctx.hRunOf[i]];
    const vt = ctx.vTally[ctx.vRunOf[i]];
    if (!ht || !vt) return { count: 0, solution: null };
    if (ht.mask & bit || vt.mask & bit) return { count: 0, solution: null };
    ht.sum -= d;
    ht.mask |= bit;
    ht.count--;
    vt.sum -= d;
    vt.mask |= bit;
    vt.count--;
    ctx.assign[i] = d;
  }
  for (const t of ctx.hTally) if (t.sum < 0 || !runFeasible(t)) return { count: 0, solution: null };
  for (const t of ctx.vTally) if (t.sum < 0 || !runFeasible(t)) return { count: 0, solution: null };
  search(ctx, 0);
  return { count: ctx.aborted ? -1 : ctx.count, solution: ctx.first };
}
function checkKakuroWin(p, digits) {
  for (let i = 0; i < p.rows * p.cols; i++) {
    if (p.white[i] && (digits[i] < 1 || digits[i] > 9)) return false;
  }
  for (const run of computeRuns(p)) {
    let sum = 0;
    let mask = 0;
    for (const ci of run.cells) {
      const d = digits[ci];
      if (d < 1 || d > 9) return false;
      sum += d;
      if (mask & 1 << d) return false;
      mask |= 1 << d;
    }
    if (sum !== run.sum) return false;
  }
  return true;
}
function getCellError(p, digits, i) {
  const d = digits[i];
  if (!p.white[i] || d < 1) return "";
  const runs = computeRuns(p);
  for (const run of runs) {
    if (run.cells.indexOf(i) === -1) continue;
    let sum = 0;
    let mask = 0;
    for (const ci of run.cells) {
      const cd = digits[ci];
      if (cd >= 1) {
        sum += cd;
        if (mask & 1 << cd) {
          if (ci === i || d === cd) return "dup";
        }
        mask |= 1 << cd;
      }
    }
    if (sum > run.sum) return "over";
  }
  return "";
}
function randomLayout(rows, cols, blackProb, rng) {
  const total = rows * cols;
  const white = new Array(total);
  for (let i = 0; i < total; i++) white[i] = rng() >= blackProb;
  const fixSingleRuns = () => {
    for (let iter = 0; iter < 14; iter++) {
      let changed = false;
      for (let r = 0; r < rows; r++) {
        let c = 0;
        while (c < cols) {
          if (white[r * cols + c]) {
            let end = c;
            while (end < cols && white[r * cols + end]) end++;
            const len = end - c;
            if (len === 1) {
              white[r * cols + c] = false;
              changed = true;
            }
            c = end;
          } else c++;
        }
      }
      for (let c = 0; c < cols; c++) {
        let r = 0;
        while (r < rows) {
          if (white[r * cols + c]) {
            let end = r;
            while (end < rows && white[end * cols + c]) end++;
            const len = end - r;
            if (len === 1) {
              white[r * cols + c] = false;
              changed = true;
            }
            r = end;
          } else r++;
        }
      }
      if (!changed) return true;
    }
    return false;
  };
  if (!fixSingleRuns()) return null;
  const comp = new Array(total).fill(-1);
  let nComp = 0;
  const sizes = [];
  for (let i = 0; i < total; i++) {
    if (!white[i] || comp[i] !== -1) continue;
    let size = 0;
    const stack = [i];
    comp[i] = nComp;
    while (stack.length) {
      const cur = stack.pop();
      size++;
      const r = Math.floor(cur / cols);
      const c = cur % cols;
      const nb = [
        r > 0 ? cur - cols : -1,
        r < rows - 1 ? cur + cols : -1,
        c > 0 ? cur - 1 : -1,
        c < cols - 1 ? cur + 1 : -1
      ];
      for (const n of nb) {
        if (n >= 0 && white[n] && comp[n] === -1) {
          comp[n] = nComp;
          stack.push(n);
        }
      }
    }
    sizes.push(size);
    nComp++;
  }
  if (nComp === 0) return null;
  if (nComp > 1) {
    let big = 0;
    for (let i = 1; i < nComp; i++) if (sizes[i] > sizes[big]) big = i;
    for (let i = 0; i < total; i++) if (white[i] && comp[i] !== big) white[i] = false;
    if (!fixSingleRuns()) return null;
  }
  let nWhite = 0;
  for (let i = 0; i < total; i++) if (white[i]) nWhite++;
  if (nWhite < Math.max(6, total * 0.4)) return null;
  return { white };
}
function digitCombos(len, sum) {
  const out = [];
  const rec = (start, left, sumLeft, acc) => {
    if (left === 0) {
      if (sumLeft === 0) out.push(acc.slice());
      return;
    }
    for (let d = start; d <= 9; d++) {
      if (d > sumLeft) break;
      acc.push(d);
      rec(d + 1, left - 1, sumLeft - d, acc);
      acc.pop();
    }
  };
  rec(1, len, sum, []);
  return out;
}
function randomFill(layout, rows, cols, rng, preset) {
  const R = rows + 1;
  const C = cols + 1;
  const w2 = new Array(R * C).fill(false);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (layout.white[r * cols + c]) w2[(r + 1) * C + (c + 1)] = true;
    }
  }
  const runs = whiteRuns({ rows: R, cols: C, white: w2 });
  const runsOfInterior = new Array(rows * cols);
  const cells = [];
  runs.forEach(
    (run, i) => run.cells.forEach((gi) => {
      const r = Math.floor(gi / C) - 1;
      const c = gi % C - 1;
      const ii = r * cols + c;
      if (!runsOfInterior[ii]) {
        runsOfInterior[ii] = [];
        cells.push(ii);
      }
      runsOfInterior[ii].push(i);
    })
  );
  const sorted = cells.slice().sort((a, b) => runsOfInterior[a].length - runsOfInterior[b].length || a - b);
  const masks = new Array(runs.length).fill(0);
  const fill = new Array(rows * cols).fill(0);
  if (preset) {
    for (const [iiStr, d] of Object.entries(preset)) {
      const ii = Number(iiStr);
      fill[ii] = d;
      for (const ri2 of runsOfInterior[ii]) masks[ri2] |= 1 << d;
    }
  }
  const sortedFree = preset ? sorted.filter((ii) => !preset[ii]) : sorted;
  const dfs = (pos) => {
    if (pos === sortedFree.length) return true;
    const ii = sortedFree[pos];
    const runIds = runsOfInterior[ii];
    const digitOrder = shuffledDigits(rng);
    for (const d of digitOrder) {
      const bit = 1 << d;
      let ok = true;
      for (const ri2 of runIds) if (masks[ri2] & bit) {
        ok = false;
        break;
      }
      if (!ok) continue;
      for (const ri2 of runIds) masks[ri2] |= bit;
      fill[ii] = d;
      if (dfs(pos + 1)) return true;
      fill[ii] = 0;
      for (const ri2 of runIds) masks[ri2] &= ~bit;
    }
    return false;
  };
  return dfs(0) ? fill : null;
}
function buildPuzzle(interiorWhite, fill, rows, cols, difficulty) {
  const R = rows + 1;
  const C = cols + 1;
  const white = new Array(R * C).fill(false);
  const rightSum = new Array(R * C).fill(0);
  const downSum = new Array(R * C).fill(0);
  const solution = new Array(R * C).fill(0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (interiorWhite[r * cols + c]) {
        white[(r + 1) * C + (c + 1)] = true;
        if (fill) solution[(r + 1) * C + (c + 1)] = fill[r * cols + c];
      }
    }
  }
  const p = { rows: R, cols: C, white, rightSum, downSum, solution, difficulty };
  for (const run of whiteRuns({ rows: R, cols: C, white })) {
    const sum = run.cells.reduce((acc, ci) => acc + solution[ci], 0);
    if (run.dir === "h") rightSum[run.clueIdx] = sum;
    else downSum[run.clueIdx] = sum;
  }
  return p;
}
function repairToUnique(interiorWhite, fill, rows, cols, rng, difficulty, maxIters, protectedInterior) {
  const cur = fill.slice();
  const iters = maxIters || Math.max(60, rows * cols * 3);
  const prot = new Set(protectedInterior || []);
  const R = rows + 1;
  const C = cols + 1;
  const w2 = new Array(R * C).fill(false);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (interiorWhite[r * cols + c]) w2[(r + 1) * C + (c + 1)] = true;
    }
  }
  const runs = whiteRuns({ rows: R, cols: C, white: w2 });
  const runsOf = new Array(rows * cols);
  runs.forEach(
    (run, i) => run.cells.forEach((gi) => {
      const r = Math.floor(gi / C) - 1;
      const c = gi % C - 1;
      const ii = r * cols + c;
      if (!runsOf[ii]) runsOf[ii] = [];
      runsOf[ii].push(i);
    })
  );
  const distinctOk = (ii, jj) => {
    const ids = [.../* @__PURE__ */ new Set([...runsOf[ii] || [], ...runsOf[jj] || []])];
    for (const ri2 of ids) {
      let mask = 0;
      for (const gi of runs[ri2].cells) {
        const r = Math.floor(gi / C) - 1;
        const c = gi % C - 1;
        const d = cur[r * cols + c];
        if (mask & 1 << d) return false;
        mask |= 1 << d;
      }
    }
    return true;
  };
  for (let iter = 0; iter < iters; iter++) {
    const p = buildPuzzle(interiorWhite, cur, rows, cols, difficulty);
    const res = solveKakuro(p, 2);
    if (res.count === 1) return p;
    const s2 = res.count === 2 && res.solutions && res.solutions.length >= 2 ? res.solutions[1] : null;
    if (s2) {
      const diff = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ii = r * cols + c;
          if (interiorWhite[ii] && cur[ii] !== s2[(r + 1) * C + (c + 1)]) diff.push(ii);
        }
      }
      if (diff.length === 0) return null;
      const freeDiff = diff.filter((d) => !prot.has(d));
      if (!freeDiff.length) return null;
      const breaking = [];
      for (const ii of freeDiff) {
        const ids = runsOf[ii] || [];
        for (const rid of ids) {
          const run = runs[rid];
          for (const gi of run.cells) {
            const r = Math.floor(gi / C) - 1;
            const c = gi % C - 1;
            const jj = r * cols + c;
            if (jj === ii || prot.has(jj)) continue;
            const tmp = cur[ii];
            cur[ii] = cur[jj];
            cur[jj] = tmp;
            if (distinctOk(ii, jj)) {
              const affected = [.../* @__PURE__ */ new Set([...runsOf[ii] || [], ...runsOf[jj] || []])];
              let breaks = false;
              for (const ar of affected) {
                let sSum = 0;
                let cSum = 0;
                for (const gi2 of runs[ar].cells) {
                  sSum += s2[gi2];
                  const rr = Math.floor(gi2 / C) - 1;
                  const cc = gi2 % C - 1;
                  cSum += cur[rr * cols + cc];
                }
                if (sSum !== cSum) {
                  breaks = true;
                  break;
                }
              }
              if (breaks) breaking.push({ ii, jj });
            }
            cur[jj] = cur[ii];
            cur[ii] = tmp;
          }
        }
      }
      if (breaking.length) {
        const pick = breaking[ri(rng, breaking.length)];
        const tmp = cur[pick.ii];
        cur[pick.ii] = cur[pick.jj];
        cur[pick.jj] = tmp;
        continue;
      }
    }
    {
      const allFree = [];
      for (let ii = 0; ii < rows * cols; ii++) {
        if (interiorWhite[ii] && !prot.has(ii) && (runsOf[ii] || []).length) allFree.push(ii);
      }
      if (!allFree.length) return null;
      for (let attempt = 0; attempt < 6; attempt++) {
        const ii = allFree[ri(rng, allFree.length)];
        const ids = runsOf[ii] || [];
        const run = runs[ids[ri(rng, ids.length)]];
        const mates = [];
        for (const gi of run.cells) {
          const r = Math.floor(gi / C) - 1;
          const c = gi % C - 1;
          const jj2 = r * cols + c;
          if (jj2 !== ii && !prot.has(jj2)) mates.push(jj2);
        }
        if (!mates.length) continue;
        const jj = mates[ri(rng, mates.length)];
        const tmp = cur[ii];
        cur[ii] = cur[jj];
        cur[jj] = tmp;
        if (distinctOk(ii, jj)) break;
        cur[jj] = cur[ii];
        cur[ii] = tmp;
      }
    }
  }
  return null;
}
function fogBlockCells(p) {
  if (p.fogSplit === void 0) return [[], []];
  const vertical = p.fogAxis !== "h";
  const a = [];
  const b = [];
  for (let i = 0; i < p.white.length; i++) {
    if (!p.white[i]) continue;
    const line = vertical ? i % p.cols : Math.floor(i / p.cols);
    (line < p.fogSplit ? a : b).push(i);
  }
  return [a, b];
}
function generateKakuroPuzzle(opts) {
  const blackProb = opts.blackProb === void 0 ? 0.2 : opts.blackProb;
  const rng = makeRng(opts.seed);
  const maxLayout = opts.maxLayoutAttempts || 40;
  const maxFill = opts.maxFillAttempts || 20;
  const requireUnique = opts.requireUnique !== false;
  const started = Date.now();
  const timeBudget = opts.timeBudgetMs || 3e3;
  const fogMode = opts.fogBlocks === 2;
  for (let la = 0; la < maxLayout; la++) {
    if (Date.now() - started > timeBudget) return null;
    if (fogMode) {
      const vertical = opts.cols >= 7;
      const base = (opts.seed === void 0 ? Date.now() : opts.seed) + la * 7919;
      const blockProb = Math.max(opts.blackProb, 0.26);
      const pW = vertical ? generateKakuroPuzzle({ rows: opts.rows, cols: Math.floor(opts.cols / 2), blackProb: blockProb, seed: base, timeBudgetMs: timeBudget }) : generateKakuroPuzzle({ rows: Math.floor(opts.rows / 2), cols: opts.cols, blackProb: blockProb, seed: base, timeBudgetMs: timeBudget });
      if (!pW) continue;
      const pE = vertical ? generateKakuroPuzzle({ rows: opts.rows, cols: opts.cols - Math.floor(opts.cols / 2) - 1, blackProb: blockProb, seed: base + 104729, timeBudgetMs: timeBudget }) : generateKakuroPuzzle({ rows: opts.rows - Math.floor(opts.rows / 2) - 1, cols: opts.cols, blackProb: blockProb, seed: base + 104729, timeBudgetMs: timeBudget });
      if (!pE) continue;
      return vertical ? mergeFogHalves(pW, pE, opts.rows, opts.cols, Math.floor(opts.cols / 2), "v", "seeded-fog") : mergeFogHalves(pW, pE, opts.rows, opts.cols, Math.floor(opts.rows / 2), "h", "seeded-fog");
    }
    const layout = randomLayout(opts.rows, opts.cols, blackProb, rng);
    if (!layout) continue;
    for (let fa = 0; fa < maxFill; fa++) {
      if (Date.now() - started > timeBudget) return null;
      const fill = randomFill(layout, opts.rows, opts.cols, rng);
      if (!fill) continue;
      const p = repairToUnique(layout.white, fill, opts.rows, opts.cols, rng, opts.seed === void 0 ? void 0 : "seeded");
      if (p) return p;
    }
  }
  return null;
}
function mergeFogHalves(pW, pE, rows, cols, splitInt, axis, difficulty) {
  const R = rows + 1;
  const C = cols + 1;
  const white = new Array(R * C).fill(false);
  const solution = new Array(R * C).fill(0);
  const rightSum = new Array(R * C).fill(0);
  const downSum = new Array(R * C).fill(0);
  const copyBlock = (src, dr, dc) => {
    for (let r = 0; r < src.rows; r++) {
      for (let c = 0; c < src.cols; c++) {
        const gi = r * src.cols + c;
        if (!src.white[gi] && !src.rightSum[gi] && !src.downSum[gi]) continue;
        const ti = (r + dr) * C + (c + dc);
        white[ti] = src.white[gi];
        solution[ti] = src.solution[gi];
        rightSum[ti] = src.rightSum[gi];
        downSum[ti] = src.downSum[gi];
      }
    }
  };
  if (axis === "v") {
    copyBlock(pW, 0, 0);
    copyBlock(pE, 0, splitInt + 1);
  } else {
    copyBlock(pW, 0, 0);
    copyBlock(pE, splitInt + 1, 0);
  }
  return {
    rows: R,
    cols: C,
    white,
    rightSum,
    downSum,
    solution,
    difficulty,
    fogSplit: splitInt + 1,
    // grid line (col for 'v', row for 'h')
    fogAxis: axis
  };
}
const KAKURO_TUTORIALS = [
  {
    id: "t1",
    title: "Clues are sums",
    lesson: "Each clue is the SUM of the white run beside or below it. The top row must sum to 4 \u2014 two cells. Try digits and watch the clues: cross clues pin every digit down.",
    pattern: ["..#", "..#"],
    requiredRuns: [{ dir: "h", len: 2, sum: 4 }]
  },
  {
    id: "t2",
    title: "No repeats",
    lesson: "Digits never repeat inside a run. The top-left run sums to 4 with two cells \u2014 2+2 would add up, but repeats are banned: it must be 1+3.",
    pattern: ["..#", "...", "#.."],
    requiredRuns: [{ dir: "h", len: 2, sum: 4 }]
  },
  {
    id: "t3",
    title: "Extreme sums",
    lesson: "Extreme clues pin combos down. A 2-cell run of 17 can ONLY be 8+9 \u2014 no other pair of distinct digits gets that high. Watch for 3, 4, 16, 17: they fix digits immediately.",
    pattern: ["..#", "...", "..."],
    requiredRuns: [{ dir: "h", len: 2, sum: 17 }]
  },
  {
    id: "t4",
    title: "Put it together",
    lesson: "Bigger board, same three rules: runs sum to their clue, digits 1-9, no repeats. The row summing to 10 can only be 1+2+3+4 \u2014 start there.",
    pattern: ["..##", "..##", "....", "#..."],
    requiredRuns: [{ dir: "h", len: 4, sum: 10 }]
  }
];
function generateTutorialPuzzle(def, seed) {
  const rows = def.pattern.length;
  const cols = def.pattern[0].length;
  const interiorWhite = new Array(rows * cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) interiorWhite[r * cols + c] = def.pattern[r][c] !== "#";
  }
  const rng = makeRng(seed);
  const attempts = def.maxAttempts || 400;
  const started = Date.now();
  const timeBudget = 1500;
  const R = rows + 1;
  const C = cols + 1;
  const w2 = new Array(R * C).fill(false);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (interiorWhite[r * cols + c]) w2[(r + 1) * C + (c + 1)] = true;
    }
  }
  const runs = whiteRuns({ rows: R, cols: C, white: w2 });
  const protectedInterior = [];
  const anchorSpecs = [];
  for (const req of def.requiredRuns || []) {
    const run = runs.find((r) => r.dir === req.dir && r.cells.length === req.len);
    if (!run) return null;
    const cells = [];
    for (const gi of run.cells) {
      const r = Math.floor(gi / C) - 1;
      const c = gi % C - 1;
      const ii = r * cols + c;
      protectedInterior.push(ii);
      cells.push(ii);
    }
    anchorSpecs.push({ req, cells });
  }
  for (let i = 0; i < attempts; i++) {
    if (Date.now() - started > timeBudget) return null;
    const preset = {};
    let presetOk = true;
    for (const spec of anchorSpecs) {
      const combos = digitCombos(spec.req.len, spec.req.sum);
      if (!combos.length) {
        presetOk = false;
        break;
      }
      const combo = combos[ri(rng, combos.length)].slice();
      for (let k = combo.length - 1; k > 0; k--) {
        const j = ri(rng, k + 1);
        const t = combo[k];
        combo[k] = combo[j];
        combo[j] = t;
      }
      spec.cells.forEach((ii, idx) => {
        preset[ii] = combo[idx];
      });
    }
    if (!presetOk) continue;
    const fill = randomFill({ white: interiorWhite }, rows, cols, rng, preset);
    if (!fill) continue;
    const p = repairToUnique(interiorWhite, fill, rows, cols, rng, "tutorial-" + def.id, void 0, protectedInterior);
    if (!p) continue;
    return p;
  }
  return null;
}
const KAKURO_DIFFICULTIES = {
  easy: { key: "easy", label: "Easy", rows: 5, cols: 5, blackProb: 0.14 },
  medium: { key: "medium", label: "Medium", rows: 6, cols: 6, blackProb: 0.26 },
  hard: { key: "hard", label: "Hard", rows: 7, cols: 7, blackProb: 0.34 }
};
