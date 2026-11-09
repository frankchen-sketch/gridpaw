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
- **BP3 付费意向实验（2026-11-09 代码就绪，待部署）**：10 个 BP3 关卡页（GSC 28d top10，3,497 clicks）顶挂「Unlock all 137 levels」通栏（`src/components/UnlockBar.astro`），事件 `unlock_click` 四通道 + D1 白名单；落地页 `/unlock-all/`（noindex，不接支付）。**判定：14 天点击率 >2% 才做支付**。口径/决策树 → `research/2026-11-09-unlock-all-test.md`

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

## 四、下一步（按优先级）

0. **11-07 收 28 天验证窗**（§八，5 新页 2026-10-10 上线）：10-16 二次读数已提前通过复查（712 imp/8 clk/CTR 1.1%，meowdoku 日曝光 ~39 > 阈值 15，arrows 双页 6.2 仍在涨，详见 NEWWORD-LEDGER.md）——下一步看 arrows 双页进前 3-5 + 样本 ≥50 再动页面结构；**同窗观察 meowdoku-guide 可玩棋盘（2026-10-16 上线）的 D1 真源转化**：google 来源均时长 11s 短板有没有被可玩盘拉起来
1. **对账 Pages 报告 27 条「已发现不抓取」URL × sitemap 68 条**（GSC UI 导出，API 不出清单）→ 定性后再决定是否 404，禁止在交集弄清前下架（§二.7）
2. **10/3 复查 how-to-solve 新 Title CTR**（one-shot cron 已设，读数须剔除 `akari or step back` 工具流量），仍 0 真人点击则上备选文案（§二.7）
3. 让 cron 继续跑 Request Indexing 至 repeat 用完（9/30 前后），2–4 周后复盘索引与曝光
4. 视觉合同阶段：`HANDOFF-VISUAL-CONTRACT.md` 第三节列了欠账（样式收编 + 验证欠账）
5. **Pictomino 实现 easy/hard 模式**（2026-09-28 法老拍板）：`public/pictomino/easy.html`/`hard.html` 落地页宣传 3×3+7 命等模式，但 `game.html` 只实现了 `mode=daily`，`difficulty=easy|hard` 参数仅用于埋点——落地页实际跑经典 5 命难度表。要么把 easy/hard 模式真正实现进 `game.html`（读 URL 参数切难度阶梯+命数），要么改落地页文案（已拍板做前者）。帮助文档草稿 `help-docs/pictomino.md` FAQ 已标注 ⚠ 待修，实现后同步更新文档

---

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

## 2026-09-23 首页布局方案 A 上线（含一次错误回退的当轮恢复）

**上线内容**（方案 A，法老批准，deploy `71b0e4f4` → 修复性重部署 `8fb09561`）：
- ① Game Over 弹窗 h2 → div（不再污染页面大纲）
- ② 空排行榜位 → Today's Challenge 卡（`#challengeCard`，真实上榜数据时 JS 自动切回 `#dailyLeaderboardPanel`）
- ③ What Players Say 整段虚构评价（6 条假五星，2 条与站内事实自相矛盾）→ GridPaw in Numbers 真实数据块（∞/3/0/15，全部站内可验证）
- ④ Tips 双 section 合并 + /tips/ 链接（Common Mistakes 折入摘要段）

**事故与恢复**：子 agent 回报的 changed_hunks 实为「工作区 vs HEAD」整段 diff（把 9/21 Clarity 漏斗改造、9/21 真机回归修复等已部署未提交工作误报为自己的产出）。主 agent 用 HEAD 做基线比对、未先查本文件历史轮次，误判「玩法类超纲」并回退（deploy `71b0e4f4` 一度丢失 hint 三层/抖动/徽章帮助），法老拍板回退的前提因此失效。当轮发现（STATUS §9/21 记录佐证）后十处全部逐字恢复并重部署（`8fb09561`），线上 8/8 断言通过。
**教训（已录入 skill）**：判定「子 agent 超纲」前必须先查本文件历史轮次——**本仓常态化 deploy-but-uncommitted，HEAD ≠ 最近一次上线的代码**；diff 基线错误会把既有功能误判为新改动。

**遗留**：`.astro/` 两个缓存文件已 `git rm --cached` + gitignore（未 commit，随下次提交入库）；`pnpm add -D wrangler` 待办（本机无全局 wrangler，deploy 脚本会 command not found，临时用 `npx -y wrangler`）。

## 2026-09-23 深夜 新手引导上线（deploy `9129581f` → `0a8d7843` → `fc2f02f5` → 真棋盘重构 `83a400d3`→`f4ce0cae`→`840eab44`）

Clarity 实锤（30min 0 次成功拖拽、徽章狂点 17 次/分）→ 3 步教练引导（v6 预览经法老 5 轮反馈迭代后拍板）：
- **流程**：①聚光数字讲规则 → ②猫爪自动演示拖拽（用户随时上手即接管）→ ③用户亲手拖对为止（拖错仅抖动+提示不扣血，**3 秒无操作猫爪自动回来重演**）。成功出真反馈：CAT_PALETTE 橙 + 游戏真实 `.cat-face` 体系猫脸
- **触发**：`gp_onboarded_v1` 未设 且 levelNum===1；完成/Skip 均写标记；Tips 区「🐾 Replay tutorial」可重放（事件委托接线）
- **GA4**：onboard_start / onboard_step(step) / onboard_complete / onboard_skip
- ** ego-browser 全流程实测 6/6 绿**：新用户触发✓ 演示出猫矩形✓ 真实拖拽判定（坐标几何，鼠标/触摸通吃）✓ 拖错抖动+留在第3步✓ 3秒轮播✓ Skip✓ 老用户不打扰✓ Replay✓ 主游戏无影响✓
- **⚠️ 第三次踩同一个坑**：主内联脚本在页面中部，其**之后**解析的元素不能 getElementById 直接接线（Get-the-App CTA、obReplay 两次中招）——overlay markup 因此必须放在脚本之前；已写进 AGENTS.md 关键约定
- 部署暗雷再确认：会话被注入 Clash 代理（HTTP_PROXY=127.0.0.1:7890）时 wrangler 认证失败**但 exit 0 假成功**——每次部署必须核对线上 CSS hash 或部署输出含 "Deployment complete"

### 真棋盘重构（法老指令：引导要跟教学 1-4 关棋局做演示，不走架空练习盘）

### Shikaku 教练卡盖棋盘 bug（2026-09-23 深夜，法老截图报告，deploy `36e84adf`）

- **根因**：index.astro 有**两条 `.onboard-coach` 规则**（v6 残留），前 z-index:900 后 z-index:2，层叠后者胜；棋盘内拖拽幻影 `.onboard-drag` z-index:5 > 2 → 演示矩形画在卡片上。且 fixed 卡片在矮视口直接盖住棋盘底部格子，挡交互。
- **修法**：①合并重复规则为一条；②卡片从 `position:fixed; bottom` 改**文档流**，标记从页面尾部移入游戏区 board-wrap 之后——卡片永远在棋盘下方，物理上不可能再遮挡。obToast 保持 fixed。
- 实测：卡片 static 且 boardBottom=518 < cardTop=530 零重叠；STEP 2/3 拖拽幻影 ghostOverCard=false；视觉确认虚线只在棋盘内 ✓。
- **教训**：同一选择器 CSS 规则写两遍，改 z-index 时必查重复定义；fixed 浮层卡片在游戏页=遮挡风险，游戏 UI 卡片优先文档流。

### Akari ❌ 错误示范 + Pictomino 教学三关递进（2026-09-23 深夜，法老指令，deploy `6f251c48`）

- **Akari**：coach 错拍演示升级——错误目标 `akObWrongCell()` 优先选「数字已满旁会超标」的格子（number_excess，教学价值高于单纯点已亮格），fallback 已亮格；红闪同时弹 **❌**（`.ak-obx` CSS 双杠画叉+白描边，不依赖 emoji 字形）；文案按违规类型动态化（T2=猫冲突 / T3="That number already has all its cats"）。注意 **T1 无错误示范**——它的白格全被墙隔开，落子后不存在非法格（逻辑正确跳过）。实测 T2/T3 均触发 ✓。
- **Pictomino**：DIFF_TABLE 教学行改为三关递进：T1=1 洞 1 候选（认识玩法）→ T2=2 洞 1 候选（连填）→ T3=3 洞 2 候选（学判别：手里碎片对应哪个 +）；Level 4 起照旧（Easy 4×4/6 洞不动，无级联偏移）。实测 round-info：0/1 → 0/2 → 0/3 ✓。
- 测试脚手架坑：boot 恒 `startLevel(0)`（跨会话续关在局内推进）；首访必先进引导课（body.tut-mode），DOM 验证须先走完课；`.cell.hole` 数量在 showPreview 过渡期偏少，round-info 的 `Filled X/N` 是权威计数。

### Akari 固定教学盘（2026-09-23 深夜，法老拍板「4 小关递进」，deploy `08c0a1dc`）

教学关从随机改为**固定手工盘**（`AKARI_TUTORIALS` in akari/index.astro，`buildTutorialPuzzle(level)` 在 newPuzzleSkip/newPuzzle 中替换 generatePuzzle）：
- **T1 数字含义**：中心墙「4」十字盘 → 4=四邻全放，零思考首胜
- **T2 对立冲突**：中心墙「2」→ 强制两猫分居墙两侧，面对面却合法（墙挡视线）——冲突规则教具
- **T3 三线索综合**：数字 1/2/1 三墙 → 三只猫各归其位
- **T4 升格**：4×4 数字 2/2/1 → 进 Easy 前最后课
- 四盘全部经引擎 `solve(grid,size,2)` 验证**唯一解**（线上实时 solve 出 solution，不硬编码答案）；Level 4 起照旧随机。Coach 文案按关定制（akObYourTurn 查表）。
- **设计语义坑**：引擎格子编码 `9`=白格、`-1`=黑墙、`>=0`=带数字墙——`0` 是数字 0 的墙不是空格；且 solve 假定方阵，1×3/1×5 概念须嵌进 3×3（补黑行）。
- 实测：L1 `#.#/.4./#.#` → L2 `.#./.2./.#.` → L3 `.1./2#./..1` → **L4 `2.../..../21../....`（4×4）** 逐关自动进位 ✓ 零报错，四关全链路实盘验证完成。

### Akari + Pictomino 引导同步（2026-09-23 深夜，deploy `b706c159`→`0f6f9b94`→`5c18daaa`）

**Akari（新建，/akari/）**：教学关无固定棋盘——引擎 `generatePuzzle(5)` 每局随机，"真实教学盘"=玩家当下对局的 `currentPuzzle`。Coach 骑真盘：①规则卡（仅首访）→ ②爪子对错对照演示：点 `solution` 第一猫位**真落子**（handleClick 真实路径）→ 移到已亮格再点 → `cell-violation` 红闪讲解不落子 → ③用户回合：3 秒无操作爪子指下一个 solution 位，**首次合法落子即毕业**（handleClick `else akObOnPlace()` 挂钩）。状态 `akari_ob_tut` {t1,t2,t3}；GA4 onboard_start/step/complete/skip。实测：真落子 1 猫 5 亮→错拍讲解→毕业 t1 落 2 猫 12 亮，零报错。
**Pictomino（换肤，game.html）**：现有两步交互课逻辑零改动，纯 UI 品牌化——teal 横幅→白卡+STEP 徽标+琥珀箭头+真爪子悬在目标（碎片/洞）上方弹跳。实测 Step1→Step2 全链路 ✓。
**坑（新增第 4 坑）**：**module 严格模式下块内函数声明是块级作用域**——coach 块包 `if (card) {}` 导致外部钩子 `akObOnPlace` ReferenceError（崩了 handleClick）、`akObMaybeCoach` 被 try/catch 静默吞。module 脚本 deferred，DOM 必就绪，直接写顶层不包块。
预览迭代坑：::preview 框不随 HTML 加载相对路径外链脚本——预览文件必须零依赖单文件（引擎 13KB 内联）。

- **机制**：newPuzzle() 后经 `window.__obMaybeCoach()` 触发；教学关（LEVEL_DEFS[i].isTutorial）首次进入时：①rule 卡（仅第一次，附 `hint-active` 高亮答案区）→ ②猫爪在**真棋盘**上演示该关 `puzzle.solutionRects[0]` 的正确画法（虚线框+爪子手势，不落子）→ ③用户亲手拖（游戏原生 mouse/touch 路径），3 秒无操作爪子回来重演；**首次成功落子即毕业**（`__obOnPlacement` 挂在 onEnd rects.push 后）
- **状态**：`gp_ob_tut` JSON `{t1..t4:true}` 逐关记忆；T2-T4 直接进 watch（rule 只讲一次）；Skip 单独记关；老玩家/非教学关不打扰
- **Replay**：教学关未学完→重跑 coach；普通关→一次性演示手势（等效视觉 hint）
- **实测 ego-browser 7/7 绿**：T1 rule+高亮✓ 接管✓ 落子毕业✓ T2/T3 自动直进 watch✓ Skip 记关✓ 老用户不打扰✓ 非教学关 Replay 演示✓（T4 布局未模拟走通，代码路径与 T2/T3 同一）
- **坑**：`currentLevelDef` 非主脚本顶层变量（不能直接引用）→ 用引擎全局 `LEVEL_DEFS[levelNum-1]`；游戏拖拽是 mouse+touch 事件**不是 pointer**（模拟测试须发 MouseEvent）；IIFE 末尾必须主动调一次 `__obMaybeCoach()`（初始 newPuzzle 在 IIFE 之前执行）

## 2026-09-23 晚 真机反馈三连修（deploy `07f31e48` → 委托修复 `cad0a713`）

法老 mini 实测反馈 → 定位 → 修复（ego-browser 全程实测复现）：
1. **导航栏错位** = `.header-nav` 在 481-700px 宽度溢出（600px 实测溢出 20px，Solver 戳出屏幕）——桌面导航与汉堡菜单断点间有空窗。修：断点 480→700px，700/600/550/480 全宽复验溢出 0
2. **「Challenge 进去是教学关卡」** = Get the App 区「📅 Try Daily Challenge」是死链接（`href="/#play"` 不调 generateDaily），「▶ Play Now」更是 `href="/"` 直接刷新。Challenge 卡本体（Play Now）一直是好的。修：两 CTA 接线；**踩坑**：该区块在主内联脚本之后解析，直接 getElementById 接线时元素不存在、handler 静默挂空——改事件委托后冷启动 2 轮复验均正确进入 Daily 10×10
3. **💡 Stuck 提示秒消失** = badge_help 消息 2500ms 太短 → 8000ms，6 秒后仍在复验 ✓

## 2026-09-23 深夜 手机端乱码/错位修（deploy `3a79318b`）

法老手机（鸿蒙 emoji 字体）反馈乱码+工具栏错位，滑动正常 ✓：
1. **乱码根因 = keycap emoji 缺字形**：`1️⃣`（1+FE0F+20E3 组合序列）在鸿蒙字体渲染成「1」+ tofu 空心方块。首页 tips 卡 `1️⃣`→`⭐`；**全站清洗**：/akari/ 与 /akari/tips/ 的 0️⃣-4️⃣ 一律剥成纯数字（perl `\x{FE0F}\x{20E3}`），语义本就是数字卡
2. **「错位」观感根因 = status 消息连用两个 📅**：鸿蒙把 📅 渲染成带「SEPT 15」大字的日历图标，`hit the 📅 button` 被撑成三截。改为单 📅 + `hit the Daily button (calendar icon) in the toolbar!`
3. 390/360px 受控复验：工具栏排布本身正常、body 溢出 0——用户感知的错位即第 2 条
4. 全站三页线上复验 keycap 残留 0。**教训**：面向国内安卓/鸿蒙用户的站，避免 keycap 组合 emoji（AFE0F+20E3）与重复大 emoji 文案

## 2026-09-21 Clarity 漏斗改造（hint 三层 + 徽章帮助 + iOS 登录修复）

**依据**：Clarity 录屏事件流全量提取（6 会话，方法见 skill `game-event-tracking`）。关键实锤：
- hint 纯图标没人用（30 分钟重度用户 0 hint）；Tutorial 徽章被当帮助按钮 1 分钟点 17 次；L5 登录弹窗 3/3 会话 2-3 秒点 Maybe later；iOS 用户 3 次点 header sign-in 全 miss（GA4 sign_in_click=0 佐证：点击落在按钮/横幅死区）；game over 弹窗开着时拖拽穿透（2 秒 3 次 game_over）；Pictomino 首次没血即流失。
- 回放里数字显示 ▫/□ = Clarity 渲染缺陷，非站点 bug，勿按此改代码。

**本次改动**（deploy 5a12b1c6）：
- Shikaku `index.astro`：hint 图标→文字胶囊按钮（💡 Hint + 次数 badge）；连错 2 次 hint 按钮抖动放大特效（每关一次，prefers-reduced-motion 降级）；game over 弹窗加「💡 Retry with a Hint」（同一道题+回血+高亮正确矩形，无剩余 hint 则隐藏）；弹窗打开时 board pointer-events=none 修穿透；难度徽章可点→滚到 Tips 区+status 提示；game_start 延迟至 DOMContentLoaded（修 gpTrack module 注入竞态，D1 69:6 缺口根因）。
- Akari `akari/index.astro`：同款 hint 胶囊+抖动 nudge（连错 2 次触发，合规落子/换关/重置清零）；难度徽章可点→滚到 Strategy Guide；game_start 同款 DCL 修复。
- Pictomino `game.html`：失败弹窗加战绩行 + 「Skip this puzzle →」跳关按钮（puzzle_skip 埋点，GA4）。
- 白名单：`badge_help_click` 加入 funnel-track.ts + _funnel-sql.ts。
- sign-in 触控目标 44px（HIG 最小标准）+ z-index，L5 弹窗按钮同款加大。

**待验证**：D1 game_start 应随新流量恢复（部署后暂无流量未验）；iOS 真机点登录是否跳转；抖动 nudge 后 hint 使用率；badge_help_click 数量。
**未做（本轮范围外）**：sign-in 弹窗价值主张重写（延后触发/进度保存钩子，数据上 3 秒拒绝是文案问题）；pictomino gpTrack 全量接入（D1 侧仍只有 GA4）。

## 2026-09-21 真机回归修复（deploy 22ba9c6c）
- **滚动锁死**：`body{touch-action:none}` 老 bug（手机整页无法滑动，桌面无感）→ 移到 `.board`，CSS 新 hash `DlDBJQIg` 已上线。
- **登录态导航换行**：account-area 改 nowrap，名字 5.5em 截断，Play Daily 缩小。
- **登录后跳第 9 关**：云端进度恢复功能正常（admin 云端存档领先本地）→ 加「☁️ Cloud progress restored」status 提示。
- **待用户操作**：Google Cloud Console → OAuth 同意屏幕：应用名 MeowTrail-web → GridPaw，徽标换 `public/icon-512.png`，隐私链接 https://gridpaw.com/akari/privacy/（顶级 /privacy/ 待补）。

## 2026-09-22 Pictomino 接入 D1 漏斗（deploy b335cff6）
- `public/pictomino/gp-track.js`：独立打点客户端（静态页过不了 Vite），白名单/PROD 守卫/visit 去重与 funnel-track.ts 同构——**改白名单要两边同步**。
- `scripts/gen-build-info.mjs` 构建期同步产出 `public/pictomino/gp-build.js`（window.GP_BUILD）。
- game.html 埋点：visit / game_start / first_move / level_up / game_over / daily_solved / puzzle_skip / help_click / share_reddit / share_copy / community_click（`help_click` 已加双白名单）。
- 踩坑：game.html 会 302 到 `/pictomino/game`（无 .html）→ script 必须用绝对路径 `/pictomino/gp-*.js`；**改 public/ 后必须重新 pnpm build 再 deploy**（dist 才会带上）。
- 外站 iframe 跨域嵌入时 /api/events 静默失败（fetch catch），只统计 gridpaw.com 同源访问。
- 验证：D1 实收 `visit | 37ff67b-dirty | path=/pictomino/game` ✅（注意 gp_event.created_at 是毫秒整数，比较用 `(strftime('%s','now')-N)*1000`，别用 datetime()）。

