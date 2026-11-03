# /akari/ 渲染页残留 em dash 只读盘点与正文改写方案

- 盘点对象：`dist/akari/**` 当前构建产物（100 个 HTML，HEAD=514497f9）
- 统计口径：`seo_guard.vis()` 后的可见文本节点数 U+2014；逐页与自写 DOM 文本节点计数比对，**99 页逐页一致，无差异**
- 存档：本目录即全部产物（原写入位置 `scratch/g-akari/` 已搬入此处，2026-11-03）；**未修改仓库其他文件**
- 复核：`python3 scan.py`（DOM 归类）、`summarize.py`（vis 对账）、`rewrites.json`（27 条方案，机器校验数字多重集与词序）

## 1. 总量与类别归因

**残留 1081 处，分布在 99/100 页**（唯一 0 处的是 `/akari/akari-puzzle-online/` 重定向页）。

| 类别 | 处数 | 涉及页 | 判定 | 说明 |
|---|---:|---:|---|---|
| steps | 649 | 70 | 不动 | `puzzles.json` 的 `steps[].text`：`needs N more — place cat…` 434 处 + `is full — mark…` 215 处，仅 2 种句式 |
| brand-footer | 177 | 96 | 不动 | `GridPaw — Daily Akari Puzzle` 96、页脚品牌行 81（9 种后缀） |
| head | 119 | 99 | 不动 | `<title>` 94 + H1–H6 25（含博客 7 个难度小标题、列表页 h2>a） |
| faq | 71 | 19 | 不动 | `<details>`/`.faq-answer`。其中 glossary 36（33 处是词条手风琴、非 Q&A，见 §6） |
| anchor | 38 | 10 | 不动 | `<a>` 内全部可见文字，含卡片描述句、目录标题 |
| **body** | **27** | **9** | **改写候选** | 7 相关列表 + 17 compare + 3 博客列表摘要 |
| about | 0 | 0 | 不动 | T1 题目页 About 段已无 em dash |
| **合计** | **1081** | **99** | | |

模板分布（渲染口径）：

| 模板 | 页数 | steps | faq | head | anchor | brand-footer | body | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| T1 题目页 | 70 | 649 | 0 | 70 | 0 | 140 | 0 | 859 |
| T2 博客文章 | 3 | 0 | 0 | 11 | 4 | 3 | 0 | 18 |
| T3 等级页 | 3 | 0 | 3 | 2 | 0 | 3 | 0 | 8 |
| T4 独立静态页 | 22 | 0 | 68 | 33 | 34 | 29 | 24 | 188 |
| 博客列表 | 1 | 0 | 0 | 3 | 0 | 2 | 3 | 8 |
| 重定向 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

逐页明细见 `per-page.csv` / `per-page.md`。

不动清单细分（可见口径）：品牌/页脚 177、FAQ/details 71、head 119、锚文本 38、steps 649；只含破折号的表格占位格 **0**、游戏 UI 原文 **0**（`/akari/` 页无该句）、题面原文 **0**（棋盘由 JS 渲染，无文本节点）。代码注释 99 处，非可见，不计入 1081。

非可见、不计入 1081 但同样冻结的项（只计数上报）：meta content 317、JSON-LD 99、HTML 注释 99、`alt` 7（均在首页）。

## 2. 正文 27 处的真实归属

| 组 | 处数 | 源码 | 状态 |
|---|---:|---|---|
| A 相关页面列表 `Play GridPaw — …` | 7 | 7 个 `.astro` | 全部在 `F-uncovered/P2-占用文件.txt` 内 |
| B compare 对比页正文 | 17 | `src/data/compare-pairs.ts` | 不在 P2 占用清单，也不在本轮声明的源码清单 |
| C 博客列表摘要 | 3 | `src/data/blog-posts.ts` 的 `description` | 同时是 3 篇博客文章的 meta description 与 Article JSON-LD；文件也在 P2 占用清单 |

