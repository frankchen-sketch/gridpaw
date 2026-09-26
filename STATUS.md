# GridPaw 现役状态（STATUS.md）

> 项目状态的**唯一入口**。主题细节在各主题文档（见下方索引），此处只放现役结论与待决策。
> 最后核对：2026-09-19（TDK 优化轮部署 + 收录口径对账决策；sitemap / 构建 / 部署 / 内链均已实测）｜ 分支 `main`
>
> 治理依据：`~/workspace/AGENTS.md`「AGENTS.md 内容治理」——状态/进度进本文件，不进 AGENTS.md。
>
> **最新作战地图：`research/2026-09-24_横向拓展前置验证_GamePix供给侧与DR差距.md`**（0924：横向拓展前置验证通过+供给侧实测补全；P0 待办收敛为 3 条：注册 publisher 账号 / 定游戏页形态 / 外链换质；Game Over 降级已结案）
>
> **Kakuro 线（2026-09-25）**：引擎+demo 全功能交付并入库（雾分块/爪窥/付费墙 mock/键盘三态/答案 hint/clue 高亮/死局检测，selftest ALL PASS）；`/kakuro/` 已从跳转页升级为正式 SEO 页（推关 11 关+无限每日关+FAQ/WebApplication schema+内链，进度存 localStorage）。下一步：部署 + GSC 提交收录 + IndexNow。

> **Nonogram 线（2026-09-26）**：第 4 个游戏立项（选型依据：nonogram 43,280/月为唯一真体量候选词，onlinenonograms DR 10 证明行为驱动可上榜；差异化=每关揭猫像素画）。引擎已交付（lineOptions 枚举→lineSolve 纯逻辑传播→回溯计数唯一性；Easy/Medium 生成强制纯逻辑可解；猫 pattern ×4 教学；生成 1-2ms/盘，selftest ALL PASS）。正式页 `/nonogram/` + GameNav 五游戏 + llms.txt 已入库（commit 0543b79）。demo（669 行，子 agent 产出+浏览器实测验收）已部署上线（deployment aef3dcb7，commit 5eda059），线上 /nonogram/、demo、引擎全 200，IndexNow 已推。

> **Nurikabe 线（2026-09-26 收官）**：第 5 个游戏，**已部署上线**（deployment `fb570629`）。全链：引擎（sea-snake 构造 + repairToUnique；档位 easy 5×5 / medium 7×7 / hard 9×9，selftest 16/16）→ demo（拟真皮肤：深海蓝≈海 + 沙滩岛 + 线索格小岛图案；首访五段式引导卡带真解迷你盘；教学爬梯 2×2→3×3→4×4→5×5；血量机制 3 血/关、双向纠错+纠正格锁定、血尽换盘、教学 ∞）→ 正式页 + GameNav 六游戏 + llms.txt + footer 互链。**线上验证全绿**（/nurikabe/ 200、demo v=3、引擎 16479B）、IndexNow 200、GSC sitemap 204（key=furriq A key，auto-detect 会错抓）、Request Indexing /nurikabe/ 已提交（「已请求编入索引」）。关键坑已沉淀：引擎引用 ?v=N 缓存戳（demo+worker 两处）、rule-(d) need=0 clue 格豁免（2×2 全灭根因）。

> **分享+PWA 线（2026-09-26 上线，commit `e6c6a49` 收官）**：Kakuro/Nonogram/Nurikabe 三 demo 的 winOverlay 三按钮分享 + `manifest.webmanifest`（SEOHead 全站挂 link）。迭代四版后定稿：① 文案挑衅风、零猫 emoji，每条挂 GridPaw 品牌名+游戏机制梗；② 胜利卡顶部/页面 h1 用 `/assets/logo.png` 四色猫爪网格（favicon.svg 只是米色标签页图标，勿再混用）；③ Solved! 下加 game-tag 行（游戏名 · Level N / Daily / Tutorial）；④ **点 𝕏/Reddit 先弹「Your board」棋盘卡**：canvas 实时渲染胜利棋盘（logo+标题+棋盘+域名），卡内 Copy Image / Save / Post / Close，新事件 `share_card` / `share_card_copy`。Playwright 全程回归（分享 18/18 → 棋盘卡 12/12）。抓图脚本与坑沉淀在 `~/.hermes/cache/scratch/test-board-card.py` 及 webapp-testing skill。**待观察**：`share_card*` vs 直接发帖的比例，验证棋盘图对分享转化的提升。

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
| IndexNow | key 已轮换，新 key 200 | ✅ 2026-09-16 已闭环：旧 key **源站 404**；apex 上因 **CF Pages asset 层边缘缓存**曾间歇 200，**Purge 无效**，最终用 **Redirect Rule**（`/390e…txt` → 301 `/`）解决 —— 实测 30/30 全 301（AMS/LHR/FRA）。详见 `SEO-INDEXING.md` §5.4 |

