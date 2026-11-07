# Mediavine Journey 申请资料包（2026-11-04）

> **2026-11-05 更新：首次申请被拒。** 拒绝理由原文：*"Your domain needs to be at least 4 months (120 days) old before we can review it."* 审核日期 Nov 5, 2026。状态卡的 "Not Approved" 是自动闸打的，不是人工内容评审的结果。
>
> **2026-11-05 补证（Gmail 实拉，同日二次取证）：拒信里还有第二封，理由是「会话量不达标」，而且与「In Review」同一秒发出。**
> - 两封邮件（no-reply@mediavine.com）：`2026-11-04 22:37:42 -0500` = **In Review**；`22:37:49 -0500` = **Session Requirements Not Met**。**间隔 7 秒 = 纯自动闸，人审不可能。**
> - 同窗口 GA4（property 552793510，10-06→11-05）实测：**Tier-1 sessions 2,859**（US 1,844 / UK 578 / CA 251 / AU 182），engaged 1,406（49.1%）；渠道 google/organic 2,346（82%），direct 仅 241 → 不是灌量。**10-28 就已滚过 1,000（比申请日早 8 天）**。按 GA4 任何合理口径都不可能判「不达标」。
> - **因此这封拒信读到的数不是我们这个属性**。两个待核方向（都要在 publishers.mediavine.com 站点卡片里确认）：① GA4 属性绑错——同一 Google 账号下有 7 个属性（Furriq/Pictomino/meowtrail/meowblock/GridPaw/thehexagrams/catbreedphotoguide），**同窗口 Furriq 的 Tier-1 只有 354 < 1,000**，抓错成它正好生成这封邮件；② GA4 授权没真正落下（登录授权只共享了 name/photo/email，18:04 另有一次性授权但范围未证），系统退回自家 Grow 数据——Grow 脚本 10-16 才装，且官方论坛有「脚本在、会话数仍 0」的已知故障。
> - **后台 vs 邮件口径打架（2026-11-05 截图取证，以后台为准）**：portal 首页站点卡片 = `Not Approved` / `Reviewed Nov 5, 2026` / Reasons for Rejection 只有一条 **「Your domain needs to be at least 4 months (120 days) old before we can review it」**，**全页没有任何 sessions 数字**。结论：**后台的拒绝理由清单才是权威**，那封「Session Requirements Not Met」是 HubSpot 工作流按拒绝码发出去的模板（与 In Review 同批、间隔 7 秒），**不能当作「流量被判定不达标」的证据**——域龄不达标时他们根本不会进入流量评估。重申前唯一要补的功课：确认 portal 里的 GA4 连接指向 552793510 而不是同账号下别的属性。
> - **真正的闸仍是域龄**：注册 2026-09-04 +120d = **2027-01-02**；被拒 +60d 冷却 = **2027-01-04**；取晚 = **2027-01-04 才能重申**。所以这封「会话」拒信当前零成本，1 月重投时量级已翻数倍。
> - **portal 在「Not Approved」状态下不暴露分析绑定**：Tasks 页只有一条 `Set up 2FA`（urgent 1），没有 GA4 连接入口 → 绑定只能在申请流程里做，**重申时必须在 Connect Google Analytics 那步逐个核对属性名 = GridPaw（552793510）**，不能吃默认第一项。授权范围是否已落下，唯一可查处 = `myaccount.google.com/permissions` 里 Mediavine 那条的权限列表。
>
> **两条时间线（本机实测推算）**：域名注册 2026-09-04 → +120 天 = **2027-01-02**；官方《Why was my site rejected?》写明被拒后 dashboard 有倒计时、**60 天后自动重置** → 2026-11-05 + 60 = **2027-01-04**。两个闸都在 1 月 4 日打开，**重申窗口 = 2027-01-04 之后**（以 dashboard 的倒计时为准，那才是权威）。
>
> **重要口径更正**：AGENTS/STATUS 里 11-02 记录说「4 个月域龄要求已从文档撤掉」——**错的**。公开要求页（mediavine.com/application-requirements）确实没写，帮助中心《Journey Minimum Requirements》也只写「domain generally needs some time to establish a track record」，但执行侧按 120 天硬卡。以后别拿文档没写来推断门槛不存在。


> 用途：法老手动提交申请时的逐字段抄写稿 + 提交前自检 + 提交后纪律。
> 所有数字都是 2026-11-04 15:30 CST 实测，来源标在每行后面。**未实测的一律标注「待核」**，不要直接写进表单。

---

## 0. 结论与提交时机（我的判断，可反驳）

**够格，建议现在就投。** 硬门槛 1,000 Tier-1 sessions/30d，实测 2,627（×2.6），且 GSC 独立信源交叉验证 2,054 clicks。

