# 工具站方向：新词 & 新站数据交出的答案（2026-11-09）

> 分支：`newsource`（从 `main` 9b761577 拉出，worktree 隔离，不影响 `fix-情报舱` 的并行 WIP）
> 数据：本地 webcafe 库 2026-11-09 09:01 快照（keywords 344 批 / launches 110 批 / hosted 27 批 / income 31 份），0 积分
> 口径：hosted 只覆盖 github.io / pages.dev / vercel.app，**不含独立域名新站**；clicks 是估算值，非搜索量

## 结论先行

**工具站里唯一有「可复制证据 + 与现有能力重合 + 竞争未饱和」三件事同时成立的方向，是「新游戏工具站」——给刚上线 / 即将上线的服务型游戏做 timer / calculator / interactive map / database / build planner。**

其余三个方向按证据强度依次是：开源软件平替（ArtCraft 词族，新词侧唯一连贯的工具族）> 非英语单页工具（日韩语，被低估但生命周期短）> AI 内容后处理（需求最大但平台对抗风险极高）。**通用工具 / AI 包装工具明确不做。**

---

## 一、三个数据池的工具类盘面

### 1.1 新站库 launches（HN/X 新发布，去重 5,275 条）

| 项 | 读数 |
|---|---|
| tool 类占比 | **1,067 条 / 20.2%**（最大单类之一） |
| keyword 字段重复度 | **最高只有 3 次**（url shortener），2 次的有 15 个 |
| 意图分布 | AI 包装/agent 工具 **844**、开源平替 **392**、生成器 312、开发者工具 284、追踪监控 214 |
| 变现标注 | 免费 1,036 / 订阅 502 / 一次性付费 320（多为 AI 类） |

**读法：** 供给端已经爆炸（20% 的新发布是工具），但「同一个小工具被 3+ 人独立做」的强需求信号在一个月的窗口里几乎不存在——最大重复度只有 3 次。**这一池不能当趋势雷达，只能当需求词典**（上一轮结论继续成立）。真正的信号在开源平替（392 条），因为它是唯一「有名字、成族、能追」的集群。

### 1.2 新词库 keywords（去重 14,256 词）

| 项 | 读数 |
|---|---|
| tool 类词 | 534 个（3.7%） |
| verdict 分布 | worth **10**（1.9%）/ maybe 161 / skip 358 |
| 连贯工具新词族 | **ArtCraft 族**：artcraft（worth，heat 6.59，对应 111 页）、filmcraft（worth）、photocraft / lightcraft / pdfcraft / spotifast（maybe） |

**读法：** 搜索侧的工具新词极稀薄——534 个工具词里只有 10 个 worth。但 ArtCraft 族是例外：一个连贯的新词族 + brief 明确指向「做下载导航站或教程站」。外部验证：Brandon Thomas 用 Opus 5.5 在纯 Rust 里重建 7 个 Adobe 应用，PetaPixel 2026-10-07 报道，官方站 getartcraft.com 已上 16 个 app——这是 2026-10 的真实爆点，不是列表噪声。

### 1.3 新站增长池 hosted（5,139 站，28d 点击）

工具型关键词（28d ≥ 1,500）**共 286 条**。按点击排头部：

