# gridpaw em dash 清零改写日志（P1 嵌入游戏 demo 页）

- 日期：2026-11-02
- 负责节：P1 / 嵌入游戏 demo 页（iframe 内游戏 UI 与页面文案）
- 范围：`public/pictomino/index.html`、`public/kakuro/demo.html`、`public/nurikabe/demo.html`、`public/nonogram/demo.html`、`public/crazy-cleanup/index.html`
- 原因：Mediavine Journey 自动否决项含「过度 AI 内容」，em dash（U+2014）是源码里最强的 AI 指纹
- 原则：只动显示给用户的文案字符串；JS 逻辑、比较运算、正则、事件处理、函数名、变量、模板串拼接逻辑一律不动；`style`/`class`/`id`、URL、`data-*` 不动
- 认领说明：本机与项目内均无 `file-claim` 命令（`which file-claim` 为空）；改动前用 `git status` 对账，5 个文件均无未提交改动（仅 `gp-build.js` 为他人改动，未触碰）

## 验收结果

| 文件 | 改前 em dash | 改后 em dash（源码） | 其中保留 | 说明 |
|---|---|---|---|---|
| public/pictomino/index.html | 40 | 0 | 0 | 清零 |
| public/kakuro/demo.html | 38 | 16 | 16 | 剩余全部为 JS/CSS 注释，不渲染 |
| public/nurikabe/demo.html | 36 | 11 | 11 | 剩余全部为 JS/CSS 注释，不渲染 |
| public/nonogram/demo.html | 21 | 6 | 6 | 剩余全部为 JS/CSS 注释，不渲染 |
| public/crazy-cleanup/index.html | 2 | 0 | 0 | 清零 |
| **合计** | **137** | **33** | **33** | 共改写 104 处 |

## 自检

- 内联 `<script>` 语法：逐一提取 11 个内联脚本块写入临时 `.js` 后跑 `node --check`，全部 `rc=0`（pictomino 4、kakuro 2、nurikabe 2、nonogram 2、crazy-cleanup 1）
- JSON-LD：pictomino 3 个 `application/ld+json` 块全部 `json.loads` 通过（625 / 196 / 4670 字符）
- HTML 标签配对：5 个文件用 `html.parser` 栈校验，均 `unclosed: []`、`errors: []`
- 改动面：`git diff --numstat` 共 99 行增删（99 insertions / 99 deletions），全部为文案标点变化，无标签、属性、变量、逻辑改动
- 未执行 `git commit`；按要求未跑 `pnpm build`（纯静态文件，由主会话统一部署）

## 保留项（33 处，全部为注释）

| 文件 | 行 | 数量 | 内容 | 保留原因 |
|---|---|---|---|---|
| public/kakuro/demo.html | 10 | 1 | // Standalone page carries its own analytics (Pictomino pattern) — the Astro | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 302 | 1 | var revealed = [];          // boolean flat: peeked cells (white) — revealed individually | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 419 | 1 | if (mask & (1 << d)) return false; // duplicate — not solved correctly | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 441 | 1 | // dev builds (localhost/LAN) get unlimited hints for testing — mirrors the | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 486 | 1 | // target: the user's selected cell (if valid) takes priority — a hint for | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 515 | 1 | // highlight ONLY the target cell — run highlighting felt noisy | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 571 | 1 | if (!ce) return; // board re-rendered meanwhile — skip, player will discover it | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 669 | 1 | // dup: also flag the existing same-digit cell(s) in the run — the | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 704 | 1 | // dead-board detector: run the solver against the current state — if no | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 711 | 1 | } catch (e) { /* solver hiccup — stay silent */ } | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 766 | 1 | // runs (dup) or would overflow a run's clue (over) — no board rescanning ── | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 822 | 1 | } catch (err) { workerOk = false; } // file:// blocks workers — sync fallback below | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 839 | 1 | // sync fallback (file:// or worker failure) — browser paints first via setTimeout | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 1071 | 1 | // difficulty in the campaign — easy ×3 → medium starts at campaign slot 3) | JS 注释，不进入 DOM |
| public/kakuro/demo.html | 1129 | 2 | // game_start 口径（2026-10-13 Clarity 取证）：页面可见才算开局——后台标签加载不计， | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 10 | 1 | // Standalone page carries its own analytics (Pictomino pattern) — the Astro | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 67 | 1 | /* generation spinner — covers the board while a Medium/Hard board is built off-thread */ | CSS 注释，不渲染 |
| public/nurikabe/demo.html | 326 | 1 | var locked = {}; // cells auto-corrected this level — reveal, cannot be re-marked | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 329 | 1 | // dev builds (localhost/LAN) get unlimited hints for testing — mirrors the | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 401 | 1 | // ∞ must never render as "10" — keep it ≥13px with horizontal padding | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 422 | 1 | // extra per-lesson action tips — strengthened teaching on tutorial levels | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 462 | 1 | // given number cell — always an island, never changeable | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 617 | 1 | } catch (err) { workerOk = false; } // file:// blocks workers — sync fallback below | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 641 | 1 | // sync fallback — the browser paints the spinner first, then blocks briefly | JS 注释，不进入 DOM |
| public/nurikabe/demo.html | 1034 | 2 | // game_start 口径（2026-10-13 Clarity 取证）：页面可见才算开局——后台标签加载不计， | JS 注释，不进入 DOM |
| public/nonogram/demo.html | 10 | 1 | // Standalone page carries its own analytics (Pictomino pattern) — the Astro | JS 注释，不进入 DOM |
| public/nonogram/demo.html | 234 | 1 | // dev builds (localhost/LAN) get unlimited hints for testing — mirrors the | JS 注释，不进入 DOM |
| public/nonogram/demo.html | 286 | 1 | // ∞ must never render as "10" — keep it ≥13px with horizontal padding | JS 注释，不进入 DOM |
| public/nonogram/demo.html | 445 | 1 | // got silence because blanks stayed unmarked). Wrong fills can't exist — | JS 注释，不进入 DOM |
| public/nonogram/demo.html | 818 | 2 | // game_start 口径（2026-10-13 Clarity 取证）：页面可见才算开局——后台标签加载不计， | JS 注释，不进入 DOM |

