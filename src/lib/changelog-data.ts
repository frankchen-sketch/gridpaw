// GridPaw changelog 数据单一来源（2026-10-19 从 changelog.astro 抽出）
// 首页 banner 与 /changelog/ 页共读此模块——新增条目只改这里，banner 自动跟上。
// 条目按日期倒序排列，entries[0] 永远是最新一条。
export interface ChangelogEntry {
  date: string;
  type: "Feature" | "Improvement" | "Fix" | "New";
  game: string | null;
  title: string;
  desc: string;
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  { date: "2026-10-29", type: "Fix", game: null, title: "All third-party ads removed — the site is now ad-free", desc: "Some visitors were redirected to spam pages by ads served through our previous ad network. We removed every third-party ad unit and script the same day — GridPaw is now completely ad-free. If advertising ever comes back, it will be announced on this page first, before it goes live, and it will never include anything that redirects you away from the site. Thanks to the players who reported it." },
  { date: "2026-10-28", type: "Improvement", game: null, title: "Today's answer, right on The Loop page", desc: "The Loop puzzle page now carries a Today's Answer module, so you no longer have to hop to the hints page when you just want the solution (it's still there if you'd rather try first). While shipping it we found the morning answer-refresh had silently failed for two days — a stray non-JSON prefix was poisoning the pipeline. Fixed, with parsing made tolerant so a bad feed can't take the chain down again." },
  { date: "2026-10-26", type: "Fix", game: null, title: "Daily leaderboards now count daily runs only", desc: "Wins from regular levels had been slipping onto the daily boards, crowding out real daily runs. Six client paths that let them through are closed, the server now verifies a run actually started on the daily board before accepting it, and five ghost rows were purged." },
  { date: "2026-10-25", type: "New", game: "Nonogram", title: "Nonogram Solver: step-by-step reasoning and shareable links", desc: "A real-clue solver now lives at /nonogram/solver/. Enter any grid's row and column counts and it fills in the solution, then replays every deduction move by move — including an honest label when it had to fall back to search. Copy link packs your clues into the URL, so a puzzle that has been stumping you can be shared and it solves itself on open. The solving core was rewritten around a dirty-lines queue, so a 20×20 grid resolves in milliseconds." },
  { date: "2026-10-25", type: "Fix", game: null, title: "Ad slots can no longer cover game controls", desc: "On eight game pages the side ad could overlap the playable column and swallow taps on board cells and buttons. Those pages now keep the game at its safe width, so nothing clickable hides under an ad slot." },
  { date: "2026-10-22", type: "Feature", game: null, title: "Guests can now top the leaderboards", desc: "No account needed to compete anymore. Finish a game as a guest and your result goes up under a cat name picked for you — the same name every time, so your streak builds a history. The daily and streak boards at /leaderboard/ stopped being empty shells because of this one." },
  { date: "2026-10-22", type: "New", game: null, title: "The Loop daily hints and answers", desc: "Daily hints and answers for The Loop now live on GridPaw, refreshed every morning with the day's date, plus a full archive of past answers. Stuck on today's puzzle at /the-loop-hints/, or browse previous days at /the-loop-past-answers/." },
  { date: "2026-10-20", type: "Feature", game: null, title: "Collect badges, top the leaderboards", desc: "Eleven badges are now up for grabs — Rookie Paw for your first daily win all the way to Mastermind. Your badge wall shows how rare each one is, and /leaderboard/ ranks today's fastest solves and longest streaks per game. Tap your name to pick a display name, keep the streak alive, and give the other cats someone to chase. Progress earned as a guest carries over when you sign in." },
  { date: "2026-10-20", type: "Feature", game: "Akari", title: "Daily+ bonus round for streak keepers", desc: "Keep your daily streak alive for 7 days and a special seeded 12×12 bonus puzzle unlocks for that day. Bonus solves never touch your streak or leaderboard — pure extra for the devoted." },
  { date: "2026-10-19", type: "Fix", game: "Shikaku", title: "No more lives — draw freely", desc: "The 3-lives system is gone. Wrong rectangles just flash and vanish — the game never interrupts you. A zero-mistake solve now earns a Flawless mark on the win card. Player feedback (and our own data: 22% of games died to lives) drove this one." },
  { date: "2026-10-18", type: "New", game: "Murdoku", title: "The Case Trail: catch the Cat Burglar", desc: "A five-case story mode now lives at /murdoku/trail/. Solve each fixed crime scene — two 4×4 warm-ups, then three trickier 6×6 houses — name the room where the killer was caught, and the clue initials you collect spell out what the Cat Burglar was after. Progress saves in your browser." },
  { date: "2026-10-18", type: "Improvement", game: "Murdoku", title: "New-player walkthrough now hands-on", desc: "The first-case tutorial no longer just explains the rules — it points at the suspect to pick and highlights the tile to place, so you learn the move by making it. Wrong taps now say why (furniture or the victim), and the highlighted target scrolls into view on mobile." },
  { date: "2026-10-18", type: "Improvement", game: null, title: "Clearer titles and answers", desc: "Hashi and Two Not Touch pages now carry the puzzle names people actually search for, the homepage description spells out how Shikaku works, and the Hitori crossword answer is stated up front instead of buried in the article." },
  { date: "2026-10-17", type: "Fix", game: "Murdoku", title: "Every room is connected, every room looks different", desc: "Rooms could end up split into disconnected fragments, and adjacent rooms sometimes shared the same floor texture and tint, making them impossible to tell apart. Rooms now grow as one connected region, and each room gets a unique texture-and-tint combination. Same player report as the corner fix." },
  { date: "2026-10-17", type: "Fix", game: "Murdoku", title: "Corner and wall clues fixed", desc: "The engine counted interior room boundaries as walls, so a \u201cin a corner\u201d clue could land on a tile wedged between rooms instead of an actual corner. Walls are now only the board edge. Found via player feedback on Lemmy." },
  { date: "2026-10-14", type: "Feature", game: "Murdoku", title: "Murdoku (murder sudoku) joins the lineup", desc: "Place cat suspects, follow witness statements, find the killer. 4x4 and 6x6 cases, playable in the browser." },
  { date: "2026-10-14", type: "Fix", game: "Shikaku", title: "Tutorial now teaches drag, not taps", desc: "Reddit players flagged steps 2-3 saying \u201cpress the number\u201d. They now show corner-to-corner drag instructions." },
  { date: "2026-10-14", type: "Improvement", game: null, title: "Site-wide cleanup: 345 dead CSS rules removed", desc: "29 pages shed unused switcher styles, and a QA sweep fixed 30 small issues (broken internal links, a wrong H1, missing schema on the Akari rules page)." },
  { date: "2026-09-25", type: "Feature", game: "Nurikabe", title: "Nurikabe launched", desc: "Grow islands to their numbers and wall off the sea. Official puzzle page with daily challenge." },
  { date: "2026-09-25", type: "Feature", game: "Nonogram", title: "Nonogram launched", desc: "Picture logic puzzles where every solved grid reveals a hidden cat pixel picture." },
  { date: "2026-09-25", type: "Feature", game: "Kakuro", title: "Kakuro launched", desc: "Cross-sum number puzzles with a level-progression mode alongside the classic endless play." },
  { date: "2026-09-10", type: "Feature", game: "Pictomino", title: "New spatial reasoning puzzle game launched", desc: "Third game type joins GridPaw. Rotate and fit tetromino-style shapes onto silhouettes." },
  { date: "2026-09-03", type: "Improvement", game: "Akari", title: "Light count validation is instant", desc: "Removed 200ms delay when placing lights near walls. Feels snappier on mobile." },
  { date: "2026-08-28", type: "Feature", game: "Akari", title: "Glossary expanded to 40+ terms", desc: "New entries cover advanced solving techniques like corner squeeze and wall hugging." },
  { date: "2026-08-20", type: "Fix", game: "Shikaku", title: "Undo button occasionally placed ghost rectangles", desc: "Fixed event handler leaking across puzzle resets." },
  { date: "2026-08-15", type: "Feature", game: null, title: "Chrome extension for daily Akari puzzles", desc: "Install from Chrome Web Store. New puzzle every morning, streak tracking included." },
  { date: "2026-08-08", type: "Improvement", game: "Shikaku", title: "Puzzle generation 3x faster", desc: "Rewrote backtracking solver in TypeScript. Generation for 8x8 grids dropped from 1.2s to 0.4s." },
  { date: "2026-08-01", type: "Improvement", game: null, title: "Multi-language puzzle labels", desc: "Grid numbers and UI hints now display in English, Chinese, and Japanese." },
  { date: "2026-07-22", type: "Fix", game: "Akari", title: "Light bulbs sometimes overlapped on 10x10 grids", desc: "Boundary check was off-by-one for edge cells." },
  { date: "2026-07-15", type: "Feature", game: null, title: "Community page with Reddit integration", desc: "Share solved puzzles and compare times with other players." },
  { date: "2026-06-28", type: "Feature", game: "Akari", title: "Step-by-step solver walkthrough", desc: "Enter any Akari puzzle and watch the solution unfold move by move." },
  { date: "2026-06-10", type: "Improvement", game: "Shikaku", title: "Cat block expressions expanded to 15 types", desc: "Added 5 new cat faces: sleepy, surprised, winking, grumpy, and blep." },
  { date: "2026-05-20", type: "Feature", game: "Akari", title: "Akari (Light Up) puzzle game launched", desc: "Second game type on GridPaw. Place light bulbs to illuminate the entire grid." },
  { date: "2026-04-15", type: "Improvement", game: "Shikaku", title: "Daily challenge now uses seeded generation", desc: "Same puzzle worldwide every day. Streak tracking and Week Warrior badge added." },
  { date: "2026-03-15", type: "Feature", game: null, title: "Online Shikaku solver", desc: "Enter any puzzle and get the unique solution using backtracking algorithm." },
  { date: "2026-01-20", type: "Feature", game: null, title: "Daily challenge launched", desc: "New 6x6 puzzle every midnight UTC. Track your solve streak." },
  { date: "2025-11-15", type: "Feature", game: null, title: "GridPaw launched", desc: "Cat-themed Shikaku puzzle game. Draw rectangles, match areas, collect cat blocks." },
];

// 首页 banner 用：最近 freshnessDays 天内的最新条目（构建期静态判定，无 JS 请求）
export function latestRecentEntry(freshnessDays = 7): ChangelogEntry | null {
  const latest = CHANGELOG_ENTRIES[0];
  if (!latest) return null;
  const built = new Date();
  const entryDate = new Date(latest.date + "T00:00:00Z");
  const diffDays = (built.getTime() - entryDate.getTime()) / 86400000;
  return diffDays <= freshnessDays ? latest : null;
}

export function formatBannerDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// 游戏标签底色（与 changelog.astro gameColors 同源色值）
const GAME_COLORS: Record<string, string> = {
  "Shikaku": "#B08968",
  "Akari": "#C9973B",
  "Pictomino": "#7A8CA3",
  "Kakuro": "#8A6FA8",
  "Nonogram": "#5F8A5E",
  "Nurikabe": "#4E7D96",
  "Murdoku": "#A85B5B",
};
export function gameColor(game: string): string {
  return GAME_COLORS[game] || "#8A7D70";
}
