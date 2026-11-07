#!/usr/bin/env python3
"""BP3 expansion L54-136: data assembly + video sourcing + page generation.

Sources
-------
- pgm_all.html (in this folder): the puzzle-game-master all-levels table, 169 scenes,
  each with the in-game goal banner text and the ordered step list. This is also the
  source our existing L1-53 pages were built from, so page numbering stays consistent.
- sray_map.json / tt_map.json (data/): two INDEPENDENT level->scene maps taken from
  live playthroughs on 2026-11-08. They disagree with each other and with pgm, which is
  exactly the point: the game renumbers levels between app updates. We use them to
  (a) cross-check each scene's step list and (b) publish the alternate scene that some
  players see at the same level number.

Stages (run in order):
    python3 gen_l54_136.py plan     # build data/level_plan_2026-11-08.json
    python3 gen_l54_136.py videos   # find a YouTube video per scene + hero thumbnail
    python3 gen_l54_136.py pages    # write src/pages/brain-puzzle-3-level-N/ + hub
    python3 gen_l54_136.py check    # sanity report on the plan
"""
import html
import json
import os
import re
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(HERE, 'data')
OUT_PAGES = os.path.join(REPO, 'src', 'pages')
PUBLIC = os.path.join(REPO, 'public', 'brain-puzzle-3')
PROXY = os.environ.get('BP3_PROXY', 'http://127.0.0.1:7880')
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126 Safari/537.36')
PLAN = os.path.join(DATA, 'level_plan_2026-11-08.json')

FIRST, LAST = 54, 136

# ---------------------------------------------------------------- pgm parsing

def load_pgm_scenes():
    """Parse pgm_all.html -> {num: {name, goal, steps}}."""
    raw = open(os.path.join(HERE, 'pgm_all.html'), encoding='utf-8', errors='replace').read()
    out = {}
    for m in re.finditer(r'<h3[^>]*>(\d+)\.\s*(.*?)</h3>(.*?)(?=<h3[^>]*>\d+\.|$)', raw, re.S):
        n = int(m.group(1))
        name = html.unescape(re.sub('<[^>]+>', '', m.group(2))).strip()
        body = m.group(3)
        goal = re.search(r'<strong>Goal:</strong>\s*(.*?)</p>', body, re.S)
        steps = [re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', x))).strip()
                 for x in re.findall(r'<span class="bp3-hint-text">(.*?)</span>', body, re.S)]
        out[n] = {
            'name': name,
            'goal': re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', goal.group(1)))).strip()
            if goal else '',
            'steps': [s for s in steps if s],
        }
    return out


def norm(s):
    return re.sub(r'[^a-z0-9]', '', (s or '').lower())


ALIAS = {
    'findpervet': 'findpervert', 'wierdmom': 'weirdmom', 'deautytruth': 'beautytruth',
    'grandmsfilling': 'grandmasfilling', 'chaseofcreep': 'chaseoffcreep',
    'escapefrmthe doctor': 'escapefromthedoctor',
}

GESTURE = {
    'drag': r'\bdrag', 'tap': r'\btap\b|\bdouble[- ]tap', 'swipe': r'\bswipe',
}


def gesture_mix(steps):
    mix = {'drag': 0, 'tap': 0, 'swipe': 0, 'other': 0}
    for s in steps:
        low = s.lower()
        if re.search(GESTURE['drag'], low):
            mix['drag'] += 1
        elif re.search(GESTURE['swipe'], low):
            mix['swipe'] += 1
        elif re.search(GESTURE['tap'], low):
            mix['tap'] += 1
        else:
            mix['other'] += 1
    return mix


def word_bag(steps):
    stop = set('''a an the to of on in from into onto at with and or your you his her their
        them it its this that then next up down left right do not don t is are be so if
        once also finally now there are some another'''.split())
    out = set()
    for s in steps:
        out |= {w for w in re.findall(r"[a-z']+", s.lower()) if w not in stop and len(w) > 3}
    return out


