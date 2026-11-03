# FAQPage JSON-LD 与可见答案不一致清单（只读盘点）

- 基线：HEAD `514497f9f62982b6d914aadc9e4f1bf0e92c0609` 的 `dist/` 构建产物
- 口径：`details` 答案段 / `.faq-answer` 纯文本（去标签、解码实体、折叠空白）与 `FAQPage.mainEntity[].acceptedAnswer.text` 逐字比较
- 补丁条目：**81 条 / 24 页 / 24 文件**（同题 78 + 题面措辞不同但同义 3）
- 无法只改答案修复：**4 条**（JSON-LD 题面在可见 FAQ 无对应）

## 按页汇总

| 页面 | 条数 | 源文件 |
|---|---:|---|
| `/kenken/index.html` | 6 | `src/pages/kenken/index.astro` |
| `/slitherlink/index.html` | 6 | `src/pages/slitherlink/index.astro` |
| `/star-battle/index.html` | 6 | `src/pages/star-battle/index.astro` |
| `/akari/index.html` | 5 | `src/pages/akari/index.astro` |
| `/binary/index.html` | 5 | `src/pages/binary/index.astro` |
| `/hashi/how-to-play/index.html` | 5 | `src/pages/hashi/how-to-play.astro` |
| `/hashi/index.html` | 5 | `src/pages/hashi/index.astro` |
| `/pt-br/kakuro/index.html` | 5 | `src/pages/pt-br/kakuro.astro` |
| `/pt-br/nonogram/index.html` | 5 | `src/pages/pt-br/nonogram.astro` |
| `/pt-br/nurikabe/index.html` | 5 | `src/pages/pt-br/nurikabe.astro` |
| `/pt-br/pictomino/index.html` | 5 | `src/pages/pt-br/pictomino.astro` |
| `/pt-br/akari/index.html` | 4 | `src/pages/pt-br/akari.astro` |
| `/pt-br/shikaku/index.html` | 4 | `src/pages/pt-br/shikaku.astro` |
| `/binary/takuzu/index.html` | 2 | `src/pages/binary/takuzu.astro` |
| `/japanese-logic-puzzles/index.html` | 2 | `src/pages/japanese-logic-puzzles/index.astro` |
| `/pictomino/index.html` | 2 | `public/pictomino/index.html` |
| `/pt-br/index.html` | 2 | `src/pages/pt-br/index.astro` |
| `/arrows-puzzle-walkthrough/index.html` | 1 | `src/pages/arrows-puzzle-walkthrough/index.astro` |
| `/brain-teasers-for-adults/index.html` | 1 | `src/pages/brain-teasers-for-adults/index.astro` |
| `/crazy-cleanup/index.html` | 1 | `src/pages/crazy-cleanup/index.astro` |
| `/index.html` | 1 | `src/pages/index.astro` |
| `/meowdoku-guide/index.html` | 1 | `src/pages/meowdoku-guide/index.astro` |
| `/murder-sudoku/index.html` | 1 | `src/pages/murder-sudoku/index.astro` |
| `/pictomino/easy.html` | 1 | `public/pictomino/easy.html` |

## 补丁逐条（首处分歧；完整原文见 `inventory.json`）

### 1. `/akari/index.html` — What is an Akari (Light Up) puzzle? 

- `src/pages/akari/index.astro:53` ｜ content ｜ 224 → 262 字符 ｜ guard83=Y
- …. GridPaw is the cat-themed version**[.]**… → …. GridPaw is the cat-themed version**[ — place glowing cats instead of bulbs!]**…

### 2. `/akari/index.html` — How is GridPaw different from Sudoku? 

- `src/pages/akari/index.astro:57` ｜ content ｜ 218 → 286 字符 ｜ guard83=N
- …njoy GridPaw's clue-based lighting.**[∅]**… → …njoy GridPaw's clue-based lighting.**[ The spatial reasoning is a refreshing change from number crunching.]**…

### 3. `/akari/index.html` — Where should beginners start? 

- `src/pages/akari/index.astro:61` ｜ content ｜ 136 → 192 字符 ｜ guard83=Y
- …e step by step, then move to Easy 6**[x]**6 boards before trying bigger grids… → …e step by step, then move to Easy 6**[×]**6 boards before trying bigger grids…

### 4. `/akari/index.html` — Is there a GridPaw mobile app? 

- `src/pages/akari/index.astro:65` ｜ content ｜ 97 → 185 字符 ｜ guard83=N
- …works on any device with a browser.**[∅]**… → …works on any device with a browser.**[ The grid is fully responsive — long-press cells to mark them with paw prints on mobile.]**…

