# GridPaw 新词台账

cron（job 1329cf1d31a5）去重真源。状态：`reported`（已报告未动工）→ `deployed`（落地页已上线）→ `dropped`（判定放弃，含原因）。

**cron 状态（2026-10-16 用户决策：B 根砍掉，收窄为「T1 专用窄管 v4」）**：每天 2 轮（早 8 + 晚 8），prompt v4——哥飞服务管搜索侧广度（500+ 词根日扫），cron 只管 T1 品牌词族监控 + 每周一 Play dev 页新品巡查。v3 的 B 主题根窄扫（cat/game 泛词根 5 根轮完 3 遍零有效词）经用户拍板砍除；A 层品类根广扫 10-11 已砍。本表 = 全部新词线索的唯一去重真源。

## 发现层分工（三路互补，产出全部落本表防重复挖）

| 路线 | 覆盖什么 | 节奏 | 入口档案 |
|---|---|---|---|
| **哥飞新词发现服务**（web.cafe 数据服务） | 搜索侧：500+ 词根日扫，已判值不值得做（新词/二次爆火老词/长期大词） | 每日（数据方更新） | 兄弟会话维护 webcafe 新词服务记录；限免期评估中 |
| **移动端品类反推**（供给侧） | 从 Play 品类搜索反推监控开发者 → 新游戏 → 品牌词族（含 help 词），比搜索信号早 1-4 周 | 每周一次人肉 | `DEV-MONITOR.md`（T1/T2/霸主名单 + SOP + 收录标准） |
| **人工喂词** | 群聊/竞品/突发 | 随时 | 直接进本表 |
| **cron 雷达（窄管 v4）** | T1 品牌词族 0→非0 监控（核心）+ 每周一 Play dev 页新品巡查 | 每天 2 轮（8 点/20 点） | job `1329cf1d31a5`，25 分/轮 |

两条主线的互补关系：哥飞服务 = 搜索侧需求的"已冒头"信号（覆盖广、滞后于 App 上架）；品类反推 = 供给侧的"会冒头"信号（开发者新品确定、词族可预测、可提前建页）；cron 窄管 = 私有情报线（T1 词族是哥飞不知道我们监控谁的那部分）。同词两路命中 = 最高优先级。

