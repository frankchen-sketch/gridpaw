# GridPaw Sitemap 监控 → 行动计划（2026-10-19 首轮建账）

> 数据源：baseline-2026-10-19/（7 站 2,714 URL）+ crawl-2026-10-19/（7 站 × top25 新页 title/desc）
> 选站依据：`research/2026-09-20_要打的词SERP竞品盘面.md`（SERP 推导，剔平台/假竞品后全量探测 sitemap 可达性）
> 红线：**不建页、不部署、不发帖，只监控、落盘、通知**（同 hexa 实例）

## 监控集状态（首轮 init）

| 站 | URL 数 | 近 30d 新增 | 健康 | 对应作战地图线 | 备注 |
|---|---|---|---|---|---|
| hitoriconquest.com | 342 | +9（11-11 轮） | 🟢 活跃 | japanese logic puzzles | 新页全是 daily archive 机器页（噪音），盯是否上新游戏线；11-04 轮 +15、**11-11 轮 +9 = 5x5/8x8 #154-157 + weekly/23（连续第六轮纯 archive）**，无新游戏 slug |
| riddlesrush.com | 886 | **+91（11-11 轮）** | 🟡 URL-only | brain teasers for adults | 内容页 403 bot 墙，只能看 URL slug 判形态；slug 本身可读。10-28：+50 谜语模板 + 15 /es/ 西语分类页（locale 噪音级）；**11-11 轮 +91 = 全部 `/riddles/<经典谜语原句>` 单条页（287→378，+32%），无 logic 类 slug 越界未触发；同轮 16 老页 lastmod 刷新（11-09 九张 /riddles/ 分类枢纽 + 11-10 含 3 张 adult 钱页）→ 见下方「2026-11-11 立项词词族测绘」** |
| logic-puzzles-online.com | 1,114 | +40（10-24 轮），10-28 / 11-04 / 11-11 轮 0 | 🟢 | japanese logic puzzles / solver | **10-24 信号：批量铺 solver 工具页**（akari/hashi/masyu/nurikabe/slitherlink ×6 locale + printable str8ts ×8 locale，40 页/3 天）；DR9 排 kakuro solver #1 → solver 形态真金投票，候选词过 KWP 后定承接；10-28 起连续三轮零新增（批铺后停手，观察期正常） |
| shikaku.games | 332 | 0 | 🟡 停更 | shikaku puzzle/online/solver | sitemap lastmod 停在 2026-07-11（11-11 轮=停更 123 天）；dailyArchive 模板铺量页是噪音；恢复更新即盯 |
| puzzleplayground.com | 264 | 0 | 🟡 停更 | pictomino 侧 | lastmod 全停 2024-08，sitemap 不再更新，差集大概率常年 0——低成本留着 |
| shikakuofthe.day | 8 | 0（11-11 轮） | 🟢 | shikaku puzzle/online | sitemap 只列 8 页，覆盖极窄；11-11 轮 6/8 页 lastmod 刷到 11-10（站活着）但 URL 集未动（连续第三轮）；盘面定性=外链数据源非搜索标杆 |
| shikaku.ch | 7 | 0 | 🟢 | shikaku puzzle/online | 体验分垫底的第一反超目标；curl 本轮可达（9/20 曾被拦） |
| trickystorywalkthrough.com | 262 | 0（11-08 建站 → 11-11 轮 0） | 🟢 活跃但未扩页 | 手游攻略线（brain-puzzle-3 / block-out 等） | **2026-11-08 加站**：8,823 URL 大站，只接 `page-sitemap` = 262 个游戏 hub 页（「它在铺哪个游戏」信号源）；最新页 11-06 = Brain Puzzle 3 Crazy Mind 更新 + Halloween answers + Block Out 900+/1101-1200；3 天零新增 |
| tricky-story.org | 299 | 0（11-08 建站 → 11-11 轮 0） | 🟡 停更 | 手游攻略线（EMD，一关一页） | **2026-11-08 加站**：`/level/N` 一关一页 299 URL；3 天零铺页。监理它的关卡铺量速度=同类竞争者涌入信号 |

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
- 通知：本机无 ntfy-mac，走 `ssh frankchen@192.168.31.52 '/opt/homebrew/bin/ntfy-mac notify -t … -m … -p 4'`（exit 0 即送达）
- 每轮产物：`baseline-<date>/`（check --save 时）、`crawl-<date>/`、digest、本文件状态列更新
- ⚠️ **插查/加站建的新 baseline 也要写 digest + 回填本表**，否则中间那段差集被静默吞掉（11-08 加 2 个 tricky 站建了 baseline 但没写 digest，11-04→11-08 的 hitoriconquest +6 页就此丢失）
