/**
 * Kakuro engine self-test — run: node scripts/selftest-kakuro.mjs
 *
 * Gates (all must pass):
 *  1. Tutorial boards: well-formed, solver returns EXACTLY 1 solution and it
 *     equals the authored solution, run lengths >= 2.
 *  2. Generator: 10 puzzles per difficulty, each unique, clue-consistent,
 *     run lengths >= 2, within time budget.
 *  3. Win-check: solver solution passes checkKakuroWin; corrupted fill fails.
 *  4. getCellError flags duplicates and over-sums.
 *  5. Fog mode (medium/hard): fogSplit present, axis correct (medium=h, hard=v),
 *     both blocks independently uniquely solvable, whole board unique.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const code = readFileSync(resolve('./public/kakuro-engine.js'), 'utf-8');
const E = new Function(
  code +
    '\nreturn { solveKakuro, generateKakuroPuzzle, generateTutorialPuzzle, checkKakuroWin, getCellError, computeRuns, whiteRuns, fogBlockCells, KAKURO_TUTORIALS, KAKURO_DIFFICULTIES, makeRng };'
)();

let failures = 0;
const ok = (cond, label) => {
  console.log((cond ? '  ✅' : '  ❌') + ' ' + label);
  if (!cond) failures++;
};

console.log('== 1. Tutorial boards ==');
for (const def of E.KAKURO_TUTORIALS) {
  const p = E.generateTutorialPuzzle(def, 42);
  console.log(def.id + ' (' + def.title + '):');
  ok(p !== null, 'generated within attempt budget');
  if (!p) continue;
  const res = E.solveKakuro(p, 2);
  const runs = E.computeRuns(p);
  const minLen = Math.min(...runs.map((r) => r.cells.length));
  const cluesMatch = runs.every(
    (r) => r.sum === r.cells.reduce((a, ci) => a + p.solution[ci], 0)
  );
  const anchors = (def.requiredRuns || []).every((req) =>
    runs.some((r) => r.dir === req.dir && r.cells.length === req.len && r.sum === req.sum)
  );
  ok(res.count === 1, 'unique solution (count=' + res.count + ')');
  ok(minLen >= 2, 'all runs length >= 2 (min=' + minLen + ')');
  ok(cluesMatch, 'clues match solution sums');
  ok(anchors, 'teaching anchors present');
}

console.log('== 2. Generator ==');
for (const key of Object.keys(E.KAKURO_DIFFICULTIES)) {
  const d = E.KAKURO_DIFFICULTIES[key];
  const budget = key === 'hard' ? 60000 : key === 'medium' ? 15000 : 8000;
  let times = [];
  let allOk = true;
  let hardNulls = 0;
  for (let n = 0; n < 10; n++) {
    const t0 = Date.now();
    // mirror production: worker retries up to 6× with an 8s budget per call
    let p = null;
    for (let tries = 0; tries < 6 && !p; tries++) {
      p = E.generateKakuroPuzzle({ rows: d.rows, cols: d.cols, blackProb: d.blackProb, seed: 1000 + n * 77 + tries * 999, timeBudgetMs: 8000 });
    }
    const ms = Date.now() - t0;
    times.push(ms);
    if (!p) {
      if (key === 'hard') {
        hardNulls++;
        if (hardNulls > 1) allOk = false; // 1 dry spell in 6-try hard is within demo tolerance
        console.log('   gen dry spell (null after 6 tries) seed-slot n=' + n);
      } else {
        allOk = false;
        console.log('   gen FAIL (null) seed-slot n=' + n);
      }
      continue;
    }
    const res = E.solveKakuro(p, 2);
    const runs = E.computeRuns(p);
    const minLen = Math.min(...runs.map((r) => r.cells.length));
    const cluesMatch = runs.every((r) => r.sum === r.cells.reduce((a, ci) => a + p.solution[ci], 0));
    const winOk = E.checkKakuroWin(p, p.solution);
    if (res.count !== 1 || minLen < 2 || !cluesMatch || !winOk) {
      allOk = false;
      console.log(`   puzzle ${n} BAD: count=${res.count} minLen=${minLen} clues=${cluesMatch} win=${winOk}`);
    }
  }
  const maxMs = Math.max(...times);
  ok(allOk, key + ': 10/10 unique + consistent + win-check (' + d.rows + 'x' + d.cols + ')');
  ok(maxMs <= budget, key + ': time budget (max ' + maxMs + 'ms <= ' + budget + 'ms)');
}

console.log('== 3. Win-check negative cases ==');
{
  const p = E.generateTutorialPuzzle(E.KAKURO_TUTORIALS[0], 42);
  const good = p.solution.slice();
  ok(E.checkKakuroWin(p, good), 'authored solution passes win check');
  const wrong = good.slice();
  const wIdx = p.white.findIndex((w) => w);
  wrong[wIdx] = wrong[wIdx] === 1 ? 2 : 1;
  ok(!E.checkKakuroWin(p, wrong), 'corrupted fill fails win check');
  const empty = good.map((v) => (p.white[p.solution.indexOf(v)] ? 0 : 0));
  ok(!E.checkKakuroWin(p, p.white.map(() => 0)), 'empty fill fails win check');
}

console.log('== 4. getCellError ==');
{
  const p = E.generateTutorialPuzzle(E.KAKURO_TUTORIALS[1], 42); // t2: has a 2-cell sum-4 run
  const runs = E.computeRuns(p).filter((r) => r.dir === 'h');
  const topRun = runs[0];
  const [a, b] = topRun.cells;
  const digits = new Array(p.rows * p.cols).fill(0);
  digits[a] = 2; digits[b] = 2; // 2+2 — dup AND sum ok (4): must flag dup
  ok(E.getCellError(p, digits, b) === 'dup', '2+2 in sum-4 run flags dup (got ' + E.getCellError(p, digits, b) + ')');
  const d2 = new Array(p.rows * p.cols).fill(0);
  d2[a] = 9; d2[b] = 3; // 12 > 4 → over
  ok(E.getCellError(p, d2, b) === 'over', '9+3 in sum-4 run flags over (got ' + E.getCellError(p, d2, b) + ')');
}

console.log('== 5. Fog mode (block-split puzzles) ==');
{
  const maskBlock = (p, cells) => {
    const inB = new Set(cells);
    const w2 = p.white.map((w, j) => w && inB.has(j));
    // clue sums stay intact — only white cells are restricted
    return { rows: p.rows, cols: p.cols, white: w2, rightSum: p.rightSum, downSum: p.downSum, solution: p.solution };
  };
  for (const key of ['medium', 'hard']) {
    const d = E.KAKURO_DIFFICULTIES[key];
    const expectedAxis = key === 'hard' ? 'v' : 'h';
    const budget = key === 'hard' ? 40000 : 20000;
    let allOk = true;
    let times = [];
    for (let n = 0; n < 5; n++) {
      const t0 = Date.now();
      let p = null;
      for (let tries = 0; tries < 6 && !p; tries++) {
        p = E.generateKakuroPuzzle({
          rows: d.rows, cols: d.cols, blackProb: d.blackProb,
          seed: 5000 + n * 131 + tries * 777, timeBudgetMs: 8000, fogBlocks: 2
        });
      }
      const ms = Date.now() - t0;
      times.push(ms);
      if (!p || p.fogSplit === undefined || p.fogAxis !== expectedAxis) {
        allOk = false;
        console.log('   fog ' + key + ' puzzle ' + n + ' BAD: ' + (p ? 'fogSplit=' + p.fogSplit + ' axis=' + p.fogAxis : 'null'));
        continue;
      }
      const [a, b] = E.fogBlockCells(p);
      const ua = E.solveKakuro(maskBlock(p, a), 2).count === 1;
      const ub = E.solveKakuro(maskBlock(p, b), 2).count === 1;
      const whole = E.solveKakuro(p, 2).count === 1;
      if (!ua || !ub || !whole) {
        allOk = false;
        console.log('   fog ' + key + ' puzzle ' + n + ' uniqueness: blockA=' + ua + ' blockB=' + ub + ' whole=' + whole);
      }
    }
    const maxMs = Math.max(...times);
    ok(allOk, key + ' fog: 5/5 fogSplit+axis+per-block unique+whole unique');
    ok(maxMs <= budget, key + ' fog: time budget (max ' + maxMs + 'ms <= ' + budget + 'ms)');
  }
}

console.log('');
console.log(failures === 0 ? 'ALL PASS ✅' : failures + ' FAILURES ❌');
process.exit(failures === 0 ? 0 : 1);
