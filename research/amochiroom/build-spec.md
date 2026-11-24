# /amochiroom/ 建站施工单（Build Spec）

> 状态：**待开工**（本文件只定义结构与契约，不含页面代码）
> 仓库：`/Users/frank/workspace/gridpaw/.worktrees/2026-11-24-room-sort`（分支 `feat/2026-11-24-room-sort`）
> 定位：第三方手游 Amochi Room 的**逐关答案/攻略板块**（与 `/brain-puzzle-3-answers/`、`/rooms-and-exits/`、`/word-kitchen/` 同类）
> 数据现状：`research/amochiroom/unpack/` 为空，**尚无任何关卡数据与素材**。本 spec 的"数据采集"一节写死不许跳过的前置条件。

---

## 0. 结论摘要

| 问题 | 结论 |
|---|---|
| 结构 | **动态路由 `src/pages/amochiroom/[level].astro` + 单一 `src/data/amochiroom-levels.json`**，不逐页写 astro |
| 页面数 | 2 个 astro 文件（hub + 动态关页）+ 1 个 JSON + 1 个生成器，覆盖 N 关 |
| 数据驱动 | `getStaticPaths()` 只吐 `status === 'live'` 的关；hub 卡片也只链 live，杜绝 404 |
| 广告 | 纯文字攻略页**默认不进** `ad-policy.ts`（不登记 = 内容页 = 全档广告）；一旦页内渲染可交互棋盘，必须登记 |
| 导航 | hub 进 `GameNav.astro` 的 `guides` 数组；**不进** `GameSwitcher`（它不是可玩棋盘） |
| 闸门 | `pnpm run build` + `pnpm run verify` + 手工跑 `check-tracked-imports.mjs`、`check-sitemap-noindex.mjs` |
| 最易踩红 | ① 页内 id 含 `board` → play surface 闸门红；② GameSwitcher 与 GameNav 分叉；③ 新组件/JSON 没入 git → 干净检出构建炸 |

---

## 1. 结构选型：为什么是「动态路由 + 单一 JSON」

### 1.1 三份现成先例对照

| 方案 | 先例（文件路径） | 规模代价 | 适用条件 |
|---|---|---|---|
| **A. 一个 JSON + 动态路由**（推荐） | `src/pages/word-kitchen/[pack]/[slug].astro`（229 行）+ `src/data/word-kitchen-bebinca.json`；`src/pages/meowdoku/levels/[level].astro`（131 行）+ `src/data/meowdoku-levels.json` | 2 文件 / N 关 | 每关只有"数据 + 同一套骨架"，文案由数据字段拼装 |
| B. 一个 JSON + hub 用动态路由 | `src/pages/word-kitchen/[pack]/index.astro` | +1 文件 | 多 pack/多章节，URL 需要中间段 |
| C. 逐页 `.astro` | `src/pages/brain-puzzle-3-level-1/` … `-172/`（172 个目录 × 225 行）；`src/pages/rooms-and-exits/chapter-*-level-*/`（每页 233 行） | 170+ 文件，改骨架要改 170 次 | 每关有**高度定制**的叙事/图/时间轴，无法用字段拼出来 |

### 1.2 结论与理由

**选 A。** 理由按优先级：

1. **一致性靠结构保证，不靠人**。`getStaticPaths()` 从 JSON 生成路由 → 页数、hub 卡片数、prev/next 链天然一致。BP3 的 172 个目录已经付过代价：`f1fd9d2` 就是在修「枢纽计数文案与实际 172 页对不上」。
2. **骨架演进成本从 O(N) 降到 O(1)**。BP3 的 FAQ/步骤卡/内链模板是复制出来的，任何模板改动（如 2026-11-18 的 YouTube facade 改造，全站 352 页）都要批量重写。
3. **sitemap 的 lastmod 自动正确**。`scripts/sitemap-lastmod.mjs` 对动态路由走正则匹配，并会取页面 import 的 `src/data/*` 文件提交时间两者较新者（该脚本 §2–§3），所以改一行 JSON = 全部关页 lastmod 更新，不会出现"全站同一时间戳"的假信号。
4. **不加新依赖、不引框架**：`import data from '../../data/amochiroom-levels.json'` 在 Astro/Vite 里原生可用（先例同上）。

**只有一种情况改选 C**：某关需要独立的、无法字段化的叙事结构（例如全套手绘分镜）。届时也只对那一关破例，其余仍走 A。

### 1.3 URL 与文件布局