| 日期 | 词 | 月搜(US) | 哥飞KD | 形状判断 | 状态 | 来源 | 备注 |
|---|---|---|---|---|---|---|---|
| 2026-10-10 | cat in the hat | 246,000 | 30 | 上升+55%，逐月 135k→550k，疑电影事件需求 | dropped | cron | 商标/IP 词，需绕开官方名，待定替代词（如 cat hat puzzle）再评估 |
| 2026-10-10 | bengal cat | 450,000 | 38 | +40%，但 furriq 的菜不是 gridpaw | dropped | cron | 赛道错配（品种词 vs 游戏词） |
| 2026-10-10 | snake arcade game | 550,000 | 37 | +5099% 为 Google Doodle 蛇年脉冲：26/01 冲 500 万后跌回 3 万 | dropped | cron | 一次性脉冲，非稳定需求 |
| 2026-10-10 | google snake doodle game（及变体×5） | 301,000 | 38-43 | 同上，Doodle 脉冲 | dropped | cron | 脉冲词 |
| 2026-10-10 | poople（每日单词阶梯游戏） | 449,000 | 35.8 | 真新词：25-09 仅 1300 → 26-06 爆 673k，30 万+/月稳住，上升期 | dropped | 雷达 | 品类=每日词游，非 gridpaw 赛道；用户决策 2026-10-10 先放一放专注 gridpaw 扩量。截流路径已被 pooplegame.com 验证（注册 4 个月 DR 31 排 #2 月拿 3 万搜索流量），数据留档：衍生词 KD 35.8 / 链接预算 35~70 引用域 / DR 26 量级可入场 |
| 2026-10-10 | arrows puzzle | 5,400 | 40.5 | **12 个月单边爬升**：170→880→4,400→5,400 无回落；competition LOW。驱动源 = Arrows – Puzzle Escape（com.ecffri.arrows，**100M+ 安装**，周更） | deployed | 品类反推 | **雷达首个实战命中**。KD 补测：主词 40.5（预算 40-85 引用域）/ walkthrough **11.6**（预算 10-20，旗舰位）/ hints 20.3。**2026-10-10 上线 5 页内页攻略战**：/arrows-puzzle/ hub + /arrows-puzzle-walkthrough/（KD 11.6 旗舰）+ /block-blast-hints/（KD 20.3，内容位非 solver）+ /meowdoku-guide/（KD 42.2，差异化打 alternative）+ /cross-math-puzzle/（KD 53.8，前 9 全内页无人经营=结构机会）。IndexNow 已提，28 天 GSC 验证窗口至 2026-11-07。**2026-10-12 首次读数（第2-3天）**：5 页全部出曝光（合计 56 imp 2 clk），meowdoku-guide 33imp/2clk 领跑（meowdoku tips pos1.0）、arrows 双页 pos 6.7-6.8、cross-math pos 3.5；GA4 落地 0 会话属窗口早期正常。**2026-10-16 二次读数（第6-7天，GSC dataState=all，脚本 ~/.hermes/cache/scratch/gsc-newword-wave-read.py）**：5 页合计 **712 imp / 8 clk / CTR 1.1%**，比 10-12 首读（56/2）明显起量——复查点通过，无需加内链权重：meowdoku-guide 235 imp/7 clk（CTR 3.0%，领跑）/ arrows-puzzle 243 imp/1 clk / arrows-walkthrough 141 imp / cross-math 51 / block-blast-hints 42，bestPos 全部 6.2-9.3（arrows 双页从 6.7-6.8 爬到 6.2=还在涨非停滞）。query 维度匿名化重（仅 2 词 ≥5 imp：games like meowdoku 8 imp pos 10.8 / block blast hints 5 imp pos 8.0，勿用 query 算总量）。按天：10-12 峰 162 → 13/14 稳 ~150 → **10-15 骤降 24 = GSC 尾日滞后（10-16 全缺），非掉量**。GA4 交叉：5 页 landing 仅 14 会话（11 google / 2 直接），meowdoku-guide 8 会话 0 engaged——GSC 曝光在涨但进站体量仍小，转化杠杆=等排名再进前 3-5。**质量侧同窗（hostName 过滤，脚本 ga4-wave-bounce.py）**：5 页 14 会话互动率仅 ~14%/跳出 ~86%/均时长 33s 内，vs 全站基线 32.2%/67.8%/173s；google 来源 10 会话互动率 10%/时长 11s——搜索客在扫答案不走深，AdSlot（y≈3033px）看不见；walkthrough 页 0 landing。N=14 不显著（1 会话=7pp 噪声），只记方向不动页面 |
| 2026-10-11 | woody block puzzle | 390 | 43 | **12 月爬升 + 7 天飙升**：260→720；但 KD 定性为品牌词（前十平台生态占 6-7 固定位） | dropped | 雷达 | **品牌词坐实，上轮 pending 闭环**：SERP 平台生态（play/apple/facebook/youtube/amazon）垄断，可竞争位仅 3（最弱 woodblockpuzzle.com DR0）；衍生内容链接预算 45-95 引用域不值；wood block 品类 gridpaw 无引擎 → 放弃 |
| 2026-10-11 | meowdoku hints | 480 | 42.2 | **0→非0 + 爬升**：06 诞生 260 → 08 月 480（Oakever Meowdoku help 词族） | reported | T1监控 | **T1 词级新信号**。品牌词口径 KD 42.2 中等，盘面 meowdoku.org（5 个月 DR39）+ 平台独占，可竞争位仅 1。**挂现有 /meowdoku-guide/ 页变体覆盖**（TDK/内容自然嵌入），零新增成本，不另立页 |
| 2026-10-11 | cross math puzzles | 4,400 | 未查 | 稳定 2400-5400 周期波动，非新词；Ads 竞争 LOW(19) | reported | 雷达 | **挂现有 /cross-math-puzzle/ 页**的复数变体。该页 10-10 刚上线（KD 53.8），变体词可直接进页面内容/TDK 覆盖，不新建页 |
| 2026-10-12 | amaze go | 6,600 | 76 | **0→非0 且翻倍**：06 2400 → 07 4400 → 08 6600；Trends 12m 6 月起持续 40-51，同查询高于 arrows puzzle | reported | T1监控 | **T1 高优先级警报**：Oakever 第二台箭头引擎 **Amaze GO!**（com.oakever.arrows，2/2026 上架，**120M 装 / 近 30 天 14M**，4.85★，iOS 同步，#8 US Games）。品牌词 KD76 盘面平台垄断（Play/AppStore/YouTube/下载站 10/10 专门经营）**不直接打**；承接 = 现有 /arrows-puzzle/ 覆盖 + 盯 help 词族（walkthrough/hints 现全 null，按 meowdoku/arrows 先例 1-3 月内成形），help 词 0→非0 或 ≥300/月时镜像 arrows-walkthrough（KD 11.6）打法评估独立页 |
| 2026-10-12 | amaze go game | 1,300 | 未查 | 0→非0：06 720 → 07 1300 → 08 1000（LOW 23） | reported | T1监控 | amaze go 词族变体同步成词，验证词族成型非单点脉冲；承接同上 |
| 2026-10-12 | poetry cat game | 未核量 | 未查 | riser +180%（30d） | excluded | 雷达B根 | SERP 定性 = Ereading Games 教育评测型平台游戏（ELA 老师用），开学季季节脉冲非新游戏；品类错配无承接 |
| 2026-10-12 | halloween cat game | 未核量 | 未查 | riser +40%（30d） | excluded | 雷达B根 | 万圣节季节脉冲，需节日主题游戏承接而 gridpaw 无；建页赶不上今年窗口 |
| 2026-10-12 | T1词族复核（10词） | — | — | 无新信号（零信号行） | t1-monitor | T1监控 | amaze go 6600 / amaze go game 1000 维持上轮快照（最新 2026-08）；**amaze go hints/levels/walkthrough 全 null**（help 词族未成形，等待期）；meowdoku 60500 爬升已知、hints 480 平、walkthrough null 重试仍无；arrows puzzle 5400 单边爬升中 |
| 2026-10-12 | pink cat games login | 未核量 | 未查 | riser +70%（30d） | excluded | 雷达B根 | pinkcatgames.com 教育游戏平台（教师用）品牌导航查询：login = 找登录入口，非游戏内容需求，gridpaw 无承接 |
| 2026-10-13 | T1词族复核（10词） | — | — | 无新信号（零信号行）；快照最新仍 2026-08 | t1-monitor | T1监控 | amaze go 6600 / amaze go game 1000 / meowdoku 60500 / meowdoku hints 480 / arrows puzzle 5400 全部维持上轮快照，**09 月数据仍未见（第 6 轮盯守）**；amaze go hints/levels/walkthrough 第 6 次 null，help 词族仍未成形；B 根跳过（继续挂起待拍板） |
| 2026-10-14 | T1词族复核（10词） | — | — | 无新信号（零信号行）；快照最新仍 2026-08 | t1-monitor | T1监控 | amaze go 6600 / amaze go game 1000 / meowdoku 60500 / meowdoku hints 480 / arrows puzzle 5400 全部维持上轮快照，**09 月数据第 8 轮盯守仍未出场**；amaze go hints/levels/walkthrough 第 8 次 null，help 词族仍未成形；B 根跳过（挂起不变）；余额 3326，差额 52 疑他路消耗（持续记 risk） |
| 2026-10-15 | T1词族复核（10词） | — | — | 无新信号（零信号行）；快照最新仍 2026-08 | t1-monitor | T1监控 | amaze go 6600 / amaze go game 1000 / meowdoku 60500 / meowdoku hints 480 / arrows puzzle 5400 全部维持上轮快照，**09 月数据第 10 轮盯守仍未出场**；amaze go hints/levels/walkthrough 第 10 次 null，help 词族仍未成形；B 根跳过（挂起不变，已 84h+）；余额 3278，差额 35（上轮 3 → 本轮 35，非单调反弹，兄弟会话间歇消耗特征） |
| 2026-10-16 | T1词族复核（10词） | — | — | 无新信号（零信号行）；快照最新仍 2026-08 | t1-monitor | T1监控 | amaze go 6600 / amaze go game 1000 / meowdoku 60500 / meowdoku hints 480 / arrows puzzle 5400 全部维持上轮快照，**09 月数据第 11 轮盯守仍未出场**；amaze go hints/levels/walkthrough 第 11 次 null，help 词族仍未成形；B 根跳过（挂起不变，已 96h+）；**余额 3273，差额 0 完全对账**（52→3→35 波动后首次归零，疑计价时点差异非真泄漏） |
| 2026-10-16 | connect tracks | 规划师 null | 未查 | 词未成形（规划师 3 词全 null：connect tracks / connect tracks puzzle / track puzzle game）；趋势+Reddit+SERP 深查均无热度 | dropped | 品类反推补扫 | **Oakever 新品 Connect Tracks: Logic Puzzle（com.oakever.traintrack，2026-08-07 上架，100K+ 下载）**。深查证据：① Trends 12m 非新词（窗口前已有 6-13 平稳底噪，峰 25-12-07，早于上架），无品牌爬升，90d 内 9-20 一次性尖峰后回落；② Reddit 品牌热度≈0（pullpush 全噪音，唯一真信号 = 10-11 德语广告吐槽帖；r/puzzles 的 train tracks 帖指向经典品类非本作）；③ Solver 位已被 2017 年老域名 puzzlegamemaster.com 改行占住，YouTube 已有 walkthrough；④ Bing SERP 被教育平台「Connect」污染。**2026-10-16 用户拍板放弃**（「先算了」），本轮积分（~20）留档防止重复挖。若 Oakever 对其放量买量使词族 0→非0，需重新走四道闸再议 |
| 2026-10-16 | tile explorer | 5,400 | 63.4 | 老词稳盘：25-09 至 26-08 维持 4,400-8,100 无爬升；LOW 竞争 | dropped | 品类反推补扫 | Tile Explorer - Triple Match（com.oakever.tiletrip，2024-05 上架，**100M+ 下载**）。品牌词盘面平台生态 6-7 固定位，可竞争位仅 3（最弱 uptodown 内页 DR 83）；衍生内容链接预算 110-230 引用域，远超阈值 → 不值，判例同 woody block puzzle 但更贵。100M 装 ≠ 可承接，反向印证「安装量 ≠ 搜索机会」 |

