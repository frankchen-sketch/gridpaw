# GridPaw 广告布局总表（2026-11-07 定稿待批）

> 目的：一次把「广告在哪些页、哪些宽度、哪个位置」定死成合同，往后不再一页一页试。
> 线上现状快照：部署 `da977b9f`（branch main，2026-11-07 22:5x）。

## 1. 三个投放单元（物理规格）

| 单元 | unit id | 尺寸 | 形态 | 定位 | 状态 |
|---|---|---|---|---|---|
| SideAd | 31688449 | 160×600 | `position:fixed` 贴左右缝 | 内容列之外，垂直居中 | **在用** |
| InContentAd | 31836413 | 300×250 | 流内（非悬浮） | 攻略页正文视频/图文正下方 | **在用** |
| NativeBanner | 31317669 | 自适应卡片 | 流内卡片 | — | **关闭**（`AdSlot` 硬编码 false） |

**永久禁用**：popunder / smartlink / social bar / interstitial / 任何开新标签或整页跳转的格式。

## 2. 全站布局矩阵（= 合同）

按 dist 实测页数（2026-11-07 部署 `da977b9f`：侧栏 133 页、正文 68 页、全站 270 页）。

| 页面类 | 页数 | ≥1350px 桌面 | 1200–1349 笔记本 | 768–1199 平板 | <768 移动 |
|---|---|---|---|---|---|
| 首页（Shikaku 棋盘） | 1 | 左右 160×600 | 零 | 零 | 零 |
| 游戏页（11 引擎 + Meowdoku + Murdoku Trail + kakuro 等） | 13 | 左右 160×600 | 零 | 零 | 零 |
| 攻略页（BP3 54 + rotate-rings 12 + loop 1 等） | 68 | 左右 160×600 + 正文 300×250 | 正文 300×250 | 正文 300×250 | 正文 300×250 |
| 一般内容页（含 japanese-logic-puzzles 等） | 22 | 左右 160×600 | 零 | 零 | 零 |
| 多语言页 `/de/` | 30 | 左右 160×600 | 零 | 零 | 零 |
| solver 页 | 4 | 零（组件未挂载） | 零 | 零 | 零 |
| `?embed=1`（内嵌游戏 iframe） | — | 零 | 零 | 零 | 零 |

**一句话**：侧栏只在「有缝」的宽屏上出现，正文广告只在攻略页出现；移动端只有攻略页有那块 300×250，其余全零。

## 3. 几何安全边界（为什么是 1350）

- 内容列契约：≤840px（AGENTS.md 硬规则，SideAd 的 160×600 依赖它）。
- 侧栏位置：`left/right = max(8px, (100vw - 840px)/2 - 160px - 32px)`，即「内容列边缘 → 32px 空 → 160px 广告」。
- 需要 `(100vw - 840)/2 ≥ 192` → `100vw ≥ 1224` 才能放下；但 1224–1350 时两侧合计几乎吃掉全部留白，观感=贴脸（2026-10-16 从 1200 上调到 1350 的原因，Reddit 玩家实测误点开新标签）。
- **结论：1350 是观感下限，不是数学下限**。1350 宽时单侧缝 = 255px（192 用掉 + 63 余量）。
- 移动/平板：无侧栏，连空盒子都不输出（CSS 媒体查询与 JS 阈值都锁 1350，JS 挂了也不会留白块）。

## 4. 已验证的事实（2026-11-07 实测）

| 断言 | 证据 |
|---|---|
| 广告矩形与游戏棋盘/按钮零相交 | 34 个「游戏页×视口」组合，`elementFromPoint` 4 个滚动位，命中数 0 |
| 无横向溢出 | 同上 34 组合 + 攻略页/内容页样本 0 |
| CLS = 0 | 容器固定 250 / 600 高，stub 注入前后几何不变 |
| `?embed=1` 零注入 | 内嵌页 0 个 slot 有内容，空 div 已 display:none |
| 移动端侧栏零 | 390 视口 `display:none`、`childElementCount=0` |
| 串行注入不打架 | `__gpAdChain`：300×250 先、160×600 后，atOptions 各拿各尺寸 |
| 无 Native | dist 全站 `container-da224…` = 0 |

## 5. 待拍板（5 项）

| # | 问题 | 选项 | 我的推荐 |
|---|---|---|---|
| D1 | 「移动端不加」的范围 | A 只撤侧栏（现状，攻略页仍有 300×250）／B 移动端全站零广告（攻略页 300×250 也撤） | **A**：攻略页承载全站 71% 流量，移动端撤掉等于把变现面砍掉大半；300×250 是流内固定位、不在游戏区、不遮挡 |
| D2 | 侧栏要不要加 `Advertisement` 标签 | A 保持现状（无标签）／B 容器上方加 10px 灰字（盒子变 620 高） | **B**：误点投诉是唯一能一招致命的债，标签是最便宜的护栏 |
| D3 | 攻略页 300×250 的位置 | A 现状（视频正下方）／B 挪到正文中段／C 首屏之后 | **A**：正下方是内容自然断点，且已验证零 CLS |
| D4 | 1280 笔记本（无侧栏）要不要补位 | A 不补／B 塞 120×600 窄版（会贴脸）／C 补一条底部 sticky 横条 | **A**：B/C 都在拿信任换分币 |
| D5 | 首页要不要保留侧栏 | A 保留（现状）／B 撤掉首页 | **A**：几何上零相交，且首页是 Shikaku 排名页 |