```
src/pages/amochiroom/
  index.astro            ← hub：全部关卡索引 + 玩法 + FAQ
  [level].astro          ← 单关：/amochiroom/level-1/
src/data/
  amochiroom-levels.json ← 唯一数据源
scripts/amochiroom/
  build-levels.mjs       ← 生成器（recon JSON → src/data/amochiroom-levels.json）
  check-pages.mjs        ← 页面形状闸门（可选，仿 check-sudoku-pages.mjs）
public/amochiroom/
  l1-hero.jpg            ← 素材：hero 与步骤图，宽 1200
  l1-step-1.jpg …
```

**slug 决策规则**（先 recon 再定，别猜）：

- 游戏内只显示全局关号 → 扁平 `/amochiroom/level-N/`（本文默认，`params.level = 'level-N'`）。
- 游戏内显示 `Chapter X Level Y` → 抄 R&E：`/amochiroom/chapter-{c}-level-{n}/`，路由文件相应改为 `[slug].astro`。
- 两种都不要用裸数字 `/amochiroom/1/`：`level` 这个词本身就是搜索词的一部分（对照 meowdoku 用 `/meowdoku/levels/1/`、word-kitchen 用 `/level-1`）。

---

## 2. 数据 JSON schema

文件：`src/data/amochiroom-levels.json`。**一个文件装全站**（与 `rooms-and-exits-levels.json`、`meowdoku-levels.json` 同口径）。超过 ~300KB 再按章节拆分。

```jsonc
{
  "game": "Amochi Room",
  "developer": "<recon 填>",
  "genre": "room tidying / item sorting",
  "hub": {
    "title_short": "Amochi Room",
    "in_game_numbering": "global",        // global | chapter
    "total_levels": 0,                    // 游戏当前关数（recon 确认后填），0 = 未知
    "updated": "2026-11-24",
    "difficulty_scale": ["easy", "medium", "hard"]
  },
  "source": {
    "method": "frame-by-frame from recorded playthrough, cross-checked against a second recording",
    "recording": "<video id / 来源说明>",
    "asset_root": "/amochiroom/"
  },
  "levels": [
    {
      "level": 1,
      "slug": "level-1",
      "room": "Living Room",
      "chapter": 1,
      "difficulty": "easy",
      "status": "live",
      "stage": "full",
      "goal": "Put every loose item into the two boxes before the timer ends",
      "teaser": "12 items, 2 boxes, one drawer that only opens after the lamp is plugged in",
      "answer_line": "Lamp plug → drawer key → books to the left box → cushions to the right",
      "video": { "id": "XXXXXXXXXXX", "start": 0 },
      "thumb": "/amochiroom/l1-hero.jpg",
      "boxes": [
        { "id": "left", "name": "Wooden crate", "accepts": ["books", "magazines"], "note": "only accepts flat items" },
        { "id": "right", "name": "Laundry basket", "accepts": ["cushion", "blanket"], "note": "" }
      ],
      "items": [
        { "name": "Book", "found": "shelf, second row", "box": "left", "note": "three of them, all in the same row" },
        { "name": "Cushion", "found": "sofa", "box": "right", "note": "" }
      ],
      "locks": [
        { "name": "Drawer keypad", "code": "2519", "clue": "count the candles on the mantel" }
      ],
      "steps": [
        { "n": 1, "verb": "pick",   "item": "Lamp plug", "from": "floor by the sofa",  "to": null,     "box": null,   "t": 4,  "note": "the outlet is behind the plant", "img": "l1-step-1.jpg" },
        { "n": 2, "verb": "place",  "item": "Book",      "from": null,                 "to": "left crate", "box": "left", "t": 11, "note": "", "img": null }
      ],
      "hints": ["Start with the three books, they are all on one shelf.", "The drawer code is a count, not a printed number."],
      "trap": "One paragraph: where players actually stall in this room.",
      "faq": [
        { "q": "What is the answer to Amochi Room Level 1?", "a": "..." },
        { "q": "Where is the drawer key?", "a": "..." },
        { "q": "Is the level order different on my phone?", "a": "..." }
      ]
    }
  ]
}
```

### 2.1 字段规则（缺一即视为未完成）

