# /floorplan/ —— 自研平面图谜题（Room Sort · Floor Plan）

2026-11-25 立项，用于替换 `/room-sort-game-online/` 现在挂的 amochi 解包版可玩页
（那个是「物品入箱」玩法，却吃着 `room sort` 这个「平面图」词族 —— 词面错配）。

## 玩法（机制取证自 Gamincat《Room Sort - Floor Plan Game》商店页与多个网页版，规则文本自写）

- 米色格子 = 房子 footprint，**内部每一格都必须被房间块铺满**，块不能重叠
- 每个房间块边缘画着**门洞**；门必须与邻格的门对上，不能对着墙，也不能朝向房子外面
- 拖动时**绿格**预览落点，红格 = 不合法
- 摆满全部房间块 = 通关

## 文件

| 文件 | 作用 |
|---|---|
| `public/floorplan/game.html` | 页面壳 + 全部样式（`noindex`，脚手架阶段） |
| `public/floorplan/game.js` | 引擎：渲染 / 拖拽 / 点选 / 校验 / 提示 / 存档 |
| `public/floorplan/levels.json` | 60 关，由生成器产出（**不要手改**） |
| `scripts/gen-floorplan-levels.mjs` | 生成器：先造解再拆，所以每关天然可通关 |

## 数据模型

```jsonc
{
  "id": 30, "hard": false, "w": 7, "h": 5,
  "cells": [[x,y], ...],          // fanstprint 里的每一格（绝对坐标，已归一化到 0 起）
  "rooms": [{
    "id": 3, "name": "Garage",
    "at": [5, 0],                 // 解里的绝对位置（提示用；玩家看不到）
    "shape": [[sx,sy], ...],      // 形状，相对 bbox 左上角
    "doors": [[sx,sy,"N"], ...],  // 门：相对 bbox 的格子 + 朝向 N/E/S/W
    "bw": 2, "bh": 1
  }],
  "entries": [[x,y,"W"], ...],    // 入户门洞：房子外墙上允许开门的位置（绝对坐标 + 朝向）
  "tray": [3, 1, 0, ...]          // 托盘顺序（打乱）
}
```

**门的三条合法路径**（`game.js` 的 `validate()`）：朝另一个已摆房间的门（两边都得有门）；
朝入户门洞（`entries` 里登记过）；其余一律拒。所以每关都有 1–2 个入户门洞，
玩家必须在"对门"和"对入户洞"之间取舍 —— 这是自研相对源码包版多出来的一层约束。

## 画法（对齐真机，2026-11-25 按法老反馈重做）

真机（Gamincat Room Sort）的门窗语言是三件套：**墙上缺口 + 垂直于墙的门板短线 + 四分之一圆弧摆幅**。
房间块是**直角多边形**、外墙一条连续深线，房间内部不画格线。平面图是白格 + 细灰网格 +
一条粗线沿 footprint 外墙走，入户处在外框上开口。

`game.js` 里 `wallGeom / drawDoor / drawDoorLeaf` 三个函数共用这套画法：房间块和平面图外框
都调它们，所以两边的门户符号一致。房间块是 SVG（不是 div 拼格），棱角才是直角而不是圆角拼接。

## 重新生成

```bash
node scripts/gen-floorplan-levels.mjs   # 已在 pnpm run build 链里（astro build 之前）
```

生成器自带验解：把解摆回去必须「铺满 + 门成对 + 不越界」，任一关失败就 `exit 1`，
不会把坏关卡带进构建。

## 引擎侧校验（`game.js` 的 `validate()`）

按块逐个校验，三条拒绝理由：

1. `That goes outside the plan` —— 有格子不在 footprint 里
2. `That spot is already taken` —— 与已摆的块重叠
3. `A door would open into a wall` —— 门对着已摆房间的非门边，或朝向房子外面

三条都已在真实数据上找到用例并实测命中（见 STATUS.md 2026-11-25 条目）。

## 验收口径（每次改动后重跑）

- **60 关全解可摆**：按托盘顺序对各关调用 `place()` 摆解法，必须 60/60 全部被接受且触发通关
- 手机 390：`documentElement.scrollHeight === window.innerHeight`（首屏不滚动）、`scrollWidth === innerWidth`
- 托盘单行横滑（`tray.scrollWidth > clientWidth`），每块下面有名字且不被裁

浏览器里 `window.__FP` 暴露了 `start/validate/place/hint/solveAll/state`，供自动化验收。

## 待办（挪到 /room-sort-game-online/ 之前）

1. 页面文案与 FAQ 重写：现在那一页通篇讲「物品入箱」，与平面图玩法矛盾
2. `src/lib/ad-policy.ts` 的 `PLAY_SURFACES` / `PLAY_PREFIXES` 同步（挂 Astro 页后必须登记）
3. 装到 Astro 页里（照 Pictomino/cc 先例用 iframe，或直接内联 iframe + `?embed=1` 式外壳）
4. 缩略图 / OG 图
