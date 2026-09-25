# GSC Request Indexing — 2026-09-25

运行方式：cron（seo-gsc-indexing-workflow skill）。GSC 属性 `sc-domain:gridpaw.com`。

## 目标清单（来自 gridpaw_unindexed.py 预跑）

- 已收录：67 / 未收录：1 / 查询失败：1
- 未收录：`https://gridpaw.com/community/`（已发现 - 尚未编入索引，[有sitemap]）

## 提交结果

| URL | UI 结果 | 时间 |
|---|---|---|
| https://gridpaw.com/community/ | ✅ 一次点击即触发「正在测试实际网址」，~20s 内出现「已将网址添加到优先抓取队列」 | 2026-09-25 09:37 CST |

- 未撞配额。
- 截图：`community-request-indexing-2026-09-25.png`
- 操作细节：space 按名 `gridpaw-request-indexing` 复用（spaceId=3）。初始停留在 furriq.com 属性（上会话残留），导航 `?resource_id=sc-domain:gridpaw.com` 切换后检查栏 aria-label 正确。深链接 `/inspect` 直接进不行，先落在概述页再走顶部检查栏填 URL + Enter。

## API 复核（提交后）

待补：提交后 ~10 分钟 URL Inspection 复查 coverageState / lastCrawlTime（见下方附录区）。

## 状态备注

- `/privacy/`：预跑脚本查询超时（HTTPSConnectionPool，网络层错误，非判定），非提交目标。
- `/community/` 已连续两轮（09-24、09-25）提交成功但 `lastCrawlTime` 未获确认，原因未知（09-24 提交后 ~9min/~18min 两次复核均空）。

## API 复核（提交后追加）

| 时间 (CST) | coverageState | lastCrawlTime | sitemap(API字段) |
|---|---|---|---|
| 09:46:45 (~10min) | Discovered - currently not indexed | null | [] |
| 09:53:26 (~16min) | Discovered - currently not indexed | null | [] |

与 09-24 同一模式：UI 确认入队列但抓取未获确认，原因未知。UI 检查面板曾显示引荐站点地图 sitemap-0.xml + sitemap.xml（09-24 观察）；本轮 API inspect 的 sitemap 字段为空，仅记录字段值，不作因果推测。
