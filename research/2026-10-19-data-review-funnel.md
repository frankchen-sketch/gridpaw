# GridPaw 数据 Review 与优化策略（2026-10-19）

> 五源对账：周报（cron 53f2a4b531f1，10-18 20:14）+ D1 现拉（10-19）+ GA4（9-22→10-18）+ GSC（9-22→10-16）+ Clarity 取证（10-12/10-15，STATUS §漏斗复核）。作战地图基准 = research/2026-09-23_作战地图.md。
> 口径：GSC 日数据到 10-16（10-17/18 未进）；GA4 事件 24-48h 延迟；D1 visit 含爬虫（isLikelyBot 已标，非 visit 事件无 bot 标）；AI 爬虫在 D1 恒为 0 是口径问题（visit 靠 JS 上报，不执行 JS 的原始抓取不留痕），不是「没来」的证据。

## 一句话总结

**搜索链路 28 天内全线打通且在加速：Googlebot 抓取 5 倍（~20→108 次/天）→ GSC 曝光 4 倍（89→355/天）→ 点击 3.4 倍（1.9→6.4/天）；漏斗真断点不在「玩到中段」而在「进站即跳」（Clarity：首页 median 10s、12/29 会话 ≤10s 零点击）；AI 渠道（chatgpt.com engaged 75%）和 Reddit（73%）是质量最高的站外来源；作战地图唯一卡死项——外链项目——已挂 4 周等拍板，数据现在全面支持开打。**

## 链路健康表（爬虫→收录→曝光→点击→进站→玩→分享）

| 环节 | 指标 | 早期（9/22-10/04） | 近期（10/05-10/16） | 判定 |
|---|---|---|---|---|
| 抓取 | Googlebot visit（D1，JS 渲染抓取） | ~20/天 | 10-12 起 61-108/天 | ✅ 5 倍暴涨，10-12 起与曝光跳升同日 |
| 曝光 | GSC imp/天 | 89 | 355 | ✅ 4 倍 |
| 点击 | GSC clicks/天 | 1.9 | 6.4 | ✅ 3.4 倍；作战地图基线（9 月上半月 0.5/天）的 13 倍 |
| 进站 | GA4 sessions/天 | ~25 | ~45（10-15/16 达 54） | ✅ 近乎翻倍；organic 28d 165 sessions |
| 首次互动 | D1 gs→fm（真人） | — | ≈20%（fm 109 / gs 538，7 天） | ⚠️ 断点在进站即跳，不在游戏内 |
| 分享 | gs→share（D1） | 0.3% | 2.0%（11/538） | ✅ 分享体系生效；share_copy 占 82% |
| 广告 | 内容页会话占比 | 6%（40/645） | 未复查 | ⚠️ 乘积仍太小，别动配置 |

## 五源关键发现

1. **周报 P0 已闭环**：share_card/share_card_copy 白名单修复（commit `1dee9ae`）已上线——D1 10-18 已收到首条 share_card（1 次），链路验证通过。kakuro first_move 零触发仍未修。
2. **Googlebot 抓的是谁**（7 天 top）：首页 131 次、/pictomino/game 18、/akari/compare/ 12、arrows-puzzle 两页 18 次、/akari/glossary/ 10——新内容页上线几天内即被抓，抓取正循环健康。Bingbot 仅 2-7/天，AI 爬虫零记录（口径见上）。
3. **GSC 点击已分散到长尾**：无一词超 3 clicks。高曝光低 CTR 页三连：/akari/how-to-solve/ 644 imp/11 clk（pos 7.7，CTR 1.7%）、/japanese-logic-puzzles/ 661/9（pos 8.0，1.4%）、首页 282/11（pos 5.7，3.9%）。**brain-teasers-for-adults 5 clk/195 imp，pos 46.8 → 14.3**（作战地图唯一立项词，显著进展但离 top10 还有一步）。
4. **AI 渠道是隐藏冠军**：GA4 28d chatgpt.com 24 sessions / engaged 18（**75%，全场第一**）；reddit 11/73%；lemmy 30/63%；pinterest 31/48% 垫底。dles.gg 43 sessions 但周报实锤脉冲衰竭（24→1/周）。
5. **Clarity 实锤（10-15 取证）**：首页 29 会话 median 10s / 0 点击，长会话全是挂机 tab；内容页 1-7s 弹走。**没有「玩到中段流失」的可测样本——真问题在进站即跳。** 死点击两热点（pictomino 关卡 Loading 连点、内容页 iframe+广告误报）均结案非 bug。
6. **D1 陷阱记录**：10-18「真人 visit」329 创 14 天新高，但其中 Googlebot 92 已被正确标 bot；非 visit 事件不带 isLikelyBot，按事件过滤「真人」必须 join visit 或按 UA，直接 json_extract 会把 NULL 全判成 bot（本次实测踩坑）。GA4 与 D1 方向性矛盾（10-12 GA4 23 sessions vs D1 273 visit）= 广告拦截 gtag + D1 直连的已知双口径，读比例别读绝对量。