### 5. `/akari/index.html` — Are GridPaw Akari puzzles solvable without guessing? 

- `src/pages/akari/index.astro:73` ｜ punctuation_only ｜ 263 → 264 字符 ｜ guard83=Y
- …reveals the next provable placement**[,]** never a guess.… → …reveals the next provable placement**[ —]** never a guess.…

### 6. `/arrows-puzzle-walkthrough/index.html` — How many levels are in Arrows Puzzle Escape? 

- `src/pages/arrows-puzzle-walkthrough/index.astro:21` ｜ punctuation_only ｜ 326 → 326 字符 ｜ guard83=Y
- …The official listing says **[']**thousands of handcrafted levels,' a… → …The official listing says **["]**thousands of handcrafted levels,' a…

### 7. `/binary/index.html` — What is a binary puzzle? 

- `src/pages/binary/index.astro:57` ｜ content ｜ 258 → 260 字符 ｜ guard83=Y
- …A binary puzzle (also **[∅]**known as Takuzu or Binairo) is a lo… → …A binary puzzle (also **[called Ta]**known as Takuzu or Binairo) is a lo…

### 8. `/binary/index.html` — Is Takuzu the same as Binary Puzzle? 

- `src/pages/binary/index.astro:61` ｜ content ｜ 196 → 212 字符 ｜ guard83=Y
- … in 2009, and Takuzu is simply the **[∅]**name most apps and newspapers use f… → … in 2009, and Takuzu is simply the **[Japanese-themed ]**name most apps and newspapers use f…

### 9. `/binary/index.html` — Are binary puzzles good for your brain? 

- `src/pages/binary/index.astro:65` ｜ content ｜ 229 → 234 字符 ｜ guard83=Y
- …anning with a very light rule set, **[∅]**making them an accessible daily bra… → …anning with a very light rule set, **[which ]**making them an accessible daily bra…

### 10. `/binary/index.html` — Is this binary puzzle free? 

- `src/pages/binary/index.astro:69` ｜ content ｜ 171 → 183 字符 ｜ guard83=Y
- …tely free to play in your browser. **[There is n]**o download, no account and no payme… → …tely free to play in your browser. **[N]**o download, no account and no payme…

### 11. `/binary/index.html` — Can I play on mobile? 

- `src/pages/binary/index.astro:73` ｜ content ｜ 136 → 172 字符 ｜ guard83=Y
- …Yes**[∅]** — tap any cell to cycle it between… → …Yes**[.]** — tap any cell to cycle it between…

### 12. `/binary/takuzu/index.html` — Is Takuzu free on GridPaw? 

- `src/pages/binary/takuzu.astro:62` ｜ content ｜ 172 → 217 字符 ｜ guard83=Y
- …download, no account and no payment**[ required.]**… → …download, no account and no payment**[. Pick 6×6, 8×8 or 10×10 and start solving immediately.]**…

### 13. `/binary/takuzu/index.html` — Why is there no 14x14 Takuzu on GridPaw? 

- `src/pages/binary/takuzu.astro:66` ｜ content ｜ 236 → 236 字符 ｜ guard83=Y
- …GridPaw Takuzu comes in 6**[x]**6, 8x8 and 10x10 grids and stops th… → …GridPaw Takuzu comes in 6**[×]**6, 8x8 and 10x10 grids and stops th…

### 14. `/brain-teasers-for-adults/index.html` — What are brain teasers for adults? 

- `src/pages/brain-teasers-for-adults/index.astro:21` ｜ content ｜ 322 → 293 字符 ｜ guard83=Y
- …**[Brain teasers]** for adults are short puzzles, ridd… → …**[Short puzzles, riddles, logic problems, and visual challenges designed to make you think in new ways. They range]** for adults are short puzzles, ridd…

### 15. `/crazy-cleanup/index.html` — How do you play Crazy Cleanup? 

- `src/pages/crazy-cleanup/index.astro:54` ｜ content ｜ 355 → 347 字符 ｜ guard83=Y
- …n buckets one at a time — only two **[buckets ]**are open at once — and empty every … → …n buckets one at a time — only two **[∅]**are open at once — and empty every …

### 16. `/hashi/how-to-play/index.html` — What does Hashiwokakero mean? 

- `src/pages/hashi/how-to-play.astro:49` ｜ content ｜ 190 → 247 字符 ｜ guard83=Y
- … is the original name of the puzzle**[∅]** published by Nikoli in 1990, and i… → … is the original name of the puzzle**[,]** published by Nikoli in 1990, and i…

### 17. `/hashi/how-to-play/index.html` — Is Hashi the same as Bridges? 

- `src/pages/hashi/how-to-play.astro:53` ｜ content ｜ 209 → 212 字符 ｜ guard83=Y
- …Yes. Hashi is **[∅]**a short form of Hashiwokakero, and … → …Yes. Hashi is **[simply ]**a short form of Hashiwokakero, and …

### 18. `/hashi/how-to-play/index.html` — Is Hashi like Sudoku? 

- `src/pages/hashi/how-to-play.astro:57` ｜ content ｜ 256 → 305 字符 ｜ guard83=Y
- …**[∅]**Hashi and Sudoku are different game… → …**[No, ]**Hashi and Sudoku are different game…

### 19. `/hashi/how-to-play/index.html` — Is Hashi free on GridPaw? 

- `src/pages/hashi/how-to-play.astro:61` ｜ content ｜ 210 → 194 字符 ｜ guard83=Y
- …Yes, **[∅]**the GridPaw Hashi puzzle is complet… → …Yes, **[comple]**the GridPaw Hashi puzzle is complet…

### 20. `/hashi/how-to-play/index.html` — Do Hashi puzzles require guessing? 

- `src/pages/hashi/how-to-play.astro:65` ｜ content ｜ 189 → 257 字符 ｜ guard83=Y
- …No. Every **[GridPaw]** puzzle has a unique solution reach… → …No. Every **[well-formed Hashiwokakero]** puzzle has a unique solution reach…

### 21. `/hashi/index.html` — What is a Hashi puzzle? 

- `src/pages/hashi/index.astro:60` ｜ content ｜ 349 → 356 字符 ｜ guard83=Y
- …led Bridges or Hashiwokakero) is a **[∅]**logic puzzle where numbered islands… → …led Bridges or Hashiwokakero) is a **[drawing-based ]**logic puzzle where numbered islands…

