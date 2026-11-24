# 解包过程与证据记录（Amochiroom Puzzle: Room Sort 1.0.20）

时间：2026-11-24 18:20–18:35（Asia/Shanghai）
工作目录：`research/amochiroom/unpack/`

## 1. 下载

| 时间 | 事件 |
|---|---|
| 18:21 | `curl` 直连 apkcombo 60s 超时（`000`）；`curl -I https://d.apkpure.com/...` 也超时；`www.google.com` 直连超时 |
| 18:22 | 本机 mihomo 监听 127.0.0.1:7890/7891/7897，但 `-x http://127.0.0.1:7890` 一律 `SSL_ERROR_SYSCALL`；`/proxies/GLOBAL` 显示 `now=DIRECT`，节点 delay 测试全部 Timeout；DNS 被劫持（`www.google.com → 69.171.235.22`、`apkpure.com → 199.16.158.8`） |
| — | 主会话接管下载（代理 `ALL_PROXY=http://127.0.0.1:7882`），产物 `amochiroom_1.0.20.xapk` |
| 18:25:27 | 轮询：173,043,712 B (165.0 MB) |
| 18:26:27 | 353,214,137 B (336.8 MB) |
| 18:27:27 | 353,214,137 B，delta=0 → 判定下载完成（连续两次相同且 >300MB） |

**结论**：本机默认出口不可用，必须显式走 7882 代理；下载本身成功，336.8 MB。

## 2. XAPK 结构

`unzip -l amochiroom_1.0.20.xapk` → 22 个条目：

- `com.gamefactory.roomsort.apk`（348,462,410 B，base）
- `config.de/th/zh/ru/tr/fr/hi/pt/it/ja/my/vi/ar/en/es.apk`（语言 split）
- `config.hdpi.apk`、`config.armeabi_v7a.apk`（2.6 MB，native split）
- `icon.png`

内层 APK 顶层统计（`unzip -l | cut -d/ -f1-2 | uniq -c`）：

```
9932 assets/www
 672 res/drawable
 520 res/layout
 ...
  14 assets/template
  12 explorestack/protobuf
```

`assets/www` 有 9,932 个文件 → **WebView 套壳的 HTML5 游戏**，不是 Unity。

**Unity 检查**：`unzip -l com.gamefactory.roomsort.apk | grep -Ec "libil2cpp|bin/Data|\.bundle|global-metadata"` → **0**。
APK 内也没有 `assets/bin/Data`、`assets/aa/`、`*.bundle`。因此 UnityPy 全程未使用。

内层 `assets/www` 目录分布：

| 目录 | 文件数 | 内容 |
|---|---|---|
| `assets/art` | 5,285 | 物品/背景 webp + `v3_review_20261104/{catalog,manifest,colliders}.json` |
| `assets/rooms` | 2,502 | 房间图 |
| `assets/items` | 1,492 | 物品图 |
| `game/src` | 280 | 游戏逻辑（ES modules） |
| `assets/data` | 146 | 关卡/美术清单 JSON |
| `assets/i18n` | 74 | 语言包 |
| `assets/levels` | 3 | `lock.png/star_on.png/star_off.png`（**不是**关卡数据，容易误判） |

## 3. 关卡数据定位

第一眼在 `assets/data` 看到 `storage-legacy/level-1.json … level-135.json`（135 个）+ `index.json`：

```json
{"format":"roomsort.legacy-board-catalog","version":1,
 "sources":{"catalog":{"id":"…:assets/art/v3_review_20261104/catalog.json","sha256":"0cbe77c…"}},
 "levels":{"1":{"file":"level-1.json","bytes":1871,"sha256":"fb93c4…"}, …}}
```

单关字段：`level, name, bg, bgFile, bgPosX, order[{type,count}], content[{id,x,y,scaleX,scaleY,angle}]`。

但这是**旧格式副本**（`index.json` 自己写明来源是 catalog.json）。真正的运行时真源是：

`assets/www/assets/art/v3_review_20261104/catalog.json`（2,852,610 B）

```json
{"items":{…2657 条 w/h/poly…},
 "levels":[…133 条…],
 "types":{…422 条 id→中文标签…},
 "levelSequence":"compact-v11"}
```

