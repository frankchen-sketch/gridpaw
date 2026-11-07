# 交接 · AdSlots（三档广告位）待确认事项
> 交给广告兄弟会话。写于 2026-11-07 23:5x，由攻略会话实测产出。**不要重跑攻略/缩略图那条线。**

## 0. 当前线上状态

- 生产部署 `3a8c45db`（commit `57f58bc8`）= **已提交基线，广告全关**。
- 原因：攻略会话部署 R&E 缩略图时，为避免带上并行 WIP，从干净 worktree 构建部署。你这边的工作区改动一行没动，仍在本机 `~/workspace/gridpaw`。
- 也就是说：`ADSTERRA_OFF=false` + 三档调度器 + 27 个 akari 页注入，**全都还没上线**，等你们自己验收后部署。

## 1. 待确认事项 A（最高优先）：邮件承诺 vs 代码事实

`research/2026-11-07-peter-email-draft.md` 里对 Peter 的承诺原话：

> no ad sits inside a puzzle or over a game control, and **the game pages and the home board stay clean**.

实测代码事实（可自行复核）：

| 项 | 事实 | 复核命令 |
|---|---|---|
| 渲染 `<SideAd />` 的页面 | **188 个** | `grep -rl "SideAd" src/pages \| wc -l` |
| 其中游戏/解题器页 | **17 个**（见下） | 同一份列表按路径筛 |
| AGENTS.md 声称的 `PLAY_SURFACES` 闸 | **代码里不存在** | `grep -rn "PLAY_SURFACES" src/ scripts/` → 空 |

那 17 个 play surface：

```
/  /akari/  /binary/  /crazy-cleanup/  /hashi/  /kakuro/  /kenken/  /meowdoku/
/murdoku/  /nonogram/  /nurikabe/  /slitherlink/  /star-battle/  /solver
/akari/solver  /hashi/solver  /nonogram/solver/
```

历史溯源：`785c19f3 feat(ads): 桌面侧栏 160x600 + 全端文流位扩量（首页+9游戏页）`——当初就是主动往游戏页铺的，随后被 `ADSTERRA_OFF` 全站关掉，现在恢复会一起复活。

**两条路，需法老拍板：**

- **① 补真闸（推荐）**：17 页不渲染广告，邮件不动。理由：71% 流量在攻略页；murdoku 棋盘右列被侧栏吃掉点击是 2026-10-14 真实事故；邮件唯一的资产是「说到做到」。
- **② 邮件改口**：承认游戏页也有广告，重写那段。

## 2. 待确认事项 B：广告单元到底投不投放

本机验不了（我国出口被 Adsterra 拦）：

| 请求 | 结果 |
|---|---|
| 无头 GET `https://bauval.org/22/<key>` | HTTP 200，body **0 字节** |
| 带正常 UA + `Referer: https://gridpaw.com/` | **HTTP 403**（三个 key 全一样）|

三个 key：rail `309484c05af1066efb6f321317c94311` / sticky `c0a7039d4910c7d761aa9df9b0c73367` / top `361fc202189557ef23683b546d7f0393`。

**风险**：盒子空着在页面上就是一块空白，肉眼分不出「没投放」和「广告主没出价」。上线后必须查后台 impressions 是否三个 unit 都有数；若某个 unit 恒为 0，先怀疑 key/状态而不是样式。

## 3. 已完成的遮挡实测（不用重跑）

方法：本地构建副本 + 临时拆掉 AdGate 的 CN/bot 闸（否则国内测不到广告位），3 页（`/`、`/akari/`、`/brain-puzzle-3-level-1/`）× 4 视口（390/800/1280/1512）× 3 个滚动位。**未碰线上、未碰源码。**

| 结论 | 数据 |
|---|---|
| 点击命中检查 | **708 次，0 次命中广告层** |
| 侧栏 vs 内容列 | 内容列 x=255–1095；侧栏 x=63–223 / 1127–1287，两侧各留 32px |
| sticky vs 内容末端 | 滚到底：最后内容 bottom=765，sticky 顶 810，留 45px（`body padding-bottom:100px` 生效）|
| 横向溢出 | 8 视口 `scrollWidth == innerWidth` |
| 边界 | 1349 出 sticky、1350 出侧栏，无重叠期 |
| sticky 关闭键 | 点击 → `display:none` + padding 100→0 + `gp-has-sticky` 移除；`sessionStorage['gp-sticky-closed']=1` 刷新仍关 |

两个**已排除的假警报**（别当 bug 修）：

1. sticky 的 × 按钮被自己的容器命中——自己盖自己。
2. akari 移动端「📋 Copy Image / ⬇️ Save」被顶部广告命中——它们属于胜利弹窗（`opacity:0` + `pointer-events:none`），本来就不可见。判据用 `checkVisibility()`。

**测试注意**：sticky 关闭状态存在 `sessionStorage`，跨页面保留。测广告位前先 `sessionStorage.clear()`，否则会看到「1349px 没有任何广告位」的假象（本会话踩过一次）。

## 4. 若要执行方案 ①（补闸）时的最小改动

1. `src/components/SideAd.astro`：加 play-surface 判断（`Astro.url.pathname` 命中上面 17 条），命中则整组件不渲染（连 AdGate/CSS 都不输出）。
2. 或更彻底：直接从那 17 个页面移除 `<SideAd />`（首页与 9 个游戏页 + 4 个 solver）。
3. 改完必须重建验证：
   ```bash
   pnpm run build
   for r in / /akari/ /binary/ /kenken/ /murdoku/ /nonogram/ /solver /akari/solver; do
     d="dist${r%/}/index.html"   # 注意：/solver 也要补尾斜杠，否则路径拼成 dist/solverindex.html
     n=$(grep -cE 'gp-side-ad|gp-sticky-ad|gp-top-ad|bauval\.org' "$d" 2>/dev/null || echo 0)
     echo "$r -> $n"
   done   # 期望全部 0
   ```
4. 同时更新 AGENTS.md 第 51 行——它现在描述一个**不存在**的 `PLAY_SURFACES` 闸，属误导性文档。

## 5. 纪律提醒

- 部署前查并行 WIP；本仓库攻略线已收尾（R&E 全 11 关 + hub 缩略图已上线），现在只有广告线在动。
- 部署带 `--branch main`（detached worktree 下不加会飘到 Preview）。
- 从干净 worktree 部署前：先 `cp public/<indexnow-key>.txt`（`check-indexnow-key` 会拦），再跑 `node scripts/check-tracked-imports.mjs`。
- 止损铁律不变：任何一起跳转投诉 = 当天撤，不辩护。
