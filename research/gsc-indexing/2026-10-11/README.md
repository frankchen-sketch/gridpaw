# GridPaw GSC Request Indexing — 2026-10-11 (cron routine)

## Background

- 上次 git 记录为 2026-09-21；本次距上次运行 20 天。期间站点新增内容，sitemap 从 68 条增至 93 条（sitemap-0.xml 81 + pictomino-sitemap.xml 12）。
- 本轮目标 6 条未收录（pre-run 脚本读数：已收录 87 / 未收录 6）：
  - Google 无法识别(3)：/arrows-puzzle-walkthrough/、/arrows-puzzle/、/community/
  - 已发现-未编入(3)：/binary/takuzu/、/hashi/solver/、/reset-password/
- 全部目标 URL 均在 sitemap-0.xml 内，`/` 形式均返回 200（trailing-slash 无极性异常）。

## Submissions (ego-browser, task space "gridpaw-request-indexing" by name, closed after)

| URL | 首次点击 | 重试(有限1次) | 最终结果 |
|---|---|---|---|
| /arrows-puzzle-walkthrough/ | SUCCESS 即时 | — | ✅ 入队 |
| /arrows-puzzle/ | 轮询超时(无结果面板) | SUCCESS | ✅ 入队 |
| /community/ | 轮询超时 | SUCCESS | ✅ 入队 |
| /binary/takuzu/ | 轮询超时 | SUCCESS | ✅ 入队 |
| /hashi/solver/ | 轮询超时 | SUCCESS | ✅ 入队 |
| /reset-password/ | 轮询超时 | 仍超时，页面出现「索引编制请求遭拒」 | ❌ 遭拒，未再重试 |

- 5/6 入队成功，**0 次撞配额**（事实记录，不推测原因）。
- 备注：5 个入队 URL 中 4 个首次点击后 40s 轮询无结果，一次干净重试后成功（与 skill 中「按钮刚渲染完首击常失效，重试一次」模式一致）。reset-password 的拒绝消息为 UI 原文：「索引编制请求遭拒 — 在测试实际版本的过程中，系统检测到该网址存在索引编制问题」。该页为功能性页面（密码重置），拒绝符合功能页预期，但**原因未单独验证**，不推测。

## API verification（提交后 ~15 分钟，URL Inspection API 逐条）

| URL | coverageState | lastCrawlTime |
|---|---|---|
| /arrows-puzzle-walkthrough/ | Submitted and indexed | 2026-10-11T08:00:25Z |
| /arrows-puzzle/ | Submitted and indexed | 2026-10-11T08:10:27Z |
| /hashi/solver/ | Submitted and indexed | 2026-10-11T08:08:27Z |
| /community/ | Discovered - currently not indexed | None |
| /binary/takuzu/ | Crawled - currently not indexed | 2026-10-11T08:12:27Z |
| /reset-password/ | Discovered - currently not indexed | None |

- 3 个 URL 提交后 ~18 分钟内确认收录（lastCrawlTime 落地），与 2026-09-15 观察到的「提交后几分钟被抓」一致。
- 最终脚本读数：**已收录 90 / 未收录 3 / 查询失败 0**（sitemap 共 93 条）。

## Status

- 本次收录 +3（walkthrough、arrows-puzzle、hashi/solver；87→90）。余额 -3：
  - /community/（已请求，待抓取）
  - /binary/takuzu/（已抓取未收录）
  - /reset-password/（请求遭拒，功能页，待评估是否需要处理）
- 下次 cron：复查 3 条 + 新出现未收录。reset-password 建议先查 noindex/登录门控再决定是否继续提交。

## Evidence

- url1-final.png / url2-retry-final.png / url3-retry-final.png / url4-retry-final.png / url5-retry-final.png：成功 panel
- url6-rejected.png：拒绝消息（reset-password）
- probe.png：登录态确认
