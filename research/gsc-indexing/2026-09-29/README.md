# GSC Request Indexing — 2026-09-29（周二）

**结论**：8/8 提交成功，本轮未撞配额。全部「Google 无法识别此网址」条目已提交，剩余 `/privacy/`（已知拒绝 URL）未动。

## 提交明细（ego-browser，GSC UI，sc-domain:gridpaw.com）

| URL | 结果 |
|---|---|
| https://gridpaw.com/community/ | ✅ 已将网址添加到优先抓取队列（第 6 轮提交） |
| https://gridpaw.com/help/ | ✅ 已将网址添加到优先抓取队列 |
| https://gridpaw.com/help/akari/ | ✅ 已将网址添加到优先抓取队列 |
| https://gridpaw.com/help/kakuro/ | ✅ 已将网址添加到优先抓取队列 |
| https://gridpaw.com/help/nonogram/ | ✅ 已将网址添加到优先抓取队列 |
| https://gridpaw.com/help/nurikabe/ | ✅ 已将网址添加到优先抓取队列 |
| https://gridpaw.com/help/pictomino/ | ✅ 已将网址添加到优先抓取队列 |
| https://gridpaw.com/help/shikaku/ | ✅ 已将网址添加到优先抓取队列 |

## 跳过
- `/privacy/` —— 上轮被 Google 拒绝「索引编制请求遭拒」+ 页面未变，按纪律不重试已知失败 URL，留待人工评估。

## 观察（只记直接看到的事实）
- 会话开篇即用 `?resource_id=sc-domain:gridpaw.com` 显式指定属性，落点正确（规避 09-28 落在 thehexagrams.com 的问题）。
- 流程改为每个 URL 先回到 overview 再输入（09-28 的「面板保持打开重填」方式在本轮出现输入框被 div 拦截的报错，回 overview 后稳定成功）。
- 按钮位置固定 (1536, 363)，匹配元素 8 个，取最后可见实例成功。
- 截图：每 URL 一张 PNG（含 SUCCESS 后页面）。
- `lastCrawlTime` 是否生效留待后续 API 复查，不作归因。