**流量基线（2026-09-17 复核，口径已修正）**：GA4 服务端数据**从 2026-09-04 起才有**（commit `3003a3f` 那天才把埋点换成本站专属衡量 ID `G-4FWP61DJCC`）——所谓「30 天」实际只有 14 天。旧记录「30 天 257 session」即由此误读而来。

| 窗口（hostName=`gridpaw.com`） | session | users | PV |
|---|---|---|---|
| 09-04~09-16（全部历史，14 天） | **231** | 198 | 350 |
| 09-16 单日 | 4 | 4 | 3 |
| 09-17 单日（当日未完整） | 3 | 3 | 5 |

分渠道（14 天）：**Direct 183 / Unassigned 31 / Organic Search 17 / AI Assistant 5 / Referral 2 / Organic Social 1**。无品牌新站 Direct 占七成，其中**约 50% 会话来自云机房 IP**（Council Bluffs、Boardman、Ashburn、San Jose、Glenview、Amsterdam…），特征是时长 0–31s、人均 1.2–1.5 页、零 referrer —— 机器人/爬虫，不是用户。**Clarity 独立佐证（近 3 天）：真人会话 27 / 机器人 52。**

GSC 近 28 天（08-20~09-16）**267 曝光 / 5 点击**，均位 13.8。按设备拆：**桌面 180 曝光 / 2 点击 / 均位 17.5**；**移动 87 曝光 / 3 点击 / 均位 6.1**。曝光在涨（日均 6 → 30），但涨的主要是桌面均位 25–90 的长尾。

> ️ **CTR 不能横向直读（2026-09-17 分层实测修正，推翻了本文件此前「瓶颈是 CTR 0.67%」的结论）**：总体 CTR 低是**曝光结构**造成的假象 —— **位置 ≤10 时 CTR = 6.7%**（30 曝光 / 2 点击），位置 >10 的 50 曝光 0 点击。query 维度里 **62% 的曝光落在位置 >10**。所以别去改标题/描述，先把曝光按 `position` 分层再判断。
> ⚠️ **GSC 侧同样有自动化污染（与 GA4 机房 IP 是同一批流量）**：`nld` 桌面 22 曝光中 **16 条来自单一查询 `akari or step back`**（位置稳定 10–11、跨 8 天、0 点击、只落一页）—— GA4 同窗口 Netherlands/Amsterdam **恰好 17 会话、1 会话 1 用户**，两边对得上，是 rank-tracker 轮询。另有 `%site.nikoli.co.jp akari rules light up` 这类带 `%` 编码残留的查询（人不会这么打字）。**读 GSC 也要按 country/query 剔工具流量。**
> **真正的机会靶子只有 3 个**（桌面均位 8–11 的边缘页）：`/akari/how-to-solve/`（位 10.5）、`/akari/how-to-play/`（位 9.0）、首页 `/`（`shikaku online` 位 8.5/10.2）。位置 >20 的桌面长尾（`logic puzzle online` 90.5、`logic grid puzzles online` 74.3、`sudoku related games` 55.5）不要投预算。

> ⚠️ **GA4 拉数口径（强制）**：所有 GA4 查询必须加 `hostName` 过滤（只算 `gridpaw.com`）。否则 `localhost` / `*.pages.dev` 预览域 / 局域网 IP 的自测流量会混进来 —— 实测污染 28 会话 ≈ 9%（含 `192.168.31.52` LAN 与 `/?_gsaptest=` 测试 URL）。已落到三处：`public/analytics.js` + `SEOHead.astro`（dev/预览域从 2026-09-17 起不再上报）、`~/.hermes/scripts/gridpaw_ga4_dump.py`、cron-dashboard `build_metrics.py`（`host_filter`）。
>
> ⚠️ **别用周环比**：单日 3–4 会话的体量下，周环比是纯噪声。09-04~09-09 的「高位」是上线期一次性访问 + 提交动作招来的爬虫扫描，不是基线。看 **28 天滚动 + 分渠道**，并单独剔除机房 IP。

> ⚠️ **GSC 口径坑**：**query 维度**同窗口只返回部分曝光 / 词 —— 其余被 Google **匿名化过滤**（曝光仍计入总数，但不返回关键词）。**不能用 query 维度算总量，会严重低估。**

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
**2026-09-19 复查**：sitemap 口径基本清零——68 条中 67 已收录，仅 `/community/` 在提交流程中（当天已 Request Indexing，0 撞配额）。

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

