/**
 * 构建主盘原型：把引擎与预生成题库内联进单文件 HTML，产出可直接打开的预览。
 *
 * 为什么题库要预生成：8×8 在浏览器里生成要 6.2 秒（node 1.1 秒），10×10 更久。
 * 真实页面同样不能在运行时生成，必须构建期烤好。
 *
 * 用法：node research/tracks-board-prototype/build.mjs [outfile]
 */
import { pathToFileURL } from 'url';
import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const here = dirname(new URL(import.meta.url).pathname);
const repo = resolve(here, '../..');
const esbuild = await import(pathToFileURL(resolve(repo, 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'tracks-proto-'));
const engineOut = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(repo, 'src/lib/puzzle-core/tracks-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile: engineOut,
});

const E = await import(pathToFileURL(engineOut).href);
let pool = {};
try { pool = JSON.parse(readFileSync(join(here, 'pool.json'), 'utf8')); } catch { pool = {}; }
// 题库为空时现生成（首次运行）
if (!Object.keys(pool).length) {
  for (const n of [6, 8, 10]) {
    pool[n] = [];
    for (let k = 0; k < 3; k++) {
      const p = E.generate(n, n, 'medium', 100000 + n * 7919 + k * 104729);
      pool[n].push({
        rows: p.rows, cols: p.cols,
        rowClues: Array.from(p.rowClues), colClues: Array.from(p.colClues),
        start: p.start, end: p.end, pathLen: p.pathLen,
        difficulty: p.difficulty, grade: p.grade,
        solution: Array.from(p.solution), solutionCells: Array.from(p.solutionCells),
      });
    }
  }
  writeFileSync(join(here, 'pool.json'), JSON.stringify(pool));
}

const tpl = readFileSync(join(here, 'board.tpl.html'), 'utf8');
let engine = readFileSync(engineOut, 'utf8');
const cut = engine.lastIndexOf('export {');
if (cut > 0) engine = engine.slice(0, cut).trimEnd() + '\n';
const html = tpl.replace('/*__ENGINE__*/', engine).replace('/*__POOL__*/', 'const PUZZLES = ' + JSON.stringify(pool) + ';');
const out = process.argv[2] || join(here, 'board.html');
writeFileSync(out, html);
console.log(`wrote ${out} (${html.length} bytes, ${Object.values(pool).flat().length} boards)`);
