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

> **Murdoku 备选（2026-10-10）**：数独×谋杀推理品类（纸质书 100 万+册爆款），文章沉淀 → `research/2026-10-10_Murdoku游戏备选.md`。结论：引擎复用度高（区域约束+传播求解）、叙事内容页是新杠杆；**立项前置**：web.cafe 实测 `murder sudoku`/`murder mystery logic puzzle` 量与 KD，品牌词 Murdoku 不可用（商标）。

> **Pinterest 冷启动线（2026-10-10 上线 3 pin + 旧 pin UTM 补齐）**：新 pin Kakuro `1103241240027570976`（Brain Teasers 板）/ Nonogram `1103241240027571637`（Cat Games 板）/ Nurikabe `1103241240027572241`（Logic Puzzles 板），API 回读全验过（title/UTM/board/description 92-110 字符）。制作规范：真游戏截图（ego-browser 实拍，AI 不画棋盘）+ AI 背景 + GridPaw logo + CTA 按钮 + gridpaw.com 水印，1080x1620。**基线对照**：账号 30 天仅 326 曝光/1 外链（10k 邮件查证为 furriq 账号通知，非 gridpaw）；旧 10 pin UTM 补齐 **8/10 完成**（`pin-shikaku`×4/`pin-pictomino`×3/`pin-akari`×1，API 确认；剩 2 条 `…961171`/`…759874` 编辑弹窗内值已改+保存关闭，但 API/SSR 迟迟不回读——Pinterest 服务端同步滞后，48h 后复查）。**2-3 周后复盘**：新 pin 出站率 vs furriq 0.08% 基线，验证 CTA 模板；旧 Shikaku 重复 4 条可清理。Chrome profile 映射：jameschen=gridpaw。编辑 pin 弹窗技术要点：链接字段在弹窗下半部（需滚动容器），保存要点 `primary_l` class 的按钮（顶栏同名「保存」是摆设）。

> **Nurikabe 线（2026-09-26 收官）**：第 5 个游戏，**已部署上线**（deployment `fb570629`）。全链：引擎（sea-snake 构造 + repairToUnique；档位 easy 5×5 / medium 7×7 / hard 9×9，selftest 16/16）→ demo（拟真皮肤：深海蓝≈海 + 沙滩岛 + 线索格小岛图案；首访五段式引导卡带真解迷你盘；教学爬梯 2×2→3×3→4×4→5×5；血量机制 3 血/关、双向纠错+纠正格锁定、血尽换盘、教学 ∞）→ 正式页 + GameNav 六游戏 + llms.txt + footer 互链。**线上验证全绿**（/nurikabe/ 200、demo v=3、引擎 16479B）、IndexNow 200、GSC sitemap 204（key=furriq A key，auto-detect 会错抓）、Request Indexing /nurikabe/ 已提交（「已请求编入索引」）。关键坑已沉淀：引擎引用 ?v=N 缓存戳（demo+worker 两处）、rule-(d) need=0 clue 格豁免（2×2 全灭根因）。

> **视觉统一线（2026-09-26 上线，commit `e376e7a`）**：Akari 首页/Akari Daily/Shikaku 首页三页对齐新标准——胜利弹窗手绘 SVG 猫头→`/assets/logo.png` 彩色 logo；game-tag 行（游戏名 · Level N）全六游戏统一；分享文案挑衅风零猫脸（Shikaku 彩块 emoji 行保留=成绩艺术，玩法内 🐾 爪印保留=品牌同源）；Shikaku 新增 𝕏 Share 按钮+棋盘卡（html2canvas 截真实棋盘），Akari 棋盘卡复用 generateShareCard（卡内 🐱 灯块→琥珀块、cats→bulbs、🐾 角标删除）。埋点六游戏同名：`share_card` / `share_card_copy` / `share_twitter` / `share_reddit` / `share_copy`。Pictomino 子站独立受众，故意不动。线上实拍全验（design-live-preview 流程，Playwright 从 gridpaw.com 抓 9 图）。

> **分享+PWA 线（2026-09-26 上线，commit `e6c6a49` 收官）**：Kakuro/Nonogram/Nurikabe 三 demo 的 winOverlay 三按钮分享 + `manifest.webmanifest`（SEOHead 全站挂 link）。迭代四版后定稿：① 文案挑衅风、零猫 emoji，每条挂 GridPaw 品牌名+游戏机制梗；② 胜利卡顶部/页面 h1 用 `/assets/logo.png` 四色猫爪网格（favicon.svg 只是米色标签页图标，勿再混用）；③ Solved! 下加 game-tag 行（游戏名 · Level N / Daily / Tutorial）；④ **点 𝕏/Reddit 先弹「Your board」棋盘卡**：canvas 实时渲染胜利棋盘（logo+标题+棋盘+域名），卡内 Copy Image / Save / Post / Close，新事件 `share_card` / `share_card_copy`。Playwright 全程回归（分享 18/18 → 棋盘卡 12/12）。抓图脚本与坑沉淀在 `~/.hermes/cache/scratch/test-board-card.py` 及 webapp-testing skill。**待观察**：`share_card*` vs 直接发帖的比例，验证棋盘图对分享转化的提升。

> **移动端首屏重构方案A（2026-10-09 上线，commit `5241637`，deployment `fa32020c`）**：移动端（≤560px）隐藏 GamePortal 导航网格——它占首屏 59% 把 Shikaku 棋盘挤出首屏（实测棋盘 y=808 只露 36px、教学卡 y=892 完全屏外）。改后棋盘 y=295、教学卡 y=379 完整进首屏；桌面端（>560px）portal 保留不动；零 DOM 变化不影响 SEO。依据：外链真人 71% 落首页、取证报告 62.5% 流失会话为加载即走 + dles.gg 引流秒退。方案对比与广告位评估见 `~/.hermes/cache/scratch/mobile-firstscreen-proposal.md`。

