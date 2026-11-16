# train track puzzle 族 · 用户重提复核（2026-11-16）

> 分支 `research/train-track-newword`（worktree `/Users/frank/workspace/gridpaw-traintrack`），**未动 main**。
> 触发：用户报「新词铃铛扫出 Oakever 第 8 款 app `Connect Tracks: Logic Puzzle`（com.oakever.traintrack，iOS 2026-08-13，Play 500K+ / 1,531 评分 / 11-05 更新）把品类词 `train track puzzle` 从 70/月 抬到 5,400/月，KD 29.8、competition LOW，我站 GSC 28d 该族 0 曝光」。

---

## 结论（前置）

**这不是新词——是 2026-11-10 那轮原始发现的原文重报，该线已于 2026-11-14 `dropped` 结案。本轮三项增量复核全部零变化，维持 `dropped`。**

但 11-14 的结案依据里有一半已经过期，必须更正：

| 11-14 依据 | 现状 | 判定 |
|---|---|---|
| ① 可承接意图仅 ≈390/月（solver 10、answers/hints/print 全 null） | 10 月桶未出，09 桶同值 | **不变** |
| ② `train tracks app`/`train track game` 各 1,300 接不住 | 未复测（词面稳定） | 不变 |
| ③ 品类需求撑不起第 15 引擎 | 拆成两半：**意图侧（只能可玩版接）不变**；**供给侧（站撑不起新引擎）已推翻**——GSC 28d 曝光 267 → **250,920**、game_start 42 → **2,297** | **一半过期** |

另有一项 11-12/11-14 从未评估过的变量：**引擎复用度 = 中等偏高（Slitherlink 同构）**，实测见 §4。这使「可玩版」的边际成本比原判断低，但不足以推翻战表。

---

## 一、这不是新词：逐字同源核对

| 用户报的 | NEWWORD-LEDGER 2026-11-10 行原文 | 一致 |
|---|---|---|
| 第 8 款在架 app | 「Oakever 第 8 款在架 app，历轮 dev 页巡查从未记名」 | ✓ |
| com.oakever.traintrack / iOS 2026-08-13 | 同 | ✓ |
| Play 500K+ 装机 / 1,531 评分 / 11-05 更新 | 同 | ✓ |
| `train track puzzle` 70 → 5,400/月 | 12 个月 70→90→210→170→140→110→170→260→880→3,600→4,400→**5,400**（2026-09 桶） | ✓ |
| KD 29.8 / competition LOW | KD 29.8 / competition LOW（CI 2-3） | ✓ |
| 我站 GSC 28d 该族 0 曝光 | 11-10 实测 0 行 0 曝光 | ✓ |

**逐字同源** → 用户看到的不是新扫描结果。之后的关键节点：

- **11-12**：意图拆分（11 词 kwv，`fromCache=false` 真新读）→ solver 词 `train track puzzle solver` **10** / `train tracks puzzle solver` **10** / `train tracks solver` avg **10** / `connect tracks solver` **null**；answers/hints/print 全 **null**；唯一在爬的是 play 意图 `train track puzzle online`（05=90 → 09=**320**）。判定：7,300/月里几乎全是「想玩」，solver/内容页承接不成立。
- **11-12**：「web vacuum」撤回——`traintrackspuzzle.com` RDAP 注册 **2026-10-03**，已建成 388 URL 完整站（daily 240 + guides 72 + printable + solver 4×4→9×9 + en/de/fr/es）。
- **11-13**：SERP 首测，`train track puzzle` 前十无该站、无 puzzledoku。中性 SERP 复核：`train tracks app` 1,300 = 火车追踪器意图、`train track game` 1,300 = 玩具/模拟混合。
- **11-14**：按 11-12 写死的判据沉默执行 **dropped**，重开条件：`train track puzzle online` 单月破 1,000 或 solver 词破 100。

---

## 二、2026-11-16 三项增量复核：零增量

