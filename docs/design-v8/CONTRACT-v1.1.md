# GridPaw 设计稿契约 v1.1（2026-11-25，取代 v1.0）

> **状态：FROZEN。** v1.0 保持原样冻结（md5 不变，文件未改动），本文件是它的**加法升级**：
> v1.1 = v1.0 全部条款（C1–C31，编号与阈值一字不改）**+ 新增 §J GEO 骨架（C32–C34）**。
> 触发原因（不是 v1.0 写错，是范围扩大）：法老 2026-11-25 决定「GEO 骨架升为合同条款」，
> 此前 GEO 只写在 skill 与 AGENTS.md 里，没有进入验收链。
> 冻结含义：编号、阈值、判据一律不动；再要改，另开 v1.2 并写明为什么本版是错的，不许原地改。
> 冻结清单与 md5 见同目录 `FROZEN.md`。

这份文件是**设计稿层的唯一合同**。规格文件（part1/part2）和 `tokens.css` 都是它的子集；
冲突时以本文件为准。每条都有编号，验收逐条对账，不许跳过。

适用范围：**新交付的设计稿**。存量线上页面不追溯。

---

## A. 内容完整性（本次事故新增，最高优先级）

**C1 · 线上已有区块不许消失。**
改版稿必须包含线上首页的全部内容区块：Hero + 可玩棋盘、游戏图标/卡片区、工具区、Today's Leaderboard、Tips、Walkthroughs、FAQ、Explore 内链、Footer。
做法：先列线上区块清单（带 `id`），再逐个在稿里打勾。**少一个就算不合格**，不管设计多好看。
> 2026-11-25 事故：v8 稿漏了 `#daily-leaderboard`，验收时没人发现。

**C2 · 可玩/可交互区块必须用标记占位，不许用别的游戏冒充。**
凡是生产环境里是真组件的地方（棋盘、solver 输入框、排行榜数据），稿里写成：

```html
<!-- LIVE COMPONENT: ShikakuBoard | 496x564 | src/components/ShikakuBoard.astro -->
<div class="board-slot">…占位外观…</div>
```

- 占位外观必须是**该游戏自己的形态**（Shikaku 画矩形分割，不是数独九宫、不是国际象棋）。
- 没有标记 = 该区块视为“被替换”，不合格。
> 2026-11-25 事故：v8 稿首屏把可玩 Shikaku 画成 `Sudoku 9×9` 静态卡，没人标出来。

**C3 · 新增区块可以，删除区块不行。** 新增要在提交里列出来（名称 + 理由）。

---

## B. 版式结构

**C4 · 屏高 900 的整数倍。** 每屏 `min-height:900px`，内容不溢出；整页总高 = 900 × N。
原因：分屏验收（`screen_audit.py`）和广告轨都按 900 切。

**C5 · 内容列 1120px 居中，两侧各 160px 空。** 那是广告轨（160×600），墙纸、装饰、图片一律不许进。

**C6 · 圆角只用 4 档**：`12px / 8px / 4px / 999px`（`--r-lg/--r-md/--r-sm/--r-full`）。新造圆角值 = 不合格。

**C7 · 禁药丸。** 判据：带背景色 **且** `border-radius ≥ max(12px, 0.45×短边)` 的容器 = 药丸，全页 0 个。
**不是禁卡片** —— 矩形容器（直角或 ≤8px 圆角 + 底色/描边/材质）是“面”，必须有。
50% 圆形（头像、爪印徽章、难度点）不受限；`border-radius:50%` 百分比半径要换算成像素再判。

---

## C. 色彩与明度

**C8 · 全部颜色必须来自 `tokens.css`。** 稿里出现 token 表以外的 hex 或 rgba = 不合格。
> 检查方式：`contract_check.py` 抽 HTML 里所有 `#RRGGBB` 与 `rgba()`，比对 tokens.css 的白名单。

