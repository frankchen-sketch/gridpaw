# 任务：Room Sort 网页版可玩游戏（`/room-sort-game-online/`）

## 背景

gridpaw.com（Astro 5 静态站，CF Pages）已有 `/amochiroom/` 133 关攻略（数据来自 APK 解包）。
SERP 实测：`room sort game online` KD **23.1（容易）**，第一页全是综合游戏门户（girlsgogames/keygames/gamesgames），
第 2 位 keygames 行为数据垫底（人均 2 页、39 秒、跳出 42%）。autocomplete 出 `room sort game online free`、
`room sort play online`、`room sort floor plan game online`。

**目标**：做一个打开即玩的 Room Sort 网页版，吃这批词。

## 数据源（只读，不要改）

`src/data/amochiroom-levels.json`（6.8MB）

```jsonc
{
  "meta": { "game": "...", "levelCount": 133, "boxCount": 5091, "itemCount": 25943, ... },
  "levels": [
    {
      "level": 1, "sourceLevel": 1, "name": "My Study", "difficulty": "easy",
      "passRate": 84,
      "boxCount": 5, "itemCount": 26, "categoryCount": 5,
      "bg": "/amochiroom/art/b/001.webp", "thumb": "/amochiroom/art/b/t-001.webp",
      "bgW": 1220, "bgH": 1560,
      "boxes": [
        { "name": "Books", "nameZh": "书籍", "count": 5, "type": 101, "queue": 1,
          "thumbs": ["101-2.webp", "17-7.webp"] }
      ],
      "items": [
        // [fn, x, y, fx, fy, ang, w, h, type]
        ["103-2.webp", -122, -498, 1, 1, 0, 295, 326, 103]
      ]
    }
  ]
}
```

美术资源已在 `public/amochiroom/art/`：
- 物品：`/amochiroom/art/i/{fn}`（如 `/amochiroom/art/i/103-2.webp`）
- 背景：`/amochiroom/art/b/{文件}`（level.bg 已是完整路径）
- **不要复制美术**，直接引用现有路径。

## 坐标公式（必须照抄 `src/pages/amochiroom/[slug].astro:276-307`）

游戏世界 y 轴向上，屏幕 y 轴向下：

```js
const [fn, x, y, fx, fy, ang, w, h, type] = it;
const left = ((bgW / 2 + x) / bgW) * 100;   // %
const top  = ((bgH / 2 - y) / bgH) * 100;   // %，y 取反
const widthPct = (w / bgW) * 100;
// 元素样式
style = `left:${left}%; top:${top}%; width:${widthPct}%;
         transform: translate(-50%,-50%) rotate(${-ang}deg) scale(${fx},${fy})`
```

父容器：`aspect-ratio: ${bgW}/${bgH}; background-image: url(${bg})`，`position: relative`，物品 `position: absolute`。

## 游戏规则（来自 APK 解包 `game/src/core/rules.js` + `buffer-failure.js`，见 `research/amochiroom/EXPORT-SCHEMA.md`）

| 常量 | 值 | 含义 |
|---|---|---|
| ORDER_SLOTS | 3 | 箱子槽位总数 |
| ORDER_OPEN | 2 | **开局同时开放的箱子数** |
| BUFFER_SLOTS | 7 | 缓冲格总数 |
| BUFFER_OPEN | 5 | 开局开放的缓冲格 |

流程：
1. 进入关卡：箱子按 `queue` 升序排列，前 2 个开放（其余锁定）。
2. 点击房间物品：
   - 若其 `type` 匹配某个**已开且未满**的箱子 → 入箱，箱子计数 -1，物品消失（带飞行动画）。
   - 否则 → 进缓冲（占用一个开放缓冲格）。缓冲满时不可再点（提示"缓冲满"）。
3. 箱子 `count` 归零 → 该箱完成，**从缓冲里自动吸走同类物品**，从槽位移除，按 queue 补下一个箱子进来。
4. 所有箱子完成 → 通关。
5. **失败条件**：缓冲全部开放格被占用 **且** 当前没有任何可入箱物品 → fail。
6. 缓冲里的物品可被后续开放的同类箱子自动收走（第 3 条），不做手动拖拽。

