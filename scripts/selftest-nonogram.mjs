/**
 * Nonogram engine self-test — run: node scripts/selftest-nonogram.mjs
 *
 * Gates:
 *  1. Tutorials: authored patterns derive consistent clues, unique, pure-logic solvable
 *  2. Generator: 10 puzzles per difficulty, unique, clue-consistent, within budget
 *  3. Win check: solution passes; corrupted fill fails
 *  4. lineOptions sanity: forced lines produce exact arrangements
 *  5. Daily determinism: same seed → same solution
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const code = readFileSync(resolve('./public/nonogram-engine.js'), 'utf-8');
const E = new Function(
  code +
    '\nreturn { lineSolve, solveNonogram, lineOptions, generateNonogramPuzzle, generateNonogramTutorial, deriveClues, cluesMatchSolution, checkNonogramWin, NONOGRAM_TUTORIALS, NONOGRAM_DIFFICULTIES, CAT_PATTERNS };'
)();

let failures = 0;
const ok = (cond, label) => {
  console.log((cond ? '  ✅' : '  ❌') + ' ' + label);
  if (!cond) failures++;
};

// ── 1. Tutorials ──
console.log('== 1. Tutorials (authored cats) ==');
for (const t of E.NONOGRAM_TUTORIALS) {
  const p = E.generateNonogramTutorial(t);
  ok(!!p, t.title + ': pattern → valid puzzle');
  if (!p) continue;
  const r = E.solveNonogram(p, 2);
  const ls = E.lineSolve(p);
  ok(r.count === 1, t.title + ': unique (' + p.rows + '×' + p.cols + ')');
  ok(ls.complete && !ls.failed, t.title + ': pure line-logic solvable');
}

// ── 2. Generator per difficulty ──
console.log('== 2. Generator ==');
for (const key of Object.keys(E.NONOGRAM_DIFFICULTIES)) {
  const d = E.NONOGRAM_DIFFICULTIES[key];
  const times = [];
  let allOk = true;
  for (let n = 0; n < 10; n++) {
    const t0 = Date.now();
    const p = E.generateNonogramPuzzle({
      rows: d.rows, cols: d.cols, density: d.density,
      requireLineSolvable: d.requireLineSolvable,
      seed: 9000 + n * 257, timeBudgetMs: 30000,
    });
    const ms = Date.now() - t0;
    times.push(ms);
    if (!p) { allOk = false; console.log('   ' + key + ' #' + n + ': null'); continue; }
    const r = E.solveNonogram(p, 2);
    if (r.count !== 1) { allOk = false; console.log('   ' + key + ' #' + n + ': count=' + r.count); continue; }
    if (!E.cluesMatchSolution(p)) { allOk = false; console.log('   ' + key + ' #' + n + ': clue mismatch'); }
    if (!E.checkNonogramWin(p, p.solution.map((v) => (v ? 1 : 0)))) { allOk = false; console.log('   ' + key + ' #' + n + ': win-check failed on own solution'); }
  }
  ok(allOk, key + ' (' + d.rows + '×' + d.cols + (d.requireLineSolvable ? ', pure-logic' : '') + '): 10/10 unique + consistent');
  ok(Math.max(...times) <= (key === 'hard' ? 20000 : 5000), key + ' timing: max ' + Math.max(...times) + 'ms');
}

// ── 3. Win check rejects corrupted fill ──
console.log('== 3. Win check ==');
{
  const p = E.generateNonogramTutorial(E.NONOGRAM_TUTORIALS[0]);
  const good = p.solution.map((v) => (v ? 1 : 0));
  ok(E.checkNonogramWin(p, good), 'solution passes win-check');
  const bad = good.slice();
  bad[bad.findIndex((v) => v === 1)] = 0;
  ok(!E.checkNonogramWin(p, bad), 'corrupted fill fails win-check');
}

// ── 4. lineOptions sanity ──
console.log('== 4. lineOptions ==');
{
  const full = E.lineOptions([5], new Array(5).fill(0));
  ok(full.length === 1 && full[0].every((v) => v === 1), '[5] on 5-line → single all-filled option');
  const empty = E.lineOptions([0], new Array(5).fill(0));
  ok(empty.length === 1 && empty[0].every((v) => v === 2), '[0] → single all-empty option');
  const split = E.lineOptions([2, 2], new Array(7).fill(0));
  ok(split.length === 6, '[2,2] on 7-line → 6 arrangements (got ' + split.length + ')');
  const blocked = E.lineOptions([3], [2, 0, 0, 0, 0]);
  ok(blocked.length === 2 && blocked.every((o) => o[0] === 2), 'known-empty first cell: [3] has 2 options, none touching cell 0 (got ' + blocked.length + ')');
}

// ── 5. Daily determinism ──
console.log('== 5. Daily determinism ==');
{
  const a = E.generateNonogramPuzzle({ rows: 10, cols: 10, seed: 20260926, timeBudgetMs: 30000 });
  const b = E.generateNonogramPuzzle({ rows: 10, cols: 10, seed: 20260926, timeBudgetMs: 30000 });
  ok(!!a && !!b && a.solution.every((v, i) => v === b.solution[i]), 'same seed → identical solution');
  const c = E.generateNonogramPuzzle({ rows: 10, cols: 10, seed: 20260927, timeBudgetMs: 30000 });
  ok(!!c && !a.solution.every((v, i) => v === c.solution[i]), 'different seed → different solution');
}

console.log(failures === 0 ? '\nALL PASS ✅' : '\n' + failures + ' FAILURES ❌');
process.exit(failures === 0 ? 0 : 1);
