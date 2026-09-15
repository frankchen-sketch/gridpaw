# STYLE.md — GridPaw 视觉合同（草案 v0.1，待法老拍板）

> 本文件是 UI 实现的唯一视觉依据。任何组件/页面的颜色、字体、动效
> 必须能追溯到本文件；本文件没写的，先补合同再写代码。
>
> **本草案为「反向立约」**：从现有 1957 处色值引用中聚类收编，
> 不是重新设计。归一过程中把 210 个散值收敛到 ~24 个 token，
> 相近色以出现频次最高者为基准。

## 1. 一句话世界观

**一只暖阳下打盹的橘猫守着一桌拼图**——温暖、柔软、专注、聪明。
视觉必须是暖色系（橙/奶油/暖棕），拒绝冷色科技感。

## 2. 色彩 token（24 个，全站禁止出现此表之外的色相）

### 核心暖橙（品牌主轴，原 8 个散值收编）

| Token | 值 | 收编来源（原值→频次） | 用途 | 禁止 |
|---|---|---|---|---|
| --gp-primary | #E8A888 | 全票（199次，最高频） | 主按钮/强调/Hover 光晕 | 不得调亮调暗后另立新值 |
| --gp-primary-strong | #D47A50 | #d47a50(39)+#d09070(19)+#d08868(19) | CTA 实底/选中态边框 | 用于大面积背景 |
| --gp-primary-soft | #F0B898 | #f0b898(20)+#e0a888(19) | 次级强调/hover 背景 | — |

### 深暖棕（文字与深色底）

| Token | 值 | 收编来源 | 用途 | 禁止 |
|---|---|---|---|---|
| --gp-brown-900 | #342421 | 全票（283次，全站第一） | 标题/深色区块底 | 纯黑 #000 |
| --gp-brown-600 | #6F5651 | 全票（176次） | 次级标题/图标 | 灰色替代（会发冷） |
| --gp-brown-400 | #9B726C | 全票（43次） | 辅助文字 | — |

### 奶油底色（页面背景系，原 6 个近似白收编）

| Token | 值 | 收编来源 | 用途 | 禁止 |
|---|---|---|---|---|
| --gp-cream | #FFF8F0 | #fff8f0(42)+#fff5f0(23) | 页面主背景 | 纯白 #fff 做大面积背景 |
| --gp-cream-warm | #FFF4F0 | 全票（85次） | 卡片/分区背景 | — |
| --gp-sand | #F8F6EF | 全票（85次） | 备选分区底/棋盘浅格 | — |
| --gp-blush | #F4DFDC | 全票（40次） | 高亮分区/获胜横幅底 | — |
| --gp-linen | #E7DACF | 全票（92次） | 棋盘边框/分隔 | — |
| --gp-parchment | #E8DDD0 | #e8ddd0(24) | 纸质卡片底 | — |

### 中性色（正文与边框）

| Token | 值 | 收编来源 | 用途 | 禁止 |
|---|---|---|---|---|
| --gp-ink | #3D3D3D | 全票（114次） | 正文 | #555/#3c4043 另立 |
| --gp-stone | #9E9590 | 全票（40次） | 占位符/禁用/次要说明 | — |
| --gp-white | #FFFFFF | #fff+#ffffff | 棋盘亮格/纯白卡片 | 非棋盘场景大面积使用 |

### 功能色（语义，全站各归一为 1 个）

| Token | 值 | 收编来源 | 用途 | 禁止 |
|---|---|---|---|---|
| --gp-error | #E74C3C | #e74c3c(17)+#ff42a5 等 | 错误/失败闪烁 | 出现第二个红 |
| --gp-success | #559C68 | #559c68(15)+#2e7d32(7)+#4caf50(5) | 成功/正确格 | 出现第二个绿 |
| --gp-info | #5C6BC0 | #5c6bc0(7)+#1976d2 等 | 教程提示/链接 | 出现第二个蓝 |

### 辅助点缀（谜题游戏需要的区分色，仅限游戏棋盘内）

| Token | 值 | 用途 | 禁止 |
|---|---|---|---|
| --gp-lilac | #B8A8C8 | 谜题分类色（紫系唯一代表） | 跳出棋盘场景 |
| --gp-mint | #88C8A8 | 谜题分类色（青系唯一代表） | 跳出棋盘场景 |
| --gp-sun | #FFC107 | 星级/奖励 | 做按钮色 |

> 收编明细：以上 24 token 覆盖 1957 处引用的 ~92%。
> 剩余长尾（约 130 个 1-3 次的散值）在巡查阶段逐页清零：
> 每页改造时把合同外色值替换为最近 token，不搞一次性大替换（风险大）。

### 补充 token（阶段 2 巡查发现）

