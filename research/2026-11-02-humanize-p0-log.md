# gridpaw em dash 清零改写日志（P0 四页）

- 日期：2026-11-02
- 范围：evidence 清单里 em dash 密度最高的 4 个内容页
- 原因：Mediavine Journey 自动否决项含「过度 AI 内容」，逐句扫描中 em dash（U+2014）密度是最强 AI 指纹
- 手改原则：只动标点与连接词，词序、事实、数字、内链、TDK、标题、schema 结构一律不动
- 手段轮换：冒号 / 句号拆句 / 括号插入（每页 ≤2 次）/ 逗号同位语 / 分号 / 删破折号保留连词，同段内不连用同一手段

## 验收结果

| 文件 | 改前 em dash | 改后 em dash（源码） | 说明 |
|---|---|---|---|
| src/pages/about/index.astro | 18 | 1 | 剩 1 处在 `const title`（TDK，禁改区），见「例外」 |
| src/pages/block-blast-hints/index.astro | 30 | 0 | 含 JSON-LD 与可见 FAQ 各一处，成对同步改写 |
| src/pages/cross-math-puzzle/index.astro | 32 | 0 | 含 FAQ JSON-LD 与可见 FAQ，成对同步改写 |
| src/pages/the-loop-puzzle/index.astro | 29 | 0 | FAQ 数组是 schema 与正文的单一真源，改一次两边同步 |

- `pnpm run build`：绿（270 pages built）
- 逐句核对：evidence 清单命中的句子全部处理；另补 4 处清单漏收的可见文本（表格单元格）
- cross-math 的 `not just the layout`：按要求保留原样（孤立出现，不构成指纹）

## 例外与说明（必读）

1. **about 的 `<title>` 保留 em dash**：`const title = "About GridPaw — Free Cat-Themed Logic Puzzles"` 属 TDK 禁改区，逐字保留。该字符只出现在 `<title>` / `og:title` / `twitter:title` / Article headline，不进正文，不影响正文人味判定。若主线决定连 TDK 一起清，改成冒号版即可（`About GridPaw: Free Cat-Themed Logic Puzzles`），本会话未动。
2. **FAQ / JSON-LD 成对改写**：block-blast 与 cross-math 的 FAQ 文本在 JSON-LD 与可见 `<details>` 中各存一份。可见 FAQ 属正文，必须清；若只改可见那份，schema 与页面正文会不一致（Google FAQ 结构化数据要求与可见内容一致），因此两份按同一字符串同步改写，保证逐字一致。
3. **清单外的 2 处**：cross-math 对比表单元格 `Flat — mixed operators everywhere`、`Never — max deduction, no ambiguity` 是可见正文，清单按「句子」抽取时漏收；不清则源码仍有 em dash，故一并处理（仅标点改动）。
4. **未处理（本草范围外）**：`LoopPuzzlePlay.astro`、`ExtensionPromo.astro`、`SEOHead` 的 `og:image:alt`、analytics 注释里仍有 em dash，会出现在 dist HTML 里。它们属共享组件/系统字段，不在本任务 4 个文件内，建议另开一单处理（其中 LoopPuzzlePlay 的 8 处是玩家可见微文案，优先级最高）。


## src/pages/about/index.astro

