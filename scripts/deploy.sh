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
#   bash scripts/deploy.sh --allow-dirty # 仅在「脏文件全在非构建路径且逐条核对过」时用
#
# ⚠ --allow-dirty 不是省事开关（2026-11-19 实测教训）：
#   主 worktree 常年挂着兄弟会话的未提交文档，用它部署出来的 dist 内容没问题，
#   但 stamp-sw 会打出 CACHE_VERSION='<hash>-dirty' —— 事后没人能一眼断定线上
#   跑的是哪个 commit，可审计性没了。部署应从干净 commit 出包：
#     git worktree add /tmp/<t> <hash>; ln -s <主>/node_modules /tmp/<t>/node_modules
#     cp public/<indexnow-key>.txt /tmp/<t>/public/   # gitignore，新 worktree 必缺
#     全链构建 → npx -y wrangler pages deploy dist --project-name gridpaw --branch main
#   --allow-dirty 只留给「脏的确实不参与构建，且已经 grep 过 src/ public/」的情况。
#
# 退出码：0 成功 / 2 前置检查没过（没部署） / 3 另一个部署持锁中 / 4 部署后线上自检失败
# ─────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# Cloudflare credentials from the global secret files. Without this the deploy
# quietly uses the OAuth login, whose scopes cannot read or change zone settings.
. ./scripts/cf-auth.sh

ALLOW_DIRTY=0
SHA_ARG=""; ROLLBACK=0; WHY=""; ALLOW_UNMERGED=0
while [ $# -gt 0 ]; do
  case "$1" in
    --allow-dirty)   ALLOW_DIRTY=1; shift ;;
    --sha)           SHA_ARG="${2:-}"; shift 2 ;;
    --rollback)      ROLLBACK=1; shift ;;
    --why)           WHY="${2:-}"; shift 2 ;;
    --allow-unmerged) ALLOW_UNMERGED=1; shift ;;
    *) echo "未知参数：$1" >&2; exit 2 ;;
  esac
done

# ── 发布对象：一个 sha，不是一个工作树（2026-11-25 深修）─────────────────
# 旧模型「部署必须在主 tree 上跑」把合并列车和日更全绑在主树身上：主树一分叉，
# 发布就断（11-23~11-25 gridpaw 一条都没合上、Loop 日更断更就是这么来的）。
# 新模型：deploy 只认 sha，且这个 sha 必须证明「有 main 血统」（scripts/publish-gate.sh）。
#   · 默认：部署 origin/main 的头
#   · --sha <sha>：必须是 origin/main 的祖先且等于头（回滚用 --rollback --why）
#   · 分支会话要发未合并代码：--allow-unmerged --why "…"（会写台账并出卡，10 分钟内对账会红）
# 部署一律在干净的临时 worktree 里出包，主树可以停在任意分支干活，不再阻塞发布。
MAIN_TREE="$(git rev-parse --show-toplevel)"
# 主工作树（第一个 worktree）= node_modules 和 gitignore 运行时资产的家；
# 在二级 worktree 里跑 deploy 时，资产要从这里取，不能从当前树取。
PRIMARY_TREE="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
[ -n "$PRIMARY_TREE" ] || PRIMARY_TREE="$MAIN_TREE"
BASE_SHA=""
CARD="$HOME/.hermes/scripts/feishu-ops-card.sh"
if [ "$ALLOW_UNMERGED" -eq 1 ]; then
  [ -z "$WHY" ] && { echo "✗ --allow-unmerged 必须配 --why \"…\"（会进台账，事后要对账）" >&2; exit 7; }
  BASE_SHA=$(git rev-parse --verify "${SHA_ARG:-HEAD}^{commit}")
  echo "⚠ 破例：发未合并提交 ${BASE_SHA:0:8}（理由：${WHY}）—— 台账会记，对账会红" >&2
  bash "$CARD" "破例部署 $(basename "$MAIN_TREE")" "发未合并提交 ${BASE_SHA:0:8}，理由：${WHY}" >/dev/null 2>&1 || true
elif [ "$ROLLBACK" -eq 1 ]; then
  BASE_SHA=$(bash "$MAIN_TREE/scripts/publish-gate.sh" --sha "${SHA_ARG:-}" --rollback --why "$WHY") || exit $?
  bash "$CARD" "回滚部署 $(basename "$MAIN_TREE")" "回滚到 ${BASE_SHA:0:8}，理由：${WHY}" >/dev/null 2>&1 || true
else
  BASE_SHA=$(bash "$MAIN_TREE/scripts/publish-gate.sh" ${SHA_ARG:+--sha "$SHA_ARG"}) || exit $?
