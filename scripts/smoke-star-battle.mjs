/**
 * Smoke test for star-battle-engine: generate × sizes, validate solutions,
 * uniqueness via countSolutions (limit 2 = 1), region layout sanity
 * (full coverage, connectivity, exactly K stars each).
 */
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
const esbuild = await import(pathToFileURL(resolve(process.cwd() + '/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'sb-smoke-'));
const outfile = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(process.cwd(), 'src/lib/puzzle-core/star-battle-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile,
});
const eng = await import(pathToFileURL(outfile).href);

let pass = 0, fail = 0;
const fails = [];
const T0 = performance.now();
const cases = [
  [8, 2, 'easy', 6], [8, 2, 'medium', 6], [10, 2, 'medium', 4], [14, 3, 'hard', 2],
];
// NOTE: solvability math (exhaustive count of no-touch layouts):
// 7x7x2=0, 8x8x2=2, 10x10x2=4+, 10x10x3=0, 12x12x3=2(too tight), 14x14x3=50+, 14x14x4=0, 16x16x4=2.
// Product sizes: easy 8x8x2, medium 10x10x2, hard 14x14x3.
const genTimes = {};
for (const [size, K, diff, runs] of cases) {
  const key = `${size}x${size}x${K}-${diff}`;
  genTimes[key] = [];
  for (let k = 0; k < runs; k++) {
    const t = performance.now();
    let p;
    try {
      p = eng.generate(size, K, diff, 4100 + size * 71 + k * 11 + (diff === 'medium' ? 1 : diff === 'hard' ? 2 : 0));
    } catch (e) {
      fail++; fails.push(`${key} #${k}: generate threw: ${e.message}`); continue;
    }
    genTimes[key].push((performance.now() - t).toFixed(0) + 'ms');
    // region sanity: full coverage + connectivity (region SIZE is arbitrary —
    // the rule is exactly K STARS per region, checked by validate() below)
    const { size: N, regionOf, regionCount, solution, starsPerUnit: KK } = p;
    let regionsOk = true;
    const counts = new Int32Array(regionCount);
    for (let i = 0; i < N * N; i++) {
      const g = regionOf[i];
      if (g < 0 || g >= regionCount) regionsOk = false;
      else counts[g]++;
    }
    for (let g = 0; g < regionCount; g++) if (counts[g] < 1) regionsOk = false; // no empty region
    // region connectivity
    for (let g = 0; g < regionCount && regionsOk; g++) {
      const seen = new Set();
      const start = Array.from({ length: N * N }, (_, i) => i).find(i => regionOf[i] === g);
      const stack = [start]; seen.add(start);
      while (stack.length) {
        const i = stack.pop();
        const r = (i / N) | 0, c = i % N;
        for (const nb of [i - N, i + N, i - 1, i + 1]) {
          if (nb >= 0 && nb < N * N && regionOf[nb] === g && !seen.has(nb) &&
            !(c === 0 && nb === i - 1) && !(c === N - 1 && nb === i + 1)) { seen.add(nb); stack.push(nb); }
        }
      }
      if (seen.size !== counts[g]) regionsOk = false;
    }
    if (regionsOk) pass++; else { fail++; fails.push(`${key} #${k}: region layout invalid`); }
    // solution valid
    const v = eng.validate(p, solution);
    if (v.ok) pass++; else { fail++; fails.push(`${key} #${k}: solution invalid: ${v.errors.join(';')}`); }
    // uniqueness
    const cs = eng.countSolutions(p);
    if (cs.count === 1) pass++; else { fail++; fails.push(`${key} #${k}: countSolutions=${cs.count} (want 1)`); }
    // hint consistency
    const starCells = Array.from({ length: N * N }, (_, i) => i).filter(i => solution[i] === 1);
    if (starCells.every(i => eng.hintLookup(p, i) === 1) && starCells.length === N * KK) pass++;
    else { fail++; fails.push(`${key} #${k}: hintLookup mismatch`); }
  }
}
console.log('gen times:', JSON.stringify(genTimes));
console.log(`\n=== star-battle smoke: ${pass} pass, ${fail} fail (${(performance.now() - T0).toFixed(0)}ms) ===`);
if (fail) { console.log(fails.join('\n')); process.exit(1); }
process.exit(0);
