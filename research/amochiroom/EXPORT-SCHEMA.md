# Amochiroom Puzzle: Room Sort — 关卡数据导出说明

包名 `com.gamefactory.roomsort`，开发商 ABF ALPENHOF，版本 **1.0.20 (versionCode 20)**。
本文说明 `amochiroom_levels.json` 的字段语义、游戏规则常量来源，以及验证证据。

---

## 1. 数据来源与引擎真相

| 项 | 值 |
|---|---|
| 下载物 | `amochiroom_1.0.20.xapk`（XAPK = base APK + config splits） |
| XAPK 大小 / SHA-256 | 353,214,137 B / `a244c32d7c74d648…`（完整值见 JSON `meta`） |
| base APK | `com.gamefactory.roomsort.apk`，348,462,410 B |
| 版本 | `assets/www/game/src/view/build-info.js` → `{"version":"1.0.20","code":"20"}`；AndroidManifest 字符串池同样是 `1.0.20` |
| 引擎 | **不是 Unity**。`assets/www/` 有 9,932 个文件，是 WebView 套壳 + HTML5 Canvas 游戏；APK 内 `libil2cpp / bin/Data / *.bundle / global-metadata` 命中数为 **0** |
| 关卡目录（唯一真源） | `assets/www/assets/art/v3_review_20261104/catalog.json`（2.85 MB，`levelSequence: "compact-v11"`） |
| 加载路径 | `game/src/view/assets.js::loadCatalog()` 读 `data/art-sets.json` → `art/v3_review_20261104/catalog.json` → `normalizeLevelCatalog()` |

`catalog.json` 顶层：`items`（2657 个物品几何 w/h/poly）、`levels`（133 关）、`types`（422 个类别中文标签）、`effects`、`itemSounds`、`levelSequence`。

---

## 2. 交付文件

| 文件 | 说明 |
|---|---|
| `amochiroom_levels.json` | 主数据（约 6.8 MB）：133 关 × 25,943 个物品 × 5,091 个收纳箱 |
| `levels_index.csv` | 133 行速览表（关号/中英房名/箱数/物品数/难度） |
| `export_levels.py` | 可复现导出脚本（读 APK 解包目录 → 生成上面两个文件） |
| `NOTES.md` | 解包过程与失败/取证记录 |
| `apk_data/assets/www/…` | 从 APK 抽出的原始 Web 资源（catalog、manifest、i18n、game/src） |

---

## 3. JSON 顶层结构

```jsonc
{
  "meta":  { … },        // 版本、哈希、源文件、计数、交叉校验结果
  "rules": { … },        // 临时槽/箱子/星级等全局规则常量
  "types": { "zh": {…}, "en": {…} },  // 类别 id -> 箱子上写的标签
  "levels": [ … ]        // 133 个关卡对象，按 level 升序
}
```

### 3.1 `meta`（关键字段）

| 字段 | 含义 |
|---|---|
| `apk_version` / `apk_version_code` | `1.0.20` / `20` |
| `xapk_sha256` / `base_apk_sha256` | 下载物与内层 APK 的 SHA-256 |
| `engine` | 引擎判定说明（WebView hybrid + HTML5 canvas） |
| `level_catalog_source` / `level_catalog_sha256` | 关卡唯一真源路径与其哈希 |
| `level_sequence` | `compact-v11`（决定关号重排规则，见 §5） |
| `level_count` / `item_count` / `box_count` | 133 / 25943 / 5091 |
| `legacy_cross_check` | 与另一份 `storage-legacy/level-N.json` 逐关比对：130 关全部一致，0 差异 |
| `integrity.levels_with_capacity_mismatch` | `[]` —— 每关「箱子容量总和 == 该类别物品数」全部成立 |

### 3.2 `rules`（每条都能指回源文件）

| 字段 | 值 | 源文件 |
|---|---|---|
| `order_slots` | 3 | `game/src/core/rules.js` → `ORDER_SLOTS=3` |
| `order_open_at_start` | 2 | 同上 `ORDER_OPEN=2` |
| `order_capacity_default` | 3 | `game/src/core/game.js` 构造参数默认 `R.ORDER_SLOTS`；`services/order-capacity.js` |
| `order_capacity_experiment` | 4 | `order_capacity.js`（`four_boxes` 实验组） |
| `buffer_slots` | 7 | `rules.js` → `BUFFER_SLOTS=7` |
| `buffer_open_at_start` | 5 | `rules.js` → `BUFFER_OPEN=5` |
| `buffer_failure_variants` | 4 组 {base,total,failWhenFull} | `game/src/core/buffer-failure.js` |
| `star_control` | 3s/物品→3 星，5s/物品→2 星 | `services/meta.js` → `star3PerItem:3, star2PerItem:5` |
| `star_treatment` | ≤720s→3 星，≤960s→2 星 | `services/star-rating.js` → `STAR_RATING_LIMITS` |
| `cover_contact_min` / `cover_block_min` | 0.01 / 0.045 | `rules.js`（遮挡判定阈值） |
| `hint_idle_seconds` / `hint_times` / `clear_count` / `eagle_max` | 15 / 3 / 3 / 5 | `rules.js` |

