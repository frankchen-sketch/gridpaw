#!/usr/bin/env bash
# 安装仓库自带 git hooks（scripts/hooks/* → .git/hooks/*，软链）
#   - pre-push：拦「feature 分支直推 main」和「main 非快进」
# 同机所有 worktree 共享同一个 .git，装一次全部生效；新克隆/新机器跑一次即可。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
SRC="$(cd scripts/hooks && pwd)"
HOOKS="$(cd "$(git rev-parse --git-common-dir)" && pwd)/hooks"
mkdir -p "$HOOKS"
for f in "$SRC"/*; do
  name="$(basename "$f")"
  chmod +x "$f"
  ln -sfn "$SRC/$name" "$HOOKS/$name"
  echo "installed: $name -> $HOOKS/$name"
done
