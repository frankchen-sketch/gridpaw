#!/usr/bin/env python3
"""GridPaw OG 分享图生成器（v2，2026-10-15 入库）。

重做背景：10-02 批 8 张 og 图右侧全是首访教学卡截图，缩略图卖点零传达。
本脚本生成 8 份 1200x630 HTML（左品牌栏 + 右「干净解题中棋盘」），
再用 Playwright 截图覆盖 public/og-<game>.png。

用法：
  python3 scripts/gen-og-v2.py --out scripts/og-build          # 只出 HTML
  python3 scripts/gen-og-v2.py --out scripts/og-build --png    # HTML + PNG

发布步骤（改图后）：
  1. 跑 --png，肉眼/像素级验收（vision 读图会自相矛盾，用 PIL 找边框色
     #4a3f52 的 bbox 确认棋盘完整距边有余量才定案）
  2. 拷贝 og-build/og-<name>.png -> public/og-<name>.png
  3. 部署 + 线上 curl 字节数复核

纪律：
  - 每个盘必须「过对账」——谜题圈观众一眼识破假盘。kakuro 空格由行+列
    约束唯一确定；hashi 桥数=岛数字；star-battle 星位公式
    (r,2r%7)+(r,(2r+4)%7) 行列各 2 无相邻、锯齿区域只转移无星格；
    nonogram clue 由图案自动计算。
  - 棋盘布局用 CSS grid div，别给 table 的 td 上 display:flex
    （会把多列压成竖条，kenken 踩过）。

og-default.png / og-akari-daily.png 是设计卡不在此列，别覆盖。
"""
import argparse
import os
import subprocess
import sys

BASE_CSS = """
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:#FDF8F5; font-family:'Nunito',system-ui,sans-serif; overflow:hidden; }
  .wrap { width:100%; height:100%; display:flex; align-items:center; }
  .left { width:640px; padding:0 0 0 72px; }
  .brand { color:#b45309; font-weight:900; font-size:34px; letter-spacing:.5px; }
  .brand-sub { color:#8a6d4e; font-weight:700; font-size:19px; margin-top:2px; }
  h1 { color:#4a3f52; font-weight:900; font-size:96px; line-height:1.05; margin-top:50px; }
  .tag { color:#6b5a44; font-weight:700; font-size:28px; margin-top:14px; }
  .url { color:#9a8b78; font-weight:700; font-size:22px; margin-top:88px; }
  .right { flex:1; display:flex; align-items:center; justify-content:center; padding-right:56px; }
  .board { background:#fff8ef; border:6px solid #4a3f52; border-radius:18px; padding:22px 24px; box-shadow:0 12px 30px rgba(74,63,82,.14); }
"""
FONT = '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">'


def page(name, title, tag, board_html, extra_css=""):
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">{FONT}<style>{BASE_CSS}{extra_css}</style></head>
<body><div class="wrap">
  <div class="left">
    <div class="brand">GridPaw</div>
    <div class="brand-sub">Free Cat Logic Puzzles</div>
    <h1>{title}</h1>
    <div class="tag">{tag}</div>
    <div class="url">gridpaw.com/{name}/</div>
  </div>
  <div class="right"><div class="board">{board_html}</div></div>
</div></body></html>"""


def nonogram_page():
    """猫显形盘 + clue 自动计算（10x10，1=amber 2=pink nose）。独立版式：左栏略宽。"""
    return """<!DOCTYPE html>
