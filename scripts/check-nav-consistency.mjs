// 导航一致性门禁：GameSwitcher 与 GameNav 各有一份 games 数组（语义不同、不合并——
// GameNav 给内容页头部混排内容页链接，GameSwitcher 是游戏页内切换的纯游戏列表）。
// 本脚本只防「静默分叉」：GameSwitcher 的每个游戏必须在 GameNav 也有（新游戏漏改即红）。
// 有意省略的游戏例外写 EXCEPTIONS（当前为空；murdoku 漏改 2026-10-16 已补）。
import { existsSync, readFileSync } from 'node:fs';

const EXCEPTIONS = new Set();
const gameHrefs = (file) =>
  [...readFileSync(file, 'utf8').matchAll(/\{\s*href:\s*'([^']+)',\s*emoji:/g)].map((m) => m[1]);

const sw = gameHrefs('src/components/GameSwitcher.astro');
const gn = gameHrefs('src/components/GameNav.astro');
const missing = [...new Set(sw)].filter((h) => !gn.includes(h) && !EXCEPTIONS.has(h));

if (missing.length) {
  console.error(`✗ 导航分叉：GameSwitcher 有、GameNav 没有的游戏（内容页头部缺头部入口/内链）：`);
  for (const h of missing) console.error(`  ${h}`);
  console.error(`  补进 src/components/GameNav.astro 的 games 数组，或有意省略则写进本文件 EXCEPTIONS。`);
  process.exit(1);
}
console.log(`✓ 导航一致：GameSwitcher ${new Set(sw).size} 游戏 ⊆ GameNav ${new Set(gn).size} 游戏`);

// pictomino 是 public/ 下的手写 HTML 旧站，它的 game-switcher 是 GameSwitcher 的手写复制品。
// 2026-11-17 实测它只链 3 款（新版已 14 款），玩家在 /pictomino/ 看不到 11 款游戏。
// 这里做单向提示而非 fail：旧站欠账不该卡整个构建，但新游戏上线时漏同步必须被看见。
const PICTOMINO_HTML = 'public/pictomino/index.html';
try {
  const pmHtml = readFileSync(PICTOMINO_HTML, 'utf8');
  const menu = pmHtml.match(/<div class="game-switcher-menu">([\s\S]*?)<\/div>/);
  if (menu) {
    const pmHrefs = new Set([...menu[1].matchAll(/href="([^"]+)"/g)].map((m) => m[1]));
    const pmMissing = [...new Set(sw)].filter((h) => !pmHrefs.has(h));
    if (pmMissing.length) {
      console.warn(`⚠ pictomino 导航缺 ${pmMissing.length} 款游戏（/pictomino/ 的 127 users/28d 看不到这些）：`);
      for (const h of pmMissing) console.warn(`    ${h}`);
      console.warn(`  同步进 ${PICTOMINO_HTML} 的 game-switcher-menu（手写复制品，不会自动跟着 Astro 组件变）。`);
    } else {
      console.log(`✓ pictomino 导航一致：${new Set(sw).size} 款全在 hand-written menu 里`);
    }
  }
} catch {
  // pictomino 站不存在或结构变了：不阻塞，交给人工注意
}

// ── 大格数独集群（docs/sudoku-cluster-contract.md 第四节）──────────────────
// 6 个新页由另一路并行开发，页面文件可能还不存在：不存在只标「未就绪」，不算失败。
// 页面一旦存在，就必须能在导航里点到，否则是孤岛页（站内没有任何入口）。
// 注意：GameNav 里内容页条目没有 emoji，上面的 gameHrefs 正则抓不到，这里单独抓全部 href。
const SUDOKU_CLUSTER = [
  { route: '/16x16-sudoku/', file: 'src/pages/16x16-sudoku/index.astro', hub: true },
  { route: '/mega-sudoku/', file: 'src/pages/mega-sudoku/index.astro' },
  { route: '/hexadoku/', file: 'src/pages/hexadoku/index.astro' },
  { route: '/12x12-sudoku/', file: 'src/pages/12x12-sudoku/index.astro' },
  { route: '/25x25-sudoku/', file: 'src/pages/25x25-sudoku/index.astro' },
  { route: '/sudoku-with-letters/', file: 'src/pages/sudoku-with-letters/index.astro' },
];
// 有意不挂导航的路由（例如纯同义入口页只做正文内链）：写在这里，别注释掉检查
const SUDOKU_NAV_EXEMPT = new Set();

const normHref = (h) => (h.length > 1 ? h.replace(/\/+$/, '') : h) || '/';
const allNavHrefs = (file) => {
  try {
    const text = readFileSync(file, 'utf8');
    return new Set([...text.matchAll(/href:\s*'([^']+)'/g)].map((m) => normHref(m[1])));
  } catch {
    return new Set();
  }
};

const navAll = allNavHrefs('src/components/GameNav.astro');
const switcherAll = allNavHrefs('src/components/GameSwitcher.astro');
const pending = [];
const orphan = [];
const hubMissing = [];
const switcherOnly = [];

const audited = SUDOKU_CLUSTER.filter((r) => !SUDOKU_NAV_EXEMPT.has(r.route));

for (const { route, file, hub } of audited) {
  if (!existsSync(file)) {
    pending.push(route);
    continue;
  }
  const key = normHref(route);
  const inNav = navAll.has(key);
  const inSwitcher = switcherAll.has(key);
  if (!inNav && !inSwitcher) orphan.push(route);
  else if (hub && !inNav) hubMissing.push(route);
  else if (!inNav) switcherOnly.push(route);
}

if (pending.length) {
  console.log(
    `ℹ 大格数独集群：${audited.length - pending.length}/${audited.length} 页已建，未建的不做导航校验（页面合并后自动生效）`
  );
  if (pending.length < audited.length) console.log(`  未就绪：${pending.join(' ')}`);
}
for (const h of switcherOnly) {
  console.warn(`⚠ ${h} 只出现在 GameSwitcher，GameNav 没有：内容页头部会缺这条内链（非阻塞）`);
}

if (orphan.length || hubMissing.length) {
  if (orphan.length) {
    console.error('✗ 大格数独集群孤岛页：页面文件已建，但 GameNav / GameSwitcher 都没有入口：');
    for (const h of orphan) console.error(`  ${h}`);
  }
  if (hubMissing.length) {
    console.error('✗ 大格数独集群 hub 页不在 GameNav（核心词页必须能从站内导航点到）：');
    for (const h of hubMissing) console.error(`  ${h}`);
  }
  console.error('  补进 src/components/GameNav.astro（内容页条目无 emoji），或有意不挂导航则写进本文件 SUDOKU_CLUSTER 的豁免。');
  process.exit(1);
}
if (!pending.length) console.log(`✓ 大格数独集群导航：${audited.length} 页都有入口`);