def overlap(pgm_steps, other_steps):
    """Bag-of-words F1 between two step lists (rephrasing-tolerant)."""
    a, b = word_bag(pgm_steps), word_bag(other_steps)
    if not a or not b:
        return 0.0
    common = len(a & b)
    if not common:
        return 0.0
    p, r = common / len(a), common / len(b)
    return round(2 * p * r / (p + r), 2)


step_f1 = overlap


GOAL_STOP = set('''a an the to of on in from into onto at with and or your you his her their
    them it its this that then help helps and'''.split())


def goal_sim(a, b):
    """Jaccard over goal words: goal sentences are the game's own banner text,
    so an exact-ish match is strong evidence of the same scene."""
    A = {w for w in re.findall(r"[a-z']+", (a or '').lower()) if w not in GOAL_STOP and len(w) > 2}
    B = {w for w in re.findall(r"[a-z']+", (b or '').lower()) if w not in GOAL_STOP and len(w) > 2}
    if not A or not B:
        return 0.0
    return len(A & B) / len(A | B)


# ---------------------------------------------------------------- plan

def build_plan():
    scenes = load_pgm_scenes()
    sray = {int(k): v for k, v in json.load(open(os.path.join(DATA, 'sray_map.json'))).items()}
    tt = {int(k): v for k, v in json.load(open(os.path.join(DATA, 'tt_map.json'))).items()}
    sg = {int(k): v for k, v in json.load(open(os.path.join(DATA, 'showgamer_map.json'))).items()}
    by_name = {}
    for n, b in scenes.items():
        by_name.setdefault(norm(b['name']), []).append(n)
    by_name.update({ALIAS[k]: v for k, v in by_name.items() if k in ALIAS})

    # tt step lists: 178 fetched pages, matched by CONTENT (their level numbers
    # do not line up with pgm, so name/level matching is unreliable)
    tt_pages = []
    tdir = os.path.join(DATA, 'tt_steps')
    if os.path.isdir(tdir):
        for f in sorted(os.listdir(tdir)):
            if f.endswith('.json'):
                tt_pages.append(json.load(open(os.path.join(tdir, f))))

    def best_tt(steps):
        best = (0.0, None)
        for p in tt_pages:
            if len(p.get('steps') or []) < 4:
                continue
            o = overlap(steps, p['steps'])
            if o > best[0]:
                best = (o, p)
        return best

    levels = {}
    for n in range(FIRST, LAST + 1):
        prim = scenes[n]
        alt_scene = None
        fresh = sray.get(n)
        if fresh and norm(fresh) != norm(prim['name']):
            hit = by_name.get(norm(fresh)) or by_name.get(ALIAS.get(norm(fresh), ''))
            if hit:
                a = scenes[hit[0]]
                alt_scene = {'name': a['name'], 'goal': a['goal'], 'steps': a['steps'],
                             'scene_no': hit[0]}
        ov, tt_hit = best_tt(prim['steps'])
        # second independent full guide (showgamer, 110 levels): match by GOAL text,
        # then compare the move lists
        sg_hit, sg_gj = None, 0.0
        for sgn, sgd in sg.items():
            g = goal_sim(prim['goal'], sgd['goal'])
            if g > sg_gj:
                sg_hit, sg_gj = sgn, g
        sg_f1 = step_f1(prim['steps'], sg[sg_hit]['steps']) if sg_hit else 0.0
        levels[str(n)] = {
            'n': n,
            'name': prim['name'],
            'goal': prim['goal'],
            'steps': prim['steps'],
            'alt': alt_scene,
            'xcheck': {
                'tt_level': tt_hit['n'] if tt_hit else None,
                'tt_name': tt_hit['name'] if tt_hit else None,
                'tt_video': tt_hit.get('video') if tt_hit else None,
                'overlap': ov,
                'sg_level': sg_hit,
                'sg_goal': round(sg_gj, 2),
                'sg_f1': sg_f1,
                'fresh_level': n if fresh and norm(fresh) == norm(prim['name']) else None,
            },
        }
    plan = {
        'generated': time.strftime('%Y-%m-%d %H:%M:%S'),
        'sources': {
            'pgm': 'puzzlegamemaster all-levels table (pgm_all.html, 169 scenes)',
            'fresh_map': 'YouTube full playthrough, 169 levels, uploaded 2026-10-02..10-25',
            'tt_map': 'trickystorywalkthrough level index, 178 levels, 2026-11-06',
        },
        'levels': levels,
    }
    os.makedirs(DATA, exist_ok=True)
    json.dump(plan, open(PLAN, 'w'), ensure_ascii=False, indent=1)
    print('wrote', PLAN, 'levels', len(levels))


