# rotate-rings FAQ 问句骨架重复（只报告，未改）

范围：`src/pages/rotate-rings/**`（12 页，正文已在 P1 清零破折号，本轮无正文改动）。
FAQ 属 RULES §4 不动清单第 4 项，本轮只统计、不改；同时 `faqJsonLd` 属第 3 项，也不改。

## 1. 现状统计

- 12 页共 **39 条** FAQ（首页 5 条；level-32 4 条；其余 10 页各 3 条）。
- 每个关卡页的 FAQ 都是 3 条（level-32 例外），顺序固定为「怎么打 → 本关某个机制 → 分数」。
- 可见 `<details>` 与 frontmatter `faqJsonLd` **逐字一致**（逐页校验 11/11 通过），任何 FAQ 改动必须两处同步。

重复问句（归一化数字后完全相同）：

| 问句骨架 | 出现次数 | 出现页面 |
|---|---|---|
| `What score does Rotate Rings Level N give?` | **9** | level-2/3/4/5/6/7/8/9/10 |
| `How do you beat Rotate Rings Level N?` | **8** | level-1/2/3/4/5/6/7/32 |
| `What is/are … in Rotate Rings …?`（机制类，句式同、主题不同） | 6 | level-1/8/9/10/32 等 |

位置骨架：9 个页面把 score 问放在最后一条，8 个页面把 `How do you beat…` 放在第一条，
形成肉眼可见的「同一模板换数字」观感。答案首句基本不重复（只有 2 页以 `N,N in our verified run.` 开头），
重复集中在**问句**而非答案。

## 2. 为什么本轮不顺手改

1. RULES §4.4：FAQ 的问和答不动，只计数上报。
2. FAQ 与 `faqJsonLd` 必须一致（Google 结构化数据要求可见内容与标记一致）；改一句要动同一文件的
   frontmatter 与 `<details>` 两处，且 9 页 × 2 处 = 18 个改动点，超出「只动标点」的本轮口径。
3. 重复问句对 FAQ 富结果影响已经很小（Google 自 2023 起仅对政府/健康类站点常规展示 FAQ 富结果），
   真正价值在长尾词覆盖，属于 SEO 决策而非文风决策。

## 3. 可选方案（供主会话拍板）

**A. 不动（默认）**
- 成本 0；FAQ 富结果与长尾覆盖维持现状；「模板感」只出现在 FAQ 折叠区，首屏不可见。
- 适合：本轮只做正文人味、不碰 SEO 面的策略。

**B. 只改可见 summary，不同步 JSON-LD**
- 不推荐：可见问答与结构化数据不一致，属于搜索质量风险。

**C. 骨架重排（可见 + JSON-LD 同步）**
- 9 页 score 问改成 3 类轮换：「What score does Level N give?」/「What does the end screen show on Level N?」/「How many points is Level N worth?」——三句同义、事实不变。
- 8 页 `How do you beat…` 保留 3 页（1/2/3），其余改为「What is the solution to Level N?」「Where does Level N start?」等。
- 成本：约 34 个改动点（9×2 + 5×2 + 校验）；收益：消除最扎眼的 9 页同句。
- 风险：问句措辞变化会改长尾词匹配，需要先看 GSC 里这些问句有没有曝光。

**D. 收敛到首页**
- 关卡页删掉 score 问（3 条→2 条），首页加一条 `What score does each level give?` 汇总表。
- 减少 9 处重复、页面更短；代价是丢掉 9 个「level N score」长尾入口，且要同步删 JSON-LD 条目。

**E. 最小干预：只改答案首句**
- 不动问句，只把 2 页重复的 `N,N in our verified run.` 开头改掉。
- 成本最低，但对「问句骨架重复」这个观感问题基本无效。

## 4. 建议

若本轮只做正文：选 **A**，把 FAQ 骨架单列成下一轮「FAQ 去模板化」任务，先查 GSC 这 17 条问句的曝光再决定 C 或 D。
若一定要在本轮消除观感：选 **C**，并且只改 score 那 9 条（收益最高、风险最小），`How do you beat…` 保留。
