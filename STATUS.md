# GridPaw 现役状态（STATUS.md）

> 项目状态的**唯一入口**。主题细节在各主题文档（见下方索引），此处只放现役结论与待决策。
> 最后核对：2026-09-16（全文件复核：sitemap / 构建 / 索引 / 流量 / IndexNow 均已复测）｜ 分支 `main`
>
> 治理依据：`~/workspace/AGENTS.md`「AGENTS.md 内容治理」——状态/进度进本文件，不进 AGENTS.md。

---

## 一、现役事实（2026-09-15 工具实测）

| 项 | 状态 | 证据 |
|---|---|---|
| 站点 | gridpaw.com 正常 | 68/68 sitemap URL 返回 200（2026-09-16 复测：sitemap-0 取 56 + pictomino 12） |
| 构建 | 通过（132 页） | 2026-09-16 复跑 `pnpm run build` exit 0（8.80s） |
| 部署 | CF Pages 生产已同步 | `c1714195.gridpaw.pages.dev` → apex |
| 远端 | `origin/main` 已同步 | 工作区 0 未提交 |
| GSC | 属性 `sc-domain:gridpaw.com` 接入完成 | sitemap 报 `submitted=68, errors=0`（2026-09-16 复核仍 68/0） |
| GA4 | Property 552793510 可 API | 服务账号 A |
| IndexNow | key 已轮换，新 key 200 | ⚠️ 2026-09-16 实测：新 key `a7f0…668c` 返回 200 ✅；**旧 key 在 apex 上仍返回 200**（与旧记录「已 404」不符）——见 `SEO-INDEXING.md` §5.4 |

**流量基线（2026-09-16 复核）**：GA4 30 天 **257 session**（Direct 198 / Unassigned 34 / Organic Search 17 / **AI Assistant 5** / Referral 2 / Social 1）；GSC 近 28 天 **238 曝光 / 5 点击**，平均排名 14.0。（同窗口 9/3–9/12 为 212 曝光 / 5 点击，与旧记录一致。）

> ⚠️ **GSC 口径坑**：**query 维度**同窗口只返回 74 曝光 / 35 个词 —— 其余被 Google **匿名化过滤**（曝光仍计入总数，但不返回关键词）。**不能用 query 维度算总量，会低估 3 倍。**

---

## 二、待决策 / 未决（有行动价值）

### 1. ✅ meowtrail.org 已归权（2026-09-15 完成，迁移进行中）

**修复前**：称「239 条规则已归权」，实测**一条都没生效**——该域名自服务 200 + 自 canonical +
Google 以独立站收录，sitemap 仍提交 121 条 URL，内容与 gridpaw.com/akari/ 近重复。
**它不是在传权，是在抢词。**

**根因**：zone 里那条归权规则处于「已禁用」。「239 条规则」的说法本身也是错的——实际只有
2 条规则，原那条第 1 条是主机名通配符（不做路径映射）。

**修复**（三条活动规则协同，顺序是硬要求）：
1. 首页精确规则 → `https://gridpaw.com/`（GSC 要求 old homepage → **new homepage**）
2. www → 裸域
3. 保路径动态规则 `concat("https://gridpaw.com/akari", http.request.uri.path)`

**验证**：
- 121/121 映射逐条 301 且目标与文档一致
- 首页 5 种变体（http/https/无斜杠/www）全部正确
- GSC「更改地址」**必需项全部通过，已确认迁移**（`meowtrail.org → gridpaw.com`），
  GSC 显示「迁移进行中」，持续 180 天

**迁移基线（2026-09-15，对比用）**：

| 站 | 近 28 天点击 | 曝光 | sitemap 提交 |
|---|---|---|---|
| meowtrail.org | 9 | **450** | 121 |
| gridpaw.com | 5 | 238 | 68 |

> meowtrail 曝光反而高于 gridpaw——老站优势。归权后这批量应逐步转到 gridpaw。

**纪律**：301 至少留 180 天（有流量继续延长）；旧域名续费满 1 年。

**待清理（CF Dashboard，非阻塞）**：删掉顺序 1 那条**已禁用**的通配符主机名规则
（排最前 + 通配符 —— 按实测的「先匹配赢」语义，一旦误启用会吃掉整个域名，
让上述三条规则全部失效）；并给首页规则改个可读名字。

### 2. ✅ spatialreasoninggame.com 已重构（2026-09-15）

原先 ~26 条静态规则有两个问题：**8 条目标带 `.html` 造成 2 跳链**，且 **5 条映射错误**
（4 篇 blog + `/daily` 落到 pictomino 首页，丢掉对应页相关性）。已改为 2 条动态规则
（例外 + 保路径），**14 条路径全部「跳 1 次」且落点正确，www 变体同样正确**。

⚠️ 关键坑：gridpaw 上 `/pictomino/daily` 是 **404**——`daily` 的对应页叫 `/pictomino/daily-puzzle`，
所以必须有那条例外规则，不能纯靠保路径通配。

配置与映射见 `REDIRECTS.md` 末段。旧静态规则现已被抢在前面，属死重量，可删。

### 3. 索引发现层

**8 条 URL 仍未收录**（6「已发现」+ 2「未知」；2026-09-16 全量 68 条 URL Inspection 实测 = 60 indexed / 6 discovered / 2 unknown，9/15 为 17 条 → **一天转正 9 条**）。