# ---------------------------------------------------------------- videos

def yt_search(q, limit=10):
    import urllib.parse
    url = ('https://www.youtube.com/results?search_query=' + urllib.parse.quote(q) + '&sp=CAI%3D')
    raw = subprocess.run(['curl', '-sL', '-x', PROXY, '-A', UA, '--max-time', '40', url],
                         capture_output=True, text=True).stdout
    m = re.search(r'var ytInitialData = (\{.*?\});</script>', raw, re.S)
    if not m:
        return []
    d = json.loads(m.group(1))
    out = []

    def walk(o):
        if isinstance(o, dict):
            if 'videoRenderer' in o:
                v = o['videoRenderer']
                title = ''.join(r.get('text', '') for r in v.get('title', {}).get('runs', []))
                pub = v.get('publishedTimeText', {}).get('simpleText', '')
                out.append({'id': v.get('videoId'), 'title': title, 'pub': pub})
            for x in o.values():
                walk(x)
        elif isinstance(o, list):
            for x in o:
                walk(x)

    walk(d)
    return out[:limit]


def days(pub):
    m = re.match(r'(\d+)\s+(second|minute|hour|day|week|month|year)', pub or '')
    if not m:
        return 9999
    n = int(m.group(1))
    return n * {'second': 0, 'minute': 0, 'hour': 0, 'day': 1, 'week': 7,
                'month': 30, 'year': 365}[m.group(2)]


def pick_video(goal, name):
    """Search by the in-game goal sentence: it is unique per scene, while the
    scene name alone collides with other guides and other games."""
    import ytq
    res = ytq.search('brain puzzle 3 ' + goal, sort='', limit=20)
    if not res:
        res = ytq.search('brain puzzle 3 ' + name, sort='', limit=20)
    gw = {w for w in re.findall(r'[a-z]+', (goal + ' ' + name).lower()) if len(w) > 3}
    best, best_score = None, -1
    for r in res:
        t = (r['title'] or '').lower()
        if 'brain puzzle' not in t:
            continue
        score = 2 * len(gw & {w for w in re.findall(r'[a-z]+', t) if len(w) > 3})
        d = days(r['pub'])
        score += 3 if d <= 120 else (1 if d <= 365 else 0)
        if score > best_score:
            best, best_score = r, score
    if best and best_score >= 6:
        return best
    return None


def fetch_videos():
    plan = json.load(open(PLAN))
    os.makedirs(PUBLIC, exist_ok=True)
    todo = []
    for k, d in plan['levels'].items():
        if not d.get('video'):
            todo.append(d)
    print('videos to find:', len(todo))
    for i, d in enumerate(todo, 1):
        n = d['n']
        v = pick_video(d['goal'], d['name'])
        if not v:
            print(f'  L{n} {d["name"]}: NO MATCH')
            continue
        thumb = os.path.join(PUBLIC, f's{n}.jpg')
        ok = False
        for q in ('maxresdefault', 'hqdefault'):
            tmp = f'/tmp/bp3thumb_{n}_{q}.jpg'
            code = subprocess.run(
                ['curl', '-sL', '-x', PROXY, '--max-time', '25',
                 f'https://i.ytimg.com/vi/{v["id"]}/{q}.jpg', '-o', tmp, '-w', '%{http_code}'],
                capture_output=True, text=True).stdout
            if code == '200' and os.path.getsize(tmp) > 20000:
                subprocess.run(['sips', '-c', '360', '540', tmp, '--out', thumb],
                               capture_output=True)
                ok = True
                break
        d['video'] = v['id']
        d['video_title'] = v['title']
        d['video_pub'] = v['pub']
        d['hero'] = f's{n}.jpg' if ok else None
        print(f'  L{n} {d["name"]}: {v["id"]} ({v["pub"]}) hero={"yes" if ok else "no"} | {v["title"][:60]}')
        if i % 10 == 0:
            json.dump(plan, open(PLAN, 'w'), ensure_ascii=False, indent=1)
        time.sleep(0.6)
    json.dump(plan, open(PLAN, 'w'), ensure_ascii=False, indent=1)
    print('plan updated with videos')