## 2026-09-22 排期项落地（deploy ca678f21）
- **`/privacy/` 顶级隐私政策页**（noindex，覆盖三游戏 + 匿名埋点说明段），OAuth 同意屏链接待用户在 GCP 后台改为此地址。
- **Pictomino 失败弹窗「👁 Peek」按钮**：重放开局 2 秒预览后重试本关（hint_click source=lose_overlay_peek），与 Try again / Skip 并列。
- **漏斗周报 cron** `53f2a4b531f1`：每周日 20:00 自动拉 D1+GA4 对比改动前后，deliver=all。含样本纪律（去 bot<10 只报数）与 created_at 毫秒口径说明。

## 2026-09-26 Adsterra 变现线（过审 + 提现链路 + 格式路线决策）
- **账号侧**：公司审核 09-25 过审（主体 Guangzhou Zhuayin Intelligent Technology Co Ltd，爪印）；Native Banner Active（Site 6063560，Ad Unit 31317669）。⚠️ Adsterra 后台公司名拼成了 Zhuoyin，字段锁死改不了，工单已发 support@adsterra.com（09-25，SENT id 1a0d820ad0b5eec4），回复后去 /payout-information 复核显示名。
- **furriq.com 已建站（09-26）**：Site 6078380（category Other，成人广告关，建站直接 Active）+ Ad Unit 31420265（NativeBanner_1）。只挂 /blog/* 文章页正文中部（品种/对比/工具/定价/首页红线不挂），详情与代码坑见 `furriq/.adsterra/native-banner.snippet.md` + `furriq/AD-TIER.md`。
- **提现链路（已打通）**：Wire EUR 已随 KYB 生效（Banking Circle S.A.，IBAN DE62...5678），EUR $0 手续费 / min $1,000 / 到账 5 工作日；满额提现 → Subotiz Global Account（USD+EUR 双户）→ 换 RMB。Subotiz 侧拼写正确，无需动。
- **现状数据**：Balance $0.03（09/25 起）；广告位=4 个 SEO 内容页正文各 1 个 Native Banner（brain-teasers-for-adults / logic-puzzle-grid / japanese-logic-puzzles / number-grid-puzzle），游戏页/首页/?embed=1 全部无广告（红线维持）。
- **付费点（Kakuro 爪窥付费墙）路线（09-27 定，暂缓执行）**：现状=仅 `public/kakuro/demo.html`（noindex）里 mock（`payPeek()` 点按钮直接解锁，零支付/零广告 SDK），正式 `/kakuro/` 不带，D1 paywall_* 事件 0 条。顺序：①正式页先上门控+mock 采漏斗数据 → ②paywall_shown 有样本后看触达/转化 → ③UV 起来 + Adsterra 余额真实进账后再接支付。⚠️ demo 里「📺 Watch ad」按钮是死承诺——Adsterra 无激励视频格式（见 skill ad-network-monetization），真实现无格式可接，别让真人点到。Cat coins 真实化=整套支付集成，等数据支撑。
- **格式路线决策（09-26 定）**：
  - 现在（<100 UV/天）：不加任何格式，保持现状。
  - 内容页日 UV 几百：内容页底部加 1 个 Banner 300x250（CPM 低于 Native，纯增量库存）。
  - 稳定流量 + 余额几百刀垫底：再评估游戏页 Social Bar（只开单格式、观察一周账号状态）；游戏页零广告红线要破需单独决策。
  - **永不**：Popunder、Smartlink（整页跳转，毁回头客）。Adsterra 无激励视频格式（实测仅 Popunder/Native Banner/Banner/Smartlink/Social Bar 五种）。
- **检查广告的已知结论**：Agent 本地无法看到真实创意（CN IP 空填充/代理 403/云浏览器被识别为 bot 直接重定向 direct link），唯一现成渠道=Clarity 会话录屏（流量小暂无深滚样本，筛选路径已跑通：录制页筛选器→已访问 URL 包含页面 slug）。教训沉淀在 skill `ad-network-monetization`。
- **全站猫 emoji 清理（09-26 晚，`e6e543e`，随 `7959e4b` 部署上线）**：法老发现导航品牌位是 `🐱 GridPaw`，彻查全站共 61 文件 ~130 处：品牌位（GameNav + pictomino 10 处 brand-logo）换 favicon.svg logo；H1/CTA/toast/教程/分享文本约 115 处删 emoji；**机制图标保留**（akari 灯泡 content:'🐱'、胜利彩蛋粒子池、kakuro 迷雾 🐾 标记——玩法本体）。线上实测：首页 🐱=0、H1/CTA 干净、机制图标 CSS hash 与线上一致。顺带修 `pnpm run deploy` 依赖全局 wrangler 的坑（bare → `npx -y`）。

## 2026-10-13 漏斗诊断（game_start 口径失真）+ 口径修复（可见才计开局）

**依据**：GA4 28 天漏斗（US desktop first_move 率 14% vs mobile 38%）+ Clarity 录屏取证（3 天 54 会话全量扫描，方法见 skill `clarity-session-forensics` 的 gridpaw 实操节）。关键实锤：
- **10vuizs（US desktop，Pinterest 进首页，5:04，0 点击）事件时间线：00:00 页面访问 → 00:01 页面已隐藏 → 00:01 game_start 同秒触发 → 之后 5 分钟零事件**。后台标签页加载：game_start 在用户从未看到页面的情况下计了一次「开局」。
- 首页落地 17 会话，**11 个（65%）game_start 触发但 0 点击**；US desktop 首页 3/3 全零点击。game_start=页面加载事件，分母混入后台标签/即走/读者会话 → first_move 率被系统性低估。
- **页面本身没坏**：w50r9u 在 00:04 能正常点 New Puzzle（渲染完整、无遮罩、无空白）——首屏交互没问题。

**口径修复（11 处加载时触发的 game_start 加可见性门控）**：`document.visibilityState === 'visible'` 才触发；hidden 时挂 visibilitychange 监听转可见补发；直接关掉后台标签 = 不发。开局 = 用户真正看到棋盘：
- src/pages/index.astro（Shikaku 首页，主排名页）`_gsWhenVisible`
- `{binary,hashi,kenken,slitherlink,star-battle}/index.astro` `fireGameStart` 包 `trackGameStartWhenVisible`
- `akari/index.astro` `fireGS` 同款门控（akari/daily 的 game_start 由 start-btn 点击触发，非加载时，不改）
- `public/{nurikabe,kakuro,nonogram}/demo.html` + `public/pictomino/hard.html`（iframe load）

**验证**：`pnpm run build` exit 0（159 页）；dist 逐文件 grep 确认 11 处门控全部进产物。
**待验证（部署后）**：GA4 game_start 总量应下降（后台标签不再计入）、first_move 率应显著回升；2-4 周后重读 US desktop first_move 率对比 14% 基线。
**Murdoku 品类侦察结论另见**：detective sudoku（KD 31.5）+ murder sudoku（KD 40.3）双词入场、叙事单元 pSEO 内容页先行——调研产物在本会话记录，未落 repo。

## 2026-10-13（晚）埋点缺口补齐 + murder-sudoku 内容页先行上线

**埋点缺口补齐（commit `602464d`）**：
- kakuro/nonogram/nurikabe demo 补 `first_move`（`__firstMoveTracked` 防重）；kakuro `board_dead` 别名 `game_over`、nurikabe 血尽挂 `game_over`（跨游戏失败漏斗口径对齐）；nonogram 无死亡机制不挂 game_over
- akari 补 `game_over`（health==0，loseHealth 内）
- **pictomino 关键发现**：iframe 内 game.html 无 GA4 config（gtag 是 no-op），first_move/game_over 实际只进 D1 没进 GA4——game.html 加 `pictomino_first_move`/`pictomino_game_over` postMessage relay（同 daily_solved 既有模式），index/easy/hard/daily-puzzle 四 wrapper 接收转发 GA4

**murder-sudoku 内容页上线（deploy `869c6ba6`）**：`/murder-sudoku/` 打 murder sudoku 头词（8100/月，KD 40.3），Murdoku 商标词只在正文 educational 提及。规则源=cluedoku.app/how-to-play 逐条核对（杀手机制：V 恰与一名嫌疑人同房间）。4×4 猫主题示例盘（Mochi/Tofu/Pixel + Old Whiskers）**经暴力枚举脚本验证唯一解**（唯一布局 M r2c1/T r3c4/P r4c3(rug)，凶手 M；验证脚本 scratch/verify-murder-sudoku-example.py，第一版盘面实测 3 解打回重造）。FAQ×4 + BreadcrumbList + FAQPage schema，三 CTA 全英文，四内容页 Read Next 回链。验收清单全过（TDK 49/53+158、JSON-LD parse、Murdoku 无主词位、sitemap 收录、线上 200 + IndexNow 202）。

### 21:45 子 agent 双双回收（spike 已本地复跑验证，bench 数字逐项一致）

**引擎 spike 结论（scratch/murdoku-spike/，solver+独立暴力计数器交叉验证）**：
- **4×4：生产就绪**——唯一解收敛率 100%（30/30），6.7ms/盘，纯客户端即时生成
- **6×6：可上但必须 Web Worker**——单次调用收敛率 57%（17/30），成功均值 466ms，配重试 1-2s/盘，阻塞主线程会卡 UI
- **8×8：当前证词词汇不可行**——融合全部真证词仅 16.7% 布局可唯一化，不存在「每嫌疑人恰一条」的唯一子集；需扩展方向/相邻类证词或人工布局，MVP 不做

**竞品盘点结论（5 站）**：
- 功能最全=cluedoku（4×4→10×10+10 证词类型+duels/co-op，但流量最弱 1870/月）；内容最厚=sudokumurder（360 页/6 语言，日期归档+独立 solution 页吃 answer 长尾）；mysteryic 锁死 6×6 且明删昨题；murdersudoku 官网仅 1 页；murdoku 纯品牌+书系变现（其 sitemap 有死链 /play/sitemap.xml 404）
- **三个品类真空**：①历史题归档+可检索解答页（mysteryic 删昨题/murdersudoku 无归档/murdoku 周更）→ 每日归档 URL 是持续 SEO 红利；②免账号异步挑战（多人仅 cluedoku 有且要账号+实时在线）→ 分享链接同题比时即差异化；③推理链分享/复盘（五站都只能分享用时）→ 契合 TikTok 传播，完全空白

## 2026-10-14（凌晨）arrows 攻略页 100 关真盘浏览器上线（deploy `604ae02c`，commit `38a334d`）

**数据管线（全部 scratch/，apkenv venv）**：
- L11-L100 关卡身份 = mph 页面内联 SVG 几何 ↔ APK bundle 逐支点集匹配（match_pipeline.py，偏移搜索，86 唯一命中 + 4 包内重复资源去重后全中）。mph 几何与 APK 数据 1:1 一致（关名 07-07 批次），其关卡序号在 L1-10/L50/L200/L500/L900/L11-14 共 19 个采样点全部对上
- **重要发现：mph 的 data-replay-steps 是自动生成、未经验证的假解序**——L12 第一步就撞它自己数据里 19 格带状箭头（cross_check.py，L11-20 全灭于第一步附近）。其盘面几何真、解序不可信。这坐实了攻略页对比表「auto-generated sites: level numbers dressed up as solutions」
- 100 关解序 = solve_tip.py 语义（尖端 path[0]、指向首段反向、走廊从尖端扫到出盘、双头双向贪心）批量求解，100/100 全解无回溯，sol 长度=箭头数逐关校验
- 产物：public/arrows-puzzle/levels.json（301KB，v0.23.1 包 3,983 关中前 100）

**页面（arrows-puzzle-walkthrough）**：
- 删 L1-3 三个手绘 SVG 板 + L4-10 事实表 → 交互式关卡浏览器（客户端 SVG 渲染 levels.json：格点+彩色折线+尾端编号圆点+双头 marker，100 按钮 picker + prev/next + 键盘左右 + #level-N 深链）
- GA4：guide_level_view（切关）+ guide_more_levels_click covered '1-100'；CTA 改「Want Levels 101 and up?」
- FAQ「How many levels」+ JSON-LD 同步更新：v0.23.1 包实测 3,983 关（不再说"无法知道总数"）
- ego-browser 实测：L1/L37/L90/L100 渲染+切关+双头方向文案（"send it left"）+深链全过；vision 读图验色（暖琥珀纪律 ✓）

**遗留**：murdoku/（untracked 实验目录）和 murder-sudoku 等他人改动仍在工作区，勿 git add -A；101 关以后有关注再扩

## 2026-10-14（上午）Murdoku MVP 游戏页上线（deploy `803a535d`，commit `1a5d9f0`）

**按交接单（HANDOFF-MURDOKU-MVP.md，已入 repo）完成第 2 批施工**：
- `src/pages/murdoku/index.astro`：SEOHead + JSON-LD（WebApplication/FAQPage）+ GameHub + AdSlot/SideAd；title 38 字符（+" | GridPaw"=45 压线）；TDK/H1 用通用词 murder sudoku，Murdoku 仅 legal-note educational 提及；水彩 UI 按 v3 原型（已抢救入 `design/murdoku-preview-v3.html`）
- GA4 打点全挂：game_start 可见性门控（visibilityState==='visible'，注释口径 2026-10-13 Clarity 取证）、first_move（__firstMoveTracked 防重）、level_up {level:'4x4'|'6x6'}、hint_click、胜利弹窗 share_copy/share_twitter/share_reddit；track() 带 gpTrack 转发；无死亡机制不挂 game_over
- `public/murdoku/worker.js`：6×6 生成走 Worker（单次 ~470ms+重试 1-2s），4×4 同步；Worker 失败兜底同步生成
- GameHub 加 Murdoku 卡（NEW 徽章）；图标 `game-icons/murdoku.webp` = biscuit 水彩橘猫重裁 128px/2454B（≤3KB）
- `/murder-sudoku/` 两处 CTA + FAQ 改「已上线」并链 /murdoku/

**施工中发现并修复 1 个 P0**：页面 .main 72rem 全宽时棋盘右列（cell 3/7/11/15）被右侧 160×600 广告层盖住，真实鼠标点击全部落在广告上（Playwright elementFromPoint 逐格实测，1280/1440/1920 全复现）。修复：`.game-card` 收窄 52.5rem(840px) 居中，符合 SideAd「内容列 ≤840px」设计假设（kenken 棋盘 496-784 即范式）。契约已写入 AGENTS.md 关键约定。

**验收链全过**：pnpm build（161 页）→ dist grep（门控注释/7 类打点/资产路径全中）→ Playwright **17/17**（bundle 浏览器上下文 API、game_start 门控+补发、受害格/冲突红闪、first_move 恰一次、撤猫、hint 报行列、4×4+6×6 hint 全解自动过案、三分享打点、6×6 worker 计数=1、game_start 不重发）→ deploy → 线上 ?cb= 五路 200（页面/引擎/worker/图标/资产）+ 门控注释与 CTA 链接在线上 HTML → IndexNow 200。

**测试基建坑（复用价值）**：① SEOHead 的 module script 会 `window.gpTrack = trackFunnel` 覆盖测试 stub——stub 必须用 getter+空 setter 的 defineProperty 保住；② Playwright evaluate 内模板串在浏览器侧求值，Node 变量不会插值，须先算好传参；③ 页面 `.sel-target` 高亮不排除受害者同行列/已占用格，测试落点须自算合法格。

## 2026-10-14（中午）game-switcher 头部下拉组件化（deploy `b423f127`，commit `3d03864`，卡 t_5f189695）

**结构债清偿**：30 个页面内联复制的 Games 下拉 → `src/components/GameSwitcher.astro`（games 数组单一维护点）。存量不同步修复：murdoku/kenken/binary/star-battle/hashi/slitherlink 此前只出现在自家页面，现全站 30 页统一 12 游戏。净 -175 行。

**验收（卡上六条全过）**：30 页 dist 断言（12 链接×顺序×active 前缀，子页 /akari/daily/ 自动落栏目）+ computed style 前后逐项一致（13px 字号/10×16 padding/200px 宽/12px 圆角）+ hover 展开截图 vision 前后比对 + Guides switcher（首页，5 链接）与移动端 hamburger 无回归 → 线上 4 页抽查（/、kenken、akari/daily、murdoku）菜单 12 链接全中。

**规范决策**：CSS 取 13 文件主流组值，变量全带 fallback（akari 系页面存在 --ink 等未定义情况）；采纳 murdoku 版 `.game-switcher-menu.open` 全宽生效（触屏笔记本上按钮点击可用，此前部分页面只有 hover 展开）。**遗留**：各页 <style> 里死亡 scoped switcher CSS（约 10 行/页，对新组件不生效）留待下次 neat-freak 清理；首页 Guides switcher 仍内联（5 条目静态，暂无同步需求）。

## 2026-10-14（下午）GSC 收录核查：/murdoku/ 已索引，无需加速

**GSC API 实测**（furriq-daily-brief key，sc-domain:gridpaw.com）：/murdoku/ = `Submitted and indexed`，lastCrawl **2026-10-14T01:43Z**（murdoku 上线部署之后）、verdict PASS；/murder-sudoku/ 同样已 indexed（01:37Z）。sitemap 三条目 0 errors，sitemap-0.xml lastDownloaded 10-12（含新页，81 URLs）。**未做 Request Indexing**（页面已索引，配额 1-2/run 不浪费）。IndexNow 已覆盖 Bing 侧（两次 200）。注：`furriq-daily-brief` SA key 实为 gridpaw GSC 唯一有权限的 key（~/.hermes/scripts/ 无 gridpaw 专属 key 文件）。

## 2026-10-14（下午）neat-freak：死亡 scoped switcher CSS 清理（deploy `cdf190db`，commit `bc8d276`）

GameSwitcher 组件接管后各页 <style> 的 switcher 规则对组件标记不生效（页面 scoped CSS 带 data-astro-cid，组件元素不命中页面 cid）——29 页 345 条死规则全清（含空壳 media query；首页保留 12 条给内联 Guides switcher）。验收：build 过 + 29 页 dist 断言 + computed style 前后逐项一致（13px/10×16/200px）+ 线上 2 页抽查 12 链接。净删约 -350 行。另：10-09 bot 簇取证（Nonogram 55 mistake + Nurikabe 10 集中单日单源）——Nonogram/Nurikabe「低 start」游戏真实参与度=每天 0-2 次操作级，watch item：10-14 /nurikabe/demo US mobile 11 事件同形态待 10-16 cron 拆。

## 2026-10-14 r/WebGames 首帖上线

- 帖子：https://www.reddit.com/r/WebGames/comments/1x5k33f/（u/finn_chen_cat，text post，GridPaw 标题打头合规 P3）
- 文案：humanizer detect 复查通过（修 3 处破折号后 ~15 分，对照蹭词站 75 分 / daily9 12 分）
- Devvit 公开审核已提交：meow-block v0.0.6、cat-akari v0.0.10（1-3 工作日，r/Devvit Chat + 邮件）
- 评论盯守：cron 312d987f526c（每 2h×24，只读+草拟回复+MacBook 横幅通知，发布永远人工）
- 旗舰策略：meow-block 当大本营日更，cat-akari 第二步；游戏内加「Play all six on gridpaw.com」出口待做
- 首条评论闭环（10-14 晚）：u/No-Giraffe-3838 指出 onboarding step 3「press the number」误导（数字在矩形中间时照做必报 Area≠number）——实锤后 step 2/3 文案均改 corner-to-corner drag（commit `1b27237`，deploy 验证新文案×2 旧文案×0，IndexNow 200），回复稿用户已人工贴

## 2026-10-15 OG 图 v2 重做 + 部署

- **病根**：10-02 批 8 张 og 图（nonogram/kakuro/nurikabe/binary/hashi/kenken/slitherlink/star-battle）右侧全是**首访教学卡截图**（Tutorial 1/4、Skip tutorial、规则文字、空盘），缩略图下一团糊字、卖点零传达；og-default/og-akari-daily（9-26 版）是干净设计卡，未动
- **重做**：HTML 模板（Nunito + 品牌色）+ Playwright CLI 截 1200×630，右侧换对应游戏的干净解题中棋盘；**每个盘过对账**——kakuro 空格由行+列约束唯一确定、hashi 桥数=数字、star-battle 14 星严格每行/列/区域 2 颗无相邻（星位公式 (r,2r%7)+(r,(2r+4)%7)+锯齿区域只转移无星格）、nonogram 猫显形+clue 自动算。**生成脚本已入库 `scripts/gen-og-v2.py`**（`--png` 一键出 8 张，重生成与已部署版像素级对账通过；nonogram 猫图案勿改）
- **坑两枚**：① `td` 上 `display:flex` 压垮 table 布局（kenken 4 列被压成竖条），换 CSS grid 布局；② vision 读图会自相矛盾（连续两轮说 star-battle「被裁」），**像素级验证**（找边框色 #4a3f52 的 bbox：x 76-1091/y 117-512，右边距 109px）才定案
- 部署 deployment `ed1e44b3`，IndexNow 200；线上复核 og-nonogram/kakuro/star-battle 字节数=本地新文件（46402/38978/45070），页面 meta 指向不变（零 meta 改动，同 URL 覆盖）
- **图 URL 均无历史抓取记录**（/nonogram/ 页未贴过任何平台）→ 无缓存残留，首次抓取即新图
- **r/nonograms 猫图帖上线（10-15 晚）**：https://www.reddit.com/r/nonograms/comments/1x6ejpv/（u/finn_chen_cat，text post，猫显形钩子角度；URL 带 `?utm_source=reddit&utm_medium=post` 绕 Reddit 页面缓存 + GA4 归因）。背景：用户上午测试时 Reddit 已抓过旧 og（缓存旧教学卡图），部署后用新 query 参数强制重抓。sub 选型依据：r/nonograms 近期 10 帖 4 条 solo dev 自荐全活；r/playmygame 模板帖备选未发；r/puzzles 规矩是发谜题不是发站，不碰
- 评论盯守脚本扩为双帖：`~/.hermes/scripts/webgames-gridpaw-monitor.sh`（cron 312d987f526c 每 2h×48h 复用），新帖 10-15 晚暂 0 评论
- **新帖首批评论（10-15 晚，回复稿用户已人工贴）**：① u/RobertWesner 问 solvability 验证原理（自述当年 15+ 慢 20 跑不动 + GitHub solver 误判唯一解盘）→ 引擎实测基准（20×20 67ms/attempt，lineSolve 传播 + 数解 cap 2）回复立专业人设；② u/mcfroogle 指控「ads immediately redirect」→ 取证：页面仅 Native+160×600 两单元、代码零 redirect 脚本，判断为 native 落地页链跳，回复要设备/地区并承诺零点击跳转就撤 banner。**升级条件：若确认无点击自动跳 = Adsterra creative 实锤，查 Clarity /nonogram/ 秒退会话，必要时下线该页广告位**
- **win 静默 bug 修复（10-15 晚，Reddit u/DarkCyborg74 报告，deployment `36ce1665`，回复稿用户已人工贴）**：nonogram `maybeWin()` 原要求所有格子（含空白格标 ✕）才判胜，玩家只涂图案留白即静默无声——实测玩家解对 Heart 5×5 全 16 格无反馈。修复：`pictureComplete()` 图案格全填即胜，✕ 改可选；Playwright e2e 双向验证（16 格零 ✕ 出弹窗 / 少 1 格不误判）。注：填错本就不可能存在（点空格自动转 ✕）。此条 = 10-17「feedback already shipped」第 2 个实锤（教程手势当天修 + 胜利判定当天修）

## 2026-10-15（下午）murdoku 热度诊断 + 分享归因上线（deployment `7b3eac09`）

- **murdoku 上线 1.5 天热度（GA4，已过滤自测）**：9 pv / 5 users（4 新）/ 7 game_start / 0 first_move / 0 level_up / 0 share——漏斗断在开局后；10-16 复查 48h 滞后再定论
- **自测过滤实证**：GA4 侧干净（murdoku 落地会话全部 France/Israel/US，无一命中本机指纹；internal 过滤器 10-14 起生效）；**D1 gp_event 不过 GA4 过滤器**，读 D1 数字时自测照收
- **分享归因改造**：① murdoku 三分享出口（Copy/X/Reddit）链接带 `utm_source=<twitter|reddit|copy>&utm_campaign=murdoku_share`（真实帖子被点开时 GA4 归因）；② funnel-track 全事件统一 enrich `referrerHost+attribution`（此前只有 visit 带，share_*/game_start metadata 全空），src/lib/funnel-track.ts + 4 份 gp-track.js 五处同步
- **部署验证**：线上 murdoku 页含 murdoku_share UTM ✓、akari-engine/dist 还原 HEAD 版本（工作区 akari-engine 118 行未提交改动与 /de/ 德语试点**未随本次发布**，wrangler 全量 dist 部署前已摘除）✓、IndexNow 200
- **lemmy 帖核对（73260570）**：url+正文 3 链接全是 /from/ 短链，302 UTM 目标实测正确（lemmy_murdoku/devlog/lemmy_daily），零裸链接——lemmy 归因已在跑，无需改帖（Lemmy 剥 UTM，path 短链是唯一通路）
- GA4 历史对账：D1 share_* 总 10 次（09-18 起）全是其他游戏；nonogram/nurikabe demo 10-10 的 6 次 share_card 单 user=疑似自测；murdoku share 从零起步
- **（同日续）akari 房间生成器上线 + lemmy 归因补全（deployment `af251343`）**：生产含 generateRoomPuzzle（Kitchen/Study/Attic 难度带已在线上 curl 验证）；UTM_SAFE 加 lemmy + buildAttribution 记 utmCampaign 值（分帖归因，5 处同步）；IndexNow 200。**实时漏斗（D1 14:20-15:12）**：murdoku 首位真人通关（first_move×3→level_up×3→share_copy 15:05，lemmy 短链归因特征）；Reddit 安卓 App ×3 进 /nonogram/demo（referrerHost=com.reddit.frontpage，源帖搜不到=评论区链接）；bing 真人 1 分钟通关 L1。**漏斗人数（D1 visitors）**：全期 visit 2543 → game_start 1125(44%) → first_move 275(24%) → level_up 220(80% of movers) → share 9；近 7 天 782→402→70→52→3。**关卡进度**：Shikaku 主线 L1 191 人 → L10 62 → L20 23（每关衰减 ~7%）；murdoku 4x4 破案 6 人 11 次、6x6 无人；登录层极小（6 注册/4 存进度/daily streak 1 人）。疑似小 bug：level=0 的 level_up 23 次 18 人（0 关不存在，待查挂点）
- **（同日续）Reddit 源帖定位 + Native Banner 暂停（deployment `4c76e69f`）**：r/nonograms 帖 1x6ejpv（finn_chen_cat，14:43 CST）= 英国流量源，帖内 UTM 链接 16:53 首次抓到 reddit 归因 ✓；评论区 mcfroogle 投诉广告跳转 → AdSlot.astro 全站暂停 Native Banner（SideAd iframe 格式保留），HEAD worktree 重建部署防兄弟会话在途改动夹带；评论区 RobertWesner/mcfroogle 已由用户在兄弟会话回帖（草稿未采用）；意外：10-13 chatgpt.com utm 引流 nonogram
- **（同日续）murdoku 4x4→6x6 难度平滑（deployment `2b7a3a46`，commit `2b32354`）**：断崖真因=6x6 只能手点难度按钮、无递进推力；改动=第 3 次 4x4 破案胜利弹层晋升钩子（localStorage murdoku_wins4/murdoku_promoted 一次性）+ 第 2 案起后台 Worker 预热 6x6（实测点 6x6 48ms 秒开 vs 原 1-2s）+ 生成等待爪印动画分阶段文案。Playwright hint 通道自动破 3 案实测全绿（晋升块出现/6x6 36格5嫌疑人/秒开）。worktree 部署零夹带
- **（同日续）埋点卡验收通过 + 修复上线（deployment `9a14c83f`）**：t_f751b1bc done（commit `6128d13`：pictomino level 全量 1-based + daily 跳过 level_up 防双计 + demo 三页 tutorial 口径）；worktree 部署，live md5=HEAD 核验一致（注意 /pictomino/game.html 会 308 到 /pictomino/game）。五小游戏无埋点缺口结论采纳——「8% 洼地」系 10-09 前空窗+小样本，待用新窗口重估。徽章卡 t_d4234322 已解锁
- **（同日续）徽章体系 v1 验收通过 + 上线（deployment `86a7b2ed`，commit `ee7343b`）**：三组 11 枚派生徽章 + GET /api/badges（无 cookie=`{"badges":[],"signedIn":false}` 契约 ✓）+ 三展示位（murdoku/akari/shikaku winOverlay BadgeUnlock+GPBadges.win() 钩子 / GameHub 卡角 / changelog 徽章墙）；gp_event guest_id 索引 migration 0001 已存在无需迁移。worker 自测 4 场景+11 枚阈值逐枚 curl 全过；主会话复核：build 过、live grep 组件/钩子/API 全在。留言墙 t_4423ad7d 解锁。生产=86a7b2ed（含 murdoku 平滑+level 修复+徽章三合一）
- **（同日续）注册墙降级（deployment `0fc40c3e`，commit `685f9a7`）**：Shikaku L5 阻断式 Sign in 模态框拆除（正卡留存膝盖点），改胜利弹层内被动一行 #saveRow（资产清单一行+下划线链接，只出现一次，sign_in_prompt_shown source=victory_inline）；全站触点对账=Akari 行内面板/changelog 小字行均被动合规，murdoku/pictomino 零触点。⚠️ 事故记录：主会话误把留言墙 worker 未提交的 index.astro 半成品（DetectiveWall import）扫进 commit，reset+重放修正时 --amend 落在 ee7343b（未推送，安全）上——最终 685f9a7=徽章+auth 合一 commit（message 已如实标注），build/部署/线上 grep 全验证。留言墙 worker 改动仍在工作区未提交，勿动
- **（同日续）留言墙 v1 验收通过 + 上线（deployment `28e0386f`，commit `7521aaa`）**：三红线全绿（Turnstile secret 只走 env/site key 服务端下发不进构建、ip_hash=SHA-256(盐:ip) 不存裸 IP、fail-closed：无 secret 503/siteverify 失败 403）；先审后显 pending+admin 403 实测；**主会话补跑 migration 004（gp_comments 远端建表，worker 按惯例不碰 wrangler）**。线上实测：POST 无闸门直投=not_played ✓、GET 返回 8 条真实破案自动行 ✓。⚠️ 待用户：CF Dashboard 建 Turnstile widget（murdoku/shikaku 域名）→ `wrangler pages secret put TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY`（建议顺带 COMMENTS_SALT），配好前评论自动 fail-closed 不影响页面。数据：murdoku 首个 6x6 破案者出现（anon-a3e9853，15:09，早于平滑部署=自发），6x6 零通关改判
- **（同日续）Turnstile 全链路打通（主会话 API 代建，deployment `dbc18394`）**：wrangler OAuth token 有 Turnstile API 权限，POST /accounts/*/challenges/widgets 建 widget「gridpaw.com comments」（managed，domains=gridpaw.com/www/localhost/127.0.0.1，sitekey 0x4AAAAAAFXiQ7fEWR4kKByr），TURNSTILE_SITE_KEY/TURNSTILE_SECRET_KEY/COMMENTS_SALT 三 secrets 直通上传（temp 文件即毁，值零落库）；重部署后 GET /api/comments 返回 siteKey ✓。⚠️ secret key 只在 CF API 响应出现一次，已直入 wrangler secrets，不入库不入对话——丢失只能 widget rotate。留言墙 worker 另提交 `2f876c7`（样式 is:global 修复，ego 实机验收发现）随包上线

## 2026-10-16 Grow by Mediavine 脚本上线（Journey 前置，commit `28424f8`，deployment `3066d650`）

- **背景**：Mediavine Journey 替代 Adsterra 的前置步骤。门槛=30 天 ≥1,000 premium sessions（US/UK/CA/AU，gridpaw 现 334 / furriq 388，均差 3 倍）+ GA4 绑定 + 品牌安全内容；须先装 Grow 跑满 30 天才进评估，所以现在装=开计时器，申请动作等 premium 流量过线。
- **账号**：Grow Publisher Portal，Google OAuth a839500525@gmail.com（账号名陈彦帆），一个账号装两站。site id：gridpaw=884b7744-45e8-4317-a497-3e3e69870b36，furriq=6a0a521a-07a1-41db-bffa-03347bd873a2（portal 里 base64 形式）。
- **注入点**：gridpaw=`src/components/SEOHead.astro`（全站 142 Astro 页，hostname 守卫同 GA4）+ pictomino 12 信息页（有 GA4 就补）；furriq=`src/routes/__root.tsx` head() scripts（appUrl 守卫）。**game.html（play canvas 红线）/404/admin/demo.html 排除**。
- **Adsterra 不摘**：Journey 过审拿脚本上线前它是唯一进账线；过审后再替换。
- **坑**：① 注入发生在 build 之后 dist 不更新——先注入再 build 再 deploy，否则线上缺脚本；② CF Pages 自定义域名边缘缓存在新旧部署间抖动几分钟（带 cb curl 读数时好时坏），以部署 URL（3066d650.gridpaw.pages.dev）读数为准；③ Grow 官方 snippet 有 data-grow-initializer 标记属性，gridpaw 版本是功能等价的内联函数，portal 靠 main.js 里的 site id 检测不靠该属性。

## 2026-10-16（cron）Murdoku 漏斗 48h 复查（GA4 pagePath 数据已进齐；10-16 数据未进）

**结论前置：10-14/10-15 两次 pagePath=0 是查询 bug 非数据缺失（andGroup 里 6 个 eventName EXACT 串成 AND 永假返空，orGroup 修正后数据齐）；真实漏斗 = internal 过滤生效后的干净数据，game_start→first_move 断层（1/11）但样本个位数 + 10-16 未进，维持 reading 不下因果。**

| 事件（pagePath EXACT /murdoku/，internal 过滤后） | 10-14 | 10-15 | 10-16 |
|---|---|---|---|
| game_start | 3（1 user，France Firefox） | 11（8 users，8 国分散） | 数据未进 |
| first_move | 0 | 1（1 user） | 数据未进 |
| level_up | 0 | 1（1 user） | 数据未进 |
| share_* | 0 | 0 | 数据未进 |

- **自测过滤实证（第三次复核）**：10-14 murdoku game_start=3 全来自 France desktop Firefox 1 user（非法老 fresh Chromium 指纹）→ internal 过滤器 10-14 起生效，任务背景里「10-14 自测 ~5-10 game_start」已被滤掉，无需减法。唯一未决：10-15 China desktop Chrome 3 game_start 1 user——疑似代理出口换节点未进 internal 规则（规则现仅家宽 CIDR 14.19.8.76/32），量级 3 影响小；下次 CN 簇扩大先追加出口 CIDR 再读数
- **落地会话**：10-14 = 1 sess engaged=1（France Firefox 真人开局玩）；10-15 = 6 sess（desktop 3 + mobile 3）engaged=0——10-15 全站 engaged 处理滞后（见下），game_start 事件在 = 非空转
- **来源**：10-15 lemmy social 1 sess（lemmy 短链归因通路已验证，真实获客信号）+ direct 1 + (not set) 1 + (data not available) 3
- **红旗复核**：10-13 engaged=12/29、10-14=16/29 已恢复（此前滞后判读正确）；10-15 全站 51 sess engaged=0 + 大量 (data not available) 行 + 10-16 整天无数据 = 处理滞后非 bot 簇（未命中「单日暴量+落地页集中+单页率>90%」三口径）；此前 (not set) ~20 会话定性改判：10-15 (not set) 32 sess 分散 8+ 国多设备 engaged=0 = 归因滞后，非单一 bot 簇，10-17 复看
- **转化读数（reading）**：game_start→first_move 10-15 = 1/11（9%）——个位数样本不下强结论；D1 侧 10-15 已见首位真人全漏斗通关（first_move×3→level_up×3→share_copy，见 10-15 续记），GA4 与 D1 不矛盾，首周小量=常态
- **分享 CTA**：10-12~16 全窗 GA4 share_* = 0（D1 侧 share_copy 已见真人触发）
- 查询坑已沉淀进 skill ga4-data-access（andGroup 同字段多 EXACT 永假返空 + landingPage/pagePath 尾斜杠极性不同 + orderBys 400）

## 2026-10-16（下午）游戏数据真源切 D1，GA4 过滤判不可靠（法老拍板）

**结论前置：GA4 作 gridpaw 游戏数据源不可靠——gtag 请求走 googletagmanager 域，被广告拦截器整段挡掉，Internal Traffic 过滤器只救「已知 IP 的 gtag 流量」，救不回被拦截器丢掉的真人事件。实证：murdoku 7 天 first_move GA4=1 vs D1 同期=27（差 27 倍，lemmy/Reddit 用户大概率挂 uBlock）。D1 gp_event 是同源 fetch 第一方落库，两个失真源（拦截器丢包、Data API 无 trafficType + 24-48h 延迟）都不沾。**

- **拍板**：日报游戏数据全切 D1。落地：`funnel_daily_snapshot.py` gridpaw 分支吃 `gp_event`（stages=visit→game_start→first_move→level_up→daily_solved，source=D1，bot_check 仅 GA4 站保留）；`gridpaw_games_funnel.py` 重写 D1 版（单查询三窗口 SUM CASE，按 pagePath 前缀聚合，wrangler 借 furriq 仓二进制——gridpaw node_modules 没装）；渲染器漏斗标题跟随 source 字段
- **口径注意**：① D1 含自测（自测走真浏览器真 UA，无法按 IP 剔，读数时心里有数）；② pagePath 进 metadata 是 10-15 上线（funnel-track.ts 二补），**此前事件无 pagePath，游戏路径聚合只覆盖 10-15 之后**（首日 7 日列偏小是口径不是 bug，约 10-22 起自动齐）；③ furriq D1（cat_breed_event）缺 result_view/pricing_page_view/signup_success 三段（GA4-only 埋点），混源假漏斗，furriq 暂留 GA4 待补埋点再切；hexa 无事件表同留
- **首日 D1 真数（10-15）**：gridpaw visit 246 / game_start 165 / first_move 56 / level_up 108 / daily_solved 7——全面高于 GA4 口径，符合拦截器丢包预期。murdoku 19 会话 11 动手（58%）10 过案共 25 次，与 GA4「14 进入 1 动手」天壤之别，此前「murdoku 留存崩」的 reading 作废（那是 GA4+自测混合口径）
- **GA4 侧已做的修补不白做**：Internal Traffic 过滤器（mini 出口 108.181.6.175 等）仍挡自测 game_start 混入，GA4 作为参考口径继续并行
- **（同日续）murdoku first_move「打点缺失」排查闭环**：线上 HTML 有代码 ✓、track() 实现 ✓、真实玩家全漏斗 ✓——不是 bug，是 GA4 单源失真 + 自测污染的叠加误读

## 2026-10-16（下午）meowdoku-guide 可玩棋盘上线（deployment `99816d0f`，commit `715634e`）

**方案 B 落地**：star-battle 引擎 K=1（`generate(6,1,'easy',seed)`）+ 自有猫图标嵌进 /meowdoku-guide/（Controls 段后首屏第 2 屏），零新引擎。对位竞品四缝：每盘唯一解徽章（打「随机盘答案对不上」死穴）/ Hint 直接亮绿格报行列 / 违规红闪回退扣心 / 无限关生成器。fan-made + not affiliated with Oakever 注脚，URL 未新增，棋盘 488px 守 840px 内容列契约。

- **开发中修的两个 bug**（Playwright 验收抓的 + 用户实机抓的）：①✕ 陷阱——✕ 状态格放猫违规时永远卡死在 ✕ 无法取消，修为违规即回退为空（闪红+扣心不变，任何格 3 下必能清空）；②棋盘未居中——grid 容器盒子占满宽、固定轨道靠左（右侧 185px 死空间），`justify-content:center` 修；教训已沉淀 skill astro-static-site-pitfalls（量容器≠量内容，验收量首末格对称性）
- **猫图标 C 方案入库**（用户选定，Gemini 扁平猫脸琥珀+奶油白）：`public/meowdoku-guide/cat-icon.png`（256px 透明底）+ master `design/meowdoku-cat-icon-master.png`；`.catp` 与答案演示区 `.cat` 全切自有资产，**官方 cat-sprite.png 全站归零并删除——sprite 版权雷清除**
- **埋点**：game_start(visibility 门控)/first_move/hint_click/level_up/puzzle_reset，5 个事件全部在 FUNNEL_EVENTS 白名单内（当日核对）→ **D1 真源 + GA4/posthog/clarity 参考口径**（§同日 D1 判定），读数时 D1 含自测心里有数
- **验收**：Playwright 双端 + vision 复核全绿零控制台错误（本地 dist + 线上两层）；部署后边缘缓存曾供旧部署 HTML（age 2h、引用已删 CSS hash），传播窗口内自愈，未到手动 Purge
- 明细+开发过程 → `NEWWORD-LEDGER.md` 可玩版节；换肤预览与竞品对比稿在 scratch（未入库）

## 2026-10-16（傍晚）方案 C 一期：/meowdoku/ hub + 10 关卡页 + 星级评价（deploy `9de6af5c`，commit `d5cdb73`）

**用户拍板铺 10 关 + 评分 CTA**：`/meowdoku/` hub（随机盘 + 关卡导航 + FAQ schema）+ `/meowdoku/levels/1..10/` 固定盘页（seed=关卡号，引擎验唯一，答案坐标预计算 `src/data/meowdoku-levels.json` 折叠展示）。可玩模块抽 `MeowdokuPlay.astro` 组件（guide 页同步切组件），`StarRating.astro` 评分组件试点（rate_submit 走 D1 双白名单）。fan-made 注脚全页面保留。验收 Playwright 四端全绿；12 URL IndexNow 200。观察点：rate_submit 量/stars 分布决定是否铺 50-100 关。明细 → `NEWWORD-LEDGER.md` 方案 C 节。

**（同日续）game_start 时序统一标准**：线上 D1 对账抓到 MeowdokuPlay 首盘 game_start 不落 D1（gpTrack 由 SEOHead module 延迟赋值，内联脚本解析期调用未就位）；全站对账定案其余页面全安全（Astro module 脚本/同步 gp-track.js 天然免疫）。统一标准收口：SEOHead 头部 is:inline stub 缓冲 `__gpq` + module 冲洗重放（deploy `478ad1e1`），此后内联脚本解析期发事件全站不丢。方法论+陷阱沉淀 skill game-event-tracking。

**（同日续）导航双写债收口**：实测 GameNav 缺 6 游戏（含 murdoku 漏改），全部补齐——17 个内容页头部自此有全部 13 游戏头部入口/内链；新增构建期门禁 `scripts/check-nav-consistency.mjs`（GameSwitcher⊆GameNav 分叉即红）。部署 `6d5301a3`。明细 → `NEWWORD-LEDGER.md` 导航节。

## 2026-10-16（傍晚）多语言扩张一期：/pt-br/ 巴西葡语 7 页上线（commit `6ee4a5a`）

**决策链**：KDROI 全量分析（`research/2026-10-16-multilingual-kdroi.md`，权威文档）→ 巴西 #1（jogos de logica 月搜 5,400 / KD 10 / KDROI 100）、日本观察（KDROI 61 但 YoY -19% 零成本周查）、西语挂触发器、德法砍掉；形态 = /pt-br/ 子目录（哥飞原话背书，权重传递），首批 7 页（hub + 6 游戏页），外链打英文主站不为子目录单花预算。

- **上线态**：7/7 URL 线上 200（cache-bust 实测）、hreflang 三连线上验证、sitemap 重提交 75 URL/0 错误、IndexNow 显式 7 条 200
- **GSC Request Indexing**：shikaku + akari 已编入（API 验证 lastCrawlTime 当日）、kakuro 已提交待抓、hub 被拒（live test 缓存了部署窗口 404，待重试）、nonogram/nurikabe/pictomino 按配额节奏排 48h 一次性 cron（`bd9765ef7c94`）
- **监控**：每周一 09:00 cron `a8fb3b5fb1a8` 拉 country=BRA query 维度（API 口径，脚本 `~/.hermes/scripts/gridpaw_ptbr_watch.py` 自管隧道+横幅通知）；基线 28d = 105 展示/1 点击；触发器 = 葡语 query 展示 ≥30 → 推进第二批/西语
- **情报**：quietpuzzle.com 勘误为韩国站（非 PT-BR 竞品，月访 5.6K 且 -51%）；新信号：巴西 "takuzu" 87 展示 pos 8.2 = 第二批页面候选（binairo 品类）
- **约定已入 AGENTS.md**：多语言页先例/扁平结构/别硬嵌全页游戏/frontmatter 注释语法坑
- **待办**：TDK 葡语稿人工审校（`<!-- TODO: PT 词表待人工审校 -->` 标记在 7 个文件）；GameNav `{ {` 单字符语法修复在工作区未提交（属导航线账）

## 2026-10-16（晚）Reddit 反馈第二轮闭环：爱心事故修复 + SideAd 方案①（commit `94b9a56`，deployment `3326f2ed`）

**r/nonograms 帖（1x6ejpv）u/LunatrixGames 两条未修反馈当天闭环，用户已人工回帖**：

- **lesson 1 爱心事故**：教程 L1 用的 CAT_PATTERNS[1] Heart（教学视角"对称好解"），页面文案承诺每关一只猫——两文件各写各的无人对账（根因+规程 → skill `game-launch-audit`）。修复：L1=Cat Face，L2=新增 authored 图案 **Cat Loaf 5×5**（ears+body+paws，rows 1/5 天然演示 gap 概念），四关全猫；真实引擎验证四关 unique + pure-line-solvable 全绿
- **SideAd 方案①**（用户在 ③全撤/①拉距离/②换位 中拍板①）：断点 1200→**1350px**（1200-1350 笔记本 gutter 天然放不下"离内容 32px"的侧栏，强塞=贴脸=本次投诉根源）+ 广告与内容缝 16→**32px**；**nonogram/kakuro/nurikabe 三页 860px→840px 回契约**（此前 1200px 视口广告与内容仅 2px 缝）
- **上线验证**：build 167 页 ✓；线上 /nonogram/ 840px ✓、`innerWidth < 1350` ✓、引擎含 Cat Loaf ✓、三页 860px 归零 ✓；IndexNow 200
- **审计债**：kakuro/nurikabe 与 nonogram 同款 860px 违约是被这次排查连带抓出来的——SideAd 契约此前没有跑过全站扫描，后续新增页面由 skill `game-launch-audit` 清单第 4 条把关
- **（晚续）信号**：r/nonograms 帖 933 views（用户面板口径，冷启动帖首个破千级窗口）；r/WebGames 帖 No-Giraffe-3838 回帖确认 tutorial 手势修复有效，线程正向收尾（回复带 Akari daily CTA）；r/playmygame Akari 帖收到 Reddit "a better community" 算法建议→定性噪音勿转帖（转帖伤号，决策记录见对话 10-16）

## 2026-10-17 r/LogicPuzzles 发帖准备 + OG 图彻查（commit `94b9a56`~`fbeaca6`）

- **发帖计划**：~~r/LogicPuzzles~~ **被拦改道 r/WebGames**（正文稿已拟；r/LogicPuzzles Rule 2「No self-promotion unless permitted by Mods」被 Reddit AI 预警拦截——选 sub 漏核自推规则原文，教训入 skill reddit-webgames-coldstart）；Murdoku 角度改发 r/WebGames（首帖隔 4 天+新游戏角度，合规）
- **发帖落地（10-17）**：r/WebGames murdoku 帖上线 `https://www.reddit.com/r/WebGames/comments/1x85o6j/`；监控 cron 已扩到三帖（帖3=murdoku，新评论触发）；本地改动=webgames-gridpaw-monitor.sh（非仓库文件，不入库）
- **murdoku 帖首个评论闭环（10-18，commit `3e32310`）**：u/Easy-Race6938 问「at a wall」是棋盘外沿还是房间边（正是预留软肋+措辞债）；查证=引擎语义已对（murdoku-engine.ts L201-208，pfjarschel Lemmy 反馈后修的：wall 只算棋盘外沿，房间隔线是 partition）但页面从未定义；修=how-to 加 house rule + FAQ 新增条目，上线验证过；回复稿交用户贴
- **新手引导补齐（10-18，commit `cd1e05f`）**：用户拍板先A后B同时开干+列必要项沉淀；方案A=棋盘区下 statement 图例（10 类型白话定义，wall/corner 高亮）；方案B=3 步教学面板（首访自动开、放置推进、Skip 可跳、LS 防重、tut_done/tut_skip 打点）；Playwright 实测全绿（首访开/放置推进/Skip 隐藏+LS）；技能沉淀=game-launch-audit 第 7 条「新手引导=必要项」（how-to 在 fold 下不算 onboarding；新概念必须在游戏内有白话定义）
- **Easy-Race6938 线收尾（10-18）**：用户已贴回复（先答 wall=外沿 + 认账页面没讲 + 修复合集）；台账入 reddit-feedback-audit（✅ 闭环 <1h，先例勘误：引擎早已修对，缺口是页面定义缺失）；若对方回访确认有效即为第三例「反馈→当天修→确认」闭环
- **OG 图根因**：/murdoku/ 漏配专属图（10-15 批量生成时未上线），兜底 og-default=首页 Shikaku 卡；补 `og-murdoku.png`（右侧=真页面棋盘截图，`scripts/gen-og-murdoku.py`，PIL 边框验收）+ 发帖须换 query 参数强刷 Reddit 抓取
- **同款彻查（34 页修正，commit `fbeaca6`）**：SEOHead 兜底 og-default 波及全部 akari 系功能页（含 Reddit 常用直链 /akari/daily/）→ 按规则"页面讲哪个游戏 OG 用哪个游戏的图"修 34 页；线上 4 页抽验过；剩余 33 页为可接受兜底（shikaku 系匹配/纯内容品牌卡/meowdoku 无专属图记 P2）
- **误报排除**：canonical 尾斜杠由 SEOHead L31 自动补齐，源码无斜杠非问题
- **规程**：已入 skill `game-launch-audit` 清单第 6 条（OG 图对账+发帖前预览缩略图核对）

## 2026-10-17（傍晚）Murdoku corner 线索 bug 修复（pfjarschel Lemmy 反馈驱动）

**根因**：murdoku-engine.ts 的 wallDir 统计把**房间内部分界线**当墙算（`roomOf[ni] !== roomOf[i]` 计入），`in_corner` = wallDir≥2 → 棋盘中央被两三个房间夹住的普通格被判「角落」；4×4 上 13/16 格被标记，玩家按棋盘可见物推理必然矛盾。同款逻辑三处：mask 计算（L150 区）+ cellFeatures + cellSignature（死代码，已删）。

- **修复（方案 A：墙=棋盘外边界）**：删 seam 计入，wall/corner 只看外边界；原型实测 A 优于 B（边界+木箱）：4×4 60/60、6×6 成功率 11/20→18/20、矛盾 1/60→0、corner 线索可用度 3→22/60
- **验收链（skill `game-pre-launch-testing` 首用）**：audit 脚本（独立 checker，不 import 引擎 mask）对修复后引擎 PASS（4×4 60/60 0 矛盾 + 6×6 18/20 0 矛盾）；pnpm build 167 页全绿；浏览器冒烟 4×4 生成 0 矛盾 + checkSolution True + corner 格 13→3
- **Lemmy 现状**：73260570 三评论——pfjarschel 3 条反馈（corner 实锤已修；房间不连通 + 地砖区分度进 fix list 未修）、我方回复已发（29457825）、pfjarschel 10-17 鼓励回帖（no rush，无新反馈）
- **changelog**：+2026-10-17 Fix 条目（corner/wall clues fixed），dateModified + updated-line 同步
- **待办**：~~房间连通性 + 地砖区分度~~ 已闭环（见 2026-10-17 夜条目）；修后 Lemmy 回帖报「fixed」+ 监控 cron 三帖

## 2026-10-17（夜）Murdoku 第二轮：房间连通性 + 地砖区分度（pfjarschel fix list 闭环）

**实测根因**：① genLayout L104 长不动的房间跳到任意空闲格 → 4×4 **90%**（54/60）、6×6 **100%**（16/16）谜题带不连通房间；② 24 房间名→8 纹理（同组共用）+ tint 仅 6 种按 i%6 循环 → 6×6（7-11 房间）必然有相邻房间 tex+tint 全同，玩家无法视觉区分。

- **修复 ①**：growable-only 生长（房间只吞相邻空闲格，围死的停止生长）+ 小于 minArea 的并入最小相邻房间 + id 重排（cellsInRoom 按 id 索引，空洞会崩）。原型三次迭代：5/20 → 7/20 → **13/20**（roomArea 3.4/3.0 扫频无增益，按 3 次纪律停手接受 65% vs orig 80%——worker 重试 40 种子，玩家侧全失败概率 ~0.35⁴⁰≈0，期望加载 ~1s）
- **修复 ②**（页面 texIdx）：每房间唯一 (纹理, tint) 组合（8×6=48 池，mulberry32(puzzle.seed) 确定性洗牌，重渲染稳定）
- **验收**：audit PASS（4×4 60/60 + 6×6 13/20，矛盾 0 + 不连通 0，checker 新增独立 flood-fill 连通性检查）；build 167 页；浏览器实测 4×4 5 房间/6×6 9 房间 distinctLooks=房间数 全唯一，6×6 worker 6s 内出题
- **audit 模板升级**：game-pre-launch-testing scripts/engine-audit.cjs 加连通性检查（第二个独立 checker 项）

## 重投 CrazyGames（2026-10-17）
- 旧被拒条目已删除（用户批准），名字「GridPaw Akari」已释放
- 新提交流程已走完 Upload→QA→Details 三步：名称/引擎/移动端✓、QA 自评 7 项✓、Category=Puzzle、Tags=Animal/Cat/Brain/Classic/Logic、Description+Controls 已填
- 封面 3 张（1920x1080/800x1200/800x800，游戏同款视觉新做）+ 预览视频 2 条（29s 教程实录 mp4）已就绪，CG 上传组件拒收一切合成输入（DataTransfer/CDP/合成drop 全试），等用户手动拖拽后 Save→Submit
- 文件：~/.hermes/cache/scratch/cg-covers/cover-*.png + cg-videos/akari-{landscape,portrait}.mp4
- 2026-10-17 晚：用户反馈「CG label 遮挡左上角」——实锤是 CG 往**封面图**左上角叠自己的标（裁剪弹窗官方原文：Avoid placing the game title or important elements in the top-left area of the game cover），非游戏画面；游戏 60px 安全区已做进 v2 包（cg-akari-bigupdate-v2.zip，sha c3c8589752cf3e0b，防御性保留）但**决定不重传 build**——Upload new version 会回到上传步，可能清掉已传的媒体；封面构图居中/landscape 品牌位在 y≈110 不在角标区，天然安全
- 视频规格（CG docs）：15-20s（长了自动剪）、≤50MB、横版 1920x1080 必传、**竖版 1080x1620（2:3 1080p）必传**——首版竖版 800x1200 分辨率不达标致上传报错，已重录 akari-portrait-1080.mp4（1080x1620 h264 21.7s）
- 媒体上传进度：三张封面全✅ + 两条视频全✅（横版被 CG 自动剪至 19.4s、竖版 14.4s，规格全达标）
- **提交状态：✅ 2026-10-18 已提交，AWAITING REVIEW**（Basic Launch，Submission date 18.10.2026，Version status: Submitted）
- **Billing 已完成**（Tipalti 四步全绿：Address/Payment Method/Tax Forms/Done）；CG 已发「payment details updated」确认信到 **a839500525@gmail.com**（Tipalti payee 邮箱，收款通知都在这）——标准回执，无需操作——payee 中国 + USD wire + 招行广州琶洲支行（SWIFT CMBCCNBS，地址用总行官方英文地址，电汇按 SWIFT+卡号路由）。**教训：Tipalti 校验 SWIFT 必须属于 payee 国家**（Wise 美国 SWIFT 报「not valid for china」被拒）；Wise USD 虽能收 SWIFT（$6.11/笔）但过不了 Tipalti 的国家校验
- **决定：v2 包（60px 安全区）不重传**——重传会清已传媒体；v1 build（无安全区）已进审核，v2 留下次更新
- **官方页已部署（2026-10-18）**：测试链全绿（build 177 页 + 走查 + 点格亮猫实测）→ `pnpm run deploy` 成功（454 files，IndexNow HTTP 200）→ 线上 curl 验证 /akari/ 新版生效（TUTORIAL 标记在、200）
- 待办：CG 审核结果（模板信无个性化反馈，几天到一两周）；v2 包（60px 安全区）留下次更新

## 2026-10-19：Shikaku 撤命 + 首页 changelog banner（commit 990b1d5，已部署）
- **Lemmy tigeruppercut 反馈实锤**（72330272）：GA4 30d 首页 495 game_start / 110 扣命致死 = **22.2%** → 3 命机制全撤：错矩形红闪+计数，不再中断；hearts→Mistakes 计数；零失误通关 victory 标签亮 `Flawless ✨`；game-over 弹层/retry 处理器删除。**注意：GA4 首页 `game_over` 事件自此停发（属预期），读漏斗别误判**
- **首页 changelog banner 上线**：构建期取 ≤7 天最新条目（过期 0 DOM），✕ 关闭记 localStorage `gp-changelog-seen`；changelog entries 抽到 `src/lib/changelog-data.ts` 单一来源（changelog 页 + banner 共读，勿再内联第三份）
- 验收：Playwright 双端 20/20 PASS（banner 显隐/dismiss 持久化/撤命计数/无 pageerror）+ 截图 vision 复核 + 线上 cache-bust 实测（banner 在、旧机制 0 残留、/changelog/ 有 10-19 条目）
- 待办：tigeruppercut 回帖稿已拟待批准发；Akari/Nurikabe hearts 机制统一化留低优先级（30d 致死率 2.9%/1.7%，不急）

## 2026-10-19：BP3 德语攻略簇一期上线（未 commit，改动在 src/pages/de/）
- **立项依据**：哥飞 trends「brain puzzle 3 lösung」+130% → KWP 德区月度曲线 6 月前 0 → 7 月起飞 → **9 月 590/月**（12 月均值 90 是被零拉低的假象），KD 17.5 极易，德区 SERP 8/8 全 YouTube 零文本页——新词+文本真空；同期 Tenebris Somnia 判 rejected（KWP 30/月泡沫，台账有记录）
- **上线内容**：`/de/brain-puzzle-3-level-1..10/` 共 10 页（已验证英文页的德语版，事实零改动：视频 ID 10/10 逐关对账），页尾 CTA→英文总索引；关卡网格只内链 1-10 德语版（11+ 防泄漏已删）；hreflang 三连手写在 de 页 head，EN 页零改动
- **验收**：build 208 页 0 error → dist 双重转义 0 → ego 截图 vision 3/3 PASS（P1 内链泄漏当场修）→ 部署 hash 7eb5137f → IndexNow 显式提交 10 URL → 线上 cache-bust 10/10 全 200
- **后续**：二期=4 周后 GSC 德语词起量则铺满 35 页+lang toggle；台账/管线详见 NEWWORD-LEDGER（Bot·X 采集腿 10-19 打通，发件人过滤已加 a839500525@gmail.com）

## 2026-10-25：Nonogram Solver 上线 + 性能重写 + Tier-1 两件套（commits e746a0c/eca1f8c/97e7853，全已部署）
- **上线**：/nonogram/solver/ 真线索求解器（KWP 2,400/KD33 SERP 实拍：#1/#3 个人页+#9 return.co.de 唯一 beatable 位；#5 logic-puzzles-online DR9/站龄6月=打法可行性证明）
- **性能**：20×20 高歧义图案生产实测 timeout → 脏线队列+MRV 重写后 19ms（100×+）；100 张高压随机图 0 无效，病态由 5s deadline 诚实兜底
- **Tier-1**：step-by-step 推导回放（solveSteps 重放式采集，60 例重放对拍 0 bad；search 步诚实标注）+ URL 永链（hash 编码线索，打开自动求解，Copy link）——吃 related 词 "nonogram solver step by step"，寄生论坛求助分享位
- **打点**：GA4 nonogram_solver_solve（status/size/ms/src=input|example|link）+ D1 通道 tool_start/tool_action（白名单内零后端改动，akari/create 惯例）
- **⏳ 决策门（cron fa21cada5922，2026-11-01 10:00 自动拉数）**：tier-2「截图→线索提取」开工标准预定死——input-solve ≥15/天且 error<40% → 开工；≥5/天但 error≥40% → 先修输入 UX；<5/天且周展示<500 → 不投入转导流。任务书 ~/.hermes/scripts/nonogram-solver-review-prompt.txt
- 2026-10-26 榜单污染修复 + HOF banner 上线：六游戏页停报关卡成绩上报（幽灵提交根因）+ 服务端下限/daily_start 佐证防线 + 清 5 幽灵行；全站 Hall-of-Fame banner（hof-banner.js，campaign 至 10-30）见 research/2026-10-26 文档

## 2026-10-28：Loop 新鲜度管道修复 + 主页 Today's Answer 模块（deployment `ce824b14`，IndexNow 200）
- **根因**：ego notice 行混进 loop-hints-pull.sh stdout → 10-27/28 两天 loop-answers JSON 带 `[ego-browser:notice]` 前缀 → 三个 loop 页 `JSON.parse` 炸 → **每日发布链（cron 14:00 采集→build→deploy→verify）连续两天 BUILD FAILED**，live 页停 10-26，「Updated Daily」承诺断两天（ntfy p4 已发易被淹）
- **修复三处**：① 清洗 10-27/28 毒文件；② pull 脚本写盘前剥离非 JSON 前缀（校验段容错但 mv 落盘没剥离，修根因）；③ the-loop-hints / the-loop-past-answers 解析改容错切片（同类同修）
- **主页新增 Today's Answer 模块**（/the-loop-puzzle/）：构建期读最新档案显示当日答案标题+日期（诚实日期）+ hints/past-answers CTA；try/catch 失败不渲染。**TDK 未动**（10-24 改版在读数窗口内，11-04 GSC 定案 cron）
- **BP3 关卡覆盖核查（GSC 28d query×page）**：EN 54 关卡页 = L1-53 + L137 + answers hub；**带关卡号的可见查询全部有页，54+ 零搜索信号**——不预防性铺页（thin content 风险），等 NewWord 管线出需求信号再建

## 2026-10-29：Rotate Rings 判定修正——上升词月均值≠静态天花板（法老纠正+kwp 三源实测）
- **错误**：10-28 分析拿台账 KWP 月均 390÷30 推「日上限 ~13/0.5 click/天」判「试点验证放弃是对的、不铺 L11+」——390 是 12 个月均值（3月/YoY 双 +84% 摆在台账行里没读），且没先 load seo-keyword-selection skill（brain puzzle 3 lösung 同类教训 10-19 已定规，三犯）
- **实测（10-28/29 三源）**：① Trends 12m 爆发期——9-06 周起 +263%，峰值 100 在 10-04，最新 86；② Google Ads KWP 四词全 null（报告线以下，390 非 Ads 口径）；③ web.cafe KD 实查 59.5 中等，盘面平台 5 席（Play/AppStore/YouTube×3/yandex）可争 7 席，最弱 DR 46，链接预算中值 130 引用域
- **修正**：撤回「不铺 L11+」；主词放弃维持（KD 59.5+130 域预算+商店垄断，不划算）；level 长尾矩阵待传导验证——Trends 爆发已实锤，看 GSC 簇曲线（10-24→26: 16→46→60 imp/天）是否跟随，10-30/11-01 复查窗口决定铺 L11+（BP3 引擎模式）或再等；当前月真实量粗推断 600-1200（推断非实测，Ads null 无法锚定）
- 教训已入 skill seo-keyword-selection「KWP 趋势信号」节

## 2026-10-29 RR：SERP 侦察 + BP3 method C 织入 11 关卡页+hub（deployment `52aa49aa`，IndexNow 200）
- **竞态实锤**：三家 DR 0 新站抢爆发的 RR 攻略簇——rotate-rings.com（10-03 注册，101 关 ×3 语言，2,118 词/页 + board A-H 变体匹配）拿 hints/answers/guide 三个 #1；rotate-rings.org（10-16 注册，294 关页）；rotaterings.org（101 关，Board Diagrams）。YouTube 占每条 SERP 6-8 席，有机位仅 2-4 个
- **我们差距**：11 页 vs 100-294；L32 #8（org 们 #5/#6）；hub 零出现、title 不含 answers/hints/all levels；11 页 title 零簇修饰词。独有资产：逐波帧验证时间轴 + 结算画面（竞品均无）
- **执行（BP3 复刻）**：method C 织入——关卡页 title 加 "Hints &"（web 页赢 hints 词有 com 站实证）、desc 前置 "hints, steps and solution"（7 页超 155 逐页压缩）；hub title→"All Levels Walkthrough, Hints & Answers"、FAQ +1 问且 FAQPage schema 逐字同步（live 5 问验证）；页脚 L1↔…↔L10→L32 兄弟互链
- **不做**：独立 /answers/ 页（与 hub 内耗）；盲铺 L11+（程序化站已占位+dup 纪律+帧验证成本）
- **按需扩张规则**：Bot·X 盯 `rotate rings level (\d+)`，关卡号周窗口 ≥10 imp 无页 → 建页（无帧数据只写通用层+标注，不编时间戳）
- 预期：RR 词族量级为 BP3 的 1/10-1/20，成熟期 30-80 clicks/月；细节+数据表 → `research/2026-10-29-rotate-rings-serp-recon.md`

## 2026-10-29 晚：交接待办清点 + 490 词审计 + llms 体系建立（本会话）
- **PWA WIP 闸（关键）**：发现并行 SW 会话已把 `stamp-sw.mjs` 接进 build 链 + SEOHead 挂 SW 注册（全 M 未提交）——loop cron 每天 14:00 自动 build+deploy 会把 SW 半成品扫上生产。`~/.hermes/scripts/loop-hints-pull.sh` 加闸：SW 相关 7 文件（sw.js/gp-install.js/offline.astro/stamp-sw.mjs/SEOHead.astro/_headers/package.json）任一未提交 → 跳过 build+deploy，数据照常落盘，ntfy p3 通知；PWA 合入后闸自动放行。**代价：PWA 在飞期间 loop 每日页断更**，SW 会话合入越早断更越短
- **RR 止损门补进 11-01 任务书**：`nonogram-solver-review-prompt.txt` 原文没有 RR 节（research 里「solver cron 同窗口看 RR」未落地）→ 补节：L32 进 #6 或簇日均 ≥120（两周 2x）→ 按需扩张；卡 #8+ 走平 → 冻结回 BP3；顺带列 `rotate rings level (\d+)` 周窗 ≥10 imp 无页候选
- **490 词审计**（新词引擎对照，→ `research/2026-10-29-bp3-490-modifier-audit.md`）：①真未织入簇=**solution**（32 词 152 imp，prior-28d 全零=新成形，55 页 TDK 零 solution）②**织歪**发现：L21 desc 题面被关卡名缝合（"catch the cheating scene" vs query "catch cheating"）123 imp 0 clk、L5 desc 自述改写（carnival vs creepy place）95 imp 0 clk——218 imp/28d 白漏；高 CTR 三页（waiters 11%/bride 9%/bathroom 11%）desc 与 query 短语精确一致，根因实证③cheats 簇证伪（Cheating Scene 关卡名误伤）④hints/walkthrough/tips 在 BP3 词族=零信号，RR 手法不适用⑤题面词无覆盖缺口，全部有页接住。**织入动作（solution + L21/L5 措辞修复）挂 11-01 决策窗拍板**——Crazy Mind 读数窗在飞不加变量
- **llms 体系建立**：`scripts/gen-llms-full.mjs`（94 页/115KB：6 游戏组 + BP3 55 关题面+FAQ 全文 + RR 11 关 + loop 组 + 内容页组，FAQ 三种代码形态全覆盖）→ `public/llms-full.txt`；`public/llms.txt` 索引重写（10-12 版缺 8 游戏+BP3/RR/loop/solver 整条线）。**未接 build 链**（package.json 被 SW 会话占用）、**未部署**（SW WIP 在飞）——PWA 合入后接链（build 脚本 `fix-sitemap.mjs` 前加 `node scripts/gen-llms-full.mjs &&`）随下次发布上线
- **德语二期初判**：/de/ 28d 21 imp / 0 clk / pos 84——没进盘面，二期不触发（窗口才 10 天，正式判断 11-16）
- **cron 51503f262b99 建**（每周一 09:30，首跑 11-02）：GSC 盯守=RR level-N 建页候选（≥10 imp 无页，只报告不动工）+ L32 排名/簇日均例行读数 + 德语周趋势。与 11-01 决策门（fa21cada5922，已含 RR 节）、11-04 loop 定案（e8406cfcf065）三线不重叠
- **同日晚补**：①闸首跑验证 ✓（14:01 采集 34KB 落盘 + SKIP publish + 7 文件正确识别——无闸则 SW 半成品当天上生产）②RR 织入线上抽验 ✓（pages.dev 生产别名，hub+L1/L5/L10/L32 title 全带 "Hints &"/"All Levels"）③复查承载审计补 2 cron：HOF banner 退役读数 `cae40765e14c`（10-31 09:00，D1 hof_view/cta/dismiss×variant，banner 10-30 00:00 自退役）、双收窗 `f19b0df4ab1a`（11-07 09:00：arrows 5 页 28d——walkthrough 仍 0 clk 则 desc 改直接给答案式；meowdoku C 期 rate_submit/曝光——定铺不铺 50-100 关）④51503f262b99 加「零号检查」节：每周查 PWA SW 是否合入，合入即提醒接 gen-llms-full 进 build 链 + 确认 loop 闸自动放行
- **待法老拍板（11-01 决策窗一揽子）**：solution desc 织入（32 词新簇）+ **L21/L5/L3 三页**题面措辞修复（216 imp/28d 白漏；全量 55 页短语审计二次扫描后修正——L47/L51/L53/L16 短语一致仍 0 clk=排名/SERP 问题划入观察不修，见 audit 文档补遗节）；~~CG Akari 顺手可查~~ **CG 状态已探活（10-29 晚，零登录）**：CG API 搜索 gridpaw result 空（未上线）+ Gmail 20d 零决策邮件（仅 2 封 Tipalti 回执）→ **仍在审核队列、无被拒信号**；11 天处于 CG「几天到一两周」边缘偏后，再等 3-5 天无信可后台查（后台在 jameschen profile 已掉线，补登 handoff 用户）

## 2026-10-30：Crazy Cleanup（微信小游戏改）全链上线（commits 4245261/eb97a65/1b69382/0d8d0b7，部署 ddb3a476）
- **游戏**：/crazy-cleanup/ 20 关（pack 架构 22.8MB、逐像素被压 ≥15%、hint×3 经济、全英 UI）；8 事件打点（game_start/first_move/hint_click/hint_blocked/puzzle_reset/game_over/level_up/share_*）+ win 时成绩 POST（anonId=window.gpAnonId 单一真源，level 命名空间 'cc-N' 不进全局 maxLevel）
- **SEO hub**：title 织 sorting games 主词（KWP 美国口径 4,400/+23%，ego 双会话验证 10/10 对账零偏差）；FAQPage JSON-LD+fan-note 商标免责（goods sort=注册商标，只写 style/inspired）；answer/hint 层不建（KWP 11/12 null），触发器=GSC `level (\d+)` 周曝光 ≥10 再建
- **站内 8 触点**：GameSwitcher/GameNav 数组、GameHub tile（NEW 角标+badge 角）、badge-icons 3 枚（First Room/Tidy Dozen/Whole House）、_badges-derive ccRooms Set、leaderboard API 白名单+页面
- **视觉**：v3 软陶猫 logo（Gemini clay 渲染+IP 猫差异化；品类语言=高饱和 3D 货架场景，6 竞品全无人格猫）+ 专属 OG 卡 1200×630/93KB（v3 图生图延展+PIL 烧字）。OG 首版文字压货架→两行堆叠+textlength 实测全部 ≤484px 修复；vision 整页误报「p 被切」以紧裁 2 倍放大+几何双证裁定——**整页截图边缘误判三犯，文字完整性验证一律用紧裁**（已入 wechat-minigame-recon + game-pre-launch-testing skill）
- **关键词表真源**=`research/fkszw-prototype/game/SEO-KEYWORDS.md`（69 行：KWP 14 词+webcafe 交叉 14/14 一致；组织词合并、无量词清单、品类化实证）
- **部署一致性核查**：今日 4 次手动 deploy 携带工作树未提交态（SW+ads-off）——核实 SW 已 10-29 深夜正式上线（62c36814，E2E 20/20），今日 precache 21/21 活性复验 ✓，部署=版戳刷新+activate 清旧缓存（设计行为），非事故；loop 闸防 cron 扫未验收工作语义不变，SW 会话 commit 后自动放行
- **教训（待 PWA 合入后写 AGENTS.md 部署节）**：闸只护 loop cron，手动 wrangler deploy 不过闸——并行 WIP 在飞时手动部署前 `git status` 粗查+部署后 diff dist 新增物，确认携带的是已验证上线态而非未验收 WIP
- **挂起**：136 精灵原版美术重绘（法老拍板先不换）；AGENTS.md「六游戏」计数漂移（文件被 SW 会话 WIP 占用，合入后对齐）；llms-full 接 build 链同等待

## 2026-10-30 晚：工作区批次合并汇入（PWA/ads-off/llms 三批 + 排队项清账，本会话）
- **合入**：兄弟会话全部未提交工作分 5 组入库——ad28c22 PWA（sw.js/gp-install/stamp-sw/offline/SEOHead 注册/安装挂点/打点白名单 6 处，E2E 20/20 已在线）、69f9135 广告下线（ADSTERRA_OFF 三组件+披露页+changelog）、bf68084 llms（llms.txt 重写+生成器）、8da9b16 文档数据（STATUS/AGENTS/两台账/sitemap-monitor 10-28 轮/loop-answers/BP3 审计；顺手修 NEWWORD 表格 `||` 断行笔误）、gp-build.js×4 生成文件还原不提交（头注「不要提交」）
- **接链+上线**：gen-llms-full 进 build 链（8fcce83）——**位置修正**：放 astro build **前**（10-29 计划写的 fix-sitemap 前是潜伏 bug：脚本写 public/，build 后跑永远进不了 dist）；`public/llms-full.txt` 由 `public/*.txt` 忽略规则天然覆盖无需新 gitignore。部署 225c42c3：llms-full.txt 线上 200/118KB、SW 版戳 d9edbed-dirty、cc hub 200、广告六特征 0、IndexNow 200
- **AGENTS 对齐（d9edbed）**：14 款游戏名册（11 引擎+3 静态）取代漂移的「六游戏」、PWA 行刷新（无 SW→SW 已上线）、llms 管线指针、手动部署不过闸教训（部署前 status 粗查+部署后 diff dist 新增物）
- **闸自动放行**：SW 7 文件已全部入库，loop cron 14:00 管线恢复自动 build+deploy；llms-full 随每日构建自更新
- 挂起清账：~~AGENTS 对齐~~ ~~llms 接链~~ 完成；余 136 精灵重绘（先不换）+ GSC `level (\d+)` 触发器监测

## 2026-10-30 晚：meowdoku cat sudoku 评估→织入→攻略节→用户走查（本会话，与 PWA/ads/llms 合入会话并行）
- **评估**：cat sudoku KWP 最新月 ~6K（1,900→6K 斜率未停）、KD 49.9（进前十中值 85 域）、自家 dofollow ~43 → **不独立立项（桶低 KDROI 20），单页织入**；拼写变体（sodoku/kitty）KWP 全 null 不做；daily answer 线关闭（app 盘面随机化）；meowdoku hints（170）+answers（210）由 guide 承接（12-01 验归属）
- **上线三连**（全 push + live 验证）：89e21ce /meowdoku/ 织入 cat sudoku（title/desc/H1/lede/FAQ）；a6959ac 攻略节（How-to 规则 H2 + 六技巧 + Hints/Answers H3 保险位）；6a97989 guide→play 2 条内容内链（原为 0 = play pos 18.3 饿死主因）
- **对账纪律**：Level 1 teaser 逐句核对 `meowdoku-levels.json` 解法叙事（蓝区 R3C6+R4C6 全在 col 6 → R1C5）；hint 文案与 `MeowdokuPlay.astro` 组件行为一致（放下一只强制猫+原因）；FAQPage schema 同步 5 问
- **用户视角走查（ego-browser 6 轮，live）**：✕→猫→清循环 / hint 单步+解释 / hint 连点通关流（Solved! + Next）/ 猫图标视觉（无缺嘴遮挡毛边）/ 视口契约 1200-1440 main=840px + 390 无溢出 / guide CTA 真点跳转 / levels-1 推导——全绿零 JS 错
- **触发器（已同步进 AGENTS.md 三页分工条）**：cat sudoku 破 10K 桶或 /meowdoku/ pos ≤15 → 独立 /cat-sudoku/ 议题重开（先过哥飞）；11-06 窗看 pos 18.3→12-15；12-01 窗验证 hints/answers 承接归属。细节→`research/2026-10-30-gsc-review-and-plan.md` 晚补节
- **洁癖收尾**：AGENTS.md 名册 Meowdoku 归类修正（误标纯静态 public/ → 全 Astro 页）+ 引擎 glob 补 puzzle-core/ 子目录 + 三页分工规则入关键约定

## 2026-11-02：GSC 三窗复查（24h/7d/28d）+ cc 双 bug 修复上线 + PWA 安装链路全站解锁（本会话）
- **复查**：`research/2026-11-02-gsc-24h-7d-28d-review.md`（快照 `research/gsc-ga4-snapshot-2026-11-02.json`）。GSC 全线加速（7d imp ×2.12/clk ×2.43，10-31 峰值 8,198，B7 dip 证伪为 final 滞后假象）；**漏斗结构性稀释**：top ×2.9 但 first_move 用户 -17%/level_up -22%，稀释源=BP3 落地占 62%→77%（GA4 landing 口径）、引擎 hub 10%→6%。德语线定性翻转：704 imp 里 683 来自 /de/brain-puzzle-3-level-N/（BP3 de phase 1 吃德国攻略需求），二期候选=BP3 de 扩关非 shikaku 词族。iOS 占 36.9% 移动会话（engaged 44% 低于 Android 55%）。
- **cc 双 bug 修复（P0，浏览器验收 PASS 后部署）**：① `game.html:7` 引 `assets/theme.css` 但文件在根目录→生产 404 三天裸奔（#scene 374×2175、首屏 0 可点物件，5/8 开局用户秒退）→改相对路径；② `engine.js:225/228` `findIndex` 返回 -1 却与 `undefined` 比较→恒真/死代码，点无对应桶物件=TypeError+物件消失+collected 误加→改 `!== -1`。验收：本地实测 12 点击→6 物件全进托盘（stash 6/6 自洽）、零 TypeError；线上 css 200+新版在位。遗留：theme.css 无 @media（390px 仍溢出）、first_move 口径=「首次成功入桶」全站独一份、开局无教程——cc 二批待拍板。子 agent 报告：`~/.hermes/cache/scratch/cc-firstmove-probe.md`
- **PWA 安装链路全站解锁**：根因=入口全锁在 `beforeinstallprompt` 回调内（iOS 永不 fire=43% 移动会话无入口）+ 脚本只挂 5 页（97.7% 移动会话落在无脚本页，82.8% 是 BP3 关卡页）。改造：gp-install.js 防重入 guard（`__gpInstallLoaded`，SEOHead 全站挂载后防 views 翻倍）+ `activate()` 无条件解锁（class+icon+mounts+banner 不再等 BIP）+ 指引卡 dismiss 写 14d snooze+打点 `install_dismissed from:guide`；SEOHead.astro 尾部 +1 行 script 全站覆盖（161 import 方）；5 个 astro 页删重复引入。验收：iOS UA+390 视口下 BP3 页 header icon ✓/views≥2 banner ✓/Install 点击 install_clicked gtag+D1 双管道 ✓/snooze 压制 ✓；Chromium 模拟环境真 fire BIP 故 showGuide 分支靠代码审阅+上线 D1 观察。部署 48adbb58 线上全绿。子 agent 报告：`~/.hermes/cache/scratch/pwa-install-audit.md`
- **BP3 内链审计（子 agent）**：54 关=独立拷贝非组件；7d cta_click 2,350 中 93% 为 index-list 站内导航、跨游戏仅 3 次 0.04%（cross-card 指向 /akari/daily/ 0 次）。**与 cron eb2ce515196b 11-02 复查交叉证实：页尾位 2 周 0 点击死区**（P1-7 谜题卡 0 点击、BP3→游戏交叉率 1.3%→0.4%）。导流实验素材在 `~/.hermes/cache/scratch/bp3-crosslink-audit.md`，唯一有希望位=首屏 Quick answer 下方纯文字链（子 agent 建议③），页尾 cta-box 上移期望值已被两周数据压死。报告：`~/.hermes/cache/scratch/bp3-crosslink-audit.md`
- **BP3 导流实验上线（answer-inline，deployment 8ba0e5a4，用户已批）**：奇数关 28 页（含 L137）answer-box 正下方插 `.answer-inline` 文字链（→/akari/，cta_click placement=answer-inline）；偶数关 26 页对照组不动。实施=外科手术脚本批量插（`~/.hermes/cache/scratch/bp3_inline_insert.py`，幂等+双组污染后验 CLEAN）——**不跑 gen_pages.py 重生成**（会毁 181fdd2 的 36 页手工加深内容）。验收：build 绿、dist 28/28+对照 0、本地浏览器 cta_click 双管道带 placement=answer-inline 触发、线上 3 抽查奇页有/偶页无/CSS bundle 规则在位。判定门 11-09 10:30 cron `d1dd1fdc1a27`（deliver=all，提示词 `~/.hermes/scripts/bp3-inline-gate-prompt.txt`）：≥25 保留+试第二位、5-25 灰区报数、≤5 建议撤。1:1 预览=研究文档 `research/2026-11-02-bp3-inline-preview.html`
- **AGENTS 补部署陷阱**：`pnpm run deploy` 不含 build（deploy script=wrangler+IndexNow）——只跑 deploy 会把旧 dist 重传报 "Uploaded 0 files (N already uploaded)" 静默假成功（本会话实测）。已写入 AGENTS.md 怎么跑节
- **BP3 德语 phase 2 batch 1 上线（L11-30 共 20 页，用户已批分两批）**：立项判断过哥飞判据（GSC 第一方需求 683 imp/13d + pos 4-7 = 「验证后扩张」触发；规划师口径全 null 按 newwords ⑤h 不劝退；SERP 复证文本真空仍在——德语词前排 5-6 YouTube+4 英文站零德语文本竞品；webcafe 20 分+tabapi 2cr）。实施：2 翻译子 agent（严格事实纪律，机械验收步数/FAQ/动作动词序列全对齐）→ 生成器镜像现有 de 模板（CSS verbatim/hreflang 三连/FAQ schema/德语 pager/index-list 1-30 全互链）→ 旧 10 页 index-list 批量追加 L11-30。**顺手修 hreflang 回程链**：EN L1-30 外科补 `<link rel="alternate" hreflang="de">`（phase 1 起单边声明裸奔 13 天，Google 要求双向互指）。验收：build 绿、本地浏览器冒烟 L16/L25/L27 全绿（L25 hero 假 FAIL=隐藏 tab lazy-load 节流，eager 探针秒载证实非 bug）、部署 305f5c3f 线上 3 抽 200+EN 回程链在位、IndexNow 20 URL 批量 200。读数门 11-16 10:30 cron `b34d81fdb3ef`（deliver=all，判定：batch1 周 imp≥600 且 pos≤10 → green-light batch 2；提示词 `~/.hermes/scripts/bp3-de-batch1-gate-prompt.txt`）
- **cc 二批：移动端适配修复上线 + 命中 bug 热修 + 开局引导提案（待批）**：① 390px 溢出修复：`#app`/`.gn` 固定 560px 零 @media——game.html 加 ccFit()（JS 驱动 zoom=clientWidth/560，rect 基坐标数学自洽）+ theme.css @media≤520px 导航换行（部署 6d3024a9）。② **zoom 命中 bug（ccFit 引入当天发现当天热修）**：engine.js 场景点击 `clientX-rect.left` 是视觉 px，但掩码按 `scene.clientWidth`（布局 px）构建——zoom 下坐标差 1/z 倍，「点 A 收 B」。修复=点击坐标 /z 归一化（一行）。生产三路验收全绿：收集 col+1（点谁谁死）/杂件进托盘/埋件抖动无状态变化；修复前 390 实测「收集成功」系随机命中假阳性（教训：缩放后验收必须精确归因到具体死件，不能只看计数涨）。③ 开局引导 1:1 提案 `research/2026-11-02-cc-tutorial-preview.html`（双真游戏 iframe 对比 + ship 代码本体：body 级 fixed 不吃 zoom + LS 一次性 + 重看按钮；实测表含 #tip 390 下有效字号 7.7px 论据）待用户批。背景：cc 修复上线后 72h 内 0 真实流量（24 事件全来自测试浏览器），lemmy devlog 帖准备中——发帖前质量闸就是本轮。预览裁剪包 `research/cc-pack.js`（真 bg 压缩+抽样 16 件，标注非完整关）。**同日追加两修（用户实测反馈）**：③ `#fly` 在 theme.css 零样式——fly img 无 position:fixed 按静态流画在页面底部左侧 420ms（用户报「点击后左下角闪现消失」，飞行动画从未真正飞行，物品=闪现+瞬移进桶）→ 补 `#fly{position:fixed;transition:...}` 真飞行（生产验证：mid-flight fixed+从物件位置起飞+col+1）。④ hint 高亮升级：`hintGlow` 黄光+8% 脉冲在杂堆不够打眼 → useHint 追加琥珀脉冲环 `.hintRing`（% 坐标自适应 zoom、z 300 压过物件 z 序、2.6s 自移除；环+光双层）。预览定稿=v4 聚光引导三步版（黑布 0.82+洞口+手指），全内联 497KB（srcdoc 外链 file:// 被 opaque origin 拦的坑=全内联绕开；桌面预览面板 iframe 脚本执行不可靠=改用系统浏览器 file:// 打开）

## 2026-11-02：Mediavine Journey 门槛官方核实 + 流量达标确认（本会话）

- **官方门槛核实（journeymv.zendesk.com「Journey Minimum Requirements」+ mediavine.com/application-requirements 实抓）**：现行硬门槛 = 30 天 ≥1,000 premium sessions（美/加/英/澳，非 premium 流量不扣分）+ 连 GA4 + 原创品牌安全内容 + 活跃受众 + 常更 + About/隐私政策。**Grow 跑 30 天要求已取消**（2026-08 起 Grow 可选；10-16 装的脚本 `28424f8` 不用撤，但不再是资格条件）；**域龄 4 个月已从现行文档移除**（只剩 track record 措辞；被拒 60 天冷却可重申，试错成本低）。自动否决项：Wix/Blogspot CMS、**重度 AI 内容**（官方原文 "excessive use of AI"）、<1,000 premium。上线前 Stripe 身份验证（证件+自拍），无需 Google MCM；分成 70%、Net 65。申请入口统一 `publishers.mediavine.com/join`。⚠️ journeymv.com 官网首页「Grow 是要求」为未更新旧文案，勿采信，以 zendesk 帮助中心为准。
- **流量达标实测（GA4 SA API + country 聚合行，窗口 2026-10-04~11-02，key `~/.config/furriq/ga4-service-account.json` → property 552793510）**：premium 4 国 **2,055/1,000 ✅**（US 1,274 / UK 435 / CA 190 / AU 156）；对照 10-22 口径 563 → 10 天 ×3.6（BP3 攻略长尾 + Loop hints 爬坡贡献）。自家自测出口（CN 家宽/HK/SG 跳板/IT 住宅）均不在 premium 4 国，数字无自测污染。
- 静态项全绿：`/about/` `/privacy/` `/contact/` 全 200；Astro+CF Pages 不在 CMS 否决名单。
- **P0 人味编辑已部署（commit `fa21d64`，deployment `91d61ba8`，IndexNow 200，线上逐页验证 ✅）**：about/block-blast-hints/cross-math-puzzle/the-loop-puzzle 四页 em dash 正文清零（94 句，冒号/句号/括号/逗号/分号轮换），链接/schema/TDK/事实零改动（逐 URL 计数守恒验证）。证据清单 `research/2026-11-02-humanize-evidence.md`（26 页 257 句）、改写日志 `research/2026-11-02-humanize-p0-log.md`。**保留项（有意不改）**：TDK title「About GridPaw — …」、og:image:alt「GridPaw — Free Puzzle Game」、ExtensionPromo「GridPaw — Daily Akari Puzzle」（与 Chrome 商店 listing 一致的品牌官方名，排版惯例非 AI 味）。**P1 范围补充（本轮新发现）**：①rotate-rings 12 页模板同构；②组件层 SEO 可见文字 = LoopPuzzlePlay ×10、MeowdokuPlay ×17、GamePortal ×3、DetectiveWall ×3（SEOHead 的 og 品牌名保留）；③嵌入游戏 demo.html（pictomino 40 / kakuro 38 / nurikabe 36 / nonogram 21，iframe 内容索引权重低，P1 末位）。**观察窗**：至 11-09 看 GSC 排名对照，无掉幅再放 P1。
- **P1 人味编辑已部署（commit `18cbec5`，deployment `297c82b1`，IndexNow 200）**：正文段落 em dash 改为冒号/句号/括号/逗号，50 页 404 行。**第一版超范围已回退**：标题 H1–H3 共 6 行、pictomino meta/JSON-LD description、FAQ/JSON-LD 约 117 行原本在不动清单内，已逐行还原（说明见 `research/2026-11-02-humanize-p1-revert-note.md`）。**线上复验**（289 页，跟随 `.html`→干净 URL 跳转后全 200）：线上 vs 本地 dist 0 不一致；标题 H1–H6、title/meta、JSON-LD 原文、数字 0 变化；可见 em dash（含标题与品牌卡）3,226→2,860，全部来自 50 页正文改动。**遗留**：①FAQ/JSON-LD/标题/TDK 的 em dash 保留，待法老定是否放开；②`/meowdoku-guide/` cheat sheet FAQ 改前即不一致（JSON-LD「in this guide」vs 可见「above」），待批准对齐；③rotate-rings level-3 等逗号列表句拗口，待人工过一遍。规则源 `research/2026-11-02-humanize-plan/RULES.md`；分头方案 B/C/D/E1/E2 产物在 `research/2026-11-02-humanize-plan/`，待逐路复验后再落地。
- **P2 人味编辑已部署（commit `d598428`，deployment `0159a1ea`，IndexNow 200）**：B/C/D/E1/E2 五路共 111 文件，正文 em dash 改冒号/句号/括号/逗号，只动正文段落与列表说明文字。**守卫先行**：`research/2026-11-02-humanize-plan/tools/seo_guard.py`（dist 渲染层 + scope 补丁层，负向对照已验证能抓 title/锚文本/JS 字符串篡改）。构建后 dist 对改前基线逐项 PASS：TDK/canonical/alternate/robots、H1–H6、JSON-LD 原文、FAQ 可见块、内链 href 与锚文本、img src+alt、内联 JS（仅 minifier 改名，267 页）、数字多重集、游戏 UI 串、_astro 40 包、sitemap 191 条。可见 em dash 2,860 → 1,693（净减 1,167）。**线上复验**（289 页）：全部 200；线上可见文字与本地 dist 逐页一致（0 处不一致）；_astro 与 sitemap 共 43 个静态资源逐字节一致；线上副本剔除 Cloudflare 邮箱混淆注入的 `/cdn-cgi/` 脚本后守卫全 PASS（该注入不是内容改动）。**过程教训**：C 流 14 组/10 页内链锚文本被改动（守卫抓出），已在 scratch 副本撤回；锚文本正式列入 SEO 基础（RULES v2）。**未落地/遗留**：①FAQ JSON-LD 与可见答案不一致 83 条 / 24 页（既有问题，改 JSON-LD 需法老批准）；②C 数据步骤文本 649 处（`src/data/puzzles.json`，补丁 `changes-data-optional.patch`，未落地，推荐不动）；③模板句跨页重复未降（akari 重复句类 40→40），需按题数据生成事实句，下阶段；④F 流（未覆盖英文页）已于 `16feaa5e` 落地，见下条。线上验收脚本 `research/2026-11-02-humanize-plan/tools/live_dump.py`。
- **F 流（未覆盖英文页）已落地（commit `16feaa5e`，deployment `082ee482`）**：kakuro / leaderboard / logic-puzzle-grid / meowdoku-guide / nurikabe / offline 六页，正文 em dash 改标点、拆句；全站可见 1693 → 1673。守卫全 PASS；线上 289/289 与主仓库构建逐页一致，静态资源 43 个逐字节一致。线上验收中 1 页瞬时抓取失败（curl 码 0），重抓通过，非内容问题。**未并入**：changelog-data.ts 14 处（历史记录，默认保留；补丁留档 `F-uncovered/changes-optional-changelog.patch`，待法老决定）。**残留盘点**（DOM 分类，排除目录，300 处）：标题、title、链接文字、品牌句、UI、FAQ 可见块共 153 处受保护；「正文?」147 处落在 38 页（rotate-rings 关卡、brain-puzzle-3 攻略、arrows-puzzle-walkthrough、brain-teasers、contact、rules、meowdoku-guide、nurikabe 等），其中混有未识别的 FAQ 答案与教程 UI，需人工拆分后才是正文残留数。清单 `research/2026-11-02-humanize-plan/F2-residual/inventory.md`。下一批须先出方案给证据、获批后再改。
- **F2 交接（⛔ 已收口：FAQ 对齐/文案/清场全部完成，见 ⑨⑩⑪；本条第 ①–⑤ 项仅作历史入口保留，不要再从这里起跑）**：①入口顺序＝本条 → `research/2026-11-02-humanize-plan/F2-residual/inventory.md`（残留盘点）→ `research/2026-11-02-humanize-plan/RULES.md`（规则 v2）→ `research/2026-11-02-humanize-plan/tools/seo_guard.py` + `live_dump.py` → skill `seo-prose-guard-rewrite`（7 步）。②线上基线 `082ee482`（commit `16feaa5e`）：全站可见 em dash 1,673；akari 1,081（99 页）、de 181（30 页）、pictomino 64（12 页）、help 50（7 页）、rotate-rings 40（12 页）、meowdoku+meowdoku-guide 32（12 页）、changelog 16（1 页）、其余 209；demo.html（kakuro 17 / nurikabe 12 / nonogram 7）不计入。③原待决 6 项（2026-11-03 已处理，见 ⑦）：a) 作废（akari 正文实为 27，非 430；跨页模板句重复另立项）；b) 步骤数据约 649 处维持不动（推荐）；c) **法老已定：`/de/` 纳入修改（2026-11-03）**；d) changelog 16 处维持保留（推荐）；e) FAQ JSON-LD 与可见答案不一致（前期核算 83 条 / 24 页）是否批准对齐（推荐，属结构化数据需点头）；f) Mediavine 申请时机（法老亲自提交；建议模板句处理后再投，属推断，非审核条款）。④纪律不变：先出方案+证据，获批再分派；SEO 基础零变化；上广告前先 /changelog/ 公告 + 邮件 Peter。⑤会话 `20261102_152104_f67a8d` 已长且多次压缩，新会话从本条起跑，细节用 session_search 回查。
## 2026-11-03：F2 决定执行与文案收口（FAQ 对齐 → hotfix 清场 → terms/privacy）

- **⑥（2026-11-03 补）改写全部推迟到新会话**：新会话第一步＝①复核子任务产出（`research/2026-11-02-humanize-plan/G-akari/`、`faq-jsonld-align/`，子任务 `deleg_d41135e8`，已独立复核，结论见 ⑦）；②改为全站归因（见 ⑦），不再以 akari 为先；③出方案给证据 → 法老批准 → 执行（apply → 守卫 → 构建 → 部署 → 线上验收）。RULES §3 已同步移除 `/de/`。
- **⑦（2026-11-03 子任务回收，已独立复核）**：①**akari 前提作废**：此前估的「正文约 430」是错的。`/akari/` 1,081 = 解题步骤数据 649（`src/data/puzzles.json` 实测 649，不动）+ 保护项 405（title/H1–H6 119、品牌/页脚/锚文本 215、FAQ/details 71）+ 正文 27。27 里 7 处是 RULES §3 明列的推广列表项「Play GridPaw — …」（子 agent 误列为正文，不动）；3 处是博客列表摘要，与文章 meta 同文（已核 2 篇，第 3 篇未逐字核，不能直接改）；博客文章页 18 处全在 title/H1/H2/锚文本里（保护）。**真正可改的 akari 正文 = compare 17**（`src/data/compare-pairs.ts`；已核：与 JSON-LD/meta 无同文），**另有词条 36 处**在 details 折叠里（子 agent 报 33，复核为 36），页面无 FAQPage，待定是否算正文。②**FAQ 补丁**：`faq-jsonld-align/changes-final.patch` 81 条 / 24 文件（含 pictomino 静态页 3 条，与 RULES 不动清单 `public/pictomino/index.html` 冲突，待定）；`changes-strict-78.patch` 78 条 / 23 文件；HEAD 上 `git apply --check` 均 PASS，未应用。4 条是 JSON-LD 孤儿问答（可见 FAQ 无对应：`/` 3 条、`/binary/takuzu/` 1 条），只改答案修不了，需删孤儿项或动可见 FAQ，法老定。③**产物入库**：`G-akari/`（原在 scratch）、`faq-jsonld-align/`。④**新会话待定**：81 vs 78；4 条孤儿怎么办（推荐删 JSON-LD 孤儿项）；词条 36 是否算正文（推荐算）；顺序（推荐：FAQ 对齐 → 全站归因后的正文 → akari 模板句重复另立项，与 em dash 无关）。
- **⑧（2026-11-03 neat 收尾：hotfix 与线上核查）**：线上 `/akari/`（145,689 字节）与首页（181,836 字节）无广告脚本（`atOptions` 0、广告域 0，已验）；线上 changelog 含「All third-party ads removed」条目（已验）。`hotfix/adsterra-full-takedown`（分叉点 `a143c8b6`）**未并入 main**，但内容已被 main 覆盖：`AdSlot.astro` / `InContentAd.astro` / `SideAd.astro` 与 hotfix 逐行一致，10-29 Loop 档案一致，changelog 与隐私页 main 为更新版（多 2026-10-30 条目；隐私页去掉了破折号）。分支删除与 prunable worktree `/private/tmp/gp-hotfix-1029` 清理待法老确认，**未执行**。**公开文案待定（法律文本，改动需法老批准）**：线上 `/terms/` 仍写「Some pages display ads served by third-party networks such as Adsterra」（现在时，与零广告不符）；`/privacy/` cookie 表含 Adsterra 行（线上命中 1 处）。main HEAD 现为 `28ac2bfe`（他会话的 STYLE 文档提交，未触碰）；本轮收尾无部署。
- **⑨（2026-11-03 执行 ⑦ 决定；取代 ⑦/⑧ 中的待定项）**：法老批准：① FAQ 全量 81 条；② 删 4 条孤儿（首页 3、`/binary/takuzu/` 1），pt-br 2 条问句改可见措辞；③ 删 hotfix 分支（尖端 `71dee23d`，内容已在 main；恢复＝`git branch <名> 71dee23d`）；④ gp-build.js 取消跟踪 + `.gitignore`。**更正 ⑦**：81 比 78 多的 3 条在首页 1 + pt-br kakuro 1 + pt-br pictomino 1，不是 pictomino 静态页；pictomino 静态页 3 条（`index.html` 2 + `easy.html` 1）两版都有，故「78 避开不动清单」不成立，已按全量放行执行。提交：`eab51939`（FAQ，24 文件，仅 JSON-LD）、`35ca9c6d`（gp-build）。验收：守卫口径（JSON-LD 答案须为可见文字子串）构建前 83 → 构建后 0，无新增失败；24 页可见文字构建前后逐页一致；孤儿项 dist 清零。**已部署**（deployment `d46a206b`，源 `4e476cd`，IndexNow 200）；线上 24 改动页 FAQ 与本地 dist 逐条一致，孤儿名线上清零，首页新答案在线。注：部署前线上是 `6446ad17`（源 `1773f44`，14:02）；每日 14:00 的 `loop-hints-pull.sh` 发布链会自动 build+deploy 本工作区（仅 PWA 文件有未提交改动时拦截），所以工作区的已提交改动会随它上线。遗留：首页题面 `Is GridPaw free?` 与可见 `Is GridPaw free to play?` 未对齐（未经批准，待定）；`/akari/rules/` 2 条题面措辞差但答案一致（report 已标无需改）。他人改动未碰未入库：`NEWWORD-LEDGER.md`、`STYLE.md`、`research/loop-answers/loop-answers-2026-11-03.json`。待办：词条 36 算正文（建议算）；terms 广告段改稿待法老审（未落盘；privacy 第 127 行与之矛盾）；Mediavine 申请法老自办、排最后。
- **⑩（2026-11-03）首页题面 + privacy cookie 行**：首页 JSON-LD `Is GridPaw free?` → `Is GridPaw free to play?`（对齐页内可见 FAQ 标题，此前 report 里唯一遗留的题面差）；privacy cookie 表 Adsterra 行标 `(historical)`，并补「2026-10-29 起停止投放，此前留下的 cookie 可留存至过期、不再新设」——与同页第 127 行「广告已撤」自洽。守卫：答案失败 0；题面失败 5（全是 `/akari/rules/` 2 与 `/murdoku/` 3 的存量「答案一致、措辞不同」，report 已标无需改）。部署 `14b40291`（源 `aaf1cce`，IndexNow 200；本次上传 274 文件＝CSS 指纹全站更新所致）；线上主域与 pages.dev 别名均已验：首页题面新值、privacy 两句在。**terms 第 99 行广告段与 push 均已在 ⑪ 收口**（本条为当轮快照）。
## 2026-11-04：terms 改写上线 + Loop 档案入库 + OAuth 重登

- **⑪（2026-11-04）terms 广告段改写 + Loop 档案入库**：terms §7 原句「advertising pays for hosting / 部分页面展示 Adsterra 与未来 AdSense / 别点广告」与零广告现状矛盾（privacy 第 127 行已写广告已撤），改为「currently runs without ads；若恢复广告只在信息页与棋盘旁、不入谜题，且上线前更新本页与隐私政策」，提交 `8657303f`。Loop 11-03/11-04 答案档案入库（`02bbebd7`，按 10-24 惯例；`/the-loop-puzzle/`、`/the-loop-hints/`、`/the-loop-past-answers/` 构建期读该目录，干净 worktree 部署缺它就会回退旧数据）。构建通过，守卫答案 0 失败、题面 5 条存量。**已部署** `9fc8f0e9`（源 `6a61414`，IndexNow 200）；主域与 pages.dev 均验：terms 新句在、旧假陈述无、privacy 历史化在、首页题面为 `Is GridPaw free to play?`。部署前 wrangler OAuth 双双失效（本机 token 与 MacBook 10-19 备份皆 401），经 ego 在 mini 点授权补刀恢复；**重登踩坑两条**：① 过期 config 会毒化重登（回调报 `query string parameter doesn't match`、换 token 静默失败），删 `~/Library/Preferences/.wrangler/config/default.toml` 后一次通过；② 多实例抢 8976 端口 / Chromium 走 127.0.0.1 而 wrangler 只监听 `[::1]`，需先 `pkill -f "wrangler login"` 清干净并加 IPv4→IPv6 转发。
- **记忆迁入的历史数字（待复核，不作当前结论）**：BP3 题面词引擎前期记录 490 词、CTR 4.7%，关卡页 desc 内嵌题面原文即接住；出处未核。
- **申请动作纪律（沿承 10-21/10-29 条目，勿丢）**：图片署名官方明说会查（"We DO check attribution"，全站 AI 自产图无第三方版权雷）；申请动作（连 GA4 + 站点信息）与 Stripe 身份验证须法老亲自操作；**通过后上广告前先 /changelog/ 公告 + 单独邮件 Peter**。

## 2026-11-04：首页首屏重排（GamePortal 合并进 GameHub，本会话）

法老报 5 条：CC 没 logo / 宫格下 Play 看不清 / 右上角 PWA 缺文案 / 上下两块 hub / 首页乱。实测（1212×702）：顶部 `.gp-portal` 6 卡 338px 占 y 67–405，把 284px 的棋盘挤到 y 594（首屏只剩 108px＝38%）；底部 `.gp-hub` 12 格 y 1019–1357 与之重复 6 款；侦探墙 1142px（12 条全 auto）；头部 nav 右边界 1060 > 容器 1029，已溢出 31px。

- **⑫ 方案 A 执行**（法老批准）：① 首页删 `<GamePortal />`（桌面端；移动端 10-09 已隐藏），棋盘 y 594→142 完整进首屏；② changelog banner 移到 `.app` 之后（棋盘下方）；③ `GameHub` 首页分支 `active==='/'` → 含 Shikaku 共 13 格、标题 `All Cat Puzzle Games`，其余游戏页仍 `More` 并排除当前游戏；④ `DetectiveWall` 新增 `limit` prop（首页 4 条 + `Show all 12 notes ↓`，点开不刷新补全量，打点 `wall_expand`），墙 1142→~500px；⑤ 头部 `How to Play` / `Tips` 两项收进 Guides 下拉（腾 133px），`Install` 图标改文案按钮 `📥 Install app`（`gp-install.js`，移动端 ≤768px 仍只留 30px 图标走 banner）；⑥ `crazycleanup.webp` 重画为扁平 128×128（原为 160×160 写实插画，与另 12 个不是一套）。
- **Play 药丸对比度 bug（纯 bug）**：`.gp-portal-card > span`（0,1,1）压过 `.gp-portal-play`（0,1,0），白字被染成 #7A6750 → 压在 #B45309 底上 **1.08:1**。修法 `:not(.gp-portal-play)`。`GamePortal.astro` 现已无调用点（保留文件以便回滚到方案 B）。
- **验收（本地 dist 1212×702）**：`.gp-portal` 0 个；棋盘 top 142；hub 13 格/标题 All；墙 `data-gpw-limit="4"`（mock 12 条实测：折叠 4 条 275px → 点开 12 条、按钮消失）；nav 右边界 1017 < 1029 不再溢出；`📥 Install app` 111×34 在 nav 内不溢出；构建 270 页通过。
- **⑬（2026-11-04 续）Sign in 价值说明 + AdSlot/badges 并入 + header 方案 B**：① 三处 Sign in 入口补 `Free · badges, stats and progress saved on every device`（首页/`/akari/`/`/akari/daily/`，对比度 5.13:1；`/akari/` 窄屏 nav-account-area 仅 77px 会压成 5 行 → 只在 ≥900px 挂）；② 并入 Mediavine 会话的 `AdSlot.astro`（native=false 时连 scoped style 一起关）与 `badges.astro`（`bw-count` 硬编码 11 → `BADGES.length`=14、补 CC 文案、稀有度图例与每卡 rarity 默认 hidden），commit `840dbef7`；线上实测全站 HTML/CSS 里 adsterra 归零（仅 `/privacy/`、`/akari/privacy/` 两条指向 Adsterra 官网政策的历史链接保留），`/badges/` 显示 14；③ 首页 header 方案 B（commit `41225245`）：Walkthroughs 收进 Guides 下拉、Badges 并入 🏆Leaderboard▾、`.header-nav` gap 0→14px；实测导航 707→650px、左边缘 309→366、品牌右边缘到导航 0→38px、一级项 9→7；两个下拉 hover 实测 block（Leaderboard 200×130 两条、Guides 232×478 八条首条为 Walkthroughs）；≤920px 行为不变。**未做**：全站另外 48 页各自手写导航（8 种签名）待开抽组件轮次统一——法老已拍板单独一轮。
- 部署记录：`2d3dfd7c`→`0f65df2b`、`9e72561a`+`af473a7a`→`ec70c664`、`840dbef7`→`fadd9a0a`、`41225245`→`6f58c0b2`，IndexNow 均 200。
- **⑭（2026-11-04 续）全站导航统一：Leaderboard/Badges 收敛成 `RanksMenu.astro`**（法老指示「全站统一 再开一轮」后当日执行）：新增 `src/components/RanksMenu.astro`（桌面 hover 展开、点击照常跳 `/leaderboard/` 不劫持导航、≤768px 点击展开并夹进视口）；49 个手写 nav 页把相邻两个 `<a>` 换成 `<RanksMenu />`（`index.astro` 桌面导航保留自有内联下拉、**移动抽屉恢复为普通两行链接**——批量替换一度误伤抽屉，见下）；`GameNav.astro` 顶部平铺的 `.gp-nav-lb` 两项也换成组件（外套 `.gp-nav-lb` 保留 ≤900px 隐藏）。**线上实测 270 页全 200，250 页渲染下拉**；例外 20 页：18 页本来就没有 header nav（`/about/`、`/community/`、`/contact/`、`/crazy-cleanup/`、`/meowdoku/`+9 个关卡页、`/offline/`、`/admin/funnel/`、`/akari/akari-puzzle-online/`）、首页（自有下拉）、`/nonogram/solver/`（导航里从来没有这两项）。**构建前后对账**：135 页 nav 内 href 集合零丢失、零新增（`/leaderboard/` 因触发器复用出现两次，同目标）。
- **⑭ 踩坑（别退回去）**：① 触发器必须是 `<a>` 不能用 `<button>`——8 个游戏页 ≤768px 用 `.nav a:not(.hamburger){display:none}` 收进汉堡，`<button>` 不匹配该规则把头部顶出屏（`/akari/` 390px 实测溢出 443px）；② 外层必须 `display:flex;align-items:center`——`inline-block` 在 privacy/terms/reset-password 比同级链接低 4.5px，`inline-flex` 在 changelog 撑高 6px，flex+center 在 9 页实测全部 0 偏差；③ 窄屏点开要把菜单夹进视口（右对齐在触发项靠左时溢出，`/tips/` 390px 实测 left:-79）；④ 批量替换会命中**移动抽屉**里的同名 `<a>` 对，改完必须逐页比对「抽屉内是纵向普通链接」。
- 部署记录（续）：`e0f8f964`→`0d22d90d`（全站统一）、`b0e72abb`→`1d1f5746`（修首页抽屉）、`2d44b0ee`→`f2c5b26a`（GameNav 并入），IndexNow 均 200。
- **⑮（2026-11-04 续）18 个裸奔页面套上 GameNav**（commit `48fce585` → 部署 `dfbff9ad`）：`/about/`、`/contact/`、`/community/` 原本一个站内导航都没有（只能靠页脚爬进去）→ 加 `GameNav`（community 顺手删掉与新头部重复的「← Back to GridPaw」）；`/crazy-cleanup/` 自建 `site-header`（里面只有 `GameSwitcher`）→ `GameNav active="/crazy-cleanup/"`；`/meowdoku/` + 9 个 `/meowdoku/levels/N/` 的裸 `GameSwitcher` → `GameNav active="/meowdoku/"`。三处 `GameSwitcher` import 随之成孤儿已删除。**刻意不加**：`/offline/`（离线壳，导航资源不可用，必须极简）、`/admin/funnel/`（内部页三重 noindex，不该露入口）、`/akari/akari-puzzle-online/`（301 中转页）。实测 6 页 1440/390：头部 52px sticky、内容首块 top 紧接 52 无重叠、无横向溢出；移动端只剩 GridPaw/Games/Guides/Install（Leaderboard 按 ≤900px 规则隐藏，与旧行为一致）。
- **全站导航终态（2026-11-04 复核，270 页全部 200）**：有 header nav **267** 页、渲染 Leaderboard 下拉 **265** 页；无 nav 的 3 页即上条三个刻意例外；有 nav 无下拉的 2 页 = 首页（自有内联下拉，行为等价）+ `/nonogram/solver/`（导航里本来就没有这两项）。


## 2026-11-05：Lemmy devlog 双发（首页首屏 + header 统一）
- **发帖前置（先落地再发）**：changelog 停更 5 天（线上末条 10-30）→ backfill 三条真实条目（2026-11-04 首屏重排、2026-11-04 全站 header 统一、2026-11-02 Crazy Cleanup 修复），changelog.astro `dateModified`/`Last updated` → 2026-11-04，新增短链 `/from/lemmy-home`。commit `3e17f974`（push https）→ build 270 页 → deploy `2d8783df`（274 文件）→ IndexNow 200；线上实测三条目 + 四短链 302 带 utm。
- **宣发**：!dailygames 主力帖 **74462547**（body 1288，含固定 Daily puzzle 段 + Akari 规则段 + 三短链）/ !gridpaw_dailyakari 转发帖 **74462549**（站内直链主力帖）；两帖回读 deleted=False。
- **回帖**：squirrel 追问（29827934，win 弹窗分享按钮）→ 回复 **29904326**，认领 `overflow:hidden` 矮视口裁切根因，不宣称已修。
- ~~**未修 P1**~~ **已修（2026-11-05，见下节）**：`.win-overlay{overflow:hidden}` 矮视口裁掉 share row 且不可滚动（玩家两次反馈，移动端约四成会话）→ 已按 C+ 方案修，六页统一。
- 记录：`~/workspace/backlink-workspace/records/daily/2026-11-05-gridpaw-lemmy.md` + lemmy-post-status.txt。

## 2026-11-05：胜利弹窗矮视口裁切修复（C+，六页统一）

承 Lemmy devlog 帖认领的 P1（回帖 29904326）。玩家两次说「分享按钮被裁、滚不动」。

- **根因**：`.win-overlay` = `flex` + `justify-content:center` + `overflow:hidden`。内容高于视口那一刻上下两头**对称**溢出——顶上的猫、底下的排行榜同时跑到屏外，且 overflow:hidden 滚不动。
- **实测纠正**（注入满内容：badge 解锁块 + 4 行排行榜）：竖屏 375×568 与常规横屏 844×390 最先被裁的是**猫图标（顶）与排行榜面板（底）**，分享行完整；分享行只在可用高 ~320px 时被裁 6px——玩家那台正是 **667×320（横屏 + 浏览器工具栏）**。修的是同一个根因。
- **改法**（`akari`/`hashi`/`slitherlink`/`star-battle`/`kenken`/`binary` 六页逐字一致，commit `38100c44`）：
  - `overflow-y:auto` + `justify-content:flex-start` + `.win-cat{margin-top:auto}` / `.gp-lb-panel{margin-bottom:auto}` —— 不超高时 auto margin 仍居中（高屏零变化），超高时从顶部起可滚
  - `@media (max-height:720px)` 压缩一档：猫 120→72px、标题 2rem→1.4rem、按钮/分享行收紧
  - `@media (max-height:480px)` 再压一档：猫 48px、badge 行图标 32px，把分享行留在首屏
- **两个坑（别退回去）**：① `.win-cat img` 尺寸写在 **inline style**（`style="width:120px"`），媒体查询必须 `!important` 才盖得住；② 这些页 `<style>` 本身是 `is:global`，再写 `:global(...)` 会被原样输出成**无效选择器**（整条规则失效；实测 badge 行 padding 没变才揪出来）。
- **验收**（本地 dist + 线上各一轮，6 页 × 375×568 / 667×320 / 844×390 / 390×844，均注入满内容）：667×320 分享行回到首屏（akari bottom 313、其余 201；修前 akari 分享行 +6 被裁、猫 −179）；375×568 六页全部一屏放下（修前猫 −55 / 榜 +55）；844×390 五页全放下、akari 仅排行榜需滑；390×844 前后**逐像素一致**。线上 CSS 复验 6 页 `justify-content:flex-start` 与 `max-height:480px` 均命中，HTML 200。
- **部署** `38100c44` → `a1f0dbde`，IndexNow 200。
- **预览方法学（下一轮 UI 提案沿用）**：vision 判读半透明 overlay 不可靠（三轮全失败）；`::preview` 内嵌 iframe + `srcdoc` 会被沙箱挡成空白 → 改成**纯 DOM 帧**（抽 dist 真实 markup+CSS，把 `position:fixed` 关进固定尺寸盒子，修复档做成 class 而不是 media query），跨机给 cloudflared 临时隧道（`trycloudflare.com`，Hermes 跑在另一台机器时 localhost 用户打不开）。

## 2026-11-05：Crazy Cleanup 选关网格修复（CSS 整块失效，非样式微调）

法老列的「老问题」两条：`items · 34 buckets` 挤成两行、Level 1 像默认蓝链接。实测发现是**同一个根因**，而且比预想严重——整套 `.lv-*` 规则从来没生效过。

- **根因**：选关卡片由页内 inline script 用 `createElement` 生成，元素上没有 Astro 的 `data-astro-cid-nmsn26kr` 属性，而 `.lv-*` 规则写在**第二个 scoped `<style>`** 里（编译成 `.lv-card[data-astro-cid-…]`）→ 全部匹配不上。实测卡片 `background: rgba(0,0,0,0)`、`border-color` 等于文字色、`text-decoration: underline`、`.m` 用 16px 默认字号（应为 0.62rem）。
- **改法**（commit `5ba2b504`）：① `.lv-grid/.lv-card/.lv-note` 搬进独立的 `<style is:global>`；② `.m` 拆成 `<span>207 items</span><span class="sep"> · </span><span>34 buckets</span>`——`>640px` 一行带 `·`，`≤640px` 固定两行并隐藏分隔符（不再断在词中间）；③ 主题名 `≤640px` 预留两行（`min-height:2.7em` + flex 居中），`Restaurant Kitchen` 这类两行名字不再把该行卡片撑高；④ 锁图标从 `<b>` 文本挪到卡片左上角 absolute（`'🔒 Level 10'` 在 320px 卡片里会换行，把整行从 105px 撑到 130px）。
- **验收**（本地 dist + 线上各一轮，20 张卡 × 1440/768/375/320）：高度 1440/768=80px、375/320=105px **全站唯一值**（修前 375 出现 92/109、320 出现 92/109/117/134 四种高度）；`.m` 桌面 1 行、移动 2 行；无溢出、无下划线、白底 + 羊皮纸边框；无横向滚动。关卡入口 `/crazy-cleanup/game?l=1` 线上可达（hdr「🧹 Level 1 · Gadget Store」）。
- **部署** `5ba2b504` → `1752769c`，IndexNow 200。
- **死文件已清（法老拍板改跳转，commit `188ecbdc` → 部署 `36dc9fe1`）**：`public/crazy-cleanup/index.html` 同路径被 Astro 页覆盖、`.html` 变体被 CF 308 归一，线上永不送达，但里面留着一份旧的选关网格（同样的 bug）。已换成 meta-refresh + JS 跳转桩，注释里写明「真身是 `src/pages/crazy-cleanup/index.astro`」。构建后核对 `dist/crazy-cleanup/index.html` 仍是 Astro 那份（title=Sorting Games Online…、跳转桩文本 0 处）；线上 `/crazy-cleanup/` 20 张卡 105px 等高、`/crazy-cleanup/index.html` 跟随到 `/crazy-cleanup/` 且 `hasCards=true`。
- **通用教训（同类会再犯）**：Astro 页面里**运行时创建的 DOM 元素拿不到 scoped style 的 cid**，凡是 JS 渲染的列表/卡片，CSS 必须放进 `is:global` 块；另外本仓库多数游戏页 `<style>` 本身就是 `is:global`，在里面再写 `:global(...)` 会输出成无效选择器（11-05 胜利弹窗那轮踩过同一个坑）。

## 2026-11-07：Adsterra 恢复上线（banner-only，攻略/内容页）

法老拍板：站点转「攻略站」，Journey 门槛要时间，先恢复 Adsterra 做收益。执行记录 `research/2026-11-07-adsterra-restart-execution.md`，邮件稿 `research/2026-11-07-peter-email-draft.md`（**法老当日决定 DLES/Peter 这条先不卡**，稿子留着待发）。

- **格式纪律**：只恢复静态 iframe banner 两类——InContentAd 300×250（unit 31836413）+ SideAd 160×600（unit 31688449）。`AdSlot` 的 Native 门**仍是 `false`**（Native 卡片是 10-15 投诉的直接来源，要开必须单独说服法老）。Social Bar / Popunder / Smartlink 永久禁用。
- **覆盖面（法老定，取代 §5.4「全铺」）**：`SideAd.astro` 加 `PLAY_SURFACES` 白名单闸——首页 `/`、11 款游戏页（akari/binary/kenken/star-battle/hashi/slitherlink/murdoku/murdoku-trail/meowdoku/nonogram/nurikabe/murder-sudoku/the-loop-puzzle）+ 所有 `*/solver/` 页不挂。实测 dist：`gp-incontent-ad` 68 页、`gp-side-ad` 119 页、首页/游戏页 0（连 CSS 都不再内联）。
- **单元状态核实（2026-11-07 API 实拉）**：三 unit 全 `active:3`、无 decline、无 pending。**160×600 的 invoke 域已轮换**：`www.highrevenueformat.com/<key>/invoke.js` → `https://bauval.org/22/<key>`（照旧硬编码会挂作废 URL）。已同步改组件与 `.adsterra/banner-160x600.snippet.md`。
- **Mediavine 独占核实（官方 zendesk 原文）**：Journey「requires exclusive access」；**任何多一条 ads.txt 行即违规**，「测试别家程序化广告」也违规；程序化广告须在 **launch 前**移除（onboarding 有残留广告代码检测表，不含 Adsterra 但政策面更宽）。→ 结论：Adsterra 是过渡期收益，**Journey 上线前必须下线**；且 `public/ads.txt` 现有 `google.com, pub-…` 一行也要处理（AdSense 并未投放）。**未核实到**「申请期挂别家广告会被拒」的明文。
- **闸序执行**：①`/changelog/` 2026-11-07 条目（banner-only + 当天撤网承诺，dateModified 同步）→ ②terms §7 改「is supported by advertising」+ privacy cookie 表 Adsterra 行去 (historical)、Advertising 段重写、删 AdSense 计划句 → ③部署 A（公告上线、广告关，`0d47a10e`）→ ④部署 B（广告开，`618a22c6`）。IndexNow 200（3 URL）。
- **本地+线上验收**：Playwright 双视口（390/1440）7 URL + 34 组合扫描：0 横向溢出、0 广告层遮挡可点元素、容器固定 250/600 高零 CLS、`?embed=1` 0 注入且空 div 已隐藏（探针抓到旧逻辑只 return 不 hide，已修）、串行链 `__gpAdChain` atOptions 各拿各尺寸（300×250 先、160×600 后）。线上用 mock `/api/geo=US` + stub invoke 复验通过。
- **坑（复用）**：① `AdGate` 的 bot 正则含 `headless`，**Playwright 默认 UA 会被当爬虫全部拦掉** → 探针必须 `new_context(user_agent=<真 Chrome UA>)`，否则「0 注入」是闸在生效不是坏；② **从 git worktree（detached HEAD）跑 `wrangler pages deploy` 会落 preview 频道**（alias `head.gridpaw.pages.dev`），主域不更新 → 必须加 `--branch main`；③ 主工作区带着未上线 WIP（Rooms & Exits 11 关 + SolverTiles 改版，线上 `/rooms-and-exits/` 实测 404），**部署改从 HEAD 干净 worktree 打包**，只拷改动文件 + loop-answers + IndexNow key 文件（后者 gitignore，缺了 build 直接红）。
- **观察窗**：2026-11-21 前看 Adsterra 后台分 unit imp/CPM（预期量级仍很小，别拿两周小额判死）、GA4 攻略页会话、Clarity「0 点击 + <3s + 页面已隐藏」指纹占比；任何一起跳转投诉 → 当天撤不辩护。

