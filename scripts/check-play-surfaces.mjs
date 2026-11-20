#!/usr/bin/env node
/**
 * Play surface 登记闸门 —— 防「新游戏页上线了，SideAd 白名单没同步」这类静默缺陷。
 *
 * 背景（2026-11-20 实测）：大格数独集群 6 页（/16x16-sudoku/ 等）11-19 上线，
 * 但 SideAd.astro 的 PLAY_SURFACES 没加 → 一旦 Adsterra 恢复（ADSTERRA_OFF=false），
 * 这 6 页会按「普通内容页」处理：768–1349px 底部 728×90 sticky（position:fixed，压住
 * 视口底部 90px）+ <768px 顶部 320×50（插在 header 之后、棋盘之上）+ 手机底部第二信息流，
 * 全部压在可点的棋盘 / 数字键盘上。AGENTS.md 写死「新增游戏页/解题器页/单关页必须同步
 * 加进 PLAY_SURFACES 或 PLAY_PREFIXES」，但没有闸门保证这一条被执行。
 *
 * 判据：任何源码里渲染了交互棋盘（board 容器 id / Play 组件 / *-engine.js）的页面，
 * 必须在 SideAd.astro 三张表里之一有明确归属（放行 / 全零 / 目录前缀）。没有归属 = 红。
 *
 * 有意不登记的路由写进 EXEMPT 并注明原因（例：纯静态 demo iframe，板子不在本页）。
 *
 * 用法：node scripts/check-play-surfaces.mjs
 *       node scripts/check-play-surfaces.mjs --list    # 只打印分类，不判失败
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SIDEAD = 'src/components/SideAd.astro';
const PAGES_DIR = 'src/pages';

// 有意不登记：{ '路由': '原因' }
const EXEMPT = {
  // /meowdoku-guide 是攻略页（AGENTS.md 明写「内嵌 demo 的内容页故意保留广告」），
  // 页内棋盘是 Content 的附属演示，不是入口 play surface。
  '/meowdoku-guide': 'AGENTS.md 明确列为有意保留广告的内容页',
  // /arrows-puzzle-walkthrough 的 #lv-board 是只读 SVG 复盘（按 tap order 重放），
  // 用户不在这页下棋；它是攻略页不是 play surface。
  '/arrows-puzzle-walkthrough': 'walkthrough 页，板子是按步重放的只读 SVG，非可玩棋盘',
  // demo iframe 的内容页：棋盘在 public/*/demo.html 里，本页只有 iframe，
  // 广告位按内容页处理是既定口径（AGENTS.md「内嵌 demo 的内容页故意保留广告」）。
  '/japanese-logic-puzzles': 'demo iframe 内容页',
};

const src = readFileSync(SIDEAD, 'utf8');

function readSet(name) {
  const m = src.match(new RegExp(`${name}\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  if (!m) throw new Error(`${SIDEAD} 里找不到 ${name}`);
  return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
}
function readArray(name) {
  const m = src.match(new RegExp(`${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) throw new Error(`${SIDEAD} 里找不到 ${name}`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

const PLAY = readSet('PLAY_SURFACES');
const NEVER = readSet('NEVER_ADS');
const PREFIXES = readArray('PLAY_PREFIXES');

// —— 判定「这页渲染了交互棋盘」的标记 ——
// 只认结构标记与组件名，不认自由文本，避免正文提到 engine 就误判。
const BOARD_MARKERS = [
  /<SudokuPlay\b/,
  /<MeowdokuPlay\b/,
  /<LoopPuzzlePlay\b/,
  /<TracksPlay\b/,
  /<PlayBoard\b/,
  /id="[a-z0-9-]*(?:puzzle-)?board[a-z0-9-]*"/i,
  /src="\/[a-z0-9-]+-engine\.js"/,
  /<script[^>]*is:inline[^>]*src="\/puzzle-engine\.js"/,
  /<script[^>]*is:inline[^>]*src="\/akari-engine\.js"/,
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.astro')) out.push(p);
  }
  return out;
}

function toRoute(file) {
  let r = relative(PAGES_DIR, file).replace(/\\/g, '/');
  if (r === 'index.astro') return '/';
  r = r.replace(/\/index\.astro$/, '/').replace(/\.astro$/, '/');
  r = r.replace(/\[[^\]]+\]/g, '*');
  if (!r.startsWith('/')) r = '/' + r;
  return r;
}

function normalise(route) {
  const k = route.replace(/\/+$/, '');
  return k === '' ? '/' : k;
}

const rows = [];
for (const file of walk(PAGES_DIR)) {
  const text = readFileSync(file, 'utf8');
  const marker = BOARD_MARKERS.find((re) => re.test(text));
  if (!marker) continue;
  rows.push({ file, route: toRoute(file), marker: marker.source.slice(0, 40) });
}

const listOnly = process.argv.includes('--list');
const unknown = [];
const lines = [];

for (const { file, route, marker } of rows.sort((a, b) => a.route.localeCompare(b.route))) {
  const key = normalise(route);
  let state;
  if (NEVER.has(key)) state = 'NEVER_ADS';
  else if (PLAY.has(key)) state = 'PLAY_SURFACES';
  else if (PREFIXES.some((p) => key.startsWith(normalise(p)))) state = 'PLAY_PREFIXES';
  else if (key in EXEMPT) state = 'EXEMPT';
  else state = 'UNREGISTERED';

  const ads = state === 'UNREGISTERED'
    ? '轨+STICKY(固定压底90px)+TOP(棋盘之上)+手机底部信息流'
    : state === 'EXEMPT' ? '未登记（见 EXEMPT 原因）' : '仅 ≥1350 桌面侧栏';
  lines.push(`  ${state.padEnd(15)} ${key.padEnd(30)} ${ads}`);
  lines.push(`  ${''.padEnd(15)} ${file}`);
  if (state === 'UNREGISTERED') unknown.push({ key, file, marker });
}

if (lines.length === 0) {
  console.log('✓ play surface 闸门：未发现渲染棋盘的页面（标记全不命中，检查 BOARD_MARKERS）');
  process.exit(0);
}

console.log(`play surface 登记检查（${rows.length} 个页面渲染交互棋盘）`);
console.log(lines.join('\n'));

if (listOnly) process.exit(0);

if (unknown.length) {
  console.error('');
  console.error(`✗ ${unknown.length} 个页面渲染了交互棋盘，但 SideAd.astro 里没有明确归属：`);
  for (const u of unknown) console.error(`   ${u.key}  <- ${u.file}  (命中 ${u.marker})`);
  console.error('');
  console.error('  修法（三选一）：');
  console.error('   ① 棋盘页/解题器页/单关页 → 加进 SideAd.astro 的 PLAY_SURFACES 或 PLAY_PREFIXES（只出桌面侧栏）');
  console.error('   ② 用户拍板永久零广告 → 加进 NEVER_ADS');
  console.error('   ③ 确实是内容页、有意保留全档广告 → 写进本文件 EXEMPT 并注明原因');
  console.error('  不登记就上线 = sticky 会压住视口底部 90px 的棋盘与按钮（AGENTS.md「广告现役状态」）。');
  process.exit(1);
}

console.log(`\n✓ play surface 登记完整：${rows.length} 个棋盘页全部有明确归属（${PLAY.size} 精确放行 + ${PREFIXES.length} 目录前缀 + ${NEVER.size} 全零 + ${Object.keys(EXEMPT).length} 有意豁免）`);