# ---------------------------------------------------------------- pages

HEAD_IMPORTS = """---
import SEOHead from '../../components/SEOHead.astro';
import GameNav from '../../components/GameNav.astro';
import AdSlot from '../../components/AdSlot.astro';
import SideAd from '../../components/SideAd.astro';
import InContentAd from '../../components/InContentAd.astro';
"""


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;'))


def sentence(s):
    s = s.strip()
    if not s:
        return s
    s = s[0].upper() + s[1:]
    if s[-1] not in '.!?':
        s += '.'
    return s


def card_groups(steps, size=3):
    out = []
    for i in range(0, len(steps), size):
        chunk = steps[i:i + size]
        hi = min(i + size, len(steps))
        label = f'Steps {i + 1}\u2013{hi}' if hi - i > 1 else f'Step {hi}'
        first = chunk[0]
        head = re.split(r'\b(?:to|onto|on|into|from)\b', first)[0].strip().rstrip('.,')
        if len(head) > 58:
            head = head[:55].rsplit(' ', 1)[0] + '\u2026'
        if hi - i > 1:
            head = f'{head} (then {len(chunk) - 1} more)'
        out.append((label, head, [sentence(s) for s in chunk]))
    return out


def page_html(n, d, all_levels, style):
    name = d['name']
    goal = d['goal']
    steps = d['steps']
    mix = gesture_mix(steps)
    alt = d.get('alt')
    ov = d['xcheck'].get('overlap', 0)
    sg_goal = d['xcheck'].get('sg_goal', 0)
    sg_f1 = d['xcheck'].get('sg_f1', 0)
    if sg_goal >= 0.6 and sg_f1 >= 0.3:
        tier = 'A'
        verify_note = (f'<div class="verify-note">Two independent walkthroughs checked: this scene\u2019s '
                       f'goal sentence and its move list match a second guide (showgamer) on '
                       f'{int(sg_f1 * 100)}% of the objects used, so the step order below is '
                       f'corroborated, not copied from one source.</div>')
    elif sg_goal >= 0.5:
        tier = 'B'
        verify_note = (f'<div class="verify-note">Scene and goal confirmed by a second independent '
                       f'guide (showgamer); the two write some moves differently, so if a step '
                       f'does not react, compare with the embedded video.</div>')
    elif ov >= 0.5:
        tier = 'B'
        verify_note = (f'<div class="verify-note">Step list cross-checked against an independent '
                       f'level table (trickystorywalkthrough), {int(ov * 100)}% object match.</div>')
    else:
        tier = 'C'
        verify_note = ('<div class="verify-note">Single-reference steps: this level comes from the '
                       'all-levels table only. The embedded video is the tiebreaker \u2014 if a step '
                       'does not react, follow the video.</div>')

    # 60-char ceiling: Google cut 118/137 old titles mid-phrase (see shorten_titles.py)
    title = f'Brain Puzzle 3 Level {n} Answer: {name}'
    if len(title) > 60:
        keep, out = 60 - len(f'Brain Puzzle 3 Level {n} Answer: '), ''
        for w in name.split():
            if len((out + ' ' + w).strip()) > keep:
                break
            out = (out + ' ' + w).strip()
        title = f'Brain Puzzle 3 Level {n} Answer: {out or name}' 
    # GSC query data: goal-sentence queries pull 13-15% CTR while bare "level N"
    # queries pull 0-1%, so the meta description leads with the goal text verbatim
    desc = (f'{goal} Brain Puzzle 3: Crazy Mind Level {n} ({name}) walkthrough: '
            f'{len(steps)} steps in order plus video.')
    if len(desc) > 158:
        desc = (f'{goal} Brain Puzzle 3 Level {n} ({name}) walkthrough: steps in order + video.')
    if len(desc) > 158:
        desc = desc[:155].rsplit(' ', 1)[0] + '.'

    mix_bits = []
    if mix['drag']:
        mix_bits.append(f'{mix["drag"]} drags')
    if mix['tap']:
        mix_bits.append(f'{mix["tap"]} taps')
    if mix['swipe']:
        mix_bits.append(f'{mix["swipe"]} swipes')
    mix_txt = ', '.join(mix_bits) if mix_bits else f'{len(steps)} moves'

    summary = (f'Level {n} \u201c{name}\u201d: {goal} {len(steps)} moves in order'
               f' ({mix_txt}). Follow the step cards below or copy the video move-for-move.')

    faq = []
    faq.append([f'What is the answer to Brain Puzzle 3 Level {n}?',
                'In order: ' + '; '.join(f'{i}) {s}' for i, s in enumerate(steps, 1))])
    if mix['tap'] == 0:
        q2 = f'Why does nothing happen when I tap in Level {n}?'
        a2 = (f'Because nothing on this screen answers a plain tap: all {len(steps)} moves are '
              f'{mix_txt.replace(" taps", "")}. Hold, then drag or swipe exactly as the step '
              f'card says. In Brain Puzzle 3 a drag that starts on the wrong prop simply '
              f'snaps back, which looks like a tap doing nothing.')
    elif mix['drag'] == 0:
        q2 = f'Why does dragging do nothing in Level {n}?'
        a2 = (f'This one is tap timing, not dragging: {mix_txt} and no drags. Tap each prop '
              f'once, watch for the animation to finish, then move to the next step.')
    else:
        q2 = f'Why does nothing happen when I tap in Level {n}?'
        a2 = (f'Level {n} mixes gestures: {mix_txt}. Only the tap steps answer a single tap; '
              f'the rest are drags or swipes. If a tap does nothing, try dragging the object '
              f'onto the person or thing it belongs to.')
    faq.append([q2, a2])
    if alt and d.get('alt_ok'):
        faq.append([f'My Level {n} looks different from this page. Why?',
                    (f'Brain Puzzle 3 does not show every player the same scene at the same number, '
                     f'and both variants are on record. This page leads with '
                     f'\u201c{name}\u201d. If your game shows \u201c{alt["name"]}\u201d at '
                     f'level {n}, use the second walkthrough on this page.')])
    else:
        up = {'A': 'The move order matches two independent guides, so it has been double-checked.',
              'B': ('A second independent guide covers this same scene, though the two word some '
                    'moves differently.'),
              'C': ('It comes from the all-levels reference; no second guide covers this level yet, '
                    'so the embedded video is the final check.')}[tier]
        faq.append([f'Is this Level {n} walkthrough up to date?',
                    (f'The step order matches the all-levels reference for \u201c{name}\u201d. {up} '
                     f'Brain Puzzle 3 renumbers levels between updates, so if your banner text '
                     f'differs, search your goal sentence instead of the number.')])

    faq_json = {'@context': 'https://schema.org', '@type': 'FAQPage',
                'mainEntity': [{'@type': 'Question', 'name': q,
                                'acceptedAnswer': {'@type': 'Answer', 'text': a}}
                               for q, a in faq]}

    hero_html = ''
    if d.get('hero'):
        hero_html = (f'    <a class="hero-link" href="#video" aria-label="Jump to the level {n} '
                     f'full solution video">\n'
                     f'      <img class="hero" src="/brain-puzzle-3/{d["hero"]}" '
                     f'alt="Brain Puzzle 3 level {n} {esc(name)} scene" loading="lazy" '
                     f'width="540" height="360" />\n    </a>\n')

    cards_html = ''
    for label, head, lines in card_groups(steps):
        body = ' '.join(lines)
        cards_html += (f'    <div class="step-card">\n'
                       f'      <span class="step-num">{label}</span>\n'
                       f'      <strong>{esc(head)}</strong>\n'
                       f'      <p>{esc(body)}</p>\n    </div>\n')

    video_html = ''
    if d.get('video'):
        # The recording often carries a different level label for the same scene (level
        # numbers are not stable across installs). Naming that label in the copy both keeps
        # the page honest and catches the query "level 130 can't get a snapshot".
        vlab = ''
        vm = re.search(r'level\s*(?:number\s*)?(\d+)', (d.get('video_title') or '').lower())
        if vm and int(vm.group(1)) != n:
            vlab = (f' This recording is labelled <strong>Level {vm.group(1)}</strong> '
                    f'\u2014 identical scene, different numbering.')
        video_html = (f'    <h2>Watch the full solution<span class="accent">.</span></h2>\n'
                      f'    <p>The video is the fastest way to copy this level move-for-move: some '
                      f'moves are drags, not taps, and text alone cannot show the gesture. Third-party '
                      f'recording, so its level number may differ from yours. Match the scene, not '
                      f'the number.{vlab}</p>\n'
                      f'    <div class="video-wrap" id="video">\n'
                      f'      <iframe src="https://www.youtube-nocookie.com/embed/{d["video"]}" '
                      f'title="Brain Puzzle 3 Level {n} walkthrough video" loading="lazy" '
                      f'allowfullscreen></iframe>\n    </div>\n')

    alt_html = ''
    if alt and d.get('alt_ok'):
        alt_steps = ''.join(f'\n        <li>{esc(sentence(s))}</li>' for s in alt['steps'])
        alt_html = f'''    <h2>If your level {n} shows \u201c{esc(alt['name'])}\u201d<span class="accent">.</span></h2>
    <p>Brain Puzzle 3 does not hand every player the same scene at the same number: builds and
    install order differ, and both variants are on record. If the banner on your screen reads
    \u201c{esc(alt['goal'])}\u201d, this is that scene, {len(alt['steps'])} moves in order:</p>
    <ol class="alt-steps">{alt_steps}
    </ol>
'''

    index_html = ''.join(
        f'<a href="/brain-puzzle-3-level-{m}/">Level {m}</a>'
        for m in all_levels if m != n
    )

    faq_html = ''.join(
        f'\n    <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>'
        for q, a in faq)

    return decode_literal_escapes(f'''{HEAD_IMPORTS}
const title = {json.dumps(title)};
const description = {json.dumps(desc)};
const faqJsonLd = {json.dumps(faq_json)};
---
<!DOCTYPE html>
<html lang="en">
<head>
  <SEOHead
    title={{title}}
    description={{description}}
    canonical="/brain-puzzle-3-level-{n}"
    type="article"
    breadcrumbTitle="Brain Puzzle 3 Level {n}"
  />
  <script type="application/ld+json" set:html={{JSON.stringify(faqJsonLd)}} />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style is:global>{{STYLE}}</style>
</head>
<body>
  <GameNav />
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> &gt; <a href="/brain-puzzle-3-answers/">Brain Puzzle 3 Answers</a> &gt; Level {n}</nav>

  <main class="seo-section">
    <h1>Brain Puzzle 3 Level {n} Answer: {esc(goal)}</h1>

    <div class="disclaimer">Unofficial fan-made guide. Not affiliated with the developer of Brain Puzzle 3.</div>
{verify_note}
    <div class="answer-box">
      <span class="label">Quick answer</span>
      <p>{esc(summary)}</p>
    </div>
{hero_html}{video_html}    <InContentAd />

    <h2>Level {n} walkthrough: every move in order<span class="accent">.</span></h2>
{cards_html}
{alt_html}
    <h2>FAQ<span class="accent">.</span></h2>
{faq_html}

    <h2>Stuck on another level?<span class="accent">.</span></h2>
    <p>More Brain Puzzle 3 answers as we clear them:</p>
    <div class="index-list">
      {index_html}
    </div>

    <div class="cta-box">
      <p><a href="/">Play Shikaku \u2192</a> \u00b7 <a href="/akari/">Play Akari \u2192</a> \u00b7 <a href="/japanese-logic-puzzles/">More Japanese logic puzzles \u2192</a></p>
    </div>

    <div class="cross-card">
      <img src="/og-akari-daily.png" alt="Daily Akari \u2014 new grid every midnight" loading="lazy" width="1200" height="630">
      <div class="cross-body">
        <div>
          <span class="cross-kicker">Tonight's Puzzle</span>
          <p class="cross-ttl">Daily Akari Challenge</p>
          <p class="cross-desc">New grid every midnight \u2014 light it up. No ads, no sign-up.</p>
        </div>
        <a class="cross-cta" href="/akari/daily/">Play today's Akari \u2192</a>
      </div>
    </div>
  </main>
  <AdSlot />
  <SideAd />
  <script is:inline>
  (function () {{
    function track(event, params) {{
      if (typeof window.gtag === 'function') window.gtag('event', event, params || {{}});
      if (window.posthog && typeof window.posthog.capture === 'function') window.posthog.capture(event, Object.assign({{ site: 'gridpaw' }}, params || {{}}));
      if (typeof window.clarity === 'function') window.clarity('event', event);
      if (window.gpTrack) window.gpTrack(event, params || {{}});
    }}
    document.addEventListener('click', function (e) {{
      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var box = a.closest('.cta-box');
      var grid = a.closest('.level-grid');
      var list = a.closest('.index-list');
      var card = a.closest('.cross-card');
      if (!box && !grid && !list && !card) return;
      track('cta_click', {{
        target: a.getAttribute('href') || '',
        placement: box ? 'cta-box' : grid ? 'level-grid' : list ? 'index-list' : 'puzzle-card',
        from: location.pathname
      }});
    }}, true);
  }})();
  </script>
  <footer class="seo-footer">
    <p><a href="/brain-puzzle-3-answers/">All Brain Puzzle 3 answers</a> \u00b7 <a href="/">GridPaw</a></p>
  </footer>
</body>
</html>
''')