| 字段 | 类型 | 必填 | 规则 |
|---|---|---|---|
| `level` | int | ✅ | 游戏内关号；全文件唯一 |
| `slug` | string | ✅ | `level-{level}`；与 URL 段一致；全文件唯一 |
| `room` | string | ✅ | 房间/主题名（游戏内英文原名，别自译） |
| `chapter` | int | ✅ | 无章节填 `1` |
| `difficulty` | enum | ✅ | `easy`/`medium`/`hard`，必须来自 `hub.difficulty_scale` |
| `status` | enum | ✅ | **`live` 才会进 `getStaticPaths` 和 hub 链接**；`pending` 只留在数据里 |
| `stage` | enum | ✅ | `full`（有文字步骤） / `video`（只有录像）——抄 R&E，hub 用它决定徽章 |
| `goal` | string | ✅ | 一句任务描述，用于 H1 副题与 hub 卡 |
| `teaser` | string | ✅ | hub 卡摘要，≤120 字符 |
| `answer_line` | string | ✅ | Quick answer 一行流；**步骤链必须与 `steps[]` 顺序一致** |
| `boxes[]` | array | ✅ | 每关至少 1；`accepts` 用 item 的小写类名 |
| `items[]` | array | ✅ | 每件物品：来源 + 去向 + 备注（对应页面"物品表"） |
| `locks[]` | array | ⬜ | 有密码/转盘才有；`code` 若随局变化，写 `"varies"` 并在 `note` 说明 |
| `steps[]` | array | ✅ | 见 2.2 |
| `hints[]` | array | ✅ | 3–5 条，nudge 不是答案 |
| `trap` | string | ✅ | 一段"卡点"，别写模板话 |
| `faq[]` | array | ✅ | 3–5 条，页面直接生成 FAQPage JSON-LD |
| `video.id` | string | ⬜ | 11 位 YouTube id；只填 id，不带域名 |
| `thumb` / `steps[].img` | string | ⬜ | 必须是 `public/amochiroom/` 下真实存在的文件 |

### 2.2 `steps[]` 是"解题顺序"的唯一真源

```ts
type Step = {
  n: number;                                  // 从 1 连续，不跳号
  verb: 'pick' | 'place' | 'open' | 'use' | 'combine' | 'swap';
  item: string;                               // 涉及的物品
  from: string | null;                        // 从哪里拿
  to: string | null;                          // 用到哪里
  box: string | null;                         // 放进哪个箱子（对应 boxes[].id）
  t: number;                                  // 录像秒数，用于 YouTube 时间戳
  note: string;                               // 为什么这一步成立（教学价值）
  img: string | null;
};
```

硬规则：
- `verb='place'` 必须有 `box`，且 `box` 必须能在 `boxes[].id` 里找到。
- `items[].box` 的并集 == `boxes[]` 里每个箱子的 `accepts` 的并集（除非 `note` 写明例外）。
- `answer_line` 的箭头数与 `steps.length` 不必相等（一步可含多个动作），但顺序必须一致。

### 2.3 hub 需要的汇总字段（**全部从 `levels[]` 派生，不许手写数字**）

```ts
const live      = levels.filter(l => l.status === 'live');
const fullCount = live.filter(l => l.stage === 'full').length;
const byDiff    = { easy: 0, medium: 0, hard: 0 };  // 从 live 统计
const rooms     = new Set(live.map(l => l.room)).size;
```

> 事故参照：BP3 的 `f1fd9d2` 就是"枢纽文案写 133，实际 172 页"。**任何出现在 hub 文案里的数字都必须是上面这种派生变量**，源码里不许出现字面量 `172` / `18 of 24`。

---

## 3. 生成器（入库，不手写 170 个页面）

先例：`scripts/bp3/gen_pages.py`（195KB，逐页写 astro）、`scripts/gen-sudoku-levels.mjs`（构建期生成 JSON）、`src/pages/bp3-ptbr-*.json`。**本板块取 gen-sudoku-levels 的形态**：

`scripts/amochiroom/build-levels.mjs` 职责：

1. 读 recon 产物（`research/amochiroom/unpack/**` 或 `scripts/amochiroom/raw/*.json`）；
2. 校验：`level`/`slug` 唯一、`steps[].n` 连续、`box` 引用有效、`img` 文件存在（`existsSync('public/amochiroom/'+img)`）；
3. 排序（按 `level` 升序）后写 `src/data/amochiroom-levels.json`；
4. **幂等**：同输入逐字节同输出（`JSON.stringify(x, null, 2)`），重复跑不产生脏 diff（照抄 `gen-sudoku-levels.mjs` 的种子稳定思路）；
5. 失败即 `exit 1` 并打印具体关号 —— 不许静默跳过。

生成器**不生成 astro 文件**。页面由 `[level].astro` 一次写好。

