# trickystorywalkthrough.com 拆解 + 我们三问结论（2026-11-24）

> 触发：法老三问（BP3 AI 引用谁靠前 / 竞品监控有没有抓到它做 BP / 它 R&E 有没有分流给我们）+ 追加拆解（编号体系、模板、抓取节奏、变现、站群指纹）。
> 数据口径：ChatGPT 引用 = GoAnyAPI chatgpt-scraper 18 问法（US/EN，web_search 开，2026-11-24 16:27-16:58，48 cr）；Google AI 概览 = goanyapi google-ai-overview 7 问法（21 cr）；我方流量 = GSC + pvuv；对方流量 = TabAPI(SimilarWeb) 月档 + webcafe 词库（top-100）。

## 1. AI 引用：分问法，不是一边倒

**ChatGPT（两批 18 问法，16 成功）**

| 问法 | 引用首位 | 我方 | 对方 |
|---|---|---|---|
| brain puzzle 3 level 45 answer | gridpaw（唯一） | #1 | — |
| how to beat brain puzzle 3 level 93 | gridpaw | #1 | — |
| brain puzzle 3 level 15 / 70 / 100 / 133 | gridpaw（各 1 条） | #1 | — |
| rooms and exits diy shop walkthrough | youtube → **gridpaw #2** | #2 | — |
| brain puzzle 3 crazy mind level 120 solution | **trickystory → levelsolve** | — | #1 |
| brain puzzle 3 level 30 solution | commonsensegamer / rgamereview | — | — |
| brain puzzle 3 level 150 / walkthrough all levels / halloween | levelsolve / rgamereview / shippobox | — | — |
| rooms and exits ch1 l15 / ch7 l1 / guest toilet / all chapters | rgamereview / lecoinsoluce / commonsensegamer | — | — |

→ **BP3 关号词：我们 6 : 0 压着他们**（level 120 是唯一例外）。R&E 词：双方都进不去，被 YouTube/rgamereview/commonsensegamer 拿走。

**Google AI 概览（另一张脸）**
- `rooms and exits walkthrough` → **trickystory #1**，我们不在
- `rooms and exits level 2 cabin` → **trickystory #1**（指向 rooms-exits-chapter-7-level-2），我们不在
- `brain puzzle 3 answers` / `crazy mind answers` → levelsolve #1，两家都不在
- `brain puzzle 3 level 45` / `level 120 solution` → **不触发 AI 概览**（feature_available=false）

**第一方**：pvuv 30d ChatGPT 引荐 1,060 clicks（BP3 551 / R&E 483 / 其余 26）；Perplexity 0。

⚠️ 前提：BP3 127 页今天（11-24）刚按游戏真实关号重排并已上线（线上 L120 标题已变 Boss Picks Pig），AI/搜索索引在换皮期，**2 周内复测才有定论**。

## 2. 竞品监控：能发现新游戏，发现不了扩关

- 11-08 加站（8,823 URL，只接 page-sitemap = 267 hub 页）
- 11-11 轮只记「最新页 11-06 BP3/Block Out」，判无事
- **11-18 顺手核才发现 186 关逐关一页**，`bp3-expansion-plan §1.3`「100 关/页、不可能比我们细」当场证伪
- 盲区根因：关卡帖全在 post-sitemap1..15，page-sitemap 只见 hub；`competitor_new_games.py` 只报新游戏 slug
- **待修：周更扫最新 post-sitemap chunk，只报「既有游戏关号上限变化」**

## 3. R&E：是加量不是分流

我方（11-07 起，61 关 + hub）：GSC 17d **274 clicks / 8,631 imp**（CTR 3.2%）；最近 4 天 203 clicks（≈50/天，11-20 峰值 66 clicks / 2,005 imp）；占全站点击 2.5%→5.0%；AI 渠道 30d 483 clicks。
对方：R&E 是基本盘（top-100 里 55 条、ETV 1,295 = 61%），词位 **39 平 / 14 升 / 4 降**（没在丢）；hub #4、`diy shop` #2、ch7 l1 #5+#9、cabin #8，且 hub/cabin 的 AI 概览都是 #1。
缺口：ch4-7 全缺（约 44 关）；ch3 L23-24 仍标 Coming soon；hub 文案还写「Chapter 3 being written… fourteen rooms coming soon」（已过时）。

## 4. 站点拆解

- **编号体系**：直接抄游戏内自然关号。BP3 hub 列 192 条链接到 L189，万圣节活动关单独一条线；R&E 用游戏自带 chapter-N-level-M（ch2 l11 = DIY Shop，与我方一致）。**它跟着游戏更新走，出新关就补一页**
- **页面模板**（L181 实测）：288 词 / 1,698 字符、2 图、1 个裸 YouTube iframe、25 内链；H1 `…- LEVEL 181`，H2 `<关名> Solution`；meta description 只有站名；ld+json 是 Yoast 标准套（Article+BreadcrumbList+Person）
- **发布节奏**：WP 批量灌，非日更。11-23 **306 篇**、11-21 29、11-16 81、11-14 217、11-11 90、10-28 328、10-27 164、6-01 456；中间有空档（11-17/18/19 零发布）
- **变现**：单 AdSense（`ca-pub-7033315463164992`），单页 5 个 `ins.adsbygoogle`；Site Kit 注入 `gtag GT-K8F6NFBQ`；无 Adsterra/Ezoic/Mediavine
- **技术指纹**：WordPress + Yoast + Google Site Kit 1.190.0；唯一作者 **Kamali**；外链只出 wordpress.org 与 **srinig.com**（唯一站群线头，待查）；CDN 是 hcdn，JS 挑战墙对 curl/Firecrawl/Googlebot UA/GPTBot UA 全 403，**只有真实浏览器能读**

## 5. 出词机会（它 top-100 词表聚簇 + SERP 实测）

| 词族 | 它家位次 | 量级 | SERP 盘面（2026-11-24 实测） | 值不值得跟 |
|---|---|---|---|---|
| **Color Block Jam** level 4xx | 13-15 | 1,300-1,900/词 | **前 8 全 YouTube/TikTok，零网页** | ✅ 最值：每关一页直接吃 |
| **Word Kitchen** answers | 7 | 4,400 | gameanswers #1、puzzlegamemaster #6，仅 2 个真站 | ✅ 值：量大且盘面薄 |
| **Fillwords** answers | **1** | 210+70 | 它 #1，其后全 YouTube/Reddit/TikTok | ⚠️ 已被占，抢需要更厚的全关索引 |
| **BP3** 关号词 | 1-2 | 1,920 | 我方 6:0 领先 | 继续守住 |
| **R&E** 房间/章节 | 1-4 | 17,870 | 它 hub+房间名占前 4，AI 概览也占 | 补 ch4-7 才谈得上抢 |
| Tricky Test / Tricky Story 2 | 2-7 | 260-1,300 | 品牌性强的游戏 | ❌ 不做（品牌词归意强，且不是我们的谜题线） |

## 6. 今日动作

- 立项 cron **`509135746bdd`「[GridPaw] 关卡补页流水线（BP3+R&E）」**，每天 10:00，每轮 2 BP3 + 1 R&E，契约 `research/2026-11-24-level-backfill-contract.md`
- 队列：`research/2026-11-24-bp3-backfill-queue.json`（55 关实缺 + 4 空号排除）、`research/2026-11-24-rxe-backfill-queue.json`
- **硬缺口**：L137-192 一张自有截图都没有；pgm 场景文本止于 169；tt_steps 止于 182 → 素材必须走 yt-dlp
