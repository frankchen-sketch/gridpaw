# 人味改写规则（2026-11-02，子 agent 必读）

## 0. 你的角色
你只负责「出方案」：把你负责的那一块页面的 em dash（—，U+2014）改成更自然的标点，产出补丁让主会话审核。你不改仓库里已有的任何文件。

## 1. 范围（只改这些）
- 正文段落里的 em dash：段落文字、列表项、表格里的说明文字、页面可见的辅助说明文字（非标题）。

## 2. 改法（只动标点和连接词）
- 揭晓式「X — Y」→ 句号拆开，或改成冒号。
- 插入式「X — Y — Z」→ 括号（每页 ≤2 处）或逗号。
- 「标签 — 说明」→ 冒号。
- 同页手段轮换：不得连续两句用同一种手段。
- 同一句式在 3 页以上重复的模板句，至少做成 2 种变体（只换连接词或句序，不换事实）。

## 3. 信息守恒（硬约束）
- 不增、不删事实、人名、数字、日期、价格、规则、结论。
- 每个文件的数字多重集必须与改前完全一致。
- 不改实词，只改标点和连接词。

## 4. 不动清单（即使含 em dash 也不动，单独计数上报）
1. `<title>`、`<meta>`（description / og / twitter）
2. H1–H6 标题
3. JSON-LD 与 schema 对象（`<script type="application/ld+json">`、`faqJsonLd`、`"text"`、`"name"`、`"description"`、`"headline"`）
4. FAQ 的问和答（details/summary、`q:`/`a:` 数据、`acceptedAnswer`）。FAQ 里的 em dash 只计数上报，不改。
5. className、CSS、JS 代码与逻辑字符串、变量名
6. 内链 URL、属性值
7. 与游戏 UI 原文对应的引用，例如 `Everything placed — look for mistakes!`（src/pages/index.astro 与 src/pages/solver.astro 必须保持一致），不改，上报
8. 品牌名里的 em dash（「GridPaw — …」推广卡、About 标题）
9. 只含「—」的表格占位格
10. 题面、谜题原文引用
11. `/de/` 德语页
12. 代码注释里的 em dash（不可见，可保留）
13. `public/pictomino/index.html`（另一流处理，不碰）

## 5. 仓库纪律（硬约束）
- 不修改仓库里任何已有文件；不执行 git add / commit / stash / checkout / reset；不 build；不 deploy。
- 只能写到你自己的输出目录：`research/2026-11-02-humanize-plan/<你的流名>/`。
- 改后版放在 `<输出目录>/proposed/<仓库内相对路径>`；补丁存为 `<输出目录>/changes.patch`，必须能在仓库根目录通过 `git apply --check changes.patch`（以当前工作区文件为基准）。
- 工作区里已有前一轮 P1 的未提交改动，并且刚刚回退过一批标题/TDK/JSON-LD/FAQ 行。以当前工作区文件为准，`git status` 显示为 M 的文件不要还原。

## 6. 渲染基线（改前线上版本，只读）
目录：`/Users/frank/.hermes/cache/scratch/p1-verify/before/`
文件名规则：页面路径去掉首尾斜杠，`/` 换成 `__`，再加 `.html`；根目录是 `ROOT.html`。
例：`/akari/blog/` → `akari__blog.html`；`/pictomino/easy.html` → `pictomino__easy.html.html`。
用它看渲染后的文字，再用 grep 在 src/ 与 public/ 里定位源文件。

## 7. 验收（交付前自检，主会话会复核）
- 每个文件：正文 em dash 改前/改后计数（用 Python `str.count('\u2014')`，不用 bash）。
- 每个文件：数字多重集改前后一致。
- `git apply --check changes.patch` 通过。
- 补丁里不含不动清单中的任何行。

## 8. 交付格式（≤400 字）
流名；涉及文件数；正文 em dash 改前→改后；不动清单各类计数；补丁路径与方案路径；5 组改前/改后样例；需要人拍板的事项。
你的自报不会被直接采信，主会话会用同样的方法复核。
