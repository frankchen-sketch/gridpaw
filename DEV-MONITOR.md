# 移动开发者监控名单

供给侧侦察真源：监控哪些移动开发者，谁的新游戏/新词可能成为 gridpaw 的承接机会。
配套：`NEWWORD-LEDGER.md`（词级台账）。收录标准见本文末尾。

## T1 — 现役监控（每款新游戏词族进量监控池，周核量）

| 开发者 | 代表作 | 收录证据 | 收录日 | 监控入口 |
|---|---|---|---|---|
| **Ecffri**（**Play dev 账号实证 = Lessmore GmbH**，og:title 2026-10-19 实测；Ecffri 系子品牌） | Arrows – Puzzle Escape（**100M+ 安装**，周更） | 品类反推发现：`arrows puzzle` 12 个月 170→5,400 单边爬升；100M 体量 = 全名单最大爆款制造机 | 2026-10-10（账号归属实证补记 2026-10-19） | 包名 `com.ecffri.*`；Play dev id `8964310704118504564`（该账号现 5 app：Eatventure/We Are Warriors/Forge Master/Arrows/Pocket Chess，2026-10-19 巡查全已知无新品）；Play 搜索 arrows puzzle / arrows escape |
| **Oakever** | Meowdoku（1800 万装，搜索 60,500/月 仍在涨）➕ **Amaze GO!（同门箭头游戏，2/2026 上架，120M 装/近30天14M，2026-10-12 雷达发现）** | 唯一有「安装→搜索」转化实锤：meowdoku + help 词族 ~1,700/月成词；2026 年上新 10 款（9 月还在密集上：Hidden Fest 9/21、Pics Blast 9/12）；Amaze GO! 证明其在箭头品类复制爆款路径（amaze go 词族 0→6,600/月翻倍爬升中） | 2026-10-10（Amaze GO! 补记 2026-10-12） | AppBrain `/dev/Oakever+Games/`（⚠️ dev?id= 页被 CF 盾，slug 页可用）；包名 `com.oakever.*`。⚠️ **多 dev 账号**（2026-10-19 巡查实证）：主账号（`?id=Oakever Games`）20 app 不含 Hidden Fest；Hidden Fest 曾挂第二账号 dev id `9154199097976797965`（og:title 同为 Oakever Games），**2026-10-26 巡查已不在该账号 dev 页**（本体仍存活：com.oakever.hiddenfest，发布 2026-08-26，Updated 10-21，疑挪第三账号）——巡查新品须查主账号 + 第二账号 + 直接盯 com.oakever.hiddenfest 本体页。⚠️ 巡查抓取：本机直连 Play 被 DNS 污染（HTTP 000），用 `curl -x http://127.0.0.1:7880`；**数字 dev id 用 `/store/apps/dev?id=` 形式（`/developer?id=` 404）**，名字型用 `/developer?id=`。⚠️ **Play dev 页只展示 20 个 app（1976 墙以外还有货）**：2026-11-09 实探发现 7 款在架 app 一个都不在 dev 页列表里——Amaze Clear 3D: Arrow Cube（`com.oakever.amaze3d`，10K+，iOS 10-30 上架）、Twindoku: Logic Game（`pairzzle`，5K+，iOS 09-24）、Molesweeper（`molesweeper`，5K+，iOS 07-29）、Light Up: Logic Puzzle（`akari`，10K+，iOS 07-15，**= Akari 同类，直撞 gridpaw 主场**）、Bubblepics（`bubblepics`，1M+，iOS 06-16）、Block Rush（`blockrush`，5M+，iOS 02-04）、Goods Blitz（`tidygoodshome`，100K+，iOS 01-16）；另有 Sort Streak（`sortparade`，100K+）在页上但历轮从未记名。**2026-11-10 又补两款 dev 页外货：Connect Tracks: Logic Puzzle（`com.oakever.traintrack`，iOS 08-13，Play **500K+ 装 / 1,531 评分 / 11-05 更新**＝在架货里体量第二，仅次于 Amaze GO）与 Colorever: Gem Art Puzzle（`com.oakever.gemcoloring`，04-20，7,258 评分）。Connect Tracks 是本名单第一次「供给侧发现 → 搜索侧成词」闭环：它把 `train track puzzle` 从 70/月抬到 **5,400/月（2026-09，KD 29.8，LOW）**，我站该族 GSC 28d 0 曝光。****全量新品探测器改用 iTunes Search API**：`curl "https://itunes.apple.com/search?term=Oakever&entity=software&country=us&limit=50"`（免费、无盾、带 releaseDate/sellerName，44 条里 ~25 条是 Oakever 自研），再对候选包名逐个 curl Play `details?id=` 探活拿安装量；dev 页巡查只是补充。⚠️ **Light Up 承接位基线（2026-11-09 GSC 28d 首测）**：`/akari/light-up-puzzle/` 76 imp / 1 clk / pos 10.4、`/akari/what-is-light-up/` 39 imp / 0 clk / pos 7.2，query `light up puzzle` 27 imp pos 10.8 —— **有页但只在第一页尾部**；若 com.oakever.akari 把 `light up puzzle`（09=720，avg 590）抬量，优先优化现有两页，不新建 |