| 复核项 | 11-16 实测 | 判定 |
|---|---|---|
| **T1 品牌词**（`connect tracks` / `+game` / `+hints`，`fromCache=false` 真新读，扣 5 分） | **全 null** | T1 判据（name 族 0→非0）未触发，品牌页不建 |
| **量（kwv 3 词，`fromCache=true`）** `train track puzzle` / `+online` / `+solver` | 最新月仍 **2026-09**：主词 5,400（avg 1,300）/ online 320（avg 70）/ solver 10（avg 10） | 10 月桶未出 → **重开条件无法判定（也不满足）** |
| **竞品 sitemap** traintrackspuzzle.com | **388 URL**（自 11-03 未变；11-14 记录同为 388） | 对手未加码 |
| **GSC 28d 该族**（10-19..11-15，query 维度 25,000 行全量拉取，`dataState=all`） | 命中 `train` 的 **14 行全是别家攻略词**（Rooms & Exits 火车站关 6 行 / Brain Puzzle 3 火车关 8 行），`train track(s) puzzle` 族 **0 行 0 曝光** | 用户口径成立 |

> 口径备注：同窗口全站 imp **250,920** / clk **13,221** / 均位 **4.8**；GSC query 维度有匿名化过滤，但「0 行」是「连打标机会都没有」的强证据。

---

## 三、已过期的一半：站体量（11-09 → 11-16）

11-14 写「品类需求撑不起第 15 引擎」时引用的是 11-09 的体量。实测已完全不同：

| 指标 | 11-09 记录 | 11-16 实测（28d） | 倍数 |
|---|---|---|---|
| GSC 曝光 | 267 | **250,920** | ×940 |
| GSC 点击 | 5 | **13,221** | ×2,644 |
| GSC 均位 | 13.8 | **4.8** | — |
| GA4 session | 231（当时仅 14 天口径，不可直比） | **15,286** | — |
| `game_start` | 42 | **2,297** | ×55 |
| `game_over` | — | 324 | — |

**现有游戏页 game_start 分布（28d，GA4 hostName=gridpaw.com）**——这是「新游戏页能拿多少自流量」的直接标尺：

| 页 | game_start | 页 | game_start |
|---|---|---|---|
| `/`（Shikaku） | 648 | `/star-battle/` | 52 |
| `/meowdoku-guide/` | 532 | `/slitherlink/` | 46 |
| `/murdoku/` | 160 | `/binary/` | 41 |
| `/akari/` | 159 | `/nurikabe/demo` | 39 |
| `/the-loop-puzzle/` | 83 | `/kenken/` | 35 |
| `/meowdoku/` | 74 | `/hashi/` | 32 |
| `/nonogram/demo` | 73 | `/kakuro/demo` | 29 |
| `/pictomino/game` | 67 | `/akari/daily/` | 26 |

⇒ 第 9-18 名独立游戏页稳定 **29-52 / 28d**。新游戏页有真实自流量，不是零。

**⚠️ 但这条不能过度解释**：15,286 sessions 的大头是攻略页流量（Rooms & Exits / BP3 / Brain Puzzle 3 任务完成意图）。skill 已实测「攻略读者 97.9% 继续看攻略、进游戏 0.1%」= 帮助层流量不能当可玩层的导流池。**站变大的意义是「pSEO 内容线在跑」，不是「新引擎会自带客流」。**

---

## 四、从未评估过的一项：引擎复用度（Slitherlink 同构，中等偏高）

11-12/11-14 直接走「solver/内容页 → 不成立 → dropped」，从未走到「可玩版怎么实现」这一步。

**Train Tracks 规则（据竞品 solver 实测，非推测）**：
- 行/列**外侧**给数字 = 该行/列中轨道段数
- 全部线段连成**单一连通网络**，不允许孤立环
- 有 **entrance / exit** 概念（竞品 solver 有「Set entrance / Set exit」按钮）⇒ **开放路径，不是闭合回路**
- 盘面 4×4 → 9×9（竞品 solver 上限）

**Slitherlink 引擎现状**（`src/lib/puzzle-core/slitherlink-engine.ts`，412 行）：

| 已有能力 | 可复用性 |
|---|---|
| EdgeGrid 拓扑：`hIdx` / `vIdx` / `edgeCount` H/V 边编码 | **直接复用** |
| 单连通生成（connected + hole-free cell set → 单回路 boundary） | **需重写**为自避免 path（entrance→exit） |
| 唯一性 solver（DFS + vertex-completeness pruning，`countSolutions`） | **框架复用**，约束从「格内 4 边度数」改为「行列边数和 + 连通 + 端点」 |
| `validate` / `hintLookup` / `generate` | 框架复用 |
| EdgeGrid 渲染器（dots + edges） | 直接复用 |

