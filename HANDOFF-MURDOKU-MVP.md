# HANDOFF — Murdoku MVP 施工交接（2026-10-13 深夜）

> 阅读顺序：先 `STATUS.md`（项目唯一状态入口），再本文。本文只覆盖 Murdoku MVP 的**施工现状与剩余步骤**，不重复品类调研（在 STATUS「2026-10-13」节与 commit `20cdb88`）。

## 一、现役事实（全部有当日证据）

### 已上线（deploy + 线上 curl 复验过，非仅 commit）
| 事项 | commit | 证据 |
|---|---|---|
| game_start 可见性门控（11 处） | `b60dfc5` | deploy `1e8655e2`、线上 grep `_gsWhenVisible` 200、IndexNow 200 |
| 埋点缺口补齐（first_move×3 demo / akari+nurikabe game_over / pictomino postMessage relay） | `602464d` | dist grep 8 文件全进 |
| `/murder-sudoku/` 内容页（规则+解题案例，唯一解经暴力枚举验证） | `74ffae8` | deploy `869c6ba6`、线上 200、IndexNow 202 |

### Murdoku MVP 第 1 批已落库（`0224888`，**页面未开始**）
- `src/lib/puzzle-core/murdoku-engine.ts` — spike 引擎转 ESM（`module.exports` → `export`）。API：`generatePuzzle(N, seed)`（N=4|6，6×6 单次收敛 ~57% **调用方必须重试**）、`checkSolution(N, lay, clues, personCell)`（personCell 含受害者共 N 项，末位=受害者）。唯一解由 solver+独立暴力计数双验证。
- `public/assets/murdoku/` — 14 张 B 水彩绘本资产：猫 `mochi/tofu/pixel/biscuit/nimbus/victim2.jpg` + 地板 `kitchen/hardwood/carpet/marble/stone/attic/greenhouse/gym.jpg`（24 房间名按材质映射，映射表在预览原型 `scratch/murdoku-preview-v2-template.html` 的 ROOM_TEX）。
- `public/murdoku-engine.js` — bundle 产物（IIFE global `MurdokuEngine`），`scripts/bundle-engine.mjs` 已注册。
- 可玩原型（UI/交互的权威参照）：`~/.hermes/cache/scratch/murdoku-preview-v3.html`（24h 会被清，**接手第一件事：把它抄进 repo 或重跑预览**）。

## 二、剩余施工清单（按序）

1. **bundle 验证**：`node scripts/bundle-engine.mjs` 后用浏览器上下文（非 node require——IIFE global 在 CJS 下挂不上）验证 `window.MurdokuEngine.generatePuzzle(4,42)` 出盘 + checkSolution 正误两判。
2. **Worker**：`public/murdoku/worker.js`，`importScripts('/murdoku-engine.js')`，收 `{N, seed}` 回 `{puzzle|null}`；页面对 6×6 必须走 Worker（主线程会卡 1-2s），4×4 可同步。
3. **游戏页** `src/pages/murdoku/index.astro`（范式抄 kenken/index.astro）：SEOHead（title 主体 ≤45 字符——SEOHead 加 " | GridPaw" 后缀，血泪教训见 74ffae8 的 title 59 翻车）+ WebApplication/FAQ JSON-LD + GameHub + UI 照 v3 原型（水彩纹理地板、猫头像 chips、V 徽章受害者、水彩 SVG 道具已在内联模板）。
4. **GA4 打点**（skill `game-event-tracking` 口径）：`game_start` **必须可见性门控**（口径修复血案见 skill 专节）；`first_move {level:'4x4'|'6x6'}` 挂首次放置 + `__firstMoveTracked` 防重；`level_up {level}` 挂 Case Closed（记刚破的案，不记下一案）；`hint_click`；胜利弹窗三按钮 `share_copy/share_twitter/share_reddit`；track() 带 `gpTrack` 转发行。**无 game_over**（无死亡机制，对齐 zen 五游戏语义；Accuse 失败只红闪）。
5. **GameHub 注册**：`src/components/GameHub.astro` games 数组加 `{ href: '/murdoku/', icon: '/assets/game-icons/murdoku.webp', name: 'Murdoku', desc: 'Cat mystery' }` + 生成图标（B 水彩、128px webp ≤3KB，参考同目录现有图）。
6. **内容页 CTA**：`/murder-sudoku/` 页 CTA 区加游戏入口链 `/murdoku/`。
7. **完整验收链**：build → dist grep（门控/事件/引擎）→ **Playwright 交互验收**（正确落子 auto-win、hint 报行列、6×6 Worker 路径、gtag 用 `Object.defineProperty` 拦截法——skill 有现成手法）→ deploy（`npx -y wrangler pages deploy dist --project-name gridpaw --commit-dirty=true`，workdir 必须 gridpaw）→ 线上 curl（`?cb=` 防边缘缓存）→ `node scripts/indexnow-ping.mjs` → STATUS.md 落档。

## 三、已定决策（不要再议）

- **美术风格 = 方案 B 水彩绘本**（三方案对比后用户拍板）；**3D 黏土/软陶渲染 = 用户红线「太 AI」**，已记入长期记忆。
- 品牌位零手绘猫 emoji；嫌疑人是生成的猫角色头像。
- hint 直接给答案+报行列（教学式提示被反复否）。
- Murdoku 商标：主词/域名不碰，正文 educational 可提。
- 8×8 不做（当前证词词汇撑不起唯一性，需扩展证词类型——spike 结论）。

## 四、事故记录（2026-10-13 ~23:30）

会话工具通道发生 **3+ 轮在途失真**：发出的命令被替换成语义相近但不同的代码、回显输出混入不相关内容。当时 MVP 施工中断于「bundle 产物功能验证」一步——该步的失败读数**不可信**（可能是失真产物，也可能是真 bug），上表第 1 步就是重做它。失真前后所有「已上线」结论都出自失真开始前的干净读数+当日线上 curl，可信。**接手人若再遇连续两轮命令回显与所发不符：立即停手，换会话。**

## 五、工作区残留（勿卷入自己的提交）

并行会话改动：`NEWWORD-LEDGER.md`、`research/*趋势*`、`scripts/trends_plugin.sh`、`src/pages/arrows-puzzle-walkthrough/index.astro`。构建噪声：4 个 `public/*/gp-build.js`（gen-build-info.mjs 每次构建改写）。提交时逐条列路径，禁 `git commit -a`。