## T2 — 观察名单（只看 riser 标记/上新，不进量监控池）

| 开发者 | 代表作 | 为什么只观察 | 收录日 |
|---|---|---|---|
| Nebula Studio | Mahjong Blast / No Wifi Games（各 1000 万+装） | 铺量快（年 11 款）品类对，但 **zoodoku 等全部品牌词搜索为 0**——安装→搜索转化未证明 | 2026-10-10 |
| Lessmore GmbH | Pocket Chess / Eatventure /（曾疑 Arrows 归属，实为 Ecffri） | 中厂多元品类，Arrows 误判已澄清；Pocket Chess 词族观察 | 2026-10-10 |
| Inspired Square FZE | X2 Blocks（数字方块系 10 款） | x2 blocks 仅 480/月平稳；数字方块品类跟 Kakuro 相邻 | 2026-10-10 |
| GamoVation | Tile Club / Mahjong Club / Sudoku | 老词盘玩家（tile club 6,600 平 + competition HIGH 95） | 2026-10-10 |
| Pixel Art (Yunbu) | Nonogram 系 7 款 | nonogram 赛道最挤，提示我们 Nonogram 词避开正面 | 2026-10-10 |

## 同型 web 站点 — 竞品站监控（2026-11-13 新增，与 app 开发者分开）

同赛道的「每日逻辑谜题 + 内容页」网站。为什么单列：它们直接抢 gridpaw 的关键词族，影响比 app 新品快，且不适用 app 的 5 条收录标准。

| 站点 | 注册 | 技术 / 规模 | 与 gridpaw 重叠 | 现状（2026-11-13 实测） | 监控动作 |
|---|---|---|---|---|---|
| **puzzledoku.com** | **2026-10-08**（RDAP；Cloudflare registrar） | Astro 静态站；sitemap **354 URL**；7 款游戏（Queens / Cat Queens / Arrows / Rotate Rings / Sliding Blocks / Train Tracks / Pixel Clearing）；EN + 繁中 + ES；每游戏 hub + daily 存档（18-31 页）+ levels（11 页）+ how-to-play / tips / solver / printable | **四族直撞**：arrows puzzle（47 URL）、queens/star battle、train tracks、meowdoku 品牌（`/queens-puzzle/games-like-meowdoku/`，2,640 词，title 直接写 "Meowdoku Online?"）；品牌截流页整套：zoodoku-alternative / games-like-linkedin-queens / games-like-connect-tracks / games-like-color-block-jam / games-like-pixel-flow / games-like-wordle | **DR 0.2**、月访问未量化（0）、**已收录**（site: 有 10+ 页）；正文 2,000-2,600 词；**无广告**（主打 free / no ads / no app）；train tracks solver 给「下一步 + 理由」 | 每月一次 `domain_overview`（2 分）看 visits；非 0 → `site_keywords` 看抢了哪些词 |
| **traintrackspuzzle.com** | **2026-10-03**（RDAP；NameCheap） | Next.js；sitemap **388 URL** = daily 240（60 天×4 语）+ guides 72（18×4）+ printable + solver（上限 9×9） | train tracks 单品类全覆盖 | DR **0.4**、月访问未量化（0）；sitemap 停 11-03、daily 只到 11-02（站正常运营，日页未进 sitemap） | 同上；它若起量 = train tracks 品类真能撑站，届时再评 |

**读法**：两站注册相隔 5 天，栈（Astro vs Next.js）与注册商（Cloudflare vs NameCheap）都不同 ⇒ **一周内两家独立团队进场，不是一人两站**——「每日谜题 + 程序化内容页」这个模型正在被复制。我方相对优势：14 款游戏、已有排名积累（meowdoku-guide 8,639 imp / 28d 是第一流量页）；相对劣势：无 es / 繁中版本，daily 存档与 levels 类程序化页规模小于它们。