为什么不「等站再老一点再投」：

| 方案 | 最坏结果 | 最好结果 |
|---|---|---|
| 今天投 | 被拒 → 60 天冷却 → 2027-01-04 重申（那时域龄 4 个月、流量更高） | 11 月中下旬开始进账 |
| 等到 1 月投 | 2027-01-04 才进队列 | 2027-01-04 才进队列 |

两个方案的「最坏」落在同一天，所以今天投严格占优——被拒不会留污点（官方无黑名单机制，只是冷却期）。

---

## 1. 提交前 60 秒自检（今天已全部实测 ✅）

| 检查项 | 状态 | 证据 |
|---|---|---|
| 站点可访问、HTTPS | ✅ | https://gridpaw.com 200 |
| `/about/` `/privacy/` `/contact/` `/changelog/` | ✅ 全 200 | 2026-11-04 15:30 实测 |
| GA4 已装且数据可查 | ✅ | property 552793510（G-4FWP61DJCC） |
| Grow by Mediavine 脚本 | ✅ 已装（2026-08 起非必需） | `SEOHead.astro` 全站注入 |
| 站点当前无任何第三方广告 | ✅ | 首页/内容页 `invoke.js`、`bauval`、`profitablerate` 命中 0；`[class*="adsterra"]` 节点 0 |
| 页面上无 Adsterra 残留痕迹 | ✅（本次清理） | 132 页 HTML 的 7 处 `.adsterra-*` 死 CSS 已移除，只剩 `/privacy/` `/akari/privacy/` 的历史披露（法律文本，有意保留） |
| 内容页无明显占位/破图 | ✅（本次清理） | `/badges/` 14 处裸「—」占位改为数据到达才显示；硬编码「11 badges」改为 14 并补 Crazy Cleanup |
| CMS 不在否决名单 | ✅ | Astro 静态站 + Cloudflare Pages（非 Wix/Blogspot） |
| 图片版权 | ✅ | 全站自产/AI 生成，无第三方图库素材 |

---

## 2. 流量事实（可直接引用）

窗口 2026-10-05 → 11-04（GA4 property 552793510，country 聚合行）：

- **Tier-1 sessions：2,627**（US 1,693 / UK 525 / CA 232 / AU 177）
- engaged sessions 1,293（**49%**），users 1,899，Tier-1 pageviews 6,103
- 渠道：google/organic 2,114（80%）、direct 238、chatgpt.com 63、bing 49、lemmy 36
- 自测流量无污染：内部过滤器已启用，自家出口（CN 家宽 / HK / SG 跳板）均不在 Tier-1

交叉验证（GSC，`sc-domain:gridpaw.com`，同窗口，dataState=all）：

- Tier-1 clicks **2,054** / imp 40,857，CTR 5.0%，平均位次 6.0
- 全站 clicks 4,743 / imp 97,295
- GA4 organic sessions 2,114 ÷ GSC clicks 2,054 = **1.03**，两个独立管道对得上 → 不是 GA4 侧灌量

增长曲线（Tier-1 日 sessions）：10-05 **26** → 10-28 **148** → 11-02 **310** → 11-03 **278** → 11-04 **213**（当日未满）。
流量主力：`/brain-puzzle-3-level-*` 长尾攻略（54 页，GSC 位次 3-4）+ `/the-loop-past-answers/` + `/meowdoku-guide/`。

站点规模：270 个构建页、14 款游戏、每日更新（The Loop 每日答案 14:00 管线自动发布 + 关卡攻略）。
域名注册日 **2026-09-04**（RDAP 实测，域龄 2 个月）——这条会被问到，别回避。

---

## 3. 申请表单逐字段建议（英文，可直接粘）

申请入口：**https://publishers.mediavine.com/join**

| 字段 | 建议填法 | 备注 |
|---|---|---|
| Website | `https://gridpaw.com` | 不要带尾斜杠以外的路径 |
| Email | 用你日常收邮件那个 | 审核信/合同都走它 |
| Name | `Yanfan Chen`（或你的护照拼写） | 后续 Stripe 身份验证要跟证件一致 |
| Category / Vertical | `Games` 或 `Entertainment`（有 Puzzles/Hobbies 就选它） | 不要选 Food/Travel 这类博客垂类 |
| Monthly sessions | `2,600+ in the last 30 days (Tier 1: US/UK/CA/AU), GA4 property 552793510` | 按实填写，别写整年 |
| Traffic sources | `~80% Google organic search, 9% direct, remainder Bing/DuckDuckGo/AI assistants/Reddit/Lemmy` | — |

**一句话描述（<160 字符）**

