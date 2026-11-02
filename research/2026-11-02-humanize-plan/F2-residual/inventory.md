# F2 残留正文盘点（DOM 分类，渲染口径）

- 口径：`dist/` 构建产物（= 线上 16feaa5e 态），排除目录 akari/ pt-br/ pictomino/ de/ the-loop-*；用 HTML 解析器按祖先标签与 class 分类。
- 分类计数：正文? 147、FAQ 可见 39、标题H 30、title 30、品牌句 27、UI/表格 18、链接文字 7、UI 组件(class) 2；合计 300。
- 「正文?」桶未拆分：内含未被 class 识别的 FAQ 可见答案（`Yes — …`、`No. …`，SEO 基础，保护）与教程 UI 文案（`Tutorial 1/4 — …`，不动清单）。拆分前不得当作正文残留数上报。
- 「正文?」桶：147 处 / 38 页。

| 页面 | 上下文（em 前后各 ~50 字） |
|---|---|
| admin/funnel/index.html | （按其首次到访版本，不随回访改变）。 两版本转化率有差异时先看流量构成列——构成明显不同（如一边全 google、一边全 reddit）时差异可能是流量质量而非代码。 |
| admin/funnel/index.html | （按其首次到访版本，不随回访改变）。 两版本转化率有差异时先看流量构成列——构成明显不同（如一边全 google、一边全 reddit）时差异可能是流量质量而非代码。 |
| arrows-puzzle-walkthrough/index.html | No. Every level is untimed — the only pressure is your three hearts. You can s |
| arrows-puzzle-walkthrough/index.html | e-blocker pairs — arrows stopped by exactly one other arrow — before anything else. No-timer levels reward that |
| arrows-puzzle-walkthrough/index.html | ed into a risky tap. Keep hearts by reading the board first — the framework on this page is built exactly aroun |
| arrows-puzzle-walkthrough/index.html | rim before the interior, then resolve single-blocker pairs — arrows stopped by exactly one other arrow — befor |
| arrows-puzzle-walkthrough/index.html | t through updates, so any exact figure online is a snapshot — but thousands is real, not marketing. |
| arrows-puzzle/index.html | No. Arrows – Puzzle Escape has no timer — the only pressure is your three hearts. You can s |
| arrows-puzzle/index.html | downloads. It is not available as an official browser game — the exact levels are mobile-only. |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| badges/index.html | — |
| brain-puzzle-3-level-26/index.html | Only two cards in Level 26 are not drags — the swipe left that opens the toilet door at step |
| brain-puzzle-3-level-26/index.html | Yes — thirteen moves in the order the current build use |
| brain-puzzle-3-level-26/index.html | e toilet door at step 3 and the tap on the bushes at step 9 — so pressing anything else in the street does noth |
| brain-puzzle-3-level-27/index.html | Only two cards in the cell are clicks — the mouse hole at step 4 and the Bible at step 7 |
| brain-puzzle-3-level-27/index.html | Yes — nine moves on the current build, and the last one |
| brain-puzzle-3-level-27/index.html | e clicks — the mouse hole at step 4 and the Bible at step 7 — and the other seven are drags onto the bald priso |
| brain-puzzle-3-level-31/index.html | e the level is built from drags and swipes rather than taps — the poster travels over the window, the coat over |
| brain-puzzle-3-level-31/index.html | y Mind. Older walkthroughs and videos may label it level 28 — the game has added levels since, shifting the num |
| brain-puzzle-3-level-39/index.html | Three cards in Level 39 are not drags — the tap that opens the backpack at step 4, the do |
| brain-puzzle-3-level-39/index.html | Yes — all sixteen moves follow the current build, from |
| brain-puzzle-3-level-39/index.html | r at step 8, and the downward swipe on the stick at step 16 — which is why pressing the mummy does nothing. |
| brain-puzzle-3-level-48/index.html | Only two presses land in Level 48 — the phone at step 3 and the double-tap on the win |
| brain-puzzle-3-level-48/index.html | Yes — the sixteen moves match the current build, and th |
| brain-puzzle-3-level-48/index.html | phone at step 3 and the double-tap on the window at step 8 — while the fridge takes a right swipe, the coat a |
| brain-puzzle-3-level-5/index.html | Level 5 has no taps at all — the trash can needs an upward swipe at step 9 and |
| brain-puzzle-3-level-5/index.html | Yes — eleven moves on the current build, ending with th |
| brain-puzzle-3-level-9/index.html | One tap and one swipe do all the non-drag work in Level 9 — the faucet at step 9 and the fridge door at step |
| brain-puzzle-3-level-9/index.html | Yes — the thirteen moves match the current build and en |
| brain-puzzle-3-level-9/index.html | evel 9 — the faucet at step 9 and the fridge door at step 5 — and the other eleven cards are drags, so pressing |
| brain-teasers-for-adults/index.html | Riddles with wordplay punchlines are the funniest kind — classics like 'The More You Take' (the more you t |
| brain-teasers-for-adults/index.html | anly from any device. For a reusable set, bookmark the page — the puzzle list is stable and free forever. |
| brain-teasers-for-adults/index.html | imited procedurally generated puzzles. Many adults use both — a book by the bed, and a quick online grid puzzle |
| changelog/index.html | All third-party ads removed — the site is now ad-free |
| changelog/index.html | Eleven badges are now up for grabs — Rookie Paw for your first daily win all the way t |
| changelog/index.html | No more lives — draw freely |
| changelog/index.html | The first-case tutorial no longer just explains the rules — it points at the suspect to pick and highlights t |
| changelog/index.html | at day. Bonus solves never touch your streak or leaderboard — pure extra for the devoted. |
| changelog/index.html | e removed every third-party ad unit and script the same day — GridPaw is now completely ad-free. If advertising |
| changelog/index.html | est and your result goes up under a cat name picked for you — the same name every time, so your streak builds a |
| changelog/index.html | in the solution, then replays every deduction move by move — including an honest label when it had to fall bac |
| changelog/index.html | ives system is gone. Wrong rectangles just flash and vanish — the game never interrupts you. A zero-mistake sol |
| changelog/index.html | me scene — two 4×4 warm-ups, then three trickier 6×6 houses — name the room where the killer was caught, and th |
| changelog/index.html | now lives at /murdoku/trail/. Solve each fixed crime scene — two 4×4 warm-ups, then three trickier 6×6 houses |
| changelog/index.html | the morning answer-refresh had silently failed for two days — a stray non-JSON prefix was poisoning the pipelin |
| changelog/index.html | to your home screen for a full-screen, app-like experience — your browser will offer the install prompt, and t |
| changelog/index.html | tudy to a 207-item gadget store, with hint and pliers tools — free, no account, works with touch or mouse. A fa |
| contact/index.html | ether it's a bug, a puzzle request, or feedback on the cats — it all lands in the same place. |
| help/akari/index.html | Press Hint — it's free and unlimited here. It always points at |
| help/akari/index.html | Yes — identical rules to the Nikoli puzzle. GridPaw jus |
| help/akari/index.html | Yes — tap to place/remove, long-press to ✗-mark. The Da |
| help/akari/index.html | esktop, long-press on mobile) toggles it. It's a memory aid — the game doesn't count it as a move. |
| help/index.html | , Nonogram and Nurikabe all follow the classic Nikoli rules — GridPaw adds cat visuals and unlimited procedural |
| help/index.html | No. All six GridPaw games — Shikaku, Akari, Kakuro, Nonogram, Nurikabe and Pi |
| help/index.html | — Shikaku, Akari, Kakuro, Nonogram, Nurikabe and Pictomino — are fully playable without signing in. Progress i |
| help/kakuro/index.html | Level N/11 — Easy/Medium/Hard — S×S |
| help/kakuro/index.html | Level N/11 — Easy/Medium/Hard — S×S |
| help/kakuro/index.html | No. Kakuro on GridPaw has no lives and no countdown — you can take as long as you like, and even step a |
| help/kakuro/index.html | Tutorial 1 — "Clues are sums", with the green Tutorial 1/4 chi |
| help/kakuro/index.html | Tutorial 1/4 — "Clues are sums" |
| help/kakuro/index.html | Tutorial 1/4 — <lesson> |
| help/kakuro/index.html | Yes — fog blocks never share a run, and every fog board |
| help/kakuro/index.html | sum (flashes orange). The game never keeps an invalid digit — and if your board becomes impossible to finish, i |
| help/nonogram/index.html | "🎨 Uncovered the hidden picture in GridPaw Nonogram Level N — zero wrong taps… mostly 😏 Your turn → gridpaw.com |
| help/nonogram/index.html | That cell is empty in the picture — the game auto-marked it ✕ and counted a mistake. |
| help/nonogram/index.html | Yes — identical run-length rules. GridPaw just generate |
| help/nonogram/index.html | Yes — the whole game is tap-driven, and the board auto- |
| help/nonogram/index.html | one certainly-correct cell each time. You have 3 per level — save them for Hard. |
| help/nurikabe/index.html | "Got it — start with Tutorial 1" |
| help/nurikabe/index.html | Correct: clue cells are fixed islands — they can't be changed. |
| help/nurikabe/index.html | No — playable fully logged out, no account system in-g |
| help/nurikabe/index.html | Normal — the board is generated in a Web Worker and shown |
| help/nurikabe/index.html | Yes — identical rules (islands match numbers, connected |
| help/nurikabe/index.html | are text (✅ Copied, 1.5s): "🌊 Sank GridPaw Nurikabe Level N — every island in place, sea stays one. Don't drown |
| help/nurikabe/index.html | ery cell is marked, but the islands don't match the numbers — some sea cells are actually island, or an island |
| help/nurikabe/index.html | overlay: "Three wrong marks — this board got away from you. A fresh one is comi |
| help/pictomino/index.html | "Don't give up — your cat believes in you!", plus a nudge showing |
| help/pictomino/index.html | (title like "Beat Pictomino Level 3 (easy) ⭐⭐⭐ — can you do better? → gridpaw.com/pictomino") and |
| help/pictomino/index.html | Tap the + spot on the board — you do not need to select the tray piece first (t |
| help/pictomino/index.html | The timer ran out on a timed level — it costs 1 life and resets the current round's fi |
| help/pictomino/index.html | Yes — 15 real breeds (pictures under assets/cats/), eac |
| help/pictomino/index.html | Yes — pre-readers can play with no text; there's no rea |
| help/pictomino/index.html | ate + spots are active at once and the piece may be blurred — you deduce from edges and colors instead of tryin |
| help/pictomino/index.html | s puzzle → to move on. Wrong guesses reveal information too — the piece stays in the tray, so try another +. |
| help/shikaku/index.html | Use Hint — it lights up one rectangle that is definitely cor |
| help/shikaku/index.html | Yes — identical rules to the classic Nikoli puzzle. Gri |
| meowdoku-guide/index.html | , hunt for a row or column with exactly one legal cell left — that placement is always safe. |
| meowdoku-guide/index.html | : one cat per row, one per column, and no two cats touching — corners and diagonals included. Boards grow from |
| meowdoku-guide/index.html | No — and it is not a numbers game at all. Meowdoku is |
| meowdoku-guide/index.html | Yes — the cheat sheet table above condenses all six str |
| meowdoku-guide/index.html | board with the reasoning behind every placement. One caveat — Meowdoku can randomize boards based on player pro |
| meowdoku-guide/index.html | rcises logical reasoning, working memory, and concentration — the same mental muscles behind well-studied puzzl |
| nonogram/index.html | Yes — Nonogram, Picross, Griddler, Paint by Numbers and |
| nonogram/solver/index.html | Not yet. This solver handles classic two-color nonograms — black and white, which is what the vast majority |
| nonogram/solver/index.html | Yes — after a successful solve the clues are saved into |
| nonogram/solver/index.html | Yes — completely free, no account, no download. The sol |
| nonogram/solver/index.html | Yes — tick "Step by step" before pressing Solve. The so |
| nonogram/solver/index.html | any step needed search. Puzzles solvable by pure line logic — the vast majority — show zero search steps, so yo |
| nonogram/solver/index.html | ave the line empty for a row or column with no filled cells — for example 2 1 3, or 0. |
| nonogram/solver/index.html | ch. Puzzles solvable by pure line logic — the vast majority — show zero search steps, so you can follow along o |
| nonogram/solver/index.html | lid picture. That is a property of the puzzle, not an error — hand-made puzzles in some books and apps are not |
| nurikabe/index.html | Well-constructed Nurikabe boards are solvable by pure logic — every cell is forced by the three rules. Every Gr |
| nurikabe/index.html | cells contain numbers; each number is the size of an island — a connected group of white cells — and every isla |
| nurikabe/index.html | is the size of an island — a connected group of white cells — and every island contains exactly one number. All |
| nurikabe/index.html | orner pins an entire island immediately. Watch the sea, too — two sea cells that would close off a 2×2 square m |
| rotate-rings/index.html | Level walkthroughs section above carries the full solution — the step order, the burst timings and the final s |
| rotate-rings/index.html | Yes — Rotate Rings is free to download and play on iOS |
| rotate-rings/index.html | evels. The game updates weekly, so new levels keep arriving — we add walkthroughs as we verify them. |
| rotate-rings/index.html | ion — the step order, the burst timings and the final score — so you can follow the whole run or peek at just t |
| rotate-rings/index.html | nd Android. The board is a network of colored pipe segments — C-shapes, L-shapes, straight pieces and closed ci |
| rotate-rings/level-10/index.html | 2,100 on the Well Played! screen in our run — with “You performed exceptionally well this round |
| rotate-rings/level-10/index.html | Yes — our verified run had two plateaus (14s and ≈40s) |
| rotate-rings/level-10/index.html | hey are collectibles tied to the post-level Acorn Challenge — the same system Level 32 feeds — not part of the |
| rotate-rings/level-10/index.html | post-level Acorn Challenge — the same system Level 32 feeds — not part of the loop puzzle itself. |
| rotate-rings/level-2/index.html | e segment clockwise to close the loop with the purple piece — second burst at about 0:16 with a Great! bonus, f |
| rotate-rings/level-2/index.html | he top right until it closes the loop with the orange piece — burst at about 0:12 for 170 points. Then turn the |
| rotate-rings/level-2/index.html | oday! Tap Continue to move on. It rewards coming back daily — it has no effect on the level itself. |
| rotate-rings/level-3/index.html | d segments: blue, orange, purple and red. No special pieces — the level is a pure speed run of close-and-burst. |
| rotate-rings/level-32/index.html | When their loop closes and bursts, the acorn counter climbs — it goes from 0 to 3 during Level 32's endgame. Af |
| rotate-rings/level-32/index.html | Yes — every timestamp above was checked against the emb |
| rotate-rings/level-32/index.html | el celebration and the final Nice screen showing your score — 4,200 in our run. |
| rotate-rings/level-32/index.html | ter cluster bursts in a chain reaction. Ten bursts in total — the middle clusters clear between 0:24 and 0:59, |
| rotate-rings/level-4/index.html | Keep closing loops around the fixed full-circle anchors — they never turn, so every route bends around them |
| rotate-rings/level-4/index.html | irework booster (“Tap to select Firework!”). It is optional — the verified Level 4 clear never used it. Booster |
| rotate-rings/level-5/index.html | ral pieces before any single loop closes. Nothing is broken — the verified run sat at 700 for eighteen seconds. |
| rotate-rings/level-6/index.html | r Level 6). It is a retention meter, not part of the puzzle — clearing levels advances it. |
| rotate-rings/level-7/index.html | Yes — Level 7 bursts two separate light blue loops back |
| rotate-rings/level-7/index.html | en green and orange. All C-shaped segments, no fixed pieces — the fastest clear of the opening set, 1,700 point |
| rotate-rings/level-8/index.html | Our verified run did — right at the start (≈2:37), smashing two awkward |
| rotate-rings/level-8/index.html | Yes — they burst as part of chain reactions once surrou |
| rotate-rings/level-9/index.html | Straight pipe segments with a cap on one end — they debut here as fixed connection points that r |
| rotate-rings/level-9/index.html | or other colors, several loops can burst in the same moment — Level 9 ends with two triple-bursts (3:26 and 3:3 |
| rules/index.html | No. The numbered cell can sit anywhere inside its rectangle — a corner, an edge, or the middle. Only the rectan |
| solver/index.html | "Everything placed — look for mistakes!" |
| solver/index.html | No — by design. Each use reveals one correct rectangle |