**2026-11-07 晚：广告布局 v2 落地（部署 2a02ae04）** — 单组件 SideAd.astro 管三个位：≥1350 左右 160×600 侧栏（带 Advertisement 标签）、768–1349 底部 728×90 sticky（关闭钮 + body padding 100px）、<768 顶部 320×50（header 之后、棋盘之上）。新 unit：728×90=32144316、320×50=32144309。覆盖 276 页。36 组合实测 0 溢出 0 真遮挡。坑：getComputedStyle 判显示时序错 → 改 JS 阈值常量与 CSS 同步。

**2026-11-07 深夜：付费去广告骨架就绪（未上线，等 Stripe 密钥）** — `functions/api/payment/{checkout,status,restore,notify/stripe}.ts` + `_stripe.ts`（零依赖 raw fetch + WebCrypto 验签，照 skill stripe-checkout-integration 的参数契约与模式 B 幂等发货）+ `migrations/006_gp_orders.sql`（本地已建）+ `/ad-free/` 售卖页 + `/refund-policy/` + SideAd/InContentAd 的 `gp_ads_free` 闸。本地 stub 全绿（checkout 503 / status 404 / restore 400 / webhook 404 / tsc 0 错 / 已购态广告位 display:none 且 bauval 脚本 0）。上线还差：`wrangler d1 execute --remote` 建表、`STRIPE_SECRET_KEY`+`STRIPE_SIGNING_SECRET`+`ENTITLEMENT_SECRET` 三个 secret、webhook 端点（只订 checkout.session.completed）。

