# GSC Request Indexing — 2026-10-18 运行记录

目标源：`gridpaw_unindexed.py`（2026-10-18 运行）——sitemap 109 条，检查 90 条（跳过 19 条 7 天内已收录）；
本轮开始前：已收录 83 / 未收录 26 / 查询失败 0。

## 提交清单（按脚本优先级：先「Google 无法识别此网址」）

| # | URL（相对路径） | 提交前状态 | 结果 |
|---|---|---|---|
| 1 | /brain-puzzle-3-level-1/ | Google 无法识别 | SUCCESS |
| 2 | /brain-puzzle-3-level-2/ | Google 无法识别 | SUCCESS |
| 3 | /brain-puzzle-3-level-3/ | Google 无法识别 | SUCCESS |
| 4 | /brain-puzzle-3-level-4/ | Google 无法识别 | SUCCESS |
| 5 | /brain-puzzle-3-level-5/ | Google 无法识别 | SUCCESS |
| 6 | /brain-puzzle-3-level-6/ | Google 无法识别 | SUCCESS |
| 7 | /brain-puzzle-3-level-7/ | Google 无法识别 | SUCCESS |
| 8 | /brain-puzzle-3-level-8/ | Google 无法识别 | SUCCESS |
| 9 | /brain-puzzle-3-level-9/ | Google 无法识别 | SUCCESS |
| 10 | /brain-puzzle-3-level-10/ | Google 无法识别 | SUCCESS |
| 11 | /brain-puzzle-3-level-19/ | Google 无法识别 | TIMEOUT——轮询 150s 无成功/配额文本；按历史 pattern 属「假阴性候选」，可能已入队，待 API lastCrawlTime 验证 |
| 12 | /brain-puzzle-3-level-30/ | Google 无法识别 | QUOTA——第 12 个 URL 触发测试后轮询到「超出了配额」，停止整批 |

## 观察（只记录，不归因）

- 配额窗口与 10-17 一致地宽：连续 10 发 SUCCESS，第 11 发 TIMEOUT（疑已入队），第 12 发撞配额。
- 全程无登录/验证码/2FA。按钮定位与点击节奏沿用稳定路径（innerText 去空格 = 请求编入索引 + 可见性过滤 + 坐标点击，首次点击偶发不触发、第 2 次稳定进「正在测试实际网址」）。
- 提交是否生效以 `lastCrawlTime` 为准（实测提交后几分钟内被抓）；第 11/12 号 URL 待后续轮次 API 复查。

## 下次继续（本轮未处理或未确认，共 16 个）

「无法识别」组：/brain-puzzle-3-level-19/（待验证）、/brain-puzzle-3-level-30/、/brain-puzzle-3-level-31/、/brain-puzzle-3-level-137/、/community/、/meowdoku/levels/10/、/meowdoku/levels/3/、/meowdoku/levels/4/、/meowdoku/levels/7/、/pt-br/pictomino/
「已发现 - 尚未编入索引」组：/meowdoku/、/meowdoku/levels/1/、/meowdoku/levels/2/、/meowdoku/levels/6/、/meowdoku/levels/8/、/meowdoku/levels/9/

截图：1-10_SUCCESS.png（成功面板）、11_TIMEOUT.png、12_QUOTA.png。

---

## 运行 2（pt-br 收尾轮，19:00，独立 cron job）

### API 预检修正了任务清单（提交前先查，不盲交）

| URL | 预检状态（18:55） | 处置 |
|---|---|---|
| /pt-br/ | **Submitted and indexed**，lastCrawl 2026-10-17T01:43:11Z | 无需重交（10-17 轮提交已落地；cron 提示的「上次被拒」前提已过时） |
| /pt-br/nonogram/ | **Submitted and indexed**，lastCrawl 2026-10-17T01:47:12Z | 无需重交 |
| /pt-br/nurikabe/ | **Submitted and indexed**，lastCrawl 2026-10-17T01:49:12Z | 无需重交 |
| /pt-br/pictomino/ | URL is unknown to Google | ✅ 本轮提交 |
| /brain-puzzle-3-level-19/ | URL is unknown（运行 1 的 TIMEOUT 确认未入队） | ✅ 本轮补交 |
| /brain-puzzle-3-level-30/ | **Submitted and indexed**，lastCrawl 2026-10-18T10:02:54Z | 运行 1 的 QUOTA 发实际生效，无需处理 |
| /community/ | 仍 Discovered - currently not indexed（已提交 3 轮） | 未动，自然抓取优先级问题 |

### 提交结果（ego-browser，Profile「Default」/a8395）

- **2 发 2 中，0 撞配额**（运行 1 在 12:27 撞配额，6.5h 后窗口已回满——回补速度比 09-15 实测的 ~1h 慢，但当天确实恢复）。
- /pt-br/pictomino/：首击触发测试 → 「已将网址添加到优先抓取队列」SUCCESS（run2-pictomino.png）。
- /brain-puzzle-3-level-19/：首击触发测试 → SUCCESS（run2-level19.png）。
- 按纪律每轮 1-2 发，到此收手，不再扩量。

### 账号坑（本轮新增，重要）

- cron 启动时 ego 当前 profile 是 **Profile 9「flora」**（florakimmzoq@gmail.com，furriq 评论池专用）——GSC 直接弹 not-verified。
- **Profile 1「jameschen」= jameschangzero@gmail.com，对 gridpaw GSC 同样无权限**（「jameschen=gridpaw」的映射只适用于 Pinterest/游戏平台，不适用于 GSC）。
- **gridpaw GSC UI 的正确会话在 Default「a8395」profile（a839500525@gmail.com）**——运行 1 与历史轮实际都用它。用 `taskSpace(name, { profileId: "Default" })` 显式指定（profileId 只在新建 space 时生效；按名恢复旧 space 不能带该参数）。
- not-verified 金丝雀要按 profile 查：先 `listTaskSpaces()` 看 profileName 再决定去哪个 profile 建 space。

### lastCrawlTime 落地验证

见本节末尾 API 复查表（提交后 ~5 分钟首查）。

| URL | 提交后 ~8 分钟 API 复查（19:12 CST） |
|---|---|
| /pt-br/pictomino/ | **Submitted and indexed**，lastCrawl 2026-10-18T11:03:57Z（19:03 CST，提交后 ~1 分钟内被抓），verdict PASS |
| /brain-puzzle-3-level-19/ | **Submitted and indexed**，lastCrawl 2026-10-18T11:03:56Z，verdict PASS |

**本轮净结果：未收录 26 → 24；pt-br 四页全部 indexed，pt-br 线收官。**