**成本判定**：不是 skill 里的「L2 纯配置」级（那类是把现有约束原语组合成 rules 文件），而是**「改生成器 + 换约束」**级。与 star-battle（615 行）/ binary（181 行）同类工作量，估 **2-4 天**（含唯一性调参、mobile 触控、hint 门控、GA4 埋点、分享、PWA 离线）。

---

## 四·五、形态选择：游戏站 vs 攻略站（2026-11-16 补测，回答「tt 做哪种」）

**结论：只有游戏站有需求，攻略站在这个品类上不存在。**

| 路线 | 需求侧实测 | 供给成本 | 竞品现状 | 判定 |
|---|---|---|---|---|
| **攻略站 / help 页** | `train tracks hints` **null** / `train tracks answers` **null** / `train tracks walkthrough` **null** / `connect tracks walkthrough` **null**（本次 4 词 `fromCache=false` 真新读） | 低（纯内容页） | 竞品已铺 **12 篇规则/策略 guides × 多语言**：how-to-solve / strategy / for-beginners / faster-daily-times / puzzle-rules / clue-numbers-explained / medium-7x7 / hard-9x9 / common-mistakes / advanced-techniques / daily-how-it-works / vs-other-logic-puzzles / kids-and-classrooms —— 注册 40 天**仍是零流量** | ❌ **双杀**：自己没需求，对手把能写的全写了也没量 |
| **游戏站（可玩）** | `train track puzzle` 5,400（09 桶）+ `train tracks puzzle` 1,900（09，880→1,300→1,900 连续三月爬）+ `train track puzzle online` 320（09）+ `train track game` **10=320**（本次唯一拿到 10 月桶的词，09=320 → 10=320 **持平**） | 2-4 天（Slitherlink 同构） | 有 daily + solver，DR 0.4 / 未守 | ✅ **唯一有量入口** |
| 独立 EMD 游戏站 | 同上 | 高（388 URL 级） | EMD 位已被 traintrackspuzzle.com 占 40 天 | ⚠️ 晚入场，且该站证明这条路 40 天起不来 |

**攻略站为什么必死（机制层，不是量的问题）**：
Train Tracks 是**随机/每日生成**制，不是关卡制。⇒ 没有「level N solution」型长尾（对照 Rooms & Exits 105 关占攻略竞品 etv 60%，因为卡关即无法推进、求助刚性）；规则 6 步讲完，竞品 12 篇已覆盖全部可写主题。攻略站唯一的产品是 hints/answers，而这两个词的搜索量是 **null**。

**若做游戏站，形态 = gridpaw 站内页 `/train-tracks-puzzle/`**，不是独立域名：
- 复用现有域权重（GSC 28d 均位 4.8 / 250,920 曝光），新 EMD 则要从零开域龄闸
- 一页同时承接 play 意图（可玩）+ rules 段（长尾，null 级但零成本）+ printable
- 与现有 14 游戏共用 hint 门控 / share / PWA / GA4 埋点

**新增待验点**：`train track puzzle` 主词 10 月桶未出（`fromCache=true`，缓存未滚动）。`train track game` 10 月持平说明 play 需求**可能已停止爬升**——若主词 10 月见顶（<5,400），本线价值进一步下降。

---

## 五、决策选项

| 选项 | 内容 | 成本 | 我的建议 |
|---|---|---|---|
| **A 维持 dropped（推荐）** | 按 STATUS「2027-01-04 前只巩固不扩张」战表执行；竞品 40 天零流量也说明「该品类能否撑站」尚未被证明 | 0 | ✅ |
| **B 2027-01 后做** | 排在 R&E、akari solver 之后作为第 15 引擎候选 | 2-4 天 | 备选 |
| **C 现在插队做** | 理由：KD 29.8 + LOW + 竞品 DR 0.4 未守 + 引擎同构 | 2-4 天 + 内容页 | ❌ 破坏战表，且意图盘子 390/月 撑不起 |

**B 选项的真实风险（必须写明）**：traintrackspuzzle.com 388 URL 已建成完整站，DR 0.4 / 零流量 = **进场未守**。等 2 个月它可能已进前 6（11-10 serp_review 给的「新站现实目标前 6」），窗口就会关。这是「等」的机会成本，不是零。

**A 选项的反向证据（也该写明）**：竞品把 388 URL（daily 240 + 18 guides × 4 语 + printable + solver）全铺完，40 天仍是 0 流量、未进主词前十。⇒ 「train tracks 单品类撑站」本身没被验证，急着投引擎可能是在给一个假盘子加库存。

