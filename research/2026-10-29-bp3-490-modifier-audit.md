# BP3 490 词台账对照：未织入修饰词簇审计（2026-10-29）

数据源：`research/gsc-ga4-snapshot-2026-10-28.json`（gsc_query_gA 28d 2,093 行 + gsc_query_gB prior-28d）× 55 个 BP3 页面 TDK 全文对照。口径与 research/2026-10-26 的 490 词台账同源（28d 可见词内 BP3 相关词 = 本次实测 469 词 / 4,917 imp / 239 clk，差 21 词为可见性阈值差异）。

## 结论前置

| 簇 | 词数 | imp | clk | CTR | TDK 状态 | 动作 |
|---|---|---|---|---|---|---|
| help（题面词） | 91 | 1,201 | 98 | 8.2% | desc 织题面 ✓ | 引擎正常，不动 |
| crazy mind | 73 | 251 | 13 | 5.2% | 10-26/29 已织入 ✓ | 读数中（窗口 2-4 周） |
| answer | 46 | 238 | 19 | 8.0% | title 含 Answer ✓ | 不动 |
| **solution** | 32 | 152 | 7 | 4.6% | **55 页 TDK 零 solution ✗** | **真未织入簇，建议 11-01 决策窗拍板后织入** |
| cheats | 13 | 195 | 4 | 2.1% | — | **证伪**：主体是关卡名 Cheating Scene（题面词），真 cheat 修饰词≈0 |
| hints / walkthrough / tips / how-to / all levels | 0 | 0 | — | — | — | **BP3 词族零信号**（RR 的 hints 织入不适用 BP3，勿照搬） |
| no-mod（纯 level N / 纯题面） | 224 | 2,943 | 100 | 3.4% | 页面已覆盖 | 不动 |

## 发现一：solution 簇新成形（未织入，唯一真缺口）

- 32 词 152 imp，**prior-28d 除 daily akari solution 外全为 0**——10 月下旬新起量（"take off all the masks solution" 0→19、"bear attack solution" 0→14、"elevator arrest brain puzzle solution" 0→12）
- 55 页 TDK 零 "solution"（title 用 Answer，RR 线 desc 用了 solution 而 BP3 线没有）
- 词形 = 「题面 + solution」，题面已在 desc，差的只是 solution 修饰词本身
- **建议改法（method C 同款，desc 单侧）**：desc "answer:" → "answer and solution:"（零结构改动，title 不动防超长）。量级预期：5/天 imp 基数，CTR 增量小但零成本
- **为何不今天织**：Crazy Mind 批次 10-29 刚部署（3fcde9b），读数窗口 2-4 周在飞；再动 desc 叠加变量伤归因。挂 11-01 决策窗与 RR 止损门一起拍板

## 发现二：「织了但织歪」——精确短语匹配被破坏（比 solution 更疼）

题面词族 CTR 两极分化，根因是 desc 里的题面措辞与玩家真实 query 的**精确短语**不一致：

| 页 | desc 现状 | 玩家 query | 词族 28d | CTR |
|---|---|---|---|---|
| L21 (Cheating Scene) | "help the wife catch **the cheating scene**"（题面被关卡名缝合打断） | "help the wife catch **cheating**" | 123 imp | **0.0%** |
| L5 (Creepy Ferris) | "build an escape route out of the creepy **carnival**"（自述改写） | "get out of this **creepy place**" | 95 imp | **0.0%** |
| L51 (Bear Attack) | "escape the terrifying brown bear attack"（基本一致） | "bear attack" | 111 imp | 2.7% |
| L33 (waiters) | 题面精确一致 | "help waiters handle" | 372 imp | 11.3% ✓ |
| L17 (bride) | 题面精确一致 | "help the bride chase away" | 462 imp | 9.1% ✓ |
| L6 (bathroom) | 题面精确一致 | "help husband restore the bathroom" | 252 imp | 10.7% ✓ |

