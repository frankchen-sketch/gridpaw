// 广告可见性策略 —— 唯一真源。
//
// 为什么抽出来：AdSense 有两种出货方式，判据必须是同一份清单，否则两套规则会分叉：
//   ① 自动广告（Auto ads，后台开）：只要页面加载了 adsbygoogle.js，Google 就自己找位置插。
//      → 由 SEOHead.astro 用 loaderAllowed() 决定「这个页面要不要加载 loader」。
//   ② 手动位（SideAd.astro / InContentAd.astro 的 <ins>）：由 SideAd 用 isPlaySurface()/adsAllowed() 决定。
//
// 两处共用本文件的好处：play surface 上**连 loader 都不加载**，自动广告在物理上到不了棋盘页，
// 不用再去 AdSense 后台维护第二份「排除的网页」清单（那份清单生效最长 1 小时，且每新增一个
// 游戏页/单关页都要记得同步 —— 与 GameSwitcher/GameNav 那类双处维护的债完全同型）。
//
// 判据仍是路径白名单（去尾斜杠比较）；新增游戏页/解题器页/单关页必须同步加进来。

/** play surface：棋盘页 / 解题器 / 单关页。2026-11-16 起从「零广告」改为「只开桌面侧栏」，
 *  ≥1350 的左右 160×600 落在 840px 内容列之外的空白 gutter ——
 *  29 个 play surface 逐页 elementFromPoint 采样实测（1440/1350 两档），棋盘格、按钮、文字零命中。 */
export const PLAY_SURFACES = new Set([
  '/',
  '/akari', '/binary', '/hashi', '/kakuro', '/kenken',
  '/meowdoku', '/murdoku', '/nonogram', '/nurikabe', '/slitherlink', '/star-battle',
  '/solver', '/akari/solver', '/hashi/solver', '/nonogram/solver', '/kenken/solver',
  '/word-kitchen/solver',  // 2026-11-24：第三方游戏（Gimica Word Kitchen）字母求解器，交互工具页按解题器口径
  '/amochiroom/find',      // 2026-11-24：第三方游戏（Amochiroom Room Sort）箱子反查工具，纯前端交互，同解题器口径
  '/amochiroom/play',      // 2026-11-25：133 关可玩版从 /room-sort-game-online 挪到品牌目录下（换体：品类页给自研平面图）
  //   配套的 /amochiroom/ 与 /amochiroom/level-N/ 是纯文字攻略页（内容页，全档广告），不登记
  // 同族真棋盘页（2026-11-08 补）：不是 /akari/ 主入口但同样直接渲染可玩棋盘
  '/akari/akari-puzzle', '/akari/cat-logic-puzzle', '/akari/create', '/akari/daily',
  '/akari/light-up-puzzle', '/akari/logic-puzzle', '/akari/sudoku-with-pictures',
  '/murdoku/trail', '/the-loop-puzzle',
  // 2026-11-20 补：大格数独集群 6 页（11-19 上线时漏加）+ /akari/play
  '/16x16-sudoku', '/hexadoku', '/mega-sudoku', '/12x12-sudoku', '/25x25-sudoku',
  '/sudoku-with-letters', '/akari/play',
  // 2026-11-20 补：/akari/cheats 正文中段是交互式 Akari 编辑器 + solver（#editor-board），
  // 按「解题器页」口径归 play surface（只出桌面侧栏）。同族 /akari/solver 早已在此表。
  '/akari/cheats',
  // 产品/售卖页：用户在这页是来买/看产品的，不挂广告（2026-11-09 unlock-all 落地页）
  '/unlock-all', '/ad-free',
  // 2026-11-20 晚补（兄弟会话 cron 雷达独立复验时抓到，本会话复核坐实）：
  // /meowdoku-guide 一直被当成「有意保留广告的内容页」，但那条豁免的前提是「内嵌 demo = iframe，
  // 广告进不去」。实测该页 iframe=0，正文里是**内联渲染**的 <MeowdokuPlay mode="random" />——
  // #mzr-board / #mzr-hearts / #mzr-hint / #mzr-reset / #mzr-win 全在，是一张真能玩的棋盘。
  // 不改的话自动广告会物理落在一个可玩棋盘页上，正是本闸门要防的缺陷。
  // 对照：/japanese-logic-puzzles 有 iframe（loader 在但广告进不到棋盘里），豁免仍然成立。
  '/meowdoku-guide',
  // 2026-11-23 新游戏：Huepaw 每日渐变谜题（内联渲染棋盘 = play surface，只出桌面侧栏）
  // 同族的 /huepaw/archive/ 也是 play surface：这页在页内加载 gradient-engine.js 重放 30 天的
  // 每日盘（每张缩略图都是可点进棋盘的入口），且刻意不加任何广告组件。不登记的后果是
  // check-play-surfaces 报红，同时 SEOHead 会把 adsbygoogle loader 放进这个棋盘页。
  '/huepaw', '/huepaw/archive',
  // 2026-11-24 新游戏：Room Sort 网页版（133 关可玩，内联渲染棋盘 = play surface，只出桌面侧栏）
  '/room-sort-game-online',
]);

/** 按目录整片收：单关棋盘页（/akari/puzzle/puzzle-001 … /meowdoku/levels/1 …） */
export const PLAY_PREFIXES = ['/akari/puzzle/', '/meowdoku/levels/'];

/** 永久零广告（连侧栏都不出）：
 *   /murdoku、/murdoku/trail、/murdoku/daily —— main 是 1152px 全宽（2026-10-14「侧栏吞点击」事故的同一个布局债），
 *     侧栏会落在网格上；实测 25/25 采样点命中 main.main。要么先把它收到 840，要么继续全零。
 *     （/murdoku/daily 首版按卡片要求「默认沿用零广告」登记；它的 .main 已收窄到 52.5rem，
 *      要开侧栏需单独拍板，登记改到 PLAY_SURFACES 即可。）
 *   /unlock-all、/ad-free —— 售卖页，用户是来买/关广告的。
 *   /train-tracks-puzzle* —— 2026-11-19 用户拍板：Train Tracks 三页不挂任何广告。 */
export const NEVER_ADS = new Set([
  '/murdoku', '/murdoku/trail', '/murdoku/daily', '/unlock-all', '/ad-free',
  '/train-tracks-puzzle', '/train-tracks-puzzle/solver', '/train-tracks-puzzle/printable',
]);

/** 归一化路径：去尾斜杠，根路径归一成 '/'（Astro 的 trailingSlash: 'always' 与内嵌页的人手写法都要吃下） */
export function normalizePath(p: string): string {
  return (p || '/').replace(/\/+$/, '') || '/';
}

export function isPlaySurface(path: string): boolean {
  const p = normalizePath(path);
  return PLAY_SURFACES.has(p) || PLAY_PREFIXES.some((prefix) => p.startsWith(prefix));
}

/** 手动广告位能否出现（= 不是永久零广告页） */
export function adsAllowed(path: string): boolean {
  return !NEVER_ADS.has(normalizePath(path));
}

/** 能否加载 adsbygoogle.js。
 *  play surface 与永久零广告页一律不加载 —— 自动广告因此物理上到不了棋盘页。 */
export function loaderAllowed(path: string): boolean {
  return adsAllowed(path) && !isPlaySurface(path);
}
