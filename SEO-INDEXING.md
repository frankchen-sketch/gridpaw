# GridPaw 索引/发现层底账（SEO-INDEXING.md）

> 记录 Google 索引与抓取路径的基础设施状态、已修缺陷、验证方法与复查清单。
> 首次建立：2026-09-15（法老要求审计「曝光/点击偏少 + 内页没被索引」）。
> 相关 skill：`seo-gsc-indexing-workflow`、`seo-onpage-audit`。

---

## 一、GSC / GA4 接入现状

| 项 | 值 |
|---|---|
| GSC 属性 | `sc-domain:gridpaw.com`（Domain 属性，2026-09-04 创建） |
| GSC 服务账号 | `furriq-frank-admin@furriq-daily-brief.iam.gserviceaccount.com`（完整权限，2026-09-15 加入） |
| Key 文件 | `~/.hermes/scripts/furriq-daily-brief-e15ace04af1c.json`（同一把 key 同时覆盖 GA4 + GSC） |
| GA4 | Property ID `552793510` |
| 首次可用 API | 2026-09-15 起，效果/站点地图/URL 检查全可 API 化 |

**为什么要加 SA**：在此之前 gridpaw.com 没有任何服务账号权限，所有 GSC 数据只能靠 UI 人眼看；加完之后 sitemap 提交、URL 检查、效果报表全部脚本化。

---

## 二、基线数据（2026-09-15 实测）

| 指标 | 值 | 窗口 |
|---|---|---|
| GSC 总曝光 | 212 | 9/3–9/12 |
| GSC 总点击 | 5 | 同上 |
| GSC 平均排名 | 14.2 | 同上 |
| GA4 Google 自然流量 | 15 session | 30 天 |
| GA4 direct | 189 session | 30 天（自己 + 工具 + 爬虫） |

**结论：低流量不是 301 迁移事故。** 旧域名 90 天（迁移前）合计也只有 3–6 点击/月
（meowtrail.org 3–6、meow-block.com 1–6、spatialreasoninggame.com 0）。整个网络从来没起量。

---

## 三、已修缺陷（2026-09-15 部署）

### 3.1 ★ sitemap 两层嵌套索引 —— 病根

**症状**：GSC 站点地图页状态显示「成功」，但「已发现的网页 = 0」。所有未收录页面的 URL 检查
都提示「**未检测到任何引荐站点地图**」。

**根因**：`public/sitemap.xml` 被做成索引，而它唯一的子节点是 Astro 生成的
`sitemap-index.xml` —— **又一个索引**。形成

```
sitemap.xml (索引) → sitemap-index.xml (索引) → urlset
```

sitemaps.org 协议规定索引文件只能指向 sitemap，不能指向另一个索引。Google 因此解析出 0 个 URL。

**对照组**：meowtrail.org 提交 `sitemap-index.xml`（一层嵌套，索引 → urlset），GSC API 正常返回
`web submitted=121`。证明 Google 认一层、不认两层。

**修复**：`public/sitemap.xml` 改为直接列两个 urlset：

```xml
<sitemapindex>
  <sitemap><loc>https://gridpaw.com/sitemap-0.xml</loc></sitemap>
  <sitemap><loc>https://gridpaw.com/pictomino-sitemap.xml</loc></sitemap>
</sitemapindex>
```

**修复后实测**（GSC API `/sitemaps`）：

| sitemap | 提交 URL 数 | errors |
|---|---|---|
| `sitemap.xml` | **68** | 0 |
| `sitemap-0.xml` | 56 | 0 |
| `pictomino-sitemap.xml` | 12 | 0 |

修复前这里是 0。

### 3.2 pictomino 尾斜杠与 Pages 实际行为相反

**症状**：`/pictomino/hard/` 被 Google 标记「网页会自动重定向」；其余 pictomino 页面「Google 无法识别」。

**根因**：pictomino 是纯静态 `.html`，CF Pages 上 `/pictomino/easy` = 200，
但 `/pictomino/easy/` = **308 → 去斜杠**。而 pictomino 的 12 个 canonical 和 sitemap 全部写成
**带**斜杠 → canonical 指向一个跳转 URL。