## 词根轮换记录（防重复烧积分）

| 轮次 | 用过的词根 | 备注 |
|---|---|---|
| 2026-10-11 00:20 | logic puzzle / cross math / block puzzle / arrows puzzle / meowdoku | cron 恢复后首轮；下轮避开这 5 个，从 brain teaser / word game / number game / tile match / puzzle game / kitten puzzle / cat puzzle / block bloom / zoodoku / splash buster 里轮换 |
| 2026-10-11 08:01 | kitten puzzle / cat puzzle（B根，各零信号）+ T1词族 ×9 | T1 词级新信号 meowdoku hints；下轮 B 根换 cat game / pet game，T1 主词族量核继续；woody 闭环 dropped |
| 2026-10-12 08:00 | cat game / pet game（B根；poetry cat game +180% / halloween cat game +40% 均季节脉冲排除，零有效词）+ T1 词族 ×10 | **T1 高优先级新信号 amaze go 词族 0→非0**（上架源头 Amaze GO! com.oakever.arrows，120M 装）；下轮 B 根换 cat games（已用：kitten/cat puzzle、cat/pet game），T1 续盯 amaze go + help 词族（现全 null）+ meowdoku walkthrough/null 重试 |
| 2026-10-12 20:01 | cat games（B根最后 1 根；仅 pink cat games login 品牌导航词排除）+ T1 词族 ×10 复核 | **零信号**：amaze go 词族维持上轮快照，help 词族（hints/levels/walkthrough）全 null 等待期；**B 根 5 根已全轮完一遍（kitten/cat puzzle、cat/pet game、cat games）三轮连扫零有效词**——下轮建议 B 根降频，把积分让给 T1 amaze go help 词族紧盯（窗口期）；T1 续盯 amaze go/meowdoku help 变体 + 等 09/10 月快照 |
| 2026-10-13 08:01 | B 根跳过（5 根轮完 3 遍零有效词，降频等拍板）+ T1 词族 ×10 复核 | **零信号**：全部 10 词维持上轮快照（最新 2026-08，09 月数据仍未见）；amaze go help 词族第 5 次 null；下轮同（T1 复核 + 快照 09 出场监视），B 根继续挂起直到用户拍板降频节奏 |
| 2026-10-13 20:01 | B 根跳过（继续挂起）+ T1 词族 ×10 复核 | **零信号**：全部 10 词维持上轮快照（最新 2026-08，09 月数据第 6 轮盯守仍未出场）；amaze go help 词族第 6 次 null；下轮同，B 根挂起不变 |
| 2026-10-14 20:03 | B 根跳过（挂起不变）+ T1 词族 ×10 复核 | **零信号**：全部 10 词维持上轮快照（最新 2026-08，09 月数据第 8 轮盯守仍未出场）；amaze go help 词族第 8 次 null；余额差额观察：3383−5 预期 3378，实测 3326，差额 52 疑他路消耗（上轮 41 → 本轮 52，非单调，兄弟会话间歇使用特征）；下轮同 |
| 2026-10-15 20:00 | B 根跳过（挂起不变，已 84h+ 等拍板）+ T1 词族 ×10 复核 | **零信号**：全部 10 词维持上轮快照（最新 2026-08，09 月数据第 10 轮盯守仍未出场）；amaze go help 词族第 10 次 null；余额 3278，差额 35 反弹（52 → 3 → 35，非单调，兄弟会话间歇消耗特征再起）；下轮同 |
| 2026-10-16 08:00 | B 根跳过（挂起不变，已 96h+ 等拍板）+ T1 词族 ×10 复核 | **零信号**：全部 10 词维持上轮快照（最新 2026-08，09 月数据第 11 轮盯守仍未出场）；amaze go help 词族第 11 次 null；**余额 3273，差额 0 首次完全对账**（52→3→35 波动后归零，疑计价时点差异非真泄漏）；下轮同 |

