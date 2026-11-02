# P1 回退说明（2026-11-02）

## 发生了什么
P1 第一版（子 agent 三路改写 + 主会话 26 处补丁）改动了不在范围内的内容，违反「不动清单」：

- 标题 6 行：H1 ×3（how-to-play-shikaku、rules、solver）、H2 ×1（meowdoku）、H3 ×2（rules）
- `public/pictomino/index.html`：`<meta name="description">` 与 JSON-LD description（TDK 类）
- FAQ 答案与 JSON-LD 文字约 110 行，另有 pictomino 可见 FAQ 段落 7 行

处置：这些行逐行还原到 HEAD。只保留正文段落的标点改动。

## 复验（build 270 页 exit 0；289 个 URL 对改前线上基线）
| 检查项 | 结果 |
|---|---|
| 标题 H1–H6 | 0 页变化 |
| title / meta | 0 页变化 |
| JSON-LD 原文 | 0 页变化 |
| 数字多重集 | 0 页变化 |
| JSON-LD 与可见文字不一致 | 0 页新增（pictomino 补回退后） |
| 新增行命中受保护特征 | 0 行 |
| 正文+标题可见 em dash | 3,226 → 2,860（剩余多为标题、TDK、FAQ、JSON-LD） |
| 有可见文字变化的页 | 50 页（全是正文标点） |

## 遗留（需要决定或人工再过）
1. **FAQ/JSON-LD 的 em dash**：按规则保留。若要放开，需要你明确授权；放开后必须两边逐字一致。
2. **标题与 TDK 的 em dash**：按规则保留。
3. **既有问题（非本轮造成）**：`/meowdoku-guide/` 的 cheat sheet FAQ，JSON-LD 写「in this guide」，可见文字写「above」。改前即不一致。按规则保留，建议批准后统一对齐。
4. **句式可读性**：P1 中有些逗号列表读起来拗口。例：rotate-rings/level-3「Level 3 runs four colors: blue, orange, purple and red, every piece a free-turning C-shape.」建议人工再过一遍。

## 方法记录
- 子 agent 自报的「清零」不可信，以渲染后页面（dist 对改前线上基线）为准。
- 抽读脚本把标签替换成空格，会显示出「Akari , our」这种假象。源码是 `Akari</a>, our`，没有问题。查标点前先看源码。
