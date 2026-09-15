# GridPaw 资产台账

> 各站分析/平台/凭据资产集中登记。**改任何 ID/token 先更此文件**（一处权威）。
> 规则：本文件只放 ID/项目名等非敏感值；密钥（token/JWT/key）只写「存哪、叫什么」，值进 `~/.hermes/.env`，禁止落进 git。

## 域名与分析 ID 总览

| 站 | 域名 | GA4 衡量 ID | GA4 Property ID (数字) | Clarity Project ID | 状态 |
|---|---|---|---|---|---|
| **GridPaw** | gridpaw.com | G-4FWP61DJCC | **552793510** | yd0fauosa4 | ✅ 当前使用 |
| MeowBlock (旧) | meow-block.com | G-DK7Y9VJM4G | **551961083** | yaix16p1ol | 301 → gridpaw |
| MeowTrail (旧) | meowtrail.org | G-F94CS6FNFX | **551005059** | yaiysek0y6 | 301 → gridpaw |
| Pictomino (旧) | spatialreasoninggame.com | — | **548824795** | yaj0b0i0y2 | 301 → gridpaw |
| Furriq | furriq.com | （不变） | 545120903 | yaiux9j8kd | ✅ 独立站 |

- GA4 口径：`G-` 开头 = 前端数据流衡量 ID（site-config.ts 用）；数字 = Data API Property ID（cron-dashboard build_metrics 用），两者不是同一个东西
- 旧站 GA4 Property 已补全（2026-09-05），服务账号已加 Viewer

## 凭据存放位置（值不落库）

| 凭据 | 位置 | key 名 |
|---|---|---|
| Clarity Data Export Token (gridpaw) | `~/.hermes/.env` | `CLARITY_TOKEN_GRIDPAW` |
| Clarity Data Export Token (furriq) | `~/.hermes/.env` | `CLARITY_DATA_EXPORT_TOKEN` |
| PostHog Personal API Key | `~/.hermes/.env` | `POSTHOG_PERSONAL_API_KEY`（Project ID 587128 四站共用） |
| **Google 服务账号 A**（GA4 + GSC） | `~/.hermes/scripts/furriq-daily-brief-e15ace04af1c.json` | `furriq-frank-admin@furriq-daily-brief.iam.gserviceaccount.com` — 同时覆盖 furriq.com + gridpaw.com 的 GA4 与 GSC |
| **Google 服务账号 B**（GA4 专用，旧） | `~/.config/furriq/ga4-service-account.json` | `ga4-reader@furriq-daily-brief.iam.gserviceaccount.com` |
| **IndexNow key** | `public/<key>.txt`（**已 gitignore，值不入库**） | 文件名即 key；`scripts/indexnow-ping.mjs` 自动探测。管理规则见 SEO-INDEXING.md §5.4 |

> 两个 SA 同属 GCP project `furriq-daily-brief`，权限有重叠。**新增集成一律用 A**（furriq-frank-admin），
> B 是早期 GA4 专用账号。2026-09-15 gridpaw 的 GSC 授权只加在 A 上。

## 消费端（改 ID 后要同步的地方）

- **cron-dashboard 看板采集**：`~/workspace/cron-dashboard/scripts/build_metrics.py` 的 `GA4_SITES` / `CLARITY_SITES` / `POSTHOG_SITE_WHITELIST`（站点口径 2026-09-04 起收敛 furriq+gridpaw）
- **前端埋点注入**：`src/lib/site-config.ts`（ga4Id/clarityId/posthogKey），SEOHead.astro 自动注入所有页面

## 待办 / 提醒

- [x] GA4 Property 552793510：服务账号已加 Viewer（2026-09-04 验证 Data API 通）
- [x] Clarity gridpaw 项目：IP 屏蔽已加（2026-09-04 用户完成）
- [x] GSC：属性 `sc-domain:gridpaw.com` 已建（2026-09-04 创建）+ 服务账号 A 授权完整权限（2026-09-15）→ 效果/站点地图/URL 检查全可 API。细节见 SEO-INDEXING.md
- [x] Bing / IndexNow：已注册；2026-09-15 key 轮换后实测提交 HTTP 200。key 文件已移出版本控制
- [ ] **旧站 301 未全部生效**（2026-09-15 实测，详见 REDIRECTS.md 顶部核对表）
  - meow-block.com ✅ 16/16 抽测通过
  - spatialreasoninggame.com ⚠️ 跳转生效但是 2 跳链（`.html` 目标又 308 一次）
  - **meowtrail.org ❌ 239 条规则一条都没生效** —— 该域名仍在自服务 + 自 canonical + 被 Google 当独立站收录（9/1–9/15：6 点击/159 曝光，sitemap 仍提交 121 条 URL），内容与 gridpaw.com/akari/ 近重复。**这是当前最高优先级的未决 SEO 问题**，需在 CF Dashboard 的 meowtrail.org zone 里查根因
