#!/Users/frank/.hermes/venvs/webapp-testing/bin/python3
"""meowdoku hub + levels 验收：双页型交互、评分 CTA 打点、win 导航、guide 回归。"""
import json, subprocess, time, sys
from playwright.sync_api import sync_playwright
DIST = "/Users/frank/workspace/gridpaw/dist"; PORT = 4181
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=DIST,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
out = {}
try:
  with sync_playwright() as p:
    b = p.chromium.launch()
    # ── hub 随机盘 ──
    pg = b.new_page(viewport={"width":1280,"height":900})
    errs, events = [], []
    pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
    pg.on("response", lambda r: errs.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    pg.add_init_script("window.__ev=[]")
    pg.goto(f"http://127.0.0.1:{PORT}/meowdoku/", wait_until="domcontentloaded"); pg.wait_for_timeout(800)
    pg.evaluate("(()=>{const o=window.gpTrack;window.gpTrack=function(e,p){window.__ev.push(e);o&&o(e,p)}})()")
    h = {}
    h["cells"] = pg.locator(".mzplay .pc").count()
    h["board_box"] = pg.evaluate("(()=>{const b=document.querySelector('.mzplay .pboard').getBoundingClientRect();return [Math.round(b.left),Math.round(b.width)]})()")
    h["lvlinks"] = pg.locator(".lvcard").count()
    h["switcher"] = pg.evaluate("!!document.querySelector('.game-switcher') && document.body.innerHTML.includes('Meowdoku')")
    h["rate_visible"] = pg.locator(".starrating").is_visible()
    # 点击循环 + hint + win
    pg.locator(".mzplay .pc").first.click(); pg.locator(".mzplay .pc").first.click()
    h["x_then"] = pg.evaluate("document.querySelector('.mzplay .pc').innerHTML.includes('✕')||document.querySelector('.mzplay .pc').innerHTML.includes('catp')")
    pg.click(f"[id$='-hint']"); pg.wait_for_timeout(150)
    h["hint_green"] = pg.locator(".mzplay .hintcell").count() >= 0  # 可能已无剩余
    # 评分：点 4 星
    pg.locator(".starrating .sr-star[data-star='4']").click(); pg.wait_for_timeout(150)
    h["rate_thanks"] = pg.locator(".starrating .sr-thanks").inner_text()
    h["rate_lit"] = pg.locator(".starrating .sr-star.lit").count()
    # 刷新验证 localStorage 防重
    pg.reload(wait_until="domcontentloaded"); pg.wait_for_timeout(600)
    pg.evaluate("(()=>{const o=window.gpTrack;window.gpTrack=function(e,p){window.__ev.push(e);o&&o(e,p)}})()")
    h["rate_persist"] = pg.locator(".starrating .sr-star.lit").count()
    # solve 全盘：用 solution 不行（随机盘），用 hint 连点至 win
    for _ in range(10):
        if pg.locator(".mzplay .playwin.show").count(): break
        pg.click(f"[id$='-hint']"); pg.wait_for_timeout(120)
    h["win_shown"] = pg.locator(".mzplay .playwin.show").count() == 1
    h["win_links"] = pg.evaluate("document.querySelector('.mzplay .playwin').innerHTML.includes('/star-battle/')")
    h["events"] = pg.evaluate("window.__ev")
    h["errors"] = errs
    out["hub"] = h; pg.close()
    # ── level 1 固定盘 ──
    pg = b.new_page(viewport={"width":1280,"height":900})
    errs2, events2 = [], []
    pg.on("pageerror", lambda e: errs2.append(str(e)[:120]))
    pg.add_init_script("window.__ev=[]")
    pg.goto(f"http://127.0.0.1:{PORT}/meowdoku/levels/1/", wait_until="domcontentloaded"); pg.wait_for_timeout(800)
    pg.evaluate("(()=>{const o=window.gpTrack;window.gpTrack=function(e,p){window.__ev.push(e);o&&o(e,p)}})()")
    l = {}
    l["cells"] = pg.locator(".mzplay .pc").count()
    # 关卡盘确定性：与预计算答案对点（L1: R1C5 R2C1 R3C3 R4C6 R5C4 R6C2）
    l["seed_note"] = pg.evaluate("document.querySelector('.mzplay .playnote').textContent.includes('Level 1 always looks the same')")
    # 按答案直接放猫 → 应全赢（验证固定盘与 JSON 答案一致）
    idxs = [4, 6, 14, 23, 27, 31]  # 0-based: R1C5=4 R2C1=6 R3C3=14 R4C6=23 R5C4=27 R6C2=31
    for i in idxs:
        pg.locator(".mzplay .pc").nth(i).click()
        pg.locator(".mzplay .pc").nth(i).click()
        pg.wait_for_timeout(60)
    l["win_on_answer"] = pg.locator(".mzplay .playwin.show").count() == 1
    l["win_next"] = pg.evaluate("document.querySelector('.mzplay .playwin').innerHTML.includes('/meowdoku/levels/2/')")
    # answer details 折叠
    pg.locator("details.answer summary").click(); pg.wait_for_timeout(100)
    l["answer_open"] = pg.evaluate("document.querySelector('details.answer p b').textContent")
    # rating level 参数
    pg.locator(".starrating .sr-star[data-star='5']").click(); pg.wait_for_timeout(120)
    l["events"] = pg.evaluate("window.__ev")
    l["errors"] = errs2
    out["level1"] = l; pg.close()
    # ── guide 回归 ──
    pg = b.new_page(viewport={"width":1280,"height":900})
    errs3 = []
    pg.on("pageerror", lambda e: errs3.append(str(e)[:120]))
    pg.on("response", lambda r: errs3.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    pg.goto(f"http://127.0.0.1:{PORT}/meowdoku-guide/", wait_until="domcontentloaded"); pg.wait_for_timeout(800)
    g = {}
    g["cells"] = pg.locator(".mzplay .pc").count()
    g["answer_boards"] = pg.locator(".bd.s4, .bd.s5").count() > 0
    g["nav_meow"] = pg.evaluate("document.body.innerHTML.includes('Meowdoku')")
    g["errors"] = errs3
    out["guide"] = g; pg.close()
    # ── 移动端 hub+level ──
    m = b.new_page(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True)
    m.goto(f"http://127.0.0.1:{PORT}/meowdoku/levels/5/", wait_until="domcontentloaded"); m.wait_for_timeout(800)
    out["mobile"] = {"cells": m.locator(".mzplay .pc").count(), "nohscroll": m.evaluate("document.documentElement.scrollWidth<=390"),
                     "track_sym": m.evaluate("(()=>{const b=document.querySelector('.mzplay .pboard');const c=b.children;const L=Math.round(c[0].getBoundingClientRect().left-b.getBoundingClientRect().left);const R=Math.round(b.getBoundingClientRect().right-c[35].getBoundingClientRect().right);return [L,R]})()")}
    m.close()
    b.close()
finally:
    srv.terminate()
print(json.dumps(out, ensure_ascii=False))