| # | 原句 | 新句 | 手段 |
|---|---|---|---|
| 1 | GridPaw is a free collection of Japanese logic puzzles — every one of them themed around cats, and every one of them solvable by pure logic alone. | GridPaw is a free collection of Japanese logic puzzles: every one of them themed around cats, and every one of them solvable by pure logic alone. | 冒号 |
| 2 | GridPaw started with <a href="/">Shikaku</a> — a rectangle-division puzzle where you carve a grid into boxes, each cat marking the corner of exactly one rectangle. | GridPaw started with <a href="/">Shikaku</a>, a rectangle-division puzzle where you carve a grid into boxes, each cat marking the corner of exactly one rectangle. | 逗号/同位语 |
| 3 | <a href="/">Shikaku</a> — divide the grid into rectangles; every cat sits in exactly one box | <a href="/">Shikaku</a>: divide the grid into rectangles; every cat sits in exactly one box | 冒号 |
| 4 | <a href="/akari/">Akari (Light Up)</a> — place cats so every cell is lit, obeying the numbered walls | <a href="/akari/">Akari (Light Up)</a>: place cats so every cell is lit, obeying the numbered walls | 冒号 |
| 5 | <a href="/kakuro/">Kakuro</a> — the cross-sum puzzle: digits that add up, crossword-style | <a href="/kakuro/">Kakuro</a>, the cross-sum puzzle: digits that add up, crossword-style | 逗号/同位语 |
| 6 | <a href="/nonogram/">Nonogram</a> — reveal a hidden picture from row and column clues | <a href="/nonogram/">Nonogram</a>: reveal a hidden picture from row and column clues | 冒号 |
| 7 | <a href="/nurikabe/">Nurikabe</a> — carve islands of the right size and wall off the rest | <a href="/nurikabe/">Nurikabe</a>: carve islands of the right size and wall off the rest | 冒号 |
| 8 | <a href="/pictomino/">Pictomino</a> — a stand-alone picture-logic sub-site | <a href="/pictomino/">Pictomino</a> (a stand-alone picture-logic sub-site) | 括号插入 |
| 9 | Plus KenKen, Star Battle, Takuzu (Binary), Hashi, Slitherlink, and more — the collection keeps growing | Plus KenKen, Star Battle, Takuzu (Binary), Hashi, Slitherlink, and more. The collection keeps growing | 句号拆句 |
| 10 | The logic underneath is exactly as demanding as the classic paper versions — the cats just make the hours feel warmer. | The logic underneath is exactly as demanding as the classic paper versions. The cats just make the hours feel warmer. | 句号拆句 |
| 11 | If you're stuck, you've missed a read — not a lucky coin flip. | If you're stuck, you've missed a read, not a lucky coin flip. | 逗号/同位语 |
| 12 | GridPaw is free to play, with no account required — all game progress stays in your browser unless you choose to sign in with Google to sync it. | GridPaw is free to play, with no account required. All game progress stays in your browser unless you choose to sign in with Google to sync it. | 句号拆句 |
| 13 | See the <a href="/privacy/">privacy policy</a> for exactly what is and isn't stored, and the <a href="/terms/">terms of use</a> for the ground rules — fair play on the leaderboard, what you may reuse, and how our third-party game guides work. | See the <a href="/privacy/">privacy policy</a> for exactly what is and isn't stored, and the <a href="/terms/">terms of use</a> for the ground rules: fair play on the leaderboard, what you may reuse, and how our third-party game guides work. | 冒号 |
| 14 | New puzzles, difficulty tiers, and quality-of-life features ship continuously — the <a href="/changelog/">changelog</a> tracks every update. | New puzzles, difficulty tiers, and quality-of-life features ship continuously. The <a href="/changelog/">changelog</a> tracks every update. | 句号拆句 |
| 15 | Messages are read by a human — usually the same one who drew the cats. | Messages are read by a human, usually the same one who drew the cats. | 逗号/同位语 |
| 16 | Every puzzle, every difficulty tier, every help page — free, no account required. | Every puzzle, every difficulty tier, every help page: free, no account required. | 冒号 |
| 17 | <details><summary>Can I use GridPaw puzzles in my classroom or publication?</summary><p>Get in touch via the <a href="/contact/">contact page</a> and describe what you have in mind — classroom use is usually an easy yes.</p> | <details><summary>Can I use GridPaw puzzles in my classroom or publication?</summary><p>Get in touch via the <a href="/contact/">contact page</a> and describe what you have in mind. Classroom use is usually an easy yes.</p> | 句号拆句 |

## src/pages/block-blast-hints/index.astro

