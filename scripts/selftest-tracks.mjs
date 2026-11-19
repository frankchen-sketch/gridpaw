/**
 * Property test for tracks-engine — the gate the engine must pass before any
 * page gets built on top of it.
 *
 * The bug this file exists to catch: modelling the board as a connected CELL
 * path instead of an edge set. Parallel rails (two track squares side by side
 * that are not joined) are legal in Tracks, so cell-path uniqueness is not
 * puzzle uniqueness. Check #6 below asserts that parallel rails actually occur
 * in generated solutions — if that number ever drops to zero, the generator
 * regressed to the cell-path model.
 *
 * Per puzzle:
 *  1. the solution edge set satisfies its own clues (validate)
 *  2. sum(rowClues) == sum(colClues) == number of squares holding rail
 *  3. exactly one solution (edge-model count, not truncated)
 *  4. the counted solution is identical to the generated one
 *  5. deduce() reaches that solution without guessing
 *  6. hintLookup / edgeHint agree with the solution
 *  7. deterministic for a fixed seed
 *  8. no two adjacent 1 clues, A's and B's row/column are never a 1 clue
 * Plus negative controls: one extra rail must be rejected; an empty board must
 * not validate.
 *
 * Run: node scripts/selftest-tracks.mjs
 */
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const esbuild = await import(pathToFileURL(resolve(process.cwd() + '/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'tracks-selftest-'));
const outfile = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(process.cwd(), 'src/lib/puzzle-core/tracks-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile,
});
const eng = await import(pathToFileURL(outfile).href);

let pass = 0, fail = 0;
const fails = [];
const check = (cond, label, extra = '') => {
  if (cond) { pass++; return; }
  fail++;
  fails.push(`${label}${extra ? ' — ' + extra : ''}`);
};

// [rows, cols, difficulty, runs]
const cases = [
  [6, 6, 'medium', 12],
  [8, 8, 'medium', 8],
  [10, 10, 'medium', 5],
];
// 12x12 costs ~5s per puzzle (2.3% of random lines are clue-unique), so it is
// behind a flag: the fast gate must stay under a minute.
if (process.env.TRACKS_BIG) cases.push([12, 12, 'hard', 2]);

const genTimes = [];
let puzzles = 0;
let withParallel = 0;

for (const [rows, cols, diff, runs] of cases) {
  let made = 0;
  const t0 = Date.now();
  for (let k = 0; k < runs; k++) {
    const seed = 1000 + k * 7919 + rows * 131 + cols * 17;
    let p;
    try {
      p = eng.generate(rows, cols, diff, seed);
    } catch (e) {
      check(false, `${rows}x${cols}/${diff}: generate threw`, String(e.message).slice(0, 120));
      continue;
    }
    made++;
    puzzles++;
    const tag = `${rows}x${cols}/${diff}/${p.difficulty}#${seed}`;
    const total = rows * cols;

    check(p.rows === rows && p.cols === cols, `${tag}: geometry`, `${p.rows}x${p.cols}`);
    check(p.solution.length === eng.edgeCount(rows, cols), `${tag}: edge array length`);

    let rowSum = 0, colSum = 0;
    for (const v of p.rowClues) rowSum += v;
    for (const v of p.colClues) colSum += v;
    check(rowSum === p.pathLen && colSum === p.pathLen, `${tag}: clue sums`, `${rowSum}/${colSum}/${p.pathLen}`);
    check(p.solutionCells[p.start] === 1 && p.solutionCells[p.end] === 1, `${tag}: endpoints hold no rail`);
    check(p.start < cols, `${tag}: A not on the top row`);
    check(p.end >= (rows - 1) * cols, `${tag}: B not on the bottom row`);

    const v = eng.validate(p, p.solution);
    check(v.ok, `${tag}: solution fails its own validation`, v.errors.slice(0, 3).join(' | '));

    const derived = eng.cellsFromEdges(rows, cols, p.solution);
    let sameCells = true;
    for (let i = 0; i < total; i++) if (derived[i] !== p.solutionCells[i]) { sameCells = false; break; }
    check(sameCells, `${tag}: solutionCells drifted from solution edges`);

    const uniq = eng.countSolutions(p, 2);
    check(!uniq.truncated, `${tag}: uniqueness search truncated`);
    check(uniq.count === 1, `${tag}: not unique`, `count=${uniq.count}`);
    if (uniq.first) {
      let same = true;
      for (let i = 0; i < p.solution.length; i++) if (uniq.first[i] !== p.solution[i]) { same = false; break; }
      check(same, `${tag}: counted solution differs from the generated one`);
    }

    const d = eng.deduce(p);
    check(d.solved, `${tag}: logic solver stalled`, d.level);
    if (d.solved) {
      let same = true;
      for (let i = 0; i < p.solution.length; i++) if (d.state[i] !== p.solution[i]) { same = false; break; }
      check(same, `${tag}: deduced state differs from the solution`);
    }
    // the shipped label must be the engine's own grade, never the request
    const gradeOf = { sums: 'easy', degree: 'medium', refute: 'hard' };
    check(p.difficulty === gradeOf[d.level] || (d.level === 'stalled' && p.difficulty === 'hard'),
      `${tag}: label does not match the deduction grade`, `label=${p.difficulty}, grade=${d.level}`);

    let hintOk = true;
    for (let i = 0; i < total; i++) if (eng.hintLookup(p, i) !== p.solutionCells[i]) { hintOk = false; break; }
    check(hintOk, `${tag}: hintLookup drift`);
    let edgeOk = true;
    for (let e = 0; e < p.solution.length; e++) if (eng.edgeHint(p, e) !== p.solution[e]) { edgeOk = false; break; }
    check(edgeOk, `${tag}: edgeHint drift`);

    check(eng.cluesLookNatural(rows, cols, p.rowClues, p.colClues, p.start, p.end),
      `${tag}: clues are not natural (adjacent 1s, or A/B row or column is a 1)`);

    // parallel rails: a rail edge with a perpendicular rail edge at the same
    // shared corner that is NOT part of the same cell chain — proxy check:
    // two cells adjacent through an edge with 0 rail, both holding rail.
    let parallel = false;
    for (let r = 0; r < rows && !parallel; r++) {
      for (let c = 0; c + 1 < cols; c++) {
        const e = eng.vIdx(rows, cols, r, c + 1);
        if (p.solution[e] === 0 && p.solutionCells[r * cols + c] && p.solutionCells[r * cols + c + 1]) parallel = true;
      }
    }
    if (parallel) withParallel++;

    const again = eng.generate(rows, cols, diff, seed);
    let det = again.rowClues.join() === p.rowClues.join() && again.colClues.join() === p.colClues.join();
    for (let i = 0; i < p.solution.length && det; i++) if (again.solution[i] !== p.solution[i]) det = false;
    check(det, `${tag}: non-deterministic for the same seed`);

    // negative control: drop one rail from the line → must fail
    const broken = Uint8Array.from(p.solution);
    let cut = -1;
    for (let e = 0; e < broken.length; e++) if (broken[e] === 1) { cut = e; break; }
    if (cut >= 0) {
      broken[cut] = 0;
      check(!eng.validate(p, broken).ok, `${tag}: validate accepts a line with a missing rail`);
    }
  }
  genTimes.push([`${rows}x${cols} ${diff}`, Date.now() - t0, made]);
}

{
  const p = eng.generate(6, 6, 'easy', 424242);
  const empty = new Int8Array(eng.edgeCount(6, 6));
  const r = eng.validate(p, empty);
  check(!r.ok, 'validate accepts an empty board');
  check(r.errors.length > 0, 'empty board produces no errors');
}

console.log('\nsize / diff      total  puzzles  avg/puzzle');
for (const [label, ms, n] of genTimes) {
  console.log(`${label.padEnd(16)} ${String(ms).padStart(5)}ms ${String(n).padStart(7)}  ${(ms / Math.max(1, n)).toFixed(0).padStart(6)}ms`);
}
console.log(`\n${puzzles} puzzles, ${pass} pass, ${fail} fail`);
console.log(`solutions containing parallel rails: ${withParallel}/${puzzles} (must be > 0 — proves the edge model is live)`);
if (fail) {
  console.error('\nFAILURES:');
  for (const f of fails.slice(0, 40)) console.error('  - ' + f);
  if (fails.length > 40) console.error(`  … ${fails.length - 40} more`);
  process.exit(1);
}
if (withParallel === 0) {
  console.error('\nparallel rails never appeared — the generator is back to a cell-path model');
  process.exit(1);
}
console.log('tracks-engine: all property checks green');
