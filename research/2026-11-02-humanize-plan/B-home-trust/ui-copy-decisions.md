# 需要你决定：UI 文案与边界件

这些位置按 RULES 属不动清单或 UI 文案，未写入 `changes.patch`。只列事实与候选，等你拍板。

## A. 纯 UI 文案（可改，但未入补丁）

| 位置 | 现状 | 候选改法 |
|---|---|---|
| `src/pages/index.astro:763` | `Sign in — keep them on every device` | `Sign in: keep them on every device`（冒号）；或 `Sign in. Keep them on every device`（句号）；或改写 `Sign in to keep them on every device`（需授权，超出只动标点） |

说明：`738` 的 onboarding 教练段落按 RULES §1「页面可见的辅助说明文字」已当正文处理并改（`This level starts with a 3. It needs a rectangle...`）。若你判它为纯 UI 文案，可从补丁撤下这一行，不影响其他改动。

## B. JS 字符串里的状态文案（RULES §4.5 禁改，仅上报）

均在 `src/pages/index.astro`，共 15 处：

- `922`：`Two numbers — draw one rectangle for each!`
- `1459` / `1467`：`... hints — saved on this device only`
- `1551`：`Bank hint used — earned from your Daily streak!`
- `1556`：`Hint used up — win today's Daily Challenge to earn +1!`
- `1585`：`Everything placed — look for mistakes!`（游戏 UI 原文，须与 `solver.astro` 一致，规则 §4.7）
- `1597`：`Hint failed — try again.`
- `1768`：`Daily Challenge ready — hit the Daily button...`
- `1878`：`Could not save — try again.`
- `1880`：`Network error — try again.`
- `1895`：`N-day streak — win today's Daily Challenge to keep it!`
- `1954`：`Streak reset — your levels & streak stay on this device only.`
- `1956`：`Sign in — bank your progress`
- `2173`：`Cloud progress restored — Level N`
- `2362`：`Your turn — drag it yourself`

如要统一改，建议单独一轮，并同步 `solver.astro` 的 `Everything placed — look for mistakes!`。

## C. 边界件（已按不动处理，若要改请授权）

| 位置 | 内容 | 理由 |
|---|---|---|
| `index.astro:2454/2464/2474/2484/2494/2504` | 六条等级卡 H3 | 规则 §4.2 标题 |
| `index.astro` 七处 | 图片 alt（`GridPaw Tutorial puzzle — 3×3 Shikaku grid` 等） | 规则 §4.6 属性值 |
| `index.astro:2635` | FAQ 答案 `15 different cat expressions and 8 colors — no two...` | 规则 §4.4 FAQ |
| `index.astro:2676` | `GridPaw — Free online Shikaku puzzle with cats.` | 规则 §4.8 品牌句 |
| `community.astro:227` | `GridPaw — Daily Akari Puzzle` | Chrome 商店产品名，品牌名 |
| `privacy.astro:128` | `Google's Privacy &amp; Terms — partner sites` | 引用 Google 页面标题原文 |

## D. 需要你确认的两个判断

1. 内链列表（`index.astro:2651–2665`）的 `名称 — 说明` 统一改冒号；Nonogram / Nurikabe 两条说明内部已有冒号，改用句号避免双冒号。是否接受句号这两处？
2. 页脚 `GridPaw — Free online...` 按品牌句保留；如果你希望页脚也去 dash，可单独改，但那会与 About/推广卡的品牌写法不一致。