## 验证四道闸（标准动作链，每词 ≤15 分）

1. `keyword_volume` → 读「新词？」列 + 逐月曲线（判真词 vs 脉冲，别看曲线猜）
2. `google_trends` compare（≤5 词同查，90d/12m）→ 出现时间 + 一次性热点判定
3. `keyword_difficulty` → 品牌词口径 KD + 链接预算 + 前十盘面
4. 可选：`site_keywords` 拆活证据站出词表（抄作业清单）

## 赛道分叉（判据写死）

| 词的品类 | 归属 | 依据 |
|---|---|---|
| 逻辑谜题 / 猫主题 | **gridpaw 内页**（rules/tips/daily/solver 模板已有） | 现有 11 游戏引擎 + game-site-seo-pages skill |
| 一次性脉冲 / IP 词 / 品种词 | dropped | 台账已有判例（snake doodle / cat in the hat / bengal cat） |
| 其他品类爆款（每日词游等） | dropped（先放） | 专注 gridpaw 现有游戏扩量；数据留档备查 |

## 口径备注

- 量/KD 来自 webcafe-seo MCP（keyword_ideas 快照库 2026-10-10 查询，快照滞后 1-2 月，最新 2026-08）
- 快照库查不到 ≠ 没人搜：真空期新词必须换证据（serp 实测 + google_trends 看出现时间）
- 调价纪律：贵工具（keyword_ideas/site_keywords/site_history）一轮合计 ≤3 次；预计一轮 30 分以上先问用户

