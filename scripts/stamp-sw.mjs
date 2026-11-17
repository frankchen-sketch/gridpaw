#!/usr/bin/env node
// Stamps dist/sw.js CACHE_VERSION with the git short hash (+ -dirty) — same identity as
// gen-build-info.mjs. Runs AFTER astro build, BEFORE fix-sitemap. Edits dist only, never public/.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const target = 'dist/sw.js';
const MARKER = "const CACHE_VERSION = 'dev';";

let src;
try {
  src = readFileSync(target, 'utf8');
} catch {
  console.error('stamp-sw: FAIL — dist/sw.js not found (astro build ran?)');
  process.exit(1);
}
if (!src.includes(MARKER)) {
  console.error('stamp-sw: FAIL — CACHE_VERSION marker not found in dist/sw.js (file changed upstream?)');
  process.exit(1);
}
const hash = execSync('git rev-parse --short HEAD').toString().trim();
// 「脏」只算会进 dist 的改动，否则并行采集任务往 research/ 写一个 JSON 就把线上
// CACHE_VERSION 打成 -dirty（每份产物指纹都不可复现）。口径与 scripts/deploy.sh
// 前置检查一致：
//   ① 已跟踪文件有未提交改动 → 会被打进 dist
//   ② src/ 或 public/ 下有 untracked 文件 → 会被 build 编译/拷贝进 dist
//   ③ 其余 untracked（research/、临时产物）不影响产物 → 不算脏
const trackedDirty = execSync('git status --porcelain --untracked-files=no').toString().trim().length > 0;
const untrackedInSrc = execSync('git ls-files --others --exclude-standard -- src public').toString().trim().length > 0;
const dirty = trackedDirty || untrackedInSrc;
const version = dirty ? `${hash}-dirty` : hash;
writeFileSync(target, src.replace(MARKER, `const CACHE_VERSION = '${version}';`));
console.log(`stamp-sw: CACHE_VERSION='${version}'`);
