# 关卡页补页流水线 · 执行契约（cron 每轮照此做，不许自创流程）

> 立项 2026-11-24。法老指令：**BP3 不能再丢；R&E 继续铺。**
> 队列真源：`research/2026-11-24-bp3-backfill-queue.json`（BP3）、`research/2026-11-24-rxe-backfill-queue.json`（R&E）

## 0. 硬边界（违反即返工，且这一轮算失败）

0. **写页前先过 301 闸**：`grep -n "level-<N>/" public/_redirects`，命中就把该关标 `blocked(301 冲突)` 并停手——CF 会把新页直接跳走，白写。当前有 301 的号：40/56/63/67/137（EN+DE 各一条）

1. **每轮只做 2 个 BP3 关 + 1 个 R&E 关**（多做的算破坏，不得批量灌页）
2. **不 push main、不部署、不改已上线页的 URL**。只 commit 到 `ops/level-backfill` 分支
3. **不得编造步骤**：每一步必须能追到实拍画面/帧号；做不到就跳过该关并在报告里写「素材缺」
4. **不得整段照抄 trickystorywalkthrough.com 的文案**（核查结论：存量页是改写的，不是原文搬运）。但 `scripts/bp3/data/tt_steps/*.json` 的**编号已过期**——2026-11-24 重排后，tt 的 L136="Let Her Out" 对应的游戏现关号不是 136（游戏 136=Coaster Light）。**因此 tt 数据只能按「关名」匹配，不能按关号匹配，且不许用来做步骤核对**；核对只认 pgm 场景文本（≤169）与录像实拍
5. **不写占位文案**（"待补充/正在生成"这类），宁可不做这一关
6. 不动别人的 WIP：`git status` 里有非本流水线文件就只 `git add` 自己产出的路径，禁 `git add -A`

## 1. 取活

```bash
cd ~/workspace/gridpaw
python3 - <<'EOF'
import json
q=json.load(open('research/2026-11-24-bp3-backfill-queue.json'))
todo=[r for r in q['backlog'] if r.get('status','todo')=='todo' and not r['ghost_301']]
print('\n'.join(f"{r['level']}\t{r['game_name']}\ttt={r['tt_data']}" for r in todo[:2]))
EOF
```

R&E 同理读 `2026-11-24-rxe-backfill-queue.json` 取前 1 条。

## 2. 拿素材（按 research/2026-11-07-rxe-level-recipe.md 的 §1 原样执行）

- 代理端口以 `~/.config/mihomo/PROXY_STATUS.md` 现值为准（7880 已换，2026-11-18 起是 33210）
- `yt-dlp -f 137`（1080p）→ 失败退 `-f 136`；`--continue` 断点续传，**禁 `--no-part`**
- **YouTube 必须走 7882（mihomo）**：33210（Tiger）已被判 bot（`Sign in to confirm you're not a bot`），换 7882 立刻成功（2026-11-24 实测两次复现）。端口现值以 `~/.config/mihomo/PROXY_STATUS.md` 为准，但 YouTube 优先 7882
- 完整性**只能靠解码验证**：`ffmpeg -i f -f null -` 取实际解码时长，`>= 元数据*0.97` 才算完整
- 抽帧 `ffmpeg -vf fps=1 -q:v 3 lN/f_%04d.jpg`
- **读帧必须用 `vision_analyze`**（纯文本模型看不了拖拽物，2026-11-24 实测：grok-4-fast 把"红边时钟"当拖拽物、把字幕判成无文字）。同一道具要两次独立读数一致才算确认
- 字幕 OCR（tesseract）只作时间轴辅助，不能替代看图确认交互
- **下载串行**，并发 yt-dlp 会集体超时（2026-11-18 实测）

## 3. 写页

- BP3 模板：抄 `src/pages/brain-puzzle-3-level-136/index.astro` 的结构（frontmatter + FAQ + 分步 + 内链 + hub 卡）
- R&E 模板：抄 `src/pages/rooms-and-exits/chapter-3-level-13/index.astro`
- 图片放 `public/brain-puzzle-3/l{N}_*.jpg` 或 `public/rooms-and-exits/lN-*.jpg`，缩到 1200 宽
- 每张关键图必须有帧号依据（写在页面注释里，供人复核）

## 4. 质量闸（缺一不可）

```bash
pnpm run build      # 必须 0 error
pnpm run verify     # oxlint + 约定闸门 + 改动文件全规则，必须全绿
```

- 顺手核：`node scripts/check-play-surfaces.mjs`（新页若属 play surface 要进 `src/lib/ad-policy.ts`）
- `src/data/*-levels.json` 与 hub 卡计数三方一致（页数 / LevelSelector / hub）

## 5. 收尾

```bash
git add <只加自己产出的文件>
git commit -m "feat(<game>): 补关 L<N> —— <关名>（流水线）"
```

- 更新队列里的 `status`：`done` / `blocked(素材缺)` / `blocked(数据缺)`
- 飞书播报（一行结论 + 已完成/剩余）：
  ```bash
  printf '%s\n' "关卡补页：本轮 L137/L138 + R&E ch4-3 完成，剩余 BP3 53 / R&E 43" | /Users/frank/.local/bin/agent-autoloop tell "level-backfill-$(date +%Y%m%d)"
  ```

## 6. 已知缺口（2026-11-24 实测，别重复踩）

- 缺失 BP3 关共 **55 个**（137-157、159-192），另有 40/56/63/67 已判定空号并 301，别再做
- 这 55 关**一张自有截图都没有**（`public/brain-puzzle-3/l*_*.jpg` 只到 136）→ 素材必须走 yt-dlp
- `scripts/bp3/pgm_all.html` 只到 169 号；170 以上没有 pgm 场景文本，只能靠录像+人工核
- tt_steps 数据到 182；183-192 连交叉核对都没有
