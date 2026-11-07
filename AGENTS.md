# GridPaw — Agent Rules

## 项目定位
猫主题日式逻辑谜题游戏站。14 款游戏：11 款引擎游戏（Shikaku 首页 / Akari / Kakuro / Nonogram / Nurikabe / KenKen / Binary / Star Battle / Hashi / Slitherlink / Murder Sudoku，引擎在 `src/lib/`，部分在 `puzzle-core/` 子目录，编译到 `public/*-engine.js`）+ 3 款无独立引擎游戏（Pictomino 纯静态 `public/pictomino/`；Crazy Cleanup=静态游戏体 `public/crazy-cleanup/` + Astro hub `src/pages/crazy-cleanup/`；Meowdoku=全 Astro 页 `src/pages/meowdoku/` + `/meowdoku-guide/` + `/meowdoku/levels/`，组件 `MeowdokuPlay.astro` + 数据 `src/data/meowdoku-levels.json`）。Astro 5.x 静态站 + Cloudflare Pages 部署。

## 怎么跑
```bash
pnpm install
pnpm run dev          # 本地开发 localhost:4321
pnpm run build        # 构建（含引擎编译 + pagefind 索引）
pnpm run deploy       # 部署 = wrangler pages deploy + IndexNow 提交（勿只跑裸 wrangler，会漏 IndexNow）
                      # ⚠️ deploy script 不含 build！先 `pnpm run build` 再 deploy，否则 wrangler 把旧 dist 重传
                      #    报 "Uploaded 0 files (N already uploaded)" 静默假成功（2026-11-02 实测：cron 10:10 的旧 dist 被当新部署）
                      # ⚠️ 本机未装全局 wrangler（项目也没进 devDeps）：报 command not found 时用
                      # `npx -y wrangler pages deploy dist --project-name gridpaw --commit-dirty=true`
                      # + `node scripts/indexnow-ping.mjs` 手动等价执行（登录态在 ~/Library/Preferences/.wrangler/config/default.toml）
                      # ⚠️ wrangler oauth 登录态会静默过期（token 401 + refresh_token 一起死）：部署前先 `npx -y wrangler whoami` 探活。
                      # 过期重登顺序：① 先删 ~/Library/Preferences/.wrangler/config/default.toml 再 `npx -y wrangler login`
                      #    （死 token 的 config 会毒化重登：授权页点完 token 不落盘 + 日志 "query string parameter doesn't match"；2026-11-04 实测删了才通）；
                      #    ② 兜底=从另一台取活 token（scp default.toml，同账号 a8395）；③ 浏览器不在本机时用 ego 代点授权（8976 只监听 [::1]，须 IPv4→IPv6 转发）。
                      #    完整排障阶梯 → skill `wrangler-deploy-verify`「wrangler OAuth 重登」节
                      # ⚠️ 并行 WIP 在飞时部署的正确做法＝从干净 worktree 构建（`git worktree add --detach /tmp/x <commit>`），
                      #    只带已提交状态；本机 dist 留给另一个会话继续调试，互不干扰。两个前置坑：
                      #    ① build 前把 `public/<key>.txt` cp 进 worktree（IndexNow key 故意不入库，check-indexnow-key 会拦）；
                      #    ② build 前跑 `node scripts/check-tracked-imports.mjs`——防「页面入库、它 import 的组件没入库」
                      #       这类只有干净检出才炸的缺陷（2026-11-07 R&E LevelSelector/SolverTiles 实锤，dc533052 当时就是坏的）
                      # ⚠️ 部署落地瞬间的新 URL 可能被 CF 边缘缓存 404（爬虫先到）——上线后 curl 验证 404 时先
                      # 试 `?cb=随机数` 排除边缘缓存（cache-bust 200 = 内容正常，等缓存过期或 Dashboard 手动 Purge）
                      # ⚠️ 部署闸（loop-hints-pull.sh）只护 loop cron——手动 wrangler deploy 不过闸：并行 WIP 在飞时
                      # 部署前 git status 粗查 + 部署后 diff dist 新增物，确认携带的是已验证上线态而非未验收 WIP（2026-10-30 核查流）
```

