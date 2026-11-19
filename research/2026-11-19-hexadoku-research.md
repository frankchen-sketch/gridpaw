# Hexadoku（16×16 数独）选品评估 — 结论：**做**

> 2026-11-19。用户提到「看到一个 hexasudoku / hexadoku 好像也不错」，按 skill `puzzle-game-expansion-research` 评估。
> ⚠️ 同日 v1 文件 `2026-11-19-hexasudoku-research.md` 评估的是**六边形网格数独**（错误对象），已判不做；用户澄清是 **hexadoku**，即 **16×16 数独**。两件不是同一个玩法，本文件为准。
> 数据源：web.cafe `keyword_volume`（Google Ads/KWP，fromCache=false 实读）、`serp_review`（哥飞 KD）、`search_known_keywords`；App Store API；仓库代码直读。

## 一句话区分

| | hexasudoku | **hexadoku** |
|---|---|---|
| 玩法 | 六边形网格数独（hex grid） | **16×16 数独**：每行/列/4×4 区块填 0-9 + A-F |
| 代表产品 | hexgamebox.app/hexsudoku、Steam `Hexdoku`（Steam 页只有 **22 条评价**） | krazydad / sudokubliss / 1sudoku 的 16x16 页 |
| 月搜索量 | `hexasudoku` **null**；`hex sudoku` 词簇 170 | **`16x16 sudoku` 2,400**；`sudoku 16x16` 1,000 |
| KD | 9 | **26.6** |
| 结论 | ❌ 不做（见 v1） | ✅ **做** |

## 结论：做

三条理由，都可量化：

1. **量够**：`16x16 sudoku` **2,400/月** + `sudoku 16x16` **1,000/月**（两簇部分重叠，保守按 2,400 算）。衍生：`16x16 sudoku solver` 70、`16x16 sudoku printable` 50、`hexadoku` 110、`hexadoku printable` 20。
2. **SERP 有空窗**：KD **26.6（容易）**。第一页 9 个位子里 **sudoku-royal.com DR1（排 #4）、sudokuleader.com DR11、sudokuweekly.com DR0** 三个极弱站，行为数据组内垫底（第 22-28 百分位，停留 3 秒级）。
3. **长尾簇有大水**：`sudokubliss.com`（20 个月新站，DR51）靠这个词簇一个月吃 **64.6K 流量**——真实搜索盘子远大于 2,400，只是被拆散在几十个变体词里。

## 引擎成本：低（关键优势）

直读 `src/lib/puzzle-core/`：

| 现有资产 | 能否复用 |
|---|---|
| `calcudoku-engine.ts` 的 `makeLatinSquare(size, rng)` | ✅ 直接出 16×16 拉丁方 |
| 唯一解校验（`countSolutions` + 逐格回填） | ✅ 同构 |
| `star-battle-engine.ts` 的 `generate(N, K, difficulty, seed)` 参数化接口 | ✅ meowdoku 已用它做 6×6（`SB.generate(6, ...)`），N/K 可变的先例在 |
| 经典 9×9 数独引擎 | ❌ **仓库里没有**（只有 meowdoku 6×6、murder-sudoku 叙事版、akari 内容页） |

**做法：一次写 9×9 + 16×16 同一套引擎**（N/K 参数化，16×16 只是 N=16、K=4、符号 0-F）。**不是新拓扑，是新参数**。估 1.5-2 天。

## 收益测算

```
保守：2,400/月 × 排 #3 的 12% CTR ≈ 290 点击/月
乐观：簇宽 8,000-15,000/月（参照 sudokubliss 64.6K），排前 3 拿 10-15% ≈ 800-2,000 点击/月
基准：BP3 单关页实测 62 点击/页/月
```

保守值已是 **5 个 BP3 长尾页** 的量，并有 4 个衍生页可再吃一层。

## 页型规划

| 页 | 目标词 | 量 |
|---|---|---|
| `/16x16-sudoku/`（主力） | `16x16 sudoku`、`sudoku 16x16` | 2,400 + 1,000 |
| `/16x16-sudoku/solver/` | `16x16 sudoku solver`、`hexadoku solver` | 70 + 10 |
| `/16x16-sudoku/printable/` | `16x16 sudoku printable`、`hexadoku printable` | 50 + 20 |
| `/hexadoku/`（同义入口页） | `hexadoku`、`hexadoku online` | 110 |

⚠️ **关键词蚕食**：`hexadoku` 与 `16x16 sudoku` 同义。按 skill `keyword-cannibalization-consolidation`——核心词归 `/16x16-sudoku/`，`/hexadoku/` 做简版 + 内链指向上抽，不复制全文。

## 竞品弱点（可直接打的缝）

- **sudoku-royal.com（DR1，排 #4）**：跳出 48%、停留 1:09、28 百分位 → 能玩但体验差
- **sudokuleader.com（DR11，8 个月）**：停留 **3 秒** → 静态图或半死页
- 共同缺口：**没有可玩的 16×16 交互盘、没有 solver**。我们的「打开就能玩 + 卡住能解」正好打这个缝

## 风险

