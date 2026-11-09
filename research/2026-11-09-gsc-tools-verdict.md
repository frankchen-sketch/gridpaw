# GSC 工具方向判死报告：GSC Wizard vs mcpsearchconsole（2026-11-09）

> 数据来源：webcafe domain_overview（两站各 2 积分，累计 4）+ 三站 HTML 抓取 + 交互 Demo 实机截图 + SERP 检索
> 结论：**否掉**。理由不是「竞争激烈」，是「这是 SaaS 产品生意，不是内容站生意」

## 一、两家数据对比：同赛道同期，差 75 倍

| 指标 | GSC Wizard | mcpsearchconsole |
|---|---|---|
| 域名 | gscwizard.com（tool.gscwizard.com 为产品端） | mcpsearchconsole.com |
| 月访问 | **116,897** | **1,537** |
| DR | 54 | 12 |
| 域龄 | 0.7 年（2026-02-21 注册） | 0.4 年（2026-06-19 注册） |
| 环比 | **+248.9%** | 无数据（07/08 月均为 0） |
| 全球排名 | 269,401 | 11,060,892 |
| 跳出率 | 34.2% | 36.1% |
| **停留时间** | **157 秒** | **3.4 秒** |
| 页/访问 | 4.25 | 1.29 |
| 价格 | €17 / €39 / €249 / €349+ 每月 | €0（限 40 次/月）/ €4.99 / €29.99 |
| 流量来源 | **referral 59.7%** / direct 23.8% / search **10.9%** / social 4.1% | search 25.6% / direct 30.5% / paid 17% / referral 14.5% |

### 决定性信号：停留 157 秒 vs 3.4 秒

mcpsearchconsole 的 3.4 秒说明用户进来复制一个 MCP endpoint 就走——**产品里没有值得停留的东西**。GSC Wizard 的 157 秒 + 4.25 页/访问说明用户真的在看报表。

**便宜 + 只有连接器 = 死路；完整产品 + AI 生态 = 活路。** 同一赛道同时期，贵 3-8 倍的反而是赢家。

## 二、GSC Wizard 的获客结构：不是 SEO，是 AI

| 项 | 数据 |
|---|---|
| 自述规模 | 88,650+ properties tracked、5,750+ SEOs onboard |
| **AI 引荐（100% 来自 AI）** | **chatgpt 76.2% / claude 13.2% / gemini 10.6%** |
| 主要国家 | US 23.5% / 荷兰 10.7% / 德国 9.3% / 印度 7.9% / 意大利 5.3% |

### 核心获客词（不是「seo tool」，是 MCP）

| 词 | 月搜索量 | 性质 |
|---|---:|---|
| google search console login | 87,700 | 蹭 Google 官方词，CPC $5.38 |
| **google search console mcp** | **15,440** | 非品牌词，CPC $5.01 |
| gsc wizard | 12,150 | 品牌词 |
| **gsc mcp** | **5,790** | 非品牌词 |

## 三、定价与功能

### 定价（欧元区报价，USD 略高）

| 档 | 月费 | 容量 |
|---|---:|---|
| Starter | €17 / $19 | 15 properties（10 API + 5 全存储） |
| Pro | €39 / $49 | 75 properties，3 席位 |
| Business | €249 | 650 properties，10 席位 |
| Custom | €349 起 | 1000+ API + 225 全存储 |
| 加席位 | €9/月 | — |

全档包含：**10 年历史数据**、MCP & API 全访问、ChatGPT App、Slack/Teams/webhook 告警、7 天免费试用无信用卡、之后无免费版。

### 「10 年历史数据」的真实机制（易误解）

| 项 | 说明 |
|---|---|
| Google 的限制 | Search Console 免费版**只保留 16 个月**查询数据，超期永久删除 |
| GSC Wizard 做法 | 用户授权接 GSC 后，**每天定时把当天数据抓进自己数据库** |
| 结果 | 用 3 年就有 3 年；Google 那边早删了，它这里还在 |
| **做不到的** | **不能回溯**——今天注册就从今天开始存，变不出过去 10 年 |

