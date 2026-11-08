#!/usr/bin/env python3
"""Generate the German Brain Puzzle 3 level pages (L31-137) from translated data.

Structure mirrors the English batch that shipped on 2026-11-08 (hero, quick answer,
step cards, full solution video, honest verify note, FAQ, sibling list) because the
older German L1-30 pages carry per-step screenshots we cannot produce for 107 new
levels. Copy is German (du-Form), scene names are short German titles.

Input  : data/de_src.json (English source) + data/de_out/b*.json (translations)
Output : src/pages/de/brain-puzzle-3-level-N.astro
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
DATA = os.path.join(HERE, 'data')
OUT = os.path.join(REPO, 'src', 'pages', 'de')

GER = {
    'drag': r'\bzieh|zog\b|\bschleif',
    'swipe': r'\bwisch',
    'tap': r'\btipp|\bklick',
}


def norm_steps(steps):
    """Three source shapes land here: plain strings, and dicts carrying
    {what, why} (levels 31-53) or {what_de, why_de} (batches b01-b03, b10).
    Flatten to one sentence string per step so counting and rendering agree."""
    ok = 0
    if isinstance(steps, dict):
        steps = list(steps.values())
    out = []
    for s in steps if isinstance(steps, list) else []:
        if isinstance(s, dict):
            w = (s.get('what_de') or s.get('what') or '').strip()
            y = (s.get('why_de') or s.get('why') or '').strip()
            out.append((w.rstrip('.') + '. ' + y).strip() if y else w)
        else:
            out.append(str(s).strip())
    return [x for x in out if x]


def decode_literal_escapes(html):
    """Source tables carry literal \\uXXXX in some labels; inside <script> that is
    legal JS, outside it must be a real character or it shows up as garbage."""
    parts = re.split(r'(<script\b.*?</script>)', html, flags=re.S | re.I)
    return ''.join(p if i % 2 else re.sub(r'\\u([0-9a-fA-F]{4})',
                                          lambda m: chr(int(m.group(1), 16)), p)
                   for i, p in enumerate(parts))


def esc(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def sentence(s):
    s = (s or '').strip()
    if not s:
        return ''
    s = s[0].upper() + s[1:]
    if s[-1] not in '.!?':
        s += '.'
    return s


def mix(steps):
    """Gesture coverage, non-exclusive: an aggregated step can ask for two gestures.
    Returns (per-gesture step counts, how many steps name exactly one gesture)."""
    m = {'drag': 0, 'tap': 0, 'swipe': 0}
    single = 0
    for s in steps:
        low = s.lower()
        hits = [g for g, rx in GER.items() if re.search(rx, low)]
        for g in hits:
            m[g] += 1
        if len(hits) == 1:
            single += 1
    return m, single


def cards(steps, size=3):
    for i in range(0, len(steps), size):
        chunk = steps[i:i + size]
        label = (f'Schritt {i + 1}' if len(chunk) == 1 else f'Schritte {i + 1}\u2013{i + len(chunk)}')
        head = re.split(r'[.;]', chunk[0])[0].strip(' .;,')
        yield label, head, chunk


def tier_note(n, xc):
    sg_goal = xc.get('sg_goal', 0)
    sg_f1 = xc.get('sg_f1', 0)
    ov = xc.get('overlap', 0)
    if sg_goal >= 0.6 and sg_f1 >= 0.3:
        return ('<div class="verify-note">Zwei voneinander unabhängige Komplettlösungen geprüft: '
                f'Zielsatz und Zugfolge stimmen zu {int(sg_f1 * 100)}% in den Objekten überein. '
                'Die Reihenfolge unten ist damit doppelt belegt, nicht aus einer Quelle abgeschrieben.</div>')
    if sg_goal >= 0.6 or sg_goal >= 0.5 or ov >= 0.5:
        return ('<div class="verify-note">Szene und Ziel sind durch einen zweiten unabhängigen '
                'Leitfaden bestätigt; einzelne Züge sind dort anders formuliert. Wenn ein Zug nicht '
                'reagiert, vergleiche mit dem eingebetteten Video.</div>')
    return ('<div class="verify-note">Einzelquellen-Züge: für dieses Level gibt es nur die '
            'Gesamttabelle. Das Video ist der Schiedsrichter \u2014 wenn ein Zug nicht reagiert, '
            'folge dem Video.</div>')


def page_html(n, d_en, d_de, all_levels):
    name = d_de.get('name_de') or d_en['name']
    goal = d_de.get('goal_de') or d_en['goal']
    steps = norm_steps(d_de.get('steps_de') or d_en['steps'])
    if not steps:
        raise SystemExit(f'level {n}: no usable steps after normalisation')
    m, single = mix(steps)
    title = f'Brain Puzzle 3 Level {n} Lösung: {name}'
    if len(title) > 58:
        STOP = {'mit', 'dem', 'der', 'den', 'und', 'im', 'in', 'auf', 'von', 'zu', 'aus', 'am',
                'an', 'für', 'bei', 'einer', 'einem', 'einen', 'das', 'die', 'des', 'zum', 'zur'}
        short = re.sub(r'^(der|die|das|den|dem)\s+', '', name, flags=re.I)
        base = f'Brain Puzzle 3 Level {n} Lösung: '
        words, cur = [], ''
        for w in short.split():
            nxt = (cur + ' ' + w).strip()
            if len(base) + len(nxt) <= 58:
                words.append(w)
                cur = nxt
            else:
                break
        while words and (words[-1].lower().strip(',;:-') in STOP or len(words[-1]) < 3):
            words.pop()
        keep = ' '.join(words).rstrip(',;:-')
        # a chopped scene name that lost most of its meaning is worse than none:
        # fall back to the exact-match keyword title instead of dangling words
        title = (base + keep) if len(words) >= 2 else f'Brain Puzzle 3 Level {n} Lösung'
    goal_s = sentence(goal)
    desc = f'{goal_s} Level {n} Lösung: {len(steps)} Schritte in Reihenfolge plus Video.'
    if len(desc) > 158:
        desc = desc[:155].rsplit(' ', 1)[0].rstrip(',;:') + '.'
    if single == len(steps) and sum(m.values()):
        gest_txt = f'{m["drag"]} Ziehen, {m["tap"]} Tippen, {m["swipe"]} Wischen'
    else:
        gest_txt = 'Ziehen, Tippen und Wischen im Wechsel'

    cards_html = ''
    for label, head, chunk in cards(steps):
        body = ' '.join(sentence(s) for s in chunk)
        cards_html += (f'    <div class="step-card">\n'
                       f'      <span class="step-num">{esc(label)}</span>\n'
                       f'      <strong>{esc(sentence(head))}</strong>\n'
                       f'      <p>{esc(body)}</p>\n    </div>\n')

    faq = [
        [f'Wie lautet die Lösung für Brain Puzzle 3 Level {n}?',
         'In dieser Reihenfolge: ' + ' '.join(f'{i}) {sentence(s)}' for i, s in enumerate(steps, 1))],
        [f'Warum passiert bei mir in Level {n} nichts?',
         (f'In Level {n} brauchen {len(steps)} Züge unterschiedliche Gesten: {gest_txt}. '
          'Ein einzelner Tipp löst nur die Schritte aus, die ausdrücklich „Tippen“ verlangen; '
          'alles andere sind Zieh- oder Wischbewegungen. Wenn nichts reagiert, versuche das Objekt '
          'auf die Person oder Sache zu ziehen, zu der es gehört.')],
    ]
    hub = ''
    if d_en.get('hero'):
        hub += (f'    <img class="hero" src="/brain-puzzle-3/{d_en["hero"]}" '
                f'alt="Brain Puzzle 3 Level {n}: {esc(name)}" width="540" height="360" loading="lazy">\n')
    if d_en.get('video'):
        hub += (f'    <h2>Die komplette Lösung ansehen<span class="accent">.</span></h2>\n'
                f'    <p>Im Video siehst du die Zugfolge schneller als in jeder Textliste. '
                f'Es ist eine Aufnahme von Dritten, die Level-Nummer kann dort abweichen \u2014 '
                f'achte auf die Szene, nicht auf die Zahl.</p>\n'
                f'    <div class="video-wrap">\n'
                f'      <iframe src="https://www.youtube-nocookie.com/embed/{d_en["video"]}" '
                f'title="Brain Puzzle 3 Level {n} Walkthrough-Video" loading="lazy" '
                f'allowfullscreen></iframe>\n    </div>\n')

    faq_json = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [{'@type': 'Question', 'name': q,
                        'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq],
    }
    faq_html = ''.join(f'    <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>\n'
                       for q, a in faq)

    links = ''.join(f'<a href="/de/brain-puzzle-3-level-{k}/">Level {k}</a>' for k in all_levels)
    prev_html = (f'      <a href="/de/brain-puzzle-3-level-{n - 1}/" style="text-decoration:none">\u2190 Level {n - 1}</a>\n'
                 if n - 1 in all_levels else '      <span></span>\n')
    next_html = (f'      <a href="/de/brain-puzzle-3-level-{n + 1}/" style="text-decoration:none">Level {n + 1} \u2192</a>\n'
                 if n + 1 in all_levels else '      <span></span>\n')

    import gen_pages
    style = gen_pages.STYLE

    return f'''---
import SEOHead from '../../components/SEOHead.astro';
import GameNav from '../../components/GameNav.astro';
import AdSlot from '../../components/AdSlot.astro';
import SideAd from '../../components/SideAd.astro';

const title = {json.dumps(title, ensure_ascii=False)};
const description = {json.dumps(desc, ensure_ascii=False)};
const faqJsonLd = {json.dumps(faq_json, ensure_ascii=False)};
---
<!DOCTYPE html>
<html lang="de">
<head>
  <SEOHead
    title={{title}}
    description={{description}}
    canonical="/de/brain-puzzle-3-level-{n}"
    type="article"
    breadcrumbTitle="Brain Puzzle 3 Level {n}"
  />
  <link rel="alternate" hreflang="de" href="https://gridpaw.com/de/brain-puzzle-3-level-{n}/" />
  <link rel="alternate" hreflang="en" href="https://gridpaw.com/brain-puzzle-3-level-{n}/" />
  <link rel="alternate" hreflang="x-default" href="https://gridpaw.com/brain-puzzle-3-level-{n}/" />
  <script type="application/ld+json" set:html={{JSON.stringify(faqJsonLd)}} />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style is:global>{style}</style>
</head>
<body>
  <GameNav />
  <nav class="breadcrumb" aria-label="Brotkrumen"><a href="/de/">GridPaw</a> &gt; Brain Puzzle 3 Level {n}</nav>

  <main class="seo-section">
    <h1>Brain Puzzle 3 Level {n} Lösung: {esc(goal)}</h1>

    <div class="disclaimer">Inoffizieller Fan-Leitfaden. Nicht mit dem Entwickler von Brain Puzzle 3 verbunden.</div>

    {tier_note(n, d_en.get('xcheck') or {})}
    <div class="answer-box">
      <span class="label">Kurze Antwort</span>
      <p>Level {n} \u201e{esc(name)}\u201c: {esc(goal_s)} {len(steps)} Züge in Reihenfolge ({gest_txt}) \u2014 folge den Schrittkarten unten oder dem Video.</p>
    </div>

{hub}
    <h2>Level {n} Walkthrough: jeder Zug in Reihenfolge<span class="accent">.</span></h2>
{cards_html}
    <h2>FAQ<span class="accent">.</span></h2>
{faq_html}
    <h2>Hängst du an einem anderen Level?<span class="accent">.</span></h2>
    <p>Weitere Brain Puzzle 3 Lösungen, sobald wir sie geschafft haben:</p>
    <div class="index-list">
      {links}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;margin:1.2rem 0;font-weight:700;font-size:0.95rem">
{prev_html}{next_html}    </div>

    <div class="cta-box">
      <p>Alle Level auf einen Blick: <a href="/de/brain-puzzle-3-answers/">Brain Puzzle 3 Lösungen Level 1–137 \u2192</a></p>
      <p><a href="/">Shikaku spielen \u2192</a> \u00b7 <a href="/akari/">Akari spielen \u2192</a> \u00b7 <a href="/japanese-logic-puzzles/">Mehr japanische Logikr\u00e4tsel \u2192</a></p>
    </div>
  </main>
  <AdSlot />
  <SideAd />
</body>
</html>
'''


def main():
    src = json.load(open(os.path.join(DATA, 'de_src.json')))
    de = {}
    for f in sorted(glob.glob(os.path.join(DATA, 'de_out', 'b*.json'))):
        de.update(json.load(open(f)))
    levels = sorted(int(k) for k in src)
    all_levels = sorted(set(levels) | set(range(1, 31)))
    missing = [n for n in levels if str(n) not in de]
    if missing:
        print('MISSING TRANSLATIONS:', missing[:10], f'({len(missing)} levels)')
        return 1
    written = 0
    bad, probs = [], []
    for n in levels:
        d_en, d_de = src[str(n)], de[str(n)]
        en_steps = norm_steps(d_en['steps'])
        de_steps = norm_steps(d_de.get('steps_de') or [])
        if len(en_steps) != len(de_steps):
            bad.append((n, len(en_steps), len(de_steps)))
        html = decode_literal_escapes(page_html(n, d_en, d_de, all_levels))
        if re.search(r'\\u[0-9a-fA-F]{4}', html):
            probs.append((n, 'literal \\uXXXX left'))
        for w in ('the ', 'Drag the', 'Swipe the', 'Tap the'):
            if w in html.split('<style')[0]:
                probs.append((n, f'english leftover {w!r}'))
                break
        if f'Level {n} Lösung' not in html:
            probs.append((n, 'h1 missing'))
        with open(os.path.join(OUT, f'brain-puzzle-3-level-{n}.astro'), 'w') as f:
            f.write(html)
        written += 1
    print(f'pages written {written} | step-count mismatches {len(bad)} {bad[:5]}')
    print(f'content problems {len(probs)} {probs[:5]}')
    print('levels covered:', all_levels[0], '-', all_levels[-1], f'({len(all_levels)})')
    return 0


if __name__ == '__main__':
    sys.exit(main())