---

## 六、附带发现（比本案严重）：cron 全系统 11-15 16:05 ~ 11-16 18:04 停摆 ≈26 小时

排查铃铛时发现这不是单个 job 的问题：

| 证据 | 读数 |
|---|---|
| 受影响 job | `executions.db` 里 **20+ 个不同 job_id** 报同一错误（含新词雷达 `1329cf1d31a5`、外链投递 `d957f6a6cdb4`（11 轮失败）、Furriq 日报 `e85a22c363cf`、GSC 系列） |
| 起止 | 最早 **2026-11-15 16:05** → 最晚 **2026-11-16 12:05**；11-14 及之前大量 `completed` |
| 错误原文 | `[blocked_config] provider credential missing: No access token found for Nous Portal login. [profile 'default', HERMES_HOME /Users/frank/.hermes]`；代码侧 `AuthError ... nous_auth_missing_access_token, relogin=True` |
| 根因 | `~/.hermes/auth.json` 的 `providers.nous` OAuth token 失效（`auth_method=oauth_device_code`，`expires_in=3599`=1 小时寿命，靠 refresh 续） |
| 恢复 | `auth.json` mtime **11-16 18:04**（重新 device-code 登录，`obtained_at=10:04:32Z`、`last_status=ok`）；18:13 实测 `hermes chat -q "reply PONG"` **2 秒返回 PONG**；18:15 复查 `executions.db`：**18:00 之后 failed = 0**，`9c168db925db`/`2736b04bf8d4`/`4dd8b22f7490` 全部 completed、外链投递 `d957f6a6cdb4` running = **兄弟会话已修复，闭环** |

⇒ **用户今天看到的「铃铛扫出 train track」不可能是今天的数据**——铃铛当天 08:00 那轮是 failed。这正是「旧账被当成新机会」的机械原因。

**风险未除**：access token 只有 1 小时寿命，若 refresh 链再断一次，全部自动化会再静默停摆且无告警（门铃本身依赖 cron）。建议（待批）：
1. 给关键 job 钉稳定 provider：`hermes cron edit <id> --provider apineed`（`.env` 里 `APINEED_API_KEY` 在，`config.yaml` 已配 `providers.apineed`），把 OAuth 单点换掉；
2. 或加一个「cron 自检」job：每小时读 `executions.db` 最近失败数，>0 发 Gmail（门铃不能自己值班）。

---

## 七、建议动作

1. **台账追加本行**（状态维持 `dropped`，标明「非新词重报 + 站体量已变 + 引擎同构」三条增量）。
2. **重开判据补第三条**：现有两条（`train track puzzle online` 单月破 1,000 / solver 词破 100）只测「量」，测不到「品类能否撑站」。建议加 **`traintrackspuzzle.com` visits 非 0**（= 单品类撑站被证明），与 DEV-MONITOR 现有判据对齐。
3. **修 cron `1329cf1d31a5` provider**（否则铃铛持续静默失败，用户会继续被旧报告误导）。
4. **本案不改代码、不建页、不部署**。本分支只含本研究文档与台账一行。

---

## 八、竞品时间线 / 流量口径 / SERP 实测（2026-11-16 18:20 追加）

### 8.1 traintrackspuzzle.com 建站时间线（sitemap lastmod + RDAP + Wayback 三源对齐）

| 时间 | 事件 | 证据源 |
|---|---|---|
| **2026-10-03 12:29Z** | 域名注册（Cloudflare registrar） | RDAP |
| **2026-10-03 15:58Z** | Wayback 首次快照 HTTP 200 —— **注册后约 3.5 小时就上线** | Wayback CDX（全站仅此 1 条快照） |
| **2026-10-03** | sitemap **40 条** lastmod：EN/de/fr/es 四语主干 + daily + how-to-play + solver + printable | sitemap `<lastmod>` |
| **2026-11-02** | **32 条** lastmod（开始批量铺） | 同上 |
| **2026-11-03** | **316 条一次性 lastmod** → 累计 **388**（daily 存档 240 + guides 72 批量） | 同上 |
| 11-03 → 11-16（13 天） | **零新增**，388 恒定 | 三轮实测一致 |

⇒ 建站节奏：**45 天前开工 / 首日骨架全齐 / 第 31-32 天一次性铺满 / 之后 13 天停手**。当前状态是「批量铺完等 Google 消化」，不是「持续运营中」。