| 关键词 | 28d clicks | 站数 | 首现 | 类型 |
|---|---:|---:|---|---|
| bad time simulator | 329,610 | 9 | 2025-07 | 游戏模拟器（红海） |
| gemini watermark remover | 141,760 | 4 | 2025-12 | AI 图片后处理 |
| pokemon team builder | 125,480 | 4 | 2025-07 | 游戏组队工具 |
| minecraft enchantment calculator | 120,330 | 2 | 2025-07 | 游戏计算器 |
| warp generator | 91,430 | 17 | 2025-07 | 图形生成器（红海） |
| azgaar's fantasy map generator | 90,240 | 2 | 2025-08 | 地图生成器 |
| phasmophobia cheat sheet | 77,190 | 3 | 2025-07 | 游戏 cheat sheet |
| arknights recruitment calculator | 61,340 | 4 | 2025-07 | 游戏计算器 |
| factorio calculator | 34,680 | 3 | 2025-07 | 游戏计算器 |
| nfsu2 save editor | 30,110 | 1 | **2026-10** | 游戏存档编辑器 |
| anvil calculator | 27,920 | 2 | **2026-10** | 游戏计算器（Minecraft 铁砧） |
| rdr2 map | 20,690 | 2 | 2025-07 | 游戏互动地图 |
| balatro calculator | 15,300 | 2 | 2025-07 | 游戏计算器 |
| azeroth survivors save editor | 10,080 | 1 | **2026-10** | 游戏存档编辑器 |
| ck3 coat of arms maker | 7,490 | 1 | **2026-10** | 游戏生成器 |
| maplestory exp tracker | 7,540 | 1 | **2026-11** | 游戏追踪器 |

**工具词 top 20 里 15 个是游戏工具。** 且多是单页站（p=1）起量、站数 1-4（竞争未饱和）。

2026-10/11 首现的新词窗口（不限工具）同样密集：ps5 emulator 258,130（1 站）、nusa github 130,810、gta 5 online 106,150、inazuma rogue 59,430、youtube video to mp3 converter github 33,280、nfsu2 save editor 30,110、anvil calculator 27,920。

---

## 二、四个方向对比

| 方向 | 需求证据 | 竞争密度 | 变现 | 与现有能力匹配 | 生命周期风险 | 判定 |
|---|---|---|---|---|---|---|
| **A. 新游戏工具站** | 工具词 top20 中 15 个；单页 3-15 万 clicks/28d；2026-10 起新词密集 | 站数 1-4，**未饱和**；窗口期新域名能进 | 广告为主（AdSense）+ 游戏充值联盟 | **高**：Astro 单页 + solver 引擎 + 品类反推监控线 + AdSense | 中（跟着游戏生命周期，3 个月-2 年） | **推荐** |
| **B. 开源软件平替** | ArtCraft 族 6 个连贯新词 + PetaPixel 报道 + 官方 16 apps | 已有官方站与媒体占位；导航/教程站可差异化 | 广告为主，affiliate 弱 | 中：内容站能力可复用，但无「工具」壁垒 | 低（开源生态持续） | **次选** |
| **C. 非英语单页工具** | 日韩 CJK 词 184 条 28d≥2000：浮気判定シート 113,700、文字ブレード 114,480、時報 53,870、핀볼 52,500、絵文字メーカー 29,290、avif jpeg 変換 22,160 | 多为 1 站 | 广告 | 中：有多语言页面经验（de/pt-br），无日语市场认知 | **高**（梗型需求，1-6 个月） | 观察，不主推 |
| **D. AI 内容后处理（水印去除）** | gemini watermark remover 141,760/28d，4 站；dola ai 2,710 | 已在红海化：geminiwatermark.io、geminiwatermarkremover.io、visualgpt.io、gradually.ai 等独立域名站入局 | 可订阅，最好 | 低：无图像算法积累 | **极高**：与 Google 平台政策对抗，官方一旦取消/更换水印，需求归零 | **不做** |

**为什么 D 直接否**：这不是普通竞争问题，是「需求寄生在平台政策上」。搜索首页现在能同时看到 6+ 个水印去除站，说明红利期已被抢完；而一旦 Google 官方改水印（社区已有「Gemini 取消水印」的讨论帖），整条线一夜清零。投入产出比最差。

**为什么通用工具/AI 包装不做**：launches 844 条 AI 包装工具、1,067 条 tool 发布，关键词重复度最高 3 次——供给分散且无壁垒，做出来就是第 1,068 个。

---

## 三、A 方向的实证：aion2hub.com 的完整剧本

