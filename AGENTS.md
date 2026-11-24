# GridPaw — Agent Rules

## 项目定位
猫主题日式逻辑谜题游戏站。14 款游戏：11 款引擎游戏（Shikaku 首页 / Akari / Kakuro / Nonogram / Nurikabe / KenKen / Binary / Star Battle / Hashi / Slitherlink / Murder Sudoku，引擎在 `src/lib/`，部分在 `puzzle-core/` 子目录，编译到 `public/*-engine.js`）+ 3 款无独立引擎游戏（Pictomino 纯静态 `public/pictomino/`；Crazy Cleanup=静态游戏体 `public/crazy-cleanup/` + Astro hub `src/pages/crazy-cleanup/`；Meowdoku=全 Astro 页 `src/pages/meowdoku/` + `/meowdoku-guide/` + `/meowdoku/levels/`，组件 `MeowdokuPlay.astro` + 数据 `src/data/meowdoku-levels.json`）。Astro 5.x 静态站 + Cloudflare Pages 部署。

## 怎么跑
```bash
pnpm install
pnpm run dev          # 本地开发 localhost:4321
pnpm run build        # 构建（含引擎编译 + pagefind 索引）
pnpm run verify       # 提交前：oxlint + 约定闸门 + 改动文件全规则（lint:changed）
pnpm run preflight    # 会话开工/收工各一次（只读）：分支 + 与 origin/main 的 ahead/behind
                      #   + 工作区残留分类（我的/别人 WIP/生成物）+ 其它 worktree 独有 commit
pnpm run hooks:install # 装一次 scripts/hooks/* → .git/hooks（拦 feature 直推 main / main 非快进）
pnpm run deploy:safe  # ✅ 多会话并发/日常一律用这个：前置三查（脏树 / 落后 origin/main / 其它 worktree 有游离 commit）
                      #    → build → deploy --branch main → IndexNow → 线上 sw.js 指纹 + 4 URL 自检，全绿才 exit 0
                      #    并发部署由锁文件串行；前置不过 exit 2（不部署），部署后自检失败 exit 4
# ── 多会话并行铁律（2026-11-09 两次实测事故后定；违反任一条=线上整包回滚）──
# ① 干活各回各家：各会话只 commit + push 自己的分支，**不 deploy**
# ② 部署权归一处：只有 main worktree（或指定人）跑 deploy:safe
# ③ 部署者固定动作：`git branch -v` 看在飞 → `git merge` 所有在飞分支 → `pnpm run deploy:safe`（缺谁它直接拦）
# ④ 同机 worktree 共享 .git：合本地分支即可（不必 push/fetch）；push 只为备份+跨机，
#    但 **main 必须 push** —— `origin/main` 是脚本判断"落后"的基准线，不推则检查失效
# ⑤ 在 main 上 commit（哪怕只是文档）必须**当场 push**。留在本地 = origin/main 落后，
#    deploy:safe 的"是否落后"检查就看不见远端真实进度（2026-11-09 实测：f9f75a8 停在本地，基准线假绿）
# ⑥ **主 worktree 不等于 main**：它可能停在别人的 feature 分支上（2026-11-09 实测停着 feat/nonogram-input-ux）。
#    部署第一步先 `git rev-parse --abbrev-ref HEAD` 确认；不在 main 就先切回 main 再 merge 在飞分支
pnpm run deploy       # 裸版 = wrangler pages deploy + IndexNow 提交（勿只跑裸 wrangler，会漏 IndexNow）
                      #    无前置检查、不 build —— 并发时别用
                      # ⚠️ deploy script 不含 build！先 `pnpm run build` 再 deploy，否则 wrangler 把旧 dist 重传
                      #    报 "Uploaded 0 files (N already uploaded)" 静默假成功（2026-11-02 实测：cron 10:10 的旧 dist 被当新部署）
                      # ⚠️ **wrangler 按当前 git 分支路由**：在 feature 分支跑 deploy 只生成 **preview** 部署
                      #    （alias `<branch>.gridpaw.pages.dev`），wrangler 照样打印 Success+Uploaded N files，
                      #    但 gridpaw.com 继续服务旧 HTML（2026-11-09 实测：/kenken/solver/ 线上 404、nonogram 旧 title）。
                      #    要发生产必须显式 `--branch main`（或从 main worktree 跑）。分不清时：先看 wrangler 输出的
                      #    "Deployment alias URL" 是不是 `<分支名>.gridpaw.pages.dev`，是则=preview；再 curl 线上带 cache-bust 验证。
                      # ⚠️ 本机未装全局 wrangler（项目也没进 devDeps）：报 command not found 时用
                      # `npx -y wrangler pages deploy dist --project-name gridpaw --commit-dirty=true`
                      # + `node scripts/indexnow-ping.mjs` 手动等价执行（OAuth 凭据实路径 = **~/.wrangler/config/default.toml**
                      #    ——wrangler 4.158+ 从这里读；`~/Library/Preferences/...` 是旧位置，照旧文档排障会看错文件，2026-11-09 实测）
                      # ✅ **首选 API Token（2026-11-09 起，别再靠 OAuth）**：token 值在 `~/.hermes/secrets/cloudflare-api-token`
                      #    （**11-05 就已存在的长期 token**，含 Pages/R2/KV/Workers/D1 编辑；无过期。
                      #    今天之前全站还在用 OAuth 硬扛 → 这才是「隔几周掉一次」的真因：工具早有，没人用）。
                      #    **凭据入口 = `scripts/cf-auth.sh`**（`deploy.sh` 第 31 行已 source 它）：从
                      #    `$CLOUDFLARE_TOKEN_FILE`（默认 `~/.hermes/secrets/cloudflare-api-token`）与
                      #    `~/.hermes/secrets/cloudflare-account-id` 读进环境变量，已导出时不动（显式覆盖优先）。
                      #    ⚠️ **仓库里根本没有 `.env.production`**（2026-11-24 实测 `ls .env*` 空；本文档曾这么写，害人
                      #    按它 `set -a && . ./.env.production` 直接 exit 127）。且 wrangler 只加载 `.env`、**永不读
                      #    `.env.production`** —— 把 token 写在那儿对 wrangler 是隐形的，它会静默回退 OAuth。
                      #    所以日常只需 `pnpm run deploy:safe`，**不用手动 export**；手动跑裸命令时才 `. ./scripts/cf-auth.sh`。
                      #    whoami 已显示 email（2026-11-09 补了 User policy → 用户详细信息: 读取；User policy 无需绑资源，Account/Zone policy 才要）。
                      #    用法：`. ./scripts/cf-auth.sh && npx -y wrangler pages deploy dist --project-name gridpaw --branch main`
                      #    ⚠️ 设了 env var 后 wrangler **不回退 OAuth**：token 缺权限的命令直接失败（`d1 execute` 曾报 7403，补 D1:Edit 后通）。
                      #    加权限：dashboard → API 令牌 → 行末「操作」→「编辑」→「Add new policy」→「Add new Account policy」→
                      #    搜权限名 → 勾「编辑」→ **必须点「Show options」把 Account 资源选上**（资源为空会让「继续以显示摘要」无声失败）→
                      #    继续 → 摘要 → 「更新令牌」。`.env.*` 已在 .gitignore（勿 `git add -A` 带密钥）。
                      # ⚠️ wrangler oauth 登录态会静默过期（token 401 + refresh_token 一起死）：部署前先 `npx -y wrangler whoami` 探活。
                      # 过期重登顺序：① 先删 ~/Library/Preferences/.wrangler/config/default.toml 再 `npx -y wrangler login`
                      #    （死 token 的 config 会毒化重登：授权页点完 token 不落盘 + 日志 "query string parameter doesn't match"；2026-11-04 实测删了才通）；
                      #    ② 兜底=从另一台取活 token（scp default.toml，同账号 a8395）；③ 浏览器不在本机时用 ego 代点授权（8976 只监听 [::1]，须 IPv4→IPv6 转发）。
                      #    完整排障阶梯 → skill `wrangler-deploy-verify`「wrangler OAuth 重登」节
                      # ⚠️ **多会话并行时 production 只认一个源**：gridpaw 的 solver 一期上线 4 分钟后被另一会话
                      #    从自己的 worktree（含它自己的分支）`--branch main` 部署整包覆盖，solver 页全 404
                      #    （2026-11-09 实测）。部署前固定动作：① 在主 worktree `git fetch && git merge` 所有在飞分支
                      #    （或至少 `git log origin/main..<在飞分支>` 确认无独有 commit）② `pnpm run build` ③ `--branch main`
                      #    部署 ④ curl 主域 cache-bust 逐项验（自己改的 + 别的会话刚上线的都要在）。
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

## 会话开工 / 收工预检（2026-11-19 定，多会话并行必备）
每次会话开工与收工各跑一次 `pnpm run preflight`（= `bash scripts/session-preflight.sh`，只读）：打印分支、与 origin/main 的 ahead/behind、工作区残留分类、其它 worktree 的独有 commit。三条硬规则：
1. **残留分三类，不许一锅端**：我的改动（按路径 `git add`，**禁 `add -A` / `add .`**，会端进别人的密钥和半成品）／别人的 WIP（不碰、不扫进 commit、不动它的 index）／生成物（`.astro/`、`*.generated.*`、`gp-build.js`、`llms-full.txt`、`dist/` → 还原，别提交）。
2. **main worktree 不许带独有 commit 过夜**：任何人推了 origin/main，主 worktree 立刻 `git fetch && git merge --ff-only origin/main`；合不上就是分叉，当天处理——14:00 的 loop cron 一旦 ff 失败就断更。
3. **feature 分支禁止直推 main**：`git push origin <feature>:main` 与 main 非快进 push 都由 `scripts/hooks/pre-push` 拦（装一次 `pnpm run hooks:install`，软链进 `.git/hooks`，同机所有 worktree 生效）。上生产只有一条路：主 worktree `git merge <分支>` → `pnpm run deploy:safe`。破例需显式 `ALLOW_PUSH_BRANCH_TO_MAIN=1` / `ALLOW_HISTORY_REWRITE=1`，并在 STATUS.md 记一句。

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
- IndexNow：`scripts/indexnow-ping.mjs`（key 自动从 `public/<key>.txt` 探测，不硬编码；Bing Webmaster 已注册）。默认提交 sitemap-index；**`--from-git <ref>` 按 git diff 推精确变更页**（`src/pages/**/*.astro` → 页面 URL，共享组件/动态路由改动自动追加 sitemap 兜底），部署脚本已接入；`--dry-run` 只打印不发请求。判据：改动来源若含 `components/` `layouts/` `lib/`，具体受影响页不在 diff 里，靠 sitemap + `sitemap-lastmod.mjs` 的 lastmod 引导抓取
- 部署：Cloudflare Pages（域名 gridpaw.com）

## 关键约定
- **Astro 内联 script 不被 Vite 打包**——引擎必须用 `<script is:inline src="...">` 加载
- **YouTube 嵌入一律用 click-to-load facade，禁止裸 `<iframe>`**（2026-11-18 性能修复，`perf/youtube-facade`）
  - 实测：裸 iframe 让页面 load 从 931ms 涨到 9,462ms（YouTube 自身 7,260ms + 拉起的 Mediavine/Reco/Snowplow 等 30+ 第三方请求），全站 352 页受影响
  - facade 的 CSS/JS 在 `src/components/SEOHead.astro`（一份全局，事件委托，全站生效），页面只需写 HTML：
    ```html
    <div class="yt-facade" data-yt="VIDEO_ID" data-title="标题" role="button" tabindex="0" aria-label="Play video: 标题">
      <img src="https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg" alt="标题"
           loading="lazy" decoding="async" width="1280" height="720"
           onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg'">
    </div>
    ```
  - 三条硬约束：① 缩略图必须 `loading="lazy"` + 显式 `width/height`（防 CLS，也防抢首屏带宽）；② 必须带 `onerror` 回退到 `hqdefault.jpg`（部分视频没有 maxres，实测 3 个里有 1 个 404）；③ `data-yt` 只填 11 位 videoId，不要带域名
  - 时间戳跳转链接写 `https://www.youtube.com/watch?v=ID&t=13s`——**`youtube-nocookie.com` 不支持 `/watch` 路径**（de 两个页面曾整批写错，2026-11-18 修）
