# GridPaw 作战计划（2026-11-05 定稿）

> 用途：新会话的执行入口。本文件自带全部数据与裁决依据，执行时**不要重新调研已结案的项**。
> 上游文档：`research/2026-11-05-next-direction.md`（方向定义）、`research/2026-11-04-mediavine-journey-application.md`（审核资料包）

---

## 0. 一句话

**2027-01-04（Mediavine 重申）之前只巩固不扩张；重申后第一枪 = `Rooms & Exits` 第一章（32 关，trickystory 只做了 12 关），第二枪 = `akari solver` 修一页推到前 3。**

---

## 1. 基线数字（全部有出处，执行时直接引用，不必重查）

| 项 | 数值 | 出处 |
|---|---|---|
| 流量结构 | 攻略 **93.4%** / 可玩 1.8% / 工具 0.8% | GSC 28d，2026-11-05 |
| Tier1 sessions | 2,627 / 30d（门槛 1,000，**2.6×**） | GA4 552793510 |
| BP3 单点依赖 | **81%** 点击来自一款 2025-12 上架手游 | GSC 页级 |
| BP3 效率 | 70 页 → 4,367 点击/28d = **62 点击/页** | GSC |
| 可玩层参与度 | 59.6% engaged / 241s（全站第一） | GA4 landing quality |
| 工具层参与度 | 43.4% / 107s（全站最低），CTR 4.0% | GA4 |
| 攻略→游戏导流 | **0.1%**（11/11,489 pv）= 已判死 | GA4 二跳 |
| Mediavine 窗口 | 域龄 120 天 2027-01-02 + 被拒冷却 60 天 = **2027-01-04 之后** | 官方拒因 |
| webcafe 余额 | **1,608**（2026-11-05，本轮查完） | 工具回执 |

---

## 2. 候选裁决（已结案，不要再验）

