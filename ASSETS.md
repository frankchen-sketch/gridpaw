# GridPaw 资产台账

> 各站分析/平台/凭据资产集中登记。**改任何 ID/token 先更此文件**（一处权威）。
> 规则：本文件只放 ID/项目名等非敏感值；密钥（token/JWT/key）只写「存哪、叫什么」，值进 `~/.hermes/.env`，禁止落进 git。

## 域名与分析 ID 总览

| 站 | 域名 | GA4 衡量 ID | GA4 Property ID (数字) | Clarity Project ID | 状态 |
|---|---|---|---|---|---|
| **GridPaw** | gridpaw.com | G-4FWP61DJCC | **552793510** | yd0fauosa4 | ✅ 当前使用 |
| MeowBlock (旧) | meow-block.com | G-DK7Y9VJM4G | — | yaix16p1ol | 301 → gridpaw |
| MeowTrail (旧) | meowtrail.org | G-F94CS6FNFX | — | yaiysek0y6 | 301 → gridpaw |
| Pictomino (旧) | spatialreasoninggame.com | — | — | yaj0b0i0y2 | 301 → gridpaw |
| Furriq | furriq.com | （不变） | 545120903 | yaiux9j8kd | ✅ 独立站 |

- GA4 口径：`G-` 开头 = 前端数据流衡量 ID（site-config.ts 用）；数字 = Data API Property ID（cron-dashboard build_metrics 用），两者不是同一个东西
- 旧站 GA4 Property 未填 = 新站口径（数据冻结不迁移），如需查历史去各旧 Property 面板看

## 凭据存放位置（值不落库）

| 凭据 | 位置 | key 名 |
|---|---|---|
| Clarity Data Export Token (gridpaw) | `~/.hermes/.env` | `CLARITY_TOKEN_GRIDPAW` |
| Clarity Data Export Token (furriq) | `~/.hermes/.env` | `CLARITY_DATA_EXPORT_TOKEN` |
| PostHog Personal API Key | `~/.hermes/.env` | `POSTHOG_PERSONAL_API_KEY`（Project ID 587128 四站共用） |
| GA4 服务账号 | `~/.config/furriq/ga4-service-account.json` | `ga4-reader@furriq-daily-brief`（需在各 GA4 Property Access Management 加 Viewer） |

## 消费端（改 ID 后要同步的地方）

- **cron-dashboard 看板采集**：`~/workspace/cron-dashboard/scripts/build_metrics.py` 的 `GA4_SITES` / `CLARITY_SITES` / `POSTHOG_SITE_WHITELIST`（站点口径 2026-09-04 起收敛 furriq+gridpaw）
- **前端埋点注入**：`src/lib/site-config.ts`（ga4Id/clarityId/posthogKey），SEOHead.astro 自动注入所有页面

## 待办 / 提醒

- [ ] GA4 Property 552793510：确认服务账号已加 Viewer（不加则 Data API 403）
- [ ] Clarity gridpaw 项目：IP 屏蔽单独加一次（直达 `https://clarity.microsoft.com/settings/ip-blocking?projectId=yd0fauosa4`，每项目各一次）
- [ ] GSC 验证码（site-config TODO）+ Bing 验证码
- [ ] 旧站 301 配置确认（meow-block.com / meowtrail.org / spatialreasoninggame.com → gridpaw）