> 说明：中文注释里的 `——` 按 2 个 U+2014 计。所有保留项都在 `<script>` 或 `<style>` 注释内，不出现在 HTML 文本节点、`setMsg`/`textContent` 文案、meta 或 JSON-LD 中。

## 范围外提示（未触碰）

同目录下仍有未列入本次 5 个文件的 em dash，按任务边界未改，避免与并行 worker 冲突：

- `public/pictomino/game.html`：10 处（iframe 实际游戏页）
- `public/crazy-cleanup/game.html`：4 处
- `public/pictomino/animal-puzzles.html`：37 处、`easy.html`：33 处、`hard.html`：32 处、`daily-puzzle.html`：26 处、`cat-breeds.html`：11 处（Pictomino 子站落地页）
- `public/pictomino/privacy.html`：3 处、`community.html`：2 处、`404.html`：2 处

若主会话要求 Pictomino 子站整体清零，建议单独派单；本次只保证上述 5 个文件内的显示文案为零（注释除外）。

## 逐文件改写明细

### public/pictomino/index.html

| # | 原句（源码行） | 新句（源码行） | 手段 |
|---|---|---|---|
| 1 | <meta name="description" content="Pictomino is a free spatial reasoning puzzle game for kids. Drag and drop cat picture pieces with pure logic — 5 lives only, no guessing. Play free online — no download needed."> | <meta name="description" content="Pictomino is a free spatial reasoning puzzle game for kids. Drag and drop cat picture pieces with pure logic: 5 lives only, no guessing. Play free online, no download needed."> | 冒号 / 逗号 |
| 2 | "description": "Free spatial reasoning puzzle game for kids. Drag and drop cat picture pieces with pure logic — 5 lives only, no guessing.", | "description": "Free spatial reasoning puzzle game for kids. Drag and drop cat picture pieces with pure logic: 5 lives only, no guessing.", | 冒号 |
| 3 | "text": "A spatial reasoning game trains your child's ability to visualize, rotate, and compare shapes in their mind. Pictomino does this by showing a cat picture cut into pieces — kids must figure out where each fragment belongs using logic, not guessing." | "text": "A spatial reasoning game trains your child's ability to visualize, rotate, and compare shapes in their mind. Pictomino does this by showing a cat picture cut into pieces. Kids must figure out where each fragment belongs using logic, not guessing." | 句号拆句 |
| 4 | "text": "Pictomino combines visual memory, deduction, and decision-making under pressure. Every move requires comparing the piece against the partial picture and reasoning about the best match — skills that directly support math and science learning." | "text": "Pictomino combines visual memory, deduction, and decision-making under pressure. Every move requires comparing the piece against the partial picture and reasoning about the best match: skills that directly support math and science learning." | 冒号 |
| 5 | "text": "Absolutely. Pictomino works on phones, tablets, and computers — tap a piece to select it, then tap its spot to place it." | "text": "Absolutely. Pictomino works on phones, tablets, and computers: tap a piece to select it, then tap its spot to place it." | 冒号 |
| 6 | "text": "You get 5 lives per level. Every wrong placement costs one life — lose all 5 and the level is over. Think carefully before you tap!" | "text": "You get 5 lives per level. Every wrong placement costs one life. Lose all 5 and the level is over. Think carefully before you tap!" | 句号拆句 |
| 7 | "text": "A deduction puzzle game gives you a few clues and asks you to find the one correct answer by ruling out the wrong ones. In Pictomino, the piece, the empty spot, and the picture are your clues — every placement is a small act of logical deduction." | "text": "A deduction puzzle game gives you a few clues and asks you to find the one correct answer by ruling out the wrong ones. In Pictomino, the piece, the empty spot, and the picture are your clues: every placement is a small act of logical deduction." | 冒号 |
| 8 | "text": "No download needed. Pictomino runs entirely in the browser on phones, tablets, and computers. Open the page and start playing — no app store, no account, no install." | "text": "No download needed. Pictomino runs entirely in the browser on phones, tablets, and computers. Open the page and start playing: no app store, no account, no install." | 冒号 |
| 9 | "text": "A spatial reasoning puzzle asks you to mentally rotate, flip, or fit shapes into the right spot. Pictomino is one — you drag cat picture pieces into a grid using only logic and spatial awareness." | "text": "A spatial reasoning puzzle asks you to mentally rotate, flip, or fit shapes into the right spot. Pictomino is one: you drag cat picture pieces into a grid using only logic and spatial awareness." | 冒号 |
| 10 | "text": "Logic puzzles use clues and deduction to find answers. Spatial reasoning puzzles use visual thinking — rotating, fitting, and mentally manipulating shapes. Pictomino combines both: you deduce which piece goes where, then use spatial skills to place it." | "text": "Logic puzzles use clues and deduction to find answers. Spatial reasoning puzzles use visual thinking: rotating, fitting, and mentally manipulating shapes. Pictomino combines both: you deduce which piece goes where, then use spatial skills to place it." | 冒号 |
| 11 | "text": "Each puzzle starts as a real photo of one of 15 cat breeds. The game cuts the photo into a 3×3 or 4×4 grid, hides some pieces (1 to 3 in the tutorial, up to 12 on super-hard), and shows you extra empty candidate spots that do not belong to the picture. You place each piece by matching edges, fur texture, and colors — the piece only clicks into its true slot." | "text": "Each puzzle starts as a real photo of one of 15 cat breeds. The game cuts the photo into a 3×3 or 4×4 grid, hides some pieces (1 to 3 in the tutorial, up to 12 on super-hard), and shows you extra empty candidate spots that do not belong to the picture. You place each piece by matching edges, fur texture, and colors. The piece only clicks into its true slot." | 句号拆句 |
| 12 | <p>Drag and drop cat picture pieces with pure logic — 5 lives only, no guessing. Free to play, works on any device.</p> | <p>Drag and drop cat picture pieces with pure logic: 5 lives only, no guessing. Free to play, works on any device.</p> | 冒号 |
| 13 | <p class="lead">A puzzle that trains spatial reasoning and deduction — one piece at a time.</p> | <p class="lead">A puzzle that trains spatial reasoning and deduction, one piece at a time.</p> | 逗号 |
| 14 | <p>Correct placements unlock the next piece. Wrong ones cost a life — 5 lives, no guessing!</p> | <p>Correct placements unlock the next piece. Wrong ones cost a life: 5 lives, no guessing!</p> | 冒号 |
| 15 | <p><strong>Spatial reasoning</strong> is the ability to visualize and manipulate objects in your mind — rotating, comparing, and predicting how shapes fit together. Research shows it predicts achievement in <strong>mathematics, engineering, and science</strong>.</p> | <p><strong>Spatial reasoning</strong> is the ability to visualize and manipulate objects in your mind: rotating, comparing, and predicting how shapes fit together. Research shows it predicts achievement in <strong>mathematics, engineering, and science</strong>.</p> | 冒号 |
| 16 | <li>🔍 <strong>Visualization</strong> — picturing how a fragment connects to the whole picture</li> | <li>🔍 <strong>Visualization</strong>: picturing how a fragment connects to the whole picture</li> | 冒号 |
| 17 | <li>🧩 <strong>Deduction</strong> — ruling out wrong positions using edge colors and patterns</li> | <li>🧩 <strong>Deduction</strong>: ruling out wrong positions using edge colors and patterns</li> | 冒号 |
| 18 | <li>🧠 <strong>Working memory</strong> — holding the target image in mind while reasoning</li> | <li>🧠 <strong>Working memory</strong> (holding the target image in mind while reasoning)</li> | 括号插入 |
| 19 | <li>😌 <strong>Pressure management</strong> — 5 lives mean every choice matters, teaching careful thinking over random guessing</li> | <li>😌 <strong>Pressure management</strong>: 5 lives mean every choice matters, teaching careful thinking over random guessing</li> | 冒号 |
| 20 | <p>Every Pictomino puzzle starts as a real photograph of one of <strong>15 cat breeds</strong> — British Shorthair, Maine Coon, Siamese, and friends. The game cuts the photo into a square grid, removes some pieces, and shuffles them into a tray. Your job is to place each piece over the empty slot it belongs to, using continuity of edges, fur texture, and background color as clues. There is no randomness and no luck in the win: each piece only fits one slot.</p> | <p>Every Pictomino puzzle starts as a real photograph of one of <strong>15 cat breeds</strong>: British Shorthair, Maine Coon, Siamese, and friends. The game cuts the photo into a square grid, removes some pieces, and shuffles them into a tray. Your job is to place each piece over the empty slot it belongs to, using continuity of edges, fur texture, and background color as clues. There is no randomness and no luck in the win: each piece only fits one slot.</p> | 冒号 |
| 21 | <li>🧩 <strong>Board size</strong> — 3×3 tutorial boards, 4×4 classic boards, 6×6 daily puzzles</li> | <li>🧩 <strong>Board size</strong>: 3×3 tutorial boards, 4×4 classic boards, 6×6 daily puzzles</li> | 冒号 |
| 22 | <li>🔢 <strong>Hidden pieces</strong> — 1 to 3 in the tutorial, 6 on Easy, up to 12 on Super Hard</li> | <li>🔢 <strong>Hidden pieces</strong>: 1 to 3 in the tutorial, 6 on Easy, up to 12 on Super Hard</li> | 冒号 |
| 23 | <li>🎯 <strong>Candidate spots</strong> — extra empty "+" squares that don't belong to the picture; Easy shows 2, Hard shows 4</li> | <li>🎯 <strong>Candidate spots</strong> (extra empty "+" squares that don't belong to the picture; Easy shows 2, Hard shows 4)</li> | 括号插入 |
| 24 | <li>🌫️ <strong>Piece quality + timer</strong> — from Medium up, pieces blur or dim (up to 66%) and each piece has a countdown (40s to 60s)</li> | <li>🌫️ <strong>Piece quality + timer</strong>: from Medium up, pieces blur or dim (up to 66%) and each piece has a countdown (40s to 60s)</li> | 冒号 |
| 25 | <p>A spatial reasoning game trains your child's ability to visualize, rotate, and compare shapes in their mind. Pictomino does this by showing a cat picture cut into pieces — kids must figure out where each fragment belongs using logic, not guessing.</p> | <p>A spatial reasoning game trains your child's ability to visualize, rotate, and compare shapes in their mind. Pictomino does this by showing a cat picture cut into pieces. Kids must figure out where each fragment belongs using logic, not guessing.</p> | 句号拆句 |
| 26 | <p>Pictomino combines visual memory, deduction, and decision-making under pressure. Every move requires comparing the piece against the partial picture and reasoning about the best match — skills that directly support math and science learning.</p> | <p>Pictomino combines visual memory, deduction, and decision-making under pressure. Every move requires comparing the piece against the partial picture and reasoning about the best match: skills that directly support math and science learning.</p> | 冒号 |
| 27 | <p>Absolutely. Pictomino works on phones, tablets, and computers — tap a piece to select it, then tap its spot to place it.</p> | <p>Absolutely. Pictomino works on phones, tablets, and computers: tap a piece to select it, then tap its spot to place it.</p> | 冒号 |
| 28 | <p>You get 5 lives per level. Every wrong placement costs one life — lose all 5 and the level is over. Think carefully before you tap!</p> | <p>You get 5 lives per level. Every wrong placement costs one life. Lose all 5 and the level is over. Think carefully before you tap!</p> | 句号拆句 |
| 29 | <p>A deduction puzzle game gives you a few clues and asks you to find the one correct answer by ruling out the wrong ones. In Pictomino, the piece, the empty spot, and the picture are your clues — every placement is a small act of logical deduction.</p> | <p>A deduction puzzle game gives you a few clues and asks you to find the one correct answer by ruling out the wrong ones. In Pictomino, the piece, the empty spot, and the picture are your clues: every placement is a small act of logical deduction.</p> | 冒号 |
| 30 | <p>No download needed. Pictomino runs entirely in the browser on phones, tablets, and computers. Open the page and start playing — no app store, no account, no install.</p> | <p>No download needed. Pictomino runs entirely in the browser on phones, tablets, and computers. Open the page and start playing: no app store, no account, no install.</p> | 冒号 |
| 31 | <p>A spatial reasoning puzzle asks you to mentally rotate, flip, or fit shapes into the right spot. Pictomino is one — you drag cat picture pieces into a grid using only logic and spatial awareness.</p> | <p>A spatial reasoning puzzle asks you to mentally rotate, flip, or fit shapes into the right spot. Pictomino is one: you drag cat picture pieces into a grid using only logic and spatial awareness.</p> | 冒号 |
| 32 | <p>Logic puzzles use clues and deduction to find answers. Spatial reasoning puzzles use visual thinking — rotating, fitting, and mentally manipulating shapes. Pictomino combines both: you deduce which piece goes where, then use spatial skills to place it.</p> | <p>Logic puzzles use clues and deduction to find answers. Spatial reasoning puzzles use visual thinking: rotating, fitting, and mentally manipulating shapes. Pictomino combines both: you deduce which piece goes where, then use spatial skills to place it.</p> | 冒号 |
| 33 | <p>Each puzzle starts as a real photo of one of 15 cat breeds. The game cuts the photo into a 3×3 or 4×4 grid, hides some pieces (1 to 3 in the tutorial, up to 12 on super-hard), and shows extra empty candidate spots that don't belong to the picture. You place each piece by matching edges, fur texture, and colors — it only clicks into its true slot.</p> | <p>Each puzzle starts as a real photo of one of 15 cat breeds. The game cuts the photo into a 3×3 or 4×4 grid, hides some pieces (1 to 3 in the tutorial, up to 12 on super-hard), and shows extra empty candidate spots that don't belong to the picture. You place each piece by matching edges, fur texture, and colors. It only clicks into its true slot.</p> | 句号拆句 |
| 34 | <p>Use Furriq — a free AI-powered cat breed identifier. Snap a photo and find out your cat's breed in seconds.</p> | <p>Use Furriq, a free AI-powered cat breed identifier. Snap a photo and find out your cat's breed in seconds.</p> | 逗号 |
| 35 | <a href="https://furriq.com" rel="noopener">Try Furriq — Free Cat Breed Identifier</a> | <a href="https://furriq.com" rel="noopener">Try Furriq: Free Cat Breed Identifier</a> | 冒号 |
| 36 | <p>GridPaw Akari is a cat-themed logic puzzle (Light Up) — place light bulbs, follow numbered clues, illuminate every cell. Play free online.</p> | <p>GridPaw Akari is a cat-themed logic puzzle (Light Up): place light bulbs, follow numbered clues, illuminate every cell. Play free online.</p> | 冒号 |
| 37 | <a href="https://gridpaw.com/akari/" rel="noopener">Play GridPaw Akari — Free Cat Logic Puzzle</a> | <a href="https://gridpaw.com/akari/" rel="noopener">Play GridPaw Akari: Free Cat Logic Puzzle</a> | 冒号 |
| 38 | <p>GridPaw is a cat-themed rectangle partition puzzle — drag to draw rectangles, match numbers, fill the grid. Free online.</p> | <p>GridPaw is a cat-themed rectangle partition puzzle: drag to draw rectangles, match numbers, fill the grid. Free online.</p> | 冒号 |
| 39 | <a href="https://gridpaw.com/" rel="noopener">Play GridPaw — Free Cat Rectangle Puzzle</a> | <a href="https://gridpaw.com/" rel="noopener">Play GridPaw: Free Cat Rectangle Puzzle</a> | 冒号 |