- **外部 iframe 一律视为性能风险**：任何 `<iframe src="https://...">` 引入前先问「能否改成点击加载」，YouTube/Vimeo/地图全部适用。实测数据见 STATUS.md 2026-11-18 节。
- **trailingSlash: 'always'**——所有 URL 带尾斜杠
- **首页支持 ?embed=1**——隐藏 header/footer，用于内容页内嵌游戏 iframe
- **游戏卡内容列 ≤840px（52.5rem）**——SideAd 契约：160×600 侧栏广告盖在 840px 内容列之外，超宽页面（如 .main 72rem 全宽）棋盘右列会被广告层吃掉真实点击（murdoku 2026-10-14 Playwright 逐格实测）；游戏组件必须收窄居中（kenken 棋盘 496-784 即范式）
- **广告现役 = Google AdSense（2026-11-20 过审）· 自动广告（页内横幅）+ 手动位待填**——client `ca-pub-5225990079437405`。**判据唯一真源 `src/lib/ad-policy.ts`**（`PLAY_SURFACES` / `PLAY_PREFIXES` / `NEVER_ADS` / `isPlaySurface` / `adsAllowed` / `loaderAllowed`），广告位配置真源 `src/lib/adsense.ts`（client + 6 个 slot id + `ADSENSE_AUTO`）。两条出货路径共用同一份清单：
  - **自动广告**：`SEOHead.astro` 只在 `loaderAllowed(path)` 为真的页面注入 `adsbygoogle.js` → **play surface 与永久零广告页连脚本都不加载**，Google 在物理上插不进棋盘页。因此**不需要**在 AdSense 后台维护第二份「排除的网页」清单（那份清单生效最长 1 小时，且每加一个游戏页都要记得同步，与 GameSwitcher/GameNav 双处维护同型）。后台口径：只留「页内横幅」+ 上限 6 + 最小间距 1000px；重叠式（锚定/侧栏/穿插）、意向驱动、多重广告全关，且**关掉「优化现有广告」**（否则 Google 会动我们的手动位）。
  - **手动位**：`SideAd.astro` 5 位 + `InContentAd.astro` 1 位，`ADSENSE_SLOTS` 留空 = 该位不渲染（连 ins 都不出），建好一个 unit 填一个 id 就单独开一个位。
  - Adsterra 已于 2026-11-17 全站撤除（`ADSTERRA_OFF=true`）且**不回来**（AdSense 要求自有库存可辨识 + Adsterra loader 有 popunder 能力，混排=拿账号赌）。
  - **新增游戏页/解题器页/单关页必须加进 `src/lib/ad-policy.ts` 的 `PLAY_SURFACES` 或 `PLAY_PREFIXES`**——`scripts/check-play-surfaces.mjs` 在构建链里对账，漏加即红。
  - 上线前仍缺：① 后台点「应用到网站」（配置已逐项设好，2026-11-20 实测该按钮在 2560px 超宽视口下被排除列表遮挡，坐标点击无效，需在正常视口操作或人工点）；② Google 认证 CMP（EEA+UK+CH 占 19.7% sessions，上线前置）；③ `/changelog/` 公告先行（10-29 公开承诺）。
