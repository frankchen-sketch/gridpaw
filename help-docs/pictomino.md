# GridPaw Pictomino — How to Play (Help Doc)

> **Status: DRAFT — needs screenshots + Frank review**
> Source: verified against `public/pictomino/game.html`, `index.html`, `daily-puzzle.html`, `easy.html`, `hard.html` (live code as of **2026-09-28**)
> Every button, number, and message below was read from source; nothing is from memory or marketing copy.
> Screenshots: no existing `/assets/screenshots/` file matches this game — all new captures needed.
> This doc is the single source of truth for all derived articles / Pinterest / YouTube content.

## What is Pictomino?

Pictomino is GridPaw's **spatial reasoning game for kids**: a real cat photo is cut into grid squares and shuffled; you rebuild the picture piece by piece using logic — never guessing. It's pure static HTML (no build step) under `public/pictomino/`, free, no account needed, and works on phones, tablets, and computers with taps or mouse clicks.

Each level shows you the **complete picture for 2 seconds** ("👀 Remember the picture!"), then one piece at a time: find where it snaps into the board by comparing edges, fur color, ears, whiskers. **5 lives per level** — a wrong tap costs one; lose all 5 and the level ends. Finishing a level earns **stars + points** plus a **fun fact about the cat breed** you just rebuilt.

