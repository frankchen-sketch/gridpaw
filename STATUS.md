# GridPaw 现役状态（STATUS.md）

> 项目状态的**唯一入口**。主题细节在各主题文档（见下方索引），此处只放现役结论与待决策。
> 最后核对：2026-09-15 ｜ 分支 `main` ｜ 工作区干净
>
> 治理依据：`~/workspace/AGENTS.md`「AGENTS.md 内容治理」——状态/进度进本文件，不进 AGENTS.md。

---

## 一、现役事实（2026-09-15 工具实测）

| 项 | 状态 | 证据 |
|---|---|---|
| 站点 | gridpaw.com 正常 | 68/68 sitemap URL 返回 200 |
| 构建 | 通过（132 页） | `pnpm run build` exit 0 |
| 部署 | CF Pages 生产已同步 | `c1714195.gridpaw.pages.dev` → apex |
| 远端 | `origin/main` 已同步 | 工作区 0 未提交 |
| GSC | 属性 `sc-domain:gridpaw.com` 接入完成 | sitemap 报 `submitted=68, errors=0`（修复前为 0） |
| GA4 | Property 552793510 可 API | 服务账号 A |
| IndexNow | 可用，key 已轮换并移出版本控制 | 提交实测 HTTP 200；旧 key 线上 404 |

**流量基线**：30 天 GA4 约 250 session，其中 Google 自然流量仅 **15 session**；GSC 9/3–9/12 共 **212 曝光 / 5 点击**，平均排名 14.2。

---

## 二、待决策 / 未决（有行动价值）

### 1. ✅ meowtrail.org 重复站已归权（2026-09-15 修复）

**修复前**：称「239 条规则已归权」，实测**一条都没生效**——该域名自服务 200 + 自 canonical +
Google 以独立站收录（9/1–9/15：6 点击/159 曝光，sitemap 仍提交 121 条 URL），内容与
gridpaw.com/akari/ 近重复。**它不是在传权，是在抢词。**

**根因**：zone 里那条归权规则处于「已禁用」。「239 条规则」的说法本身也是错的——实际只有
2 条规则，原那条第 1 条是主机名通配符（不做路径映射）。

**修复**：新建**保路径动态规则**
`concat("https://gridpaw.com/akari", http.request.uri.path)`。
**实测 121/121 全部 301 且目标与文档完全一致。**

**还剩 GSC 侧两步**：① 撤掉 meowtrail.org 的 sitemap 提交；② 设置 → 更改地址 → `gridpaw.com`。
详见 `REDIRECTS.md` 顶部核对表。

### 2. spatialreasoninggame.com 的 2 跳链

`301 → .html → 308 → 无扩展名`。修法：把规则目标改成无 `.html` 形式。影响有限（该域名 90 天 0 点击）。

### 3. 索引发现层

17 条 URL 仍未收录（10「已发现」+ 6「未知」+ 1「已抓取」）。cron 每天 09:30 提交 Request Indexing
（配额实测约每轮 1–2 发）。**等 2–4 周跨天数据出来再决定下一批内容写什么。**

### 4. 内容生产纪律

**当前不要再加内容页。** 已有 18 条 URL 未进索引，先让现役资产被看见。详见 `SEO-INDEXING.md`。

---

## 三、主题文档索引

| 想了解 | 读 |
|---|---|
| Agent 边界 / 命令 / 稳定约定 | `AGENTS.md` |
| 索引与发现层（sitemap、canonical、Request Indexing、IndexNow key） | `SEO-INDEXING.md` |
| 旧域名 301 映射 + 运行态核对 | `REDIRECTS.md` |
| 分析 ID / 凭据位置 / 待办 | `ASSETS.md` |
| 视觉合同（token 体系） | `STYLE.md` + `STYLE-tail-inventory.md` |
| 页面巡查底账 | `PATROL.md` |
| 视觉合同落地交接（含未做完项） | `HANDOFF-VISUAL-CONTRACT.md` |

---

## 四、下一步（按优先级）

1. **查 meowtrail.org 的 301 为何没生效**（CF Dashboard，本次无法从文档层解决）
2. 修 spatialreasoninggame.com 的 2 跳链
3. 让 cron 继续跑 Request Indexing，2–4 周后复盘索引与曝光
4. 视觉合同阶段：`HANDOFF-VISUAL-CONTRACT.md` 第三节列了欠账（样式收编 + 验证欠账）