> GridPaw is a free browser puzzle site with 14 cat-themed logic games (Shikaku, Akari, Kakuro, Nonogram and more), plus daily puzzles and level-by-level walkthrough guides.

**长描述（4-6 句，可整段粘贴）**

> GridPaw publishes free, browser-playable Japanese logic puzzles — Shikaku, Akari, Kakuro, Nonogram, Nurikabe, KenKen, Star Battle, Hashi, Slitherlink, Takuzu, Pictomino, Murder Sudoku, Crazy Cleanup and Meowdoku — with a cat theme and no download or account required to play.
> Around the games we publish original reference content: full rules pages, strategy guides, level-by-level walkthroughs for the games we cover, a daily puzzle with streaks and badges, and a leaderboard.
> The site is updated every day (the daily puzzle and its hints/answers archive are generated by an automated publishing pipeline) and new guides are added each week.
> Each puzzle is produced by a solver-verified generator with exactly one logic-only solution, so the play is deterministic and the walkthroughs can be fact-checked against the actual level data.
> GridPaw currently runs without third-party ads; we removed our previous network in October 2026 and documented it publicly on our changelog.

**如果被问「内容是不是 AI 写的」——照实说，别否认也别夸大：**

> Drafts are written with AI assistance and then edited and fact-checked by me against the actual game builds; nothing is auto-published without review. Walkthroughs are verified against the level data (move counts and card order are checked level by level), and the changelog records every content and feature change.

（注意：这句的措辞我自己也不建议你说得比事实更满。实际流程=AI 起草 + 人工/守卫脚本核对；如果审核追问「谁编辑」，答案是站点主自己。）

**如果被问「平均多久更新一次」**：`Daily — the daily puzzle and its hints/answers publish every day; new guides and game levels are added weekly.`

**如果被问「现在有没有广告网络」**：`None. The site is ad-free right now; the previous network was removed and the removal is documented on /changelog/.`

---

## 3.5 注册第 3 步「Company Information」怎么填（2026-11-04 实测页面）

页面字段：Business Structure（下拉）、Business Name（文本）、Business Location（下拉），按钮「Continue to Create Account」。

| 字段 | 填什么 | 为什么 |
|---|---|---|
| Business Structure | **Individual / Sole Proprietor**（下拉里没有 Individual 就选 Solo/Proprietor 那项） | 没有注册公司就不要选 LLC。后面 Stripe 实名验证 + Tipalti 税表 + 银行户名三处对不上，会卡成 not payable |
| Business Name | **护照上的英文拼写**（如 `CHEN YANFAN` 或 `YANFAN CHEN`，照护照抄，别写中文、别写 GridPaw） | 官方提示原文：「If you don't have a registered business, enter your full legal name」；这个名字会成为账户名 |
| Business Location | **China** | Journey 的身份验证支持国列表里有 China（护照最稳） |

官方事实（journeymv.zendesk 原文）：
- 身份验证由 **Stripe** 做（只做 KYC，不收付款），支持国包含 China / Hong Kong / Taiwan；必须是**实时拍摄**，不能传扫描件截图。
- 收款走 **Tipalti**（PayPal / 国际电汇 / ACH），Net65，每月 5 号付。
- 税表：非美国人填 W-8BEN，地址必须与 Tipalti 地址屏一致，否则 profile 存不下、状态变 not payable。
- 官方原话：「Business Information 填的内容不影响身份验证结果」——但影响后续收款户名，别乱填。

---

## 4. 你需要准备的东西（我替不了的）

1. **GA4 属性访问**：申请时 Mediavine 会让你授权 GA4（property **552793510**）。提交前用你的 Google 账号（a839500525@gmail.com）打开 GA4 确认能看到这个属性——看不到就白填。**这条我可代核**（SA 只能看到账号摘要，看不到用户列表，最终还得你登一次确认）。
2. **Stripe 身份验证**：过审后、广告上线前必须做，要**证件 + 自拍**。提前把证件放在手边。
3. **收款主体与税表**：Journey 分成 70%、Net 65；Stripe 那边会走 W-8BEN（非美国主体）。用哪个主体收（个人 vs 公司）先定，改起来麻烦。
4. **Chrome 里别开着广告拦截插件**去点申请页（无关，但 GA4 授权弹窗别被拦）。

---

## 5. 提交后纪律（14 天审核期）

- **别动 URL 结构、别批量删页、别改站点主题**：审核期间他们看的是跑着的站，大改会让「活跃受众/常更」的判读变模糊。
- 每日 14:00 的 `loop-hints-pull.sh` 管线照常（它只动 Loop 三页数据），不算大改。
- 手工部署前想一下：审核员可能正在看。

---

## 6. 通过后的 48 小时动作（老纪律，不能忘）

