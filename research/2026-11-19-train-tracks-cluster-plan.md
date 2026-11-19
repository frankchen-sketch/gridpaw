# Train Tracks 游戏簇：目录与落位（2026-11-19 法老拍板）

> 状态：**已拍板，待动工**（法老原话「嗯嗯 并进去」）
> 前序：`gridpaw/research/2026-11-16-train-track-puzzle-recheck.md`（四·五 形态选择）、`research/2026-11-18-competitor-style-library.md:20`（四合一骨架）
> 本轮新增：ops-console 站牌合并（ttp → gridpaw）、目录定案、上线同批改动清单

---

## 0. 一句话

**四合一保留，但只出 3 个 URL**：主盘（可玩 + 规则）· solver（含分步推导）· printable。
第四件 walkthrough 不独立成页——它和 solver 本来就是同一件事，且实测零需求。

---

## 1. 目录（定案）

```
/train-tracks-puzzle/             ← 主盘：可玩棋盘 + 规则 + 策略 + FAQ（一页到底）
/train-tracks-puzzle/solver/      ← solver，带分步推导（对手上限 9×9，我们做到 12×12）
/train-tracks-puzzle/printable/   ← PDF 题库（站内首个 printable，新增件）
```

| 路由 | 内容 | 承接意图 | sitemap |
|---|---|---|---|
| `/train-tracks-puzzle/` | 可玩盘（首屏棋盘）+ rules + strategy + FAQ | `train track puzzle` 5,400 / `train tracks puzzle` 1,900 / `…online` 320 | ✅ |
| `/train-tracks-puzzle/solver/` | 输入题面 → 输出分步推导 | `train track puzzle solver` 10 | ✅ |
| `/train-tracks-puzzle/printable/` | A4 多题 + 答案页 | print/PDF 族（多次实测 null） | ✅ |

**hub 本身就是可玩盘**，不另开 `/train-tracks-puzzle/play/`。理由见 §4。

---

## 2. 前缀为什么是 `train-tracks-puzzle` 而不是 `tt`

| 依据 | 事实 |
|---|---|
| 站内惯例 | 14 款游戏全是根级关键词 slug：`/akari/` `/binary/` `/hashi/` `/kakuro/` `/kenken/` `/murdoku/` `/meowdoku/` `/nurikabe/` `/slitherlink/` `/star-battle/` `/arrows-puzzle/` `/number-grid-puzzle/` `/cross-math-puzzle/`——`/tt` 会是全站唯一的两字母前缀 |
| SERP 面包屑 | Google 会把路径当面包屑展示：`gridpaw.com › train-tracks-puzzle › solver` 比 `gridpaw.com › tt › solver` 多一次关键词露出（URL 里关键词对排名只是弱信号，别夸大；但这是零成本的正确位置） |
| 机器消费点 1 | galite `server/utils/games-registry.js` 是**前缀匹配 + 最长前缀优先 + 边界字符（`/ - ?` 或结束）**，`/tt` 会变成一条要永远记住的别名债 |
| 机器消费点 2 | `src/components/SideAd.astro` 的 `PLAY_SURFACES` / `PLAY_PREFIXES` 按路径白名单判广告档位，同样吃 slug |
| 字面一致 | 主查询是 `train track puzzle`（单数 track），slug 用 `train-tracks-puzzle`（复数 tracks）不影响匹配（Google 归一），但 `puzzle` 必须在 slug 里 |

深度层级不是新发明：`/akari/solver/` `/hashi/solver/` `/nonogram/solver/` `/kenken/solver/` 已在跑，`/akari/how-to-solve/` 同级并列页也有先例。

---

## 3. 需求侧（2026-11-19 读数，web.cafe kwv，5 积分，`fromCache=true` 仍是 09 月桶）

| 词 | 09 月 | 12 个月曲线 | 竞争 | CPC | 判定 |
|---|---|---|---|---|---|
| train track puzzle | **5,400** | 70→90→210→170→140→110→170→260→880→3,600→4,400→5,400 单边 | LOW(2)，KD 29.8 | $2.82 | 唯一主目标词 |
| train tracks puzzle | **1,900** | 140→…→1,300→1,900 单边 | LOW(3) | $1.66 | 独立桶（曲线与上条不同，可相加）→ 族 ≈7,300 |
| train track puzzle online | 320 | 0→…→210→320 | LOW(1) | $3.32 | play 意图，同页可吃 |
| train track puzzle solver | **10** | 12 个月横盘 0-30 | — | — | 无需求 |

**结论：四件里只有一件有量。** 三个工具页是留存/差异化件，不是流量件——它们的成败判据不该用曝光。

（10 月桶未出，`train track puzzle` 是否续爬未知。重开/加码判据沿用 11-14 那三条 + 新增竞品 visits 非 0。）

---

## 4. 为什么砍掉独立的 walkthrough 页

