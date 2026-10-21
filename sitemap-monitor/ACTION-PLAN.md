# GridPaw Sitemap 监控 → 行动计划（2026-10-19 首轮建账）

> 数据源：baseline-2026-10-19/（7 站 2,714 URL）+ crawl-2026-10-19/（7 站 × top25 新页 title/desc）
> 选站依据：`research/2026-09-20_要打的词SERP竞品盘面.md`（SERP 推导，剔平台/假竞品后全量探测 sitemap 可达性）
> 红线：**不建页、不部署、不发帖，只监控、落盘、通知**（同 hexa 实例）

## 监控集状态（首轮 init）

| 站 | URL 数 | 近 30d 新增 | 健康 | 对应作战地图线 | 备注 |
|---|---|---|---|---|---|
| hitoriconquest.com | 297 | **71** | 🟢 活跃 | japanese logic puzzles | 新页全是 daily archive 机器页（噪音），盯是否上新游戏线；10-21 周检 +4 仍全 archive（#135-136） |
| riddlesrush.com | 732 | **167** | 🟡 URL-only | brain teasers for adults | 内容页 403 bot 墙，只能看 URL slug 判形态；slug 本身可读 |
| logic-puzzles-online.com | 1,074 | — | 🟢 | japanese logic puzzles / solver | 多语言数独矩阵（11 locale），无 lastmod，纯 URL 差集；新增 locale/新游戏族=信号 |
| shikaku.games | 332 | 0 | 🟡 停更 | shikaku puzzle/online/solver | sitemap lastmod 停在 2026-07-11；dailyArchive 模板铺量页是噪音；恢复更新即盯 |
| puzzleplayground.com | 264 | 0 | 🟡 停更 | pictomino 侧 | lastmod 全停 2024-08，sitemap 不再更新，差集大概率常年 0——低成本留着 |
| shikakuofthe.day | 8 | 6 | 🟢 | shikaku puzzle/online | sitemap 只列 8 页，覆盖极窄；盘面定性=外链数据源非搜索标杆 |
| shikaku.ch | 7 | 0 | 🟢 | shikaku puzzle/online | 体验分垫底的第一反超目标；curl 本轮可达（9/20 曾被拦） |

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
| shikaku.games 恢复更新 / puzzleplayground sitemap 复活 | 竞争回归 | 当周 digest 单列 |

## 与作战地图的挂接

- 主攻三词 `akari online` + `japanese logic puzzles` + `light up puzzle`：盘中直接覆盖后两词的对手（logic-puzzles-online、hitoriconquest）；akari online 的 dailyakari 不可监控——**10/4 例行复查时补一次 SERP 目检即可，不为此建监控**
- 唯一立项词 `brain teasers for adults`：riddlesrush 是盘面最弱占位（DR10/体验分 14），它 URL 层动静每周看
- 外链清单（P1-1）：shikakuofthe.day 定性不变——外链数据源，监控集只看它有没有突然上新页

## 运行机制

- 采集：`~/.hermes/skills/seo/seo-keyword-selection/scripts/sitemap-monitor.py`（init/check/add）
- 内容爬取：`./crawl_round.py --dir <本目录> [--date] [-n 25]`（通用版，接任意实例目录）
- 周报：cron `d78215faf122`（周三 08:30，错开 hexa 的周一 08:00）
- 每轮产物：`baseline-<date>/`（check --save 时）、`crawl-<date>/`、digest、本文件状态列更新
