/**
 * Smoke test for slitherlink-engine: generate × sizes, validate loop,
 * uniqueness, clue consistency.
 */
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
const esbuild = await import(pathToFileURL(resolve(process.cwd() + '/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'slither-smoke-'));
const outfile = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(process.cwd(), 'src/lib/puzzle-core/slitherlink-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile,
});
const eng = await import(pathToFileURL(outfile).href);

let pass = 0, fail = 0;
const fails = [];
const genTimes = {};
const cases = [
  [5, 5, 'easy', 6],
  [7, 7, 'medium', 5],
  [10, 10, 'hard', 3],
];
for (const [n, , diff, runs] of cases) {
  const key = `${n}x${n}-${diff}`;
  genTimes[key] = [];
  for (let k = 0; k < runs; k++) {
    const t = performance.now();
    let p;
    try {
      p = eng.generate(n, n, diff, 7700 + n * 13 + k * 29);
    } catch (e) {
      fail++; fails.push(`${key} #${k}: generate threw: ${e.message}`); continue;
    }
    genTimes[key].push((performance.now() - t).toFixed(0) + 'ms');
    // loop sanity: validate(solution) must be ok
    const v = eng.validate(p, p.solution);
    if (v.ok) pass++; else { fail++; fails.push(`${key} #${k}: solution invalid: ${v.errors.slice(0, 3).join(';')}`); }
    // clues must match solution
    let clueOK = true;
    for (let r = 0; r < p.rows && clueOK; r++) {
      for (let c = 0; c < p.cols; c++) {
        const sum = [p.solution[eng.hIdx(p.rows, p.cols, r, c)], p.solution[eng.hIdx(p.rows, p.cols, r + 1, c)],
                     p.solution[eng.vIdx(p.rows, p.cols, r, c)], p.solution[eng.vIdx(p.rows, p.cols, r, c + 1)]].reduce((a, b) => a + b, 0);
        if (sum !== p.clues[r * p.cols + c]) { clueOK = false; fails.push(`${key} #${k}: clue mismatch at (${r},${c})`); break; }
      }
    }
    if (clueOK) pass++; else fail++;
    // uniqueness
    const cs = eng.countSolutions(p);
    if (cs.count === 1) pass++; else { fail++; fails.push(`${key} #${k}: countSolutions=${cs.count} (want 1)`); }
    // hint consistency
    const hi = p.solution.findIndex(x => x > 0);
    if (hi >= 0 && eng.hintLookup(p, hi) === p.solution[hi]) pass++;
    else { fail++; fails.push(`${key} #${k}: hint mismatch`); }
  }
}
console.log('gen times:', JSON.stringify(genTimes));
console.log(`\n=== slitherlink smoke: ${pass} pass, ${fail} fail ===`);
if (fail) { console.log(fails.join('\n')); process.exit(1); }
process.exit(0);