### 22. `/hashi/index.html` — Is Hashi the same as Bridges? 

- `src/pages/hashi/index.astro:64` ｜ content ｜ 302 → 184 字符 ｜ guard83=Y
- …Yes**[ —]** Bridges is simply the English name… → …Yes**[.]** Bridges is simply the English name…

### 23. `/hashi/index.html` — Are Hashi puzzles good for your brain? 

- `src/pages/hashi/index.astro:68` ｜ content ｜ 285 → 279 字符 ｜ guard83=Y
- …s. Hashi trains spatial reasoning, **[degre]**e-counting and global planning: eve… → …s. Hashi trains spatial reasoning, **[counting and whol]**e-counting and global planning: eve…

### 24. `/hashi/index.html` — Is this Hashi puzzle free? 

- `src/pages/hashi/index.astro:72` ｜ content ｜ 170 → 193 字符 ｜ guard83=Y
- …tely free to play in your browser. **[There is n]**o download, no account and no payme… → …tely free to play in your browser. **[N]**o download, no account and no payme…

### 25. `/hashi/index.html` — Can I play Hashi on mobile? 

- `src/pages/hashi/index.astro:76` ｜ content ｜ 252 → 215 字符 ｜ guard83=Y
- …Yes**[ — t]**he board is fully touch-friendly. T… → …Yes**[. T]**he board is fully touch-friendly. T…

### 26. `/index.html` — Is GridPaw free? （题面措辞不同，同义）

- `src/pages/index.astro:43` ｜ content ｜ 121 → 123 字符 ｜ guard83=Y
- …Yes! GridPaw is completely free**[ to play at gridpaw.com]**. No download or registration. Work… → …Yes! GridPaw is completely free**[∅]**. No download or registration. Work…

### 27. `/japanese-logic-puzzles/index.html` — What are Japanese logic puzzles? 

- `src/pages/japanese-logic-puzzles/index.astro:21` ｜ content ｜ 435 → 408 字符 ｜ guard83=Y
- …**[∅]**Japanese logic puzzles are grid bas… → …**[Grid based puzzles that can be solved entirely through pure reasoning, with no vocabulary, trivia, or guessing required. Most were popularized by the ]**Japanese logic puzzles are grid bas…

### 28. `/japanese-logic-puzzles/index.html` — What is the Japanese logic puzzle for when you're alone? 

- `src/pages/japanese-logic-puzzles/index.astro:45` ｜ punctuation_only ｜ 361 → 363 字符 ｜ guard83=Y
- … puzzle whose name literally means **[alone]** in Japanese. In Hitori you shade c… → … puzzle whose name literally means **["alone"]** in Japanese. In Hitori you shade c…

