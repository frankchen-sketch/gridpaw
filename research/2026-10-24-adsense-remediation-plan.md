# GridPaw 全站 AdSense 整改 — 最终改动方案（2026-10-24）

> 来源：哥飞 AdSense 预检报告（seo.web.cafe，抽样 5 页）+ 本次全站复用审计（166/166 页逐页抓取 + 仓内代码证据 + GA4/GSC/D1 既有数据）。
> 审计原始数据：`scratch/gp_adsense_audit.json`（页面级指标）、`scratch/gp_dup_analysis.py`（跨页重复率口径）。

## 0. 结论与验收总标准

| 审计发现 | 数据 |
|---|---|
| 线上无 AdSense 代码 | 166 页 `adsbygoogle` 命中 0；pub-5225 仅在 ads.txt（MCM 授权行）。当前广告 = Adsterra（invoke.js 112 页 + Native 4 页） |
| 主要内容风险 = 同构重复（非字数薄） | 系列页 85 个占 52%；跨页重复率 BP3 EN 57.2% / BP3 DE 50.9% / Meowdoku 84.4% / Rings 23.1%，对照组（非系列页）1.9% |
| 薄页 <500w 共 25 | 系列薄页 17 + 功能页 8（功能页不算内容违规） |
| CMP 缺失 | 全站 0 命中；EEA+UK+CH 会话占 17.6%（GA4 30d），AdSense 上线时必须已就位 |
| Terms 缺失 | 全站无 terms 页；Privacy 渲染 ~1158w 已含 Adsterra/AdSense/IBA/儿童 13+ 披露 |
| UGC 风险 | 无（猫名 FNV-1a 服务端确定性生成，无用户文本入口，`functions/api/_guest.ts`） |

**验收总标准**：① 系列页跨页重复率（5-gram shingle，去 nav/header/footer，同系列两两比对）全部 <30%；② 薄页 25→≤10（8 个功能页除外）；③ /terms/ + CMP + 隐私 Cookie 段就位；④ 所有已验证排名页 TDK 逐字节不变。

**重复率数学**（为何「只加字数」不够）：dup ≈ 共享词 S / 总词数。BP3 EN 尾页 560w × 57% → S≈320w；只加 200w 独特 → 320/760 = 42% 仍超标。**必须同时「减 S」（共享 FAQ/介绍段压缩或 per-level 化）+「增 U」（本关专属内容）**。

## 1. 批次 1 — P0 合规（约半天）

### B1 Terms 页
- **新建 `src/pages/terms/index.astro`**（英文，≥1000w，结构照 privacy.astro 先例）：
  1. Acceptance of Terms；2. Permitted Use & License（个人非商业游玩）；3. Accounts & Leaderboard（Google 登录可选、访客猫名规则、禁止刷分/自动化的成绩无效条款）；4. User Content（当前无 UGC 发布入口，保留未来条款位）；5. Intellectual Property（站内原创盘面/引擎/文章版权归 GridPaw；第三方游戏名称与商标归原厂，fan-made 页面 not affiliated 声明）；6. Chrome Extension 条款；7. Third-Party Links & Ads（Adsterra/Google AdSense 披露衔接 privacy）；8. Disclaimer & Limitation of Liability；9. Changes to Terms；10. Governing Law；11. Contact。
- **页脚挂链接 4 处**（现有页脚均为手写、结构各异，逐处 patch）：
  - `src/pages/index.astro:2675`（`About · Contact · Privacy Policy` 行加 `Terms`）
  - `src/pages/about/index.astro:86`
  - `src/pages/contact/index.astro:86`
  - `src/pages/akari/index.astro:1037`（`Privacy Policy · Contact` 行）
  - 另在 about 正文适当处加一处 terms 内链（信任页互链）。

### B2 CMP（分两侧，代码侧依赖后台侧）
- **后台侧（法老操作，依赖项）**：AdSense 后台「隐私与消息」启用 Google CMP（GDPR + 美国州消息），拿到 snippet；同趟确认：① 账号里 gridpaw.com 站点状态（pub-5225 已在 ads.txt，勿重复注册）；② 站点未标 child-directed。
- **代码侧（我执行，等 snippet）**：snippet 挂进 `src/components/SEOHead.astro`（全站含 ?embed=1 页共享 head）；实测「拒绝同意后游戏仍可完整游玩」；隐私政策回填同意机制披露段。
- 过渡期口径：Adsterra 在跑但无 CMP——AdSense 代码上线前必须补齐；若 EEA 流量继续涨可提前。