**C9 · 全页中调 ≥8%。** 中调 = V∈[0.30,0.75] 的像素。只有亮（>0.75）和暗（<0.30）两档 = 平淡。
**C10 · 每屏中调 ≥5%。** 整页指标会被密集屏拉高，必须逐屏查。
**C11 · 每屏至少一个实底块 ≥120px 或 ≥8% 屏面积。** 同色线稿小图标不算。
**C12 · 每屏彩色 ≥3%**（HSV S>0.25 且 V>0.20；奶油白这类高亮低饱和不算彩色）。首屏可放宽到 2%。
**C13 · 卡片与底的明度差 ΔV ≥0.06**，或用「1px 描边 + 阴影」替代。ΔV ≤0.03 的卡 = 隐形卡。
**C14 · 色温锁定**：冷色占彩色像素 ≤5%；暖色是主调。

---

## D. 字体与排版

**C15 · 字族 ≤2**（UI 字 + 等宽数字字）。CJK 字体不许排在第一顺位。
**C16 · 字重最大 700。** 800/900 一律不合格（会显得廉价）。
**C17 · `letter-spacing > 0.08em` 只许出现在 ≤14px 的文字上**（眉标、微标签）。大标题加宽字距 = 不合格。
**C18 · 数字用 `.num`**（`font-variant-numeric: tabular-nums`）：分数、计时、关卡号、排名。

---

## E. 文案

**C19 · 真实名单白名单**（其余名字一律不许出现在稿里）：
- 13 游戏：Shikaku, Akari, Kakuro, Nonogram, Nurikabe, Binary Puzzle, Hashi, KenKen, Slitherlink, Star Battle, Murdoku, Meowdoku, Pictomino
- 工具：Nonogram Solver, KenKen Solver, Printable Puzzles
- 攻略：Brain Puzzle 3: Crazy Mind, Rotate Rings, Arrows Puzzle Escape, The Loop
> v8 稿出现 `Sudoku 9×9` —— 不在名单里，C2 + C19 双重违规。

**C20 · 禁占位文案**：`lorem ipsum` / `Write what this site is for` / `your text here` / `placeholder` / `Describe your product` 一律不合格。
**C21 · 英文**，无中文，无 emoji（含 `<title>` 里）。
**C22 · 声明条**：介绍同人攻略的区块必须带「Unofficial fan-made guides — not affiliated with or endorsed by the original publishers.」

---

## F. 资产

**C23 · 只用内联 SVG / CSS 画图。** 0 张 `<img>`、0 个 `<script>`、0 个外链（含 fonts / CDN / data-URI 里的 http）。
**C24 · 尺寸阶**：游戏卡图标 56、内链图标 36、攻略缩略 128（图内 96）、眉标 11–12px。

---

## G. 响应式与可访问性

**C25 · 390 / 768 / 1440 三档无横向溢出**（`scrollWidth ≤ innerWidth`）。判据是结果，下面三条是达成方式，缺一条必溢出：
**C25.1 · 任何尺寸只给上限不给定值**：写 `width:100%;max-width:536px`，不写 `width:536px`。定值会把文档撑到 1136px（v9 首屏实测）。
**C25.2 · 栅格用 `minmax(0,1fr)`，不用裸 `1fr`**：裸 `1fr` 的最小值是最小内容宽度，卡里的 56px 图标会把列顶宽（v9 实测 390 下溢到 414px）。
**C25.3 · 分包片段用的 inline style 类选择器盖不住**：媒体查询里必须用 `[style*="grid-template-columns"]` 这类属性选择器把多列栅格塌成单列，否则手机端仍是 3–4 列。
**C26 · 必须有 `<meta name="viewport" content="width=device-width, initial-scale=1">`**。缺了手机按 980px 渲染。
**C27 · 正文对比度 ≥4.5:1**；`:focus-visible` 描边不能去掉；FAQ 用 `<details>` 实现，关掉 JS 也能看。

---

## H. 拼装（分包时）

