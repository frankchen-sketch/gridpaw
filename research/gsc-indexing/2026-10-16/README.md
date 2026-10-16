# 2026-10-16 GSC Request Indexing 运行记录

## 目标与结果

| URL | 提交前状态（GSC UI 快照） | 提交结果 | API 复查（提交后即时） |
|---|---|---|---|
| https://gridpaw.com/community/ | 网页未编入索引：Google 无法识别此网址（未检测到任何引荐站点地图 / 引荐来源网页） | ✅ SUCCESS（click #1 即触发；轮询命中「已将网址添加到优先抓取队列」） | 已发现 - 尚未编入索引（有 sitemap） |

- 本轮 1 发 1 中，未撞配额。
- 无登录 / 验证码 / 2FA，全程自动化。
- 截图：`community_submit.png`（成功横幅「已将网址添加到优先抓取队列中」）。

## 观察记录（只记录，不归因）

1. `/community/` 的 sitemap/发现字段在 UI 快照与 API 间不一致：提交前 UI 显示「无法识别此网址 + 未检测到任何引荐站点地图」，而预跑脚本与提交后 API 均读为「已发现 - 尚未编入索引 + 有 sitemap」。按既定纪律（Sitemap 对账期字段飘动，非进展/退步信号）处理，不做因果推断。
2. 「请求编入索引」按钮非 `<button>` 标签（Material DIV，class `U26fgb...`），第一轮以 `button` 选择器过滤未命中；全元素 innerText 匹配后定位成功（可见副本 cx=1381, cy=363）。
3. `lastCrawlTime` 落地验证交由后续轮次（提交后几分钟内抓取属实测现象，但本轮 API 复查时间点尚未体现）。

## 交接

- 剩余未收录：1（/community/，等抓取/编入索引）。
- 下轮建议：直接对 /community/ 重复 URL Inspection 复查；若已收录则全站清零。