**判据（写死）**：任一站 `visits` 非 0，或任一目标词（arrows puzzle / meowdoku / train tracks puzzle）进前 10 → 升级为实质威胁，重开「是否加页 / 加语言」议题；达标前不因竞品存在而改站。

### EMD 抢注层 — 品牌/品类直拼域名首页（2026-11-17 新增）

比「同型内容站」更硬的一层：**域名直拼目标词、首页承接**。哥飞方法论原话（knowledge_ask 2026-11-17，教程 2024-08-13）：「主关键词用域名首页来做，二级关键词用子目录来做」+「先找搜索量小、竞争度低的词做站」。**这类站不是竞品站，是「同一盘位的更优形态」——它们的 DR 往往很低但排在前十，因为 EMD 首页 = 全站权重聚焦在一个词上。**

实测谱系（2026-11-17，RDAP + TabAPI DR/traffic）：

| 域名 | 注册 | DR | 月访（2026-10） | 承接词 | 状态 |
|---|---|---|---|---|---|
| **meowdoku.app** | 2026-06-02 | **55** | **231,118**（4.1 页/访，跳出 47%） | `meowdoku` #1 / `cat sudoku` #1 / `cat sudoku online` #1 | 头部在位，五个月做到 23 万 |
| **meowdoku.org** | 2026-06-01 | 40 | **491,072**（2.3 页/访，跳出 55%） | `meowdoku` #1 / `cat sudoku` #8 | sitemap 349 URL，含 /ja /pt-br /zh-tw；写 fan-made / not affiliated，无授权痕迹 |
| meowdoku.games | —（RDAP 无 registration） | 6 | 3,407 | — | 有 /ko /es |
| meowdoku.us | 2026-08-03 | 0 | 458 | — | 有 /ru /pt |
| meowdoku.online | 2026-06-01 | 0 | **0**（9 月 604 → 归零） | — | **做废判例**：site: 仅 1 页，流量归零 |
| meowdokuonline.net | 2026-07-29 | 未测 | 未量化 | — | 在 `meowdoku online` 前 20 见到 |
| **catsudoku.org** | **2026-10-14** | 3.5 | 267 | `cat sudoku` | 一个月前抢注，site: 已收录 3 页（/ /how-to-play/ /games-like-cat-sudoku/） |
| **catsudoku.net** | **2026-11-15** | 未测 | 未测 | `cat sudoku` | **两天前刚抢注**，19KB 首页，title 直写 "Cat Sudoku: Play the Cat Logic Puzzle Free Online" |
| catsudoku.app | 2026-08-03 | 未测 | 无响应 | — | 已注未启用 |
| catsudoku.com | 2019-01-12 | — | — | — | 被无关站占（Sunrise Tornado），非赛道 |
| catsudoku.io / meowdokupuzzle.com | **未注册（RDAP 404，2026-11-17 实测）** | — | — | — | 仍空 |

**读法（写死）**：
1. **同一周双站开跑 = 团队行为不是偶然**：meowdoku.app 与 meowdoku.org 注册差 1 天、双双五个月做到 23 万 / 49 万月访。**「EMD 首页 + 内容站」在 meowdoku 系已被证明跑通**，不是理论。
2. **窗口按周计不按月计**：`cat sudoku` 词族的 EMD 在 2026-10-14（.org）与 2026-11-15（.net）两次被抢，间隔仅一个月。任何「先看看再说」在这个词族上等于放弃。
3. **我方形态劣势已定量**：`/meowdoku/` 是通用谜题站（整站 DR 4.5）的子目录，title/H1/H2/H3/FAQ 全部织入 `cat sudoku`（10-30 上线，线上 curl 逐条验到），但 GSC **90d 精确词 `cat sudoku` = 0 曝光**、词族全量仅 57 imp。**on-page 满分 + 排名为零 = 缺的是形态（域名首页）不是文案。**
4. **判据**：`cat sudoku` 词族是否开独立域名首页 = **战略决策（破「2027-01-04 前只巩固不扩张」战表），必须法老拍板**；本文件只记证据，不预设结论。可注册状态每月复核一次（RDAP 免费）。

#### ⚠️ 上条「缺的是形态」已被同站对照组修正（2026-11-17 20:00）

上一版把「子目录 vs 域名首页」当成主因。同站对照组（同一域名、同一 GSC 口径、28d exact query）证明**真闸门是整站权重，不是页面形态**：

