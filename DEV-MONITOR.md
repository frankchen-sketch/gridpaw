# 移动开发者监控名单

供给侧侦察真源：监控哪些移动开发者，谁的新游戏/新词可能成为 gridpaw 的承接机会。
配套：`NEWWORD-LEDGER.md`（词级台账）。收录标准见本文末尾。

## T1 — 现役监控（每款新游戏词族进量监控池，周核量）

| 开发者 | 代表作 | 收录证据 | 收录日 | 监控入口 |
|---|---|---|---|---|
| **Ecffri** | Arrows – Puzzle Escape（**100M+ 安装**，周更） | 品类反推发现：`arrows puzzle` 12 个月 170→5,400 单边爬升；100M 体量 = 全名单最大爆款制造机 | 2026-10-10 | 包名 `com.ecffri.*`；Play 搜索 arrows puzzle / arrows escape |
| **Oakever** | Meowdoku（1800 万装，搜索 60,500/月 仍在涨）➕ **Amaze GO!（同门箭头游戏，2/2026 上架，120M 装/近30天14M，2026-10-12 雷达发现）** | 唯一有「安装→搜索」转化实锤：meowdoku + help 词族 ~1,700/月成词；2026 年上新 10 款（9 月还在密集上：Hidden Fest 9/21、Pics Blast 9/12）；Amaze GO! 证明其在箭头品类复制爆款路径（amaze go 词族 0→6,600/月翻倍爬升中） | 2026-10-10（Amaze GO! 补记 2026-10-12） | AppBrain `/dev/Oakever+Games/`（⚠️ dev?id= 页被 CF 盾，slug 页可用）；包名 `com.oakever.*` |

## T2 — 观察名单（只看 riser 标记/上新，不进量监控池）

| 开发者 | 代表作 | 为什么只观察 | 收录日 |
|---|---|---|---|
| Nebula Studio | Mahjong Blast / No Wifi Games（各 1000 万+装） | 铺量快（年 11 款）品类对，但 **zoodoku 等全部品牌词搜索为 0**——安装→搜索转化未证明 | 2026-10-10 |
| Lessmore GmbH | Pocket Chess / Eatventure /（曾疑 Arrows 归属，实为 Ecffri） | 中厂多元品类，Arrows 误判已澄清；Pocket Chess 词族观察 | 2026-10-10 |
| Inspired Square FZE | X2 Blocks（数字方块系 10 款） | x2 blocks 仅 480/月平稳；数字方块品类跟 Kakuro 相邻 | 2026-10-10 |
| GamoVation | Tile Club / Mahjong Club / Sudoku | 老词盘玩家（tile club 6,600 平 + competition HIGH 95） | 2026-10-10 |
| Pixel Art (Yunbu) | Nonogram 系 7 款 | nonogram 赛道最挤，提示我们 Nonogram 词避开正面 | 2026-10-10 |

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
- **包名前缀 ≠ 开发者**：com.zm.* 实为 Tripledot；com.ecffri.arrows 一度被误判为 Lessmore。以 Play dev 页为准
- **规划师月度快照会骗「见顶」判断**：meowdoku 8 月快照 60,500 被判见顶，Trends 周度显示仍在涨（10 月趋势 99-100）。快照管存量、Trends 管方向，必须一起看
- ** SERP 弱占位的量化形态**（help 词）：YouTube×3-4 + Reddit×1 + 单篇博客 = 独立网页真空，弱占位者形态；主词（安装意图）则是 Play×3 + YouTube×3 的商店天下，不碰
- **whois 注册日期 = 竞争者进场探测器**：arrows-puzzle.com（6/8 注册）抢了 EMD 位，mobilepuzzlehelp.com（4/28 注册）在做 level 页——独立玩家已进场但远未饱和

## 历史背景

2026-10-10 品类反推首次实战（用户发起「从大品类游戏反推监控哪些移动开发者」）。同日发现 arrows puzzle（进 NEWWORD-LEDGER，已 deployed）。cron 新词雷达 job 1329cf1d31a5 **已恢复运行（2026-10-10 深夜用户决策，每 180 分钟一轮，prompt 含 T1 品牌词族监控）**；发现层三路：① 品类反推（本 SOP，供给侧）② 哥飞 web.cafe 数据服务（限免期内评估中，搜索侧）③ cron 雷达（每 3h 轮换词根扫描），**分工与互补关系以 `NEWWORD-LEDGER.md` 头部的「发现层分工」表为准**（兄弟会话在维护哥飞新词服务的记录侧，本档案管移动端供给侧，两侧词级产出统一落台账防重复挖）。
