#!/usr/bin/env bash
# 会话开工 / 收工预检（只读，不改任何东西）
#   用法：bash scripts/session-preflight.sh [--no-fetch]
# 目的：把「工作区残留」拆成可判定的三类，并提前暴露会让部署整包回滚的状态：
#   ① 我的改动（该按路径 add）② 别人的 WIP（不许碰、不许扫进 commit）③ 生成物（还原，别提交）
# 退出码：0 = 可开工/部署；1 = 有 ⚠ 项需先处理（或确认与自己无关）
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

FETCH=1
[ "${1:-}" = "--no-fetch" ] && FETCH=0
WARN=0
say()  { printf '%s\n' "$*"; }
warn() { printf '⚠ %s\n' "$*"; WARN=1; }

say "── 会话预检 $(date '+%F %T') ──"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
say "分支：$BRANCH   HEAD：$(git rev-parse --short HEAD)"
[ "$BRANCH" != "main" ] && warn "不在 main：这里的 commit 不会自动进 main，push origin main 会失败；发布只能从 main worktree 做"

if [ "$FETCH" -eq 1 ]; then
  git fetch -q origin main 2>/dev/null || warn "git fetch 失败（网络/凭据），下面按上次的 origin/main 判断"
fi
BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
say "vs origin/main：ahead $AHEAD / behind $BEHIND"
[ "$BEHIND" -gt 0 ] && warn "落后 origin/main $BEHIND 个 commit：此时部署/建站会整包回滚别人的页面"
[ "$AHEAD" -gt 0 ] && warn "本地有 $AHEAD 个独有 commit：不 push，别人从干净 worktree 部署就会把它们抹掉"

say ""
say "── 工作区残留 ──"
TRACKED=$(git status --porcelain --untracked-files=no)
if [ -z "$TRACKED" ]; then
  say "已跟踪文件：干净"
else
  say "已跟踪文件有改动（逐条确认是「我的」还是「别人的 WIP」再 add，禁 add -A）："
  printf '%s\n' "$TRACKED" | sed 's/^/  /'
fi

UNTRACKED=$(git status --porcelain --untracked-files=all | awk '$1=="??"{print $2}')
if [ -n "$UNTRACKED" ]; then
  N=$(printf '%s\n' "$UNTRACKED" | wc -l | tr -d ' ')
  say ""
  say "未跟踪文件（$N 个）："
  printf '%s\n' "$UNTRACKED" | head -20 | sed 's/^/  /'
  [ "$N" -gt 20 ] && say "  … 还有 $((N-20)) 个"
  SECRET=$(printf '%s\n' "$UNTRACKED" | grep -E '(^|/)\.env(\.|$)|(^|/)\.env$' || true)
  SRCW=$(printf '%s\n' "$UNTRACKED" | grep -E '^src/' || true)
  GEN=$(printf '%s\n' "$UNTRACKED" | grep -E '(^|/)\.astro/|\.generated\.(ts|js|mjs)$|(^|/)gp-build\.js$|llms-full\.txt$|^dist/' || true)
  [ -n "$SECRET" ] && warn "未跟踪的 .env*：一次 git add -A 就会把密钥端进 commit —— 只按路径 add"
  [ -n "$SRCW" ] && warn "src/ 下有未跟踪文件：build 会把它们一起编进 dist 上线（脏树闸挡的是已跟踪文件，挡不住这个）"
  [ -n "$GEN" ] && say "  ↑ 生成物（.astro/ · *.generated.* · gp-build.js · llms-full.txt · dist/）：还原或忽略，别提交"
fi

say ""
say "── 其它 worktree ──"
while IFS=$'\t' read -r wt br; do
  [ -z "${br:-}" ] && continue
  n=$(git rev-list --count HEAD.."$br" 2>/dev/null || echo 0)
  if [ "${n:-0}" -gt 0 ]; then
    warn "分支 ${br}（${wt}）有 $n 个 commit 不在当前 HEAD —— 从当前 HEAD 部署会抹掉它们"
  else
    say "  · $br 已并入当前 HEAD"
  fi
done < <(git worktree list --porcelain | awk '/^worktree /{wt=$2} /^branch /{sub("refs/heads/","",$2); print wt"\t"$2}')
DETACHED=$(git worktree list --porcelain | awk '/^worktree /{wt=$2} /^detached/{print wt}')
[ -n "$DETACHED" ] && { say "  · detached worktree（无分支，不会被部署抹掉，但收工时要清）："; printf '%s\n' "$DETACHED" | sed 's/^/    /'; }

say ""
if [ "$WARN" -eq 0 ]; then
  say "✅ 预检通过：可以开工 / 部署"
  exit 0
fi
say "✗ 上面 ⚠ 项先处理（或确认与本轮无关）再开工 / 部署"
exit 1
