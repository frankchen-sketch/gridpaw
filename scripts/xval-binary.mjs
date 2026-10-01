/**
 * Cross-validation for binary-engine: engine uniqueness vs independent brute-force counter.
 * Brute force: enumerate all 2^(N*N) boards is too big; instead enumerate row-wise with
 * pruning (balance + no-three-run) written INDEPENDENTLY from the engine's solver.
 */
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
const esbuild = await import(pathToFileURL(resolve(process.cwd() + '/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'bin-xval-'));
const outfile = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(process.cwd(), 'src/lib/puzzle-core/binary-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile,
});
const eng = await import(pathToFileURL(outfile).href);

// Independent brute counter: row-by-row candidate rows (valid rows only: balance + no 3-run),
// then column checks. Written from the rule text, not from engine code.
function bruteCount(N, givens, takuzu) {
  const givensMap = new Map(givens);
  // all valid rows consistent with givens
  const rowCands = [];
  for (let r = 0; r < N; r++) {
    const cands = [];
    for (let mask = 0; mask < (1 << N); mask++) {
      // balance
      let bits = 0;
      for (let c = 0; c < N; c++) if (mask & (1 << c)) bits++;
      if (bits !== N / 2) continue;
      // no 3-run in row
      let bad = false;
      for (let c = 0; c + 2 < N; c++) {
        const a = (mask >> c) & 1, b = (mask >> (c + 1)) & 1, d = (mask >> (c + 2)) & 1;
        if (a === b && b === d) { bad = true; break; }
      }
      if (bad) continue;
      // givens match
      let ok = true;
      for (let c = 0; c < N; c++) {
        const want = givensMap.get(r * N + c);
        if (want !== undefined && ((mask >> c) & 1) !== want) { ok = false; break; }
      }
      if (ok) cands.push(mask);
    }
    rowCands.push(cands);
  }
  let count = 0;
  const chosen = [];
  const colBits = Array.from({ length: N }, () => []); // per column list of bits chosen so far
  const rec = (r) => {
    if (count > 1) return;
    if (r === N) {
      // column balance + no col 3-run + takuzu row/col uniqueness
      for (let c = 0; c < N; c++) {
        let ones = 0;
        for (let rr = 0; rr < N; rr++) ones += colBits[c][rr];
        if (ones !== N / 2) return;
        for (let rr = 0; rr + 2 < N; rr++) {
          if (colBits[c][rr] === colBits[c][rr + 1] && colBits[c][rr + 1] === colBits[c][rr + 2]) return;
        }
      }
      if (takuzu) {
        const rowKeys = chosen.map(m => m.join(','));
        if (new Set(rowKeys).size !== N) return;
        const colKeys = [];
        for (let c = 0; c < N; c++) colKeys.push(colBits[c].join(','));
        if (new Set(colKeys).size !== N) return;
      }
      count++;
      return;
    }
    for (const mask of rowCands[r]) {
      chosen.push(Array.from({ length: N }, (_, c) => (mask >> c) & 1));
      for (let c = 0; c < N; c++) colBits[c].push((mask >> c) & 1);
      // prune: partial column 3-run
      let ok = true;
      for (let c = 0; c < N; c++) {
        const L = colBits[c].length;
        if (L >= 3 && colBits[c][L - 1] === colBits[c][L - 2] && colBits[c][L - 2] === colBits[c][L - 3]) ok = false;
        if (colBits[c].filter(b => b === 1).length > N / 2) ok = false;
      }
      if (ok) rec(r + 1);
      chosen.pop();
      for (let c = 0; c < N; c++) colBits[c].pop();
    }
  };
  rec(0);
  return count;
}

let pass = 0, fail = 0;
const fails = [];
const givensReport = {};

for (const [size, diff, runs] of [[4, 'easy', 8], [4, 'medium', 8], [4, 'hard', 8], [6, 'medium', 4], [6, 'hard', 4]]) {
  const key = `${size}-${diff}`;
  givensReport[key] = [];
  for (let k = 0; k < runs; k++) {
    const t = performance.now();
    const p = eng.generate(size, diff, 700 + size * 13 + k * 5 + (diff === 'medium' ? 1 : diff === 'hard' ? 2 : 0));
    const ms = (performance.now() - t).toFixed(0);
    givensReport[key].push(`${p.givens.length}(${ms}ms)`);
    // dig-out must actually happen: a full-board puzzle is a degenerate failure
    if (p.givens.length >= size * size) { fail++; fails.push(`${key} #${k}: degenerate — no cell dug out (givens=${p.givens.length})`); }
    const brute = bruteCount(size, p.givens, p.takuzu);
    if (brute === 1) pass++;
    else { fail++; fails.push(`${key} #${k}: brute=${brute} engine claims unique, givens=${p.givens.length}`); }
    // validate solution
    const v = eng.validate(p, p.solution);
    if (!v.ok) { fail++; fails.push(`${key} #${k}: solution invalid: ${v.errors.join(';')}`); }
  }
}

console.log('givens (ms to generate):');
for (const [k, arr] of Object.entries(givensReport)) console.log(`  ${k}: ${arr.join(' ')}`);
console.log(`\n=== binary xval: ${pass} pass, ${fail} fail ===`);
if (fail) { console.log(fails.join('\n')); process.exit(1); }
process.exit(0);
