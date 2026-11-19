# STYLE.md — GridPaw 视觉合同（v1.0 · 2026-11-19 · **已冻结**）

> **冻结状态**：法老 2026-11-19 批准冻结。所有新页/新游戏（含 hexadoku）按本文件实现，
> 实现方不得自行发明颜色、宽度、组件尺寸。
>
> **改合同的唯一方式**：先提版本号（v1.1 / v1.2…），在文末 `变更记录` 写一行「改了什么 + 为什么」，
> 再改条款。没写进变更记录的改动视为违规。

> 本文件是 UI 实现的唯一视觉依据。任何组件/页面的颜色、字体、动效
> 必须能追溯到本文件；本文件没写的，先补合同再写代码。
>
> **来源：反向立约 + UI-1 轮定稿**：从现有 1957 处色值引用中聚类收编，
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
- **间距**：2px 栅格（法老于 2026-11-03 批准，见待拍板第 6 条）。新增 padding / margin / gap 取 2 的倍数；存量奇数值（3、5、7 等，粗算约 124 处）随页面改动分批收编，不做一次性全站替换

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
6. **间距栅格**：粗算 src 内 974 处 padding/margin/gap 的 px 声明。按 4px 栅格，585 处（60%）违规，主力值 14、10、6、2 全在栅格外；按 2px 栅格只剩约 124 处（13%）违规，主要是 3、5、7 等奇数。推荐定 2px 栅格，收编量小得多；要 4px 就得像第 5 条那样分批改存量——**已批准 2px，见 §4 间距条款**

---

## 8. pictomino 附属色板（public/pictomino/ 子站独立色系）

> **定位**：`public/pictomino/` 是纯静态子站（14 个 HTML，不经 Astro 构建），拥有**自己的一套 CSS 变量体系**，与 GridPaw 主站色系（--gp-*）**刻意不同**——主站是琥珀暖色，pictomino 是奶油粉暖（--bg #FFF6EC / --ink #4A3B32 / --pink #FF8FAB / --orange #FFB26B / --teal #5ECFB9 / --yellow #FFD66B，全部子站各页 :root 已有，勿混用 --gp-* token）。
>
> 2026-09-15 完成色值 token 化整理：302 处散落 raw hex 归入 var()（另有 142 处为变量定义值/纯白/品牌色/JS 数据色，属白名单保留），零视觉变化（映射表驱动，逐文件机器校验「除 ：root 定义行外每行与原文 token 替换结果一致」）。
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

---

## 9. 布局契约（2026-11-19 UI-1 定稿，hexadoku 等新游戏按此实现）

> 实现文件：`src/styles/tokens.css`（**唯一来源**，页面 `import '../styles/tokens.css'`）
> 铁律：任何 section/容器的宽度只能取下列三档之一，新页禁止自造第 4 种宽度。

| Token | 值 | 用在哪 | 不许 |
|---|---|---|---|
| `--w-page` | 1120px | 页面级内容区（首页 hub、工具三列、页头内宽） | 写成 1020/1080/1200 |
| `--w-game` | 640px | 游戏列：棋盘 + 上下控制条 + 关卡信息 | 棋盘直接铺满 1120 |
| `--w-prose` | 720px | 长文（SEO 正文、攻略正文）行宽 | 正文超过 760（一行字太长） |

- **首屏规则**：棋盘（`#play` 区）必须落在第一屏（1440×900 下 y < 900），游戏前面不许再插 hub/工具区。反例：旧首页把棋盘排到 y=1794。
- **棋盘区 < 1000px 宽时退单列**：棋盘与侧栏不并排，改为上下堆叠。
- **手机（< 700px）**：游戏列 100% 宽；页头导航折叠进汉堡；工具区单列。
- **断点**：`< 700`（手机）/ `700–1023`（平板单列）/ `≥ 1024`（桌面三列 + 1120）。

## 10. 组件视觉规格（钉死尺寸，禁止各页各写一套）

### 10.1 棋盘卡 BoardCard
- 容器：`background: var(--gp-white)`；`border: 1px solid var(--gp-linen)`；`border-radius: var(--r-card)`；`padding: var(--sp-6)`；`box-shadow: var(--shadow-candy)`
- 结构（自上而下，缺一不可）：
  1. **上控制条** `--h-toolbar`：左「关卡名 + 难度 chip + 进度（4 / 9）」；右 3 个圆形图标按钮（撤销 / 重做 / 提示），36px 圆，`.icon-btn`
  2. **棋盘**：格子 28–56px（`clamp`，由 JS 按容器算，上限 56）；格线 `var(--gp-linen)`；每 5 格加粗一线（大棋盘）
  3. **下主操作行**：`Hint`（实心 `--gp-cta`）/ `Undo` / `Restart`（次级描边）
