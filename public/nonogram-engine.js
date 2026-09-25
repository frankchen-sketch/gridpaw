const CELL_UNKNOWN = 0;
const CELL_FILLED = 1;
const CELL_EMPTY = 2;
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
function lineClues(line) {
  const out = [];
  let run = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === 1) run++;
    else if (run > 0) {
      out.push(run);
      run = 0;
    }
  }
  if (run > 0) out.push(run);
  return out.length ? out : [0];
}
function deriveClues(rows, cols, solution) {
  const rowClues = [];
  const colClues = [];
  for (let r = 0; r < rows; r++) rowClues.push(lineClues(solution.slice(r * cols, r * cols + cols)));
  for (let c = 0; c < cols; c++) {
    const col = [];
    for (let r = 0; r < rows; r++) col.push(solution[r * cols + c]);
    colClues.push(lineClues(col));
  }
  return { rowClues, colClues };
}
function lineOptions(clues, states) {
  const n = states.length;
  const out = [];
  const effective = clues.filter((c) => c > 0);
  if (effective.length === 0) {
    for (let i = 0; i < n; i++) if (states[i] === CELL_FILLED) return out;
    const res = new Array(n).fill(CELL_EMPTY);
    out.push(res);
    return out;
  }
  const cur = new Array(n).fill(0);
  function rec(idx, pos) {
    if (out.length >= 5e3) return;
    if (idx >= effective.length) {
      for (let i = pos; i < n; i++) if (states[i] === CELL_FILLED) return;
      const res = cur.slice();
      for (let i = pos; i < n; i++) res[i] = CELL_EMPTY;
      for (let i = 0; i < pos; i++) if (res[i] === 0) res[i] = CELL_EMPTY;
      out.push(res);
      return;
    }
    const len = effective[idx];
    let rem = 0;
    for (let k = idx; k < effective.length; k++) rem += effective[k];
    rem += effective.length - idx - 1;
    for (let p = pos; p + len <= n && p + rem <= n; p++) {
      let ok = true;
      for (let i = pos; i < p; i++) if (states[i] === CELL_FILLED) {
        ok = false;
        break;
      }
      if (!ok) continue;
      for (let i = p; i < p + len; i++) if (states[i] === CELL_EMPTY) {
        ok = false;
        break;
      }
      if (!ok) continue;
      if (p + len < n && states[p + len] === CELL_FILLED) continue;
      for (let i = p; i < p + len; i++) cur[i] = CELL_FILLED;
      rec(idx + 1, p + len + 1);
      for (let i = p; i < p + len; i++) if (states[i] === CELL_UNKNOWN) cur[i] = 0;
    }
  }
  rec(0, 0);
  return out;
}
function lineSolve(p, initial) {
  const { rows, cols, rowClues, colClues } = p;
  const states = initial ? initial.slice() : new Array(rows * cols).fill(CELL_UNKNOWN);
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < rows; r++) {
      const line = states.slice(r * cols, r * cols + cols);
      const opts = lineOptions(rowClues[r], line);
      if (opts.length === 0) return { states, complete: false, failed: true };
      for (let c = 0; c < cols; c++) {
        if (states[r * cols + c] !== CELL_UNKNOWN) continue;
        const first = opts[0][c];
        let agree = true;
        for (let k = 1; k < opts.length; k++) {
          if (opts[k][c] !== first) {
            agree = false;
            break;
          }
        }
        if (agree) {
          states[r * cols + c] = first === 1 ? CELL_FILLED : CELL_EMPTY;
          changed = true;
        }
      }
    }
    for (let c = 0; c < cols; c++) {
      const line = [];
      for (let r = 0; r < rows; r++) line.push(states[r * cols + c]);
      const opts = lineOptions(colClues[c], line);
      if (opts.length === 0) return { states, complete: false, failed: true };
      for (let r = 0; r < rows; r++) {
        if (states[r * cols + c] !== CELL_UNKNOWN) continue;
        const first = opts[0][r];
        let agree = true;
        for (let k = 1; k < opts.length; k++) {
          if (opts[k][r] !== first) {
            agree = false;
            break;
          }
        }
        if (agree) {
          states[r * cols + c] = first === 1 ? CELL_FILLED : CELL_EMPTY;
          changed = true;
        }
      }
    }
  }
  let complete = true;
  for (let i = 0; i < states.length; i++) {
    if (states[i] === CELL_UNKNOWN) {
      complete = false;
      break;
    }
  }
  return { states, complete, failed: false };
}
function solveNonogram(p, maxCount = 2, maxNodes = 2e5) {
  const { rows, cols } = p;
  const total = rows * cols;
  let nodes = 0;
  let aborted = false;
  let count = 0;
  let first = null;
  const states = new Array(total).fill(CELL_UNKNOWN);
  function toBinary() {
    const out = new Array(total).fill(0);
    for (let i = 0; i < total; i++) out[i] = states[i] === CELL_FILLED ? 1 : 0;
    return out;
  }
  function search() {
    if (count >= maxCount || aborted) return;
    nodes++;
    if (nodes > maxNodes) {
      aborted = true;
      return;
    }
    const ls = lineSolve(p, states);
    if (ls.failed) return;
    let unknownAt = [];
    for (let i = 0; i < total; i++) {
      if (ls.states[i] !== CELL_UNKNOWN) states[i] = ls.states[i];
      else if (states[i] === CELL_UNKNOWN) unknownAt.push(i);
    }
    if (unknownAt.length === 0) {
      count++;
      if (!first) first = toBinary();
      return;
    }
    const pick = unknownAt[0];
    for (const v of [CELL_FILLED, CELL_EMPTY]) {
      states[pick] = v;
      search();
      states[pick] = CELL_UNKNOWN;
      if (count >= maxCount || aborted) return;
    }
  }
  search();
  return { count: aborted ? -1 : count, solution: first };
}
function checkNonogramWin(p, grid) {
  for (let i = 0; i < p.rows * p.cols; i++) {
    const filled = grid[i] === CELL_FILLED;
    const should = p.solution[i] === 1;
    if (filled !== should) return false;
  }
  return true;
}
function cluesMatchSolution(p) {
  const { rowClues, colClues } = deriveClues(p.rows, p.cols, p.solution);
  const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  for (let r = 0; r < p.rows; r++) if (!eq(rowClues[r], p.rowClues[r])) return false;
  for (let c = 0; c < p.cols; c++) if (!eq(colClues[c], p.colClues[c])) return false;
  return true;
}
function pat(rows) {
  const out = [];
  for (const row of rows) for (const ch of row) out.push(ch === "#" ? 1 : 0);
  return out;
}
const CAT_FACE_5 = pat([
  ".#.#.",
  "#####",
  ".###.",
  ".#.#.",
  ".###."
]);
const HEART_5 = pat([
  ".#.#.",
  "#####",
  "#####",
  ".###.",
  "..#.."
]);
const CAT_FACE_7 = pat([
  "..#.#..",
  ".#####.",
  "#######",
  "#.###.#",
  "#######",
  ".#####.",
  "..#.#.."
]);
const CAT_10 = pat([
  "..#...#...",
  ".###.###..",
  "#########.",
  "#########.",
  "#########.",
  ".#######..",
  ".#######..",
  "..#####...",
  "..#...#...",
  ".#.....#.."
]);
const CAT_PATTERNS = [
  { name: "Cat Face", rows: 5, cols: 5, solution: CAT_FACE_5 },
  { name: "Heart", rows: 5, cols: 5, solution: HEART_5 },
  { name: "Cat Whiskers", rows: 7, cols: 7, solution: CAT_FACE_7 },
  { name: "Big Cat", rows: 10, cols: 10, solution: CAT_10 }
];
function fromPattern(pattern) {
  const { rowClues, colClues } = deriveClues(pattern.rows, pattern.cols, pattern.solution);
  const p = {
    rows: pattern.rows,
    cols: pattern.cols,
    rowClues,
    colClues,
    solution: pattern.solution.slice(),
    name: pattern.name
  };
  return cluesMatchSolution(p) ? p : null;
}
function generateNonogramPuzzle(opts) {
  const rng = makeRng(opts.seed);
  const density = opts.density === void 0 ? 0.5 : opts.density;
  const budget = opts.timeBudgetMs === void 0 ? 2e4 : opts.timeBudgetMs;
  const t0 = Date.now();
  const total = opts.rows * opts.cols;
  let tries = 0;
  while (Date.now() - t0 < budget) {
    tries++;
    const solution = new Array(total).fill(0);
    for (let i = 0; i < total; i++) solution[i] = rng() < density ? 1 : 0;
    let filled = 0;
    for (let i = 0; i < total; i++) filled += solution[i];
    if (filled < total * 0.35 || filled > total * 0.65) continue;
    const { rowClues, colClues } = deriveClues(opts.rows, opts.cols, solution);
    const p = { rows: opts.rows, cols: opts.cols, rowClues, colClues };
    if (opts.requireLineSolvable) {
      const ls = lineSolve(p);
      if (!ls.complete || ls.failed) continue;
    } else {
      const res = solveNonogram(p, 2);
      if (res.count !== 1) continue;
    }
    return {
      rows: opts.rows,
      cols: opts.cols,
      rowClues,
      colClues,
      solution,
      name: opts.name || (opts.seed !== void 0 ? "Daily" : "Generated"),
      daily: opts.seed !== void 0
    };
  }
  return null;
}
const NONOGRAM_DIFFICULTIES = {
  easy: { key: "easy", rows: 5, cols: 5, density: 0.5, requireLineSolvable: true, label: "Easy" },
  medium: { key: "medium", rows: 10, cols: 10, density: 0.5, requireLineSolvable: true, label: "Medium" },
  hard: { key: "hard", rows: 15, cols: 15, density: 0.55, requireLineSolvable: false, label: "Hard" }
};
const NONOGRAM_TUTORIALS = [
  {
    title: "Clues are run lengths",
    lesson: 'Each number is the length of a filled block in that line, in order. A "3" means 3 filled cells in a row. Try filling a line to match its clue.',
    pattern: CAT_PATTERNS[1]
    // Heart 5×5 — symmetric, forgiving
  },
  {
    title: "Gaps must exist",
    lesson: 'Blocks never touch: "2 2" means a 2-block, at least one empty cell, then another 2-block. Watch the spaces between numbers.',
    pattern: CAT_PATTERNS[0]
    // Cat Face 5×5
  },
  {
    title: "Edge pinning",
    lesson: "A big clue that touches an edge pins cells instantly: 5 in a 5-wide line fills the whole line. Corners and edges are free deductions.",
    pattern: CAT_PATTERNS[2]
    // Cat Whiskers 7×7
  },
  {
    title: "Cross logic",
    lesson: "Rows and rows alone stall \u2014 but a column clue can finish what a row started. Alternate between them and the picture emerges.",
    pattern: CAT_PATTERNS[3]
    // Big Cat 10×10
  }
];
function generateNonogramTutorial(def) {
  return fromPattern(def.pattern);
}
