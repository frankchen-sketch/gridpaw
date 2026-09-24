# 2026-09-24 GSC Request Indexing 运行记录

## 目标（pre-run 脚本 gridpaw_unindexed.py 输出）

sitemap 共 69 条；本轮需检查 8 条（61 条 7 天内已确认收录被跳过）。
已收录 66 | 未收录 2 | 查询失败 1（/akari/tips/ 接口连接失败，不影响其余）。

| URL | GSC 状态 | 本轮处理 |
|---|---|---|
| https://gridpaw.com/community/ | 已发现 - 尚未编入索引（有 sitemap 引荐） | ✅ Request Indexing 提交 |
| https://gridpaw.com/privacy/ | Google 无法识别此网址（无 sitemap 引荐） | 未提交（noindex↔sitemap 矛盾页，提交必失败，需站点侧决策） |

## 提交过程（ego-browser，GSC UI）

- space: gridpaw-request-indexing（按名创建/复用）
- 深链接 /inspect 被重定向回概述页 → 走界面检查栏（aria-label 检查 gridpaw.com 中的任何网址）填 URL 回车，正常跳转 /inspect?id=...
- 检查面板确认：引荐站点地图 = sitemap-0.xml + sitemap.xml；引荐来源网页 = https://gridpaw.com/solver/；状态「网页未编入索引：已发现 - 尚未编入索引」
- 点击「请求编入索引」：第 1 次点击即触发「正在测试实际网址」→ 轮询 ~20s 内出现「已将网址添加到优先抓取队列」= 成功
- 未撞配额

## API 复核（提交后 lastCrawlTime）

（待填：提交后 ~8min / ~15min 两次 URL Inspection 结果）

## 截图

- community-request-indexing-result.png — 成功面板

## 遗留

- /community/ 若复核仍无 lastCrawlTime，属既往多轮同一模式（原因未知），下轮 cron 继续
- /privacy/ 需站点侧决策（sitemap 移除或去掉 noindex）

## API 复核（追加，2026-09-24）

| 时间（提交后） | coverageState | lastCrawlTime | sitemap 引荐 |
|---|---|---|---|
| 09:42（~9min） | Discovered - currently not indexed | None | sitemap-0.xml + sitemap.xml |
| 09:51（~18min） | Discovered - currently not indexed | None | sitemap-0.xml + sitemap.xml |

结论：UI 成功面板已确认，但两次 API 复核 lastCrawlTime 均为空——抓取未获确认。与 2026-09-23 轮同一模式（原因未知）。不做因果推测，下轮 cron 继续。