## 6. 一次性验收方案（拍板后跑一遍，不再逐页改）

一个脚本覆盖「页面类 × 视口 × 滚动位」：

- 页面类样本：首页 / 每种游戏页各 1（13）/ solver 1 / 攻略页 3（BP3、rotate、loop）/ 内容页 2（含 iframe 的 japanese-logic-puzzles、logic-puzzle-grid）/ de 1 / `?embed=1` → 约 22 URL
- 视口：1920 / 1440 / 1350 / 1349 / 1280 / 768 / 390（**1349 是关键边界**，验「差 1px 就不出现」）
- 每个「页面×视口」× 4 个滚动位，断言：
  1. 广告矩形 ∩ 游戏容器（canvas / iframe / button / a） = ∅
  2. 广告矩形 ∩ 内容列 = ∅（侧栏专用）
  3. `scrollWidth ≤ innerWidth + 1`
  4. 每个 slot 的 `getBoundingClientRect().height ∈ {250, 600}` 或 `display:none`
- 输出：红/绿表，任一红格先修再谈上线。

## 7. 不做的事（红线，写死不重开）

- 移动端侧栏 / sticky 底栏 / interstitial
- Native 卡片（要开必须单独说服法老）
- 任何 on-click 跳出、popunder、smartlink
- 广告出现在棋盘内、按钮上、谜题控件附近

---

## 8. 法老 2026-11-07 三条决定 → 落地设计 v2

| # | 决定 | 落地含义 |
|---|---|---|
| D1 | 「移动端只加顶部和信息流，不让用户误点」 | 移动端**新增顶部横幅**（320×50 新 unit）+ 攻略页信息流 300×250；无侧栏、无底部 sticky |
| D2 | 侧栏补 Advertisement 标签 | 容器 620 高（600 广告 + 20 标签条），10px 灰字 |
| D3 | 1280 笔记本补 728×90 底部 sticky | **需新建 2 个 unit**（320×50 / 728×90），走后台 API 建，新 key 写进组件 |

### ⚠ 实测拦下的冲突：底部 sticky 横条会压住游戏控件

1280×832 实测 13 个游戏页，**底部 90px 带内的可点元素 = 38 个，分布在 7 个游戏**：

| 游戏 | 命中控件 | 具体 |
|---|---|---|
| the-loop-puzzle | 11 | 棋盘边线可点目标（`horizontal edge R0`…）= 游戏本体 |
| slitherlink | 10 | 棋盘边线 + 「New Puzzle →」「📋 Copy」「𝕏 Share」「👽 Reddit」 |
| kenken | 5 | 游戏切换卡 4 + 1 |
| akari | 4 | 「Skip」「Watch how →」+ 2 张卡 |
| hashi | 3 | 数字按钮 6 / 4 / 2 = **游戏输入本体** |
| murder-sudoku | 3 | 「Play murder sudoku」等 CTA |
| murdoku | 2 | 「💡 Hint」「🔎 Accuse!」= **游戏关键操作** |

→ 直接违反红线「广告不得出现在谜题内或棋盘控件上」，也违反 D1 的「不让用户误点」。
**建议：sticky 横条只在非游戏面（攻略/内容/de/solver 之外的静态页）出现；13 个游戏页 + 首页在 1280–1349 保持无广告。**

补充数据：1280 宽时侧栏其实**放得下**（单侧 220px，160+32 空隙=192 ≤ 220）。所以 1280 游戏页不是「没位置」，而是「贴得太紧」——这个取舍和 sticky 横条无关。

### 修订矩阵（待确认）

| 页面类 | ≥1350 | 1280–1349 | 768–1279 | <768 |
|---|---|---|---|---|
| 首页 | 左右侧栏(带标签) | 无 | 无 | 顶部 320×50 |
| 游戏页 ×13 | 左右侧栏(带标签) | **无**（sticky 会压 38 个控件） | 无 | 顶部 320×50（棋盘之上，不覆盖） |
| 攻略页 ×68 | 侧栏 + 正文 300×250 | sticky 728×90 + 正文 | sticky + 正文 | 顶部 + 正文 |
| 内容页 / de | 侧栏(带标签) | sticky 728×90 | sticky | 顶部 320×50 |
| solver ×4 | 无 | 无 | 无 | 无 |
| `?embed=1` | 全零 | 全零 | 全零 | 全零 |

## 9. 最终执行态（2026-11-07 22:5x 落地，部署 2a02ae04）

