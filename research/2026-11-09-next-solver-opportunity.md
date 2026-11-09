# 下一个 solver 的机会点（2026-11-09）

> 分支 `newsource`｜数据全部本轮实拉：
> - GSC `sc-domain:gridpaw.com`，页/词维度，窗口 2026-10-12 ~ 11-09（28 天），`dataState=all`
> - webcafe KWP（US，`fromCache=false`，2026-11-09）+ 哥飞版 KD + SERP review（关键词研究共花 15 积分）
> - 站点代码：`src/pages/{solver,akari/solver,hashi/solver,nonogram/solver}`、`src/lib/nonogram-engine.ts`、`src/lib/puzzle-core/calcudoku-engine.ts`

## 结论先行

1. **没有第 5 个「日式谜题求解器」值得做。** 全候选词族按 KWP 合并桶去重后总词量 ≈ **3,900/月**；除 nonogram/kenken 外，7 个引擎的 solver 词各只有 **10–70/月**。
2. **唯一够量的 nonogram 家族（2,400/月合并桶）我们已经有页面**，问题是它只排 head 词 pos 18.8 —— 机会是**修排名**，不是新建。
3. **唯一够量的新 solver = KenKen（720/月，KD 27）**，引擎已在 `calcudoku-engine.ts`（`solveBoard` / `countSolutions` / `hintLookup` 都有）→ 半天能出页；但词族 12 个月 -52% 且盘面 9/10 是专营页 → **顺手做，不立项**。
4. **真正的产品缺口在已上线页面里**：4 个 solver 页只有 nonogram 支持输入用户自己的盘面；`/solver/`（Shikaku，CTR 全站 solver 最高 13.2%）FAQ 明说「不能输入自己的盘面」，`/akari/solver/` 的 FAQ 直接把用户推荐去**别家站**拿 custom grid input。「X solver」这个意图 100% 是「解我这盘」——这是 solver 层 CTR 3.7%、D1 input-solve 0.33/天的结构性原因。
5. **如果目标是「有量的求解工具」，量级不在谜题引擎。** newsource 已定案的「游戏工具站」里，工具词 top20 有 15 个是游戏工具（bad time simulator 32.9 万 clicks/28d、pokemon team builder 12.5 万、minecraft enchantment calculator 12 万），是谜题 solver 天花板的 50–100 倍。站内已有一个「有排名没产品」的苗头：`arrows puzzle escape auto solver`（10 imp / pos 7.5 / 0 click，落在 walkthrough 页，页面不提供 solver），但 KWP 对该词是 null（<10/月）→ 需求未证实，先当观察项。

---

## 一、现状实测（28d，GSC page 维度）

**URL 含 `solver` 的 4 页 = 29 clicks / 579 impr**；把 how-to-solve 一起算的宽口径 **6 页 = 52 clicks / 1,403 impr = 全站 0.66%**。

| 页面 | clicks | impr | CTR | 均位 | 能不能解用户自己的盘面 |
|---|---:|---:|---:|---:|---|
| /akari/how-to-solve/ | 22 | 660 | 3.3% | 6.5 | —（教程） |
| /solver/（Shikaku） | 14 | 106 | **13.2%** | 4.8 | ❌ 只是游戏内 💡Hint 的说明页 |
| /nonogram/solver/ | 9 | 329 | 2.7% | 13.6 | ✅ 支持线索输入 + 逐步推导 + 分享永链 |
| /akari/solver/ | 3 | 57 | 5.3% | 3.8 | ❌ FAQ 把用户导向别家站 |
| /hashi/solver/ | 3 | 87 | 3.4% | 15.0 | ❌（同 /solver/ 模式） |
| /binary/how-to-solve/ | 1 | 164 | 0.6% | 7.1 | —（教程） |

> 口径差异：`2026-11-09-gridpaw-subscription-model.md` 记「20 solver 页 / 108 clicks / 1.4%」。本轮按 page URL 实拉只有 6 页 52 clicks（0.66%）——两次口径不同，**方向一致：solver 线 <1.5%**，但「20 页」这个数待复核。

