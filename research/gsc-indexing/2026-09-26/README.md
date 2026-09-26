# GSC Request Indexing — 2026-09-26

## 本轮结果

| URL | 结果 | 备注 |
|---|---|---|
| https://gridpaw.com/community/ | ✅ UI 确认「已将网址添加到优先抓取队列」 | 一次点击成功，未撞配额 |
| https://gridpaw.com/privacy/ | ❌ 「索引编制请求遭拒」 | 详情：「在测试实际版本的过程中，系统检测到该网址存在索引编制问题」。首次点击轮询 150s 无状态（PENDING），干净重试后返回明确拒绝面板。非配额、非通用错误，按纪律不再重试 |

## API 复核（提交后 ~10min）

| URL | coverageState | lastCrawlTime | sitemap |
|---|---|---|---|
| /community/ | Discovered - currently not indexed | null | sitemap-0.xml + sitemap.xml |
| /privacy/ | URL is unknown to Google | null | [] |

- /community/ 提交成功但抓取未获确认，与 09-25 轮同一模式（原因未知，未作推测）
- /privacy/ 在 UI 显示「已发现 - 尚未编入索引」+ sitemap 引荐，API 侧显示 unknown + 无 sitemap —— 字段差异按纪律只记录、不下结论（GSC 对账中）

## 观察记录（仅字段值）

- privacy 页两次 UI 检查（间隔数分钟）：
  - 第一次：coverage = 「Google 无法识别此网址」，发现=「未检测到任何引荐站点地图」
  - 第二次（重试后）：coverage = 「已发现 - 尚未编入索引」，发现列显示 sitemap-0.xml + sitemap.xml
  - 按纪律：sitemap 字段飘动 = GSC 对新读入 sitemap 逐条对账，不作归因、不作进展/退步上报
- Request Indexing 遭拒（「系统检测到该网址存在索引编制问题」）为直接观察到的 UI 文案，原因未知

## 脚本基线（gridpaw_unindexed.py）

- sitemap 共 71 条；已收录 69 / 未收录 2 / 查询失败 0
- 未收录：/community/（有sitemap）、/privacy/（有sitemap）

## 截图

- `privacy-rejected-2026-09-26.png` — privacy 页「索引编制请求遭拒」面板