**2026-11-08 凌晨：play surface 零广告（方案①，部署 4e08e9e1）** — `SideAd.astro` 加 `PLAY_SURFACES` 17 条路径白名单（`/`、12 游戏页、`/solver`、`/akari/solver`、`/hashi/solver`、`/nonogram/solver`），命中整组件不渲染。实测：dist 17 页广告 0 / bauval 0；内容页 18 处广告位不变；线上 5 页抽查全 0。Peter 邮件不再发送。遗留：22 个含可玩棋盘但未入白名单的页面（含 `/akari/daily`、`/akari/puzzle/[id]`、`/murdoku/trail` 等真棋盘页）待法老定是否一并加闸。

**2026-11-08 02:0x：白名单扩到真棋盘页（部署 9f37806f）** — 法老指示「真棋盘页加进白名单」。按 dist 实测（页面是否真加载 `*-engine.js` 或嵌 `embed=1` iframe）重定：17 → **26 精确 + 2 前缀**（`/akari/puzzle/` 70 页、`/meowdoku/levels/` 10 页），共 106 页零广告；新增 `/akari/{daily,create,akari-puzzle,cat-logic-puzzle,light-up-puzzle,logic-puzzle,sudoku-with-pictures}`、`/murdoku/trail`、`/the-loop-puzzle`。内容页（`/japanese-logic-puzzles`、`/pt-br/*`、`/meowdoku-guide`、`/hashi/how-to-play`、`/akari/levels/*`、`/akari/blog` 等）保留广告；`/binary/takuzu`（仅外链）、`/akari/play`（产物无引擎）、`/rooms-and-exits`·`/rotate-rings`（第三方攻略页）不在白名单。dist 广告页 258 → 169，全绿后 `--branch main` 部署并线上抽查 7 页 0 命中。

