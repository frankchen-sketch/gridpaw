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
