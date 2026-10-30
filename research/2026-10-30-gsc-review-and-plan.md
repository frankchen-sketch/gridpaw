# GSC/GA4 复查与优化计划（2026-10-30）

> 数据源：GSC API（sc-domain:gridpaw.com，furriq-daily-brief key，完整日止 10-29）+ GA4 runReport（552793510，止 10-29）。
> 原始快照：`research/gsc-ga4-snapshot-2026-10-30.json`（28d+prev28 page/query/GA4 行 + 四周簇趋势）。
> 前链：`research/2026-10-26-gsc-change-week-review.md`（PRE/POST ×6.3 读数）→ 本轮为 10-24/25 批次（RR、solver、76 页加深、loop TDK）的首个可判窗口。

## 一句话

全站第四周继续放大（周 imp 1,851→35,791 ×19，GA4 410 会话/天，engaged 46% 不稀释）；BP3 题面词引擎+crazy mind 织入兑现；RR 止损门 GSC 口径过线；loop 的 answers/hints 承接位起飞、puzzle 页成品牌词海绵。坏消息集中在「首页搜索存在感躺平」和「外部新词情报三路零信号」。

## 好趋势（可加码）

| # | 信号 | 读数 | 判定 |
|---|---|---|---|
| G1 | 全站爬坡 | 周 imp 1,851→2,842→12,955→35,791；CTR 1.6%→4.6%；GA4 54→410 会话/天 | 主曲线健康，量价齐升 |
| G2 | BP3 题面词引擎 | 247 词 / 4,665 imp / 238 clk / **CTR 5.1%** / pos 4.5；top 词 5-30 clk | 已验证新词引擎，供给侧（新关卡页）继续 |
| G3 | crazy mind 织入 | 138 行 / 574 imp / 36 clk / **CTR 6.3%** > 簇均 5.4% | 10-26 TDK 织入战术兑现，**打法可复用** |
| G4 | meowdoku 第二引擎 | 3,473 imp / 103 clk / pos 8.5；`meowdoku tips` 151/11/8.7 | 10-21 Cheat Sheet 修复兑现，稳定二号线 |
| G5 | RR 止损门 | L32 页级 pos **4.6**（10-28 峰 21 imp/日），簇 60 imp/日平台 | GSC 口径过 #6 门 → 按需扩张维持，tabapi 口径 #8 待织入显效 |
| G6 | loop answers/hints 承接 | past-answers CTR **8.4%**、日 clk 8→12→18→21→20→23 爬升、pos 5.4；hints 页已索引 CTR 5.9% | 门 A ✓，日更意图是真爱 |
| G7 | akari / jlp 修复兑现 | akari 2,490 imp/56 clk（×4）；jlp pos 12.2→8.1、imp ×13 | 10-21 修复批全部生效 |
| G8 | arrows 簇稳盘 | 1,778 imp / 27 clk / pos 6.9 | 不动 |
| G9 | 首页 CTR 质量 | 本周 78 imp/11 clk = 6.9% | 质量不差，问题在量（见 B1） |

## 坏趋势（需处置）

| # | 信号 | 读数 | 定性 |
|---|---|---|---|
| B1 | 首页 GA4 躺平 | GSC 搜索曝光 ×2.4 但 GA4 landing 354→374（+6%）；周线 133→70→37→78 | 首页搜索承接弱；词=`shikaku online` 75 imp pos 7.8 **0 clk** 为主 |
| B2 | loop puzzle 品牌词海绵 | 4,603 imp/14 clk 本周（CTR 0.3%）；~2,700 imp=Britannica 品牌词全 0 点击 | 结构性：被官方 #1 截流，非文案问题（10-24 TDK 改版已验证救不回）；可接意图已在 past-answers/hints 兑现 |
| B3 | RR 簇走平 | 16→46→60→57→63→24 imp/日，未 2x；tabapi 口径 L32 仍 #8 | OR 门过线但增长不动；织入 10-29 刚部署，显效窗 11-05~12 |
| B4 | 外部新词三路零信号 | T1 词族 37 轮零（web.cafe 快照停 2026-08，09 月数据 38 轮未出）；Bot·X 36 信号 0 命中；sitemap 竞品仅 riddlesrush 西语 locale 线 | **增量全靠内部引擎（BP3 题面词），外部情报暂时无弹药**；新词发现=下一轮（监控 cron 现役不停） |
| B5 | takuzu / kakuro / kenken / nurikabe | 291 imp/0 clk；pos 26-50 | 已判不修，维持 |
| B6 | murdoku 周线回落 | 236→113 imp/周（28d 219 imp/13 clk，词= murder sudoku online 52/3 + murdoku online 49/7） | 小盘子 SERP shuffle 特征，监控不修 |
| B7 | 10-29 全站 dip | imp 7,125→5,661（BP3/RR 同步回落） | 疑滞后日，11-01 读数窗确认 |
| B8 | BP3 单点依赖 | 本周 imp 66% 来自 BP3 簇（第三方游戏词） | 风险项：官方改名/下架/版权动作=簇全灭；对冲=内部引擎 + meowdoku 二号线 |