| Token | 值 | 用途 | 禁止 |
|---|---|---|---|
| --gp-lilac-soft | #E8E0EB | 关卡卡片渐变终点、全站浅紫边框/分隔（20+ 处）的唯一收编出口 | 跳出卡片/棋盘场景 |

### 补充 token（阶段 3 首页巡查发现）

| Token | 值 | 用途 | 禁止 |
|---|---|---|---|
| --gp-primary-dark | #C06A40 | primary 系按钮/链接 hover 暗档 | 单独用作主色 |
| --gp-pink | #FF42A5 | Daily 徽章、时间高亮、账号错误提示 | 大面积背景 |
| --gp-lilac-bright | #CFC2E8 | expert 徽章底、教程提示条底 | 跳出徽章/提示场景 |
| --gp-badge-easy-bg / -text | #B8E8C0 / #2D6A3F | easy/tutorial 难度徽章对 | 拆开混配 |
| --gp-badge-med-bg / -text | #FDD09F / #8B6914 | medium 难度徽章对 | 拆开混配 |
| --gp-badge-hard-bg / -text | #FFB3C6 / #8B2252 | medium-hard/hard 徽章对 | 拆开混配 |
| --gp-badge-daily-bg / -text | #B3D9FF / #1A5A8B | daily 标签对 | 拆开混配 |

### 白名单（非样式债）

- **CAT_PALETTE 游戏数据色**：8 组 bg+ear（#FFB3C6/#E8A0B5 …）——每只猫一个颜色是游戏内容，非样式；相关 JS 对象（colorEmoji）的 hex **key** 必须与 CAT_PALETTE 原值保持一致，不得 token 化
- **Google 品牌四色**：#FFC107 / #FF3D00 / #4CAF50 / #1976D2（登录按钮官方 SVG 规范）
- **Reddit 品牌橙红**：#FF4500（reddit 分享按钮）

### 暗色调色板（阶段 4：akari/play.astro 暗色主题收编）

> play.astro 有完整暗色模式（19 处 prefers-color-scheme 块），是连贯设计系统。
> 暗色 token 以 `--gp-dark-*` 前缀，只允许出现在 `@media (prefers-color-scheme: dark)` 块内。

| Token | 值 | 用途 | 禁止 |
|---|---|---|---|
| --gp-dark-bg | #1A1410 | 暗色模式页面底 | 亮色块内使用 |
| --gp-dark-surface | #2A221C | 暗色卡片/分区底 | — |
| --gp-dark-surface-2 | #3A3028 | 暗色次级卡片/输入底 | — |
| --gp-dark-border | #4A3A2E | 暗色边框 | — |
| --gp-dark-border-2 | #5A4A3A | 暗色高亮边框 | — |
| --gp-dark-text | #F0E6D8 | 暗色正文 | — |
| --gp-dark-text-dim | #B8A088 | 暗色次要文字 | — |
| --gp-dark-primary | #E8925A | 暗色下的主色/标题/hover | — |
| --gp-dark-ink | #0F0B08 | 暗色近黑（棋盘黑格/最强对比） | — |

暗色语义变体（dark 块内使用）：success 文字用 #81C784、error 底用 #4A2222、info 文字用 #90CAF9——随暗色主题块收编为 --gp-dark-success / --gp-dark-error / --gp-dark-info。

> 收编原则（cheats.astro 教训）：冷色 navy 暗色底（#1a1a2e/#16213e/#0f0f23）是旧主题遗留，一律归入暖色 dark token，禁止新增冷色暗色值。

## 3. 字体（2 个角色 + 字号阶）

| 角色 | 字体栈 | 用途 |
|---|---|---|
| 全站正文+标题 | "SF Pro Rounded","Segoe UI","Noto Sans SC",system-ui,sans-serif | 现有主流（32处），圆润亲和，保留 |
| 代码/数字 | ui-monospace,'SF Mono',Menlo,Consolas,monospace | 谜题数字/坐标 |

- 清理项：`'Nunito'`（8处，未加载 webfont 等于摆设）→ 并入主流栈；散落的 `inherit`/`-apple-system`（各1-2处）→ 统一引用全局栈
- 字号阶（clamp 移动端优先）：`--fs-hero: clamp(2rem,5vw,3rem)` / `--fs-h2: clamp(1.5rem,3vw,2rem)` / `--fs-body: 1rem` / `--fs-small: 0.875rem` / `--fs-tiny: 0.75rem`
- 标题权重 700-800，正文 400，按钮 600

## 4. 形状与阴影

