# Krillion Answers — 数据管道与页面口径

面向后续维护者：这个板块怎么来的、数据从哪来、哪些坑已经踩过。

## 一句话

grepaw.com 的 `/krillion-answers/` 板块 = 第三方每日冷知识游戏 Krillion 的答案归档站。
每日 7 题、约 16 条/题的可得分答案、真实玩家数与稀有度档位，全部来自公开数据。

## 数据来源（双源分层，必须遵守）

| 用途 | 来源 | 说明 |
|---|---|---|
| 题面 / Dive 号 / reset 时间 | `https://krillion.io/api/today` | **官方公开端点，免费，第一手**。只给今日，无答案 |
| 答案 / 档位 / 玩家数 | `https://krillionunlimited.org/krillion-answers/<date>/` | 社区聚合站，整理官方 public reveal 数据 |

**官方把历史答案锁在 `/api/archive/<n>` 后面**（402 `{"error":"locked"}`，$5 一次性解锁）。
公开可得的历史答案只有聚合站这一路，所以答案是二次来源，页面对外如实标注（`answerSource` / `answerSourceNote` 字段）。

## 抓取

```bash
node scripts/krillion/fetch-dive.mjs                 # 抓今天
node scripts/krillion/fetch-dive.mjs --date 2026-11-20   # 抓指定日期
node scripts/krillion/fetch-dive.mjs --backfill 40       # 回填最近 40 天
```

产出：`src/data/krillion-dives/YYYY-MM-DD.json`（一天一个文件，入库）。

### 硬闸 1：题面对齐校验

今日数据同时拿官方题面和聚合站题面，**两边逐条比对，不一致就拒绝写文件**。
理由：聚合站归档滞后 1–2 天，题面错配会产出「A 日题面配 B 日答案」的垃圾页。

### 硬闸 2：假数据识别（2026-11-25 加，重要）

**聚合站对不存在的日期返回 HTTP 200 + 最新一天的内容**，题面与今日一字不差。
未加这道闸时，`--backfill 260` 骗进来 128 个假日期（156 个文件里只有 34 个是真的）。

现在用今日题面做指纹，**题面与今日完全一致 = 兜底内容，跳过不写**，输出 `⊘` 标记。

### 已知归档覆盖

真实归档起点 **2026-10-22**（此前日期一律返回兜底内容）。每天验证后这个数字会往前推。

## 页面结构

| 路径 | 文件 | 说明 |
|---|---|---|
| `/krillion-answers/` | `index.astro` | 今日页（最新一天），主排名页 |
| `/krillion-answers/<date>/` | `[date].astro` | 每日归档页 |
| `/krillion-answers/q/<slug>/` | `q/[slug].astro` | 每题独立页，长尾主力 |
| `/krillion-answers/archive/` | `archive.astro` | 全量归档索引 |

**当前规模**：34 天 × 7 题 = **238 个单题页 + 34 个日页 + 2 = 274 页**。

### Dive 号反推

官方 `/api/today` 给 `dayNumber`，但聚合站历史页不给。
官方每天一个 Dive，所以 `diveNo()`（`src/lib/krillion.ts`）从「已知号的那天」按 UTC 日期差反推。
例：11-24 = #132 → 11-20 = #128、10-22 = #99。反推不出来就返回 null，标题里退化掉（**绝不显示 `#null`**）。

### slug 生成

`q/[slug].astro` 的 URL 由题面 slugify 而来（去括号、去标点、截断 70 字符）。
**截断后必须再去一次尾部横线**——否则会出现 `...monthly-listeners-/`。

同一题面在多个 Dive 重复出现时，`getStaticPaths` 只保留最新那次（`allDives` 已是新→旧排序），避免 slug 冲突。

## SEO 骨架

- **TDK**：标题含 `Krillion Answers` + `Dive #N` + 日期；description ≤155 字符且带真实数字
- **Schema**：`BreadcrumbList` + `Article`（SEOHead 自动）+ 首页/单题页额外挂 `FAQPage`
- **内链**：今日页 ↔ 日页 ↔ 单题页 ↔ 归档，四向互链；单题页底部列同 Dive 其余 6 题
- **GEO**：首屏第一块是「可引用事实句」，所有数字由数据文件算出，不手写

## 广告口径

`/krillion-answers/**` **是内容页**，不在 `src/lib/ad-policy.ts` 的 `PLAY_SURFACES` / `PLAY_PREFIXES` 里
→ 自动广告（`SEOHead` 的 adsbygoogle loader）会加载，`InContentAd` / `SideAd` 也会渲染。

**如果将来要把这个板块改成零广告**，必须同时加进 `PLAY_PREFIXES`，否则 `check-play-surfaces.mjs` 会红。

## 导航登记（硬闸）

`/krillion-answers/` 已在 `src/components/GameNav.astro` 的 `guides` 数组里。
`check-nav-consistency.mjs` 会检查：**有动态路由（`[...].astro` / `[slug].astro`）的一级目录，其 hub 必须在 GameNav 里有入口**，否则构建失败。
新增这类板块时必须同步登记，豁免走脚本内 `DYNAMIC_SECTION_EXEMPT`。

## 每日更新

目前是手动跑：`node scripts/krillion/fetch-dive.mjs && pnpm run build && pnpm run deploy:safe`。
reset 时间是 05:00 UTC = **北京时间 13:00**，所以抓取应在 13:00 之后跑。
若要自动化，加一个 13:10 的 cron 即可（记得走 deploy:safe 的并发纪律）。

## 验证清单（改动后必跑）

```bash
pnpm run build                    # 含 check-nav-consistency / check-play-surfaces / check-indexnow-key
node scripts/check-nav-consistency.mjs
node scripts/check-play-surfaces.mjs
```

抽检三件事：
1. 日页标题**不能出现 `#null`** → `grep -rl "#null" dist/krillion-answers/`
2. 单题页 slug 尾部**不能有横线**
3. `ls src/data/krillion-dives/*.json | wc -l` 与 `find dist/krillion-answers -name index.html | wc -l` 对得上

## 已知坑汇总

| 坑 | 症状 | 处置 |
|---|---|---|
| 聚合站兜底内容 | 回填出一堆重复日期 | 已加指纹闸，见「硬闸 2」 |
| IndexNow key 不在 worktree | `pnpm run build` 报 check-indexnow-key FAILED | 从主 worktree `cp public/<key>.txt` 过来 |
| 历史数据无 Dive 号 | 标题 `Dive #null` | 用 `diveNo()` 反推，不要直接拼 `dive.dive` |
| slug 截断留横线 | URL `...listeners-/` | slugify 末尾再 `replace(/-+$/, '')` |
| 聚合站归档滞后 | 当日 URL 404 | 今日走聚合站主页，历史走归档 URL（脚本已分派） |
