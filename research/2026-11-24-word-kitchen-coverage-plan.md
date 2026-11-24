# Word Kitchen 全覆盖：数据来源、验证与页型（2026-11-24）

> 触发：法老裁决「BP3 不是残缺，是 SERP 被 tt 抢了；WK **发 + 铺，做全覆盖**，对手内容薄就能打」。
> 本文只解决一件事：**把 18 页扩到全量 ~1,620 页时，每个字母从哪来、怎么证明没读错。**

## 1. 盘子有多大

| 项 | 数 | 来源 |
|---|---|---|
| 包（pack） | **90** | `wordkitchenanswers.com/sitemap.xml` 实测（`pack-<slug>/level-<n>/`，1,705 URL） |
| 每包关数 | 18（个别 19 条 URL = 18 关 + 包页） | 同上 |
| 目标页数 | **~1,620 关页 + 90 包页 + 1 总枢纽** | 计算 |

游戏本体**没有全局关号**（每个甜点包各自 1–18），所以 URL 一律 `pack + level`，不做重编号。

## 2. 字母（托盘）从哪来 —— 两条腿

### 腿 A：自有视频读帧（7 包，权威层）
`Go Answer` 频道每包一条全流程录像，1080p。管线（已脚本化，`scripts/wk/scan_video.py`）：

1. `ffmpeg -ss <t>` 每 12s 抽一帧（不靠场景切分——实测会过切：Bebinca 正好 18 段，Tuna 切出 25 段）
2. 帧里读两样：**顶部标签**（`<Pack> - N`，给关号）+ **锅里托盘字母**
3. **关号以标签为准**，不按段序猜（段序会把广告/结算卡算成关）
4. 每关至少 2 帧读数一致才收
5. 字母过**变位词自检**：必须能拼出 `public/data/wk-words.txt` 里的真词

已用 vision 实测的样本：Bebinca L1–10（PARTY/LAYER/OFFER/MAYBE/MUSIC/DEATH/MAJOR/ALONG/EARTH/PRICE）、
Tuna L2 `DEUMRR`(MURDER)、L9 `ITEVCA`(ACTIVE)、L14 `GNIEEN`(ENGINE)、L18 `TOKPCE`(POCKET)。

### 腿 B：竞品已发布的「Letter Ingredients」（83 包，事实层）
`wordkitchenanswers.com/pack-<p>/level-<n>/` 每页有一行 `Letter Ingredients: P A R T Y`。

**只取这一行（字母序列）+ 标题括号里的 KEY 词**，正文/文案/列表一概不抓、不复用（`scripts/wk/spider_letters.py`）。
理由与边界：

- 字母是**事实**（游戏画面决定的），不是表达；我们的页自己生成词表、自己写文案、自己排版
- 但**来源必须诚实**：页脚写明「字母取自实拍录像」，对腿 B 的包要改成「字母按公开整理核对 + 变位词校验」，**不能写「我们看了录像」**
- 交叉验证：腿 A 的 7 包同时有腿 B 数据 → **同关卡逐一比对**，若 126 关里错 ≤2，则腿 B 可信；错 3 关以上整批停用

## 3. 词表怎么生成（全站统一）

`ENABLE ∩ 词频前 20000`（`hermitdave/FrequencyWords` en_50k），长度 ≥3，去 17 个边角词
（dah/hae/rom/rec/lear/goa/ley/lar/yar/eff/fer/cis/mis/mus/bey/eta/ora）→ `scripts/wk/gen_data.py`
输出 `src/data/word-kitchen-packs.json`（唯一真源，页面只读它）。

## 4. 页型（三层，全部现成模板）

- `/word-kitchen/` 总枢纽：包列表 + 玩法说明 + 为什么别家用"全局关号"是错的
- `/word-kitchen/<pack>/` 包枢纽：18 卡 + FAQ（吃 `<pack> word kitchen` 包名词，如 bebinca 110/月）
- `/word-kitchen/<pack>/level-<n>/` 关页：托盘方块 → 全字母词 → 按长度分组词表 → 机制说明 → solver CTA → FAQ schema

## 5. 风险与闸

| 风险 | 闸 |
|---|---|
| 1,620 页近似模板被判 doorway / thin | 每页有**独占数据**（托盘 + 词表 + 词数/最长词）；标题描述全部程序化唯一；不做"点击查看更多"再跳转 |
| 竞品数据错/过期 | 腿 A 交叉验证；变位词自检；单包错 ≥2 关即标记复核 |
| 包名照抄竞品错字（Crap Soup / Apple Pie Us） | 包名以游戏内标签为准（腿 A 覆盖的包先改），腿 B 包保留竞品名但记 TODO |
| 页面数暴涨影响构建 | 先跑 90 包 build 看时长/页数，再决定是否拆 sitemap |
| AdSense 内容政策 | 这些是**内容页**，允许广告；但若被投诉"低价值重复内容"，先 noindex 最低价值包而不是全站回滚 |

## 6. 执行顺序

1. 7 包（腿 A）先全量上线 → 看 2 周收录/排名
2. 腿 B 83 包数据灌入 → build → 抽样 3 包人工核对 → 上线
3. 上线后 7 天：GSC 收录数、CTR、`word kitchen answers` 头词位置变化