### 29. `/kenken/index.html` — What is a KenKen puzzle? 

- `src/pages/kenken/index.astro:56` ｜ content ｜ 328 → 311 字符 ｜ guard83=Y
- …h number from 1 to N exactly once, **[whil]**e numbers inside each thick-outline… → …h number from 1 to N exactly once, **[and th]**e numbers inside each thick-outline…

### 30. `/kenken/index.html` — Is KenKen the same as Calcudoku? 

- `src/pages/kenken/index.astro:60` ｜ content ｜ 199 → 262 字符 ｜ guard83=Y
- …Yes**[ —]** Calcudoku and Mathdoku are the sam… → …Yes**[.]** Calcudoku and Mathdoku are the sam…

### 31. `/kenken/index.html` — Is KenKen harder than Sudoku? 

- `src/pages/kenken/index.astro:64` ｜ content ｜ 252 → 259 字符 ｜ guard83=Y
- …Not necessarily. KenKen **[adds cage arithmetic on to]**p of the same row-and-column rules … → …Not necessarily. KenKen **[kee]**p of the same row-and-column rules …

### 32. `/kenken/index.html` — Is this KenKen puzzle free? 

- `src/pages/kenken/index.astro:68` ｜ content ｜ 172 → 170 字符 ｜ guard83=Y
- …Yes**[,]** the GridPaw KenKen puzzle is compl… → …Yes**[∅]** the GridPaw KenKen puzzle is compl…

### 33. `/kenken/index.html` — Can I play KenKen on mobile? 

- `src/pages/kenken/index.astro:72` ｜ content ｜ 153 → 230 字符 ｜ guard83=Y
- …Yes**[ — t]**he grid works on any device with a … → …Yes**[. T]**he grid works on any device with a …

### 34. `/kenken/index.html` — Are all KenKen puzzles solvable without guessing? 

- `src/pages/kenken/index.astro:76` ｜ content ｜ 240 → 265 字符 ｜ guard83=Y
- …Yes**[∅]**. Every GridPaw KenKen puzzle has e… → …Yes**[ — every GridPaw KenKen puzzle has exactly one solution that can be reached through logic alone]**. Every GridPaw KenKen puzzle has e…

### 35. `/meowdoku-guide/index.html` — Is there a Meowdoku cheat sheet? 

- `src/pages/meowdoku-guide/index.astro:62` ｜ content ｜ 289 → 281 字符 ｜ guard83=Y
- …Yes — the cheat sheet table **[in this guid]**e condenses all six strategies into… → …Yes — the cheat sheet table **[abov]**e condenses all six strategies into…

### 36. `/murder-sudoku/index.html` — Where can I play murder sudoku online? 

- `src/pages/murder-sudoku/index.astro:45` ｜ content ｜ 283 → 285 字符 ｜ guard83=Y
- …red take on the formula is now live**[ — you can]** play murder sudoku free in the bro… → …red take on the formula is now live**[:]** play murder sudoku free in the bro…

### 37. `/pictomino/easy.html` — How do easy levels get harder? 

- `public/pictomino/easy.html:204` ｜ content ｜ 277 → 278 字符 ｜ guard83=Y
- …als with 1, 2, then 3 hidden pieces**[ to teach]** placement and comparison one step … → …als with 1, 2, then 3 hidden pieces**[, teaching]** placement and comparison one step …

### 38. `/pictomino/index.html` — How are Pictomino puzzles made? 

- `public/pictomino/index.html:323` ｜ content ｜ 360 → 348 字符 ｜ guard83=Y
- …up to 12 on super-hard), and shows **[∅]**you extra empty candidate spots tha… → …up to 12 on super-hard), and shows **[extra empt]**you extra empty candidate spots tha…

### 39. `/pictomino/index.html` — How does Pictomino difficulty increase? 

- `public/pictomino/index.html:331` ｜ content ｜ 275 → 265 字符 ｜ guard83=Y
- …mmed pieces, and a per-piece timer **[on medium and above]**. Board size also grows from 3×3 tu… → …mmed pieces, and a per-piece timer **[from Medium up]**. Board size also grows from 3×3 tu…

### 40. `/pt-br/akari/index.html` — O que é Akari (Light Up)? 