- **圆角**（原 14 种收敛为 4 档）：`--r-lg: 12px`（卡片/面板，101次主档）/ `--r-md: 8px`（按钮/输入）/ `--r-sm: 4px`（小标签）/ `--r-full: 999px`（胶囊/圆形徽章）。清除 6px/10px/0.375rem/0.5rem 等抖动值（0.375rem=6px、0.5rem=8px 直接换算并入）
- **阴影 3 档**（原 7 种收敛）：
  - `--shadow-sm: 0 1px 3px rgba(52,36,33,.15)`（卡片静置）
  - `--shadow-md: 0 4px 12px rgba(52,36,33,.15)`（悬浮/hover）
  - `--shadow-lg: 0 8px 24px rgba(52,36,33,.18)`（弹窗/浮层）
  - 阴影色统一用 --gp-brown-900 的 alpha（暖灰黑），禁止纯黑阴影
- **描边**：`inset 0 0 0 3px #E8A888` 的选中态模式保留，收编为 `--ring: inset 0 0 0 3px var(--gp-primary)`

## 5. 动效合同（现状收编 + GSAP 化路线）

### 5.1 现有 CSS keyframes 收编（49 个定义 → 保留 10 个命名模式）

| 模式 | 已用名 | 收编规则 |
|---|---|---|
| 猫咪弹跳出现 | cat-pop / cat-place / cat-dance | 保留，全站统一为 `cat-pop` 一套 cubic-bezier |
| 提示脉冲 | hint-pulse / pulse-ring / glow-pulse | 合并为 `hint-pulse` |
| 错误反馈 | shake / flash-red | 保留两个，参数全站统一 |
| 胜利庆祝 | confetti-fall / paw-fall / victory-glow | 保留 confetti + glow，paw-fall 并入 confetti（粒子换成爪印） |
| 入场 | fade-up / pop-in / text-pop | 合并为 `fade-up`，GSAP 接管 |
| 拖拽引导 | hand-drag | 保留 |

### 5.2 过渡参数规范（原 88 处 transition 收敛）

| Token | 值 | 用途 |
|---|---|---|
| --t-fast | 0.15s ease | hover/active 微反馈 |
| --t-med | 0.3s ease | 显隐切换 |
| --t-slow | 0.5s ease | 大区块过渡 |

禁止：transition 里再出现 0.1s/0.2s/0.4s 等新时长。

### 5.3 GSAP 使用边界（新增动效才用）

- **现有 CSS 动效不重写**（风险大收益零），只约束新增动效
- 新增滚动驱动效果（页面滚动揭示、Hero 视差）→ 必须用 `gsap-scrolltrigger`（skill: gsap-scrolltrigger）
- 新增序列动画（教学引导、多步演示）→ `gsap-timeline`
- 新增一律走 GSAP，**禁止新写 @keyframes**（存量 10 个模式够用）
- 全部动效必须响应 `prefers-reduced-motion: reduce`（降级为直切）
- ease 白名单：`power2.out`（默认）/ `back.out(1.4)`（弹跳出现）/ `power1.inOut`（滚动）——3 个之外先改合同

## 6. Signature（全局记忆点）

**「爪印 + 暖橙弹跳猫」**：胜利时的 paw-fall 爪印雨 + cat-pop 弹跳，是全站最独特的瞬间。
规则：每页可有一个局部签名，但不可弱化胜利爪印雨的品牌记忆。

## 7. 文案声音

- 语气：像猫 butler 说话——轻松、鼓励、不聒噪。玩家出错："So close! The cat believes in you."，不写 "Wrong answer"
- 按钮动词：Play / Retry / Next Puzzle / Show Hint（短动词，句首大写）
- 错误文案：说清哪错了 + 怎么改（"Row 3 has two bulbs lighting each other"），禁止 "Invalid"
- SEO 页 CTA 全英文短句（遵守 skill `seo-content-writing`）

---

## 待拍板项（法老勾选）

1. **主色基准**：--gp-primary 用 #E8A888（现状最高频）——还是趁机换更琥珀的 #D97706（和 furriq 拉齐品牌色）？两者都合规，后者更"琥珀"，前者更"粉暖"
2. **纯白策略**：--gp-white 只许棋盘亮格/卡片，页面背景一律奶油——OK？
3. **功能色归一**：红/绿/蓝各只留一个值（现状每个有 2-4 个变体）——OK？
4. **Nunito 处置**：删除引用并入系统栈——OK？
5. **收编策略**：改造时逐页清零长尾色值，不做一次性全站替换——OK？

---

## 8. pictomino 附属色板（public/pictomino/ 子站独立色系）

