---
name: gridpaw-home-redesign
description: Use when 改 gridpaw 首页/首屏、按契约出设计稿或验收首页改版。
---

# GridPaw 首页改版：契约 → 生产

首页改版有一条**冻结的合同**，不是一个可以自由发挥的设计任务。任何会话（我或子 agent）动首页前先走这份流程。

## 触发条件（命中任一条就读完本 skill）

- 要改 `src/pages/index.astro`、首页任何 section、或首屏 hero
- 要出首页设计稿 / 对比稿 / 跑不同模型出稿
- 要验收首页改版（"这版行不行""过没过契约"）
- 要新增首页区块（FAQ、排行榜、数字带、工具带…）

## 0. 先核契约是否被改过（10 秒）

```bash
cd ~/workspace/gridpaw/docs/design-v8
md5 -r CONTRACT.md tokens.css contract_check.py style_fp_check.py assemble.py part1-s1-s5.md part2-s6-s9.md
# 与 FROZEN.md 的清单逐行比对；任何一行不符 = 有人动了冻结件，先查 git log 再动手
```

- 合同：`docs/design-v8/CONTRACT.md`（v1.0 FROZEN，31 条 + 3 子条）
- 勘误：`docs/design-v8/FROZEN.md` 末尾（E1：C2 写的 `src/components/ShikakuBoard.astro` 不存在，`#play` 是内联区块+内联脚本）
- 生产路径：`docs/design-v8/PRODUCTION-PLAN.md`

## 1. 数字必须来自代码，不能抄稿

设计稿里的「13 games · 2 solvers」是错的。线上真值：

| 数字 | 真源 |
|---|---|
| 15 个游戏 | `src/components/GameHub.astro` 的 name 列表 |
| 70 道 Shikaku 题（28/27/15） | `src/data/puzzles.json` |
| 1 个求解器（只有 Shikaku） | `src/pages/solver.astro` |

任何新写的数字先回去数一遍，数不出真源就不许上页面。

## 2. token 三层，别套错名

- `src/styles/tokens.css` 是 v1.0 全量（96 个变量，含 `--fs-hero` / `--w-page` / `--r-lg`）
- `index.astro` 里还有一份内联 `:root`（v0.1 子集 + `--mt-*` 旧别名层）——**不能整块删**，游戏 UI 还在用 `--mt-*`
- 命名雷：`--gp-sand` = `#F8F6EF`，**`--gp-parchment` 才是 `#E8DDD0`**（合同 C31 说的「沙」）
- 首页原先**根本没引 tokens.css**，`--fs-hero` 等全是空 → var() 失效退化成 16px。动首页先确认 `import '../styles/tokens.css'` 在

## 3. h1 是 SEO 资产：可以变可见，不许改字

线上 h1 是 sr-only 的 `GridPaw: Free Shikaku Puzzle Game Online`。改版可以把它提到 hero 里做可见主标题，**文字一个字不动**；`<span class="accent">` 里的品牌词也别删。同理 4 段 `seo-section` 长文、`#walkthroughs`、`#tips-section` 是 SEO 内容骨架，**一律原样保留**。

## 4. 迁移是逐屏换皮，不是整页替换

`index.astro` = 2,718 行 + 11 个引擎构建脚本。必须保留的东西：

- `#play`（第 718 行起）整块：`id="play"` / `id="board"` / 教练层 / 6 个工具栏按钮 / 内联 JS 全不动
- `#daily-leaderboard`、`#account-area`、`#dailyStatus` 这些 **id 都在 JS 里被引用**，挪位置可以，改 id 会静默断
- 组件：`GameHub` / `HomeTools` / `AdSlot` / `SideAd` / `GameSwitcher` / `BadgeUpgrade`… 换外层容器可以，组件内部不动

## 5. 响应式三条硬规则（C25.1–25.3）

1. 尺寸只给上限（`max-width` + `aspect-ratio`），不写死 px
2. 栅格一律 `minmax(0,1fr)`，裸 `1fr` 的最小值=最小内容宽，会把 390 顶到 414+
3. inline style 的栅格用属性选择器兜底：`[style*="grid-template-columns"]{grid-template-columns:minmax(0,1fr)!important}`

## 6. 验收：四道门，缺一道不算过

```bash
pnpm run lint                     # oxlint + 约定闸门 + 改动文件全规则
SKIP_INDEXNOW_CHECK=1 pnpm exec astro build   # 新 worktree 缺 gitignored 的 IndexNow key 时用这个
node ~/workspace/seo-station/gates/geo.mjs dist   # GEO：llms.txt Key facts / robots 不拦 AI / Content-Signal
python3 docs/design-v8/style_fp_check.py <1440 全页截图>   # 风格指纹（只对设计稿；生产页有广告位，仅参考）
```

再人工三项：**390 与 768 零横向溢出**（`document.documentElement.scrollWidth`）、`#play` 能开局能撤销、AdSense 160px 侧轨还在。

## 7. Git 与部署纪律（项目铁律，违反=线上整包回滚）

- worktree 建在仓库自己的 `.worktrees/` 下：`git -C ~/workspace/gridpaw worktree add ~/workspace/gridpaw/.worktrees/<slug> -b <branch>`
- 各会话只 commit/push 自己分支，**不 deploy**
- 部署只在 main worktree：`git merge` 所有在飞分支 → `pnpm run deploy:safe`（它会拦没合的分支）
- 新 worktree 要 `pnpm install`，且 `public/` 里 gitignored 的 IndexNow key、`llms.txt` 需从主 worktree 拷

## 8. GEO 骨架（2026-11-25 补齐，别再拆）

| 层 | 位置 | 判据 |
|---|---|---|
| `llms.txt` + `llms-full.txt` | `public/`（full 由 `scripts/gen-llms-full.mjs` 构建生成） | 必须有 `## Key facts` 段、≥1200B |
| JSON-LD | `src/components/SEOHead.astro` | FAQPage / WebApplication / Organization / Offer / BreadcrumbList |
| `robots.txt` | `public/robots.txt` | 点名 GPTBot/OAI-SearchBot/ChatGPT-User/ClaudeBot/PerplexityBot/Google-Extended/Applebot-Extended/Bingbot + `Content-Signal: search=yes, ai-input=yes, ai-train=no` |

`Content-Signal` 是策略声明（允许检索与引用、不允许训练）。改这行等于改对外政策，**要法老点头**，别自己动。
