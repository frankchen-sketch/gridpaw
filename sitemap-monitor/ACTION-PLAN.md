# GridPaw Sitemap 监控 → 行动计划（2026-10-19 首轮建账）

> 数据源：baseline-2026-10-19/（7 站 2,714 URL）+ crawl-2026-10-19/（7 站 × top25 新页 title/desc）
> 选站依据：`research/2026-09-20_要打的词SERP竞品盘面.md`（SERP 推导，剔平台/假竞品后全量探测 sitemap 可达性）
> 红线：**不建页、不部署、不发帖，只监控、落盘、通知**（同 hexa 实例）
> 状态表最近刷新：**2026-11-18 轮**（8 站 + 2 tricky 站，3,524 URL）；历史轮次见各 `digest-*.md`

## 监控集状态（首轮 init）

| 站 | URL 数 | 近 30d 新增 | 健康 | 对应作战地图线 | 备注 |
|---|---|---|---|---|---|
| hitoriconquest.com | 357 | +15（11-18 轮） | 🟢 活跃 | japanese logic puzzles | 新页全是 daily archive 机器页（噪音），盯是否上新游戏线；11-04 轮 +15、11-11 轮 +9、**11-18 轮 +15 = 5x5/8x8 #158-164 + weekly/24（连续第七轮纯 archive）**，无新游戏 slug |
| riddlesrush.com | 886 | 0（11-18 轮） | 🟡 URL-only | brain teasers for adults | 内容页 403 bot 墙，只能看 URL slug 判形态；slug 本身可读。10-28：+50 谜语模板 + 15 /es/ 西语分类页（locale 噪音级）；11-11 轮 +91（riddle 库 287→378）；**11-18 轮 0 新增，仅 `riddle-of-the-day` + `/archive` 两个翻页页 lastmod 刷新（11-10/09 → 11-13/12）= 噪音**；无 logic 类 slug 越界未触发。钱页加固动作见下方「2026-11-11 立项词词族测绘」 |
| logic-puzzles-online.com | 1,104 | **-10（11-18 轮）** | 🟢 | japanese logic puzzles / solver | **10-24 信号：批量铺 solver 工具页**（akari/hashi/masyu/nurikabe/slitherlink ×6 locale + printable str8ts ×8 locale，40 页/3 天）；DR9 排 kakuro solver #1 → solver 形态真金投票。10-28~11-11 四轮零新增。**11-18 轮真信号：suko 游戏线整体下线（10 个语种全 404、无 redirect）**，而 killer-sudoku 族 10 条仍在、tools/ 180 条 solver 矩阵全 200 → 单点砍 suko 非撤退。sitemap 以 `</urlset>` 正常收尾非截断 |
| shikaku.games | 332 | 0 | 🟡 停更 | shikaku puzzle/online/solver | sitemap lastmod 停在 2026-07-11（11-18 轮=停更 130 天）；dailyArchive 模板铺量页是噪音；恢复更新即盯 |
| puzzleplayground.com | 264 | 0 | 🟡 停更 | pictomino 侧 | lastmod 全停 2024-08，sitemap 不再更新，差集大概率常年 0——低成本留着 |
| shikakuofthe.day | 8 | 0（11-18 轮） | 🟢 | shikaku puzzle/online | sitemap 只列 8 页，覆盖极窄；11-18 轮 6/8 页 lastmod 刷到 11-17（站活着）但 URL 集未动（连续第四轮）；盘面定性=外链数据源非搜索标杆 |
| shikaku.ch | 7 | 0 | 🟢 | shikaku puzzle/online | 体验分垫底的第一反超目标；curl 本轮可达（9/20 曾被拦） |
| trickystorywalkthrough.com | 267 | +5（11-18 轮） | 🟢 活跃 | 手游攻略线（BP3 / bus-fever / foodie-pop） | **2026-11-08 加站**：8,823 URL，只接 `page-sitemap` = 267 个游戏 hub 页（148 个游戏基名）。11-18 轮 +5 = **既有游戏扩档非新游戏**（`competitor_new_games.py` 报新游戏 0）：Bus Fever Party 补到 L600、Foodie Pop 补到 Day 300。**⚠️ 采样盲区：page-sitemap 只见 +5，它这一周实际发 300 篇关卡帖（REST API 实测 11-14 单日 210）** |
| tricky-story.org | 299 | 0（11-08 建站 → 11-11/11-18 两轮 0） | 🟡 停更 | 手游攻略线（EMD，一关一页） | **2026-11-08 加站**：`/level/N` 一关一页 299 URL；连续两轮零铺页。监理它的关卡铺量速度=同类竞争者涌入信号 |