### 8.2 流量口径（三个独立读数，全部一致）

| 口径 | 供应商 / 端点 | 读数 |
|---|---|---|
| DR + 月访问 | web.cafe `domain_overview`（Ahrefs 类） | DR **0.4**；monthly visits 2026-08/09/10 **全 0** |
| 月访问 | TabAPI `/domains/<d>/traffic`（Similarweb 类） | report month **2026-10：visits 0**、global_rank `None`；08/09/10 **全 0** |
| 出词（附带） | 同上 `top_keywords` | `train tracks puzzle` **4,910/月**、`connect tracks` 1,130、`traintracks puzzle` 550、`sudoku train rails` 50 |

**两个 0 都是「未达量化下限」，不是精确 0。** 用「位置 × 搜索量」把它夹死：

- 它在 `train track puzzle online` 排 **#9**，该词 320/月（webcafe 口径）
- 主词 5,400 / `train tracks puzzle` 1,900 —— **不在第一页**
- 反推上限：拿满该词曝光 × CTR 3-5% ≈ **10-16 clicks/月**

⇒ **月流量上限 10-30 sessions，低于所有第三方工具的下限，所以两个 0 一致且可信。**

### 8.3 SERP 实测（TabAPI，country=us，page=1，2026-11-16 18:20）

| 查询 | 有机结果数 | 竞品位置 | 前 5 |
|---|---|---|---|
| `train track puzzle` | 8 | **不在第一页** | 1 puzzlemadness / 2 brainbashers / 3 Play(alexuvarov) / 4 App Store / 5 krazydad |
| `train tracks puzzle` | 9 | **不在第一页** | 同上，+9 intrologic.stanford.edu |
| `train track puzzle online` | 10 | **#9（第一页末席）** | 1 puzzlemadness / 2 krazydad / 3 Play / 4 brainbashers / 5 App Store |

### 8.4 前排竞品体量（TabAPI traffic，2026-10 report）

| 站 | 月访问 | global rank | 性质 |
|---|---|---|---|
| puzzlemadness.co.uk | **1,695,094** | 30,847 | 综合谜题站（train tracks 只是其中一栏） |
| brainbashers.com | 774,179 | 60,643 | 综合谜题站 |
| krazydad.com | 495,308 | 70,539 | 综合谜题站 |
| traintrackspuzzle.com | **0** | — | 单品类新站（45 天） |
| gridpaw.com（我方） | ≈16,500（GA4 28d 15,286 sessions） | — | 综合谜题站 |

⇒ **前排三家是体量 50-100 倍的整站谜题站，排 #1-5 靠整站权重，不是这个页面本身。** 我方进前 6 只能靠**页面匹配 + 时间**，不能靠体量。这是本次最硬的约束，比 KD 29.8 更真实。

### 8.5 新信号：10 月桶已出的几个词，涨的是「书」和「在线」

| 词 | 09 | 10 | 12m 趋势 |
|---|---|---|---|
| `train tracks puzzle book` | 170 | **260** | +533%（70→140→170→260） |
| `train tracks puzzle online` | 70 | **90** | +600%（50→70→90） |
| `train track game` | 320 | **320** | 持平 |
| `train tracks puzzle printable` | 30 | 未出 | +800% |
| `train tracks puzzle app` | 20 | 未出 | +33% |

⇒ 需求没有停，但**增量跑到「书（transactional）」和「在线玩（play）」**。`book` 260/月是全新的入口信号（对应 The Times / Daily Mail 的纸本 train tracks 栏目）——但 260/月撑不起独立线，且卖书是另一种生意。

### 8.6 ⚠️ 口径警示

`keyword_ideas` 返回的 `kd`（如 `train tracks puzzle` kd=0）是**预筛难度**，与 web.cafe 精确 KD 29.8 差一个量级，**不可用于 KDROI**。KDROI 一律用 web.cafe 精确 KD。

### 8.7 前排三家产品形态实测（2026-11-16 18:35）—— 全是可玩交互版，不是 PDF/攻略站