- 与棋盘的距离：上控制条距棋盘 **≤ 16px**，下操作行距棋盘 **≤ 16px**（v3 实测 12px）
- **禁止**：工具栏吸在 header 下（离棋盘 100px+，法老否过）；工具条做成全局固定条

### 10.2 游戏控制条 GameToolbar
- 高度 `--h-toolbar`（44px）单行，`display:flex; align-items:center; justify-content:space-between`
- 按钮集合固定：`Hint`（主，带剩余次数 `Hint 3`）、`Undo`、`Restart`；低频（Share / Rules / 返回列表）收进 `⋯`
- iframe 类游戏（nonogram/kakuro）：**控制条留在页面层**，iframe 用 `postMessage`（`gp:state` / `gp:resize` / `gp:cmd`）回报状态；禁止把按钮藏在 iframe 里
- **棋盘滚出视口**时才允许出现 36px slim 条，滚回即隐藏（`IntersectionObserver`，不许常驻）
- 禁止：`position:sticky; top:52px` 这种挂 header 的方案；禁止 76px 双行按钮组

### 10.3 游戏入口砖 HubTile
- 网格 `repeat(5, 1fr)`（≥1024）；砖内：**真图标 40×40**（`/assets/game-icons/*.webp`）、名称（`--fs-small`，800）、一行副标（`--fs-tiny`，`--gp-stone`）
- 圆角 `--r-lg`；hover：`border-color: var(--gp-primary)` + `--shadow-sm`
- 禁止：用 emoji 当游戏图标（法老判为不合格）；砖内塞长描述

### 10.4 下拉菜单 GameMenu
- `max-height: min(70vh, 460px)`；`overflow-y: auto`；`overscroll-behavior: contain`
- **滚轮在菜单里 = 滚菜单**，不关闭、不滚页面；关闭只认「点外部 / Esc」
- 项：真图标 18×18 + 名称（800）+ 副标（`--fs-tiny`）；行高 44px；每项圆角 `--r-md`
- 禁止：`max-height` 用百分比（会按父级按钮高度求值 → 菜单被压成 20px，实际踩过）
- 禁止：无 `max-height`（15 项 938px = 104% 视口）

### 10.5 按钮与 chip
| 类型 | 规格 |
|---|---|
| 主按钮 CTA | 底 `--gp-cta`，字白，`--fw-btn`，圆角 `--r-full`，padding `10px 18px`，hover `--gp-cta-dark`，按下 `translateY(1px)` |
| 次按钮 | 白底 + `1.5px solid var(--gp-linen)`，字 `--gp-ink` |
| 幽灵/链接 | 无底，字 `--gp-primary-dark`，hover 下划线 |
| 难度 chip | 胶囊 + 徽章色对（easy/med/hard/daily 四对，拆开混配禁止），`--fs-tiny`，字重 800 |
| 图标按钮 | 36px 圆，白底 + `2px solid var(--gp-linen)`，hover 边框 `--gp-primary`，按下 `scale(.92)` |

## 11. 图标规则

- **游戏图标**：只用 `/assets/game-icons/<slug>.webp`（14 款已齐；新增游戏必须补图标再上线）。首页 hub、下拉菜单、游戏入口统一 40px / 18px 两种尺寸，圆角 5–9px
- **品牌图形**：`/assets/logo.png`（clay 猫头 36px 页头 / 256px hero）、`/favicon.svg`
- **功能图标**：内联 SVG（40×40 viewBox，2px 描边，`currentColor`），不许引第三方 icon 字体/CDN
- **禁止**：emoji 当游戏图标；纯文本冒充图标；外链图标

## 12. 决策记录（法老勾选 / 推荐值）

| # | 待拍板 | 推荐 | 理由 |
|---|---|---|---|
| 1 | 主色基准 | `--gp-primary` 保留 `#E8A888`（现状最高频），**新增 `--gp-cta #D97706` 专管实底按钮** | 换主色要动 1957 处引用；CTA 单独一档既能拉齐品牌琥珀，又不动存量 |
| 2 | 纯白策略 | 采纳：白只作棋盘亮格/卡片底，页面背景一律奶油 | 大面积纯白会让暖色调垮掉 |
| 3 | 功能色归一 | 采纳：红/绿/蓝各留一个（`--gp-error/success/info`） | 现状每个 2–4 变体，语义混乱 |
| 4 | Nunito | 采纳：删除引用并入系统栈（未加载 webfont 等于摆设） | 8 处引用，零成本 |
| 5 | 收编策略 | 采纳：逐页清零长尾色值，不做一次性全站替换 | 1957 处一次改风险不可控 |
| 6 | 间距栅格 | 已批准 2px 栅格 | 4px 栅格要改 585 处 |

