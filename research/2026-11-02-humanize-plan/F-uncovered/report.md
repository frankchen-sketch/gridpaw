# F 流（未覆盖英文页）交付报告

- 生成日期：2026-11-02
- 范围：`research/2026-11-02-humanize-plan/F-uncovered/scope.md` 的 80 页 / 320 条候选
- 输出：`proposed/`（改后文件 6 个）、`changes-final.patch`、`changes-optional-changelog.patch`（可选）、`proposed-optional/`（可选改后文件 1 个）
- 本流未修改仓库任何已有文件，未 build、未 commit、未 deploy

## 1. 结论

| 项 | 数量 |
|---|---|
| 候选页 | 80 |
| 候选残留（scope.md 口径） | 320（其中 P2 占用 32 / 已定位 60 / 未定位 228） |
| 复核后属于「可改正文」的 em dash | **34**（`—`，U+2014） |
| 已进最终补丁 | **20 处 / 6 文件**，页面渲染口径 40 → 20 |
| 因守卫工具限制单列可选 | **14 处 / 1 文件**（`src/lib/changelog-data.ts`，changelog 渲染 16 → 2） |
| 其余残留 | 全部落在不动清单（title、H1–H6、FAQ、锚文本、品牌句、表格占位、游戏 UI/JS），或所在文件已被 P2 占用 |

最终补丁只动正文文本节点：不碰 title/meta/canonical/hreflang/robots、H1–H6、JSON-LD、FAQ（可见块与 JSON-LD 答案）、内链 href 与锚文本、img src/alt、内联 script/style、sitemap/robots/llms。

## 2. 基线与口径

- 改前渲染基线：`/Users/frank/.hermes/cache/scratch/plan-build/base/dist/`（存在，构建号 `8f5c56c`，P1 之后、P2 之前）。
- 6 个目标源码文件在基线构建后没有新提交，故该基线对这些页面等同 HEAD 渲染。
- `/changelog/` 例外：P2 已在 `src/pages/changelog.astro` 修掉 1 处（`forever — they` → `forever. They`），本报告按 P2 后的 `after` 构建校正为 16 处（不是基线的 17 处）。
- 计数方式：`seo_guard.G.vis(html)` 后数 `—`；数字多重集用 `G.nums(html)`；改后用「基线 HTML 应用同一批文本替换」模拟（未 build）。

## 3. 逐文件表（最终补丁）

| 页面 | 源码文件 | 渲染 em 改前 → 改后 | 不动清单计数（该页） | 改动摘要 |
|---|---|---|---|---|
| kakuro/index.html | `src/pages/kakuro/index.astro` | 6 → 2 | 2（H1 1、品牌句 1） | 「More Logic Puzzles」4 条链接的标签—说明改冒号 |
| leaderboard/index.html | `src/pages/leaderboard.astro` | 2 → 1 | 1（`<title>` 1） | 页脚说明句「too — you'll」改句号 |
| logic-puzzle-grid/index.html | `src/pages/logic-puzzle-grid/index.astro` | 6 → 1 | 1（品牌句 1） | 1 段正文拆句 + Read Next 4 张卡改句号 |
| meowdoku-guide/index.html | `src/pages/meowdoku-guide/index.astro` | 10 → 9 | 9（FAQ 6、H3 1、表格占位 1、品牌句 1） | 规则段「region — never two」改冒号 |
| nurikabe/index.html | `src/pages/nurikabe/index.astro` | 14 → 6 | 6（H1 1、FAQ 4、品牌句 1） | 1 处拆句、1 处冒号、1 处括号、4 条链接改冒号 |
| offline/index.html | `src/pages/offline.astro` | 2 → 1 | 1（`<title>` 1） | 断网提示「right now — but」改逗号 |
| **合计** | **6 文件** | **40 → 20（净减 20）** | **20** | |

可选补丁（未进最终补丁）：

| 页面 | 源码文件 | 渲染 em 改前 → 改后 | 不动清单计数 | 说明 |
|---|---|---|---|---|
| changelog/index.html | `src/lib/changelog-data.ts` | 16 → 2（净减 14） | 2（`<title>` 1、品牌句 1） | 14 条条目文案；`seo_guard.py scope` 对 `.ts` 恒判「骨架变化」（无标签文件 `skeleton()` 等于原文），并入会让 scope FAIL，故单列。注意：最新条目被首页 banner 复用，应用后首页同一句也会变（文案一致） |

## 4. 改写样例（5 组）

1. **logic-puzzle-grid**（揭晓式，拆句 + 冒号）
   - 改前：`Shikaku and Akari are the flagship pair, and the catalog has grown around them — Kakuro, Nonogram, Nurikabe, KenKen, and a whodunit hybrid called murder sudoku`
   - 改后：`Shikaku and Akari are the flagship pair. The catalog has grown around them: Kakuro, Nonogram, Nurikabe, KenKen, and a whodunit hybrid called murder sudoku`
2. **logic-puzzle-grid**（列表卡，句号变体）
   - 改前：`Murder Sudoku — rules, clue types, and a solved 4×4 case`
   - 改后：`Murder Sudoku. Rules, clue types, and a solved 4×4 case`
