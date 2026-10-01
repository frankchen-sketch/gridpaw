/**
 * Smoke test for hashi-engine: generate × sizes, validate solutions,
 * uniqueness, layout sanity (no crossing edges possible by construction,
 * islands separated, degrees 1..8, edge counts 0..2).
 */
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
const esbuild = await import(pathToFileURL(resolve(process.cwd() + '/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'hashi-smoke-'));
const outfile = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(process.cwd(), 'src/lib/puzzle-core/hashi-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile,
});
const eng = await import(pathToFileURL(outfile).href);

let pass = 0, fail = 0;
const fails = [];
const genTimes = {};
const cases = [
  // [rows, cols, islands, diff, runs] — easy 8x8x10, medium 10x10x14, hard 12x12x18
  [8, 8, 10, 'easy', 6],
  [10, 10, 14, 'medium', 5],
  [12, 12, 18, 'hard', 3],
];
for (const [rows, cols, isl, diff, runs] of cases) {
  const key = `${rows}x${cols}x${isl}-${diff}`;
  genTimes[key] = [];
  for (let k = 0; k < runs; k++) {
    const t = performance.now();
    let p;
    try {
      p = eng.generate(rows, cols, isl, diff, 6600 + rows * 17 + k * 23);
    } catch (e) {
      fail++; fails.push(`${key} #${k}: generate threw: ${e.message}`); continue;
    }
    genTimes[key].push((performance.now() - t).toFixed(0) + 'ms');
    // sanity: degrees in range, islands in grid, edge counts valid
    let ok = true;
    if (p.islands.some(i => i.degree < 1 || i.degree > 8)) ok = false;
    if (p.islands.some(i => i.r < 0 || i.r >= rows || i.c < 0 || i.c >= cols)) ok = false;
    if ([...p.solution].some(v => v < 0 || v > 2)) ok = false;
    if (p.islands.length !== isl) ok = false;
    if (ok) pass++; else { fail++; fails.push(`${key} #${k}: layout/values out of range`); }
    // validate solution
    const v = eng.validate(p, p.solution);
    if (v.ok) pass++; else { fail++; fails.push(`${key} #${k}: solution invalid: ${v.errors.slice(0, 3).join(';')}`); }
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
console.log(`\n=== hashi smoke: ${pass} pass, ${fail} fail ===`);
if (fail) { console.log(fails.join('\n')); process.exit(1); }
process.exit(0);
