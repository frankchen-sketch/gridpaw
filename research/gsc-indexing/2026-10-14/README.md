# GSC Request Indexing — 2026-10-14 运行记录

## 一句话结论

本轮 3 发 3 中：`/murder-sudoku/`、`/murdoku/` 两个「Google 无法识别此网址」孤儿页 Request Indexing 提交成功，且 **API ground truth 确认已转为 `Submitted and indexed`（lastCrawlTime 01:37Z / 01:43Z，提交后几分钟内被抓，与 skill 实测一致）**；`/community/` 再次提交成功入队（仍在 Discovered 等抓取）；`/reset-password/` 带 noindex，按纪律未提交。0 次撞配额。

## 本轮目标与结果

| URL | 预跑脚本状态 | 处理 | 结果（API 直查）|
|---|---|---|---|
| `/murder-sudoku/` | Google 无法识别此网址（无 sitemap 引用） | ✅ 提交 Request Indexing | **Submitted and indexed**，lastCrawlTime 2026-10-14T01:37:25Z |
| `/murdoku/` | Google 无法识别此网址（无 sitemap 引用） | ✅ 提交 Request Indexing | **Submitted and indexed**，lastCrawlTime 2026-10-14T01:43:26Z |
| `/community/` | 已发现 - 尚未编入索引（有 sitemap） | ✅ 再次提交（上轮 lastCrawlTime 24h+ 未落地，按 skill=提交未生效，干净重试一次） | Discovered - currently not indexed，lastCrawlTime None，等下轮复查 |
| `/reset-password/` | Google 无法识别此网址 | ⛔ 未提交 | curl 实测仍带 noindex（功能页），不收录属预期 |

## 提交细节

- 全部经 ego-browser 走 GSC UI（API 不支持 Request Indexing），task space 按名字 `gridpaw-request-indexing` 复用。
- 三个 URL 均「首击即中」：点击后出现「正在测试实际网址可否编入索引」，t+10s 命中「已将网址添加到优先抓取队列」；0 次撞配额（「超出了配额」从未出现）。
- 截图：murder-sudoku / murdoku / community 成功面板各一张。

## 已验证的坑（本轮实测）

1. **「成功横幅」是跨 URL 残留的**：第一个 URL 提交成功后页面顶部横幅「已将网址添加到优先抓取队列」不随 URL 切换消失。直接复用同一个成功文本做轮询判定会**误报**——本轮 murder-sudoku 提交后残留横幅导致 murdoku 第一次轮询虚假命中 SUCCESS。修正：点击「关闭」清掉横幅，重新 fill 目标 URL + Enter 刷新检查页，确认 `hasBanner:false` 后再点「请求编入索引」。
2. **`lastCrawlTime` 是提交是否落地的唯一硬证据**（skill 纪律）。本轮两个孤儿页提交后几分钟内 API 即显示 lastCrawlTime——与 skill「提交后几分钟内就会被抓」一致。
3. API 直查（提交前）：4 条 URL 全部显示 `URL is unknown to Google` + `sitemap:None`，与预跑脚本的「community 有 sitemap 引用」冲突——这是 skill 记录的 sitemap 对账期飘动，非涨跌信号，不归因。

## 剩余未收录（下次继续）

- `/community/`：Discovered - currently not indexed（已提交两次，等 lastCrawlTime 落地）
- `/reset-password/`：noindex 功能页，sitemap↔noindex 矛盾信号仍待法老决策是否从 sitemap 排除（需站代码改动，本轮未动）

## git

- commit：docs(research): 2026-10-14 GSC Request Indexing 运行记录
