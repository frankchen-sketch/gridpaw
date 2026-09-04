// Comparison pairs for /compare/{slug} pages
// Each pair = one pSEO page targeting "X vs Y" search intent

export interface ComparePair {
  slug: string;       // e.g. "akari-vs-sudoku"
  titleA: string;     // Display name
  titleB: string;
  slugA: string;      // Internal link slug
  slugB: string;
  description: string;
  // Spec table rows: [label, valueA, valueB]
  specs: [string, string, string][];
  // Key differences (3-5)
  differences: { topic: string; a: string; b: string }[];
  // FAQ entries
  faq: { question: string; answer: string }[];
}

export const comparePairs: ComparePair[] = [
  {
    slug: 'akari-vs-sudoku',
    titleA: 'Akari',
    titleB: 'Sudoku',
    slugA: '/akari-puzzle/',
    slugB: '#',
    description: 'Akari vs Sudoku — two iconic Japanese logic puzzles compared. Rules, difficulty, skills needed, and which one is right for you.',
    specs: [
      ['Core Mechanic', 'Place bulbs to light cells', 'Fill numbers 1–9'],
      ['Reasoning Type', 'Spatial + logical', 'Number logic'],
      ['Math Required', 'None', 'Basic (1–9)'],
      ['Visual Feedback', 'Real-time illumination', 'None until complete'],
      ['Grid Sizes', '7×7 to 14×14', '9×9 standard'],
      ['Creator', 'Nikoli (2001)', 'Nikoli (1984)'],
      ['Average Solve Time', '5–20 minutes', '10–30 minutes'],
    ],
    differences: [
      { topic: 'Thinking Style', a: 'Spatial reasoning — you track lines of sight across rows and columns. Placing one bulb affects multiple cells at once.', b: 'Number elimination — you scan rows, columns, and 3×3 boxes to find which digit fits. Each cell is independent.' },
      { topic: 'Learning Curve', a: 'Easier to start. The illumination mechanic is intuitive — place a cat, watch light spread. Rules are simpler than Sudoku.', b: 'Steeper entry for non-number people. But once you get the scanning pattern, it becomes automatic.' },
      { topic: 'Satisfaction', a: 'Watching light flood the grid is viscerally satisfying. Every placement has immediate visual impact.', b: 'Completion satisfaction comes at the end when the full grid is filled. Less incremental feedback.' },
      { topic: 'Difficulty Ceiling', a: 'Hard Akari on 12×12+ grids requires hypothetical reasoning and shadow mapping — genuinely challenging.', b: 'Expert Sudoku variants (X-Sudoku, Killer) add constraints that push difficulty very high.' },
    ],
    faq: [
      { question: 'Is Akari harder than Sudoku?', answer: 'Not necessarily. Easy Akari puzzles (7×7) are simpler than standard Sudoku because the rules are more intuitive. Hard Akari puzzles (12×12) can be as challenging as expert Sudoku. The difficulty depends on the puzzle, not the game type.' },
      { question: 'Can Sudoku skills help with Akari?', answer: 'Partially. Both use logical deduction and constraint satisfaction, so the general mindset transfers. However, Akari requires spatial reasoning (tracking lines of sight) which Sudoku does not. Sudoku players will pick up Akari quickly but still need to develop spatial intuition.' },
      { question: 'Which puzzle is better for beginners?', answer: 'Akari is generally easier for beginners because the visual feedback (light spreading) makes progress tangible. Sudoku requires comfort with numbers and scanning patterns that take practice to develop. Try MeowTrail\'s Easy 7×7 puzzles to start.' },
      { question: 'Do Akari and Sudoku use the same part of the brain?', answer: 'Both engage logical reasoning, but Akari leans more on spatial processing (visualizing light paths) while Sudoku leans on working memory (tracking which numbers are possible). They complement each other well as cross-training.' },
    ],
  },
  {
    slug: 'light-up-vs-kakuro',
    titleA: 'Light Up',
    titleB: 'Kakuro',
    slugA: '/light-up-puzzle/',
    slugB: '#',
    description: 'Light Up vs Kakuro — two Nikoli puzzles compared. One uses light and space, the other uses numbers and sums. Which logic puzzle suits you?',
    specs: [
      ['Core Mechanic', 'Place bulbs to illuminate cells', 'Fill digits that sum to clues'],
      ['Reasoning Type', 'Spatial deduction', 'Arithmetic + logic'],
      ['Math Required', 'None', 'Addition, subtraction'],
      ['Visual Feedback', 'Real-time light spread', 'None until complete'],
      ['Grid Shape', 'Square grid', 'Irregular (crossword-like)'],
      ['Creator', 'Nikoli (2001)', 'Nikoli (1966)'],
      ['Unique Solution', 'Always', 'Always'],
    ],
    differences: [
      { topic: 'Skill Set', a: 'Pure spatial logic — no math at all. You reason about lines of sight and adjacency constraints.', b: 'Combines arithmetic with logic. You need to know number combinations that sum to specific values.' },
      { topic: 'Grid Layout', a: 'Clean rectangular grid with black walls. Easy to scan and understand at a glance.', b: 'Crossword-like layout with intersecting sum clues. More complex to navigate visually.' },
      { topic: 'Error Detection', a: 'Instant — conflicting bulbs light up red, and you see violations immediately.', b: 'Delayed — errors only become apparent when sums don\'t work out, often several steps later.' },
    ],
    faq: [
      { question: 'Is Light Up the same as Akari?', answer: 'Yes. "Light Up" is the English name for Akari (あかり). They are identical puzzles with the same rules. MeowTrail uses both names interchangeably.' },
      { question: 'Which is more relaxing — Light Up or Kakuro?', answer: 'Light Up is generally more relaxing because it has no math and provides calming visual feedback (warm light spreading across the grid). Kakuro requires arithmetic which some players find stressful.' },
      { question: 'Can I play Light Up and Kakuro on the same site?', answer: 'MeowTrail focuses on Light Up (Akari) puzzles. For Kakuro, you would need a dedicated Kakuro site. But the logical skills from one transfer to the other.' },
    ],
  },
  {
    slug: 'akari-vs-nonogram',
    titleA: 'Akari',
    titleB: 'Nonograms',
    slugA: '/akari-puzzle/',
    slugB: '#',
    description: 'Akari vs Nonograms — two visual logic puzzles compared. One lights up grids, the other reveals pixel art. Which is more fun?',
    specs: [
      ['Core Mechanic', 'Place bulbs to light cells', 'Color cells by number clues'],
      ['Reasoning Type', 'Spatial + adjacency', 'Counting + pattern'],
      ['Math Required', 'None', 'Counting only'],
      ['End Result', 'Fully lit grid', 'Pixel art picture'],
      ['Visual Feedback', 'Real-time illumination', 'Picture emerges gradually'],
      ['Creator', 'Nikoli (2001)', 'Non Ishida (1987)'],
      ['Typical Grid Size', '7×7 to 14×14', '10×10 to 25×25'],
    ],
    differences: [
      { topic: 'Reward Mechanism', a: 'Every bulb placement lights up cells instantly. You see the effect of each move immediately.', b: 'The picture only reveals itself after many cells are filled. The "aha" moment comes when you recognize the image.' },
      { topic: 'Logical Depth', a: 'Uses constraint propagation and line-of-sight reasoning. Each numbered wall affects its neighbors.', b: 'Uses run-length encoding logic. Each row/column clue tells you exactly which cells to fill.' },
      { topic: 'Replayability', a: 'High — every puzzle is different, and the solving path varies. The grid never looks the same twice.', b: 'Moderate — once you solve a nonogram, the picture is revealed. Re-solving gives less novelty.' },
    ],
    faq: [
      { question: 'Which is easier — Akari or Nonograms?', answer: 'Small Akari puzzles (7×7) are easier than most nonograms because the rules are simpler. Large nonograms (25×25) can be very challenging. For beginners, start with Akari Easy puzzles on MeowTrail.' },
      { question: 'Do Akari and Nonograms require the same skills?', answer: 'Both use logical deduction, but Akari emphasizes spatial reasoning (lines of sight) while Nonograms emphasize counting and pattern matching. They exercise different parts of your logical toolkit.' },
      { question: 'Is there a cat-themed Nonogram?', answer: 'Nonograms often produce pixel art of cats as the final image, but the solving process itself is not cat-themed. MeowTrail\'s Akari puzzles use cat visuals throughout the solving experience.' },
    ],
  },
  {
    slug: 'logic-puzzle-vs-sudoku',
    titleA: 'Logic Puzzles',
    titleB: 'Sudoku',
    slugA: '/logic-puzzle/',
    slugB: '#',
    description: 'Logic puzzles vs Sudoku — how does Akari-style deduction compare to number placement? A guide for puzzle lovers choosing their next game.',
    specs: [
      ['Category', 'Broad genre (Akari, Kakuro, Slitherlink…)', 'Specific puzzle type'],
      ['Core Skill', 'Deduction (varies by puzzle)', 'Number elimination'],
      ['Variety', 'Dozens of rule sets', 'One rule set, many variants'],
      ['Math Level', 'None to basic', 'Basic (1–9)'],
      ['Best For', 'Players who want variety', 'Players who love number patterns'],
      ['Daily Challenge', 'Available on MeowTrail', 'Available on many sites'],
      ['Brain Training', 'Spatial + logical', 'Logical + memory'],
    ],
    differences: [
      { topic: 'Scope', a: '"Logic puzzle" is a broad category that includes Akari, Kakuro, Slitherlink, Nonograms, and dozens more. Each has unique rules.', b: 'Sudoku is one specific puzzle type. Variants exist (X-Sudoku, Killer) but the core mechanic is always number placement.' },
      { topic: 'Skill Transfer', a: 'Playing different logic puzzles builds a diverse problem-solving toolkit. Skills from Akari help with Slitherlink and vice versa.', b: 'Sudoku skills transfer well between Sudoku variants but less so to other puzzle types.' },
      { topic: 'Community', a: 'Smaller but passionate. Each puzzle type has its own niche community.', b: 'Massive global community. Competitions, apps, newspapers — Sudoku is everywhere.' },
    ],
    faq: [
      { question: 'Is Sudoku a logic puzzle?', answer: 'Yes, Sudoku is a type of logic puzzle. "Logic puzzle" is the broad category; Sudoku is one specific member. Other logic puzzles include Akari, Kakuro, Slitherlink, and Nonograms.' },
      { question: 'What logic puzzle should I try if I like Sudoku?', answer: 'Akari (Light Up) is the natural next step. It uses similar deduction skills but adds spatial reasoning with its illumination mechanic. Try MeowTrail\'s Easy puzzles to get started.' },
      { question: 'Are logic puzzles better brain training than Sudoku?', answer: 'Playing multiple logic puzzle types provides more diverse brain training than Sudoku alone. Each puzzle type exercises different cognitive skills — spatial reasoning, arithmetic, pattern recognition, and more.' },
    ],
  },
  {
    slug: 'light-up-vs-slitherlink',
    titleA: 'Light Up',
    titleB: 'Slitherlink',
    slugA: '/light-up-puzzle/',
    slugB: '#',
    description: 'Light Up vs Slitherlink — two Nikoli spatial puzzles compared. One uses light, the other draws loops. Which is more satisfying?',
    specs: [
      ['Core Mechanic', 'Place bulbs to light cells', 'Draw a single loop'],
      ['Reasoning Type', 'Spatial + adjacency', 'Topology + logic'],
      ['Math Required', 'None', 'Counting only'],
      ['Win Condition', 'All cells illuminated', 'Complete loop formed'],
      ['Visual Feedback', 'Real-time light spread', 'Loop grows incrementally'],
      ['Creator', 'Nikoli (2001)', 'Nikoli (1989)'],
      ['Difficulty Range', 'Easy to Hard', 'Medium to Expert'],
    ],
    differences: [
      { topic: 'Mental Model', a: 'Think in terms of light rays and shadows. Each bulb casts light in four directions until blocked.', b: 'Think in terms of edges and connections. Each numbered cell constrains how many of its edges the loop passes through.' },
      { topic: 'Error Recovery', a: 'Easy — remove a bulb and the light recalculates instantly. No permanent state.', b: 'Harder — a misplaced edge segment can create contradictions many steps later. Backtracking is common.' },
      { topic: 'Aesthetic', a: 'Warm, cozy, visual. The grid fills with golden light. Emotionally inviting.', b: 'Clean, geometric, abstract. The satisfaction comes from the elegant loop shape.' },
    ],
    faq: [
      { question: 'Is Light Up easier than Slitherlink?', answer: 'Yes, Light Up is generally easier to learn and play. Slitherlink has a steeper learning curve because its edge-drawing mechanic is less intuitive than Light Up\'s bulb-placing. Both have challenging expert-level puzzles.' },
      { question: 'Which puzzle is more popular — Light Up or Slitherlink?', answer: 'Light Up (Akari) has a larger casual player base due to its approachable theme and visual feedback. Slitherlink has a dedicated following among hardcore puzzle enthusiasts who enjoy its topological reasoning.' },
      { question: 'Can I play both on MeowTrail?', answer: 'MeowTrail specializes in Light Up (Akari) puzzles with a cat theme. Slitherlink is a different puzzle type that requires a dedicated implementation. Start with Light Up on MeowTrail, then explore Slitherlink on other Nikoli fan sites.' },
    ],
  },
];

export function findComparePair(slug: string): ComparePair | undefined {
  return comparePairs.find(p => p.slug === slug);
}
