# 2026-09-22 GSC Request Indexing — 运行记录

## 结论
- 成功提交 1 个 URL：`https://gridpaw.com/community/`（UI「已将网址添加到优先抓取队列」确认，截图见 community-request-indexing.png）。
- 未撞配额（本轮只处理 1 个目标）。
- 另 1 个未收录 URL `https://gridpaw.com/privacy/` **本轮未提交**：live 页面（cache-buster 复核）带 `<meta name="robots" content="noindex">`，却同时列在 sitemap-0.xml 中——sitemap↔noindex 矛盾。Google 对该页「无法识别」是预期行为，Request Indexing 必然无效，不在配额上浪费。

## 检查结果（URL Inspection，GSC UI）
- `https://gridpaw.com/community/`：网页未编入索引：**已发现 - 尚未编入索引**
  - 站点地图：https://gridpaw.com/sitemap-0.xml、https://gridpaw.com/sitemap.xml
  - 引荐来源网页：https://gridpaw.com/solver/
  - 上次抓取时间：不适用
- `https://gridpaw.com/privacy/`：未提交（见结论；脚本状态「Google 无法识别此网址 · [无sitemap]」——实为 noindex 矛盾，非孤立发现问题）

## 独立复核（live 站点，2026-09-22 09:33 CST）
- 首页、/akari/ 均有 `href="/community/"` 入链（非孤岛页）
- /pictomino/community 为独立页面（200 + 自 canonical + 在 pictomino-sitemap.xml），与 /community/ 无信号冲突
- /community/ canonical 自指向 https://gridpaw.com/community/（200）

## 待观察
- community/ 提交后 `lastCrawlTime` 是否出现（此前多轮提交成功但抓取始终未获确认）
- privacy/ 的 sitemap↔noindex 矛盾需要站点侧决定：从 sitemap 移除或去掉 noindex（不在本任务范围）

## 复核补充（提交约 22 分钟后，API，2026-09-22 ~09:57 CST）
- `https://gridpaw.com/community/`：coverageState = `Discovered - currently not indexed`（未变），**lastCrawlTime = null**（抓取未获确认），sitemap 引用正常。
- 判定：UI 显示提交成功，但按纪律（lastCrawlTime 为准）本轮提交**未确认生效**。与既往多轮（09-19/09-20/09-21）同一判定模式：community/ 连续多轮提交成功但始终无抓取确认。原因未知，不做推测。
