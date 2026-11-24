#!/bin/sh
# 部署收尾：把 sitemap 重新提交给 Google Search Console。
#
# 为什么需要单独这一步：IndexNow 只有 Bing/Yandex 一类引擎吃，**Google 不吃**——
# 「IndexNow 已提交」不等于 Google 知道新页。GSC 自己重抓 sitemap 的节奏是几天一次
# （实测 2026-11-24：上一轮 11-23 23:34 抓的，当天 21:45 上线的新页它压根没看到）。
# 走 GSC API 重提交会当场触发一次下载（实测提交后几秒 lastDownloaded 就更新）。
#
# 非阻塞：失败只报 ⚠，绝不让它拖垮已经成功的上线。
#
# 用法：bash scripts/gsc-resubmit-sitemap.sh [domain]
#   环境变量：GSC_KEY_FILE 服务账号 JSON；GSC_PYTHON 解释器；HTTPS_PROXY 代理
set -u

SLUG="${1:-gridpaw.com}"

# 服务账号：优先通用路径（~/.hermes/secrets/ 是凭证唯一入口），回退旧文件名
KEY="${GSC_KEY_FILE:-$HOME/.hermes/secrets/gsc-gridpaw.json}"
if [ ! -f "$KEY" ]; then
  KEY="$HOME/.hermes/scripts/furriq-daily-brief-e15ace04af1c.json"
fi
if [ ! -f "$KEY" ]; then
  echo "⚠ 跳过 GSC sitemap 重提交：找不到服务账号 JSON（设 GSC_KEY_FILE 指定）"
  exit 1
fi

# 解释器：google-auth 只在 hermes venv 里，别用裸 python3
PY="${GSC_PYTHON:-$HOME/.hermes/hermes-agent/venv/bin/python}"
[ -x "$PY" ] || PY="$(command -v python3)"

# 本机访问 Google 必须走代理；google-auth 的 token 刷新只认环境变量
if [ -z "${HTTPS_PROXY:-}" ]; then
  HTTPS_PROXY="http://127.0.0.1:7882"
  export HTTPS_PROXY
  HTTP_PROXY="$HTTPS_PROXY"
  export HTTP_PROXY
fi

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUT=$("$PY" "$HERE/gsc-submit-sitemap.py" "$SLUG" --key "$KEY" 2>&1)
echo "$OUT" | tail -3

if echo "$OUT" | grep -q "Status: 204"; then
  exit 0
fi
echo "⚠ GSC sitemap 重提交未确认成功（不阻塞上线）：上面是原始回执"
exit 1
