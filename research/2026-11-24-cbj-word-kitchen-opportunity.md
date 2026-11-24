# Color Block Jam / Word Kitchen 布局调研（2026-11-24）

> 法老指令：可以开始布局 Color Block Jam level 4xx、Word Kitchen answers，先做调研。
> 花销：webcafe 14 积分（volume 5 + KD 2×2 + 缓存复用）、TabAPI 4 次 SERP；余额 8,573。

## 结论先说

> **2026-11-24 法老裁决（终）**：CBJ 整条线关闭，连 solver 页都不做。Word Kitchen 走 B（视频读盘面）+ C（求解器），不做解包。
> **解包结论**：关卡数据不在 APK 里（Unity IL2CPP，assets 里只有广告埋点，最大 MonoBehaviour 是字体图集，`Bebinca/Malicoco` 零命中）；真正位置是 Firebase RC 指向的 `games.justplayapi.com`（Spring，凭据加密，端点全 404）。这条路线到此为止。

| 游戏 | 该不该做 | 怎么做 | 预期 |
|---|---|---|---|
| **Word Kitchen** | ✅ **先做** | 视频读盘面 → 包 hub + 关页 + 字母求解器（solver 已上线） | 头词 4,400-6,600/月、KD 50、对手最弱 DR 27 → 首年 1-2 万点击/月量级可期 |
| **Color Block Jam** | ❌ **不做**（11-24 关闭） | — | level 词一年掉 80-98%、品牌 4,400→2,900，solver 仅 480/月，1 页收益不抵维护 |

## 一、Word Kitchen（Gimica GmbH，`com.gimica.wordkitchen`）

### 需求侧
- `word kitchen answers`：**4,400/月**（12 月均值），逐月 1,900（2026-02）→ **6,600（2026-05/08 峰值）→ 5,400（10 月）**，明显上升期；Google Ads 竞争度 LOW
- 结构性长尾：**6 个世界 × 30 个食谱包 × 每包 18 关 = 534 关**，每关只认「包名 + 关号」（游戏内没有全局关号），所以长尾是 `word kitchen <包名> answers` / `<包名> level N`，30 个包各 18 条
- 全量答案数：**2,852 个必答 + 914 个奖励词**，372 关带奖励词

### 竞争盘面（实测 KD 49.8 / 中）
| # | 站点 | DR | 打法 | 弱点 |
|---|---|---|---|---|
| 1 | gameanswers.net | **27** | 每关一页，页面只列字母+答案，无解释 | 最弱占位者，难度贡献仅 26.6 |
| 2 | YouTube | 99 | 每包一个视频 | 不可争 |
| 4-5 | YouTube ×3 | 99 | 同上 | 前十实际只有 1-2 个可争位 |
| 6 | puzzlegamemaster | 高 | 单页塞全部答案，表格 | 单页太厚、移动端难用 |
| 2 | solvewizard.com | 新站 | **534 关逐页 + 明确写「答案读自游戏本体数据」** | 值得抄的作业：数据从游戏来，不从人抄 |
| 8 | trickystorywalkthrough | DR 0 | 单页收口 | 已经第 8，说明这词它也在打 |

- 哥飞 KD 判断原话：「前 5 全部是内页，存在外链弱的内容页占位（第 1 名 gameanswers DR27）——没人押首页经营这个词，用专业内容页有结构性进入机会」

### 数据从哪来（关键）
游戏是 anagram：每关给一盘字母（= 一个关键词打乱），要求拼出该词 + 其子词。所以**每关的字母盘就是唯一的数据源**。
- ✅ 正路：下 Android 包（apkpure/apkmirror 搜 `com.gimica.wordkitchen`）→ 解包 `assets/` 找关卡 JSON/SQLite → 得到 534 关的字母盘 + 必答/奖励词
- 已知可验证的样本（公开 SERP 里能看到的）：High Gluten Flour L1 字母 `HUBEMBLM`、L2 `DIGNOGDN`…；Secret Spiral L1 = `That/Hat/Tat/At`
- ❌ 不做：整站扒 gameanswers / solvewizard 的答案表（那是抄竞争对手，和 `scripts/bp3/fetch_tt_all.py` 同类风险）

