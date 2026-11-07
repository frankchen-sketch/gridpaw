# Rooms & Exits 复核（2026-11-08）

> 触发：BP3 复核发现「GSC 零信号 ≠ 没需求」的判据错误，怀疑 battle-plan 的 R&E 判断同源出错。
> 结论：**需求真实、空窗存在，但缺口比 battle-plan 估计的大 3 倍。**
> **开工前置：等 BP3 L54-136 铺完。** 本文备齐开工所需信息，届时直接执行。

---

## 1. 实测证据

### 1.1 SERP（`rooms and exits chapter 1 level 15 walkthrough`，KD 32.5，2026-11-08）

| 位 | 域名 | DR | 类型 |
|---|---|---|---|
| 1, 2, 4, 5, 6, 9, 10 | youtube.com | 99 | 视频 ×7 |
| **3** | **rgamereview.com** | **26** | 综合（**最弱位**） |
| **7** | **trickystorywalkthrough.com** | **0** | 专营，**月带 310 流量** |
| 8 | tiktok.com | 97 | 视频 |

**结构与 BP3 完全一致：8/10 是视频平台位，网页位只有 2 个（DR 26 + DR 0）。**

trickystory 的 `rooms-exits-chapter-1` 是它自己流量表里的主力词（月 310）→ **需求是真实的，不是推测。**

### 1.2 游戏真实规模

| 项 | 数值 | 来源 |
|---|---|---|
| 总关卡 | **105 关** | levelsolve.com hub（明写 "105 total levels"） |
| Chapter 1 | 31-32 关 | walkthroughs.net（"31 levels" / "32 levels" 两处表述） |
| Chapter 2 | 20-24 关 | walkthroughs.net |
| Chapter 3 | 15 关 | walkthroughs.net |
| Chapter 4-7 | 余下 | walkthroughs.net（"two new chapters added"） |

### 1.3 竞品格局（battle-plan 只看了 trickystory，漏了两个）

| 竞品 | 覆盖 | 粒度 | 威胁 |
|---|---|---|---|
| **levelsolve.com** | **前 50 关（48%）** | **1 关 1 页（与我们同粒度）** | **高** |
| walkthroughs.net | 逐关页（Ch2 L17 / Ch3 L2 / Ch4 L7 均有） | 1 关 1 页 | 中 |
| trickystorywalkthrough.com | 7 个章节页 + 1 hub | 1 章 1 页（粗） | 低（粒度粗，但月 310 流量） |
| rgamereview.com | 未知 | 内页 | 低（DR 26） |

---

## 2. 缺土地图

```
全局关卡  1──────────────────────────────────────────────105
我们      [1-11] ██  （11 关，10%）
levelsolve    [1-50] ████████████████████████████  （50 关，48%）
trickystory   章节页×7（粒度粗）
完全空窗                                          [51-105] 55 关
```

| 批次 | 范围 | 状态 | 依据 |
|---|---|---|---|
| 已完成 | 全局 L1-11（chapter-1-level-1~11） | ✅ 已上线 2026-11-07 | 7 agent 并行产出，配方见 `2026-11-07-rxe-level-recipe.md` |
| **第 2 批** | **Chapter 1 L12-31/32（约 20 关）** | 待做 | 补齐 Chapter 1 完整性；SERP 已证明该章节有需求 |
| 第 3 批 | 全局 L51-105（55 关） | 待做（**最大空窗**） | levelsolve 停在 50 关，之后无同粒度竞品 |
| 中间地带 | 全局 L33-50（18 关） | 竞品已占 | levelsolve 有，我们没数据判断该段流量 |

---

## 3. 开工顺序与判断依据

### 第 2 批：Chapter 1 剩余（L12-31/32）

**现在就能做**，理由：
- SERP 证明该章节需求真实（trickystory 章节页月 310 流量）
- 我们已有 11 关模板跑通（配方现成）
- **补齐一个完整章节**有整体价值：用户看到「Chapter 1 全关卡都有」的站，信任度高于碎片站

### 第 3 批：L51-105（55 关空窗）

**必须先验证 L33-50 的流量**，理由：
- levelsolve 做到 50 关就停了，可能是「50 后没需求」，也可能是「还没做」
- 中间 18 关（L33-50）是判断依据：若 our 数据 + 竞品数据显示该段仍有量，则 51+ 值得做
- **验证方式**：等我们 L1-11 跑满 2 周（约 2026-11-21），看 GSC 的曝光/点击曲线是否随关卡深度衰减

### 关键判断（待验证）

**如果 L1-11 的曝光曲线像 BP3 一样平坦**（不随深度衰减）→ L51-105 全部值得做，这是 55 关的大空窗。
**如果曲线在 L8-11 明显下降** → R&E 的玩家留存弱于 BP3，只补 Chapter 1 就够。

---

## 4. URL 结构确认（已排查，无风险）

| 项 | 结论 |
|---|---|
| 我们的结构 | `/rooms-and-exits/chapter-1-level-N/` |
| 行业惯例 | walkthroughs.net 用 `rooms-and-exits-chapter-2-level-17-walkthrough` → **同结构，正确** |
| levelsolve 用全局编号 | 它是「章节嵌套但按发布顺序列」，与我们的章节式兼容 |
| 后续章节 | Chapter 2+ 新建 `chapter-2-level-N/` 目录即可，不冲突 |

⚠️ **唯一注意点**：Chapter 2 的 level 编号从 1 开始（章节内编号），不要用全局编号，否则 URL 会与 walkthroughs.net 不一致且玩家搜不到。

---

## 5. 开工清单（BP3 完成后直接执行）

1. **确认 Chapter 1 边界**：查游戏内 Chapter 1 到底 31 还是 32 关（walkthroughs.net 两处说法不一致）
2. **拉素材**：按 `2026-11-07-rxe-level-recipe.md` 的 yt-dlp + 抽帧 + 三级读图流程
3. **分批**：7 个 agent 并行，每批 7 关（L12-18 / L19-25 / L26-31/32）
4. **验收**：沿用配方 §6 自检（词数 ≥1,400 / 图 ≥8 / FAQ ≥4 / JSON-LD 可解析）
5. **发布节奏**：每批完成后部署 + IndexNow，间隔 1-2 天，避免 20 页一次性上线

---

## 6. 本复核纠正的 battle-plan 偏差

| battle-plan 原文 | 实测 |
|---|---|
| 「第一章 32 关，trickystory 只做 12」 | Chapter 1 是 31-32 关；trickystory 做的是**1 个章节页**，不是 12 关 |
| 「网页位只有 trickystory(#2/#4)」 | 实际是 trickystory(#7) + rgamereview(#3, DR26)，且 8/10 是视频位 |
| 未提及 | **levelsolve.com 已覆盖前 50 关，同粒度（1 关 1 页）——这是最大威胁** |
| 未提及 | 游戏实际 **105 关**，不是 32 关 |

**结论不变（R&E 值得做），但必须知道：这不是空窗，是三强混战，且对手之一与我们同粒度。**
