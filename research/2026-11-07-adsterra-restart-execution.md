# Adsterra 重启执行记录（2026-11-07）

> 对应简报：`research/2026-11-07-adsterra-restart-brief.md`
> 状态：闸 1/2/4/5 已在本地落地并验收；**未部署**（闸 5 明确「部署需法老单独批准」）；闸 3（邮件 Peter）排在公告上线之后。

## A. 第 4 节三件核实

### A1. Mediavine 是否要求独占 —— **核实到，硬性要求**

官方原文（journeymv.zendesk.com）：

- `articles/24656572667547`（Why Journey requires exclusivity）：「Journey ads by Mediavine require exclusive access to your ad inventory.」**「Anything that requires additional lines added to your ads.txt file violates exclusivity.」** 明列违规例：Taboola / RevContent / Disqus 基础版、「Testing other programmatic ads while running Journey - this includes A/B testing」。
- `articles/24209919201563`（How To Remove Your Existing Ads）：「any/all programmatic ads you may be running will need to be **removed for launch**」；onboarding 期 dashboard 会用一张表达式表检查残留广告代码（表内 18 家，**不含 Adsterra**，但政策面 > 该表，不是白名单）。
- `articles/34832302083483`（Journey Publisher Policies）：「Spoofed Content & Redirects … forced pop-unders and redirects」列为可终止项 —— Adsterra loader 自带 popunder 机器（STATUS 10-29 取证）属于这条的直接风险面。

**结论（三条，别混）**：
1. 「申请期挂 Adsterra 会被拒」——**未核实到明文**。拒审公开原因清单（`articles/23362046255003`）里没有广告网络一条。
2. 「Journey 广告上线时还挂着 Adsterra」——**明确违规**，且「试用/A-B 别家程序化广告」也算违规。所以「过审后再撤」的可操作窗口只有 审核通过 → 上线之间，且 onboarding 检测会在 launch 前抓旧广告代码。
3. **附带发现（独立问题）**：`public/ads.txt` 只有一行 `google.com, pub-5225990079437405, DIRECT` —— 按上面的定义，「多一条 ads.txt 行」本身就构成独占违规。申请/上线 Journey 前这行也得处理（AdSense 并未在投放）。

### A2. Adsterra 后台单元状态 —— **三个 unit 全 Active，无拒因**

`GET /api/sites` → gridpaw.com id `6063560`, status 2, ad_units `[5,25,49]`, `has_pending_ad_unit:false`
`GET /api/placements/6063560/extended` → 3 项，全部 `active:3`、`decline:null`：

| unit | id | 状态 | 当前 invoke 代码 |
|---|---|---|---|
| 160x600_1 | 31688449 | Active | `https://bauval.org/22/309484c05af1066efb6f321317c94311` |
| NativeBanner_1 | 31317669 | Active | `https://bauval.org/21/da224f8ab8a18845cf7b27479830ecfb`（**不启用**） |
| 300x250_1 | 31836413 | Active | `https://bauval.org/22/c3072bbbf851bb748d0bc833da23e21e` |

**⚠ 关键漂移**：160×600 的 invoke 域已从 `www.highrevenueformat.com/<key>/invoke.js` 轮换成 `bauval.org/22/<key>`。旧硬编码若照原样恢复 = 挂一个作废 URL。已改 `SideAd.astro` 与 `.adsterra/banner-160x600.snippet.md`。

### A3. DLES.gg（Peter）—— **未问，邮件稿已备，按闸序排在公告上线之后**

Peter 10-29 原话是「keep delisted for now — 不够信任我们不会过阵子悄悄把原 ads 挂回来」。所以邮件必须在他能查到公告之后发，顺序不能倒。

## B. 六道闸执行状态

| 闸 | 内容 | 状态 |
|---|---|---|
| 1 | `/changelog/` 公告 | ✅ 已写入 `src/lib/changelog-data.ts`（2026-11-07 条目）+ 页面 dateModified/Last updated 同步 |
| 2 | terms §7 + privacy cookie 表 | ✅ 已改（详见下） |
| 3 | 邮件 Peter | ⏸ 稿已备，等闸 1 上线后发 |
| 4 | 代码恢复（只开 banner） | ✅ `InContentAd.ADSTERRA_OFF=false`、`SideAd.ADSTERRA_OFF=false`、`AdSlot.native` 保持 false |
| 5 | 本地验收 | ✅ 见 C 节；**部署未执行，等法老批准** |
| 6 | 上线后 14 天观察 | ⏸ 部署后再起（Adsterra 后台 imp/CPM + GA4 内容页会话 + 跳转投诉=当天撤） |

### 闸 1 公告文案要点
「Display banners come back on the guide and reference pages…an ad is a fixed rectangle with an Advertisement label above it, it never sits inside a puzzle or over a board control, and no unit we run can open a new tab or move you off the page. The home board and the game pages stay clean.」＋「If an ad ever redirects you … the whole network comes down that day, exactly as it did in October.」10-29 的「ad-free」历史条目保留不改。

