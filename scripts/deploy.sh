#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# gridpaw 生产部署闸门（多会话并发用）
#
# 解决三个事故类型：
#   1. 没 merge          → 整包回滚，别人刚上线的页面消失
#   2. 没 build          → 上传旧 dist，改动根本没生效
#   3. 没 --branch main  → 白干，只在预览地址能看
#
# 用法（在任意 worktree 里跑，脚本会自己 cd 到仓库根）：
#   bash scripts/deploy.sh              # 正常部署
#   bash scripts/deploy.sh --allow-dirty # 明确知道自己在干什么才用
#
# 退出码：0 成功 / 2 前置检查没过（没部署） / 3 另一个部署持锁中 / 4 部署后线上自检失败
# ─────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

ALLOW_DIRTY=0
[ "${1:-}" = "--allow-dirty" ] && ALLOW_DIRTY=1

LOCK="${TMPDIR:-/tmp}/gridpaw-deploy.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "✗ 另一个部署正持锁（$LOCK）。" >&2
  echo "  等它跑完；确认是残留锁再 rm -rf \"$LOCK\"。" >&2
  exit 3
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

say() { printf '%s\n' "$*"; }
die() { printf '✗ %s\n' "$*" >&2; exit 2; }

say "── 1/5 前置检查 ──"

# ① 已跟踪文件不能有未提交改动（未跟踪文件不算：IndexNow key、loop-answers 都在此列）
DIRTY=$(git status --porcelain --untracked-files=no)
if [ -n "$DIRTY" ] && [ "$ALLOW_DIRTY" -eq 0 ]; then
  printf '%s\n' "$DIRTY" >&2
  die "工作区有未提交的已跟踪改动。先 commit 或 stash（确需带脏上线：--allow-dirty）"
fi

# ② 不能落后 origin/main（落后 = 你的快照缺别人的东西）
git fetch origin main --quiet
BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
[ "$BEHIND" -gt 0 ] && die "落后 origin/main $BEHIND 个 commit —— 先 git merge origin/main，否则这次部署会整包回滚别人的改动"
[ "$AHEAD" -gt 0 ] && say "⚠ 本分支比 origin/main 多 $AHEAD 个 commit：内容会这次上线，记得随后 push 到 main"

# ③ 其它 worktree 若有本分支没有的 commit → 部署它们就会消失（今天的事故就是这条）
MISSING=""
while read -r line; do
  case "$line" in
    "worktree "*) WT="${line#worktree }" ;;
    "branch "*)   BR="${line#branch refs/heads/}"
                  N=$(git rev-list --count HEAD.."$BR" 2>/dev/null || echo 0)
                  [ "$N" -gt 0 ] && MISSING="${MISSING}  ${BR}（${WT}）缺 ${N} 个 commit\n" ;;
  esac
done < <(git worktree list --porcelain)
if [ -n "$MISSING" ]; then
  printf '%b' "$MISSING" >&2
  die "有 worktree 的 commit 不在当前 HEAD 里。先 merge 它们（git merge <branch>），否则部署会把它们抹掉"
fi

say "✓ 无脏改动 / 未落后 / 无游离 worktree"

say "── 2/5 构建（deploy 脚本不含 build，必须单独跑）──"
pnpm run build > /tmp/gridpaw-build.log 2>&1 || { tail -25 /tmp/gridpaw-build.log >&2; die "build 失败（完整日志 /tmp/gridpaw-build.log）"; }
PAGES=$(grep -oE "[0-9]+ page\(s\) built" /tmp/gridpaw-build.log | tail -1)
say "✓ ${PAGES:-build ok}"

EXPECTED=$(grep -oE "CACHE_VERSION *= *'[^']*'" dist/sw.js | head -1 | sed "s/.*'\(.*\)'/\1/")
[ -n "$EXPECTED" ] || die "dist/sw.js 里找不到 CACHE_VERSION，构建产物不完整"
say "✓ 构建指纹 ${EXPECTED}"

say "── 3/5 部署（--branch main = 打进生产柜）──"
npx -y wrangler pages deploy dist --project-name gridpaw --branch main --commit-dirty=true 2>&1 | tee /tmp/gridpaw-deploy.log | grep -E "Uploaded|Deployment complete|Deployment alias" || true
grep -q "Deployment complete" /tmp/gridpaw-deploy.log || die "部署回执里没有 Deployment complete（看 /tmp/gridpaw-deploy.log）"
if grep -qE "Deployment alias URL: https://[a-z0-9-]+\.gridpaw\.pages\.dev" /tmp/gridpaw-deploy.log && \
   ! grep -qE "Deployment alias URL: https://(main|gridpaw)\.gridpaw\.pages\.dev" /tmp/gridpaw-deploy.log; then
  say "⚠ 回执带了 branch 别名（预览特征），但已显式 --branch main，按下一步线上自检为准"
  say "  $(grep 'Deployment alias URL' /tmp/gridpaw-deploy.log)"
fi

say "── 4/5 IndexNow ──"
node scripts/indexnow-ping.mjs 2>&1 | tail -2 || say "⚠ IndexNow 失败（不阻塞上线）"

say "── 5/5 线上自检（证明生产跑的是这份构建）──"
CB="$RANDOM$RANDOM"
FAIL=0
sleep 5
for i in 1 2 3; do
  LIVE=$(curl -s --max-time 20 "https://gridpaw.com/sw.js?cb=$CB" | grep -oE "CACHE_VERSION *= *'[^']*'" | head -1 | sed "s/.*'\(.*\)'/\1/")
  [ "$LIVE" = "$EXPECTED" ] && break
  sleep 10
done
if [ "$LIVE" = "$EXPECTED" ]; then
  say "✓ 生产 sw.js 指纹 = ${LIVE}（与本地一致）"
else
  say "✗ 生产指纹 ${LIVE:-<空>} ≠ 本地 ${EXPECTED}（可能是边缘传播延迟，重跑 curl 确认）"
  FAIL=1
fi
for u in / /kenken/solver/ /nonogram/solver/ /unlock-all/; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://gridpaw.com${u}?cb=$CB")
  printf '  %-22s %s\n' "$u" "$CODE"
  [ "$CODE" = "200" ] || FAIL=1
done
[ "$FAIL" -eq 0 ] || exit 4

say ""
say "✅ 上线完成：${EXPECTED}"
[ "$AHEAD" -gt 0 ] && say "⚠ 别忘了 git push origin HEAD:main（否则下次部署会把它回滚掉）"
exit 0
