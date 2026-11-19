/**
 * 生成 Train Tracks 题库 → src/data/tracks-puzzles.json（入库，页面不再现算）
 *
 * 为什么必须预生成：浏览器里生成 8×8 要 6.2 秒、10×10 会卡死主线程；构建期跑
 * 12×12 也要 ~20 秒（自然线索命中率只有 2% 左右，要烧满重试）。所以题目一次性
 * 生成、入库，页面只读 JSON。求解/提示不受影响：deduce 在 12×12 上只要 ~1ms。
 *
 * 入库门槛（任何一条不过就换 seed，绝不放宽）：
 *   1. grade !== 'stalled'      —— relaxed 兜底出来的盘可能推不完
 *   2. deduce(p).solved          —— 提示功能依赖它，不成立玩家会撞上「推不出来了」
 *   3. countSolutions(p,2) === 1 —— 唯一解，页面文案敢说 exactly one solution
 *
 * 用法：node scripts/gen-tracks-pool.mjs [--check]
 *   --check 只校验现有 JSON 是否仍满足三条门槛，不重新生成（CI/构建可复用）
 */
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';
import { pathToFileURL } from 'url';

const OUT = resolve('./src/data/tracks-puzzles.json');
const checkOnly = process.argv.includes('--check');

const esbuild = await import(resolve('./node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js'));
const tmp = mkdtempSync(join(tmpdir(), 'tracks-pool-'));
const enginePath = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [resolve('./src/lib/puzzle-core/tracks-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile: enginePath, logLevel: 'silent',
});
const E = await import(pathToFileURL(enginePath).href);

const rehydrate = (b) => ({
  ...b,
  rowClues: Int8Array.from(b.rowClues),
  colClues: Int8Array.from(b.colClues),
  solution: Uint8Array.from(b.solution),
});

const gates = (p) => {
  if (p.grade === 'stalled') return 'stalled';
  if (!E.deduce(p).solved) return 'not-deduce-solvable';
  const u = E.countSolutions(p, 2);
  if (u.count !== 1) return 'solutions=' + u.count;
  if (u.truncated) return 'proof-budget-exhausted';
  return null;
};

if (checkOnly) {
  const data = JSON.parse(readFileSync(OUT, 'utf8'));
  let bad = 0;
  for (const [n, list] of Object.entries(data.boards)) {
    for (const b of list) {
      const why = gates(rehydrate(b));
      if (why) { bad++; console.error(`✗ ${n}×${n} seed=${b.seed}: ${why}`); }
    }
  }
  if (bad) { console.error(`✗ ${bad} 盘不合格`); process.exit(1); }
  const total = Object.values(data.boards).reduce((a, l) => a + l.length, 0);
  console.log(`✓ 题库 ${total} 盘全部通过唯一解 + 无猜测可推`);
  process.exit(0);
}

// 每档要几盘：主盘 6/8/10 各 6 盘够玩家换；12×12 只给 solver 页用，2 盘
const SPEC = [
  { n: 6, count: 6 },
  { n: 8, count: 6 },
  { n: 10, count: 4 },
  { n: 12, count: 2 },
];

const boards = {};
const t0 = Date.now();
for (const { n, count } of SPEC) {
  const list = [];
  let seed = 100000 + n * 7919;
  let tries = 0;
  while (list.length < count) {
    if (++tries > count * 60) throw new Error(`${n}×${n}: 只凑到 ${list.length}/${count} 盘合格题`);
    seed += 104729;
    const p = E.generate(n, n, 'hard', seed);
    if (gates(p)) continue;
    list.push({
      seed,
      rows: p.rows, cols: p.cols,
      rowClues: [...p.rowClues], colClues: [...p.colClues],
      start: p.start, end: p.end, pathLen: p.pathLen,
      difficulty: p.difficulty, grade: p.grade,
      solution: [...p.solution],
    });
  }
  boards[n] = list;
  console.log(`  ${n}×${n}: ${count} 盘 / ${tries} 次尝试 (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

writeFileSync(OUT, JSON.stringify({ generatedBy: 'scripts/gen-tracks-pool.mjs', seedBase: 100000, boards }, null, 0) + '\n');
const bytes = readFileSync(OUT).length;
console.log(`✓ wrote ${OUT} (${(bytes / 1024).toFixed(1)} KB, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
