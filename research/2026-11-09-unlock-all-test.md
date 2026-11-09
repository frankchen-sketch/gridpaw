# BP3 头部「Unlock All」付费意向实验（2026-11-09 立项）

> 状态：**代码就绪，未部署**。分支 `add-支付功能开发`，worktree `/Users/frank/workspace/gridpaw-paywall`。
> 一句话：10 个 BP3 关卡页顶挂「Unlock all 137 levels」，点击率 **>2% 才做支付**。

## 1. 为什么是这 10 页

GSC `sc-domain:gridpaw.com`，2026-10-12 → 2026-11-08（28 天），dimension=page，filter `brain-puzzle-3-level`，按 clicks 降序：

| # | 页面 | 28d clicks |
|---|---|---|
| 1 | /brain-puzzle-3-level-33/ | 770 |
| 2 | /brain-puzzle-3-level-17/ | 483 |
| 3 | /brain-puzzle-3-level-6/ | 384 |
| 4 | /brain-puzzle-3-level-42/ | 308 |
| 5 | /brain-puzzle-3-level-36/ | 302 |
| 6 | /brain-puzzle-3-level-45/ | 291 |
| 7 | /brain-puzzle-3-level-16/ | 276 |
| 8 | /brain-puzzle-3-level-3/ | 244 |
| 9 | /brain-puzzle-3-level-32/ | 232 |
| 10 | /brain-puzzle-3-level-40/ | 207 |
| | **合计** | **3,497** |

理由：这 10 页占 BP3 英文盘点击的绝大部分，是全站唯一能在两周内攒出统计显著样本的池子。
其余 127 关页保持干净（对照组，也用于监测「实验外溢」）。

## 2. 实现（三处契约）

### 2.1 组件 `src/components/UnlockBar.astro`

- 位置：`<GameNav />` 正下方，全宽通栏（方案 A，2026-11-09 拍板）
- 桌面文案：`🔓 Unlock all 137 levels — every answer in one page, no ads.` + `Unlock All →`
- 移动 ≤560px：副文案 `.ub-full` 隐藏，只留 `Unlock all 137 levels`；字号 13px，按钮 40px 高（触控下限）
- 实测（dev，1280×800 / 390×844）：桌面条高 51px、h1 top 122→173（仍在首屏）；移动条高 57px、无横向溢出
- 链接：`/unlock-all/?utm_source=bp3&utm_campaign=unlock-bar`

### 2.2 广告位顺序（`src/components/SideAd.astro`）

移动端 320×50 顶部位原本 `insertBefore(topAd, hdr.nextSibling)`；有 `.gp-unlock-bar` 时改为插在条**之后**，
保证「付费钩子 → 广告」而非「广告 → 付费钩子」。
⚠ 坑：header 与 bar 之间隔着组件内联 `<script>`，`nextElementSibling` 判断会失效，必须用
`hdr.compareDocumentPosition(barEl) & Node.DOCUMENT_POSITION_FOLLOWING`。

### 2.3 埋点 `unlock_click`

4 通道：GA4 `gtag` / Umami+posthog / Clarity / D1 `gpTrack`。
**D1 白名单必须两处同步**（否则 400 静默丢弃）：
- `src/lib/funnel-track.ts` → `FUNNEL_EVENTS`
- `functions/api/_funnel-sql.ts`

参数：`placement='bp3-header'`、`from=<pathname>`、`target=<href>`。

### 2.4 落地页 `/unlock-all/`

`noindex, follow`（实验期），产品说明 + $4.99 定价展示 + 邮件意向 CTA（mailto 由 JS 组装，
规避 CF Email Obfuscation），**不接支付**（Stripe 密钥未配，payment API 会 503）。
已加进 `SideAd.astro` 的 `PLAY_SURFACES`（购买页不挂广告），并从 `astro.config.mjs` sitemap
`exactExcludes` 排除（顺手补了 11-07 漏掉的 `/ad-free/`）。

## 3. 判定口径（先定死，防事后移动球门）

- **窗口**：部署日起 14 天完整日
- **分子**：`unlock_click` 去重用户数（GA4 `users`，fallback D1 distinct visitor）
- **分母**：同 10 页 GA4 `page_view` 总数
- **门槛**：**≥2.0%** 做支付；1.0–2.0% 灰区，看落地页 mailto 点击补充判断；<1.0% 撤条
- **样本量校验**：10 页日均 ~125 点击（GSC）、~1.3 PV/session → 14 天分母约 5,000 PV；
  2% ≈ 100 次点击。低于 60 次点击视为样本不足，延长一周再说

## 4. 决策树

| 结果 | 动作 |
|---|---|
| ≥2% | 把 `/unlock-all/` 升级为真卖页（复用 `functions/api/payment/*`，同 ad-free 骨架），去 noindex、进 sitemap、`/changelog/` 公告 |
| 1–2% | 换文案/换位置（B 卡片）再测一轮；同时看 mailto 意向数 |
| <1% | 撤条、撤落地页，写结论归档；支付议题冻结 |

**撤条条件（无论数据）**：任一起「骗我点击/骚扰」类投诉，当天撤，不辩护。

## 5. 待办（部署后）

- [x] 部署（2026-11-09 16:47，`--branch main`，IndexNow 11 URL HTTP 200）
- [ ] GA4 注册 `unlock_click` 事件参数（自定义维度 placement；事件本身已自动出现在 Events 报告）
- [x] D1 端到端验证：线上真实点击 → `POST /api/events` 200 → `gp_event` 表落库 3 条 `unlock_click`
- [ ] D1 日查 SQL：`SELECT count(DISTINCT guest_id), count(*) FROM gp_event WHERE event_name='unlock_click'`（表名是 `gp_event`，不是 events）
- [ ] 第 7 天中期读数（只报数不判断），第 14 天出结论