- `src/pages/pt-br/akari.astro:20` ｜ content ｜ 312 → 245 字符 ｜ guard83=Y
- …Akari**[∅]**, também conhecido como Light Up, é… → …Akari**[ é um jogo de lógica japonês da Nikoli. Coloque lâmpadas em células brancas para iluminar toda a grade]**, também conhecido como Light Up, é…

### 41. `/pt-br/akari/index.html` — Posso jogar Akari grátis online? 

- `src/pages/pt-br/akari.astro:28` ｜ content ｜ 186 → 156 字符 ｜ guard83=Y
- …átis, sem download e sem cadastro. **[O]** puzzle completo está disponível na… → …átis, sem download e sem cadastro. **[Escolha]** puzzle completo está disponível na…

### 42. `/pt-br/akari/index.html` — Qual a estratégia básica do Akari? 

- `src/pages/pt-br/akari.astro:36` ｜ content ｜ 255 → 204 字符 ｜ guard83=Y
- …Comece pelos números altos: um 4 **[nos quatro lados de uma]** célula preta significa uma lâmpada… → …Comece pelos números altos: um 4 **[exige lâmpadas nos quatro lados. Um 0 já resolve aquela vizinhança. Depois, identifique]** célula preta significa uma lâmpada…

### 43. `/pt-br/akari/index.html` — Akari é mais fácil que Shikaku? 

- `src/pages/pt-br/akari.astro:44` ｜ content ｜ 258 → 178 字符 ｜ guard83=Y
- …s diferentes. Shikaku é mais visual**[ e direto]**; Akari exige pensar em alcance de … → …s diferentes. Shikaku é mais visual**[∅]**; Akari exige pensar em alcance de …

### 44. `/pt-br/index.html` — Os jogos de lógica no GridPaw são gratuitos? 

- `src/pages/pt-br/index.astro:20` ｜ content ｜ 157 → 146 字符 ｜ guard83=Y
- …o. Basta escolher um jogo e começar**[ a resolver]**.… → …o. Basta escolher um jogo e começar**[∅]**.…

### 45. `/pt-br/index.html` — Preciso de uma conta para salvar meu progresso? 

- `src/pages/pt-br/index.astro:44` ｜ content ｜ 141 → 136 字符 ｜ guard83=Y
- …ador, sem necessidade de registro. **[Você pode continuar de onde parou n]**o celular ou no computador.… → …ador, sem necessidade de registro. **[N]**o celular ou no computador.…

### 46. `/pt-br/kakuro/index.html` — O que é Kakuro? 

- `src/pages/pt-br/kakuro.astro:20` ｜ content ｜ 366 → 218 字符 ｜ guard83=Y
- …Kakuro, **[também chamado de]** Somas Cruzadas (Cross Sums), é um … → …Kakuro, **[ou]** Somas Cruzadas (Cross Sums), é um …

### 47. `/pt-br/kakuro/index.html` — Como jogar Kakuro? 

- `src/pages/pt-br/kakuro.astro:28` ｜ content ｜ 353 → 200 字符 ｜ guard83=Y
- …Toque **[em qualquer]** célula branca e depois toque em um… → …Toque **[numa]** célula branca e depois toque em um…

### 48. `/pt-br/kakuro/index.html` — Kakuro é mais difícil que Sudoku? 

- `src/pages/pt-br/kakuro.astro:36` ｜ content ｜ 326 → 161 字符 ｜ guard83=Y
- …É diferente**[, não necessariamente mais difícil]**. Sudoku testa eliminação em linhas… → …É diferente**[∅]**. Sudoku testa eliminação em linhas…

### 49. `/pt-br/kakuro/index.html` — Este jogo de Kakuro é gratuito? （题面措辞不同，同义）

- `src/pages/pt-br/kakuro.astro:44` ｜ content ｜ 185 → 107 字符 ｜ guard83=Y
- …Sim. Todos os níveis, **[o ]**modo névoa e os puzzles diários são… → …Sim. Todos os níveis, **[∅]**modo névoa e os puzzles diários são…

### 50. `/pt-br/kakuro/index.html` — O que é o modo névoa? 

- `src/pages/pt-br/kakuro.astro:52` ｜ content ｜ 291 → 155 字符 ｜ guard83=Y
- …**[O modo névoa é u]**ma inovação do GridPaw para Kakuro … → …**[U]**ma inovação do GridPaw para Kakuro …

### 51. `/pt-br/nonogram/index.html` — O que é Nonogram? 

- `src/pages/pt-br/nonogram.astro:20` ｜ content ｜ 374 → 223 字符 ｜ guard83=Y
- …Nonogram**[ — em português também chamado de nonograma —]**, também conhecido como Picross, Gr… → …Nonogram**[∅]**, também conhecido como Picross, Gr…

