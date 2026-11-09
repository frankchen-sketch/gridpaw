# GridPaw 现役状态（STATUS.md）

> 项目状态的**唯一入口**。此处只放现役结论与待决策；主题细节在各主题文档（见下方索引）。
> **历史完成报告已归档 → [`STATUS-ARCHIVE.md`](STATUS-ARCHIVE.md)**（2026-09~11 的部署叙事、验收数据、坑清单全文，约 66K 字符）。
> 最后全站核对：2026-09-19；此后按条目增量更新（最新 2026-11-09）｜ 分支 `main`
> **章节排序约定**：上部（现役执行入口 / 状态摘要 / 跨会话指针 / 一、现役事实 / 二、待决策 / 三、索引）按重要性排；下部时间序列章节**按时间正序追加**，中段带编号的历史专题节（四~八）非严格排序，找现役只看上部与文末最近几节。

## 现役执行入口（新会话从这里开始）

| 优先级 | 事项 | 入口 |
|---|---|---|
| **P0** | BP3 L54-136（英 83 关，1 关/页）+ 德语 L31-137 | `research/2026-11-08-bp3-expansion-plan.md` |
| **P1** | R&E Ch1 L12-31（约 20 关，等 BP3 铺完再开） | `research/2026-11-08-rxe-recheck.md` |
| — | 2027-01-04 前只巩固不扩张（第一枪 R&E、第二枪 akari solver） | `research/2026-11-05-battle-plan.md` |
| — | 方向定义 | `research/2026-11-05-next-direction.md` |
| — | 0924 横向拓展前置验证（GamePix 供给侧 + DR 差距） | `research/2026-09-24_横向拓展前置验证_GamePix供给侧与DR差距.md` |

## 现役状态摘要（截至 2026-11-09）

- **广告（Adsterra，2026-11-07 恢复）**：banner-only 四档互斥（桌面 160×600 / 平板 728×90 / 移动 320×50 / 内容页 300×250）；`PLAY_SURFACES` 白名单 106 页 play surface 零广告（26 条精确路径 + 2 条前缀），**新增游戏页/解题器页/单关页必须同步加**。**铁律：任何一起跳转投诉=当天撤不辩护**。Journey 上线前必须先撤 Adsterra 并清 ads.txt 的 google 行。Native 卡片不恢复。机制与实测见 AGENTS.md「广告现役状态」+ skill `ad-network-monetization`
- **Adsterra 引擎合规**：官方引擎 10-20 起全量自动生效；11-07 恢复时已按 API 现值 `bauval.org/22/<key>` 贴码=已合规。风险项=创意/落地页更偏诱导型（与 10-29 结论是两条独立风险线），重启期监控后台 Creative 变化
- **对 Peter 的承诺（10-29，仍有效）**：任何广告上线前先 /changelog/ 公告；玩家再报跳转=当天处理；他可直接永久除名无需再问。DLES.gg 条目保持 delisted
- **GSC 收录推进**：11-08 提交 11 页，**L54/L55 次日已「已收录」**（请求编入索引杠杆成立）；每日配额实测=11 次，且 11-09 起 **>25h 未恢复**（与「约 1 小时」和「午夜重置」两种模型都不符，恢复时刻未知）；cron `4dd8b22f7490` 每日 09/12/15/18/21 探测（队列 191 URL，已交 11）
- **广告曝光基线（11-07 23:00→11-08 12:00）**：1,147 imp / 1 click / CPM $0.227；imp/PV≈1.8-1.9（双槽满填，不是填充问题）；**瓶颈=PV 不是槽位**；稳态 ≈3,800 imp/天 ≈ $0.9/天。仪表必须 `timezone=GMT+08:00`（默认 GMT+0 会把 13h 拆成两天）
- **Reddit**：r/puzzlevideogames 10-28 数据帖 `1xhrfni` 被 ModTeam 删除（标题读作粉丝口吻、未披露 maker 身份）。**纪律：所有自关帖从第一版起带 maker 披露**
- **Umami（2026-11-09 上线）**：自建 `umami.gridpaw.com`（mini Docker + CF Tunnel），埋点已进 471 页；与 GA4/Clarity 同生产域守卫

## 跨会话指针（原 memory 下沉 2026-10-20）

