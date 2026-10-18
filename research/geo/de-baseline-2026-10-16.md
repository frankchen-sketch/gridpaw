# GEO 基线:德语页(/de/ + /de/shikaku/)— 2026-10-16

> 背景:德语页 2026-10-15 上线(站龄 1 天),GSC 曝光 0。本基线按 skill `seo-geo-ai-referral` 流程执行:Google suggest 挖意图 → SERP 观察 → Duck.ai(GPT-6 Luna + Web Search)真实问 4 条。
> Query 集固定,后续周测 diff「gridpaw 是否出现」这一布尔值即为 GEO 结果指标。

## Query 集(固定)

| # | 意图 | Query | 检索词(AI 实际用) |
|---|---|---|---|
| Q1 | 工具 | Welche kostenlosen Logikrätsel-Seiten kannst du empfehlen? … ohne Anmeldung | kostenlose Logikrätsel online ohne Anmeldung |
| Q2 | 工具 | Shikaku online spielen kostenlos – auf welchen Seiten geht das gut? | Shikaku online kostenlos ohne Anmeldung Browser spielen |
| Q3 | 科普 | Was sind japanische Logikrätsel? Und welche Arten gibt es? | japanische Logikrätsel Arten Nonogramm Sudoku Kakuro |
| Q4 | How-to | Wie löst man ein Shikaku-Rätsel? Regeln + einfache Strategie | Shikaku puzzle rules strategy rectangles numbers |

## 结果:GridPaw 0/4(基线,预期内)

- **Q1**:引 janko.at / ratehase.de / 50plus.de / geo.de —— 与 SERP top 完全一致,AI 引荐≈SERP 代理。
- **Q2**:引 de.puzzle-shikaku.com / solitaire.org / shikaku.ch / shikakuofthe.day。**AI 原话:「Für viele Rätsel und deutsche Anleitung würde ich mit Puzzle-Shikaku anfangen」——德语界面是显式排序依据。** /de/shikaku/ 恰好占同一生态位(德语界面+免费+无注册)。
- **Q3**:模型直接自答,只引 conceptispuzzles.com / kakuroconquest.com 两个弱源 → **科普意图自答风险确认,GEO 价值低**。
- **Q4**:规则+策略基本自答(Wikipedia + puzzle-magazine.com),但 shikaku.ch 的英文策略页被列入 Read More → 攻略型页面有被引可能。

## SERP 观察(web_search,2026-10-16)

- 大词「Logikrätsel online kostenlos ohne Anmeldung」:德语媒体品牌垄断(ZEIT / GEO / 50plus / janko.at / ratehase / boomer.at)。母语品牌+站龄+外链差距,短期不打。
- 利基「Shikaku online spielen kostenlos」:shikakuofthe.day #1、de.puzzle-shikaku.com #2、gridgames.app、shikaku.ch、WELT.de(Flächenfieber,#7)。**WELT 证明德语内容在此词可排**;前 9 多为独立小站,竞争强度远低于大词。`/de/shikaku/` 已在正确战场。

## 意图数据(Google suggest hl=de gl=de 实测)

1. 主轴:「logikrätsel **erwachsene**」+「online **kostenlos**」——成人+免费。
2. 强修饰:「**mit Lösung**」(含 mit Lösung pdf)——德语用户要答案/解析;与站内 hint「直接给答案」哲学天然对齐。
3. 「**ohne Anmeldung**」高频——正是 gridpaw 的事实卖点,TDK 已覆盖。
4. 银发群体:「online denkspiele kostenlos **50 plus**」(50plus.de 靠它排第 2)。
5. 污染词:「shikaku」联想被 Naruto 角色占半壁(shikaku nara/anime),真实谜题词面是「shikaku rätsel」/「shikaku online」。
6. 「japanische logikrätsel」联想几乎只有 nonogramme——用户心智日本谜题≈数织/数独,/de/ hub 想吃此词需带 nonogramme 内容钩子(站内已有 Nonogram)。

## TDK 词面核对

`/de/shikaku/` title「Shikaku online spielen – kostenloses Logikrätsel」+ description 含「kostenlos / ohne Anmeldung」——AI 实际检索组合的全部词面已覆盖,无需改。

## 结论与行动

1. **基线 0/4,固化周测**(同 query 集;Duck.ai 通道:Playwright channel:'chrome' 有头模式,headless 会被骨架屏卡死——daemon 脚本 `/tmp` 不持久,重写见本文件上方历史或 skill 引用)。
2. 短期唯一可打位:**Shikaku 利基词**(de/shikaku 就位);大词等站龄+外链。
3. 内容缺口(按意图优先级):①「mit Lösung」每题可展开解析;②50plus 文案钩子;③nonogramme 关联内链。
4. 科普/How-to 意图 AI 引荐价值低(自答风险),德语内容投入向工具词词面对齐倾斜。
