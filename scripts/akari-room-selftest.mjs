/**
 * Akari 房间生成器自测：编译 akari-engine.ts（与 bundle-engine.mjs 同一 esbuild 路径）
 * 然后跑 30 盘/档自测：唯一解 + 全亮 + 数字全对 + 无冲突 + 耗时。
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const esbuildPath = resolve('./node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js');
const esbuild = await import(esbuildPath);
const src = readFileSync(resolve('./src/lib/akari-engine.ts'), 'utf-8');
const result = esbuild.transformSync(src, { loader: 'ts', format: 'esm', target: 'es2020' });
const code = result.code.replace(/^export /gm, '');

// 在同一模块作用域里执行引擎代码，再跑测试
const E = {};
new Function('exports', code + `
exports.illuminate = illuminate;
exports.solve = solve;
exports.generateRoomPuzzle = generateRoomPuzzle;
exports.generatePuzzle = generatePuzzle;
exports.generateMask = generateMask;
`)(E);

function validate(p) {
  const n = p.size, g = p.grid, s = p.solution;
  const lit = E.illuminate(g, s, n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (g[r][c] === 9 && !lit[r][c]) return 'unlit ' + r + ',' + c;
    if (g[r][c] === -3 && s[r][c]) return 'bulb on mask';
    if (s[r][c]) {
      for (const [dr, dc] of [[1, 0], [0, 1]]) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < n && nc >= 0 && nc < n && g[nr][nc] === 9) {
          if (s[nr][nc]) return 'conflict ' + r + ',' + c;
          nr += dr; nc += dc;
        }
      }
    }
  }
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (g[r][c] >= 0 && g[r][c] <= 4) {
      let k = 0;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && s[nr][nc]) k++;
      }
      if (k !== g[r][c]) return 'wall ' + r + ',' + c + '=' + g[r][c] + ' has ' + k;
    }
  }
  return null;
}

let totalFail = 0;
for (const room of ['kitchen', 'study', 'attic']) {
  const t0 = Date.now();
  let fail = 0, sizes = {}, diffs = {}, carved = 0;
  for (let i = 0; i < 30; i++) {
    const p = E.generateRoomPuzzle(room);
    sizes[p.size] = (sizes[p.size] || 0) + 1;
    diffs[p.difficulty] = (diffs[p.difficulty] || 0) + 1;
    if (p.room !== room || p.size < 4) { fail++; continue; }
    const err = validate(p);
    if (err) { fail++; console.log('  FAIL:', err, p.size, p.difficulty); continue; }
    const chk = E.solve(p.grid, p.size, 2);
    if (chk.count !== 1) { fail++; console.log('  NOT UNIQUE:', chk.count, p.size); continue; }
    if (room !== 'kitchen' && p.grid.flat().some(v => v === -3)) carved++;
  }
  const ms = (Date.now() - t0) / 30;
  totalFail += fail;
  console.log(room.toUpperCase() + ': 30 boards, fail=' + fail + ', avg ' + ms.toFixed(0) + 'ms/gen, sizes=' + JSON.stringify(sizes) + ', diff=' + JSON.stringify(diffs) + ', masked=' + carved + '/30');
}

// mask 形状 sanity：study/attic 应真的啃出缺角
const m = E.generateMask(7, 0.3);
const flat = m.flat();
console.log('MASK 7x7@0.3: outside cells=' + flat.filter(v => v === -3).length + ' (expect ~15)');

// 回归：老 generatePuzzle(5) 不受影响
const t1 = Date.now();
const p = E.generatePuzzle(5);
const reg = p.room === undefined && E.solve(p.grid, 5, 2).count === 1;
console.log('REGRESSION generatePuzzle(5): ' + (reg ? 'PASS' : 'FAIL') + ' (' + (Date.now() - t1) + 'ms)');
console.log(totalFail === 0 ? 'ALL PASS' : 'FAILURES: ' + totalFail);
