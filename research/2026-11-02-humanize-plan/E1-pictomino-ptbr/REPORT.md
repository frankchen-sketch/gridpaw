# E1 流交付：pictomino 子页 + pt-br 页（em dash 人味改写方案）

未改仓库任何已有文件；只写本目录。基线 = 当前工作区文件（`git status` 的 M 不动）。

## 1. 范围与计数

正文 em dash 总量：**226 → 8**（改动 218 处，保留 8 处＝6 处锚点/按钮文案 + 2 处游戏内弹窗 UI）。
全文件 em dash（含不动的）：388 → 170（19 个有改动的文件），另有 `blog/spatial-reasoning-activities-for-kids.html` 2 处全在属性里，无正文可改。

| 文件 | 正文 改前 → 改后 |
|---|---|
| public/pictomino/404.html | 1 → 0 |
| public/pictomino/animal-puzzles.html | 15 → 1（锚点） |
| public/pictomino/cat-breeds.html | 6 → 2（锚点） |
| public/pictomino/community.html | 1 → 0 |
| public/pictomino/daily-puzzle.html | 16 → 1（锚点） |
| public/pictomino/easy.html | 26 → 1（锚点） |
| public/pictomino/game.html | 2 → 2（弹窗 UI，不动） |
| public/pictomino/hard.html | 24 → 1（锚点） |
| public/pictomino/privacy.html | 2 → 0 |
| blog/benefits-of-puzzle-games-for-children.html | 19 → 0 |
| blog/deduction-vs-spatial-reasoning.html | 20 → 0 |
| blog/what-is-spatial-reasoning.html | 32 → 0 |
| src/pages/pt-br/index.astro | 9 → 0 |
| src/pages/pt-br/akari.astro | 12 → 0 |
| src/pages/pt-br/kakuro.astro | 5 → 0 |
| src/pages/pt-br/nonogram.astro | 8 → 0 |
| src/pages/pt-br/nurikabe.astro | 9 → 0 |
| src/pages/pt-br/pictomino.astro | 11 → 0 |
| src/pages/pt-br/shikaku.astro | 8 → 0 |

## 2. 不动清单（含 em dash 但未改）

| 类别 | 处数 |
|---|---|
| title + meta/og/twitter/alt/aria 属性 | 16（title 1 + 属性 15） |
| H1–H6 标题 | 15（h1 6 / h2 6 / h3 3） |
| JSON-LD / schema 对象 | 42 |
| FAQ（details/summary 与 answer 正文） | 50 |
| `<script>`/`<style>`/JS 字符串 | 7 |
| pt-br astro frontmatter（title/description/faqJsonLd 常量） | 32 |
| 游戏内弹窗 UI 文案（game.html） | 2 |
| 锚点/按钮文案（"Try Furriq — Free Cat Breed Identifier" ×4、"🎮 Play the Game — Free"） | 6 |

## 3. 手段分布

- 冒号：标签型（`Step 1:`、`Tutorial 1:`、`**Medium**:`、定义型 bullet）统一用冒号；正文揭晓式也用冒号。
- 句号拆分：正文里「X — Y」递进/解释句改用句号起新句（约 60 处），仅大写首字母。
- 逗号：同位语、插入式改逗号（约 55 处）。
- 括号：插入式每页 ≤2（animal/easy/benefits/deduction/what-is/pt-akari/pt-pictomino 各 2，其余 1）。
- 模板句 "Use Furriq — a free AI-powered cat breed identifier."（7 页）做 3 变体：逗号（cat-breeds / animal / daily / benefits / what-is）、冒号（easy）、括号（hard）。
- pt-br：只改标点，实词零改动；3 处为避免双冒号把原句内冒号改为逗号/句号（nonogram「1 célula」、nurikabe「uma ilha」、what-is「Positional reasoning」引语前）。

## 4. 样例（改前 → 改后）

1. animal-puzzles：`Denser boards — up to 12 hidden pieces, blurred pieces, and countdown timers, with 5 lives — the toughest cat puzzle…` → `Denser boards (up to 12 hidden pieces, blurred pieces, and countdown timers, with 5 lives): the toughest cat puzzle…`
2. easy：`Four simple steps — no reading required, so even pre-readers can jump straight in.` → `Four simple steps. No reading required, so even pre-readers can jump straight in.`
3. what-is-spatial-reasoning：`One of the strongest — and most overlooked — predictors of later achievement.` → `One of the strongest (and most overlooked) predictors of later achievement.`
4. hard：`<strong>Step 2 — Rule out the decoys.</strong>` → `<strong>Step 2: Rule out the decoys.</strong>`
5. pt-br/pictomino：`Quando todos os dominós estão no lugar certo — sem sobreposição e sem espaços vazios — a imagem aparece.` → `…no lugar certo (sem sobreposição e sem espaços vazios), a imagem aparece.`
6. cat-breeds：`Learn their stories below — then solve their puzzles in the free game.` → `Learn their stories below, then solve their puzzles in the free game.`

## 5. 自检

- `git apply --check changes.patch` 通过；把补丁打到原文副本后与 `proposed/` 逐字节一致（19 文件 0 差异）。
- 每文件：`str.count('\u2014')` 改前后计数与本表一致。
- 每文件：数字多重集（`\d+`）改前后完全相同；去标点后小写字母数字串完全相同（未增删任何词，只大小写首字母）。
- 标签序列（`<...>` 全列表）改前后完全相同：未动 script/style/JSON-LD/属性/链接。
- 不动的 em dash 上下文集合改前后一致。
- 补丁里 h1/h2/锚点等含 em dash 的行只以上下文行（前缀空格）出现，无 +/- 改动行。

## 6. 需要人拍板

1. 6 处锚点/按钮文案（"Try Furriq — Free Cat Breed Identifier" ×4、"🎮 Play the Game — Free"）按「UI 文案」保留；若要走 UI 口径可另批。
2. game.html 2 处弹窗（"Remember this cat — you'll rebuild it!" / "Don't give up — your cat believes in you!"）属游戏 UI，保留。
3. 平行列表（Step 1–4、Tutorial 1–3、Medium/Hard/Super Hard、定义型 bullet）统一用冒号，属规则 2「标签 — 说明 → 冒号」的刻意一致，不是手段重复。
4. deduction 一文「the jobs expected to grow fastest, engineering, medicine, programming, design, data analysis, are precisely…」受「不改实词」约束只能用逗号同位语，可读性略逊括号版；若要括号版需允许加第 3 对括号（已超每页 2 处上限）。
