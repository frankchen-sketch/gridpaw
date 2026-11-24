# Amochiroom 关卡数据集 — 来源与复现

产物：`src/data/amochiroom-levels.json`（130 关）+ `src/pages/amochiroom/`。
本文件记录数据从哪来、怎么重算、哪些结论不能从数据里推出来。

## 一、数据来源（全部取自官方 APK，无第三方站引用）

APK：`com.gamefactory.roomsort` **1.0.20**（2026-11-21 上架版本），337MB **XAPK**。
下载链：apkcombo 下载页 `POST soqplay_download_file=<sha256>` → 303 → `apkcombo-transfer.*.workers.dev/file/<opaque>`。
⚠️ 本机 curl 必须走代理（`ALL_PROXY=http://127.0.0.1:7882`），否则全站直连超时。

**关键事实：这游戏不是 Unity，是打包进 APK 的网页游戏**（`assets/www/`，9,651 个文件）。
所以关卡数据是明文 JSON/JS，不需要 IL2CPP 逆向、不需要 UnityPy。

| 取用的文件 | 内容 |
|---|---|
| `assets/www/assets/data/storage-legacy/level-1..135.json` | 关卡快照：`order[]`（箱子 type+count）、`content[]`（物品 id/x/y/scale/angle）、`bgFile` |
| `assets/www/assets/data/storage-legacy/index.json` | 关卡目录（135 条 + deals） |
| `assets/www/assets/i18n/system/en.json` | `level.<N>` 房间名、`type.<id>` 物品类别名（667 个） |
| `game/src/services/level-sequence.js` | `REMOVED_LEVELS=[53,73,79,98,133]`、`LEVEL_SEQUENCE_VERSION=compact-v11` |
| `game/src/core/rules.js` | `ORDER_SLOTS=3, ORDER_OPEN=2, BUFFER_SLOTS=7, BUFFER_OPEN=5, HINT_TIMES=3, HINT_IDLE_SECONDS=15, CLEAR_COUNT=3, EAGLE_MAX=5` |
| `game/src/core/buffer-failure.js` | buffer A/B：`control`/`deadlock_notice`(5/7, failWhenFull=false)、`full_fail`(5/7,true)、`full_fail_plus_one`(6/8,true) |
| `game/src/data/deal-variants.js` | `proofs[].path`（厂商预计算的合法点击序，按变体） |

## 二、玩家编号如何得出

游戏不是 1..135 直给，而是 **legacy 编号扣掉 `REMOVED_LEVELS` 后重排**（`mapLegacyLevel`）：

```
current = legacy - count(r in REMOVED if r < legacy)
```

135 − 5 = **130 关**，连续无缺口。校验方式：`level.1=My Study`、`level.3=Messy Living Room`
—— 与 YouTube 上 "Level 3 Messy Living Room" 的实况标题一致，说明映射正确。

复现：`python3 scripts/extract_levels.py`（在 `research/amochiroom/` 下跑），
依赖 `unpack/www/`（如已删，按上面链路重下 APK + `unzip` 四个目录即可）。

## 三、数据完整性（发布前门禁）

- 每关 `sum(order[].count) === content.length`，**130/130 全部精确相等**（0 例外）
- 全站合计 4,957 个箱子 / 25,342 件物品
- 单箱容量分布：3×7、4×1046、5×2664、6×928、7×248、8×63、9×1
- 房间名 129 个唯一（130 关里 Level 2 "Whose Room?" 与另一关语义相近，非重复）

## 四、不能从数据推的结论（写作红线）

1. **没有固定点击序**。`level2-random-layout.js` / `level3-random-layout.js` / `early-level-random-layout.js`
   按玩家发牌；`fixedOrder` 只在部分关为真。任何"第 N 步点哪个"都是编的 ——
   页面因此只承诺「箱子清单 + 数量」这一层事实。
2. **buffer 槽位数不是唯一的**（A/B 实验四档），页面写 5/7 是 control 口径，且已注明"解锁另外两格"。
3. **不能声称官方授权**。页面已标注独立攻略、非官方关联。
4. **不要拿 `room sort level N` 的搜索量**：那批词是 Gamincat《Room Sort – Floor Plan Puzzle》的，
   词面撞车、玩法不同（摆家具 vs 物品入箱）。

## 五、版权与仓库纪律

- 解包产物（APK、`assets/www/`、游戏 JS/CSS/图）**一律不入库**：
  已加 `.git/info/exclude` → `research/amochiroom/unpack/`（跨 worktree 生效），并在 `.gitignore` 记一条。
- 页面只用**事实性数据**：房间英文名、箱子类别名、数量。不用游戏美术、不用它的 UI 截图、不搬它的代码。
- lint 曾因扫到解包 JS 报 100+ 假错，隔离后 `pnpm run verify` 全绿。
