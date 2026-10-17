#!/usr/bin/env python3
"""og-murdoku 生成（2026-10-17，gen-og-v2 的 murdoku 补丁）。

右侧 = 真页面 /murdoku/ 棋盘截图（绝对真实，过对账）；
左侧 = gen-og-v2 同款品牌栏。整页截图后按棋盘棕框色 #7A5C3E 定位裁切。

用法: python3 scripts/gen-og-murdoku.mjs 之类的这个 py 版本：
  python3 scripts/gen-og-murdoku.py
产物: public/og-murdoku.png
"""
import base64, subprocess, sys, time, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 4173
BOARD_EDGE = (0x7A, 0x5C, 0x3E)   # .board 棕框
CARD_EDGE = (0x4A, 0x3F, 0x52)    # og 卡棋盘卡边框（纪律验收色）


def near(px, ref, tol=12):
    return all(abs(a - b) <= tol for a, b in zip(px, ref))


def color_bbox(im, ref, step=2):
    w, h = im.size
    px = im.load()
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(0, h, step):
        for x in range(0, w, step):
            if near(px[x, y], ref):
                minx, miny = min(minx, x), min(miny, y)
                maxx, maxy = max(maxx, x), max(maxy, y)
    return (minx, miny, maxx, maxy) if maxx >= 0 else None


def main():
    server = subprocess.Popen(
        ["python3", "-m", "http.server", str(PORT), "--directory", "dist"],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
    try:
        # 1) 整页截图（等异步生成棋盘）
        subprocess.run(["npx", "-y", "playwright", "screenshot",
                        "--viewport-size=900,1000", "--wait-for-timeout=5000",
                        f"http://localhost:{PORT}/murdoku/", "/tmp/gpm-full.png"],
                       cwd=ROOT, check=True)

        # 2) 定位棋盘并裁切
        full = Image.open("/tmp/gpm-full.png").convert("RGB")
        bb = color_bbox(full, BOARD_EDGE)
        if not bb:
            sys.exit("FATAL: 找不到棋盘棕框 #7A5C3E——页面没渲染出棋盘？")
        minx, miny, maxx, maxy = bb
        pad = 4
        board = full.crop((max(0, minx - pad), max(0, miny - pad),
                           min(full.width, maxx + pad), min(full.height, maxy + pad)))
        board.save("/tmp/gpm-board.png")
        print("board crop:", board.size)

        # 3) 合成 1200x630
        b64 = base64.b64encode(open("/tmp/gpm-board.png", "rb").read()).decode()
        html = f"""<!DOCTYPE html><html><head><meta charset="utf8">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:1200px; height:630px; background:#FDF8F5; font-family:'Nunito',system-ui,sans-serif; overflow:hidden; }}
.wrap {{ width:100%; height:100%; display:flex; align-items:center; }}
.left {{ width:600px; padding-left:72px; }}
.brand {{ color:#b45309; font-weight:900; font-size:34px; letter-spacing:.5px; }}
.brand-sub {{ color:#8a6d4e; font-weight:700; font-size:19px; margin-top:2px; }}
h1 {{ color:#4a3f52; font-weight:900; font-size:88px; line-height:1.05; margin-top:46px; }}
.tag {{ color:#6b5a44; font-weight:700; font-size:27px; margin-top:14px; }}
.url {{ color:#9a8b78; font-weight:700; font-size:22px; margin-top:74px; }}
.right {{ flex:1; display:flex; align-items:center; justify-content:center; padding-right:56px; }}
.boardcard {{ background:#fff8ef; border:6px solid #4a3f52; border-radius:18px; padding:14px; box-shadow:0 12px 30px rgba(74,63,82,.14); }}
.boardcard img {{ display:block; width:430px; height:auto; border-radius:8px; }}
</style></head><body>
<div class="wrap">
  <div class="left">
    <div class="brand">GridPaw</div>
    <div class="brand-sub">free · no signup · pure logic</div>
    <h1>Murder<br>Sudoku</h1>
    <div class="tag">place the suspects. find the killer.</div>
    <div class="url">gridpaw.com/murdoku</div>
  </div>
  <div class="right"><div class="boardcard"><img src="data:image/png;base64,{b64}"></div></div>
</div>
</body></html>"""
        open("/tmp/gpm-card.html", "w").write(html)

        # 4) 终图
        subprocess.run(["npx", "-y", "playwright", "screenshot",
                        "--viewport-size=1200,630", "--wait-for-timeout=2000",
                        "file:///tmp/gpm-card.html", f"{ROOT}/public/og-murdoku.png"],
                       cwd=ROOT, check=True)

        # 5) 纪律验收：棋盘卡完整、距边有余量
        card = Image.open(f"{ROOT}/public/og-murdoku.png").convert("RGB")
        cb = color_bbox(card, CARD_EDGE)
        if not cb:
            sys.exit("FATAL: 终图找不到卡边框 #4a3f52")
        minx, miny, maxx, maxy = cb
        margins = (minx, miny, card.width - 1 - maxx, card.height - 1 - maxy)
        print("card size:", card.size, "| 卡边框距边:", margins)
        if min(margins) < 8:
            sys.exit(f"FATAL: 棋盘卡贴边（最小边距 {min(margins)}px < 8px）")
        print("OK -> public/og-murdoku.png")
    finally:
        server.kill()


if __name__ == "__main__":
    main()
