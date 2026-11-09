# 疯狂收杂物 L47 试玩原型 —— 重建报告

重建日期：2026-10-28
源材料：`tool_calls.jsonl`（371 条工具调用导出）、`session_20261026_113952_7b2c4f.jsonl`（旧会话全文）、
微信包 `wx1644b5d3f47969f0/15/*.wxapkg`

## 1. 考古映射（mid → 产物）

| 文件 | 来源 | 后续 patch | 终态 |
|---|---|---|---|
| `scripts/render_levels_v7.py` | mid 488728 write_file（4347B） | 488746 文档串 | 4434B 逻辑 + 路径 rebase |
| `scripts/make_play_L47_full.py` | mid 488982 write_file（4615B） | 488993（PNG→WEBP q82）、488998（场景图 BytesIO 写法） | 4651B 逻辑 + 路径 rebase |
| `scripts/play_template_v3.html` | mid 488988 write_file（11332B） | 488993 同消息 `sed` 把 3 处 `data:image/png` → `webp` | 11780B |
| `scripts/export_levels_all.py` | execute_code mid 487119 的导出段 | — | 重写为独立脚本（去掉预览 HTML 段） |
| `scripts/unpack_pipeline.py` | 486918 / 486923 / 487079 的解包 + `raw_decode` 流恢复 | 487134 的 ofs 修正已内建 | 新脚本 |
| `scripts/fetch_backgrounds.py` | execute_code mid 487417（CDN 虚线 uuid + `.jpg`） | — | 新脚本 |
| `scripts/build_sprites_webp.py` | make_play 内联 `sprite()` 同参数外置 | — | 新脚本 |
| `scripts/make_v7_bg.py` | v7 背景合成规则外置 | — | 新脚本 |
| `scripts/verify_delivery.py` | 旧会话 `node --check` + 结构自检 | — | 新脚本 |

patch 重放：5 个 patch（含 sed）+ 1 个文档串 patch 全部命中（old_string 出现次数均为 1，无模糊匹配兜底）。
`build/from_log_recovered/` 保留了 write_file 原始全文，可直接 diff 复核。

相对旧版**唯一**改动是路径基线：`~/.hermes/cache/scratch` → `scripts/../build`（`FKSZW_BUILD` 可覆盖），
以及 `SCR/target_unpack/config_docs.pkl` → `BUILD/config_docs.pkl`（新布局 config_docs.pkl 在 build 根）。
算法、参数、绘制顺序、编码质量未改一字。

## 2. 从包重跑

> **2026-11-09 瘦身（135M → 26M）**：中间产物（`build/unpack` 36M、`build/fkszw_bg` 42M、`build/fkszw_v7` 4.4M、`build/sprites_webp` 652K、`game/packs` 22M）已删，只保留 `build/dec`（20M，脱离微信容器的独立备份）+ `levels_all.json` + `config_docs.pkl`。下表所有产物用 `bash scripts/run_pipeline.sh` 从 dec 重建，无需重回微信。

| 步骤 | 输出 | 结果 |
|---|---|---|
| 解密 + 解包 | `build/dec/`、`build/unpack/{app,config,assets,wx_sdk}` | 61 / 137 / 6005 / 2 文件；`ofs` 绝对偏移自校验通过 |
| 文档流恢复 | `build/config_docs.pkl` | 2232KB 流 → 547 文档（81 关卡 + 81 索引 + 278 品类目录） |
| 关卡数据导出 | `build/fkszw_levels_all.json` | **1246KB，81 关，15616 件物品**；L47=207 件 / 34 桶 |
| 背景（CDN） | `build/fkszw_bg/gamebg_*.jpg` | 76/81；缺 3/45/65/66/68（CDN 本身 404，旧会话同样缺） |
| v7 渲染 | `build/fkszw_v7/L47_数码产品店.png` | 可见 207/207，场地 1288×986，堆底 96.8% |
| v7 纯背景 | `build/fkszw_v7/L47_数码产品店_bg.png` | 1460×1560，bg 原生 1440×1560，居中偏移 10（bgPosX=10） |
| 内联场景 | `build/fkszw_v7/L47_scene_800.jpg` | 800×854，60KB |
| 精灵 WebP 集 | `build/sprites_webp/*.webp` + `manifest.json` | 136 张物品（254KB 原始）+ 22 张家族样图；与 HTML `SPR` **136/136 字节一致** |
| 交付 HTML | `fkszw_play_L47_full.html` | **531,421 B（519KB）** |