| exact query | US 月量 | 我方落点 | pos |
|---|---|---|---|
| `takuzu` | 260 | `/binary/`（子目录） | **7.9** |
| `murder sudoku` | KWP 未覆盖（KD 44.7） | `/murdoku/`（子目录） | **8.6** |
| `binary puzzle` | 1,900 | `/binary/` | 22.2 |
| `nonogram` | 未实测（solver 族合并桶 2,400） | `/nonogram/` | 47.7 |
| `slitherlink` | — | `/slitherlink/` | 33.2 |
| `kakuro` | — | `/kakuro/` | 56.5 |
| `cat sudoku` | 6,600 | `/meowdoku/` | **0 行 0 曝光** |

⇒ **位次随词量单调走弱**：几百/月进前 10，1,900/月掉到 22 位，未实测量级的 4-6 词掉到 30-60 位，6,600/月直接零。子目录排 head 词是常态（`murder sudoku` 甚至在 murdoku.com DR45 首页眼皮底下坐 8.6）。**`cat sudoku` 特殊在 SERP 顶部被 meowdoku.app（DR56）/ meowdoku.org（DR39）两个「品牌名=关键词」的 5 个月 EMD 首页霸占**，属赛道占位，不是形态劣势。

**这条修正的实务含义**：开 catsudoku 新域名不等于「抢到就赢」——新域名起点 DR 0，与现有整站 DR 4.5 相比并不天然更优；meowdoku.app 五个月到 DR 56 靠的是持续内容+外链。B 方案真实工期 **3-6 个月**，不是按周计的窗口。EMD 被抢是事实，但抢到 ≠ 排上。

### heat 信号层 — 用库的 heat，不认 verdict（2026-11-17 新增）

**铁证：`krillion` 2026-10-02 进库时 `heat_ratio=75.8`（基准词 75 倍）、`page_count=7`，verdict 判「maybe/做内页」；11-08 反判「skip」；11-13 才升「worth/新站首页」——晚 6 周。** 同期 krillionanswers.com 已于 2026-08-13 注册、krillionguide.com 08-18，都比 verdict 转正早三个月。`krillion unlimited` 同样：10-07 heat 6、已做页 **0** 却判 maybe，11-14 才升 worth，晚 5 周。

**结论：`verdict` 滞后 5-10 周，只能当参考；点火器是 `heat_ratio` + `page_count`。**

krillion 词族 KWP 实测（US）：`krillion` 10 万-100 万（年同比 +99,900%）、`one in a krillion` 1 万-10 万、`krillion unlimited` 1 万-10 万（webcafe 精确 1,060,860）、`krillion answers` / `archive` / `sports` 各 1,000-1 万。词族合计 100 万-134 万/月，KD 29.1-36.1，**SERP 前 10 有 4 个 DR 3-10 的站**（browsergames.gg DR 3、onlineparty.games DR 7、wordleverse.net DR 9、minutecryptic.today DR 10）——位置对低权重站开放。

**但 krillion 本身不做**：9 个 .com 全部已建站（最早 8-13），krillionhints.com 已更新到 #188 期，10 个玩家每天更新，护城河是 archive 厚度。我方进场是第 11 个，不做。剩余空位仅 `krillionpuzzle.com` / `krillionunlimited.io` / `krillionanswers.io` / `krilliongame.io`。

**口径坑（一等）：`keyword_volume` 返回 null ≠ 无量，是快照库覆盖不到。** krillion / perceptle / footbillion 在 webcafe 全为 null，KWP 实测 krillion 是 10 万-100 万、perceptle 近三月 +9,900%（新词库还判过 skip）。批量查量必须夹带锚点词（`cat sudoku` 2,500 / `meowdoku` 1 万-10 万）验证口径，两源同桶才可用。

**已落地**：`~/workspace/tools/webcafe-data/scripts/heat_watch.py`（0 积分，3 条触发规则）+ 门铃 cron `1329cf1d31a5` v5（`0 8,20 * * *`，script 注入）。

**库的结构性偏斜（2026-11-17 20:00 全量复算实测，写死判据）**：全库 **16,742 词 / 408 批次**（webgame 5,296 / game 3,120 / ai 4,324 / other 3,340 / tool 662），按「heat≥3 且 page≤3」筛 `webgame` 只剩 **4 个**：`new england` 59.2 / `pumpkin patch` 47.0 / `halloween party` 40.8 / `halloween game` 13.4 —— **全部是季节或线下景点**（万圣节已过、new england 是本地农场页），一个都接不住。另有高频噪声型：`rob run` 10 月 140→**1,000**（7 倍跳变、heat 37）但 SERP 实测是 Steam extraction shooter（ZLaner / r/theburntpeanut / TikTok 全是 FPS），非谜题；`stratego game` 2,400/月但 **competitionIndex 76 HIGH**、12 个月横盘 1,300-2,900（1986 年老桌游，heat 3.85 只是季节回升）。

