# checkout 数据给出的方向（2026-11-09）

> 数据：本地 webcafe income 库 16 个月整月报告（2025-07 → 2026-09）+ 最新 28d 快照（2026-11-09，6,349 站）
> 口径：`direction=in` = 用户进入 checkout（购买意图流量），**是估算值不是营收**；整月报告与 28d 快照不可混算
> 补充花费：4 积分（apimart.ai、zenfy.ac 的 domain_overview）

## 结论先行

**checkout 数据里没有「内容站」的位置。** 付费流量全部集中在交易型生意：卖虚拟商品、卖 API 额度、卖订阅、卖实物。内容站做得再大也进不了这张榜——aion2hub.com 32.7 万月访问，checkout 流量为零。

**如果要从 checkout 数据里选方向，只有三条路，而且都不是「SEO 建站」：**

| 方向 | 证据 | 门槛 |
|---|---|---|
| **A. AI API 聚合/转售** | apimart.ai：36 万月访问、DR 65、域龄 1.1 年、28d checkout 5.7 万 | 支付/风控/运维，是运营生意 |
| **B. 垂类付费工具（订阅/额度）** | studyfetch 2 万、scite.ai 3.7 万、migaku 8,514、ai33.pro 4.5 万 | 要产品能力，不是内容能力 |
| **C. 交易型内容导流（affiliate）** | 游戏虚拟商品是最大新兴付费池：lootbar 14 万、gameboost 12.4 万、eldorado 8.4 万 | 灰色地带 + 词竞争激烈 |

**checkout 数据对现有站最直接的价值，是回答「该不该加付费墙」——对宠物品类是明确的「不该」：全品类只有 17 个站、30.9 万流量，且全是零售商。**

---

## 一、品类盘面：钱在哪，以及三个假增长

2026-09 整月，checkout 进入流量（in）：

| 品类 | 流量 | 站数 | 站均 | 性质 |
|---|---:|---:|---:|---|
| Computers_Electronics_and_Technology | 31,376,278 | 1,337 | 23,468 | SaaS / AI / API |
| E-commerce_and_Shopping | 30,247,085 | 136 | **222,405** | 大电商 |
| Games | 14,522,162 | 363 | 40,006 | 游戏充值/代练/皮肤 |
| Finance | 7,651,927 | 175 | 43,725 | 支付/银行 |
| Lifestyle | 6,706,471 | 150 | 44,710 | 电商 |
| Arts_and_Entertainment | 5,374,465 | 250 | 21,498 | 流媒体/漫画 |
| Food_and_Drink | 5,135,128 | 82 | 62,624 | 外卖/超市 |
| Travel_and_Tourism | 4,863,998 | 84 | 57,905 | OTA |

**三个看起来暴涨、实际是假信号的品类**（最近 4 个月环比）：

| 品类 | 3 个月 | 真相 |
|---|---|---|
| Science_and_Education | **+153%** | weather.com 一家 152 万 = 品类的 41%；accuweather 27 万。天气站被 IAB 归类到「科学教育」 |
| News_and_Media | **+112%** | bbc 19.7 万 + yahoo 18.7 万 + guardian 16.7 万 + cnn 12 万，全是媒体订阅墙 |
| Hobbies_and_Leisure | +25% | ravelry 31.6 万（编织社区）+ creativefabrica 20.7 万（素材市场），双边市场不是内容站 |

**唯一真实的结构性变化是 Unknown 品类 +50%（879 万、3,433 站）**——新品类还没被分类系统认出来，这里面有真信号。

## 二、2026 年冒出来的新收钱站（227 个，28d checkout ≥ 5,000）

按模式分类：

### 2.1 游戏虚拟商品 / 代练 / 充值（最大新兴付费池）

| 站 | 28d checkout | 品类 | 说明 |
|---|---:|---|---|
| lootbar.com | 140,306 | Games | 游戏充值 |
| vgo-shop.com | 125,519 | Games | 虚拟商品 |
| gameboost.com | 124,011 | Games | 代练 |
| aniimo.com | 112,146 | Games | 新游戏官方站 |
| pagostore.garena.com | 109,068 | Games | 官方商城 |
| eldorado.gg | 83,675 | Games | 账号/金币交易 |
| acggoods.com | 64,301 | Games | 虚拟商品 |
| skin.club | 49,582 | Games | CS 皮肤 |
| enjoygm.com | 20,101 | Games | 充值 |

**9 个新站超过 5 万 checkout 流量，全在这一类。** 这是真金，但需要供应链/账号资源，且 RMT 违反多数游戏 ToS。

### 2.2 AI API 聚合/转售

