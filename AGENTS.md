# GridPaw — Agent Rules

## 项目定位
猫主题日式逻辑谜题游戏站。三合一：Shikaku（矩形分割）+ Akari（Light Up）+ Pictomino（空间推理）。Astro 5.x 静态站 + Cloudflare Pages 部署。

## 怎么跑
```bash
pnpm install
pnpm run dev          # 本地开发 localhost:4321
pnpm run build        # 构建（含引擎编译 + pagefind 索引）
wrangler pages deploy dist --project-name=gridpaw --commit-dirty=true  # 部署
```

## 技术栈
- Astro 5.x (静态输出) + TypeScript
- Shikaku 引擎：`src/lib/puzzle-engine.ts` → `public/puzzle-engine.js`
- Akari 引擎：`src/lib/akari-engine.ts` → `public/akari-engine.js`
- Pictomino：纯静态 HTML（`public/pictomino/game.html`）
- SEOHead：`src/components/SEOHead.astro`（从 site-config.ts 读 GA4/Clarity）
- 搜索：pagefind
- IndexNow：`scripts/indexnow-ping.mjs`（key: 60e0229839b33db7ea1726c1fd99abf7）
- 部署：Cloudflare Pages（域名 gridpaw.com）

## 关键约定
- **Astro 内联 script 不被 Vite 打包**——引擎必须用 `<script is:inline src="...">` 加载
- **trailingSlash: 'always'**——所有 URL 带尾斜杠
- **首页支持 ?embed=1**——隐藏 header/footer，用于内容页内嵌游戏 iframe
- **KD 数据源**：web.cafe 为主（skill `webcafe-kd`），sitedata 不可靠（差 10 倍）

## 站点结构
```
src/pages/
  index.astro                    ← Shikaku 游戏（首页，主排名页）
  akari/index.astro              ← Akari 游戏
  brain-teasers-for-adults/      ← 内容页（KD 22.9）
  logic-puzzle-grid/             ← 内容页（KD 29.6）
  japanese-logic-puzzles/        ← 内容页（KD 36.6）
  sitemap.xml.ts                 ← 动态 sitemap
public/
  pictomino/                     ← Pictomino 纯静态 HTML 游戏
  .well-known/indexnow.txt       ← IndexNow key
  puzzle-engine.js / akari-engine.js  ← 编译后的引擎
```

## 301 旧域名
- meowtrail.org → gridpaw.com/akari/（Cloudflare Redirect Rule）
- meow-block.com → gridpaw.com/（Cloudflare Redirect Rule）
- spatialreasoninggame.com → gridpaw.com/pictomino/（Cloudflare Redirect Rule）
- 详细映射表见 REDIRECTS.md

## 分析工具
- GA4: G-4FWP61DJCC（Property ID: 552793510）
- Clarity: yd0fauosa4
- IndexNow key: 60e0229839b33db7ea1726c1fd99abf7
- 详见 ASSETS.md

## 内容页规范
skill `seo-content-writing`：TDK 字符限制、CTA 全英文、禁止伪造 Schema、FAQ + BreadcrumbList 必备。

## Related Skills
- `seo-content-writing` — 内容页写作规范
- `webcafe-kd` — 哥飞 KD 查询
- `seo-keyword-roi-calculator` — 关键词 ROI 计算