明细（2026-09-16 脚本输出，Request Indexing 目标顺序）：
- **Google 无法识别（2）**：`/akari/compare/akari-vs-nonogram/`、`/akari/compare/light-up-vs-kakuro/`
- **已发现 - 尚未编入索引（6）**：`/akari/glossary/backtracking/`、`/akari/rules/`、`/akari/what-is-light-up/`、`/community/`、`/pictomino/blog/what-is-spatial-reasoning`、`/pictomino/cat-breeds`

cron 每天 09:30 提交 Request Indexing
（配额实测约每轮 1–2 发）。**等 2–4 周跨天数据出来再决定下一批内容写什么。**

### 4. 内容生产纪律

**当前不要再加内容页。** 已有 8 条 URL 未进索引（2026-09-16 实测），先让现役资产被看见。详见 `SEO-INDEXING.md`。

### 5. 第 4 个游戏：数据不支持现在加（2026-09-16 实测）

**结论**：候选词 KD 与现有词同档（44–56），进前十需 45–110 个引用域；而 gridpaw 实测
**DR 0 / 18 引用域 / spam 46** → 现在开新战场打不动。若一定要规划：**只有 `nonogram` 有真体量**
（月搜 43,280，KD 53.7），且必须排在外链/DR 改善之后。

| 候选 | 月搜 | KD | 引用域中值 |
|---|---|---|---|
| nonogram | 43,280 | 53.7 | 100 |
| kakuro | 28,170 | 52.7 | 95 |
| nurikabe | 5,970 | 54.8 | 110 |
| hitori | 5,280 | 50.1 | 85 |
| slitherlink | 4,150 | 55.6 | 110 |
| masyu | 1,280 | 44.8 | 70 |
| yajilin | 520 | 33.9 | 45 |

（对照：现有 `shikaku puzzle` KD 49.5 —— 新游戏并不比现有游戏容易。）

**数据指出的替代路径**（不改游戏、改页面形态）：全站 5 次点击中有 2 次落在 **solver 页**
（`/solver/` pos6.0、`/akari/solver/` pos4.8；query 侧 `shikaku solver` pos1.0）；教程/规则页排名最好
（how-to-solve 9.3 / rules 8.0 / how-to-play 7.8）；`/akari/games-like-sudoku/` 16 曝光但只排 30.6，
query 侧还有 10+ 变体词在 37–74 位。

**另注**：Akari 集群（138 入链）已压过 Shikaku 首页；Pictomino 几乎零曝光。

完整数据与页面级曝光表 → `research/2026-09-16_第四个游戏候选与页面形态机会.md`

### 6. compare 页全部 0 入链（旧孤岛问题的残留）——2026-09-16 实测

**事实**：5 条 `/akari/compare/*` 在站内**没有任何页面链接指向它们**。实测方法：抓 sitemap 全部 68 页，
逐页 grep 目标路径 —— 每条 compare 页的引用数 = **1,且那 1 次是它自己的 canonical 自引用**。

| compare 页 | 站内入链 | GSC 状态 |
|---|---|---|
| `/akari/compare/akari-vs-sudoku/` | 0 | 已收录 |
| `/akari/compare/light-up-vs-slitherlink/` | 0 | 已收录 |
| `/akari/compare/logic-puzzle-vs-sudoku/` | 0 | 已收录 |
| **`/akari/compare/akari-vs-nonogram/`** | 0 | **Google 无法识别**（未收录 8 条之一） |
| **`/akari/compare/light-up-vs-kakuro/`** | 0 | **Google 无法识别**（未收录 8 条之一） |

它们**出链正常**（抽查 akari-vs-sudoku：链向 `/akari/`×4、how-to-play、solver、glossary、games-like-sudoku、daily…），
只是没人链回来 → 是「单向孤岛」，仅靠 sitemap 被发现。

**与 §3.5 同类**：当时修了 4 个旗舰内容页的孤岛，compare 这批没被覆盖。

**建议修法（未执行）**：在 `/akari/` 或 `/akari/glossary/` 加一个 Compare 区块列出这 5 条（参照 §3.5 的修法），
或让 compare 页互链。

**额外收益**：`akari-vs-nonogram` / `light-up-vs-kakuro` 卡位的正是 nonogram / kakuro ——
两个唯一有搜索体量的候选词（见 §二.5）。补内链的成本远低于新做一个游戏。

---

## 三、主题文档索引

| 想了解 | 读 |
|---|---|
| Agent 边界 / 命令 / 稳定约定 | `AGENTS.md` |
| 索引与发现层（sitemap、canonical、Request Indexing、IndexNow key） | `SEO-INDEXING.md` |
| 旧域名 301 映射 + 运行态核对 | `REDIRECTS.md` |
| 分析 ID / 凭据位置 / 待办 | `ASSETS.md` |
| 视觉合同（token 体系） | `STYLE.md` + `STYLE-tail-inventory.md` |
| 页面巡查底账 | `PATROL.md` |
| 视觉合同落地交接（含未做完项） | `HANDOFF-VISUAL-CONTRACT.md` |
| 第 4 个游戏候选词 + 页面形态机会 | `research/2026-09-16_第四个游戏候选与页面形态机会.md` |

---

## 四、下一步（按优先级）

1. **查 meowtrail.org 的 301 为何没生效**（CF Dashboard，本次无法从文档层解决）
2. 修 spatialreasoninggame.com 的 2 跳链
3. 让 cron 继续跑 Request Indexing，2–4 周后复盘索引与曝光
4. 视觉合同阶段：`HANDOFF-VISUAL-CONTRACT.md` 第三节列了欠账（样式收编 + 验证欠账）