### 3.3 `levels[i]` 字段

| 字段 | 类型 | 语义 |
|---|---|---|
| `level` | int | 游戏内关号（1–133，连续，唯一的进度键） |
| `source_level` | int | 旧版关号（1–138）。两者差异见 §5 |
| `name_zh` / `name_en` | string | 房间名，来自 catalog `name` 与 `i18n/en.json` 的 `level.*` |
| `name_key` | string | i18n key，如 `level.1`、`level.burger_shop_131_v1` |
| `bg_file` / `bg_sprite` | string | 背景图键 / 实际贴图路径（`art/bg_raw_20261106/backgrounds/…`） |
| `bg_pos_x` | number | 背景水平偏移 |
| `bg_logical_size` | [w,h] \| null | 逻辑画布尺寸（仅 3 个新关卡显式给出） |
| `room_view` | string \| null | `cover`（铺满裁切）等视图模式 |
| `fixed_order` / `fixed_item_colors` | bool \| null | 是否固定箱子顺序 / 固定物品配色 |
| `box_count` / `item_count` / `total_capacity` | int | 箱子数 / 物品数 / 容量合计（后两者恒等） |
| `category_count` | int | 不同类别数 |
| `categories[]` | array | 按类别聚合：`{type, label_zh, label_en, items, capacity}`（items == capacity） |
| `boxes[]` | array | **箱子队列**：`{queue_index, type, label_zh, label_en, capacity}` |
| `items[]` | array | 房间里的物品：`{id, type, label_zh, label_en, sprite, x, y, scaleX, scaleY, angle}` |
| `est_pass_rate_pct` | int \| null | 内置离线估算通关率，仅 1–59 关有（`data/level-odds.js`，属于 `ui_level_hints_v1` 展示实验） |
| `difficulty` | `easy/middle/hard/null` | 由上面 pass rate 按 `bands:{easy:60,middle:25}` 分档 |

### 3.4 物品与箱子的对应关系

- **物品 id 格式 `"<type>-<serial>"`**，如 `103-2` → `type=103`（衣物）。`typeOf = parseInt(id.split("-")[0])`（`core/rules.js`）。
- **物品本身没有独立名字**：同 `type` 的所有物品共用箱标签（`type.N` 文案），区别只在贴图/坐标。
- **`boxes` 是队列不是集合**：`game.js` 里 `queue = level.order.map((o,i)=>({type,total:o.count,index:i+1}))`，同一 `type` 可以在队列里出现多次（= 多个独立箱子，各自计数）。因此 `boxes[].queue_index` 是顺序，不是「第几个箱子槽位」。
- 现场只有 `order_slots = 3` 个箱子位，开局只开 `2` 个；完成一个才补下一个。所以 40+ 箱的关卡是长流水线，不是同时摆 40 个箱子。
- **`items` 数量 == 该 type 的容量总和**（全 133 关 0 例外），即关卡是「恰好装完」设计，没有多余物品。

---

## 4. 玩法规则（从代码读出，用于判断关卡可解性）

- 点物品：若该 type 属于某个**已开且未满**的箱子 → 直接入箱并计数；否则进入**临时槽（buffer）**。
- 遮挡：物品被后绘制且多边形重叠比例 ≥ `cover_block_min` 的物品盖住时不可点（`game.js::isCovered`）。
- **卡死条件**：buffer 全部占用（默认 5 个开局槽）且「没有任何可直接入箱的物品」→ `fail`；若实验规则 `failWhenFull=true` 则槽满即失败。
- 复活/扩容：看广告 `unlockBufferSlot()` 多开一个槽（总上限 `buffer_slots`）。
- 箱子完成 → 从 buffer 里自动吸同类物品（`pullFromBuffer`），再补下一个箱子。
- 星级：见 §3.2 `star_control` / `star_treatment`；`elapsed` 不含暂停与广告时间。
- 体力：`META.energyMax=5`，每关 1 点，30 分钟回 1 点（`services/meta.js`）。

---

## 5. 关号为什么有两套（`level` vs `source_level`）

`services/level-sequence.js`：

```js
const LEVEL_SEQUENCE_VERSION="compact-v11",
      REMOVED_LEVELS=Object.freeze([53,73,79,98,133]);
```

