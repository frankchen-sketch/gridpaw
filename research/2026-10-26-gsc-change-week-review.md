# GSC 变更周复盘：10-19~10-25 变更是否有效（2026-10-26）

> 数据源：GSC API（sc-domain:gridpaw.com，furriq-daily-brief key，数据截止 10-23 完整日）+ GA4 runReport（552793510，10-25）。
> 窗口：PRE 10-05..10-18（14d）vs POST 10-19..10-23（5d，GSC 完整数据）；GA4 POST 含 10-24/25。
> 基线文档：research/2026-10-19-data-review-funnel.md（P0=趁抓取窗口放大内容供给，观察指标 imp/天≥350）。
> 原始 JSON：`~/.hermes/cache/scratch/gsc_week/*.json`（scratch 24h TTL，复查前重新拉）。

## 一句话结论

**有效，且是本站上线以来最大的一次放大：GSC 展示 456→2,879/天（×6.3）、点击 9.6→121.6/天（×12.7）、CTR 2.10%→4.22%、均位 9.7→5.5；GA4 会话 37→194/天（×5.3）而 engaged 率守住 49%→51%——量涨 5 倍质量没稀释。** 驱动 98% 来自 BP3 簇收录爬坡（10-18/19 上线 + GSC 请求编入索引 10-18/19 两轮），经典存量盘子未被蚕食反而 +25% 展示/+69% 点击。10-24/25 上线的 Rotate Rings/Nonogram Solver/76 页加深在数据截止前，本轮不可判。

## 全站漏斗（GSC）

| 指标 | PRE 10-05..18 (14d) | POST 10-19..23 (5d) | Δ |
|---|---|---|---|
| 展示/天 | 455.9 | 2,879.0 | ×6.3 |
| 点击/天 | 9.6 | 121.6 | ×12.7 |
| CTR | 2.10% | 4.22% | +2.1pp |
| 平均位次 | 9.7 | 5.5 | −4.2 |

## 归因分解（页面簇，imp/天 与 clk/天）

| 簇 | 上线日 | imp/天 pre→post | clk/天 pre→post | CTR |
|---|---|---|---|---|
| BP3 L1-33+hub | 10-18 | 55.2→1,865.2 | 2.4→92.0 | 4.9% |
| BP3 L34-53（周内新增 20 页） | 10-19 | 0→315.8 | 0→14.2 | 4.5% |
| The Loop 三页 | 10-20/22 | 0→174.0 | 0→2.8 | **1.6%** |
| BP3 德语一期 | 10-19 | 0.6→33.2 | 0→0.6 | — |
| 经典存量（其余全部） | — | 388.2→486.2 (+25%) | 6.6→11.2 (+69%) | 2.3% |
| 首页 / | — | 11.9→4.6 | 0.5→0.8 | — |

- 词盘子轮换：post 展示 68.8% 来自 PRE 窗口不可见的查询（brain puzzle 3 每关解法长尾，位次 4-5）。
- 头部页：L33 18.4 clk/天、L17 10.0、L16 6.2、L6 7.2；BP3 各落地页 GA4 engaged 41-76%（首页 43%）。

## GA4 交叉验证（真人侧）

- 会话 10-19..25 逐日：113→175→193→201→209→224→240，仍在加速。
- PRE 514 会话（37/天，engaged 49%）→ POST 1,355（194/天，engaged 51%）；engaged 会话/天 ×5.5。
- 口径注意：GA4 含自测+bot 簇（未清洗），但与 GSC 点击 ×12.7 方向量级一致，结论稳健。

## 本轮不可判（10-24/25 上线，GSC 数据止于 10-23）

Rotate Rings hub+L1-10（10-24）、Nonogram Solver（10-24）、BP3 EN 40 页加深+36 页系列加深（10-25，dup 84%→32%/57-60%→<30%）、SideAd 840px 回归（10-25）、leaderboard/badges（10-20，展示仍 0）。**建议 10-30 前后复查一轮**（对齐 solver tier-2 决策门 cron 11-01）。

## 问题清单 / 下一步

1. **/the-loop-puzzle/ CTR 1.21%（824 imp 仅 10 clk）**：查询意图是「想玩 Britannica 的 Loop」，我们 pos 6.4 的攻略页被绕过；同簇 /the-loop-hints/ CTR 7.69%——hint/answers 日更意图才是我们的承接位。动作：puzzle 页 TDK 向「answers/hints today」意图倾斜，或把 CTR 入口让给 hints 页（内链+标题改写），两周观察。
2. takuzu 词 pos 8.6→7.5 但依旧 0 点击——10-19 文档已判卡 DR，外链杠杆仍未拍板，本条维持待办。
3. 首页展示 11.9→4.6/天：基数小，暂不动，下次复查看趋势。
4. akari 词族 query 级可见行波动大（匿名桶），页级 how-to-solve CTR 2.49%→5.15%（样本 5 clicks）方向好但不足为凭。

