#!/Users/frank/.hermes/venvs/webapp-testing/bin/python3
import subprocess, time, sys, json
from playwright.sync_api import sync_playwright
DIST="/Users/frank/workspace/gridpaw/dist"; PORT=4174
URL=f"http://127.0.0.1:{PORT}/meowdoku-guide/"
srv=subprocess.Popen([sys.executable,"-m","http.server",str(PORT),"--bind","127.0.0.1"],cwd=DIST,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1)
out={}
with sync_playwright() as p:
    b=p.chromium.launch()
    m=b.new_page(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True)
    m.goto(URL, wait_until="networkidle")
    out["metrics"]=m.evaluate("""() => {
      const b=document.getElementById('pboard').getBoundingClientRect();
      const cell=document.querySelector('#pboard .pc');
      const cs=getComputedStyle(document.getElementById('pboard'));
      return {board:{l:b.left,r:b.right,w:b.width}, cellW:cell.getBoundingClientRect().width,
              gridCols:cs.gridTemplateColumns, scrollW:document.documentElement.scrollWidth,
              innerW:window.innerWidth, dpr:window.devicePixelRatio};
    }""")
    m.locator("#playwrap").scroll_into_view_if_needed()
    m.locator("#playwrap").screenshot(path="/tmp/meow-play-mobile-el.png")
    # 手机端实际显示宽度=innerW，若有缩放 rect 仍是 CSS px
    m.close(); b.close()
srv.terminate()
print(json.dumps(out["metrics"], indent=1))