## 优化计划（按 ROI 排，含明确「不做」清单）

### P0 本周（低成本、窗口已在路上）

1. **首页 `shikaku online` 接住**（B1）：desc 按 CTR 纪律重写（直接给答案：免费在线玩+每日关+无需注册口径），title 不动（主排名页慎动）。预期 pos 7.8→5-6、CTR 0→5%+，量级 ~75 imp/28d 起步。⚠️ 首页 TDK 改动单独 curl 验证 + IndexNow。
2. **loop puzzle 页内链重定向**（B2）：首屏加「Today's answers →」快捷链到 /the-loop-hints/（TDK 不再 churn——10-24 改版结论=曝光结构问题文案救不回）。11-04 定案门按 C 门（词盘子健康）+ 转移判定走。
3. **RR 织入 SERP 复测排期 11-05~12**（B3）：tabapi 复测 L32 位次 + 簇日趋势；仍 #8 且簇走平 → 按 10-29 止损门冻结扩张、火力回 BP3。

### P1 高价值（11-04 对账后决定）

4. **meowdoku-guide 收尾判断**（G4）：pos 8.5 已进前 10 边缘；11-04 对账（jlp/meowdoku 修复观察窗）若 pos 进 ≤7 → 考虑向 `meowdoku tips/levels` 词族微扩内容；pos 不动则维持。
5. **BP3 供给侧节奏**（G2/G3）：新关卡页沿用已验证 TDK 模板（题面内嵌已实锤）；crazy mind 织入打法在新批次继续（已验证 CTR +0.9pp）。
6. **11-01 solver tier-2 门**顺带读 nonogram solver tool_action + RR 簇趋势（既有 cron）。

### P2 明确不做（防 churn）

- takuzu 不立项（291 imp/0 clk 天花板可见）
- kakuro / kenken / nurikabe TDK 不修（pos 26-50，词盘子不值）
- murdoku 不修（周线回落=shuffle，无动作价值）
- meowdoku online（pos 20.3）不追（page 2-3 低量级）
- loop 品牌词不再投入任何文案
- 新词发现**下一轮**：T1 cron 每日两轮 / sitemap 周三 / Bot·X 照常；web.cafe 09 月快照出线即重估 T1 词族（amaze go help 词族是头号等号线）

### 风险看板

- B8 BP3 依赖 66%：对冲动作=已有（meowdoku 二号线 + 内部题面词引擎）；不做预防性铺页
- B7 10-29 dip：11-01 读数窗确认，暂不动
- 本轮 GA4/GSC 均含自测+bot 未清洗（口径与 10-26 复盘一致，趋势可比）

## 2026-10-30 晚补：cat sudoku 立项评估与织入（已执行）

**四关数据**：KWP 最新月 ~6K（10 月，1,900→3,600→4,400→5,400→6K 斜率未停；12 月均值 1,300 被早期 0 月拖低勿用）；web.cafe KD 49.9（进前十中值 85 域）；自家 dofollow RD ~43；盘面 #1=meowdoku.app（DR58/域龄 5 个月/518RD/22.2 万月流量，单页双词先例）。**判定：不独立立项（桶低 KDROI 20），单页织入**。拼写变体（cat sodoku/catsudoku/kitty sudoku）KWP 全 null 不做；`meowdoku daily answer` 未成形 → loop playbook 不复制，该线关闭。

**已上线**（89e21ce 织入 + a6959ac 攻略节 + 6a97989 内链）：/meowdoku/ title/desc/H1/lede/FAQ 织入 cat sudoku + 攻略节（How-to 规则 H2 + 六技巧 + hints/answers H3 保险位，Level 1 teaser 对账 meowdoku-levels.json，完整推导留 levels/1 防 dup）；guide→play 2 条内容内链（此前为 0，play 页 pos 18.3 饿死主因）。三页分工防内耗：/meowdoku/=cat sudoku 族 · guide=meowdoku 品牌攻略族 · levels/=meowdoku level N 族。

**触发器（进 11 月监控轮）**：
- cat sudoku 月量破 10K 或 /meowdoku/ pos ≤15 → 独立 /cat-sudoku/ 页议题重开（先过哥飞）
- meowdoku hints（170）/answers（210）承接验证归 12-01 窗：看 GSC 两词 imp 是否落 guide 页；`cat sudoku hints/answers` KWP 未进表（<10 真空），H3 已占位等词来
- meowdoku level-answers 线维持关闭：词族 61 imp/月，零星不预铺

