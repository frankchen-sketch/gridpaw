# 人味改写规则 v2（2026-11-02，子 agent 必读）

## 0. 你的角色
你只出方案：把你负责范围内正文的 em dash（—，U+2014）改成自然的标点，产出补丁，由主会话审核、建仓、部署。
你不改仓库里已有的任何文件，不 build，不 commit，不 deploy。

## 1. 本轮硬边界：SEO 基础不动
这轮的首要约束是不能动 SEO 基础。以下每一项，改动后在渲染页面上都不能有任何变化（主会话用守卫工具逐项比对，有一项变化即整批打回）：
- `<title>`、meta description、og:*、twitter:*、canonical、hreflang（link rel=alternate）、meta robots
- H1–H6 标题文字
- 全部 JSON-LD（`<script type="application/ld+json">`，含 faqJsonLd 与各 schema 对象）
- FAQ 的问和答（可见块，以及对应的 JSON-LD 答案）
- 内链的 href 与锚文本：`<a>` 里的可见文字全部不动，包括外部目录卡片、推广卡片、目录列表项里的链接文字
- 图片的 src 与 alt
- sitemap、robots、llms 类文件
- 内联 `<script>` / `<style>` 的代码与字符串

「SEO 基础」不包括正文段落：正文段落可以改，但仍须守第 2、3、5 节。

本轮另有一项明确排除：FAQ 的 JSON-LD 答案与可见答案不一致（全站 24 页 83 条，既有问题）。只计数上报，不改。下一轮需单独批准。

## 2. 范围
- 正文段落、列表项、表格里的说明文字、非标题的可见辅助文字里的 em dash。
- 你的文件清单见 `F-uncovered/scope.md`。清单外的文件一律不碰，清单内也要先查 `F-uncovered/P2-占用文件.txt`：列在里面的文件已被另一批落地，不碰。
- 定位提示：渲染文本（`seo_guard.py` 的 `vis()`）会删掉 a/strong/em/span 等行内标签，源码里这些标签常夹在句子中间。按字符串搜不到时，用允许夹带行内标签的宽松匹配再找一次。

## 3. 不动清单（即使含 em dash 也不动，只计数上报）
- 品牌名与推广句：「GridPaw —」，包括推广列表项（例如「Play GridPaw — the main game…」）、About 标题、「Try GridPaw — It's Free」
- 游戏 UI 原文引用，例如 `Everything placed — look for mistakes!`（src/pages/index.astro 与 src/pages/solver.astro 必须保持一致）
- 游戏内按钮与 JS 状态文案，例如 `Sign in — keep them on every device`
- 只含「—」的表格占位格
- 题面、谜题原文引用；`src/data/puzzles.json` 与 `scripts/generate-puzzles.mjs`（本轮整体不动）
- `public/pictomino/index.html`、`/the-loop-*`（cron 生成页）
- 注：`/de/` 德语页已于 2026-11-03 由法老定为纳入修改（见 STATUS F2 交接），不再属于本清单。
- 代码注释里的 em dash（不可见，保留）
- 第 1 节列出的全部 SEO 基础项

## 4. 改法（只动标点和连接词）
- 揭晓式「X — Y」→ 句号拆开，或改成冒号。
- 插入式「X — Y — Z」→ 括号（每页 ≤2 处）或逗号。
- 「标签 — 说明」→ 冒号。
- 同页手段轮换：不得连续两句用同一种手段。
- 同一句式在 3 页以上重复的模板句，做成至少 2 种变体（只换连接词或句序，不换事实）。
- 轮换不能让跨页重复变多。上一轮的教训：把一句拆成两种写法，重复页次不降反升。主会话会用渲染口径复核。

## 5. 信息守恒（硬约束）
- 不增、不删事实、人名、数字、日期、价格、规则、结论。
- 每页数字多重集（渲染后的可见文字）必须与改前完全一致。
- 不改实词，只改标点和连接词。
- JS 代码与字符串一个字符都不动。

## 6. 仓库纪律（硬约束）
- 不修改仓库里任何已有文件；不执行 git add / commit / stash / checkout / reset；不 build；不 deploy。
- 只能写到你自己的输出目录 `research/2026-11-02-humanize-plan/<流名>/`。
- 改后版放在 `<输出目录>/proposed/<仓库内相对路径>`。补丁存为 `<输出目录>/changes-final.patch`，以仓库当前 HEAD 为基准，能在仓库根目录通过 `git apply --check`。
- 工作区可能有其他会话的改动和构建戳（例如 `public/**/gp-build.js`）。以当前文件为准，不还原，不纳入补丁。

## 7. 基线与守卫工具（只读）
- 改前渲染基线：`/Users/frank/.hermes/cache/scratch/plan-build/base/dist/`（HEAD 的构建产物）。页面路径 `/x/` 对应 `x/index.html`。若该目录不存在，就在交付里说明，不要自己 build。
- 守卫工具：`research/2026-11-02-humanize-plan/tools/seo_guard.py`
  - 补丁范围检查（必须 PASS）：`python3 research/2026-11-02-humanize-plan/tools/seo_guard.py scope --patch <你的 changes-final.patch> --repo /Users/frank/workspace/gridpaw`
  - 渲染守恒由主会话在建好的副本上执行，你不需要 build。

## 8. 验收（交付前自检，主会话会复核）
- 每个文件：正文 em dash 改前/改后计数，在渲染后的可见文字上数（`seo_guard.G.vis(html)` 后数 `'\u2014'`），不在源码上数。
- 每个文件：数字多重集改前后一致。
- `seo_guard.py scope` 通过；`git apply --check changes-final.patch` 通过。
- 补丁里不含第 1、3 节列出的任何行。

## 9. 交付格式（≤400 字）
流名；涉及文件数；正文 em dash 改前→改后；不动清单各类计数；补丁路径与方案路径；5 组改前/改后样例；需要人拍板的事项（区分「需要你决定」与「可直接改」）。
你的自报不会被直接采信，主会话会用同一套工具复核。
