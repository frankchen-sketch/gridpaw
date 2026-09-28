# GridPaw Nurikabe — How to Play (Help Doc)

> **Status: DRAFT — needs screenshots + Frank review**
> Source: verified against `public/nurikabe/demo.html`, `src/lib/nurikabe-engine.ts`, `src/pages/nurikabe/index.astro` (live code as of **2026-09-28**)
> Every button, number, and message below was read from source; nothing is from memory or marketing copy.
> Screenshots: no existing `/assets/screenshots/` file matches this game — all new captures needed.
> This doc is the single source of truth for all derived articles / Pinterest / YouTube content.

## What is Nurikabe?

Nurikabe ("islands and sea") is a classic Nikoli logic puzzle. Some cells carry a **number clue**: each number is the exact size of an *island* — a connected group of white cells holding exactly that one number. All other cells are *sea* (dark), and the solver must obey three rules:

1. **Islands** — each island is a connected group containing exactly one number, and its size equals that number. Islands never touch each other edge-to-edge.
2. **The sea** — all sea cells form **one single connected mass** (an island may never cut the sea in two).
3. **No 2×2 sea** — four sea cells in a square are forbidden.

GridPaw Nurikabe is the cat version: skinnier boards than the other GridPaw games (**5×5 → 7×7 → 9×9**), **4 heart-based tutorials**, an **11-level campaign**, then endless date-seeded daily puzzles — free, no sign-up.