---

## 4. 页面骨架：逐段抄哪个文件的哪几行

### 4.1 `<head>` / TDK / schema（单关页）

**整段抄** `src/pages/word-kitchen/[pack]/[slug].astro`：

| 段落 | 行号 | 内容 |
|---|---|---|
| import + `getStaticPaths` + props | L1–28 | 含 `prev`/`next` 计算（L8–17 是核心） |
| TDK 组装 | L30–32 | `title` / `description` / `canonical` |
| FAQ 数组 → `faqJsonLd` | L34–61 | 3–5 条，`FAQPage` |
| `SEOHead` 调用 | L67–73 | `type="article"` + `breadcrumbTitle={...}` |
| hreflang 两连 | L74–75 | 本板块仅英文，保留 `en` + `x-default` |
| FAQ JSON-LD 注入 | L76 | `<script type="application/ld+json" set:html={...} />` |
| 字体 preconnect | L77–79 | Nunito 400/600/700/800/900 |
| 全局样式 | L80–132 | 暖色 palette + `.answer-box` / `.group` / `.mech` / `.cta` / `.pager` / `details.faq` / `.level-strip` |

#### TDK 硬约束

| 项 | 约束 | 校验方式 |
|---|---|---|
| `<title>` 源码 | **≤50 字符** | `SEOHead.astro` L45 会自动追加 `" | GridPaw"`（10 字符），源码 60 → 渲染 70 超长。仓库**没有** TDK 长度闸门，必须自己量 |
| title 关键词位 | 前 30 字符内出现 `Amochi Room` + `Level N` | 例：`Amochi Room Level 12 Answer: Kitchen`（36 字符） |
| description | **≤160 字符**，含关号 + 房间名 + 一句具体答案线索 | 同上，逐页量 |
| H1 | 每页恰好 1 个，含关号与房间名 | `grep -c '<h1'` |
| 全站唯一 | title / description 两两不重复 | 参照 `check-sudoku-pages.mjs` 的 `duplicates()` |

自检一行（build 后）：

```bash
node -e '
const fs=require("fs"),p=require("path");
const files=fs.readdirSync("dist/amochiroom");
for(const f of files){const h=p.join("dist/amochiroom",f,"index.html");if(!fs.existsSync(h))continue;
const t=(fs.readFileSync(h,"utf8").match(/<title>(.*?)<\/title>/)||[])[1]||"";
const d=(fs.readFileSync(h,"utf8").match(/<meta name="description" content="(.*?)"/)||[])[1]||"";
console.log(t.length, d.length, "/amochiroom/"+f+"/", t);}'
```

#### Schema 写法：**只留 SEOHead 那份 BreadcrumbList**

- `SEOHead.astro` L47–76 会**按 canonical 自动生成 BreadcrumbList**，L78–88 在 `type="article"` 时再生成 Article。
- 因此页面只需再补 `FAQPage`（word-kitchen L53–61 的形态）。
- **不要抄** `src/pages/meowdoku/levels/[level].astro` L30–50 的 `@graph`：那里手写了一份 BreadcrumbList，而 SEOHead 同时也会输出一份 → 同页两份 BreadcrumbList。抄 schema 只抄 word-kitchen 的 FAQPage-only。

### 4.2 单关页 body 骨架

| 区块 | 抄哪里（文件 / 行号） | 说明 |
|---|---|---|
| `GameNav` + breadcrumb | word-kitchen L134–138 | `Home › Amochi Room Answers › Level N` |
| H1 + lede | word-kitchen L141–142 | lede 写"本关目标 + 物品数/箱子数" |
| **Quick answer 盒** | word-kitchen L144–152（结构）+ R&E `chapter-1-level-1/index.astro` L92–101（`<ol>` 版） | 本板块用 R&E 的 `answer-box` + 有序列表：一行箭头链 + 3–4 条要点 |
| YouTube facade | R&E L103–110 | **必须** `class="yt-facade"`，禁止裸 `<iframe>`；`loading="lazy"` + `width/height` + `onerror` 回退 `hqdefault.jpg` |
| hero 图 | R&E L112 | `width/height` 必填，`loading="lazy"`（首屏图可 `eager`） |
| 步骤卡 × N | R&E L118–196 | `.step-card` + `.step-num`（`Step 3 · 0:16`）+ `<strong>` 一句动作 + 正文 + 图 + `.ts` 时间戳链接 `?v=ID&t=16s` |
| `InContentAd` | R&E L126（第一张步骤卡后） | 正文中段插一次，别连续两张 |
| 物品表 | R&E L198–208 | `.chain` 三列：Item / 从哪里拿 / 干什么；**箱子归属另开一列或合并进"干什么"** |
| 卡点清单 | R&E L210–216 | `<ul>` 3 条，每条一句话 |
| 关卡跳转条 | word-kitchen L192–197 + L128–131 样式 | `.level-strip` 全部关号，当前页 `class="here"` |
| FAQ | word-kitchen L199–205 + L124–126 样式 | `<details class="faq">`，条数 == `lvl.faq.length` |
| prev / next | word-kitchen L207–221 + L119–123 样式 | 第一关 prev 位渲染空 `<span />`；最后一关 next 位空 |
| `SideAd` | word-kitchen L222 | 放 `</main>` 前；内容页全档广告（含平板 sticky / 手机顶部位） |
| 方法声明（evidence） | word-kitchen L224–226 | `<strong>Where these steps come from:</strong>` + 录像 id + 双录像交叉核验 + "no content copied from another answers site" |

