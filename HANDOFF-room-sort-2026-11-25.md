# HANDOFF — Room Sort / Amochiroom 线

**日期**：2026-11-25
**交接原因**：上一会话上下文过长（多次压缩，细节已失真），用户要求新会话执行
**使命**：先修 P0 房间图 bug，再按 §4 推进

---

## 0. 一句话

站内有两个游戏、两个可玩页。唯一确认的 bug：`/amochiroom/level-N/` 攻略页房间图物品**竖向拉长 3 倍、整体飘在空中**。根因已定位并实测验证，修法是加一个 `height:auto`。**用户明确要求：先定位不动手，由新会话执行。**

---

## 1. 事实底座（先看这张表，别再弄混）

### 1.1 两个不同的游戏，都叫 Room Sort

| | **Gamincat: Room Sort (Floor Plan)** | **Amochiroom** |
|---|---|---|
| 包名 | `com.gamincat.roomsort` | `com.gamefactory.roomsort` |
| 安装量 | **1,239 万** | 21 万 |
| 关卡数 | 384（章节 03–14） | 133 |
| 解包 | 完成（MessagePack，2,506 Stage） | 完成 |
| **答案数据** | ❌ **不存在**（0/2505 关全对齐、58% 重叠、非对齐中位数 77.8%） | ✅ 完整 |
| 站内页面 | 无 | `/amochiroom/` 133 页 |

**答案缺失的证据**：`RECON.md`（在 `.worktrees/room-sort-floor-plan/`）。实测 2,505 关没有一关能做到「全对齐零重叠」，说明房间坐标是初始散乱态而非答案布局。**这就是可玩页最终没用 Gamincat 数据的原因。**

### 1.2 四个页面，谁是真正可玩

| 路径 | 类型 | 关卡 | 数据源 | 源文件 |
|---|---|---|---|---|
| `/crazy-cleanup/` | 落地页/攻略 | — | — | `src/pages/crazy-cleanup/index.astro` |
| **`/crazy-cleanup/game?l=N`** | **可玩（纯静态 HTML）** | 34 | `public/crazy-cleanup/{levels.js,packs/*.js}` | **`public/crazy-cleanup/game.html`** |
| `/amochiroom/level-N/` | 攻略页（带房间图）| 133 | `src/data/amochiroom-levels.json` | `src/pages/amochiroom/[slug].astro` |
| **`/room-sort-game-online/`** | **可玩（engine.js）** | 133 | `public/room-sort/levels/*.json` | `src/pages/room-sort-game-online/index.astro` + `public/room-sort/engine.js` |

> **踩坑（上一会话犯过）**：查「有没有可玩页」必须查 `public/`，不能只 `find src/pages`。`/crazy-cleanup/game` 是纯静态 HTML，完全不在 Astro 路由里，我当时因此误报「cleanup 没有可玩页」，被用户纠正。

### 1.3 可玩页和 Amochiroom 关卡 1 为什么一样

`/room-sort-game-online/` 的关卡数据 = Amochiroom 导出（`scripts/export-roomsort-play.mjs`），美术 = `/amochiroom/art/i/`。**同一份数据、两个门面**，Level 1 相同是设计使然，不是 bug。

---

## 2. P0 BUG：房间图物品拉长 3 倍 + 飘在半空

### 2.1 用户原话

> 「房间图 都有问题，全部在空中，并且比例明确被拖拽了」（2026-11-25）

### 2.2 现象与实测数据

浏览器 1200×1000，页面 `/amochiroom/level-1/`：

| 指标 | 修前 | 注入 `height:auto` 后 | 正确值 |
|---|---|---|---|
| board 容器 | 420×537 | 420×537 | — |
| 首个物品 rect | 101 × **326** | 101 × **111** | 101×111 |
| 宽高比 w/h | **0.309** | **0.906** | 原图 261×288 = 0.906 |

- 宽度 101px = 正确的百分比缩放（24.18% × 420）
- **高度 326px = 数据里的原始像素 h，完全没随容器缩放**
- 竖向拉长 3.1 倍 → 用户说的「比例被拖拽」
- `transform: translate(-50%,-50%)` 以锚点为中心，高度多出 215px，整体上浮 → 用户说的「全在空中」
- `.board` 有 `overflow:hidden`，物品下半截被裁

图片证据：
- 修前：`~/.hermes/cache/scratch/fix-before.png`
- 修后：`~/.hermes/cache/scratch/fix-after.png`

### 2.3 根因链（已确诊）

文件：`src/pages/amochiroom/[slug].astro`

**L291–302 当前源码**：

```astro
<img
  class="it"
  src={`/amochiroom/art/i/${fn}`}
  width={w}         ← HTML 属性：295
  height={h}        ← HTML 属性：326 → 无 CSS height 时它生效为定值
  data-t={type}
  ...
  style={`left:${left.toFixed(2)}%;top:${top.toFixed(2)}%;width:${((w / lvl.bgW) * 100).toFixed(2)}%;transform:translate(-50%,-50%) rotate(${-ang}deg) scale(${fx},${fy})`}
/>
```

