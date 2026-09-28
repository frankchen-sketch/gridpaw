# 2026-09-28（周一）GSC Request Indexing 运行记录

- 属性：sc-domain:gridpaw.com
- sitemap：72 条；已收录 70 / 未收录 2 / 查询失败 0（pre-run 脚本）
- 目标任务：/community/、/privacy/

## 结果

| URL | 提交 | UI 结果 |
|---|---|---|
| https://gridpaw.com/community/ | ✅ | 一次点击即进入「正在测试实际网址」，约 10s 内返回「已将网址添加到优先抓取队列中」（poll=SUCCESS，未撞配额） |
| https://gridpaw.com/privacy/ | 跳过 | 上轮被 Google 明确拒绝（「索引编制请求遭拒」）且页面未变，按纪律不重试已知失败 URL，留待人工评估 |

## 截图
- community-request-indexing.png — GSC UI 成功面板（已请求编入索引）

## 备注
- 本轮 ego-browser 会话初始落在 sc-domain:thehexagrams.com 属性（非本任务属性），已通过 resource_id=sc-domain:gridpaw.com 显式切换，确认输入栏 aria-label 为「检查 gridpaw.com 中的任何网址」后再操作。
- /community/ UI 仍显示「已发现 - 尚未编入索引」（第 5 轮提交成功）；lastCrawlTime 是否生效留待下轮 API 查证，不作归因。
