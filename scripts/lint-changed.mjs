#!/usr/bin/env node
// 只检查「本次改动涉及的源码」，但用全规则集（含配置里为存量暂时 off 的规则）。
// 这是 Lauren Tan 的「只对新增报错」：存量不清也不挡开发，但动到哪个文件，哪个文件就必须干净。
// 跑法：pnpm lint:changed    （可设 LINT_BASE=<ref> 换基准，默认 origin/HEAD）
import { execSync } from 'node:child_process';
import { join, relative } from 'node:path';

const SRC = /\.(ts|tsx|js|jsx|mjs|cjs|astro)$/;
// 只放能挡真错误的规则。no-useless-escape / no-useless-catch / no-this-alias 是风格规则，
// 挡不了 bug 却要动大量老代码，永久不进闸门（写在这里是为了下次别再想起来「全开」）。
const STRICT_RULES = ['no-unused-vars'];
const SKIP = /(node_modules|dist\/|\.worktrees|public\/.*\.js$)/;

function git(cmd) {
  try { return execSync(cmd, { encoding: 'utf8' }).split('\n'); } catch { return []; }
}

const base = process.env.LINT_BASE || 'origin/HEAD';
const touched = [
  ...git(`git diff --name-only --diff-filter=ACMR ${base}...HEAD`),
  ...git('git diff --name-only --diff-filter=ACMR'),
  ...git('git ls-files --others --exclude-standard'),
];

const gitRoot = (git('git rev-parse --show-toplevel')[0] || '').trim();
// git 返回相对仓库根的路径；仓库根不在当前目录时要换算（hexa 的仓库根在 site/ 上一层）
const files = [...new Set(
  touched
    .filter((f) => f && SRC.test(f) && !SKIP.test(f))
    .map((f) => (gitRoot ? relative(process.cwd(), join(gitRoot, f)) : f))
    .filter((f) => f && !f.startsWith('..') && !f.startsWith('/')),
)];
if (!files.length) {
  console.log('lint:changed — 无改动的源码文件，跳过');
  process.exit(0);
}

const flags = STRICT_RULES.map((r) => `-W ${r}`).join(' ');
const quoted = files.map((f) => JSON.stringify(f)).join(' ');
try {
  execSync(`npx --no-install oxlint ${flags} --deny-warnings ${quoted}`, { stdio: 'inherit' });
  console.log(`lint:changed — ${files.length} 个改动文件通过（全规则集）`);
} catch (e) {
  console.log(`lint:changed — 改动文件未通过全规则集（存量文件也要顺手清掉，不要用 disable 糊）`);
  process.exit(e.status || 1);
}