- **广告（Adsterra，2026-11-07 恢复；2026-11-17 撤除 —— 以下为历史口径）**Adsterra 已按「六道闸」恢复，**只开静态 iframe banner**，全部由 `SideAd.astro` 一个组件按视口调度：≥1350px 左右侧栏 160×600（unit 31688449）、768–1349px 底部 sticky 728×90（unit 32144316，带 × 关闭 + body padding-bottom:100px）、<768px 顶部 320×50（unit 32144309，插在 header 之后、棋盘之上）；InContentAd 300×250（unit 31836413）只在攻略/内容页正文。**play surface = 只开桌面侧栏（2026-11-16 法老改口径，原「零广告」作废）**——`PLAY_SURFACES` 白名单（29 条精确路径 + 2 条目录前缀 `/akari/puzzle/`·`/meowdoku/levels/`，共 104 页）现在**只出 ≥1350 的左右 160×600 / 160×300 侧栏**（落在 840px 内容列之外的 gutter；29 页逐页 `elementFromPoint` 采样 ×1440/1350 两档实测棋盘格/按钮/文字零命中），**手机顶部位、平板 sticky、手机底部第二信息流在 play surface 上一个都不出**（顶部抢首屏、sticky 是 fixed 会压控件）。`NEVER_ADS` 全零四页：`/murdoku`·`/murdoku/trail`（main 是 1152px 全宽 = 2026-10-14「侧栏吞点击」同一布局债，侧栏会盖网格；收窄到 840 才能放行）+ 售卖页 `/unlock-all`·`/ad-free`。`/crazy-cleanup` 2026-11-16 已接入 `SideAd`（原来不 import；同时把 meta 里的 "no ads" 改成 "no sign-up"，否则自打脸）。`/pictomino` 是 `public/` 纯静态站，用不了组件，单独一份 **`public/pictomino/gp-ads.js`**（**SideAd.astro 才是真源，key/尺寸/闸门改动必须两处同步**）：只做 ≥1350 桌面侧栏，只挂 `game.html` + `index.html` 两页（那 6 页正文写着 "no ads / no ads interrupting the game" 是已发布承诺，要挂得先改文案，未动）；pictomino 各页内容宽度不一，脚本自己量两侧 gutter ≥170px 才挂。口袋数随批量页上线变动（2026-11-16 一天里就因 bp3 十八关落库从 490 涨到 508），**现役数字只放 STATUS.md**；复核方法记死：扫 dist 每页 `index.html` 查 `data-gp-slot="left"` 与 `id="gpStickyAd"` 两条标记（别 grep 类名，内联 script 里有同名字符串会全页假阳性）。**未填充不发标签**：`markFilled()` 只在 slot 里出现 iframe 时才加 `is-filled`，标签与 sticky 都靠它——未填充时侧栏只剩空白 gutter（fixed 无背景），sticky 整块撤掉并撤 body padding（消掉 90px 空白悬浮条 + 摆设一样的关闭按钮）。**新增游戏页/解题器页/单关页必须同步加进 PLAY_SURFACES 或 PLAY_PREFIXES**。内嵌 demo 的内容页（`/japanese-logic-puzzles`、`/pt-br/*`、`/meowdoku-guide` 等）**故意保留广告**——它们是内容页。**Native 卡片不恢复**（`AdSlot` 里 `const native = false` 硬编码，10-15 投诉的直接来源；要开必须单独说服法老）。Social Bar / Popunder / Smartlink 永久禁用。invoke 域会轮换——以 `GET /api/placements/6063560/extended` 现值为准（2026-11-07 实测 160×600 已从 `www.highrevenueformat.com/<key>/invoke.js` 改为 `https://bauval.org/22/<key>`）。**止损铁律不变：任何一起跳转投诉=当天撤，不辩护**；恢复纪律=先 /changelog/ 公告再上线（DLES.gg 那条 2026-11-07 法老决定暂不卡，邮件稿存 `research/2026-11-07-peter-email-draft.md`）。**Journey 上线前必须撤 Adsterra 并清 ads.txt 的 google 行**（官方要求独占，任何多条 ads.txt 行都算违规）。细节→STATUS.md 2026-11-07 条目 + `research/2026-11-07-adsterra-restart-execution.md` + skill `ad-network-monetization`
- **KD 数据源**：web.cafe 为主（skill `webcafe-kd`），sitedata 不可靠（差 10 倍）
- **games 数组两处维护：`src/components/GameSwitcher.astro`（游戏页/头部下拉）+ `src/components/GameNav.astro`（content 页头部，混排内容页链接）**——新增游戏两处都要加；`scripts/check-nav-consistency.mjs` 构建期对账 GameSwitcher⊆GameNav，分叉即红（有意省略写脚本内 EXCEPTIONS）。勿再内联复制第三份（2026-10-14 结构债清偿；GameNav 曾漏 6 游戏致内容页无头部入口，2026-10-16 补）。**同一脚本还管「动态路由板块可达性」**（2026-11-24 加）：一级目录只要有 `[...].astro` 动态路由（= 一上线就几十上百页），其 hub 必须出现在 GameNav 的 games 或 guides 里，否则红（孤岛）；豁免写 `DYNAMIC_SECTION_EXEMPT`（现仅 `/pt-br` 语言版，入口约定=hreflang）。新增这类板块（关卡页/攻略板块/解题器集群）必须同步登记导航
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