## 追问补遗（10-26 晚，D1 一手事件 + GA4 落地 + query×page）

- **takuzu** = Binary Puzzle（Binairo，0/1 网格：行列 0/1 各半 + 相邻不超两个同值 + 行列唯一；法语区搜索多，出现 takuzu gratuit）。挂在 `/binary/takuzu/` pos 7.5，pre 12.1/天、post 10.8/天，两周稳定 **0 点击**——单裸词 DR 卡位，未动。
- **/the-loop-puzzle/ 意图修正**：824 imp 里可见分类 ~75%——28% 带 Britannica 品牌词（找本尊）、10% hints/answers、35% 泛词（"the loop puzzle" 200 imp 0 clk）不可判。行为面：GA4 engaged 62%（高于首页 43%），D1 真人 55 人中 33% 触发 game_start（板自动渲染口径）、**实际落子仅 1 人**。结论：低 CTR 是 SERP 前排被本尊占 + 泛词无点击理由；进来的人读攻略不秒退但也不玩板。TDK 向 "answers & hints daily" 倾斜（hints 页 CTR 7.69% 验证过该意图）。
- **互动真相：这波搜索流量是「读攻略」不是「玩游戏」**。BP3 落地 1,011 真人（bot 已剔）仅 1% 触发任何可追踪事件、2% 去过其他桶（首页/游戏页）；游戏互动事件/天 pre vs post 持平（gs 29-136 vs 57-136，fm 无增长）。BP3 流量价值当前=广告曝光+收录权重，游戏漏斗没被喂到——BP3 攻略页→游戏的导流钩子是下一个杠杆。
- **share 断档实锤**：share_* 事件 10-19~10-24 归零（10-22 仅 1 share_card），10-25 修复后立刻 10-25=7、10-26=1 恢复——与 43cc128「GSAP/CSS race 把胜利按钮 opacity:0、分享盲 1wk」完全对账，修复有效。
- **Nonogram solver 早期信号**：tool_action 10-24=2、10-25=2、10-26=7（上线 3 天 10 次，样本极小但方向正向），等 11-01 tier-2 决策门一起判。
- **多语种线（10-26 追查；无西语，现为 DE+pt-BR）**：德语 BP3 L1-10（10-19）post 5d 全簇 159 imp/3 clk/pos 3.6-8.4，每页 6.4 imp/天 vs EN BP3 同期每页 ~56 imp/天（爬坡斜率对照基准），query 全进匿名桶（query×page imp≥2 零行）、GA4 25 会话 engaged 8；pt-BR 7 页（10-16）全簇仅 5 imp/天、1 click（nanogramas pos 1）。判定：两线样本都不够下结论；DE 若到 11-01 跟上 EN 斜率 → 补 L11-53，pt-BR 无信号维持冻结。

## 四问追查（10-26 晚二轮）

