#!/bin/bash
# 疯狂收杂物 L47 试玩原型 —— 全管线重建（从微信 wxapkg 到交付 HTML）
# 用法: bash scripts/run_pipeline.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# 解释器：解密要 pycryptodome。系统 /usr/bin/python3 有；Hermes 内置 python(3.14) 和 homebrew python3 没有。
# 默认 python3，缺依赖时回退系统解释器（后台/cron 的 PATH 可能先命中 Hermes venv）。
PY=python3
if ! $PY -c "import Crypto, PIL" 2>/dev/null; then
  echo "注意: $(command -v python3) 缺 pycryptodome/Pillow -> 回退 /usr/bin/python3"
  PY=/usr/bin/python3
fi
$PY -c "import Crypto, PIL" 2>/dev/null || {
  echo "缺依赖: 请执行 python3 -m pip install --user pycryptodome pillow"; exit 1; }
echo "python: $PY ($($PY -c "import sys;print(sys.version.split()[0])"))"

echo "== 1/6 解密 + 解包 + 关卡文档流恢复 =="
"$PY" scripts/unpack_pipeline.py

echo "== 2/6 导出 81 关摆放数据 =="
"$PY" scripts/export_levels_all.py

echo "== 3/6 下载 81 张场景背景（CDN，5 张缺失已知）=="
"$PY" scripts/fetch_backgrounds.py

echo "== 4/6 v7 渲染 L47 + 纯背景/内联场景图 =="
"$PY" scripts/render_levels_v7.py build/fkszw_v7 47
"$PY" scripts/make_v7_bg.py

echo "== 5/6 导出 WebP 精灵集 =="
"$PY" scripts/build_sprites_webp.py

echo "== 6/6 生成交付 HTML + 自检 =="
"$PY" scripts/make_play_L47_full.py
"$PY" scripts/verify_delivery.py