Aion 2（2026-10-05 发售）的词族是这一轮最干净的样本：

| 证据 | 读数 |
|---|---|
| 主词热度 | `aion 2` heat 41.17（新词库全库罕见高值），84 个已有页面 |
| 工具词进榜 | aion 2 timer（heat 1.04）、rift timer（0.934）、hidden cube（worth，1.184）、map（1.436，回落中）、interactive map（0.07，已明显回落） |
| 新域名在抢 | aion2hub.com（2025 注册）、shugo.gg（2025-12）、metaroad.gg、metabot.gg、aion2namegenerator.com/.pro/.org |
| 赢家形态 | aion2hub.com 一套完整工具：Rift Timer / DPS Meter / Build Calculator / Item Database（13,000+ 物品）/ Interactive Maps |

**剧本可复制：** 服务型游戏上线前 1-2 个月注册域名 → 上线即上线全套工具（timer + calculator + map + database）→ 吃「游戏名 + 工具词」的长尾。工具形态跨游戏复用，开发成本逐游戏递减。

**上游信号用户已经有**：`DEV-MONITOR.md` 的品类反推线（Play dev 页每周巡查）就是在监控新游戏——现在只是把「建攻略页」扩展成「建工具页」。

---

## 四、我建议的下一步（按优先级）

| # | 动作 | 成本 | 验收 |
|---|---|---|---|
| 1 | **定赛道**：从「服务型游戏」里选 1 个 2026-11~2027-01 上线的候选（MMORPG / 生存建造 / 大型 PvE），要求社区有 timer/map 类需求 | 30 分钟（DEV-MONITOR + Play/Steam 发售表） | 产出 1 个游戏名 + 3 个工具词 |
| 2 | **花积分验证**：候选游戏 3 个工具词过 MCP（keyword_volume + keyword_difficulty） | 约 12 积分 | 词有量、KD 可打 |
| 3 | **做单页 MVP**：timer 或 interactive map 一页，Astro + CF Pages，独立测试域名 | 1-2 天 | 上线 + IndexNow |
| 4 | **28 天 GSC 读数**：曝光/点击/排名，对照 aion2hub 的同词位置 | 0 | D+28 出判断 |
| 5 | 若 MVP 通过 → 补齐 calculator + database，形成工具套件；不通过 → 停，不追加 | — | — |

**不建议现在就开正式新项目**：先单页 MVP 验证需求，再谈项目化。用户现有 8 个项目，边际注意力是最贵的成本。

---

## 五、口径与未验证项（诚实标注）

1. **hosted 池不含独立域名站**——真实工具站生态比这更大，也意味着竞争比这里看到的更激烈。
2. **clicks 是估算值**，只能做相对比较，不能当收入或搜索量。
3. **「变现靠广告」是推断**：income 库的 checkout 盘面（工具/SaaS 类 1,502 站，头部全是 canva 603k / lovable 548k / openrouter 423k / cursor 291k 这类成熟 SaaS）说明**单页免费工具站不走 checkout**，广告是唯一现实路径；具体 eCPM 未测。
4. **A 方向的关键未验证项**：游戏工具词的 CPC / AdSense eCPM。若单页 10 万 clicks/月、eCPM $0.3，月收入约 $30——**这可能根本不值得做**。这是本报告最大的未知，必须在 MVP 前用 MCP/AdSense 数据补上。
5. ArtCraft 族热度依赖单个开发者的持续输出（Brandon Thomas + Opus 5.5），非稳定需求。

---

## 六、原始数据落点

- 分析脚本：`~/.hermes/cache/scratch/tool-site-analysis.py`、`tool-site-analysis2.py`
- 明细：`~/.hermes/cache/scratch/tool-launches.json`（1,067 条 tool 发布）、`tool-keywords-worth.json`（171 条 worth/maybe）、`hosted-growth.json`
- 数据源：`~/workspace/tools/webcafe-data/data/`（2026-11-09 09:01 同步）
