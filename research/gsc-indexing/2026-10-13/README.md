# GSC Request Indexing 运行记录 — 2026-10-13

## 本轮目标（预跑脚本，sitemap 93 条：81+12）

| URL | 预跑脚本状态 | 处理 | 结果 |
|---|---|---|---|
| /community/ | 已发现 - 尚未编入索引 | ✅ 提交 Request Indexing | **成功入队**（「已将网址添加到优先抓取队列」，t+10s 命中，首击即中） |
| /reset-password/ | Google 无法识别此网址 | ⛔ 未提交 | noindex 功能页（2026-10-12 curl 实测带 noindex），Google 不收录属预期，不重试 |

## 关键观察

- **/community/ 第 3 次请求**（10-11、10-12、10-13）。上轮（10-12）提交后 24h+ API 复查 `lastCrawlTime` 仍为 None——按 skill 判定标准「提交后数小时仍无 lastCrawlTime = 提交未生效」，本轮再提交有依据。
- **UI 检查页新观察**：/community/ 显示「已发现 - 尚未编入索引」，sitemap 引用已发现（sitemap-0.xml + sitemap.xml），**引荐来源网页 = https://gridpaw.com/solver/**（2026-10-12 记录中未见此字段，本轮首次观察到；仅记录事实，不做归因）。
- **API 直查与预跑脚本状态相反**（直查：community=unknown/无sitemap，reset-password=discovered/有sitemap；预跑脚本相反）——coverageState 与 sitemap 字段联动翻转，按对账期飘动处理，不当作涨跌信号。
- 0 次撞配额（本轮仅 1 发）。
- 全程无登录/验证码/2FA。

## 遗留

- /reset-password/ 仍列在 sitemap-0.xml 但带 noindex（sitemap↔noindex 矛盾信号），待法老决策是否从 sitemap 排除（需站改，本轮未动）。
- /community/ lastCrawlTime 待下轮复查（提交后是否真正被抓取）。
