# GridPaw 现役状态（STATUS.md）

> 项目状态的**唯一入口**。主题细节在各主题文档（见下方索引），此处只放现役结论与待决策。
> 最后核对：2026-09-19（TDK 优化轮部署 + 收录口径对账决策；sitemap / 构建 / 部署 / 内链均已实测）｜ 分支 `main`
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