**不要抄** `src/components/RoomGuideLayout.astro`：它是 R&E 未完工关的"只有视频没有步骤"壳子，**目前零引用**（`grep -rln RoomGuideLayout src` 无命中）。它写死"Written steps are not published yet"，与本板块"每关都有步骤"的前提相冲突。

### 4.3 hub 页骨架

| 区块 | 抄哪里 | 说明 |
|---|---|---|
| head / TDK / schema | `src/pages/word-kitchen/[pack]/index.astro` L52–67（doctype→字体）+ L68–97（样式） | 同 4.1 的规则；FAQPage-only |
| breadcrumb + H1 + 导语 | word-kitchen hub L100–114 | 导语必须写清"覆盖到第几关、怎么核的" |
| 免责声明 | R&E hub L86 | `Unofficial fan-made guide. Not affiliated with <developer>.` |
| 核验说明 | R&E hub L90 | 一段"不是二手攻略"的方法声明 |
| 关卡网格 | word-kitchen hub L116–127（`.grid` / `.card`） | 每卡：`Level N` + 房间名 + 难度 + 物品数 |
| 章节分组（有章节时） | R&E hub L95–132 + `LevelSelector.astro` | 只有 `in_game_numbering: "chapter"` 才用 |
| 未完工关的呈现 | R&E hub L102–132（`is-pending` 虚线卡、不可点） | **只对游戏内确实存在、但我们还没写的关**用；不许写"待补充""正在生成"这类占位文案（补页契约 §0.5） |
| `InContentAd` | word-kitchen hub L129 | 网格之后 |
| 玩法/机制说明 | meowdoku hub（`src/pages/meowdoku/index.astro`）L101–109 的 `<div class="rules"><ol>` | 3–4 条规则讲清"物品→箱子"判定 |
| 读页指南 | word-kitchen hub L134–139 | 告诉读者每关页有什么（Quick answer / 步骤 / 物品表） |
| FAQ | word-kitchen hub L141–147 | 4 条：这是什么游戏 / 共几关 / 关号会不会变 / 为什么别的站步骤不同 |
| `SideAd` | word-kitchen hub L149 | 内容页全档 |
| evidence | word-kitchen hub L151–153 | 派生数字 + 方法 |

### 4.4 内链与去孤立（硬要求）

1. hub 被 `GameNav.astro` 的 `guides` 数组收录（站内每个内容页头部都能点到）。
2. hub 的网格链到**每一个** `status:'live'` 的关页；关页 breadcrumb 回 hub。
3. 每关页底部有 `.level-strip`（全部关号）+ prev/next，形成强连通链。
4. 每关页至少 2 条"同簇兄弟页"内链（prev/next 已满足，但 `check-pages.mjs` 应按路由字面量统计，别只靠 pager）。
5. 每页至少 1 条出站到可玩棋盘（`/`、`/akari/`）的 CTA —— 抄 word-kitchen L186–190 的 `.cta` 或 BP3 的 `.cta-box`。
6. `public/llms.txt` 收录 hub（见 §5）。

---

## 5. 必须同步修改的配置点（逐个文件 + 行号）

