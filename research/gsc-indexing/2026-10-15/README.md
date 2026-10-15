# 2026-10-15 GSC Request Indexing 运行记录

## 结果汇总：目标 4 URL，提交 4 发 4 中，0 撞配额

| URL | 提交前状态（GSC UI） | 提交结果 | API 复查（提交后 ~2min） |
|---|---|---|---|
| /about/ | Google 无法识别此网址（无 sitemap、无引荐来源） | SUCCESS（poll 1, ~10s） | **Submitted and indexed** |
| /community/ | 已发现 - 尚未编入索引（sitemap-0.xml + sitemap.xml，引荐来源 /solver/） | SUCCESS（poll 2, ~25s） | Discovered - currently not indexed（等抓取，下轮复查） |
| /contact/ | Google 无法识别此网址（无 sitemap、无引荐来源） | SUCCESS（poll 1, ~10s） | **Submitted and indexed** |
| /akari/compare/ | 未找到 (404)——2026-10-06 旧抓取快照；curl 实测当前线上 200 且在 sitemap-0.xml | SUCCESS（poll 1, ~10s） | Crawled - currently not indexed（404 失败状态已消失） |

## 过程事实（只记录直接观察）

- 每个 URL 均首击即中：点击「请求编入索引」→「正在测试实际网址」→ 命中「已将网址添加到优先抓取队列」。
- 横幅残留纪律执行：每换 URL 前点击关闭清掉上一条成功横幅，并以 `bannerStill:false` 确认后再提交（上轮 murder-sudoku 教训的延续）。
- /akari/compare/ 专项验证：`/akari/compare/` 200；`/akari/compare` 308→`/akari/compare/`；`/akari/compare/logic-puzzle-vs-sudoku/` 301→`/akari/compare/`（compare 子页已并入索引页，站点重构痕迹）。GSC 显示 10-06 抓取 404 为旧快照，与当前线上状态不符；提交后 API 转 Crawled，不再显示 404 失败。
- /community/ 的 sitemap 引用：GSC UI 与 API 均显示 sitemap-0.xml + sitemap.xml；预跑脚本显示「无sitemap+无法识别」——按纪律记为 GSC 对新读入 sitemap 的对账期字段飘动，不做因果归因。
- 全程无登录/验证码/2FA，task space `gridpaw-request-indexing` 正常关闭。

## 下次继续

1. /community/：Discovered - not indexed，等 lastCrawlTime 落地（本轮提交前已处此状态多日，仅记录）。
2. /akari/compare/：Crawled - not indexed，等编入索引。
3. sitemap↔noindex 矛盾信号（/reset-password/ 带 noindex）仍未处理，待法老决策。

## 截图

- gridpaw-about-submit.png / gridpaw-community-submit.png / gridpaw-contact-submit.png / gridpaw-akari-compare-submit.png