**简化约定**（可玩版允许）：
- 遮挡判定交给 DOM 天然的 hit-test（后渲染的在上层，点击自然命中上层元素），不需要复刻 `cover_block_min=0.045` 的多边形判定。
- 星级、体力、看广告扩容槽位：不做。
- 关卡随机化（原游戏部分关重发牌）：不做，用 shipped 数据固定。

## 交付物

1. **`scripts/export-roomsort-play.mjs`**
   - 读 `src/data/amochiroom-levels.json`
   - 输出按关卡拆分的精简 JSON 到 `public/room-sort/levels/{N}.json`，只保留渲染+判定必需字段：
     `{ level, name, difficulty, bgW, bgH, bg, boxes:[{name,count,type,queue,thumbs}], items:[[fn,x,y,fx,fy,ang,w,h,type],...] }`
   - 同时输出 `public/room-sort/index.json`：`[{level, name, difficulty, boxCount, itemCount, thumb}, ...]`（关卡选择用）
   - 单关文件目标 < 60KB

2. **`public/room-sort/engine.js`**（原生 JS，无依赖，IIFE 或 ES module 均可）
   - 负责：加载关卡、渲染物品/箱子/缓冲、点击判定、飞行动画、胜负判定、切关
   - 对外暴露 `window.RoomSort = { init(el), load(level) }` 之类的简单接口

3. **`src/pages/room-sort-game-online/index.astro`**
   - Title: `Room Sort Game Online — Play Free in Your Browser`
   - H1: `Room Sort Game Online`
   - 首屏即可玩（游戏区 + 箱子栏 + 缓冲栏 + 关卡选择器）
   - 玩法说明（3-4 条，说清「点物品入箱、缓冲、卡死」）
   - FAQ（至少 4 条：怎么玩 / 卡死了怎么办 / 有多少关 / 手机能玩吗）+ FAQPage JSON-LD
   - 内链到 `/amochiroom/`（全部答案）与 `/amochiroom/find/`
   - **必须**加进 `src/lib/ad-policy.ts` 的 `PLAY_PREFIXES`（可玩页 = play surface）
   - 必须加进 `src/components/GameSwitcher.astro` 和 `src/components/GameNav.astro` 的 games 数组（两处都要）
   - 用 `SEOHead` / `GameNav` / `SideAd` 组件，风格与现有游戏页一致
   - 引擎用 `<script is:inline src="/room-sort/engine.js"></script>` 加载（**Astro 内联 script 不被 Vite 打包，必须 is:inline**）

4. **构建链**：`scripts/export-roomsort-play.mjs` 挂进 `package.json` 的 build 前置（参考现有 `gen-llms-full.mjs` 挂法）

## 验收标准（每条都要实测，并在汇报里给证据）

1. `pnpm run build` 通过，无 error。
2. `pnpm run verify` 通过（oxlint + 约定闸门）。
3. 本地 `pnpm run dev`，用浏览器打开 `/room-sort-game-online/`：
   - 第 1 关（My Study，26 物品 5 箱）**能实际点通**：点物品 → 入箱/进缓冲 → 箱子完成 → 通关提示
   - 关卡选择器能切到第 2、3 关并正常加载
   - 故意塞满缓冲能触发失败提示
   - 手机视口（375×812）可玩，无横向滚动
4. 无 console error；首屏不加载全部 133 关数据（只加载当前关 + index.json）。
5. `/amochiroom/` 现有页面不受影响（build 后仍正常生成 133 个 level 页）。

## 禁区

- 不要改 `src/data/amochiroom-levels.json`。
- 不要改 `src/pages/amochiroom/` 下任何文件。
- 不要复制 `public/amochiroom/art/` 的资源到别处。
- 不要引入新的 npm 依赖（原生 JS 足够）。
- 不要 `git add -A` / `git commit`；只改文件，提交由主会话做。

## 汇报要求

做完后给出：
1. 新增/修改的文件清单（绝对路径）
2. `pnpm run build` 与 `pnpm run verify` 的真实输出尾部
3. 浏览器实测的每一条结果（对应上面验收 3 的四个子项），写清怎么点的、看到什么
4. 已知未实现/降级的地方（诚实列出）