| # | 文件 | 行号区域 | 改什么 | 不改的后果 |
|---|---|---|---|---|
| 1 | `src/components/GameNav.astro` | **L30–42**（`guides` 数组） | 加 `{ href: '/amochiroom/', name: 'Amochi Room Answers', desc: 'Level walkthroughs, item by item' }` | hub 成孤岛：`dist/` 里存在但站内无入口（**没有闸门会拦**） |
| 2 | `src/components/GameSwitcher.astro` | **L8–26**（`GAMES`） | **默认不改**。它是"可玩棋盘"下拉，`/amochiroom/` 无可玩棋盘 | 不解地加 → 游戏下拉里出现一个纯文本答案站，点击期望落空 |
| 3 | `src/components/GameNav.astro` | **L9–27**（`games`） | 仅当 #2 加了才必须同步加（同一 href + emoji） | `check-nav-consistency` 红：`GameSwitcher ⊆ GameNav` 不成立 |
| 4 | `scripts/check-nav-consistency.mjs` | **L7**（`EXCEPTIONS`）、**L8–9**（`gameHrefs` 正则） | 无需改。**但新条目必须写成 `{ href: '/amochiroom/', emoji: '…'` 的形状**才会被正则看见 | 写成 `{ href: '…', name: … }` 时闸门**静默漏检**（假绿） |
| 5 | `scripts/check-nav-consistency.mjs` | **L45–122**（SUDOKU_CLUSTER 审计范式） | 建议追加一段 `AMOCHIROOM_HUB` 审计：页面存在但 GameNav 无入口 → 红 | 不追加则 #1 全靠人记，没人拦 |
| 6 | `src/lib/ad-policy.ts` | **L17–47** `PLAY_SURFACES`；**L50** `PLAY_PREFIXES`；**L57–60** `NEVER_ADS`；**L79–81** `loaderAllowed` | **纯文字攻略页：一行都不改**（内容页，全档广告）。**若页内出现可交互棋盘/求解器**：`'/amochiroom'` 进 `PLAY_SURFACES`，关页前缀 `'/amochiroom/'` 进 `PLAY_PREFIXES` | 该登记没登记 → `check-play-surfaces` 红；或 loader 落到棋盘页上（自动广告物理插入可玩区域） |
| 7 | `scripts/check-play-surfaces.mjs` | **L58–68**（`BOARD_MARKERS`）；**L27–37**（`EXEMPT`）；**L106–121**（归属判定） | 不改，但要读懂：`/id="[a-z0-9-]*(?:puzzle-)?board[a-z0-9-]*"/i` 命中即视为棋盘页 | 页内写 `id="item-board"` 这类装饰 id → 被判 UNREGISTERED 红 |
| 8 | `astro.config.mjs` | **L19–49**（`sitemap({ filter })` 的 `exactExcludes`） | 只有出现 `noindex` 页时才加精确 URL | 进了 sitemap 又 noindex → `check-sitemap-noindex` ERROR |
| 9 | `public/sitemap.xml` | 全文（9 行，sitemapindex） | **不动**。它是索引，只列 `sitemap-0.xml` + `pictomino-sitemap.xml`；逐 URL 的 sitemap 由 `@astrojs/sitemap` 构建时生成 | 手动往里塞 URL 会破坏"索引不得嵌套索引" |
| 10 | `public/llms.txt` | **L24–34**（`## Walkthroughs & Answers` 段） | 加一行：`- [Amochi Room Answers](https://gridpaw.com/amochiroom/): …` | AI/LLM 抓取入口缺一块（手维护文件，不会自动更新） |
| 11 | `scripts/gen-llms-full.mjs` | **L21–39**（`walk()` 只收 `index.astro`；`grab()` 只认双引号 `const title = "…"`） | 不改，但 hub 的 TDK 必须写双引号字面量 | 用模板字符串/单引号 → `llms-full.txt` 里该条 title 为空 |
| 12 | `src/lib/changelog-data.ts` | **L12**（`CHANGELOG_ENTRIES` 数组，倒序插在首位附近） | 加 `{ date, type: "New", game: "Amochi Room", title, desc }` | 违背"公告先行"承诺（AGENTS「上线前置」第三条） |
| 13 | `src/pages/changelog.astro` | **L18–30**（`gameColors`） | 加 `"Amochi Room": "#…"` | 标签底色为 `undefined`（不崩，但不显示底色） |
| 14 | `package.json` | **L7**（`build` 链）、**L10**（`lint`） | 若新增 `scripts/amochiroom/check-pages.mjs`，挂到 `build` 链 `check-play-surfaces` 之后 | 新闸门不跑 = 等于没写 |
| 15 | `public/_redirects` | 全文（45 行） | **写页前先 `grep -n "amochiroom" public/_redirects`**；无冲突再动手 | 命中 301 的老 URL 会把新页直接跳走（补页契约 §0.0，BP3 已有 40/56/63/67/137 被这条拦下） |
| 16 | `PATROL.md` | 文末追加 `## 页面：/amochiroom/…` 段 | 按现有格式记状态清单 + 实测 | 页面巡查漏掉新板块 |
| 17 | `STATUS.md` | 交付时记一段 | 上线/计数/遗留 | 跨会话无法接手 |