### 淘汰记录（探测过、不入集，勿重复探测）

| 站 | 淘汰理由 |
|---|---|
| dailyakari.com | SPA 无 sitemap（robots 未声明，常见路径全回 HTML 壳）。akari online #1 障碍站但**无法 sitemap 监控**，其动向改由月度 SERP 复查覆盖 |
| puzzle-light-up.com / puzzle-bridges.com / puzzle-shikaku.com / noq.solutions | 无 sitemap（robots 未声明 + 常见路径含 WP 路径全 404） |
| puzzleship.com | sitemap 路径 403 WAF |
| 剔除不探测：brainbashers / mindgames / solitaire.org / krazydad（平台聚合）、akari.store（电商假竞品）、walmart/chiark（非定制页）、学术页（非竞争） |

## 首轮形态判定（crawl-2026-10-19）

- **hitoriconquest 71 页/30d = daily archive 铺量**（5x5 #125-134、8x8、weekly 18x18 各日期页）——**lastmod 噪音，非词信号**。规则：同族 archive URL 增量直接忽略
- **riddlesrush 167 页/30d = 谜语模板族**（/riddles/{category} + 单谜语页）——brain teasers 侧真金投票，但它卡死的是 riddles 词族不是 brain teasers；**URL-only 盯它是否伸出 logic-puzzle 类 slug**
- **shikaku.ch 有一个值得记的内容动作**：`shikaku-vs-patches.html`（打 LinkedIn Patches 对比流量）——对比内容打邻近热点的打法样本，gridpaw compare 集群已止损，**只记不打**
- shikaku.games / puzzleplayground 停更：无信号

## 信号 → 行动对照（以后每周照此解读）

| 新增 URL 形态 | 判定 | 动作 |
|---|---|---|
| 竞品上新游戏类型页（新 puzzle 词 slug） | 真金投票 | 过四关（Trends/KWP/SERP/可满足性）再议建页，走 `seo-keyword-selection` |
| daily/archive/locale 机器页增量 | 噪音 | digest 记一行，不动作 |
| riddlesrush 出现 logic/akari/shikaku 类 slug | 越界信号 | 它卡 brain teasers 立项词，需 GSC 复查该词排名波动 |
| **既有页 lastmod 被刷新、且落在立项词钱页**（新 URL 差集看不见） | **防守动作，非新词信号** | 每轮补一步「同 URL 新旧 lastmod 比对」；URL-only 站只能记「钱页被刷新」不能记「改了什么词」 |
| **既有游戏扩档页**（`x-level-301-to-400-walkthrough` 这类 100 关/档） | **态度，非新词** | `competitor_new_games.py` 应报「新游戏 0」；按 etv/页 回测才知赚不赚，别按页数当机会 |
| **竞品下线整条游戏线**（全语种 URL 一起掉、实测 404 无 redirect） | **空窗信号**（与「领先者弃养」同类） | 先查它同期是否还活着（其它游戏族/工具族在不在）+ 我们有无对应引擎；无引擎=登记不动作 |
| shikaku.games 恢复更新 / puzzleplayground sitemap 复活 | 竞争回归 | 当周 digest 单列 |

## 2026-11-11 立项词词族测绘（riddlesrush，0 积分）