### 闸 2 法律文本改动
- `terms/index.astro §7`：从「currently runs without ads」改为「is supported by advertising」+ 明写只在信息页出 display banner、不入谜题、不跑开新标签/重定向格式、每槽带 Advertisement 标签、跳转投诉当天撤网。
- `privacy.astro`：cookie 表 Adsterra 行去掉 `(historical)`，改为在用并写明「fixed display banners on informational pages only; no redirect / pop-under / social bar / interstitial」；Advertising 段同步重写；CMP 那句从「will be introduced」改为「is planned，未上线期间按 Adsterra 政策、可自行屏蔽」避免假承诺；删掉「plan to display AdSense」段（与实际方向相反），改成「换合作方会先更新本页」。

## C. 闸 5 本地验收（Playwright，dist 静态服务 8899，invoke.js 用本地 stub 拦截以验链路与 atOptions 时序）

样本 7 URL × 2 视口（390×844 / 1440×900）＋ 游戏面 17 URL × 2 视口：

| 项 | 结果 |
|---|---|
| 注入链路 | ✅ 300×250 只进 `.gp-incontent-ad__slot`、160×600 只进 `.gp-side-ad--*`；`__gpAdChain` 串行时序正确（incontent 先、side 后），atOptions 各拿各的尺寸 |
| 空槽 | ✅ Native 全站 0（`container-da224…` = 0） |
| 移动端 | ✅ 侧栏 display:none；正文 300×250 显示 |
| `?embed=1` | ✅ 0 注入，且空 div 已隐藏（探针发现旧逻辑只 `return` 不隐藏 → 已修 hideSlots） |
| 横向溢出 | ✅ 34 个页面×视口组合 0 溢出 |
| 遮挡（elementFromPoint 4 个滚动位） | ✅ 0 处广告层命中真实可点元素 |
| CLS | ✅ 容器固定 250 / 600 高，stub 前后几何不变 |
| Advertisement 标签 | ✅ 正文槽有；**侧栏槽历史上无标签**（见 D2） |
| 真填充 | 未验（CN 出口 Adsterra 403 是预期，只能看后台 imp，别据此判死） |

dist 计数：`gp-incontent-ad` DOM 74 页（全部是 BP3/rotate-rings/rooms-and-exits/loop 攻略面，游戏页 0）；`gp-side-ad` DOM 145 页（含首页与游戏页，见 D1）。

## D. 待法老决定（两条，都影响部署）

1. **SideAd 覆盖面**：§5.4 只让「翻开关」，翻完 = 回到 10-29 前状态，侧栏 145 页全铺，含**首页 + 全部游戏页**。而 §6 方案写「游戏页 / 首页棋盘 = 无」。数据面：该 unit 两周 228 imp / $0.18 / CPM $0.78，剥掉游戏面损失 ≈ 分币级；收益面留着的唯一理由是「零成本」。要不要按 §6 剥掉？
2. **SideAd 无 Advertisement 标签**：正文槽有，侧栏 160×600 从来没有。要不要补（补法=容器上方加一条 10px 灰字，几何变 620 高）？

## E. 部署节奏建议（闸序不可倒）

- **部署 A（公告上线，广告仍关）**：把三个组件临时置回 OFF → build → deploy → 线上 curl 验 `/changelog/`、`/terms/`、`/privacy/`。
- **邮件 Peter**：附 changelog 链接，问「静态 banner + 当天撤网 tripwire 你是否接受」，明确「不是通知你我们要上，是问」。
- **部署 B（广告开）**：Peter 回复后、法老点头 → 翻回 false 再 build/deploy。
- 反过来做（一次带上广告部署）会当众违反 10-29 公告里「any advertising will be announced on this page first, before it goes live」这句话。

## F. 执行结果（2026-11-07 收尾）

法老当日两个决定：① **SideAd 按 §6 剥掉首页/游戏页/solver**；② **DLES/Peter 这条先不卡**（"先不用管 dels 了，不上影响用户级（体验）的就好了"）——邮件稿保留在 `2026-11-07-peter-email-draft.md`，未发送。

- **部署 A（公告上线，广告关）**：`0d47a10e`（branch main）→ 线上 `/changelog/` `/terms/` `/privacy/` 三段新文案 curl 实拉命中，广告脚本 0。
- **部署 B（广告开）**：`618a22c6`（branch main）→ 线上 `/brain-puzzle-3-level-1/` 有 2 个 bauval 脚本 + 3 个 slot；`/akari/` 与 `/` 广告 0（连 CSS 都不内联）；mobile/desktop 线上复验 0 溢出 0 遮挡。
- **构建源**：从 HEAD 干净 worktree 打包（主工作区带未上线 WIP：Rooms & Exits 11 关 + SolverTiles 改版）。只拷 7 个改动文件 + `research/loop-answers/*` + `public/<indexnow-key>.txt`（gitignore，缺了 build 红）。
- **IndexNow**：changelog/terms/privacy 三 URL HTTP 200。
- **未提交**：改动仍在主工作区工作树（未 git commit，按惯例交法老）。

### 遗留风险
1. **主工作区的 WIP 会污染下一次 cron 部署**：`loop-hints-pull.sh` 的 14:00 发布链会 build+deploy 本工作区，届时 Rooms & Exits / SolverTiles 会随之上线。要么尽快提交/验收那批 WIP，要么在它上线前拦。
2. **Journey 上线前必须撤 Adsterra**（独占条款）+ 处理 `ads.txt` 的 google 行。窗口=审核通过→上线，很短。
3. 侧栏 160×600 无 Advertisement 标签（历史如此）；若之后有人投诉误点，这条是第一个补的。