| 站 | 形态 | 关键证据（HTML 实测） |
|---|---|---|
| `puzzlemadness.co.uk/traintracks/medium` | **可玩，功能最全** | `<canvas>` ×1；`Score` / `Reset` / **`Cloud Save`** / `Register FREE` / `Login` / `Print version` / Difficulty(Small·Medium·Large·Mixed) / `Archive`；**Google AdSense 在位**（`adsbygoogle` ×7）；TITLE = `Daily Medium Train Tracks Puzzle for Monday 16th November 2026 (Easy)` = 每日一题 |
| `brainbashers.com/tracks.asp` | **可玩，轻量老式** | 无 canvas，6 个 script + DOM 交互；`Daily Tracks` + 日期选择 + Rules 说明；TITLE = `Daily Tracks - BrainBashers` |
| `krazydad.com/play/tracks/` | **可玩，带分步提示** | `<canvas>` ×1、22 个 script；`Check answer` / `Reveal errors` / **`Show next step`**（分步解提示）/ `Printable image` / `Pause`；页面自述 "These interactive puzzles are currently down" = 维护中 |

**三家都是「每日一题 + 可玩 + print 附属」结构。三家都有 print 入口，但都不是主力；没有一家是攻略站或纯 PDF 站。**

### 8.8 决定性证据：三家都把 `train track puzzle` 当主力词

TabAPI `top_keywords`（report 2026-10）：

| 站 | `train track puzzle` 在其 top5 的位置 |
|---|---|
| puzzlemadness.co.uk | **第 1 位 —— 9,880/mo**（高于 samurai sudoku 6,240、thermo sudoku 1,210） |
| brainbashers.com | **第 4 位 —— 9,880/mo**（前面是自家品牌词 + slitherlink 5,240） |
| krazydad.com | 在 top5（前面是 star battle 29,170、killer sudoku 42,510、自家品牌词） |

⚠️ 口径差：TabAPI 报 **9,880/mo**，webcafe 报 **5,400/mo（2026-09 桶 us）**。两者差近一倍，TabAPI 可能是 global 或含变体归并。**判断量级用 webcafe，判断「这词对竞品多重要」用 TabAPI 的排序——三家一致把它放进 top5，说明它是核心词而非边缘长尾。**

### 8.9 SERP 结构结论

`train track puzzle` 第一页 8 个有机结果：

| 位 | 站 | 类型 |
|---|---|---|
| 1 | puzzlemadness.co.uk | **可玩网页版**（170 万月访） |
| 2 | brainbashers.com | **可玩网页版**（77 万月访） |
| 3 | Play Store（alexuvarov 的 app） | **App 商店** |
| 4 | App Store | **App 商店** |
| 5 | krazydad.com | **可玩网页版**（49 万月访） |
| 6 | bosburyhistoryresource.org.uk | PDF/教辅类 |
| 7 | YouTube | 视频 |
| 8 | alexsmartbooks.com | 书/教辅 |

⇒ **8 个槽：3 个可玩网页版 + 2 个 App 商店 + 0 个攻略站。** 攻略站不存在这条判断，从「help 词全 null」的**反面证据**升级为「SERP 一个攻略站都没有」的**正面证据**。

⇒ 同时这也是**坏消息**：这不是蓝海新词，是**一个已由三家寡头做成成熟品类的词，被一个新 app 带火了搜索量**。我们要做的是第 4 个同构产品，体量差 50-100 倍。

### 8.10 意外发现：真正的问题可能不在「加第 15 款」

krazydad 的 top 词是 `star battle — 29,170/mo`（其站内最大词之一）。**我们已有 `/star-battle/` 页（28d `game_start` 仅 52）**。

⇒ 差距 500 倍不是「品类没做」，是**已有页面接不住同品类寡头的流量**。在讨论「要不要加 train tracks 第 15 款」之前，更该先查清 `star battle` 为什么只拿 52。这是本报告指向的下一步，也是比 train tracks 更贵的那个问题。

---

## 数据源与口径声明

- 搜索量 / 竞争度：webcafe `keyword_volume`（Google Ads 口径，`gl=us`，14 天缓存）。本轮 3 词 `fromCache=true`、品牌词 3 词 `fromCache=false`；扣 10 分，余 1,119。
- KD 29.8：webcafe（哥飞版），11-10 实测，未过期（<30 天）。
- GSC：`sc-domain:gridpaw.com`，28d = 2026-10-19..2026-11-15，`dataState=all`，query 维度 25,000 行全量（非 top-N 截断）。
- GA4：Property 552793510，28d，`hostName=gridpaw.com` 精确过滤（口径铁律 1）。
- 竞品：sitemap `<loc>` 计数（curl 经 7882 代理）；规则与 solver 参数来自 `traintrackspuzzle.com/train-tracks-solver` 实测文本。
