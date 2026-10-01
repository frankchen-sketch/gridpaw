/**
 * Cross-validation for slitherlink countSolutions: an independent DFS
 * (column-major cell order, only degree≤2 + clue + final-loop checks,
 * no vertex-completeness pruning) must agree on solution counts.
 */
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
const esbuild = await import(pathToFileURL(resolve(process.cwd() + '/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'slither-xval-'));
const outfile = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(process.cwd(), 'src/lib/puzzle-core/slitherlink-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile,
});
const eng = await import(pathToFileURL(outfile).href);

// ── independent counter ─────────────────────────────────────────────────────
function bruteCount(puzzle, limit) {
  const { rows, cols, clues } = puzzle;
  const E = eng.edgeCount(rows, cols);
  const sol = new Uint8Array(E); // plain 0/1 progressive assignment
  // column-major cell order
  const cells = [];
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) cells.push([r, c]);
  const cellE = ([r, c]) => [eng.hIdx(rows, cols, r, c), eng.hIdx(rows, cols, r + 1, c), eng.vIdx(rows, cols, r, c), eng.vIdx(rows, cols, r, c + 1)];
  const dotOf = (ei) => {
    if (ei < (rows + 1) * cols) { const r = (ei / cols) | 0, c = ei % cols; return [r, c]; }
    const i2 = ei - (rows + 1) * cols;
    return [(i2 / (cols + 1)) | 0, i2 % (cols + 1)];
  };
  const otherDot = (ei, [r, c]) => {
    if (ei < (rows + 1) * cols) return [r, c + 1];
    return [r + 1, c];
  };
  const id = ([r, c]) => r * (cols + 1) + c;
  let found = 0;
  function rec(ci) {
    if (found >= limit) return;
    if (ci === cells.length) {
      // every edge decided exactly once (each edge belongs to ≥1 cell in column-major? corner edges might be touched once — ensure all assigned via consistency path)
      // degrees
      for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
        let d = 0;
        if (c < cols) d += sol[eng.hIdx(rows, cols, r, c)];
        if (c > 0) d += sol[eng.hIdx(rows, cols, r, c - 1)];
        if (r < rows) d += sol[eng.vIdx(rows, cols, r, c)];
        if (r > 0) d += sol[eng.vIdx(rows, cols, r - 1, c)];
        if (d !== 0 && d !== 2) return;
      }
      // clues
      for (const [r, c] of cells) {
        const ci2 = r * cols + c;
        const sum = cellE([r, c]).reduce((a, ei) => a + sol[ei], 0);
        if (sum !== clues[ci2]) return;
      }
      // connectivity
      const par = new Map();
      const find = (x) => { if (!par.has(x)) par.set(x, x); let r = x; while (par.get(r) !== r) r = par.get(r); par.set(x, r); return r; };
      let any = false, firstId = -1;
      for (let ei = 0; ei < E; ei++) {
        if (!sol[ei]) continue;
        any = true;
        const d = dotOf(ei);
        const d2 = otherDot(ei, d);
        const ra = find(id(d)), rb = find(id(d2));
        if (ra !== rb) par.set(ra, rb);
        if (firstId < 0) firstId = id(d);
      }
      if (!any) return;
      const root = find(firstId);
      for (let ei = 0; ei < E; ei++) {
        if (!sol[ei]) continue;
        const d = dotOf(ei);
        if (find(id(d)) !== root) return;
      }
      found++;
      return;
    }
    const cell = cells[ci];
    const eIdx = cellE(cell);
    const ci2 = cell[0] * cols + cell[1];
    for (let m = 0; m < 16; m++) {
      let bits = 0;
      for (let b = 0; b < 4; b++) if (m & (1 << b)) bits++;
      if (bits !== clues[ci2]) continue;
      // assign with consistency
      const prev = eIdx.map(ei => sol[ei]);
      let ok = true;
      for (let b = 0; b < 4; b++) {
        const want = (m >> b) & 1;
        if (prev[b] !== 255 && prev[b] !== want) { ok = false; break; }
      }
      if (!ok) continue;
      for (let b = 0; b < 4; b++) sol[eIdx[b]] = (m >> b) & 1;
      rec(ci + 1);
      for (let b = 0; b < 4; b++) sol[eIdx[b]] = prev[b];
      if (found >= limit) return;
    }
  }
  // mark unassigned with 255 initially
  sol.fill(255);
  rec(0);
  return found;
}

let pass = 0, fail = 0; const fails = [];
const cases = [
  [4, 4, 'easy', 4],
  [5, 5, 'easy', 4],
  [7, 7, 'medium', 2],
];
for (const [n, , diff, runs] of cases) {
  for (let k = 0; k < runs; k++) {
    const p = eng.generate(n, n, diff, 3300 + n * 41 + k * 11);
    const a = eng.countSolutions(p, 4).count;
    const b = bruteCount(p, 4);
    if (a === b) pass++; else { fail++; fails.push(`${n}x${n}#${k}: engine=${a} brute=${b}`); }
    const v = eng.validate(p, p.solution);
    if (v.ok) pass++; else { fail++; fails.push(`${n}x${n}#${k}: solution invalid`); }
  }
}
console.log(`=== slitherlink xval: ${pass} pass, ${fail} fail ===`);
if (fail) { console.log(fails.join('\n')); process.exit(1); }
process.exit(0);