- lemmy 账本=`backlink-workspace/records/lemmy-post-status.txt`，凭据=`~/.hermes/scripts/.lemmy_gridpaw.json`
- 上线前测试链=skill `game-pre-launch-testing`
- 治理依据：`~/workspace/AGENTS.md`——状态/进度进本文件，不进 AGENTS.md

## 一、现役事实（2026-09-15 工具实测）

| 项 | 状态 | 证据 |
|---|---|---|
| 站点 | gridpaw.com 正常 | 68/68 sitemap URL 返回 200（2026-09-16 复测：sitemap-0 取 56 + pictomino 12） |
| 构建 | 通过（132 页） | 2026-09-16 复跑 `pnpm run build` exit 0（8.80s） |
| 部署 | CF Pages 生产已同步 | `c1714195.gridpaw.pages.dev` → apex |
| 远端 | `origin/main` 已同步 | 工作区 0 未提交 |
| GSC | 属性 `sc-domain:gridpaw.com` 接入完成 | sitemap 报 `submitted=68, errors=0`（2026-09-16 复核仍 68/0） |
| GA4 | Property 552793510 可 API | 服务账号 A |
| IndexNow | key 已轮换，新 key 200 | ✅ 2026-09-16 已闭环：旧 key **源站 404**；apex 上因 **CF Pages asset 层边缘缓存**曾间歇 200，**Purge 无效**，最终用 **Redirect Rule**（`/390e…txt` → 301 `/`）解决 —— 实测 30/30 全 301（AMS/LHR/FRA）。详见 `SEO-INDEXING.md` §5.4 |

**流量基线（2026-09-17 复核，口径已修正）**：GA4 服务端数据**从 2026-09-04 起才有**（commit `3003a3f` 那天才把埋点换成本站专属衡量 ID `G-4FWP61DJCC`）——所谓「30 天」实际只有 14 天。旧记录「30 天 257 session」即由此误读而来。

| 窗口（hostName=`gridpaw.com`） | session | users | PV |
|---|---|---|---|
| 09-04~09-16（全部历史，14 天） | **231** | 198 | 350 |
| 09-16 单日 | 4 | 4 | 3 |
| 09-17 单日（当日未完整） | 3 | 3 | 5 |

分渠道（14 天）：**Direct 183 / Unassigned 31 / Organic Search 17 / AI Assistant 5 / Referral 2 / Organic Social 1**。无品牌新站 Direct 占七成，其中**约 50% 会话来自云机房 IP**（Council Bluffs、Boardman、Ashburn、San Jose、Glenview、Amsterdam…），特征是时长 0–31s、人均 1.2–1.5 页、零 referrer —— 机器人/爬虫，不是用户。**Clarity 独立佐证（近 3 天）：真人会话 27 / 机器人 52。**

GSC 近 28 天（08-20~09-16）**267 曝光 / 5 点击**，均位 13.8。按设备拆：**桌面 180 曝光 / 2 点击 / 均位 17.5**；**移动 87 曝光 / 3 点击 / 均位 6.1**。曝光在涨（日均 6 → 30），但涨的主要是桌面均位 25–90 的长尾。

> ️ **CTR 不能横向直读（2026-09-17 分层实测修正，推翻了本文件此前「瓶颈是 CTR 0.67%」的结论）**：总体 CTR 低是**曝光结构**造成的假象 —— **位置 ≤10 时 CTR = 6.7%**（30 曝光 / 2 点击），位置 >10 的 50 曝光 0 点击。query 维度里 **62% 的曝光落在位置 >10**。所以别去改标题/描述，先把曝光按 `position` 分层再判断。
> ⚠️ **GSC 侧同样有自动化污染（与 GA4 机房 IP 是同一批流量）**：`nld` 桌面 22 曝光中 **16 条来自单一查询 `akari or step back`**（位置稳定 10–11、跨 8 天、0 点击、只落一页）—— GA4 同窗口 Netherlands/Amsterdam **恰好 17 会话、1 会话 1 用户**，两边对得上，是 rank-tracker 轮询。另有 `%site.nikoli.co.jp akari rules light up` 这类带 `%` 编码残留的查询（人不会这么打字）。**读 GSC 也要按 country/query 剔工具流量。**
> **真正的机会靶子只有 3 个**（桌面均位 8–11 的边缘页）：`/akari/how-to-solve/`（位 10.5）、`/akari/how-to-play/`（位 9.0）、首页 `/`（`shikaku online` 位 8.5/10.2）。位置 >20 的桌面长尾（`logic puzzle online` 90.5、`logic grid puzzles online` 74.3、`sudoku related games` 55.5）不要投预算。

