#!/usr/bin/env python3
"""Generate the German BP3 hub: src/pages/de/brain-puzzle-3-answers/index.astro

Mirrors the English hub that shipped today (same CSS, same card anatomy) so the
German tree has one crawlable "alle Level" page instead of 137 links stuffed into
the /de/ paragraph. Adds a client-side filter (level number or scene name) and
range chips — the German scene names are what people actually remember.

Copy is German; every claim about verification tiers matches what the level pages
say (A: two independent walkthroughs, B: scene confirmed / moves differ, C: single
source with the video as referee).
"""
import glob
import json
import os
import re
import sys

REPO = '/Users/frank/workspace/gridpaw'
DATA = os.path.join(REPO, 'scripts/bp3/data')
OUT = os.path.join(REPO, 'src/pages/de/brain-puzzle-3-answers/index.astro')
EN_HUB = os.path.join(REPO, 'src/pages/brain-puzzle-3-answers/index.astro')

src = json.load(open(os.path.join(DATA, 'de_src.json')))
de = {}
for f in sorted(glob.glob(os.path.join(DATA, 'de_out', 'b*.json'))):
    de.update(json.load(open(f)))
plan = json.load(open(os.path.join(DATA, 'level_plan_2026-11-08.json')))['levels']


def flat(v):
    if isinstance(v, dict):
        w = (v.get('what_de') or v.get('what') or '').strip()
        y = (v.get('why_de') or v.get('why') or '').strip()
        return (w.rstrip('.') + '. ' + y) if y else w
    return str(v)


