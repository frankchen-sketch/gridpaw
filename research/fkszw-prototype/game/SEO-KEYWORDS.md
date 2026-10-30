# Crazy Cleanup（疯狂收杂物 web 版）— 关键词作战表

> 数据快照 2026-10-30 · 双源核验：**真 KWP**（Google Ads 关键字规划师，ego 实测，地点=美国，2025-10~2026-09）+ webcafe `keyword_volume` 交叉验证（**14/14 词全对上**）。
> 立项调研 2026-10-25（skill `wechat-minigame-recon`）；KD=webcafe 快照预筛分（0-100，<20 极易 / 20-39 容易）。

## 主攻词（首页 TDK）

| 词 | 月均 | 3月变化 | 年同比 | KD | 打法 |
|---|---|---|---|---|---|
| **sorting games** | **4,400** | **+23%** ↑ | +23% | 21 | 主词：首页 title/H1 核心 |
| **organizing games** | **3,600** | **+24%** ↑ | 0% | 0 | 副词：desc/正文。`organization games` 被 KWP 合并进本词（输入 14 词出 13 行=合并实锤），两种拼写都织、不重复计数 |

## 品牌词族（合法承接，必须明示口径）

| 词 | 月均 | 3月变化 | KD | 纪律 |
|---|---|---|---|---|
| goods sort | 1,900 | **+85%** ↑↑ | 8 | 原版品类品牌词（武汉汇多 2023-03 出海产品，注册商标+KG 实体）。页面必须写明 "Goods Sort style / inspired"，**不冒充官方**。三月 +85% 回升猛，承接价值升 |
| goods sort online | 40 | -33%（年 -60%） | 9 | 持续下行，织入不建专页 |

**品类化实证（2026-10-30 SERP）**：mavagames.com、gamezylo.com、bubbleshooter.net 全用 "Goods Sort" 名字挂**可玩版+how-to-play 内容**（bubbleshooter 注明 "also known as Sorting Items by Shelves"）——品牌词已被当品类词用，承接页正面打法=可玩版+指南内容一体，同赛道门户全这么干。2026 品类顺风：杂交休闲趋势报告称 sorting 赛道 Voodoo/Rollic 集中进场（"Sorting Goes Crazy"）。

## 变体长尾（织入正文/FAQ，不单独建页）

| 词 | 月均 | 3月变化 | 年同比 | KD | 备注 |
|---|---|---|---|---|---|
| **sorting games online** | **880** | **+69%** ↑ | +39% | 8 | web 意图变体全面上行，优先织 |
| organizing games online | 720 | 0% | **-33%** ↓ | 0 | 量大但年同比下行，织入即可 |
| tidy games | 320 | -19% | -19% | 6 | 小幅下行 |
| sorting games free | 140 | **+100%** ↑ | 0% | — | |
| sorting puzzle games | 110 | 0% | 0% | 3 | 页首出价 $3.11-8.38 全表最高=商业意图强 |
| declutter games | 70 | 0% | 0% | 0 | |

## 无量词（占位/不建页）

- `crazy cleanup` — KWP 显示 —（自有品牌词，等流量反哺，首页 title 保留占位）
- `item sorting games` / `goods sort online free` — 无量

## answer/hint 层：**不开**（2026-10-30 KWP 判死）

| 词 | KWP 结果 |
|---|---|
| goods sort answers / guide / walkthrough / tips / levels / how many levels / level answers / how to play goods sort / sorting games tips / sorting games guide | **全部 null** |
| goods sort level 47 | 10（2026-04 起连续归零） |
| goods sort level 12 | null |

**判决与依据**：
1. KWP 无量——对照 BP3 立项门槛（GSC 60 词/166 imp 才动工），这里连 SERP 信号都没有。
2. 排名前面的门户页（mava/gamezylo/bubbleshooter）全是 play+how-to-play 内容，不是 answers——需求形态本身不支持独立答案页。
3. Playbook 铁律：逐关词海=每页 1.65 访问/月的低价值词海+scaled-content 风险（mobilepuzzlehelp 教训）。
4. 例外：chaptercheats 有 "Goods Sort Master 3D" level 40 卡关 Q&A——但那是**另一款**同名家族游戏，且以社区问答形态存在，非可承接的搜索词。

**触发器（Rotate Rings 纪律）**：上线后 GSC 盯 `level (\d+)` 修饰词窗口——周曝光 ≥10 且无对应页才建；届时 BP3 的 walkthrough 管线（81 关原版数据在手）随时可复用。此前不铺任何 level 页。

**替代动作**：81 关真实数据（主题/物件/桶序，APK 解包所得）做进**一个** Goods Sort style 承接页内的 level 索引表——差异化真数据，不开词海薄页。

## SERP 结论（2026-10-25 实测，treg）

平台位 4-5（App Store/Google Play/YouTube）+ web 门户 2 = **有空位**；Yandex Games 同品类 2-3 万评价 = web 承接已验证。品牌词 SERP 有 Knowledge Graph 占位，正面打不动，走 "style" 承接。

## 落地清单（正式部署时）

- [x] index（/crazy-cleanup/）title 织入 `sorting games`（主词）+ `organizing games` —— 2026-10-30 已落，title="Sorting Games Online — Play Crazy Cleanup Free | GridPaw"
- [x] desc 织入 `organizing games online` + `sorting games online` + goods sort style —— 已落（143 字符）
- [x] 正文/FAQ 织入 `tidy games`、`sorting puzzle games`、`organization games` 拼写变体 —— Tips 段已织 tidy games/organization；FAQPage JSON-LD 4 问与可见 FAQ 逐字同步
- [x] 游戏页内织 How to Play / Tips 段（对标 mava/gamezylo 门户模式，非独立答案页）—— 2026-10-30 index.astro 已建
- [x] 品牌口径：fan-note 免责块上线（"Goods Sort" trademark 声明 + not affiliated）；FAQ 第 2 问明示 fan-made
- [x] 站内集成（2026-10-30）：GameSwitcher/GameNav games 数组 + GameHub tile（isNew=NEW 角标 + badgeGame 卡角）+ badge 3 枚（cc-N 命名空间派生）+ leaderboard API 白名单与页面 + win 时 level_up 打点与成绩提交（gp-track.js + gpAnonId 同构）
- [ ] 上线后 GSC 盯 `level (\d+)` 窗口（≥10 imp/周才建 level 页）
- [x] GA4 打点挂 `game_share` 事件（模板已留，ending.js 三钮）
