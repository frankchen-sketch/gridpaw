# C 流交付：/akari/ 人味改写（100 页）

**涉及文件 25 个**：22 个页面 `.astro` + `puzzles.json` + `blog-posts.ts` + `generate-puzzles.mjs`。

**正文 em dash：956 → 1**（源文件口径）。残留 1 处是 index 策略卡标题「Akari Rules — Complete Beginner's Guide」，锚文本=目标页标题，按不动处理。

**不动清单（渲染口径）**：title/meta 93、H1–H6 25、FAQ 84、JSON-LD 88、品牌/页脚 178、锚文本 28，合计 496。

**跨页重复句**：126 类 → 69 类；重复页次 493 → 351。

**路径**：补丁 `research/2026-11-02-humanize-plan/C-akari/changes.patch`（`git apply --check` 通过）；方案 `C-akari/proposed/`；明细见 `counts.md`、`inventory.md`。

**样例**

1. `strongest clue in any Akari puzzle — all four adjacent cells` → `…puzzle: all four adjacent cells`
2. `<strong>Place bulbs on white cells</strong> — tap` → `</strong>: tap`
3. `Number 0 at (1,3) is full — mark (2,3) as X.` → `…is full. Mark (2,3) as X.`
4. `puzzle — watching light spread across a grid — translates` → `puzzle (watching light spread across a grid) translates`
5. `{term.term} — {term.definition}` → `{term.term}: {term.definition}`

**需要你决定**

1. daily 页的动态文案是 JS 字符串（规则 5 不动），仍含 em dash；是否放行改 JS。
2. glossary 术语定义行在 `<details>` 内，我按正文处理并改了（12 处）；若 details 一律不动，回退该行即可。
3. T3 三个等级页的介绍 FAQ 骨架同构（3 段），属不动清单，需补事实才能差异化；easy/medium 同为 10×10，只差 fewer/more walls。
4. 题目详情模板仍有 3 条 ×70 页重复句，需新内容才能拆。
5. `generate-puzzles.mjs` 已同步改（防重新生成回退），确认是否接受改脚本。