注意极性相反：主站（Astro `trailingSlash:'always'`）是 `/brain-teasers-for-adults/` = 200、
去斜杠 308；pictomino 恰好反过来。**同一个域下两种尾斜杠约定并存，是这类 bug 的温床。**

**修复**：11 个 HTML 的 canonical + `pictomino-sitemap.xml` 的 12 条 `<loc>` 全部去尾斜杠。
（`index.html` 的 `/pictomino/` 和 `game.html` 的 `/pictomino/game` 本来就对，未动。）

**效果**：修复后 `/pictomino/easy`、`/hard`、`/daily-puzzle`、`/animal-puzzles` 全部转为已收录。

### 3.3 glossary / compare 数据里漏 `/akari/` 前缀

**症状**：11 个 glossary 页 + 5 个 compare 页发出指向 404 的链接
（`/light-up-puzzle/`、`/akari-puzzle/`、`/how-to-play/`、`/how-to-solve/`、
`/what-is-light-up/`、`/logic-puzzle/`、`/cat-logic-puzzle/`、`/daily/`、`/tips/elimination/`）。

**根因**：`src/data/glossary-terms.ts` 的 `relatedPages[].href` 与
`src/data/compare-pairs.ts` 的 `slugA` 写成了根级路径。

**修复**：25 处补上 `/akari/` 前缀。修完全站真 404 页面链接 = 0。

### 3.4 `/akari/tips/` 全站死链（119 个链接）

**症状**：Akari 全站导航的 Tips 按钮指向 `/akari/tips/`，该路径 404。39 处源码引用，
渲染后 119 个链接。

**修复**：新建 `src/pages/akari/tips/index.astro` 做 tips 枢纽页
（865 词、TDK 合规、BreadcrumbList + Article schema、链向 6 个细分 tips 页），
而不是把导航改指到某个单页 —— 顺带给 5 个 ~330 词的 thin tips 页一个父节点。

### 3.5 4 个旗舰内容页是孤岛

**症状**：`/brain-teasers-for-adults/`(3609词)、`/logic-puzzle-grid/`(3447)、
`/japanese-logic-puzzles/`(2993)、`/number-grid-puzzle/`(2692) —— Google 全部「无法识别此网址」。

**根因**：这 4 个页面**只互相链接**，首页 `/`（138 入链）和 `/akari/`（138 入链）
一条链接都不指向它们。没有 sitemap 信号 + 没有内部链接路径 = 爬虫到不了。

**修复**：在 `/` 和 `/akari/` 的「Explore More」区块各加入口。
修后 4 个页面各有 6 个入链（含 `/` 和 `/akari/`）。

---

## 四、修复前后对比（68 条 sitemap URL 全量 URL 检查）

| 状态 | 修复前 | 修复后 |
|---|---|---|
| Submitted and indexed | — | **51** |
| Discovered - currently not indexed | — | 14 |
| URL is unknown to Google | **16** | **3** |

**「Google 完全不知道」从 16 降到 3。** 光是正确提交 sitemap 就让 13 个页面从「未知」翻成「已发现」。

---

## 五、持续推进动作

1. **Request Indexing**（GSC UI，API 不支持）对未收录 URL 分批提交 —— 配额实况见 5.1，**勿按 10/天 估算**。
2. 等 2–4 周，看 14 个「已发现 - 尚未编入索引」是否转正。
3. **在这个节点不要再加内容页。** 先让已有的最好页面被看见，拿到数据再决定下一批写什么。

### 5.1 Request Indexing 配额实况（2026-09-15 实测，勿按「10/天」估算）

GSC 官方口径的「~10/天」是**上限而非可达速率**。实测：

| 时刻 | 结果 |
|---|---|
| 17:5x | `/brain-teasers-for-adults/` ✅ → 下一个立刻「超出了配额」 |
| 18:2x | 重试 → 配额 |
| 18:52 | `pictomino/blog/spatial-reasoning-activities-for-kids` ✅ → 下一个「通用错误」，重试 → 配额 |

