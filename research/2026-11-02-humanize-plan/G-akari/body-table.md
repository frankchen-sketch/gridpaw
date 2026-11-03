### A. 相关页面列表（7 处，7 个 .astro）

| # | 页面 | 源码位置 | 改前 | 改后 | 手段 |
|---|---|---|---|---|---|
| 1 | `light-up-puzzle` | `src/pages/akari/light-up-puzzle.astro`:223 | Play GridPaw — the main game with all difficulty levels | Play GridPaw: the main game with all difficulty levels | colon |
| 2 | `cat-logic-puzzle` | `src/pages/akari/cat-logic-puzzle.astro`:251 | Play GridPaw — the main game with all difficulty levels | Play GridPaw: the main game with all difficulty levels | colon |
| 3 | `glossary` | `src/pages/akari/glossary.astro`:168 | Play GridPaw — the main game with all difficulty levels | Play GridPaw: the main game with all difficulty levels | colon |
| 4 | `akari-puzzle` | `src/pages/akari/akari-puzzle.astro`:239 | Play GridPaw — the main game with all difficulty levels | Play GridPaw, the main game with all difficulty levels | comma |
| 5 | `logic-puzzle` | `src/pages/akari/logic-puzzle.astro`:205 | Play GridPaw — the main game with all difficulty levels | Play GridPaw, the main game with all difficulty levels | comma |
| 6 | `sudoku-with-pictures` | `src/pages/akari/sudoku-with-pictures.astro`:169 | Play GridPaw — the main game | Play GridPaw: the main game | colon |
| 7 | `games-like-sudoku` | `src/pages/akari/games-like-sudoku.astro`:221 | Play GridPaw — the main game | Play GridPaw, the main game | comma |

### B1. compare 对比段导语（5 处，src/data/compare-pairs.ts）

| # | 页面 | 源码位置 | 改前 | 改后 | 手段 |
|---|---|---|---|---|---|
| 1 | `compare` | `src/data/compare-pairs.ts`:26 | Akari vs Sudoku — two iconic Japanese logic puzzles compared. Rules, difficulty, skills needed, and which one is right for you. | Akari vs Sudoku: two iconic Japanese logic puzzles compared. Rules, difficulty, skills needed, and which one is right for you. | colon |
| 2 | `compare` | `src/data/compare-pairs.ts`:55 | Light Up vs Kakuro — two Nikoli puzzles compared. One uses light and space, the other uses numbers and sums. Which logic puzzle suits you? | Light Up vs Kakuro, two Nikoli puzzles compared. One uses light and space, the other uses numbers and sums. Which logic puzzle suits you? | comma |
| 3 | `compare` | `src/data/compare-pairs.ts`:82 | Akari vs Nonograms — two visual logic puzzles compared. One lights up grids, the other reveals pixel art. Which is more fun? | Akari vs Nonograms: two visual logic puzzles compared. One lights up grids, the other reveals pixel art. Which is more fun? | colon |
| 4 | `compare` | `src/data/compare-pairs.ts`:109 | Logic puzzles vs Sudoku — how does Akari-style deduction compare to number placement? A guide for puzzle lovers choosing their next game. | Logic puzzles vs Sudoku: how does Akari-style deduction compare to number placement? A guide for puzzle lovers choosing their next game. | colon |
| 5 | `compare` | `src/data/compare-pairs.ts`:136 | Light Up vs Slitherlink — two Nikoli spatial puzzles compared. One uses light, the other draws loops. Which is more satisfying? | Light Up vs Slitherlink, two Nikoli spatial puzzles compared. One uses light, the other draws loops. Which is more satisfying? | comma |

### B2. compare Key Differences 卡片（12 处，src/data/compare-pairs.ts）