### 52. `/pt-br/nonogram/index.html` — Como jogar Nonogram online grátis? 

- `src/pages/pt-br/nonogram.astro:28` ｜ content ｜ 380 → 201 字符 ｜ guard83=Y
- …Toque em uma célula**[ uma vez]** para preenchê-la, de novo para mar… → …Toque em uma célula**[∅]** para preenchê-la, de novo para mar…

### 53. `/pt-br/nonogram/index.html` — Nonogram e Picross são a mesma coisa? 

- `src/pages/pt-br/nonogram.astro:36` ｜ content ｜ 285 → 194 字符 ｜ guard83=Y
- …Sim — Nonogram, Picross, Griddler**[,]** Paint by Numbers e Palavras Cruzad… → …Sim — Nonogram, Picross, Griddler**[ e]** Paint by Numbers e Palavras Cruzad…

### 54. `/pt-br/nonogram/index.html` — O que ganho ao resolver um Nonogram? 

- `src/pages/pt-br/nonogram.astro:44` ｜ content ｜ 266 → 164 字符 ｜ guard83=Y
- …Uma imagem. Cada **[Nonogram]** esconde um desenho nas células pre… → …Uma imagem. Cada **[puzzle]** esconde um desenho nas células pre…

### 55. `/pt-br/nonogram/index.html` — Preciso chutar no Nonogram? 

- `src/pages/pt-br/nonogram.astro:52` ｜ content ｜ 245 → 182 字符 ｜ guard83=Y
- …Não. **[G]**rades bem construídas são solucioná… → …Não. **[Tabulei]**rades bem construídas são solucioná…

### 56. `/pt-br/nurikabe/index.html` — O que é Nurikabe? 

- `src/pages/pt-br/nurikabe.astro:20` ｜ content ｜ 410 → 228 字符 ｜ guard83=Y
- …rikabe é um jogo de lógica japonês **[jogado em uma grade]**. Algumas células contêm números; c… → …rikabe é um jogo de lógica japonês **[onde números são ilhas em um mar]**. Algumas células contêm números; c…

### 57. `/pt-br/nurikabe/index.html` — Como jogar Nurikabe online grátis? 

- `src/pages/pt-br/nurikabe.astro:28` ｜ content ｜ 348 → 150 字符 ｜ guard83=Y
- … desconhecido. Comece pelos números**[: uma pista 1 diz que seus quatro vizinhos são mar,]** e uma pista 2 em um canto fixa uma… → … desconhecido. Comece pelos números**[∅]** e uma pista 2 em um canto fixa uma…

### 58. `/pt-br/nurikabe/index.html` — Quais estratégias resolvem Nurikabe mais rápido? 

- `src/pages/pt-br/nurikabe.astro:36` ｜ content ｜ 396 → 178 字符 ｜ guard83=Y
- …Três hábitos**[ cobrem a maior parte do tabuleiro. Primeiro,]** esgote cada ilha: quando uma ilha … → …Três hábitos**[:]** esgote cada ilha: quando uma ilha …

### 59. `/pt-br/nurikabe/index.html` — Preciso chutar no Nurikabe? 

- `src/pages/pt-br/nurikabe.astro:44` ｜ content ｜ 269 → 180 字符 ｜ guard83=Y
- …Não. Tabuleiros bem construídos **[d]**e Nurikabe são solucionáveis apenas… → …Não. Tabuleiros bem construídos **[s]**e Nurikabe são solucionáveis apenas…

### 60. `/pt-br/nurikabe/index.html` — Nurikabe é mais difícil que Sudoku? 

- `src/pages/pt-br/nurikabe.astro:52` ｜ content ｜ 373 → 201 字符 ｜ guard83=Y
- …diferentes. Nurikabe tem uma curva **[de aprendizado ]**mais íngreme por causa da regra do … → …diferentes. Nurikabe tem uma curva **[∅]**mais íngreme por causa da regra do …

### 61. `/pt-br/pictomino/index.html` — O que é Pictomino? 

- `src/pages/pt-br/pictomino.astro:20` ｜ content ｜ 357 → 185 字符 ｜ guard83=Y
- …no é um jogo de lógica que combina **[elementos de ]**dominó com paint-by-number. Em uma … → …no é um jogo de lógica que combina **[∅]**dominó com paint-by-number. Em uma …

### 62. `/pt-br/pictomino/index.html` — Como jogar Pictomino online grátis? 

