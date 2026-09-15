# 301 Redirect Mapping Table

> ## ⚠️ 运行态核对（2026-09-15 实测，务必先读）
>
> **本表记录的是「设计意图」，不是「运行现状」。两者目前不一致。**
>
> | 域名 | 文档声称 | 2026-09-15 实测 |
> |---|---|---|
> | meow-block.com | 17 条规则，17/17 通过 | ✅ **2026-09-15 重测 17/17 全绿**（含 catchall 兜底的 8 条） |
> | spatialreasoninggame.com | 26 条规则 → gridpaw.com/pictomino/ | ⚠️ 跳转生效，但目标是 **2 跳链**（见下） |
> | **meowtrail.org** | **239 条规则 → gridpaw.com/akari/** | ❌ **一条都没生效** |
>
> ### meowtrail.org 详情（严重）
>
> 穷举 28 个路径（含本文件全部映射类型的代表）实测：
>
> - **0 个路径 301 到 gridpaw.com**
> - `/`、`/tips/`、`/glossary/`、`/how-to-play/`、`/light-up-puzzle/` 等**全部自服务 200**
> - 页面 canonical **指向 meowtrail.org 自己**，不是 gridpaw.com
> - Google 仍以独立站收录：URL Inspection 报 `/` 和 `/tips/` 为 `Submitted and indexed`
> - GSC 9/1–9/15：**6 次点击 / 159 次曝光**（与 gridpaw.com 同期 5 点击 / 212 曝光量级相当）
> - 该属性 sitemap 仍提交 **121 条 URL**
> - **内容与 gridpaw.com/akari/ 近重复**，实测标题仅差品牌后缀
>   （`... | MeowTrail` vs `... | GridPaw`；如 glossary 两站标题逐字相同）
>
> **后果**：meowtrail.org 不是「已归权的旧域名」，而是 gridpaw.com/akari/ 的**在线重复竞品**，
> 两个域名的信号互相对冲。本次 gridpaw 索引修复（见 SEO-INDEXING.md）解决的正是被这个问题拖累的发现层。
>
> **未查明**：为什么这 239 条规则不在生效（规则被删？zone 迁移？DNS 指向变更？）。
> 根因需在 CF Dashboard 的 meowtrail.org zone 里核对，文档层无法回答。
>
> ### 佐证：meowtrail 项目自己的文档也没提迁移
>
> `~/workspace/meowtrail/AGENTS.md` 至今仍把该站描述为**独立在营**站：
> 「部署：Cloudflare Pages（域名 meowtrail.org）」「19 个页面」「GSC 已提交 sitemap」，
> **通篇没有一句提到 301 到 gridpaw**。
>
> 即：gridpaw 侧文档声称的「已归权」，在 meowtrail 侧从未落地——**迁移只写在了一边的计划里**。
> 这解释了为什么规则不在生效：很可能根本没建过。
>
> （附带：meowtrail 的 AGENTS.md 第 11 行也是裸 `wrangler pages deploy`，与本项目修掉的
> 同一个问题，漏 IndexNow 提交——属该项目范围，未动。）

> ### 排查指引（2026-09-15 交用户执行，需 CF Dashboard 权限）
>
> **目的**：确认那 239 条规则是「从未创建」还是「创建了但被覆盖/停用」。两种根因修法完全不同。
>
> 1. **看规则是否存在**：CF Dashboard → 账号 → `meowtrail.org` zone → **Rules → Redirect Rules**
>    - 列表为空或不存在 → **从未创建**（与「meowtrail 侧文档无迁移痕迹」一致）。修法：重建整套规则
>    - 有规则但状态为 Disabled → 启用即可
>    - 有且已启用却仍不生效 → 进第 2 步
> 2. **看是否有别的规则先匹配**：同页检查是否有**更早的** catch-all / 动态重定向 / Page Rule
>    抢先把请求留在本域。CF 的重定向按顺序执行，先匹配者胜。
> 3. **对比能用的那个 zone**：`meow-block.com` 的 Redirect Rules 是**实测有效**的对照组
>    （17/17 全绿）。逐项比对两者差异：规则数量、顺序、表达式、目标写法。
> 4. **看 DNS 指向**：zone → DNS → 看 `meowtrail.org` 与 `www` 的记录。
>    - 若指向某个**仍在服务的 CF Pages 项目**，则该站的 `_redirects` / `_worker.js` 会先于
>      zone 级 Redirect Rules 处理请求——而本仓库与 meowtrail 仓库**都没有** `_worker.js`
>      （见 AGENTS.md），所以内容会照常返回 200。
>    - 到 **Workers & Pages** 里看是否还有 `meowtrail` 项目存在且在生产部署。
> 5. **看 zone 归属**：确认 meowtrail.org 与 meow-block.com 在**同一个账号/zone 体系**下。
>    若 meowtrail.org 在别的账号，那处规则库才是要改的地方。
>
> **查清后的两种修法**
> - 从未创建 → 按本文件顶部的映射表重建规则（注意：精确规则须排在 catch-all 之前）
> - 已被 Pages 项目接管 → 二选一：① 在 zone 级 Redirect Rules 前置一条全量 301；
>   ② 停掉那个 Pages 项目的生产部署，让 zone 规则生效
>
> **改完后必须复验**：`curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://meowtrail.org/tips/`
> 期望 `301 https://gridpaw.com/akari/tips/`。别只信 Dashboard 上的「已保存」。
>
> ### spatialreasoninggame.com 的 2 跳链
>
> ```
> spatialreasoninggame.com/easy  --301-->  gridpaw.com/pictomino/easy.html  --308-->  /pictomino/easy
> ```
>
> 301 的目标带 `.html`，而 CF Pages 上 `.html` 形式本身会 308 跳到无扩展名形式，形成 2 跳链。
> 修法：把该 zone 的规则目标改为无 `.html` 形式（`/pictomino/easy`）。
> 影响有限（该域名 90 天 0 点击，已退役），但链条该修。

---
# meowtrail.org -> gridpaw.com/akari/

meowtrail.org/ -> gridpaw.com/akari/
meowtrail.org/daily -> gridpaw.com/akari/daily/
meowtrail.org/play -> gridpaw.com/akari/play/
meowtrail.org/solver -> gridpaw.com/akari/solver/
meowtrail.org/cheats -> gridpaw.com/akari/cheats/
meowtrail.org/community -> gridpaw.com/akari/community/
meowtrail.org/create -> gridpaw.com/akari/create/
meowtrail.org/rules -> gridpaw.com/akari/rules/
meowtrail.org/how-to-play -> gridpaw.com/akari/how-to-play/
meowtrail.org/how-to-solve -> gridpaw.com/akari/how-to-solve/
meowtrail.org/what-is-light-up -> gridpaw.com/akari/what-is-light-up/
meowtrail.org/light-up-puzzle -> gridpaw.com/akari/light-up-puzzle/
meowtrail.org/logic-puzzle -> gridpaw.com/akari/logic-puzzle/
meowtrail.org/cat-logic-puzzle -> gridpaw.com/akari/cat-logic-puzzle/
meowtrail.org/games-like-sudoku -> gridpaw.com/akari/games-like-sudoku/
meowtrail.org/sudoku-with-pictures -> gridpaw.com/akari/sudoku-with-pictures/
meowtrail.org/akari-puzzle -> gridpaw.com/akari/akari-puzzle/
meowtrail.org/akari-puzzle-online -> gridpaw.com/akari/akari-puzzle-online/
meowtrail.org/privacy -> gridpaw.com/akari/privacy/
meowtrail.org/glossary -> gridpaw.com/akari/glossary/
meowtrail.org/levels/easy -> gridpaw.com/akari/levels/easy/
meowtrail.org/levels/medium -> gridpaw.com/akari/levels/medium/
meowtrail.org/levels/hard -> gridpaw.com/akari/levels/hard/
meowtrail.org/puzzle/puzzle-001 -> gridpaw.com/akari/puzzle/puzzle-001/
meowtrail.org/puzzle/puzzle-002 -> gridpaw.com/akari/puzzle/puzzle-002/
meowtrail.org/puzzle/puzzle-003 -> gridpaw.com/akari/puzzle/puzzle-003/
meowtrail.org/puzzle/puzzle-004 -> gridpaw.com/akari/puzzle/puzzle-004/
meowtrail.org/puzzle/puzzle-005 -> gridpaw.com/akari/puzzle/puzzle-005/
meowtrail.org/puzzle/puzzle-006 -> gridpaw.com/akari/puzzle/puzzle-006/
meowtrail.org/puzzle/puzzle-007 -> gridpaw.com/akari/puzzle/puzzle-007/
meowtrail.org/puzzle/puzzle-008 -> gridpaw.com/akari/puzzle/puzzle-008/
meowtrail.org/puzzle/puzzle-009 -> gridpaw.com/akari/puzzle/puzzle-009/
meowtrail.org/puzzle/puzzle-010 -> gridpaw.com/akari/puzzle/puzzle-010/
meowtrail.org/puzzle/puzzle-011 -> gridpaw.com/akari/puzzle/puzzle-011/
meowtrail.org/puzzle/puzzle-012 -> gridpaw.com/akari/puzzle/puzzle-012/
meowtrail.org/puzzle/puzzle-013 -> gridpaw.com/akari/puzzle/puzzle-013/
meowtrail.org/puzzle/puzzle-014 -> gridpaw.com/akari/puzzle/puzzle-014/
meowtrail.org/puzzle/puzzle-015 -> gridpaw.com/akari/puzzle/puzzle-015/
meowtrail.org/puzzle/puzzle-016 -> gridpaw.com/akari/puzzle/puzzle-016/
meowtrail.org/puzzle/puzzle-017 -> gridpaw.com/akari/puzzle/puzzle-017/
meowtrail.org/puzzle/puzzle-018 -> gridpaw.com/akari/puzzle/puzzle-018/
meowtrail.org/puzzle/puzzle-019 -> gridpaw.com/akari/puzzle/puzzle-019/
meowtrail.org/puzzle/puzzle-020 -> gridpaw.com/akari/puzzle/puzzle-020/
meowtrail.org/puzzle/puzzle-021 -> gridpaw.com/akari/puzzle/puzzle-021/
meowtrail.org/puzzle/puzzle-022 -> gridpaw.com/akari/puzzle/puzzle-022/
meowtrail.org/puzzle/puzzle-023 -> gridpaw.com/akari/puzzle/puzzle-023/
meowtrail.org/puzzle/puzzle-024 -> gridpaw.com/akari/puzzle/puzzle-024/
meowtrail.org/puzzle/puzzle-025 -> gridpaw.com/akari/puzzle/puzzle-025/
meowtrail.org/puzzle/puzzle-026 -> gridpaw.com/akari/puzzle/puzzle-026/
meowtrail.org/puzzle/puzzle-027 -> gridpaw.com/akari/puzzle/puzzle-027/
meowtrail.org/puzzle/puzzle-028 -> gridpaw.com/akari/puzzle/puzzle-028/
meowtrail.org/puzzle/puzzle-029 -> gridpaw.com/akari/puzzle/puzzle-029/
meowtrail.org/puzzle/puzzle-030 -> gridpaw.com/akari/puzzle/puzzle-030/
meowtrail.org/puzzle/puzzle-031 -> gridpaw.com/akari/puzzle/puzzle-031/
meowtrail.org/puzzle/puzzle-032 -> gridpaw.com/akari/puzzle/puzzle-032/
meowtrail.org/puzzle/puzzle-033 -> gridpaw.com/akari/puzzle/puzzle-033/
meowtrail.org/puzzle/puzzle-034 -> gridpaw.com/akari/puzzle/puzzle-034/
meowtrail.org/puzzle/puzzle-035 -> gridpaw.com/akari/puzzle/puzzle-035/
meowtrail.org/puzzle/puzzle-036 -> gridpaw.com/akari/puzzle/puzzle-036/
meowtrail.org/puzzle/puzzle-037 -> gridpaw.com/akari/puzzle/puzzle-037/
meowtrail.org/puzzle/puzzle-038 -> gridpaw.com/akari/puzzle/puzzle-038/
meowtrail.org/puzzle/puzzle-039 -> gridpaw.com/akari/puzzle/puzzle-039/
meowtrail.org/puzzle/puzzle-040 -> gridpaw.com/akari/puzzle/puzzle-040/
meowtrail.org/puzzle/puzzle-041 -> gridpaw.com/akari/puzzle/puzzle-041/
meowtrail.org/puzzle/puzzle-042 -> gridpaw.com/akari/puzzle/puzzle-042/
meowtrail.org/puzzle/puzzle-043 -> gridpaw.com/akari/puzzle/puzzle-043/
meowtrail.org/puzzle/puzzle-044 -> gridpaw.com/akari/puzzle/puzzle-044/
meowtrail.org/puzzle/puzzle-045 -> gridpaw.com/akari/puzzle/puzzle-045/
meowtrail.org/puzzle/puzzle-046 -> gridpaw.com/akari/puzzle/puzzle-046/
meowtrail.org/puzzle/puzzle-047 -> gridpaw.com/akari/puzzle/puzzle-047/
meowtrail.org/puzzle/puzzle-048 -> gridpaw.com/akari/puzzle/puzzle-048/
meowtrail.org/puzzle/puzzle-049 -> gridpaw.com/akari/puzzle/puzzle-049/
meowtrail.org/puzzle/puzzle-050 -> gridpaw.com/akari/puzzle/puzzle-050/
meowtrail.org/puzzle/puzzle-051 -> gridpaw.com/akari/puzzle/puzzle-051/
meowtrail.org/puzzle/puzzle-052 -> gridpaw.com/akari/puzzle/puzzle-052/
meowtrail.org/puzzle/puzzle-053 -> gridpaw.com/akari/puzzle/puzzle-053/
meowtrail.org/puzzle/puzzle-054 -> gridpaw.com/akari/puzzle/puzzle-054/
meowtrail.org/puzzle/puzzle-055 -> gridpaw.com/akari/puzzle/puzzle-055/
meowtrail.org/puzzle/puzzle-056 -> gridpaw.com/akari/puzzle/puzzle-056/
meowtrail.org/puzzle/puzzle-057 -> gridpaw.com/akari/puzzle/puzzle-057/
meowtrail.org/puzzle/puzzle-058 -> gridpaw.com/akari/puzzle/puzzle-058/
meowtrail.org/puzzle/puzzle-059 -> gridpaw.com/akari/puzzle/puzzle-059/
meowtrail.org/puzzle/puzzle-060 -> gridpaw.com/akari/puzzle/puzzle-060/
meowtrail.org/puzzle/puzzle-061 -> gridpaw.com/akari/puzzle/puzzle-061/
meowtrail.org/puzzle/puzzle-062 -> gridpaw.com/akari/puzzle/puzzle-062/
meowtrail.org/puzzle/puzzle-063 -> gridpaw.com/akari/puzzle/puzzle-063/
meowtrail.org/puzzle/puzzle-064 -> gridpaw.com/akari/puzzle/puzzle-064/
meowtrail.org/puzzle/puzzle-065 -> gridpaw.com/akari/puzzle/puzzle-065/
meowtrail.org/puzzle/puzzle-066 -> gridpaw.com/akari/puzzle/puzzle-066/
meowtrail.org/puzzle/puzzle-067 -> gridpaw.com/akari/puzzle/puzzle-067/
meowtrail.org/puzzle/puzzle-068 -> gridpaw.com/akari/puzzle/puzzle-068/
meowtrail.org/puzzle/puzzle-069 -> gridpaw.com/akari/puzzle/puzzle-069/
meowtrail.org/puzzle/puzzle-070 -> gridpaw.com/akari/puzzle/puzzle-070/
meowtrail.org/tips/elimination -> gridpaw.com/akari/tips/elimination/
meowtrail.org/tips/number-0 -> gridpaw.com/akari/tips/number-0/
meowtrail.org/tips/number-1 -> gridpaw.com/akari/tips/number-1/
meowtrail.org/tips/number-2 -> gridpaw.com/akari/tips/number-2/
meowtrail.org/tips/number-3 -> gridpaw.com/akari/tips/number-3/
meowtrail.org/tips/number-4 -> gridpaw.com/akari/tips/number-4/
meowtrail.org/blog -> gridpaw.com/akari/blog/
meowtrail.org/blog/akari-puzzle-strategies-beginners -> gridpaw.com/akari/blog/akari-puzzle-strategies-beginners/
meowtrail.org/blog/best-logic-puzzles-brain-training -> gridpaw.com/akari/blog/best-logic-puzzles-brain-training/
meowtrail.org/blog/history-of-akari-puzzle -> gridpaw.com/akari/blog/history-of-akari-puzzle/
meowtrail.org/glossary -> gridpaw.com/akari/glossary/
meowtrail.org/glossary/number-cell -> gridpaw.com/akari/glossary/number-cell/
meowtrail.org/glossary/bulb-cat -> gridpaw.com/akari/glossary/bulb-cat/
meowtrail.org/glossary/light-up-illuminate -> gridpaw.com/akari/glossary/light-up-illuminate/
meowtrail.org/glossary/x-mark -> gridpaw.com/akari/glossary/x-mark/
meowtrail.org/glossary/black-wall -> gridpaw.com/akari/glossary/black-wall/
meowtrail.org/glossary/elimination -> gridpaw.com/akari/glossary/elimination/
meowtrail.org/glossary/constraint-propagation -> gridpaw.com/akari/glossary/constraint-propagation/
meowtrail.org/glossary/backtracking -> gridpaw.com/akari/glossary/backtracking/
meowtrail.org/glossary/akari -> gridpaw.com/akari/glossary/akari/
meowtrail.org/glossary/light-up-puzzle -> gridpaw.com/akari/glossary/light-up-puzzle/
meowtrail.org/glossary/nikoli -> gridpaw.com/akari/glossary/nikoli/
meowtrail.org/glossary/daily-challenge -> gridpaw.com/akari/glossary/daily-challenge/
meowtrail.org/compare/akari-vs-sudoku -> gridpaw.com/akari/compare/akari-vs-sudoku/
meowtrail.org/compare/light-up-vs-kakuro -> gridpaw.com/akari/compare/light-up-vs-kakuro/
meowtrail.org/compare/akari-vs-nonogram -> gridpaw.com/akari/compare/akari-vs-nonogram/
meowtrail.org/compare/logic-puzzle-vs-sudoku -> gridpaw.com/akari/compare/logic-puzzle-vs-sudoku/
meowtrail.org/compare/light-up-vs-slitherlink -> gridpaw.com/akari/compare/light-up-vs-slitherlink/

# meow-block.com -> gridpaw.com
# 实现：CF zone meow-block.com → Rules → Redirect Rules（非 _worker.js，仓库无此文件）
# 2026-09-07 重建并实测 17/17 通过。带尾斜杠变体（/solver/）由 catchall 兜底落首页。

meow-block.com/ -> gridpaw.com/
meow-block.com/daily -> gridpaw.com/
meow-block.com/rules -> gridpaw.com/rules/
meow-block.com/tips -> gridpaw.com/tips/
meow-block.com/cheats -> gridpaw.com/akari/cheats/
meow-block.com/solver -> gridpaw.com/solver/
meow-block.com/community -> gridpaw.com/akari/community/
meow-block.com/how-to-play-shikaku -> gridpaw.com/how-to-play-shikaku/
# ↓ 以下 8 条目标页在 gridpaw 从未建过，由 mb-catchall 兜底 301 到首页
meow-block.com/shikaku-tips -> gridpaw.com/
meow-block.com/shikaku-5x5 -> gridpaw.com/
meow-block.com/shikaku-6x6 -> gridpaw.com/
meow-block.com/shikaku-7x7 -> gridpaw.com/
meow-block.com/shikaku-8x8 -> gridpaw.com/
meow-block.com/shikaku-10x10 -> gridpaw.com/
meow-block.com/vs-shikaku -> gridpaw.com/
meow-block.com/rectangle-partition-guide -> gridpaw.com/
meow-block.com/privacy -> gridpaw.com/akari/privacy/
