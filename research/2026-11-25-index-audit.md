# 收录审计：BP3 / Amochiroom / Rooms & Exits（2026-11-25）

口径：GSC `sc-domain:gridpaw.com` URL Inspection（实时）+ Search Analytics（2026-10-28 ~ 11-24，dataState=all）。
技术层先行全绿：页面 200 / canonical 自指 / 无 noindex / 均在 `sitemap-0.xml`（706 URL 全带 lastmod）/ hub 内链完整。→ 未收录不是技术事故。

## 一、汇总

| 簇 | 页数 | 上线日 | 已进索引 | 未收录 | 28 天 SERP（已索引部分） |
|---|---|---|---|---|---|
| BP3 EN 老页 | 137 | ≤ 11-23 | 137（有曝光） | 0 | 224,398 imp / 14,032 clk / pos 3.9 |
| BP3 EN 新页 138–188 | 51 | 11-24 | 0 | 抽样 18/18 未收录 | — |
| Amochiroom | 135 | 11-24 22:49 | 1（hub） | 抽样 11/11 未收录 | hub 16 imp / pos 1.9（品牌词） |
| R&E 关页 | 61 | 11-07 / 11-17 / 11-19 | 37（61%） | 24（39%） | 8,836 imp / 278 clk / pos 4.7 |

## 二、R&E 逐页（★ = 已索引；△ = Discovered-not-indexed；✕ = URL unknown to Google）

- Ch1（2026-11-07 上线，11 页）：★L2 ★L4 ★L5 ★L6 ★L10 ｜ △L1 △L3 △L7 △L9 ✕L8 ✕L11 → **5/11**
- Ch2（11-17 上线，26 页）：★L4–L26（23 页）｜ △L1 △L2 ✕L3 → **23/26**
- Ch3（11-18/19 上线，24 页）：★L1 ★L8 ★L9 ★L10 ★L11 ★L18 ★L20 ★L21 ★L23 ｜ △L2 L3 L4 L5 L6 L7 L12 L13 L14 L15 L16 L19 L24 ✕L17 L22 → **9/24**

最近抓取日期（已索引页）：11-17 ~ 11-25 连续有抓取，说明爬虫活跃但优先重抓老页，新页排队。

## 三、未收录页抽样详情

- BP3 138/139/171–177/180–188（18 页）：全部 `Discovered - currently not indexed`，`Never crawled`。
- Amochi `/level-1/ 2 10 20 50 66 80 100 110 131 133`、`/amochiroom/find/`：全部未收录（部分 unknown）。
- Amochi hub `/amochiroom/`：已索引（11-24 抓取）。
- R&E hub：已索引（11-22 抓取）。

## 四、独立第二源（web_search 实测，2026-11-25）

| 查询 | gridpaw 位置 | 头部谁在 |
|---|---|---|
| brain puzzle 3 level 171 answer | 无 | YouTube×5、trickystorywalkthrough #2、answersgame #5 |
| rooms and exits chapter 3 level 14 storage room walkthrough | 无 | trickystorywalkthrough #1、rgamereview #2/#3、appgamer #4 |
| amochiroom level 1 answer My Study | 无结果返回（词太冷） | — |

→ 与 URL Inspection 一致；同时证明这两条赛道竞品同题页能拿 #1，收录后我们的 pos 有机会（已索引同族页实测 pos 3-5）。

## 五、判断

1. **昨天的 BP3 51 新页 + Amochi 135 页：不是「失败」，是「还没开始」** —— 上线不足 24h，Google 尚未抓取。观察节点 11-27（Discovered→Crawled?）。
2. **R&E 24 页未收录是真失败**：Ch1 已 18 天、Ch3 已 6-7 天，同批同模板页一半收一半不收 = 站级抓取预算/质量筛选，不是等待能解决的。11-19 留的「若是 Discovered 则问题在爬取预算」判据成立。
3. **IndexNow 对 Google 无效**（只进 Bing/Yandex）；GSC sitemap 重提交只触发 sitemap 再下载，不催页面抓取。真正能催 Google 的免费通道只有 GSC 手动「请求编入索引」+ 站内权重导流。
4. **已进索引的页排名全都很好**（BP3 3.9 / R&E 4.7，全在第一页），瓶颈不在内容与排名。

## 六、动作（按 ROI，待拍板）

