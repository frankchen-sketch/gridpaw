// Glossary terms data — each entry = one /glossary/{slug} page

export interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  howItWorks: string;
  pros: string[];
  cons: string[];
  whoShouldUse: string;
  tutorial: { step: number; title: string; content: string }[];
  faq: { question: string; answer: string }[];
  relatedTerms: string[];  // slugs
  relatedPages: { label: string; href: string }[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: 'number-cell',
    term: 'Number Cell',
    definition: 'A number cell is a black cell in an Akari puzzle that displays a digit from 0 to 4. This number tells you exactly how many light bulbs (or cats, on MeowTrail) are placed in the four orthogonally adjacent cells — up, down, left, and right.',
    howItWorks: 'Number cells are the primary source of logical constraints in every Akari puzzle. A "0" means none of its neighbors can hold a bulb. A "4" means all four neighbors must contain one. A "2" means exactly two of the four adjacent cells have bulbs. The number never counts diagonal neighbors — only the four orthogonal directions.',
    pros: [
      'Provide clear, unambiguous constraints that drive solving forward',
      'Create cascading deductions — solving one number cell often reveals the answer to others',
      'Make puzzles solvable through pure logic without guessing',
    ],
    cons: [
      'On sparse grids, too few number cells can make puzzles feel under-constrained',
      'Beginners sometimes confuse orthogonal (4 directions) with diagonal (8 directions)',
    ],
    whoShouldUse: 'Every Akari player needs to understand number cells. They are the foundation of all solving techniques. Start by scanning for "0" and "4" cells — they give the most information with the least effort.',
    tutorial: [
      { step: 1, title: 'Find "0" cells', content: 'A "0" cell means none of its four neighbors can hold a bulb. Mark all four adjacent cells with X marks immediately.' },
      { step: 2, title: 'Find "4" cells', content: 'A "4" cell means all four neighbors must be bulbs. Place cats in all four adjacent cells right away.' },
      { step: 3, title: 'Count remaining spaces', content: 'For "2" or "3" cells, count how many adjacent cells are still available. If a "3" cell has one neighbor already blocked, the other three must all be bulbs.' },
      { step: 4, title: 'Propagate consequences', content: 'After each placement, check what new constraints are triggered. Newly placed bulbs illuminate rows and columns, which may force or eliminate other placements.' },
    ],
    faq: [
      { question: 'What does a "0" mean in an Akari puzzle?', answer: 'A "0" means none of its four adjacent cells can contain a light bulb. It immediately eliminates four positions, which often triggers a chain of further deductions.' },
      { question: 'Do number cells count diagonal neighbors?', answer: 'No. Number cells only count orthogonal neighbors — up, down, left, and right. Diagonal cells are not counted.' },
      { question: 'Can a number cell be wrong?', answer: 'No. Number cells are fixed clues placed by the puzzle designer. They are always correct. If your bulbs conflict with a number cell, the error is in your placement.' },
    ],
    relatedTerms: ['black-wall', 'constraint-propagation', 'elimination'],
    relatedPages: [
      { label: 'How to Play', href: '/how-to-play/' },
      { label: 'Tips & Strategies', href: '/tips/' },
    ],
  },
  {
    slug: 'bulb-cat',
    term: 'Bulb / Cat',
    definition: 'A bulb (also called a cat on MeowTrail) is the object you place on white cells to illuminate the grid. Each bulb sends light in four directions — up, down, left, and right — until the light hits a black wall or the grid edge.',
    howItWorks: 'When you place a bulb on a white cell, it illuminates every white cell in its row and column until blocked by a wall. The goal of every Light Up puzzle is to place bulbs so that every white cell is illuminated. On MeowTrail, bulbs are replaced with adorable glowing cats, but the mechanics are identical.',
    pros: [
      'Simple placement mechanic — click to place, click again to remove',
      'Immediate visual feedback as light spreads across the grid',
      'Each placement affects multiple cells, creating satisfying chain reactions',
    ],
    cons: [
      'Placing a bulb in the wrong position can block other valid placements',
      'Two bulbs in the same line of sight create a violation that must be resolved',
    ],
    whoShouldUse: 'Anyone playing Akari puzzles. The bulb/cat is the core game piece. Understanding how light propagates from each placement is essential for solving any puzzle.',
    tutorial: [
      { step: 1, title: 'Place a cat', content: 'Click any white cell to place a glowing cat. Watch how its light spreads up, down, left, and right until hitting walls.' },
      { step: 2, title: 'Observe the light', content: 'Every white cell the light touches is now "illuminated." Dark cells still need light from another direction.' },
      { step: 3, title: 'Check for conflicts', content: 'If two cats can see each other in the same row or column without a wall between them, that is a violation. Remove one cat.' },
      { step: 4, title: 'Use X marks', content: 'Right-click or long-press to place an X mark on cells where no bulb can go. This helps track elimination logic.' },
    ],
    faq: [
      { question: 'What is the difference between a bulb and a cat in Akari?', answer: 'There is no mechanical difference. "Bulb" is the traditional Akari term. "Cat" is MeowTrail\'s themed version. Both illuminate their row and column identically.' },
      { question: 'Can two cats see each other?', answer: 'No. Two cats cannot be in the same unobstructed row or column. If they can see each other, that is a rule violation that must be fixed.' },
      { question: 'How far does a cat\'s light travel?', answer: 'A cat\'s light travels in all four directions (up, down, left, right) until it hits a black wall or the edge of the grid. There is no distance limit.' },
    ],
    relatedTerms: ['light-up-illuminate', 'x-mark', 'black-wall'],
    relatedPages: [
      { label: 'Play MeowTrail', href: '/' },
      { label: 'Cat Logic Puzzle Guide', href: '/cat-logic-puzzle/' },
    ],
  },
  {
    slug: 'light-up-illuminate',
    term: 'Light Up / Illuminate',
    definition: 'To "light up" or "illuminate" a cell means that at least one bulb\'s line of sight reaches it. When you place a bulb, it illuminates every white cell in its row and column until blocked by a wall.',
    howItWorks: 'Each bulb casts light in four cardinal directions. The light passes through white cells but stops at black walls. A white cell is "lit" if any bulb\'s light reaches it from any direction. The win condition requires all white cells to be simultaneously illuminated.',
    pros: [
      'Real-time visual feedback — you can see which cells are lit and which are dark',
      'Creates a clear win condition: no dark cells remaining',
      'Makes progress tangible and satisfying',
    ],
    cons: [
      'A cell can be lit by multiple bulbs, which is wasteful but not a violation',
      'Over-illumination can mask under-constrained areas of the grid',
    ],
    whoShouldUse: 'Every player needs to understand illumination to track progress. Focus on dark cells — they are the ones that still need a bulb to reach them.',
    tutorial: [
      { step: 1, title: 'Scan for dark cells', content: 'After placing a few cats, look for cells that are still dark (darker background). These need light from a bulb.' },
      { step: 2, title: 'Count possible sources', content: 'For each dark cell, count how many valid positions could illuminate it. If only one position exists, a bulb must go there.' },
      { step: 3, title: 'Check the win condition', content: 'The puzzle is solved when every white cell is illuminated and all numbered constraints are satisfied.' },
    ],
    faq: [
      { question: 'What happens if a cell is lit by two bulbs?', answer: 'Nothing bad — it is perfectly valid for a cell to be illuminated by multiple bulbs. It is just inefficient. The puzzle only requires that every white cell is lit at least once.' },
      { question: 'How do I know when the puzzle is solved?', answer: 'When every white cell is illuminated, all numbered cell constraints are satisfied, and no two bulbs can see each other. MeowTrail shows a celebration screen when you win.' },
    ],
    relatedTerms: ['bulb-cat', 'number-cell', 'constraint-propagation'],
    relatedPages: [
      { label: 'Light Up Puzzle Guide', href: '/light-up-puzzle/' },
      { label: 'How to Play', href: '/how-to-play/' },
    ],
  },
  {
    slug: 'x-mark',
    term: 'X Mark',
    definition: 'An X mark is a player-placed annotation on a white cell to indicate that no bulb should go there. X marks are not part of the official Akari rules — they are a solving aid.',
    howItWorks: 'Most online Akari implementations, including MeowTrail, let you place X marks by right-clicking or long-pressing a cell. X marks help you track elimination logic and avoid accidentally placing bulbs in impossible positions.',
    pros: [
      'Helps visualize which cells are ruled out',
      'Prevents accidental bulb placement in eliminated positions',
      'Makes complex deductions easier to track mentally',
    ],
    cons: [
      'Over-using X marks on easy puzzles can slow you down',
      'X marks are optional — some purists solve without them',
    ],
    whoShouldUse: 'Recommended for all players, especially on Medium and Hard puzzles. X marks reduce cognitive load by externalizing your elimination reasoning.',
    tutorial: [
      { step: 1, title: 'Right-click to mark', content: 'Right-click (or long-press on mobile) any white cell to place an X mark. Click again to remove it.' },
      { step: 2, title: 'Mark eliminated cells', content: 'When a "0" cell rules out its neighbors, mark them with X. When a bulb\'s light makes another position impossible, mark it too.' },
      { step: 3, title: 'Use X to find forced moves', content: 'When all but one cell in a number\'s neighborhood are marked X, the remaining cell must hold a bulb.' },
    ],
    faq: [
      { question: 'Are X marks required to solve Akari?', answer: 'No. X marks are a convenience tool, not a rule. Experienced solvers often skip them on easy puzzles. But on hard puzzles, they are invaluable for tracking complex deductions.' },
      { question: 'How do I place X marks on MeowTrail?', answer: 'Right-click on desktop or long-press on mobile to toggle X marks on any white cell. Click again to remove the mark.' },
    ],
    relatedTerms: ['elimination', 'number-cell', 'bulb-cat'],
    relatedPages: [
      { label: 'How to Play', href: '/how-to-play/' },
      { label: 'Tips & Strategies', href: '/tips/' },
    ],
  },
  {
    slug: 'black-wall',
    term: 'Black Wall',
    definition: 'A black wall is any dark cell in the grid that blocks light propagation. Black walls come in two types: plain walls (no number) and numbered walls.',
    howItWorks: 'Plain walls simply block light — they carry no adjacency constraints. Numbered walls enforce a specific bulb count on their neighbors. Both types stop light from passing through, which is the core spatial mechanic of Akari.',
    pros: [
      'Create the grid\'s spatial structure — walls define where light can and cannot go',
      'Numbered walls provide the logical constraints that make puzzles solvable',
      'Strategic wall placement creates interesting deduction chains',
    ],
    cons: [
      'None — walls are a fundamental puzzle element, not a player tool',
    ],
    whoShouldUse: 'Understanding wall behavior is essential for all players. Walls define the "rooms" in the grid and determine which cells can illuminate each other.',
    tutorial: [
      { step: 1, title: 'Identify wall types', content: 'Look at each black cell. If it has a number, it is a numbered wall. If it is plain black, it is just a wall.' },
      { step: 2, title: 'Trace light paths', content: 'From any white cell, trace in all four directions. The light stops at the first wall it hits. This tells you which bulbs can reach that cell.' },
      { step: 3, title: 'Use walls strategically', content: 'Walls create "rooms" — groups of white cells that can only be lit from within. Solve each room independently.' },
    ],
    faq: [
      { question: 'Can light pass through a black wall?', answer: 'No. Black walls completely block light. A bulb\'s illumination stops the moment it hits a wall in any direction.' },
      { question: 'What is the difference between a plain wall and a numbered wall?', answer: 'A plain wall just blocks light. A numbered wall blocks light AND requires its adjacent white cells to contain a specific number of bulbs.' },
    ],
    relatedTerms: ['number-cell', 'light-up-illuminate', 'constraint-propagation'],
    relatedPages: [
      { label: 'Akari Rules', href: '/rules/' },
      { label: 'What is Light Up?', href: '/what-is-light-up/' },
    ],
  },
  {
    slug: 'elimination',
    term: 'Elimination',
    definition: 'Elimination is the process of ruling out impossible bulb placements based on logical deduction. When you determine that a cell cannot contain a bulb, you eliminate it.',
    howItWorks: 'Elimination works by contradiction: if placing a bulb in a cell would violate a numbered constraint, create a bulb conflict, or leave another cell permanently dark, then that cell cannot hold a bulb. Every step forward in Akari comes from either placing a bulb or eliminating a position.',
    pros: [
      'The bread and butter of Akari solving — every solve uses elimination',
      'Can be applied systematically without guessing',
      'Often creates cascading deductions that solve large portions of the grid',
    ],
    cons: [
      'Advanced elimination on hard puzzles requires tracking multiple hypothetical scenarios',
      'Beginners may miss elimination opportunities if they only focus on forced placements',
    ],
    whoShouldUse: 'Every Akari player. Elimination is the most fundamental solving technique. Master it before moving to advanced methods.',
    tutorial: [
      { step: 1, title: 'Start with "0" cells', content: 'A "0" cell eliminates all four neighbors. Mark them with X immediately.' },
      { step: 2, title: 'Check bulb conflicts', content: 'If placing a bulb would create a line-of-sight conflict with an existing bulb, eliminate that position.' },
      { step: 3, title: 'Check illumination needs', content: 'If a dark cell can only be reached from one direction, that direction is forced — and all other positions in that line can be eliminated for other reasons.' },
      { step: 4, title: 'Chain eliminations', content: 'Each elimination may trigger new deductions. Keep propagating until no more eliminations are possible.' },
    ],
    faq: [
      { question: 'What is the elimination technique in Akari?', answer: 'Elimination means ruling out cells where a bulb cannot go. You determine this by checking if a placement would violate any numbered constraint or create a bulb conflict.' },
      { question: 'Is elimination the same as guessing?', answer: 'No. Elimination is pure logical deduction — you prove a cell cannot hold a bulb based on existing constraints. Guessing means placing a bulb without proof and seeing if it works.' },
    ],
    relatedTerms: ['constraint-propagation', 'backtracking', 'x-mark'],
    relatedPages: [
      { label: 'Elimination Technique', href: '/tips/elimination/' },
      { label: 'How to Solve', href: '/how-to-solve/' },
    ],
  },
  {
    slug: 'constraint-propagation',
    term: 'Constraint Propagation',
    definition: 'Constraint propagation is the foundational solving technique in every Akari puzzle. It works by examining numbered cells and deducing forced placements or eliminations.',
    howItWorks: 'Start by examining numbered cells. A "4" forces all four neighbors to be bulbs. A "0" eliminates all four neighbors. After each placement, propagate the consequences — newly placed bulbs illuminate rows and columns, which may trigger further deductions. Repeat until no more simple deductions are available.',
    pros: [
      'Solves Easy and Medium puzzles completely without advanced techniques',
      'Deterministic — no guessing required',
      'Fast and systematic — scan numbered cells in order',
    ],
    cons: [
      'Hard puzzles may reach a point where simple propagation is insufficient',
      'Requires careful tracking of which constraints have already been processed',
    ],
    whoShouldUse: 'All players. Constraint propagation is the first technique to apply on every puzzle. If it solves the puzzle completely, you do not need advanced methods.',
    tutorial: [
      { step: 1, title: 'Scan for "4" and "0"', content: 'These give the most information. Place bulbs around "4" cells, mark X around "0" cells.' },
      { step: 2, title: 'Propagate immediately', content: 'After each placement, check if it triggers new constraints. A newly placed bulb may satisfy a numbered cell\'s count, allowing you to mark remaining neighbors as X.' },
      { step: 3, title: 'Repeat until stuck', content: 'Keep scanning numbered cells and propagating. When no more simple deductions are available, move to elimination or backtracking.' },
    ],
    faq: [
      { question: 'What is constraint propagation in Akari?', answer: 'It is the process of examining numbered cells, deducing forced placements or eliminations, and then propagating those consequences to find more deductions. It is the primary solving technique for Easy and Medium puzzles.' },
      { question: 'Can constraint propagation solve every Akari puzzle?', answer: 'Easy and Medium puzzles, usually yes. Hard puzzles on larger grids may require additional techniques like elimination chains or backtracking.' },
    ],
    relatedTerms: ['elimination', 'backtracking', 'number-cell'],
    relatedPages: [
      { label: 'How to Solve', href: '/how-to-solve/' },
      { label: 'Akari Solver Tool', href: '/solver/' },
    ],
  },
  {
    slug: 'backtracking',
    term: 'Backtracking',
    definition: 'Backtracking is an advanced solving technique — and the method computer solvers use when simple deduction is not enough. You pick an undecided cell, assume it holds a bulb, and propagate all consequences.',
    howItWorks: 'Choose an undecided cell and mentally assume "a bulb goes here." Propagate all consequences — illumination, neighbor counts, conflict zones. If you reach a contradiction (a numbered cell gets too many bulbs, or a white cell becomes impossible to illuminate), your assumption was wrong and that cell cannot hold a bulb. If no contradiction appears, continue until the puzzle is solved.',
    pros: [
      'Can solve any logically solvable puzzle, including the hardest ones',
      'Systematic approach that guarantees a solution',
      'Essential for computer solvers like MeowTrail\'s built-in solver',
    ],
    cons: [
      'Mentally taxing for human solvers — requires tracking hypothetical state',
      'Slower than pure deduction — should be a last resort, not first approach',
      'Can feel like "guessing" even though it is logically sound',
    ],
    whoShouldUse: 'Experienced solvers tackling Hard puzzles on 12×12+ grids. Beginners should master constraint propagation and elimination first.',
    tutorial: [
      { step: 1, title: 'Pick a strategic cell', content: 'Choose an undecided cell near a cluster of numbered walls. This gives the most information per assumption.' },
      { step: 2, title: 'Assume "bulb here"', content: 'Mentally place a bulb and propagate all consequences: illumination, neighbor counts, conflicts.' },
      { step: 3, title: 'Check for contradictions', content: 'If any constraint is violated, your assumption was wrong — mark the cell with X. If no contradiction, the assumption may be correct.' },
      { step: 4, title: 'Try the opposite', content: 'If "bulb here" leads to no contradiction, try "no bulb here" and propagate. If that also leads to no contradiction, you need more information — pick a different cell.' },
    ],
    faq: [
      { question: 'Is backtracking the same as guessing?', answer: 'No. Guessing means placing a bulb without logical justification. Backtracking is a systematic proof technique: you assume a position, derive all consequences, and check for contradictions. It is logically rigorous.' },
      { question: 'When should I use backtracking?', answer: 'Only when constraint propagation and elimination are exhausted. On Easy and Medium puzzles, you should never need backtracking. On Hard 12×12+ grids, it may be necessary.' },
      { question: 'Does MeowTrail\'s solver use backtracking?', answer: 'Yes. MeowTrail\'s built-in solver uses constraint propagation as its first pass, then falls back to backtracking when simple deduction is insufficient.' },
    ],
    relatedTerms: ['constraint-propagation', 'elimination'],
    relatedPages: [
      { label: 'Akari Solver', href: '/solver/' },
      { label: 'How to Solve', href: '/how-to-solve/' },
    ],
  },
  {
    slug: 'akari',
    term: 'Akari',
    definition: 'Akari (あかり) is the original Japanese name for this logic puzzle, meaning "light." It was created and published by Nikoli in 2001.',
    howItWorks: 'Akari is played on a rectangular grid of white and black cells. Some black cells carry numbers from 0 to 4. Players place light bulbs on white cells so that every white cell is illuminated, numbered constraints are satisfied, and no two bulbs see each other in the same row or column.',
    pros: [
      'Elegant ruleset — four rules, infinite possibilities',
      'No math required — pure spatial and logical reasoning',
      'Real-time visual feedback makes progress tangible',
      'Suitable for all ages and skill levels',
    ],
    cons: [
      'Less well-known than Sudoku, so fewer casual players',
      'Hard puzzles on large grids can be very challenging',
    ],
    whoShouldUse: 'Anyone who enjoys logic puzzles, spatial reasoning, or relaxing brain teasers. Especially good for players who find Sudoku too number-heavy.',
    tutorial: [
      { step: 1, title: 'Start with Easy puzzles', content: 'Try MeowTrail\'s 7×7 Easy puzzles to learn the rules. The smaller grid has more numbered clues relative to its size.' },
      { step: 2, title: 'Learn the rules', content: 'Place cats on white cells. Each cat lights its row and column. Numbered walls show how many adjacent cats they need. No two cats can see each other.' },
      { step: 3, title: 'Use hints', content: 'MeowTrail has a Hint button that highlights a cell needing attention. Use it when stuck to learn new deduction patterns.' },
      { step: 4, title: 'Progress to harder levels', content: 'Once Easy puzzles feel comfortable, try Medium (10×10) and Hard (12×12). Each level introduces new solving challenges.' },
    ],
    faq: [
      { question: 'What is Akari?', answer: 'Akari (あかり, "light" in Japanese) is a logic puzzle by Nikoli where you place light bulbs on a grid to illuminate every white cell while following numbered clues. MeowTrail is the cat-themed version.' },
      { question: 'Is Akari the same as Light Up?', answer: 'Yes. "Akari" is the original Japanese name by Nikoli. "Light Up" is the English localization. Same puzzle, same rules.' },
      { question: 'Who created Akari?', answer: 'Nikoli, the Japanese puzzle publisher behind Sudoku, Kakuro, and dozens of other logic puzzles. Akari was first published in 2001.' },
    ],
    relatedTerms: ['light-up-puzzle', 'nikoli', 'number-cell'],
    relatedPages: [
      { label: 'Akari Puzzle Guide', href: '/akari-puzzle/' },
      { label: 'Play Akari Online', href: '/' },
    ],
  },
  {
    slug: 'light-up-puzzle',
    term: 'Light Up Puzzle',
    definition: 'A "light up puzzle" is the English name for Akari. The two terms are completely interchangeable — same rules, same logic, same solving techniques.',
    howItWorks: 'Light Up became the standard English localization when Nikoli\'s puzzles spread internationally through newspapers and online puzzle sites. Some players prefer "Light Up" because it is self-descriptive, while purists and Japanese puzzle fans stick with "Akari."',
    pros: [
      'Self-descriptive name — immediately conveys the core mechanic',
      'Widely recognized in English-speaking puzzle communities',
      'Same great puzzle regardless of what you call it',
    ],
    cons: [
      'None — it is just an alternative name for the same puzzle',
    ],
    whoShouldUse: 'Anyone searching for this puzzle in English. Whether you search "Light Up puzzle" or "Akari puzzle," you will find the same game.',
    tutorial: [
      { step: 1, title: 'Search for either name', content: '"Light Up puzzle online" and "Akari puzzle online" both lead to the same games. MeowTrail uses both names.' },
      { step: 2, title: 'Learn the rules', content: 'The rules are identical regardless of the name: place bulbs, follow numbered clues, illuminate all white cells.' },
    ],
    faq: [
      { question: 'Is Light Up the same as Akari?', answer: 'Yes. "Light Up" is the English name for Akari (あかり). They are identical puzzles with the same rules.' },
      { question: 'Which name should I use?', answer: 'Either is fine. "Akari" is preferred by puzzle purists and Japanese puzzle fans. "Light Up" is more common in English-language contexts.' },
    ],
    relatedTerms: ['akari', 'nikoli'],
    relatedPages: [
      { label: 'Light Up Puzzle Guide', href: '/light-up-puzzle/' },
      { label: 'Play Light Up Online', href: '/' },
    ],
  },
  {
    slug: 'nikoli',
    term: 'Nikoli',
    definition: 'Nikoli (ニコリ) is the legendary Japanese puzzle publisher that created Akari, Sudoku, Kakuro, Slitherlink, and dozens of other logic puzzles. Founded in 1980.',
    howItWorks: 'Nikoli\'s editorial philosophy is strict: every puzzle must have a unique solution solvable through pure logic alone — no guessing, no trivia, no luck. This philosophy makes Nikoli puzzles the gold standard for logic puzzle quality worldwide.',
    pros: [
      'Guarantees puzzle quality — every Nikoli puzzle is logically solvable',
      'Created the most popular logic puzzles in the world',
      'Pioneered the "unique solution" standard that all good puzzle sites follow',
    ],
    cons: [
      'Nikoli\'s magazine is Japanese-only, limiting international access',
      'Some Nikoli puzzle types are less well-known outside Japan',
    ],
    whoShouldUse: 'Anyone interested in the history and standards of logic puzzles. Understanding Nikoli\'s philosophy helps you appreciate why well-designed puzzles always have unique solutions.',
    tutorial: [
      { step: 1, title: 'Explore Nikoli\'s catalog', content: 'Visit nikoli.co.jp to see their full puzzle catalog. Sudoku, Kakuro, Akari, Slitherlink, and many more.' },
      { step: 2, title: 'Try Nikoli-standard puzzles', content: 'MeowTrail follows Nikoli\'s standard: every puzzle has a unique solution through pure logic. No guessing required.' },
    ],
    faq: [
      { question: 'What is Nikoli?', answer: 'Nikoli is a Japanese puzzle publisher founded in 1980. They created Akari, Sudoku, Kakuro, Slitherlink, and dozens of other logic puzzles. Their editorial standard requires every puzzle to have a unique solution.' },
      { question: 'Did Nikoli invent Sudoku?', answer: 'Nikoli popularized Sudoku and gave it its modern name, but the concept of number-placement grids existed earlier. Nikoli refined the puzzle and published it in their magazine starting in 1984.' },
    ],
    relatedTerms: ['akari', 'light-up-puzzle'],
    relatedPages: [
      { label: 'What is Light Up?', href: '/what-is-light-up/' },
      { label: 'Akari Puzzle Guide', href: '/akari-puzzle/' },
    ],
  },
  {
    slug: 'daily-challenge',
    term: 'Daily Challenge',
    definition: 'A daily challenge is a new Akari puzzle released every day for players to solve. Daily challenges create a solving habit and give players a shared experience.',
    howItWorks: 'On MeowTrail, the daily challenge offers a fresh 14×14 puzzle each day with a balanced difficulty level. The same puzzle is shown to all players worldwide, creating a shared daily ritual. Streak tracking rewards consecutive days of solving.',
    pros: [
      'Builds a daily solving habit',
      'Shared experience — everyone solves the same puzzle',
      'Streak tracking adds motivation to return daily',
      'Badge system rewards consistency (3, 7, 14, 30 day streaks)',
    ],
    cons: [
      'Missing a day breaks your streak, which can be frustrating',
      'Fixed difficulty may not suit all skill levels',
    ],
    whoShouldUse: 'Regular players who want a daily brain workout. The streak system is especially motivating for competitive players.',
    tutorial: [
      { step: 1, title: 'Visit the daily page', content: 'Go to meowtrail.org/daily/ to see today\'s puzzle. A new puzzle appears every day at midnight UTC.' },
      { step: 2, title: 'Solve it', content: 'Use the same skills as regular Akari puzzles. The daily challenge is a 14×14 grid — larger than Easy but with plenty of clues.' },
      { step: 3, title: 'Build your streak', content: 'Come back every day to maintain your streak. Earn badges at 3, 7, 14, and 30 consecutive days.' },
    ],
    faq: [
      { question: 'What is the MeowTrail daily challenge?', answer: 'A new 14×14 Akari puzzle released every day. Everyone worldwide gets the same puzzle. Solve it to build your streak and earn badges.' },
      { question: 'When does the daily puzzle reset?', answer: 'A new puzzle appears at midnight UTC every day. Your streak continues as long as you solve each day\'s puzzle before the next one arrives.' },
    ],
    relatedTerms: ['akari', 'number-cell'],
    relatedPages: [
      { label: 'Daily Challenge', href: '/daily/' },
      { label: 'Play MeowTrail', href: '/' },
    ],
  },
];

export function findGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find(t => t.slug === slug);
}