所以「10 年」是**存储承诺**（存了不删），不是历史能力。商业价值在于**用户用得越久迁移成本越高**——换工具等于丢掉自己攒的历史。

### 8 大功能：6 个分析 + 2 个集成

| 功能 | 性质 | 干什么 |
|---|---|---|
| Extended Search Analytics | 分析 | 四维筛选（query/page/country/device）+ 时段对比 + 趋势 |
| Traffic Forecasting | 分析 | 季节性预测 + 收入影响模拟 |
| Topic Clusters | 分析 | query 自动聚成主题簇，看哪簇高曝光低 CTR |
| Content Decay Map | 分析 | 检测衰退页面 |
| Striking Distance Keywords | 分析 | 找「差一点进前三」的机会词 |
| 索引问题排查 | 诊断 | 收录/抓取异常 |
| 多站 dashboard | 管理 | agency 视角 |
| MCP / API / 告警 | 集成 | 让 AI 能查数据 |

**它卖的不是数据，是「GSC 原始数字 → 结论」的转换 + 存储 + 集成。**

## 四、SERP 证据：MCP 本身已无护城河

`google search console mcp` 前 10 结果：

| 结果 | 性质 |
|---|---|
| GitHub `AminForou/mcp-gsc` | **免费开源**，2,152★，2026-11-06 更新 |
| GitHub `ahonn/mcp-server-gsc` | **免费开源（MIT）**，283★ |
| GitHub `sarahpark/google-search-console-mcp` | **免费开源**，npm 一键装，9★ |
| Reddit r/TechSEO | 用户自建 |
| suganthan.com 教程 | 明写「Free (open source)，No subscriptions. No free tier with limits」 |
| **mcpsearchconsole.com** | 托管版，免费档 + €4.99/月 |
| Coupler.io / Windsor.ai / Composio | 商业平台集成 |

**关键情报（windsor.ai 指南，2026-11-04 核过）**：Google 至今未发布 Search Console 官方 MCP server，市面上所有 GSC MCP 都是第三方包 Google 公开 API。

⇒ **`gsc mcp` 15,440 搜索量的红利已被免费开源吃掉。** 不能打「我有 GSC MCP」这张牌。

## 五、UI 评估（三个交互 Demo 实机截图）

Demo 入口无需登录：`gscwizard.com/reports/{forecast,topic-clusters,onpage-seo}.html`

### 共同骨架

```
顶部：报表名 + 一句话说明（这个报表解决什么问题）
第一行：3-4 个汇总数字卡        ← 先给结论，不让你算
主体：数据表格（维度 + 指标 + 状态列）
右上：Export CSV
每行末：Suggestion 列           ← 直接给行动建议
```

### 功能拆解（技术含量极低）

| 屏幕上的 | 背后的代码 |
|---|---|
| 4 卡片：Current 8,420 sessions / Baseline 61,927 / Growth 68,120 / **Revenue $91,962** | `revenue = sessions × 转化率3% × AOV $45` |
| 折线图：Historical + Baseline + Growth | 多项式拟合（degree 2）+ 季节性分解 |
| **R² Score 0.94** | 一行 numpy.polyfit |
| 滑块 Growth Rate 10%、3/6/12 月切换 | 前端 state |
| 8 个主题簇（SEO Tools、Keyword Research…） | query 按主题聚类（LLM 或关键词规则） |
| 每簇 Clicks 3,420 ↑12% / Imp 48,600 ↑8% / CTR 7.04% / Pos 5.8 | `GROUP BY cluster` 聚合 |
| On-Page：Total 15 / Issues 18 / Missing from Title 5 | 抓页面比对主关键词是否在 title/meta/H1（自带 crawler `GSCWizard-Bot/1.0`） |

**两个核心功能加起来不到 500 行代码。** 已有 `ga4-data-access` 全套数据获取能力的前提下，加 polyfit + GROUP BY，一天能做完。

### 做得好 vs 做得差