3. **nurikabe**（插入式，括号）
   - 改前：`the hint button reveals one true cell — the real answer for the cell you selected, not a vague nudge — and a contradiction warning`
   - 改后：`the hint button reveals one true cell (the real answer for the cell you selected, not a vague nudge) and a contradiction warning`
4. **meowdoku-guide**（标签—说明，冒号）
   - 改前：`Settle one cat in each colored region — never two in the same row or column`
   - 改后：`Settle one cat in each colored region: never two in the same row or column`
5. **kakuro**（列表卡，冒号变体）
   - 改前：`Akari (Light Up) — place lights, light every cell, obey the numbered walls.`
   - 改后：`Akari (Light Up): place lights, light every cell, obey the numbered walls.`

补充变体：`offline` 用逗号（`No internet right now, but ...`）、`leaderboard` 用句号（`Guests are ranked too. You'll appear ...`）。

## 5. 不动清单计数（触及的 6 个改动页 + changelog，合计 22 处）

| 类别 | 处数 | 落点 |
|---|---|---|
| 品牌句「GridPaw —」/ 页脚推广句 | 5 | 6 个正文页中的 4 个 + changelog |
| 页面 `<title>` | 3 | offline、leaderboard、changelog |
| H1 | 2 | kakuro、nurikabe |
| H3（组件 CTA 标题） | 1 | meowdoku-guide（MeowdokuPlay 默认 heading） |
| FAQ 可见问答块 | 10 | nurikabe 4、meowdoku-guide 6 |
| 只含「—」的表格占位格 | 1 | meowdoku-guide（How This Guide Compares） |
| 游戏 UI / JS 字符串 | 0 | 本批 7 页无 |

## 6. 未改动页面（73 页）

- **23 页**：页面源码整体在 `P2-占用文件.txt` 内（arrows-puzzle、badges、binary、brain-teasers-for-adults、community、contact、crazy-cleanup/index、hashi、help/akari、help/kakuro、help/nonogram、help/nurikabe、help/pictomino、index、kenken、murdoku/index、murdoku/trail、nonogram/index、nonogram/solver、privacy、slitherlink、star-battle、terms）。
- **10 页**：`meowdoku/levels/1–10`，正文来自 `src/data/meowdoku-levels.json`（P2 占用），页面自身只剩 H3 与 1 条 FAQ。
- **40 页**：残留全部为不动项。典型：
  - `<title>` / H1：about、how-to-play-shikaku、number-grid-puzzle、rules、solver、rotate-rings、rotate-rings/level-1…32、meowdoku/index。
  - FAQ：brain-puzzle-3-level-5/9/26/27/31/39/48、help/index、help/shikaku。
  - 表格占位：help/shikaku（`Expert — Legend` 的「—」格）、arrows-puzzle-walkthrough。
  - 游戏 UI / JS：solver（`Everything placed — look for mistakes!`）、reset-password、crazy-cleanup/game.html（#tip 提示语）、kakuro/demo、nonogram/demo、nurikabe/demo（注释）。
  - 品牌句：tips、japanese-logic-puzzles、block-blast-hints、cross-math-puzzle、binary/takuzu。
  - 中文破折号：admin/funnel（见第 8 节）。

## 7. 自检结果

- `git apply --check changes-final.patch`：**PASS**
- `python3 seo_guard.py scope --patch changes-final.patch --repo /Users/frank/workspace/gridpaw`：**PASS**（6 文件；受保护路径 0 命中；标签/属性/代码骨架未变；JSON 只改值）
- 逐文件 em 计数（渲染口径）：见第 3 节表；合计 40 → 20。
- 数字多重集：6 个页面改前/改后 `G.nums()` **全部一致**（模拟改后渲染逐页比对）。
- SEO 基础（模拟改后渲染逐页比对）：`head_sig`、`headings`、`ld_raw`、`faq_blocks`、`anchors`、`imgs`、`inline_eq`、`GAME_UI` 计数 **全部一致**。
- 补丁不含 P2 占用文件；逐行核对无 title/heading/FAQ/锚文本/占位/JS 行。
- 可选补丁 `changes-optional-changelog.patch`：`git apply --check` PASS；`scope` 因 `.ts` 骨架判定 FAIL（唯一原因），未并入最终补丁。

## 8. 需要你决定

