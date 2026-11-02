# C-akari 计数明细（em dash，U+2014）

口径：`all` = Python `str.count("\u2014")`；`body` = 去掉 frontmatter 的 title/description、
`<script>`/`<style>`、HTML 与 JS 注释、H1-H6、`<details>`（FAQ/折叠块）、属性值、
`<footer>`、品牌行、以及「锚文本 = 目标页标题」后的正文计数。

## 页面源文件（src/pages/akari/**）

| 文件 | all 改前 | all 改后 | body 改前 | body 改后 |
|---|---:|---:|---:|---:|
| src/pages/akari/akari-puzzle-online.astro | 1 | 1 | 0 | 0 |
| src/pages/akari/akari-puzzle.astro | 32 | 9 | 23 | 0 |
| src/pages/akari/blog/[slug].astro | 0 | 0 | 0 | 0 |
| src/pages/akari/blog/index.astro | 2 | 2 | 0 | 0 |
| src/pages/akari/cat-logic-puzzle.astro | 38 | 8 | 30 | 0 |
| src/pages/akari/cheats.astro | 18 | 3 | 15 | 0 |
| src/pages/akari/community.astro | 4 | 3 | 1 | 0 |
| src/pages/akari/compare/index.astro | 4 | 4 | 0 | 0 |
| src/pages/akari/create.astro | 7 | 3 | 4 | 0 |
| src/pages/akari/daily.astro | 25 | 18 | 7 | 0 |
| src/pages/akari/games-like-sudoku.astro | 21 | 5 | 16 | 0 |
| src/pages/akari/glossary.astro | 25 | 3 | 21 | 0 |
| src/pages/akari/how-to-play.astro | 23 | 4 | 19 | 0 |
| src/pages/akari/how-to-solve.astro | 17 | 4 | 13 | 0 |
| src/pages/akari/index.astro | 83 | 51 | 33 | 1 |
| src/pages/akari/levels/easy.astro | 2 | 2 | 0 | 0 |
| src/pages/akari/levels/hard.astro | 4 | 1 | 3 | 0 |
| src/pages/akari/levels/medium.astro | 2 | 2 | 0 | 0 |
| src/pages/akari/light-up-puzzle.astro | 30 | 9 | 21 | 0 |
| src/pages/akari/logic-puzzle.astro | 17 | 4 | 13 | 0 |
| src/pages/akari/play.astro | 1 | 1 | 0 | 0 |
| src/pages/akari/privacy.astro | 4 | 2 | 1 | 0 |
| src/pages/akari/puzzle/[id].astro | 3 | 2 | 1 | 0 |
| src/pages/akari/rules.astro | 17 | 3 | 14 | 0 |
| src/pages/akari/solver.astro | 12 | 4 | 8 | 0 |
| src/pages/akari/sudoku-with-pictures.astro | 17 | 5 | 12 | 0 |
| src/pages/akari/tips/elimination.astro | 14 | 2 | 10 | 0 |
| src/pages/akari/tips/index.astro | 19 | 2 | 16 | 0 |
| src/pages/akari/what-is-light-up.astro | 8 | 1 | 7 | 0 |
| **小计** | **450** | **158** | **288** | **1** |

## 数据文件（动态路由的正文来源）

| 文件 | all 改前 | all 改后 | body 改前 | body 改后 | 说明 |
|---|---:|---:|---:|---:|---|
| src/data/puzzles.json | 649 | 0 | 649 | 0 | 70 个题目页的解题步骤文本（`steps[].text`） |
| src/data/blog-posts.ts | 32 | 13 | 19 | 0 | 3 篇博客正文（`content`） |

## 渲染基线（100 页实测，改前）

| 页面组 | 页数 | 正文 em dash | 不动清单 em dash |
|---|---:|---:|---:|
| 静态页（含 /akari/ 首页、重定向页） | 22 | 303 | 185 |
| 等级列表页 /levels/{easy,medium,hard} | 3 | 3 | 10 |
| 题目详情页 /puzzle/{id} | 70 | 719 | 280 |
| 博客文章页 /blog/{slug} | 3 | 23 | 16 |
| 博客列表 /blog/ | 1 | 3 | 5 |
| **合计** | **100** | **1051** | **496** |

不动清单分类（渲染基线合计）：title 93、H1-H6 25、FAQ（details / .faq-answer）84、
JSON-LD 88、品牌/页脚 178、锚文本=目标页标题 28。


## 改后残留（源文件口径）

`src/pages/akari/**` + `src/data/blog-posts.ts` 改后共 160 处 em dash，全部落在不动清单内：

| 类别 | 处数 | 说明 |
|---|---:|---|
| title/meta | 23 | 含 `blog-posts.ts` 的 `title:` / `description:` 4 处 |
| JSON-LD / JS 字符串 | 38 | daily 页动态文案 17、index 分享/引导文案 20、cheats 报错文案 1 |
| 代码注释 | 1 | blog-posts.ts 文件头 |
| H1–H6 | 21 | 含博客里的难度小标题 |
| FAQ（`<details>`） | 34 | 三级等级页、各页 FAQ |
| 属性 / alt | 8 | index 截图 alt 7 处 + community 1 处 |
| 品牌 / 页脚 | 11 | `GridPaw — …` 与 ExtensionPromo |
| 锚文本 = 目标页标题 | 23 | 相关页面列表、compare 标题模板、index 策略卡标题 |

`src/data/puzzles.json` 改后 0 处。
