// Blog posts data — each entry = one /blog/{slug} page

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;         // ISO date
  readTime: string;     // e.g. "5 min read"
  tags: string[];
  content: string;      // HTML content
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'akari-puzzle-strategies-beginners',
    title: '5 Akari Puzzle Strategies Every Beginner Should Know',
    description: 'Master these 5 essential Akari (Light Up) puzzle strategies to solve puzzles faster. From constraint propagation to shadow mapping — beginner-friendly guide with examples.',
    date: '2026-08-28',
    readTime: '6 min read',
    tags: ['strategy', 'beginner', 'tutorial'],
    content: `
<p>Staring at an Akari puzzle and not sure where to start? These five strategies will take you from confused to confident. Each technique builds on the last — master them in order and you will be solving Medium puzzles in no time.</p>

<h2>Strategy 1: Start with Extremes</h2>
<p>Scan the grid for "0" and "4" cells first. These give the most information with zero effort:</p>
<ul>
  <li><strong>"0" cell:</strong> None of its four neighbors can hold a bulb. Mark all four with X immediately.</li>
  <li><strong>"4" cell:</strong> All four neighbors must be bulbs. Place cats in all four positions right away.</li>
</ul>
<p>After handling extremes, check "3" cells with one neighbor already blocked, and "1" cells with three neighbors blocked. These are nearly as informative.</p>

<h2>Strategy 2: Propagate Before You Think</h2>
<p>After every placement, immediately check what it triggers. A newly placed bulb illuminates its entire row and column — which means:</p>
<ul>
  <li>No other bulb can go in the same unobstructed line (conflict rule)</li>
  <li>Numbered cells adjacent to the new bulb may now be satisfied</li>
  <li>Dark cells near the new bulb may now have fewer possible light sources</li>
</ul>
<p>Do not place a bulb and move on. Propagate its consequences before touching another cell.</p>

<h2>Strategy 3: Hunt Dark Cells</h2>
<p>Dark cells (unilluminated white cells) are your compass. For each dark cell, count how many valid positions could illuminate it:</p>
<ul>
  <li><strong>One source:</strong> A bulb must go there. Place it.</li>
  <li><strong>Two sources:</strong> You need more information before deciding.</li>
  <li><strong>Zero sources:</strong> You made an error somewhere — backtrack.</li>
</ul>
<p>This "last remaining option" technique is the most common way to break through a stuck position.</p>

<h2>Strategy 4: Use X Marks Liberally</h2>
<p>X marks are not cheating — they are thinking tools. Right-click (or long-press on mobile) to mark cells where no bulb can go. Benefits:</p>
<ul>
  <li>Reduces cognitive load — you do not need to remember eliminations</li>
  <li>Makes forced moves obvious — when all but one neighbor is X, the remaining cell is forced</li>
  <li>Prevents accidental bulb placement in eliminated positions</li>
</ul>

<h2>Strategy 5: Shadow Mapping (Advanced)</h2>
<p>For Hard puzzles, mentally overlay a "shadow map" on the grid. For each undecided cell, track which directions could still illuminate it. As you place bulbs and mark impossibilities, the shadow map narrows. When a cell shows only one viable direction, that direction is forced.</p>
<p>This systematic approach prevents you from overlooking subtle deductions on larger grids (12×12 and above).</p>

<h2>Practice These Strategies</h2>
<p>Theory is nothing without practice. Start with MeowTrail's Easy 7×7 puzzles to build muscle memory, then graduate to Medium and Hard. Use the Hint button when stuck — it shows you which cell to focus on, helping you learn which strategy applies.</p>
    `,
  },
  {
    slug: 'best-logic-puzzles-brain-training',
    title: '7 Best Logic Puzzles for Brain Training (Ranked by Difficulty)',
    description: 'Discover the 7 best logic puzzles for brain training — from beginner-friendly Akari to expert-level Slitherlink. Ranked by difficulty with free play links.',
    date: '2026-08-28',
    readTime: '7 min read',
    tags: ['brain-training', 'logic-puzzles', 'comparison'],
    content: `
<p>Logic puzzles are one of the best ways to keep your mind sharp. They exercise deduction, spatial reasoning, working memory, and pattern recognition — all without feeling like "work." Here are the 7 best logic puzzles for brain training, ranked from easiest to hardest.</p>

<h2>1. Akari (Light Up) — Difficulty: ★★☆☆☆</h2>
<p>Akari is a spatial logic puzzle where you place light bulbs on a grid to illuminate every cell. Numbered clues tell you how many bulbs surround each wall. The rules are intuitive, the visual feedback is satisfying, and Easy puzzles can be solved in 5 minutes.</p>
<p><strong>Brain skills:</strong> Spatial reasoning, constraint satisfaction, visual processing.</p>
<p><strong>Why it is great for brain training:</strong> The illumination mechanic provides instant feedback, making it easy to learn from mistakes. No math required.</p>
<p><a href="/">Play Akari free on MeowTrail →</a></p>

<h2>2. Sudoku — Difficulty: ★★★☆☆</h2>
<p>The classic number-placement puzzle. Fill a 9×9 grid so every row, column, and 3×3 box contains the digits 1–9. Easy Sudoku is accessible to everyone; expert variants (X-Sudoku, Killer) add serious challenge.</p>
<p><strong>Brain skills:</strong> Working memory, number logic, pattern scanning.</p>
<p><strong>Why it is great:</strong> Massive community, endless free puzzles, well-studied cognitive benefits.</p>

<h2>3. Nonograms (Picross) — Difficulty: ★★★☆☆</h2>
<p>Color cells in a grid based on number clues to reveal a pixel art picture. The logic is similar to Sudoku but produces visual art as a reward.</p>
<p><strong>Brain skills:</strong> Counting, pattern recognition, patience.</p>
<p><strong>Why it is great:</strong> The picture reveal is a unique reward mechanism that keeps you motivated through large puzzles.</p>

<h2>4. Kakuro — Difficulty: ★★★★☆</h2>
<p>Like a crossword puzzle with numbers. Fill digits so each row and column sums to the given clue. Requires knowledge of number combinations.</p>
<p><strong>Brain skills:</strong> Arithmetic, combinatorial reasoning, working memory.</p>
<p><strong>Why it is great:</strong> Bridges the gap between pure logic and math-based puzzles.</p>

<h2>5. Slitherlink — Difficulty: ★★★★☆</h2>
<p>Draw a single continuous loop on a grid. Numbered cells tell you how many of their edges the loop passes through. Topological reasoning at its finest.</p>
<p><strong>Brain skills:</strong> Spatial reasoning, topology, systematic deduction.</p>
<p><strong>Why it is great:</strong> Unique among logic puzzles — the loop-drawing mechanic exercises different cognitive pathways.</p>

<h2>6. Hashiwokakero (Bridges) — Difficulty: ★★★★☆</h2>
<p>Connect islands with bridges (1 or 2 per connection) so every island has the correct number of bridges and all islands are connected. Graph theory meets logic.</p>
<p><strong>Brain skills:</strong> Graph reasoning, connectivity, planning.</p>
<p><strong>Why it is great:</strong> Exercises planning and global reasoning — you need to think about the whole network, not just local constraints.</p>

<h2>7. Nurikabe — Difficulty: ★★★★★</h2>
<p>Paint cells to create a continuous "sea" of black cells with numbered "islands" of white cells. The sea must be connected and cannot contain 2×2 blocks. Deceptively difficult.</p>
<p><strong>Brain skills:</strong> Spatial reasoning, connectivity, constraint propagation.</p>
<p><strong>Why it is great:</strong> The hardest Nikoli puzzle for many players. Excellent for advanced brain training.</p>

<h2>Which Puzzle Should You Start With?</h2>
<p>If you are new to logic puzzles, start with <strong>Akari</strong>. The rules are the simplest, the visual feedback is the most satisfying, and the learning curve is gentle. Once you can solve Medium Akari puzzles comfortably, try Sudoku or Nonograms for variety.</p>
<p>For daily brain training, rotate between 2–3 puzzle types. Each exercises different cognitive skills, giving your brain a more complete workout.</p>
    `,
  },
  {
    slug: 'history-of-akari-puzzle',
    title: 'The History of Akari: How Nikoli Created the Light Up Puzzle',
    description: 'From Nikoli\'s Tokyo office to puzzle apps worldwide — the complete history of Akari (Light Up). How a 2001 Japanese puzzle became a global brain teaser.',
    date: '2026-08-28',
    readTime: '5 min read',
    tags: ['history', 'nikoli', 'akari'],
    content: `
<p>Akari (あかり, meaning "light" in Japanese) is one of the most elegant logic puzzles ever designed. Its rules fit on a napkin, yet its puzzles can challenge even the sharpest minds. Here is how it came to be.</p>

<h2>Nikoli: The Puzzle Factory</h2>
<p>Nikoli Co., Ltd. was founded in 1980 in Tokyo, Japan. The company publishes a quarterly puzzle magazine called <em>Puzzle Communication Nikoli</em>, which has been the birthplace of many of the world's most popular logic puzzles.</p>
<p>Nikoli's editorial philosophy is strict and uncompromising: <strong>every puzzle must have a unique solution solvable through pure logic alone</strong>. No guessing, no trivia, no luck. This standard has made Nikoli puzzles the gold reference for logic puzzle quality worldwide.</p>

<h2>The Birth of Akari (2001)</h2>
<p>Akari was first published in Nikoli's magazine in 2001. The puzzle was designed around a simple, beautiful concept: <strong>place light sources so every room is illuminated</strong>.</p>
<p>The design genius of Akari lies in its constraint system:</p>
<ul>
  <li><strong>Numbered walls</strong> provide local constraints (how many bulbs surround me?)</li>
  <li><strong>Light propagation</strong> provides global constraints (which cells can see each other?)</li>
  <li><strong>The win condition</strong> ties everything together (all cells must be lit)</li>
</ul>
<p>These three layers create puzzles that are easy to understand but can be fiendishly difficult to solve.</p>

<h2>Akari vs Sudoku: A Tale of Two Puzzles</h2>
<p>Sudoku, also a Nikoli creation (popularized from 1984), became a global phenomenon in 2004–2005. Akari never achieved the same mass-market explosion, but it built a devoted following among players who preferred spatial reasoning over number manipulation.</p>
<p>Key differences in their spread:</p>
<ul>
  <li><strong>Sudoku:</strong> Newspaper syndication drove mass adoption. Numbers are universal.</li>
  <li><strong>Akari:</strong> Spread through puzzle magazines and online communities. The spatial mechanic is less intuitive for casual players but more satisfying for enthusiasts.</li>
</ul>

<h2>The Digital Era</h2>
<p>As puzzle sites and apps proliferated in the 2010s, Akari found a new audience online. The visual nature of the puzzle — watching light spread across a grid — translates beautifully to screens. Real-time feedback that was impossible on paper becomes a core feature of digital Akari.</p>
<p>MeowTrail continues this evolution by adding a cat theme to the classic puzzle. The warm, cozy aesthetic lowers the intimidation barrier and makes Akari accessible to players who might never have tried a "logic puzzle."</p>

<h2>Nikoli's Legacy</h2>
<p>Beyond Akari and Sudoku, Nikoli's catalog includes:</p>
<ul>
  <li><strong>Kakuro</strong> — cross-sum puzzles (1966)</li>
  <li><strong>Slitherlink</strong> — loop-drawing puzzles (1989)</li>
  <li><strong>Nonograms</strong> — pixel art by numbers (published by Nikoli, invented by Non Ishida in 1987)</li>
  <li><strong>Nurikabe</strong> — island and sea puzzles</li>
  <li><strong>Hashiwokakero</strong> — bridge-building puzzles</li>
</ul>
<p>Each puzzle type exercises different cognitive skills, but all share Nikoli's core promise: unique solution, pure logic, no guessing.</p>

<h2>Try Akari Today</h2>
<p>The best way to appreciate Akari's elegant design is to play it. Start with MeowTrail's Easy 7×7 puzzles — they take about 5 minutes and teach you the rules through play, not instruction manuals.</p>
    `,
  },
];

export function findBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}