Entry points: [gridpaw.com/pictomino/](https://gridpaw.com/pictomino/) (classic 10-level game) · [/pictomino/daily-puzzle](https://gridpaw.com/pictomino/daily-puzzle) (one puzzle per day + leaderboard) · `/pictomino/easy` and `/pictomino/hard` (SEO landing variants — see the ⚠ note below).

[截图 1: 进行中棋盘（预填格 + 虚线 pending 格 + 两个点亮 + 号洞）+ 下方候选碎片 — 需新截]

## Your First Puzzle (4 steps)

1. **Open the game.** The first time you play, a **How to Play** card explains the loop ("Look at the pieces. Find where they fit. Tap to place.") with a "Auto-show at start" toggle — tap **Got it!**. Then a short **tutorial coach** (STEP 1/2) walks you through one real placement: tap the highlighted piece, then tap the single `+` spot; a bouncing paw points at each target. Skip it anytime with **Skip ➜**.
2. **Memorize the picture.** Before every round the full photo shows for **2 seconds** with a countdown (also after a retry, and via the Peek button after losing).
3. **Place pieces one at a time.** One candidate piece sits in the tray under the board (`👇 Find where this piece belongs, then tap the +!`). On the board, some cells are already filled in; empty cells show dashed outlines, and a few glow with a **`+`** — those are your candidate spots. Tap the `+` where the piece belongs. Correct: the piece pops in (+50 points) and a new `+` appears. Wrong: red flash, the piece shakes, **−1 life**.
4. **Keep going until the photo is whole.** When every `+` is filled, the level completes — stars, score, and a cat fact card appear.

[截图 2: 开局 2 秒完整图预览（👀 Remember the picture! 倒计时）— 需新截]

## Every Control on the Screen

The game runs inside an iframe; the **toolbar above it** (on `/pictomino/` and `/pictomino/daily-puzzle`) is the real UI:

| Control | What it does |
|---|---|
| **Level pill** | `Level 1/10` … `Level 10/10` (Daily: `Level 1/1`) |
| **Difficulty pill** | `Classic` on the main page; daily shows its label |
| **❤️❤️❤️❤️❤️ hearts** | Lives for the current level (lost hearts show 🤍). Max 5. |
| **⭐ score** | Cumulative score across all levels this session |
| **⏱ timer** | Appears only on timed difficulties (Medium+): countdown per round; turns red under 5s |
| **❓ How to play** | Reopens the rules card mid-game (doesn't interrupt) |
| **🔊 / 🔇 Sound** | Toggles the synthesized sound effects on/off (persisted in the browser) |
| **Sign in** (Google) | Optional. Enables daily **streak cloud-sync**, **level progress sync**, and **leaderboard** posting; signed-out play always works |

Inside the game frame: the board (3×3 or 4×4, Daily 6×6), the tray with the one candidate piece, and a tip line like `Filled 3/6 · Find the piece's spot and tap the +!`.

[截图 3: 顶部工具栏特写（Level/Diff/Hearts/Score/Timer pills + ❓ 🔊 + 登录态）— 需新截]

## Difficulty Levels (Classic, 10 levels)

| Levels | Label | Grid | Holes to fill | Candidate `+` spots | Piece look | Timer per round |
|---|---|---|---|---|---|---|
| 1 | Tutorial 1 | 3×3 | 1 | 1 | Full color | none |
| 2 | Tutorial 2 | 3×3 | 2 | 1 | Full color | none |
| 3 | Tutorial 3 | 3×3 | 3 | 2 | Full color | none |
| 4–6 | Easy | 4×4 | 6 | 2 | Full color | none |
| 7–8 | Medium | 4×4 | 8 | 3 | **Slightly blurred/dimmed** (33%) | **40s** |
| 9 | Hard | 4×4 | 10 | 4 | Blurred 50% | **50s** |
| 10 | Super Hard 💀 | 4×4 | 12 | 4 | Heavily blurred 66% | **60s** |

Mechanics that scale with difficulty: more holes, more candidate `+` spots hiding the true one, the candidate piece getting **blurred/desaturated** (`weak` / `super-weak`), and **per-round timers**. Medium+ boards show a 1.5s warning first ("⚠️ Hard level! Watch the piece and find its spot"). A round timeout costs 1 life and resets that round's fills (same puzzle, no progress lost beyond the round).

The 10 cats: levels 1–2 are fixed (Siamese, American Shorthair), levels 3–10 shuffle from the remaining pool — a fresh lineup every page load (re-shuffled when you hit **Play again 🔁**).

[截图 4: 候选碎片弱化前后对比（全彩 vs 模糊 super-weak）— 需新截]

## Scoring, Stars & Winning

- **+50 points** per correct placement; running total in the ⭐ pill.
- **Level score** = `lives remaining × 100` + `speed bonus` (up to +300, earned by finishing within 60 seconds: +5 per second faster, capped).
- **Stars:** 3★ if you finish with 4–5 lives, 2★ with 2–3, 1★ with 1 (-you can never get 0★). Your **best star record per level** is kept in the browser and survives reloads.
- **Win screen:** "Well Done! 🎉" — star row, "You completed the {Breed} puzzle!", `Level score +N` with the breakdown "Lives bonus +N · Speed bonus +N", a **cat-fact card** (breed name + 3 facts), then **Next level ➜** (or **See total 🏆** on level 10), and the share row (**📣 Share on Reddit** / **🔗 Copy link**), plus **Continue ✓** to stay on the finished board.
- **All 10 done:** 👑 **Puzzle Master!** — "You finished all 10 cat puzzles!" with your **total score**; **Play again 🔁** reshuffles the cats and resets the score.
- **Lose screen ("No lives left"):** "Don't give up — your cat believes in you!", plus a nudge showing how many levels you've cleared. Three ways out: **Try again 💪** (restart the level), **👁 Peek at the picture (2s)** (replays the preview, then restarts), or **Skip this puzzle →** (advance with no score).
- **Share:** Reddit opens `reddit.com/r/pictomino/submit` (title like "Beat Pictomino Level 3 (easy) ⭐⭐⭐ — can you do better? → gridpaw.com/pictomino") and first copies a picture of your board to the clipboard via html2canvas; **Copy link** copies the same text (shows ✅ Copied! 1.6s).
- **Sound:** synthesized Web Audio chips — rising double-tone on correct, descending buzz on wrong, arpeggio on win. No audio files, muted state persisted.

[截图 5: 单关胜利弹窗（星级 + 分数拆分 + 猫科普卡 + 分享按钮）— 需新截]

## Daily Challenge & Leaderboard

The **Daily Challenge** ([gridpaw.com/pictomino/daily-puzzle](https://gridpaw.com/pictomino/daily-puzzle)) is a separate, harder mode: **one puzzle per day, same for every player worldwide** (date-seeded from UTC). It's a **6×6 grid with 18 holes, 4 candidate spots, 33% blur, 50s per round** — the hardest board in the game.

- Your **streak** grows by 1 for each day you solve it (broken if you skip a day), with badges: 💪 Keep it up! (3) → 🔥 Week warrior! (7) → ⭐ Two-week legend! (14) → 🏆 30-day champion! (30).
- Your **best time** is tracked; finishing the puzzle shows the streak card on the win screen.
- Below the game, **🏆 Today's Leaderboard** ranks the day's fastest solvers (🥇🥈🥉 + times). To appear on it you must **Sign in** (Google) — "📅 Sign in and finish today's puzzle to compete!" — otherwise it's purely local. After you win, the page auto-scrolls to the leaderboard.
- The Daily win screen hides "Next level" (there's only one) and its close button reads **Done ✓**.

[截图 6: Daily 胜利面板（🔥 Streak 卡片 + Done ✓）— 需新截]
[截图 7: 今日排行榜（🥇🥈🥉 用时列表）— 需新截]

## Common Questions

**Do I need an account?** No. Everything is playable signed out; the account (optional Google Sign in) only unlocks cloud streak sync and the daily leaderboard.

**How do I place a piece?** Tap the `+` spot on the board — you do *not* need to select the tray piece first (tapping it just plays a selection animation). Correct spots snap the piece in; wrong spots cost a life.

**I'm stuck on a level.** Tap **👁 Peek at the picture (2s)** after losing to re-see the full image, or **Skip this puzzle →** to move on. Wrong guesses reveal information too — the piece stays in the tray, so try another `+`.

**What do the blurred pieces mean?** On Medium and above the candidate piece is deliberately blurred/dimmed to force comparison, not recognition. The higher the level, the weaker the piece (`weak` → `super-weak`).

**Why did my round restart with fewer lives?** The timer ran out on a timed level — it costs 1 life and resets the current round's fills on the same puzzle.

**Can my child play alone?** Yes — pre-readers can play with no text; there's no reading required to place pieces. Cat facts after each win add a reading moment to share.

## FAQ

**Is easy/hard mode different? ⚠ Needs Frank review.** The pages `/pictomino/easy` and `/pictomino/hard` exist and load the game with `?difficulty=easy` / `?difficulty=hard`, but as of 2026-09-28 **`game.html` only implements `mode=daily`** — the `difficulty` parameter feeds analytics only. The on-page claims ("3×3 grid on every level, 7 lives", "5×5 grid") are **not implemented in the engine**; both pages currently run the classic difficulty table with 5 lives. Either the pages or the engine need to change before those claims are real. This doc documents the actual behavior.

**Is progress saved?** Per-level best stars survive reloads (`pictomino_stars`); streak and best time are stored locally and **cloud-synced when signed in** (best-of-both merged). The cat lineup re-shuffles on every page load.

**Is this game like a jigsaw?** It's the same idea with a logic twist: only a few candidate `+` spots are active at once and the piece may be blurred — you deduce from edges and colors instead of trying every spot.

**Are the cats real breeds?** Yes — 15 real breeds (pictures under `assets/cats/`), each with 3 verified fun facts shown after you complete its puzzle.

<!-- 截图清单汇总（需新截 7 张）：
  1. 进行中棋盘 + 候选碎片 → 新截
  2. 2 秒完整图预览 → 新截
  3. 顶部工具栏 → 新截
  4. 碎片弱化对比（全彩 / super-weak）→ 新截
  5. 单关胜利弹窗 → 新截
  6. Daily 胜利 + streak 卡片 → 新截
  7. 今日排行榜 → 新截
-->