**`/nonogram/solver/` 是这个月唯一在动的 solver 页**：曝光从 10 月下旬 6–16/天 涨到 11 月 4–6 日 **28/35/36/40/天**，均位从 25–32 爬到 9.1–11.7，**clicks 同期 = 0**。位置进了第一页、点击没进——先修 snippet，别急着改工具。

## 二、词量盘面（KWP US，按合并桶去重）

| 词 | 月均 | 12 个月方向 | 盘面 / 我们现状 | 判定 |
|---|---:|---|---|---|
| **nonogram solver** | 2,400 | 平（1,900–2,900） | head 词 pos 18.8（88 impr / 2 clk）；长尾变体已 pos 5–9 | **做（修排名）** |
| picross solver | 2,400 | 同一桶 | pos 31.2 | 同一页承接，不建新页 |
| griddlers solver | 2,400 | 同一桶 | pos 82.5 | 同上 |
| hanjie solver | 2,400 | 同一桶 | 无数据 | 同上 |
| **kenken solver** | 720 | **-52%（1,000→480）** | 无页；引擎现成 | 顺手做 |
| puzzle solver | 2,870 | 平 | 无页 | ❌ 全是 sliding puzzle（8/15-puzzle），非本品类，KD 60.7 |
| kakuro solver | 210 | 平 | 无页；引擎有 | ❌ dcode.fr(DR80+)/kakuro.com(DR54) 压着 |
| logic puzzle solver | 210 | 390→170 下行 | 无页 | ❌ 是 zebra 逻辑网格引擎，我们没有 |
| nonogram solver from image | 90 | 140→50 下行，**CPC $2.21** | pos 43 | 观察（唯一有商业出价的词，但要 CV） |
| shikaku solver | 70 | 平 | **pos 3.4（7 clk，全站最好）** | 已吃下 |
| star battle solver | 70 | 平 | 无页 | ❌ |
| slitherlink solver | 70 | 50–110 波动 | 无页 | ❌ |
| nurikabe solver | 50 | 平 | 无页 | ❌ |
| akari solver | 50 | 30–70 波动 | pos 7.0 | 已吃下 |
| nonogram solver from photo | 50 | 40–110 | pos 17 | 观察（同上） |
| nonogram solver step by step | 40 | 30–70 | **pos 8.3** | 已在承接 |
| hashi / hashiwokakero solver | 30 / 30 | 平 | pos 11.2 | 已吃下 |
| color nonogram solver | 20 | 10–50 | pos 23 | ❌ |
| takuzu / light up / nanogram solver | 10 / 10 / 10 | 平 | — | ❌ |
| arrows puzzle escape solver | **null** | — | **pos 7.5（10 impr）但我们没这个产品** | 观察项 |
| brain puzzle 3 solver | **null** | — | — | 观察项 |

**⚠️ 合并组陷阱**：nonogram / picross / griddlers / hanjie 四个词的逐月数值逐位一致（序列只是错一个月）→ 是 KWP 的**同一个合并桶 2,400**，四个词相加 = 9,600 是虚账。整个 nonogram 家族的可打盘就是 2,400/月。

**算术天花板**：全家桶去重后 ≈ 3,900/月。即使全部拿第一（CTR 30% 上限）≈ 1,170 visits/月；现实一点拿 pos 5（CTR 6%）≈ 230 visits/月。对照全站 GSC 28d 7,838 clicks：**solver 线做到极致也 <10% 全站**。

## 三、盘面（SERP review 实测）

**nonogram solver（KD 33.7 / 常规 37.5）**
- 10 位里 4 个平台固定位（reddit / youtube / play.google / github），可竞争位 6 个。
- #1 fedimser.github.io（DR94，此词是它主力词）、#3 peter.com.au（DR24，**停留 7s / 跳出 45% / 1.4 页 = 组内行为垫底**）、#4 logic-puzzles-online.com（**DR4 / 6 个月新站**）、#7 rosettacode（DR74）、#8 upc.edu（DR83）、#9 chatgpt。
- **#4 是新站 + #3 行为垫底 = 页面匹配盘可进的活证据**；现实目标是 pos 5–7，不是 #1。
- related 列表 = 功能积压：`online` / `from photo` / `step by step` / `AI` / `free` / `app` / `color` / `multicolor`（我们已有 step by step，缺 from photo / color）。