- CSS 只给了 `width` 百分比，**没有给 `height`**
- HTML 的 `height={h}` 属性因此生效：高度锁定 326px
- → 宽随容器缩放、高保原始像素 → 变形
- `scale(${fx},${fy})` 全是 1.0（已查全部 26 个物品，fx=fy=1），**不是缩放参数的问题**

**对照组（这个是对的，别改它）**：`public/room-sort/engine.js` L170–171

```js
img.style.width = wPct.toFixed(2) + '%';
img.style.height = 'auto';        ← 有这行，所以可玩页正常
```

### 2.4 修复方案（已验证有效，但尚未实施）

**最小改动，二选一**：

```diff
- style={`...width:${((w / lvl.bgW) * 100).toFixed(2)}%;transform:...`}
+ style={`...width:${((w / lvl.bgW) * 100).toFixed(2)}%;height:auto;transform:...`}
```

或（更稳，一处管全部）：

```css
/* L168 附近 */
.board .it { position: absolute; transform-origin: center; height: auto; transition: ... }
```

浏览器内实时注入验证：26 个物品全部变为 101×111（比例 0.906），视觉上落地。

### 2.5 修完必须验证的（不放水）

1. **比例**：26 个物品 rect 的 w/h 各自 ≈ 对应原图 natural 比例（不是统一 0.906，各图不同）
2. **落位**：物品在桌面/地面，无一出 board 边界
3. **两档截图**：桌面 1200px + 手机 390×844
4. **圈选回归**：点箱子后 ring（圆圈）+ num（编号）仍与物品对位（ring/num 用百分比定位，理论不受影响，**但必须实测**）
5. **抽样 5 关**：level-1 / 50 / 100 / 131 / 133（有 REMOVED_LEVELS=[53,73,79,98,133]，注意 133 可能不存在）

---

## 3. 未提交改动（60 项，别丢）

```
56 modified + 4 untracked
```

| 文件 | 内容 | 用户验收状态 |
|---|---|---|
| `src/pages/rooms-and-exits/chapter-*/index.astro` × 49 + 1 pt-br | `.step-card` 统一新版（#FFFBF2 底 + 1.5px #F0DFAE 边） | ✅ 已认可 |
| `src/pages/pt-br/brain-puzzle-3-level-[level].astro` | `.step-card` 新版 + `.cross-card` 删 `border-top:5px` | ✅ 已认可 |
| `src/pages/room-sort-game-online/index.astro` | 可玩页：hint 按钮 + 计时器 + 房间 52vh→64vh（手机 68vh） | 已实测通过 |
| `public/room-sort/engine.js` | hint/计时逻辑（fmtTime/paintTimer/startTimer/stopTimer/hint） | 已实测通过 |
| `src/pages/amochiroom/[slug].astro` | TDK 改品类词（`Room Sort Level N Answer — Amochiroom X`） | 未验收 |
| `src/pages/amochiroom/[slug].astro` L199 等 3 处 `.mech` | 已回退白底 + 琥珀左色条 | ✅ 用户裁决 |
| `package.json` / `GameNav.astro` / `GameSwitcher.astro` / `src/lib/ad-policy.ts` | 更早 Amochiroom 线改动 | 未验收 |
| `?? public/room-sort/`、`?? src/pages/room-sort-game-online/`、`?? scripts/export-roomsort-play.mjs`、`?? research/room-sort-radar/` | 可玩页全套 | 未提交 |

---

## 4. 待办

| # | 任务 | 文件 | 验收标准 |
|---|---|---|---|
| **P0** | 修房间图 `height:auto` | `src/pages/amochiroom/[slug].astro` L302 或 CSS L168 | §2.5 五条全过 |
| P1 | 修完 `CI=true pnpm run build` + 抽 5 关复验 | 同上 | build 792 页通过，5 关截图无变形 |
| P2 | 提交 60 项改动 | — | **用户点头后**，按模块分批 |
| P3 | 可玩页标题口径（等拍板，见 §6） | — | — |

---

## 5. 红线

- **不动** `src/data/amochiroom-levels.json` — 数据是对的（bgW/bgH=1220×1560，背景图 720×921，比例 0.782 vs 0.7816 一致）。**不要改坐标去凑视觉**
- **不动** `public/crazy-cleanup/` — 那是另一个可玩页（34 关），与本 bug 无关
- `.mech` 白底 + 琥珀左色条是**用户裁决版**，任何"统一视觉"的冲动都不要碰它
- `.impeccable/config.json` 里有 `side-tab=*` 文件级 ignore（amochiroom/[slug].astro + word-kitchen），别删
- 提交前 `git add <file>` 之前必须 `git diff <file>` 对账（同仓多会话并行，曾扫进别人的 WIP）
- **Codex 已停用**（无 credit，ChatGPT 后端 403），代码自己写 + 实测验收

---

## 6. 待用户拍板

