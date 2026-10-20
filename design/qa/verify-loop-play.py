#!/Users/frank/.hermes/venvs/webapp-testing/bin/python3
"""/the-loop-puzzle/ 可玩版验收：lattice 渲染、边切换、违规提示、hint→win 路径、打点、移动端 390px 溢出、零控制台错误。"""
import json, subprocess, time, sys
from playwright.sync_api import sync_playwright

DIST = "/Users/frank/workspace/gridpaw/dist"
PORT = 4174
URL = f"http://127.0.0.1:{PORT}/the-loop-puzzle/"
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
with sync_playwright() as p:
    browser = p.chromium.launch()

    # ---------- 桌面 1280 ----------
    pg = browser.new_page(viewport={"width": 1280, "height": 900})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.add_init_script(INIT)
    pg.goto(URL, wait_until="networkidle")
    pg.wait_for_timeout(800)

    report["lattice_children"] = pg.locator("#lp-board > div").count()
    report["clickable_edges"] = pg.locator("#lp-board .lh, #lp-board .lv").count()
    report["clue_cells"] = pg.locator("#lp-board .lcell").count()
    report["clues_with_numbers"] = pg.evaluate("[...document.querySelectorAll('#lp-board .lcell')].filter(e=>e.textContent.trim()).length")
    report["board_width"] = pg.evaluate("document.getElementById('lp-board').getBoundingClientRect().width")
    report["main_width"] = pg.evaluate("document.querySelector('main.seo-section').getBoundingClientRect().width")
    report["h1"] = pg.locator("h1").inner_text()
    report["faq_details"] = pg.locator("details").count()

    # 边点击切换 on/off
    first_edge = pg.locator("#lp-board .lh").first
    first_edge.click()
    pg.wait_for_timeout(120)
    on_after_click = pg.evaluate("document.querySelectorAll('#lp-board .on').length")
    first_edge.click()
    pg.wait_for_timeout(120)
    on_after_unclick = pg.evaluate("document.querySelectorAll('#lp-board .on').length")
    report["edge_toggle"] = [on_after_click, on_after_unclick]
    report["first_move_event"] = pg.evaluate("window.__events.map(e=>e[0])")

    # 违规：3 边交汇于一点 → 红闪 + 提示
    pg.evaluate("""() => {
      const SE = window.SlitherEngine, N = 5;
      const edges = [SE.hIdx(N,N,2,1), SE.hIdx(N,N,2,2), SE.vIdx(N,N,1,2)];
      for (const ei of edges) document.querySelector(`#lp-board [data-ei="${ei}"]`).click();
    }""")
    pg.wait_for_timeout(200)
    report["violation_msg"] = pg.locator("#lp-msg").inner_text()[:60]
    pg.wait_for_timeout(900)  # 等 flash 退
    pg.evaluate("document.getElementById('lp-reset').click()")
    pg.wait_for_timeout(300)

    # Hint 连点到 win（每条 hint 修正一条边）
    win_shown = False
    for i in range(70):
        pg.evaluate("document.getElementById('lp-hint').click()")
        pg.wait_for_timeout(40)
        if pg.locator("#lp-win.show").count() > 0:
            win_shown = True
            break
    report["win_via_hints"] = win_shown
    report["hint_clicks_to_win"] = i + 1
    report["win_text"] = pg.locator("#lp-win").inner_text()[:80] if win_shown else ""
    report["events"] = pg.evaluate("window.__events.map(e=>e[0])")
    pg.screenshot(path=f"{OUT}/loop_desktop.png", full_page=False)
    pg.close()

    # ---------- 移动 390 ----------
    pm = browser.new_page(viewport={"width": 390, "height": 844})
    merr = []
    pm.on("pageerror", lambda e: merr.append(str(e)))
    pm.goto(URL, wait_until="networkidle")
    pm.wait_for_timeout(800)
    report["m_scroll_width"] = pm.evaluate("document.documentElement.scrollWidth")
    report["m_lattice_width"] = pm.evaluate("document.getElementById('lp-board').getBoundingClientRect().width")
    report["m_lattice_left_right"] = pm.evaluate("(() => { const r = document.getElementById('lp-board').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; })()")
    # 移动端点击切换
    pm.locator("#lp-board .lh").first.click()
    pm.wait_for_timeout(150)
    report["m_edge_on"] = pm.evaluate("document.querySelectorAll('#lp-board .on').length")
    pm.screenshot(path=f"{OUT}/loop_mobile.png", full_page=False)
    report["m_errors"] = merr
    pm.close()
    report["d_errors"] = errors

    browser.close()

server.terminate()
print(json.dumps(report, indent=1, ensure_ascii=False))
ok = (report["lattice_children"] == 121 and report["clickable_edges"] == 60
      and report["win_via_hints"] and report["edge_toggle"] == [1, 0]
      and report["m_scroll_width"] <= 392 and not errors and not merr
      and report["clues_with_numbers"] > 0 and report["faq_details"] == 6)
print("RESULT:", "ALL GREEN" if ok else "CHECK FAILED ITEMS")