| # | 原句 | 新句 | 手段 |
|---|---|---|---|
| 1 | Lines that fill completely — horizontally or vertically — clear from the board and score points. | Lines that fill completely (horizontally or vertically) clear from the board and score points. | 括号插入（2 处同步） |
| 2 | The domino strategy — leaving a one-cell gap next to a near-full line so a 1x2 block can complete it — is one of the most reliable combo builders. | The domino strategy, leaving a one-cell gap next to a near-full line so a 1x2 block can complete it, is one of the most reliable combo builders. | 逗号/同位语（2 处同步） |
| 3 | A placed piece locks in place immediately — it cannot be moved, rotated, or undone — so plan the whole placement before you drag. | A placed piece locks in place immediately; it cannot be moved, rotated, or undone, so plan the whole placement before you drag. | 分号（2 处同步） |
| 4 | Block Blast looks deceptively simple — drag colored blocks onto an 8x8 board, clear full lines, repeat. | Block Blast looks deceptively simple: drag colored blocks onto an 8x8 board, clear full lines, repeat. | 冒号 |
| 5 | Your first goal is not a high score — it is a longer game. | Your first goal is not a high score. It is a longer game. | 句号拆句 |
| 6 | The moment one column rises above its neighbors, you need a 1xN block shaped exactly like the gap — and the game frequently refuses to give you one. | The moment one column rises above its neighbors, you need a 1xN block shaped exactly like the gap, and the game frequently refuses to give you one. | 逗号/同位语 |
| 7 | When a row is one cell short, leave the gap — and keep a column beside it one cell shallow. | When a row is one cell short, leave the gap and keep a column beside it one cell shallow. | 删破折号留连词 |
| 8 | Leave flexible corner space so a big square piece has a home — a 2x2 or 3x3 placed in a corner clears massive area when its lines complete. | Leave flexible corner space so a big square piece has a home: a 2x2 or 3x3 placed in a corner clears massive area when its lines complete. | 冒号 |
| 9 | It absorbs stair-steps, gives 1xN pieces a home, and — when the board gets critical — becomes a completed line you can clear for breathing room. | It absorbs stair-steps, gives 1xN pieces a home, and (when the board gets critical) becomes a completed line you can clear for breathing room. | 括号插入 |
| 10 | It feels safe because it is "out of the way" — until the only piece that fits is a horizontal 1x5 and there is no room left on either side. | It feels safe because it is "out of the way", until the only piece that fits is a horizontal 1x5 and there is no room left on either side. | 逗号/同位语 |
| 11 | The queue is not a hint — it is the rules of the next three turns. | The queue is not a hint. It is the rules of the next three turns. | 句号拆句 |
| 12 | Rebalance after every clear.</strong> Each line clear creates new gaps — immediately smooth them with small pieces. | Rebalance after every clear.</strong> Each line clear creates new gaps: immediately smooth them with small pieces. | 冒号 |
| 13 | Follow that loop and the score improvement is not gradual — it is a step change. | Follow that loop and the score improvement is not gradual. It is a step change. | 句号拆句 |
| 14 | No download, no signup — play free in your browser: <a href="/nurikabe/">Play Free →</a> | No download, no signup. Play free in your browser: <a href="/nurikabe/">Play Free →</a> | 句号拆句 |
| 15 | <a href="/arrows-puzzle/">Arrows Puzzle: How to Play, Full Rules, and Beginner Tips</a> — another spatial-placement puzzle that rewards the same planning muscle. | <a href="/arrows-puzzle/">Arrows Puzzle: How to Play, Full Rules, and Beginner Tips</a>, another spatial-placement puzzle that rewards the same planning muscle. | 逗号/同位语 |
| 16 | <a href="/cross-math-puzzle/">Cross Math Puzzle: Rules, Strategies &amp; Printable Tips</a> — number-grid logic for puzzle fans who want a different kind of constraint. | <a href="/cross-math-puzzle/">Cross Math Puzzle: Rules, Strategies &amp; Printable Tips</a>: number-grid logic for puzzle fans who want a different kind of constraint. | 冒号 |
| 17 | <a href="/nurikabe/">Play Nurikabe on GridPaw</a> — the islands-and-sea logic puzzle, free in your browser. | <a href="/nurikabe/">Play Nurikabe on GridPaw</a>: the islands-and-sea logic puzzle, free in your browser. | 冒号 |
| 18 | <a href="/arrows-puzzle/">Arrows Puzzle</a> — how to play, full rules, and beginner tips | <a href="/arrows-puzzle/">Arrows Puzzle</a>: how to play, full rules, and beginner tips | 冒号 |
| 19 | <a href="/cross-math-puzzle/">Cross Math Puzzle</a> — rules, strategies &amp; printable tips | <a href="/cross-math-puzzle/">Cross Math Puzzle</a>: rules, strategies &amp; printable tips | 冒号 |
| 20 | <a href="/nonogram/">Play Nonogram on GridPaw</a> — picture logic puzzles free online | <a href="/nonogram/">Play Nonogram on GridPaw</a>, picture logic puzzles free online | 逗号/同位语 |