> **Adsterra 低填充诊断（2026-10-09）**：15 天 8 impressions 根因=流量量级（4 SEO 页 14 天 19 会话）+ CN IP 拒服务，配置/代码健康（后台 API 逐字节比对 hash 一致，active=3 无 decline）——**严禁点后台重新生成代码**（会作废 invoke.js）。本机验收广告填充用 `~/.hermes/cache/scratch/adsterra-fill-check.py`（三级链路：invoke.js 200 → 二跳注入 → container children>0）。报告 `~/.hermes/cache/scratch/adsterra-lowfill-diagnosis.md`。**unit 账目澄清（10-12 后台实地展开核对）**：全账号 active unit 恒为 3 = gridpaw NativeBanner_1 (31317669) + furriq NativeBanner_1 (31420265) + gridpaw 160x600_1 (31688449，10-12 新建)；「active=3」是账号口径非 gridpaw 独占。9 内容页共用同一个 Native unit（1 unit N 投放位），勿混淆。
> **漏斗复核（2026-10-12，GSC/GA4/Clarity 三源）**：结论不变且更实锤——**广告没坏，是「人数×观看深度」乘积太小**。① 流量层：28 天全站 645 会话仅 **40（6%）落在 9 个挂广告的内容页**（游戏页/首页才是流量主体且按红线不挂广告）；② 深度层：Clarity 内容页会话多为 1-7 秒弹走（meowdoku-guide×2 / japanese-logic×2 全 ≤7s），AdSlot 在文中很深（brain-teasers 实测 y≈3033px），48 分钟深读者仅 brain-teasers 一位回访（bing 来的尼日利亚用户，4 次 Show answer 0 死点击=质量最高）；③ 填充层：10-12 复测 invoke.js 从 CN 出口（MacBook curl + mini ego）双 403/0 字节=Adsterra 拒 CN IP，预期行为非故障；④ 唯一杠杆 = **给内容页导搜索流量**（与内页攻略战同一杠杆：5 新页全部挂了 AdSlot，GSC 曝光起量后广告才有钱赚）+ 可选把 AdSlot 从文末上移到首段后（抬 viewability，需 A/B 前先算流量红线：40 会话/月的页面做什么都不显著）。
> **广告位扩量 v2（2026-10-12 拍板+上线，commit `785c19f`，deployment `ff107374`）**：法老拍板「游戏页+首页也加，小影响」。桌面（≥1200px）双侧 sticky **160x600 Banner（新单元 31688449，后台 ego 实操建成，只加不改零风险）** 落内容列外空白 gutter（1440 屏两侧各 470px，1280 屏 390px）；全端 GameHub 之下 1 个 Native 文流位（复用 31317669）。10 页=首页+9 Astro 游戏页；**pictomino/game（iframe）与 ?embed=1 全排除**；移动端不加 anchor/悬浮（压底部操作区=破「小影响」底线）。AdSlot.astro 顺手修：embed 场景客户端守卫不再发脚本（原 4 内容页仅 CSS 隐藏）。验收：Playwright 双端全绿（1200px 断点 1200=显/1199=隐、棋盘零遮挡、embed 0 注入）+ vision 读图 + 线上 10/10 页 curl 落地确认。可曝光 pv：内容侧 120 → ~1400/月（×12），sticky 位全程视口内配长停留人群。代码档 `.adsterra/banner-160x600.snippet.md`；坑：后台按钮渲染为「Ad Unit」精确匹配会 miss。**观察期 2 周**（至 10-26）：Adsterra 后台 impressions 曲线 + GA4 游戏页会话，若 <1200px 流量占比意外高再议移动端方案。**多尺寸决策（10-12 法老确认）**：不铺多尺寸——GA4 实测桌面 66%/移动 33%，桌面 ≥1200px 真实覆盖率 71%+（800x600 档 91 会话为 bot 指纹，剔除后更高），160x600+Native 已接住主力；高单价格式（Popunder/Social Bar/Interstitial）全在「小影响」红线外；**唯一保留候选**=移动 GameHub 下 300x250，触发条件：10-26 复盘时 mobile pv>1000/月且 Native 填充健康（当前 362/月，不达标不动）。

> **漏斗与埋点线（2026-10-09 上线，commit `a02f221`，deployment `c8a42f53`）**：binary/hashi/slitherlink/star-battle/kenken 五游戏页补齐 first_move + game_over 埋点（Playwright gtag-stub 实机验收全绿，IndexNow 已推 6 URL）。game_over 语义裁决：五款是 Zen 式谜题无血量机制，挂「主动提交校验失败」时刻（盘满/星满/环闭但 validate 不过）。**同日取证推翻「76% 首局流失」口径**：game_start 页面加载即触发（index.astro:2110），37% 死开局是 bot（isLikelyBot 已入库），真人死户 92% 为 10 秒内无交互离开，CDP 复现无 bug；真人 gs→fm ≈33%（mobile+google 达 37-60%）。取证报告 `~/.hermes/cache/scratch/shikaku-firstmove-forensics.md`。**待办 P0**：① game_start 口径改 pointerdown 触发或改名 board_ready；② 看板查询过滤 isLikelyBot（真人转化 23%→33%）；③ onboard_* 进 D1 白名单（GA4 现值 start 435/complete 151/skip 54）。D1 免费配额 7500 写/日，UTC 午夜重置。

> **Pinterest 清理 + 双社媒 cron 化（2026-10-13）**：删 4 条旧 pin（Shikaku dup ×3 + Akari 脏 title，`DELETE /v5/pins` 204+404 双验证，**13→9 pin**；留存 Shikaku 2 条 …61018/…4835338）。数据基线更新：30d 334 imp / 1 outbound / 0 save（出站率 0.3% vs furriq 0.08%）；GA4 pinterest 28 会话 / lemmy 16 会话。**Cron 现状**：新建 `[GridPaw] Pinterest 运营周报 1eced124f705`（周日 18:00，bot-chat，skills=pinterest-api-setup+ga4-data-access，坑全内置）；lemmy 发帖 88953652f56c + 复盘 a23ec4836634 挂 skills=[lemmy-community-ops]；gridpaw 漏斗周报 53f2a4b531f1 deliver all→bot-chat（deliver=all 连续 2 周无投递目标）。MacBook wrangler whoami LIVE（10-12「双死」已过时）。执行账本：`records/daily/2026-10-13-gridpaw-pinterest.md`。**复盘节点 10-24~31**：新 pin 出站率 vs 0.08% 基线，连续两周无增量 → 降级建议（产能挪 lemmy 大盘帖）。

