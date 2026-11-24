# Amochiroom 关卡数据集 — 来源与复现

产物：`src/data/amochiroom-levels.json`（**133 关**）+ `src/pages/amochiroom/`。
本文件记录数据从哪来、怎么重算、哪些结论不能从数据里推出来。

## 一、数据来源（全部取自官方 APK，无第三方站引用）

APK：`com.gamefactory.roomsort` **1.0.20（versionCode 20）**，337MB **XAPK**。
下载链：apkcombo 下载页 `POST soqplay_download_file=<sha256>` → 303 → `apkcombo-transfer.*.workers.dev/file/<opaque>`。
⚠️ 本机 curl 必须走代理（`ALL_PROXY=http://127.0.0.1:7882`），否则全站直连超时。

**关键事实：这游戏不是 Unity，是 Android WebView + HTML5 Canvas 的混合应用**
（`assets/www/` 下 9,932 个文件；`libil2cpp` / `assets/bin/Data` / `global-metadata` 命中 0）。
所以关卡数据是明文 JSON，不需要 IL2CPP 逆向、不需要 UnityPy。

| 取用的文件 | 内容 |
|---|---|
| `assets/www/assets/art/v3_review_20261104/catalog.json`（2.85MB） | **关卡真源**：`levelSequence=compact-v11`，由 `game/src/view/assets.js::loadCatalog()` 经 `data/art-sets.json` 加载 |
| `assets/www/assets/data/storage-legacy/level-1..135.json` | 130 关基线镜像（快照），用于交叉校验 |
| `assets/www/assets/i18n/system/en.json` | `level.<N>` 英文房名、`type.<id>` 类别名（667 个） |
| `game/src/services/level-sequence.js` | `REMOVED_LEVELS=[53,73,79,98,133]`、`LEVEL_SEQUENCE_VERSION=compact-v11` |
| `game/src/core/rules.js` | `ORDER_SLOTS=3, ORDER_OPEN=2, BUFFER_SLOTS=7, BUFFER_OPEN=5, HINT_TIMES=3, HINT_IDLE_SECONDS=15, CLEAR_COUNT=3, EAGLE_MAX=5` |
| `game/src/core/buffer-failure.js` | buffer A/B 四档：`control`/`deadlock_notice`(5/7, failWhenFull=false)、`full_fail`(5/7,true)、`full_fail_plus_one`(6/8,true) |
| `game/src/data/level-odds.js` | `LEVEL_ODDS.levels[1..59]` = 每关目标通关率 + 难度带（easy/middle/hard） |
| `game/src/data/deal-variants.js` | `proofs[].path`（厂商预计算点击序，按变体，非全局唯一解） |

## 二、关号如何得出（133 关，不是 130）

旧 135 关删掉 `REMOVED_LEVELS` 后重排为 **130 关基线**，再**追加 3 关**（sourceLevel 136–138）：
`Burger Shop`(131)、`Dental Clinic`(132)、`Lost and Found`(133)。

```
# 130 基线
current = legacy - count(r in REMOVED if r < legacy)
# 追加关：136→131、137→132、138→133（同样扣 5）
```

校验：`level.1=My Study`、`level.3=Messy Living Room` —— 与 YouTube 实况标题
"Level 3 Messy Living Room" 一致；且 catalog 与 storage-legacy 逐关比对
order+content **130/130 零差异**，说明两条链路同源。

复现：
- 全量 133 关：`python3 scripts/extract_levels_full.py`（输出 `unpack/amochiroom_levels.json`，字段语义见 `EXPORT-SCHEMA.md`）
- 130 关基线交叉校验：`python3 scripts/extract_levels_legacy_baseline.py`

## 三、数据完整性（发布前门禁）

- 每关 `Σ boxes[].capacity === item_count`，**133/133 全部精确相等**（0 例外）
- 按 type 分组逐类也相等（不只是总数对）
- 25,943 件物品在 `manifest.json` 的 4,340 条贴图映射中**全部命中**（缺 0）
- 全站合计：**133 关 / 5,091 箱 / 25,943 件**；箱子上实际出现的**不同标签 345 个**
  （`catalog.json` 的 `types` 表有 422 条，多出的部分没在任何箱子里出现 —— 对外只说 345，别说 422）
- 难度数据只覆盖 1–59 关（12 easy / 26 middle / 21 hard），60 关以后游戏没给表 → 页面就不显示
- 房间名 132 个唯一（`Tea Room` 出现两次，是游戏自己重复用名）

