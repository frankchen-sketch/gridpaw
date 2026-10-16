#!/Users/frank/.hermes/venvs/webapp-testing/bin/python3
import subprocess, time, sys, json
from playwright.sync_api import sync_playwright
DIST="/Users/frank/workspace/gridpaw/dist"; PORT=4175
URL=f"http://127.0.0.1:{PORT}/meowdoku-guide/"
srv=subprocess.Popen([sys.executable,"-m","http.server",str(PORT),"--bind","127.0.0.1"],cwd=DIST,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1)
out={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for label, vw in [("desktop",1280),("mobile",390)]:
        pg=b.new_page(viewport={"width":vw,"height":900})
        pg.goto(URL, wait_until="networkidle")
        out[label]=pg.evaluate("""() => {
          const board=document.getElementById('pboard').getBoundingClientRect();
          const cells=document.querySelectorAll('#pboard .pc');
          const first=cells[0].getBoundingClientRect(), last=cells[5].getBoundingClientRect();
          const trackL=first.left-board.left, trackR=board.right-last.right;
          return {boardW:Math.round(board.width), gapLeft:Math.round(trackL), gapRight:Math.round(trackR),
                  centered:Math.abs(trackL-trackR)<=1, scrollOK:document.documentElement.scrollWidth<=window.innerWidth};
        }""")
        if label=="desktop":
            pg.locator("#playwrap").scroll_into_view_if_needed()
            pg.locator("#playwrap").screenshot(path="/tmp/meow-play-desktop-el.png")
        pg.close()
    b.close()
srv.terminate()
print(json.dumps(out, indent=1))