> ⚠️ **GA4 拉数口径（强制）**：所有 GA4 查询必须加 `hostName` 过滤（只算 `gridpaw.com`）。否则 `localhost` / `*.pages.dev` 预览域 / 局域网 IP 的自测流量会混进来 —— 实测污染 28 会话 ≈ 9%（含 `192.168.31.52` LAN 与 `/?_gsaptest=` 测试 URL）。已落到三处：`public/analytics.js` + `SEOHead.astro`（dev/预览域从 2026-09-17 起不再上报）、`~/.hermes/scripts/gridpaw_ga4_dump.py`、cron-dashboard `build_metrics.py`（`host_filter`）。
>
> ⚠️ **别用周环比**：单日 3–4 会话的体量下，周环比是纯噪声。09-04~09-09 的「高位」是上线期一次性访问 + 提交动作招来的爬虫扫描，不是基线。看 **28 天滚动 + 分渠道**，并单独剔除机房 IP。

> ⚠️ **GSC 口径坑**：**query 维度**同窗口只返回部分曝光 / 词 —— 其余被 Google **匿名化过滤**（曝光仍计入总数，但不返回关键词）。**不能用 query 维度算总量，会严重低估。**

---

## 二、待决策 / 未决（有行动价值）

> 2026-09 的历史待决（索引发现层 3、第 4 个游戏选型 5、compare 页孤岛 6、低 KD 双词观察期 8，以及已完成的 1/2/7）已结案或过期，全文见 `STATUS-ARCHIVE.md`。
> 当前待决集中在上表「现役执行入口」的 P0/P1 与上方各条状态标注；新增待决在本节追加，结案后删除并归档。

## 三、主题文档索引

| 想了解 | 读 |
|---|---|
| Agent 边界 / 命令 / 稳定约定 | `AGENTS.md` |
| 索引与发现层（sitemap、canonical、Request Indexing、IndexNow key） | `SEO-INDEXING.md` |
| 旧域名 301 映射 + 运行态核对 | `REDIRECTS.md` |
| 分析 ID / 凭据位置 / 待办 | `ASSETS.md` |
| **自建漏斗 + 版本归因（实施全文档）** | `GRIDPAW-FUNNEL-VERSIONING.md` |
| 视觉合同（token 体系） | `STYLE.md` + `STYLE-tail-inventory.md` |
| 页面巡查底账 | `PATROL.md` |
| 视觉合同落地交接（含未做完项） | `HANDOFF-VISUAL-CONTRACT.md` |
| 第 4 个游戏候选词 + 页面形态机会 | `research/2026-09-16_第四个游戏候选与页面形态机会.md` |

---

### 方向研究索引（2026-11-09 定案，新会话可直接引用结论）

| 主题 | 定案结论 | 文件 |
|---|---|---|
| 工具站盘面（新词/新站/hosted 三池） | 游戏工具站是唯一可复制方向 | `research/2026-11-09-tool-site-direction.md` |
| 新游戏工具站变现（31 站抽样） | **只有广告 + 打赏两条腿，单页不变现** | `research/2026-11-09-tool-site-monetization.md` |
| checkout 数据（227 新站样本） | 付费全在交易型，内容站进不去 | `research/2026-11-09-checkout-direction.md` |
| sousaku / AI 视频层 | 中转换皮 3千-5.5万 checkout，但获客是另一门生意 → **否决** | `research/2026-11-09-ai-video-layer.md` |
| 游戏订阅工具站 + 纯 checkout | mapgenie 订阅成立但不可复制；新站现实区间 5千-2万；**抽卡手游不成立**（WuWa 7 词 vs Roblox 236，大 DAU 要加 UGC） | `research/2026-11-09-game-subscription-tools.md` |
| **gridpaw 订阅模型测算** | BP3 占 81.4% 流量、solver 仅 1.4%（108 clicks/28d）；订阅 vs AdSense 6.6 倍但绝对值太小 → **不做全站订阅**；一次性需求是结构障碍 | `research/2026-11-09-gridpaw-subscription-model.md` |
| **GSC 工具方向判死** | Wizard 11.7万访问 vs mcpsearchconsole 1,537（停留 157s vs 3.4s）；MCP 已被 3 个 MIT 开源填满 → **否决**（SaaS 生意非建站生意） | `research/2026-11-09-gsc-tools-verdict.md` |
| **solver 机会点（另一会话）** | 无第 5 个日式谜题 solver 值得做（全家桶去重 3,900/月，天花板 230-1,170 visits/月）；机会 = ①`/nonogram/solver/` 修排名 ②KenKen 新页 ③自定义盘面（待验证）。含 4 周可证伪判据 | `research/2026-11-09-next-solver-opportunity.md` |

