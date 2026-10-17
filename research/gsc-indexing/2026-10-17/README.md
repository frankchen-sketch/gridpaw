# GSC Request Indexing 运行记录 — 2026-10-17

## 本轮结果

- 提交成功 **11/12**（首轮「Google 无法识别此网址」组），第 12 个 `/pt-br/pictomino/` 触发测试后轮询到「超出了配额」，按纪律停止整批。
- 全程无登录/验证码/2FA。

| URL | 提交前状态 | 结果 |
|---|---|---|
| /brain-puzzle-3-answers/ | Google 无法识别 | ✅ SUCCESS（首击即中） |
| /brain-puzzle-3-level-25/ | Google 无法识别 | ✅ SUCCESS（第 2 击触发测试） |
| /brain-puzzle-3-level-26/ | Google 无法识别 | ✅ SUCCESS（第 2 击触发测试） |
| /brain-puzzle-3-level-27/ | Google 无法识别 | ✅ SUCCESS（第 2 击触发测试） |
| /brain-puzzle-3-level-28/ | Google 无法识别 | ✅ SUCCESS（第 2 击触发测试） |
| /community/ | Google 无法识别（上轮已提交过，仍显示未收录） | ✅ SUCCESS |
| /meowdoku/levels/1/ | Google 无法识别 | ✅ SUCCESS |
| /meowdoku/levels/5/ | Google 无法识别 | ✅ SUCCESS |
| /pt-br/ | Google 无法识别 | ✅ SUCCESS |
| /pt-br/nonogram/ | Google 无法识别 | ✅ SUCCESS（首次 fill 未生效，改用真实键盘输入后成功） |
| /pt-br/nurikabe/ | Google 无法识别 | ✅ SUCCESS |
| /pt-br/pictomino/ | Google 无法识别 | ⛔ QUOTA（测试已触发，轮询到配额提示，入队与否待 lastCrawlTime 验证） |

## 观察记录（只记录，不归因）

- **配额窗口**：本轮连续 11 发成功才在第 12 发撞配额，明显优于 2026-09-15 实测的「1-2 发即撞」——配额窗口状态随时间变化，本轮窗口较宽。
- **fill 偶发失效**：第 10 个 URL 时 `page.fill()` 写入后输入框 value 为空、Enter 未触发新检查（页面停留在前一 URL 的检查 id）。改用 evaluate focus + 真实键盘输入（Ctrl+A → Delete → type → Enter）后稳定。后续 URL 均用键盘输入方式。
- **输入框点击拦截**：第 11 个 URL 时 `page.click()` 报「div intercepts pointer events」，用 evaluate focus 绕过。
- **按钮定位**：沿用上轮经验——「请求编入索引」非 `<button>` 标签，用全元素 innerText 去空格匹配 + `offsetWidth>0` 可见性过滤，坐标稳定在 (1381, 363)。
- **点击节奏**：检查结果渲染后第一次点击通常不触发（testing=false），第 2 次点击稳定触发「正在测试实际网址」。

## 剩余未收录（下次继续）

1. `/pt-br/pictomino/`（本轮撞配额，未确认入队）
2. `/meowdoku/` + `/meowdoku/levels/{2,3,4,6,7,8,9,10}/`（「已发现 - 尚未编入索引」组 9 个，本轮未轮到）

## 验证

- 提交是否生效以 `lastCrawlTime` 为准（实测提交后几分钟内被抓），待后续轮次 API 复查确认。
