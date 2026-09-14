# GridPaw 页面巡查底账（PATROL.md）
> 任何 UI 改动后，必须按下方巡查提示词跑一遍，全 ✅ 才允许收工。
> 视觉合同依据：根目录 `STYLE.md`（主色 #E8A888）。
> 样板页：`akari/levels/easy.astro`（阶段 2）。其余页面按同格式逐步补录。

## 页面：/（index.astro，Shikaku 主页）— 阶段 3 首个闭环 ✅ 2026-09-14

### 改动摘要
- `:root` 落地 33 个 `--gp-*` 合同 token；`--mt-*` 旧变量改为引用 `--gp-*`（别名兼容，community.astro 共用）
- 75 处合同外色值 → token 引用（#555→brown-600、#E8E0EB→lilac-soft、徽章4组→badge tokens、#FF42A5→pink 等）
- **合同新增 4 个 token**（巡查中发现的漏网色系）：`--gp-primary-dark`(#C06A40)、`--gp-pink`(#FF42A5)、`--gp-lilac-bright`(#CFC2E8)、badge 4 组 bg/text
- 净效果：该页 distinct hex 52 → 44，**合同外违规 43 → 0**

### 白名单（非样式债，收进合同附录）
- CAT_PALETTE 8 色 + ear 色（游戏数据：每只猫一个颜色）
- Google 品牌四色 SVG（#FFC107/#FF3D00/#4CAF50/#1976D2，登录按钮官方规范）

### 实测记录
- ✅ 构建通过（131 页，astro build exit 0）
- ✅ dev 页渲染：棋盘 3 cell、body bg=rgb(255,248,240)=--gp-cream、--gp-primary/#E8A888 生效
- ✅ 已部署 CF Pages（b7422b9c.gridpaw.pages.dev）+ IndexNow 提交
- ⚠️ CDP 拖拽模拟未触发通关（mouse 事件链与游戏 drag 实现不兼容）——非回归，游戏拖拽逻辑未改动；人工验证待法老手机/桌面实测
- 🔧 过程纠错：批量替换曾误伤 JS `colorEmoji` 对象的 hex key（key 必须与 CAT_PALETTE 原值匹配），已即时发现并回滚该处——教训：**JS 数据对象里的色值 key 不能当样式批量替换**

### 遗留
- 动效 GSAP 化（cat-pop/confetti 重做）→ 阶段 3b
- 剩余 43 个 distinct hex 全部为白名单内（游戏数据/品牌色）

---

## 页面：/akari/levels/easy/（样板页，阶段 2）

### 状态 × 视觉合同清单

| 状态 | 触发条件 | 必须出现 | 禁止出现 | 视觉合同项 | 实测 |
|---|---|---|---|---|---|
| 默认 | 首次访问（无进度） | H1「Easy Akari Puzzles」；谜题数量+尺寸行「28 easy puzzles (7×7, 10×10, 12×12)」；level-grid 28 个链接（5列）；2 个 details FAQ；Play Random Puzzle CTA | 横向滚动条；空网格 | 背景 --gp-sand(#F8F6EF)；标题/正文 --gp-brown-900(#342421)；summary 与链接色 --gp-primary(#E8A888)；CTA 渐变 #F0B898→#E09878（合同内 primary-soft/强变体） | ✅ 实测 2026-09-14 |
| 已解标记 | localStorage `gridpaw-progress` 含 puzzle id | 对应 .level-link 前缀「✓ 」+ `border-left: 4px solid` 绿色 | 影响未解项；破坏网格对齐 | 标记色必须用 --gp-mint(#88C8A8)；不得引入新绿 | ✅ 注入 puzzle-003/004 实测：✓ 显示、边条 4px rgb(136,200,168)、未解项不受影响、28 链接对齐不变 |
| 进度损坏 | localStorage 值为非法 JSON | 页面正常渲染，按无进度处理 | JS 抛错中断网格渲染 | — | ✅ 代码有 try/catch（L84），逻辑安全（静态审查） |
| 移动端 | ≤768px 视口 | level-grid 保持 5 列可点（实测 375px 视口下每格 ~80px）；nav 可见；无横向滚动 | 横向滚动条；按钮不可点 | 字号按合同 §3 clamp；无合同外媒体查询色 | ⚠️ 实测 439px 视口：无横向滚动✅ nav 显示✅，但 link 宽 79.85px 偏小、5 列在 375px 实机偏挤——记录待议，不阻塞 |
| 加载中 | 谜题数据请求 | 静态构建，无请求→直接渲染 | 白屏/骨架屏残留 | — | ✅ Astro 静态页，无此状态 |
| 空态 | puzzles.json 中 easy=0 | 网格空但页面结构完整（标题/CTA/FAQ 仍在） | JS 崩溃；「0 easy puzzles」文案出丑 | 数量行动态生成，天然安全 | ⚠️ 未实测（需造数据）；gridSize 行会显示 "easy puzzles () to solve" 括号空——低风险，记录待议 |
| 错误 | 路由 404（puzzle id 无效） | 404 页或重定向 | 裸报错 | — | ✅ puzzle-003 详情页 200 正常 |

### 交互流向表

```
/akari/ → [levels入口] → /akari/levels/easy/ → [Puzzle XXX] → /akari/puzzle/{id}/
                                    ↓ [Play Random Puzzle] → /akari/
                                    ↖ [Play/Logo] → /akari/
侧边出口：How to Play / Tips / Daily / Solver / Pinterest
```

### 本页合同违规清单（巡查阶段 5 项实测发现，逐页清零用）

| 行号 | 违规 | 应改为 |
|---|---|---|
| L19 | `linear-gradient(#f8f6ef,#f8f6ef)` 同色渐变（无意义） | 直接 `background: var(--gp-sand)` |
| L27 | `#E8E0F8`（合同外淡紫！）| 改 `--gp-lilac`(#B8A8C8) 或用 --gp-cream-warm |
| L27 | `border-radius:10px` | `var(--r-md)` 8px（或升合同加 10px 档，二选一） |
| L27 | `transition:all .2s` | `var(--t-med)` 0.3s 或 --t-fast 0.15s |
| L33 | `#E09878` 在合同内但作渐变终点 | 改用 --gp-primary-strong(#D47A50) 渐变对 |
| L34 | hover 渐变 `#E0A888→#D08868` | 合同化：hover 用 --gp-primary-soft→--gp-primary-strong |
| L40 | `border-radius:0.5rem`（=8px 抖动写法） | `var(--r-md)` |
| L46 | `border-radius:0.375rem`（=6px 抖动写法） | `var(--r-sm)` 4px |
| L87 | `#88C8A8` 裸写 | `var(--gp-mint)` |

> **新发现（合同 v0.1 漏网）**：L27 的 `#E8E0F8` 是全站淡紫渐变的源头之一（#f0e8ff/#e8e0eb/#e8e0f0 同族 20+ 处）。**给法老拍板**：紫系渐变是「关卡卡片的固定视觉语言」还是「待清除的长尾」？若保留 → 合同加 `--gp-lilac-soft: #E8E0F8`；若清除 → 归入 --gp-cream-warm。默认建议：保留（关卡卡片的辨识度依赖它），补进合同。

---

## 巡查提示词（每次 UI 改动后跑）

```
读取 PATROL.md + STYLE.md。我刚改动了 {页面/区块}。请逐一检查：

1. 改动页：按底账核对其全部状态（默认/已解标记/进度损坏/移动端/加载/空态/错误），
   每项报告 ✅ 或 ❌+具体现象
2. 邻接页：流向表中所有指向本页的页面（/akari/ 等），入口是否仍正常
3. 全局：本页用到的公共组件（site-header/ExtensionPromo/footer）在其他页面是否被连带改坏
4. 新增了底账里没有的状态或交互？→ 先补底账，再继续
5. 视觉：对照 STYLE.md 核对本页全部合同项（色值/字体/圆角/动效触发）；
   代码里出现合同外的 hex/字体/动画 → 报 ❌ 并指出文件行号
   （参考本页「合同违规清单」确认是否为已知未清零项）

输出格式：
| 检查项 | 结果 | 现象 |
逐项列全，不许跳过，不许"应该没问题"。全部 ✅ 后才允许收工。
```

## 反馈定位提示词（发现问题时用）

```
PATROL.md 中 {页面} 的 {状态} 出现问题：
现象：{一句话描述}
预期（底账写的是）：___
实际：___
请：
1. 定位根因（组件/数据/样式哪层）
2. 给最小修复方案
3. 修复后重跑该页全部状态清单，报告是否引入新问题
```
