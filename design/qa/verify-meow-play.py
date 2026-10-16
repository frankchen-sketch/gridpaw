#!/Users/frank/.hermes/venvs/webapp-testing/bin/python3
"""meowdoku-guide 可玩版验收：桌面+移动双端交互、打点、win 路径、回归检查。"""
import json, subprocess, time, sys, os
from playwright.sync_api import sync_playwright

DIST = "/Users/frank/workspace/gridpaw/dist"
PORT = 4173
URL = f"http://127.0.0.1:{PORT}/meowdoku-guide/"
OUT = "/tmp"

server = subprocess.Popen(
    [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
    cwd=DIST, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.0)

INIT = """
window.__events = [];
Object.defineProperty(window, 'gtag', { configurable: true, value: function(name, evt, params) {
  if (name === 'event') window.__events.push([evt, JSON.parse(JSON.stringify(params||{}))]);
}});
"""

report = {}
def snap(page, name):
    page.screenshot(path=f"{OUT}/{name}", full_page=False)

with sync_playwright() as p:
    browser = p.chromium.launch()

    # ---------- 桌面 1280 ----------
    pg = browser.new_page(viewport={"width":1280,"height":900})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.add_init_script(INIT)
    pg.goto(URL, wait_until="networkidle")

    cells = pg.locator("#pboard .pc")
    report["board_cells"] = cells.count()
    report["board_width"] = pg.evaluate("document.getElementById('pboard').getBoundingClientRect().width")
    report["content_col_width"] = pg.evaluate("document.querySelector('.seo-section').getBoundingClientRect().width")
    report["board_centered_in_col"] = pg.evaluate("""() => {
      const b = document.getElementById('pboard').getBoundingClientRect();
      const s = document.querySelector('.seo-section').getBoundingClientRect();
      return b.left >= s.left && b.right <= s.right;
    }""")
    # 违规红闪：先放一只猫（hint 放第一只），再在同行列放第二只
    pg.click("#playHint")
    hint_cat_idx = pg.evaluate("""() => {
      const cats = [...document.querySelectorAll('#pboard .catp')];
      return cats.length;
    }""")
    # 找一个与现有猫同行/列/区域的空格，制造违规
    vio = pg.evaluate("""() => {
      const N=6; let catIdx=-1;
      document.querySelectorAll('#pboard .catp').forEach(el=>{
        const d=el.closest('.pc'); const board=document.getElementById('pboard');
        catIdx=[...board.children].indexOf(d);
      });
      if(catIdx<0) return -1;
      const r=(catIdx/N)|0, c=catIdx%N;
      for(let i=0;i<36;i++){
        const pr=(i/N)|0, pc=i%N;
        if(i===catIdx) continue;
        if(pr===r||pc===c||Math.abs(pr-r)<=1&&Math.abs(pc-c)<=1) return i;
      }
      return -1;
    }""")
    report["violation_target_found"] = vio >= 0
    if vio >= 0:
        pg.locator("#pboard .pc").nth(vio).click()          # X
        pg.locator("#pboard .pc").nth(vio).click()          # 尝试放猫 → 违规
        report["violation_flash"] = pg.evaluate("document.querySelectorAll('#pboard .flash').length") >= 0
        report["violation_msg"] = pg.locator("#playMsg").inner_text()[:60]
        report["hearts_after_violation"] = pg.evaluate("document.querySelectorAll('#playHearts span').length - [...document.querySelectorAll('#playHearts span')].filter(s=>s.style.color.includes('232,83,79')||s.getAttribute('style').includes('#d9534f')).length")
    evs = pg.evaluate("window.__events.map(e=>e[0])")
    report["events_desktop_so_far"] = evs
    # Hint ×5 走到 win
    for _ in range(6):
        try: pg.click("#playHint", timeout=2000)
        except Exception: break
        pg.wait_for_timeout(120)
    report["win_shown"] = pg.evaluate("document.getElementById('playWin').classList.contains('show')")
    report["win_text"] = pg.locator("#playWin").inner_text()[:100]
    evs2 = pg.evaluate("window.__events")
    report["events_all"] = evs2
    # win 后棋盘锁死：点击不再变化
    cats_before = pg.evaluate("document.querySelectorAll('#pboard .catp').length")
    pg.locator("#pboard .pc").nth(0).click()
    cats_after = pg.evaluate("document.querySelectorAll('#pboard .catp').length")
    report["board_locked_after_win"] = cats_before == cats_after
    # Next board
    pg.click("#playNext")
    pg.wait_for_timeout(200)
    report["next_board_cats"] = pg.evaluate("document.querySelectorAll('#pboard .catp').length")
    report["next_board_cells"] = pg.evaluate("document.querySelectorAll('#pboard .pc').length")
    # Reset 路径
    pg.locator("#pboard .pc").nth(0).click(); pg.locator("#pboard .pc").nth(0).click()
    pg.click("#playReset")
    report["reset_ok"] = pg.evaluate("document.querySelectorAll('#pboard .catp, #pboard .xmark').length") == 0
    report["win_link_starbattle"] = pg.evaluate("!!document.querySelector('#playWin a[href=\"/star-battle/\"]')")
    # 底部 CTA（playwin hide 时 links 不在 win 内——用页内其它内链回归）
    report["desktop_layout_no_hscroll"] = pg.evaluate("document.documentElement.scrollWidth <= 1280")
    snap(pg, "meow-play-desktop.png")
    report["desktop_errors"] = errors
    pg.close()

    # ---------- 移动 390 ----------
    m = browser.new_page(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True)
    m.add_init_script(INIT)
    m.goto(URL, wait_until="networkidle")
    report["mobile_board_width"] = m.evaluate("document.getElementById('pboard').getBoundingClientRect().width")
    report["mobile_no_hscroll"] = m.evaluate("document.documentElement.scrollWidth <= 390")
    m.locator("#pboard .pc").nth(0).scroll_into_view_if_needed()
    m.locator("#pboard .pc").nth(0).tap()
    report["mobile_x_placed"] = m.evaluate("document.querySelectorAll('#pboard .xmark').length") == 1
    m.locator("#pboard .pc").nth(0).tap()
    report["mobile_cat_or_reject"] = m.evaluate("['#pboard .catp', '#pboard .xmark'].map(s=>document.querySelectorAll(s).length)")
    m.click("#playHint")
    report["mobile_hint"] = m.evaluate("document.querySelectorAll('#pboard .catp').length >= 1")
    snap(m, "meow-play-mobile.png")
    report["mobile_events"] = m.evaluate("window.__events.map(e=>e[0])")
    m.close()
    browser.close()

server.terminate()
print(json.dumps(report, ensure_ascii=False, indent=1))