结论：严格按本轮声明的源码清单，**没有一处 body 落在清单内**。A/C 分别受 P2 占用与 SEO 约束；B 组 17 处无 SEO 耦合、无占用冲突，但位于未声明的数据文件 `compare-pairs.ts`，需确认纳入范围。

## 3. 改写方案（27 条，已机器校验）

校验：每条改前 1 处 U+2014、改后 0；数字多重集完全一致；实词词序一致；除句号拆分后下一句首字母大写外无字母变化；长度差仅为 `" — "`→`": "` 一类标点替换。

### A. 相关页面列表（7 处，7 个 `.astro`）

同一句式在 5 页重复（long）＋2 页重复（short），做 2 个变体：colon 3 + comma 4，最坏重复页次从 5 降到 3。

| # | 页面 | 源码位置 | 改前 | 改后 | 手段 |
|---|---|---|---|---|---|
| 1 | `light-up-puzzle` | `src/pages/akari/light-up-puzzle.astro`:223 | Play GridPaw — the main game with all difficulty levels | Play GridPaw: the main game with all difficulty levels | colon |
| 2 | `cat-logic-puzzle` | `src/pages/akari/cat-logic-puzzle.astro`:251 | Play GridPaw — the main game with all difficulty levels | Play GridPaw: the main game with all difficulty levels | colon |
| 3 | `glossary` | `src/pages/akari/glossary.astro`:168 | Play GridPaw — the main game with all difficulty levels | Play GridPaw: the main game with all difficulty levels | colon |
| 4 | `akari-puzzle` | `src/pages/akari/akari-puzzle.astro`:239 | Play GridPaw — the main game with all difficulty levels | Play GridPaw, the main game with all difficulty levels | comma |
| 5 | `logic-puzzle` | `src/pages/akari/logic-puzzle.astro`:205 | Play GridPaw — the main game with all difficulty levels | Play GridPaw, the main game with all difficulty levels | comma |
| 6 | `sudoku-with-pictures` | `src/pages/akari/sudoku-with-pictures.astro`:169 | Play GridPaw — the main game | Play GridPaw: the main game | colon |
| 7 | `games-like-sudoku` | `src/pages/akari/games-like-sudoku.astro`:221 | Play GridPaw — the main game | Play GridPaw, the main game | comma |

注：同列表其余条目本来就用冒号（`How to Play Akari: …`），colon 变体与列表风格一致；comma 变体用于压重复。

### B1. compare 对比段导语（5 处，`src/data/compare-pairs.ts`）

同页 5 次同一模板，做 2 个变体：colon 3 + comma 2。`compare-pairs.ts` 共 21 处 em dash，另 4 处在 FAQ（行 72、98、127、153），按不动清单保留，不在本节 17 处内。

| # | 行 | 改前 | 改后 | 手段 |
|---|---|---|---|---|
| 1 | 26 | Akari vs Sudoku — two iconic Japanese logic puzzles compared. Rules, difficulty, skills needed, and which one is right for you. | Akari vs Sudoku: two iconic Japanese logic puzzles compared. Rules, difficulty, skills needed, and which one is right for you. | colon |
| 2 | 55 | Light Up vs Kakuro — two Nikoli puzzles compared. One uses light and space, the other uses numbers and sums. Which logic puzzle suits you? | Light Up vs Kakuro, two Nikoli puzzles compared. One uses light and space, the other uses numbers and sums. Which logic puzzle suits you? | comma |
| 3 | 82 | Akari vs Nonograms — two visual logic puzzles compared. One lights up grids, the other reveals pixel art. Which is more fun? | Akari vs Nonograms: two visual logic puzzles compared. One lights up grids, the other reveals pixel art. Which is more fun? | colon |
| 4 | 109 | Logic puzzles vs Sudoku — how does Akari-style deduction compare to number placement? A guide for puzzle lovers choosing their next game. | Logic puzzles vs Sudoku: how does Akari-style deduction compare to number placement? A guide for puzzle lovers choosing their next game. | colon |
| 5 | 136 | Light Up vs Slitherlink — two Nikoli spatial puzzles compared. One uses light, the other draws loops. Which is more satisfying? | Light Up vs Slitherlink, two Nikoli spatial puzzles compared. One uses light, the other draws loops. Which is more satisfying? | comma |