> **定位**：`public/pictomino/` 是纯静态子站（14 个 HTML，不经 Astro 构建），拥有**自己的一套 CSS 变量体系**，与 GridPaw 主站色系（--gp-*）**刻意不同**——主站是琥珀暖色，pictomino 是奶油粉暖（--bg #FFF6EC / --ink #4A3B32 / --pink #FF8FAB / --orange #FFB26B / --teal #5ECFB9 / --yellow #FFD66B，全部子站各页 :root 已有，勿混用 --gp-* token）。
>
> 2026-09-15 完成色值 token 化整理：344 处散落 raw hex 归入 var()，零视觉变化（映射表驱动，逐文件机器校验「除 ：root 定义行外每行与原文 token 替换结果一致」）。
>
> **pictomino 页面改色规则**：改 pictomino 页面时用下表 token，不要再写 raw hex；新增色值须先在这里备案再使用。`--bg/--orange/--pink` 引用已有变量，其余 token 按页在 :root 里**按需定义**（每页只加该页用到的，未列出的 token 在该页 :root 手动补定义）。

### 基础色（各页 :root 原有）

| Token | 值 | 说明 |
|---|---|---|
| --bg | #FFF6EC | 页面背景（奶油底） |
| --card | #FFFFFF | 卡片背景（纯白） |
| --ink | #4A3B32 | 主文字（深咖） |
| --pink | #FF8FAB | 品牌粉 |
| --orange | #FFB26B | 品牌橙 |
| --teal | #5ECFB9 | 品牌青 |
| --yellow | #FFD66B | 品牌黄 |

### 储备色板（本次新增 token，按需定义于各页 :root）

| Token | 值 | 语义 | 使用页数 |
|---|---|---|---|
| --ink-soft | #8A7466 | 次级正文（浅咖） | 13/14 |
| --peach | #FFE3C2 | 描边/波点/分隔线 | 13/14 |
| --cream | #FFF8F0 | hover 浅底 | 12/14 |
| --stone | #9E9590 | 弱化说明文字 | 12/14 |
| --muted | #B5A396 | 页脚/弱链接 | 12/14 |
| --indigo | #5C6BC0 | 游戏切换器 | 12/14 |
| --parchment | #E8DDD0 | 菜单描边 | 12/14 |
| --ink-strong | #3D3D3D | 深灰文字（game-switcher） | 12/14 |
| --blush | #FFF5F0 | active 浅底 | 12/14 |
| --peach-light | #FFF0E4 | crosslink 渐变 | 10/14 |
| --teal-deep | #3FBF9F | CTA 渐变深端 | 11/14 |
| --gold-ink | #7A5B00 | 黄底徽章文字 | 7/14 |
| --coral | #E85D75 | 倒计时警示 | 3/14 |
| --linen | #F3E7DA | 棋盘托底 | 3/14 |
| --pink-deep | #F76D8F | 粉色渐变深端 | 2/14 |
| --gray-200 | #DADCE0 | Google 登录钮描边 | 2/14 |
| --gray-800 | #3C4043 | Google 登录钮文字 | 2/14 |
| --sand | #D8C7B8 | 面包屑分隔 | 1/14 |
| --sand-2 | #C9B8A8 | drop zone 虚线 | 1/14 |
| --sand-3 | #E3D5C8 | 星星未点亮 | 1/14 |
| --sand-4 | #D8CCC0 | 拼图托盘 | 1/14 |
| --sand-5 | #E4D3C3 | 卡片虚线描边 | 1/14 |
| --peach-lightest | #FFF0E3 | privacy 提示框 | 1/14 |
| --red | #FF5050 | 拼错闪烁描边 | 1/14 |
| --red-soft | #D47070 | community active 色 | 1/14 |
| --navy-900 | #1A2332 | community 页背景 | 1/14 |
| --navy-800 | #2A3040 | community 分隔线 | 1/14 |
| --navy-700 | #1E2D3D | community 卡片底 | 1/14 |
| --navy-600 | #253545 | community 卡片 hover | 1/14 |
| --lilac | #E8E0F0 | community 正文 | 1/14 |
| --lilac-soft | #F0E8FF | community 标题 | 1/14 |
| --sky | #7BB8E0 | community 徽章/链接 | 1/14 |
| --sky-light | #A8D0E8 | community h2 | 1/14 |
| --slate | #8898A8 | community 弱文字 | 1/14 |
| --slate-light | #B8C8D8 | community 副标题 | 1/14 |

### pictomino 白名单（保持 raw hex，不 token 化）

- Google 品牌色 `#FFC107 / #FF3D00 / #4CAF50 / #1976D2`（SVG logo 内联，需真实色值）
- 纯白 `#fff / #FFFFFF`（与 --card 同值，但散用不强制收敛）
- game.html `const colors = [...]` JS 数据数组（拼块调色板，html2canvas 截图需真实色值）
- html2canvas `backgroundColor: '#FFF6EC'` 传参（API 需真实色值，var() 传不进去）
- 各页 ：root 里的 token 定义行本身

---