> **全站 QA 巡查（2026-10-14 上线，deployment `46eb1008`）**：179 页全量走查（JS 报错 0 / 内链全验 / 文案红旗扫描 / 交互走查），修 4 类 30 处——① ExtensionPromo Chrome 商店 URL 废弃品牌 meowtrail slug → gridpaw canonical；② 30 处内链缺尾斜杠（index.astro 24 + akari/index 1 + pictomino 12 静态页根链接）补齐，pictomino 子页保持无斜杠（CF Pages 上 `/pictomino/easy/`→308，无斜杠才是 canonical）；③ `/akari/rules/` 补 H1（原标题在 h2）+ Article headline 对齐 title + FAQPage 问题「GridPaw」改回「Akari」。**排查后不动**：`akari-puzzle-engine.ts:109` 的 `meowtrail-` 是 localStorage key（动了毁老玩家进度）；meowtrail.itch.io 200 可用；本地扫出的 pictomino「404」是 http.server 不做 pretty-URL 的假象。线上验证 4 项全绿（rules h1/schema、footer 链接、扩展 slug、pictomino 根链接）。已提交推送：`a294724`（本批修复）+ `19f058c`（遗留记账：新词台账 cron 记录 / NextGenRunGames 评估 / 哥飞趋势插件脚本；gp-build.js 构建戳还原未提交）。git webhook 是否幂等重建不追——直传 46eb1008 已覆盖全部内容。

> **Shikaku 触屏修复（2026-09-28 上线，commit `dae2b64`）**：Lemmy !dailygames 真实玩家反馈三项全修——拖拽高亮 8%→32% + 实时 `W×H=面积` 徽章（固定棋盘下方，永不遮棋盘格）、猫耳 top:-7px→0 收进块内+阴影收窄（不再压上方行数字）、C1 误触保护（选区无数字=静默放过不扣命，真错误照扣）。Playwright 5/5 实测（含触屏事件路径+徽章几何断言）。已同步四端：gridpaw.com 部署验证 / GameJolt release 1528718 / NG 草稿 8138600（新 zip+1000×800+触屏，13:00 cron 发布）/ itch MeowBlock（公开页 iframe 已播新包）。**平台铺量现役状态唯一入口 → skill `game-directory-submission/references/gridpaw-platform-status.md`**（GameJolt 5/5 Published、NG 2 发布+3 待发、IndieDB 公司页+3 款+2 待建、Lemmy 反馈帖已回）。

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

0. **10/17 内页攻略战复查**（§八）：meowdoku-guide 日曝光 <15 或 arrows 双页停 9 不动 → 给 walkthrough 加内链权重（外链结构验证已完成，见 §八外链策略）
1. **对账 Pages 报告 27 条「已发现不抓取」URL × sitemap 68 条**（GSC UI 导出，API 不出清单）→ 定性后再决定是否 404，禁止在交集弄清前下架（§二.7）
2. **10/3 复查 how-to-solve 新 Title CTR**（one-shot cron 已设，读数须剔除 `akari or step back` 工具流量），仍 0 真人点击则上备选文案（§二.7）
3. 让 cron 继续跑 Request Indexing 至 repeat 用完（9/30 前后），2–4 周后复盘索引与曝光
4. 视觉合同阶段：`HANDOFF-VISUAL-CONTRACT.md` 第三节列了欠账（样式收编 + 验证欠账）
5. **Pictomino 实现 easy/hard 模式**（2026-09-28 法老拍板）：`public/pictomino/easy.html`/`hard.html` 落地页宣传 3×3+7 命等模式，但 `game.html` 只实现了 `mode=daily`，`difficulty=easy|hard` 参数仅用于埋点——落地页实际跑经典 5 命难度表。要么把 easy/hard 模式真正实现进 `game.html`（读 URL 参数切难度阶梯+命数），要么改落地页文案（已拍板做前者）。帮助文档草稿 `help-docs/pictomino.md` FAQ 已标注 ⚠ 待修，实现后同步更新文档

---

## 六、扩量决策 + 内容集群线（2026-10-09 上线，commit `93c1525`）

> **扩量拍板（法老 2026-10-09）**：不加第 9 个游戏，克隆 akari 内容集群模式到 binary + hashi。依据（GSC 28d 实测）：akari 集群 26 页 = 谜题词曝光 411（全站其他词根总和 2.5 倍）= 模式验证；binary/takuzu 词族 pos 8.6-9.1 已在第 1 页（产品未投内容就自己爬上来）、hashiwokakero pos 8 / hashi sudoku pos 10；kenken 被 NYT 官方压着（pos 43+）不投内容；star-battle/slitherlink 继续养信号。
>
> **噪声排除**：全站最大曝光词「akari or step back」（302 impr/月且 10 月加速）= 菲律宾女排联赛 Akari Chargers 队相关词（TikTok/排球流量误落 /akari/how-to-solve/），**假曝光，不追不接**，读 how-to-solve 页数据时必须剔除（真实曝光约 120 不是 425）。

### 首批 4 页（2026-10-09 上线，全部实测 200 + IndexNow 已推）

| 页 | 承接词 | 说明 |
|---|---|---|
| `/binary/how-to-solve/` | takuzu strategy / binary puzzle rules | 验收修正：标题/meta 的「14x14 grids」宣传已删（产品最大 10×10） |
| `/binary/takuzu/` | takuzu / takuzu game | 别名权威页，FAQ 如实答「为什么没有 14x14」 |
| `/hashi/solver/` | hashi solver / bridges puzzle solver | 带 `?embed=1` 游戏 iframe |
| `/hashi/how-to-play/` | hashiwokakero / hashi sudoku | hashiwokakero 别名权威页 |