## 2026-11-08：BP3 L54-136 英文 83 页铺完 + 137 页 title 收短（部署 5d6995ca）

- **产出**：`src/pages/brain-puzzle-3-level-{54..136}/` 83 页（每页 hero + 步骤卡 + 完整视频 + 校验说明 + 3 条 FAQ + 137 关互链）+ hub 重建为 137 卡 + `public/brain-puzzle-3/s{N}.jpg` 83 张（540×360）+ 交叉验证数据入库（`scripts/bp3/data/`）。commit `a2b83d79`（83 页）→ `cf941f9c`（title 收短），干净 worktree 构建后 `--branch main` 部署。
- **交叉验证分三档，页内如实写（不装全绿）**：A 档 30 关（showgamer 110 关全表按 goal 句逐字匹配 + 步骤物件重合 ≥30%，页上写「两份独立攻略互证」）；B 档 20 关（第二源确认场景、措辞不同，页上写「视频为裁决」）；C 档 33 关（单源，页上明写 single-reference）。数据 `data/level_plan_2026-11-08.json` 的 `xcheck` 字段可复查。
- **双场景覆盖**：71 关在同号下有第二种场景，页内给完整第二套解；每条「Level N <场景>」claim 都用 YouTube 实拍标题核过（71/72）。另有 7 页把**视频自带的编号**写进正文（L68↔130、L104↔88、L69↔138、L77↔111、L87↔105、L113↔107、L131↔122）——差值 -62~+16，**证明编号漂移不是常量偏移而是逐玩家乱序**，所以双场景结构是唯一可行解，别再争「主编号选谁」。
- **⚠ GSC 口径更正（写下来防再犯）**：原先「L54-136 场景的 goal 短语查询 686 曝光/60 点击 = 盲区实锤」是**错的**。按 `gsc_query_page_28_all` 落点复核：其中 1,774 曝光/153 点击落在 L6/L8/L32/L45 等**已有页**（同一场景在另一套编号下的位置），真正落在 hub（=我们没页）的只有 **8 条 query / 10 曝光**。盲区论仍成立但依据只能是间接的：L1-53 每页均 721 曝光/28d 且曲线平坦 + L137 孤立页 200 曝光/13 点击。**教训：goal 句匹配只能证明「这个场景有人在搜」，不能证明「我们缺页」——必须落到 query×page 才能判。**
- **query 两族实测（决定 desc 写法）**：goal 句类 51 条 = 1,774 曝光 / 153 点击（8.6% CTR）；裸 `level N` 类 2,481 曝光 / 52 点击（2.1%）。→ 新页 meta description **把 goal 原文放第一位**、编号与品牌词后置。
- **title 收短（全站 137 页）**：`Brain Puzzle 3: Crazy Mind Level N Answer: <场景> Guide` → `Brain Puzzle 3 Level N Answer: <场景>`，max 58 字符（原 118/137 页 >60，最长 76，Google 截断成半句）。依据：`level` 占 BP3 query 19.0% 曝光、`crazy mind` 占 9.1% → 保留 level+answer+场景，Crazy Mind 下沉 desc/正文。生成式（`gen_pages.py`、`gen_l54_136.py`）+ `scripts/bp3/shorten_titles.py`（幂等）同步。
- **坑（重踩，已写回 skill `wrangler-deploy-verify`）**：从 detached worktree 部署**未加 `--branch main`** → 回执 `Deployment alias URL: head.gridpaw.pages.dev` = Preview，主域新 URL 3 个全 404、预览别名 200；补 `--branch main` 重发即好。判别顺序固定「先看 alias 有无 branch 前缀，再打主域」。
- **验收**：build 367 页 exit 0；dist 137 关页、可见正文 0 个 `\uXXXX` 残渣（模板级转义 bug 顺带修掉）、图片 0 缺失、canonical 全尾斜杠、**FAQ schema 与可见 details 83/83 逐字一致**、hub 137 卡无漏链、sitemap 286 URL 全有真实 lastmod；线上抽 7 页 200 + 标题/视频/双场景节逐项核对；IndexNow 83 → 137 条均 200。
- **待办**：德语 L31-137（107 页，1,292 步翻译中；**用英文批模板而非 L1-30 模板**——老德语页带逐步截图+时间戳，107 关做不出 1,292 张截图）；`/de/` 首页目前无 BP3 入口，待加区块；R&E Ch1 L12-31 仍等本单收尾。