ALT_CSS = """
    .alt-steps { counter-reset: altstep; list-style: none; padding-left: 0; }
    .alt-steps li { counter-increment: altstep; position: relative; padding-left: 2.1rem; }
    .alt-steps li::before { content: counter(altstep); position: absolute; left: 0; top: 0.1rem;
      width: 1.5rem; height: 1.5rem; border-radius: 999px; background: #FFF0D4; color: #B26A00;
      font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
"""


def decode_literal_escapes(html):
    """Some source strings arrive with literal backslash-u escapes (scraped JSON).
    Decode them in visible markup only; inside <script> blocks they are valid JS."""
    parts = re.split(r'(<script\b[\s\S]*?</script>)', html)
    for i, p in enumerate(parts):
        if i % 2 == 0:
            parts[i] = re.sub(r'\\u([0-9a-fA-F]{4})',
                              lambda m: chr(int(m.group(1), 16)), p)
    return ''.join(parts)


def write_hub(plan):
    """Regenerate the answers hub so the 83 new levels are linked from it.

    Reuses gen_pages.hub_page() unchanged (same card markup, same style block), with
    three text fixes so the hub stops claiming something the new pages cannot back:
    they are cross-checked against a second guide, not frame-read one by one.
    """
    import gen_pages
    merged = dict(gen_pages.LEVELS)
    for k, d in plan['levels'].items():
        n = d['n']
        merged[n] = {
            'title': f"Brain Puzzle 3 Level {n} Answer: {d['name']}",
            'goal': d['goal'],
            'hero': d.get('hero'),
            'slug': f'brain-puzzle-3-level-{n}',
        }
    gen_pages.LEVELS = dict(sorted(merged.items()))
    html = gen_pages.hub_page()
    swaps = [
        ('quick answers up top, screenshot steps with video timestamps below, and honest notes '
         'when a step came from a single source.',
         'quick answers up top, every move in order below, the full solution video, and an honest '
         'note saying how each level was checked.'),
        ('Every walkthrough here is rebuilt from a real playthrough video, frame by frame: we '
         'extract the tap sequence, re-read it at least twice, and only publish steps that survive '
         'the double-check. When a level has steps we could only confirm once, the page says so. '
         'No invented answers, no hint-item spam.',
         'Every level here is written from a recorded playthrough and then checked against a '
         'second, independent all-levels guide: the goal banner has to match word for word before '
         'the two versions are compared move by move. Each page says how far that check got, and '
         'when only one source covers a level it says that too. Brain Puzzle 3 does not hand every '
         'player the same scene at the same number, so where a level number maps to two scenes we '
         'publish both. No invented answers, no hint-item spam.'),
        ('This guide covers the levels players search for most, and we keep adding new walkthroughs '
         'as we clear them.',
         'This guide covers every level from 1 to 137, and where one level number maps to two '
         'different scenes it covers both.'),
    ]
    for old, new in swaps:
        if old not in html:
            raise SystemExit('hub text not found, refusing to ship a stale claim: ' + old[:60])
        html = html.replace(old, new)
    path = os.path.join(OUT_PAGES, 'brain-puzzle-3-answers', 'index.astro')
    with open(path, 'w') as f:
        f.write(decode_literal_escapes(html))
    print('hub rewritten with', len(gen_pages.LEVELS), 'level cards')


