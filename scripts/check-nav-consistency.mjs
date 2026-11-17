// 导航一致性门禁：GameSwitcher 与 GameNav 各有一份 games 数组（语义不同、不合并——
// GameNav 给内容页头部混排内容页链接，GameSwitcher 是游戏页内切换的纯游戏列表）。
// 本脚本只防「静默分叉」：GameSwitcher 的每个游戏必须在 GameNav 也有（新游戏漏改即红）。
// 有意省略的游戏例外写 EXCEPTIONS（当前为空；murdoku 漏改 2026-10-16 已补）。
import { readFileSync } from 'node:fs';

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