⇒ **判据：库的 `heat_ratio` 是「相对基准词 GPTs 的搜索热度」，不是「新词机会」。游戏类 heat 高分九成来自 AAA 新作 / 节令 / 线下实体，必须先过「品类贴谜题」+「SERP 可承接」两关，才轮到看量。** 所以 heat 表长期 0 候选是库的天花板，不是筛器漏筛——别为了凑产出放松门槛。

**判据首测（2026-11-13 20:00，TabAPI Google SERP country=us ×5 查询）**：`meowdoku` / `meowdoku tips` / `meowdoku hints` / `arrows puzzle` / `train tracks puzzle` 五个 SERP 的前 10 **均无 puzzledoku.com，也均无 traintrackspuzzle.com**（target-word 层未触发）。同测结论：meowdoku 族 SERP 是平台墙（meowdoku.org 占 2-3 席 + Reddit + YouTube×2-3 + FB + nairaland），**我方 exact `meowdoku` 仅 pos 14.6 / 0 点击**、流量来自 tips/策略长尾（`meowdoku tips` 1,229 imp / 42 clk / pos 8.5，query 维度 28d）⇒ 内容站打不进品牌头部，**不投品牌防御页**；竞品的 games-like-* 页同样没进榜 = 此路对内容站无效。下次复查：每月一次 visits（两站），SERP 只在「visits 非 0 或我方排名明显下滑」时再测。

## 霸主层 — 参照系（不监控，SERP 里打不过的对象）

- **Easybrain**（10 品类 29 席）：品类扫描占位第一，制造老词大盘
- **Tripledot**（Block Away 包名 com.zm 误归因教训：包名前缀 ≠ 开发者，必须 Play dev 页核实）
- NYT / Playrix / Wooga / Conceptis

## 黑名单 — 记录排除原因

| 开发者 | 排除原因 |
|---|---|
| Ivy（com.rioo.runnersubway，5 亿装跑酷厂） | ① 跑酷品类承接不了（gridpaw 是解谜站）② 5 亿装招牌品牌词 subway princess runner 一年跌 80%（3600→720）③ 上新慢。**「安装巨大→搜索为零/衰退」的反面教材** |

## 收录标准（5 条 + 一票否决）

1. **品类贴 gridpaw**：解谜/脑力/猫动物主题为主力
2. **年上新 ≥5 款**：快速试错 = 机会频率
3. **近 12 个月有「新词」进入规划师**（硬标准）：品牌词 0→非 0 或新游戏名成词——「安装→搜索」转化能力的直接证据。T1 准入证
4. **买量驱动**（riser 频繁）：搜索量靠投放点火
5. **名字可记忆性**：新游戏名可成词（短/独特/发音顺）
⛔ 一票否决：只吃老品类流量、招牌搜索在衰退（见 Ivy）

升降级：T2 任何游戏搜索量 0→非 0 → 升 T1；T1 连续 6 个月零命中 → 降 T2。

## 品类反推 SOP（每周一次，人肉/半自动，不做全自动 cron）

```
词根清单（当前 14 根）：
  高质量（噪音低）：cat puzzle / logic puzzle / brain teaser / block puzzle
  机制根：cross math / tile match / number puzzle / nonogram / sudoku variations / merge puzzle / sorting puzzle
  降权观察：jigsaw / slide puzzle / hidden object（杂讯多）
→ Play 搜索每词 top30（curl 可抓，服务端渲染；⚠️ 偶发 JS 渲染变体，details<3 时重试）
→ 包名前缀聚合占位密度 → ≥2 品类 = 常驻
→ 两层过滤：① ASO 魔改（一款 App 挤多品类）剔除 ② Play dev 页核实真身（包名会骗人）
→ 过 5 条标准 → 定级入库
```

实测数据（2026-10-10 首轮）：12 词根 360 款 App → 47 常驻 → 过滤后 5 候选 3 入库，噪音率 ~57%。
原始扫描数据：`~/.hermes/cache/scratch/recon/scan1.json`（scratch 24h 清理，需要留存就拷进仓库）。

## 关键教训（首实战认知修正记录）