**新增文件（不是"修改"，列在此便于一次看全）**：`src/pages/amochiroom/index.astro`、`src/pages/amochiroom/[level].astro`、`src/data/amochiroom-levels.json`、`scripts/amochiroom/build-levels.mjs`、`public/amochiroom/*`。

---

## 6. 广告口径（一句话判定）

- `/amochiroom/` 与 `/amochiroom/level-N/` 是**攻略/内容页**：`SideAd`（桌面侧栏 + 平板 sticky + 手机顶部位）+ 正文中段一次 `InContentAd`；`SEOHead` 会注入 `adsbygoogle.js`（`loaderAllowed('/amochiroom/level-1') === true`）。
- 一旦页内嵌了**可拖拽的排序演示盘**（内联渲染，不是 iframe），立刻按 play surface 处理：`PLAY_SURFACES` 加 `'/amochiroom'`、`PLAY_PREFIXES` 加 `'/amochiroom/'`，并且只保留桌面 ≥1350 侧栏。
- 内容列宽度：文字页 `max-width: 720–840px`（word-kitchen 用 840、R&E 用 720）。**若将来放棋盘，必须 ≤840**，否则侧栏会盖住可点区域（murdoku 2026-10-14 事故）。

---

## 7. 构建与验收

```bash
cd /Users/frank/workspace/gridpaw/.worktrees/2026-11-24-room-sort

# 0) 开工/收工例行（只读）
pnpm run preflight

# 1) 301 闸（写页前）
grep -n "amochiroom" public/_redirects

# 2) 生成数据（幂等，重复跑不产生 diff）
node scripts/amochiroom/build-levels.mjs

# 3) 全量构建（链内含 4 个闸门）
pnpm run build
#   = check-nav-consistency → check-play-surfaces → check-indexnow-key
#     → gen-build-info → gen-llms-full → gen-sudoku-levels → bundle-engine
#     → selftest-engines --fast → astro build → stamp-sw → fix-sitemap → sitemap-lastmod

# 4) 提交前（oxlint + 约定闸门 + 改动文件全规则）
pnpm run verify

# 5) 构建后必补的三项手工闸（不在 build 链里）
node scripts/check-play-surfaces.mjs --list        # 看归属分类
node scripts/check-sitemap-noindex.mjs             # sitemap 与 noindex 对账
node scripts/check-tracked-imports.mjs             # 新组件/JSON 是否已入 git（干净检出唯一防线）

# 6) IndexNow 预告（部署时由 deploy:safe 接手）
node scripts/indexnow-ping.mjs --dry-run --from-git HEAD~1

# 7) 页面形状（若建了 check-pages.mjs）
node scripts/amochiroom/check-pages.mjs --strict
```

### 7.1 新板块最容易踩的 red（按概率排序）

1. **`check-play-surfaces` → UNREGISTERED**：页内出现 `id="…board…"`、`<…Play`、`src="/xxx-engine.js"`、`/puzzle-engine.js` 任一。装饰性容器别用 `board` 命名，改 `.sort-table` / `.room-panel`。
2. **`check-nav-consistency` → 导航分叉**：只加了 `GameSwitcher` 没加 `GameNav`。反向（只加 GameNav）**不会红**，所以 hub 的入口必须靠代码评审或 §5-#5 的新闸门兜。
3. **`oxlint --deny-warnings`（`pnpm run verify`）**：`import SideAd` 写了不用、`const total` 没用上 → `no-unused-vars` 直接红。`lint:changed` 对**改动文件跑全规则集**（`scripts/lint-changed.mjs` L11）。
4. **`check-tracked-imports`（手工）**：新建的 `AmochiStep.astro` / `amochiroom-levels.json` 没 `git add` → 本机构建绿、干净检出炸。这正是 2026-11-07 R&E 的真实事故形态。
5. **`check-indexnow-key`**：干净 worktree 里没有 `public/<key>.txt`（故意不入库）。本地验证可 `SKIP_INDEXNOW_CHECK=1 pnpm run build`，但**提交/部署前不要在忽略状态下判定"全绿"**。
6. **`astro build`**：`getStaticPaths` 返回重复 `params.level`（两条 `level:1`）→ 构建报 duplicate；JSON 字段名拼错（`stpes`）→ 渲染出空白段落而不报错，属静默错误，靠 `check-pages.mjs` 兜。
7. **`check-sitemap-noindex`**：给某页加了 `noindex` 却没加 `astro.config.mjs` 的 `exactExcludes` → ERROR（规则 1）。

