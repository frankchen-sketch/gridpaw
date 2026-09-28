# GridPaw Help Docs — 内容复用流水线源文档

这是 skill `content-reuse-pipeline` 的落地目录：所有派生内容（帮助页、第三方文章、Pinterest 长图、YouTube 视频）的唯一事实源。

## 规则

- 每篇文档必须基于真实 UI 验证（读源码或实测），标注验证日期
- 截图：优先复用 `/assets/screenshots/`，不足的新截；文档里用 `[截图 N: 描述]` 占位
- Frank 补截图 + 审阅后才算 FINAL，才能派生文章
- UI 改版时同步检查本目录（游戏按钮/机制变了文档就过期）

## 状态

| 文档 | 草稿 | 截图 | Frank 审 | 上线帮助页 | 派生文章 |
|---|---|---|---|---|---|
| shikaku.md | ✅ 2026-09-28 | ✅ 5 张（1 复用 level-easy + help-shikaku-2~5） | ✅ | ✅ https://gridpaw.com/help/ | ⬜ |
| akari.md | ✅ 2026-09-28 抽查通过 | ✅ 5 张（1 复用 game-beginner + help-akari-2~5） | ✅ | ✅ https://gridpaw.com/help/ | ⬜ |
| kakuro.md | ✅ 2026-09-28 抽查通过（配色描述已按实际 UI 修正：琥珀/粉红/删除线） | ✅ 4 张 help-kakuro-1~4 | ✅ | ✅ https://gridpaw.com/help/ | ⬜ |
| nonogram.md | ✅ 2026-09-28 抽查通过 | ✅ 5 张 help-nonogram-1~5 | ✅ | ✅ https://gridpaw.com/help/ | ⬜ |
| nurikabe.md | ✅ 2026-09-28 抽查通过 | ✅ 6 张 help-nurikabe-1~6 | ✅ | ✅ https://gridpaw.com/help/ | ⬜ |
| pictomino.md | ✅ 2026-09-28 抽查通过 | ✅ 8 张 help-pictomino-1~4b,5~7（7 为未登录态，数据版待补） | ✅ | ✅ https://gridpaw.com/help/ | ⬜ |