## src/pages/cross-math-puzzle/index.astro

| # | 原句 | 新句 | 手段 |
|---|---|---|---|
| 1 | A cross math puzzle is a number grid where you fill every empty cell with a digit so that each horizontal run and each vertical run satisfies an arithmetic clue — for example, a run that must add up to a target sum, or multiply to a target product. | A cross math puzzle is a number grid where you fill every empty cell with a digit so that each horizontal run and each vertical run satisfies an arithmetic clue: for example, a run that must add up to a target sum, or multiply to a target product. | 冒号（2 处同步） |
| 2 | Check the puzzle's rules before starting — if the puzzle never mentions repeats, compare each run's clue against its possible combinations; single-solution puzzles will tell you which convention is in force. | Check the puzzle's rules before starting. If the puzzle never mentions repeats, compare each run's clue against its possible combinations; single-solution puzzles will tell you which convention is in force. | 句号拆句（2 处同步） |
| 3 | For daily practice with instant feedback, browser-based grid logic games are ideal — GridPaw's free Kakuro, Nonogram, and Shikaku games generate unlimited puzzles that check every move as you make it. | For daily practice with instant feedback, browser-based grid logic games are ideal: GridPaw's free Kakuro, Nonogram, and Shikaku games generate unlimited puzzles that check every move as you make it. | 冒号（2 处同步） |
| 4 | For the closest polished experience, play Kakuro — the elite form of the cross math genre — free in your browser on GridPaw, with unlimited generated puzzles, tutorial levels, and instant move checking. | For the closest polished experience, play Kakuro, the elite form of the cross math genre, free in your browser on GridPaw, with unlimited generated puzzles, tutorial levels, and instant move checking. | 逗号/同位语（2 处同步） |
| 5 | Cross math puzzles are number grids with a twist: instead of guessing, you deduce — every digit you place must satisfy the arithmetic clues that surround it. | Cross math puzzles are number grids with a twist: instead of guessing, you deduce. Every digit you place must satisfy the arithmetic clues that surround it. | 句号拆句 |
| 6 | Your task is to fill every empty cell with a digit so that each continuous run of cells — horizontal and vertical — satisfies its clue. | Your task is to fill every empty cell with a digit so that each continuous run of cells (horizontal and vertical) satisfies its clue. | 括号插入 |
| 7 | This is the Kakuro rule in its purest form — and the most common cross math format.</p> | This is the Kakuro rule in its purest form, and the most common cross math format.</p> | 逗号/同位语 |
| 8 | Factor-pair knowledge replaces sum knowledge — 2×3×4 and 3×8 are both valid for 24 (when repeats are allowed or the run length fits).</p> | Factor-pair knowledge replaces sum knowledge: 2×3×4 and 3×8 are both valid for 24 (when repeats are allowed or the run length fits).</p> | 冒号 |
| 9 | Eliminate candidates for one run and you narrow the crossing run — and vice versa.</p> | Eliminate candidates for one run and you narrow the crossing run, and vice versa.</p> | 逗号/同位语 |
| 10 | Some variants write the clue as a bare number, in which case addition is assumed — the classic Kakuro convention. | Some variants write the clue as a bare number, in which case addition is assumed (the classic Kakuro convention). | 括号插入 |
| 11 | These six strategies mirror the techniques that make <a href="/kakuro/">Kakuro</a> solvable — the puzzle types share almost all of their reasoning DNA. | These six strategies mirror the techniques that make <a href="/kakuro/">Kakuro</a> solvable. The puzzle types share almost all of their reasoning DNA. | 句号拆句 |
| 12 | Two-cell runs give you instant candidate lists — build from them. | Two-cell runs give you instant candidate lists. Build from them. | 句号拆句 |
| 13 | Every placement deletes candidates from its crossing runs — and a cell with one candidate left is solved. | Every placement deletes candidates from its crossing runs, and a cell with one candidate left is solved. | 逗号/同位语 |
| 14 | Memorize the short-run tables — 3, 4, 5, 6, 7, 8, 9 for two cells and the small three-cell sums — and most of the grid resolves by recall. | Memorize the short-run tables: 3, 4, 5, 6, 7, 8, 9 for two cells and the small three-cell sums, and most of the grid resolves by recall. | 冒号 |
| 15 | Flat — mixed operators everywhere | Flat, with mixed operators everywhere | 逗号/同位语 |
| 16 | Never — max deduction, no ambiguity | Never: max deduction, no ambiguity | 冒号 |
| 17 | If you are hooked and want the most polished, most deductively pure version of the genre, Kakuro is the destination — and it happens to be <a href="/kakuro/">free to play online at GridPaw</a>. | If you are hooked and want the most polished, most deductively pure version of the genre, Kakuro is the destination, and it happens to be <a href="/kakuro/">free to play online at GridPaw</a>. | 逗号/同位语 |
| 18 | No download, no signup — play free in your browser: <a href="/kakuro/">Play Free →</a> | No download, no signup. Play free in your browser: <a href="/kakuro/">Play Free →</a> | 句号拆句 |
| 19 | <a href="/arrows-puzzle/">Arrows Puzzle: How to Play, Full Rules, and Beginner Tips</a> — a very different constraint puzzle that flexes the same deductive muscle. | <a href="/arrows-puzzle/">Arrows Puzzle: How to Play, Full Rules, and Beginner Tips</a>: a very different constraint puzzle that flexes the same deductive muscle. | 冒号 |
| 20 | <a href="/meowdoku-guide/">Meowdoku Guide: Hints, Strategy &amp; Games Like Meowdoku</a> — Sudoku-style logic for number fans who want the cat-cozy side of grids. | <a href="/meowdoku-guide/">Meowdoku Guide: Hints, Strategy &amp; Games Like Meowdoku</a>, Sudoku-style logic for number fans who want the cat-cozy side of grids. | 逗号/同位语 |
| 21 | <a href="/kakuro/">Play Kakuro on GridPaw</a> — the refined king of cross-sum puzzles, free in your browser with unlimited levels. | <a href="/kakuro/">Play Kakuro on GridPaw</a>: the refined king of cross-sum puzzles, free in your browser with unlimited levels. | 冒号 |
| 22 | <a href="/arrows-puzzle/">Arrows Puzzle</a> — how to play, full rules, and beginner tips | <a href="/arrows-puzzle/">Arrows Puzzle</a>: how to play, full rules, and beginner tips | 冒号 |
| 23 | <a href="/meowdoku-guide/">Meowdoku Guide</a> — hints, strategy &amp; games like Meowdoku | <a href="/meowdoku-guide/">Meowdoku Guide</a>: hints, strategy &amp; games like Meowdoku | 冒号 |
| 24 | <a href="/number-grid-puzzle/">Number Grid Puzzles</a> — 8 types from Sudoku to Shikaku | <a href="/number-grid-puzzle/">Number Grid Puzzles</a>: 8 types from Sudoku to Shikaku | 冒号 |

