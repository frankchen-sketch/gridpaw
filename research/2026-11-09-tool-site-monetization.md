# 新游戏工具站的普遍变现模式（2026-11-09 实证）

> 方法：从 hosted 增长榜与 Aion 2 词族里抽 31 个有真实流量的工具站，curl 抓首页 + 扫描广告网络 / affiliate / 付费 / 打赏标识；对 metaroad.gg、aionflex.gg 抓了定价页与作者自述文章；对 3 个代表站用 webcafe 查了流量（6 积分）。
> 样本偏向「免费托管 + 新域名工具站」，不含大型游戏媒体与 SaaS。

## 结论先行

**新游戏工具站的普遍变现模式只有两条腿：展示广告（AdSense / Nitropay）+ 打赏或去广告会员（Ko-fi / Patreon）。没有第三条。单页免费工具站几乎不变现——19 个免费托管样本里 10 个零变现，其余是 Ko-fi / PayPal 打赏。**

**能变现的前提是「多游戏 + 数据库 + 账号 + 持续更新」的平台形态（30 万月访问量级），不是单页工具。** 这也是为什么做这类站的人普遍只能覆盖服务器成本，而不是赚钱。

---

## 一、变现模式分层（附实证）

| 层级 | 形态 | 实证样本 | 变现方式 | 规模 |
|---|---|---|---|---|
| **L1 单页工具** | github.io / vercel.app 单页：save editor、calculator、timer | 19 个样本：10 个**零变现**（PS5 模拟器、MC 附魔计算器、Factorio 计算器、Persona 合体、奇幻地图、滑块求解器、NFSU2 编辑器…）；Ko-fi 3 个；PayPal 3 个；AdSense 仅 1 个（RDR2 收集地图 4 个位） | 无 / 打赏 | 月 0–几十美元 |
| **L2 内容型工具平台** | 多游戏 guide + build planner + 数据库 + 账号 | **metaroad.gg**、**aion2hub.com** | Nitropay / AdSense + Ko-fi 会员 | 月访问 30 万量级 |
| **L3 垂直数据站** | 单游戏深度数据 + 工具，10 年积累 | **pikalytics.com**（宝可梦对战） | AdSense + Nitropay + Ko-fi | 月访问 80 万量级 |
| **L4 客户端工具订阅** | DPS meter 等游戏内 overlay 软件 | **aionflex.gg** | Paddle 订阅（Free / Pro 分层） | 未公开，需 Windows 客户端开发 |

## 二、三个实证样本的盘面

| 域名 | 注册 | 月访问（2026-09） | 趋势 | DR | 搜索占比 | 页/访问 | 变现 |
|---|---|---:|---|---:|---:|---:|---|
| pikalytics.com | 2016-06 | **794,964** | -2.8% | 46 | 41.6% | 3.3 | AdSense 3 位 + Nitropay + Ko-fi |
| aion2hub.com | 2025-09 | **327,114** | **+119.2%** | 38 | 68.8% | 5.2 | 无广告、无订阅——纯导流到 aionflex.gg + Discord + Twitch |
| metaroad.gg | 2025-09 | **298,137** | **+83.8%** | 29 | 68.6% | 2.0 | Nitropay + Ko-fi 会员（$2/4/8 每月） |

**注意 metaroad 的爆发曲线**：2026-07 仅 7,007 访问 → 8 月 162,208 → 9 月 298,137。两个月内从零到 30 万，靠的是 Hero Siege / AION 2 / MapleStory Classic 三个游戏上线窗口。

## 三、metaroad.gg：作者亲口讲的账本

2026-10-15 的文章《MetaRoad Is Growing: Ad-Free Premium, Path of Exile 2, and How You Can Help》原文要点：

> "MetaRoad doesn't sell anything. There's no store, no paid guides and no locked planners. Every guide, planner and database on the site is free."
> "Two things cover those bills: **Ads** - the ads you see on our pages... **Your support on Ko-fi** - a one-time tip, or a membership. That's what this money is: support, not a purchase. **That's the whole list. If both stop, the site stops.**"

会员定价（/premium 页）：Supporter **$2/月**、Hero **$4/月**、Legend **$8/月**；年付省 21%。买到的全部是「去广告 + 徽章 + Discord 角色」——**没有功能付费墙**。

成本项（作者自述）：服务器、planner 背后的数据库、数千张游戏图片的存储、每个 patch 后的更新时间。

**这条最有信息量：30 万月访问的站，作者的原话是「广告和打赏都停，站就停」。这说明该量级只能覆盖成本，不是利润生意。**

## 四、aionflex.gg：唯一的高毛利模式，但开发最重

DPS meter 桌面客户端，Paddle 收款，Free / Pro 分层：

| Free | Pro |
|---|---|
| 实时 DPS、游戏内 overlay、Boss HP、多语言、治疗计量 | PvP 模式、全队 10 人伤害拆解、5 个额外 overlay 主题、治疗明细、Loot Energy |

**逻辑：只有「每场战斗都用」的高频工具才撑得起订阅。** 存档编辑器、计算器这类「用完即走」的工具没有留存理由，只能打赏。

## 五、aion2hub.com 反而是另一种玩法

32.7 万月访问、68.8% 搜索流量、5.2 页/访问，但**页面零广告、零订阅**。它把 DPS meter 和排行榜导给 aionflex.gg，自己收 Discord 与 Twitch 流量。这是「工具站群互导 + 社区」的玩法，变现发生在关联网站上——单看 aion2hub 本身不赚钱。

## 六、对「新游戏工具站」方向判断的修正

上一份报告里我给的未知项是「eCPM 未知，可能不值得做」。现在可以下更准的判断：

| 打法 | 变现现实 | 判断 |
|---|---|---|
| 单页工具（timer / calculator / save editor） | 几乎为零（打赏几十美元/月） | **只能当需求验证，不能当生意** |
| 多游戏工具平台（L2） | 广告 + 会员，30 万访问量级仅覆盖成本 | 需要 3 游戏 + 8 语言 + 账号 + 12 个月，产品级投入 |
| 垂直数据站（L3） | 80 万访问，10 年积累 | 复利型资产，但不适合新站冷启动 |
| 客户端订阅（L4） | 高毛利，但 Windows 客户端 + 游戏适配 | 与现有能力（Astro 静态站）不匹配 |

**结论：如果做，必须按 L2 形态规划（多游戏 + 数据库 + 账号 + 会员），并接受「前 12 个月只覆盖成本」；如果只做单页，就把它当「给现有站导流的免费工具」，不要当新项目。**

**对用户最划算的落点，可能不是开新站，而是在 gridpaw 内部加工具页**——复用域名权重、AdSense 账户、现有流量，边际成本最低。这条待拍板。

## 七、口径与未验证项

1. **eCPM 未实测**：游戏类 AdSense / Nitropay eCPM 按行业常见 $1–4 粗估，未拿到任何一家的真实后台数据。上述「覆盖成本」是作者自述，不是我的测算。
2. **月访问是第三方估算**（webcafe / SimilarWeb 口径），非 GA4 实测。
3. **样本偏差**：只抽了免费托管 + 新域名工具站；大型游戏媒体（IGN、Game8）与付费工具（Overwolf 生态）不在样本内。
4. **aion2hub 的关联网站 aionflex.gg 的实际收入未知**，Paddle 订阅量不公开。
5. 扫描基于首页 HTML，SPA 站（Factorio、Persona、CC 生成器）的广告/付费标识可能在 JS bundle 里，未深入；但这类站本身也无变现迹象。
