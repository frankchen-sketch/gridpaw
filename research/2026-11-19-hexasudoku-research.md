# HexaSudoku（六边形数独）选品评估 — 结论：不做

> ⚠️ **本文件评估的对象有误，已被取代。** 用户说的其实是 **hexadoku = 16×16 数独**，不是六边形网格数独。正确评估见 `2026-11-19-hexadoku-research.md`（结论：**做**，2,400/月）。本文件保留作「六边形玩法」的记录：`hexasudoku` 本词 Google Ads 无数据，`hex sudoku` 词簇仅 170/月。
>
> 2026-11-19。用户提到「今天看到一个 hexasudoku 好像也不错」，按 skill `puzzle-game-expansion-research` 五维评估。
> 数据源：web.cafe `keyword_volume`（Google Ads/KWP 口径，fromCache=false 真新读）、`serp_review`、`search_known_keywords`；App Store Search API；DNS/HTTP 探测。

## 结论前置

**不做。** 玩法本身成立（六边形网格 + 每行/每区不重复，Steam 有 Hexdoku、网页有 hexgamebox.app），但**需求盘子只有 ~170-280 次/月**，排到第一也就 50-80 点击/月，低于我们现有单页水平。

## 五维评估

| 维度 | 实测 | 判定 |
|---|---|---|
| **需求盘子** | `hex sudoku` 170/月、`hexagonal sudoku` 170、`hexagon sudoku` 170（三词月曲线完全一致 = **同一个词簇，不是 3×170**）；`hexadoku` 110（70-140，+24%）；`hexasudoku` / `hexa sudoku` **Google Ads 口径 null**；`sudoku hexagon` 10 | ❌ 太小 |
| **SERP 可打性** | KD **9（极易）**。第一页 krazydad.com 占 **7/10**（DR68、域龄 23.2 年，但用户行为组内垫底：人均 2.8 页 / 停留 1:36 / 跳出 33%）；`sudokutodo.com` **DR4** 排 #3；Pinterest DR97 顺位 #7 | ✅ 能打进去，但打进去也没量 |
| **App 双杀** | App Store 搜 `hexasudoku` 返回 8 个六边形消除类（Hexa Shift / Hexa Master 3D / Hexdom），**没有一个同名产品**；搜 `hex sudoku` 全是普通数独 app | ✅ 无 app 卡位 |
| **引擎复用** | 数独约束（行/区不重复）可复用 meowdoku 引擎，但**六边形网格是新拓扑**（L0 需新增 hex 邻接/坐标），不是纯配置 | ⚠️ 中成本，非最低档 |
| **实现成本** | 新拓扑层 + 渲染器 + 生成器，参照 Train Tracks 的逐部件数法估 2-4 天 | 中 |

## 为什么不划算（算一遍）

- 词簇总量 ~170-280/月。假设排 #1、拿 35% CTR = **60-100 点击/月**
- 现有对照：BP3 单关页实测 **62 点击/页/月**（还是长尾页，不是品类头词）
- 也就是说：**做一整套新引擎 + 新页，产出约等于修好一个现有页**
- 参照 skill 的 `rotate rings` 教训：「能排进去」不是信号，「有人搜」才是。这里 SERP 有真实空窗（DR4 站能排 #3），但**搜的人太少**

## 与当前路线的关系

- gridpaw 正在做 Train Tracks（第 12 个引擎，`feat/train-tracks-cluster` 在飞）
- skill 明确：引擎扩产先决条件是**现有漏斗健康**，不是盘子大。同时开两条引擎线 = 加库存不加客流
- 01-04 前只巩固不扩张的既定方针里，Train Tracks 是唯一例外

## 什么情况下重开

任一条命中再评估：

1. `hex sudoku` / `hexadoku` 词簇月量破 **1,000** 且连续 3 个月（现在是 110-260 横盘，`hexadoku` 微升 +24% 但基数太小）
2. App Store / Play 出现同名或近名产品，且评分人数破千（App 带火 → 按 skill 走帮助页，不做本体）
3. GSC 自家 `hex` 相关 query 出现真实曝光（现在 0，只证明我们没供给，不算需求证据）

## 如果只是想丰富玩法（非获客）

低成本替代：在现有 `/meowdoku/` 或数独类内容页里加一节「六边形变体」图文说明（讲规则 + 静态示例盘），**不建引擎、不建独立页**。想真玩可以外链 hexgamebox.app。

## 看到的具体产品（供用户核对）

我查到的同名/近名形态：
- 网页：`hexgamebox.app/hexsudoku/` — Hexagonal Sudoku，Classic / Act Fast 双模式
- Steam：`Hexdoku`（app 1414270）— 填形状，每行每区不重复
- App Store：**无同名产品**

如果你看到的是上面其中之一，或某个截图/视频里的别的东西（比如 Hexa Sort 那类消除玩法），告诉我具体形态我再判一次——消除类和数独类的盘子完全不同。

## 数据口径声明

- 搜索量为 Google Ads 关键字规划师 US 口径，`fromCache=false`（2026-11-19 实读）
- 三个同义词月曲线逐月完全一致，说明 KWP 已归并同簇，**不能相加**
- KD 9 为 web.cafe 哥飞版口径（`serp_review`）
- App Store 数据来自 `itunes.apple.com/search?country=us`
- `hexasudoku.com` 无 A 记录；`hexsudoku.com` 指向停车页；`hexadoku.com` 解析到 AWS
