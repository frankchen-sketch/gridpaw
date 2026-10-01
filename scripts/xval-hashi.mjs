/**
 * Cross-validation for hashi countSolutions: independent brute-force
 * (no feasibility pruning, plain array state) must agree on solution counts.
 */
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
const esbuild = await import(pathToFileURL(resolve(process.cwd() + '/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'hashi-xval-'));
const outfile = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(process.cwd(), 'src/lib/puzzle-core/hashi-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile,
});
const eng = await import(pathToFileURL(outfile).href);

// ── independent counter: naive DFS, only rem<0 dead-end, no other pruning ──
function bruteCount(puzzle, limit) {
  const { islands, edges } = puzzle;
  const deg = islands.map(i => i.degree);
  const n = edges.length;
  const counts = new Array(n).fill(0);
  const adj = islands.map(() => []);
  edges.forEach((e, i) => { adj[e.a].push(i); adj[e.b].push(i); });
  let found = 0;
  function connOK() {
    // full connectivity of chosen bridges
    const par = islands.map((_, i) => i);
    const f = x => (par[x] === x ? x : (par[x] = f(par[x])));
    for (let i = 0; i < n; i++) {
      if (counts[i] > 0) { const ra = f(edges[i].a), rb = f(edges[i].b); if (ra !== rb) par[ra] = rb; }
    }
    const r = f(0);
    for (let i = 1; i < islands.length; i++) if (f(i) !== r) return false;
    return true;
  }
  function rec(ei) {
    if (found >= limit) return;
    if (ei === n) {
      for (let v = 0; v < islands.length; v++) {
        let d = 0;
        for (const ei2 of adj[v]) d += counts[ei2];
        if (d !== deg[v]) return;
      }
      if (!connOK()) return;
      found++;
      return;
    }
    for (const v of [0, 1, 2]) {
      counts[ei] = v;
      rec(ei + 1);
      if (found >= limit) { counts[ei] = 0; return; }
    }
    counts[ei] = 0;
  }
  rec(0);
  return found;
}

let pass = 0, fail = 0; const fails = [];
const cases = [
  [8, 8, 10, 'easy', 5],
  [10, 10, 14, 'medium', 4],
  [12, 12, 18, 'hard', 2],
];
for (const [rows, cols, isl, diff, runs] of cases) {
  for (let k = 0; k < runs; k++) {
    const p = eng.generate(rows, cols, isl, diff, 9100 + rows * 31 + k * 7);
    // count with engine (limit 4) vs brute (limit 4)
    const a = eng.countSolutions(p, 4).count;
    const b = bruteCount(p, 4);
    if (a === b) pass++; else { fail++; fails.push(`${rows}x${cols}#${k}: engine=${a} brute=${b}`); }
    // also validate brute-found solution validity on a multi-solution case if any
    if (a === 1) {
      const v = eng.validate(p, p.solution);
      if (v.ok) pass++; else { fail++; fails.push(`${rows}x${cols}#${k}: solution invalid`); }
    }
  }
}
console.log(`=== hashi xval: ${pass} pass, ${fail} fail ===`);
if (fail) { console.log(fails.join('\n')); process.exit(1); }
process.exit(0);
