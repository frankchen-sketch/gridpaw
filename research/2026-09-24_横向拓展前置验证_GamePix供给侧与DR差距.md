# 横向拓展前置验证 · 补充实测（GamePix 供给侧 + DR/流量差距）

> 2026-09-24。承接 0923 作战地图 P0-1 前置验证，本轮把「下一轮做」的 A 项（GamePix 清单 + DR/流量差距）实测完毕。数据口径：⚡ TabAPI（SimilarWeb 同源 / Ahrefs 同源 DR，与哥飞引用的 Ahrefs 绝对数可能差 30-50%，对口径时先说明）。

## 一句话结论

**横向拓展继续成立，但 GamePix 的供给比作战地图预估的更薄**：kakuro/nonogram 各只有 1-2 款，slitherlink/hashi 完全没有；且 gamepix.com 前台页面被 Cloudflare 挡着不能直嵌，正规路必须走 partners.gamepix.com publisher 后台。DR 差距的本质不是反链数量而是质量——gridpaw 引荐域 760 个已经追平第 6 位的 727 个，但 DR 2.5 vs 20。

## GamePix 供给侧实测（ego-browser 实抓，非搜索转述）

| 游戏(slug) | 状态 | 证据 |
|---|---|---|
| Puzzler Kakuro (`/play/puzzler-kakuro`) | ✅ 在 | 标题「Puzzler Kakuro 🕹️ Play Now on GamePix」 |
| Classic Nonogram (`/play/classic-nonogram`) | ✅ 在 | 同上 |
| Nonogram Jigsaw (`/play/nonogram-jigsaw`) | ✅ 在 | 且出现在 puzzle 分类前 120 |
| slitherlink / hashi / bridges / kakuro / nonogram 裸 slug | ❌ 全 404 | 直连 /play/ 逐个验证 |
| light-up / akari | ❌ 未找到 | 分类+slug 均无（Google 验证页干扰，置信中） |

分类面观察：
- `/t/puzzle` 前 120 款 80% 是 2048 / match-3 / mahjong / water-sort 系休闲货，日式逻辑谜题家族在 GamePix 是**边角料**——这说明靠 GamePix 供给 kakuro+nonogram 各一款够起步，但做不出「家族」纵深。要 slitherlink/hashi 得另找源（GameDistribution 或 itch.io，未验）。
- ⚠️ **嵌入走正规渠道**：gamepix.com 前台被 Cloudflare 人机验证挡（curl 403 + 浏览器 Turnstile），前台页面也没有公开 iframe src。正规路 = 注册 `partners.gamepix.com` publisher 账号，后台拿 embed 代码（与哥飞口径一致）。**直嵌前台 URL 是野路子且技术上就过不去**，作战地图里「英文 slug 待核」一项已核完。

## DR / 流量差距（⚡ TabAPI，2026-09-24）

| 域名 | DR | 反链 | 引荐域 | dofollow% | 月访问(8月) | 行为 |
|---|---|---|---|---|---|---|
| **gridpaw.com（我们）** | **2.5** | 1,315 | **760** | 41% | <SimilarWeb 测量下限，显示 0 | — |
| kakuro-online.com（kakuro 第 6） | 20 | 857 | 727 | 49% | 24,654 | 跳出 79% / 人均 1.13 页 / 23 秒 |
| onlinenonograms.com（nonogram 第 3） | 10 | 23,728 | 818 | 98% | 9.1 万（报告口径） | 跳出 35% / 人均 5.1 页 |
| pixelogic.app（nonogram 第 7） | 29 | 1,612 | 645 | 65% | 3.8 万（报告口径） | 行为垫底 |

三个读数：