### 站点结构（照 BP3/R&E 的成熟范式）
```
/word-kitchen-answers/                    ← 总 hub（世界树 + 包卡 + 求解器入口 + FAQ）
/word-kitchen-answers/<pack>/             ← 30 个包 hub（该包 18 关答案表 + 字母盘）
/word-kitchen-answers/<pack>/level-<n>/   ← 534 关页（必答/奖励分开 + 字母盘图 + 上一关/下一关）
/word-kitchen-solver/                     ← 工具页：输入字母 → 全部分解（含子词），吃「solver/cheats」意图
```
- 求解器是**我们相对 gameanswers 的真差异**：给字母即时出全部词，不依赖关卡页
- 词表：ENABLE/SCOWL（开源词表），需与游戏实际判词口径对齐（先用游戏数据里的 2,852+914 校准）

### 工作量（可机械化）
- 数据提取 0.5-1 天（成败全在这一步）
- 生成器脚本 0.5 天（564 页同一模板）
- 求解器 0.5 天（字母 → 全词，纯前端，符合我们引擎范式）
- 合计 **2-3 天**出全量，比 BP3 的 55 关还便宜（因为不需要截图/录像）

## 二、Color Block Jam（Rollic Games / Gybe Games，`com.GybeGames.ColorBlockJam`）

### 需求侧
- 品牌词 `color block jam`：4,400/月，但在**下滑**（8,100 → 2,900）
- `color block jam solver`：**480/月，12 个月基本平**（320-720）
- `color block jam answers`：只有 70/月
- `color block jam level 459`：1,600/月（12 月均值），但从 2,900 掉到 320 → **单关量噪声大，别当稳定盘**
- 规模：官方只说「hundreds」，社群实测 **1,859-2,600+ 关**，且**版本更新会重编号**（攻略视频里 "filmed as level 1214"、现叫 537）

### 竞争盘面（实测 KD 70.4 / 困难）
- `answers` / `level 1` 的 SERP：**前 8 全是 YouTube + TikTok + Reddit/Facebook**，一个正经内容站都没有
- 但 KD 模型照样给 70.4——因为要挤掉的是 DR 97-99 的平台页，不是可打败的小站
- `colorblockjams.com` 已经做到 2,611 关逐页、`colorblockjam.org`、`colorblockjamgame.com` 都在做；Reddit 上还有人发了自制 solver

### 判断
- **不做 2,600 关页**：不重编号就无法维护（我们自己 BP3 刚被重编号坑过一次），而且没有录像就写不出解，成本/页是 BP3 的 2 倍
- **做 solver 工具**（1 页）：棋盘输入 → BFS/启发式出解法。吃 `color block jam solver` 480/月（意图极纯、盘面只有 Reddit 一个帖）
- 关页只跟**爆量关**（如 459 这种），一关一页，且必须自己录像，不批量

## 三、执行顺序建议

1. **Word Kitchen**：先解包拿数据（**成败关**）→ 数据拿到就 2 天铺完 564 页；拿不到就退回到「求解器 + 30 包 hub」两层
2. **Color Block Jam**：solver 工具 1 页，等 Word Kitchen 稳定后再动
3. 两条线都**并入现有 cron `509135746bdd` 的同类闸门**（build+verify、只 commit 分支、不部署），不新开一条流水线

## 四、要拍板的三件

1. Word Kitchen 走**解包游戏数据**这条路（灰色但同行都这么干、且是客观数据）——同意我就开工
2. 564 页要不要**一次性上**（一次性 564 页新页面对索引是冲击，BP3 那次 96 页就换来一次小地震）→ 我建议按包分批，每天 2-3 包
3. Color Block Jam 只做 solver，先不做关页——有没有异议