**已修（2026-09-16，部署 `1d554e81`）**：

- `/akari/` 新增 `Compare Puzzles` 区块，列出全部 5 条（`src/pages/akari/index.astro`）
- 每条 compare 页底部新增 `Other Puzzle Comparisons` 互链 4 条（`src/pages/akari/compare/[slug].astro`）
- 线上实测：`/akari/` 出现 5 条 compare 链接；每条 compare 页出现 5 条（4 条互链 + 自身 canonical）
- **待验证**：`akari-vs-nonogram` / `light-up-vs-kakuro` 的收录状态 —— 等 cron（每天 09:30）复跑 GSC URL Inspection

**额外收益**：`akari-vs-nonogram` / `light-up-vs-kakuro` 卡位的正是 nonogram / kakuro ——
两个唯一有搜索体量的候选词（见 §二.5）。补内链的成本远低于新做一个游戏。

### 7. 9/19 TDK 优化轮 + 收录口径对账（与哥飞会商定版）

**已上线（commit `6e38f0a` + 内链补丁，均部署 + IndexNow 200，线上 curl 验证）**：

- 首页 TDK：Title `Shikaku Online: Play Free Cat Logic Puzzles | GridPaw`（53）；Desc 重写（130 字符，砍 free×2 / 品牌重复）
- 内页 6 页 Title 全部 ≤55：`how-to-solve` / `akari solver` / `levels/hard` / `how-to-play` / `tips` / `akari/rules`；`akari/` Desc 砍「Play GridPaw」品牌当游戏名的写法
- 内链：`how-to-solve` ↔ `how-to-play` 正文互链（与 §二.6 compare 孤岛修法同类）
- ⚠️ **组件坑**：`SEOHead` 会给缺品牌名的 Title 自动补 ` | GridPaw`——源码 47 字符可渲染成 57。改 Title 必须验证 `dist/` 渲染值，不能只看源码字面量

**收录口径矛盾（重大，未决）**：GSC Pages 报告「已收录 16 / 已发现不抓取 27」与 URL Inspection API sitemap 口径「67/68 已收录」严重打架。Pages 报告覆盖谷歌自行发现的全部 URL（含 sitemap 外杂页），sitemap 口径才是主动声明的有效资产。**「下架 26 页」已撤回**（不可逆 + 会误伤 `bulb cat` pos8、`daily akari` pos6 等正在出曝光的活页）。待办：从 Pages 报告导出那 27 条 URL（**需 GSC UI，API 不出清单**）与 68 条 sitemap 求交集，先定性再决定动谁。

**how-to-solve 观察期**：新版 Title 9/19 晚才上线，哥飞引用的「30 曝光 0 点击」全部是旧 Title 数据——且其中 17 曝光是 `akari or step back` rank-tracker 工具流量（见 §一），真人曝光仅约 13。**两周内不再叠改 Title**；10/3 复查（cron 已设），仍 0 真人点击则上备选文案 `How to Solve Akari: 5 Techniques That Work | GridPaw`（53 字符；正文 Step 1~5 五个技法已核实对齐，数字钩子是诚实承诺）。

### 8. 低 KD 双词对齐轮（2026-09-20 执行，观察期至 10/4）

SERP 盘面调研（`research/2026-09-20_要打的词SERP竞品盘面.md`）后，对两个最低 KD 词做 on-page 对齐，**已部署（commit `686cf51`）+ IndexNow 200 + 线上 curl 复核通过**：

- **`akari online`（KD 18.2，竞品 dailyakari DR16 / akari.store DR8）→ 落页 `/akari/`**：H1 改为 `Play Akari Online Free — Light Up Puzzle Game`（目标词从拆开变连续）；首段 + FAQ 各加 1 处 `play akari online`；Title 不动（已含词且排名在动）
- **`japanese logic puzzles`（KD 14，内容真空，reddit 帖补位）→ 落页 `/japanese-logic-puzzles/`**：Title 转 play 意图 `Japanese Logic Puzzles: Play the 7 Classics Free`（渲染 57 字符）；H1 加 `Where to Play Them Free`；iframe Shikaku 试玩块上移至 Sudoku 段后（intent 前置）
- **明确不做**：不碰 `shikaku online` 落页（首页 9/19 观察期）、不开新页、不碰 `number grid puzzle`（KD 63.8 不投）
- ⚠️ Title 里的「7 Classics」是内容级硬编码——若文章游戏列表扩展，Title 需同步改
- **复查日 10/4**：看 GSC `akari online` / `japanese logic puzzles` 两个 query 的位置变化；外链侧引用域缺口比预算（20/15）还小的话下一轮力度下调