### B2. compare Key Differences 卡片（12 处）

按阅读顺序轮换 colon → period → comma / semicolon；同一 `diff-grid` 的 a/b 两侧相邻句必不同手段。

| # | 行 | 段/侧 | 改前 | 改后 | 手段 |
|---|---|---|---|---|---|
| 1 | 37 | Sudoku / Thinking a | Spatial reasoning — you track lines of sight across rows and columns. Placing one bulb affects multiple cells at once. | Spatial reasoning: you track lines of sight across rows and columns. Placing one bulb affects multiple cells at once. | colon |
| 2 | 37 | Sudoku / Thinking b | Number elimination — you scan rows, columns, and 3×3 boxes to find which digit fits. Each cell is independent. | Number elimination. You scan rows, columns, and 3×3 boxes to find which digit fits. Each cell is independent. | period |
| 3 | 38 | Sudoku / Learning a | Easier to start. The illumination mechanic is intuitive — place a cat, watch light spread. Rules are simpler than Sudoku. | Easier to start. The illumination mechanic is intuitive: place a cat, watch light spread. Rules are simpler than Sudoku. | colon |
| 4 | 40 | Sudoku / Ceiling a | Hard Akari on 12×12+ grids requires hypothetical reasoning and shadow mapping — genuinely challenging. | Hard Akari on 12×12+ grids requires hypothetical reasoning and shadow mapping, genuinely challenging. | comma |
| 5 | 66 | Kakuro / Skill a | Pure spatial logic — no math at all. You reason about lines of sight and adjacency constraints. | Pure spatial logic. No math at all. You reason about lines of sight and adjacency constraints. | period |
| 6 | 68 | Kakuro / Error a | Instant — conflicting bulbs light up red, and you see violations immediately. | Instant: conflicting bulbs light up red, and you see violations immediately. | colon |
| 7 | 68 | Kakuro / Error b | Delayed — errors only become apparent when sums don't work out, often several steps later. | Delayed. Errors only become apparent when sums don't work out, often several steps later. | period |
| 8 | 95 | Nonograms / Replay a | High — every puzzle is different, and the solving path varies. The grid never looks the same twice. | High: every puzzle is different, and the solving path varies. The grid never looks the same twice. | colon |
| 9 | 95 | Nonograms / Replay b | Moderate — once you solve a nonogram, the picture is revealed. Re-solving gives less novelty. | Moderate. Once you solve a nonogram, the picture is revealed. Re-solving gives less novelty. | period |
| 10 | 122 | Logic vs Sudoku / Community b | Massive global community. Competitions, apps, newspapers — Sudoku is everywhere. | Massive global community. Competitions, apps, newspapers; Sudoku is everywhere. | semicolon |
| 11 | 148 | Slitherlink / Recovery a | Easy — remove a bulb and the light recalculates instantly. No permanent state. | Easy: remove a bulb and the light recalculates instantly. No permanent state. | colon |
| 12 | 148 | Slitherlink / Recovery b | Harder — a misplaced edge segment can create contradictions many steps later. Backtracking is common. | Harder. A misplaced edge segment can create contradictions many steps later. Backtracking is common. | period |

### C. 博客列表摘要（3 处，`src/data/blog-posts.ts`）

**这 3 条同时是 3 篇博客文章页的 meta description**，改数据即改 SEO 基础，不能直接改。下面只作备选文案；落地方式见 §6。