def esc(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def short_title(goal):
    """Card title for the hand-written levels 1-30: they have no scene name, so the
    goal sentence is what the player recognises — trimmed to fit two lines."""
    g = re.sub(r'\s+', ' ', (goal or '')).strip().rstrip('.')
    if not g:
        return ''
    if len(g) <= 92:
        return g
    return g[:92].rsplit(' ', 1)[0].rstrip(',;:-') + ' …'


EN_IMG = {}
_h = open(EN_HUB).read() if os.path.exists(EN_HUB) else ''
for _m in re.finditer(r'<a class="level-card" href="/brain-puzzle-3-level-(\d+)/">\s*<img class="thumb" src="([^"]+)"', _h):
    EN_IMG[int(_m.group(1))] = _m.group(2)


def img_for(n):
    """Reuse the English hub's level -> screenshot mapping: those 137 files are the
    verified set (a few levels share a scene image under the video's numbering), so
    the German grid shows the same picture per level instead of a hole."""
    if n in EN_IMG:
        return EN_IMG[n]
    for cand in (f'l{n}_hero.jpg', f's{n}.jpg', f'l{n}_step1.jpg'):
        if os.path.exists(os.path.join(REPO, 'public/brain-puzzle-3', cand)):
            return f'/brain-puzzle-3/{cand}'
    return None


def legacy_de(n):
    """Levels 1-30 are hand-written German pages with per-step screenshots and no
    translation JSON. Pull the goal and step count out of those files so the hub
    does not fall back to placeholder text."""
    path = os.path.join(REPO, 'src/pages/de', f'brain-puzzle-3-level-{n}.astro')
    if not os.path.exists(path):
        return None
    h = open(path).read()
    m = re.search(r'<h1>Brain Puzzle 3 Level \d+ Lösung: (.*?)</h1>', h, re.S)
    goal = re.sub(r'\s+', ' ', m.group(1)).strip() if m else ''
    return {'name_de': '', 'goal_de': goal,
            'steps_de': ['x'] * len(re.findall(r'class="step-num"', h))}


SCENE_DE = {
    1: 'Schnellziehen', 2: 'Winterwärme', 3: 'Schöne Dame', 4: 'Der Direktor kommt',
    5: 'Gruseliges Riesenrad', 6: 'Badezimmer reparieren', 7: 'Wunsch der Geister',
    8: 'Im Aufzug gefangen', 9: 'Leckere Hotdogs', 10: 'Flucht aus dem Büro',
    11: 'Tür beim Online-Date', 12: 'Überlasteter Aufzug', 13: 'Mama kommt nach Hause',
    14: 'Wurstlippen-SOS', 15: 'Spanner vor der Tür', 16: 'Dicker Kopf',
    17: 'Cooles Mädchenwohnheim', 18: 'Zombie-Spaziergang', 19: 'Finde sie alle',
    20: 'Schneller öffnen', 21: 'Fremdgeh-Szene', 22: 'Kaffee-Meister',
    23: 'Geburtstagsüberraschung', 24: 'Hoch auf dem Turm', 25: 'Fallschirm-Notfall',
    26: 'Zombiekrise', 27: 'Farbe abreiben', 28: 'Geisterklinik',
    29: 'Verfolgung durch den Sensenmann', 30: 'Masken ab',
}
"""Scene names for levels 1-30. Those levels have no translation JSON (hand-written
German pages), so the hub had been falling back to a truncated goal sentence — the
only cards that looked different from 31+. Names mirror the English hub labels
(`src/pages/brain-puzzle-3-answers/`) in the same style as the 31+ `name_de` values."""


levels = []
for n in range(1, 138):
    k = str(n)
    d = de.get(k) or src.get(k) or legacy_de(n) or {}
    steps = [flat(s) for s in (d.get('steps_de') or d.get('steps') or [])]
    steps = [s for s in steps if s]
    p = plan.get(k) or {}
    xc = p.get('xcheck') or {}
    if xc.get('sg_goal', 0) >= 0.6 and xc.get('sg_f1', 0) >= 0.3:
        tier = 'A'
    elif xc.get('sg_goal', 0) >= 0.5 or xc.get('overlap', 0) >= 0.5:
        tier = 'B'
    else:
        tier = 'C'
    levels.append({
        'n': n,
        'name': d.get('name_de') or SCENE_DE.get(n) or short_title(d.get('goal_de')) or 'Brain Puzzle 3',
        'goal': (d.get('goal_de') or '').strip(),
        'steps': len(steps),
        'video': bool((src.get(k) or {}).get('video')),
        'img': img_for(n),
        'tier': tier,
    })

tier_a = sum(1 for L in levels if L['tier'] == 'A')
tier_full = sum(1 for L in levels if len(L['goal']) > 0)

cards = ''
for L in levels:
    img = (f'<img class="thumb" src="{L["img"]}" alt="Brain Puzzle 3 Level {L["n"]}: {esc(L["name"])}" '
           f'loading="lazy" width="168" height="105">' if L['img'] else
           '<div class="thumb ph" aria-hidden="true"></div>')
    meta = f'{L["steps"]} Schritte' + (f' · Video' if L['video'] else '')
    cards += (f'    <a class="level-card" href="/de/brain-puzzle-3-level-{L["n"]}/" '
              f'data-name="{esc(L["name"].lower())}" data-n="{L["n"]}" data-r="{L["tier"]}">\n'
              f'      {img}\n'
              f'      <div class="meta">\n'
              f'        <span class="lvl">Level {L["n"]}</span>\n'
              f'        <strong class="name">{esc(L["name"])}</strong>\n'
              f'        <p class="goal">{esc(meta)}</p>\n'
              f'      </div>\n    </a>\n')

faq = [
    ['Was ist Brain Puzzle 3: Crazy Mind?',
     'Brain Puzzle 3: Crazy Mind ist ein kostenloses Denkspiel von Joygame mit kurzen, '
     'storyhaften Szenen: In jedem Level tippst, ziehst oder wischst du das richtige Objekt an '
     'die richtige Person und löst damit ein Mini-Rätsel. Es ist der dritte Teil der Reihe, '
     'nach Tricky Quest und Logic Twist.'],
    ['Wie viele Level hat Brain Puzzle 3?',
     'Zum Start waren es deutlich über hundert Story-Level, und mit Updates kommen weitere dazu. '
     'Diese Seite deckt Level 1 bis 137 ab. Wo unter derselben Level-Nummer zwei verschiedene '
     'Szenen im Umlauf sind, behandelt die jeweilige Lösungsseite beide Fälle.'],
    ['Ist Brain Puzzle 3 kostenlos?',
     'Ja, Brain Puzzle 3 ist kostenlos für iOS und Android erhältlich und finanziert sich über '
     'Werbung. Hinweise lassen sich per Werbevideo freischalten, aber jede Lösung hier ist so '
     'geschrieben, dass du ohne Hinweis auskommst.'],
    ['Warum stimmt mein Level nicht mit der Nummer überein?',
     'Die Level-Nummern sind nicht bei allen Installationen identisch: Spieler berichten '
     'dieselbe Szene unter verschiedenen Nummern, und die Walkthrough-Videos von Dritten sind '
     'oft anders nummeriert. Deshalb nennt jede Seite den Zielsatz der Szene (“Hilf …”) — such '
     'danach, nicht nach der Zahl.'],
]
faq_json = {'@context': 'https://schema.org', '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': q,
                            'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]}
faq_html = ''.join(f'    <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>\n'
                   for q, a in faq)

en = open(EN_HUB).read()
style = re.search(r'<style is:global>(.*?)</style>', en, re.S).group(1)
EXTRA_CSS = """
.filter-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:1.2rem 0 1rem}
.filter-input{flex:1;min-width:220px;font:inherit;font-size:0.95rem;padding:0.65rem 0.9rem;
  border:1.5px solid #e8dcc8;border-radius:12px;background:#fff;color:#2b2118}
.filter-input:focus{outline:2px solid #D97706;outline-offset:1px}
.chip{font:inherit;font-size:0.82rem;font-weight:800;padding:0.4rem 0.75rem;border-radius:999px;
  border:1.5px solid #efdcc0;background:#fff8ec;color:#8a5a12;cursor:pointer}
.chip[aria-pressed="true"]{background:#D97706;border-color:#D97706;color:#fff}
.filter-count{font-size:0.85rem;color:#8a7561;margin:0 0 0.8rem}
.level-card.hide{display:none}
.level-card .thumb{aspect-ratio:168/105;height:auto;object-fit:cover;display:block}
.level-card .name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.62em}
.chip:hover{border-color:#D97706;color:#8a5a12}
.thumb.ph{display:block;width:100%;aspect-ratio:168/105;background:repeating-linear-gradient(45deg,#f3ece1,#f3ece1 8px,#efe6d8 8px,#efe6d8 16px)}
"""

HTML = f'''---
import SEOHead from '../../../components/SEOHead.astro';
import GameNav from '../../../components/GameNav.astro';
import AdSlot from '../../../components/AdSlot.astro';
import SideAd from '../../../components/SideAd.astro';

const title = "Brain Puzzle 3: Alle Lösungen (Level 1-137)";
const description = "Brain Puzzle 3 Lösung für jedes Level: Zugfolge, Videowalkthrough und die richtige Geste. Alle 137 Level auf Deutsch, inoffizieller Fan-Leitfaden.";
const faqJsonLd = {json.dumps(faq_json, ensure_ascii=False)};
---
<!DOCTYPE html>
<html lang="de">
<head>
  <SEOHead
    title={{title}}
    description={{description}}
    canonical="/de/brain-puzzle-3-answers/"
    type="article"
    breadcrumbTitle="Brain Puzzle 3 Lösungen"
  />
  <link rel="alternate" hreflang="de" href="https://gridpaw.com/de/brain-puzzle-3-answers/" />
  <link rel="alternate" hreflang="en" href="https://gridpaw.com/brain-puzzle-3-answers/" />
  <link rel="alternate" hreflang="x-default" href="https://gridpaw.com/brain-puzzle-3-answers/" />
  <script type="application/ld+json" set:html={{JSON.stringify(faqJsonLd)}} />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style is:global>{style}{EXTRA_CSS}</style>
</head>
<body>
  <GameNav />
  <nav class="breadcrumb" aria-label="Brotkrumen"><a href="/de/">GridPaw</a> &gt; Brain Puzzle 3 Lösungen</nav>

  <main class="seo-section">
    <h1>Brain Puzzle 3: Lösung für jedes Level</h1>

    <div class="disclaimer">Inoffizieller Fan-Leitfaden. Nicht mit dem Entwickler von Brain Puzzle 3 verbunden.</div>

    <p>Hier stehen alle {len(levels)} Level von <strong>Brain Puzzle 3: Crazy Mind</strong> auf Deutsch: die Zugfolge in der richtigen Reihenfolge, ein Videowalkthrough und ein Hinweis darauf, welche Geste der jeweilige Zug braucht — Ziehen, Tippen oder Wischen. Jede Seite nennt außerdem den Zielsatz der Szene, weil die Level-Nummern je nach Installation abweichen.</p>

    <p>Die Zugfolgen sind gegen eine zweite, unabhängige Komplettlösung abgeglichen, wo es eine gibt ({tier_a} von {len(levels)} Leveln). Wo nur eine Quelle vorliegt, sagt die Seite das offen und verweist auf das Video als Schiedsrichter.</p>

    <div class="filter-bar">
      <input class="filter-input" id="bp3-filter" type="search" placeholder="Level oder Szene suchen …" aria-label="Level suchen">
      <button class="chip" type="button" data-range="all" aria-pressed="true">Alle {len(levels)}</button>
      <button class="chip" type="button" data-range="1-30" aria-pressed="false">1–30</button>
      <button class="chip" type="button" data-range="31-60" aria-pressed="false">31–60</button>
      <button class="chip" type="button" data-range="61-100" aria-pressed="false">61–100</button>
      <button class="chip" type="button" data-range="101-137" aria-pressed="false">101–137</button>
    </div>
    <p class="filter-count" id="bp3-count">{len(levels)} von {len(levels)} Leveln</p>

    <div class="level-grid">
{cards}    </div>

    <AdSlot />

    <h2>Häufige Fragen<span class="accent">.</span></h2>
{faq_html}
    <div class="cta-box">
      <p>Mehr zu GridPaw? <a href="/de/">Alle Logikrätsel auf Deutsch →</a></p>
      <p><a href="/">Shikaku spielen →</a> · <a href="/akari/">Akari spielen →</a> · <a href="/japanese-logic-puzzles/">Mehr japanische Logikrätsel →</a></p>
    </div>
  </main>
  <SideAd />

  <script is:inline>
    (function () {{
      var input = document.getElementById('bp3-filter');
      var count = document.getElementById('bp3-count');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.level-card'));
      var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
      if (!input || !cards.length) return;
      var range = 'all';
      function apply() {{
        var q = input.value.trim().toLowerCase();
        var lo = 0, hi = 999;
        if (range !== 'all') {{ var parts = range.split('-'); lo = +parts[0]; hi = +parts[1]; }}
        var shown = 0;
        cards.forEach(function (c) {{
          var n = +c.dataset.n;
          var hit = (range === 'all' || (n >= lo && n <= hi)) &&
                    (!q || c.dataset.name.indexOf(q) !== -1 || String(n) === q || ('level ' + n === q));
          c.classList.toggle('hide', !hit);
          if (hit) shown++;
        }});
        count.textContent = shown + ' von {len(levels)} Leveln';
      }}
      input.addEventListener('input', apply);
      chips.forEach(function (chip) {{
        chip.addEventListener('click', function () {{
          range = chip.dataset.range;
          chips.forEach(function (o) {{ o.setAttribute('aria-pressed', o === chip ? 'true' : 'false'); }});
          apply();
        }});
      }});
    }})();
  </script>
</body>
</html>
'''

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w') as f:
    f.write(HTML)
print(f'wrote {OUT} {len(HTML)} bytes | cards {len(levels)} | tierA {tier_a} | images {sum(1 for L in levels if L["img"])}')
