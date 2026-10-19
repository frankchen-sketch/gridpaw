# GSC Request Indexing — 2026-10-19

## 结论
本轮针对 13 个未收录 URL 提交 Request Indexing，**12 个当场确认收录**（API `Submitted and indexed` + `lastCrawlTime`），仅 1 个（/community/）停留在「已发现 - 尚未编入索引」（提交前就是此状态，无 lastCrawl，可能仍在抓取队列）。

最终基线：sitemap 130 条，已收录 **129**，未收录 **1**（community）。

## 提交清单（13 个）

| URL | UI 结果 | API 复核（coverageState / lastCrawl） |
|---|---|---|
| /brain-puzzle-3-level-12/ | SUCCESS | Submitted and indexed / 01:49:39Z |
| /brain-puzzle-3-level-13/ | SUCCESS（重试 1 次） | Submitted and indexed / 01:52:40Z |
| /brain-puzzle-3-level-16/ | SUCCESS（重试 1 次） | Submitted and indexed / 02:01:41Z |
| /brain-puzzle-3-level-17/ | SUCCESS | Submitted and indexed / 01:57:40Z |
| /brain-puzzle-3-level-18/ | SUCCESS（单独重跑） | Submitted and indexed / 02:22:39Z |
| /brain-puzzle-3-level-20/ | SUCCESS | Submitted and indexed / 02:05:43Z |
| /brain-puzzle-3-level-21/ | SUCCESS（重试 1 次） | Submitted and indexed / 02:17:47Z |
| /brain-puzzle-3-level-24/ | SUCCESS | Submitted and indexed / 02:09:43Z |
| /brain-puzzle-3-level-32/ | SUCCESS（重试 2 次） | Submitted and indexed / 02:28:41Z |
| /brain-puzzle-3-level-33/ | SUCCESS | Submitted and indexed / 02:11:44Z |
| /murdoku/trail/ | SUCCESS（重试 1 次） | Submitted and indexed / 02:34:44Z |
| /community/ | SUCCESS（重试 1 次） | Discovered - currently not indexed / None |
| /meowdoku/ | SUCCESS（重试 2 次） | Submitted and indexed / 02:40:46Z |

> level-12 未留独立截图（最早单独验证时未保存）；其余均有截图。

## 操作要点（本轮实测）
- **每个 ego-browser 进程的「第一次点击」大概率不生效**（按钮已渲染但点击无响应），需要 1-2 次重试点击。最终提交均在 3 次尝试内成功，无一次撞配额。
- 填 URL 后核对页面显示的 URL 与目标一致再点按钮（防串 URL）。
- 截图均已保存；中间失败尝试的截图已清理，仅保留最终成功截图。
- 全程无登录 / 验证码 / 2FA，未出现「您的另外一个网站正在迁移到此网站」横幅。

## 遗留
- /community/ 1 条仍为「已发现 - 尚未编入索引」（有 sitemap 引荐），未入队迹象。下次 cron 会按脚本自动复测。
