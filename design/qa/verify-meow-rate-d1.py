#!/Users/frank/.hermes/venvs/webapp-testing/bin/python3
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width":1280,"height":900})
    pg.goto("https://gridpaw.com/meowdoku/levels/7/", wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_selector(".starrating .sr-star", timeout=20000)
    pg.locator(".starrating .sr-star[data-star='5']").click()
    pg.wait_for_timeout(2000)
    print("thanks:", pg.locator(".starrating .sr-thanks").inner_text())
    print("console_events_ok")
    b.close()