1. **可玩页标题口径**：`/room-sort-game-online/` 用 "Room Sort Game Online"（Gamincat 品类词），内容却是 Amochiroom 房间。改不改？
2. **手机房间尺寸**：现 68vh（物品大，Buffer 需滚动）vs 58vh（Buffer 全露，物品小一圈）
3. **提交范围**：60 项一次提交，还是按模块分批

---

## 7. 上一会话踩过的坑（照着避）

| 坑 | 后果 | 教训 |
|---|---|---|
| 只在 `src/pages/` 找可玩页 | 漏掉 `public/crazy-cleanup/game.html`，误报「cleanup 没有可玩页」 | 静态可玩页在 `public/`，要全仓 `find` |
| 用 vision 判断视觉正确性 | vision 把拉长 3 倍的图判成「正常」，用户肉眼否决 | **视觉以用户 + 实测 rect 数据为准**，vision 只作参考 |
| 把用户的「游戏盘」理解成 `.mech` | 回退错对象，白费一轮 | 用户说视觉问题，先问「具体哪块」再动手 |
| 用 `git show <commit>:file` 逐版替换截图 | 慢，且要备份未提交改动 | 备份在 `/tmp/amo-compare/slug-CURRENT.astro`（md5 `577ed50a8ab18a9c9f38784eb5b76826`） |
| 上下文压缩导致细节失真 | 误以为「房间图已修好」 | 一切以仓库文件、实测输出为准，不以记忆为准 |

---

## 8. 环境

- 主仓：`~/workspace/gridpaw` @ `main` `bb52d26`（**全部改动未提交**）
- 预览：`python3 -m http.server 4322` serving `dist/`（当前在跑，LAN `http://192.168.31.91:4322`）
- build：`CI=true pnpm run build`（792 页，约 10s）
- 物理机：Mac mini `192.168.31.91`
- 解包工作树：`.worktrees/room-sort-floor-plan`（`RECON.md` + `gamincat_extract/` 在这里，未提交）
- 引擎遗留：`REMOVED_LEVELS=[53,73,79,98,133]`、`window.RoomSort.snapshot()/load(N)`

---

## 9. 关键结论一句话汇总

1. **两个同名游戏**：Gamincat（1239 万，无答案数据）vs Amochiroom（21 万，数据完整）
2. **两个可玩页**：`/crazy-cleanup/game`（34 关静态）+ `/room-sort-game-online/`（133 关 engine.js）
3. **唯一确认 bug**：攻略页房间图 `<img>` 缺 `height:auto`，高锁定原始像素，拉长 3 倍 + 上浮
4. **修法一行**，已实测验证
5. **可玩页没这个 bug**（engine.js 有 `height: auto`）

---

## 10. 执行记录（2026-11-25 会话2 — P0 已修，待拍板提交）

- **分支**：已切 `feat/2026-11-24-room-sort-floor-plan`（bb52d26，60 项 WIP 原样带过来，未丢）
- **改动**：`src/pages/amochiroom/[slug].astro` L168 `.board .it` 加 `height:auto`（1 行；内联 style、数据、engine.js 全未动）
- **build**：`CI=true pnpm run build` → 792 页通过；产物 `dist/_astro/_slug_.DenDAeSk.css` 内为 `.board .it{position:absolute;transform-origin:center;height:auto;...}`
- **实测**（astro preview :4322 + Chrome CDP，非 vision 判定）：
  - level-1 首件 `103-2.webp`：修前 computed height=326px（=HTML attr）rect 100.6×326 → 修后 110.97px rect 100.6×111，自然比 261×288=0.906，实测 0.906
  - 修前 level-1 有 4/26 件溢出 board（高度锁定所致）
  - 比例回归：桌面 level 1/50/73/100/133 + 手机 1/50/53/79/100/133，逐件 computed w/h vs 图片自然比 → 最大偏差 **0.19%**，超 1.5% 阈值 **0 件**
  - 落位：桌面 8 关（1/50/53/73/79/98/100/133）超界 0 件；手机 6 关仅 level-53 `9-7.webp`（镜像 fx=-1 + 旋转 -38°）溢出 7.4px —— 同一件在可玩页 `/room-sort-game-online/?level=53` 也溢出 15.7px（板宽 591），**数据原样，非回归**
  - 圈选回归：level-73 桌面 16 环/16 号、level-1 手机 6 环/6 号，环心 vs 物品中心偏差 **0.0px**
  - 可玩页对照：`?level=53` 201 件 maxDev 0.0009，与攻略页同构
  - 截图：`~/.hermes/cache/scratch/amo-{before,after}-l1-{desktop,mobile}.png`、`amo-l73-{desktop,mobile}.png`
- **未提交**：等点头。P2 提交范围 / P3 标题口径 / 手机房间高度见 §6
- **环境更正**：:4322 现在是 `astro preview`（不是 handoff 写的 `python3 -m http.server`）；RECON.md 实际在 `.worktrees/room-sort-floor-plan/research/room-sort-floor-plan/RECON.md`（`gamincat_extract/` 已不在）

