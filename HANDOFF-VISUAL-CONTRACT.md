# GridPaw 视觉合同落地 — 交接文档

> 日期：2026-09-15 ｜ 会话：Hermes（视觉合同阶段 3/4）
> 分支：main ｜ 最新提交：`c944de6` ｜ 已部署 CF Pages 生产环境

---

## 一、这套工作是什么

把全站散乱的硬编码色值（1957 处引用、几百个 distinct hex）收编进一份**视觉合同**（STYLE.md token 体系），并用**页面巡查底账**（PATROL.md）保证后续 UI 改动不再新增违规。反向立约原则：尊重存量（主色定为使用最多的 #E8A888），不是重新设计。

核心文件：

| 文件 | 作用 |
|---|---|
| `STYLE.md` | 视觉合同 v0.1：40 个 token（亮 28 + 暗 12）+ 白名单 + 收编原则 |
| `PATROL.md` | 巡查底账：每页改动后按 5 项清单验收，记录违规数变化 |
| `STYLE-tail-inventory.md` | 长尾色值清单（188 个待收编值，按页分解） |

## 二、已完成的（按提交顺序）

### 1. 首页 index.astro（Shikaku）— 43 违规 → 0 ✅ 已部署
- `:root` 落地 `--gp-*` token 桥（25→38 个），旧 `--mt-*` 变量改为引用合同（别名兼容，akari/community 页不受影响）
- 75 处 hex → token 引用
- 7 处 Google SVG 品牌色保留白名单（#FFC107/#FF3D00/#4CAF50/#1976D2）

### 2. 首页动效 GSAP 化 ✅ 已部署，用户已验收（「有 duang 一下」）
- 猫块放置：squash-stretch（scale 0.3 起跳 + back.out(3) 回弹 + 落地挤压拉伸）
- 胜利爪印雨：GSAP timeline，34 彩纸 + 16 爪印，各自随机轨迹/旋转/时长
- 胜利面板：标题弹入 → 猫块 stagger 上浮 → 按钮依次滑入
- `prefers-reduced-motion` 或 GSAP 加载失败 → 自动降级回 CSS 动画
- GSAP 3.13.0 走 jsdelivr CDN，**同步加载（无 defer）**

### 3. akari/play.astro — 51 违规 → 0 ✅ 已部署
- **合同新增「暗色调色板」一节**（12 个 `--gp-dark-*` token）——该页有完整暗色模式（19 处媒体查询块），先立暗色合同再收编
- 页内 `:root` 加暗色 token 桥

### 4. akari/cheats.astro — 39 违规 → 0 ✅ 已部署（全站首个 0-hex 页面）
- **发现并修正暗色主题撞色**：该页暗色模式是旧遗留的冷色 navy（#1a1a2e/#16213e/#0f0f23），与 play 的暖色暗色两套体系。全部归入暖色 dark token
- 合同新增 token：`--gp-dark-ink #0F0B08`（暖色近黑，棋盘黑格）
- 合同新增收编原则：**冷色 navy 暗色底一律违规，暗色只有暖棕一族**

### 5. 过程中修掉的 3 个 bug（都是自己引入或暴露的）
1. **`typeof window.gsap === 'function'`**——gsap 是 object，条件恒假，两个动画分支从未执行（用户「感觉没改动」的根因）。改判 `'undefined'`
2. **Astro 裸 `<script src>`** 会被 Rollup 拿去打包报错——页面级脚本必须 `is:inline`
3. **CAT_PALETTE JS 数据色被 token 化**——colorEmoji 用 hex 做 object key，批量替换导致分享 emoji 全失效。规则：**JS 数据对象的色值 key 不是样式，不得替换**（已写入合同白名单）

## 三、还没做的

### A. 样式收编（按优先级）
| 目标 | 规模 | 备注 |
|---|---|---|
| akari/levels/easy.astro | 9 违规 | PATROL.md 里已有逐条清单，最快 |
| akari/daily.astro | 85 raw | 收编重点 |
| akari/index.astro | 70 raw | |
| akari/cat-logic-puzzle / akari-puzzle | 55 raw ×2 | |
| akari/logic-puzzle / light-up-puzzle | 51 raw ×2 | |
| 其余 sudoku-with-pictures / [id] / games-like-sudoku 等 | 各 24-50 raw | |
| pictomino 系页面 | 未盘点 | 下一阶段 |
| index.astro 剩余 raw hex | 132 raw | 大部分是 CAT_PALETTE 白名单数据色，需甄别 |

⚠️ raw 数含白名单色（CAT_PALETTE 数据色、纯白、token 自身定义），实际违规数收编时需按合同甄别——首页 132 raw 里只有约 7 处是真白名单。

### B. 验证欠账
- **胜利面板 GSAP 入场动画**没人眼验证过——被引擎 bug 挡住通关不了。引擎修好后通关一关即可看
- PATROL 尚未铺开到 akari 其余页面（目前只有 easy 样板 + 首页记录）

### C. 明确不在本会话范围
- **算法引擎 bug**——用户明确说「有别的会话在修了」，不要动 puzzle-engine.js / akari-engine.js
- 胜利动效进一步调参——等用户通关后给反馈

## 四、给下个会话的操作要点（避坑）

1. **批量替换脚本前先分拣 JS 数据色**：`colorEmoji`/`CAT_PALETTE` 的 hex key 碰不得
2. **暗色页面先看暗色块分布**再动手：`@media (prefers-color-scheme: dark)` 块内的颜色归 `--gp-dark-*`，块外归亮色 token。navy 一律判违规
3. **验证要在 production 做**：dev 环境会被 Chrome 自动暗色模式污染（body 出现 rgb(32,33,36) 这种 Chrome 色），假数据
4. **Astro 页面脚本**：`is:inline` + GSAP 同步加载（无 defer），否则主脚本跑时 gsap 未就绪
5. token 桥放页内 `:root`（Astro scoped style 编译后 `:root` 是全局的，build 已验证）；新页面收编时把用到的 token 复制进页内桥即可，不用改全局
6. 部署后跑 IndexNow（`pnpm run deploy` 已含）

## 五、验收状态

- 首页弹性动效：用户实测 ✅
- play/cheats 暗色模式：CDP 模拟 production 实测 ✅（暗底/暗文字/分区底色全部命中 token 值）
- build：每次改动后通过（astro build + fix-sitemap）
- 所有改动均已 commit 到 main 并部署 CF Pages
