#!/usr/bin/env bash
# publish-gate.sh — 发布前置闸：证明「这个 sha 有 main 血统」
#
# 背景（2026-11-25 深修）：旧方案靠「部署必须在主 worktree 上跑」来防分支会话上线，
# 代价是主树被任何会话占用时，合并列车和日更管线全线瘫。现在改成按 sha 证明来源：
#
#   · 默认部署 origin/main 的头
#   · --sha <sha> 指定时，该 sha 必须是 origin/main 的祖先（即已合入）
#   · 必须是 origin/main 当前头（防拿旧树顶掉新上线）；回滚要显式 --rollback --why
#
# 用法：
#   bash scripts/publish-gate.sh                 # → 打印 origin/main 的 sha
#   bash scripts/publish-gate.sh --sha abc1234   # → 校验并打印完整 sha
#   bash scripts/publish-gate.sh --sha abc1234 --rollback --why "线上白屏，回滚到上一版"
#
# 退出码：0 通过（stdout 只有那一个 sha）/ 5 没有 main 血统 / 6 不是 main 头 / 7 回滚缺理由
# 环境：OFFLINE=1 时跳过 fetch（测试用）；REQUIRE_HEAD=0 允许非头的祖先 sha（追赶部署）
set -uo pipefail

TARGET=""; ROLLBACK=0; WHY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --sha) TARGET="${2:-}"; shift 2 ;;
    --rollback) ROLLBACK=1; shift ;;
    --why) WHY="${2:-}"; shift 2 ;;
    *) echo "未知参数：$1" >&2; exit 2 ;;
  esac
done

[ "${OFFLINE:-0}" = "1" ] || git fetch -q origin main 2>/dev/null || true
HEAD_SHA=$(git rev-parse --verify -q origin/main) || { echo "✗ 取不到 origin/main" >&2; exit 4; }

if [ -z "$TARGET" ]; then
  TARGET="$HEAD_SHA"
else
  TARGET=$(git rev-parse --verify -q "${TARGET}^{commit}") || { echo "✗ 不认识这个 sha：${TARGET}" >&2; exit 4; }
fi

# ① main 血统：必须是 origin/main 的祖先（回滚也满足，回滚只是放宽 ②）
if ! git merge-base --is-ancestor "$TARGET" "$HEAD_SHA" 2>/dev/null; then
  echo "✗ 拒绝发布：${TARGET} 不在 origin/main 的历史里（分支还没合）。" >&2
  echo "  正确姿势：先把分支合进 main（合并列车/人工 merge），再发合并结果。" >&2
  echo "  真要拿未合并代码上线：deploy.sh --allow-unmerged --why \"…\"（会记台账并出卡）。" >&2
  exit 5
fi

# ② 必须是 main 当前头（除非回滚 / 追赶）
if [ "$ROLLBACK" -eq 0 ] && [ "${REQUIRE_HEAD:-1}" = "1" ] && [ "$TARGET" != "$HEAD_SHA" ]; then
  if [ -n "$WHY" ] && [ "${ALLOW_STALE:-0}" = "1" ]; then
    echo "⚠ 允许发非头 sha（ALLOW_STALE=1）：${TARGET}（main 头是 ${HEAD_SHA}），理由：${WHY}" >&2
  else
    echo "✗ 拒绝发布：${TARGET} 不是 origin/main 的头（头是 ${HEAD_SHA:0:8}）。" >&2
    echo "  落后部署会顶掉别人刚上线的内容。要回滚用 --rollback --why \"…\"。" >&2
    exit 6
  fi
fi

# ③ 回滚必须有理由
if [ "$ROLLBACK" -eq 1 ] && [ -z "$WHY" ]; then
  echo "✗ 回滚必须写理由：--rollback --why \"…\"（会记台账，事后要对账）" >&2
  exit 7
fi

echo "$TARGET"
