# FAQPage JSON-LD 答案对齐：盘点与补丁草案

基线：`HEAD 514497f9` 的 `dist/`（与源码一致）。本目录只做导出，补丁**未应用**到主仓库，未 build。

> 交付时主仓库 HEAD 已被另一会话推进到 `14f6cbf7`（只改 `STATUS.md` 与 `RULES.md`）；本补丁涉及的 24 个源文件在该区间零变化，`git apply --check` 在当前 HEAD 仍通过。

## 结论

| 分类 | 条数 | 页数 | 处置 |
|---|---:|---:|---|
| 同题、答案不一致 | 78 | 23 | 已入 `changes-final.patch` |
| 题面措辞不同但同义、答案不一致 | 3 | 1 新页（/）+ 2 页已在上表 | 已入 `changes-final.patch`，可拆出 |
| JSON-LD 题面在可见 FAQ 无对应 | 4 | 2（/ 3 条、/binary/takuzu/ 1 条） | 无法只改答案，未入补丁 |
| 题面不同但答案已一致 | 5 | 2（/akari/rules/ 2、/murdoku/ 3） | 无需改 |

补丁总量：**81 条 / 24 页 / 24 文件**，`81 insertions(+), 81 deletions(-)`，每条只改一个 `acceptedAnswer.text` 字符串值。

前期口径「83 条 / 24 页」已用 `seo_guard.ld_answers` 的同一算法在 current dist 上精确复现（见 `guard-baseline-83.json`）。同一口径下，本补丁后预计 **83 → 4**（剩余 4 条即上表「题面无对应」；因未 build，此为按 visible-substring 推算，非渲染实测）。

## 比较口径

- 可见答案：`dist` 页面中 `details` 的 summary 之后答案段 / `.faq-answer` 纯文本；去标签、解码 HTML 实体、折叠空白。
- JSON-LD 答案：页面内 `type="application/ld+json"` 的 `FAQPage.mainEntity[].acceptedAnswer.text`，同法归一。
- 配对：question 文本精确匹配；另用语义/相似度复核了题面不一样但同题的条目（单列，不混入 78 条）。

## 交付物

| 文件 | 内容 |
|---|---|
| `changes-final.patch` | 81 条推荐补丁，24 文件 |
| `changes-strict-78.patch` | 78 条严格同题版（保守方案），23 文件 |
| `inventory.json` | 81 条逐条原文：页面、源文件、行号、旧答案、新答案、分类 |
| `inventory.md` | 同上，含首处分歧摘要与 4 条无法修复项 |
| `guard-baseline-83.json` | 复现的 83 条 guard 基线 |
| `near_matches.json` | 12 条题面不完全一致的配对审计 |
| `proposed/` | 24 个改后源文件（与 `changes-final.patch` 对应） |

## 验证

1. `git apply --check`：`changes-final.patch` 与 `changes-strict-78.patch` 在 `/Users/frank/workspace/gridpaw` 均退出 0。
2. 逆替换证明：对 24 个改后文件逐条把新答案换回旧答案，结果与 `git show HEAD:<file>` **逐字节一致**，证明除答案字符串外没有改动（question、其他 JSON-LD 字段、可见 FAQ、TDK/标题/正文均未变）。
3. Node 求值：24 个文件的 `mainEntity` 数组全部可解析；81/81 条 `acceptedAnswer.text` 与可见答案原文逐字相等；question 名称未变。
4. 独立解析器复核：用另一套 DOM 解析逻辑从 `dist` 的 `details` 块提取答案，78 条同题条目的可见文本与补丁新值 100% 一致（0 例外）。
5. 补丁行审计：81 个 `-` / 81 个 `+` 行全部命中 `text` 键，无其他行变化。

## 守卫说明

`seo_guard.py scope` 对本补丁会报 FAIL，属预期：该工具的骨架比较包含 `<script type="application/ld+json">` 的内容，任何 JSON-LD 值变化都会被判为骨架变化；且 `public/pictomino/index.html` 在它的受保护路径清单里。本补丁是单独批准的 FAQ JSON-LD 例外，不能用该 scope gate；建议用 `git apply --check` + 上述逆替换证明 + 重建后的 dist 对比验收。

## 83 / 24 与任务口径的差异

- guard 的算法是「JSON-LD Answer.text 是否作为子串出现在整页可见文字里」，不是逐题比较。因此：
  - 首页 4 条 JSON-LD 题面（What is GridPaw? 等）可见 FAQ 没有同题对应，guard 计 4；
  - /pt-br/kakuro/、/pt-br/pictomino/、/binary/takuzu/ 的题面措辞与可见 FAQ 不同，guard 各计 1；
  - /akari/ 有 2 条 JSON-LD 答案恰好作为子串出现在页面别处（guard 不计），但其 FAQ 可见答案确实更长/不同，任务口径计入。
- 任务口径去重后为 78 条 / 23 页；把「题面措辞不同但同义」3 条并入后为 81 条 / 24 页，正好覆盖前期 24 页范围。

## 需要拍板

1. **3 条题面措辞不同的条目是否接受**（已含在 `changes-final.patch`）：
   - `/`：`Is GridPaw free?` → 对齐可见 `Is GridPaw free to play?` 的答案；
   - `/pt-br/kakuro/`：`Este jogo de Kakuro é gratuito?` → 对齐 `Este Kakuro é gratuito?`；
   - `/pt-br/pictomino/`：`Preciso saber jogar dominó para jogar Pictomino?` → 对齐 `Preciso saber jogar dominó?`。
   不接受则用 `changes-strict-78.patch`。
2. **4 条无法只改答案的条目**（`/` 3 条、`/binary/takuzu/` 1 条）：要清零 guard 指标，必须改 question 或补可见 FAQ，均超出「只改答案」授权，建议单列下一轮。
3. **public/pictomino 两个静态页**（`/pictomino/` 2 条、`/pictomino/easy.html` 1 条）已纳入本补丁。RULES 把 `public/pictomino/index.html` 列在 em dash 轮次的不动清单；本次是单独批准的 FAQ 例外，若要隔离，可从补丁拆出这 3 条。