### B3 Unknown 项代验（只读）
- grep 全站无 `geolocation` 请求 → ADS-PRIV-05 不适用；
- 打点/URL 无 PII（metadata 白名单核对）→ ADS-PRIV-03；
- 结论写入 STATUS.md。

## 2. 批次 2 — P1 内容加深（1-2 天，按重复率优先级排序）

> 通用打法：**减共享骨架（S）+ 增本关独特内容（U）**，验收用 `gp_dup_analysis.py` 同口径复测。新内容守：暖色纪律、禁手绘猫 emoji、去 AI 味排版、事实只写程序/视频验证过的（playbook 铁律）。

### H1 Meowdoku levels ×10（重复率 84.4%，有效独特仅 ~59w/页）
- 文件：`src/pages/meowdoku/levels/[level].astro` + `src/data/meowdoku-levels.json`（已含 level/seed/id/answer/regions）。
- 方法：复用 MeowdokuPlay 的生成路径（star-battle 引擎 K=1，seed 确定性重生成盘面）→ 每关算出真推导：开局锚点格（可能性最少的区域/行列排除最多的格）→ 逐区域排除链 → 最难一步 → 答案核对。落 JSON 新字段，模板渲染成 per-level 推导段（+250-350w）。
- 同步**压缩共享骨架**：通用 FAQ 两问压短、通用介绍段融入 per-level 内容 → S 从 ~320w 降到 <155w。
- 目标：379→≥650w，dup 84%→<30%。FAQ Schema 与正文同步重写（防漂）。

### H2 BP3 德语线 ×9（51% 重复 + 9/10 页 <600w）
- 文件：`src/pages/de/brain-puzzle-3-level-{1,2,3,5,6,7,8,9,10}.astro`。
- 补 per-level 独特段（德语，术语对照 App Store 德区真实用法）；共享骨架同步压缩。目标 ≥650w + dup <30%。

### H3 BP3 英文尾页 ×7
- 名单（<600w）：`level-1, 2, 19, 23, 34, 40, 137`。
- 已有拍板结构（Quick Answer 置顶 + 视频 + 步骤）不动，只加本关独特段（视觉锚点/易错点/推导）。目标 ≥650w + dup <30%。
- **TDK 逐字节不动**（GSC 已验证排名）。

### H4 Rotate Rings 薄尾 ×10（23% 重复，最轻）
- 名单：<600w 的 `level-1..10`（唯一达标的是 level-32）。
- 用技能库免解题事实位（波次释放时刻表/分数里程碑/结算画面链），每页 +100-150w 即可达标（S 已低）。目标 ≥600w + dup <30%。

### 本轮不动
- BP3 EN 中间档 42 页（600-800w）：下轮按 GSC 点击排序分批加深。

## 3. 批次 3 — P2 打磨（约半天）

- **M2 隐私政策补节**：`src/pages/privacy.astro` 加 Cookie 清单表（先 grep 代码里实际 cookie 名单：`mt_session`、anonId、GA4 `_ga`、Clarity `_clck/_clsk`、未来 Google ad cookie）+ CMP 披露段（B2 后回填）。
- **M3 移动端广告间距实测**：浏览器 390px 视口逐类实测（游戏页/内容页/系列页各 2 页），验证 SideAd 距棋盘间距、Native 不与 Play/Hint 相邻、标签可见；产出实测表，关掉 ADS-PROG-03/ADS-PUB-12 的 unknown。
- **可选化妆项（默认不做）**：GameNav.astro:26-27 两条 Arrows 条目实为不同页面（walkthrough vs rules，desc 已区分），哥飞判「重名」不成立；若做仅改显示标签、不动 href/TDK。

## 4. 执行与验收链（每批）