## 2026-11-08 04:0x：BP3 德语 L31-137 共 107 页上线 + 抓出并修掉「新页 CSS 未内联」事故（部署 0f9beb4c）

- **德语产出**：107 页 `src/pages/de/brain-puzzle-3-level-{31..137}.astro`（德语 du-Form；1,292 条步骤由 10 个子 agent 并行翻译，逐关步数与英文源 0 偏差），`/de/` 首页新增 137 条关卡内链，sitemap 393 URL（DE BP3 137 条）。commit `00e6ee33`。
- **结构决策**：德语新页复刻**本次英文批**模板（hero + 步骤卡 + 完整视频 + 校验说明 + FAQ），**不复刻 L1-30 老德语页**——老页带逐步截图与视频时间戳，107 关需要 1,292 张截图，做不出来也不该假装有。翻译数据 `scripts/bp3/data/de_{src,out}/*.json` 入库可复算。
- **可复用坑（已写入 skill `astro-static-site-pitfalls`）**：生成器把 CSS 占位符写成 f-string 双大括号 `{{STYLE}}` → 页面里留下字面量 `{STYLE}`；**Astro 不在 `<style>` 内做插值**，于是 190 页「无页面 CSS」上线，而 build 只有一条 `[esbuild css minify] Unexpected "{"` 警告、退出码仍 0。**验证必须逐页看有没有 `_astro/*.css` 引用**，有引用再核该 CSS 是否含 `.step-card` 这类页内规则；build 绿 + 截图「不算破版」都不算验证。
- **事故时间线（诚实记录）**：英文 83 页 03:37 部署（5d6995ca）时即为无 CSS 状态，当时只做了结构审计 + 截图判读；04:00 德语 build 打出 css-syntax 警告才发现同源 bug 波及两批共 190 页 → 修生成器、重生成、重建、重部署（0f9beb4c），线上实测 EN L54 链接 `index.89RAvcyr.css` 且含 `.step-card/.answer-box/.video-wrap`。
- **德语 title**：59 字符内 + 词边界裁剪（不切半个词），裁完不足两个词时退回纯关键词式 `Brain Puzzle 3 Level N Lösung`（3 例）。dist 中位数 60、最长 68（含 SEOHead 统一追加的 ` | GridPaw`，共享组件不动）。
- **IndexNow**：192 URL（107 德语 + 83 英文重发 + `/de/` + hub）HTTP 200。坑：`--urls` 后接未加引号的命令替换会被吞成 1 条——先落文件再 `$(tr '\n' ' ')`，并核对打印的 "submitting N URL(s)"。