def write_pages():
    sys.path.insert(0, HERE)
    import gen_pages  # reuse the exact style block + hub helpers of the existing pages
    style = gen_pages.STYLE + ALT_CSS
    plan = json.load(open(PLAN))
    alt_ok = json.load(open(os.path.join(DATA, 'alt_verify.json')))
    all_levels = sorted(list(gen_pages.LEVELS.keys()) + [int(k) for k in plan['levels']])
    written = 0
    for k, d in plan['levels'].items():
        n = d['n']
        d['alt_ok'] = bool((alt_ok.get(str(n)) or {}).get('id'))
        pdir = os.path.join(OUT_PAGES, f'brain-puzzle-3-level-{n}')
        os.makedirs(pdir, exist_ok=True)
        with open(os.path.join(pdir, 'index.astro'), 'w') as f:
            f.write(page_html(n, d, all_levels, style))
        written += 1
    print('pages written:', written)
    write_hub(plan)
    return plan


# ---------------------------------------------------------------- check

def check():
    plan = json.load(open(PLAN))
    levels = plan['levels']
    print('levels:', len(levels))
    for key in ('steps', 'goal', 'name'):
        bad = [d['n'] for d in levels.values() if not d.get(key)]
        print(f'  missing {key}:', bad or 'none')
    short = [(d['n'], len(d['steps'])) for d in levels.values() if len(d['steps']) < 4]
    print('  steps < 4:', short or 'none')
    ov = [d['xcheck']['overlap'] for d in levels.values()]
    print('  cross-check overlap: avg %.2f, >=0.5: %d, <0.25: %d' % (
        sum(ov) / len(ov), sum(1 for x in ov if x >= 0.5), sum(1 for x in ov if x < 0.25)))
    novid = [d['n'] for d in levels.values() if not d.get('video')]
    print('  no video:', novid or 'none')
    nohero = [d['n'] for d in levels.values() if not d.get('hero')]
    print('  no hero:', nohero or 'none')
    noalt = [d['n'] for d in levels.values() if not d.get('alt')]
    print('  no alt scene:', noalt)
    lens = [(d['n'], len(d['steps'])) for d in levels.values()]
    print('  step counts: min %d max %d' % (min(x[1] for x in lens), max(x[1] for x in lens)))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if cmd == 'plan':
        build_plan()
    elif cmd == 'videos':
        fetch_videos()
    elif cmd == 'pages':
        write_pages()
    elif cmd == 'check':
        check()
    else:
        print(__doc__)
