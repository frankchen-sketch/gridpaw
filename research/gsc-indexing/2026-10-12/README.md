# 2026-10-12 GSC Request Indexing 运行记录

## 目标（pre-run 脚本 09:2x 输出：sitemap 共 93 条 / 已收录 91 / 未收录 2 / 查询失败 0）

| URL | 检查时状态 | 处理 |
|---|---|---|
| https://gridpaw.com/community/ | Google 无法识别此网址（无 sitemap 引用） | ✅ 提交入队成功 |
| https://gridpaw.com/reset-password/ | 已发现 - 尚未编入索引（有 sitemap 引用） | ⛔ 未提交（见下） |

## 行动与观测

### 1. /reset-password/ —— 体检后判定不提交
- 真实页面带 `<meta name="robots" content="noindex">`（curl 实测，2026-10-12 09:2x）。
- 上轮（10-11）GSC UI 对其 Request Indexing 返回「索引编制请求遭拒——检测到该网址存在索引编制问题」，与本页 noindex 相符。
- 硬约束「不重试已知会失败的 URL」→ 本轮不提交。
- **矛盾点（需人工决策，非本轮职责）**：该页仍在 sitemap-0.xml 内（81 条之一）。sitemap↔noindex 冲突，Google 会无视 noindex 页的 sitemap 提交。后续可考虑：从 sitemap 排除该功能页（改站需法老批准）。

### 2. /community/ —— 提交成功
- 无 noindex、canonical 指向自身、`/community/` 返回 200（`/community` 308 到斜杠版，极性一致）。
- ego-browser（task space `gridpaw-request-indexing`, id 16）UI 流程：inspect 栏输入 URL → 检查完成 → 点击可见「请求编入索引（再次提交请求）」按钮（真实坐标点击）→ 首击即命中，约 40-50s 轮询出现「已将网址添加到优先抓取队列」→ **SUCCESS**。
- 附带观测（只记录，不归因）：面板状态由「Google 无法识别此网址（无 sitemap）」变为「已发现 - 尚未编入索引」并显示站点地图引用。
- 截图：`community-submit-result.png`

## 配额
- 0 次撞配额（本轮仅提交 1 条，未触发）。

## API 验证（提交后 ~15min）
- 见文末追加（脚本：~/.hermes/cache/scratch/gridpaw_inspect_verify.py）

## 备注
- `/community/` 与 `/reset-password/` 均在 sitemap-0.xml 中（81 条，pictomino-sitemap.xml 12 条，合计 93）。
- 较上轮（10-11，未收录 3 条）减少 1 条：`/binary/takuzu/` 不再出现在未收录列表（已收录 90→91）。
- robots.txt `Allow: /`，无 sitemap URL 被 Disallow。

## API 验证结果（提交后追加）
（2026-10-12 10:10 追加，URL Inspection API 直查）

| URL | coverageState | lastCrawlTime | sitemap 引用 |
|---|---|---|---|
| https://gridpaw.com/community/ | Discovered - currently not indexed | None（提交后 ~30min 未观察到新抓取） | sitemap-0.xml + sitemap.xml |
| https://gridpaw.com/reset-password/ | URL is unknown to Google | None | 无 |

## 复查（gridpaw_unindexed.py，10:10）
- 已收录 91 / 未收录 2（community、reset-password），查询失败 0。
- community 提交前「无法识别/无sitemap」→ 提交后「已发现/有sitemap」：状态与 sitemap 字段联动变化，按对账期飘动处理，不算进展归因。
- reset-password：直接 API 显示 unknown/无sitemap，脚本显示已发现/有sitemap，两处读取不一致（对账期飘动）；noindex 页，Google 不收录属预期。
- 上轮 /binary/takuzu/ 已不在未收录列表（90→91）。