## 技术栈
- Astro 5.x (静态输出) + TypeScript
- Shikaku 引擎：`src/lib/puzzle-engine.ts` → `public/puzzle-engine.js`
- Akari 引擎：`src/lib/akari-engine.ts` → `public/akari-engine.js`
- Pictomino：纯静态 HTML（`public/pictomino/game.html`）
- PWA：`public/sw.js`（network-first HTML + SWR 静态，`stamp-sw.mjs` 构建期版戳，/api 与跨域全旁路）+ `gp-install.js` 安装提示 + `offline.astro` 离线壳；打点 sw_registered/install_* 双管道 GA4+D1
- 分享：胜利弹窗统一三按钮（📋 Copy / 𝕏 Share / 👽 Reddit），事件 `share_copy/share_twitter/share_reddit`。Akari+Shikaku 在 astro 页内，Kakuro/Nonogram/Nurikabe 在各自 `public/*/demo.html` 的 winOverlay 里
- SEOHead：`src/components/SEOHead.astro`（从 site-config.ts 读 GA4/Clarity）
- 搜索：pagefind
- llms.txt：索引 `public/llms.txt` 手维护；`public/llms-full.txt` = `scripts/gen-llms-full.mjs` 构建期生成（build 链内 astro build 前跑，`public/*.txt` 忽略规则已盖，不入库）
- IndexNow：`scripts/indexnow-ping.mjs`（key 自动从 `public/<key>.txt` 探测，不硬编码；Bing Webmaster 已注册）
- 部署：Cloudflare Pages（域名 gridpaw.com）

## 关键约定
- **Astro 内联 script 不被 Vite 打包**——引擎必须用 `<script is:inline src="...">` 加载
- **trailingSlash: 'always'**——所有 URL 带尾斜杠
- **首页支持 ?embed=1**——隐藏 header/footer，用于内容页内嵌游戏 iframe
- **游戏卡内容列 ≤840px（52.5rem）**——SideAd 契约：160×600 侧栏广告盖在 840px 内容列之外，超宽页面（如 .main 72rem 全宽）棋盘右列会被广告层吃掉真实点击（murdoku 2026-10-14 Playwright 逐格实测）；游戏组件必须收窄居中（kenken 棋盘 496-784 即范式）
- **广告现役状态（2026-11-07 恢复，banner-only，三档互斥）**——Adsterra 已按「六道闸」恢复，**只开静态 iframe banner**，全部由 `SideAd.astro` 一个组件按视口调度：≥1350px 左右侧栏 160×600（unit 31688449）、768–1349px 底部 sticky 728×90（unit 32144316，带 × 关闭 + body padding-bottom:100px）、<768px 顶部 320×50（unit 32144309，插在 header 之后、棋盘之上）；InContentAd 300×250（unit 31836413）只在攻略/内容页正文。**play surface 零广告**——`PLAY_SURFACES` 闸（`SideAd.astro`：26 条精确路径 = `/`、12 个游戏入口页、4 个 solver、9 个同族真棋盘页如 `/akari/daily`·`/akari/create`·`/murdoku/trail`；外加 2 条目录前缀 `PLAY_PREFIXES` = `/akari/puzzle/`·`/meowdoku/levels/`，共盖 106 页），命中则整组件不渲染（AdGate/slot/CSS 全不出，连空盒子都没有）；2026-11-07 法老拍板方案①（另一选项是改邮件口，未采用）。实测 dist（部署 9f37806f）：side/sticky/top 各 169 页、incontent 79 页、106 个 play surface 连 `bauval.org` 都 0 命中；**新增游戏页/解题器页/单关页必须同步加进白名单或前缀**。内嵌 demo 的内容页（`/japanese-logic-puzzles`、`/pt-br/*`、`/meowdoku-guide` 等）**故意保留广告**——它们是内容页。**Native 卡片不恢复**（`AdSlot` 里 `const native = false` 硬编码，10-15 投诉的直接来源；要开必须单独说服法老）。Social Bar / Popunder / Smartlink 永久禁用。invoke 域会轮换——以 `GET /api/placements/6063560/extended` 现值为准（2026-11-07 实测 160×600 已从 `www.highrevenueformat.com/<key>/invoke.js` 改为 `https://bauval.org/22/<key>`）。**止损铁律不变：任何一起跳转投诉=当天撤，不辩护**；恢复纪律=先 /changelog/ 公告再上线（DLES.gg 那条 2026-11-07 法老决定暂不卡，邮件稿存 `research/2026-11-07-peter-email-draft.md`）。**Journey 上线前必须撤 Adsterra 并清 ads.txt 的 google 行**（官方要求独占，任何多条 ads.txt 行都算违规）。细节→STATUS.md 2026-11-07 条目 + `research/2026-11-07-adsterra-restart-execution.md` + skill `ad-network-monetization`
- **KD 数据源**：web.cafe 为主（skill `webcafe-kd`），sitedata 不可靠（差 10 倍）
- **games 数组两处维护：`src/components/GameSwitcher.astro`（游戏页/头部下拉）+ `src/components/GameNav.astro`（content 页头部，混排内容页链接）**——新增游戏两处都要加；`scripts/check-nav-consistency.mjs` 构建期对账 GameSwitcher⊆GameNav，分叉即红（有意省略写脚本内 EXCEPTIONS）。勿再内联复制第三份（2026-10-14 结构债清偿；GameNav 曾漏 6 游戏致内容页无头部入口，2026-10-16 补）
- **Meowdoku 三页分工（2026-10-30 立项判定，防内耗/防抢建）**：`/meowdoku/`=cat sudoku 词族（title/desc/H1/lede/FAQ+攻略节已织入上线）；`/meowdoku-guide/`=meowdoku 品牌攻略族（pos 8.2，FAQ/schema 保护不动）；`/meowdoku/levels/`=`meowdoku level N` 族。**独立 /cat-sudoku/ 页挂触发门**：cat sudoku 月量破 10K 桶或 `/meowdoku/` pos ≤15 才重开议题（先过哥飞）；meowdoku hints/answers 由 guide 承接不新建；daily answer 线已关闭（app 盘面随机化无唯一今日答案）。细节→`research/2026-10-30-gsc-review-and-plan.md` 晚补节
- **多语言页照既有先例**（`src/pages/de/`、`src/pages/pt-br/`）：扁平 astro 文件 + `<html lang>` + hreflang 三连（本页/en/x-default）+ 游戏专名不翻；shikaku 嵌 `/?embed=1`，**别硬嵌全页游戏（如 /akari/）——双头 + SideAd 吃点击，用 CTA 落地**；术语对目标语言真实用法核验（App Store/竞品页）。决策与状态 → `research/2026-10-16-multilingual-kdroi.md`；TODO 人审标记注释只能用 JS 语法（frontmatter 里 HTML 注释会炸 build）