4 页均 FAQPage + BreadcrumbList JSON-LD（build 后逐块解析验证，无伪造评分）、canonical/hreflang 尾斜杠正确、sitemap-0.xml 全收录、akari/binary/hashi 三向互链。子 agent 产出 + 主会话逐条验收（build 产物上做）。

### 后续节奏

- **Phase 2 裁决点 = 11-10**（月度体检 cron `1041dc2740c8`）：takuzu/hashiwokakero 词位动了 → 补 blog/glossary 页型到爬得快的集群；某页连续两月零曝光 → 查 thin/意图
- GSC 收录预期 1-2 周（hub 内链 + 新 sitemap 已被 build 收录）

---

## 七、Lemmy 运营线（2026-10-09 恢复正常运营，法老拍板）

- **定位：dev log 风格正常运营**（类似 reddit gamedev），**永不降级**（此前复盘 cron 的降级建议已作废）
- 发帖 cron `88953652f56c`：周一/周四 10:00 各一轮（!dailygames + 自有社区 !gridpaw_dailyakari 各 1 帖），内容角度从 gridpaw.com 真实素材轮换（新游戏/引擎改进/changelog），自带「查评论→优先回评论」纪律
- 复盘 cron `a23ec4836634`：每日 11:00（6+2 帖存活性/订阅数/GA4 归因/被删警），**ROI 警不再升级、只记录数据**
- **发帖 cron 升级（2026-10-14 法老拍板）**：`88953652f56c` prompt 加「帖正文三段结构」——① Update 一句话（changelog/git log 真实取材，禁编造）② 规则段 3-5 行（新玩家英文短句：怎么赢/机制/每日关）③ 引用与直链（Full changelog→`/from/lemmy-devlog`；游戏直链用 `/from/lemmy-*` 短链，帖内一律完整 URL）。dailygames 版偏改动、自有社区版偏玩法+解法；+whoami 部署前探活。三段结构同步沉淀 skill `lemmy-community-ops`。10-12 短链部署已闭环（1abbd39 → 10-13 deployment 51b2293d，302 实测）
- 账本真源：`~/workspace/backlink-workspace/records/lemmy-post-status.txt` + `records/daily/`；自有社区 39 订阅（38 联邦全沉睡，subscribers_local=1），开刊两周评论 0 条，真实互动 = dailygames 大盘帖那批（5 up + 5 评论）
- 归因基建：`/from/lemmy-*` path 短链（public/_redirects，commit 879036e；Lemmy 剥 query → 站内 302 附加 utm），`/from/lemmy-devlog` → /changelog/
- 首轮双帖（10-09）：[dailygames dev log](https://lemmy.zip/post/72921573) + [自有社区](https://lemmy.zip/post/72921575)
- **遗留待办**：漏斗周报 cron `53f2a4b531f1` deliver=all 投递坏（10-04 结果丢失）→ 待改 deliver 目标
- 新游戏收录（10-09 实测）：5 页（slitherlink/star-battle/kenken/hashi/binary）GSC URL Inspection **5/5 Submitted and indexed**，无孤岛（首页+akari 双入口内链），UV 基线：近 7 天 178 UV / 日均 ~30

---

## 八、内页攻略战（2026-10-10 上线 5 页，雷达首个实战命中）

> 源头：T1 品类反推 arrows puzzle 词族（com.ecffri.arrows 100M+ 装，词 12 个月单边爬升）。全量词/KD 数据与状态机见 `NEWWORD-LEDGER.md`（去重真源），本节只记作战面。

### 5 页清单与首次读数（2026-10-12，窗口第 2-3 天）

| 页 | 承接词 | KD | GSC 读数（10-10~12） | 判断 |
|---|---|---|---|---|
| /arrows-puzzle/ | arrows puzzle | 40.5 | 9 imp / pos 6.8 / com.ecffri.arrows 已出曝光 | hub 起位 |
| /arrows-puzzle-walkthrough/ | walkthrough | **11.6** 旗舰 | 9 imp / pos 6.7 | 起位，观察斜率 |
| /block-blast-hints/ | block blast hints | 20.3 | 3 imp / pos 8.3 | 慢热 |
| /meowdoku-guide/ | meowdoku alternative/tips | 42.2 | **33 imp / 2 clk / pos 7.9**；meowdoku tips pos 1.0 | **领跑**，变体词打法 2 天见牙 |
| /cross-math-puzzle/ | cross math puzzle | 53.8 | 2 imp / pos **3.5** | 位置好量未起 |

- GA4 落地这 5 页 = 0 会话（窗口早期正常，GSC 2 clk 需排自测）；全站大盘 217-305 imp/日未被带动
- **复查点 2026-10-17**（GSC 滞后消化完 + 满 7 天）：meowdoku-guide 日曝光 <15 或 arrows 双页停 9 不动 → 给 walkthrough 页加内链权重
- 28 天验证窗口至 **2026-11-07**

### meowdoku-guide 整页重做 + 批量布局修（2026-10-13，deploy `24e9d63f`）

**触发**：法老发现内容错位 + GA4 时长 0。审计实锤三件事：
1. **内容把游戏写错**：Meowdoku 真身是 LinkedIn Queens 类猫谜题（色区放猫/行列唯一/不接触），原页整篇按 9x9 数独写（规则/技巧/FAQ 全错）→ GA4 30d 7 会话 engagementRate 0.0% 全 bounce，而 GSC pos 9.2 + CTR 4.3% 全站最高 = 标题能骗点击、落地接不住。
2. **同类硬伤 3 页**：arrows-puzzle + arrows-puzzle-walkthrough 把"点按箭头滑出棋盘避免碰撞"写成"拖箭头指向靶子+颜色配对+传送门"（虚构机制）；block-blast-hints 1 处 FAQ 错（称落子可回改，实际不可移动）。
3. **布局 bug 8 页**：`class="seo-content"` 本页未定义 → Read Next 贴左（meowdoku/arrows×2/block-blast/cross-math/brain-teasers/japanese/logic-puzzle-grid）。

**meowdoku 重做**（skill `game-guide-page-playbook` 沉淀了全流程）：
- 框架照 SERP#1 meowdoku.org（EMD 5 个月月 43.4 万访问）：规则 4 条+演示盘 → Controls → 6 策略 → **Level 1-3 真实答案**（竞品图逐格像素采样还原分区图 + 唯一解求解器枚举验证 + 对照官方答案）→ FAQ 6 条 Schema 同步重写
- TDK 不动（排名/CTR 已验证）；"answers" 意图从劝退文改为真答案+推导示范；随机化盘面免责置顶；猫 sprite/盘面快照落 `public/meowdoku-guide/`
- Phase 2 挂账：meowdoku answers level N 逐关 pSEO 页（竞品 meowdoku.app 靠该词族月 12.3K 流量，KD 42）

**批量修**：8 页 `seo-content`→`seo-section`（720px 居中）。Playwright 验收：Read Next secLeft=280==mainLeft=280、移动端 0 溢出、棋盘 20 猫 10✕ 分毫不差。

**待办**：arrows 双页虚构机制重写 + block-blast FAQ 修正（同 skill 流程，待法老排期）→ **✅ 已完成（2026-10-13 下午，deploy `da5d6f87`，commit `5022e76`）**：arrows 双页照 meowdoku 骨架重写（官方验证玩法：点按滑出/碰撞扣心/双头箭头/Normal→Nightmare），CSS 箭头演示盘 + 2 官方截图；block-blast FAQ 双落盘修正。验收抓到子 agent 保留旧页冷蓝主题（#3D6BF0）→ 全量换暖琥珀+奶油白后 vision 复读确认。"arrows puzzle walkthrough" SERP 补测：KD 8.1 极易，#2/#7 均为 DR 0 六个月新站 = 全站最容易正面进入的词；竞品 arrowspuzzleguide.com 框架 = Level 1–1000 逐关索引+难度分层+daily，**逐关 pSEO Phase 2 侦察结论（2026-10-13 下午，暂缓立项）**：
- 竞品真相：arrowspuzzleguide.com 逐关页 = 纯模板文字+YouTube 嵌入（零真数据）；mobilepuzzlehelp.com = 结构化 SVG 盘面+data-replay-steps 解法序，L1 与实机视频吻合，但按 marker 方向建模存在同列相向不可解配置（#1↔#33），按 data-direction+领先点阻挡可解率 93-100% 非全绿——真实性无法完全验证
- ROI 反证：两个 DR0 竞品全站月访问合计 ~3.6K（含其他游戏），摊到 1000 页 ≈ 每页 1-2 访问/月；逐关词族=低价值词海 + scaled-content 风险
- 视频管线不成立：YouTube 仅 android 客户端可下（640×360），盘面 <250px，vision 数箭头不可靠
- 替代方案：做 3-5 个高意图页（how many levels / max level / level 1000），等 10-17 GSC 数据再评估
- **差异化对比节已上线（2026-10-13 晚，deploy `6dc6b820`，commit `8d41c2e`）**：三 guide 页（arrows/arrows-walkthrough/meowdoku）FAQ 前新增 "How This Guide Compares" 资源类型对比表——本 guide vs 官方商店页 vs 视频攻略 vs 自动生成站；不点名竞品，全部可验证事实；移动端堆叠卡片。此节为 E-E-A-T 差异化标配，后续新 guide 页照抄
- **Level 1-3 逐关攻略已上线（2026-10-13 深夜，deploy `193d5113`，commit `821d8c0`）**：walkthrough 页新增已验证逐关节（SVG 重绘盘面）。L1/L2 任意顺序（轨道独立），L3 首个顺序敏感关（长S被#1+#4挡，解序 1→4→2→3，求解器+视频4击零掉心吻合）。数据管线：同款短视频逐帧蒙太奇+vision 追踪消失顺序 ↔ 竞品 SVG 几何交叉验证，小关（≤4箭头）可靠；10-17 复查后视 GSC 表现决定是否扩到 L4-L10
- **Levels 4-10 已验证事实表 + 需求 CTA 已上线（2026-10-13 深夜，deploy `daf87eea`，commit `7f7ae3e`）**：L4 起盘面重叠成迷宫状超视频验证上限（盲读实锤），禁虚构不画盘 → 改发逐关事实：尺寸/箭头数（结构化数据×实拍交叉）+ 实况（L4/5/7/8 零掉心、L6 心形盘+Hard、**L10 Hard+实拍掉心=前10关唯一碰撞实证**；通关语轮换 Well done!/Nice!/Brilliant!）。CTA「Yes — bring on Levels 11+」单击投票 → `guide_more_levels_click`（GA4-only 非 D1 白名单）；Playwright defineProperty 拦截实测事件名/参数逐字命中。**复盘：L4 复原尝试失败是正确止损——单帧问拓扑必幻觉，序列追踪只够验事实不够验几何**。CTA 数据后续在 GA4 查 guide_more_levels_click 计数决定 L11+ 批次立项

### 外链策略（2026-10-12 拍板：分层，不均摊）

内链全站必做（零成本）；外链只给「有排名机会但差一口气」的页——若 10-17 复查确认 walkthrough 卡住，KD 11.6 对应预算（10-20 引用域）花在它身上。

**3ue 实证（2026-10-12，两轮抓取，完整判定报告 `backlink-pool/meowdoku.org-classified-final.md`）**：竞品 DR39 = 101 引荐域，链接 **100% 砸首页**（根域 939 反链/92 域，子页 /play 仅 32 反链 1 域）。头部 edu 链真身 = **博客评论**（fsu/bc/american/williams/uco.es 全是 NOFOLLOW UGC 评论，锚文本统一 "Meowdoku Game Guide"，话术模板化）——即一条规模化评论外链流水线，非自然 editorial。**结论**：gridpaw 不给内页买外链；5 页权重走内链体系；外链若做打 gridpaw.com 首页，载体用现成 blog-comment 管线（锚品牌词 "GridPaw"，话术手写不套模板）。优先级：不急，10-17 复查确认卡住后再动。

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

## 2026-09-26 Adsterra 变现线（过审 + 提现链路 + 格式路线决策）
- **账号侧**：公司审核 09-25 过审（主体 Guangzhou Zhuayin Intelligent Technology Co Ltd，爪印）；Native Banner Active（Site 6063560，Ad Unit 31317669）。⚠️ Adsterra 后台公司名拼成了 Zhuoyin，字段锁死改不了，工单已发 support@adsterra.com（09-25，SENT id 1a0d820ad0b5eec4），回复后去 /payout-information 复核显示名。
- **furriq.com 已建站（09-26）**：Site 6078380（category Other，成人广告关，建站直接 Active）+ Ad Unit 31420265（NativeBanner_1）。只挂 /blog/* 文章页正文中部（品种/对比/工具/定价/首页红线不挂），详情与代码坑见 `furriq/.adsterra/native-banner.snippet.md` + `furriq/AD-TIER.md`。
- **提现链路（已打通）**：Wire EUR 已随 KYB 生效（Banking Circle S.A.，IBAN DE62...5678），EUR $0 手续费 / min $1,000 / 到账 5 工作日；满额提现 → Subotiz Global Account（USD+EUR 双户）→ 换 RMB。Subotiz 侧拼写正确，无需动。
- **现状数据**：Balance $0.03（09/25 起）；广告位=4 个 SEO 内容页正文各 1 个 Native Banner（brain-teasers-for-adults / logic-puzzle-grid / japanese-logic-puzzles / number-grid-puzzle），游戏页/首页/?embed=1 全部无广告（红线维持）。
- **付费点（Kakuro 爪窥付费墙）路线（09-27 定，暂缓执行）**：现状=仅 `public/kakuro/demo.html`（noindex）里 mock（`payPeek()` 点按钮直接解锁，零支付/零广告 SDK），正式 `/kakuro/` 不带，D1 paywall_* 事件 0 条。顺序：①正式页先上门控+mock 采漏斗数据 → ②paywall_shown 有样本后看触达/转化 → ③UV 起来 + Adsterra 余额真实进账后再接支付。⚠️ demo 里「📺 Watch ad」按钮是死承诺——Adsterra 无激励视频格式（见 skill ad-network-monetization），真实现无格式可接，别让真人点到。Cat coins 真实化=整套支付集成，等数据支撑。
- **格式路线决策（09-26 定）**：
  - 现在（<100 UV/天）：不加任何格式，保持现状。
  - 内容页日 UV 几百：内容页底部加 1 个 Banner 300x250（CPM 低于 Native，纯增量库存）。
  - 稳定流量 + 余额几百刀垫底：再评估游戏页 Social Bar（只开单格式、观察一周账号状态）；游戏页零广告红线要破需单独决策。
  - **永不**：Popunder、Smartlink（整页跳转，毁回头客）。Adsterra 无激励视频格式（实测仅 Popunder/Native Banner/Banner/Smartlink/Social Bar 五种）。
- **检查广告的已知结论**：Agent 本地无法看到真实创意（CN IP 空填充/代理 403/云浏览器被识别为 bot 直接重定向 direct link），唯一现成渠道=Clarity 会话录屏（流量小暂无深滚样本，筛选路径已跑通：录制页筛选器→已访问 URL 包含页面 slug）。教训沉淀在 skill `ad-network-monetization`。
- **全站猫 emoji 清理（09-26 晚，`e6e543e`，随 `7959e4b` 部署上线）**：法老发现导航品牌位是 `🐱 GridPaw`，彻查全站共 61 文件 ~130 处：品牌位（GameNav + pictomino 10 处 brand-logo）换 favicon.svg logo；H1/CTA/toast/教程/分享文本约 115 处删 emoji；**机制图标保留**（akari 灯泡 content:'🐱'、胜利彩蛋粒子池、kakuro 迷雾 🐾 标记——玩法本体）。线上实测：首页 🐱=0、H1/CTA 干净、机制图标 CSS hash 与线上一致。顺带修 `pnpm run deploy` 依赖全局 wrangler 的坑（bare → `npx -y`）。

## 2026-10-13 漏斗诊断（game_start 口径失真）+ 口径修复（可见才计开局）

**依据**：GA4 28 天漏斗（US desktop first_move 率 14% vs mobile 38%）+ Clarity 录屏取证（3 天 54 会话全量扫描，方法见 skill `clarity-session-forensics` 的 gridpaw 实操节）。关键实锤：
- **10vuizs（US desktop，Pinterest 进首页，5:04，0 点击）事件时间线：00:00 页面访问 → 00:01 页面已隐藏 → 00:01 game_start 同秒触发 → 之后 5 分钟零事件**。后台标签页加载：game_start 在用户从未看到页面的情况下计了一次「开局」。
- 首页落地 17 会话，**11 个（65%）game_start 触发但 0 点击**；US desktop 首页 3/3 全零点击。game_start=页面加载事件，分母混入后台标签/即走/读者会话 → first_move 率被系统性低估。
- **页面本身没坏**：w50r9u 在 00:04 能正常点 New Puzzle（渲染完整、无遮罩、无空白）——首屏交互没问题。

**口径修复（11 处加载时触发的 game_start 加可见性门控）**：`document.visibilityState === 'visible'` 才触发；hidden 时挂 visibilitychange 监听转可见补发；直接关掉后台标签 = 不发。开局 = 用户真正看到棋盘：
- src/pages/index.astro（Shikaku 首页，主排名页）`_gsWhenVisible`
- `{binary,hashi,kenken,slitherlink,star-battle}/index.astro` `fireGameStart` 包 `trackGameStartWhenVisible`
- `akari/index.astro` `fireGS` 同款门控（akari/daily 的 game_start 由 start-btn 点击触发，非加载时，不改）
- `public/{nurikabe,kakuro,nonogram}/demo.html` + `public/pictomino/hard.html`（iframe load）

**验证**：`pnpm run build` exit 0（159 页）；dist 逐文件 grep 确认 11 处门控全部进产物。
**待验证（部署后）**：GA4 game_start 总量应下降（后台标签不再计入）、first_move 率应显著回升；2-4 周后重读 US desktop first_move 率对比 14% 基线。
**Murdoku 品类侦察结论另见**：detective sudoku（KD 31.5）+ murder sudoku（KD 40.3）双词入场、叙事单元 pSEO 内容页先行——调研产物在本会话记录，未落 repo。

## 2026-10-13（晚）埋点缺口补齐 + murder-sudoku 内容页先行上线

**埋点缺口补齐（commit `602464d`）**：
- kakuro/nonogram/nurikabe demo 补 `first_move`（`__firstMoveTracked` 防重）；kakuro `board_dead` 别名 `game_over`、nurikabe 血尽挂 `game_over`（跨游戏失败漏斗口径对齐）；nonogram 无死亡机制不挂 game_over
- akari 补 `game_over`（health==0，loseHealth 内）
- **pictomino 关键发现**：iframe 内 game.html 无 GA4 config（gtag 是 no-op），first_move/game_over 实际只进 D1 没进 GA4——game.html 加 `pictomino_first_move`/`pictomino_game_over` postMessage relay（同 daily_solved 既有模式），index/easy/hard/daily-puzzle 四 wrapper 接收转发 GA4

**murder-sudoku 内容页上线（deploy `869c6ba6`）**：`/murder-sudoku/` 打 murder sudoku 头词（8100/月，KD 40.3），Murdoku 商标词只在正文 educational 提及。规则源=cluedoku.app/how-to-play 逐条核对（杀手机制：V 恰与一名嫌疑人同房间）。4×4 猫主题示例盘（Mochi/Tofu/Pixel + Old Whiskers）**经暴力枚举脚本验证唯一解**（唯一布局 M r2c1/T r3c4/P r4c3(rug)，凶手 M；验证脚本 scratch/verify-murder-sudoku-example.py，第一版盘面实测 3 解打回重造）。FAQ×4 + BreadcrumbList + FAQPage schema，三 CTA 全英文，四内容页 Read Next 回链。验收清单全过（TDK 49/53+158、JSON-LD parse、Murdoku 无主词位、sitemap 收录、线上 200 + IndexNow 202）。

### 21:45 子 agent 双双回收（spike 已本地复跑验证，bench 数字逐项一致）

**引擎 spike 结论（scratch/murdoku-spike/，solver+独立暴力计数器交叉验证）**：
- **4×4：生产就绪**——唯一解收敛率 100%（30/30），6.7ms/盘，纯客户端即时生成
- **6×6：可上但必须 Web Worker**——单次调用收敛率 57%（17/30），成功均值 466ms，配重试 1-2s/盘，阻塞主线程会卡 UI
- **8×8：当前证词词汇不可行**——融合全部真证词仅 16.7% 布局可唯一化，不存在「每嫌疑人恰一条」的唯一子集；需扩展方向/相邻类证词或人工布局，MVP 不做

**竞品盘点结论（5 站）**：
- 功能最全=cluedoku（4×4→10×10+10 证词类型+duels/co-op，但流量最弱 1870/月）；内容最厚=sudokumurder（360 页/6 语言，日期归档+独立 solution 页吃 answer 长尾）；mysteryic 锁死 6×6 且明删昨题；murdersudoku 官网仅 1 页；murdoku 纯品牌+书系变现（其 sitemap 有死链 /play/sitemap.xml 404）
- **三个品类真空**：①历史题归档+可检索解答页（mysteryic 删昨题/murdersudoku 无归档/murdoku 周更）→ 每日归档 URL 是持续 SEO 红利；②免账号异步挑战（多人仅 cluedoku 有且要账号+实时在线）→ 分享链接同题比时即差异化；③推理链分享/复盘（五站都只能分享用时）→ 契合 TikTok 传播，完全空白

## 2026-10-14（凌晨）arrows 攻略页 100 关真盘浏览器上线（deploy `604ae02c`，commit `38a334d`）

**数据管线（全部 scratch/，apkenv venv）**：
- L11-L100 关卡身份 = mph 页面内联 SVG 几何 ↔ APK bundle 逐支点集匹配（match_pipeline.py，偏移搜索，86 唯一命中 + 4 包内重复资源去重后全中）。mph 几何与 APK 数据 1:1 一致（关名 07-07 批次），其关卡序号在 L1-10/L50/L200/L500/L900/L11-14 共 19 个采样点全部对上
- **重要发现：mph 的 data-replay-steps 是自动生成、未经验证的假解序**——L12 第一步就撞它自己数据里 19 格带状箭头（cross_check.py，L11-20 全灭于第一步附近）。其盘面几何真、解序不可信。这坐实了攻略页对比表「auto-generated sites: level numbers dressed up as solutions」
- 100 关解序 = solve_tip.py 语义（尖端 path[0]、指向首段反向、走廊从尖端扫到出盘、双头双向贪心）批量求解，100/100 全解无回溯，sol 长度=箭头数逐关校验
- 产物：public/arrows-puzzle/levels.json（301KB，v0.23.1 包 3,983 关中前 100）

**页面（arrows-puzzle-walkthrough）**：
- 删 L1-3 三个手绘 SVG 板 + L4-10 事实表 → 交互式关卡浏览器（客户端 SVG 渲染 levels.json：格点+彩色折线+尾端编号圆点+双头 marker，100 按钮 picker + prev/next + 键盘左右 + #level-N 深链）
- GA4：guide_level_view（切关）+ guide_more_levels_click covered '1-100'；CTA 改「Want Levels 101 and up?」
- FAQ「How many levels」+ JSON-LD 同步更新：v0.23.1 包实测 3,983 关（不再说"无法知道总数"）
- ego-browser 实测：L1/L37/L90/L100 渲染+切关+双头方向文案（"send it left"）+深链全过；vision 读图验色（暖琥珀纪律 ✓）

**遗留**：murdoku/（untracked 实验目录）和 murder-sudoku 等他人改动仍在工作区，勿 git add -A；101 关以后有关注再扩

## 2026-10-14（上午）Murdoku MVP 游戏页上线（deploy `803a535d`，commit `1a5d9f0`）

**按交接单（HANDOFF-MURDOKU-MVP.md，已入 repo）完成第 2 批施工**：
- `src/pages/murdoku/index.astro`：SEOHead + JSON-LD（WebApplication/FAQPage）+ GameHub + AdSlot/SideAd；title 38 字符（+" | GridPaw"=45 压线）；TDK/H1 用通用词 murder sudoku，Murdoku 仅 legal-note educational 提及；水彩 UI 按 v3 原型（已抢救入 `design/murdoku-preview-v3.html`）
- GA4 打点全挂：game_start 可见性门控（visibilityState==='visible'，注释口径 2026-10-13 Clarity 取证）、first_move（__firstMoveTracked 防重）、level_up {level:'4x4'|'6x6'}、hint_click、胜利弹窗 share_copy/share_twitter/share_reddit；track() 带 gpTrack 转发；无死亡机制不挂 game_over
- `public/murdoku/worker.js`：6×6 生成走 Worker（单次 ~470ms+重试 1-2s），4×4 同步；Worker 失败兜底同步生成
- GameHub 加 Murdoku 卡（NEW 徽章）；图标 `game-icons/murdoku.webp` = biscuit 水彩橘猫重裁 128px/2454B（≤3KB）
- `/murder-sudoku/` 两处 CTA + FAQ 改「已上线」并链 /murdoku/

**施工中发现并修复 1 个 P0**：页面 .main 72rem 全宽时棋盘右列（cell 3/7/11/15）被右侧 160×600 广告层盖住，真实鼠标点击全部落在广告上（Playwright elementFromPoint 逐格实测，1280/1440/1920 全复现）。修复：`.game-card` 收窄 52.5rem(840px) 居中，符合 SideAd「内容列 ≤840px」设计假设（kenken 棋盘 496-784 即范式）。契约已写入 AGENTS.md 关键约定。

**验收链全过**：pnpm build（161 页）→ dist grep（门控注释/7 类打点/资产路径全中）→ Playwright **17/17**（bundle 浏览器上下文 API、game_start 门控+补发、受害格/冲突红闪、first_move 恰一次、撤猫、hint 报行列、4×4+6×6 hint 全解自动过案、三分享打点、6×6 worker 计数=1、game_start 不重发）→ deploy → 线上 ?cb= 五路 200（页面/引擎/worker/图标/资产）+ 门控注释与 CTA 链接在线上 HTML → IndexNow 200。

**测试基建坑（复用价值）**：① SEOHead 的 module script 会 `window.gpTrack = trackFunnel` 覆盖测试 stub——stub 必须用 getter+空 setter 的 defineProperty 保住；② Playwright evaluate 内模板串在浏览器侧求值，Node 变量不会插值，须先算好传参；③ 页面 `.sel-target` 高亮不排除受害者同行列/已占用格，测试落点须自算合法格。

## 2026-10-14（中午）game-switcher 头部下拉组件化（deploy `b423f127`，commit `3d03864`，卡 t_5f189695）

**结构债清偿**：30 个页面内联复制的 Games 下拉 → `src/components/GameSwitcher.astro`（games 数组单一维护点）。存量不同步修复：murdoku/kenken/binary/star-battle/hashi/slitherlink 此前只出现在自家页面，现全站 30 页统一 12 游戏。净 -175 行。

**验收（卡上六条全过）**：30 页 dist 断言（12 链接×顺序×active 前缀，子页 /akari/daily/ 自动落栏目）+ computed style 前后逐项一致（13px 字号/10×16 padding/200px 宽/12px 圆角）+ hover 展开截图 vision 前后比对 + Guides switcher（首页，5 链接）与移动端 hamburger 无回归 → 线上 4 页抽查（/、kenken、akari/daily、murdoku）菜单 12 链接全中。

**规范决策**：CSS 取 13 文件主流组值，变量全带 fallback（akari 系页面存在 --ink 等未定义情况）；采纳 murdoku 版 `.game-switcher-menu.open` 全宽生效（触屏笔记本上按钮点击可用，此前部分页面只有 hover 展开）。**遗留**：各页 <style> 里死亡 scoped switcher CSS（约 10 行/页，对新组件不生效）留待下次 neat-freak 清理；首页 Guides switcher 仍内联（5 条目静态，暂无同步需求）。

## 2026-10-14（下午）GSC 收录核查：/murdoku/ 已索引，无需加速

**GSC API 实测**（furriq-daily-brief key，sc-domain:gridpaw.com）：/murdoku/ = `Submitted and indexed`，lastCrawl **2026-10-14T01:43Z**（murdoku 上线部署之后）、verdict PASS；/murder-sudoku/ 同样已 indexed（01:37Z）。sitemap 三条目 0 errors，sitemap-0.xml lastDownloaded 10-12（含新页，81 URLs）。**未做 Request Indexing**（页面已索引，配额 1-2/run 不浪费）。IndexNow 已覆盖 Bing 侧（两次 200）。注：`furriq-daily-brief` SA key 实为 gridpaw GSC 唯一有权限的 key（~/.hermes/scripts/ 无 gridpaw 专属 key 文件）。

## 2026-10-14（下午）neat-freak：死亡 scoped switcher CSS 清理（deploy `cdf190db`，commit `bc8d276`）

GameSwitcher 组件接管后各页 <style> 的 switcher 规则对组件标记不生效（页面 scoped CSS 带 data-astro-cid，组件元素不命中页面 cid）——29 页 345 条死规则全清（含空壳 media query；首页保留 12 条给内联 Guides switcher）。验收：build 过 + 29 页 dist 断言 + computed style 前后逐项一致（13px/10×16/200px）+ 线上 2 页抽查 12 链接。净删约 -350 行。另：10-09 bot 簇取证（Nonogram 55 mistake + Nurikabe 10 集中单日单源）——Nonogram/Nurikabe「低 start」游戏真实参与度=每天 0-2 次操作级，watch item：10-14 /nurikabe/demo US mobile 11 事件同形态待 10-16 cron 拆。
