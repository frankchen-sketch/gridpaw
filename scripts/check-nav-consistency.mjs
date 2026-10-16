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
