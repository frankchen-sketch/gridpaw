# 2026-09-27（周日）GSC Request Indexing 运行记录

## 结论
- `/community/` Request Indexing 提交成功（一次点击即「已将网址添加到优先抓取队列」，未撞配额）。
- `/privacy/` 按纪律未提交（上轮被 Google 明确拒绝，页面未变）。
- sitemap 72 条：已收录 70、未收录 2、查询失败 0。新页 `/nurikabe/` **已收录** ✅。

## 脚本数据（gridpaw_unindexed.py，09:36 CST，venv python3.11）
- sitemap 共 72 条；本轮需检查 3 条（跳过 7 天内已确认收录的 69 条）
- 已收录 70 / 未收录 2 / 查询失败 0
- 未收录：`/community/`（已发现-尚未编入索引，有 sitemap）、`/privacy/`（同）
- 备注：脚本前两次运行时对检查 URL 报 HTTPSConnectionPool 连接错误（瞬时报错），第三次运行
  恢复正常并完成查证，非持续性问题。上次 cron 的 ModuleNotFoundError 系解释器错误，本次用
  venv python3.11 正常。

## 提交明细（ego-browser，GSC UI）
| URL | UI 结果 | 备注 |
|---|---|---|
| https://gridpaw.com/community/ | ✅ 一次点击即触发，约 20s 内「已将网址添加到优先抓取队列」 | 连续第 4 轮提交成功，但 API `lastCrawlTime` 仍为 null（观察，不作归因） |

## 未提交
- `/privacy/` —— 09-26 轮被 Google 明确拒绝（「索引编制请求遭拒 / 系统检测到该网址存在索引编制
  问题」），页面内容未变，按纪律不重试已知失败的 URL。本轮 API 状态：已发现-尚未编入索引、有
  sitemap 引用（字段随 GSC 对账摆动，不报进展/退步）。留待人工评估：隐私页应继续推进收录，
  还是按薄内容处理。

## 观察（仅字段值，不作归因）
- sitemap 71→72：新增 `/nurikabe/`，API 确认 Submitted and indexed，无需 Request Indexing。
- `/community/` 发现段：站点地图 = sitemap-0.xml + sitemap.xml；引荐来源网页 = /solver/。

## 截图
- community-1-clicked.png（点击后）
- community-2-final.png（成功面板：「已将网址添加到优先抓取队列中」）