**GSC 顶部「您的另外一个网站正在迁移到此网站」横幅**：meowtrail→gridpaw 迁移的正常提示，已知现象，忽略。

---

## 三、主题文档索引

| 想了解 | 读 |
|---|---|
| Agent 边界 / 命令 / 稳定约定 | `AGENTS.md` |
| 索引与发现层（sitemap、canonical、Request Indexing、IndexNow key） | `SEO-INDEXING.md` |
| 旧域名 301 映射 + 运行态核对 | `REDIRECTS.md` |
| 分析 ID / 凭据位置 / 待办 | `ASSETS.md` |
| **自建漏斗 + 版本归因（实施全文档）** | `GRIDPAW-FUNNEL-VERSIONING.md` |
| 视觉合同（token 体系） | `STYLE.md` + `STYLE-tail-inventory.md` |
| 页面巡查底账 | `PATROL.md` |
| 视觉合同落地交接（含未做完项） | `HANDOFF-VISUAL-CONTRACT.md` |
| 第 4 个游戏候选词 + 页面形态机会 | `research/2026-09-16_第四个游戏候选与页面形态机会.md` |

---

## 四、下一步（按优先级）

1. **对账 Pages 报告 27 条「已发现不抓取」URL × sitemap 68 条**（GSC UI 导出，API 不出清单）→ 定性后再决定是否 404，禁止在交集弄清前下架（§二.7）
2. **10/3 复查 how-to-solve 新 Title CTR**（one-shot cron 已设，读数须剔除 `akari or step back` 工具流量），仍 0 真人点击则上备选文案（§二.7）
3. 让 cron 继续跑 Request Indexing 至 repeat 用完（9/30 前后），2–4 周后复盘索引与曝光
4. 视觉合同阶段：`HANDOFF-VISUAL-CONTRACT.md` 第三节列了欠账（样式收编 + 验证欠账）

---

## 五、自建漏斗 + 版本归因（2026-09-18 P0+P1+P2 已上线）

照 `GRIDPAW-FUNNEL-VERSIONING.md` 全量落地（furriq 方案跨站适配）。现役事实：

| 项 | 状态 | 证据（2026-09-18 实测） |
|---|---|---|
| build id 注入 | ✅ | `pnpm run build` 输出 `[build-info] 299fa4c-dirty …`；`grep 299fa4c-dirty dist/index.html` 命中 |
| D1 表 | ✅ | remote meowtrail-users：`gp_event` / `gp_build` 存在（`sqlite_master` 实查） |
| ingest 端点 | ✅ | 生产 `POST /api/events` → 200 + `Set-Cookie: gp_gid=…`；白名单外事件 400 |
| 归因端点 | ✅ | 无 token 403；带 token 返回 stage/signin/traffic/lastvisit 四段 |
| admin 页 | ✅ | `/admin/funnel/` 200 + `X-Robots-Tag: noindex`（`public/_headers`）+ robots meta；**未进 sitemap**（`sitemap-0.xml` 实查无 admin） |
| 生产数据 | ✅ | D1 实查：`visit` 落库带 `build_id='299fa4c-dirty'`；`gp_build` 有该行 |
| 看板接入 | ✅ | cron-dashboard `CRON_DASH_SAMPLES=1` 全链路 + 真实采集跑通；`buildfunnel = {furriq, gridpaw}` 双站；三层对账一致（D1 直查 = metrics.db = dashboard_data.json） |
| admin token | 本地 `.funnel-admin-token`（gitignore）+ Pages secret `FUNNEL_ADMIN_TOKEN`；开关 `FUNNEL_EVENT_INGESTION_ENABLED` 只在 wrangler.toml [vars] 一处 |

- 漏斗阶段：visit → start(game_start) → move(first_move) → solve(level_up) → hint(hint_click) → share(share_reddit+share_copy) → signin(daily_progress.user_id)
- 归因口径：按访客**首次到访**版本（rn=1），回访不重归因；live = 24h 内有 visit
- **读表纪律**（实施文档 §6.7）：单版本 visit 两位数以内 = 噪声，禁止下改版结论；先查 bot 比例（`json_extract(metadata,'$.isLikelyBot')`，机房流量约半数）；发布后 CDN 旧 HTML 继续报旧 build id 是预期
- 未做（有意）：pictomino 子站接入（P1 可选项，`public/pictomino/*.html` 需 `build-id.js` + analytics.js 改造）；CF Access 替代 token；identity 合并表

## 2026-09-23 首页布局方案 A 上线（含一次错误回退的当轮恢复）