**触发**：11-11 轮 +91 新 URL + 16 老页 lastmod 刷新（3 张 adult 钱页 11-10 同日刷新）。

| 项 | GridPaw | riddlesrush |
|---|---|---|
| brain / adult 词族专页 | **1**（`/brain-teasers-for-adults/`，25 条清单页） | **37**（brain 17 + adult 23 去重）：`brain-teaser-riddles-for-adults`、`adult-brain-teaser-riddles`、`hard-brain-teasers-for-adults`、`brain-teasers` 枢纽页 |
| 谜语单条页 | 0 | 378（2026-10 建 121 + 2026-11 建 99 = 两个月新建 220，老底 158 无 lastmod） |
| 主题列表页 | 0 | 474（462 slug 含 riddles；2025-09 建 181、2025-10 建 145 → 停滞 → 2026-09 起 49+28+4） |
| 本轮动作 | — | 11-09 灌 46 页 riddle 单条页；11-10 刷新 `/blog/riddles-for-adults`、`/blog/challenging-riddles-for-adults`、`/blog/category/adult-riddles` + 首页/blog 入口/riddle-of-the-day |

**判定**：它在自家唯一立项词 `brain teasers for adults` 上**加码而非弃养**（前几轮「它只做 riddles 不算 brain teasers」= 只看新 URL 的错判）。它对游戏线零动作（无任何 logic puzzle slug）。
**动作（待法老决策，不在本 cron 权限内）**：① 先看我们 `/brain-teasers-for-adults/` 的 GSC 曝光/位次再定是否扩词族；② 若扩，走 brain teasers 子词（hard / with answers / for adults 变体）而非跟着建谜语库——474+378 是内容农场打法，与游戏站（引擎游戏+广告/PWA）定位不符；③ 四关走 `seo-keyword-selection`，不在此表算积分。
**状态**：已登记，待决策。

## 2026-11-18 BP3 覆盖差距实测（对手 186 关 vs 我们 137 关）

**触发**：11-18 轮 trickystory +5 全是 bus-fever/foodie-pop 扩档，顺手核 BP3 时实测出来的。

**`research/2026-11-08-bp3-expansion-plan.md §1.3` 的判断已被证伪**，原文：

> 它的打法固定为「100 关/页」…按此推演：它覆盖 L54-137 只需 1 页，**不可能比我们细**。

| 项 | trickystory | GridPaw |
|---|---|---|
| BP3 关卡页 | **186 关，一关一页**（`brain-puzzle-3-crazy-mind-level-N-solution`），L1-186 无缺口 | **L1-137**（EN 137 + DE 137 + PT-BR 30 = 304 URL） |
| 非关卡页 | 另有 `-solutions` hub、halloween、L150-153 语义 slug 变体，合计 198 篇 | `-answers` hub |
| 铺设节奏 | 138-186 那 49 关：7月 9 / 8月 8 / 9月 17 / 10月 8 / 11月 7，持续 5 个月 | L138 起 404 |
| 单页厚度 | L186 ≈ 569 词 / 2 图 / H1 错位 | L137 ≈ 1,292 词 / 6 图 |

**结论**：它不是粗粒度对手，**与我们同粒度、宽 49 关**。原计划基于「它只能 100 关/页」建立的时间窗假设要重算。

**动作：只登记，不动手**。① STATUS 2026-11-18 08:00 写死「恢复窗内不要做任何 SEO 变更，避免污染归因」（11-17 23:00 刚全量恢复，撤广告 vs core update 解除两因未分辨）；② L138+ 是内容生产决策，不在监控 cron 权限内。

**状态**：待法老决策。

## 2026-11-18 logic-puzzles-online 下线 suko（空窗候选，0 积分）

10 条全族消失，逐个实测 **404 无 redirect**：`/suko/` + `fr/es/de/it/pt/pl/nl/ja/zh-hant` 九语种。