| # | 行 | 改前 | 改后 | 手段 |
|---|---|---|---|---|
| 1 | 17 | Master these 5 essential Akari (Light Up) puzzle strategies to solve puzzles faster. From constraint propagation to shadow mapping — beginner-friendly guide with examples. | Master these 5 essential Akari (Light Up) puzzle strategies to solve puzzles faster. From constraint propagation to shadow mapping: beginner-friendly guide with examples. | colon |
| 2 | 70 | Discover the 7 best logic puzzles for brain training — from beginner-friendly Akari to expert-level Slitherlink. Ranked by difficulty with free play links. | Discover the 7 best logic puzzles for brain training, from beginner-friendly Akari to expert-level Slitherlink. Ranked by difficulty with free play links. | comma |
| 3 | 121 | From Nikoli's Tokyo office to puzzle apps worldwide — the complete history of Akari (Light Up). How a 2001 Japanese puzzle became a global brain teaser. | From Nikoli's Tokyo office to puzzle apps worldwide: the complete history of Akari (Light Up). How a 2001 Japanese puzzle became a global brain teaser. | colon |

## 4. 5 组改前/改后样例（交付口径）

1. `Play GridPaw — the main game with all difficulty levels` → `Play GridPaw: the main game with all difficulty levels`
2. `Play GridPaw — the main game with all difficulty levels` → `Play GridPaw, the main game with all difficulty levels`（同句式第 2 变体）
3. `Spatial reasoning — you track lines of sight…` → `Spatial reasoning: you track lines of sight…`
4. `Number elimination — you scan rows, columns, and 3×3 boxes…` → `Number elimination. You scan rows, columns, and 3×3 boxes…`
5. `Competitions, apps, newspapers — Sudoku is everywhere.` → `Competitions, apps, newspapers; Sudoku is everywhere.`

## 5. 预期计数

| 落地范围 | 处数 | 渲染总量 | body 残留 |
|---|---:|---:|---:|
| 仅 B compare（最干净） | 17 | 1081 → 1064 | 27 → 10 |
| B + A（释放 P2 占用） | 24 | 1081 → 1057 | 27 → 3 |
| B + A + C（C 需解耦 meta） | 27 | 1081 → 1054 | 27 → 0 |

compare 页改后从 24 降到 7（head 1 + faq 4 + brand 2）；7 个相关列表页各降 1；博客列表页 8 → 5（C 组不动时）。

## 6. 需要人拍板

**可直接改（唯一无 SEO 耦合、无占用冲突）**
- `src/data/compare-pairs.ts` 17 处。该文件只被 `/akari/compare/` 与首页的 `titleA/titleB` 使用，`description` 只进 compare 正文，不进 meta/JSON-LD。前提：确认数据文件的编辑文案也算本批范围。

**需要你决定**
1. **A 组 7 个 `.astro` 在 `P2-占用文件.txt` 内**。P2 已作为 `d5984288` 合并；若占用清单已随合并失效，可放行 7 处；否则本轮不碰。
2. **C 组 3 条博客摘要 = meta description + Article JSON-LD 的 `description`**（`blog-posts.ts` 文件也在 P2 占用清单）。三种处理：留原样；新增 `excerpt` 字段只供列表页；在 `blog/index.astro` 渲染时做标点替换（不改 data/meta/JSON-LD）。三种都超出「只动标点」的纯文本补丁，需明确授权。
3. **glossary 的 33 处 `details` 内正文不是 FAQ**：它们是 12 个词条手风琴的定义/要点，真正嵌套 Q&A 只有 3 处。按本轮「details 一律 faq 不动」口径已计为不动；若按语义重分类，可再释放 33 处 body 候选（另出方案）。
4. **句号拆分会让下一句首字母大写**（如 `— you scan` → `. You scan`）。这是标点驱动的字母大小写变化，是否接受。
5. T1 的 649 处 steps 数据按既定决策不动；T1 About 已清零，无需处理。

## 7. 未做与边界

- 未改 `src/`、`public/`、`dist/`、`STATUS.md`；未 build；未 git add/commit/push；未碰 `NEWWORD-LEDGER.md`。
- 未对 FAQ、标题、锚文本、品牌、JSON-LD、meta、steps 提出任何改写。
- 本盘点不采信 2026-11-02 的旧计数（旧口径把正文与不动项混在一起，且构建不同）。本文件全部数字按当前 `dist` 的 `seo_guard.vis()` 逐页重测，验收以本次对账为准。