**C28 · 分包产出只能是 `<section>` 片段**：无 `<html>/<head>/<body>/<style>`、无 CSS、id 唯一、section 数对得上。
**C29 · 由脚本拼装**（`assemble.py`），不交给 agent。拼缝检查：section 数、标签闭合、重复 id、零外链。
**C30 · 分包不许各自发明视觉语言。** 共享 `tokens.css` 是唯一样式来源；中调手法要在规格里分工（避免两包都用深陶通栏）。

---

## I. 风格指纹（v8 基准，可量化）

**C31 · 交付稿的**色面积指纹**必须落在 v8 区间内。这是「风格」唯一可检查的定义，不看形容词看像素：

| 色 | v8 实测 | 允许区间 |
|---|---|---|
| 沙 `#E8DDD0`（成片底块） | 19.1% | **14–24%** |
| 深陶 `#7C4526`（大色带 / 页脚） | 12.9% | **9–16%** |
| clay `#A85C33`（点缀与主按钮） | 4.2% | **3–6%** |
| 纯白 `#FFFFFF`（卡片） | 6.9% | **≤10%** |

v9 实测：沙 8.6%（差 10.5 个点）、深陶 7.1%、clay 6.8%、纯白 16.0%（超 6 个点）——**这就是「v9 更全但不好看」的数值解释**：白卡翻倍、沙色腰斩，暖底成片的厚度没了。

模型跑分时，各模型都必须过这张表，过不了就不算交付。

---

---

---

## J. GEO 骨架（v1.1 新增，2026-11-25）

改版不许把站点对 AI 检索的可见性改没了。三层各有一条硬条款，验收跑 `gates/geo.mjs`。

**C32 · llms.txt 必须带 `## Key facts` 段**
`public/llms.txt` ≥1200B，且含 `## Key facts` 段；段内每条事实必须能在站内验证（游戏数、题数、是否要账号、是否上传数据）。
`public/llms-full.txt` 由构建脚本生成，不在源码里手改。

**C33 · robots.txt 必须点名允许 AI 检索爬虫 + 声明 Content-Signal**
至少点名：GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、Claude-SearchBot、PerplexityBot、Google-Extended、Applebot-Extended、Bingbot，逐条 `Allow: /`。
并写一行 `Content-Signal: search=yes, ai-input=yes, ai-train=no`。
⚠️ 这行是**对外政策声明**：允许被检索与引用、不允许用于训练。改它等于改政策，必须法老批准，agent 不得自行调整。

**C34 · 结构化数据只许增不许减**
JSON-LD 至少保留现有五类：FAQPage / WebApplication / Organization / Offer / BreadcrumbList。
改版删掉其中任何一类即判不合格（GEO 与富结果都靠它）。

**验收**：`node ~/workspace/seo-station/gates/geo.mjs dist` —— 0 error 才算过；warn 只允许「单语言站 hreflang」这一条。

## 验收执行顺序（缺一步都不算验完）

1. `python3 assemble.py` —— 结构（C28/C29）
2. `python3 contract_check.py <html>` —— 静态条款（C2/C3/C8/C15/C19/C20/C21/C23）
3. `python3 style_fp_check.py <png>` —— 风格指纹（C31），v8 区间
4. 真浏览器 1440 全页截图 → `tone_check.py`（C9/C14）
5. 同图 → `screen_audit.py`（C10/C11/C12）
6. DOM 量胶囊 / 卡底 ΔV / 字距 / 数字字体（C7/C13/C16/C17/C18）
7. 390 与 768 视口量溢出（C25/C26）
8. `node ~/workspace/seo-station/gates/geo.mjs dist` —— GEO（C32/C33/C34），0 error
9. C1 区块清单逐条打勾（人工，对着线上 `index.astro` 数）

**口径纪律**：所有百分比用上面脚本的口径，agent 自报数字只作参考；两者不一致时以脚本为准，并在报告里写明差异原因。
> 2026-11-25 实测：同一稿 s1 墨迹，子 agent 自报 26.9%，脚本 10.0% —— 差在“以该屏众数色为底”还是“以页面奶油色为底”。脚本口径更保守，采信脚本。