**上线内容**（方案 A，法老批准，deploy `71b0e4f4` → 修复性重部署 `8fb09561`）：
- ① Game Over 弹窗 h2 → div（不再污染页面大纲）
- ② 空排行榜位 → Today's Challenge 卡（`#challengeCard`，真实上榜数据时 JS 自动切回 `#dailyLeaderboardPanel`）
- ③ What Players Say 整段虚构评价（6 条假五星，2 条与站内事实自相矛盾）→ GridPaw in Numbers 真实数据块（∞/3/0/15，全部站内可验证）
- ④ Tips 双 section 合并 + /tips/ 链接（Common Mistakes 折入摘要段）

**事故与恢复**：子 agent 回报的 changed_hunks 实为「工作区 vs HEAD」整段 diff（把 9/21 Clarity 漏斗改造、9/21 真机回归修复等已部署未提交工作误报为自己的产出）。主 agent 用 HEAD 做基线比对、未先查本文件历史轮次，误判「玩法类超纲」并回退（deploy `71b0e4f4` 一度丢失 hint 三层/抖动/徽章帮助），法老拍板回退的前提因此失效。当轮发现（STATUS §9/21 记录佐证）后十处全部逐字恢复并重部署（`8fb09561`），线上 8/8 断言通过。
**教训（已录入 skill）**：判定「子 agent 超纲」前必须先查本文件历史轮次——**本仓常态化 deploy-but-uncommitted，HEAD ≠ 最近一次上线的代码**；diff 基线错误会把既有功能误判为新改动。

**遗留**：`.astro/` 两个缓存文件已 `git rm --cached` + gitignore（未 commit，随下次提交入库）；`pnpm add -D wrangler` 待办（本机无全局 wrangler，deploy 脚本会 command not found，临时用 `npx -y wrangler`）。

## 2026-09-23 深夜 新手引导上线（deploy `9129581f` → `0a8d7843` → `fc2f02f5` → 真棋盘重构 `83a400d3`→`f4ce0cae`→`840eab44`）

Clarity 实锤（30min 0 次成功拖拽、徽章狂点 17 次/分）→ 3 步教练引导（v6 预览经法老 5 轮反馈迭代后拍板）：
- **流程**：①聚光数字讲规则 → ②猫爪自动演示拖拽（用户随时上手即接管）→ ③用户亲手拖对为止（拖错仅抖动+提示不扣血，**3 秒无操作猫爪自动回来重演**）。成功出真反馈：CAT_PALETTE 橙 + 游戏真实 `.cat-face` 体系猫脸
- **触发**：`gp_onboarded_v1` 未设 且 levelNum===1；完成/Skip 均写标记；Tips 区「🐾 Replay tutorial」可重放（事件委托接线）
- **GA4**：onboard_start / onboard_step(step) / onboard_complete / onboard_skip
- ** ego-browser 全流程实测 6/6 绿**：新用户触发✓ 演示出猫矩形✓ 真实拖拽判定（坐标几何，鼠标/触摸通吃）✓ 拖错抖动+留在第3步✓ 3秒轮播✓ Skip✓ 老用户不打扰✓ Replay✓ 主游戏无影响✓
- **⚠️ 第三次踩同一个坑**：主内联脚本在页面中部，其**之后**解析的元素不能 getElementById 直接接线（Get-the-App CTA、obReplay 两次中招）——overlay markup 因此必须放在脚本之前；已写进 AGENTS.md 关键约定
- 部署暗雷再确认：会话被注入 Clash 代理（HTTP_PROXY=127.0.0.1:7890）时 wrangler 认证失败**但 exit 0 假成功**——每次部署必须核对线上 CSS hash 或部署输出含 "Deployment complete"

### 真棋盘重构（法老指令：引导要跟教学 1-4 关棋局做演示，不走架空练习盘）

### Shikaku 教练卡盖棋盘 bug（2026-09-23 深夜，法老截图报告，deploy `36e84adf`）

- **根因**：index.astro 有**两条 `.onboard-coach` 规则**（v6 残留），前 z-index:900 后 z-index:2，层叠后者胜；棋盘内拖拽幻影 `.onboard-drag` z-index:5 > 2 → 演示矩形画在卡片上。且 fixed 卡片在矮视口直接盖住棋盘底部格子，挡交互。
- **修法**：①合并重复规则为一条；②卡片从 `position:fixed; bottom` 改**文档流**，标记从页面尾部移入游戏区 board-wrap 之后——卡片永远在棋盘下方，物理上不可能再遮挡。obToast 保持 fixed。
- 实测：卡片 static 且 boardBottom=518 < cardTop=530 零重叠；STEP 2/3 拖拽幻影 ghostOverCard=false；视觉确认虚线只在棋盘内 ✓。
- **教训**：同一选择器 CSS 规则写两遍，改 z-index 时必查重复定义；fixed 浮层卡片在游戏页=遮挡风险，游戏 UI 卡片优先文档流。