- **自纠两条**：① BP3 互动 1% 是错的——事件清单漏了 cta_click，修正为 **10% 互动率**（106/1013），但 cta_click 流向全是攻略页 index-list 的 L→L+1 翻页（L36→37、L37→38…），是攻略内浏览不是游戏转化，game_start 仍 1%；② loop「33% 玩了」是口径错误——game_start=板渲染且可见（有 visibility gate），first_move 1/55 才是真实落子，**打点逻辑无需修**。
- **takuzu 判定：不值得立项深做**。SERP 前 8 全是专职站（每日题/策略指南/打印/拍照解题），词天花板可见 ~12 imp/天，alias 页 273 行零成本卡 pos 7.5；CTR 拉满也 ~0.5 click/天。可选零成本 title 测试（行动型标题），优先级排 loop TDK 之后。
- **loop TDK 提案（待法老确认）**：title → `The Loop Puzzle: Rules, Color Meanings & Tactics | GridPaw`（58 字符）；desc → `How to play The Loop, Britannica's daily picture puzzle: step-by-step rules, what green, red and orange mean, 6 tactics, and a free loop to try.`（144 字符）。color meanings 是官方 snippet 给不了的信息差；"today" 意图留给 hints 页防蚕食。预期泛词 CTR 1.2%→3-4%（+2-4 clicks/天）。
- **share 漏斗**（10-05 起 28 条，剔盲窗）：游戏页胜利弹窗 68%（19/28），home 32%；渠道 share_copy 68% 独大、X 3、Reddit 1；referrer 5 条来自 reddit.com（Reddit 来源用户爱分享）。通关 174 guests→分享 19 guests ≈ 11%（粗口径）。
- **badge/排行榜**：游客上榜破壳实锤——game_results 10-22 前全史 1 行，10-22 起 4 天 9 行（guest:anon 为主）；badge totalKeys 283→325、持有 298→361，单徽章率全线微降（rookie 59.7%→55.4%，~~分母=新读者键涨 15%~~ **此解释有误，见下条**），但 **4 枚 0 持有徽章 2 枚破蛋**（warm-up/private-eye 0→1，与榜单破壳同源），night-owl/streak-keeper 仍 0。等 11-2 cron `eb2ce515196b` 三指标复查。
- **badge 分母口径实锤（10-26 三轮追查）**：`functions/api/badges.ts` computeStats 的 SQL 带 `WHERE event_name IN (LEVEL_EVENTS)`——**totalKeys(325) 只数发过解出类事件的玩家键，读者从未进过分母**（STATS_MAX_ROWS=200k 全史无截断）。两个后果：① 我上轮「读者稀释获得率」的解释错误——实际是分母（解出键 +15%）里新解出玩家浅玩（L1-5 为主）拉低高阶徽章率；② **10-20 拍板口径「全部访客键」未被实现**——实现=解出键分母，两口径数值差 4-10 倍（非 bot 全键 ~1370 vs 解出键 322），**法老已拍板（10-26）：用 a，解出键方案——实现与拍板一致，closed**；落子键/全访客键口径作废。遗留独立项：first-case/serial/private-eye 只认 level='4x4'/'6x6' 字符串（Shikaku 老命名），Akari 等数字 level 不计——多游戏下覆盖缺口，待排期。玩家口径当前率（/322）：rookie 55.9%、detective 27.6%、first-case 13.7%、chief 9.6%、mastermind 3.1%；另发现 first-case/serial/private-eye 只认 level='4x4'/'6x6' 字符串（Shikaku 老命名），Akari 等数字 level 不计——多游戏下覆盖缺口。
- **warm-up 破蛋者疑似自测**：唯一 streak3 键=Marble #12（anon-4ffbdafe）10-22/23/24 三天连打（shikaku 28s/103s + akari **1.0s 下限值**，10×10 daily 不可能 1 秒），时间恰逢游客上榜上线当天——别当真玩家里程碑，night-owl/streak-keeper 的真实破蛋还得等自然 streak。

## 用户操作行为（10-26 晚三轮：Clarity 聚合 + D1 链路）

- **Clarity Data Export（3 天 10-24~26，API 1 发）**：全站 1,565 sess（~522/天），BP3 簇 1,171（75%）。技术面健康：BP3 dead 52（0.04/会话）、rage 1、SE 3；首页 dead 14/67（0.21/会话，站内最高，疑 iframe/广告误报）。/leaderboard/ **28 sess、滚动 100%、11 dead clicks**——死点击浓度唯一异常页，待录屏看。GEO 首信号：`?utm_source=chatgpt.com` 落 L33（1 sess，active 192s）。
- **BP3 读者画像 = 答案零食客**：人均页数 6-16（L29 16.5、L21 15.0、L33 6.0），滚动深度 28-54%（answers hub 51%、L32 53.5%、L33 仅 28%——答案在头部，抓了就走）；L33 均参与 97s/活跃 16s。
- **D1 链路（10-19 起 1,019 BP3 落地真人）**：页数 median 1 / mean 2.4 / p90 4（双峰）；相邻转移全被 L→L±1 占据（L16→17 27、L14→15 26、L15→16 26、L33→34 31），同页重复 17%（返回/刷新）；停留中位 answers hub 17s、L17 39s、L33 3.4min、L16 3.8min（⚠️ 单位坑：visit 间隔是 ms，首轮误当秒读成 20 万）；**99%（1008/1019）最后页面仍在 BP3**，仅 4 人进游戏页、7 人回首页——读攻略不玩游戏再次实锤，且站内无出口可去（BP3 页无游戏钩子）。
- **Clarity 录屏采样受阻**：登录态过期 + vault 无 MS 凭证 + 本地默认浏览器非 Chromium（real profile 不可用）。待法老在 ego 侧重新登录后补会话级取证（重点：/leaderboard/ 11 死点击 + L33 quickback 12 次是否为良性翻页循环）。
- **运营含义**：① L→L+1 翻页已是习惯动作，答案 hub+关卡索引是站内导航主轴；② 读者→玩家钩子该放在「答案消费完的瞬间」（每关答案区下方放同机制试玩卡），不是页面头部；③ quickback 高位按 skill 规则疑良性循环，录屏配对后再定性。