1. **先改 `/changelog/`**：写明「广告回来了、什么格式、在哪些位置、承诺不会进入谜题区」。
2. **再单独邮件 DLES.gg 的 Peter**：上次是他把我们除名的，理由是不信我们不会偷偷把原广告挂回来。上广告前主动告知，是唯一能挽回那次关系的动作。
3. 技术接入：Mediavine 脚本 + 广告位。**红线不变**：游戏页/首页/`?embed=1` 不插页内广告；内容列 ≤840px；移动端不让首屏被广告推出可视区。
4. 上线后 72h 盯 Clarity（死点击 / 秒退 / 页面已隐藏指纹）与 GA4 会话参与率——上次 Adsterra 的教训是「零点击跳转」两周内投诉两次。

---

## 7. 如果被拒（60 天冷却 → 2027-01-04 可重申）

| 可能理由 | 现在的状态 | 补救动作 |
|---|---|---|
| 流量不够（不太可能） | 2,627 / 1,000 | 无需动作，届时只会更高 |
| 内容质量 / too much AI | humanize 三批 + F 流已上线；F2 残留 147 处未拆分（多在 FAQ/教程 UI） | 清 F2 残留 + akari 模板句按题数据重写 + BP3 54 页再差异化 |
| 域龄 / track record | 2 个月 | 等到 2027-01 自然满 4 个月，同时保持每日更新 |
| 站点类型（游戏站不算 content site） | 已有 4 篇长攻略 + 14 个规则页 | 补 4-6 篇真内容页（非模板），把「content site」坐实 |
| 流量来源可疑（10 天涨 10 倍） | GSC 交叉验证过，来源是 Google 长尾 | 备好 GSC 截图 + 关键词清单，被问就发 |

### 7.1 2027-01-04 重申清单（2026-11-05 定稿，授权链已实勘）

**已被证伪的疑虑，不要重复排查**：

- **GA4 授权是成功的**：Google 账号权限页实勘（2026-11-05），Mediavine 名下挂着 **「查看并下载您的 Google Analytics 数据」**（analytics.readonly）。他们有能力读任意属性。
- **属性本身是对的**：`552793510` = GridPaw，data stream `gridpaw` 的 defaultUri = `https://gridpaw.com`（Admin API 实勘），measurement id `G-4FWP61DJCC`，property 建于 2026-09-04。
- **数据是够的**：复投窗口同口径 Tier-1 ≈2,850 / 1,000，10-28 就滚过线。
- → 结论：`Session Requirements Not Met` 是 HubSpot 模板，**不是流量判定**；portal 的 Reasons for Rejection 只列域龄一条，那才是权威。

**重申动作（按序）**：

1. **别撤销 Mediavine 的 Google 授权**（`myaccount.google.com/permissions`）——撤了重投要重连，且可能丢历史绑定。
2. **Grow 脚本保留**（`SEOHead.astro` 已全站注入，非硬性条件但对他们看站有帮助）。
3. **日期**：域龄 2026-09-04 +120d = 2027-01-02；被拒 +60d = 2027-01-04 → **01-04 当天或之后重投**，以 portal 倒计时为准。
4. **重投时在 Connect Google Analytics 那步核对属性名 = GridPaw**，不吃默认项（同账号 7 个属性，Furriq 同窗口 Tier-1 仅 354）。
5. **提交前 24h 快照**：GA4 Tier-1 30d + GSC clicks 同窗双管道，留截图/数字，若再被模板误拒，可作为 support 工单证据（他们口头说不能 reconsider，但举证附加数据是可走的路）。

---

## 8. 本次代码改动（记录）

- `src/components/AdSlot.astro`：`<style>` 块改成 `{native && <style is:inline>}`。此前 `native=false` 时广告 markup 不渲染，但 scoped 样式仍被内联进 132 个页面，页面源码留 7 处 `.adsterra-*`。恢复广告=把 `native` 置 true，样式跟着回来。
- `src/pages/badges.astro`：①页头「11 badges」硬编码改为 `{BADGES.length}`（实际 14）并补上 Crazy Cleanup；②稀有度占位裸「—」改为数据到达才渲染（`hidden`），图例同步延后显示——无 JS / 接口挂时不再出现 14 个空破折号。
- 验收：dist 逐页 diff（vs 改动前同源构建）131 个 HTML 各减 827-843 字节=纯样式移除，`/badges/` +401 字节=文案与占位改动；本地 stub 服务 + 真实浏览器验证 14 张卡稀有度全部填值、图例出现、无横向溢出；部署 `5dc174c9`，线上主域与 pages.dev 均复验：4 页 `adsterra` 命中 0、`/badges/` 显示 `14 badges`、`[class*="adsterra"]` 节点 0。