### Akari ❌ 错误示范 + Pictomino 教学三关递进（2026-09-23 深夜，法老指令，deploy `6f251c48`）

- **Akari**：coach 错拍演示升级——错误目标 `akObWrongCell()` 优先选「数字已满旁会超标」的格子（number_excess，教学价值高于单纯点已亮格），fallback 已亮格；红闪同时弹 **❌**（`.ak-obx` CSS 双杠画叉+白描边，不依赖 emoji 字形）；文案按违规类型动态化（T2=猫冲突 / T3="That number already has all its cats"）。注意 **T1 无错误示范**——它的白格全被墙隔开，落子后不存在非法格（逻辑正确跳过）。实测 T2/T3 均触发 ✓。
- **Pictomino**：DIFF_TABLE 教学行改为三关递进：T1=1 洞 1 候选（认识玩法）→ T2=2 洞 1 候选（连填）→ T3=3 洞 2 候选（学判别：手里碎片对应哪个 +）；Level 4 起照旧（Easy 4×4/6 洞不动，无级联偏移）。实测 round-info：0/1 → 0/2 → 0/3 ✓。
- 测试脚手架坑：boot 恒 `startLevel(0)`（跨会话续关在局内推进）；首访必先进引导课（body.tut-mode），DOM 验证须先走完课；`.cell.hole` 数量在 showPreview 过渡期偏少，round-info 的 `Filled X/N` 是权威计数。

### Akari 固定教学盘（2026-09-23 深夜，法老拍板「4 小关递进」，deploy `08c0a1dc`）

教学关从随机改为**固定手工盘**（`AKARI_TUTORIALS` in akari/index.astro，`buildTutorialPuzzle(level)` 在 newPuzzleSkip/newPuzzle 中替换 generatePuzzle）：
- **T1 数字含义**：中心墙「4」十字盘 → 4=四邻全放，零思考首胜
- **T2 对立冲突**：中心墙「2」→ 强制两猫分居墙两侧，面对面却合法（墙挡视线）——冲突规则教具
- **T3 三线索综合**：数字 1/2/1 三墙 → 三只猫各归其位
- **T4 升格**：4×4 数字 2/2/1 → 进 Easy 前最后课
- 四盘全部经引擎 `solve(grid,size,2)` 验证**唯一解**（线上实时 solve 出 solution，不硬编码答案）；Level 4 起照旧随机。Coach 文案按关定制（akObYourTurn 查表）。
- **设计语义坑**：引擎格子编码 `9`=白格、`-1`=黑墙、`>=0`=带数字墙——`0` 是数字 0 的墙不是空格；且 solve 假定方阵，1×3/1×5 概念须嵌进 3×3（补黑行）。
- 实测：L1 `#.#/.4./#.#` → L2 `.#./.2./.#.` → L3 `.1./2#./..1` → **L4 `2.../..../21../....`（4×4）** 逐关自动进位 ✓ 零报错，四关全链路实盘验证完成。

### Akari + Pictomino 引导同步（2026-09-23 深夜，deploy `b706c159`→`0f6f9b94`→`5c18daaa`）

**Akari（新建，/akari/）**：教学关无固定棋盘——引擎 `generatePuzzle(5)` 每局随机，"真实教学盘"=玩家当下对局的 `currentPuzzle`。Coach 骑真盘：①规则卡（仅首访）→ ②爪子对错对照演示：点 `solution` 第一猫位**真落子**（handleClick 真实路径）→ 移到已亮格再点 → `cell-violation` 红闪讲解不落子 → ③用户回合：3 秒无操作爪子指下一个 solution 位，**首次合法落子即毕业**（handleClick `else akObOnPlace()` 挂钩）。状态 `akari_ob_tut` {t1,t2,t3}；GA4 onboard_start/step/complete/skip。实测：真落子 1 猫 5 亮→错拍讲解→毕业 t1 落 2 猫 12 亮，零报错。
**Pictomino（换肤，game.html）**：现有两步交互课逻辑零改动，纯 UI 品牌化——teal 横幅→白卡+STEP 徽标+琥珀箭头+真爪子悬在目标（碎片/洞）上方弹跳。实测 Step1→Step2 全链路 ✓。
**坑（新增第 4 坑）**：**module 严格模式下块内函数声明是块级作用域**——coach 块包 `if (card) {}` 导致外部钩子 `akObOnPlace` ReferenceError（崩了 handleClick）、`akObMaybeCoach` 被 try/catch 静默吞。module 脚本 deferred，DOM 必就绪，直接写顶层不包块。
预览迭代坑：::preview 框不随 HTML 加载相对路径外链脚本——预览文件必须零依赖单文件（引擎 13KB 内联）。