- `src/pages/pt-br/pictomino.astro:28` ｜ content ｜ 337 → 155 字符 ｜ guard83=Y
- …istas numéricas. Cada dominó cobre **[exatamente ]**duas células adjacentes, e todos os… → …istas numéricas. Cada dominó cobre **[∅]**duas células adjacentes, e todos os…

### 63. `/pt-br/pictomino/index.html` — Pictomino é igual a Nonogram? 

- `src/pages/pt-br/pictomino.astro:36` ｜ content ｜ 343 → 174 字符 ｜ guard83=Y
- …Não**[, embora ambos revelem imagens]**. No Nonogram você preenche células… → …Não**[∅]**. No Nonogram você preenche células…

### 64. `/pt-br/pictomino/index.html` — Preciso saber jogar dominó para jogar Pictomino? （题面措辞不同，同义）

- `src/pages/pt-br/pictomino.astro:44` ｜ content ｜ 270 → 132 字符 ｜ guard83=Y
- …Não. **[O nome ]**Pictomino vem de 'picture' (imagem)… → …Não. **["]**Pictomino vem de 'picture' (imagem)…

### 65. `/pt-br/pictomino/index.html` — Pictomino é grátis? 

- `src/pages/pt-br/pictomino.astro:52` ｜ content ｜ 229 → 121 字符 ｜ guard83=Y
- …Sim. No GridPaw você joga Pictomino**[ direto no navegador,]** grátis, sem download e sem cadastr… → …Sim. No GridPaw você joga Pictomino**[∅]** grátis, sem download e sem cadastr…

### 66. `/pt-br/shikaku/index.html` — O que é Shikaku? 

- `src/pages/pt-br/shikaku.astro:20` ｜ content ｜ 305 → 281 字符 ｜ guard83=Y
- …e de células que o número indica. T**[odas as regras]** se resolvem com raciocínio puro — … → …e de células que o número indica. T**[udo]** se resolvem com raciocínio puro — …

### 67. `/pt-br/shikaku/index.html` — Posso jogar Shikaku grátis online? 

- `src/pages/pt-br/shikaku.astro:28` ｜ content ｜ 211 → 175 字符 ｜ guard83=Y
- …ad e sem cadastro. O puzzle abaixo **[nesta página já ]**está pronto para jogar, e a versão … → …ad e sem cadastro. O puzzle abaixo **[∅]**está pronto para jogar, e a versão …

### 68. `/pt-br/shikaku/index.html` — Qual estratégia funciona no Shikaku? 

- `src/pages/pt-br/shikaku.astro:36` ｜ content ｜ 278 → 216 字符 ｜ guard83=Y
- …is eles têm poucas formas possíveis**[ de retângulo]**. Preste atenção especial aos númer… → …is eles têm poucas formas possíveis**[∅]**. Preste atenção especial aos númer…

### 69. `/pt-br/shikaku/index.html` — Shikaku é mais difícil que Sudoku? 

- `src/pages/pt-br/shikaku.astro:44` ｜ content ｜ 243 → 168 字符 ｜ guard83=Y
- …Não, a regra é mais simples**[ que a do Sudoku]**. Grades pequenas se resolvem em mi… → …Não, a regra é mais simples**[∅]**. Grades pequenas se resolvem em mi…

### 70. `/slitherlink/index.html` — What is a Slitherlink puzzle? 

- `src/pages/slitherlink/index.astro:62` ｜ content ｜ 371 → 368 字符 ｜ guard83=Y
- …rid lines between dots. A number in**[∅]** a cell tells you exactly how many … → …rid lines between dots. A number in**[side]** a cell tells you exactly how many …

### 71. `/slitherlink/index.html` — Is Slitherlink the same as Loop the Loop? 

- `src/pages/slitherlink/index.astro:66` ｜ content ｜ 228 → 218 字符 ｜ guard83=Y
- …Yes**[ —]** Slitherlink, Slither Link, Loop th… → …Yes**[.]** Slitherlink, Slither Link, Loop th…

### 72. `/slitherlink/index.html` — Are slitherlink puzzles good for your brain? 

- `src/pages/slitherlink/index.astro:70` ｜ content ｜ 305 → 271 字符 ｜ guard83=Y
- …**[A]**bsolutely. Slitherlink trains spati… → …**[Yes. Slitherlink trains spatial reasoning, pattern recognition and careful deduction. Every clue only constrains its own cell, ]**bsolutely. Slitherlink trains spati…

### 73. `/slitherlink/index.html` — Is this Slitherlink puzzle free? 

- `src/pages/slitherlink/index.astro:74` ｜ content ｜ 176 → 197 字符 ｜ guard83=Y
- …tely free to play in your browser. **[There is n]**o download, no account and no payme… → …tely free to play in your browser. **[N]**o download, no account and no payme…

### 74. `/slitherlink/index.html` — Can I play Slitherlink on mobile? 

- `src/pages/slitherlink/index.astro:78` ｜ content ｜ 191 → 188 字符 ｜ guard83=Y
- …Yes**[∅]** — the board scales to any screen a… → …Yes**[.]** — the board scales to any screen a…

### 75. `/slitherlink/index.html` — Are all GridPaw Slitherlink puzzles solvable without guessing? 

- `src/pages/slitherlink/index.astro:82` ｜ content ｜ 262 → 266 字符 ｜ guard83=Y
- …Yes**[∅]**. Every GridPaw Slitherlink puzzle … → …Yes**[ — every GridPaw Slitherlink puzzle has exactly one valid loop that can be reached through pure logic]**. Every GridPaw Slitherlink puzzle …

### 76. `/star-battle/index.html` — What is a Star Battle puzzle? 

- `src/pages/star-battle/index.astro:58` ｜ content ｜ 287 → 277 字符 ｜ guard83=Y
- …must contain exactly 2 stars (3 on **[h]**ard grids), and no two stars may to… → …must contain exactly 2 stars (3 on **[H]**ard grids), and no two stars may to…

### 77. `/star-battle/index.html` — Is Star Battle the same as Two Not Touch? 

- `src/pages/star-battle/index.astro:62` ｜ content ｜ 255 → 300 字符 ｜ guard83=Y
- … Battle is the modern name used by **[mobile ]**apps and puzzle websites. Same rule… → … Battle is the modern name used by **[∅]**apps and puzzle websites. Same rule…

### 78. `/star-battle/index.html` — Are star battle puzzles good for your brain? 

- `src/pages/star-battle/index.astro:66` ｜ content ｜ 233 → 256 字符 ｜ guard83=Y
- … reasoning, planning and pure logic**[∅]** — there is no arithmetic and no vo… → … reasoning, planning and pure logic**[, with no arithmetic and no vocabulary]** — there is no arithmetic and no vo…

### 79. `/star-battle/index.html` — Is this Star Battle puzzle free? 

- `src/pages/star-battle/index.astro:70` ｜ content ｜ 177 → 188 字符 ｜ guard83=Y
- …Yes**[,]** the GridPaw Star Battle puzzle is … → …Yes**[ —]** the GridPaw Star Battle puzzle is …

### 80. `/star-battle/index.html` — Can I play Star Battle on mobile? 

- `src/pages/star-battle/index.astro:74` ｜ content ｜ 210 → 222 字符 ｜ guard83=Y
- …Yes**[ — t]**he grid works on any device with a … → …Yes**[. T]**he grid works on any device with a …

### 81. `/star-battle/index.html` — Are all Star Battle puzzles solvable without guessing? 

- `src/pages/star-battle/index.astro:78` ｜ content ｜ 272 → 269 字符 ｜ guard83=Y
- …Yes**[. E]**very GridPaw Star Battle puzzle has… → …Yes**[ — e]**very GridPaw Star Battle puzzle has…

## 无法只改答案修复（4 条）

这些 JSON-LD 的 `Question.name` 在可见 FAQ 中没有同义对应；只改 `acceptedAnswer.text` 会让问答不匹配。需要改 `question` 或补可见 FAQ，均超出本次授权。

- `/index.html`：Drag to draw rectangles on the grid. Each rectangle must cover exactly the number of cells shown by its number. Every ce…
- `/index.html`：Yes! GridPaw uses the exact same rules as Shikaku, the classic rectangle partition puzzle by Nikoli. GridPaw adds cute c…
- `/index.html`：GridPaw is a free online Shikaku game with cat visuals. Shikaku (also called rectangle partition) is a classic Nikoli pu…
- `/binary/takuzu/index.html`：Yes. The grid is fully responsive: tap any cell to cycle it between 0 and 1 on phones and tablets, or use the keyboard o…

## 题面不同但答案已一致（5 条，无需改）

- `/akari/rules/`：2 条（`How do you play Akari?` / `What do the numbers mean in Akari?`）
- `/murdoku/`：3 条（`Is every murder sudoku case solvable without guessing?` / `Is this murder sudoku game free?` / `Can I play murder sudoku on mobile?`）