## 可玩版：/meowdoku-guide/ 页内嵌 Meowdoku 式棋盘（2026-10-16 已部署上线）

- **方案 B 落地**：star-battle 引擎 K=1（`generate(6,1,'easy',seed)`）+ 自有猫图标 + 3 血机制，嵌在 guide 页 Controls 段之后（首屏第 2 屏）。零新引擎、零新依赖。
- **对位竞品四缝**：①每盘 `generate` 程序验证唯一解 + 徽章显示（打竞品「随机盘答案对不上」死穴）②Hint 直接亮唯一绿格+报 R行C列 ③违规红闪回退扣心（Nurikabe 双向纠错范式）④无限关生成器。
- **打点**：game_start（visibility 门控）/ first_move / hint_click / level_up / puzzle_reset，全走 gtag+posthog+clarity+gpTrack 四通道，level=盘号、difficulty='easy 6x6'。
- **红线**：fan-made disclaimer + not affiliated with Oakever 写进模块；URL 未新增；棋盘 488px 桌面/263px 移动均在 840px 内容列内居中，不碰 SideAd。
- **验收（Playwright 双端 + vision 复核，全绿零控制台错误）**：36 格渲染、点击循环 ✕→猫→清空、违规闪红扣心、hint 亮绿格报坐标、6 猫触发 win 弹层（锁盘）、Next board 换盘、Reset 清盘；移动端 390px 无横向溢出（board 28.8→361.2px，scrollWidth=390），tap 循环正常；win 弹层导流 /star-battle/ 与首页 Shikaku。
- **注意**：win 后弹层内 "new board →" 为页内按钮非新 URL。5 个事件（game_start/first_move/hint_click/level_up/puzzle_reset）**全部在 funnel-track.ts 的 FUNNEL_EVENTS 白名单内（2026-10-16 核对）→ 全走 D1 真源 + GA4/posthog/clarity 参考口径**（此前写「puzzle_reset 不在白名单」系核对错误）。验收脚本 `design/qa/verify-meow-play.py`（+center/mobile 两个，仓库留档，不进发布路径）。
- **猫图标 C 方案入库（2026-10-16，用户选定）**：`public/meowdoku-guide/cat-icon.png`（256px 透明底 PNG，41KB；1024px master 在 `design/meowdoku-cat-icon-master.png`（design/ 非发布目录））。来源 = Gemini 生成扁平猫脸（琥珀+奶油白，暖色 palette），色度键抠底（55/105 羽化）+ 3% padding 正方形化。`.pc .catp` 与答案演示区 `.cat` 均已切到自有资产，**官方 cat-sprite.png 已全站归零并删除（git rm）——sprite 版权雷清除**。vision 复核：抠图干净无白边、五官完整、32-46px 可读。