- 修法：L21/L5 desc 的题面措辞改回查询原短语（题面原文以视频/游戏内文本为准，**不改关卡名本身**，只调 desc 缝合方式）
- 与 solution 同批挂 11-01 拍板；两页体量小，归因污染可控（crazy mind 簇归因看 title 前缀词族，互不干扰）
- 教训：织题面进 desc 时必须用**查询短语原文**，不能用自述复述或关卡名缝合——题面词引擎的 CTR 全靠精确短语匹配

## 发现二补遗：55 页全量短语审计（10-29 晚，同日二次扫描）

把发现二的手工 9 词扩展为全量：55 页 task 短语 ↔ 469 BP3 query 全匹配（最长连续 token run + verbatim 检查），imp≥10 全查。结论修正：

**织歪真名单 = 3 页（不是 2 页）**，措辞错位合计 216 imp/28d：

| 页 | desc 题面 | 玩家 query | 断点 |
|---|---|---|---|
| L21 | "catch **the** cheating **scene**" | "catch cheating" | 关卡名缝合打断 |
| L5 | "creepy **carnival**" | "creepy **place**" | 自述改写 |
| **L3** 🆕 | "get the **magazine-cover** look" | "achieve that **magazine cover** look" | **连字符**断 verbatim 匹配 |

**排除名单（短语一致仍 0 clk = 排名/SERP 问题，措辞救不了）**：L47（query 与题面逐字一致仍 28 imp/0 clk，pos 6.1）、L51（run=4 verbatim 一致，pos 5.3-6.2）、L53（verbatim 前 3 词，pos 5.3）、L16 截短词 "head circumference"（pos 4.2）——共 ~73+89 imp，判例同 10-26「SERP 挤压不修清单」，等排名或 SERP 变化。

**11-01 拍板清单（修正版）**：
1. solution desc 织入（54 页批量，"answer:" → "answer and solution:"）
2. L21/L5/L3 **三页** desc 题面措辞修复（L3 改法："magazine-cover" → "magazine cover"，query 原文 "help her achieve that magazine cover look" 直接入 desc）
3. L21 附加观察："brain puzzle 3 cheating scene" 关卡名查询 71 imp 仅 1 clk——title/desc 都含关卡名仍低 CTR，疑 YouTube 挤压，修措辞时顺带观察不动结构

## 发现三（顺带核查）：题面词无「无页缺口」

6 个 ≥30 imp 的零点击题面词（creepy place 76 / wife catch cheating 37 / overcrowded 43 / dining misconduct 31 / bear attack 35 / magazine cover 32）**全部有页接住**（对应关卡页 body 或 hub 命中），无「题面词无对应页」缺口——BP3 覆盖率问题已清零，剩下的全是 CTR/排名问题。

## 德语二期初判（顺带，正式判断 11-16 窗口）

28d /de/ 全线 **21 imp / 0 clk / 均 pos 84**（一期 10 页 10-19 上线，窗口内仅 10 天在库）。"brain puzzle 3 lösungen" 仅 1 imp pos 84——不是词没量（9 月 KWP 590/月），是我们的页**还没进盘面**。当前不构成铺二期（+25 页）的理由；每周一盯守 cron（51503f262b99）持续读数，11-16 到 4 周窗时正式判定。

## 关联动作（本审计同日完成）

- 11-01 solver 决策门任务书补 RR 止损门节（原任务书无 RR，落空风险）
- cron 51503f262b99 建（每周一 09:30）：RR level-N 建页候选盯守 + 德语周读数
- public/llms-full.txt 生成（94 页 115KB，scripts/gen-llms-full.mjs）+ public/llms.txt 索引重写——BP3 55 关题面 + 全站 FAQ 进 GEO 资产；**未接 build 链**（package.json 被 PWA SW 会话占用），未部署（SW WIP 在飞），PWA 合入后接链随下次发布上线