## 榜单污染事故（2026-10-26 排查+修复，已上线）

**事故**：Andrey Efi 的 akari daily「4.0s」实为幽灵提交——根因是 akari/slitherlink/star-battle/kenken/binary/hashi 六个游戏页把**常规关卡胜利**当 daily 成绩上报（常规关是随机盘，时间不可比）。历史 game_results 10 行中 5 行为幽灵（4.0s/1.0s/6.0s/31s/61s 关卡时间），1 行 61s 也属关卡时间路径。

**修复**（三件套，commit 见 git log）：
1. 六页客户端停报关卡上报，win 面板只读展示当日榜（daily 页仍报）
2. 服务端下限防线：低于每游戏下限（akari/pictomino 8s、shikaku/其余 5s）必须有 24h 内 daily_start 佐证，否则 400
3. 清理 5 幽灵行，10→5 行全佐证；生产负测 3s/4s POST → 400，零残留

**遗留**：Tommy 10-02 的 15.0s 有 daily_start 佐证按规则保留（当时 daily 盘可能更小）；pictomino 无事件管线，靠 8s 下限兜底。

**Banner v2**（slogan 主导版）待用户选文案后实施；Clarity 录屏：MS 账号身份不明 + Google OAuth 拒自动化浏览器，待用户在 ego 侧登录后补 /leaderboard/ 死点击与 L33 quickback 定性。

## Hall-of-Fame Banner 上线（2026-10-26，用户拍板 v2 slogan 版）

- 形态：slogan 主导（4 条轮换：beat-time/streak-taunt/beginner/paws），champion 只做证据 chip；CTA→/leaderboard/
- 挂载：`public/hof-banner.js` 经 SEOHead 全站加载；campaign 至 2026-10-30 00:00 CST 自退役；关闭后整个 campaign 不再出；embed/iframe/无头部页（about/community/contact/meowdoku/help）不出
- 防线联动：只引服务端已验真解（streak≥2 才上 chip——Andrey streak 1 被正确滤掉，今日 chip=Marble #12 2-day）；用户名 chip 全 DOM API 渲染（XSS 防护同 leaderboard.js 先例）
- 埋点：gp_track `hof_view`/`hof_cta`/`hof_dismiss`（带 variant），进 D1 gp_event 可分析
- 验证：本地 wrangler pages dev 四行为全绿（渲染/关闭/记忆/embed）；生产实测 chip+变体+CTA 正确
- follow-up：pictomino 子站（独立 HTML、iframe 嵌套）未挂，需 top-frame 守卫+子站 QA 后单独排

## Pictomino 去留分析（2026-10-26，起因：用户问「另一套逻辑、没用户、要不要下掉」）

**clean 数据（10-05~26 21天，bot 滤净——⚠️ isLikelyBot 在 metadata JSON 里，裸列名查询会报错；全站 21% visit 行是 bot）**：

| 游戏 | 真人独立 | 多日回访 | 主来源 |
|---|---|---|---|
| akari | 373 | 15 | direct+内链 |
| murdoku | 134 | 6 | direct |
| meowdoku | 98 | 1 | google 53 |
| **pictomino** | **86** | **1** | **站内 84/99** |
| nonogram | 84 | 4 | 站内 |
| kenken | 17 | 1 | — |

- 「基本没用户」不成立：真人 86（~4/天），12 游戏里第 4，比 7 个游戏高；84% 从主站链接点入（活人，砍=砍主站菜单）
- 真洞三个：① game_results pictomino **0 行**（3 周零榜单写入，daily 入口移工具栏后链路疑断→榜单空→无回流钩子，回访 1/86 是结果）② GSC 239 imp/0 clicks（SEO blog 4 页零产出）③ 独立代码维护面（banner/防线需单独适配，今日 HOF 未含）
- **结论：游戏本体不下（砍它=砍中位偏上的真人入口，无替代承载）；SEO blog 页单独 11-2 复查（仍 0 点击→下架 blog 留游戏，损失 239 imp≈全站 0.7%）；优先修 daily→榜单断点**