## 优化策略

### P0
1. **趁抓取窗口放大内容供给（持续动作，本周起）**：Googlebot 5 倍抓取 + 新页几天内被抓 = 上什么收什么的窗口期。每周 ≥1 新内容页/游戏页加厚，发布即 IndexNow；arrows-puzzle 词族（walkthrough 10 次抓取）继续按 NEWWORD-LEDGER 节奏承接。观察指标：GSC imp/天 是否守住 350+。
2. **修 kakuro first_move（1 小时，周报 P0 尾巴）**：埋点在源码但两周 0 事件，验证 fog/paywall 门是否把触发点锁在解锁之后。不修则 kakuro 漏斗永远是盲读。

### P1
3. **进站即跳是漏斗最大断点（先诊断再动手）**：首页 gs→fm 20% + Clarity median 10s。动作：拉 GA4 首页 landing page 的 engaged rate 分设备分来源（mobile+google 曾实测 37-60%），确认跳走的是「不该来的流量」还是「首屏没接住」；若是后者，Today's Challenge 首屏直开方案出预览再改。观察指标：≤10s 零点击会话占比、gs→fm。
4. **CTR 抽水（零权重成本）**：/akari/how-to-solve/ 与 /japanese-logic-puzzles/ 两页合计 1,305 imp/28d、CTR <2%。作战地图备选 Title（How to Solve Akari: 5 Techniques That Work）已待命一个月，description 按「直接给答案」改写。两周观察期看 CTR。
5. **Reddit 周更落地（周报 P1 顺延）**：首次 7 会话 engaged 67% + D1 10-17 reddit 16 visit。定每周固定发帖节奏（r/WebGames 模板沿用 daily9 实拆），与 lemmy 稳态供给并列成双站外引擎。
6. **AI 渠道补归因基建**：chatgpt.com 75% engaged 但 AI 爬虫抓取侧是盲区（D1 口径测不到）。用 CF 层补：Workers/页面规则记录 GPTBot/ClaudeBot/PerplexityBot UA 命中数（或直接看 CF Radar/Analytics），打通「AI 爬虫抓取→N 天后 chatgpt.com 引荐」链路，GEO 投入才有判断依据。

### P2
7. **目录站停止投入**（周报 P2 维持）：dles.gg 脉冲衰竭实锤，释放时间给 P1-5 和搜索内容页。
8. **D1 口径补丁**：非 visit 事件补 isLikelyBot（或事件表记 UA），onboarding_* 进白名单（STATUS 10-09 遗留待办，落地前先核对现状）。

## 作战地图对账（9-23 版 → 10-19 现状）

| 作战地图目标 | 现状 | 动作 |
|---|---|---|
| 收录警报（121 已收录） | ✅ 已解除，抓取/曝光/点击三连涨 | 关闭该章节，换成本文抓取窗口监控 |
| 唯一立项 brain teasers for adults | pos 46.8→14.3，195 imp/28d | 页面侧已打满，卡 DR，见下条 |
| 外链项目（唯一杠杆，等拍板） | **挂 4 周未拍板——反馈环断点** | 数据已支持：一批词卡 pos 5-9、brain-teasers 卡 pos 14，全是权重问题。请拍板是否开打；零成本第一批 = dailyakari 复盘四路径（目录站/社区/GitHub 攻略/扩展互链） |
| 观察期 4 项 Title/Meta（9/19-20 上线） | how-to-solve 排名守住 pos 7.7 但 CTR 未突破 | 备选 Title 转正（P1-4） |
| pictomino 停止投入 | 维持（仍是产品页群定位） | 不变 |
| glossary 5 词合并 / compare 止损 | compare 页在 GSC 已出点击（akari/compare 3 clk） | 维持止损，不打新词 |
| —— 新增进地图 —— | Googlebot 抓取窗口（P0-1）/ AI 渠道（P1-6）/ Reddit 引擎（P1-5） | 本文三条 |

## 附：数据快照

- GA4 28d（9-22→10-18）：sessions 日均 ~30（前期 ~20 → 近期 ~45，10-15/16 峰值 54）；来源 top：direct 378+41 / google 135 / dles.gg 43 / lemmy 30 / pinterest 31 / chatgpt.com 24 / bing 22 / reddit 11。
- GSC 27d：102 clicks / 5,412 imp / CTR 2.0%（前 13 天 1.9 clk/d → 后 12 天 6.4 clk/d）。
- D1 真人漏斗 7 天（周报口径）：visit 637 → game_start 538 → first_move 109 → level_up 71 → share ~17 人。
- 爬虫 14 天（D1 visit，UA 判定）：Googlebot 1→108/天（10-12 起跳升）；bingbot 1-9/天；GPTBot/ClaudeBot/PerplexityBot = 0（口径盲区）。