1. **反链数量早就够了，质量不行**。gridpaw 760 引荐域 ≥ kakuro-online 的 727，但 DR 2.5 vs 20——现有 760 个里几乎全是低价值目录/垃圾链（dofollow 41% 里有水分）。**补 DR 的动作不是加量，是换质**：需要 DR 20+ 的引荐域，哪怕只来 10-20 个。这与 STATUS 里「瓶颈在 DR 外链」的判断完全一致，且给出了量化版本。
2. **kakuro-online.com 在衰退**：流量 6 月 9,498 → 7 月 31,633 → 8 月 24,654（⚡TabAPI，7 月峰值可能是季节性或促销），行为指标全站垫底。第 6 位不是铁打的，是「弱守门员」。
3. **onlinenonograms 模式被验证两次**：DR 10、引荐域 818 但 dofollow 98%（量大质低照样上榜）+ 行为数据顶级 → 排名确实是行为驱动。GridPaw 的留存设计（每日挑战/无广告/猫动效）路线已被这个活样本背书。

## GameDistribution 供给侧实测（2026-09-24 追加，ego-browser 实抓）

| 品类 | 状态 | 备注 |
|---|---|---|
| Nonogram (`/games/nonogram/`) + Classic Nonogram (`/games/classic-nonogram/`) | ✅ 真·数织（picture logic / 涂格），带公开 embed iframe | 4 款 nonogram 库存（两家合计） |
| Futoshiki (`/games/futoshiki/`) | ✅ 真·日本数字谜题 | GamePix 没有，GD 独有 |
| Light Up (`/games/light-up/`) | ⚠️ **同名不同货**：FG Studio 出的连线游戏（"connect all the paths"），**不是 Akari 点灯**，不可用于 akari 词族 | 核验过页面描述 |
| kakuro / slitherlink / hashi（含 13 个 slug 变体逐一探测） | ❌ 全 404 | 两家平台都没有 |

**embed 域名锁实测（关键）**：把 GD 游戏页公开的 embed iframe URL 直开、referrer 换成 `gridpaw.com` → 重定向到 `blocked.html?...unregistered=true`，页面显示「LIGHT UP IS NOT AVAILABLE HERE」。**公开 embed 代码不是免注册通道——域名白名单锁死，必须注册 publisher 账号并把 gridpaw.com 加白后才能跑**。GamePix 前台另有 Cloudflare 人机验证，直嵌同样没戏。

### 两平台合计的供给结论

| 品类 | 供给 | 评价 |
|---|---|---|
| nonogram | 4 款 | 足够挑 |
| futoshiki | 1 款 | 可用，长尾词弱 |
| kakuro | 1 款（仅 GamePix） | 勉强够起步 |
| slitherlink / hashi / 真 akari | **0 款** | 两平台都没有；itch.io 是下一个候选（未验），或自研（gridpaw 已有两个自研引擎，Akari 本来就是自研的——真 akari 词族反而该吃自家引擎，不需要外部供给） |

## 关账项

- **P0-2 首页渲染核验**：✅（作战地图已结案）
- **P0-3 Game Over 降级**：✅ 本轮源码实锤 `src/pages/index.astro:703` 是 `<div class="game-over-title">`，非 h2；且 STATUS §五 早已记录「Game Over 弹窗 h2 → div」。**作战地图里「不能判定已修」是过时账，关闭。**
- **GamePix 英文 slug 待核**：✅ `puzzler-kakuro` / `classic-nonogram` / `nonogram-jigsaw`。

## 更新后的 P0 待办

1. **法老注册 GamePix（partners.gamepix.com）+ GameDistribution publisher 账号**（免费）→ 后台拿 embed 代码并加白 gridpaw.com（已实测域名锁，不加白跑不起来）。slitherlink/hashi 两平台都确认没有，不用再找
2. **拿 embed 后定游戏页形态**：kakuro/nonogram 是各起一页（对标 kakuro-online.com 行为差距），还是先进现有 japanese-logic-puzzles 页做嵌入测试——建议先小后大，确认 Google 收录+行为数据后再立项
3. 外链侧：目标从「加量」改为「换质」，引荐域 DR 20+ 的渠道（对应 P1 转外链项目）

## 等拍板

- 首页空排行榜 A/B（推荐 A：空态隐藏，换 Today's Challenge 预览卡）——作战地图挂了三轮了
