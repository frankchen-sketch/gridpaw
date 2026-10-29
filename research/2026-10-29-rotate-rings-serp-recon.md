# Rotate Rings SERP 侦察 + BP3 模式复刻（2026-10-29）

数据源：tabapi SERP ×8 词（US，经 7891 端口——7880/7890 对 tabapi.com/treg.to SSL EOF）、web.cafe KD/趋势/domain_overview（16 credits）、GSC 快照 2026-10-28。SERP 快照目录 `~/.hermes/cache/scratch/rr-serp/`（24h 清理，本文已存档结论）。

## 一、SERP 竞态：谁在做 hints/answers

**三家专站 + 一个 Q&A 站，全部新站，全部 DR 0：**

| 站 | 注册 | DR | 关卡页数 | 语言 | 排名位 | 内容成色（抽验） |
|---|---|---|---|---|---|---|
| rotate-rings.com | **2026-10-03**（26 天前） | 0 | 101（L1-100）×3 语言 = ~300 页 | en/ja/zh-Hant | hints #1 / answers #1 / guide #1 / walkthrough #2 | 2,118 词/页 + 13 图 + board A-H 变体匹配 |
| rotate-rings.org | **2026-10-16**（13 天前） | 0 | 294（L1-285）+ /authors + /featured | en | hints #9 / all levels #6 / answers #6 / level-32 #5 | 652 词/页 + 16 图 + 按盘面状态给战术（"More than one red piece"） |
| rotaterings.org | 2026-10 前 | ? | 101（L1-100）+ /guides/ | en | level-32 #6 / level-11 #10 | 374 词/页薄 + Board Diagrams 差异化 |
| puzzledoku.com | 老站 | ? | 1 页 how-to-play | en | how-to-solve #10 / guide #10 | 1,836 词规则页（bones/relax mode/星级） |
| appgamer.com | 老站 | ? | 1 页 Q&A | en | answers #8 | 问答聚合 |

**YouTube 占每条 SERP 6-8 席**——有机位只有 2-4 个，三家专站分食。"rotate rings" 主词（KD 59.5）盘面里三家专站反而都不在前十（他们赢的是攻略簇，不是主词）。

## 二、我们差什么

1. **覆盖深度**：11 页（L1-10+L32）vs 竞品 100-294 页。L32 SERP 我们 #8——两个 org 分列 #5/#6，com 缺席该词。
2. **hub 词位**：hub title 只有 "Guide — Wave-Verified Level Walkthroughs"，answers/hints/all levels 三个簇词全没占；hub 在 8 条 SERP 里一次都没出现。
3. **修饰词层**：11 页 title 有独特风味尾缀（"Every Burst Timed"）但零簇修饰词（hints/answers/solution/steps）。
4. **locale**：com 站连 ja/zh-Hant 都铺了。

**我们有而他们没有的**：逐波帧验证时间轴（4fps 精扫）、结算画面细节（竞品均未写）、真实机制结论（bomb/acorn/十字枢纽）。10-24 抽帧管线的差异化资产仍在。

## 三、BP3 复刻执行（2026-10-29 部署 `52aa49aa` + IndexNow 200）

**Method C 织入（同 Crazy Mind 批次手法），11 关卡页 + hub：**
- 关卡页 title：`Level N Walkthrough — {风味}` → `Level N Hints & Walkthrough — {风味}`（hints 是 web 页能赢 YouTube 的词——com 站以 web 页拿下 hints #1 实证）
- 关卡页 desc：前置 `hints, steps and solution —`，超 155 的 7 页逐页压缩数据列表（保最具辨识度数据：burst 时间戳/分数/机制）
- hub title → `Rotate Rings Guide — All Levels Walkthrough, Hints & Answers`；desc 重写带 answers/hints 前置
- hub FAQ +1 问（"Where can I find hints and answers for each level?"），**FAQPage schema 逐字同步**（live 5 问验证 ✓）
- 关卡页页脚兄弟互链（L1↔…↔L10→L32，爬虫深度入口）

**不做的（与 10-26 review + dup 整改纪律一致）：**
- 不建独立 /rotate-rings/answers/ 页——与 hub 同意图，内耗风险（keyword-cannibalization-consolidation：核心词归 hub）
- 不盲铺 L11+：三家程序化站已占位，哥飞纪律「entrenched 非必争 → 不正面铺」；且逐关帧验证成本高，模板复制会重蹈 dup 84% 覆辙

## 四、按需扩张规则（On-demand，BP3 模式）

**触发**：NewWord/Bot·X 日常批次盯守 GSC `rotate rings level (\d+)` 正则——某关卡号在周窗口累积 ≥10 imp 且无对应页 → 建页（同 L137 先例）。数据诚实红线：该关无帧验证数据时只写机制通用层+明确标注未逐波验证，不编时间戳。

**预期管理**：Trends +263% 爆发中（10-04 峰值 100、最新 86），当前月量粗推断 600-1200（Ads KWP 四词全 null 无法锚定，推断非实测）。BP3 簇 28d 21,631 imp；RR 词族量级小 10-20 倍——成熟期合理预期 **30-80 clicks/月**，不是 BP3 的 1,000+。值在做的是「零边际成本已有页吃长尾 + 词位修正」，不是规模战。

## 五、复查节点与止损门

- **10-30/11-01**：solver 决策门 cron 同窗口看 RR——簇日趋势（10-26 基线 60 imp/天）是否跟随趋势仍在峰平台；L32 是否从 #8 上移（织入后 2-4 周显效）
- 下次 Bot·X 批次 review 检查 rotate rings level N 新词
- **止损门（2026-10-29 定）**：L32 进 #6 或簇 imp 两周 ≥2x → 按需扩张继续；L32 卡 #8+ 且簇走平 → 冻结扩张（11 页留存量吃长尾），火力回 BP3。任何分支不再 blanket 铺页