> 七份研究的共同结论：**没有找到比「gridpaw 现有攻略线 + AdSense」更匹配当前能力的方向**。2027-01 前的执行口径不变（§四 + `research/2026-11-05-battle-plan.md`）。

## 四、下一步（按优先级）

| 优先级 | 事项 | 状态 / 入口 |
|---|---|---|
| **P0** | BP3 L54-136 英 83 关 + 德语 L31-137 | 见「现役执行入口」 |
| **P1** | R&E Ch1 L12-31（约 20 关，等 BP3 铺完再开） | `research/2026-11-08-rxe-recheck.md` |
| **实验中** | **BP3「Unlock all」支付意向测试**：top10 关卡页挂横条 + `/unlock-all/` 落地页（$4.99 预览、mailto 收集意向、未接支付），埋 `unlock_click` 四通道。**判决规则：14 天内 ≥2% 点击 → 建支付；<0.5% → 永久放弃** | 分支 `add-支付功能开发` / worktree `gridpaw-paywall`（commit `454f1a8`）；测算依据 `research/2026-11-09-gridpaw-subscription-model.md` |
| 待办 | 对账 Pages 报告 27 条「已发现不抓取」× sitemap 68 条（GSC UI 导出，API 不出清单） | §二 |
| 待办 | **Pictomino 实现 easy/hard 模式**（2026-09-28 拍板）：落地页宣传 3×3 + 7 命，`game.html` 只实现 `mode=daily` | `public/pictomino/game.html` + `help-docs/pictomino.md` |
| 待办 | **Phase 2 裁决点 = 11-10**（月度体检 cron `1041dc2740c8`）：takuzu / hashiwokakero 词位若动了 → 补 blog/glossary 页型 | §六 |
| 待办 | 视觉合同欠账（样式收编 + 验证欠账） | `HANDOFF-VISUAL-CONTRACT.md` §三 |
| 待办 | **solver 线机会**：① `/nonogram/solver/` 修排名（snippet 重写 + 内链锚集中 + H2 吃 online/checker/helper）② KenKen solver 新页（`calcudoku-engine` 引擎现成）。4 周判据：head 词 pos ≤10 且 clicks ≥40/28d | `research/2026-11-09-next-solver-opportunity.md` |

> **已作废（勿再执行）**：11-07 收 28 天验证窗（10-16 二次读数已提前通过，见 NEWWORD-LEDGER.md）、10/3 复查 how-to-solve Title（观察期已过）、9/30 Request Indexing cron（repeat 已用完）


## 六、扩量决策 + 内容集群线（2026-10-09 上线，commit `93c1525`）

> **扩量拍板（法老 2026-10-09）**：不加第 9 个游戏，克隆 akari 内容集群模式到 binary + hashi。依据（GSC 28d 实测）：akari 集群 26 页 = 谜题词曝光 411（全站其他词根总和 2.5 倍）= 模式验证；binary/takuzu 词族 pos 8.6-9.1 已在第 1 页（产品未投内容就自己爬上来）、hashiwokakero pos 8 / hashi sudoku pos 10；kenken 被 NYT 官方压着（pos 43+）不投内容；star-battle/slitherlink 继续养信号。
>
> **噪声排除**：全站最大曝光词「akari or step back」（302 impr/月且 10 月加速）= 菲律宾女排联赛 Akari Chargers 队相关词（TikTok/排球流量误落 /akari/how-to-solve/），**假曝光，不追不接**，读 how-to-solve 页数据时必须剔除（真实曝光约 120 不是 425）。