## 3. 与旧会话数值逐项对比

| 指标 | 旧会话 | 本次重建 | 判定 |
|---|---|---|---|
| 34 桶=家族分区 | PASS | PASS | ✅ |
| 家族数 | 22 | 22 | ✅ |
| 家族名命中 | 22/22 | 22/22 | ✅ |
| 有遮挡依赖的物品 | 168/207 | 168/207 | ✅ |
| 体积分解 | bg 80K + 精灵 340K + 数据 21K = 507K | bg 80K + 精灵 340K + 数据 21K = 507K | ✅ |
| 写出体积 | 518 KB（ls 519 KB） | 518 KB（531,421 B） | ✅ |
| JS 语法 | OK | `node --check` OK（1 个 script 块，443KB） | ✅ |
| 物品/桶/家族 | 207 / 34 / 22 | 207 / 34 / 22 | ✅ |
| 精灵 data URI | >170 | 171 段（136 精灵 + 34 桶样图 + 1 背景） | ✅ |
| v7 L47 渲染 | 可见 207/207，1288×986，96.8% | 同 | ✅ |
| 桶序样例 | 无人机 6 / 相机 5 / 纸袋 5 / 手机壳 6 / 数码手表 7 / 光碟 5 | 同 | ✅ |

真浏览器（file://）验收：207 件物品进 DOM、0 张解码失败、背景加载成功（800×854）、
首桶 0/6、13 件高亮可点；点 1 件 → `1/6`、`已收 1/207`；点非当前品类 → 抖动 red deny +
toast「这个桶还没开（第 3 桶才是它）」。

## 4. 缺什么 / 注意

- 背景 5 张（bg 3/45/65/66/68）CDN 404，包内也没有；**L47 不受影响**。渲染器对此有 try/except 兜底。
- 包实际路径是 `users/e0a340392a2438ccfe26892de5708186/`，任务给的 `810cae…` 目录在本机不存在。
- `play_template_v3.html` 本身没有 `<title>`；浏览器里读到的 `🐴` 是 browser-use 工具注入的标签页标题（`about:blank` 同样返回 `🐴`），不是文件内容。
- 内联预览红线：交付物 531,421 B，比 512KiB（524,288B）只多 7KB。旧会话实证此体积在 `::preview` 内嵌时会截断
  →「背景在、物品全灭」。**交付必须走 pane tab / http 外链，不要内嵌**。
- **解释器坑（实测根因）**：系统 `/usr/bin/python3`（3.9.6）装有 pycryptodome 3.23.0，可直接 `import Crypto`；
  Hermes 内置 python 3.14 与 `/opt/homebrew/bin/python3` 都没有。前台 `python3` 命中 `/usr/bin/python3` 所以能跑，
  后台/cron 的 PATH 先命中 homebrew python3 → `ModuleNotFoundError: No module named 'Crypto'`。
  `scripts/run_pipeline.sh` 已内建探测+回退并打印实际解释器；若换机仍报错：`python3 -m pip install --user pycryptodome pillow`。
  **同样别用 execute_code 内核跑解密**（内核是 Hermes 3.14，无 Crypto）——解密/解包一律走 terminal 的 `python3`。

## 5. 一键重建

```bash
bash scripts/run_pipeline.sh    # 解密→解包→关卡数据→背景→v7→精灵→HTML→自检
```

全流程实测输出与本报告一致，HTML 字节数稳定为 531,421 B。