1. **需求为零**：`walkthrough` / `hints` / `answers` / `print` 族多轮实测（11-12 / 11-16 各一次真新读）全 null；solver 族 10/月且 12 个月不动。
2. **竞品反证**：`traintrackspuzzle.com` 45 天铺完 **388 个 URL**（daily 240 + 18 篇 guides × 4 语 + solver + printable），DR 0.4、月访问 **0**（三个独立口径：web.cafe / TabAPI / 11-13 SERP 主词前十未进）。
3. **索引预算已紧**：gridpaw 现存 475 个 URL（451 进 registry），R&E L1–L13 卡在 Discovered-not-indexed（11-25 观察点），akari 69 页 12-05 才处置。此时再塞零需求页进 sitemap 是负资产。
4. **承诺错配的判例**：`/the-loop-puzzle/` 排到 pos 6.82、28d 4,519 曝光，CTR **0.22%**——排上了没人点，因为标题写 How to Play、搜的人是要去玩。`walkthrough` 承诺的是「逐关答案」，而 Train Tracks 是随机/每日生成，没有关卡，承诺兑现不了。
5. **它和 solver 是一件事**：要的「可交互分步推理」= solver 的输出。合成一页反而正好踩竞品唯一没守住的地方（对手 solver 上限 9×9，且自己写在页面上承认大盘解不了）。

**若日后确有需求单独开 URL，页名只能是 `/train-tracks-puzzle/how-to-solve/`**（沿 `/akari/how-to-solve/` 先例），永远不叫 walkthrough。

---

## 5. hub = 可玩盘（不是「入口页」）

- 这族的量全是 play 意图（online 词在爬、solver 词是平的）→ 想玩的人落到一个没有棋盘的解释页就会弹走。
- 拆 hub + play 两页 = 两个 URL 抢同一个主词。站内互食是实测问题：28d **51 个 query / 10,011 曝光 = 13%** 总量。
- 站内正面模型：`/meowdoku/` 把 play 放 hub，pos 一路 19.5→9.6；`/akari/` 那种 hub/play 拆法在 play 意图上没吃到同样的位次。

---

## 6. 上线同批改动清单（谁在哪一行）

| 件 | 位置 | 内容 | 时机 |
|---|---|---|---|
| games registry | `galite/server/utils/games-registry.js` | 加 `{ slug: 'train-tracks-puzzle', label: 'Train Tracks', kind: GAME, prefixes: ['/train-tracks-puzzle'] }` | **与首批页面同批**——提前加会出「registry 死条目」告警 |
| 广告档位 | `gridpaw/src/components/SideAd.astro` | `PLAY_SURFACES` 加 `'/train-tracks-puzzle'`、`'/train-tracks-puzzle/solver'`（去尾斜杠比较） | 页面同批 |
| 打印样式 | gridpaw 无任何 `@media print`（全站唯一在 `sites/puzzle-tips/src/pages/printable/index.astro:303`） | printable 页必须自己带 print.css，且要隐藏 gridpaw 的广告壳：`.gp-side-ad` / sticky / 第二信息流 / header / footer / nav | printable 落地时 |
| sitemap / IndexNow | 自动收 + 部署后增量推 | 3 个新 URL | 发布时 |
| GSC | **不新建 property** | `sc-domain:gridpaw.com` 天然覆盖子路径 | — |
| ops-console | 站牌 `ttp` 已撤（2026-11-19，现 2 个站） | 后续按 gridpaw 的游戏簇统计（galite `get_games_breakdown`）；判据写死在 README 铁律 6 | ✅ 已完成 |

**明确不做**：daily（要按日期确定性生成 + 365 天排期，成本最高、SEO 收益 0）· 排行榜/账号（第一版不做）· 在 `tips.gridpaw.com` 重复建 train tracks guides（同一 sc-domain、两个 host 互食）。

---

## 7. 差异化（对竞品的三个缺口）

1. **solver 支持 10×12**：对手自己写「largest Connect Tracks boards are out of range」，上限 9×9。
2. **分步推导**：对手 solver 只给结果，给不了「下一步为什么」。
3. **printable 在 apex**：对手有，但挂在 40 天零流量的新域上；我们挂 GSC 28d 均位 4.8 的域。

---

## 8. 判据（上线后 28 天）

| 件 | 判据 | 不达标处置 |
|---|---|---|
| 主盘 | `train track(s) puzzle` 族出曝光 >0（现在 0 行）且进前 20 | 查索引/内链，不急着加内容 |
| solver | 看使用（solver 提交次数）不看曝光 | 无使用 = 入口不显眼，改 CTA |
| printable | 看 PDF 下载/打印事件（无则至少看页面停留） | 同上 |
| 全线 | 不引互食：`/train-tracks-puzzle/` 与 `tips.gridpaw.com` 不出现同 query 双页 | 合并或 301 |