### 7.2 干净检出前的额外两坑（AGENTS 部署节）

- `node scripts/check-tracked-imports.mjs`；
- `cp public/<key>.txt` 进 worktree（否则 `check-indexnow-key` 拦）。

---

## 8. 内容与素材纪律（不可协商）

1. **不许编造步骤**：每个 `steps[]` 必须能追到实拍帧（`research/2026-11-24-level-backfill-contract.md` §0.3）。做不到 → 该关 `status: "pending"`，不出页。
2. **读帧必须 `vision_analyze`**：纯文本模型看不了拖拽物（同契约 §2，2026-11-24 实测）。同一道具两次独立读数一致才算确认。
3. **录像下载**：`yt-dlp -f 137`（失败退 136），`--continue`，禁 `--no-part`；完整性只认 `ffmpeg -i f -f null -` 解码时长 ≥ 元数据 × 0.97；YouTube 走 7882 端口（33210 已被判 bot）。下载串行。
4. **不写占位文案**：`"待补充"`、`"正在生成"`、`"Coming soon"` 都不许出现在正文（hub 的 `is-pending` 虚线卡是唯一例外，且只用于游戏内确实存在的关）。
5. **素材落盘**：`public/amochiroom/l{N}-hero.jpg`、`l{N}-step-{k}.jpg`，宽 1200，每张带 `alt` + `width/height` + `loading="lazy"`；首屏图可 `eager`。
6. **视频一律 facade**：禁止裸 `<iframe>`（AGENTS「YouTube 嵌入」条；实测 931ms → 9,462ms）。
7. **不照抄竞品文案**：可参考结构，正文必须自写（word-kitchen evidence 段已把这条写成公开承诺）。

---

## 9. 交付验收清单

- [ ] `src/data/amochiroom-levels.json` 通过 `build-levels.mjs` 校验（唯一性 / 连续 n / box 引用 / img 存在）
- [ ] `getStaticPaths()` 过滤 `status === 'live'`，`dist/amochiroom/` 页数 == live 关数
- [ ] hub 显示的所有数字都是派生变量，源码无字面量关数
- [ ] 每页恰好 1 个 `<h1>`；title ≤50 字符（渲染后 ≤60）；description ≤160
- [ ] 每页 1 份 BreadcrumbList（来自 SEOHead）+ 1 份 FAQPage；无重复 schema
- [ ] 每页 `.level-strip` 全关号 + prev/next；首关/末关空位用 `<span />`
- [ ] `GameNav.astro` guides 已收录 hub
- [ ] `public/llms.txt` 已收录 hub
- [ ] `src/lib/changelog-data.ts` 有 `type: "New"` 条目
- [ ] `pnpm run build` 0 error；`pnpm run verify` 全绿
- [ ] `check-tracked-imports.mjs` 通过
- [ ] `check-sitemap-noindex.mjs` 无 ERROR
- [ ] `public/_redirects` 无 `amochiroom` 冲突
- [ ] PATROL.md / STATUS.md 已记录
- [ ] 截图自验：桌面 1440 + 手机 390 各一张 hub 与一关页

---

## 10. 未决项（recon 后才能定，别猜）

| 项 | 影响 | 怎么定 |
|---|---|---|
| 游戏内关号形态（全局 or Chapter X Level Y） | URL 结构（§1.3） | 装包看关卡选择界面 |
| 是否有"箱子/容器"分类规则 | `boxes[]` 是否要 `accepts` 白名单 | 玩 3 关确认是否"任意箱放任意物" |
| 关数上限 | hub 文案 `Levels 1 to N` | 数据里 `hub.total_levels`，未知填 0 并在文案回避具体数字 |
| 关卡是否随进度随机（盘面/物品位置） | 是否要置顶"布局可能不同"免责声明 | 两台设备同关对比（skill `seo-content-writing`「答案型内容页」条） |
| 官方是否已有英文名（Amochi Room vs Amochiroom） | title/URL/h1 全链路 | App Store 页面标题逐字抄 |