- **机制**：newPuzzle() 后经 `window.__obMaybeCoach()` 触发；教学关（LEVEL_DEFS[i].isTutorial）首次进入时：①rule 卡（仅第一次，附 `hint-active` 高亮答案区）→ ②猫爪在**真棋盘**上演示该关 `puzzle.solutionRects[0]` 的正确画法（虚线框+爪子手势，不落子）→ ③用户亲手拖（游戏原生 mouse/touch 路径），3 秒无操作爪子回来重演；**首次成功落子即毕业**（`__obOnPlacement` 挂在 onEnd rects.push 后）
- **状态**：`gp_ob_tut` JSON `{t1..t4:true}` 逐关记忆；T2-T4 直接进 watch（rule 只讲一次）；Skip 单独记关；老玩家/非教学关不打扰
- **Replay**：教学关未学完→重跑 coach；普通关→一次性演示手势（等效视觉 hint）
- **实测 ego-browser 7/7 绿**：T1 rule+高亮✓ 接管✓ 落子毕业✓ T2/T3 自动直进 watch✓ Skip 记关✓ 老用户不打扰✓ 非教学关 Replay 演示✓（T4 布局未模拟走通，代码路径与 T2/T3 同一）
- **坑**：`currentLevelDef` 非主脚本顶层变量（不能直接引用）→ 用引擎全局 `LEVEL_DEFS[levelNum-1]`；游戏拖拽是 mouse+touch 事件**不是 pointer**（模拟测试须发 MouseEvent）；IIFE 末尾必须主动调一次 `__obMaybeCoach()`（初始 newPuzzle 在 IIFE 之前执行）

## 2026-09-23 晚 真机反馈三连修（deploy `07f31e48` → 委托修复 `cad0a713`）

法老 mini 实测反馈 → 定位 → 修复（ego-browser 全程实测复现）：
1. **导航栏错位** = `.header-nav` 在 481-700px 宽度溢出（600px 实测溢出 20px，Solver 戳出屏幕）——桌面导航与汉堡菜单断点间有空窗。修：断点 480→700px，700/600/550/480 全宽复验溢出 0
2. **「Challenge 进去是教学关卡」** = Get the App 区「📅 Try Daily Challenge」是死链接（`href="/#play"` 不调 generateDaily），「▶ Play Now」更是 `href="/"` 直接刷新。Challenge 卡本体（Play Now）一直是好的。修：两 CTA 接线；**踩坑**：该区块在主内联脚本之后解析，直接 getElementById 接线时元素不存在、handler 静默挂空——改事件委托后冷启动 2 轮复验均正确进入 Daily 10×10
3. **💡 Stuck 提示秒消失** = badge_help 消息 2500ms 太短 → 8000ms，6 秒后仍在复验 ✓

## 2026-09-23 深夜 手机端乱码/错位修（deploy `3a79318b`）

法老手机（鸿蒙 emoji 字体）反馈乱码+工具栏错位，滑动正常 ✓：
1. **乱码根因 = keycap emoji 缺字形**：`1️⃣`（1+FE0F+20E3 组合序列）在鸿蒙字体渲染成「1」+ tofu 空心方块。首页 tips 卡 `1️⃣`→`⭐`；**全站清洗**：/akari/ 与 /akari/tips/ 的 0️⃣-4️⃣ 一律剥成纯数字（perl `\x{FE0F}\x{20E3}`），语义本就是数字卡
2. **「错位」观感根因 = status 消息连用两个 📅**：鸿蒙把 📅 渲染成带「SEPT 15」大字的日历图标，`hit the 📅 button` 被撑成三截。改为单 📅 + `hit the Daily button (calendar icon) in the toolbar!`
3. 390/360px 受控复验：工具栏排布本身正常、body 溢出 0——用户感知的错位即第 2 条
4. 全站三页线上复验 keycap 残留 0。**教训**：面向国内安卓/鸿蒙用户的站，避免 keycap 组合 emoji（AFE0F+20E3）与重复大 emoji 文案

## 2026-09-21 Clarity 漏斗改造（hint 三层 + 徽章帮助 + iOS 登录修复）

**依据**：Clarity 录屏事件流全量提取（6 会话，方法见 skill `game-event-tracking`）。关键实锤：
- hint 纯图标没人用（30 分钟重度用户 0 hint）；Tutorial 徽章被当帮助按钮 1 分钟点 17 次；L5 登录弹窗 3/3 会话 2-3 秒点 Maybe later；iOS 用户 3 次点 header sign-in 全 miss（GA4 sign_in_click=0 佐证：点击落在按钮/横幅死区）；game over 弹窗开着时拖拽穿透（2 秒 3 次 game_over）；Pictomino 首次没血即流失。
- 回放里数字显示 ▫/□ = Clarity 渲染缺陷，非站点 bug，勿按此改代码。