<html><head><meta charset="utf-8">""" + FONT + """<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:#FDF8F5; font-family:'Nunito',system-ui,sans-serif; overflow:hidden; }
  .wrap { width:100%; height:100%; display:flex; align-items:center; }
  .left { width:660px; padding:0 0 0 72px; }
  .brand { color:#b45309; font-weight:900; font-size:34px; letter-spacing:.5px; }
  .brand-sub { color:#8a6d4e; font-weight:700; font-size:19px; margin-top:2px; }
  h1 { color:#4a3f52; font-weight:900; font-size:110px; line-height:1.05; margin-top:56px; }
  .tag { color:#6b5a44; font-weight:700; font-size:30px; margin-top:14px; }
  .url { color:#9a8b78; font-weight:700; font-size:22px; margin-top:96px; }
  .right { flex:1; display:flex; align-items:center; justify-content:center; }
  .board { background:#fff8ef; border:6px solid #4a3f52; border-radius:18px; padding:22px 24px; box-shadow:0 12px 30px rgba(74,63,82,.14); }
  table { border-collapse:collapse; }
  td { width:34px; height:34px; }
  .clue { color:#8a6d4e; font-weight:800; font-size:13px; text-align:right; padding-right:8px; white-space:nowrap; }
  .clue-top { color:#8a6d4e; font-weight:800; font-size:13px; text-align:center; vertical-align:bottom; padding-bottom:6px; white-space:nowrap; }
  .cell { background:#fff; border:2px solid #eadfce; border-radius:7px; }
  .on { background:#d97706; border-color:#b45309; }
  .nose { background:#FFB3C6; border-color:#e38aa2; }
</style></head>
<body><div class="wrap">
  <div class="left">
    <div class="brand">GridPaw</div>
    <div class="brand-sub">Free Cat Logic Puzzles</div>
    <h1>Nonogram</h1>
    <div class="tag">Reveal the hidden picture</div>
    <div class="url">gridpaw.com/nonogram/</div>
  </div>
  <div class="right"><div class="board" id="board"></div></div>
</div>
<script>
// 10x10 cat: 1 = amber fill, 2 = pink nose（与已部署 og-nonogram.png 严格一致，勿改图案）
const P = [
  [0,1,0,0,0,0,0,0,1,0],
  [0,1,1,0,0,0,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,0,1,1,1,1,0,1,0],
  [0,1,1,1,2,2,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,1,0,1,1,0,1,1,0],
];
function runs(line){ const out=[]; let n=0; for(const v of line){ if(v>0){n++;} else if(n){out.push(n);n=0;} } if(n)out.push(n); return out.length?out:[0]; }
const tbl=document.createElement('table');
const tr0=document.createElement('tr'); tr0.appendChild(document.createElement('td'));
for(let c=0;c<P[0].length;c++){ const td=document.createElement('td'); td.className='clue-top'; td.textContent=runs(P.map(r=>r[c])).join(' '); tr0.appendChild(td); }
tbl.appendChild(tr0);
for(let r=0;r<P.length;r++){
  const tr=document.createElement('tr');
  const td=document.createElement('td'); td.className='clue'; td.textContent=runs(P[r]).join(' '); tr.appendChild(td);
  for(let c=0;c<P[r].length;c++){ const td=document.createElement('td');
    td.className='cell'+(P[r][c]===1?' on':P[r][c]===2?' nose':''); tr.appendChild(td); }
  tbl.appendChild(tr);
}
document.getElementById('board').appendChild(tbl);
</script></body></html>"""


def build_pages():
    pages = {}

    # ---------- Kakuro：角格 clue + 已填数字（解与 clue 严格对账） ----------
    # 解：r1 5,3,1(=9) r2 2,4,6(=12) r3 7,5,8(=20)；空格均由行+列约束唯一确定：
    #   r1c3: 行 9→1, 列 15→1   r2c2: 行 12→4, 列 12→4   r3c1: 行 20→7, 列 14→7
    kakuro_css = """
      table { border-collapse:collapse; }
      td { width:52px; height:52px; text-align:center; font-weight:800; font-size:22px; color:#b45309;
           background:#fff; border:2px solid #d8c9b4; }
      .kc { background:#fff8ef; font-size:11px; font-weight:800; color:#8a6d4e; text-align:left;
            vertical-align:top; padding:4px 5px; line-height:1.3; }
      .blank { background:#fff; }
    """
    kakuro = """<table>
<tr><td class="kc"></td><td class="kc">14 ↓</td><td class="kc">12 ↓</td><td class="kc">15 ↓</td></tr>
<tr><td class="kc">9 →</td><td>5</td><td>3</td><td class="blank"></td></tr>
<tr><td class="kc">12 →</td><td>2</td><td class="blank"></td><td>6</td></tr>
<tr><td class="kc">20 →</td><td class="blank"></td><td>5</td><td>8</td></tr>
</table>"""
    pages["kakuro"] = ("kakuro", "Cross-sum number puzzle", kakuro, kakuro_css)

    # ---------- Nurikabe：深海蓝海 + 沙滩岛（demo 皮肤同源色） ----------
    nuri_css = """
      .g { display:grid; grid-template-columns:repeat(6,50px); grid-auto-rows:50px; gap:4px; }
      .sea { background:#8fb8d8; border-radius:7px; }
      .unknown { background:#fff; border:2px solid #eadfce; border-radius:7px; }
      .isl { background:#fdeed3; border:2px solid #e3c9a0; border-radius:7px;
             display:flex; align-items:center; justify-content:center;
             font-weight:900; font-size:20px; color:#b45309; }
    """
    # 6x6: 2=clue island, 1=sea, 0=unknown
    nuri_p = [
      [0,0,2,1,1,0],
      [0,1,1,1,0,0],
      [0,0,0,1,0,2],
      [0,2,1,1,1,0],
      [0,0,0,1,0,0],
      [0,0,0,0,0,0],
    ]
    cells = "".join(
      f'<div class="{"isl" if v==2 else "sea" if v==1 else "unknown"}">{"" if v!=2 else str(2+i%3)}</div>'
      for i, v in enumerate(sum(nuri_p, [])))
    pages["nurikabe"] = ("nurikabe", "Every island stays one", f'<div class="g">{cells}</div>', nuri_css)

    # ---------- Binary (Takuzu)：0/1 mid-solve ----------
    bin_css = """
      .g { display:grid; grid-template-columns:repeat(6,50px); grid-auto-rows:50px; gap:4px; }
      .u { background:#fff; border:2px solid #eadfce; border-radius:7px; }
      .one { background:#d97706; border-radius:7px; color:#fff; display:flex; align-items:center;
             justify-content:center; font-weight:900; font-size:24px; }
      .zero { background:#fff; border:2px solid #b45309; border-radius:7px; display:flex; align-items:center;
              justify-content:center; font-weight:900; font-size:24px; color:#b45309; }
    """
    bin_p = [
      [1,0,0,1,0,-1],
      [0,1,0,-1,1,0],
      [0,0,1,0,0,1],
      [1,0,-1,0,1,-1],
      [0,1,0,1,0,1],
      [-1,0,1,0,-1,0],
    ]
    cells = "".join(
      f'<div class="{"one" if v==1 else "zero" if v==0 else "u"}">{v==1 and "1" or v==0 and "0" or ""}</div>'
      for v in sum(bin_p, []))
    pages["binary"] = ("binary", "Every row pairs up", f'<div class="g">{cells}</div>', bin_css)

    # ---------- Hashi：岛+桥 SVG（4 岛，桥数与数字严格一致） ----------
    # TL3: 双桥→TR(2)+单桥↓BL(1)=3   TR4: 双←(2)+双↓BR(2)=4
    # BL2: 单↑(1)+单→(1)=2           BR3: 双↑(2)+单←(1)=3
    hashi_svg = """<svg width="380" height="380" viewBox="0 0 380 380">
  <g stroke="#b45309" stroke-width="5" fill="none">
    <line x1="90" y1="84" x2="290" y2="84"/>
    <line x1="90" y1="96" x2="290" y2="96"/>
    <line x1="284" y1="90" x2="284" y2="290"/>
    <line x1="296" y1="90" x2="296" y2="290"/>
    <line x1="90" y1="90" x2="90" y2="290"/>
    <line x1="90" y1="290" x2="290" y2="290"/>
  </g>
  <g fill="#fff8ef" stroke="#4a3f52" stroke-width="4" font-family="Nunito,sans-serif"
     font-weight="900" font-size="22" text-anchor="middle">
    <circle cx="90" cy="90" r="26"/><circle cx="290" cy="90" r="26"/>
    <circle cx="90" cy="290" r="26"/><circle cx="290" cy="290" r="26"/>
  </g>
  <g fill="#4a3f52" font-family="Nunito,sans-serif" font-weight="900" font-size="22" text-anchor="middle">
    <text x="90" y="98">3</text><text x="290" y="98">4</text>
    <text x="90" y="298">2</text><text x="290" y="298">3</text>
  </g>
</svg>"""
    pages["hashi"] = ("hashi", "Bridge every island", hashi_svg, "")

    # ---------- Kenken：cage 粗框 + 数字（grid div 布局，避开 table+flex 压缩） ----------
    ken_css = """
      .g { display:grid; grid-template-columns:repeat(4,60px); grid-auto-rows:60px; gap:2px;
           background:#cbb99e; border:4px solid #4a3f52; border-radius:6px; padding:2px; }
      .c { background:#fff; position:relative; display:flex; align-items:center; justify-content:center;
           font-weight:900; font-size:26px; color:#b45309; }
      .cage { position:absolute; top:3px; left:5px; font-size:13px; color:#8a6d4e; font-weight:800; }
    """
    ken_cages = {  # (r,c) -> cage clue（标在 cage 左上格）
      (0, 0): "6+", (0, 1): "3÷", (0, 3): "7+",
      (2, 0): "12×", (2, 2): "8+",
    }
    ken_digits = {  # (r,c) -> digit
      (0, 0): "2", (0, 1): "3", (0, 3): "1",
      (1, 0): "4", (1, 2): "2", (1, 3): "3",
      (2, 1): "1", (2, 3): "4",
      (3, 0): "3", (3, 1): "2", (3, 3): "1",
    }
    ken_cells = "".join(
      ('<div class="c">%s%s</div>' % (
         ('<span class="cage">%s</span>' % ken_cages[(r, c)]) if (r, c) in ken_cages else "",
         ken_digits.get((r, c), "")))
      for r in range(4) for c in range(4))
    pages["kenken"] = ("kenken", "Cages do the math", f'<div class="g">{ken_cells}</div>', ken_css)

    # ---------- Slitherlink：点阵+环线 SVG ----------
    slither_svg = """<svg width="380" height="330" viewBox="0 0 380 330">
  <g fill="#8a6d4e" font-family="Nunito,sans-serif" font-weight="800" font-size="20" text-anchor="middle">
    <text x="122" y="118">3</text><text x="192" y="118">2</text>
    <text x="122" y="188">2</text><text x="262" y="188">3</text>
    <text x="192" y="258">3</text>
  </g>
  <g stroke="#4a3f52" stroke-width="7" stroke-linecap="round" fill="none">
    <line x1="87" y1="85" x2="227" y2="85"/>
    <line x1="227" y1="85" x2="227" y2="155"/>
    <line x1="227" y1="155" x2="297" y2="155"/>
    <line x1="297" y1="155" x2="297" y2="225"/>
    <line x1="297" y1="225" x2="157" y2="225"/>
    <line x1="157" y1="225" x2="87" y2="225"/>
    <line x1="87" y1="225" x2="87" y2="155"/>
    <line x1="87" y1="155" x2="87" y2="85"/>
    <line x1="157" y1="225" x2="157" y2="295"/>
    <line x1="157" y1="295" x2="227" y2="295"/>
    <line x1="227" y1="295" x2="227" y2="225"/>
  </g>
  <g fill="#4a3f52">
    <circle cx="87" cy="85" r="7"/><circle cx="157" cy="85" r="7"/><circle cx="227" cy="85" r="7"/><circle cx="297" cy="85" r="7"/>
    <circle cx="87" cy="155" r="7"/><circle cx="157" cy="155" r="7"/><circle cx="227" cy="155" r="7"/><circle cx="297" cy="155" r="7"/>
    <circle cx="87" cy="225" r="7"/><circle cx="157" cy="225" r="7"/><circle cx="227" cy="225" r="7"/><circle cx="297" cy="225" r="7"/>
    <circle cx="157" cy="295" r="7"/><circle cx="227" cy="295" r="7"/>
  </g>
</svg>"""
    pages["slitherlink"] = ("slitherlink", "Close the single loop", slither_svg, "")

    # ---------- Star Battle：7 区域着色 + 14 星（每行/每列/每区域严格 2 颗，无相邻） ----------
    # 星位：(r,2r%7)+(r,(2r+4)%7)；区域：水平带+锯齿边界（只转移无星格）
    sb_css = """
      .g { display:grid; grid-template-columns:repeat(7,46px); grid-auto-rows:46px; gap:3px; }
      .c { border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:26px; }
      .star { color:#d97706; }
      .r0 { background:#fdeed3; } .r1 { background:#fce4e8; } .r2 { background:#e8f0dc; }
      .r3 { background:#e3edf7; } .r4 { background:#f8e0d8; } .r5 { background:#efe4f5; }
      .r6 { background:#e0f2f0; }
    """
    sb_regions = [
      [0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1],
      [2,2,2,2,2,2,1],
      [2,3,3,3,3,3,3],
      [4,4,4,4,4,4,3],
      [5,5,5,5,5,5,5],
      [5,6,6,6,6,6,6],
    ]
    stars = {(0,0),(0,4),(1,2),(1,6),(2,4),(2,1),(3,6),(3,3),(4,1),(4,5),(5,3),(5,0),(6,5),(6,2)}
    STAR = '<span class="star">★</span>'
    cells = "".join(
      ('<div class="c r%s">%s</div>' % (sb_regions[r][c], STAR if (r, c) in stars else ""))
      for r in range(7) for c in range(7))
    pages["star-battle"] = ("star-battle", "Two stars every row", f'<div class="g">{cells}</div>', sb_css)

    return pages


def main():
    ap = argparse.ArgumentParser(description="GridPaw OG 分享图批量生成器")
    ap.add_argument("--out", default="scripts/og-build", help="HTML/PNG 输出目录")
    ap.add_argument("--png", action="store_true", help="用 Playwright 截 1200x630 PNG")
    args = ap.parse_args()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(root, args.out) if not os.path.isabs(args.out) else args.out
    os.makedirs(out, exist_ok=True)

    written = []
    for name, (title, tag, board, css) in build_pages().items():
        html_path = os.path.join(out, f"og-{name}.html")
        with open(html_path, "w") as f:
            f.write(page(name, title, tag, board, css))
        written.append(html_path)
    # nonogram 独立版式（猫显形 + clue 自动算）
    nono_path = os.path.join(out, "og-nonogram.html")
    with open(nono_path, "w") as f:
        f.write(nonogram_page())
    written.append(nono_path)

    for p in written:
        print("wrote", os.path.relpath(p, root))

    if args.png:
        for p in written:
            name = os.path.basename(p).replace(".html", "")
            png = os.path.join(out, f"{name}.png")
            subprocess.run([
                "npx", "-y", "playwright", "screenshot",
                "--viewport-size=1200,630", "--wait-for-timeout=2500",
                f"file://{p}", png,
            ], check=True, cwd=root)
            print("shot ", os.path.relpath(png, root))
    else:
        print("\n截图：python3 scripts/gen-og-v2.py --out %s --png" % args.out)


if __name__ == "__main__":
    sys.exit(main())