- **安装量 ≠ 搜索量**：Ivy 5 亿装搜索衰退 80%，Nebula 1000 万装搜索为 0，Ecffri 100M 装才刚让品类词爬到 5,400/月。转化率不可假设，必须词级实测
- **同厂转化不外溢（Oakever 新品实证）**：Hidden Fest（2026-08-26 上架）/ Pics Blast（2026-09-12）上架 2-3 个月后，name + hints/answers/walkthrough/levels 共 10 词**全部 null**（2026-11-07 首查，`fromCache=false` 真新读）。同厂 Meowdoku/Amaze GO 有「安装→搜索」转化实锤，不代表每款都成词 → **新品不预建页**，等词族出现非零；T1 的价值是「等词出现」不是「提前押注」
- **dev 页是橱窗不是库存（2026-11-09 实锤）**：Oakever Play dev 页只列 20 个 app，7 款在架 app（含 **Light Up: Logic Puzzle** 这个 Akari 同类、Twindoku、Molesweeper、Sort Streak、Amaze Clear 3D）一个都不在列表里——连续 4 周「20 app 无新品」是结构性盲区，不是真无新品。**新品探测真源 = iTunes Search API 拿全量 + releaseDate，再按包名逐个 curl Play 探活**；dev 页只当交叉验证
- **包名前缀 ≠ 开发者**：com.zm.* 实为 Tripledot；com.ecffri.arrows 一度被误判为 Lessmore。以 Play dev 页为准
- **规划师月度快照会骗「见顶」判断**：meowdoku 8 月快照 60,500 被判见顶，Trends 周度显示仍在涨（10 月趋势 99-100）。快照管存量、Trends 管方向，必须一起看
- ** SERP 弱占位的量化形态**（help 词）：YouTube×3-4 + Reddit×1 + 单篇博客 = 独立网页真空，弱占位者形态；主词（安装意图）则是 Play×3 + YouTube×3 的商店天下，不碰
- **whois 注册日期 = 竞争者进场探测器**：arrows-puzzle.com（6/8 注册）抢了 EMD 位，mobilepuzzlehelp.com（4/28 注册）在做 level 页——独立玩家已进场但远未饱和

- **dev 页 20-app 上限＋名字型搜索双盲区，iTunes 全量是唯一可靠枚举（2026-11-10 第二次实证）**：Oakever 46 条搜索结果里 31 条自研，dev 页只列 20 条，漏掉的 Connect Tracks（500K+ 装）比 dev 页上多数 app 都大。**巡查纪律：每周一先跑 iTunes 全量按 releaseDate 排序看增量，再拿 dev 页交叉验证；三账号巡查只做兜底**。判断「有没有新品」不能只看「dev 页 20 个 app 没变」。

- **装机能抬品类词，不一定抬品牌词（Connect Tracks 2026-11-11 实证）**：`com.oakever.traintrack`（Play 500K+ 装、iOS 评分 1,538 且 +7/天）品牌词族 `connect tracks` / +game / +hints / +puzzle / +walkthrough **5 词全 null（`fromCache=false` 真新读）**，而同一台机器把品类词 `train track puzzle` 抬到 5,400/月 ⇒ **承接新品先打品类词，品牌词只在实测 0→非 0 后才建页**；T1 判据（name 族 0→非 0）不能被「装量大」替代。同期 Play `connect tracks puzzle` 搜索已出 5 款 train-tracks 专属 app（Oakever 500K+ / alexuvarov 10K+ / PuzzleMadness 1K+ / studio 1K+ / **Meow Tracks 1K+ 猫主题撞同赛道**），iOS 侧三款「Connect Tracks」撞名均晚于 08-13 上架 = 需求在变热，但 web solver 位仍空（11-11 早轮 SERP 实测）**——⚠️ 该句已被推翻**：11-12 换 `train track puzzle solver` 实测，traintrackspuzzle.com 排最前（见下条教训）

- **「SERP 真空」不能靠单 query 变体下结论（2026-11-12 实证，我自己报错被打回）**：11-11 用 `train tracks puzzle solver online free` 量前十、没见专用 solver 就写了「web solver 位真空」，11-12 换 `train track puzzle solver` 一搜 – traintrackspuzzle.com 排在最前：RDAP 注册 **2026-10-03**（40 天）、solver 明写兼容 Connect Tracks（4×4→9×9）+ 每日局 3 难度 + 18 篇 guides（含 `/guides/games-like-connect-tracks`）+ en/de/fr/es + App，一整套齐活。教训三条：① 判「真空」至少跑 **head 词 + solver 词** 两个变体（长尾变体前十完全不同）；② 出现的新域名一律走一次 **RDAP 看注册日**（免费，一秒出年龄）——40 天的站说明「窗口刚被人抢」，不是「没人做」；③ `domain_overview` 的 visits=0 只说明「没量化到流量」，不说明「没排名」，别拿它当排位证据。同轮还验到：DR 0.4 / 零流量 = **进场但未守**（窗口从「空的」改判「可抢但要在 4-8 周内到前 6」，参考 11-10 serp_review 给的「新站现实目标前 6 非前 3」）