- **P0 GSC 手动请求编入索引**：R&E Ch1 缺 6 页 + Ch3 缺 15 页（优先 L2-L7、L12-L17 = 早期关卡搜索量大），每日配额 10-12 个，2 天推完。走 ego 浏览器操作 GSC UI（Indexing API 403 已证不可用）。
- **P1 跨簇内链导权重**：BP3 月 14k 点击是全站最强权重源，但 bp3 answers hub 188 卡全是 bp3。在各簇 hub 底部互加「More game walkthroughs」区块（bp3 ↔ R&E ↔ amochi ↔ the-loop），只链 hub 不链页，避免摊薄。
- **P2 控制新页批量节奏**：11-24 单日 +186 页（amochi 135 + bp3 51）≈ 站点规模 +25%，会稀释抓取预算；后续批次按 30-50 页/周。
- **P3 兜底**：若 11-27 R&E Ch3 仍大面积 Discovered，考虑把 Ch3 24 页合并成 4-6 个「章节级长页」（Ch2 88% 收录 vs Ch3 37.5% 收录的对照说明单页数量过多可能触发筛选）。

## 七、BP3 恢复度（2026-11-25 补查，两源日级）

### GSC 日级（filter page = /brain-puzzle-3，dataState=all）

| 日期 | 曝光 | 点击 | pos |
|---|---|---|---|
| 11-12 | 12,351 | 648 | 4.2 |
| 11-13 | 12,063 | 675 | 4.2 |
| 11-14 | 11,014 | 595 | 4.1 |
| **11-15** | **1,217** | 71 | 3.4 |
| **11-16** | **1,192** | 50 | 3.3 |
| 11-17 | 9,907 | 620 | 4.0 |
| 11-18 | 13,579 | 920 | 4.0 |
| 11-19 | 14,034 | 961 | 4.0 |
| **11-20** | **15,665** | 995 | 4.1 |
| 11-21 | 9,721 | 545 | 3.9 |
| **11-22** | **1,261** | 67 | 3.4 |
| **11-23** | **1,141** | 52 | 3.8 |
| 11-24 | 858（未回填完） | 38 | 3.6 |

### GA4 Organic Search 会话（landingPage=/brain-puzzle-3*，属性 552793510，CST，实时源）

11-12 539 / 11-13 534 / 11-14 535 / **11-15 336 / 11-16 80 / 11-17 89** / **11-18 707 / 11-19 754 / 11-20 898 / 11-21 877** / **11-22 360 / 11-23 162 / 11-24 102 / 11-25 42（到 16:20）**

### 词级（GSC，4 天窗口对比）

| query | 11-10~13 | 11-21~24 | 变化 |
|---|---|---|---|
| help grandma fix her teeth | 290 imp / pos 3.1 | 47 / 2.3 | −84% |
| help the piglet build the roof | 259 / 3.0 | 194 / 3.7 | −25% |
| escape the terrifying brown bear attack | 143 / 4.4 | 25 / 3.6 | −83% |
| help them escape death | 132 / 4.5 | 不在 top40 | 掉出 |
| help the girl reduce her head circumference | 109 / 2.8 | 不在 top40 | 掉出 |
| restore the correct short drama cover | 105 / 4.8 | 19 / 4.3 | −82% |

形态判定：**位次保持第一页（2-4），每词展示额度 −80~90%，长尾词池整批消失** → 展示压制，不是排名下滑。页面级 pos 3.9/3.4 是「只剩下的头部词」算出来的自我美化，不能当恢复信号。

### 重编码后的抓取（URL Inspection，10 个老页抽样）

L1 11-22 / L3 **11-25** / L6 **11-25** / L17 11-24 / L33 11-24 / L45 11-24 / L76 11-23 / L100 11-22 / L120 11-23 / L137 **11-25** — 全部在 11-24 重编码前后被重抓，3 页今天抓。**Google 已消化重编码，抓取不是瓶颈、也不构成这波下跌的原因（下跌早于 11-24）。**

### 补录动作时间线（针对 Google 的有效性）

| 时间 | 动作 | 对 Google 是否有效 |
|---|---|---|
| 11-17 `af89954` | IndexNow 精确提交改造（改推 diff 页） | ❌ 只进 Bing/Yandex |
| 11-19 | IndexNow 全量 sitemap + R&E L10/L13 单推 200 | ❌ 同上 |
| 11-24 19:00 | deploy + IndexNow 推 4 URL | ❌ 同上 |
| **11-24 23:00** | deploy:safe **首跑 GSC sitemap 重提交（204）** | ⚠️ 仅触发 sitemap 再下载 |
| — | bp3 老 137 页 | **本来全在索引，无需补录** |

→ bp3 老页的「恢复」与补录无关（已索引）；真正待补的是 138–188 这 51 个新页。