## src/pages/the-loop-puzzle/index.astro

| # | 原句 | 新句 | 手段 |
|---|---|---|---|
| 1 | Every day you get a set of images that must be arranged in a circle so that each adjacent pair connects — through wordplay, visual similarity, idioms, or cultural references. | Every day you get a set of images that must be arranged in a circle so that each adjacent pair connects, through wordplay, visual similarity, idioms, or cultural references. | 逗号/同位语 |
| 2 | Orange is the subtle one — relatively correct — meaning that image links to its neighbors properly but isn't in its final position yet, so you may need to flip the order of a run of images. | Orange is the subtle one (relatively correct), meaning that image links to its neighbors properly but isn't in its final position yet, so you may need to flip the order of a run of images. | 括号插入 |
| 3 | No — they only share the word loop. | No. They only share the word loop. | 句号拆句 |
| 4 | If you enjoy The Loop's daily-habit format, NYT Connections is the closest cousin — same group-things-by-association muscle. | If you enjoy The Loop's daily-habit format, NYT Connections is the closest cousin: same group-things-by-association muscle. | 冒号 |
| 5 | For pure grid logic in the same calm, one-solution spirit, GridPaw offers free browser puzzles: Shikaku (partition the grid into numbered rectangles), Slitherlink (draw one closed loop), Akari, Nurikabe, and Nonogram — all playable instantly with no download. | For pure grid logic in the same calm, one-solution spirit, GridPaw offers free browser puzzles: Shikaku (partition the grid into numbered rectangles), Slitherlink (draw one closed loop), Akari, Nurikabe, and Nonogram, all playable instantly with no download. | 逗号/同位语 |
| 6 | This guide covers how the daily picture puzzle works — the rules, what green, red and orange mean, six solving techniques — plus a free loop puzzle you can play right here on the page. | This guide covers how the daily picture puzzle works (the rules, what green, red and orange mean, six solving techniques), plus a free loop puzzle you can play right here on the page. | 括号插入 |
| 7 | The Loop is a free daily picture puzzle by Britannica — the encyclopedia that decided Wordle deserved competition. | The Loop is a free daily picture puzzle by Britannica, the encyclopedia that decided Wordle deserved competition. | 逗号/同位语 |
| 8 | <b>Arrange the images in a circle.</b> Each image must connect logically to both neighbors — wordplay, visual resemblance, idioms, or cultural references all count. | <b>Arrange the images in a circle.</b> Each image must connect logically to both neighbors: wordplay, visual resemblance, idioms, or cultural references all count. | 冒号 |
| 9 | <b>Direction doesn't matter.</b> Clockwise and counterclockwise arrangements both count as correct — a solved ring is a solved ring. | <b>Direction doesn't matter.</b> Clockwise and counterclockwise arrangements both count as correct. A solved ring is a solved ring. | 句号拆句 |
| 10 | The color feedback is The Loop's best idea — orange especially, because it tells you <i>how</i> you're wrong: | The color feedback is The Loop's best idea, orange especially, because it tells you <i>how</i> you're wrong: | 逗号/同位语 |
| 11 | <tr><th><span class="dot" style="background:#1E7A3C"></span>Green</th><td>Correct final position — this image links to both neighbors as intended.</td><td>Leave it alone and build around it.</td> | <tr><th><span class="dot" style="background:#1E7A3C"></span>Green</th><td>Correct final position: this image links to both neighbors as intended.</td><td>Leave it alone and build around it.</td> | 冒号 |
| 12 | <tr><th><span class="dot" style="background:#E8A13D"></span>Orange</th><td><i>Relatively correct</i> — the image connects to its neighbors properly, but it isn't in its final spot yet.</td><td>The run it belongs to needs flipping: reverse the order of that segment of the circle.</td> | <tr><th><span class="dot" style="background:#E8A13D"></span>Orange</th><td><i>Relatively correct</i>, the image connects to its neighbors properly, but it isn't in its final spot yet.</td><td>The run it belongs to needs flipping: reverse the order of that segment of the circle.</td> | 逗号/同位语 |
| 13 | <tr><th><span class="dot" style="background:#C0392B"></span>Red</th><td>Wrong — this image connects to neither neighbor correctly.</td><td>Re-pair it: find what it actually links to and move it there.</td> | <tr><th><span class="dot" style="background:#C0392B"></span>Red</th><td>Wrong. This image connects to neither neighbor correctly.</td><td>Re-pair it: find what it actually links to and move it there.</td> | 句号拆句 |
| 14 | Colors are revealed only when you press Check — and each press spends one of your five tries, so rearrange first, confirm second. | Colors are revealed only when you press Check; each press spends one of your five tries, so rearrange first, confirm second. | 分号 |
| 15 | <div class="st"><i>1</i><span><b>Find the most obvious pair first.</b> One loud connection — a pun, a famous pairing — anchors a whole arc of the circle. | <div class="st"><i>1</i><span><b>Find the most obvious pair first.</b> One loud connection, such as a pun or a famous pairing, anchors a whole arc of the circle. | 逗号/同位语 |
| 16 | Identify the orange run and reverse it — the connections are already working. | Identify the orange run and reverse it. The connections are already working. | 句号拆句 |
| 17 | <div class="st"><i>2</i><span><b>Name the link before you place.</b> Don't ask "where does this go?" — ask "what does this connect to?" If you can't say the connection in words, the placement is a guess. | <div class="st"><i>2</i><span><b>Name the link before you place.</b> Don't ask "where does this go?"; ask "what does this connect to?" If you can't say the connection in words, the placement is a guess. | 分号 |
| 18 | A full-circle check gives you green, orange and red positions at once — fragment checks waste tries. | A full-circle check gives you green, orange and red positions at once: fragment checks waste tries. | 冒号 |
| 19 | If you came for Britannica's picture ring, the table below sorts them out — and if the idea of literally <i>drawing</i> a loop sounds fun, the playable Slitherlink board above is the real thing. | If you came for Britannica's picture ring, the table below sorts them out, and if the idea of literally <i>drawing</i> a loop sounds fun, the playable Slitherlink board above is the real thing. | 逗号/同位语 |
| 20 | <tr><th>What you arrange</th><td>Pictures in a circle by meaning — wordplay, idioms, visual puns</td><td>One closed line along grid edges, guided by number clues</td> | <tr><th>What you arrange</th><td>Pictures in a circle by meaning: wordplay, idioms, visual puns</td><td>One closed line along grid edges, guided by number clues</td> | 冒号 |
| 21 | <tr><th>Core skill</th><td>Language, trivia, lateral association</td><td>Pure logic — every board solvable by deduction alone</td> | <tr><th>Core skill</th><td>Language, trivia, lateral association</td><td>Pure logic, with every board solvable by deduction alone</td> | 逗号/同位语 |
| 22 | <tr><th>Pace</th><td>One new puzzle daily, 2–5 minutes</td><td>Any time — endless generated boards, easy 5×5 to hard 10×10</td> | <tr><th>Pace</th><td>One new puzzle daily, 2–5 minutes</td><td>Any time: endless generated boards, easy 5×5 to hard 10×10</td> | 冒号 |
| 23 | <tr><th>Where</th><td>britannica.com/games/loop (official)</td><td><a href="/slitherlink/">gridpaw.com/slitherlink</a> — free in browser</td> | <tr><th>Where</th><td>britannica.com/games/loop (official)</td><td><a href="/slitherlink/">gridpaw.com/slitherlink</a>: free in browser</td> | 冒号 |
| 24 | <b>Connections (NYT)</b>Group sixteen words into four hidden sets — the closest cousin to The Loop's association muscle, and the same daily-habit format. | <b>Connections (NYT)</b>Group sixteen words into four hidden sets: the closest cousin to The Loop's association muscle, and the same daily-habit format. | 冒号 |
| 25 | <b>Shikaku</b>Partition a grid into rectangles around number clues — calm, one-solution logic, playable free on GridPaw's <a href="/">homepage</a>. | <b>Shikaku</b>Partition a grid into rectangles around number clues, calm one-solution logic, playable free on GridPaw's <a href="/">homepage</a>. | 逗号/同位语 |
| 26 | <b>Nurikabe &amp; Akari</b>Shade seas around islands or light up a grid — more Nikoli-family logic in the same browser, no download. | <b>Nurikabe &amp; Akari</b>Shade seas around islands or light up a grid: more Nikoli-family logic in the same browser, no download. | 冒号 |

## 手段使用统计（按实际改动处数）

- 冒号：35 处
- 逗号/同位语：27 处
- 句号拆句：19 处
- 括号插入：8 处
- 分号：4 处
- 删破折号留连词：1 处
- 合计：94 处