| 候选 | 月量 | SERP 实际情况 | 生产条件 | 裁决 |
|---|---:|---|---|---|
| **Rooms & Exits** | 头词 5,400，**真实盘子 8,000-10,000** | KD 25-37；**7/10 是 YouTube**，网页位只有 trickystory(#2/#4)+rgamereview(#2/#5) | **需截图** | ✅ **第一枪** |
| BP Tricky Quest | 2,900 | trickystory 铺 162 页仍排 **#23** = 内容质量门槛低 | 文字产线可复用 | ⏸ 备胎（A 失败则上） |
| BP2 Logic Twist | 2,090 | trickystory #4 | 可复用 | ❌ 对手太强 |
| BP Tricky Test | 4,190 | trickystory #3 | 可复用 | ❌ 对手太强 |
| Color Block Jam | 16,050 | trickystory #14-17（弱） | 图示 | ❌ casual 品，卡关率低，不「烧脑」 |
| Fillwords | 1,090 | trickystory #1 | — | ❌ 被打死 |
| Word Kitchen | 4,670 | trickystory #7 | 需日更 | ❌ 日更型，吃不了 |
| **solver 新品类** | 4 曝光级 | — | — | ❌ **不扩**（见 §3.3） |
| 新游戏（rotate rings 类） | RR 11.1M 下载 / 0 query | — | — | ❌ 需求滞后，relaxing 品不产生攻略需求 |

---

## 3. 为什么是 R&E（四条证据链）

### 3.1 每页效率 40 倍
trickystory 全站 14,413 页 / 5,322 etv = **0.37/页**。
`rooms-exits` **115 页 → 1,679 etv = 14.6/页**（全站约 31% 流量）。

| 对照游戏 | 总页 | etv | etv/页 |
|---|---:|---:|---:|
| rooms-exits | 115 | 1,679 | **14.6** |
| BP Tricky Test | 79 | 108 | 1.36 |
| BP3 | 180 | 65 | 0.36 |
| Fillwords | 1,617 | 188 | 0.12 |
| Loop Sort | 607 | **0** | **0** |

### 3.2 他在跑偏，空窗在那儿
trickystory 近 6 周（09-24 → 11-03）**1,900 篇**，全部砸新游戏：
fillwords 571 / loop-sort 450 / bus-fever-party 307 / sand-blocks 270 / block-out 150 / foodie-pop 120。
**rooms-exits 6 周 0 篇。**

→ 他最近 6 周 ≈ 250 etv（0.13/页），而赚钱的还是那个老存量。**这和我们自己的 Rotate Rings 结论同源：新 ≠ 有钱，卡关才 = 有钱。**

### 3.3 solver 只修不扩
GSC 60d 实测，solver 类共 127 条 query / 283 曝光：

| 词 | 曝光/60d | 我方位次 |
|---|---:|---:|
| **akari solver** | **130** | **6.8** |
| shikaku solver | 66 | 3.0 |
| nonogram 系 | 38 | 3.0 |
| picross solver | 4 | 40.5（未覆盖） |
| hashi solver | 3 | 12.7 |

**akari solver 一个词的曝光 = 其余总和。** 已有页面 `/akari/solver/`，只差排名。
→ **不新建任何 solver 页**；只做 `/akari/solver/` 一页的 On-page 强化。

### 3.4 第一章是最大的空缺
| 章节 | trickystory 已做 | 游戏实际 |
|---|---:|---:|
| Chapter 1 | **12** | **32 关**（首发章） |
| Chapter 2 | 27 | ~24 |
| Chapter 3 | 25 | 15-16 |
| Chapter 4 | 16 | — |
| Chapter 5 | 16 | — |
| Chapter 6 | 11 | — |
| Chapter 7 | 6 | — |

**Chapter 1 缺 20 关**，且是首发章（老玩家多、搜索积累久）。

---

## 4. 风险（必须写进决策）

| 风险 | 量化 | 应对 |
|---|---|---|
| **视频意图占 7/10** | 纯文字页只能抢 2-3 个网页位 | 每页配 1 段视频/图组；中长期自建 YouTube 频道抢视频位 |
| **每关量薄** | 10-70/月/关（BP3 是 62 点击/页） | 靠 32 关累积 + 头词页；不要指望单关爆 |
| **头词在衰减** | 8,100（2026-01）→ 4,400（2026-09） | 老游戏，衰退不可避免；按「还能吃 12-18 个月」规划 |
| **截图/视频生产** | 新产线，我们没有 | **Phase A 必须先验证**，拿不到合法素材就换备胎 |
| **对手 2 家都在** | trickystory #2、rgamereview #2-5 | 靠质量（1,311 词/页）与覆盖度（32 vs 12 关）压 |

---

## 5. 执行阶段

### Phase A — 样张验证（**先做这个，不批量化**）

| 步 | 动作 | 验收 |
|---|---|---|
| A1 | 选 `Chapter 1 Level 2（Escape Room）` 做样张（公开攻略文字已存在，便于核对步骤正确性） | 选定即完成 |
| A2 | 解决截图来源，三条候选路：①`yt-dlp` 抽 YouTube 通关视频帧 ②无头模拟器自己玩（skill `android-emulator-headless`）③抓商店截图 | **产出 ≥3 张可用、无版权争议的图** |
| A3 | 写 1 页完整攻略（结构对齐 trickystory 同页，但字数与深度超它） | ≥900 词 + 3 图 + 道具链完整 + 内链三向（章节 hub / 上一关 / 下一关） |
| A4 | 对照 trickystory 同页：字数、步骤数、图数、页面结构 | 给出对比表 |

**Phase A 的失败条件（写死，别自我说服）：**
> 如果 A2 在 **2 小时内**拿不到 3 张可合法使用的图 → **放弃 R&E，切备胎 BP Tricky Quest**（文字产线现成）。

### Phase B — Chapter 1 补齐（Phase A 通过后）

- 目标：**Chapter 1 全 32 关**，优先做 **13-32**（trickystory 缺的部分，20 关）
- 节奏：**每天 3-5 关**（≈ 1 周完成）
- 每页标准：≥900 词、道具链按顺序、关键节点配图、FAQ 1-2 条、三向内链
- hub 页：`/rooms-and-exits/`（章节导航 + 玩法说明 + 常见卡点）+ `/rooms-and-exits/chapter-1/`
- 上线纪律：build → dist 校验 → deploy → curl 复验（同既有流程）
- 观察窗口：上线后 **4 周**看 GSC 曝光；低于 500 曝光/月则暂停不铺 Chapter 2

### Phase C — 2027-01-04 之后

1. 重申 Mediavine（**法老本人操作**，我不代提交）
2. 通过后：Chapter 2-7 补齐 + 头词页专题化
3. **Terra/广告接入 = 下一轮议题**（法老 2026-11-05 明确：放到下一轮，本轮不动）
4. 游戏页分发（CrazyGames）：**CG 账号卡在 Google 验证，法老空了再弄**（ego space 21 已移交，`agentDelegatedToUser`）

---

## 6. 红线（任何阶段不得突破）

1. **游戏页 / 首页 / `?embed=1` 零文内广告**
2. **不为铺而铺**：1,311 词/页、5-gram Jaccard 0.18 是审核资产；sand-blocks 的 800 词/0.312 模式**严禁**用于 2027-01-04 前
3. **截图版权**：只用自有截图或明确许可来源；不盗图
4. **不虚构**：关卡步骤必须可复现，不能编
5. 部署前 `ps aux | grep astro build|wrangler` 确认无并发构建
6. 改动先出方案等确认（法老既有要求）

---

## 7. 不做清单（已判死，别再提案）

| 事项 | 判死依据 |
|---|---|
| 攻略→可玩站内导流 | GA4 0.1%，提出即判死 |
| 用 gridpaw.com 打游戏品类头词 | 前十中位站龄 20 年 |
| 追刚上线的新游戏 | Rotate Rings 11.1M 下载 → 4 query |
| 扩 solver 品类 | picross 4 曝光/60d |
| 铺薄内容换量 | Mediavine 审核风险 |
| 多语言乘攻略 | de 30 页实证：排名 1.5-6.8 但每词 1-5 曝光 |
| 跟 trickystory 的产量/追新 | 他自己 1,900 篇 ≈ 250 etv |

---

## 8. 附：可复用的侦察工具（本计划产出的资产）

```bash
# trickystory 的 WordPress REST API 全开 —— 最好的“对手在干什么”雷达（免费、实时、比 sitemap 准）
curl -s "https://trickystorywalkthrough.com/wp-json/wp/v2/posts?per_page=100&orderby=date&order=desc&_fields=date,link,title"
# 总篇数在响应头 X-WP-Total
```

> sitemap 的 `lastmod` 是批量刷的（同一天 155/330/325 条），**不可作为发布信号**。

---

## 9. 待法老拍板

| # | 事项 | 默认建议 |
|---|---|---|
| 1 | Phase A 截图来源优先走哪条（yt-dlp / 模拟器 / 商店） | yt-dlp 抽帧（最快） |
| 2 | Chapter 1 是 32 关全覆盖还是只补 13-32（20 关） | 先补 13-32，看数据再补 1-12 |
| 3 | 是否同期启动 YouTube 频道（抢 7/10 视频位） | 先不做，等 Phase B 数据 |
