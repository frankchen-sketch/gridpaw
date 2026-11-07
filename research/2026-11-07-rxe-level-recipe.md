# Rooms & Exits 关卡页 full 化 · 执行配方（子 agent 共用）

> 唯一目的：把 `src/pages/rooms-and-exits/chapter-1-level-N/index.astro` 从 4 行骨架页
> 升级为一条完整的、证据可追溯的攻略页，并产出该关的实拍图。
> 本文件是硬约束，不是建议。照做，不要自创流程。

## 0. 边界（违反即返工）

- **只改这两个位置**：你自己的 `chapter-1-level-N/index.astro` + `public/rooms-and-exits/lN-*.jpg`
- **绝对不碰**：`src/data/rooms-and-exits-levels.json`（主 agent 统一收口）、`LevelSelector.astro`、`RoomGuideLayout.astro`、`GameNav.astro`、其他关卡页
- **不跑 `pnpm run build`**（7 个 agent 抢 dist），**不 commit、不 git add、不部署**
- 不要在页面里写"文件正在生成/待补充"之类占位文案

## 1. 拿素材（yt-dlp，1080p）

```bash
cd ~/.hermes/cache/scratch/rooms-exits
export HTTPS_PROXY=http://127.0.0.1:7880 HTTP_PROXY=http://127.0.0.1:7880 PATH="/opt/homebrew/bin:$PATH"
/opt/homebrew/bin/yt-dlp --no-warnings -f 137 -o "LN_%(id)s_1080.%(ext)s" "https://www.youtube.com/watch?v=<ID>"
```

- **不要**加 `--plugin-dirs`（旧的 POT 插件目录已被清理，加了会直接报错退出）
- 137 拿不到就退 `-f 136`（720p 够用，出图本来就缩到 1200×594）
- 失败先重试 3 次（代理偶发 SSL 抖动），仍失败再用 `ytsearch8:"Rooms and Exits Chapter 1 Level N walkthrough"` 换一条录像，并在交付里写明换了

抽帧：

```bash
mkdir -p lN && rm -f lN/*.jpg
ffmpeg -v error -i LN_<id>_1080.mp4 -vf fps=1 -q:v 3 lN/f_%04d.jpg -y
```

**帧名约定：`f_{t+1:04d}.jpg` 就是第 t 秒**（1fps 从 0 开始）。

## 2. 读画面（三级缩放，别一步到位）

1. **扫读**：按 6 秒步长拼 5 列网格（440×218/格，标注秒数），一张图覆盖 ~2 分钟。先搞清楚有几间房、几个谜题、结尾在哪。
2. **精读**：锁定谜题出现的时间窗，0.25 秒步长裁切该区域（裁切坐标自己叠图找），放大 2 倍。
3. **复核**：任何要写进页面的数字/图案，**用原分辨率再裁一次单独确认**。

拼图脚本用这个 python（带 PIL 的 venv）：

```
/Users/frank/.hermes/installs/b1f343b87a9d7f91/environments/48dcc7ba91db4363b8f8556ad686fdf6/venv/bin/python3
```

## 3. 数字纪律（最重要）

- 一个码/数字，**两次独立读数一致**才允许写进页面
- 读数互相矛盾 → 写"未确认"，并在页面上用警示框说明"我们的录像在这个位置读不清"，同时告诉玩家线索在哪
- **绝不允许**：猜、编、用"大概是"、从别的关卡攻略抄
- 谜题机制没看明白 → 只描述"点什么、去哪、拿到什么"，不描述机制原理

反面教材（本场地雷）：某关四位码读数出现过 2510/2518/2519/1234 四种，最后是真人玩家亲测才定案。
**我们宁可少写一个数字，也不能让玩家照着错的码输一遍。**

## 4. 出图

- 取 `crop(0, 0, 1920, 950)` → 缩放到 **1200×594**，quality 88
- 每页 **≥8 张**，命名 `lN-<语义>.jpg`，例：`l5-hero-yacht.jpg`、`l5-safe-code.jpg`
- 必有：房间全景（hero）、每个主要谜题、结尾完成画面
- 检查：无黑边、无 Subscribe 水印条、无裁字、无过曝

```python
from PIL import Image
im = Image.open('lN/f_0011.jpg').convert('RGB')
im.crop((0,0,1920,950)).resize((1200,594), Image.LANCZOS).save('out/l5-hero-yacht.jpg', quality=88)
```

## 5. 写页面

**以 `src/pages/rooms-and-exits/chapter-1-level-4/index.astro` 为骨架**（CSS / 结构 / JSON-LD 全部照抄，只换内容），必含：

| 元素 | 要求 |
|---|---|
| title | `Rooms & Exits Chapter 1 Level N Walkthrough: <关名>` |
| description | 一句话，含本关最关键 1-2 个数字 |
| 免责声明 | `Unofficial fan-made guide. Not affiliated with Webelinx Games...` |
| verify-note | 说明这页是从录像逐帧重建的 |
| `<LevelSelector chapter={1} current={N} variant="jump" />` | 标题下 |
| Quick answer 绿框 | 一句话通关链 + 3-5 条要点 |
| YouTube iframe | `https://www.youtube-nocookie.com/embed/<ID>` |
| hero 图 | 房间全景 |
| 步骤卡 | **≥8 张**，每张 `Step k · M:SS` + 正文 + 图（可选）+ `Watch:` 时间戳链接 |
| 时间戳链接 | `https://www.youtube.com/watch?v=<ID>&t=<秒>s` |
| 关卡网格 | `<LevelSelector chapter={1} current={N} compact={true} />` |
| FAQ | **≥4 条** + FAQPage JSON-LD（答案文本必须是页面可见文字） |
| CTA | 上一关 / 下一关 / 回到 hub |

正文 **≥1,400 词**（英文）。写作口径：

- 写给"卡住了正在搜答案的人"，第一屏就给他要的答案
- 讲清"为什么卡"——这比讲步骤有价值（例：钥匙是诱饵、第四位是陷阱、颜色不是顺序）
- 不写剧情复述，不写"这款游戏很好玩"

## 6. 自检（交付前必跑）

```bash
# 词数 / 图片数 / FAQ 条数 / JSON-LD 合法性
python3 - <<'EOF'
import re, json, html
p='src/pages/rooms-and-exits/chapter-1-level-N/index.astro'
s=open(p,encoding='utf-8').read()
print('imgs', s.count('<img'))
print('steps', s.count('step-num'))
print('ts', s.count('youtube.com/watch'))
print('words~', len(re.findall(r'\b[A-Za-z][A-Za-z\'\-]+\b', re.sub(r'<[^>]+>',' ',s))))
for b in re.findall(r'\{?"@context".*?\}\}?;', s, re.S):
    pass
EOF
```

JSON-LD 必须能被 `json.loads` 解析（自己拼一个 python 校验）。

## 7. 交付格式（回复里给，不要写进页面）

1. 产出文件绝对路径清单
2. 正文词数 / 步骤卡数 / 图片数 / FAQ 条数
3. **每个写进页面的数字 → 证据时间戳 + 读数置信度**
4. 你自认不确定、因此**没写进页面**的点（列出来，主 agent 决定要不要补一版录像）