fi

# 记账目标（G6 幂等闸与收尾写账共用；必须在闸门之前定好）
export DEPLOY_STATE_FILE="${DEPLOY_STATE_FILE:-$HOME/.agent-autoloop/work/ledger/deploy-state.json}"
export DEPLOY_REPO="$PRIMARY_TREE" DEPLOY_SHA="$BASE_SHA"
export DEPLOY_SOURCE="${DEPLOY_SOURCE:-manual: scripts/deploy.sh（$(basename "${0}")）}"

OWN_TREE=0
[ -z "$SHA_ARG" ] && [ "$ROLLBACK" -eq 0 ] && [ "$ALLOW_UNMERGED" -eq 0 ] && OWN_TREE=1

WORKDIR="$MAIN_TREE"
if [ "$(git -C "$MAIN_TREE" rev-parse HEAD)" != "$BASE_SHA" ] || [ -n "$(git -C "$MAIN_TREE" status --porcelain --untracked-files=no)" ]; then
  WORKDIR="${TMPDIR:-/tmp}/gridpaw-deploy-$$"
  rm -rf "$WORKDIR"
  git -C "$MAIN_TREE" worktree add -q --detach "$WORKDIR" "$BASE_SHA" || { echo "✗ 建临时 worktree 失败" >&2; exit 2; }
  # gitignore 的运行时资产：IndexNow key、llms-full.txt 只在主树有（.gitignore public/*.txt）
  WT_TMP="$WORKDIR"
  echo "ℹ 出包用临时 worktree（主树 HEAD=$(git -C "$MAIN_TREE" rev-parse --short HEAD) ≠ 目标 ${BASE_SHA:0:8}）"