### public/kakuro/demo.html

| # | 原句（源码行） | 新句（源码行） | 手段 |
|---|---|---|---|
| 1 | <title>Kakuro Demo — GridPaw</title> | <title>Kakuro Demo: GridPaw</title> | 冒号 |
| 2 | <div class="sub">GridPaw demo — sums, no repeats, pure logic</div> | <div class="sub">GridPaw demo: sums, no repeats, pure logic</div> | 冒号 |
| 3 | <div>Tap any clue cell — like the glowing one — and the run it controls lights up, so you always know which cells a number governs.</div> | <div>Tap any clue cell (like the glowing one) and the run it controls lights up, so you always know which cells a number governs.</div> | 括号插入 |
| 4 | <div class="foot">Demo build — engine self-tested via scripts/selftest-kakuro.mjs</div> | <div class="foot">Demo build: engine self-tested via scripts/selftest-kakuro.mjs</div> | 冒号 |
| 5 | bar.textContent = ' Tap the fog to peek — free & unlimited'; | bar.textContent = ' Tap the fog to peek: free & unlimited'; | 冒号 |
| 6 | setMsg(' Fog lifted! The far side is revealed — finish the board.'); | setMsg(' Fog lifted! The far side is revealed. Finish the board.'); | 句号拆句 |
| 7 | setMsg('No hints left this level — use peeks or solve it!', 'err'); | setMsg('No hints left this level. Use peeks or solve it!', 'err'); | 句号拆句 |
| 8 | if (target < 0) { setMsg('Nothing left to hint — board looks complete!'); return; } | if (target < 0) { setMsg('Nothing left to hint: board looks complete!'); return; } | 冒号 |
| 9 | setMsg('💡 Fill ' + answer + ' in row ' + gr + ', col ' + gc + ' — the green key. (' + (isDev ? 'unlimited hints' : hintsLeft + ' hints left') + ')'); | setMsg('💡 Fill ' + answer + ' in row ' + gr + ', col ' + gc + '. The green key. (' + (isDev ? 'unlimited hints' : hintsLeft + ' hints left') + ')'); | 句号拆句 |
| 10 | ? 'That digit is already in this run — no repeats!' | ? 'That digit is already in this run: no repeats!' | 冒号 |
| 11 | : 'That run already sums past its clue — too big!', | : 'That run already sums past its clue. Too big!', | 句号拆句 |
| 12 | setMsg('⚠️ This board can no longer be solved — one of your earlier digits must be wrong. Clear cells to backtrack.', 'err'); | setMsg('⚠️ This board can no longer be solved. One of your earlier digits must be wrong. Clear cells to backtrack.', 'err'); | 句号拆句 |
| 13 | chipEl.textContent = 'Tutorial ' + (level + 1) + '/4 — ' + info.def.title; | chipEl.textContent = 'Tutorial ' + (level + 1) + '/4: ' + info.def.title; | 冒号 |
| 14 | chipEl.textContent = lvlLabel + ' — ' + info.key.charAt(0).toUpperCase() + info.key.slice(1) + | chipEl.textContent = lvlLabel + ': ' + info.key.charAt(0).toUpperCase() + info.key.slice(1) + | 冒号 |
| 15 | ' — ' + (info.preset.rows) + '×' + (info.preset.cols) + (info.key === 'easy' ? ' · no fog' : ' · 🐾 fog'); | ' · ' + (info.preset.rows) + '×' + (info.preset.cols) + (info.key === 'easy' ? ' · no fog' : ' · 🐾 fog'); | 间隔点 |
| 16 | setMsg(info.type === 'daily' ? '📅 Daily puzzle — same board for everyone today.' : 'Generating a fresh puzzle…'); | setMsg(info.type === 'daily' ? '📅 Daily puzzle: same board for everyone today.' : 'Generating a fresh puzzle…'); | 冒号 |
| 17 | setMsg('Could not generate a puzzle this time — tap ↺ Restart to try again.', 'err'); | setMsg('Could not generate a puzzle this time. Tap ↺ Restart to try again.', 'err'); | 句号拆句 |
| 18 | setMsg(' Fog mode: solve the visible block first. Tap the fog to peek — free & unlimited.'); | setMsg(' Fog mode: solve the visible block first. Tap the fog to peek: free & unlimited.'); | 冒号 |
| 19 | setMsg('Easy has no fog — Fog mode starts at Medium (use the fog preview buttons below).'); | setMsg('Easy has no fog. Fog mode starts at Medium (use the fog preview buttons below).'); | 句号拆句 |
| 20 | setMsg('Fill every white cell. Runs must sum to their clue — no repeated digits in a run.'); | setMsg('Fill every white cell. Runs must sum to their clue: no repeated digits in a run.'); | 冒号 |
| 21 | setMsg('✅ ' + info.def.title + ' — got it! Next lesson…', 'tut'); | setMsg('✅ ' + info.def.title + ': got it! Next lesson…', 'tut'); | 冒号 |

