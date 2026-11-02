# E2 流（/help/** 与其他游戏族）人味改写方案

范围：`/help/**` 7 页、kenken、binary、hashi、nonogram（非 demo）、nonogram/solver、slitherlink、star-battle、murdoku(+trail)、brain-teasers-for-adults、arrows-puzzle（不含 walkthrough）、/changelog/、/badges/、/crazy-cleanup/。`/the-loop-hints/` 只报告不改。

## 1. 计数（源码文件，`str.count('\u2014')`）

| 文件 | 改前 | 改后 | 正文改动 | 改后剩余构成 |
|---|---|---|---|---|
| `src/pages/help/akari/index.astro` | 18 | 5 | 13 | 注释 1、FAQ 4 |
| `src/pages/help/kakuro/index.astro` | 26 | 10 | 16 | 注释 1、FAQ 3、UI 引用 6 |
| `src/pages/help/nonogram/index.astro` | 30 | 11 | 19 | 注释 1、FAQ 4、UI 引用 6 |
| `src/pages/help/nurikabe/index.astro` | 30 | 14 | 16 | 注释 1、FAQ 4、UI 引用 9 |
| `src/pages/help/pictomino/index.astro` | 21 | 9 | 12 | 注释 1、FAQ 6、UI 引用 2 |
| `src/pages/kenken/index.astro` | 35 | 12 | 23 | 属性 2、注释 3、FAQ 2、JS 串 1、JSON-LD 4 |
| `src/pages/binary/index.astro` | 26 | 11 | 15 | 属性 2、注释 3、FAQ 2、JS 串 1、JSON-LD 3 |
| `src/pages/hashi/index.astro` | 27 | 13 | 14 | 属性 2、注释 3、FAQ 2、JS 串 3、JSON-LD 3 |
| `src/pages/nonogram/index.astro` | 13 | 3 | 10 | 注释 1、FAQ 1、标题 1 |
| `src/pages/nonogram/solver/index.astro` | 37 | 22 | 15 | 注释 1、FAQ 9、TDK 2、标题 1、JS 串 9 |
| `src/pages/slitherlink/index.astro` | 39 | 20 | 19 | 属性 2、注释 5、FAQ 5、JS 串 3、JSON-LD 5 |
| `src/pages/star-battle/index.astro` | 37 | 19 | 18 | 属性 2、注释 4、FAQ 5、JS 串 3、JSON-LD 5 |
| `src/pages/murdoku/index.astro` | 29 | 22 | 7 | 属性 1、注释 5、FAQ 4、JS 串 8、JSON-LD 3、UI 引用 1 |
| `src/pages/murdoku/trail.astro` | 24 | 19 | 5 | 注释 3、FAQ 2、JS 串 12、JSON-LD 2 |
| `src/pages/brain-teasers-for-adults/index.astro` | 15 | 8 | 7 | FAQ 4、JSON-LD 4 |
| `src/pages/arrows-puzzle/index.astro` | 26 | 5 | 21 | FAQ 2、JSON-LD 2、占位格 1 |
| `src/pages/changelog.astro` | 2 | 1 | 1 | TDK 1 |
| `src/pages/badges.astro` | 7 | 5 | 2 | 注释 2、TDK 1、JS 串 1、占位格 1 |
| `src/pages/crazy-cleanup/index.astro` | 26 | 19 | 7 | 注释 3、FAQ 6、TDK 2、标题 1、JSON-LD 7 |
| **合计** | **468** | **228** | **240** | 见下 |

不动清单汇总（228 处）：注释 38、FAQ（可见 details/summary + `q:`/`a:` + `acceptedAnswer`）65、UI 原文/`<code>` 芯片/分享文案引用 24、JSON-LD 38、属性值（alt/title/content）11、JS 代码串（toast/setHint/share）41、标题 3、TDK（title/description）6、表格占位格 2。

另外：`src/components/HelpArticle.astro` 唯一 em dash 在头部注释（`// HelpArticle — shared full-page wrapper`），按 #12 不动；`/help/` 首页与 `/help/shikaku/` 全部为注释/FAQ/占位格，正文 0 处，未产生补丁。

## 2. 文件

- 补丁：`research/2026-11-02-humanize-plan/E2-help-families/changes.patch`（`git apply --check` 通过，19 文件 216 行对改 216 行）
- 方案全文：`research/2026-11-02-humanize-plan/E2-help-families/proposed/<仓库相对路径>`

## 3. 改前/改后样例

1. `src/pages/help/akari/index.astro`
   - 前：Click or tap any empty white cell — a cat appears and lights its entire row
   - 后：Click or tap any empty white cell: a cat appears and lights its entire row
2. `src/pages/kenken/index.astro`
   - 前：KenKen — also called **Calcudoku** or **Mathdoku** — is a number logic puzzle
   - 后：KenKen (also called **Calcudoku** or **Mathdoku**) is a number logic puzzle
3. `src/pages/slitherlink/index.astro`
   - 前：first published by **Nikoli** — the same publisher that named Sudoku — in its magazine
   - 后：first published by **Nikoli** (the same publisher that named Sudoku) in its magazine
4. `src/pages/arrows-puzzle/index.astro`
   - 前：the two arrows collide — you lose 1 of your 3 hearts.
   - 后：the two arrows collide: you lose 1 of your 3 hearts.
5. `src/pages/help/nonogram/index.astro`
   - 前：highlights amber for 2.6 seconds — a free way to focus your eyes.
   - 后：highlights amber for 2.6 seconds. A free way to focus your eyes.

手段分布：冒号（标签/定义）、句号拆句（揭晓式）、括号（插入语，每页 ≤2）、逗号（同位语）、删除破折号（动词直接接宾语）。同页相邻句已轮换；「X — also known as Y —」三页模板做成两种变体（kenken 括号、binary 逗号、hashi 括号）。

## 4. 需人工拍板

1. `/the-loop-hints/`：源码 12 处 em dash（frontmatter 数据/字符串 8、正文 3、标题数据 1；第 85 行含 2 处），由 cron `loop-hints-pull.sh` 重写，本流未改。要清需改生成脚本模板，否则下次运行回填。
2. UI 原文引用 24 处未动：`<code>Tutorial 1/4 — <lesson></code>`、`Level N/11 — Medium — S×S`、Hint toast 文案、分享文案模板、`Got it — start with Tutorial 1` 按钮文案等。改了会与游戏内文字不一致，需游戏 UI 与分享模板一起改。
3. `public/crazy-cleanup/index.html` 仅剩 `<title>` 内 1 处（#1 不动）；P1 已改过该文件，本流未碰。
4. `src/pages/murder-sudoku/index.astro`（murdoku 相关）仅 1 处，位于 JSON-LD `text`（#3），未动。

## 5. 未产生改动的在范围文件

`src/pages/help/index.astro`（4：注释 1 + FAQ 3）、`src/pages/help/shikaku/index.astro`（4：注释 1 + FAQ 2 + 占位格 1）、`src/pages/binary/how-to-solve.astro`、`src/pages/binary/takuzu.astro`、`src/pages/hashi/how-to-play.astro`、`src/pages/hashi/solver.astro`（均 0 处）。
