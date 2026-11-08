# BP3 德语 hub + 关卡截图错位审计（2026-11-08）

## 1. 德语 hub `/de/brain-puzzle-3-answers/`

结构复刻英文 hub（同一套 CSS、卡片解剖：缩略图 + Level N + 场景名/目标句 + 步数 + 有无视频），
另加客户端搜索（关卡号或场景名）+ 4 档范围筛选（1–30 / 31–60 / 61–100 / 101–137）。

- 生成器：`scripts/bp3/gen_de_hub.py`（数据 = `data/de_out/*.json`；1–30 无译文，从既有手写德语页 parse 目标句与步数）
- 137 卡；1100px 三列（沿用英文 hub 的 `auto-fill minmax(180px,1fr)`）；卡片高度统一 232px
- 筛选实测：「zombie」→2 关、「54」→1、chip 101–137→37、清空→137
- 移动端 390px 单列，`scrollWidth=390` 无横向溢出
- title 53 字符、desc 146、canonical 自指、hreflang de/en/x-default、4 条 FAQ 与 schema 逐条对账、sitemap 自动收录
- 内链：107 个德语关卡页底部原链英文 hub → 改指德语 hub；`/de/` 首页 h2 + CTA 两处指向 hub

英文 hub 同步修：11 张卡因图片比例不同高出 31px（`aspect-ratio` + `.name{min-height:2.62em}`），现在两边卡片高度一致。

## 2. 截图错位（本次审计核心）

**现象**：英文/德语 hub 里 4 张卡的图片文件名序号 ≠ 关卡号（L19←l26_hero、L30←l27_hero、L31←l28_hero、L137←l25_step1）。

**取证方法**（不靠猜）：对每个可疑关卡，用页面自己引用的 YouTube 视频按页面标注时间点截帧（`yt-dlp --download-sections` + `ffmpeg`），
再把「视频帧 / hub 图 / 页面图」三列拼图交给 vision 逐行判读是否同一场景。

**结论**：
| 文件组 | 真实归属 | 证据 |
|---|---|---|
| l26_hero + l26_step1–4 | L19 | 帧=卧室「Find everyone hiding in the house」，与 L26 的阶梯关不符 |
| l27_hero + l27_step1–4 | L30 | 帧=揭面「Take off all the masks…」，与 L27 越狱关不符 |
| l28_hero + l28_step1–4 | L31 | 帧=地铁「Help her figure out what's strange」（step=血腥地铁，hero=同关正常时刻） |
| l25_step1–3 + l25_result | L137 | 帧=过山车，L25 自身是降落伞关（l25_hero 正确，未动） |

**处置**：按真实归属 `git mv` 重命名（保留 git 历史），L26/27/28 各自从本关视频补新图
（t=9 / t=4 / t=15，vision 核过横幅文字与目标一致、无黑边无字幕条），L137 补 `l137_hero.jpg`。
英文 hub / 德语 hub / 6 个页面共 8 处引用同步改写。

**验收**：137 张 hub 缩略图「文件名序号 == 关卡号」100%；跨关卡文件复用 0 处（原 4 处）；
7 张修复图 vision 逐张确认场景互不重复、横幅文字与关卡目标一致。

## 3. 上线

- commit `15ff13f0`
- 部署 `4000fc0a`（Production / main / 15ff13f）：475 页
- live 核验：hub 137 卡 + 筛选脚本在、7 张修复图 200 且字节数与本地一致、DE 关卡页与 `/de/` 均链到 hub
- IndexNow 17 URL（hub×2 + `/de/` + 7 关卡 × EN/DE）HTTP 200