一个组件三个位：`src/components/SideAd.astro`（文件名沿用，避免 137 处 import 改动），276 页挂载（全站除 admin/legal/contact/offline/reset-password）。

| 视口 | 位 | 尺寸 | 单元 id | 实测 |
|---|---|---|---|---|
| ≥1350px | 左右侧栏 + 10px 灰字 Advertisement | 160×600 ×2 | 31688449 | display=block，body padding 0 |
| 768–1349px | 底部 sticky + 标签 + 关闭钮 | 728×90 | 32144316（新建） | display=flex，body padding-bottom 100px |
| <768px | 顶部条，插在 header 之后（棋盘之上，不覆盖） | 320×50 | 32144309（新建） | display=block，header 后 in-flow |

验收（Playwright，真实 UA，`/api/geo` mock US，6 视口 × 6 页 = 36 组合）：
- 横向溢出 0；侧栏进内容列 0；顶部条真遮挡 0
- sticky 在 768/1349 命中游戏卡（已知豁免）；390 上 akari 报的 `📋 Copy Image/⬇️ Save` 是 `.win-overlay`（opacity:0 + pointer-events:none）的幽灵元素，假阳性
- 阈值边界 1350/1349、768/767 全对

**踩坑（必记）**：不能拿 `getComputedStyle` 判「该位是否显示」——组件 `<style>` 在脚本执行后才生效，实测 1440 桌面被误加 `gp-has-sticky`（body 白留 100px）。JS 必须用与世界面完全一致的阈值常量（showRail/showSticky/showTop），与 CSS 两处同步改。

## 10. 待办（法老 2026-11-07 决定排到最后）：付费去广告点位

不现在做。真要做之前必须先回答三件事，否则做完就是白做：

1. **收款与权益载体**：站点是静态的、没有账号体系。付款后权益只能落 cookie/localStorage 或一个带 token 的恢复链接——前者清缓存即失效（可接受，游戏站客单低），后者要额外一套兑换页。走哪家 MoR（Subotiz / Waffo / 其他）要先定。
2. **展示网络政策**：AdSense 明令禁止「付费移除广告」这类变现方式；Adsterra 无此条。若未来要上 Journey/AdSense，这个点位会成为违规点，真做之前得先确认走哪条线。
3. **收益对照**：现役 banner 是 CPM 计费，一个 $2 一次性买断去广告的用户，等于放弃该用户后续 N 个月的展示收入。要先有 ARPU/回访数据才谈得上去定价值不值。

### 10.1 实现进度（2026-11-07 夜，stub 已跑通，等 Stripe 密钥）

契约照 skill `stripe-checkout-integration`（§1 参数 / §2 模式 B / §6 静态站形态 / §7 验证清单），复用站上已有的 Pages Functions + D1（binding `meowtrail_users`）：

| 文件 | 作用 |
|---|---|
| `functions/api/payment/_stripe.ts` | 零依赖 raw fetch：建 session / 反查 paid / WebCrypto 验签 / 权益 token / D1 读写 |
| `functions/api/payment/checkout.ts` | POST 建单 → 建 session → `{pay_url, order_no}`；无 key 时 503 `stripe_not_configured` |
| `functions/api/payment/status.ts` | GET 反查发货（模式 B 的权威路径之一） |
| `functions/api/payment/notify/stripe.ts` | webhook：raw body 验签 fail-closed 404 → 再反查一次 → 幂等标记已付 |
| `functions/api/payment/restore.ts` | POST `{email}` → 命中已付订单才发 token（换设备恢复） |
| `migrations/006_gp_orders.sql` | `gp_orders` + 邮箱/会话索引；本地已执行 |
| `src/pages/ad-free/index.astro` | 售卖页：购买 / 轮询确认 / 凭邮箱恢复 / 已解锁态 |
| `src/pages/refund-policy/index.astro` | 退款政策（Stripe 上线闸要求的合规三件套之一） |
| `SideAd.astro` / `InContentAd.astro` | 读到 `localStorage.gp_ads_free` 就不注入 + `html.gp-ads-free` 隐藏空盒 |

已通过（本地 `wrangler pages dev` + D1 local）：`/ad-free/` 200；checkout 503 `stripe_not_configured`；status 404 `not_found`；restore 400 `bad_email`；webhook 无签名 404；`tsc -p functions` 零错。
权益闸实测：未购买 → 侧栏 `display:block`；已购买 → `html.gp-ads-free`、侧栏 `none`、bauval 脚本 **0**；移动端顶部条同样 `none`。

**已知取舍**：权益只落 localStorage（静态站无账号也可用），懂开发者工具的人可自行置位——商品单价 $4.99，不为此加签名回验；要收紧再加服务端 token 校验即可。

**待法老定**：① 价格是否就 $4.99；② 入口放哪（页脚常驻 / 解谜完成弹窗 / 侧栏底部）；③ 上线时机（需 `--remote` 建表 + 配 3 个 secret + 建 webhook 端点）。