1. 改动 → `pnpm run build`；
2. dup 脚本同口径复测（系列页全部 <30% 才过）；
3. Playwright 双端抽查新渲染块（含未定义 class 扫描）；
4. **部署前置检查**：`git status` 快照——工作区现有 4 个非本会话 WIP（`public/{kakuro,nonogram,nurikabe,pictomino}/gp-build.js`，public/ 文件 build 时会原样进 dist）⚠️ 部署前须确认其状态或与对应会话协调，防他方未验收改动被本串部署带上线；
5. `npx -y wrangler whoami` 探活 → deploy → IndexNow；
6. 线上 curl 验证用**本次 deploy 哈希** + `?cb=` 防边缘缓存。

## 5. 最终复检清单

- [ ] /terms/ 200 + 4 处页脚 + about 互链 + sitemap 自动含
- [ ] CMP snippet 全站 head 命中（curl grep）+ 拒绝同意仍可玩游戏（浏览器实测）
- [ ] Meowdoku 10 页：≥650w + dup <30% + FAQ Schema 同步
- [ ] BP3 DE 9 页 / EN 7 页 / Rings 10 页：词数达标 + dup <30%
- [ ] 被改页 TDK 逐字节未动（diff 验证）
- [ ] 隐私政策：Cookie 清单表 + CMP 披露段
- [ ] 全站抓取脚本复跑：薄页 25→≤10（功能页 8 个除外）
- [ ] 移动端广告间距实测表落档
- [ ] geolocation/PII 代验结论入 STATUS.md
- [ ] 哥飞工具复检 1 次（3 积分）出对照报告

## 6. 明确不做清单

- ❌ 合并/noindex 系列页（BP3 是 premium 点击主力，GSC 2026-10-21 实测）
- ❌ 首页「游戏列表导航重复」改动（游戏站首页列游戏=主体内容，反驳哥飞）
- ❌ 功能页（play/daily/create/badges/help/community/elsewhere）扩写
- ❌ BP3 中间档 42 页本轮扩写（下轮按 GSC 排序）
- ❌ 动 4 个 WIP 文件（他方会话）

## 7. 工作量与节奏

| 批次 | 内容 | 预估 |
|---|---|---|
| 1 | Terms + 页脚 + B3 代验（CMP 代码侧等 snippet） | ~半天 |
| 2 | H1→H2→H3→H4（36 页内容） | 1-2 天 |
| 3 | 隐私段 + 移动端实测 | ~半天 |

## 附录 A：广告位实测表（M3 产出，2026-10-25 实测）

### 移动端 390×844（Playwright + elementFromPoint）

| 页面 | 横向溢出 | 广告渲染 | 广告遮挡交互元素 | 标签可见 |
|---|---|---|---|---|
| /akari/ | 无 | 无（SideAd ≤1200px display:none，设计行为） | 无 | n/a |
| /brain-teasers-for-adults/ | 无 | Native container 已注入（width=0 未填充） | 无 | n/a |
| /brain-puzzle-3-level-33/ | 无 | in-content 300×250 | 无 | ✓ |
| / | 无 | 无 | 无 | n/a |

### 桌面端 1440×900（13 个游戏页全扫）

| 页面 | main 宽 | SideAd 压内容列 | 实测被盖按钮 |
|---|---|---|---|
| **akari** | 1152px ⚠️ | 是 | **⚙️Settings、🔥Daily** |
| **binary** | 1152px ⚠️ | 是 | **↩️Restart、❓how to play** |
| **kenken** | 1152px ⚠️ | 是 | **❓how to play** |
| **star-battle** | 1152px ⚠️ | 是 | **❓how to play** |
| **hashi** | 1152px ⚠️ | 是 | **❓how to play** |
| **slitherlink** | 1152px ⚠️ | 是 | **❓how to play** |
| murdoku | 1152px | 压列未盖按钮（10-14 已修） | 无 |
| meowdoku | 872px | 略超未盖 | 无 |
| nonogram / nurikabe | 840px | 否 | 无 |
| murder-sudoku / the-loop / rotate-rings | 720px | 否 | 无 |

**新发现（超出原方案范围）**：7 个游戏页存在 ADS-PUB-10 现行违规——SideAd 层实测盖住交互按钮（elementFromPoint 命中=真实点击被吃）。哥飞工具的交互盲区，本轮全站实测抓出。**修复方向**：按 SideAd 契约把这 7 页游戏组件收窄 ≤840px 居中（kenken 496-784 范式 / murdoku 先例）；属 UI 布局改动，须 1:1 预览确认后单独批次执行，未列入本轮。