- 旧版共 138 关，删掉 5 关后重排成 **130 关基线**；`mainline-extension.js` 又追加 3 关（`burger_shop_131_v1`、`dentist_shop_132_v1`、`lost_found_133_v1`，`sourceLevel` 136–138），共 **133 关**。
- 例：`level 53` ↔ `source_level 54`（旧 53 被删）；`level 96` ↔ `source_level 100`（旧 96–99 中删了 98）。
- 做关卡复刻时以 `level` 为准；要跟旧资料/旧截图对齐时用 `source_level`。

---

## 6. 验证证据（不是估计）

1. **条目数**：133 关、25,943 个物品、5,091 个箱子、422 个类别标签。
2. **容量守恒**：逐关 `Σ boxes[].capacity == items.length` 且按 type 分组后 `capacity == 物品数`，**133/133 关全部通过**（`meta.integrity` 为空数组）。
3. **双源交叉验证**：APK 内另有一份 `assets/data/storage-legacy/level-1…135.json`（旧格式）。对 130 个基线关逐关比对 `order`（type+count）与 `content`（id/x/y/scale/angle），**130 关完全一致，0 差异**。
4. **贴图全覆盖**：25,943 个物品都在 `manifest.json` 的 `items`（4,340 条 id→webp）里找到贴图路径，缺失 0。
5. **命名全覆盖**：133 关全部有中文名与英文名（英文来自 `i18n/en.json` 的 `level.*`，133/133）。
6. **抽样**：第 1 关「我的书房 / My Study」5 箱 26 件（零食 5、书籍 5、电子 6、衣物 4、文具 6）；第 40 关「宠物店 / Pet Shop」37 箱 196 件 23 类；第 133 关「失物招领处 / Lost and Found」48 箱 192 件。

抽样（第 1 关，节选）：

```json
{
 "level": 1, "source_level": 1, "name_zh": "我的书房", "name_en": "My Study",
 "name_key": "level.1", "bg_file": "1.jpg", "bg_sprite": "art/bg_raw_20261106/backgrounds/001.webp",
 "box_count": 5, "item_count": 26, "total_capacity": 26, "category_count": 5,
 "categories": [{"type":100,"label_zh":"零食","label_en":"Snacks","items":5,"capacity":5},
                {"type":101,"label_zh":"书籍","label_en":"Books","items":5,"capacity":5}],
 "boxes": [{"queue_index":1,"type":101,"label_zh":"书籍","label_en":"Books","capacity":5},
           {"queue_index":2,"type":104,"label_zh":"文具","label_en":"Stationery","capacity":6}],
 "items": [{"id":"103-2","type":103,"label_zh":"衣物","label_en":"Clothes",
            "sprite":"items/103-2.webp","x":-122,"y":-498,"scaleX":1,"scaleY":1,"angle":0}],
 "est_pass_rate_pct": 84, "difficulty": "easy"
}
```

---

## 7. 边界与注意事项

- **这是「随包基线」**：线上还会通过 remote content packs / `content-packs.js` 覆盖个别关卡，以及大量 Firebase A/B 实验替换第 1/2/3 关的整套房间（study / tatami / entryway / attic / retro / super / tang / closest_variants 等，见 `services/experiment-manifest.js`）。本导出 = 未命中任何实验时的默认关卡序列，**这正是新玩家实际会玩到的基线**。
- 被删的 5 个旧关（53/73/79/98/133）在基线里不存在；但 `storage-legacy/` 里仍有它们的 JSON，可用于考古。
- `est_pass_rate_pct` 只覆盖 1–59 关，是客户端内置的离线估算值（用于难度标签展示），不是官方后台真实数据；60 关以后为 `null`。
- 贴图只记录了路径映射，**没有导出 webp 文件本身**（原图都在 APK 的 `assets/www/assets/art/…` 里，需要时再抽）。
- 物品坐标是房间逻辑坐标系（y 向上为正，单位≈像素），`scaleX=-1` 表示水平翻转；旋转角 `angle` 单位为度。
- 未做「可解性求解」：本导出提供完整的物品/箱子/遮挡阈值数据，但不保证每关在默认 5 槽下都存在通关路径（游戏本身靠广告扩容兜底）。

---

## 8. 复现

```bash
cd research/amochiroom/unpack
unzip -o amochiroom_1.0.20.xapk com.gamefactory.roomsort.apk
unzip -o com.gamefactory.roomsort.apk 'assets/www/*' -d apk_data
python3 export_levels.py     # -> amochiroom_levels.json + levels_index.csv
```

（`export_levels.py` 只依赖标准库，不依赖 UnityPy；本游戏没有 Unity 资源。）