## 13. 引导（onboarding）契约（2026-11-19 定稿，15 页实测）

> 组件：`src/components/GameCoach.astro`（新建，唯一实现）；样式 token 见 §10.1 棋盘卡。
> 背景：审计 15 个游戏页，引导有四种病——全屏遮罩（5 页）、飘浮固定卡（1 页）、随滚动滚走（1 页）、根本没有（8 页）。

| 页 | 现状 | 位置 | 判定 |
|---|---|---|---|
| `/` | 3 步 coach 卡 + tutorial-hint 条 | static, y=522 | 随滚动滚走 |
| `/akari/` `/kenken/` `/binary/` `/star-battle/` `/hashi/` | `rules-overlay` 全屏遮罩（❓ 触发，z 999） | fixed inset:0 | 全屏遮罩挡棋盘 |
| `/slitherlink/` | `coach-card` 飘浮卡 380×77 | fixed, z 950 | 飘浮压内容 |
| `/kakuro/` `/nurikabe/` `/pictomino/` `/murdoku/` `/meowdoku/` | 只有 SEO 段落/纯文本 | static, y>980 | 进游戏时看不到 |
| `/nonogram/` `/crazy-cleanup/` | 页面层无（iframe 内另有一套 / 第三方嵌入） | — | 页面层无引导 |
| `/train-tracks-puzzle/` | 无 | — | 无引导 |

### 13.1 硬规则

1. **位置**：棋盘卡内部，上控制条之下、棋盘之上；`static`（inline）。**禁 `fixed` / `sticky`**。宽度 = 棋盘宽（`--w-game` 内）。
2. **尺寸**：高 56–72px（单行文案 + 按钮）；与棋盘间距 **≤ 10px**（实测 10px）。
3. **步数**：≤ 3 步，每步一句话；第 1 步必须直接指向棋盘上的动作（"先找数字"/"拖过格子"），不许先讲世界观。
4. **出现**：首次进入该游戏才出现，`localStorage['gp-onboard:<game>:v1']`；第二次访问不弹。
5. **消失**：点 `Skip` / 走完第 3 步 / 完成首个动作 → 永久收起并写 localStorage。
6. **随时查**：❓ 按钮开**卡内抽屉**（或右侧滑出，宽 ≤ 360px），**不遮全屏**；`Esc` / 点外部关闭；不锁 body 滚动。
7. **视觉**：奶油底 `--gp-cream-warm` + `1.5px dashed var(--gp-primary)` + 步骤 chip（`--gp-badge-med-*`）。不用强饱和色块、不用 `--gp-cta` 实底铺满。
8. **可访问**：不抢焦点、不锁滚动、`Esc` 可关、`prefers-reduced-motion` 降级为直切。

### 13.2 禁止清单

- 用 `.win-overlay` 承载规则（胜利浮层只用于胜利；akari/kenken/binary/star-battle/hashi 现用法必须拆掉）。
- 飘浮固定卡（slitherlink `coach-card`）。
- 引导放在棋盘之后（pictomino y=1348、kakuro/nurikabe y>1500）——等于没有。
- 引导里放超过 1 句话/超过 3 步/带视频。
- iframe 内的按钮自己弹引导、页面层不知道（nonogram/kakuro 必须 postMessage 统一）。

### 13.3 迁移清单

| 文件 | 改什么 |
|---|---|
| `src/components/GameCoach.astro`（新建） | 唯一实现：3 步 + Skip + localStorage + 卡内 drawer |
| `src/pages/index.astro` | `onboard-coach`（155px，滚动会走）→ GameCoach；保留 `tutorial-hint` 条 |
| akari / kenken / binary / star-battle / hashi | `rules-overlay` → 卡内 drawer；❓ 保留为入口 |
| slitherlink | `coach-card` fixed → GameCoach |
| kakuro / nurikabe / pictomino / murdoku / meowdoku | 补 3 步 GameCoach |
| nonogram / kakuro iframe | 页面层 GameCoach；iframe 内引导 postMessage 关掉 |
| train-tracks-puzzle / crazy-cleanup | 补 GameCoach（TT 三页 + cleanup 外壳） |

---

## 变更记录

| 版本 | 日期 | 改了什么 |
|---|---|---|
| v1.0 | 2026-11-19 | 首次冻结：§1–§8 现有反向立约 + §9 布局契约 + §10 组件规格 + §11 图标规则 + §12 决策 + §13 引导契约 |