| 站 | 28d checkout | 月访问 | DR | 域龄 | 特征 |
|---|---:|---:|---:|---|---|
| apimart.ai | 56,622 | **360,299** | **65** | 1.1 年 | direct 60% / search 17% / paid 8.7%；排名词包含 openrouter（167 万 vol）；用户 China 19% + Spain 18% + Colombia 8% |
| ai33.pro | 45,128 | — | — | — | OpenSpeaker，AI 语音/音乐/图片 |

**apimart.ai 是这轮最值得研究的单一样本**：1.1 年做到 DR 65、36 万月访问，靠「API 聚合 + 抢 OpenRouter 品牌词」。checkout 流量 / 月访问 = **15.7%**，是全样本里购买意图最浓的一类。

### 2.3 订阅服务（流媒体/短剧/漫画）

hbomax 18.9 万、anime-sama.to 16.9 万、reelshort.com 4.9 万（短剧）、dice.fm 4.0 万。需要版权，做不了。

### 2.4 成人/验证

checker.ageverif.com 43.8 万（年龄验证）、funnel.doktorabc 12 万、digi-fans 1.6 万。

### 2.5 小众但有量（Unknown 里翻出来的）

| 站 | 28d checkout | 是什么 |
|---|---:|---|
| zenfy.ac | 123,254 | 学习路径/远程工作，**paid 流量 85%**、search 仅 0.8%、885 万月访问——买量联盟站，不是 SEO 玩法 |
| chatwait.com | 72,494 | 浏览器插件：AI 生成时显示一条赞助行，分 50% 广告收入 |
| thepetstable.com | 50,186 | 宠物（Cloudflare 防护，未抓取） |
| beforthright.com | 38,503 | 付费问卷调研 |
| spotisaver.net | 18,187 | Spotify 相关工具 |
| clickbaitpays.me | 26,889 | 付费点击（PTC），灰产味 |

## 三、为什么内容站进不了这张榜

对照组：aion2hub.com 月访问 32.7 万、5.2 页/访问、68.8% 搜索流量 —— **checkout 流量 0**，因为它不收钱。

再看宠物品类：17 个站、30.9 万流量，其中 fressnapf 8.2 万、chewy 2.2 万、maxizoo 1.6 万全是零售商；唯一算「内容/工具」的 thepetstable 5 万还是订阅制服务。

**规律：内容站的变现只能落在广告和 affiliate 两项，而这两项都不经过 checkout。** 所以用 checkout 数据找「内容站方向」是拿错尺子——这张榜是给「要不要做产品」用的。

## 四、如果非要从 checkout 数据里找下一个站

按「与现有能力重合度 × 付费证据」排：

| # | 候选 | 付费证据 | 我们能做的部分 | 真门槛 |
|---|---|---|---|---|
| 1 | **AI API 聚合站** | apimart 5.7 万 checkout / 36 万访问 / DR 65 / 1.1 年 | 选品页、比价、评测内容、多语言（西语市场已被验证） | 支付通道、上游额度、风控、运维成本 |
| 2 | **游戏虚拟商品导流** | 9 个新站 >5 万 checkout | 攻略/评测/比价内容 → affiliate | RMT 灰色、词竞争极高 |
| 3 | **垂类付费工具** | studyfetch 2 万、scite 3.7 万、migaku 8,514 | 前端 + SEO 落地页 | 核心算法/数据源 |

**我不推荐 2**（灰色 + 竞争），**3 需要产品基因**，**1 是唯一「技术门槛在可学范围内、且已有中国团队跑通」的**——但它本质是运营生意，不是建站生意。

## 五、对现有项目的直接含义

1. **furriq 不要指望订阅**：宠物品类 checkout 总量 30.9 万、17 个站、全是零售商。内容型宠物站没有付费市场，广告 + affiliate 是唯一路径。
2. **gridpaw 的 AdSense 是正确变现**：游戏品类 checkout 全在交易侧，内容侧只能吃广告。
3. **divination 同理**（此前已验证：占卜赛道最大 checkout 不过 5 千）。

## 六、口径与未验证项

1. **checkout 流量是估算值**，非营收；APV/客单价不可得，所以「流量 × 客单价」的收入推算没有做。
2. **「15.7% 进 checkout」不是转化率**——分子是 28d 快照，分母是 2026-09 月访问，两个窗口不同，只能看量级。
3. **Unknown 占 3,433 站（54%）**，分类缺失严重，任何品类结论都漏掉了这一半。
4. **zenfy.ac 的 885 万月访问 85% 来自 paid**，说明这类「学习/赚钱」站是买量生意，SEO 复制不了。
5. apimart.ai 的上游额度来源、毛利、合规状态均未知，仅从公开盘面推断。
6. 整月报告与 28d 快照的时间窗口不同，两者只在量级上可比较。
