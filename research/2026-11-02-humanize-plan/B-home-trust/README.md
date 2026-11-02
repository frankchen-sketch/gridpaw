# B 流：首页 + 隐私 / 条款 / 联系 / 社区 —— 人味改写方案

只改标点与连接词，不动事实、数字、价格、规则、结论、实词。补丁以当前工作区为基准，未改仓库任何文件。

## 1. 涉及文件与计数

| 文件 | 源文件 em dash 改前 → 改后 | 在范围（正文）改前 → 改后 | 剩余不动 |
|---|---:|---:|---:|
| `src/pages/index.astro` | 87 → 51 | 36 → 0 | 51 |
| `src/pages/privacy.astro` | 9 → 3 | 6 → 0 | 3 |
| `src/pages/terms/index.astro` | 12 → 1 | 11 → 0 | 1 |
| `src/pages/contact/index.astro` | 10 → 3 | 7 → 0 | 3 |
| `src/pages/community.astro` | 8 → 2 | 6 → 0 | 2 |
| **合计** | **126 → 60** | **66 → 0** | **60** |

注：`index.astro` 线上静态 HTML 可见 em dash 共 52 处（另外 35 处在注释、TDK/JSON-LD，以及 `<script>` 里的 JS 字符串，静态 HTML 不可见；其中状态文案会在交互时显示）。在范围 36 处已全部处理；剩 16 处可见但属不动清单（H3 6、alt 7、FAQ 1、按钮 1、品牌标语 1）。

## 2. 不动清单（剩余 60 处）分类计数

`src/pages/index.astro`（51）
- TDK / JSON-LD：3（`description`、`"name"`、`acceptedAnswer`）
- 代码注释（含不可见 CSS/HTML 注释）：17
- JS 字符串 / 动态状态文案：15
- H3 标题：6（`Tutorial Puzzles — Getting Started` 等）
- 图片 `alt` 属性：7
- FAQ 答案：1（`faq-answer`，15 种表情那句）
- 按钮文案：1（`Sign in — keep them on every device`）
- 品牌 / 页脚标语：1（`GridPaw — Free online Shikaku puzzle with cats.`）

`src/pages/privacy.astro`（3）：TDK 2、外部引用标题 1（Google 页面标题 `Privacy & Terms — partner sites`，引用原文不改）

`src/pages/terms/index.astro`（1）：TDK 1

`src/pages/contact/index.astro`（3）：TDK 2、H2 1（`Before You Write — Quick Answers`）

`src/pages/community.astro`（2）：TDK 1、产品名 1（`GridPaw — Daily Akari Puzzle`，与 Chrome 商店名一致）

## 3. 改法样例（5 组）

1. 等级说明（标签 → 冒号）
   - 改前：`<li><strong>Tutorial (3×3)</strong> — Learn the basics with guided hints (levels 1–3)</li>`
   - 改后：`<li><strong>Tutorial (3×3)</strong>: Learn the basics with guided hints (levels 1–3)</li>`
2. 技巧段（插入语 → 括号）
   - 改前：`Start with prime numbers — their 1×N shape is forced — then work from corners...`
   - 改后：`Start with prime numbers (their 1×N shape is forced), then work from corners...`
3. 内链列表（避免双冒号 → 句号）
   - 改前：`GridPaw Nonogram</a> — Picture logic puzzle: fill the grid, reveal the cat`
   - 改后：`GridPaw Nonogram</a>. Picture logic puzzle: fill the grid, reveal the cat`
4. 条款页插入语（→ 括号）/ 揭晓式（→ 句号）
   - 改前：`beyond these limits — in a classroom, a video, or an article — just ask us.`
   - 改后：`beyond these limits (in a classroom, a video, or an article), just ask us.`
   - 改前：`...privacy policy — these terms are about the rules...`
   - 改后：`...privacy policy. These terms are about the rules...`
5. 隐私表格（标签 → 冒号）/ 社区副标题（→ 句号）
   - 改前：`Keeps you signed in — contains a random ID, no personal information`
   - 改后：`Keeps you signed in: contains a random ID, no personal information`
   - 改前：`Find GridPaw across the web — play, share, and connect.`
   - 改后：`Find GridPaw across the web. Play, share, and connect.`

同页手段已轮换：句号、冒号、括号（每页 ≤2：index 2、terms 2）、逗号、分号。标签—说明的并列列表统一用冒号；列表项内部已有冒号的两条（Nonogram / Nurikabe）改用句号，避免双冒号。

## 4. 需要你决定（未写进补丁）

完整清单见 `ui-copy-decisions.md`，要点如下。

纯 UI 文案（按钮）：
- `src/pages/index.astro:763`：`Sign in — keep them on every device`
  - 候选：`Sign in: keep them on every device` / `Sign in. Keep them on every device` / 改写为 `Sign in to keep them on every device`（改写超出「只动标点」范围，需你授权）。

动态状态文案（在 JS 字符串里，按 RULES §4.5 一律不动；若要改需单独一轮，且 1585 必须与 `solver.astro` 同步）：
- 922 `Two numbers — draw one rectangle for each!`
- 1459 / 1467 `... hints — saved on this device only`
- 1551 `Bank hint used — earned from your Daily streak!`
- 1556 `Hint used up — win today's Daily Challenge to earn +1!`
- 1585 `Everything placed — look for mistakes!`（游戏 UI 原文，规则 §4.7）
- 1597 `Hint failed — try again.`
- 1768 `Daily Challenge ready — hit the Daily button...`
- 1878 `Could not save — try again.`
- 1880 `Network error — try again.`
- 1895 `N-day streak — win today's Daily Challenge to keep it!`
- 1954 `Streak reset — your levels & streak stay on this device only.`
- 1956 `Sign in — bank your progress`
- 2173 `Cloud progress restored — Level N`
- 2362 `Your turn — drag it yourself`

边界件（已按不动处理，若你要改请单独授权）：
- H3 六条等级卡标题、七处图片 alt、FAQ 答案 `2635`、页脚品牌句 `2676`、社区产品名 `227`、隐私页外部引用标题 `128`。
- 首页 `738` 的 onboarding 教练文案按 RULES §1「页面可见的辅助说明文字」处理为正文并已改；若你认为它属纯 UI 文案，可从补丁撤下，改法为句号拆句。

## 5. 验证

- `git apply --check research/2026-11-02-humanize-plan/B-home-trust/changes.patch` → 通过（以当前工作区为基准）。
- 每个文件数字多重集改前/改后一致（正则 `\d+` 计数，Python）。
- 每个文件英文词元序列改前/改后完全一致（仅大小写与标点变化），未增删实词。
- 补丁增删行不含 `<h1>`–`<h6>`、`alt=`、`<title>`、`"description"`、`"headline"`、`"name"`、`acceptedAnswer`、`faq-answer`、`<button>`。
- 未 build、未 commit、未 deploy；仓库内仅新增本输出目录。

## 6. 文件

- 补丁：`research/2026-11-02-humanize-plan/B-home-trust/changes.patch`
- 改后版：`research/2026-11-02-humanize-plan/B-home-trust/proposed/<仓库内相对路径>`