## 方案 C 一期：/meowdoku/ hub + 10 固定关卡 + 星级评价（2026-10-16 下午上线，deploy `9de6af5c`）

- **拍板**：用户「继续先做吧，铺个 10 关先，加个 CTA 看下用户是否感兴趣、愿意给评价」——不等 11-07 数据，hub + 10 关先验证；评分做低配（5 星 + localStorage 防重，无后端聚合），收行为信号即可。「每个游戏都留星级评价」的想法以 StarRating 组件形态预留，meowdoku 先行试点。
- **页面**：`/meowdoku/`（hub：随机盘可玩 + 关卡导航 + 规则速览 + FAQ×4 + WebApplication/BreadcrumbList/FAQPage schema）；`/meowdoku/levels/1..10/`（固定盘 + 答案折叠 + 星级 CTA + 前后关导航）。对标竞品 meowdoku.org 的 310 关卡矩阵，先用 10 关探转化。
- **确定性关卡**：seed=关卡号（1..10），引擎内 countSolutions 验唯一；答案坐标由 `scripts/meowdoku-levels-precompute.cjs` 预计算入 `src/data/meowdoku-levels.json`，页面折叠展示——**我们的关卡有真答案可对，竞品 app 盘面随机对不上**（差异化卖点延续）。Playwright 实测按 JSON 答案逐点可通关。
- **组件化**：可玩模块抽 `src/components/MeowdokuPlay.astro`（random/level 双模式；样式 is:global + `.mzplay` 命名空间——JS 渲染行 scoped 失配是 AGENTS 已知坑）；guide 页同步切组件（旧内联 ~200 行删除）；`StarRating.astro` 可复用。游戏逻辑与 guide 版一致（✕ 回退/3 心/Hint 绿格）。
- **打点**：新增 `rate_submit {game, level, stars}`，**funnel-track.ts + functions/api/_funnel-sql.ts 双白名单同加**（只加一侧会 400）；关卡模式 level=关卡号（固定），hub 随机模式 level=盘号。win 导流改为「下一关 → / hub / guide」。
- **导航**：GameSwitcher（game 页头）与 GameNav（content 页头）双表补 meowdoku——**GameNav 双写债已注释标记**，收敛方向=GameNav 复用 GameSwitcher（未做，控范围）。
- **验收**：Playwright hub/level1/guide 回归/移动端 390px 全绿零错误（轨道 28/28 对称）；schema JSON build 产物逐块解析过；线上 cache-bust 3 URL 200 + L5 答案精确命中。验收脚本 `~/.hermes/cache/scratch/verify-meow-hub.py`（临时）。
- **索引**：12 URL（hub+10 关+guide）批量 IndexNow HTTP 200；sitemap 自动收录（@astrojs/sitemap）。
- **后续观察**（11-07 收窗）：rate_submit 量与 stars 分布 = 用户兴趣信号；levels/N 的 GSC 曝光决定是否铺到 50-100 关。