**两小时内只有 2 发成功，且 1 小时后配额会部分恢复** → 更像**缓慢回填的滑动窗口**，不是午夜重置的日计数器。

实操规则：
- **按「每轮 1–2 发」排期**：清 N 条要 N/1.5+ 天，不是 N/10 天
- 撞配额就干净收尾，别为了凑数重试；下一次 cron 接着跑
- URL 报**通用错误**（「糟糕！出了点问题」）可重试一次；重试若返配额则立即停整批

### 5.2 提交是否真生效：看 `lastCrawlTime`，不看成功文案

实测两个成功提交的 URL，Google 在**几分钟内**就来爬了：

| URL | 提交 | `lastCrawlTime` |
|---|---|---|
| `/brain-teasers-for-adults/` | ~17:55 | 2026-09-15T10:16:15Z（18:16） |
| `/pictomino/blog/spatial-reasoning-activities-for-kids` | ~18:50 | 2026-09-15T10:48:18Z（18:48） |

提交后几小时仍无 `lastCrawlTime` = 那次提交没生效。**用这个判定，不要信 UI 的成功面板。**

### 5.3 当前 cron

`gridpaw-request-indexing`（job `6d0557a0b149`），每天 09:30，已设 **15 次**，`continuity: true`。
脚本 `~/.hermes/scripts/gridpaw_unindexed.py`（带状态缓存：未收录每轮复测，已收录 7 天复扫；
68 条全测要 10 分钟+，缓存后约 2.5 分钟）。输出落在 `~/.hermes/cron/output/6d0557a0b149/`。

---

## 六、复查清单（改动后必跑）

```bash
# 1. sitemap 结构必须只有一层嵌套
curl -s https://gridpaw.com/sitemap.xml | grep -o '<loc>[^<]*</loc>'
#    预期：sitemap-0.xml + pictomino-sitemap.xml，不得出现 sitemap-index.xml

# 2. 全部 sitemap URL 必须 200（不得有 3xx）
# 3. pictomino canonical 必须无尾斜杠；主站 canonical 必须有尾斜杠
curl -s https://gridpaw.com/pictomino/easy | grep -o 'rel="canonical"[^>]*'
curl -s https://gridpaw.com/brain-teasers-for-adults/ | grep -o 'rel="canonical"[^>]*'
```

**GSC API 复查**（SA 已授权）：

```python
# key: ~/.hermes/scripts/furriq-daily-brief-e15ace04af1c.json
# 站点地图 URL 数
GET https://www.googleapis.com/webmasters/v3/sites/{quoted(sc-domain:gridpaw.com)}/sitemaps
#   → contents[].submitted 必须 > 0（0 = 又坏了）
# URL 检查
POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
```

---

## 七、坑记录

- **GSC 索引报告是爬取快照，不是实时状态。** 9/15 读到的「26 个已抓取-尚未编入索引」
  是 9/5–9/6 的爬取结果，逐个 URL 检查后 26 个**全部已收录**。判断收录必须用 URL Inspection，
  不能用首页那张报告图。
- **`<meta name="description" content="...'s ...">` 不会被撇号截断。** 用正则
  `content=["\'](.*?)["\']` 抓会误报（撇号被当结束符）。必须用 `curl | grep -o '<meta name="description"[^>]*>'` 看原始 HTML。
- **`sitemap.xml` 的改动有边缘传播延迟。** 部署后立刻 curl 可能还是旧内容，等 ~20s 或查
  `<deployment>.gridpaw.pages.dev` 确认。
- **Astro 的 exclude 列表是对的**：`astro.config.mjs` 排除的 6 个路径 + 70 个 puzzle 页
  确实全部 `noindex`，sitemap 与 noindex 零矛盾（实测：sitemap 里被 noindex 的页面 = 0）。
  排除逻辑本身没有问题，问题是索引嵌套。