- **品类词会随 App 成熟迁走（arrows 实证 2026-11-12）**：`arrows puzzle` 快照 07/08/09 连续三个月 5,400 持平（12 个月单边爬升终止）+ Trends 12m 峰值在 2026-05-10、近 13 周均值 26.8 vs 全段 40.6（-14%）、最新仅峰值 26% → 两源一致「见顶/回落」；同期同门品牌词 `amaze go` 近 13 周均值 51.8 = arrows 的 **1.93 倍**且仍在峰值 80% 以上。⇒ **T1 新品带起来的品类词，窗口在 App 增长期（约 6-9 个月），之后需求迁进品牌词**；内容页必须在品类词还在爬的时候就位，晚一年做的是「存量词」而不是「新词红利」

- **竞品覆盖度要从 sitemap 数 URL，导航条只是橱窗（2026-11-12 实证，同一竞品连续两天报错）**：traintrackspuzzle.com 顶部导航只有 Daily/Variants/Leaderboard/Guides/Get the app，我据此报「可打印 PDF 是他们没做的」；抓 sitemap 才发现 **388 URL** = daily 240（60 天×4 语）+ guides 72（18×4）+ 核心页，`/printable-train-tracks-puzzles`（title 明写 Free PDF Sheets with Answers，5×5/7×7/9×9、2-12 局、带 answer key、set 号可复现，de/fr/es 各一）与 6 步 step-by-step guide 全都在，只是没进顶部导航（挂在 footer 的 Tools 组）。⇒ **判竞品「有没有做 X」必须 `curl sitemap.xml` 按 path 数族**，再按需抓具体页；只看 nav/首屏等于只看橱窗。

- **品类词总量 ≠ 可承接意图，建 solver/内容页前先单量工具词本身（2026-11-12 实证）**：`train track puzzle` 5,400 + `train tracks puzzle` 1,900 看着是 7,300/月的可打盘子，但拆意图后：`train track puzzle solver` **10**、`train tracks puzzle solver` **10**、`train tracks solver` **10**、`connect tracks solver` **null**，`answers`/`hints`/`print` 全 **null**，只有 `train track puzzle online` 09=320 在爬（play 意图）。⇒ 这一族的量几乎全是「想玩」，solver 页需求侧不成立（差 3 个数量级）。**判据纪律：任何「做 solver 承接品类词」的提案，必须先量 solver 词本身的量；play 意图的盘子只能由可玩版本接**。

- **品牌词护城河会被「周边页」绕开（2026-11-13 实证）**：puzzledoku.com（注册 10-08）5 周建成 354 URL，用 `games-like-meowdoku` / `zoodoku-alternative` / `Train tracks app vs browser game` 三类页从外围截品牌词与 app 意图；文案 0 次提及 gridpaw ⇒ **判「是否抄我们」不能只比文案，要比游戏组合 + 页面结构重叠度**。监控同型站固定看三件：① 有没有针对我方品牌的 games-like / alternative 页；② 有没有 app-vs-browser 这类意图转换页；③ sitemap 页族增长速度。**同轮附一条自打脸**：核 SERP 意图别在 query 里带答案词——`"train tracks app" puzzle` 搜出全是谜题站、去掉 puzzle 全是火车追踪 App；带倾向词的搜索等于把结论喂回自己。

- **train track puzzle 线结案（2026-11-14）**：按 11-12 写死的判据 **dropped 执行**——可承接意图仅 ≈390/月（online 词），solver/answers/print 全 null 或 10/月；`train tracks app`/`train track game` 两个 1,300 分别是火车追踪器与玩具/模拟意图。**不建页、不再进量监控池**；Connect Tracks 品牌词族只留 0→非0 观察（重开条件见 NEWWORD-LEDGER dropped 行）。