## 四、不能从数据推的结论（写作红线）

1. **没有固定点击序**。`level2-random-layout.js` / `level3-random-layout.js` / `early-level-random-layout.js`
   按玩家发牌；`fixedOrder` 只在部分关为真。任何"第 N 步点哪个"都是编的 ——
   页面因此只承诺「箱子清单 + 数量」这一层事实。
2. **buffer 槽位数不是唯一的**（A/B 实验四档），页面写 5/7 是 control 口径，且已注明"解锁另外两格"。
3. **线上可整关替换**：remote content packs + Firebase 实验能换掉第 1/2/3 关布局 ——
   页面写「随包 1.0.20 的清单」，不写「永远等于你屏幕上的」。
4. **不能声称官方授权**。页面已标注独立攻略、非官方关联。
5. **不要拿 `room sort level N` 的搜索量**：那批词是 Gamincat《Room Sort – Floor Plan Puzzle》的，
   词面撞车、玩法不同（摆家具 vs 物品入箱）。

## 五、版权与仓库纪律

- 解包产物（APK、`assets/www/`、游戏 JS/CSS/美术）**一律不入库**：
  已加 `.git/info/exclude` → `research/amochiroom/unpack/`（跨 worktree 生效），并在 `.gitignore` 记一条。
- **美术使用口径（2026-11-24 法老拍板「用」）**：页面引用游戏自己的房间背景与物品贴图，
  但只入库**降采样衍生图**（物品最长边 96–288px 按需（按 3x 屏取） / 背景宽 720px / 索引缩略图宽 240px，webp），
  原始 337MB APK 与原始 webp 不进仓库。每页正文与页脚均写明 "art belongs to ABF ALPENHOF,
  shown here for identification"，页首有非官方声明。风险与取舍记在此处，改动前先问法老。
- lint 曾因扫到解包 JS 报 100+ 假错，隔离后 `pnpm run verify` 全绿。

## 六、美术流水线（`research/amochiroom/scripts/build_art.py`）

一条命令重建「图 + 数据」两件产物，输入全部来自 gitignored 的 `unpack/`：

```
python3 research/amochiroom/scripts/build_art.py
  → public/amochiroom/art/i/*.webp    2362 张物品贴图（最长边 96px）
  → public/amochiroom/art/b/*.webp    133 张背景（宽 720）+ t-*.webp 缩略图（宽 240）
  → src/data/amochiroom-levels.json   133 关，含 bg/bgW/bgH/items/boxes[].thumbs
```

- **几何口径**：`catalog.json` 的 `items[id].w/h` 是 1x 显示尺寸（贴图原始 webp 恰好是它的 2 倍），
  物品坐标原点在背景图中心、单位=背景像素；**显示尺寸 = catalog w/h × |scaleX|/|scaleY|**，
  scale 的符号位才是镜像。`rooms/<room>_vN` 那 40 关（含 131-133）逐件给 0.18~0.85 的**绝对缩放**，
  只取符号会把物品放大 5 倍、糊满整块板（2026-11-24 实锤，L131 单件占板面积 49%）。
  这类关的画布口径另取 `bg_logical_size`（相机逻辑尺寸），其余关用背景原始像素；
  页面按 `left=(bgW/2+x)/bgW`、`width=w/bgW` 换算成百分比，因此每关自适应不同背景宽度
  （背景 1016/1220/1440/1461/1524 五种宽度实测存在）。
- **几何自检（脚本每次跑都打印）**：单件占板面积 Top5。正常区间 0.2%~1%，最大件是 L1 的大件家具
  6.4%；任何 >10% 都说明尺寸口径或坐标错了，别急着上线。
- **命名坑（已修）**：L131–133 的背景都叫 `rooms/<room>_vN/background.webp`，直接取 basename
  会三关互相覆盖 → `rooms/` 前缀的路径改用 `<room>-bg.webp`。改脚本时勿回退。
- 单页图片负载：中位 431 KB（背景 60 KB + 本关用到的不重复贴图），最重 591 KB（L128，164 张）；
  贴图跨 133 页共享、可缓存。
- 数据体量：`amochiroom-levels.json` 2.0 MB（25,943 条物品，紧凑数组 `[file,x,y,fx,fy,angle,w,h,type]`）。