### public/nurikabe/demo.html

| # | 原句（源码行） | 新句（源码行） | 手段 |
|---|---|---|---|
| 1 | <title>Nurikabe Demo — GridPaw</title> | <title>Nurikabe Demo: GridPaw</title> | 冒号 |
| 2 | <div class="sub">GridPaw demo — every island matches its number, the sea stays one</div> | <div class="sub">GridPaw demo: every island matches its number, the sea stays one</div> | 冒号 |
| 3 | <p id="failText">Three wrong marks — this board got away from you.</p> | <p id="failText">Three wrong marks: this board got away from you.</p> | 冒号 |
| 4 | <p class="rule">Four black cells in a square are forbidden — three sea cells around one corner force the fourth to be island.</p> | <p class="rule">Four black cells in a square are forbidden: three sea cells around one corner force the fourth to be island.</p> | 冒号 |
| 5 | <p class="guide-taps">The 4 tutorials teach each rule one at a time — skip them anytime with “Skip tutorial »”.</p> | <p class="guide-taps">The 4 tutorials teach each rule one at a time. Skip them anytime with “Skip tutorial »”.</p> | 句号拆句 |
| 6 | <button id="guideGoBtn">Got it — start with Tutorial 1</button> | <button id="guideGoBtn">Got it, start with Tutorial 1</button> | 逗号 |
| 7 | <div class="foot" id="foot">Demo build — engine self-tested via scripts/selftest-nurikabe.mjs</div> | <div class="foot" id="foot">Demo build: engine self-tested via scripts/selftest-nurikabe.mjs</div> | 冒号 |
| 8 | 'First move: tap any cell without a number — it turns into sea ≈. The 1-island is already complete!', | 'First move: tap any cell without a number. It turns into sea ≈. The 1-island is already complete!', | 句号拆句 |
| 9 | 'First move: find three sea cells ≈ around one corner — the fourth cell must be island.', | 'First move: find three sea cells ≈ around one corner. The fourth cell must be island.', | 句号拆句 |
| 10 | setMsg('Wrong — that cell is ' + label + ' in the solution — auto-marked (mistake №' + mistakes + ')', 'err'); | setMsg('Wrong: that cell is ' + label + ' in the solution. Auto-marked (mistake №' + mistakes + ')', 'err'); | 冒号 / 句号拆句 |
| 11 | setMsg('Wrong — auto-marked ' + label + ' (−1 ❤, ' + hearts + ' left)', 'err'); | setMsg('Wrong. Auto-marked ' + label + ' (−1 ❤, ' + hearts + ' left)', 'err'); | 句号拆句 |
| 12 | else setMsg('Every cell is marked, but the islands don\u2019t match the numbers — some sea cells are actually island, or an island has the wrong size. Review and fix!', 'err'); | else setMsg('Every cell is marked, but the islands don\u2019t match the numbers. Some sea cells are actually island, or an island has the wrong size. Review and fix!', 'err'); | 句号拆句 |
| 13 | setMsg('No hints left this level — solve it!', 'err'); | setMsg('No hints left this level. Solve it!', 'err'); | 句号拆句 |
| 14 | setMsg('Nothing left to hint — every cell is already marked!'); | setMsg('Nothing left to hint: every cell is already marked!'); | 冒号 |
| 15 | setMsg('💡 Row ' + gr + ', col ' + gc + ' is ' + (grid[target] === CELL_ISLAND ? 'an island — tap it twice to clear.' : 'sea ≈ — tap it once.') + | setMsg('💡 Row ' + gr + ', col ' + gc + ' is ' + (grid[target] === CELL_ISLAND ? 'an island. Tap it twice to clear.' : 'sea ≈: tap it once.') + | 冒号 / 句号拆句 |
| 16 | chipEl.textContent = 'Tutorial ' + (level + 1) + '/4 — ' + info.def.title; | chipEl.textContent = 'Tutorial ' + (level + 1) + '/4: ' + info.def.title; | 冒号 |
| 17 | chipEl.textContent = label + ' — ' + info.preset.label + | chipEl.textContent = label + ': ' + info.preset.label + | 冒号 |
| 18 | (info.type === 'daily' ? ' ' : ' — ') + info.preset.rows + '×' + info.preset.cols; | (info.type === 'daily' ? ' ' : ' · ') + info.preset.rows + '×' + info.preset.cols; | 间隔点 |
| 19 | setMsg(info.type === 'daily' ? '📅 Daily puzzle — same board for everyone today.' : 'Generating a fresh puzzle…'); | setMsg(info.type === 'daily' ? '📅 Daily puzzle: same board for everyone today.' : 'Generating a fresh puzzle…'); | 冒号 |
| 20 | setMsg('Could not generate a puzzle this time — tap ↺ Restart to try again.', 'err'); | setMsg('Could not generate a puzzle this time. Tap ↺ Restart to try again.', 'err'); | 句号拆句 |
| 21 | ? '📅 Same board for everyone today — come back tomorrow for a fresh one.' | ? '📅 Same board for everyone today. Come back tomorrow for a fresh one.' | 句号拆句 |
| 22 | text.textContent = 'Rule learned: ' + info.def.title + ' — next lesson…'; | text.textContent = 'Rule learned: ' + info.def.title + '. Next lesson…'; | 句号拆句 |
| 23 | 'Three wrong marks — this board got away from you. A fresh one is coming up.'; | 'Three wrong marks: this board got away from you. A fresh one is coming up.'; | 冒号 |

### public/nonogram/demo.html

| # | 原句（源码行） | 新句（源码行） | 手段 |
|---|---|---|---|
| 1 | <title>Nonogram Demo — GridPaw</title> | <title>Nonogram Demo: GridPaw</title> | 冒号 |
| 2 | <div class="sub">GridPaw demo — clues count runs, fill the picture</div> | <div class="sub">GridPaw demo: clues count runs, fill the picture</div> | 冒号 |
| 3 | <div class="foot" id="foot">Demo build — engine self-tested via scripts/selftest-nonogram.mjs</div> | <div class="foot" id="foot">Demo build: engine self-tested via scripts/selftest-nonogram.mjs</div> | 冒号 |
| 4 | setMsg('That cell is empty in the picture — auto-marked ✕ (mistake №' + mistakes + ')', 'err'); | setMsg('That cell is empty in the picture: auto-marked ✕ (mistake №' + mistakes + ')', 'err'); | 冒号 |
| 5 | if (allKnown()) setMsg('Every cell is marked, but the picture doesn\u2019t match the clues — some ✕ cells are actually filled. Review and fix!', 'err'); | if (allKnown()) setMsg('Every cell is marked, but the picture doesn\u2019t match the clues. Some ✕ cells are actually filled. Review and fix!', 'err'); | 句号拆句 |
| 6 | setMsg('No hints left this level — solve it!', 'err'); | setMsg('No hints left this level. Solve it!', 'err'); | 句号拆句 |
| 7 | setMsg('Nothing left to hint — every cell is already marked!'); | setMsg('Nothing left to hint: every cell is already marked!'); | 冒号 |
| 8 | setMsg('💡 Row ' + gr + ', col ' + gc + ' is ' + (grid[target] === CELL_FILLED ? 'filled — tap it ⬛.' : 'empty — tap it ✕.') + | setMsg('💡 Row ' + gr + ', col ' + gc + ' is ' + (grid[target] === CELL_FILLED ? 'filled. Tap it ⬛.' : 'empty. Tap it ✕.') + | 句号拆句 |
| 9 | chipEl.textContent = 'Tutorial ' + (level + 1) + '/4 — ' + info.def.title; | chipEl.textContent = 'Tutorial ' + (level + 1) + '/4: ' + info.def.title; | 冒号 |
| 10 | chipEl.textContent = label + ' — ' + info.preset.label + | chipEl.textContent = label + ': ' + info.preset.label + | 冒号 |
| 11 | (info.type === 'daily' ? ' ' : ' — ') + info.preset.rows + '×' + info.preset.cols; | (info.type === 'daily' ? ' ' : ' · ') + info.preset.rows + '×' + info.preset.cols; | 间隔点 |
| 12 | setMsg(info.type === 'daily' ? '📅 Daily puzzle — same board for everyone today.' : 'Generating a fresh puzzle…'); | setMsg(info.type === 'daily' ? '📅 Daily puzzle: same board for everyone today.' : 'Generating a fresh puzzle…'); | 冒号 |
| 13 | setMsg('Could not generate a puzzle this time — tap ↺ Restart to try again.', 'err'); | setMsg('Could not generate a puzzle this time. Tap ↺ Restart to try again.', 'err'); | 句号拆句 |
| 14 | ? '📅 Same board for everyone today — come back tomorrow for a fresh one.' | ? '📅 Same board for everyone today. Come back tomorrow for a fresh one.' | 句号拆句 |

### public/crazy-cleanup/index.html

| # | 原句（源码行） | 新句（源码行） | 手段 |
|---|---|---|---|
| 1 | <title>Crazy Cleanup — Sort the Mess, Relax Your Mind</title> | <title>Crazy Cleanup: Sort the Mess, Relax Your Mind</title> | 冒号 |
| 2 | <p>Every level is a messy room. Sort everything into the right buckets.<br>Watch out — items buried under others can't be picked until you clear the top.</p> | <p>Every level is a messy room. Sort everything into the right buckets.<br>Watch out: items buried under others can't be picked until you clear the top.</p> | 冒号 |

---

# gridpaw em dash 清零改写日志（P1：rotate-rings 页族 + BP3 零星页）

- 负责节：`src/pages/rotate-rings/` 全部 12 页（index + level-1~10 + level-32）、`brain-puzzle-3-level-{31,27,39,9,26,48,5}` 共 7 页
- 原则：只动标点与连接词；事实、数字、时间戳、颜色序列、分数、内链 URL、className、变量、TDK、H2/H3、JSON-LD 结构一律不动
- 手段轮换：冒号 / 句号拆句 / 括号插入（每页新增 ≤2 次）/ 逗号同位语 / 分号；同段内不连用同一手段
- 认领：19 个文件改动前均 `file-claim.py claim`，改完 release

## 验收结果

| 文件 | 改前 | 改后（全文） | 其中正文 | 说明 |
|---|---|---|---|---|
| src/pages/rotate-rings/index.astro | 30 | 2 | 0 | 剩 2 处在 title/description（TDK 禁改区） |
| src/pages/rotate-rings/level-1/index.astro | 16 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-2/index.astro | 21 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-3/index.astro | 16 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-4/index.astro | 19 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-5/index.astro | 14 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-6/index.astro | 18 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-7/index.astro | 16 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-8/index.astro | 19 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-9/index.astro | 18 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-10/index.astro | 19 | 2 | 0 | 同上 |
| src/pages/rotate-rings/level-32/index.astro | 27 | 2 | 0 | 同上 |
| src/pages/brain-puzzle-3-level-31/index.astro | 17 | 1 | 0 | 剩 1 处在 description（TDK 禁改区），title 无破折号 |
| src/pages/brain-puzzle-3-level-27/index.astro | 13 | 0 | 0 | title/description 无破折号 |
| src/pages/brain-puzzle-3-level-39/index.astro | 14 | 0 | 0 | 同上 |
| src/pages/brain-puzzle-3-level-9/index.astro | 14 | 0 | 0 | 同上 |
| src/pages/brain-puzzle-3-level-26/index.astro | 14 | 0 | 0 | 同上 |
| src/pages/brain-puzzle-3-level-48/index.astro | 13 | 0 | 0 | 同上 |
| src/pages/brain-puzzle-3-level-5/index.astro | 14 | 0 | 0 | 同上 |
| **合计** | **332** | **25** | **0** | 25 处全部落在 TDK 禁改区 |

- `pnpm run build`：绿（270 pages built）
- 渲染后校验（dist）：上述 19 个页面 `<body>` 内 U+2014 = 0
- FAQ：每页 JSON-LD 与可见 `<details>` 同步改写，逐字仍相等（脚本比对 19 页，0 处不一致）
- 事实核对：与 git HEAD 逐文件比对数字 token，0 差异（分数、时间戳、步数、颜色数全部保留）；正文词数变化 ≤6
- 括号新增计数：每页 ≤2（level-1/8 为 1，level-5/index 为 0）

## 例外与说明（必读）

1. **25 处 TDK 保留**：12 个 rotate-rings 页的 `const title` / `const description` 各 1 处，加 BP3-31 的 description 1 处。按任务的「TDK/description 禁改区」逐字保留。若主线决定连 TDK 一起清，统一把 ` — ` 换成 `: ` 即可。渲染后这些字段会在 title/og:title/twitter:title/description/og:description 等重复出现，正文判定不受影响，但 HTML 全文计数不为 0。
2. **FAQ 双份同步**：FAQ 文本在 JSON-LD 与可见 `<details>` 各存一份，按同一字符串改写，保证结构化数据与可见内容仍逐字一致。
3. **alt 文本**：`Daily Akari — new grid every midnight` 与各页 hero `alt` 属可见替代文本，非 og 字段，按正文处理（冒号/逗号）。
4. **未 commit**（按纪律）。其余结构性模板（disclaimer、verify-note、CTA 行）本轮不含 em dash，未改。

## 模板同构打散（rotate-rings 页族）

| 模板 | 变体 | 覆盖 |
|---|---|---|
| 「跑 N 种颜色 — 列表 —」 | A `Level 3 runs four colors: blue, orange, purple and red, every piece a free-turning C-shape.` / B `Level 4 runs four colors (purple, green, red and blue) around fixed full-circle anchors.` / C `Six colors on the opening board: orange and cyan clear out first, ...` | 3 变体（level-3/4/5） |
| 「全套环锚点 — 插入语 —」 | A `Two full blue circles anchor the board, one top and one bottom, with ...` / B `Two full blue rings (one top, one bottom) pin this board down` / C `Two whole rings, red top right and purple bottom center, are bolted` | 3 变体（level-6 内 2 种 + level-8） |
| cross-card `alt` | A `Daily Akari: new grid every midnight`（5 页）/ B `Daily Akari, new grid every midnight`（7 页） | 2 变体 |
| cross-card `cross-desc` | A `New grid every midnight. Light it up. No ads, no sign-up.`（5 页）/ B `New grid every midnight: light it up. No ads, no sign-up.`（7 页） | 2 变体 |
| `Next level` 行 | A 冒号 `: two turns, two bursts. Or ...`（3 页）/ B 句号 `. Or back to ...`（4 页）/ C 逗号 `, or back to ...`（2 页） | 3 变体 |

step-card `<strong>` 小标题全页族已无重复项（脚本检查：重复 ≥2 的 strong 标题 = 0）。

## 逐页改动示例

- level-1：`The board holds exactly two segments (a blue C-shape on the left and an orange C-shape on the right), with the tutorial hint ...`；`The only burst: blue + orange close the loop`
- level-2：`First: spin the blue C-shape ... with orange: burst ≈0:12` / `... into the purple piece; burst ≈0:16 ...`
- level-3：`Orange + red close together. Then "Great!" and done`
- level-6：`seven named bursts from ≈1:57 to ≈2:11 (green ×2, purple, red, orange ×2, light blue), stacking ...`
- level-9：`The ladder starts small (blue 200 at 3:16, green 500 at 3:18), then stalls ... at 3:24: the only slow patch ...`
- level-32：`Ten bursts in total. The middle clusters clear between 0:24 and 0:59, ...`；`The endgame. Three loops, one at a time`
- BP3-31：`in a haunted subway car. The trick is that most findings are drags, not taps: ...`
- BP3-48：`Only two presses land in Level 48 (the phone at step 3 and the double-tap on the window at step 8), while ...`