### 首批 4 页（2026-10-09 上线，全部实测 200 + IndexNow 已推）

| 页 | 承接词 | 说明 |
|---|---|---|
| `/binary/how-to-solve/` | takuzu strategy / binary puzzle rules | 验收修正：标题/meta 的「14x14 grids」宣传已删（产品最大 10×10） |
| `/binary/takuzu/` | takuzu / takuzu game | 别名权威页，FAQ 如实答「为什么没有 14x14」 |
| `/hashi/solver/` | hashi solver / bridges puzzle solver | 带 `?embed=1` 游戏 iframe |
| `/hashi/how-to-play/` | hashiwokakero / hashi sudoku | hashiwokakero 别名权威页 |

4 页均 FAQPage + BreadcrumbList JSON-LD（build 后逐块解析验证，无伪造评分）、canonical/hreflang 尾斜杠正确、sitemap-0.xml 全收录、akari/binary/hashi 三向互链。子 agent 产出 + 主会话逐条验收（build 产物上做）。

### 后续节奏

- **Phase 2 裁决点 = 11-10**（月度体检 cron `1041dc2740c8`）：takuzu/hashiwokakero 词位动了 → 补 blog/glossary 页型到爬得快的集群；某页连续两月零曝光 → 查 thin/意图
- GSC 收录预期 1-2 周（hub 内链 + 新 sitemap 已被 build 收录）

---

## 七、Lemmy 运营线（2026-10-09 恢复正常运营，法老拍板）

