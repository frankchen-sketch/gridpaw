# GridPaw — Agent Rules

## 项目定位
猫主题日式逻辑谜题游戏站。六游戏：Shikaku（矩形分割，首页）+ Akari + Kakuro + Nonogram + Nurikabe（均 `src/lib/*-engine.ts` 编译到 `public/*-engine.js`）+ Pictomino（`public/pictomino/` 纯静态 HTML）。Astro 5.x 静态站 + Cloudflare Pages 部署。

## 怎么跑
```bash
pnpm install
pnpm run dev          # 本地开发 localhost:4321
pnpm run build        # 构建（含引擎编译 + pagefind 索引）
pnpm run deploy       # 部署 = wrangler pages deploy + IndexNow 提交（勿只跑裸 wrangler，会漏 IndexNow）
                      # ⚠️ 本机未装全局 wrangler（项目也没进 devDeps）：报 command not found 时用
                      # `npx -y wrangler pages deploy dist --project-name gridpaw --commit-dirty=true`
                      # + `node scripts/indexnow-ping.mjs` 手动等价执行（登录态在 ~/Library/Preferences/.wrangler/config/default.toml）
                      # ⚠️ wrangler oauth 登录态会静默过期（token 401 + refresh_token 一起死，2026-10-10 实测）：
                      # 部署前先 `npx -y wrangler whoami` 探活；过期后必须 `npx wrangler login` 重新 OAuth（浏览器点授权，交互式）
                      # ⚠️ 部署落地瞬间的新 URL 可能被 CF 边缘缓存 404（爬虫先到）——上线后 curl 验证 404 时先
                      # 试 `?cb=随机数` 排除边缘缓存（cache-bust 200 = 内容正常，等缓存过期或 Dashboard 手动 Purge）
```

## 技术栈
- Astro 5.x (静态输出) + TypeScript
- Shikaku 引擎：`src/lib/puzzle-engine.ts` → `public/puzzle-engine.js`
- Akari 引擎：`src/lib/akari-engine.ts` → `public/akari-engine.js`
- Pictomino：纯静态 HTML（`public/pictomino/game.html`）
- PWA：`public/manifest.webmanifest`（SEOHead 全站挂 link + apple-touch-icon + theme-color）；无 service worker，装桌面/主屏=书签级
- 分享：胜利弹窗统一三按钮（📋 Copy / 𝕏 Share / 👽 Reddit），事件 `share_copy/share_twitter/share_reddit`。Akari+Shikaku 在 astro 页内，Kakuro/Nonogram/Nurikabe 在各自 `public/*/demo.html` 的 winOverlay 里
- SEOHead：`src/components/SEOHead.astro`（从 site-config.ts 读 GA4/Clarity）
- 搜索：pagefind
- IndexNow：`scripts/indexnow-ping.mjs`（key 自动从 `public/<key>.txt` 探测，不硬编码；Bing Webmaster 已注册）
- 部署：Cloudflare Pages（域名 gridpaw.com）

## 关键约定
- **Astro 内联 script 不被 Vite 打包**——引擎必须用 `<script is:inline src="...">` 加载
- **trailingSlash: 'always'**——所有 URL 带尾斜杠
- **首页支持 ?embed=1**——隐藏 header/footer，用于内容页内嵌游戏 iframe
- **游戏卡内容列 ≤840px（52.5rem）**——SideAd 契约：160×600 侧栏广告盖在 840px 内容列之外，超宽页面（如 .main 72rem 全宽）棋盘右列会被广告层吃掉真实点击（murdoku 2026-10-14 Playwright 逐格实测）；游戏组件必须收窄居中（kenken 棋盘 496-784 即范式）
- **KD 数据源**：web.cafe 为主（skill `webcafe-kd`），sitedata 不可靠（差 10 倍）

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
