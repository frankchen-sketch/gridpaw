# C 流资产盘点：/akari/ 页面源与模板

统计时间：2026-11-02　｜　基线：`/Users/frank/.hermes/cache/scratch/p1-verify/before/`（100 个 `akari*.html`）

## 1. 页面与模板

`/akari/` 共 **100 个页面**，来自 29 个 `.astro` 文件 + 2 个数据文件，归纳为 **4 套模板 + 1 个重定向页**：

| # | 模板 | 生成源 | 页数 | 页面路径 |
|---|---|---|---:|---|
| T1 | 题目详情 | `src/pages/akari/puzzle/[id].astro` + `src/data/puzzles.json` | 70 | `/akari/puzzle/puzzle-001/` … `puzzle-070/` |
| T2 | 博客文章 | `src/pages/akari/blog/[slug].astro` + `src/data/blog-posts.ts` | 3 | `/akari/blog/akari-puzzle-strategies-beginners/`、`best-logic-puzzles-brain-training/`、`history-of-akari-puzzle/` |
| T3 | 等级列表 | `levels/easy.astro`、`levels/medium.astro`、`levels/hard.astro`（3 个独立文件，骨架几乎相同） | 3 | `/akari/levels/easy/`、`medium/`、`hard/` |
| T4 | 独立静态页 | 22 个单文件页面（各自带一份内联样式与页头页脚） | 22 | 首页、how-to-play、how-to-solve、rules、cheats、tips、tips/elimination、glossary、solver、daily、create、compare、games-like-sudoku、logic-puzzle、light-up-puzzle、akari-puzzle、cat-logic-puzzle、sudoku-with-pictures、what-is-light-up、community、privacy |
| — | 博客列表 | `blog/index.astro` | 1 | `/akari/blog/` |
| — | 重定向 | `akari-puzzle-online.astro` | 1 | `/akari/akari-puzzle-online/` → `/akari/akari-puzzle/` |

补充：`src/components/` 里被这些页面共享的组件（`ExtensionPromo`、`GameSwitcher`、`GameHub`、`SEOHead` 等）只贡献品牌名与注释里的 em dash，属不动清单，未改。

## 2. 每套模板的 em dash（渲染基线实测，改前）

| 模板 | 页数 | 正文 em dash | 不动清单 em dash | 正文构成 |
|---|---:|---:|---:|---|
| T1 题目详情 | 70 | 719 | 280 | 70 段 About + 649 条解题步骤 |
| T2 博客文章 | 3 | 23 | 16 | 正文段落、列表项 |
| T3 等级列表 | 3 | 3 | 10 | hard 页 3 处攻略段落；easy/medium 正文 0 |
| T4 静态页 | 22 | 303 | 185 | 段落、列表项、表格说明、卡片描述 |
| 博客列表 | 1 | 3 | 5 | 摘要 |
| 重定向页 | 1 | 0 | 0 | — |
| **合计** | **100** | **1051** | **496** | |

不动清单分类（渲染基线合计）：`<title>`/meta 93、H1–H6 25、FAQ（`<details>` / `.faq-answer`）84、JSON-LD 88、品牌与页脚 178、锚文本=目标页标题 28。

口径说明：渲染口径按 DOM 文本节点统计，段落被内联标签切分时会产生重复计数，且模板页会按页数放大；两口径差值不作为验收依据，补丁验收以源文件 body 计数 + `git apply --check` 为准。

源文件口径（补丁的直接对象，去掉注释/JS/属性/标题/FAQ/品牌后）：**956 → 1**。
- `src/pages/akari/**`：288 → 1（残留 1 处是 index 的策略卡标题「Akari Rules — Complete Beginner's Guide」，属锚文本=目标页标题，按不动处理）
- `src/data/puzzles.json`：649 → 0
- `src/data/blog-posts.ts`：19 → 0

## 3. 共享模板与跨页重复

改模板一次覆盖多页的位置：

| 共享位置 | 页数 | 处理方式 |
|---|---:|---|
| `puzzle/[id].astro` 的 About 句 | 70 | 模板内按 `difficulty === 'easy'` 分两种句式 |
| `puzzles.json` 的 `steps[].text` | 70 | 两种句式 × 3 变体，按题目序号 `% 3` 轮换（`generate-puzzles.mjs` 同步改为变体 A，防重新生成时回退） |
| `glossary.astro` 的 `{term.term} — {term.definition}` | 1 页 12 个术语 | 冒号 |
| 各页「相关页面」列表 `<a>X</a> — 说明` | 7 页 32 处 | 冒号 |

跨页重复句（源文本口径：`<p>/<li>/<td>/<summary>/<span>` 文本切句，长度 ≥40 字符，动态路由按实际页数展开）：

| 指标 | 改前 | 改后 |
|---|---:|---:|
| 出现在 ≥2 页的句子类型 | 126 | 69 |
| 重复页次（Σ 出现页数−1） | 493 | 351 |
| 含 em dash 的句子类型 | 833 | 53 |

改后仍有 4 条 ×70 页的重复（3 条正文 + 1 条导航行），都在题目详情模板里，且已不含 em dash：

1. `Each cat illuminates its row and column until blocked by a wall.`
2. `Numbered black cells show how many adjacent cats they need.`
3. `GridPaw puzzle #NNN is a <difficulty>-level … Akari puzzle with N cats to place.`（数值不同，骨架相同）
4. `← Play GridPaw · Cat Logic Puzzle Guide · Akari Puzzle Guide`（导航行，非正文）

## 4. 重点问题：T3 三个等级页是同构模板

`levels/easy`、`medium`、`hard` 三页的「What makes these puzzles "easy/medium/hard"?」段落骨架完全相同，只换形容词与格子尺寸：

- easy：`Easy Akari puzzles use 10×10 grids with fewer walls and more open space. The logic needed to solve them is straightforward — perfect for learning the rules of Light Up.`
- medium：`Medium Akari puzzles use 10×10 grids with more walls and numbered constraints. They require multi-step reasoning — you'll often need to deduce bulb placements from wall numbers before filling in the rest.`
- hard：`Hard Akari puzzles use 12×12 or 14×14 grids packed with walls and numbered constraints. Solving them requires advanced deduction chains — placing one bulb can cascade into multiple forced placements across the grid.`

这三段在 `<details>` 里，属不动清单第 4 项（FAQ 问答），本流**未改**，只计数（3 处）。另外 easy 与 medium 都是 10×10，事实层面只差「fewer walls / more walls」一个词，这不是标点能解决的问题，需补内容，见 report 的「需要你决定」。