**kenken solver（KD 27）**
- 9/10 是为此词做的专营页 → 正面红海；但 #2 brucerabe.com（**DR0，4s / 94% 跳出**）、#5 kenken.gg（**DR0 首页**）在前排 = 门槛不高。
- #4 kenkenpuzzle.com 首页 65.2 万访问，是这个盘的真天花板。
- related：`3x3` / `4x4` / `online` / `camera` / `app` / `ai` / `6x6`（camera 是同一个「拍图求解」缺口）。

## 四、机会点排序（按每工时预期 clicks）

| # | 动作 | 成本 | 预期 | 依据 |
|---|---|---|---:|---|
| 1 | **`/nonogram/solver/` 头部爬位**：① snippet 重写（把「粘贴线索 → 完整解 + 逐步推导，免注册」摆前）② 内链锚文本集中到这只页（现在只有 GameNav 模板 + SolverTiles + `/nonogram/` 一条 CTA，没有内容页正文锚）③ 补 H2 吃 `online` / `checker` / `helper` 变体 | 0.5 天 | +90–140 clicks/月 | head 18.8 但长尾已 5–9；#4 是 DR4 新站 |
| 2 | **KenKen solver 新页**（复用 `calcudoku-engine` 的 solveBoard + hintLookup，一次给一步，和 `/solver/` 同 UX） | 0.5–1 天 | +25–45 clicks/月 | 720/月，KD 27，引擎零边际成本 |
| 3 | **solver 页支持自定义盘面**（Shikaku → Akari；`/solver/` FAQ 现在写死「Not yet」，`/akari/solver/` 还外推竞品） | 1–2 天 | SEO <30 clicks/月 | 价值不在词量，在「工具可信 + 未来做留存/付费的地基」；**建议等 #1 验证后再决定** |
| — | **不做**：kakuro / star battle / slitherlink / nurikabe / akari / hashi / takuzu / light up / color / nanogram 各 10–210/月；`puzzle solver` 2,870 但是 sliding puzzle 盘；`nonogram solver from image` 90/月要 CV，成本对不上收益 | — | — | — |

**战略提醒（这才是「下一个机会」的答案）**：谜题 solver 是**一次性需求 + 小词量**，天花板 230–1,170 visits/月，且和 newsource 已判死的「订阅」假设同源。有量的「求解」需求长在两处：
- **站内已证**：BP3 的 `help them solve their problems` 词族（85 + 71 + 41 impr，pos 4.6–5.9）+ `how to solve this level`（15 impr，pos 1.7）——「帮我解这一关」才是我们的真需求，而它靠**关卡页**承接，不靠引擎 solver。
- **newsource 已证**：新游戏工具站（timer / calculator / map / database），工具词 10–33 万 clicks/28d、站数 1–4 未饱和。

## 五、可证伪判据

- **#1**：4 周后（12-07 读数）head 词 `nonogram solver` 均位 ≤10，页面 clicks ≥40/28d。两条都不动 → 判为权重盘，停投，不再加内链。
- **#2**：上线 4 周 `kenken solver` 均位 ≤12 + clicks ≥15/28d；不达 → 说明「引擎现成」不等于「能排」，solver 线整体关闭。
- **arrows auto solver 观察项**：4 周内该 query 曝光 ≥50 且出现 ≥3 个变体（`... solver` / `... auto` / `... hack`）→ 才立项做游戏专用求解器；否则永久关闭。

## 六、口径与未验证

1. KWP 是 14 天缓存桶值（本轮 `fromCache=false` 为新读），量级判断可用，**定案量级仍需真 KWP 一手**。
2. GSC query 维度被匿名化低估，page 维度才是真数；均位是曝光加权，不是实时位次。
3. SERP review 的 DR/流量/行为分是 webcafe 快照口径，不是 Ahrefs 实时；#3/#4 的可打性要用 tabapi 复验一次再动工。
4. `arrows puzzle escape auto solver` 与 `brain puzzle 3 solver` 的 KWP 为 null = 低于规划师阈值，**不等于零需求**（GSC 有 10 impr 在 pos 7.5）。
5. 本次未验证：德语/葡语 solver 词（站内有 `/de/`、`/pt-br/` 先例，但量未查）；`nonogram solver from photo` 的真实解锁成本（CV/OCR 方案成本）。