- **定位：dev log 风格正常运营**（类似 reddit gamedev），**永不降级**（此前复盘 cron 的降级建议已作废）
- 发帖 cron `88953652f56c`：周一/周四 10:00 各一轮（!dailygames + 自有社区 !gridpaw_dailyakari 各 1 帖），内容角度从 gridpaw.com 真实素材轮换（新游戏/引擎改进/changelog），自带「查评论→优先回评论」纪律
- 复盘 cron `a23ec4836634`：每日 11:00（6+2 帖存活性/订阅数/GA4 归因/被删警），**ROI 警不再升级、只记录数据**
- **发帖 cron 升级（2026-10-14 法老拍板）**：`88953652f56c` prompt 加「帖正文三段结构」——① Update 一句话（changelog/git log 真实取材，禁编造）② 规则段 3-5 行（新玩家英文短句：怎么赢/机制/每日关）③ 引用与直链（Full changelog→`/from/lemmy-devlog`；游戏直链用 `/from/lemmy-*` 短链，帖内一律完整 URL）。dailygames 版偏改动、自有社区版偏玩法+解法；+whoami 部署前探活。三段结构同步沉淀 skill `lemmy-community-ops`。10-12 短链部署已闭环（1abbd39 → 10-13 deployment 51b2293d，302 实测）
- 账本真源：`~/workspace/backlink-workspace/records/lemmy-post-status.txt` + `records/daily/`；自有社区 39 订阅（38 联邦全沉睡，subscribers_local=1），开刊两周评论 0 条，真实互动 = dailygames 大盘帖那批（5 up + 5 评论）
- 归因基建：`/from/lemmy-*` path 短链（public/_redirects，commit 879036e；Lemmy 剥 query → 站内 302 附加 utm），`/from/lemmy-devlog` → /changelog/
- 首轮双帖（10-09）：[dailygames dev log](https://lemmy.zip/post/72921573) + [自有社区](https://lemmy.zip/post/72921575)
- **遗留待办**：漏斗周报 cron `53f2a4b531f1` deliver=all 投递坏（10-04 结果丢失）→ 待改 deliver 目标
- 新游戏收录（10-09 实测）：5 页（slitherlink/star-battle/kenken/hashi/binary）GSC URL Inspection **5/5 Submitted and indexed**，无孤岛（首页+akari 双入口内链），UV 基线：近 7 天 178 UV / 日均 ~30

---

## 八、内页攻略战（2026-10-10 上线 5 页，雷达首个实战命中）

> 源头：T1 品类反推 arrows puzzle 词族（com.ecffri.arrows 100M+ 装，词 12 个月单边爬升）。全量词/KD 数据与状态机见 `NEWWORD-LEDGER.md`（去重真源），本节只记作战面。

### 5 页清单与首次读数（2026-10-12，窗口第 2-3 天）

| 页 | 承接词 | KD | GSC 读数（10-10~12） | 判断 |
|---|---|---|---|---|
| /arrows-puzzle/ | arrows puzzle | 40.5 | 9 imp / pos 6.8 / com.ecffri.arrows 已出曝光 | hub 起位 |
| /arrows-puzzle-walkthrough/ | walkthrough | **11.6** 旗舰 | 9 imp / pos 6.7 | 起位，观察斜率 |
| /block-blast-hints/ | block blast hints | 20.3 | 3 imp / pos 8.3 | 慢热 |
| /meowdoku-guide/ | meowdoku alternative/tips | 42.2 | **33 imp / 2 clk / pos 7.9**；meowdoku tips pos 1.0 | **领跑**，变体词打法 2 天见牙 |
| /cross-math-puzzle/ | cross math puzzle | 53.8 | 2 imp / pos **3.5** | 位置好量未起 |

- GA4 落地这 5 页 = 0 会话（窗口早期正常，GSC 2 clk 需排自测）；全站大盘 217-305 imp/日未被带动
- **复查点 2026-10-17**（GSC 滞后消化完 + 满 7 天）：meowdoku-guide 日曝光 <15 或 arrows 双页停 9 不动 → 给 walkthrough 页加内链权重
- **复查结论 2026-10-17（三读，第 8 天）**：触发条件全不成立，不加内链权重——累计 **1029 imp / 9 clk**（首读 56 → 二读 712 → 三读持续起量），meowdoku-guide 完整日均 **60 imp/日**（>15）、arrows 双页日均 57/33 且 bestPos 爬至 **6.0**、日合计 91→208→193→216→221 稳定爬坡（10-16 尾日 99 为滞后非掉量）。**新观察点：walkthrough 198 imp 0 clk CTR 0.0%**——11-07 收窗若仍零点击，改 description 直接给答案式文案而非内链。可玩盘（10-16 上线）时长效应 48h 未满不可读，复查排 10-19 后；详见 NEWWORD-LEDGER.md arrows puzzle 词条
- 28 天验证窗口至 **2026-11-07**

### meowdoku-guide 整页重做 + 批量布局修（2026-10-13，deploy `24e9d63f`）

**触发**：法老发现内容错位 + GA4 时长 0。审计实锤三件事：
1. **内容把游戏写错**：Meowdoku 真身是 LinkedIn Queens 类猫谜题（色区放猫/行列唯一/不接触），原页整篇按 9x9 数独写（规则/技巧/FAQ 全错）→ GA4 30d 7 会话 engagementRate 0.0% 全 bounce，而 GSC pos 9.2 + CTR 4.3% 全站最高 = 标题能骗点击、落地接不住。
2. **同类硬伤 3 页**：arrows-puzzle + arrows-puzzle-walkthrough 把"点按箭头滑出棋盘避免碰撞"写成"拖箭头指向靶子+颜色配对+传送门"（虚构机制）；block-blast-hints 1 处 FAQ 错（称落子可回改，实际不可移动）。
3. **布局 bug 8 页**：`class="seo-content"` 本页未定义 → Read Next 贴左（meowdoku/arrows×2/block-blast/cross-math/brain-teasers/japanese/logic-puzzle-grid）。

**meowdoku 重做**（skill `game-guide-page-playbook` 沉淀了全流程）：
- 框架照 SERP#1 meowdoku.org（EMD 5 个月月 43.4 万访问）：规则 4 条+演示盘 → Controls → 6 策略 → **Level 1-3 真实答案**（竞品图逐格像素采样还原分区图 + 唯一解求解器枚举验证 + 对照官方答案）→ FAQ 6 条 Schema 同步重写
- TDK 不动（排名/CTR 已验证）；"answers" 意图从劝退文改为真答案+推导示范；随机化盘面免责置顶；猫 sprite/盘面快照落 `public/meowdoku-guide/`
- Phase 2 挂账：meowdoku answers level N 逐关 pSEO 页（竞品 meowdoku.app 靠该词族月 12.3K 流量，KD 42）

**批量修**：8 页 `seo-content`→`seo-section`（720px 居中）。Playwright 验收：Read Next secLeft=280==mainLeft=280、移动端 0 溢出、棋盘 20 猫 10✕ 分毫不差。

**待办**：arrows 双页虚构机制重写 + block-blast FAQ 修正（同 skill 流程，待法老排期）→ **✅ 已完成（2026-10-13 下午，deploy `da5d6f87`，commit `5022e76`）**：arrows 双页照 meowdoku 骨架重写（官方验证玩法：点按滑出/碰撞扣心/双头箭头/Normal→Nightmare），CSS 箭头演示盘 + 2 官方截图；block-blast FAQ 双落盘修正。验收抓到子 agent 保留旧页冷蓝主题（#3D6BF0）→ 全量换暖琥珀+奶油白后 vision 复读确认。"arrows puzzle walkthrough" SERP 补测：KD 8.1 极易，#2/#7 均为 DR 0 六个月新站 = 全站最容易正面进入的词；竞品 arrowspuzzleguide.com 框架 = Level 1–1000 逐关索引+难度分层+daily，**逐关 pSEO Phase 2 侦察结论（2026-10-13 下午，暂缓立项）**：
- 竞品真相：arrowspuzzleguide.com 逐关页 = 纯模板文字+YouTube 嵌入（零真数据）；mobilepuzzlehelp.com = 结构化 SVG 盘面+data-replay-steps 解法序，L1 与实机视频吻合，但按 marker 方向建模存在同列相向不可解配置（#1↔#33），按 data-direction+领先点阻挡可解率 93-100% 非全绿——真实性无法完全验证
- ROI 反证：两个 DR0 竞品全站月访问合计 ~3.6K（含其他游戏），摊到 1000 页 ≈ 每页 1-2 访问/月；逐关词族=低价值词海 + scaled-content 风险
- 视频管线不成立：YouTube 仅 android 客户端可下（640×360），盘面 <250px，vision 数箭头不可靠
- 替代方案：做 3-5 个高意图页（how many levels / max level / level 1000），等 10-17 GSC 数据再评估
- **差异化对比节已上线（2026-10-13 晚，deploy `6dc6b820`，commit `8d41c2e`）**：三 guide 页（arrows/arrows-walkthrough/meowdoku）FAQ 前新增 "How This Guide Compares" 资源类型对比表——本 guide vs 官方商店页 vs 视频攻略 vs 自动生成站；不点名竞品，全部可验证事实；移动端堆叠卡片。此节为 E-E-A-T 差异化标配，后续新 guide 页照抄
- **Level 1-3 逐关攻略已上线（2026-10-13 深夜，deploy `193d5113`，commit `821d8c0`）**：walkthrough 页新增已验证逐关节（SVG 重绘盘面）。L1/L2 任意顺序（轨道独立），L3 首个顺序敏感关（长S被#1+#4挡，解序 1→4→2→3，求解器+视频4击零掉心吻合）。数据管线：同款短视频逐帧蒙太奇+vision 追踪消失顺序 ↔ 竞品 SVG 几何交叉验证，小关（≤4箭头）可靠；10-17 复查后视 GSC 表现决定是否扩到 L4-L10
- **Levels 4-10 已验证事实表 + 需求 CTA 已上线（2026-10-13 深夜，deploy `daf87eea`，commit `7f7ae3e`）**：L4 起盘面重叠成迷宫状超视频验证上限（盲读实锤），禁虚构不画盘 → 改发逐关事实：尺寸/箭头数（结构化数据×实拍交叉）+ 实况（L4/5/7/8 零掉心、L6 心形盘+Hard、**L10 Hard+实拍掉心=前10关唯一碰撞实证**；通关语轮换 Well done!/Nice!/Brilliant!）。CTA「Yes — bring on Levels 11+」单击投票 → `guide_more_levels_click`（GA4-only 非 D1 白名单）；Playwright defineProperty 拦截实测事件名/参数逐字命中。**复盘：L4 复原尝试失败是正确止损——单帧问拓扑必幻觉，序列追踪只够验事实不够验几何**。CTA 数据后续在 GA4 查 guide_more_levels_click 计数决定 L11+ 批次立项

### 外链策略（2026-10-12 拍板：分层，不均摊）

内链全站必做（零成本）；外链只给「有排名机会但差一口气」的页——若 10-17 复查确认 walkthrough 卡住，KD 11.6 对应预算（10-20 引用域）花在它身上。

**3ue 实证（2026-10-12，两轮抓取，完整判定报告 `backlink-pool/meowdoku.org-classified-final.md`）**：竞品 DR39 = 101 引荐域，链接 **100% 砸首页**（根域 939 反链/92 域，子页 /play 仅 32 反链 1 域）。头部 edu 链真身 = **博客评论**（fsu/bc/american/williams/uco.es 全是 NOFOLLOW UGC 评论，锚文本统一 "Meowdoku Game Guide"，话术模板化）——即一条规模化评论外链流水线，非自然 editorial。**结论**：gridpaw 不给内页买外链；5 页权重走内链体系；外链若做打 gridpaw.com 首页，载体用现成 blog-comment 管线（锚品牌词 "GridPaw"，话术手写不套模板）。优先级：不急，10-17 复查确认卡住后再动。

---

## 五、自建漏斗 + 版本归因（2026-09-18 P0+P1+P2 已上线）

照 `GRIDPAW-FUNNEL-VERSIONING.md` 全量落地（furriq 方案跨站适配）。现役事实：

| 项 | 状态 | 证据（2026-09-18 实测） |
|---|---|---|
| build id 注入 | ✅ | `pnpm run build` 输出 `[build-info] 299fa4c-dirty …`；`grep 299fa4c-dirty dist/index.html` 命中 |
| D1 表 | ✅ | remote meowtrail-users：`gp_event` / `gp_build` 存在（`sqlite_master` 实查） |
| ingest 端点 | ✅ | 生产 `POST /api/events` → 200 + `Set-Cookie: gp_gid=…`；白名单外事件 400 |
| 归因端点 | ✅ | 无 token 403；带 token 返回 stage/signin/traffic/lastvisit 四段 |
| admin 页 | ✅ | `/admin/funnel/` 200 + `X-Robots-Tag: noindex`（`public/_headers`）+ robots meta；**未进 sitemap**（`sitemap-0.xml` 实查无 admin） |
| 生产数据 | ✅ | D1 实查：`visit` 落库带 `build_id='299fa4c-dirty'`；`gp_build` 有该行 |
| 看板接入 | ✅ | cron-dashboard `CRON_DASH_SAMPLES=1` 全链路 + 真实采集跑通；`buildfunnel = {furriq, gridpaw}` 双站；三层对账一致（D1 直查 = metrics.db = dashboard_data.json） |
| admin token | 本地 `.funnel-admin-token`（gitignore）+ Pages secret `FUNNEL_ADMIN_TOKEN`；开关 `FUNNEL_EVENT_INGESTION_ENABLED` 只在 wrangler.toml [vars] 一处 |

- 漏斗阶段：visit → start(game_start) → move(first_move) → solve(level_up) → hint(hint_click) → share(share_reddit+share_copy) → signin(daily_progress.user_id)
- 归因口径：按访客**首次到访**版本（rn=1），回访不重归因；live = 24h 内有 visit
- **读表纪律**（实施文档 §6.7）：单版本 visit 两位数以内 = 噪声，禁止下改版结论；先查 bot 比例（`json_extract(metadata,'$.isLikelyBot')`，机房流量约半数）；发布后 CDN 旧 HTML 继续报旧 build id 是预期
- 未做（有意）：pictomino 子站接入（P1 可选项，`public/pictomino/*.html` 需 `build-id.js` + analytics.js 改造）；CF Access 替代 token；identity 合并表

---

## 历史事件档案

2026-09-21 ~ 2026-11-08 的全部按日期事件段（51 段，部署记录 / 事故复盘 / 验收数据）已搬至 `STATUS-ARCHIVE.md`「三、按日期事件段」。
**开工不必读**；查特定改动或踩过的坑时再去。
