# meowdoku.org 引荐域结构判定（2026-10-12，3ue/Ahrefs 实抓）

**用途**：gridpaw 内页攻略战（STATUS.md §八）外链打法参照。直接对手 = /meowdoku-guide/ 页所打词族的品牌站。

## 抓取范围与配额

- refdomains 101 域（DR 降序）+ best-by-links 全量 4 页 + backlinks 头部 101 行（DR 降序）
- 配额消耗：~20%（67%→83%，backlinks 页 ~16%/百行 比 refdomains 贵一倍）
- 原始数据：`meowdoku.org-refdomains-p1.json` / `meowdoku.org-best-by-links.json` / `meowdoku.org-backlinks-p1.json`

## 核心结构

| 事实 | 数字 |
|---|---|
| DR39 由 101 引荐域构成 | 头部：sakura.ne.jp(DR92) / gitlab.io(89) / 6 个 edu(74-87) |
| 外链落点 | **100% 首页**（www 根 939 反链+92 引荐域；子页 /play 仅 32 反链 1 域） |
| 头部 101 行链接形态分类 | blog-comment **36** / spam 类 33 / other 26 / edu 其他 4 / trac-ticket 1 |

## edu 链真身（本次「再查」的答案）

逐一看了 DR74-87 的 6 个 edu 域的 linking page：

| 域 | 真身 | 属性 |
|---|---|---|
| fsu.edu (87) | 数字图书馆展品页（Splatoon amiibo）里的链接 | **NOFOLLOW** |
| bc.edu (86) | WordPress 博客文章评论区（"I've been digging into logic puzzles lately…"） | **NOFOLLOW UGC** |
| american.edu (84) | WRTG 课程博客评论区（同款话术） | **NOFOLLOW UGC** |
| williams.edu (80) | 课程博客评论区 ×4（同一话术模板刷多帖） | NOFOLLOW UGC |
| uco.es (77) | Trac 工单评论里塞 `<a href>` | NOFOLLOW UGC |
| ateneo.edu (74) | IP Office 新闻帖评论区 | UGC |

**锚文本全部是 "Meowdoku Game Guide"**，话术模板统一（"breaks down the cat-themed rules clearly" / "video walkthroughs saved me" 变体轮换）——**这就是一条规模化博客评论外链流水线**，不是自然 editorial。sakura.ne.jp 那条 DR92 是 2006 年的日文老博客，"posted by Meowdoku"，疑似自建/自评。keenthemes（DR78 技术博客）同样是评论区。

## 结论（回填 gridpaw 作战地图）

1. **竞品 DR39 = 评论外链 + 首页集中**，无一条付费 guest post 痕迹，无一个内页被直接喂链
2. **gridpaw 不给内页买/建外链**；5 页攻略页权重走内链体系（hub 互链 + 首页入口）
3. **若做外链：打 gridpaw.com 首页**，载体用现成 blog-comment 管线（skill backlink-queue-processor）——与竞品同款打法且我们已有基建；评论锚文本纪律：品牌词 "GridPaw"（对齐竞品 "Meowdoku Game Guide" 模式），话术每条手写不套模板
4. **优先级**：不急。meowdoku 用 5 个月堆出 DR39，我们 5 页词盘（KD 11.6-53.8）里只有 walkthrough 一个旗舰位真缺链接预算（10-20 引用域）——10-17 复查确认卡住后，先跑内链，再考虑评论管线给首页供血