1. **`src/lib/changelog-data.ts` 的 14 处**（changelog 最新条目、PWA、广告移除、徽章等）：改后文案已放在 `proposed-optional/`，补丁 `changes-optional-changelog.patch` 可单独 `git apply`。并入 `changes-final.patch` 会让 `seo_guard.py scope` 判 FAIL（工具把 `.ts` 当 HTML 做骨架比对）。请决定：破例收录，还是换一种写法（例如主会话手工并 patch 后跳过 `.ts` 骨架项）。
2. **`src/pages/admin/funnel.astro` 1 句中文「——」**：`两版本转化率有差异时先看流量构成列——构成明显不同…`。这是中文破折号规范用法，且为内部页，建议保留；若要改，可改「：」或「，」。
3. **`public/crazy-cleanup/game.html` 的 `#tip` 1 处**：`it won't be spent — dig or use 🔧 Pliers`，属游戏内提示 UI 文案，按「游戏 UI 原文」不动；是否按正文处理请你定。
4. **P2 占用页的正文漏项**：`src/pages/contact/index.astro` 的 `feedback on the cats — it all lands in the same place.`、`src/pages/index.astro` 的 `Place them first — their shape is forced.` 在 HEAD 里仍存在；两文件都在 P2 清单内，本流不越界，建议回给 P2 负责人补。
5. 其余 20 处**可直接改**，已按规则处理，无需拍板。

## 9. 改动明细（逐条）

### 最终补丁（19 条改写，共 20 处 em dash）


**logic-puzzle-grid/index.html**（`src/pages/logic-puzzle-grid/index.astro`）

1. `pair, and the catalog has grown around them — Kakuro` → `pair. The catalog has grown around them: Kakuro`
2. `Murder Sudoku</a> — rules, clue types, and a solved 4×4 case` → `Murder Sudoku</a>. Rules, clue types, and a solved 4×4 case`
3. `Brain Teasers for Adults</a> — 25 free logic puzzles and riddles` → `Brain Teasers for Adults</a>. 25 free logic puzzles and riddles`
4. `Japanese Logic Puzzles</a> — 7 puzzle types from Japan explained` → `Japanese Logic Puzzles</a>. 7 puzzle types from Japan explained`
5. `Number Grid Puzzles</a> — 8 types from Sudoku to Shikaku` → `Number Grid Puzzles</a>. 8 types from Sudoku to Shikaku`

**meowdoku-guide/index.html**（`src/pages/meowdoku-guide/index.astro`）

6. `each colored region — never two in the same row or column` → `each colored region: never two in the same row or column`

**nurikabe/index.html**（`src/pages/nurikabe/index.astro`）

7. `and never touch — two islands never share an edge`（源码内跨行） → `and never touch. Two islands never share an edge`
8. `boards — most of them have many valid` → `boards: most of them have many valid`
9. `reveals one true cell — the real answer for the cell you selected, not a vague nudge — and a contradiction warning`（源码内跨行） → `reveals one true cell (the real answer for the cell you selected, not a vague nudge) and a contradiction warning`
10. `Nonogram (Picture Logic)</a> — paint by numbers` → `Nonogram (Picture Logic)</a>: paint by numbers`
11. `Kakuro (Cross Sums)</a> — the mathematical` → `Kakuro (Cross Sums)</a>: the mathematical`
12. `Akari (Light Up)</a> — place lights` → `Akari (Light Up)</a>: place lights`
13. `Japanese logic puzzles</a> — the family Nurikabe` → `Japanese logic puzzles</a>: the family Nurikabe`

**offline/index.html**（`src/pages/offline.astro`）

14. `No internet right now — but any puzzle` → `No internet right now, but any puzzle`

**kakuro/index.html**（`src/pages/kakuro/index.astro`）

15. `Akari (Light Up)</a> — place lights` → `Akari (Light Up)</a>: place lights`
16. `Light Up vs Kakuro</a> — how the two cousins` → `Light Up vs Kakuro</a>: how the two cousins`
17. `Japanese logic puzzles</a> — the family Kakuro` → `Japanese logic puzzles</a>: the family Kakuro`
18. `Brain teasers for adults</a> — warm up` → `Brain teasers for adults</a>: warm up`

**leaderboard/index.html**（`src/pages/leaderboard.astro`）

19. `Guests are ranked too — you'll appear` → `Guests are ranked too. You'll appear`

### 可选补丁（13 条改写，共 14 处 em dash，`src/lib/changelog-data.ts`）

1. `with hint and pliers tools — free, no account` → `with hint and pliers tools: free, no account`
2. `app-like experience — your browser` → `app-like experience. Your browser`
3. `All third-party ads removed — the site is now ad-free` → `All third-party ads removed: the site is now ad-free`
4. `the same day — GridPaw is now completely ad-free` → `the same day. GridPaw is now completely ad-free`
5. `for two days — a stray non-JSON prefix` → `for two days: a stray non-JSON prefix`
6. `move by move — including an honest label` → `move by move, including an honest label`
7. `picked for you — the same name every time` → `picked for you. The same name every time`
8. `up for grabs — Rookie Paw` → `up for grabs: Rookie Paw`
9. `streak or leaderboard — pure extra for the devoted` → `streak or leaderboard. Pure extra for the devoted`
10. `No more lives — draw freely` → `No more lives: draw freely`
11. `flash and vanish — the game never interrupts` → `flash and vanish. The game never interrupts`
12. `crime scene — two 4×4 warm-ups, then three trickier 6×6 houses — name the room` → `crime scene (two 4×4 warm-ups, then three trickier 6×6 houses), name the room`
13. `explains the rules — it points at the suspect` → `explains the rules: it points at the suspect`