fi
# 出包目录必须有 node_modules 和 gitignore 运行时资产（IndexNow key 等）：
# 临时 worktree 和专用发布 worktree 都是干净检出，这两样只在主工作树里。
ensure_assets() {
  local d="$1"
  [ -e "$d/node_modules" ] || ln -s "$PRIMARY_TREE/node_modules" "$d/node_modules" 2>/dev/null || true
  # 只补 git 没追踪的 txt（IndexNow key / llms-full 这类 gitignore 资产）。
  # tracked 的 public/*.txt 一律不碰：主树里它们可能带着别的会话未提交的改动，
  # 拷进来既会污染产物，也会让 sw 指纹打成 <sha>-dirty（审计性丢失）。2026-11-25 实测踩到。
  local f rel
  for f in "$PRIMARY_TREE"/public/*.txt; do
    [ -e "$f" ] || continue
    rel="public/$(basename "$f")"
    git -C "$PRIMARY_TREE" ls-files --error-unmatch "$rel" >/dev/null 2>&1 && continue
    cp -f "$f" "$d/public/" 2>/dev/null || true
  done
}
ensure_assets "$WORKDIR"

cd "$WORKDIR"

LOCK="${TMPDIR:-/tmp}/gridpaw-deploy.lock"
cleanup() {
  rmdir "$LOCK" 2>/dev/null || true
  [ -n "${WT_TMP:-}" ] && { git -C "$MAIN_TREE" worktree remove --force "$WT_TMP" 2>/dev/null || rm -rf "$WT_TMP"; }
}
trap cleanup EXIT
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "✗ 另一个部署正持锁（$LOCK）。" >&2
  echo "  等它跑完；确认是残留锁再 rm -rf \"$LOCK\"。" >&2
  exit 3
fi

say() { printf '%s\n' "$*"; }

REMOTE="origin"
remote_head() { git ls-remote "$REMOTE" "refs/heads/main" | awk '{print $1}'; }

# ── G3 发布基线复核（防并发顶掉）─────────────────────────────────
# 构建要几分钟，期间别人可能把 main 推进了；拿旧 sha 出包上线 = 整包回滚别人的改动。
# 拿锁后核一次、出包后再核一次，任一不等就让位（不硬上）。
RH=$(remote_head)
if [ "${RH}" != "$BASE_SHA" ] && [ "$ALLOW_UNMERGED" -eq 0 ] && [ "$ROLLBACK" -eq 0 ]; then
  echo "✗ 让位：调 origin 期间 main 已推进到 ${RH:0:8}（本次目标 ${BASE_SHA:0:8}）。重跑一次拿最新。" >&2
  exit 8
fi

# ── G6 幂等闸：同一个 sha 不重复部署（除非 --force）─────────────
if [ "${FORCE_REDEPLOY:-0}" != "1" ] && [ "$ROLLBACK" -eq 0 ] && [ "$ALLOW_UNMERGED" -eq 0 ]; then
  PREV=$(node -e 'const f=process.env.DEPLOY_STATE_FILE;try{const d=JSON.parse(require("fs").readFileSync(f,"utf8"));const r=d[process.env.DEPLOY_REPO]||{};if(r.ok&&r.sha)console.log(r.sha+" "+r.version)}catch(e){}' 2>/dev/null || true)
  if [ -n "$PREV" ]; then
    PREV_SHA=${PREV%% *}; PREV_VER=${PREV#* }
    if [ "${PREV_SHA:0:12}" = "${BASE_SHA:0:12}" ]; then
      echo "✓ 幂等：${BASE_SHA:0:8} 已经部署过（版本 ${PREV_VER}）。确需重发：FORCE_REDEPLOY=1"
      exit 0
    fi
  fi
fi
die() { printf '✗ %s\n' "$*" >&2; exit 2; }

say "── 1/5 前置检查 ──"
AHEAD=0
if [ "$OWN_TREE" -eq 1 ]; then

  # ① 已跟踪文件不能有未提交改动（未跟踪文件不算：IndexNow key、loop-answers 都在此列）
  DIRTY=$(git status --porcelain --untracked-files=no)
  if [ -n "$DIRTY" ] && [ "$ALLOW_DIRTY" -eq 0 ]; then
    printf '%s\n' "$DIRTY" >&2
    die "工作区有未提交的已跟踪改动。先 commit 或 stash（确需带脏上线：--allow-dirty）"
  fi

  # ①b src/ 下不允许有未跟踪文件
  #    build 会把它们一起编译进 dist 上线。① 只查已跟踪文件，多会话并行时
  #    "新建组件/页面但没 git add" 的半成品会静默漏网 —— 这条专治这种漏网。
  if [ "$ALLOW_DIRTY" -eq 0 ]; then
    UNTRACKED_SRC=$(git status --porcelain --untracked-files=all -- src | awk '$1=="??"{print $2}')
    if [ -n "$UNTRACKED_SRC" ]; then
      printf '%s\n' "$UNTRACKED_SRC" >&2
      die "src/ 下有未跟踪文件（新建但没 git add）：build 会把它们编译进 dist 带上线。先 commit 或挪出工作区"
    fi
  fi

  # ② 不能落后 origin/main（落后 = 你的快照缺别人的东西）
  git fetch origin main --quiet
  BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
  AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
  [ "$BEHIND" -gt 0 ] && die "落后 origin/main $BEHIND 个 commit —— 先 git merge origin/main，否则这次部署会整包回滚别人的改动"
  [ "$AHEAD" -gt 0 ] && say "⚠ 本分支比 origin/main 多 $AHEAD 个 commit（正常路径下 publish-gate 会先拦；走到这说明用了 --allow-unmerged）"

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
else
  say "✓ 从干净提交 ${BASE_SHA:0:8} 出包（看的是 commit，不是谁的树 —— 主树脏/在别的分支都不影响）"
fi

say "── 2/5 构建（deploy 脚本不含 build，必须单独跑）──"
pnpm run build > /tmp/gridpaw-build.log 2>&1 || { tail -25 /tmp/gridpaw-build.log >&2; die "build 失败（完整日志 /tmp/gridpaw-build.log）"; }
PAGES=$(grep -oE "[0-9]+ page\(s\) built" /tmp/gridpaw-build.log | tail -1)
say "✓ ${PAGES:-build ok}"

EXPECTED=$(grep -oE "CACHE_VERSION *= *'[^']*'" dist/sw.js | head -1 | sed "s/.*'\(.*\)'/\1/")
[ -n "$EXPECTED" ] || die "dist/sw.js 里找不到 CACHE_VERSION，构建产物不完整"
say "✓ 构建指纹 ${EXPECTED}"

# sitemap 与 noindex 必须一致：被排除出 sitemap 的页却还能被收录（或反过来），是隐形 SEO 事故。
# 2026-11-21 实测抓到 /akari/levels/hard/：exactExcludes 里有它，页面却没 noindex。
node scripts/check-sitemap-noindex.mjs || die "sitemap 与 noindex 不一致（见上）；要么给页面加 noindex，要么把它从 exactExcludes 里去掉"

# 引擎自测（全量）——build 里只跑 fast 档（nonogram 49ms + akari 154ms）；
# kakuro 173s / nurikabe 31s / tracks 20s 成本高，放部署闸门：
# 引擎几何/可解性回归一旦上线玩家会撞到，而 fast 档抓不到生成器深处的回退。
# 前置：build 已跑过 bundle-engine，public/*.js 是新鲜产物。
say "── 2b/5 引擎自测（全量，约 4 分钟）──"
if [ "${SKIP_ENGINE_SELFTEST:-0}" = "1" ]; then
  say "⚠ SKIP_ENGINE_SELFTEST=1 —— 本次跳过引擎自测（只留给紧急热修，事后必须补跑 pnpm selftest:engines）"
else
  node scripts/selftest-engines.mjs --all > /tmp/gridpaw-engine-selftest.log 2>&1 || {
    tail -30 /tmp/gridpaw-engine-selftest.log >&2
    die "引擎自测失败（完整日志 /tmp/gridpaw-engine-selftest.log）"
  }
  say "✓ 引擎自测全部通过"
fi

RH2=$(remote_head)
if [ "${RH2}" != "$BASE_SHA" ] && [ "$ALLOW_UNMERGED" -eq 0 ] && [ "$ROLLBACK" -eq 0 ]; then
  echo "✗ 让位：出包期间 main 被推进到 ${RH2:0:8}（本次目标 ${BASE_SHA:0:8}），这批包作废，重跑。" >&2
  exit 8
fi

say "── 3/5 部署（--branch main = 打进生产柜）──"
npx -y wrangler pages deploy dist --project-name gridpaw --branch main --commit-dirty=true 2>&1 | tee /tmp/gridpaw-deploy.log | grep -E "Uploaded|Deployment complete|Deployment alias" || true
grep -q "Deployment complete" /tmp/gridpaw-deploy.log || die "部署回执里没有 Deployment complete（看 /tmp/gridpaw-deploy.log）"
if grep -qE "Deployment alias URL: https://[a-z0-9-]+\.gridpaw\.pages\.dev" /tmp/gridpaw-deploy.log && \
   ! grep -qE "Deployment alias URL: https://(main|gridpaw)\.gridpaw\.pages\.dev" /tmp/gridpaw-deploy.log; then
  say "⚠ 回执带了 branch 别名（预览特征），但已显式 --branch main，按下一步线上自检为准"
  say "  $(grep 'Deployment alias URL' /tmp/gridpaw-deploy.log)"
fi

say "── 4/5 IndexNow ──"
# --from-git HEAD~1：只提交本次真正改动的页面，而不是笼统的 sitemap index。
# 共享组件（components/layouts/lib）或动态路由有改动时，脚本会自动追加 sitemap
# index 兜底——那些页面的具体 URL 不在 diff 里。多 commit 合并成一次部署时，
# HEAD~1 只覆盖最后一个 commit，其余页面靠 sitemap 兜底，属预期。
node scripts/indexnow-ping.mjs --from-git HEAD~1 2>&1 | tail -8 || say "⚠ IndexNow 失败（不阻塞上线）"

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

say "── 收尾 GSC sitemap 重提交 ──"
# Google 不吃 IndexNow（那是 Bing/Yandex 通道）；GSC 自己重抓 sitemap 是几天一次，
# 走 API 重提交会当场触发一次下载（实测提交后几秒 lastDownloaded 就更新），新页发现快得多。
# 放在自检之后：先证明生产跑的是这份构建，再告诉 Google 来抓。失败不阻塞上线。
bash scripts/gsc-resubmit-sitemap.sh gridpaw.com || say "⚠ GSC sitemap 重提交失败（不阻塞上线）"

export DEPLOY_VERSION="$EXPECTED"

# 记账：deploy-state.json 是「线上到底跑哪个 sha」的唯一真源，I1 对账（origin/main == 已部署 sha）读它。
# 手动部署也写，否则对账会把人工上线误报成"没上线"。
node -e '
const fs=require("fs"),path=require("path");
const f=process.env.DEPLOY_STATE_FILE, repo=process.env.DEPLOY_REPO, sha=process.env.DEPLOY_SHA, ver=process.env.DEPLOY_VERSION;
if(!f||!fs.existsSync(path.dirname(f))) process.exit(0);
let d={}; try{d=JSON.parse(fs.readFileSync(f,"utf8"))}catch(e){}
d[repo]={sha,version:ver,at:new Date().toLocaleString("sv-SE",{timeZone:"Asia/Shanghai"}).slice(0,16),ok:true,source:process.env.DEPLOY_SOURCE||"manual: scripts/deploy.sh"};
fs.writeFileSync(f+".tmp",JSON.stringify(d,null,1)); fs.renameSync(f+".tmp",f);
' || say "⚠ deploy-state 没写成功（不影响上线，但 I1 对账会误报）"

say ""
say "✅ 上线完成：${EXPECTED}（sha ${BASE_SHA:0:8}）"
exit 0
