#!/Users/frank/.hermes/venvs/webapp-testing/bin/python3
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width":1280,"height":900})
    pg.goto("https://gridpaw.com/meowdoku/levels/9/", wait_until="load", timeout=60000)
    pg.wait_for_timeout(2500)  # 等 load 补发 + beacon
    b.close()
print("visited levels/9")
