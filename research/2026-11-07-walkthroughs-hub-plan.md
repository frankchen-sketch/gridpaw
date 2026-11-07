# GridPaw 定位切换：游戏站 → 攻略站（方案，未执行）

> 2026-11-07 法老拍板"entity 不做游戏网站了，就做攻略站"。
> 本文是改造方案，**不动代码**，等法老点头再排期。

## 1. 现状盘点（先看事实，别凭印象）

| 类别 | 页数 | 说明 |
|---|---|---|
| BP3 关卡页 | 54 | `/brain-puzzle-3-level-N/` |
| Rooms & Exits | 12 | 1 hub + 11 关（进行中，目标 11 关全 full） |
| The Loop | 3 | hints / answers / past-answers |
| Meowdoku | 3 | 主页 + guide + levels |
| 独立攻略单页 | ~5 | arrows-puzzle-walkthrough / block-blast-hints / brain-puzzle-3-answers 等 |
| **攻略类合计** | **~77** | |
| 游戏页 | 47 | Shikaku 首页 + 11 引擎游戏 + pictomino/crazy-cleanup/meowdoku 等 |
| 内容页 | ~78 | brain-teasers / logic-puzzle-grid / japanese-logic-puzzles / 多语种等 |
| 总计 | 202 | |

**关键事实（STATUS 2026-10-26）**：扩量窗口内 **BP3 关卡页 3256 pv 占全站 71%**。
也就是说——**流量早就是攻略站的流量结构了**，游戏页不是流量引擎。

所以这次"定位转向"不是掉头，是**承认既成事实**：站点靠攻略页吃饭，首页却还是个 Shikaku 游戏。这是全站最大的表里不一。

## 2. 三个可选路线

| 方案 | 做法 | 风险 | 我的判断 |
|---|---|---|---|
| A. 只做内容，不改结构 | 继续铺攻略页，首页/导航不动 | 主题信号继续分裂，Google 认为站点"什么都做" | 最小代价，但等于不转型 |
| B. 首页保留 + 建攻略总 hub（推荐） | 新建 `/walkthroughs/` 作为攻略总入口，导航一级项指向它；首页 Shikaku 不动 | 低——不碰唯一有排名的页面 | **推荐** |
| C. 首页换成攻略 hub | Shikaku 移去 `/shikaku/` | **高**——首页现在是 `shikaku` 词 pos 6-10 的排名页，换掉=自毁 | 不建议，除非 GSC 证明首页流量已可忽略 |

## 3. 推荐方案 B 的具体改造

### 3.1 新建 `/walkthroughs/`（总 hub）

- **title**：`Game Walkthroughs & Puzzle Answers`（避免和现有 `/brain-puzzle-3-answers/` 抢词）
- 结构：按游戏分区，每区列出该游戏全部关卡页（BP3 54 / R&E 11 / The Loop / Meowdoku / 其他单页）
- schema：`CollectionPage` + `ItemList`（**不伪造** aggregateRating 之类）
- 每张卡：游戏名 + 关卡名 + 一句"这页给你什么"（不是"点击查看"的废话）
- 内链：每个关卡页底部加"← 回到 X 全部关卡"，反向喂权重

### 3.2 导航

现状：header 里 `Walkthroughs` 已经收进 `Guides` 下拉（2026-11-04 方案 B）。
改造后：**把 `Walkthroughs` 提为一级项**，指向 `/walkthroughs/`；`Guides` 保留内容页。

### 3.3 首页只加一块，不换主体

首页 Shikaku 棋盘下加一条 `Looking for walkthroughs? 77 guides →` 的横条。
作用：把首页现有的排名权重导向攻略 hub，同时不动棋盘（棋盘是留存和品牌）。

### 3.4 游戏页处理

**不删、不降级**，只在游戏页底部加一句"卡住了？看攻略"。理由：
- 游戏页有品牌价值和内链
- 但不再新增游戏（这是定位转向的真正含义）

### 3.5 明确不再做的事

- 不再新增引擎游戏（11 款够了，维护成本高、没有流量回报）
- 不再做"游戏站"角度的关键词（"play X online" 这类词让给竞品）
- 新内容一律是攻略/答案/hints 形态

## 4. 排期建议（在 L5-L11 铺完之后）

| 步骤 | 内容 | 预估 |
|---|---|---|
| 1 | 盘点 77 个攻略页，建索引 JSON（slug / 游戏 / 关卡 / 是否 full） | 0.5 天 |
| 2 | `/walkthroughs/` 页面 + schema | 1 天 |
| 3 | 77 页加"回到全部关卡"内链（脚本批量，注意别破坏正文） | 0.5 天 |
| 4 | 导航一级项 + 首页横条 | 0.5 天 |
| 5 | build + 逐页 200 + 截图验收 → 部署（需法老批） | 0.5 天 |
| 6 | GSC 提交 + 4 周后看"walkthrough"族曝光 | — |

## 5. 验收标准

- `/walkthroughs/` 收录全部 ≥77 个攻略页，**零 404**
- 每页内链回 hub，hub 内链到页，双向可达
- 导航一级项点击到达 hub
- build 页数 = 原页数 + 1
- GSC 4 周：`walkthrough` / `answers` / `hints` 族曝光是否上升

## 6. 待法老决策

1. 走 **A / B / C** 哪条？（我推荐 B）
2. 导航一级项现在改，还是等攻略页到 100+ 再改？
3. 游戏页底部"看攻略"横条要不要现在就加？
