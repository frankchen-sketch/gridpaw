#!/usr/bin/env node
// 项目约定闸门：oxlint 管语法/正确性，这里管「仓库级」必然复发的事故类型。
// 跑法：node scripts/lint-conventions.mjs（已挂在 npm run lint 里）
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const failures = [];

// 规则 1：凭证文件不允许进 git。事故形态是「本地 .env 被 add 进去，推到线上仓库」，
// 人眼在 diff 里经常滑过去，但 git ls-files 一查就死。
const FORBIDDEN_TRACKED = /(^|\/)\.env($|\.(?!example|sample|template))|\.pem$|(^|\/)id_rsa$/;
const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n');
for (const f of tracked) {
  if (f && FORBIDDEN_TRACKED.test(f)) failures.push(`${f}: 凭证文件被 git 跟踪（应进 .gitignore，并从索引移除）`);
}

// 规则 2：源码里不允许出现明文支付/平台密钥。读 env 的写法不受影响。
const SECRET = /\b(sk_live_[A-Za-z0-9]{8,}|sk_test_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}|pk_live_[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/;
function walk(dir, out = []) {
  let names = [];
  try { names = readdirSync(dir); } catch { return out; }
  for (const name of names) {
    if (name === 'node_modules' || name === 'dist' || name === '.wrangler' || name === '.git') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
for (const dir of ['src', 'scripts']) {
  for (const f of walk(join(ROOT, dir))) {
    if (!/\.(ts|tsx|js|mjs|cjs|astro)$/.test(f)) continue;
    const m = readFileSync(f, 'utf8').match(SECRET);
    if (m) failures.push(`${relative(ROOT, f)}: 出现疑似明文密钥 "${m[1].slice(0, 8)}…"`);
  }
}

if (failures.length) {
  console.error('conventions: ' + failures.length + ' 处违约\n' + failures.map((x) => '  - ' + x).join('\n'));
  process.exit(1);
}
console.log('conventions: ok');