1. **CPC 低**（$0.10-0.32）→ 单页广告收入低，靠量堆。全 puzzle 品类通病
2. **16×16 移动端渲染**：16 列在手机上挤，需要横屏/缩放/分块方案
3. **生成器性能**：16×16 唯一解比 9×9 贵，需构建期预生成（仿 meowdoku 的静态 levels.json）

## 什么时候判死

- 上线 8 周 GSC 曝光 < 500 且无排名 → 页面/内链问题（KD 26.6 不该打不进），不是词
- 移动端跳出 > 70% → 改渲染，不改选品

## 与当前路线

- Train Tracks（第 12 个引擎）在飞，与 16×16 数独不冲突（新拓扑 vs 参数化复用，量级差一个档）
- 建议顺序：Train Tracks 收尾 → 16×16 数独（2 天）→ 四个衍生页

## KWP 实测对照（2026-11-19，法老截图，美国 2025-11 ~ 2026-10）

| 关键词 | 月均搜索量 | 同比 | 竞争 | 顶部出价 低-高 |
|---|---|---|---|---|
| **16x16 sudoku** | **1000-1万** | 0% | 低 | $0.02 - $1.73 |
| **mega sudoku** | **1000-1万** | 0% | 低 | — |
| **hexadoku** | 100-1000 | **+900%** | 低 | $0.40 - $3.77 |
| 16x16 sudoku printable | 100-1000 | 0% | 低 | — |
| **16x16 sudoku online** | 100-1000 | 0% | 低 | $0.59 - **$5.24** |
| sudoku 12x12 | 100-1000 | 0% | 低 | — |
| 25x25 sudoku | 100-1000 | 0% | **中** | — |
| giant sudoku | 100-1000 | 0% | 低 | — |
| sudoku with letters | 100-1000 | 0% | 低 | $0.75 - $3.47 |
| sudoku 16 | 100-1000 | 0% | 低 | $0.64 - $2.00 |
| 16x16 sudoku solver | 10-100 | **-90%** | 低 | — |

**四条判读：**

1. **两口径对上了**：KWP 给 `16x16 sudoku` 1000-1万 的区间，web.cafe 精确值 2,400 落在区间内 —— 盘子确认，不是虚高。
2. **`hexadoku` 同比 +900%**：web.cafe 显示它 12 个月从 ~10 涨到 110/月。**新兴词，早期占位窗口**。
3. **出价推翻了我原先的「CPC 低」风险判断**：`16x16 sudoku online` 顶部出价高区间 **$5.24**、`hexadoku` **$3.77**、`sudoku with letters` **$3.47** —— 有广告主真在出价，AdSense RPM 不会像 web.cafe 的 avg CPC $0.32 那么惨。
4. **`16x16 sudoku solver` 同比 -90%**：solver 需求在萎缩（可能被 App 和工具吞掉）→ **不做独立 solver 页**，只在主页面板里带一个求解器当留存工具，不单独吃词。

**未出数据/被裁的 11 个词**（等补图）：`sudoku 16x16`、`16x16 sudoku free`、`16x16 sudoku hard`、`16x16 sudoku pdf`、`16x16 sudoku numbers and letters`、`hexadoku printable`、`hexadoku solver`、`hexadoku online`、`hexadoku hard`、`12x12 sudoku`、`large print sudoku`。

## 修正后的页型规划：做「大格数独集群」，不是单页

KWP 暴露了一个更重要的事实：**`mega sudoku` 也是 1000-1万**，`12x12`/`25x25`/`giant`/`sudoku with letters` 各 100-1000。这是一整条「大格数独」产品线，共用一个 N 参数化引擎。

| 页 | 目标词 | 量 | 优先级 |
|---|---|---|---|
| `/16x16-sudoku/` | 16x16 sudoku、sudoku 16x16 | 1000-1万 | P0 |
| `/mega-sudoku/` | mega sudoku、giant sudoku | 1000-1万 + 100-1000 | P0 |
| `/hexadoku/` | hexadoku、hexadoku online | 100-1000（+900%） | P1 |
| `/12x12-sudoku/` | 12x12 sudoku、sudoku 12x12 | 100-1000 | P1 |
| `/25x25-sudoku/` | 25x25 sudoku | 100-1000（竞争中） | P2 |
| `/sudoku-with-letters/` | sudoku with letters | 100-1000 | P2 |

引擎一个，N ∈ {12, 16, 25} 参数化 + 符号集可配（数字 / 数字+字母）。蚕食处理：每页独立内容（不同格数规则、不同难度、不同示例盘），`/hexadoku/` 作 16×16 的同义入口但正文不重复。

## 数据口径

- 搜索量：KWP US，`fromCache=false`（2026-11-19 实读）。`16x16 sudoku`（2400→1900）与 `sudoku 16x16`（1000→720-880）曲线不完全一致，**不能简单相加**
- KD：web.cafe 哥飞版（`serp_review`）
- 竞品流量：web.cafe 快照（sudokubliss 90.9 万/月，该词带 64.6K）
- 引擎判断：直读 `src/lib/puzzle-core/` 六个引擎文件 + `MeowdokuPlay.astro` 的 `SB.generate(N, K, ...)`