## 站点结构
```
src/pages/
  index.astro                    ← Shikaku 游戏（首页，主排名页）
  akari/index.astro              ← Akari 游戏
  brain-teasers-for-adults/      ← 内容页
  logic-puzzle-grid/             ← 内容页
  japanese-logic-puzzles/        ← 内容页
  number-grid-puzzle/            ← 内容页
  sitemap（三层，别搞混）：
    @astrojs/sitemap 自动生成 sitemap-index.xml → sitemap-0.xml（主站 URL）
    public/sitemap.xml 手维护，直接列 sitemap-0.xml + pictomino-sitemap.xml ← GSC 提交的就是它
    public/pictomino-sitemap.xml 覆盖 pictomino 子站
    ⚠️ 索引不得嵌套索引；sitemap 与 canonical 的尾斜杠极性见 SEO-INDEXING.md
public/
  pictomino/                     ← Pictomino 纯静态 HTML 游戏
  puzzle-engine.js / akari-engine.js  ← 编译后的引擎
```

## 301 旧域名
规则在 CF Dashboard 各旧域名 zone 下维护（Redirect Rules），**仓库内无 `_worker.js`**。
- 新增规则时：精确规则必须排在 catch-all 之前
- 映射表 + 运行态实测核对表 → `REDIRECTS.md`
- 旧域名未决问题与当前状态 → `STATUS.md`

## 分析工具
- GA4: G-4FWP61DJCC（Property ID: 552793510）
- Clarity: yd0fauosa4
- IndexNow key: 见 `public/<key>.txt`（文件名即 key，`scripts/indexnow-ping.mjs` 自动探测）。**不要写进本文件——仓库是 public**
- 详见 ASSETS.md

## 内容页规范
skill `seo-content-writing`：TDK 字符限制、CTA 全英文、禁止伪造 Schema、FAQ + BreadcrumbList 必备。

## Related Skills
- `seo-content-writing` — 内容页写作规范
- `webcafe-kd` — 哥飞 KD 查询
- `seo-keyword-roi-calculator` — 关键词 ROI 计算
- `game-event-tracking` — GA4 游戏事件打点（track() 模式、gtag IIFE 坑）