`game/src/view/assets.js::loadCatalog()` 的路径确认：读 `data/art-sets.json` →
`{"default":"v3_review_20261104","sets":{"v3_review_20261104":{"catalog":"art/v3_review_20261104/catalog.json","manifest":"art/v3_review_20261104/manifest.json",…}}}` →
`normalizeLevelCatalog(catalog)`。`levelSequence` 已是 `compact-v11`，normalize 原样返回，**不重排**。

## 4. 规则常量取证（逐条源文件）

| 常量 | 值 | 文件 |
|---|---|---|
| `ORDER_SLOTS` / `ORDER_OPEN` | 3 / 2 | `game/src/core/rules.js` |
| `BUFFER_SLOTS` / `BUFFER_OPEN` | 7 / 5 | 同上 |
| `HINT_TIMES` / `CLEAR_COUNT` / `EAGLE_MAX` | 3 / 3 / 5 | 同上 |
| `COVER_CONTACT_MIN` / `COVER_BLOCK_MIN` | 0.01 / 0.045 | 同上 |
| buffer 变体 | control/deadlock_notice/full_fail/full_fail_plus_one = (5,7,false)/(5,7,false)/(5,7,true)/(6,8,true) | `game/src/core/buffer-failure.js` |
| 箱子容量默认 3、实验组 4 | — | `game/src/core/game.js` 构造参数 + `services/order-capacity.js`（`four_boxes`） |
| 星级 control | 3×物品数秒→3 星，5×物品数秒→2 星 | `services/meta.js` → `META{star3PerItem:3,star2PerItem:5}` |
| 星级 treatment | 720s / 960s | `services/star-rating.js` |
| 每关估算通关率 | 1–59 关 | `data/level-odds.js`，`bands:{easy:60,middle:25}` |

卡死逻辑（`game.js`）：入箱失败 → 找空 buffer 槽；无空槽 → `#fail()`。`#checkBuffer()` 在 `used>=open` 且 `!failWhenFull` 时还要求 `!#hasDirectMove()`（没有任何可直入箱的物品）才失败，即「槽满但仍能继续消」不算死。

## 5. 导出与校验

脚本：`export_levels.py`（纯标准库）。产物：

- `amochiroom_levels.json` — 7,117,106 B
- `levels_index.csv` — 133 行

校验输出（脚本 stdout，可复跑）：

```
levels 133 items 25943 boxes 5091
capacity mismatches 0
legacy checked 130 matched 130 diffs 0
levels missing en name []
items without sprite 0
```

- **容量守恒**：每关 `Σ box.capacity == item_count`，并按 type 分组后逐类相等 → 133/133 通过，`meta.integrity.levels_with_capacity_mismatch = []`。
- **双源交叉**：`catalog.json` vs `storage-legacy/level-{source_level}.json`，比较 `order`（type/count）与 `content`（id/x/y/scaleX/scaleY/angle），130 个基线关全部逐字节一致；3 个新增关（131–133）legacy 侧没有对应文件，故未参与比对。
- **贴图**：`manifest.json.items` 4,340 条 `id → items/*.webp`，25,943 个物品全部命中。
- **命名**：`catalog.levels[].name`（中文）+ `i18n/en.json` 的 `level.*`（英文），133/133 命中。

关号重排（`services/level-sequence.js`）：
`REMOVED_LEVELS=[53,73,79,98,133]`，135 旧关删 5 → 130 基线；`mainline-extension.js` 追加 3 关（sourceLevel 136–138）→ 133。
实测映射：`level 53 ↔ source 54`、`level 73 ↔ source 75`、`level 96 ↔ source 100`、`level 130 ↔ source 135`、`level 131 ↔ source 136`。

## 6. 未做/边界

- 未导出 webp 图片本身（只留 `sprite` 路径映射）。
- 未做关卡可解性求解（需要模拟遮挡图 + 5 槽约束；数据已足够，本次未跑）。
- 线上 remote content packs 与 Firebase 实验可覆盖第 1/2/3 关整套房间布局；本导出是未命中实验时的随包基线（新玩家默认体验）。
- `est_pass_rate_pct` 仅 1–59 关，是客户端离线估算（难度标签展示用），不是后台真实数据。
- 第一次跑脚本时 `level-odds.js` 用 JSON 解析失败（JS 对象键未加引号），已改为正则提取 `bands` 与 `levels` 数字对。
- `README.md` 里的示例关卡 JSON 为节选（items/boxes 各截断），完整数据在 `amochiroom_levels.json`。