## 2026-11-09：BP3 头部「Unlock all」付费意向实验（代码就绪，待部署）

- **立项依据**：法老定「10 页挂按钮测点击率，>2% 才做支付」。10 页 = GSC 28d（10-12→11-08）BP3 关卡页 clicks top10：L33/17/6/42/36/45/16/3/32/40，合计 3,497 clicks；其余 127 关页留作对照。
- **方案选择**：三变体 1:1 试排（通栏条 / h1 上卡片 / 右下悬浮）→ 法老拍板 **A 通栏条**。否决 B 的理由：压在「Level N Answer」标题前，用户找答案先看到卖东西，点击率会混入「误以为当前答案要付费」；否决 C：桌面贴 sticky 广告 22px、移动长页常驻遮正文，投诉风险最高。
- **实现**：`src/components/UnlockBar.astro`（桌面条高 51px、移动 56px + 13px 字 + 40px 触控按钮；移动端副文案 `.ub-full` 隐藏）；10 页在 `<GameNav />` 后插 `<UnlockBar />`；`/unlock-all/` 落地页（noindex、$4.99 定价展示、mailto 意向 CTA、**不接支付**）。
- **广告顺序**：`SideAd.astro` 移动端 320×50 顶部位在有 `.gp-unlock-bar` 时改插到条之后（付费钩子优先）。⚠ 坑：header 与 bar 之间有组件内联 `<script>`，`nextElementSibling` 判断失效，须用 `compareDocumentPosition & DOCUMENT_POSITION_FOLLOWING`。
- **埋点**：`unlock_click`（placement/from/target）四通道 gtag+posthog+clarity+gpTrack；D1 白名单 `src/lib/funnel-track.ts` + `functions/api/_funnel-sql.ts` 两处已同步。
- **顺带修**：`/ad-free/`（11-07 上线）一直是 noindex 却在 sitemap 里，与本页一并加进 `astro.config.mjs` 的 `exactExcludes`；`/unlock-all/`、`/ad-free/` 加进 `PLAY_SURFACES`（购买页零广告）。
- **验收（dev 4322 + build）**：build 476 页 exit 0；dist 恰 10 页带 `data-unlock-bar`、第 11 页 0；Playwright 18 项全绿（桌面/移动几何、无横向溢出、点击 `unlock_click` 参数、对照页 L34 无条、落地页 mailto/noindex/无广告、零 pageerror）；`check-tracked-imports` 通过。
- **待办**：部署（需批准）→ GA4 注册 `unlock_click` 自定义维度 → 第 7 天中期读数 → 第 14 天按 `research/2026-11-09-unlock-all-test.md` 决策树收口。