**本次改动**（deploy 5a12b1c6）：
- Shikaku `index.astro`：hint 图标→文字胶囊按钮（💡 Hint + 次数 badge）；连错 2 次 hint 按钮抖动放大特效（每关一次，prefers-reduced-motion 降级）；game over 弹窗加「💡 Retry with a Hint」（同一道题+回血+高亮正确矩形，无剩余 hint 则隐藏）；弹窗打开时 board pointer-events=none 修穿透；难度徽章可点→滚到 Tips 区+status 提示；game_start 延迟至 DOMContentLoaded（修 gpTrack module 注入竞态，D1 69:6 缺口根因）。
- Akari `akari/index.astro`：同款 hint 胶囊+抖动 nudge（连错 2 次触发，合规落子/换关/重置清零）；难度徽章可点→滚到 Strategy Guide；game_start 同款 DCL 修复。
- Pictomino `game.html`：失败弹窗加战绩行 + 「Skip this puzzle →」跳关按钮（puzzle_skip 埋点，GA4）。
- 白名单：`badge_help_click` 加入 funnel-track.ts + _funnel-sql.ts。
- sign-in 触控目标 44px（HIG 最小标准）+ z-index，L5 弹窗按钮同款加大。

**待验证**：D1 game_start 应随新流量恢复（部署后暂无流量未验）；iOS 真机点登录是否跳转；抖动 nudge 后 hint 使用率；badge_help_click 数量。
**未做（本轮范围外）**：sign-in 弹窗价值主张重写（延后触发/进度保存钩子，数据上 3 秒拒绝是文案问题）；pictomino gpTrack 全量接入（D1 侧仍只有 GA4）。

## 2026-09-21 真机回归修复（deploy 22ba9c6c）
- **滚动锁死**：`body{touch-action:none}` 老 bug（手机整页无法滑动，桌面无感）→ 移到 `.board`，CSS 新 hash `DlDBJQIg` 已上线。
- **登录态导航换行**：account-area 改 nowrap，名字 5.5em 截断，Play Daily 缩小。
- **登录后跳第 9 关**：云端进度恢复功能正常（admin 云端存档领先本地）→ 加「☁️ Cloud progress restored」status 提示。
- **待用户操作**：Google Cloud Console → OAuth 同意屏幕：应用名 MeowTrail-web → GridPaw，徽标换 `public/icon-512.png`，隐私链接 https://gridpaw.com/akari/privacy/（顶级 /privacy/ 待补）。

## 2026-09-22 Pictomino 接入 D1 漏斗（deploy b335cff6）
- `public/pictomino/gp-track.js`：独立打点客户端（静态页过不了 Vite），白名单/PROD 守卫/visit 去重与 funnel-track.ts 同构——**改白名单要两边同步**。
- `scripts/gen-build-info.mjs` 构建期同步产出 `public/pictomino/gp-build.js`（window.GP_BUILD）。
- game.html 埋点：visit / game_start / first_move / level_up / game_over / daily_solved / puzzle_skip / help_click / share_reddit / share_copy / community_click（`help_click` 已加双白名单）。
- 踩坑：game.html 会 302 到 `/pictomino/game`（无 .html）→ script 必须用绝对路径 `/pictomino/gp-*.js`；**改 public/ 后必须重新 pnpm build 再 deploy**（dist 才会带上）。
- 外站 iframe 跨域嵌入时 /api/events 静默失败（fetch catch），只统计 gridpaw.com 同源访问。
- 验证：D1 实收 `visit | 37ff67b-dirty | path=/pictomino/game` ✅（注意 gp_event.created_at 是毫秒整数，比较用 `(strftime('%s','now')-N)*1000`，别用 datetime()）。

## 2026-09-22 排期项落地（deploy ca678f21）
- **`/privacy/` 顶级隐私政策页**（noindex，覆盖三游戏 + 匿名埋点说明段），OAuth 同意屏链接待用户在 GCP 后台改为此地址。
- **Pictomino 失败弹窗「👁 Peek」按钮**：重放开局 2 秒预览后重试本关（hint_click source=lose_overlay_peek），与 Try again / Skip 并列。
- **漏斗周报 cron** `53f2a4b531f1`：每周日 20:00 自动拉 D1+GA4 对比改动前后，deliver=all。含样本纪律（去 bot<10 只报数）与 created_at 毫秒口径说明。
