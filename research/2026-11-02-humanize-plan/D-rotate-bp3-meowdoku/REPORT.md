# D 流交付：rotate-rings / brain-puzzle-3 关卡页 / meowdoku 关卡页

只出方案，未改仓库。改后版在 `proposed/`，补丁在 `changes.patch`（仓库根 `git apply --check` 通过）。

## 1. 范围与定位

| 块 | 源文件 | 页面数 | 说明 |
|---|---|---|---|
| rotate-rings | `src/pages/rotate-rings/**` | 12 | 前一轮 P1 已清正文，本轮 **0 处正文 em dash**，无需改动 |
| brain-puzzle-3 关卡页 | `src/pages/brain-puzzle-3-level-*/index.astro` | 54 | 其中 7 页（5/9/26/27/31/39/48）正文在 P1 已清，只剩 TDK/FAQ 的破折号（不动） |
| meowdoku 关卡页 | `src/pages/meowdoku/levels/[level].astro` + `src/data/meowdoku-levels.json` | 10 | 页面由模板 + JSON 数据生成；正文文字全在 `meowdoku-levels.json` |

meowdoku 定位结论：`[level].astro` 是模板，`getStaticPaths()` 读 `src/data/meowdoku-levels.json`；
模板里只有 2 处破折号，都不动（1 处是传给 `MeowdokuPlay` 的 `<h3>` 标题，1 处是 FAQ）。
正文 86 处全在 JSON 的 `solve.anchor / solve.steps / solve.close / regionsGuide / strategic / trap / hints`。

## 2. 正文 em dash 计数（改前 → 改后）

| 块 | 改前 | 改后 |
|---|---|---|
| rotate-rings（12 页） | 0 | 0 |
| brain-puzzle-3 关卡页（54 页） | 188 | **0** |
| meowdoku 数据（10 页正文） | 86 | **0** |
| 合计 | **274** | **0** |

改动文件：47 个 bp3 页面 + 1 个 `meowdoku-levels.json` = 48。

## 3. 不动清单计数（全部保持原样）

| 类别 | bp3 | rotate-rings | meowdoku |
|---|---|---|---|
| `<title>` / `<meta>` / JSON-LD（frontmatter） | 20 | 52 | — |
| FAQ 可见问答应（`<details>`） | 19 | 28 | 1（模板，10 页各 1） |
| 标题类（`<h3>` heading prop） | — | — | 1（模板，10 页各 1） |
| 属性值（`alt="Daily Akari — …"`） | 47 | 0 | — |

说明：bp3 的 20 处 frontmatter 破折号集中在 7 个 P1 回退过的页面；本轮按规则原样保留。
rotate-rings 的 80 处破折号里 52 在 TDK/JSON-LD、28 在 FAQ，正文为 0。

## 4. 改写手段与变体

单点句按语境选：揭晓式改句号或冒号，插入式改括号（每页新增 ≤2 处）或逗号，「标签 — 说明」改冒号。
模板句（跨 3 页以上重复）各做 2 个变体，按文件序号错开分配：

| 模板句 | 变体 A | 变体 B | 用量 |
|---|---|---|---|
| `… most of them drags — follow the step cards …` | 句号拆开 | 分号 | 15 / 11 |
| `… N moves in order — follow the step cards …` | 句号拆开 | 分号 | 4 / 5 |
| `Most moves are drags — if a tap does nothing …` | 句号拆开 | 括号 | 4 / 5 |
| `New grid every midnight — light it up.` | 句号拆开 | 冒号 | 23 / 24 |
| `… drags as often as taps — if a tap …` | 句号拆开 | 冒号 | 19 / 16 |
| `try Akari — our own free browser puzzle …` | 逗号 | 冒号 | 10 / 13 |
| meowdoku `X takes … — N cells.` | 冒号 | 括号 | 交替 |
| meowdoku `no-touch wall — even the diagonal ones — so …` | 括号 | 逗号 | 1 / 2 |
| meowdoku `wiped out in one move — … — same line …` | 冒号 | 句号 | 2 / 1 |

## 5. 改前 / 改后样例

1. bp3 模板（level-3 快速答案）
   - 前：`14 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.`
   - 后：`14 moves in order, most of them drags; follow the step cards below or copy the embedded video move-for-move.`

2. bp3 插入式（level-28）
   - 前：`That builds a habit — find an object, drag it to the ghost — which the level breaks at steps 6, 7 and 9.`
   - 后：`That builds a habit (find an object, drag it to the ghost), which the level breaks at steps 6, 7 and 9.`

3. bp3 揭晓式（level-47）
   - 前：`so the destination is never the problem — finding the source is.`
   - 后：`so the destination is never the problem. Finding the source is.`

4. meowdoku 标签式（Level 1 regionsGuide）
   - 前：`Pink takes R4C1, R5C1, R6C1, R6C2 and R6C3 — 5 cells.`
   - 后：`Pink takes R4C1, R5C1, R6C1, R6C2 and R6C3: 5 cells.`
   - 同页变体：`Lilac takes R3C2, … and R6C4 (7 cells).`

5. meowdoku 插入式（Level 1 close）
   - 前：`Read the set back — R1C5, R2C1, R3C3, R4C6, R5C4, R6C2 — and every row, column and region carries one cat`
   - 后：`Read the set back (R1C5, R2C1, R3C3, R4C6, R5C4, R6C2), and every row, column and region carries one cat`

## 6. 自检（`work/verify.py` 可复跑）

- 正文 em dash：274 → 0；每页新增括号 ≤2。
- 每个文件数字多重集改前/改后完全一致；66 个 astro 页与 JSON 均通过。
- 不动清单整行逐一比对，0 处变化（FAQ/TDK/JSON-LD/`alt`/标题）。
- meowdoku 词表差集：只少了 2 个 `and`、1 个 `so`（句号拆句后连接词自然消失），无新增实词。
- `git apply --check changes.patch` 通过（以当前工作区含 P1 未提交改动为基准）。
- 未触碰仓库既有文件；`git status` 只多出本输出目录。

## 7. 需拍板事项

1. rotate-rings 页 **FAQ 问句骨架重复**（9 页同一句「What score does Rotate Rings Level N give?」），FAQ 属不动清单，本轮只报告未改。可选方案见 `faq-skeleton-rotate-rings.md`。
2. meowdoku 的 `<h3>` 标题 `Meowdoku-Style Level N — Free, No Download` 是标题，未改；如需统一，要单独授权。
3. bp3 的 47 处 `alt="Daily Akari — new grid every midnight"` 属属性值，未改（与同页 `cross-desc` 文案现在会出现「破折号 vs 句号」两种写法，属预期）。
4. 7 个 P1 回退页（5/9/26/27/31/39/48）的 TDK/FAQ 仍有破折号，本轮不动；若要做需要另开一轮。
