# GridPaw 现役状态（STATUS.md）

> 项目状态的**唯一入口**。主题细节在各主题文档（见下方索引），此处只放现役结论与待决策。
> 最后核对：2026-09-19（TDK 优化轮部署 + 收录口径对账决策；sitemap / 构建 / 部署 / 内链均已实测）｜ 分支 `main`
>
> 治理依据：`~/workspace/AGENTS.md`「AGENTS.md 内容治理」——状态/进度进本文件，不进 AGENTS.md。
>
> **最新作战地图：`research/2026-09-24_横向拓展前置验证_GamePix供给侧与DR差距.md`**（0924：横向拓展前置验证通过+供给侧实测补全；P0 待办收敛为 3 条：注册 publisher 账号 / 定游戏页形态 / 外链换质；Game Over 降级已结案）
>
> **Brain Puzzle 3 攻略线（2026-10-16 上线 5 页；10-17 编号重锚定 + 拖拽修正 + L1-10 批量上线，共 14 关页）**：小步乐谷 Brain Puzzle 3: Crazy Mind（包名 com.brain.crazy.joygame，月下载 1100 万）攻略空窗打法，`/brain-puzzle-3-answers/` + **34 关页**（L1-33 全 + L137，10-18 两批扩 L11-21 + L22-29/32-33）已部署。**L11-21 批量管线（10-18）**：同 L1-10 管线，goal 从 `bp3-goal` 的 `<strong>Goal:</strong>` 后提取（正则别在 `>` 后直接抓）；抽帧 vision 9/10 直接匹配 + L20 goal 交叉核对（Open Faster=通马桶双关，vision 对关卡名误读）；生成器=scripts/bp3/gen_l11_21.py（anchor 插 19/30 之间保持 hub 数字序）。**L22-33 批（10-18）**：vision 10/10 一次过；⚠️ **旧 301 撞车**——10-17 加的 25→137/26→19/27→30/28→31 四条 301 把新真页挡成 301，已撤销（URL 归当前版本编号所有，老访客落新页可接受）；生成器=gen_l22_33.py（双锚：22-29 在 30 前、32-33 在 137 前）；**入库校验链**（HTML 实体双重转义 7 页污染事故后建立，skill game-guide-page-playbook 验收链节）：入库前 html.unescape → dist grep `&amp;#`=0 → 生成器副本禁旧覆盖 scratch（三验 ast/条目/实体）→ 验收用本次 deploy 哈希 → 批量新页 curl 全量防 301 撞车。**cta_click 打点（10-18 上线）**：BP3 全页挂 CTA 点击监听（cta-box/index-list/level-grid 三 placement，target/placement/from），D1 白名单已同步（funnel-track.ts + _funnel-sql.ts），Playwright 断言单发全过。**站点会话基线（10-18 GA4 实测）**：BP3 新页 0 会话（上线 1-3 天+GSC 未爬，正常）；已有攻略页 88 sess/56% engaged/人均 32s vs 游戏页 444/43%/66s——攻略页快进快出但精准；japanese-logic-puzzles 异类（嵌 Shikaku ?embed=1，99s/100%/3.6pv）=最强内容页形态。**L1-10 批量管线（10-17）**：puzzlegamemaster 全表 curl 抓 169 关步骤 → yt-dlp 按关搜视频 → **抽帧 vision 验场景**（抓出 2 个错位视频：泛指 "level 7/8" 视频实为老编号的 Zombie Walk/Delicious Hotdog，重搜关卡名才对）→ hero 帧 ffmpeg 落 `public/brain-puzzle-3/` → gen_l1_10.py 批量生条目。每关页结构=Quick answer+hero 图+视频置顶+步骤卡（L1-10 无逐帧时间锚，页内文案已按有无 ts 条件化）。**hub 改缩略图卡（10-17 法老拍板）**：14 卡=缩略图+Level N+关卡名+goal 横幅原文（level-grid/.level-card，配色同站）；攻略页中部 CTA 已删（曾夹在视频和步骤间+🐱emoji，页尾交叉链接区保留）。**全站 🐱 手绘猫清零（10-17 法老拍板）**：nav Meowdoku 🐱→🧠（GameSwitcher+GameNav 两处同步）、akari 灯泡格 🐱→💡（cheats+play 的 .cell-bulb::after）、7 页 cta-box 🐱 前缀删除、reset-password 😿→⚠️（🐾爪印是品牌元素保留）、pictomino 彩带数组 🐱→🧩；grep 全站零残留。**⚠️ 主域 HTML 边缘缓存不会随部署自动失效**（cf-cache-status: HIT age 可到 800s+，无痕访客拿到旧版；?cb= 才是新内容）——大改后要立即生效需 Dashboard Caching→Purge Everything（用户手动）。**SideAd 全量铺开（10-17 法老拍板）**：BP3×15 + meowdoku×3 + arrows×2 + block-blast/cross-math + murder-sudoku + 4 内容页共 24 页挂上 160×600 侧栏（契约核验：候选页内容列全 ≤840px；iframe 格式非被投诉跳转型，≥1350px 渲染）；Native Banner 继续全站摘除（10-15 决策）。IndexNow 11 URL HTTP 200。**编号重锚定（10-17 实测抓出）**：YT 老视频编号全过期（游戏插关 ~100 关导致漂移），4 页从 L25-28 重锚到真实编号 **L19(Find Lover)/L30(Sweetheart's Mask)/L31(Subway Panic)/L137(Coaster Light)**（=puzzlegamemaster 169 关全表 + commonsensegamer/rgamereview 交叉一致；游戏内不显示编号，地图顺序≠编号序）；旧 URL public/_redirects 301→新 URL 4 条实测全过，旧 astro 目录已删。**拖拽修正（法老实机验证）**：Subway Panic 大半交互是 drag/swipe 不是 tap（海报贴窗/外套盖血渍/拽吊环/拉隔板掉电池），YT 抽帧无法判别 tap/drag——页面已改「every move in order」+ 视频置顶（Watch the full solution 提到答案区第一屏）+ 拖拽如实声明 + L31 步骤扩到 13 步（并入 puzzlegamemaster 全表步骤+实机验证）。页面由 `~/.hermes/cache/scratch/bp3/gen_pages.py` 生成器渲染（新关卡=加 LEVELS 条目重跑）；视频已 yt-dlp 下到 `bp3/ytv/`（L25/26/27/28_*.mp4，法老照视频过关实测通过）。
> **模拟器管线（2026-10-17 全通，游戏已可玩）**：mini（frank@192.168.31.91）AVD `bp3b`（android-36 google_apis_playstore / pixel_6 / arm64）无头运行 emulator-5556；**BP3 从 Play 商店直接安装**（侧载 XAPK 被 PairIP 正版校验拦：`com.pairip.licensecheck` 判非 Play 安装→`System.exit(0)` 静默退出；卸载重装 split 无解，唯一通路=Play 登录（a839500525@gmail.com 已登录）+ Play 商店安装 1.1.8）。Play 登录会话卡死修法：`pm clear com.android.vending` 后 Play 自动用已有账号恢复会话（报 already exists = 账号已绑定，勿重复输密码）。MacBook scrcpy 5.0.1 + `ssh -N -L 5557:127.0.0.1:5557` 隧道 + `adb connect 127.0.0.1:5557` 投屏窗口可交互。
> **实机操作配方（2026-10-17 实测，已入库 skill android-emulator-headless）**：Unity UI 坐标真值=uiautomator 只见系统层（Unity 单 surface 不可见）、vision 估坐标差 80-600px 弃用，**PIL 像素聚类找图标**（BP3 底栏：刷新 (130,2198) / Hint (545,2196) / ☰菜单 (961,2197)）；menu→Settings→Skip Level (440,1675)=跳关快车道每次 1 关；MAX 测试广告关闭=**等 20 秒→右上白 X ≈(1000,198) tap 即关**（8-10s 不够）；跳关循环脚本 `~/.hermes/cache/scratch/bp3/skip_loop.py`（后台跑必须 `/usr/bin/python3` 绝对路径，系统 python3 有 PIL、`~/.hermes/tools` python 没有）；状态分类：ad=顶底黑条 / playstore=全白 / game=黄横幅 ≈(252,223,95)@y200；滞留 Play=`am force-stop com.android.vending`+monkey 拉游戏。**已实机关卡**：教学 L1（拖白牛仔帽→射左边小人→点桌下收音机拖给男→点箱子往左拖）人工验证；「Help the man warm up」16°C 空调关、「Help her clean up the dorm」宿舍打扫关（截图 `~/.hermes/cache/scratch/bp3_levels/`）。
> **待办（新会话接）**：①L19/30/31/137 已重锚上线——GSC 等新 URL 收录数据、旧 4 URL 等 301 转移（1-2 周）；②L31 实机 13 步全序列复验（法老照视频过半，剩 toolbox/hammer/panel、heels→TV、extinguisher 未逐条验）；③扩关页：新关卡用「横幅文字搜 YT 多作者交叉定编号」入库（老视频编号一律弃用）；④`/brainy-escape-quest-answers/` P1 页未做。会话恢复锚：session_search(query='bp3 skip loop', session_id='20261016_171559_a21650')。
> **AdSense 低价值内容整改（2026-10-14，已部署上线 + IndexNow 6 URL 200）**：被拒理由「低价值内容」。adsense_audit 实测（3 积分）：73 项 0 blocker，唯一 fail=About/Contact 缺失（实测 Contact 有但是 JS mailto 爬虫看不见、About 整站不存在）；全站词数对账：115/162 页 <800 词，**sitemap 内 37 薄页**才是主面。处置：22 薄子页合并进 3 hub（glossary 11 子页→hub 408→4,959 词；tips number-0~4→tips hub 加正经 per-number 章节 1,373 词；compare 6 页→新建 hub 1,735 词），sitemap **83→60 URL**、in-sitemap 薄页 37→13；levels/hard + reset-password（14 词）补进 sitemap 排除（**坑：astro.config 顶部 excludedPages 是死代码静默不生效，已删，唯一真源=filter 内 exactExcludes**）；About（574 词）+ Contact（275 词）独立页上线，footer 落链接（首页 JS-mailto 换真页 + privacy + kakuro/nonogram/nurikabe）。**待办**：等 2-4 周再申诉（唯一待办）。commit e28b95b + a094d8e 已 push。3 条 CF 301 已上线（2026-10-14 ego-browser 在 Dashboard UI 建成，23/23 旧 URL 实测 301 → 各自 hub，3 hub + /about/ /contact/ 均 200；规则名 akari-glossary-merge/akari-tips-number-merge/akari-compare-merge，详见 REDIRECTS.md）。部署+验证已全部完成（/about/ /contact/ 3 hub 线上 200）。法老拍板：CMP 先不接；剩余 13 薄页（blog 3 篇/cheats/murdoku/help-shikaku 等 600-700 词）加厚待议。
> **CG Akari 大更新预览线（2026-10-15）**：重投前可玩预览 `akari_big_update_preview.html`（scratch）+ webui 镜像 `hermes-mobile/static/previews/akari-big-update.html`。**美术红线（法老 10-15 拍板，全站适用）：游戏 UI 禁一切手绘猫 emoji**（🐈😺🐾 已全数移除：灯泡格改 CSS 白点、载入页💡、过关✨、地图徽标改 ▶ 文字）；品牌位一律 GridPaw logo。教学=机制训练制 5 关：T1 照亮规则（行+列）→ T2 双墙对比（无数字墙=随便贴灯 / 数字墙=正好 N）→ T3 数字墙 4 → T4 两规则叠加+冲突红闪 → T5 答案照抄（左 Answer 盘+右可操作盘双盘）→ Kitchen Lv1 正式关（KITCHENS 数组 3 关，过关弹层加「Next room →」，Lv3 后回地图）；**房间生成器已入库（2026-10-15）**：`src/lib/akari-engine.ts` 加 `generateMask()`（从边界啃异形轮廓，每口验连通性无孤岛，-3=屋外，solver 天然兼容零改动）+ `generateRoomPuzzle(room)` 三档（kitchen 方形 4-6 / study 6-7 缺角 15-24% / attic 7-8 重切口 28-40%），`_tryGenerate` 接 mask 墙只落屋内；自测 30 盘/档全绿（唯一解+全亮+数字全对，1-3ms/盘，masked 30/30），脚本入库 `scripts/akari-room-selftest.mjs`，bundle-engine 编译通过（difficulty 多为 easy=backtrackDepth 桶宽，难度实际靠形状分层，待 step-extractor 细分）；老 generatePuzzle(5) 回归 PASS；public/akari-engine.js 已重编译待下次部署。**重投状态（2026-10-17 后台实查）**：「Submit a game update」从未实际执行，后台版本历史仅 1 行（13/10 提交），游戏仍 REJECTED/Basic Launch；CG 拒信为模板信，不给个性化反馈（「unable to give personalised feedback」）。待办=打大更新 zip（教学5关+房间生成器）走 update 重投。**预览已接线（2026-10-15）**：官方引擎 IIFE 内联进预览（RoomGen 命名空间隔离 checkWin 冲突），地图三房间全接生成器=无限关（Kitchen 尺寸爬坡 4→6 / Study 6→7 / Attic 7→8 按关数），Next room→同房间 Lv+1；ego 实测 3 房间×2 关+教学全链→Kitchen 生成关全绿。接线抓出两 bug 已修：①预览 ray() 把 mask(-3) 当透明光可穿屋外，与官方引擎（-3 挡光）语义冲突导致生成解在预览判不了——挡光才是对的（凹形房光不该跨外部空间）；②wallBad 把「欠填」也标红圈开局满屏红，拆 wallExcess 只标超填真违规（开局 0 红/超填 ≥1 实测）。**正式 /akari/ 页已接房间曲线（2026-10-15，未部署）**：getDifficulty 阶梯语义不变，Lv4-6 Easy·Kitchen(6²无mask)→Lv7-12 Medium/Medium-Hard·Study(7²-8² mask15-24%)→Lv13+ Hard/Expert/Master·Attic(9²-12² mask28-40%)，生成走 generateRoomPuzzle(room,size)（engine 加可选 carvePct 第三参向后兼容）；renderBoard 加 val===-3 分支（cell-mask visibility:hidden 不可点不参与照明）+ .cell-mask CSS；难度 label 带房间名（GA4 difficulty 维度值随之变化，10-15 起新值=「Easy · Kitchen」等）。ego 真流程验收：脚本通关爬塔 Lv2→16（Tutorial→Kitchen→Study→Attic 全档），Attic 9² mask24-30 格全部生成/渲染/判胜/推进 ✓。**测试坑两枚记档**：①akari 主脚本是 type=module（Astro 处理非 is:inline script），top-level 函数不进 window，测试探针只能走 localStorage autosave（autoSave 存整盘+level，每次点击后刷新）+全局引擎函数；②DOM 反解盘面时 0 数字墙恒显示笑脸（cell-satisfied textContent 空），解析会漏 0 墙——直接读 autosave 里的 puzzle.grid 别碰 DOM。灯泡=内联 SVG 灯图（零依赖单文件原则，禁外链图）；教学关内嵌文字引导卡（callout，砍掉 Show me 按钮依赖）；全英文文案（CG 评审是英文玩家，中文版弃用）。

> **Kakuro 线（2026-09-25）**：引擎+demo 全功能交付并入库（雾分块/爪窥/付费墙 mock/键盘三态/答案 hint/clue 高亮/死局检测，selftest ALL PASS）；`/kakuro/` 已从跳转页升级为正式 SEO 页（推关 11 关+无限每日关+FAQ/WebApplication schema+内链，进度存 localStorage）。下一步：部署 + GSC 提交收录 + IndexNow。

> **Nonogram 线（2026-09-26）**：第 4 个游戏立项（选型依据：nonogram 43,280/月为唯一真体量候选词，onlinenonograms DR 10 证明行为驱动可上榜；差异化=每关揭猫像素画）。引擎已交付（lineOptions 枚举→lineSolve 纯逻辑传播→回溯计数唯一性；Easy/Medium 生成强制纯逻辑可解；猫 pattern ×4 教学；生成 1-2ms/盘，selftest ALL PASS）。正式页 `/nonogram/` + GameNav 五游戏 + llms.txt 已入库（commit 0543b79）。demo（669 行，子 agent 产出+浏览器实测验收）已部署上线（deployment aef3dcb7，commit 5eda059），线上 /nonogram/、demo、引擎全 200，IndexNow 已推。

> **Murdoku 备选（2026-10-10）**：数独×谋杀推理品类（纸质书 100 万+册爆款），文章沉淀 → `research/2026-10-10_Murdoku游戏备选.md`。结论：引擎复用度高（区域约束+传播求解）、叙事内容页是新杠杆；**立项前置**：web.cafe 实测 `murder sudoku`/`murder mystery logic puzzle` 量与 KD，品牌词 Murdoku 不可用（商标）。

> **Pinterest 冷启动线（2026-10-10 上线 3 pin + 旧 pin UTM 补齐）**：新 pin Kakuro `1103241240027570976`（Brain Teasers 板）/ Nonogram `1103241240027571637`（Cat Games 板）/ Nurikabe `1103241240027572241`（Logic Puzzles 板），API 回读全验过（title/UTM/board/description 92-110 字符）。制作规范：真游戏截图（ego-browser 实拍，AI 不画棋盘）+ AI 背景 + GridPaw logo + CTA 按钮 + gridpaw.com 水印，1080x1620。**基线对照**：账号 30 天仅 326 曝光/1 外链（10k 邮件查证为 furriq 账号通知，非 gridpaw）；旧 10 pin UTM 补齐 **8/10 完成**（`pin-shikaku`×4/`pin-pictomino`×3/`pin-akari`×1，API 确认；剩 2 条 `…961171`/`…759874` 编辑弹窗内值已改+保存关闭，但 API/SSR 迟迟不回读——Pinterest 服务端同步滞后，48h 后复查）。**2-3 周后复盘**：新 pin 出站率 vs furriq 0.08% 基线，验证 CTA 模板；旧 Shikaku 重复 4 条可清理。Chrome profile 映射：jameschen=gridpaw。编辑 pin 弹窗技术要点：链接字段在弹窗下半部（需滚动容器），保存要点 `primary_l` class 的按钮（顶栏同名「保存」是摆设）。

> **Nurikabe 线（2026-09-26 收官）**：第 5 个游戏，**已部署上线**（deployment `fb570629`）。全链：引擎（sea-snake 构造 + repairToUnique；档位 easy 5×5 / medium 7×7 / hard 9×9，selftest 16/16）→ demo（拟真皮肤：深海蓝≈海 + 沙滩岛 + 线索格小岛图案；首访五段式引导卡带真解迷你盘；教学爬梯 2×2→3×3→4×4→5×5；血量机制 3 血/关、双向纠错+纠正格锁定、血尽换盘、教学 ∞）→ 正式页 + GameNav 六游戏 + llms.txt + footer 互链。**线上验证全绿**（/nurikabe/ 200、demo v=3、引擎 16479B）、IndexNow 200、GSC sitemap 204（key=furriq A key，auto-detect 会错抓）、Request Indexing /nurikabe/ 已提交（「已请求编入索引」）。关键坑已沉淀：引擎引用 ?v=N 缓存戳（demo+worker 两处）、rule-(d) need=0 clue 格豁免（2×2 全灭根因）。

> **视觉统一线（2026-09-26 上线，commit `e376e7a`）**：Akari 首页/Akari Daily/Shikaku 首页三页对齐新标准——胜利弹窗手绘 SVG 猫头→`/assets/logo.png` 彩色 logo；game-tag 行（游戏名 · Level N）全六游戏统一；分享文案挑衅风零猫脸（Shikaku 彩块 emoji 行保留=成绩艺术，玩法内 🐾 爪印保留=品牌同源）；Shikaku 新增 𝕏 Share 按钮+棋盘卡（html2canvas 截真实棋盘），Akari 棋盘卡复用 generateShareCard（卡内 🐱 灯块→琥珀块、cats→bulbs、🐾 角标删除）。埋点六游戏同名：`share_card` / `share_card_copy` / `share_twitter` / `share_reddit` / `share_copy`。Pictomino 子站独立受众，故意不动。线上实拍全验（design-live-preview 流程，Playwright 从 gridpaw.com 抓 9 图）。

> **分享+PWA 线（2026-09-26 上线，commit `e6c6a49` 收官）**：Kakuro/Nonogram/Nurikabe 三 demo 的 winOverlay 三按钮分享 + `manifest.webmanifest`（SEOHead 全站挂 link）。迭代四版后定稿：① 文案挑衅风、零猫 emoji，每条挂 GridPaw 品牌名+游戏机制梗；② 胜利卡顶部/页面 h1 用 `/assets/logo.png` 四色猫爪网格（favicon.svg 只是米色标签页图标，勿再混用）；③ Solved! 下加 game-tag 行（游戏名 · Level N / Daily / Tutorial）；④ **点 𝕏/Reddit 先弹「Your board」棋盘卡**：canvas 实时渲染胜利棋盘（logo+标题+棋盘+域名），卡内 Copy Image / Save / Post / Close，新事件 `share_card` / `share_card_copy`。Playwright 全程回归（分享 18/18 → 棋盘卡 12/12）。抓图脚本与坑沉淀在 `~/.hermes/cache/scratch/test-board-card.py` 及 webapp-testing skill。**待观察**：`share_card*` vs 直接发帖的比例，验证棋盘图对分享转化的提升。

> **移动端首屏重构方案A（2026-10-09 上线，commit `5241637`，deployment `fa32020c`）**：移动端（≤560px）隐藏 GamePortal 导航网格——它占首屏 59% 把 Shikaku 棋盘挤出首屏（实测棋盘 y=808 只露 36px、教学卡 y=892 完全屏外）。改后棋盘 y=295、教学卡 y=379 完整进首屏；桌面端（>560px）portal 保留不动；零 DOM 变化不影响 SEO。依据：外链真人 71% 落首页、取证报告 62.5% 流失会话为加载即走 + dles.gg 引流秒退。方案对比与广告位评估见 `~/.hermes/cache/scratch/mobile-firstscreen-proposal.md`。

> **Adsterra 低填充诊断（2026-10-09）**：15 天 8 impressions 根因=流量量级（4 SEO 页 14 天 19 会话）+ CN IP 拒服务，配置/代码健康（后台 API 逐字节比对 hash 一致，active=3 无 decline）——**严禁点后台重新生成代码**（会作废 invoke.js）。本机验收广告填充用 `~/.hermes/cache/scratch/adsterra-fill-check.py`（三级链路：invoke.js 200 → 二跳注入 → container children>0）。报告 `~/.hermes/cache/scratch/adsterra-lowfill-diagnosis.md`。**unit 账目澄清（10-12 后台实地展开核对）**：全账号 active unit 恒为 3 = gridpaw NativeBanner_1 (31317669) + furriq NativeBanner_1 (31420265) + gridpaw 160x600_1 (31688449，10-12 新建)；「active=3」是账号口径非 gridpaw 独占。9 内容页共用同一个 Native unit（1 unit N 投放位），勿混淆。
> **漏斗复核（2026-10-12，GSC/GA4/Clarity 三源）**：结论不变且更实锤——**广告没坏，是「人数×观看深度」乘积太小**。① 流量层：28 天全站 645 会话仅 **40（6%）落在 9 个挂广告的内容页**（游戏页/首页才是流量主体且按红线不挂广告）；② 深度层：Clarity 内容页会话多为 1-7 秒弹走（meowdoku-guide×2 / japanese-logic×2 全 ≤7s），AdSlot 在文中很深（brain-teasers 实测 y≈3033px），48 分钟深读者仅 brain-teasers 一位回访（bing 来的尼日利亚用户，4 次 Show answer 0 死点击=质量最高）；③ 填充层：10-12 复测 invoke.js 从 CN 出口（MacBook curl + mini ego）双 403/0 字节=Adsterra 拒 CN IP，预期行为非故障；④ 唯一杠杆 = **给内容页导搜索流量**（与内页攻略战同一杠杆：5 新页全部挂了 AdSlot，GSC 曝光起量后广告才有钱赚）+ 可选把 AdSlot 从文末上移到首段后（抬 viewability，需 A/B 前先算流量红线：40 会话/月的页面做什么都不显著）。
> **广告位扩量 v2（2026-10-12 拍板+上线，commit `785c19f`，deployment `ff107374`）**：法老拍板「游戏页+首页也加，小影响」。桌面（≥1200px）双侧 sticky **160x600 Banner（新单元 31688449，后台 ego 实操建成，只加不改零风险）** 落内容列外空白 gutter（1440 屏两侧各 470px，1280 屏 390px）；全端 GameHub 之下 1 个 Native 文流位（复用 31317669）。10 页=首页+9 Astro 游戏页；**pictomino/game（iframe）与 ?embed=1 全排除**；移动端不加 anchor/悬浮（压底部操作区=破「小影响」底线）。AdSlot.astro 顺手修：embed 场景客户端守卫不再发脚本（原 4 内容页仅 CSS 隐藏）。验收：Playwright 双端全绿（1200px 断点 1200=显/1199=隐、棋盘零遮挡、embed 0 注入）+ vision 读图 + 线上 10/10 页 curl 落地确认。可曝光 pv：内容侧 120 → ~1400/月（×12），sticky 位全程视口内配长停留人群。代码档 `.adsterra/banner-160x600.snippet.md`；坑：后台按钮渲染为「Ad Unit」精确匹配会 miss。**观察期 2 周**（至 10-26）：Adsterra 后台 impressions 曲线 + GA4 游戏页会话，若 <1200px 流量占比意外高再议移动端方案。**多尺寸决策（10-12 法老确认）**：不铺多尺寸——GA4 实测桌面 66%/移动 33%，桌面 ≥1200px 真实覆盖率 71%+（800x600 档 91 会话为 bot 指纹，剔除后更高），160x600+Native 已接住主力；高单价格式（Popunder/Social Bar/Interstitial）全在「小影响」红线外；**唯一保留候选**=移动 GameHub 下 300x250，触发条件：10-26 复盘时 mobile pv>1000/月且 Native 填充健康（当前 362/月，不达标不动）。
> **多语种铺量盘点（2026-10-15，GA4 28d + webcafe 6 语种 + TabAPI SERP 3 市场）**：法老拍板**先做德语试点**，暂不铺开。自家粘性：非英语 8 语种 engaged% 全部 ≥ 英语（英语基线 43%；德 59%/67s 是唯一有样本量的，中文 93 会话 59%/3.6pv 最粘但 Adsterra 不计 CN≈零变现，葡语 241s 爆表小样本）。市场面：pt-BR「jogos de logica」5,400 / fr「jeux de logique」5,400 / ja「パズル無料」8,100+CPC$1.45 / de「denkspiele」4,400+CPC$0.74 / it 4,400，广告竞争全低——但**头词 SERP 全被本地门户+聚合站把持**（rachacuca/logicieleducatif/poki），正面打不动。**结论**：英语 pos 6-10 爬坡优先，多语种只做长尾试点（游戏专名 non-EN SERP 只有 puzzle-shikaku 家族薄页在守=英语对手复用）；日语暂缓（意图错位：ロジックパズル默认指非ogram+全日语内容成本）。试点=/de/ hub + /de/shikaku/ 长尾页，走 astro-multilingual-localization 基建（EN 页零改动+hreflang 三连），8 周看 GSC 曝光再定铺开。webcafe 消耗 30 分（余额 3288）。**德语试点已上线（2026-10-15）**：`src/pages/de/index.astro`（hub，目标「logikrätsel & denkspiele online」320+140/月 CPC$0.97-1.07）+ `src/pages/de/shikaku.astro`（主攻「shikaku」德语区 **1,600/月** 竞争 0，SERP 无任何德语原生页；含可玩 iframe /?embed=1 height=640 + AdSlot + FAQ 4 条）。hreflang 三连写在 DE 页 head 内（EN 页零改动，SEOHead 无 hreflang prop 故意不加）。build 144 页 → deployment `8a952703` → 线上 curl 验证 title/hreflang → IndexNow --urls 两 URL 200（deploy 脚本默认只 ping sitemap-index，新页要 `node scripts/indexnow-ping.mjs https://gridpaw.com --urls ...` 显式提交）→ GSC Request Indexing 两 URL 均「已请求编入索引」。⚠️ 手动 curl POST IndexNow 报 422（同 payload 脚本跑是 200），用脚本路径别手搓。验收 8 周观察：GSC 曝光/impressions 是否起量，起量再铺 zh-TW。
> **Adsterra 首次真实进账复盘（2026-10-15，后台 /stats + GA4 交叉）**：扩量 v2 观察期过半。**10/11-15 五天 69 imp / $0.18 / 余额 $0.38**，10/14 首现像样量级（52 imp，扩量 v2 上线后第 2 天）。**unit 拆解**：gridpaw Native (31317669) 49 imp $0.15 CPM $3.08=唯一赚钱；**160x600 (31688449) 16 imp $0.00 CPM $0.22=零贡献死重**（结论：不动，零伤害零收益，别为 $0 折腾部署；流量起量后若仍 <$1 CPM 再议换格式）；furriq Native (31420265) 4 imp $0.03 CPM $7.30=furriq blog 单价更高。**地理拆解（关键）**：US 11 imp CPM $14.50 贡献几乎全部收入（$0.16）；**Spain 36 imp（52%！）CPM $0.184 + Poland 12 imp 全零**——低价值地理吃掉七成曝光。GA4 交叉：Spain 21 会话中 19 落 10/15 单日、首源 13/21=(not set)、多页散逛=疑似 bot/低质量，别为它高兴。**填充率**：广告页 PV ~120 vs 69 imp（桌面双单元理论 2/pv）→ ~30%；Singapore 20 pv / China 20 pv 在 Adsterra 记 0 imp（VPN/proxy 不计 + CN 拒服务），非故障。**优先级不变**：唯一杠杆=给广告页导英语国家搜索流量（同样流量引到 US 收入×10）；CTR 全线 0%（69 imp 0 clicks）为小样本+广告位深度问题（AdSlot y≈3033px，1-7s 弹走会话滚不到）。

> **漏斗与埋点线（2026-10-09 上线，commit `a02f221`，deployment `c8a42f53`）**：binary/hashi/slitherlink/star-battle/kenken 五游戏页补齐 first_move + game_over 埋点（Playwright gtag-stub 实机验收全绿，IndexNow 已推 6 URL）。game_over 语义裁决：五款是 Zen 式谜题无血量机制，挂「主动提交校验失败」时刻（盘满/星满/环闭但 validate 不过）。**同日取证推翻「76% 首局流失」口径**：game_start 页面加载即触发（index.astro:2110），37% 死开局是 bot（isLikelyBot 已入库），真人死户 92% 为 10 秒内无交互离开，CDP 复现无 bug；真人 gs→fm ≈33%（mobile+google 达 37-60%）。取证报告 `~/.hermes/cache/scratch/shikaku-firstmove-forensics.md`。**待办 P0**：① game_start 口径改 pointerdown 触发或改名 board_ready；② 看板查询过滤 isLikelyBot（真人转化 23%→33%）；③ onboard_* 进 D1 白名单（GA4 现值 start 435/complete 151/skip 54）。D1 免费配额 7500 写/日，UTC 午夜重置。**checkpoint 补齐（2026-10-15，commit `6401b52`+`61b4a27`，已部署）**：Shikaku checkpoint [1,3,5,10,20]→[1,3,5,7,10,12,15,20,23,25,30]（7/12/15 盯中段、23/25/30 盯手工→无限衔接点）；Akari 加 12/13/25/30（12/13=Study→Attic 交界）；Kakuro/Nonogram/Nurikabe 首次有 checkpoint（7/11/15=campaign 交界+daily 解锁）。**track() 接 Clarity**（clarity('event')+clarity('set','level')）——此前只有 Pictomino 喂 Clarity，正式页事件在 Clarity 里全不可见；2-4 周后可按 level 标签筛录制看中段行为。**GA4 level 维度已建（2026-10-15，ego UI 代建，绕过 SA 权限）**：Admin→数据显示→自定义设置→创建自定义维度（名称 Level/说明 Puzzle game level/范围 事件/参数 level），表内回读验证 ✓。⚠️ 维度只处理注册之后的事件，历史数据不回填；2-4 周后 level_up 报表可按 level 拆（此前过渡的 level_complete_N 硬编码方案可退役）。**nonogram 边缘缓存已 Purge（CF Dashboard 自定义清除 demo.html）**：curl 验证 level_complete_=1 ✓，全游戏 checkpoint 五文件线上全绿。**口径坑记档**：① GA4 level_complete_N 事件名被 Shikaku 首页与 Akari 页共用（checkpoint 数组不同），拉数据必须按 pagePath 拆（/ vs /akari/）；② Clarity Data Export API 只给聚合（≤3 天、≤3 维度、10 次/日、无 session 级），token 已入库 `~/.hermes/env/clarity.env`（600）；③ 中段流失定性（10-15 Clarity 3 天取证）：首页 29 会话 median 10s/0 点击，长会话（300-670s）0-7 点击=挂机 tab，**首页没有「玩到中段流失」的可测样本**——真问题在进站即跳（12/29 ≤10s 零点击），不在手工→无限衔接（GA4 月度 L20 仅 3 人，衔接点统计不可测）；④ 死点击信号（10-15 录屏结案，两热点均非 bug）：pictomino/game 7 死/3 会话=用户在关卡切换 Loading 窗口连点（busy 守卫接住，游戏逻辑无恙，1kit0jy 2 分钟通 ~7 关健康会话）；japanese-logic-puzzles 5 死/6 会话=内嵌 /?embed=1 iframe + AdSlot 的固有误报（Clarity 把 iframe 内部点击记到无 handler 的外层元素，1lx5d3r 读页 2 分钟+玩内嵌盘）。**内容页嵌 iframe/广告 = 死点击基线噪音，别据此定罪页面**。

> **Pinterest 清理 + 双社媒 cron 化（2026-10-13）**：删 4 条旧 pin（Shikaku dup ×3 + Akari 脏 title，`DELETE /v5/pins` 204+404 双验证，**13→9 pin**；留存 Shikaku 2 条 …61018/…4835338）。数据基线更新：30d 334 imp / 1 outbound / 0 save（出站率 0.3% vs furriq 0.08%）；GA4 pinterest 28 会话 / lemmy 16 会话。**Cron 现状**：新建 `[GridPaw] Pinterest 运营周报 1eced124f705`（周日 18:00，bot-chat，skills=pinterest-api-setup+ga4-data-access，坑全内置）；lemmy 发帖 88953652f56c + 复盘 a23ec4836634 挂 skills=[lemmy-community-ops]；gridpaw 漏斗周报 53f2a4b531f1 deliver all→bot-chat（deliver=all 连续 2 周无投递目标）。MacBook wrangler whoami LIVE（10-12「双死」已过时）。执行账本：`records/daily/2026-10-13-gridpaw-pinterest.md`。**复盘节点 10-24~31**：新 pin 出站率 vs 0.08% 基线，连续两周无增量 → 降级建议（产能挪 lemmy 大盘帖）。

> **全站 QA 巡查（2026-10-14 上线，deployment `46eb1008`）**：179 页全量走查（JS 报错 0 / 内链全验 / 文案红旗扫描 / 交互走查），修 4 类 30 处——① ExtensionPromo Chrome 商店 URL 废弃品牌 meowtrail slug → gridpaw canonical；② 30 处内链缺尾斜杠（index.astro 24 + akari/index 1 + pictomino 12 静态页根链接）补齐，pictomino 子页保持无斜杠（CF Pages 上 `/pictomino/easy/`→308，无斜杠才是 canonical）；③ `/akari/rules/` 补 H1（原标题在 h2）+ Article headline 对齐 title + FAQPage 问题「GridPaw」改回「Akari」。**排查后不动**：`akari-puzzle-engine.ts:109` 的 `meowtrail-` 是 localStorage key（动了毁老玩家进度）；meowtrail.itch.io 200 可用；本地扫出的 pictomino「404」是 http.server 不做 pretty-URL 的假象。线上验证 4 项全绿（rules h1/schema、footer 链接、扩展 slug、pictomino 根链接）。已提交推送：`a294724`（本批修复）+ `19f058c`（遗留记账：新词台账 cron 记录 / NextGenRunGames 评估 / 哥飞趋势插件脚本；gp-build.js 构建戳还原未提交）。git webhook 是否幂等重建不追——直传 46eb1008 已覆盖全部内容。

> **Shikaku 触屏修复（2026-09-28 上线，commit `dae2b64`）**：Lemmy !dailygames 真实玩家反馈三项全修——拖拽高亮 8%→32% + 实时 `W×H=面积` 徽章（固定棋盘下方，永不遮棋盘格）、猫耳 top:-7px→0 收进块内+阴影收窄（不再压上方行数字）、C1 误触保护（选区无数字=静默放过不扣命，真错误照扣）。Playwright 5/5 实测（含触屏事件路径+徽章几何断言）。已同步四端：gridpaw.com 部署验证 / GameJolt release 1528718 / NG 草稿 8138600（新 zip+1000×800+触屏，13:00 cron 发布）/ itch MeowBlock（公开页 iframe 已播新包）。**平台铺量现役状态唯一入口 → skill `game-directory-submission/references/gridpaw-platform-status.md`**（GameJolt 5/5 Published、NG 2 发布+3 待发、IndieDB 公司页+3 款+2 待建、Lemmy 反馈帖已回）。

---

## 一、现役事实（2026-09-15 工具实测）

| 项 | 状态 | 证据 |
|---|---|---|
| 站点 | gridpaw.com 正常 | 68/68 sitemap URL 返回 200（2026-09-16 复测：sitemap-0 取 56 + pictomino 12） |
| 构建 | 通过（132 页） | 2026-09-16 复跑 `pnpm run build` exit 0（8.80s） |
| 部署 | CF Pages 生产已同步 | `c1714195.gridpaw.pages.dev` → apex |
| 远端 | `origin/main` 已同步 | 工作区 0 未提交 |
| GSC | 属性 `sc-domain:gridpaw.com` 接入完成 | sitemap 报 `submitted=68, errors=0`（2026-09-16 复核仍 68/0） |
| GA4 | Property 552793510 可 API | 服务账号 A |
| IndexNow | key 已轮换，新 key 200 | ✅ 2026-09-16 已闭环：旧 key **源站 404**；apex 上因 **CF Pages asset 层边缘缓存**曾间歇 200，**Purge 无效**，最终用 **Redirect Rule**（`/390e…txt` → 301 `/`）解决 —— 实测 30/30 全 301（AMS/LHR/FRA）。详见 `SEO-INDEXING.md` §5.4 |

**流量基线（2026-09-17 复核，口径已修正）**：GA4 服务端数据**从 2026-09-04 起才有**（commit `3003a3f` 那天才把埋点换成本站专属衡量 ID `G-4FWP61DJCC`）——所谓「30 天」实际只有 14 天。旧记录「30 天 257 session」即由此误读而来。

| 窗口（hostName=`gridpaw.com`） | session | users | PV |
|---|---|---|---|
| 09-04~09-16（全部历史，14 天） | **231** | 198 | 350 |
| 09-16 单日 | 4 | 4 | 3 |
| 09-17 单日（当日未完整） | 3 | 3 | 5 |

分渠道（14 天）：**Direct 183 / Unassigned 31 / Organic Search 17 / AI Assistant 5 / Referral 2 / Organic Social 1**。无品牌新站 Direct 占七成，其中**约 50% 会话来自云机房 IP**（Council Bluffs、Boardman、Ashburn、San Jose、Glenview、Amsterdam…），特征是时长 0–31s、人均 1.2–1.5 页、零 referrer —— 机器人/爬虫，不是用户。**Clarity 独立佐证（近 3 天）：真人会话 27 / 机器人 52。**

GSC 近 28 天（08-20~09-16）**267 曝光 / 5 点击**，均位 13.8。按设备拆：**桌面 180 曝光 / 2 点击 / 均位 17.5**；**移动 87 曝光 / 3 点击 / 均位 6.1**。曝光在涨（日均 6 → 30），但涨的主要是桌面均位 25–90 的长尾。

> ️ **CTR 不能横向直读（2026-09-17 分层实测修正，推翻了本文件此前「瓶颈是 CTR 0.67%」的结论）**：总体 CTR 低是**曝光结构**造成的假象 —— **位置 ≤10 时 CTR = 6.7%**（30 曝光 / 2 点击），位置 >10 的 50 曝光 0 点击。query 维度里 **62% 的曝光落在位置 >10**。所以别去改标题/描述，先把曝光按 `position` 分层再判断。
> ⚠️ **GSC 侧同样有自动化污染（与 GA4 机房 IP 是同一批流量）**：`nld` 桌面 22 曝光中 **16 条来自单一查询 `akari or step back`**（位置稳定 10–11、跨 8 天、0 点击、只落一页）—— GA4 同窗口 Netherlands/Amsterdam **恰好 17 会话、1 会话 1 用户**，两边对得上，是 rank-tracker 轮询。另有 `%site.nikoli.co.jp akari rules light up` 这类带 `%` 编码残留的查询（人不会这么打字）。**读 GSC 也要按 country/query 剔工具流量。**
> **真正的机会靶子只有 3 个**（桌面均位 8–11 的边缘页）：`/akari/how-to-solve/`（位 10.5）、`/akari/how-to-play/`（位 9.0）、首页 `/`（`shikaku online` 位 8.5/10.2）。位置 >20 的桌面长尾（`logic puzzle online` 90.5、`logic grid puzzles online` 74.3、`sudoku related games` 55.5）不要投预算。

> ⚠️ **GA4 拉数口径（强制）**：所有 GA4 查询必须加 `hostName` 过滤（只算 `gridpaw.com`）。否则 `localhost` / `*.pages.dev` 预览域 / 局域网 IP 的自测流量会混进来 —— 实测污染 28 会话 ≈ 9%（含 `192.168.31.52` LAN 与 `/?_gsaptest=` 测试 URL）。已落到三处：`public/analytics.js` + `SEOHead.astro`（dev/预览域从 2026-09-17 起不再上报）、`~/.hermes/scripts/gridpaw_ga4_dump.py`、cron-dashboard `build_metrics.py`（`host_filter`）。
>
> ⚠️ **别用周环比**：单日 3–4 会话的体量下，周环比是纯噪声。09-04~09-09 的「高位」是上线期一次性访问 + 提交动作招来的爬虫扫描，不是基线。看 **28 天滚动 + 分渠道**，并单独剔除机房 IP。

> ⚠️ **GSC 口径坑**：**query 维度**同窗口只返回部分曝光 / 词 —— 其余被 Google **匿名化过滤**（曝光仍计入总数，但不返回关键词）。**不能用 query 维度算总量，会严重低估。**

---

## 二、待决策 / 未决（有行动价值）

### 1. ✅ meowtrail.org 已归权（2026-09-15 完成，迁移进行中）

**修复前**：称「239 条规则已归权」，实测**一条都没生效**——该域名自服务 200 + 自 canonical +
Google 以独立站收录，sitemap 仍提交 121 条 URL，内容与 gridpaw.com/akari/ 近重复。
**它不是在传权，是在抢词。**

**根因**：zone 里那条归权规则处于「已禁用」。「239 条规则」的说法本身也是错的——实际只有
2 条规则，原那条第 1 条是主机名通配符（不做路径映射）。

**修复**（三条活动规则协同，顺序是硬要求）：
1. 首页精确规则 → `https://gridpaw.com/`（GSC 要求 old homepage → **new homepage**）
2. www → 裸域
3. 保路径动态规则 `concat("https://gridpaw.com/akari", http.request.uri.path)`

**验证**：
- 121/121 映射逐条 301 且目标与文档一致
- 首页 5 种变体（http/https/无斜杠/www）全部正确
- GSC「更改地址」**必需项全部通过，已确认迁移**（`meowtrail.org → gridpaw.com`），
  GSC 显示「迁移进行中」，持续 180 天

**迁移基线（2026-09-15，对比用）**：

| 站 | 近 28 天点击 | 曝光 | sitemap 提交 |
|---|---|---|---|
| meowtrail.org | 9 | **450** | 121 |
| gridpaw.com | 5 | 238 | 68 |

> meowtrail 曝光反而高于 gridpaw——老站优势。归权后这批量应逐步转到 gridpaw。

**纪律**：301 至少留 180 天（有流量继续延长）；旧域名续费满 1 年。

**待清理（CF Dashboard，非阻塞）**：删掉顺序 1 那条**已禁用**的通配符主机名规则
（排最前 + 通配符 —— 按实测的「先匹配赢」语义，一旦误启用会吃掉整个域名，
让上述三条规则全部失效）；并给首页规则改个可读名字。

### 2. ✅ spatialreasoninggame.com 已重构（2026-09-15）

原先 ~26 条静态规则有两个问题：**8 条目标带 `.html` 造成 2 跳链**，且 **5 条映射错误**
（4 篇 blog + `/daily` 落到 pictomino 首页，丢掉对应页相关性）。已改为 2 条动态规则
（例外 + 保路径），**14 条路径全部「跳 1 次」且落点正确，www 变体同样正确**。

⚠️ 关键坑：gridpaw 上 `/pictomino/daily` 是 **404**——`daily` 的对应页叫 `/pictomino/daily-puzzle`，
所以必须有那条例外规则，不能纯靠保路径通配。

配置与映射见 `REDIRECTS.md` 末段。旧静态规则现已被抢在前面，属死重量，可删。

### 3. 索引发现层

**8 条 URL 仍未收录**（6「已发现」+ 2「未知」；2026-09-16 全量 68 条 URL Inspection 实测 = 60 indexed / 6 discovered / 2 unknown，9/15 为 17 条 → **一天转正 9 条**）。

明细（2026-09-16 脚本输出，Request Indexing 目标顺序）：
- **Google 无法识别（2）**：`/akari/compare/akari-vs-nonogram/`、`/akari/compare/light-up-vs-kakuro/`
- **已发现 - 尚未编入索引（6）**：`/akari/glossary/backtracking/`、`/akari/rules/`、`/akari/what-is-light-up/`、`/community/`、`/pictomino/blog/what-is-spatial-reasoning`、`/pictomino/cat-breeds`

cron 每天 09:30 提交 Request Indexing
（配额实测约每轮 1–2 发）。**等 2–4 周跨天数据出来再决定下一批内容写什么。**
**2026-09-19 复查**：sitemap 口径基本清零——68 条中 67 已收录，仅 `/community/` 在提交流程中（当天已 Request Indexing，0 撞配额）。

### 4. 内容生产纪律

**当前不要再加内容页。** 已有 8 条 URL 未进索引（2026-09-16 实测），先让现役资产被看见。详见 `SEO-INDEXING.md`。

### 5. 第 4 个游戏：数据不支持现在加（2026-09-16 实测）

**结论**：候选词 KD 与现有词同档（44–56），进前十需 45–110 个引用域；而 gridpaw 实测
**DR 0 / 18 引用域 / spam 46** → 现在开新战场打不动。若一定要规划：**只有 `nonogram` 有真体量**
（月搜 43,280，KD 53.7），且必须排在外链/DR 改善之后。

| 候选 | 月搜 | KD | 引用域中值 |
|---|---|---|---|
| nonogram | 43,280 | 53.7 | 100 |
| kakuro | 28,170 | 52.7 | 95 |
| nurikabe | 5,970 | 54.8 | 110 |
| hitori | 5,280 | 50.1 | 85 |
| slitherlink | 4,150 | 55.6 | 110 |
| masyu | 1,280 | 44.8 | 70 |
| yajilin | 520 | 33.9 | 45 |

（对照：现有 `shikaku puzzle` KD 49.5 —— 新游戏并不比现有游戏容易。）

**数据指出的替代路径**（不改游戏、改页面形态）：全站 5 次点击中有 2 次落在 **solver 页**
（`/solver/` pos6.0、`/akari/solver/` pos4.8；query 侧 `shikaku solver` pos1.0）；教程/规则页排名最好
（how-to-solve 9.3 / rules 8.0 / how-to-play 7.8）；`/akari/games-like-sudoku/` 16 曝光但只排 30.6，
query 侧还有 10+ 变体词在 37–74 位。

**另注**：Akari 集群（138 入链）已压过 Shikaku 首页；Pictomino 几乎零曝光。

完整数据与页面级曝光表 → `research/2026-09-16_第四个游戏候选与页面形态机会.md`

### 6. compare 页全部 0 入链（旧孤岛问题的残留）——2026-09-16 实测

**事实**：5 条 `/akari/compare/*` 在站内**没有任何页面链接指向它们**。实测方法：抓 sitemap 全部 68 页，
逐页 grep 目标路径 —— 每条 compare 页的引用数 = **1,且那 1 次是它自己的 canonical 自引用**。

| compare 页 | 站内入链 | GSC 状态 |
|---|---|---|
| `/akari/compare/akari-vs-sudoku/` | 0 | 已收录 |
| `/akari/compare/light-up-vs-slitherlink/` | 0 | 已收录 |
| `/akari/compare/logic-puzzle-vs-sudoku/` | 0 | 已收录 |
| **`/akari/compare/akari-vs-nonogram/`** | 0 | **Google 无法识别**（未收录 8 条之一） |
| **`/akari/compare/light-up-vs-kakuro/`** | 0 | **Google 无法识别**（未收录 8 条之一） |

它们**出链正常**（抽查 akari-vs-sudoku：链向 `/akari/`×4、how-to-play、solver、glossary、games-like-sudoku、daily…），
只是没人链回来 → 是「单向孤岛」，仅靠 sitemap 被发现。

**与 §3.5 同类**：当时修了 4 个旗舰内容页的孤岛，compare 这批没被覆盖。

**已修（2026-09-16，部署 `1d554e81`）**：

- `/akari/` 新增 `Compare Puzzles` 区块，列出全部 5 条（`src/pages/akari/index.astro`）
- 每条 compare 页底部新增 `Other Puzzle Comparisons` 互链 4 条（`src/pages/akari/compare/[slug].astro`）
- 线上实测：`/akari/` 出现 5 条 compare 链接；每条 compare 页出现 5 条（4 条互链 + 自身 canonical）
- **待验证**：`akari-vs-nonogram` / `light-up-vs-kakuro` 的收录状态 —— 等 cron（每天 09:30）复跑 GSC URL Inspection

**额外收益**：`akari-vs-nonogram` / `light-up-vs-kakuro` 卡位的正是 nonogram / kakuro ——
两个唯一有搜索体量的候选词（见 §二.5）。补内链的成本远低于新做一个游戏。

### 7. 9/19 TDK 优化轮 + 收录口径对账（与哥飞会商定版）

**已上线（commit `6e38f0a` + 内链补丁，均部署 + IndexNow 200，线上 curl 验证）**：

- 首页 TDK：Title `Shikaku Online: Play Free Cat Logic Puzzles | GridPaw`（53）；Desc 重写（130 字符，砍 free×2 / 品牌重复）
- 内页 6 页 Title 全部 ≤55：`how-to-solve` / `akari solver` / `levels/hard` / `how-to-play` / `tips` / `akari/rules`；`akari/` Desc 砍「Play GridPaw」品牌当游戏名的写法
- 内链：`how-to-solve` ↔ `how-to-play` 正文互链（与 §二.6 compare 孤岛修法同类）
- ⚠️ **组件坑**：`SEOHead` 会给缺品牌名的 Title 自动补 ` | GridPaw`——源码 47 字符可渲染成 57。改 Title 必须验证 `dist/` 渲染值，不能只看源码字面量

**收录口径矛盾（重大，未决）**：GSC Pages 报告「已收录 16 / 已发现不抓取 27」与 URL Inspection API sitemap 口径「67/68 已收录」严重打架。Pages 报告覆盖谷歌自行发现的全部 URL（含 sitemap 外杂页），sitemap 口径才是主动声明的有效资产。**「下架 26 页」已撤回**（不可逆 + 会误伤 `bulb cat` pos8、`daily akari` pos6 等正在出曝光的活页）。待办：从 Pages 报告导出那 27 条 URL（**需 GSC UI，API 不出清单**）与 68 条 sitemap 求交集，先定性再决定动谁。

**how-to-solve 观察期**：新版 Title 9/19 晚才上线，哥飞引用的「30 曝光 0 点击」全部是旧 Title 数据——且其中 17 曝光是 `akari or step back` rank-tracker 工具流量（见 §一），真人曝光仅约 13。**两周内不再叠改 Title**；10/3 复查（cron 已设），仍 0 真人点击则上备选文案 `How to Solve Akari: 5 Techniques That Work | GridPaw`（53 字符；正文 Step 1~5 五个技法已核实对齐，数字钩子是诚实承诺）。

### 8. 低 KD 双词对齐轮（2026-09-20 执行，观察期至 10/4）

SERP 盘面调研（`research/2026-09-20_要打的词SERP竞品盘面.md`）后，对两个最低 KD 词做 on-page 对齐，**已部署（commit `686cf51`）+ IndexNow 200 + 线上 curl 复核通过**：

- **`akari online`（KD 18.2，竞品 dailyakari DR16 / akari.store DR8）→ 落页 `/akari/`**：H1 改为 `Play Akari Online Free — Light Up Puzzle Game`（目标词从拆开变连续）；首段 + FAQ 各加 1 处 `play akari online`；Title 不动（已含词且排名在动）
- **`japanese logic puzzles`（KD 14，内容真空，reddit 帖补位）→ 落页 `/japanese-logic-puzzles/`**：Title 转 play 意图 `Japanese Logic Puzzles: Play the 7 Classics Free`（渲染 57 字符）；H1 加 `Where to Play Them Free`；iframe Shikaku 试玩块上移至 Sudoku 段后（intent 前置）
- **明确不做**：不碰 `shikaku online` 落页（首页 9/19 观察期）、不开新页、不碰 `number grid puzzle`（KD 63.8 不投）
- ⚠️ Title 里的「7 Classics」是内容级硬编码——若文章游戏列表扩展，Title 需同步改
- **复查日 10/4**：看 GSC `akari online` / `japanese logic puzzles` 两个 query 的位置变化；外链侧引用域缺口比预算（20/15）还小的话下一轮力度下调

**GSC 顶部「您的另外一个网站正在迁移到此网站」横幅**：meowtrail→gridpaw 迁移的正常提示，已知现象，忽略。

---

## 三、主题文档索引

| 想了解 | 读 |
|---|---|
| Agent 边界 / 命令 / 稳定约定 | `AGENTS.md` |
| 索引与发现层（sitemap、canonical、Request Indexing、IndexNow key） | `SEO-INDEXING.md` |
| 旧域名 301 映射 + 运行态核对 | `REDIRECTS.md` |
| 分析 ID / 凭据位置 / 待办 | `ASSETS.md` |
| **自建漏斗 + 版本归因（实施全文档）** | `GRIDPAW-FUNNEL-VERSIONING.md` |
| 视觉合同（token 体系） | `STYLE.md` + `STYLE-tail-inventory.md` |
| 页面巡查底账 | `PATROL.md` |
| 视觉合同落地交接（含未做完项） | `HANDOFF-VISUAL-CONTRACT.md` |
| 第 4 个游戏候选词 + 页面形态机会 | `research/2026-09-16_第四个游戏候选与页面形态机会.md` |

---

## 四、下一步（按优先级）

0. **11-07 收 28 天验证窗**（§八，5 新页 2026-10-10 上线）：10-16 二次读数已提前通过复查（712 imp/8 clk/CTR 1.1%，meowdoku 日曝光 ~39 > 阈值 15，arrows 双页 6.2 仍在涨，详见 NEWWORD-LEDGER.md）——下一步看 arrows 双页进前 3-5 + 样本 ≥50 再动页面结构；**同窗观察 meowdoku-guide 可玩棋盘（2026-10-16 上线）的 D1 真源转化**：google 来源均时长 11s 短板有没有被可玩盘拉起来
1. **对账 Pages 报告 27 条「已发现不抓取」URL × sitemap 68 条**（GSC UI 导出，API 不出清单）→ 定性后再决定是否 404，禁止在交集弄清前下架（§二.7）
2. **10/3 复查 how-to-solve 新 Title CTR**（one-shot cron 已设，读数须剔除 `akari or step back` 工具流量），仍 0 真人点击则上备选文案（§二.7）
3. 让 cron 继续跑 Request Indexing 至 repeat 用完（9/30 前后），2–4 周后复盘索引与曝光
4. 视觉合同阶段：`HANDOFF-VISUAL-CONTRACT.md` 第三节列了欠账（样式收编 + 验证欠账）
5. **Pictomino 实现 easy/hard 模式**（2026-09-28 法老拍板）：`public/pictomino/easy.html`/`hard.html` 落地页宣传 3×3+7 命等模式，但 `game.html` 只实现了 `mode=daily`，`difficulty=easy|hard` 参数仅用于埋点——落地页实际跑经典 5 命难度表。要么把 easy/hard 模式真正实现进 `game.html`（读 URL 参数切难度阶梯+命数），要么改落地页文案（已拍板做前者）。帮助文档草稿 `help-docs/pictomino.md` FAQ 已标注 ⚠ 待修，实现后同步更新文档

---

## 六、扩量决策 + 内容集群线（2026-10-09 上线，commit `93c1525`）

> **扩量拍板（法老 2026-10-09）**：不加第 9 个游戏，克隆 akari 内容集群模式到 binary + hashi。依据（GSC 28d 实测）：akari 集群 26 页 = 谜题词曝光 411（全站其他词根总和 2.5 倍）= 模式验证；binary/takuzu 词族 pos 8.6-9.1 已在第 1 页（产品未投内容就自己爬上来）、hashiwokakero pos 8 / hashi sudoku pos 10；kenken 被 NYT 官方压着（pos 43+）不投内容；star-battle/slitherlink 继续养信号。
>
> **噪声排除**：全站最大曝光词「akari or step back」（302 impr/月且 10 月加速）= 菲律宾女排联赛 Akari Chargers 队相关词（TikTok/排球流量误落 /akari/how-to-solve/），**假曝光，不追不接**，读 how-to-solve 页数据时必须剔除（真实曝光约 120 不是 425）。

### 首批 4 页（2026-10-09 上线，全部实测 200 + IndexNow 已推）

| 页 | 承接词 | 说明 |
|---|---|---|
| `/binary/how-to-solve/` | takuzu strategy / binary puzzle rules | 验收修正：标题/meta 的「14x14 grids」宣传已删（产品最大 10×10） |
| `/binary/takuzu/` | takuzu / takuzu game | 别名权威页，FAQ 如实答「为什么没有 14x14」 |
| `/hashi/solver/` | hashi solver / bridges puzzle solver | 带 `?embed=1` 游戏 iframe |
| `/hashi/how-to-play/` | hashiwokakero / hashi sudoku | hashiwokakero 别名权威页 |

4 页均 FAQPage + BreadcrumbList JSON-LD（build 后逐块解析验证，无伪造评分）、canonical/hreflang 尾斜杠正确、sitemap-0.xml 全收录、akari/binary/hashi 三向互链。子 agent 产出 + 主会话逐条验收（build 产物上做）。

### 后续节奏

- **Phase 2 裁决点 = 11-10**（月度体检 cron `1041dc2740c8`）：takuzu/hashiwokakero 词位动了 → 补 blog/glossary 页型到爬得快的集群；某页连续两月零曝光 → 查 thin/意图
- GSC 收录预期 1-2 周（hub 内链 + 新 sitemap 已被 build 收录）

---

## 七、Lemmy 运营线（2026-10-09 恢复正常运营，法老拍板）

- **定位：dev log 风格正常运营**（类似 reddit gamedev），**永不降级**（此前复盘 cron 的降级建议已作废）
- 发帖 cron `88953652f56c`：周一/周四 10:00 各一轮（!dailygames + 自有社区 !gridpaw_dailyakari 各 1 帖），内容角度从 gridpaw.com 真实素材轮换（新游戏/引擎改进/changelog），自带「查评论→优先回评论」纪律
- 复盘 cron `a23ec4836634`：每日 11:00（6+2 帖存活性/订阅数/GA4 归因/被删警），**ROI 警不再升级、只记录数据**
- **发帖 cron 升级（2026-10-14 法老拍板）**：`88953652f56c` prompt 加「帖正文三段结构」——① Update 一句话（changelog/git log 真实取材，禁编造）② 规则段 3-5 行（新玩家英文短句：怎么赢/机制/每日关）③ 引用与直链（Full changelog→`/from/lemmy-devlog`；游戏直链用 `/from/lemmy-*` 短链，帖内一律完整 URL）。dailygames 版偏改动、自有社区版偏玩法+解法；+whoami 部署前探活。三段结构同步沉淀 skill `lemmy-community-ops`。10-12 短链部署已闭环（1abbd39 → 10-13 deployment 51b2293d，302 实测）
- 账本真源：`~/workspace/backlink-workspace/records/lemmy-post-status.txt` + `records/daily/`；自有社区 39 订阅（38 联邦全沉睡，subscribers_local=1），开刊两周评论 0 条，真实互动 = dailygames 大盘帖那批（5 up + 5 评论）
- 归因基建：`/from/lemmy-*` path 短链（public/_redirects，commit 879036e；Lemmy 剥 query → 站内 302 附加 utm），`/from/lemmy-devlog` → /changelog/
- 首轮双帖（10-09）：[dailygames dev log](https://lemmy.zip/post/72921573) + [自有社区](https://lemmy.zip/post/72921575)
- **遗留待办**：漏斗周报 cron `53f2a4b531f1` deliver=all 投递坏（10-04 结果丢失）→ 待改 deliver 目标
- 新游戏收录（10-09 实测）：5 页（slitherlink/star-battle/kenken/hashi/binary）GSC URL Inspection **5/5 Submitted and indexed**，无孤岛（首页+akari 双入口内链），UV 基线：近 7 天 178 UV / 日均 ~30

---

## 八、内页攻略战（2026-10-10 上线 5 页，雷达首个实战命中）

> 源头：T1 品类反推 arrows puzzle 词族（com.ecffri.arrows 100M+ 装，词 12 个月单边爬升）。全量词/KD 数据与状态机见 `NEWWORD-LEDGER.md`（去重真源），本节只记作战面。

### 5 页清单与首次读数（2026-10-12，窗口第 2-3 天）

| 页 | 承接词 | KD | GSC 读数（10-10~12） | 判断 |
|---|---|---|---|---|
| /arrows-puzzle/ | arrows puzzle | 40.5 | 9 imp / pos 6.8 / com.ecffri.arrows 已出曝光 | hub 起位 |
| /arrows-puzzle-walkthrough/ | walkthrough | **11.6** 旗舰 | 9 imp / pos 6.7 | 起位，观察斜率 |
| /block-blast-hints/ | block blast hints | 20.3 | 3 imp / pos 8.3 | 慢热 |
| /meowdoku-guide/ | meowdoku alternative/tips | 42.2 | **33 imp / 2 clk / pos 7.9**；meowdoku tips pos 1.0 | **领跑**，变体词打法 2 天见牙 |
| /cross-math-puzzle/ | cross math puzzle | 53.8 | 2 imp / pos **3.5** | 位置好量未起 |

- GA4 落地这 5 页 = 0 会话（窗口早期正常，GSC 2 clk 需排自测）；全站大盘 217-305 imp/日未被带动
- **复查点 2026-10-17**（GSC 滞后消化完 + 满 7 天）：meowdoku-guide 日曝光 <15 或 arrows 双页停 9 不动 → 给 walkthrough 页加内链权重
- **复查结论 2026-10-17（三读，第 8 天）**：触发条件全不成立，不加内链权重——累计 **1029 imp / 9 clk**（首读 56 → 二读 712 → 三读持续起量），meowdoku-guide 完整日均 **60 imp/日**（>15）、arrows 双页日均 57/33 且 bestPos 爬至 **6.0**、日合计 91→208→193→216→221 稳定爬坡（10-16 尾日 99 为滞后非掉量）。**新观察点：walkthrough 198 imp 0 clk CTR 0.0%**——11-07 收窗若仍零点击，改 description 直接给答案式文案而非内链。可玩盘（10-16 上线）时长效应 48h 未满不可读，复查排 10-19 后；详见 NEWWORD-LEDGER.md arrows puzzle 词条
- 28 天验证窗口至 **2026-11-07**

### meowdoku-guide 整页重做 + 批量布局修（2026-10-13，deploy `24e9d63f`）

**触发**：法老发现内容错位 + GA4 时长 0。审计实锤三件事：
1. **内容把游戏写错**：Meowdoku 真身是 LinkedIn Queens 类猫谜题（色区放猫/行列唯一/不接触），原页整篇按 9x9 数独写（规则/技巧/FAQ 全错）→ GA4 30d 7 会话 engagementRate 0.0% 全 bounce，而 GSC pos 9.2 + CTR 4.3% 全站最高 = 标题能骗点击、落地接不住。
2. **同类硬伤 3 页**：arrows-puzzle + arrows-puzzle-walkthrough 把"点按箭头滑出棋盘避免碰撞"写成"拖箭头指向靶子+颜色配对+传送门"（虚构机制）；block-blast-hints 1 处 FAQ 错（称落子可回改，实际不可移动）。
3. **布局 bug 8 页**：`class="seo-content"` 本页未定义 → Read Next 贴左（meowdoku/arrows×2/block-blast/cross-math/brain-teasers/japanese/logic-puzzle-grid）。

**meowdoku 重做**（skill `game-guide-page-playbook` 沉淀了全流程）：
- 框架照 SERP#1 meowdoku.org（EMD 5 个月月 43.4 万访问）：规则 4 条+演示盘 → Controls → 6 策略 → **Level 1-3 真实答案**（竞品图逐格像素采样还原分区图 + 唯一解求解器枚举验证 + 对照官方答案）→ FAQ 6 条 Schema 同步重写
- TDK 不动（排名/CTR 已验证）；"answers" 意图从劝退文改为真答案+推导示范；随机化盘面免责置顶；猫 sprite/盘面快照落 `public/meowdoku-guide/`
- Phase 2 挂账：meowdoku answers level N 逐关 pSEO 页（竞品 meowdoku.app 靠该词族月 12.3K 流量，KD 42）

**批量修**：8 页 `seo-content`→`seo-section`（720px 居中）。Playwright 验收：Read Next secLeft=280==mainLeft=280、移动端 0 溢出、棋盘 20 猫 10✕ 分毫不差。

**待办**：arrows 双页虚构机制重写 + block-blast FAQ 修正（同 skill 流程，待法老排期）→ **✅ 已完成（2026-10-13 下午，deploy `da5d6f87`，commit `5022e76`）**：arrows 双页照 meowdoku 骨架重写（官方验证玩法：点按滑出/碰撞扣心/双头箭头/Normal→Nightmare），CSS 箭头演示盘 + 2 官方截图；block-blast FAQ 双落盘修正。验收抓到子 agent 保留旧页冷蓝主题（#3D6BF0）→ 全量换暖琥珀+奶油白后 vision 复读确认。"arrows puzzle walkthrough" SERP 补测：KD 8.1 极易，#2/#7 均为 DR 0 六个月新站 = 全站最容易正面进入的词；竞品 arrowspuzzleguide.com 框架 = Level 1–1000 逐关索引+难度分层+daily，**逐关 pSEO Phase 2 侦察结论（2026-10-13 下午，暂缓立项）**：
- 竞品真相：arrowspuzzleguide.com 逐关页 = 纯模板文字+YouTube 嵌入（零真数据）；mobilepuzzlehelp.com = 结构化 SVG 盘面+data-replay-steps 解法序，L1 与实机视频吻合，但按 marker 方向建模存在同列相向不可解配置（#1↔#33），按 data-direction+领先点阻挡可解率 93-100% 非全绿——真实性无法完全验证
- ROI 反证：两个 DR0 竞品全站月访问合计 ~3.6K（含其他游戏），摊到 1000 页 ≈ 每页 1-2 访问/月；逐关词族=低价值词海 + scaled-content 风险
- 视频管线不成立：YouTube 仅 android 客户端可下（640×360），盘面 <250px，vision 数箭头不可靠
- 替代方案：做 3-5 个高意图页（how many levels / max level / level 1000），等 10-17 GSC 数据再评估
- **差异化对比节已上线（2026-10-13 晚，deploy `6dc6b820`，commit `8d41c2e`）**：三 guide 页（arrows/arrows-walkthrough/meowdoku）FAQ 前新增 "How This Guide Compares" 资源类型对比表——本 guide vs 官方商店页 vs 视频攻略 vs 自动生成站；不点名竞品，全部可验证事实；移动端堆叠卡片。此节为 E-E-A-T 差异化标配，后续新 guide 页照抄
- **Level 1-3 逐关攻略已上线（2026-10-13 深夜，deploy `193d5113`，commit `821d8c0`）**：walkthrough 页新增已验证逐关节（SVG 重绘盘面）。L1/L2 任意顺序（轨道独立），L3 首个顺序敏感关（长S被#1+#4挡，解序 1→4→2→3，求解器+视频4击零掉心吻合）。数据管线：同款短视频逐帧蒙太奇+vision 追踪消失顺序 ↔ 竞品 SVG 几何交叉验证，小关（≤4箭头）可靠；10-17 复查后视 GSC 表现决定是否扩到 L4-L10
- **Levels 4-10 已验证事实表 + 需求 CTA 已上线（2026-10-13 深夜，deploy `daf87eea`，commit `7f7ae3e`）**：L4 起盘面重叠成迷宫状超视频验证上限（盲读实锤），禁虚构不画盘 → 改发逐关事实：尺寸/箭头数（结构化数据×实拍交叉）+ 实况（L4/5/7/8 零掉心、L6 心形盘+Hard、**L10 Hard+实拍掉心=前10关唯一碰撞实证**；通关语轮换 Well done!/Nice!/Brilliant!）。CTA「Yes — bring on Levels 11+」单击投票 → `guide_more_levels_click`（GA4-only 非 D1 白名单）；Playwright defineProperty 拦截实测事件名/参数逐字命中。**复盘：L4 复原尝试失败是正确止损——单帧问拓扑必幻觉，序列追踪只够验事实不够验几何**。CTA 数据后续在 GA4 查 guide_more_levels_click 计数决定 L11+ 批次立项

### 外链策略（2026-10-12 拍板：分层，不均摊）

内链全站必做（零成本）；外链只给「有排名机会但差一口气」的页——若 10-17 复查确认 walkthrough 卡住，KD 11.6 对应预算（10-20 引用域）花在它身上。

**3ue 实证（2026-10-12，两轮抓取，完整判定报告 `backlink-pool/meowdoku.org-classified-final.md`）**：竞品 DR39 = 101 引荐域，链接 **100% 砸首页**（根域 939 反链/92 域，子页 /play 仅 32 反链 1 域）。头部 edu 链真身 = **博客评论**（fsu/bc/american/williams/uco.es 全是 NOFOLLOW UGC 评论，锚文本统一 "Meowdoku Game Guide"，话术模板化）——即一条规模化评论外链流水线，非自然 editorial。**结论**：gridpaw 不给内页买外链；5 页权重走内链体系；外链若做打 gridpaw.com 首页，载体用现成 blog-comment 管线（锚品牌词 "GridPaw"，话术手写不套模板）。优先级：不急，10-17 复查确认卡住后再动。

---

## 五、自建漏斗 + 版本归因（2026-09-18 P0+P1+P2 已上线）

照 `GRIDPAW-FUNNEL-VERSIONING.md` 全量落地（furriq 方案跨站适配）。现役事实：

| 项 | 状态 | 证据（2026-09-18 实测） |
|---|---|---|
| build id 注入 | ✅ | `pnpm run build` 输出 `[build-info] 299fa4c-dirty …`；`grep 299fa4c-dirty dist/index.html` 命中 |
| D1 表 | ✅ | remote meowtrail-users：`gp_event` / `gp_build` 存在（`sqlite_master` 实查） |
| ingest 端点 | ✅ | 生产 `POST /api/events` → 200 + `Set-Cookie: gp_gid=…`；白名单外事件 400 |
| 归因端点 | ✅ | 无 token 403；带 token 返回 stage/signin/traffic/lastvisit 四段 |
| admin 页 | ✅ | `/admin/funnel/` 200 + `X-Robots-Tag: noindex`（`public/_headers`）+ robots meta；**未进 sitemap**（`sitemap-0.xml` 实查无 admin） |
| 生产数据 | ✅ | D1 实查：`visit` 落库带 `build_id='299fa4c-dirty'`；`gp_build` 有该行 |
| 看板接入 | ✅ | cron-dashboard `CRON_DASH_SAMPLES=1` 全链路 + 真实采集跑通；`buildfunnel = {furriq, gridpaw}` 双站；三层对账一致（D1 直查 = metrics.db = dashboard_data.json） |
| admin token | 本地 `.funnel-admin-token`（gitignore）+ Pages secret `FUNNEL_ADMIN_TOKEN`；开关 `FUNNEL_EVENT_INGESTION_ENABLED` 只在 wrangler.toml [vars] 一处 |

- 漏斗阶段：visit → start(game_start) → move(first_move) → solve(level_up) → hint(hint_click) → share(share_reddit+share_copy) → signin(daily_progress.user_id)
- 归因口径：按访客**首次到访**版本（rn=1），回访不重归因；live = 24h 内有 visit
- **读表纪律**（实施文档 §6.7）：单版本 visit 两位数以内 = 噪声，禁止下改版结论；先查 bot 比例（`json_extract(metadata,'$.isLikelyBot')`，机房流量约半数）；发布后 CDN 旧 HTML 继续报旧 build id 是预期
- 未做（有意）：pictomino 子站接入（P1 可选项，`public/pictomino/*.html` 需 `build-id.js` + analytics.js 改造）；CF Access 替代 token；identity 合并表

## 2026-09-23 首页布局方案 A 上线（含一次错误回退的当轮恢复）

**上线内容**（方案 A，法老批准，deploy `71b0e4f4` → 修复性重部署 `8fb09561`）：
- ① Game Over 弹窗 h2 → div（不再污染页面大纲）
- ② 空排行榜位 → Today's Challenge 卡（`#challengeCard`，真实上榜数据时 JS 自动切回 `#dailyLeaderboardPanel`）
- ③ What Players Say 整段虚构评价（6 条假五星，2 条与站内事实自相矛盾）→ GridPaw in Numbers 真实数据块（∞/3/0/15，全部站内可验证）
- ④ Tips 双 section 合并 + /tips/ 链接（Common Mistakes 折入摘要段）

**事故与恢复**：子 agent 回报的 changed_hunks 实为「工作区 vs HEAD」整段 diff（把 9/21 Clarity 漏斗改造、9/21 真机回归修复等已部署未提交工作误报为自己的产出）。主 agent 用 HEAD 做基线比对、未先查本文件历史轮次，误判「玩法类超纲」并回退（deploy `71b0e4f4` 一度丢失 hint 三层/抖动/徽章帮助），法老拍板回退的前提因此失效。当轮发现（STATUS §9/21 记录佐证）后十处全部逐字恢复并重部署（`8fb09561`），线上 8/8 断言通过。
**教训（已录入 skill）**：判定「子 agent 超纲」前必须先查本文件历史轮次——**本仓常态化 deploy-but-uncommitted，HEAD ≠ 最近一次上线的代码**；diff 基线错误会把既有功能误判为新改动。

**遗留**：`.astro/` 两个缓存文件已 `git rm --cached` + gitignore（未 commit，随下次提交入库）；`pnpm add -D wrangler` 待办（本机无全局 wrangler，deploy 脚本会 command not found，临时用 `npx -y wrangler`）。

## 2026-09-23 深夜 新手引导上线（deploy `9129581f` → `0a8d7843` → `fc2f02f5` → 真棋盘重构 `83a400d3`→`f4ce0cae`→`840eab44`）

Clarity 实锤（30min 0 次成功拖拽、徽章狂点 17 次/分）→ 3 步教练引导（v6 预览经法老 5 轮反馈迭代后拍板）：
- **流程**：①聚光数字讲规则 → ②猫爪自动演示拖拽（用户随时上手即接管）→ ③用户亲手拖对为止（拖错仅抖动+提示不扣血，**3 秒无操作猫爪自动回来重演**）。成功出真反馈：CAT_PALETTE 橙 + 游戏真实 `.cat-face` 体系猫脸
- **触发**：`gp_onboarded_v1` 未设 且 levelNum===1；完成/Skip 均写标记；Tips 区「🐾 Replay tutorial」可重放（事件委托接线）
- **GA4**：onboard_start / onboard_step(step) / onboard_complete / onboard_skip
- ** ego-browser 全流程实测 6/6 绿**：新用户触发✓ 演示出猫矩形✓ 真实拖拽判定（坐标几何，鼠标/触摸通吃）✓ 拖错抖动+留在第3步✓ 3秒轮播✓ Skip✓ 老用户不打扰✓ Replay✓ 主游戏无影响✓
- **⚠️ 第三次踩同一个坑**：主内联脚本在页面中部，其**之后**解析的元素不能 getElementById 直接接线（Get-the-App CTA、obReplay 两次中招）——overlay markup 因此必须放在脚本之前；已写进 AGENTS.md 关键约定
- 部署暗雷再确认：会话被注入 Clash 代理（HTTP_PROXY=127.0.0.1:7890）时 wrangler 认证失败**但 exit 0 假成功**——每次部署必须核对线上 CSS hash 或部署输出含 "Deployment complete"

### 真棋盘重构（法老指令：引导要跟教学 1-4 关棋局做演示，不走架空练习盘）

### Shikaku 教练卡盖棋盘 bug（2026-09-23 深夜，法老截图报告，deploy `36e84adf`）

- **根因**：index.astro 有**两条 `.onboard-coach` 规则**（v6 残留），前 z-index:900 后 z-index:2，层叠后者胜；棋盘内拖拽幻影 `.onboard-drag` z-index:5 > 2 → 演示矩形画在卡片上。且 fixed 卡片在矮视口直接盖住棋盘底部格子，挡交互。
- **修法**：①合并重复规则为一条；②卡片从 `position:fixed; bottom` 改**文档流**，标记从页面尾部移入游戏区 board-wrap 之后——卡片永远在棋盘下方，物理上不可能再遮挡。obToast 保持 fixed。
- 实测：卡片 static 且 boardBottom=518 < cardTop=530 零重叠；STEP 2/3 拖拽幻影 ghostOverCard=false；视觉确认虚线只在棋盘内 ✓。
- **教训**：同一选择器 CSS 规则写两遍，改 z-index 时必查重复定义；fixed 浮层卡片在游戏页=遮挡风险，游戏 UI 卡片优先文档流。

### Akari ❌ 错误示范 + Pictomino 教学三关递进（2026-09-23 深夜，法老指令，deploy `6f251c48`）

- **Akari**：coach 错拍演示升级——错误目标 `akObWrongCell()` 优先选「数字已满旁会超标」的格子（number_excess，教学价值高于单纯点已亮格），fallback 已亮格；红闪同时弹 **❌**（`.ak-obx` CSS 双杠画叉+白描边，不依赖 emoji 字形）；文案按违规类型动态化（T2=猫冲突 / T3="That number already has all its cats"）。注意 **T1 无错误示范**——它的白格全被墙隔开，落子后不存在非法格（逻辑正确跳过）。实测 T2/T3 均触发 ✓。
- **Pictomino**：DIFF_TABLE 教学行改为三关递进：T1=1 洞 1 候选（认识玩法）→ T2=2 洞 1 候选（连填）→ T3=3 洞 2 候选（学判别：手里碎片对应哪个 +）；Level 4 起照旧（Easy 4×4/6 洞不动，无级联偏移）。实测 round-info：0/1 → 0/2 → 0/3 ✓。
- 测试脚手架坑：boot 恒 `startLevel(0)`（跨会话续关在局内推进）；首访必先进引导课（body.tut-mode），DOM 验证须先走完课；`.cell.hole` 数量在 showPreview 过渡期偏少，round-info 的 `Filled X/N` 是权威计数。

### Akari 固定教学盘（2026-09-23 深夜，法老拍板「4 小关递进」，deploy `08c0a1dc`）

教学关从随机改为**固定手工盘**（`AKARI_TUTORIALS` in akari/index.astro，`buildTutorialPuzzle(level)` 在 newPuzzleSkip/newPuzzle 中替换 generatePuzzle）：
- **T1 数字含义**：中心墙「4」十字盘 → 4=四邻全放，零思考首胜
- **T2 对立冲突**：中心墙「2」→ 强制两猫分居墙两侧，面对面却合法（墙挡视线）——冲突规则教具
- **T3 三线索综合**：数字 1/2/1 三墙 → 三只猫各归其位
- **T4 升格**：4×4 数字 2/2/1 → 进 Easy 前最后课
- 四盘全部经引擎 `solve(grid,size,2)` 验证**唯一解**（线上实时 solve 出 solution，不硬编码答案）；Level 4 起照旧随机。Coach 文案按关定制（akObYourTurn 查表）。
- **设计语义坑**：引擎格子编码 `9`=白格、`-1`=黑墙、`>=0`=带数字墙——`0` 是数字 0 的墙不是空格；且 solve 假定方阵，1×3/1×5 概念须嵌进 3×3（补黑行）。
- 实测：L1 `#.#/.4./#.#` → L2 `.#./.2./.#.` → L3 `.1./2#./..1` → **L4 `2.../..../21../....`（4×4）** 逐关自动进位 ✓ 零报错，四关全链路实盘验证完成。

### Akari + Pictomino 引导同步（2026-09-23 深夜，deploy `b706c159`→`0f6f9b94`→`5c18daaa`）

**Akari（新建，/akari/）**：教学关无固定棋盘——引擎 `generatePuzzle(5)` 每局随机，"真实教学盘"=玩家当下对局的 `currentPuzzle`。Coach 骑真盘：①规则卡（仅首访）→ ②爪子对错对照演示：点 `solution` 第一猫位**真落子**（handleClick 真实路径）→ 移到已亮格再点 → `cell-violation` 红闪讲解不落子 → ③用户回合：3 秒无操作爪子指下一个 solution 位，**首次合法落子即毕业**（handleClick `else akObOnPlace()` 挂钩）。状态 `akari_ob_tut` {t1,t2,t3}；GA4 onboard_start/step/complete/skip。实测：真落子 1 猫 5 亮→错拍讲解→毕业 t1 落 2 猫 12 亮，零报错。
**Pictomino（换肤，game.html）**：现有两步交互课逻辑零改动，纯 UI 品牌化——teal 横幅→白卡+STEP 徽标+琥珀箭头+真爪子悬在目标（碎片/洞）上方弹跳。实测 Step1→Step2 全链路 ✓。
**坑（新增第 4 坑）**：**module 严格模式下块内函数声明是块级作用域**——coach 块包 `if (card) {}` 导致外部钩子 `akObOnPlace` ReferenceError（崩了 handleClick）、`akObMaybeCoach` 被 try/catch 静默吞。module 脚本 deferred，DOM 必就绪，直接写顶层不包块。
预览迭代坑：::preview 框不随 HTML 加载相对路径外链脚本——预览文件必须零依赖单文件（引擎 13KB 内联）。

- **机制**：newPuzzle() 后经 `window.__obMaybeCoach()` 触发；教学关（LEVEL_DEFS[i].isTutorial）首次进入时：①rule 卡（仅第一次，附 `hint-active` 高亮答案区）→ ②猫爪在**真棋盘**上演示该关 `puzzle.solutionRects[0]` 的正确画法（虚线框+爪子手势，不落子）→ ③用户亲手拖（游戏原生 mouse/touch 路径），3 秒无操作爪子回来重演；**首次成功落子即毕业**（`__obOnPlacement` 挂在 onEnd rects.push 后）
- **状态**：`gp_ob_tut` JSON `{t1..t4:true}` 逐关记忆；T2-T4 直接进 watch（rule 只讲一次）；Skip 单独记关；老玩家/非教学关不打扰
- **Replay**：教学关未学完→重跑 coach；普通关→一次性演示手势（等效视觉 hint）
- **实测 ego-browser 7/7 绿**：T1 rule+高亮✓ 接管✓ 落子毕业✓ T2/T3 自动直进 watch✓ Skip 记关✓ 老用户不打扰✓ 非教学关 Replay 演示✓（T4 布局未模拟走通，代码路径与 T2/T3 同一）
- **坑**：`currentLevelDef` 非主脚本顶层变量（不能直接引用）→ 用引擎全局 `LEVEL_DEFS[levelNum-1]`；游戏拖拽是 mouse+touch 事件**不是 pointer**（模拟测试须发 MouseEvent）；IIFE 末尾必须主动调一次 `__obMaybeCoach()`（初始 newPuzzle 在 IIFE 之前执行）

## 2026-09-23 晚 真机反馈三连修（deploy `07f31e48` → 委托修复 `cad0a713`）

法老 mini 实测反馈 → 定位 → 修复（ego-browser 全程实测复现）：
1. **导航栏错位** = `.header-nav` 在 481-700px 宽度溢出（600px 实测溢出 20px，Solver 戳出屏幕）——桌面导航与汉堡菜单断点间有空窗。修：断点 480→700px，700/600/550/480 全宽复验溢出 0
2. **「Challenge 进去是教学关卡」** = Get the App 区「📅 Try Daily Challenge」是死链接（`href="/#play"` 不调 generateDaily），「▶ Play Now」更是 `href="/"` 直接刷新。Challenge 卡本体（Play Now）一直是好的。修：两 CTA 接线；**踩坑**：该区块在主内联脚本之后解析，直接 getElementById 接线时元素不存在、handler 静默挂空——改事件委托后冷启动 2 轮复验均正确进入 Daily 10×10
3. **💡 Stuck 提示秒消失** = badge_help 消息 2500ms 太短 → 8000ms，6 秒后仍在复验 ✓

## 2026-09-23 深夜 手机端乱码/错位修（deploy `3a79318b`）

法老手机（鸿蒙 emoji 字体）反馈乱码+工具栏错位，滑动正常 ✓：
1. **乱码根因 = keycap emoji 缺字形**：`1️⃣`（1+FE0F+20E3 组合序列）在鸿蒙字体渲染成「1」+ tofu 空心方块。首页 tips 卡 `1️⃣`→`⭐`；**全站清洗**：/akari/ 与 /akari/tips/ 的 0️⃣-4️⃣ 一律剥成纯数字（perl `\x{FE0F}\x{20E3}`），语义本就是数字卡
2. **「错位」观感根因 = status 消息连用两个 📅**：鸿蒙把 📅 渲染成带「SEPT 15」大字的日历图标，`hit the 📅 button` 被撑成三截。改为单 📅 + `hit the Daily button (calendar icon) in the toolbar!`
3. 390/360px 受控复验：工具栏排布本身正常、body 溢出 0——用户感知的错位即第 2 条
4. 全站三页线上复验 keycap 残留 0。**教训**：面向国内安卓/鸿蒙用户的站，避免 keycap 组合 emoji（AFE0F+20E3）与重复大 emoji 文案

## 2026-09-21 Clarity 漏斗改造（hint 三层 + 徽章帮助 + iOS 登录修复）

**依据**：Clarity 录屏事件流全量提取（6 会话，方法见 skill `game-event-tracking`）。关键实锤：
- hint 纯图标没人用（30 分钟重度用户 0 hint）；Tutorial 徽章被当帮助按钮 1 分钟点 17 次；L5 登录弹窗 3/3 会话 2-3 秒点 Maybe later；iOS 用户 3 次点 header sign-in 全 miss（GA4 sign_in_click=0 佐证：点击落在按钮/横幅死区）；game over 弹窗开着时拖拽穿透（2 秒 3 次 game_over）；Pictomino 首次没血即流失。
- 回放里数字显示 ▫/□ = Clarity 渲染缺陷，非站点 bug，勿按此改代码。

**本次改动**（deploy 5a12b1c6）：
- Shikaku `index.astro`：hint 图标→文字胶囊按钮（💡 Hint + 次数 badge）；连错 2 次 hint 按钮抖动放大特效（每关一次，prefers-reduced-motion 降级）；game over 弹窗加「💡 Retry with a Hint」（同一道题+回血+高亮正确矩形，无剩余 hint 则隐藏）；弹窗打开时 board pointer-events=none 修穿透；难度徽章可点→滚到 Tips 区+status 提示；game_start 延迟至 DOMContentLoaded（修 gpTrack module 注入竞态，D1 69:6 缺口根因）。
- Akari `akari/index.astro`：同款 hint 胶囊+抖动 nudge（连错 2 次触发，合规落子/换关/重置清零）；难度徽章可点→滚到 Strategy Guide；game_start 同款 DCL 修复。
- Pictomino `game.html`：失败弹窗加战绩行 + 「Skip this puzzle →」跳关按钮（puzzle_skip 埋点，GA4）。
- 白名单：`badge_help_click` 加入 funnel-track.ts + _funnel-sql.ts。
- sign-in 触控目标 44px（HIG 最小标准）+ z-index，L5 弹窗按钮同款加大。

**待验证**：D1 game_start 应随新流量恢复（部署后暂无流量未验）；iOS 真机点登录是否跳转；抖动 nudge 后 hint 使用率；badge_help_click 数量。
**未做（本轮范围外）**：sign-in 弹窗价值主张重写（延后触发/进度保存钩子，数据上 3 秒拒绝是文案问题）；pictomino gpTrack 全量接入（D1 侧仍只有 GA4）。

## 2026-09-21 真机回归修复（deploy 22ba9c6c）
- **滚动锁死**：`body{touch-action:none}` 老 bug（手机整页无法滑动，桌面无感）→ 移到 `.board`，CSS 新 hash `DlDBJQIg` 已上线。
- **登录态导航换行**：account-area 改 nowrap，名字 5.5em 截断，Play Daily 缩小。
- **登录后跳第 9 关**：云端进度恢复功能正常（admin 云端存档领先本地）→ 加「☁️ Cloud progress restored」status 提示。
- **待用户操作**：Google Cloud Console → OAuth 同意屏幕：应用名 MeowTrail-web → GridPaw，徽标换 `public/icon-512.png`，隐私链接 https://gridpaw.com/akari/privacy/（顶级 /privacy/ 待补）。

## 2026-09-22 Pictomino 接入 D1 漏斗（deploy b335cff6）
- `public/pictomino/gp-track.js`：独立打点客户端（静态页过不了 Vite），白名单/PROD 守卫/visit 去重与 funnel-track.ts 同构——**改白名单要两边同步**。
- `scripts/gen-build-info.mjs` 构建期同步产出 `public/pictomino/gp-build.js`（window.GP_BUILD）。
- game.html 埋点：visit / game_start / first_move / level_up / game_over / daily_solved / puzzle_skip / help_click / share_reddit / share_copy / community_click（`help_click` 已加双白名单）。
- 踩坑：game.html 会 302 到 `/pictomino/game`（无 .html）→ script 必须用绝对路径 `/pictomino/gp-*.js`；**改 public/ 后必须重新 pnpm build 再 deploy**（dist 才会带上）。
- 外站 iframe 跨域嵌入时 /api/events 静默失败（fetch catch），只统计 gridpaw.com 同源访问。
- 验证：D1 实收 `visit | 37ff67b-dirty | path=/pictomino/game` ✅（注意 gp_event.created_at 是毫秒整数，比较用 `(strftime('%s','now')-N)*1000`，别用 datetime()）。

## 2026-09-22 排期项落地（deploy ca678f21）
- **`/privacy/` 顶级隐私政策页**（noindex，覆盖三游戏 + 匿名埋点说明段），OAuth 同意屏链接待用户在 GCP 后台改为此地址。
- **Pictomino 失败弹窗「👁 Peek」按钮**：重放开局 2 秒预览后重试本关（hint_click source=lose_overlay_peek），与 Try again / Skip 并列。
- **漏斗周报 cron** `53f2a4b531f1`：每周日 20:00 自动拉 D1+GA4 对比改动前后，deliver=all。含样本纪律（去 bot<10 只报数）与 created_at 毫秒口径说明。

## 2026-09-26 Adsterra 变现线（过审 + 提现链路 + 格式路线决策）
- **账号侧**：公司审核 09-25 过审（主体 Guangzhou Zhuayin Intelligent Technology Co Ltd，爪印）；Native Banner Active（Site 6063560，Ad Unit 31317669）。⚠️ Adsterra 后台公司名拼成了 Zhuoyin，字段锁死改不了，工单已发 support@adsterra.com（09-25，SENT id 1a0d820ad0b5eec4），回复后去 /payout-information 复核显示名。
- **furriq.com 已建站（09-26）**：Site 6078380（category Other，成人广告关，建站直接 Active）+ Ad Unit 31420265（NativeBanner_1）。只挂 /blog/* 文章页正文中部（品种/对比/工具/定价/首页红线不挂），详情与代码坑见 `furriq/.adsterra/native-banner.snippet.md` + `furriq/AD-TIER.md`。
- **提现链路（已打通）**：Wire EUR 已随 KYB 生效（Banking Circle S.A.，IBAN DE62...5678），EUR $0 手续费 / min $1,000 / 到账 5 工作日；满额提现 → Subotiz Global Account（USD+EUR 双户）→ 换 RMB。Subotiz 侧拼写正确，无需动。
- **现状数据**：Balance $0.03（09/25 起）；广告位=4 个 SEO 内容页正文各 1 个 Native Banner（brain-teasers-for-adults / logic-puzzle-grid / japanese-logic-puzzles / number-grid-puzzle），游戏页/首页/?embed=1 全部无广告（红线维持）。
- **付费点（Kakuro 爪窥付费墙）路线（09-27 定，暂缓执行）**：现状=仅 `public/kakuro/demo.html`（noindex）里 mock（`payPeek()` 点按钮直接解锁，零支付/零广告 SDK），正式 `/kakuro/` 不带，D1 paywall_* 事件 0 条。顺序：①正式页先上门控+mock 采漏斗数据 → ②paywall_shown 有样本后看触达/转化 → ③UV 起来 + Adsterra 余额真实进账后再接支付。⚠️ demo 里「📺 Watch ad」按钮是死承诺——Adsterra 无激励视频格式（见 skill ad-network-monetization），真实现无格式可接，别让真人点到。Cat coins 真实化=整套支付集成，等数据支撑。
- **格式路线决策（09-26 定）**：
  - 现在（<100 UV/天）：不加任何格式，保持现状。
  - 内容页日 UV 几百：内容页底部加 1 个 Banner 300x250（CPM 低于 Native，纯增量库存）。
  - 稳定流量 + 余额几百刀垫底：再评估游戏页 Social Bar（只开单格式、观察一周账号状态）；游戏页零广告红线要破需单独决策。
  - **永不**：Popunder、Smartlink（整页跳转，毁回头客）。Adsterra 无激励视频格式（实测仅 Popunder/Native Banner/Banner/Smartlink/Social Bar 五种）。
- **检查广告的已知结论**：Agent 本地无法看到真实创意（CN IP 空填充/代理 403/云浏览器被识别为 bot 直接重定向 direct link），唯一现成渠道=Clarity 会话录屏（流量小暂无深滚样本，筛选路径已跑通：录制页筛选器→已访问 URL 包含页面 slug）。教训沉淀在 skill `ad-network-monetization`。
- **全站猫 emoji 清理（09-26 晚，`e6e543e`，随 `7959e4b` 部署上线）**：法老发现导航品牌位是 `🐱 GridPaw`，彻查全站共 61 文件 ~130 处：品牌位（GameNav + pictomino 10 处 brand-logo）换 favicon.svg logo；H1/CTA/toast/教程/分享文本约 115 处删 emoji；**机制图标保留**（akari 灯泡 content:'🐱'、胜利彩蛋粒子池、kakuro 迷雾 🐾 标记——玩法本体）。线上实测：首页 🐱=0、H1/CTA 干净、机制图标 CSS hash 与线上一致。顺带修 `pnpm run deploy` 依赖全局 wrangler 的坑（bare → `npx -y`）。

## 2026-10-13 漏斗诊断（game_start 口径失真）+ 口径修复（可见才计开局）

**依据**：GA4 28 天漏斗（US desktop first_move 率 14% vs mobile 38%）+ Clarity 录屏取证（3 天 54 会话全量扫描，方法见 skill `clarity-session-forensics` 的 gridpaw 实操节）。关键实锤：
- **10vuizs（US desktop，Pinterest 进首页，5:04，0 点击）事件时间线：00:00 页面访问 → 00:01 页面已隐藏 → 00:01 game_start 同秒触发 → 之后 5 分钟零事件**。后台标签页加载：game_start 在用户从未看到页面的情况下计了一次「开局」。
- 首页落地 17 会话，**11 个（65%）game_start 触发但 0 点击**；US desktop 首页 3/3 全零点击。game_start=页面加载事件，分母混入后台标签/即走/读者会话 → first_move 率被系统性低估。
- **页面本身没坏**：w50r9u 在 00:04 能正常点 New Puzzle（渲染完整、无遮罩、无空白）——首屏交互没问题。

**口径修复（11 处加载时触发的 game_start 加可见性门控）**：`document.visibilityState === 'visible'` 才触发；hidden 时挂 visibilitychange 监听转可见补发；直接关掉后台标签 = 不发。开局 = 用户真正看到棋盘：
- src/pages/index.astro（Shikaku 首页，主排名页）`_gsWhenVisible`
- `{binary,hashi,kenken,slitherlink,star-battle}/index.astro` `fireGameStart` 包 `trackGameStartWhenVisible`
- `akari/index.astro` `fireGS` 同款门控（akari/daily 的 game_start 由 start-btn 点击触发，非加载时，不改）
- `public/{nurikabe,kakuro,nonogram}/demo.html` + `public/pictomino/hard.html`（iframe load）

**验证**：`pnpm run build` exit 0（159 页）；dist 逐文件 grep 确认 11 处门控全部进产物。
**待验证（部署后）**：GA4 game_start 总量应下降（后台标签不再计入）、first_move 率应显著回升；2-4 周后重读 US desktop first_move 率对比 14% 基线。
**Murdoku 品类侦察结论另见**：detective sudoku（KD 31.5）+ murder sudoku（KD 40.3）双词入场、叙事单元 pSEO 内容页先行——调研产物在本会话记录，未落 repo。

## 2026-10-13（晚）埋点缺口补齐 + murder-sudoku 内容页先行上线

**埋点缺口补齐（commit `602464d`）**：
- kakuro/nonogram/nurikabe demo 补 `first_move`（`__firstMoveTracked` 防重）；kakuro `board_dead` 别名 `game_over`、nurikabe 血尽挂 `game_over`（跨游戏失败漏斗口径对齐）；nonogram 无死亡机制不挂 game_over
- akari 补 `game_over`（health==0，loseHealth 内）
- **pictomino 关键发现**：iframe 内 game.html 无 GA4 config（gtag 是 no-op），first_move/game_over 实际只进 D1 没进 GA4——game.html 加 `pictomino_first_move`/`pictomino_game_over` postMessage relay（同 daily_solved 既有模式），index/easy/hard/daily-puzzle 四 wrapper 接收转发 GA4

**murder-sudoku 内容页上线（deploy `869c6ba6`）**：`/murder-sudoku/` 打 murder sudoku 头词（8100/月，KD 40.3），Murdoku 商标词只在正文 educational 提及。规则源=cluedoku.app/how-to-play 逐条核对（杀手机制：V 恰与一名嫌疑人同房间）。4×4 猫主题示例盘（Mochi/Tofu/Pixel + Old Whiskers）**经暴力枚举脚本验证唯一解**（唯一布局 M r2c1/T r3c4/P r4c3(rug)，凶手 M；验证脚本 scratch/verify-murder-sudoku-example.py，第一版盘面实测 3 解打回重造）。FAQ×4 + BreadcrumbList + FAQPage schema，三 CTA 全英文，四内容页 Read Next 回链。验收清单全过（TDK 49/53+158、JSON-LD parse、Murdoku 无主词位、sitemap 收录、线上 200 + IndexNow 202）。

### 21:45 子 agent 双双回收（spike 已本地复跑验证，bench 数字逐项一致）

**引擎 spike 结论（scratch/murdoku-spike/，solver+独立暴力计数器交叉验证）**：
- **4×4：生产就绪**——唯一解收敛率 100%（30/30），6.7ms/盘，纯客户端即时生成
- **6×6：可上但必须 Web Worker**——单次调用收敛率 57%（17/30），成功均值 466ms，配重试 1-2s/盘，阻塞主线程会卡 UI
- **8×8：当前证词词汇不可行**——融合全部真证词仅 16.7% 布局可唯一化，不存在「每嫌疑人恰一条」的唯一子集；需扩展方向/相邻类证词或人工布局，MVP 不做

**竞品盘点结论（5 站）**：
- 功能最全=cluedoku（4×4→10×10+10 证词类型+duels/co-op，但流量最弱 1870/月）；内容最厚=sudokumurder（360 页/6 语言，日期归档+独立 solution 页吃 answer 长尾）；mysteryic 锁死 6×6 且明删昨题；murdersudoku 官网仅 1 页；murdoku 纯品牌+书系变现（其 sitemap 有死链 /play/sitemap.xml 404）
- **三个品类真空**：①历史题归档+可检索解答页（mysteryic 删昨题/murdersudoku 无归档/murdoku 周更）→ 每日归档 URL 是持续 SEO 红利；②免账号异步挑战（多人仅 cluedoku 有且要账号+实时在线）→ 分享链接同题比时即差异化；③推理链分享/复盘（五站都只能分享用时）→ 契合 TikTok 传播，完全空白

## 2026-10-14（凌晨）arrows 攻略页 100 关真盘浏览器上线（deploy `604ae02c`，commit `38a334d`）

**数据管线（全部 scratch/，apkenv venv）**：
- L11-L100 关卡身份 = mph 页面内联 SVG 几何 ↔ APK bundle 逐支点集匹配（match_pipeline.py，偏移搜索，86 唯一命中 + 4 包内重复资源去重后全中）。mph 几何与 APK 数据 1:1 一致（关名 07-07 批次），其关卡序号在 L1-10/L50/L200/L500/L900/L11-14 共 19 个采样点全部对上
- **重要发现：mph 的 data-replay-steps 是自动生成、未经验证的假解序**——L12 第一步就撞它自己数据里 19 格带状箭头（cross_check.py，L11-20 全灭于第一步附近）。其盘面几何真、解序不可信。这坐实了攻略页对比表「auto-generated sites: level numbers dressed up as solutions」
- 100 关解序 = solve_tip.py 语义（尖端 path[0]、指向首段反向、走廊从尖端扫到出盘、双头双向贪心）批量求解，100/100 全解无回溯，sol 长度=箭头数逐关校验
- 产物：public/arrows-puzzle/levels.json（301KB，v0.23.1 包 3,983 关中前 100）

**页面（arrows-puzzle-walkthrough）**：
- 删 L1-3 三个手绘 SVG 板 + L4-10 事实表 → 交互式关卡浏览器（客户端 SVG 渲染 levels.json：格点+彩色折线+尾端编号圆点+双头 marker，100 按钮 picker + prev/next + 键盘左右 + #level-N 深链）
- GA4：guide_level_view（切关）+ guide_more_levels_click covered '1-100'；CTA 改「Want Levels 101 and up?」
- FAQ「How many levels」+ JSON-LD 同步更新：v0.23.1 包实测 3,983 关（不再说"无法知道总数"）
- ego-browser 实测：L1/L37/L90/L100 渲染+切关+双头方向文案（"send it left"）+深链全过；vision 读图验色（暖琥珀纪律 ✓）

**遗留**：murdoku/（untracked 实验目录）和 murder-sudoku 等他人改动仍在工作区，勿 git add -A；101 关以后有关注再扩

## 2026-10-14（上午）Murdoku MVP 游戏页上线（deploy `803a535d`，commit `1a5d9f0`）

**按交接单（HANDOFF-MURDOKU-MVP.md，已入 repo）完成第 2 批施工**：
- `src/pages/murdoku/index.astro`：SEOHead + JSON-LD（WebApplication/FAQPage）+ GameHub + AdSlot/SideAd；title 38 字符（+" | GridPaw"=45 压线）；TDK/H1 用通用词 murder sudoku，Murdoku 仅 legal-note educational 提及；水彩 UI 按 v3 原型（已抢救入 `design/murdoku-preview-v3.html`）
- GA4 打点全挂：game_start 可见性门控（visibilityState==='visible'，注释口径 2026-10-13 Clarity 取证）、first_move（__firstMoveTracked 防重）、level_up {level:'4x4'|'6x6'}、hint_click、胜利弹窗 share_copy/share_twitter/share_reddit；track() 带 gpTrack 转发；无死亡机制不挂 game_over
- `public/murdoku/worker.js`：6×6 生成走 Worker（单次 ~470ms+重试 1-2s），4×4 同步；Worker 失败兜底同步生成
- GameHub 加 Murdoku 卡（NEW 徽章）；图标 `game-icons/murdoku.webp` = biscuit 水彩橘猫重裁 128px/2454B（≤3KB）
- `/murder-sudoku/` 两处 CTA + FAQ 改「已上线」并链 /murdoku/

**施工中发现并修复 1 个 P0**：页面 .main 72rem 全宽时棋盘右列（cell 3/7/11/15）被右侧 160×600 广告层盖住，真实鼠标点击全部落在广告上（Playwright elementFromPoint 逐格实测，1280/1440/1920 全复现）。修复：`.game-card` 收窄 52.5rem(840px) 居中，符合 SideAd「内容列 ≤840px」设计假设（kenken 棋盘 496-784 即范式）。契约已写入 AGENTS.md 关键约定。

**验收链全过**：pnpm build（161 页）→ dist grep（门控注释/7 类打点/资产路径全中）→ Playwright **17/17**（bundle 浏览器上下文 API、game_start 门控+补发、受害格/冲突红闪、first_move 恰一次、撤猫、hint 报行列、4×4+6×6 hint 全解自动过案、三分享打点、6×6 worker 计数=1、game_start 不重发）→ deploy → 线上 ?cb= 五路 200（页面/引擎/worker/图标/资产）+ 门控注释与 CTA 链接在线上 HTML → IndexNow 200。

**测试基建坑（复用价值）**：① SEOHead 的 module script 会 `window.gpTrack = trackFunnel` 覆盖测试 stub——stub 必须用 getter+空 setter 的 defineProperty 保住；② Playwright evaluate 内模板串在浏览器侧求值，Node 变量不会插值，须先算好传参；③ 页面 `.sel-target` 高亮不排除受害者同行列/已占用格，测试落点须自算合法格。

## 2026-10-14（中午）game-switcher 头部下拉组件化（deploy `b423f127`，commit `3d03864`，卡 t_5f189695）

**结构债清偿**：30 个页面内联复制的 Games 下拉 → `src/components/GameSwitcher.astro`（games 数组单一维护点）。存量不同步修复：murdoku/kenken/binary/star-battle/hashi/slitherlink 此前只出现在自家页面，现全站 30 页统一 12 游戏。净 -175 行。

**验收（卡上六条全过）**：30 页 dist 断言（12 链接×顺序×active 前缀，子页 /akari/daily/ 自动落栏目）+ computed style 前后逐项一致（13px 字号/10×16 padding/200px 宽/12px 圆角）+ hover 展开截图 vision 前后比对 + Guides switcher（首页，5 链接）与移动端 hamburger 无回归 → 线上 4 页抽查（/、kenken、akari/daily、murdoku）菜单 12 链接全中。

**规范决策**：CSS 取 13 文件主流组值，变量全带 fallback（akari 系页面存在 --ink 等未定义情况）；采纳 murdoku 版 `.game-switcher-menu.open` 全宽生效（触屏笔记本上按钮点击可用，此前部分页面只有 hover 展开）。**遗留**：各页 <style> 里死亡 scoped switcher CSS（约 10 行/页，对新组件不生效）留待下次 neat-freak 清理；首页 Guides switcher 仍内联（5 条目静态，暂无同步需求）。

## 2026-10-14（下午）GSC 收录核查：/murdoku/ 已索引，无需加速

**GSC API 实测**（furriq-daily-brief key，sc-domain:gridpaw.com）：/murdoku/ = `Submitted and indexed`，lastCrawl **2026-10-14T01:43Z**（murdoku 上线部署之后）、verdict PASS；/murder-sudoku/ 同样已 indexed（01:37Z）。sitemap 三条目 0 errors，sitemap-0.xml lastDownloaded 10-12（含新页，81 URLs）。**未做 Request Indexing**（页面已索引，配额 1-2/run 不浪费）。IndexNow 已覆盖 Bing 侧（两次 200）。注：`furriq-daily-brief` SA key 实为 gridpaw GSC 唯一有权限的 key（~/.hermes/scripts/ 无 gridpaw 专属 key 文件）。

## 2026-10-14（下午）neat-freak：死亡 scoped switcher CSS 清理（deploy `cdf190db`，commit `bc8d276`）

GameSwitcher 组件接管后各页 <style> 的 switcher 规则对组件标记不生效（页面 scoped CSS 带 data-astro-cid，组件元素不命中页面 cid）——29 页 345 条死规则全清（含空壳 media query；首页保留 12 条给内联 Guides switcher）。验收：build 过 + 29 页 dist 断言 + computed style 前后逐项一致（13px/10×16/200px）+ 线上 2 页抽查 12 链接。净删约 -350 行。另：10-09 bot 簇取证（Nonogram 55 mistake + Nurikabe 10 集中单日单源）——Nonogram/Nurikabe「低 start」游戏真实参与度=每天 0-2 次操作级，watch item：10-14 /nurikabe/demo US mobile 11 事件同形态待 10-16 cron 拆。

## 2026-10-14 r/WebGames 首帖上线

- 帖子：https://www.reddit.com/r/WebGames/comments/1x5k33f/（u/finn_chen_cat，text post，GridPaw 标题打头合规 P3）
- 文案：humanizer detect 复查通过（修 3 处破折号后 ~15 分，对照蹭词站 75 分 / daily9 12 分）
- Devvit 公开审核已提交：meow-block v0.0.6、cat-akari v0.0.10（1-3 工作日，r/Devvit Chat + 邮件）
- 评论盯守：cron 312d987f526c（每 2h×24，只读+草拟回复+MacBook 横幅通知，发布永远人工）
- 旗舰策略：meow-block 当大本营日更，cat-akari 第二步；游戏内加「Play all six on gridpaw.com」出口待做
- 首条评论闭环（10-14 晚）：u/No-Giraffe-3838 指出 onboarding step 3「press the number」误导（数字在矩形中间时照做必报 Area≠number）——实锤后 step 2/3 文案均改 corner-to-corner drag（commit `1b27237`，deploy 验证新文案×2 旧文案×0，IndexNow 200），回复稿用户已人工贴

## 2026-10-15 OG 图 v2 重做 + 部署

- **病根**：10-02 批 8 张 og 图（nonogram/kakuro/nurikabe/binary/hashi/kenken/slitherlink/star-battle）右侧全是**首访教学卡截图**（Tutorial 1/4、Skip tutorial、规则文字、空盘），缩略图下一团糊字、卖点零传达；og-default/og-akari-daily（9-26 版）是干净设计卡，未动
- **重做**：HTML 模板（Nunito + 品牌色）+ Playwright CLI 截 1200×630，右侧换对应游戏的干净解题中棋盘；**每个盘过对账**——kakuro 空格由行+列约束唯一确定、hashi 桥数=数字、star-battle 14 星严格每行/列/区域 2 颗无相邻（星位公式 (r,2r%7)+(r,(2r+4)%7)+锯齿区域只转移无星格）、nonogram 猫显形+clue 自动算。**生成脚本已入库 `scripts/gen-og-v2.py`**（`--png` 一键出 8 张，重生成与已部署版像素级对账通过；nonogram 猫图案勿改）
- **坑两枚**：① `td` 上 `display:flex` 压垮 table 布局（kenken 4 列被压成竖条），换 CSS grid 布局；② vision 读图会自相矛盾（连续两轮说 star-battle「被裁」），**像素级验证**（找边框色 #4a3f52 的 bbox：x 76-1091/y 117-512，右边距 109px）才定案
- 部署 deployment `ed1e44b3`，IndexNow 200；线上复核 og-nonogram/kakuro/star-battle 字节数=本地新文件（46402/38978/45070），页面 meta 指向不变（零 meta 改动，同 URL 覆盖）
- **图 URL 均无历史抓取记录**（/nonogram/ 页未贴过任何平台）→ 无缓存残留，首次抓取即新图
- **r/nonograms 猫图帖上线（10-15 晚）**：https://www.reddit.com/r/nonograms/comments/1x6ejpv/（u/finn_chen_cat，text post，猫显形钩子角度；URL 带 `?utm_source=reddit&utm_medium=post` 绕 Reddit 页面缓存 + GA4 归因）。背景：用户上午测试时 Reddit 已抓过旧 og（缓存旧教学卡图），部署后用新 query 参数强制重抓。sub 选型依据：r/nonograms 近期 10 帖 4 条 solo dev 自荐全活；r/playmygame 模板帖备选未发；r/puzzles 规矩是发谜题不是发站，不碰
- 评论盯守脚本扩为双帖：`~/.hermes/scripts/webgames-gridpaw-monitor.sh`（cron 312d987f526c 每 2h×48h 复用），新帖 10-15 晚暂 0 评论
- **新帖首批评论（10-15 晚，回复稿用户已人工贴）**：① u/RobertWesner 问 solvability 验证原理（自述当年 15+ 慢 20 跑不动 + GitHub solver 误判唯一解盘）→ 引擎实测基准（20×20 67ms/attempt，lineSolve 传播 + 数解 cap 2）回复立专业人设；② u/mcfroogle 指控「ads immediately redirect」→ 取证：页面仅 Native+160×600 两单元、代码零 redirect 脚本，判断为 native 落地页链跳，回复要设备/地区并承诺零点击跳转就撤 banner。**升级条件：若确认无点击自动跳 = Adsterra creative 实锤，查 Clarity /nonogram/ 秒退会话，必要时下线该页广告位**
- **win 静默 bug 修复（10-15 晚，Reddit u/DarkCyborg74 报告，deployment `36ce1665`，回复稿用户已人工贴）**：nonogram `maybeWin()` 原要求所有格子（含空白格标 ✕）才判胜，玩家只涂图案留白即静默无声——实测玩家解对 Heart 5×5 全 16 格无反馈。修复：`pictureComplete()` 图案格全填即胜，✕ 改可选；Playwright e2e 双向验证（16 格零 ✕ 出弹窗 / 少 1 格不误判）。注：填错本就不可能存在（点空格自动转 ✕）。此条 = 10-17「feedback already shipped」第 2 个实锤（教程手势当天修 + 胜利判定当天修）

## 2026-10-15（下午）murdoku 热度诊断 + 分享归因上线（deployment `7b3eac09`）

- **murdoku 上线 1.5 天热度（GA4，已过滤自测）**：9 pv / 5 users（4 新）/ 7 game_start / 0 first_move / 0 level_up / 0 share——漏斗断在开局后；10-16 复查 48h 滞后再定论
- **自测过滤实证**：GA4 侧干净（murdoku 落地会话全部 France/Israel/US，无一命中本机指纹；internal 过滤器 10-14 起生效）；**D1 gp_event 不过 GA4 过滤器**，读 D1 数字时自测照收
- **分享归因改造**：① murdoku 三分享出口（Copy/X/Reddit）链接带 `utm_source=<twitter|reddit|copy>&utm_campaign=murdoku_share`（真实帖子被点开时 GA4 归因）；② funnel-track 全事件统一 enrich `referrerHost+attribution`（此前只有 visit 带，share_*/game_start metadata 全空），src/lib/funnel-track.ts + 4 份 gp-track.js 五处同步
- **部署验证**：线上 murdoku 页含 murdoku_share UTM ✓、akari-engine/dist 还原 HEAD 版本（工作区 akari-engine 118 行未提交改动与 /de/ 德语试点**未随本次发布**，wrangler 全量 dist 部署前已摘除）✓、IndexNow 200
- **lemmy 帖核对（73260570）**：url+正文 3 链接全是 /from/ 短链，302 UTM 目标实测正确（lemmy_murdoku/devlog/lemmy_daily），零裸链接——lemmy 归因已在跑，无需改帖（Lemmy 剥 UTM，path 短链是唯一通路）
- GA4 历史对账：D1 share_* 总 10 次（09-18 起）全是其他游戏；nonogram/nurikabe demo 10-10 的 6 次 share_card 单 user=疑似自测；murdoku share 从零起步
- **（同日续）akari 房间生成器上线 + lemmy 归因补全（deployment `af251343`）**：生产含 generateRoomPuzzle（Kitchen/Study/Attic 难度带已在线上 curl 验证）；UTM_SAFE 加 lemmy + buildAttribution 记 utmCampaign 值（分帖归因，5 处同步）；IndexNow 200。**实时漏斗（D1 14:20-15:12）**：murdoku 首位真人通关（first_move×3→level_up×3→share_copy 15:05，lemmy 短链归因特征）；Reddit 安卓 App ×3 进 /nonogram/demo（referrerHost=com.reddit.frontpage，源帖搜不到=评论区链接）；bing 真人 1 分钟通关 L1。**漏斗人数（D1 visitors）**：全期 visit 2543 → game_start 1125(44%) → first_move 275(24%) → level_up 220(80% of movers) → share 9；近 7 天 782→402→70→52→3。**关卡进度**：Shikaku 主线 L1 191 人 → L10 62 → L20 23（每关衰减 ~7%）；murdoku 4x4 破案 6 人 11 次、6x6 无人；登录层极小（6 注册/4 存进度/daily streak 1 人）。疑似小 bug：level=0 的 level_up 23 次 18 人（0 关不存在，待查挂点）
- **（同日续）Reddit 源帖定位 + Native Banner 暂停（deployment `4c76e69f`）**：r/nonograms 帖 1x6ejpv（finn_chen_cat，14:43 CST）= 英国流量源，帖内 UTM 链接 16:53 首次抓到 reddit 归因 ✓；评论区 mcfroogle 投诉广告跳转 → AdSlot.astro 全站暂停 Native Banner（SideAd iframe 格式保留），HEAD worktree 重建部署防兄弟会话在途改动夹带；评论区 RobertWesner/mcfroogle 已由用户在兄弟会话回帖（草稿未采用）；意外：10-13 chatgpt.com utm 引流 nonogram
- **（同日续）murdoku 4x4→6x6 难度平滑（deployment `2b7a3a46`，commit `2b32354`）**：断崖真因=6x6 只能手点难度按钮、无递进推力；改动=第 3 次 4x4 破案胜利弹层晋升钩子（localStorage murdoku_wins4/murdoku_promoted 一次性）+ 第 2 案起后台 Worker 预热 6x6（实测点 6x6 48ms 秒开 vs 原 1-2s）+ 生成等待爪印动画分阶段文案。Playwright hint 通道自动破 3 案实测全绿（晋升块出现/6x6 36格5嫌疑人/秒开）。worktree 部署零夹带
- **（同日续）埋点卡验收通过 + 修复上线（deployment `9a14c83f`）**：t_f751b1bc done（commit `6128d13`：pictomino level 全量 1-based + daily 跳过 level_up 防双计 + demo 三页 tutorial 口径）；worktree 部署，live md5=HEAD 核验一致（注意 /pictomino/game.html 会 308 到 /pictomino/game）。五小游戏无埋点缺口结论采纳——「8% 洼地」系 10-09 前空窗+小样本，待用新窗口重估。徽章卡 t_d4234322 已解锁
- **（同日续）徽章体系 v1 验收通过 + 上线（deployment `86a7b2ed`，commit `ee7343b`）**：三组 11 枚派生徽章 + GET /api/badges（无 cookie=`{"badges":[],"signedIn":false}` 契约 ✓）+ 三展示位（murdoku/akari/shikaku winOverlay BadgeUnlock+GPBadges.win() 钩子 / GameHub 卡角 / changelog 徽章墙）；gp_event guest_id 索引 migration 0001 已存在无需迁移。worker 自测 4 场景+11 枚阈值逐枚 curl 全过；主会话复核：build 过、live grep 组件/钩子/API 全在。留言墙 t_4423ad7d 解锁。生产=86a7b2ed（含 murdoku 平滑+level 修复+徽章三合一）
- **（同日续）注册墙降级（deployment `0fc40c3e`，commit `685f9a7`）**：Shikaku L5 阻断式 Sign in 模态框拆除（正卡留存膝盖点），改胜利弹层内被动一行 #saveRow（资产清单一行+下划线链接，只出现一次，sign_in_prompt_shown source=victory_inline）；全站触点对账=Akari 行内面板/changelog 小字行均被动合规，murdoku/pictomino 零触点。⚠️ 事故记录：主会话误把留言墙 worker 未提交的 index.astro 半成品（DetectiveWall import）扫进 commit，reset+重放修正时 --amend 落在 ee7343b（未推送，安全）上——最终 685f9a7=徽章+auth 合一 commit（message 已如实标注），build/部署/线上 grep 全验证。留言墙 worker 改动仍在工作区未提交，勿动
- **（同日续）留言墙 v1 验收通过 + 上线（deployment `28e0386f`，commit `7521aaa`）**：三红线全绿（Turnstile secret 只走 env/site key 服务端下发不进构建、ip_hash=SHA-256(盐:ip) 不存裸 IP、fail-closed：无 secret 503/siteverify 失败 403）；先审后显 pending+admin 403 实测；**主会话补跑 migration 004（gp_comments 远端建表，worker 按惯例不碰 wrangler）**。线上实测：POST 无闸门直投=not_played ✓、GET 返回 8 条真实破案自动行 ✓。⚠️ 待用户：CF Dashboard 建 Turnstile widget（murdoku/shikaku 域名）→ `wrangler pages secret put TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY`（建议顺带 COMMENTS_SALT），配好前评论自动 fail-closed 不影响页面。数据：murdoku 首个 6x6 破案者出现（anon-a3e9853，15:09，早于平滑部署=自发），6x6 零通关改判
- **（同日续）Turnstile 全链路打通（主会话 API 代建，deployment `dbc18394`）**：wrangler OAuth token 有 Turnstile API 权限，POST /accounts/*/challenges/widgets 建 widget「gridpaw.com comments」（managed，domains=gridpaw.com/www/localhost/127.0.0.1，sitekey 0x4AAAAAAFXiQ7fEWR4kKByr），TURNSTILE_SITE_KEY/TURNSTILE_SECRET_KEY/COMMENTS_SALT 三 secrets 直通上传（temp 文件即毁，值零落库）；重部署后 GET /api/comments 返回 siteKey ✓。⚠️ secret key 只在 CF API 响应出现一次，已直入 wrangler secrets，不入库不入对话——丢失只能 widget rotate。留言墙 worker 另提交 `2f876c7`（样式 is:global 修复，ego 实机验收发现）随包上线

## 2026-10-16 Grow by Mediavine 脚本上线（Journey 前置，commit `28424f8`，deployment `3066d650`）

- **背景**：Mediavine Journey 替代 Adsterra 的前置步骤。门槛=30 天 ≥1,000 premium sessions（US/UK/CA/AU，gridpaw 现 334 / furriq 388，均差 3 倍）+ GA4 绑定 + 品牌安全内容；须先装 Grow 跑满 30 天才进评估，所以现在装=开计时器，申请动作等 premium 流量过线。
- **账号**：Grow Publisher Portal，Google OAuth a839500525@gmail.com（账号名陈彦帆），一个账号装两站。site id：gridpaw=884b7744-45e8-4317-a497-3e3e69870b36，furriq=6a0a521a-07a1-41db-bffa-03347bd873a2（portal 里 base64 形式）。
- **注入点**：gridpaw=`src/components/SEOHead.astro`（全站 142 Astro 页，hostname 守卫同 GA4）+ pictomino 12 信息页（有 GA4 就补）；furriq=`src/routes/__root.tsx` head() scripts（appUrl 守卫）。**game.html（play canvas 红线）/404/admin/demo.html 排除**。
- **Adsterra 不摘**：Journey 过审拿脚本上线前它是唯一进账线；过审后再替换。
- **坑**：① 注入发生在 build 之后 dist 不更新——先注入再 build 再 deploy，否则线上缺脚本；② CF Pages 自定义域名边缘缓存在新旧部署间抖动几分钟（带 cb curl 读数时好时坏），以部署 URL（3066d650.gridpaw.pages.dev）读数为准；③ Grow 官方 snippet 有 data-grow-initializer 标记属性，gridpaw 版本是功能等价的内联函数，portal 靠 main.js 里的 site id 检测不靠该属性。

## 2026-10-16（cron）Murdoku 漏斗 48h 复查（GA4 pagePath 数据已进齐；10-16 数据未进）

**结论前置：10-14/10-15 两次 pagePath=0 是查询 bug 非数据缺失（andGroup 里 6 个 eventName EXACT 串成 AND 永假返空，orGroup 修正后数据齐）；真实漏斗 = internal 过滤生效后的干净数据，game_start→first_move 断层（1/11）但样本个位数 + 10-16 未进，维持 reading 不下因果。**

| 事件（pagePath EXACT /murdoku/，internal 过滤后） | 10-14 | 10-15 | 10-16 |
|---|---|---|---|
| game_start | 3（1 user，France Firefox） | 11（8 users，8 国分散） | 数据未进 |
| first_move | 0 | 1（1 user） | 数据未进 |
| level_up | 0 | 1（1 user） | 数据未进 |
| share_* | 0 | 0 | 数据未进 |

- **自测过滤实证（第三次复核）**：10-14 murdoku game_start=3 全来自 France desktop Firefox 1 user（非法老 fresh Chromium 指纹）→ internal 过滤器 10-14 起生效，任务背景里「10-14 自测 ~5-10 game_start」已被滤掉，无需减法。唯一未决：10-15 China desktop Chrome 3 game_start 1 user——疑似代理出口换节点未进 internal 规则（规则现仅家宽 CIDR 14.19.8.76/32），量级 3 影响小；下次 CN 簇扩大先追加出口 CIDR 再读数
- **落地会话**：10-14 = 1 sess engaged=1（France Firefox 真人开局玩）；10-15 = 6 sess（desktop 3 + mobile 3）engaged=0——10-15 全站 engaged 处理滞后（见下），game_start 事件在 = 非空转
- **来源**：10-15 lemmy social 1 sess（lemmy 短链归因通路已验证，真实获客信号）+ direct 1 + (not set) 1 + (data not available) 3
- **红旗复核**：10-13 engaged=12/29、10-14=16/29 已恢复（此前滞后判读正确）；10-15 全站 51 sess engaged=0 + 大量 (data not available) 行 + 10-16 整天无数据 = 处理滞后非 bot 簇（未命中「单日暴量+落地页集中+单页率>90%」三口径）；此前 (not set) ~20 会话定性改判：10-15 (not set) 32 sess 分散 8+ 国多设备 engaged=0 = 归因滞后，非单一 bot 簇，10-17 复看
- **转化读数（reading）**：game_start→first_move 10-15 = 1/11（9%）——个位数样本不下强结论；D1 侧 10-15 已见首位真人全漏斗通关（first_move×3→level_up×3→share_copy，见 10-15 续记），GA4 与 D1 不矛盾，首周小量=常态
- **分享 CTA**：10-12~16 全窗 GA4 share_* = 0（D1 侧 share_copy 已见真人触发）
- 查询坑已沉淀进 skill ga4-data-access（andGroup 同字段多 EXACT 永假返空 + landingPage/pagePath 尾斜杠极性不同 + orderBys 400）

## 2026-10-16（下午）游戏数据真源切 D1，GA4 过滤判不可靠（法老拍板）

**结论前置：GA4 作 gridpaw 游戏数据源不可靠——gtag 请求走 googletagmanager 域，被广告拦截器整段挡掉，Internal Traffic 过滤器只救「已知 IP 的 gtag 流量」，救不回被拦截器丢掉的真人事件。实证：murdoku 7 天 first_move GA4=1 vs D1 同期=27（差 27 倍，lemmy/Reddit 用户大概率挂 uBlock）。D1 gp_event 是同源 fetch 第一方落库，两个失真源（拦截器丢包、Data API 无 trafficType + 24-48h 延迟）都不沾。**

- **拍板**：日报游戏数据全切 D1。落地：`funnel_daily_snapshot.py` gridpaw 分支吃 `gp_event`（stages=visit→game_start→first_move→level_up→daily_solved，source=D1，bot_check 仅 GA4 站保留）；`gridpaw_games_funnel.py` 重写 D1 版（单查询三窗口 SUM CASE，按 pagePath 前缀聚合，wrangler 借 furriq 仓二进制——gridpaw node_modules 没装）；渲染器漏斗标题跟随 source 字段
- **口径注意**：① D1 含自测（自测走真浏览器真 UA，无法按 IP 剔，读数时心里有数）；② pagePath 进 metadata 是 10-15 上线（funnel-track.ts 二补），**此前事件无 pagePath，游戏路径聚合只覆盖 10-15 之后**（首日 7 日列偏小是口径不是 bug，约 10-22 起自动齐）；③ furriq D1（cat_breed_event）缺 result_view/pricing_page_view/signup_success 三段（GA4-only 埋点），混源假漏斗，furriq 暂留 GA4 待补埋点再切；hexa 无事件表同留
- **首日 D1 真数（10-15）**：gridpaw visit 246 / game_start 165 / first_move 56 / level_up 108 / daily_solved 7——全面高于 GA4 口径，符合拦截器丢包预期。murdoku 19 会话 11 动手（58%）10 过案共 25 次，与 GA4「14 进入 1 动手」天壤之别，此前「murdoku 留存崩」的 reading 作废（那是 GA4+自测混合口径）
- **GA4 侧已做的修补不白做**：Internal Traffic 过滤器（mini 出口 108.181.6.175 等）仍挡自测 game_start 混入，GA4 作为参考口径继续并行
- **（同日续）murdoku first_move「打点缺失」排查闭环**：线上 HTML 有代码 ✓、track() 实现 ✓、真实玩家全漏斗 ✓——不是 bug，是 GA4 单源失真 + 自测污染的叠加误读

## 2026-10-16（下午）meowdoku-guide 可玩棋盘上线（deployment `99816d0f`，commit `715634e`）

**方案 B 落地**：star-battle 引擎 K=1（`generate(6,1,'easy',seed)`）+ 自有猫图标嵌进 /meowdoku-guide/（Controls 段后首屏第 2 屏），零新引擎。对位竞品四缝：每盘唯一解徽章（打「随机盘答案对不上」死穴）/ Hint 直接亮绿格报行列 / 违规红闪回退扣心 / 无限关生成器。fan-made + not affiliated with Oakever 注脚，URL 未新增，棋盘 488px 守 840px 内容列契约。

- **开发中修的两个 bug**（Playwright 验收抓的 + 用户实机抓的）：①✕ 陷阱——✕ 状态格放猫违规时永远卡死在 ✕ 无法取消，修为违规即回退为空（闪红+扣心不变，任何格 3 下必能清空）；②棋盘未居中——grid 容器盒子占满宽、固定轨道靠左（右侧 185px 死空间），`justify-content:center` 修；教训已沉淀 skill astro-static-site-pitfalls（量容器≠量内容，验收量首末格对称性）
- **猫图标 C 方案入库**（用户选定，Gemini 扁平猫脸琥珀+奶油白）：`public/meowdoku-guide/cat-icon.png`（256px 透明底）+ master `design/meowdoku-cat-icon-master.png`；`.catp` 与答案演示区 `.cat` 全切自有资产，**官方 cat-sprite.png 全站归零并删除——sprite 版权雷清除**
- **埋点**：game_start(visibility 门控)/first_move/hint_click/level_up/puzzle_reset，5 个事件全部在 FUNNEL_EVENTS 白名单内（当日核对）→ **D1 真源 + GA4/posthog/clarity 参考口径**（§同日 D1 判定），读数时 D1 含自测心里有数
- **验收**：Playwright 双端 + vision 复核全绿零控制台错误（本地 dist + 线上两层）；部署后边缘缓存曾供旧部署 HTML（age 2h、引用已删 CSS hash），传播窗口内自愈，未到手动 Purge
- 明细+开发过程 → `NEWWORD-LEDGER.md` 可玩版节；换肤预览与竞品对比稿在 scratch（未入库）

## 2026-10-16（傍晚）方案 C 一期：/meowdoku/ hub + 10 关卡页 + 星级评价（deploy `9de6af5c`，commit `d5cdb73`）

**用户拍板铺 10 关 + 评分 CTA**：`/meowdoku/` hub（随机盘 + 关卡导航 + FAQ schema）+ `/meowdoku/levels/1..10/` 固定盘页（seed=关卡号，引擎验唯一，答案坐标预计算 `src/data/meowdoku-levels.json` 折叠展示）。可玩模块抽 `MeowdokuPlay.astro` 组件（guide 页同步切组件），`StarRating.astro` 评分组件试点（rate_submit 走 D1 双白名单）。fan-made 注脚全页面保留。验收 Playwright 四端全绿；12 URL IndexNow 200。观察点：rate_submit 量/stars 分布决定是否铺 50-100 关。明细 → `NEWWORD-LEDGER.md` 方案 C 节。

**（同日续）game_start 时序统一标准**：线上 D1 对账抓到 MeowdokuPlay 首盘 game_start 不落 D1（gpTrack 由 SEOHead module 延迟赋值，内联脚本解析期调用未就位）；全站对账定案其余页面全安全（Astro module 脚本/同步 gp-track.js 天然免疫）。统一标准收口：SEOHead 头部 is:inline stub 缓冲 `__gpq` + module 冲洗重放（deploy `478ad1e1`），此后内联脚本解析期发事件全站不丢。方法论+陷阱沉淀 skill game-event-tracking。

**（同日续）导航双写债收口**：实测 GameNav 缺 6 游戏（含 murdoku 漏改），全部补齐——17 个内容页头部自此有全部 13 游戏头部入口/内链；新增构建期门禁 `scripts/check-nav-consistency.mjs`（GameSwitcher⊆GameNav 分叉即红）。部署 `6d5301a3`。明细 → `NEWWORD-LEDGER.md` 导航节。

## 2026-10-16（傍晚）多语言扩张一期：/pt-br/ 巴西葡语 7 页上线（commit `6ee4a5a`）

**决策链**：KDROI 全量分析（`research/2026-10-16-multilingual-kdroi.md`，权威文档）→ 巴西 #1（jogos de logica 月搜 5,400 / KD 10 / KDROI 100）、日本观察（KDROI 61 但 YoY -19% 零成本周查）、西语挂触发器、德法砍掉；形态 = /pt-br/ 子目录（哥飞原话背书，权重传递），首批 7 页（hub + 6 游戏页），外链打英文主站不为子目录单花预算。

- **上线态**：7/7 URL 线上 200（cache-bust 实测）、hreflang 三连线上验证、sitemap 重提交 75 URL/0 错误、IndexNow 显式 7 条 200
- **GSC Request Indexing**：shikaku + akari 已编入（API 验证 lastCrawlTime 当日）、kakuro 已提交待抓、hub 被拒（live test 缓存了部署窗口 404，待重试）、nonogram/nurikabe/pictomino 按配额节奏排 48h 一次性 cron（`bd9765ef7c94`）
- **监控**：每周一 09:00 cron `a8fb3b5fb1a8` 拉 country=BRA query 维度（API 口径，脚本 `~/.hermes/scripts/gridpaw_ptbr_watch.py` 自管隧道+横幅通知）；基线 28d = 105 展示/1 点击；触发器 = 葡语 query 展示 ≥30 → 推进第二批/西语
- **情报**：quietpuzzle.com 勘误为韩国站（非 PT-BR 竞品，月访 5.6K 且 -51%）；新信号：巴西 "takuzu" 87 展示 pos 8.2 = 第二批页面候选（binairo 品类）
- **约定已入 AGENTS.md**：多语言页先例/扁平结构/别硬嵌全页游戏/frontmatter 注释语法坑
- **待办**：TDK 葡语稿人工审校（`<!-- TODO: PT 词表待人工审校 -->` 标记在 7 个文件）；GameNav `{ {` 单字符语法修复在工作区未提交（属导航线账）

## 2026-10-16（晚）Reddit 反馈第二轮闭环：爱心事故修复 + SideAd 方案①（commit `94b9a56`，deployment `3326f2ed`）

**r/nonograms 帖（1x6ejpv）u/LunatrixGames 两条未修反馈当天闭环，用户已人工回帖**：

- **lesson 1 爱心事故**：教程 L1 用的 CAT_PATTERNS[1] Heart（教学视角"对称好解"），页面文案承诺每关一只猫——两文件各写各的无人对账（根因+规程 → skill `game-launch-audit`）。修复：L1=Cat Face，L2=新增 authored 图案 **Cat Loaf 5×5**（ears+body+paws，rows 1/5 天然演示 gap 概念），四关全猫；真实引擎验证四关 unique + pure-line-solvable 全绿
- **SideAd 方案①**（用户在 ③全撤/①拉距离/②换位 中拍板①）：断点 1200→**1350px**（1200-1350 笔记本 gutter 天然放不下"离内容 32px"的侧栏，强塞=贴脸=本次投诉根源）+ 广告与内容缝 16→**32px**；**nonogram/kakuro/nurikabe 三页 860px→840px 回契约**（此前 1200px 视口广告与内容仅 2px 缝）
- **上线验证**：build 167 页 ✓；线上 /nonogram/ 840px ✓、`innerWidth < 1350` ✓、引擎含 Cat Loaf ✓、三页 860px 归零 ✓；IndexNow 200
- **审计债**：kakuro/nurikabe 与 nonogram 同款 860px 违约是被这次排查连带抓出来的——SideAd 契约此前没有跑过全站扫描，后续新增页面由 skill `game-launch-audit` 清单第 4 条把关
- **（晚续）信号**：r/nonograms 帖 933 views（用户面板口径，冷启动帖首个破千级窗口）；r/WebGames 帖 No-Giraffe-3838 回帖确认 tutorial 手势修复有效，线程正向收尾（回复带 Akari daily CTA）；r/playmygame Akari 帖收到 Reddit "a better community" 算法建议→定性噪音勿转帖（转帖伤号，决策记录见对话 10-16）

## 2026-10-17 r/LogicPuzzles 发帖准备 + OG 图彻查（commit `94b9a56`~`fbeaca6`）

- **发帖计划**：~~r/LogicPuzzles~~ **被拦改道 r/WebGames**（正文稿已拟；r/LogicPuzzles Rule 2「No self-promotion unless permitted by Mods」被 Reddit AI 预警拦截——选 sub 漏核自推规则原文，教训入 skill reddit-webgames-coldstart）；Murdoku 角度改发 r/WebGames（首帖隔 4 天+新游戏角度，合规）
- **发帖落地（10-17）**：r/WebGames murdoku 帖上线 `https://www.reddit.com/r/WebGames/comments/1x85o6j/`；监控 cron 已扩到三帖（帖3=murdoku，新评论触发）；本地改动=webgames-gridpaw-monitor.sh（非仓库文件，不入库）
- **murdoku 帖首个评论闭环（10-18，commit `3e32310`）**：u/Easy-Race6938 问「at a wall」是棋盘外沿还是房间边（正是预留软肋+措辞债）；查证=引擎语义已对（murdoku-engine.ts L201-208，pfjarschel Lemmy 反馈后修的：wall 只算棋盘外沿，房间隔线是 partition）但页面从未定义；修=how-to 加 house rule + FAQ 新增条目，上线验证过；回复稿交用户贴
- **新手引导补齐（10-18，commit `cd1e05f`）**：用户拍板先A后B同时开干+列必要项沉淀；方案A=棋盘区下 statement 图例（10 类型白话定义，wall/corner 高亮）；方案B=3 步教学面板（首访自动开、放置推进、Skip 可跳、LS 防重、tut_done/tut_skip 打点）；Playwright 实测全绿（首访开/放置推进/Skip 隐藏+LS）；技能沉淀=game-launch-audit 第 7 条「新手引导=必要项」（how-to 在 fold 下不算 onboarding；新概念必须在游戏内有白话定义）
- **Easy-Race6938 线收尾（10-18）**：用户已贴回复（先答 wall=外沿 + 认账页面没讲 + 修复合集）；台账入 reddit-feedback-audit（✅ 闭环 <1h，先例勘误：引擎早已修对，缺口是页面定义缺失）；若对方回访确认有效即为第三例「反馈→当天修→确认」闭环
- **OG 图根因**：/murdoku/ 漏配专属图（10-15 批量生成时未上线），兜底 og-default=首页 Shikaku 卡；补 `og-murdoku.png`（右侧=真页面棋盘截图，`scripts/gen-og-murdoku.py`，PIL 边框验收）+ 发帖须换 query 参数强刷 Reddit 抓取
- **同款彻查（34 页修正，commit `fbeaca6`）**：SEOHead 兜底 og-default 波及全部 akari 系功能页（含 Reddit 常用直链 /akari/daily/）→ 按规则"页面讲哪个游戏 OG 用哪个游戏的图"修 34 页；线上 4 页抽验过；剩余 33 页为可接受兜底（shikaku 系匹配/纯内容品牌卡/meowdoku 无专属图记 P2）
- **误报排除**：canonical 尾斜杠由 SEOHead L31 自动补齐，源码无斜杠非问题
- **规程**：已入 skill `game-launch-audit` 清单第 6 条（OG 图对账+发帖前预览缩略图核对）

## 2026-10-17（傍晚）Murdoku corner 线索 bug 修复（pfjarschel Lemmy 反馈驱动）

**根因**：murdoku-engine.ts 的 wallDir 统计把**房间内部分界线**当墙算（`roomOf[ni] !== roomOf[i]` 计入），`in_corner` = wallDir≥2 → 棋盘中央被两三个房间夹住的普通格被判「角落」；4×4 上 13/16 格被标记，玩家按棋盘可见物推理必然矛盾。同款逻辑三处：mask 计算（L150 区）+ cellFeatures + cellSignature（死代码，已删）。

- **修复（方案 A：墙=棋盘外边界）**：删 seam 计入，wall/corner 只看外边界；原型实测 A 优于 B（边界+木箱）：4×4 60/60、6×6 成功率 11/20→18/20、矛盾 1/60→0、corner 线索可用度 3→22/60
- **验收链（skill `game-pre-launch-testing` 首用）**：audit 脚本（独立 checker，不 import 引擎 mask）对修复后引擎 PASS（4×4 60/60 0 矛盾 + 6×6 18/20 0 矛盾）；pnpm build 167 页全绿；浏览器冒烟 4×4 生成 0 矛盾 + checkSolution True + corner 格 13→3
- **Lemmy 现状**：73260570 三评论——pfjarschel 3 条反馈（corner 实锤已修；房间不连通 + 地砖区分度进 fix list 未修）、我方回复已发（29457825）、pfjarschel 10-17 鼓励回帖（no rush，无新反馈）
- **changelog**：+2026-10-17 Fix 条目（corner/wall clues fixed），dateModified + updated-line 同步
- **待办**：~~房间连通性 + 地砖区分度~~ 已闭环（见 2026-10-17 夜条目）；修后 Lemmy 回帖报「fixed」+ 监控 cron 三帖

## 2026-10-17（夜）Murdoku 第二轮：房间连通性 + 地砖区分度（pfjarschel fix list 闭环）

**实测根因**：① genLayout L104 长不动的房间跳到任意空闲格 → 4×4 **90%**（54/60）、6×6 **100%**（16/16）谜题带不连通房间；② 24 房间名→8 纹理（同组共用）+ tint 仅 6 种按 i%6 循环 → 6×6（7-11 房间）必然有相邻房间 tex+tint 全同，玩家无法视觉区分。

- **修复 ①**：growable-only 生长（房间只吞相邻空闲格，围死的停止生长）+ 小于 minArea 的并入最小相邻房间 + id 重排（cellsInRoom 按 id 索引，空洞会崩）。原型三次迭代：5/20 → 7/20 → **13/20**（roomArea 3.4/3.0 扫频无增益，按 3 次纪律停手接受 65% vs orig 80%——worker 重试 40 种子，玩家侧全失败概率 ~0.35⁴⁰≈0，期望加载 ~1s）
- **修复 ②**（页面 texIdx）：每房间唯一 (纹理, tint) 组合（8×6=48 池，mulberry32(puzzle.seed) 确定性洗牌，重渲染稳定）
- **验收**：audit PASS（4×4 60/60 + 6×6 13/20，矛盾 0 + 不连通 0，checker 新增独立 flood-fill 连通性检查）；build 167 页；浏览器实测 4×4 5 房间/6×6 9 房间 distinctLooks=房间数 全唯一，6×6 worker 6s 内出题
- **audit 模板升级**：game-pre-launch-testing scripts/engine-audit.cjs 加连通性检查（第二个独立 checker 项）

## 重投 CrazyGames（2026-10-17）
- 旧被拒条目已删除（用户批准），名字「GridPaw Akari」已释放
- 新提交流程已走完 Upload→QA→Details 三步：名称/引擎/移动端✓、QA 自评 7 项✓、Category=Puzzle、Tags=Animal/Cat/Brain/Classic/Logic、Description+Controls 已填
- 封面 3 张（1920x1080/800x1200/800x800，游戏同款视觉新做）+ 预览视频 2 条（29s 教程实录 mp4）已就绪，CG 上传组件拒收一切合成输入（DataTransfer/CDP/合成drop 全试），等用户手动拖拽后 Save→Submit
- 文件：~/.hermes/cache/scratch/cg-covers/cover-*.png + cg-videos/akari-{landscape,portrait}.mp4
- 2026-10-17 晚：用户反馈「CG label 遮挡左上角」——实锤是 CG 往**封面图**左上角叠自己的标（裁剪弹窗官方原文：Avoid placing the game title or important elements in the top-left area of the game cover），非游戏画面；游戏 60px 安全区已做进 v2 包（cg-akari-bigupdate-v2.zip，sha c3c8589752cf3e0b，防御性保留）但**决定不重传 build**——Upload new version 会回到上传步，可能清掉已传的媒体；封面构图居中/landscape 品牌位在 y≈110 不在角标区，天然安全
- 视频规格（CG docs）：15-20s（长了自动剪）、≤50MB、横版 1920x1080 必传、**竖版 1080x1620（2:3 1080p）必传**——首版竖版 800x1200 分辨率不达标致上传报错，已重录 akari-portrait-1080.mp4（1080x1620 h264 21.7s）
- 媒体上传进度：三张封面全✅ + 两条视频全✅（横版被 CG 自动剪至 19.4s、竖版 14.4s，规格全达标）
- **提交状态：✅ 2026-10-18 已提交，AWAITING REVIEW**（Basic Launch，Submission date 18.10.2026，Version status: Submitted）
- **Billing 已完成**（Tipalti 四步全绿：Address/Payment Method/Tax Forms/Done）；CG 已发「payment details updated」确认信到 **a839500525@gmail.com**（Tipalti payee 邮箱，收款通知都在这）——标准回执，无需操作——payee 中国 + USD wire + 招行广州琶洲支行（SWIFT CMBCCNBS，地址用总行官方英文地址，电汇按 SWIFT+卡号路由）。**教训：Tipalti 校验 SWIFT 必须属于 payee 国家**（Wise 美国 SWIFT 报「not valid for china」被拒）；Wise USD 虽能收 SWIFT（$6.11/笔）但过不了 Tipalti 的国家校验
- **决定：v2 包（60px 安全区）不重传**——重传会清已传媒体；v1 build（无安全区）已进审核，v2 留下次更新
- **官方页已部署（2026-10-18）**：测试链全绿（build 177 页 + 走查 + 点格亮猫实测）→ `pnpm run deploy` 成功（454 files，IndexNow HTTP 200）→ 线上 curl 验证 /akari/ 新版生效（TUTORIAL 标记在、200）
- 待办：CG 审核结果（模板信无个性化反馈，几天到一两周）；v2 包（60px 安全区）留下次更新
