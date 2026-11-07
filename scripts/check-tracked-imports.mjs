#!/usr/bin/env node
// check-tracked-imports.mjs — 抓「已入库的文件 import 了没入库的文件」
//
// WHY: 2026-11-07 R&E 提交出现真事故——11 个关卡页 + hub 全部入库，但它们 import 的
// src/components/LevelSelector.astro / SolverTiles.astro 一直是 untracked。
// 后果：本机 build 一切正常，从 HEAD 干净检出（worktree / 新机器 / CI）直接 build 失败：
//   Could not resolve "../../components/LevelSelector.astro"
// 这类缺陷只有「换一个干净环境构建」才会暴露，肉眼 review 看不见。
//
// 判定：遍历 git 已跟踪的 .astro/.ts/.js/.mjs，解析相对 import，若解析到真实存在
// 但未被 git 跟踪的文件 → 报错退出 1。
//
// 例外：构建期生成物（src/lib/app-build.generated.ts，由 scripts/gen-build-info.mjs 产出）
// 本来就该被忽略，写进 ALLOWLIST。
//
// 用法：node scripts/check-tracked-imports.mjs   （独立运行，不挂在 build 链上：
//       干净 worktree 里可能没有 .git，挂进 build 会误伤）

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');

const ALLOWLIST = new Set([
  'src/lib/app-build.generated.ts', // scripts/gen-build-info.mjs 构建期生成
]);

function git(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
}

let tracked;
try {
  tracked = new Set(git(['ls-files']).split('\n').filter(Boolean));
} catch {
  console.log('[check-tracked-imports] 非 git 仓库或缺 git，跳过');
  process.exit(0);
}

const EXTS = ['', '.astro', '.ts', '.js', '.mjs', '.json'];
const CANDIDATE_EXTS = ['.astro', '.ts', '.js', '.mjs'];

const sources = [...tracked].filter((f) => /\.(astro|ts|js|mjs)$/.test(f));
const offenders = new Map(); // 未跟踪文件 -> 引用它的已跟踪文件列表

for (const file of sources) {
  const abs = join(repoRoot, file);
  if (!existsSync(abs)) continue;
  let text;
  try {
    text = readFileSync(abs, 'utf8');
  } catch {
    continue;
  }
  // import x from './y'  /  import './y'  /  export ... from './y'
  const re = /(?:from\s+|import\s+)['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(text))) {
    const spec = m[1];
    const base = normalize(join(dirname(file), spec));
    const tries = [
      ...CANDIDATE_EXTS.map((e) => base + e),
      ...CANDIDATE_EXTS.map((e) => join(base, 'index' + e)),
      base,
    ];
    const hit = tries.find((p) => existsSync(join(repoRoot, p)));
    if (!hit) continue; // 解析不到＝别的问题（类型声明等），不归本脚本管
    if (tracked.has(hit) || ALLOWLIST.has(hit)) continue;
    if (!offenders.has(hit)) offenders.set(hit, []);
    offenders.get(hit).push(file);
  }
}

if (offenders.size === 0) {
  console.log(`[check-tracked-imports] ok — 扫描 ${sources.length} 个已跟踪源文件，无未跟踪依赖`);
  process.exit(0);
}

console.error('\n[check-tracked-imports] FAILED — 已入库文件引用了未入库文件，干净检出会构建失败：\n');
let total = 0;
for (const [missing, refs] of [...offenders].sort()) {
  total += refs.length;
  console.error(`  ✗ ${missing}`);
  console.error(`      被 ${refs.length} 处引用：${refs.slice(0, 3).join(', ')}${refs.length > 3 ? ' …' : ''}`);
}
console.error(`\n共 ${offenders.size} 个文件 / ${total} 处引用。修法：git add 这些文件后重新提交。`);
console.error('若是构建期生成物，请加入本脚本的 ALLOWLIST。\n');
process.exit(1);