**对照组证明它不是在撤退**：`killer-sudoku` 族 10 条仍在（五轮基线计数恒定）、`tools/` 180 条 solver 矩阵（17 solver × 10 locale）全 200 在线、`akari-solver`/`shikaku-solver` 各 10 locale 健在。→ **单点砍 suko，不是砍数独变体类，不是收缩。**

**判定**：一个游戏词族空出来（竞品主动放弃 = skill「领先者弃养自家资产」框架）。**但我们 11 款引擎里没有 killer/suko 类**（akari/shikaku/kakuro/nonogram/nurikabe/kenken/binary/star-battle/hashi/slitherlink/murdoku），要接得新建引擎——不是补页能解决的。

**动作**：登记待查，本轮 0 积分（0 新增游戏，按成本纪律不动 KWP）。要评估走 `seo-keyword-selection` 四关。

**状态**：待法老决策（低优先，先验成本高于收益）。

## 与作战地图的挂接

- 主攻三词 `akari online` + `japanese logic puzzles` + `light up puzzle`：盘中直接覆盖后两词的对手（logic-puzzles-online、hitoriconquest）；akari online 的 dailyakari 不可监控——**10/4 例行复查时补一次 SERP 目检即可，不为此建监控**
- 唯一立项词 `brain teasers for adults`：riddlesrush 是盘面最弱占位（DR10/体验分 14），它 URL 层动静每周看
- 外链清单（P1-1）：shikakuofthe.day 定性不变——外链数据源，监控集只看它有没有突然上新页

## 运行机制

- 采集：`~/.hermes/skills/seo/seo-keyword-selection/scripts/sitemap-monitor.py`（init/check/add）
- 内容爬取：`./crawl_round.py --dir <本目录> [--date] [-n 25]`（通用版，接任意实例目录）
  - ⚠️ 9 站 × 25 页会撞 420s 工具超时（11-11 实测：前 8 站落盘、第 9 站缓冲未 flush 全丢）→ 只抓指定站用 `./crawl_sites.py --dir <本目录> --sites a.com,b.com -n N [--timeout 12]`（逐条 flush）
- **每轮固定两步**：① 新 URL 差集（check）② 同 URL 新旧 lastmod 比对（免费，抓「老页被加强」——11-11 实锤：只做①会漏掉 riddlesrush 11-10 刷新 3 张 adult 钱页）
- 周报：cron `d78215faf122`（周三 08:30，错开 hexa 的周一 08:00）
- ⚠️ **采样盲区（2026-11-18 实测，必记）**：trickystory 只接 `page-sitemap`（148 个游戏 hub 页），关卡帖全在 `post-sitemap1..15`。**「它 +5」≠「它这周只做 5 页」——11-18 轮 page-sitemap 只见 +5，而 REST API 实测同期发了 300 篇**（11-11 38 / 11-12 9 / 11-13 33 / **11-14 210** / 11-16 10）。要判它的真实产量必须走 REST API（免费，`?per_page=100&page=N&orderby=date&order=desc`，X-WP-Total 给总数），别把 page-sitemap 差集当产量读数
- **别用它家 sitemap 判 BP3 覆盖度**：BP3 关卡页既不在 page-sitemap 也不依赖 lastmod（post-sitemap15 里 bus-fever 有 206 条）。查某游戏真实覆盖 = REST `?search=<game>` 全量拉 + 关卡号去重，或解析它的 `-solutions` hub 页链接
- 通知：本机无 ntfy-mac，走 `ssh frankchen@192.168.31.52 '/opt/homebrew/bin/ntfy-mac notify -t … -m … -p 4'`（exit 0 即送达）
- 每轮产物：`baseline-<date>/`（check --save 时）、`crawl-<date>/`、digest、本文件状态列更新
- ⚠️ **插查/加站建的新 baseline 也要写 digest + 回填本表**，否则中间那段差集被静默吞掉（11-08 加 2 个 tricky 站建了 baseline 但没写 digest，11-04→11-08 的 hitoriconquest +6 页就此丢失）