| # | 页面 | 源码位置 | 改前 | 改后 | 手段 |
|---|---|---|---|---|---|
| 1 | `compare` | `src/data/compare-pairs.ts`:37 | Spatial reasoning — you track lines of sight across rows and columns. Placing one bulb affects multiple cells at once. | Spatial reasoning: you track lines of sight across rows and columns. Placing one bulb affects multiple cells at once. | colon |
| 2 | `compare` | `src/data/compare-pairs.ts`:37 | Number elimination — you scan rows, columns, and 3×3 boxes to find which digit fits. Each cell is independent. | Number elimination. You scan rows, columns, and 3×3 boxes to find which digit fits. Each cell is independent. | period |
| 3 | `compare` | `src/data/compare-pairs.ts`:38 | Easier to start. The illumination mechanic is intuitive — place a cat, watch light spread. Rules are simpler than Sudoku. | Easier to start. The illumination mechanic is intuitive: place a cat, watch light spread. Rules are simpler than Sudoku. | colon |
| 4 | `compare` | `src/data/compare-pairs.ts`:40 | Hard Akari on 12×12+ grids requires hypothetical reasoning and shadow mapping — genuinely challenging. | Hard Akari on 12×12+ grids requires hypothetical reasoning and shadow mapping, genuinely challenging. | comma |
| 5 | `compare` | `src/data/compare-pairs.ts`:66 | Pure spatial logic — no math at all. You reason about lines of sight and adjacency constraints. | Pure spatial logic. No math at all. You reason about lines of sight and adjacency constraints. | period |
| 6 | `compare` | `src/data/compare-pairs.ts`:68 | Instant — conflicting bulbs light up red, and you see violations immediately. | Instant: conflicting bulbs light up red, and you see violations immediately. | colon |
| 7 | `compare` | `src/data/compare-pairs.ts`:68 | Delayed — errors only become apparent when sums don't work out, often several steps later. | Delayed. Errors only become apparent when sums don't work out, often several steps later. | period |
| 8 | `compare` | `src/data/compare-pairs.ts`:95 | High — every puzzle is different, and the solving path varies. The grid never looks the same twice. | High: every puzzle is different, and the solving path varies. The grid never looks the same twice. | colon |
| 9 | `compare` | `src/data/compare-pairs.ts`:95 | Moderate — once you solve a nonogram, the picture is revealed. Re-solving gives less novelty. | Moderate. Once you solve a nonogram, the picture is revealed. Re-solving gives less novelty. | period |
| 10 | `compare` | `src/data/compare-pairs.ts`:122 | Massive global community. Competitions, apps, newspapers — Sudoku is everywhere. | Massive global community. Competitions, apps, newspapers; Sudoku is everywhere. | semicolon |
| 11 | `compare` | `src/data/compare-pairs.ts`:148 | Easy — remove a bulb and the light recalculates instantly. No permanent state. | Easy: remove a bulb and the light recalculates instantly. No permanent state. | colon |
| 12 | `compare` | `src/data/compare-pairs.ts`:148 | Harder — a misplaced edge segment can create contradictions many steps later. Backtracking is common. | Harder. A misplaced edge segment can create contradictions many steps later. Backtracking is common. | period |

### C. 博客列表摘要（3 处，src/data/blog-posts.ts；同时是文章 meta description）

| # | 页面 | 源码位置 | 改前 | 改后 | 手段 |
|---|---|---|---|---|---|
| 1 | `blog` | `src/data/blog-posts.ts`:17 | Master these 5 essential Akari (Light Up) puzzle strategies to solve puzzles faster. From constraint propagation to shadow mapping — beginner-friendly guide with examples. | Master these 5 essential Akari (Light Up) puzzle strategies to solve puzzles faster. From constraint propagation to shadow mapping: beginner-friendly guide with examples. | colon |
| 2 | `blog` | `src/data/blog-posts.ts`:70 | Discover the 7 best logic puzzles for brain training — from beginner-friendly Akari to expert-level Slitherlink. Ranked by difficulty with free play links. | Discover the 7 best logic puzzles for brain training, from beginner-friendly Akari to expert-level Slitherlink. Ranked by difficulty with free play links. | comma |
| 3 | `blog` | `src/data/blog-posts.ts`:121 | From Nikoli's Tokyo office to puzzle apps worldwide — the complete history of Akari (Light Up). How a 2001 Japanese puzzle became a global brain teaser. | From Nikoli's Tokyo office to puzzle apps worldwide: the complete history of Akari (Light Up). How a 2001 Japanese puzzle became a global brain teaser. | colon |