Play at [gridpaw.com/nurikabe/](https://gridpaw.com/nurikabe/) (game runs in an iframe from `/nurikabe/demo.html?embed=1`).

[截图 1: 进行中的棋盘（岛/海/线索格 + 上方 ❤️ 徽章）— 需新截]

## Your First Puzzle (3 steps)

1. **Open the game.** A **How to play** card pops up once (first visit) with a mini finished board and the 3 rules; tap **"Got it — start with Tutorial 1"**. You're then on **Tutorial 1/4** — a 2×2 board for rule 1. (Reopen anytime with 📖 **How to play**.)
2. **Cycle cells like traffic lights.** Tap any non-number cell to cycle it: **blank → sea ≈ → island → blank**. Tapping the wrong value **auto-corrects** the cell to its true value, locks it for the level, and costs a heart — mistakes are warned, never left floating. Clue cells (with the little paw/plant icon and number) are fixed and can never be changed.
3. **Satisfy all three rules.** The puzzle checks itself the moment every cell is known: wrong-but-complete boards get the message "Every cell is marked, but the islands don't match the numbers — some sea cells are actually island, or an island has the wrong size. Review and fix!"

[截图 2: 细胞三态循环特写（≈ 海 / 岛 / 线索格带数字）— 需新截]

## Every Button on the Screen

| Control | What it does |
|---|---|
| **Level chip** (amber; green on tutorials) | Shows your position: `Tutorial 1/4 — <lesson>` · `Level 4/11 — Medium — 7×7` · `Daily — Medium 7×7` |
| **❤️ hearts chip** | Your health: 3 hearts (`❤️❤️❤️`), lost hearts turn `🖤`. Tutorials show `❤ ∞` (unlimited). |
| ↺ **Restart** | Discards the current board and generates a fresh puzzle at the same level |
| **Skip tutorial »** (only during the 4 tutorials) | Skips straight to campaign Level 1 — your first Easy 5×5 |
| 💡 **Hint** (badge shows `3`) | Reveals exactly one correct cell — prefers an island cell — and tells you: "💡 Row 3, col 2 is sea ≈ — tap it once. (2 hints left)". **3 hints per level**, refills on every new level. (Dev builds show ∞.) |
| 📖 **How to play** | Reopens the rules card with the mini-board diagram and tap instructions |
| **Practice Medium 7×7** | Jumps to the first Medium board: Level 4/11 |
| **Practice Hard 9×9** | Jumps to the first Hard board: Level 8/11 |

On Medium (7×7) and Hard (9×9), generating a board can take a couple of seconds, so a spinner overlay ("Generating puzzle…") covers the board while a Web Worker builds it off the main thread.

[截图 3: 顶部工具栏特写（chip + ❤️❤️❤️ + Restart + Hint + How to play + Medium/Hard 跳转）— 需新截]

## Difficulty Levels

| Stage | Grid | Notes |
|---|---|---|
| Tutorial ×4 | **2×2 → 3×3 → 4×4 → 5×5** | Seeded boards, one rule each: Islands and sea · The sea stays connected · No 2×2 sea · Corner pinning; auto-advances ~0.9s after each win |
| Easy ×3 | **5×5** | Pure constraint-propagation solvable |
| Medium ×4 | **7×7** | Pure constraint-propagation solvable |
| Hard ×4 | **9×9** | May need light backtracking |
| Endless Daily | 7×7 / 9×9 | Alternates medium/hard; **date-seeded — same board for every player on the same day**; after the campaign's 15 boards |

Campaign order is fixed: 3 Easy → 4 Medium → 4 Hard (`Level N/11`). Finishing the 11th unlocks "Campaign complete! Endless daily puzzles unlocked."

[截图 4: 难度 chip 特写（Tutorial 绿章 + Level 4/11 琥珀章）— 需新截]

## Winning, Losing & Sharing

**Winning.** When every cell is correct, the victory popup shows `Solved!` (or `Daily solved!`), a pixel-grid reveal where all island cells flip to amber in a ≤1s cascade, and **Next level →** (tutorials auto-advance instead). The win overlay carries the **3 share buttons**:

- 📋 **Copy** — copies the share text (✅ Copied, 1.5s): "🌊 Sank GridPaw Nurikabe Level N — every island in place, sea stays one. Don't drown → gridpaw.com/nurikabe/" (daily variant: "no hearts lost")
- 𝕏 **Share** — opens the **board card** first (rendered image of your solved board, tagged "GridPaw Nurikabe · Level N", footer gridpaw.com/nurikabe/)
- 👽 **Reddit** — same board card, posts to r/gridpaw

**In the board card:** 📋 Copy Image, ⬇️ Save (`gridpaw-nurikabe-levelN.png`), 𝕏 Post, 👽 Post, ✕ Close.

**Losing.** Wrong marks cost a heart per mistake (not in tutorials — they only count mistakes). Losing all 3 hearts opens the 💔 **Out of hearts** overlay: "Three wrong marks — this board got away from you. A fresh one is coming up." Tap **New board ↻** for a fresh puzzle at the same level. Campaign progress is saved automatically (`gridpaw-nurikabe-progress`) and resumes next visit.

[截图 5: 胜利弹窗（岛格翻色 + Next + 分享三按钮）— 需新截]
[截图 6: Out of hearts 失败弹窗 — 需新截]

## Common Questions

**Do I need an account?** No — playable fully logged out, no account system in-game.

**My tap did nothing on a number cell.** Correct: clue cells are fixed islands — they can't be changed.

**It auto-corrected my cell and locked it.** That's the tutorial-style guard: wrong marks are corrected to the truth, locked for the level, and cost a heart. Use it as free information.

**I'm stuck.** 💡 Hint reveals one correct cell (3 per level). And watch the tell-tale pattern from Rule 3: three ≈ cells around one corner force the fourth cell to be island.

**What is the Daily puzzle?** After the campaign, every level is date-seeded: same board for everyone that day, alternating Medium (7×7) / Hard (9×9), refreshed daily.

**Medium/Hard takes a moment to load?** Normal — the board is generated in a Web Worker and shown behind a spinner.

## FAQ

**Is this the same as classic Nurikabe?** Yes — identical rules (islands match numbers, connected sea, no 2×2 sea). GridPaw adds cat styling and unlimited generated boards.

**Why does the game mention "≈"?** ≈ is the sea marker on marked sea cells.

**Are Hard boards solvable without guessing?** The generator validates every board has exactly one solution before serving it (`solveNurikabe` count = 1).

<!-- 截图清单汇总（需新截 6 张）：
  1. 进行中棋盘 → 新截
  2. 三态循环格子特写 → 新截
  3. 顶部工具栏 → 新截
  4. 难度 chip 特写 → 新截
  5. 胜利弹窗 → 新截
  6. Out of hearts 失败弹窗 → 新截
-->