| 做得好 | 做得差 |
|---|---|
| 首屏给结论（Issues Found 18 / Missing from Title 5） | 视觉零辨识度（浅色+蓝青+圆角卡，跟一百个 SaaS 一样） |
| Suggestion 列直接给行动建议 | 全靠表格，图表几乎没有（只有 Forecast 有折线） |
| Export CSV（B 端必需） | 没有「今天该干什么」的聚合页 |
| Demo 不用登录，数据真实感强 | 移动端未优化，宽表格溢出 |

## 六、判死理由（两条同时成立）

### ① 便宜 + 只有连接器 = 死路，mcpsearchconsole 已证

1,537 月访问、3.4 秒停留、DR 12。它做得对（免费档、一分钟接入、16 tools），但用户只把它当管道，不当产品。

### ② 完整产品 + AI 生态 = 活路，但那是 SaaS 生意

GSC Wizard 赢在：7 种语言（de/ja/pl/fr/es/tr/it）+ MCP + ChatGPT App + 不用登录的 demo + 把流量换成钱的话术 + 10 年存储锁客。

**这需要持续产品迭代**（PMF、订阅留存、churn 管理），不是「建个站挂广告」。当前模式是「内容站 + SEO + AdSense」，这条路是另一门手艺。

**且免费开源已填满**：3 个 MIT 项目 + 1 个 €4.99 托管，MCP 这个词的价值已在地板。

### 对 gridpaw 资产的对账（说明「技术上能做」不等于「该做」）

| GSC Wizard 功能 | 现有能力 | 差距 |
|---|---|---|
| Extended Search Analytics | `ga4-data-access` 全套查询（含所有踩过的坑） | 数据层有，**UI 没有** |
| Striking Distance | `furriq-gsc-tiered-analysis`（按排名分层找信号） | 有方法，无产品 |
| 索引排查 | `seo-gsc-indexing-workflow` + urlInspection 批量脚本 | 有方法，无产品 |
| Content Decay | `seo-data-briefing` 每日简报有页面变化检测 | 部分 |
| **10 年存储** | `daily-brief-pipeline` 每天拉 GA4/GSC 入 SQLite | **雏形已存在** |
| Topic Clusters | 无 | 全新 |
| Traffic Forecasting | 无 | 全新 |
| MCP server | 已接 4 个 GSC MCP（2026-11-09） | **反而已解决** |

**结论：缺的不是数据能力，是「把这些脚本包成别人能用的产品」。**

## 七、可带走的两条方法（与建站生意无关，可复用）

| 方法 | 怎么用 |
|---|---|
| **不用登录的 Interactive Demo** | gridpaw 的 solver 页可做成「不用登录就能试一道题」，比纯 SEO 页转化高 |
| **把指标翻译成钱/时间** | BP3 页现在写「11 步操作」，可改成「省你 20 分钟卡关」——同样内容，决策语言不同 |

## 八、决策与后续

- **决策**：GSC 工具方向停掉，不再投入时间。
- **反而拿到的资产**：GSC MCP 已接入（4 server / 6 站 / 21 工具），日常查数据不用写脚本。技术细节 → skill `hermes-mcp-integration`。
- **可选动作（未做）**：Wizard 7 天免费试用（无信用卡），只为对标产品设计，重点看 Topic Clusters / Content Decay 是否有超出自建脚本的价值。

## 九、口径与未验证

1. 两站的月访问/DR/来源结构来自 webcafe `domain_overview`（快照库口径），非 SimilarWeb 直读
2. 「5,750+ SEOs onboard」是 GSC Wizard 自述，不等于付费用户数；付费率未验证
3. 定价为抓取时的官网报价，可能随汇率/活动变动
4. UI 评估基于 3 个公开 Demo 页，**未登录真实 dashboard**（产品端 tool.gscwizard.com 需授权 Google 账号）
5. 「两个核心功能不到 500 行代码」是按 Demo 呈现的复杂度估算，真实产品含多站管理/权限/告警，工程量远大于此