- **装速是品牌词的前导指标，Play 装机桶 = 可零成本复测的仪器（2026-11-14 首建基线）**：Play details 页服务端渲染，`curl -s "https://play.google.com/store/apps/details?id=<pkg>&hl=en&gl=US"` 可直接读 installs 桶（5K+/10K+/50K+/100K+/500K+/1M+…）与 `Updated on` 日期，不需 API、不花 webcafe 积分（Google 域名须挂活代理，本机现为 **7882**）。桶粒度粗，但**跨越一档 = 显著加速**，且早于品牌词族成形 1-4 周。Oakever 7 包基线（2026-11-14，全部与 11-09 记录同桶 = 无加速）：Amaze Clear 3D `amaze3d` **10K+**（更新 11-13）/ Twindoku `pairzzle` **5K+**（10-13）/ Molesweeper `molesweeper` **5K+**（08-19）/ Light Up `akari` **10K+**（10-21）/ Sort Streak `sortparade` **100K+**（11-11）/ Connect Tracks `traintrack` **500K+**（11-12）/ Meowdoku `meowdoku` **10M+**（11-13）。用法：新品词族全 null 时先看装速动没动；动了就用**从未查过的新词**做真新读（新词天然绕开 14 天缓存）——这是缓存冻结窗口里唯一能拿到新鲜上游数据的路径。**2026-11-16 复测：7 包全部同桶零变化**（代理改 **33210**：Tiger 客户端接管系统代理后统一入口 `~/.hermes/scripts/proxy_env.py` 探 33210→7880→7882→7890，写死旧端口会 000）；唯一增量 = Amaze Clear 3D 当日更新。**「桶没跨档」不等于「没在长」**：桶粒度粗（10K+ 覆盖 10K-49K），Connect Tracks 500K+ 期间 iOS 评分每天 +7 就是桶内增长 —— 要看细粒度就盯 iOS 评分/评价数日增。

- **T1「代表作」必须按 sellerName 数全量，包名前缀会漏一半（2026-11-15 实证：Oakever 规模重估）**：iTunes `term=Oakever` 44 条里 **31 条 sellerName = OAKEVER GAMES PTE. LTD.**，但只有 15 条用 `com.oakever.*` 包名——其余 16 条挂 kidultlovin / vitastudio / banana / meevii / beetles / happy.paint / sonic.bubbleshoot / block.puzzle.sudoku 等老前缀（收购/换皮，含 Zen Word 50M+、Jigsawscapes 50M+、Solitaire 50M+、Sudoku 100M+）。Play 侧枚举真源 = dev 页 20 个 id（`/store/apps/developer?id=Oakever+Games` 名字型可用；数字型才用 `apps/dev?id=`）逐个 curl details 读 installs 桶。**实测规模：3×100M+（Amaze GO / Tile Explorer / Sudoku - Classic Sudoku Puzzle）/ 3×50M+（Zen Word / Jigsawscapes / Solitaire Classic）/ 7×10M+（Meowdoku / Jigsawcard / Paint by Number / Bible Word Puzzle / Match Busters 3D / Bubble Pop Dream / Block Sudoku Woody）**。⇒ Meowdoku 不是「小厂幸运单点」，它背后有 100M+ 数独与 100M+ 箭头两款交叉推广发动机（Sudoku 11-13、Amaze GO 11-12 仍在更新）。**判 meowdoku 增速延续性时先看这台发动机是否还在推（更新频率），而不是只盯词族数字。**

- **T1 组合会直接长进我站主场，品类核对应每月做一次（2026-11-15 首见 Killer Sudoku）**：`easy.killer.sudoku.puzzle.solver.free` = **Killer Sudoku - Sudoku Puzzles，Play 5M+ / iOS 26,691 评分 / 11-10 更新**，且**不在 dev 页 20 app 列表里**（off-page 第 8 例实证）。Killer Sudoku（数独 + 区域和）与 `/kakuro/`·`/kenken/`·murdoku 同族。词级实测：`killer sudoku` **US 40,500/mo、12 个月 40.5K–49.5K 横盘（无爬升）**、competition LOW(1)、CPC $3.55；`killer sudoku solver` **320/mo 横盘** ⇒ 按 11-12 判据（solver 意图 <1K 不做 solver/攻略页；play 意图才可能承接）**不建页**；play 意图词 `killer sudoku online` 因上游 500 未测到——**补测前任何「做 killer sudoku 页」提案不成立**。

## 历史背景

2026-10-10 品类反推首次实战（用户发起「从大品类游戏反推监控哪些移动开发者」）。同日发现 arrows puzzle（进 NEWWORD-LEDGER，已 deployed）。cron 新词雷达 job 1329cf1d31a5 **已恢复运行（2026-10-10 深夜用户决策，每 180 分钟一轮，prompt 含 T1 品牌词族监控）**；发现层三路：① 品类反推（本 SOP，供给侧）② 哥飞 web.cafe 数据服务（限免期内评估中，搜索侧）③ cron 雷达（每 3h 轮换词根扫描），**分工与互补关系以 `NEWWORD-LEDGER.md` 头部的「发现层分工」表为准**（兄弟会话在维护哥飞新词服务的记录侧，本档案管移动端供给侧，两侧词级产出统一落台账防重复挖）。
