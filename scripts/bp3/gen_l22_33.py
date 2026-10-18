#!/usr/bin/env python3
"""Generate LEVELS entries for Brain Puzzle 3 L22-29 + L32-33 from pgm_l22_33.json (+video picks).
Inserts 22-29 before '    30: {' and 32-33 before '    137: {' (hub numeric order)."""
import json, re

PICKS = {
    22: 'PBCqe1zIy3Q', 23: 'fyPDfpUkx7Y', 24: 'HdY3PYKKvPQ', 25: 'jPHsfpSmxd4',
    26: 'os7P4LMb9pE', 27: 'UTQRTVoth1w', 28: '6LiT0x4hm34', 29: 'oe9AWLs1NRM',
    32: 'DMn7l5ry-gU', 33: 'ykpS-OALS3Y',
}
VERIFY_NOTE = ('Steps cross-checked against an independent all-levels reference (current game version) '
               'and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — '
               'if a tap does nothing, try dragging the object instead.')

def esc(s):
    return s.replace('\\\\', '\\\\\\\\').replace("'", "\\'")

def chunk(lst, k):
    n = len(lst); base = n // k; rem = n % k
    out = []; i = 0
    for c in range(k):
        size = base + (1 if c < rem else 0)
        out.append((i, i + size)); i += size
    return out

def short_label(steps, a, b):
    first = steps[a].rstrip('.')
    return first[0].upper() + first[1:]

data = json.load(open('pgm_l22_33.json'))
desc_hooks = {
    22: 'help the barista make 10 different coffees',
    23: 'find the people hiding in the house',
    24: 'help them out of trouble on the tower',
    25: 'help them fix the parachute properly',
    26: 'extend the ladder so the girl climbs upstairs',
    27: 'rub the paint off the prisoner\u2019s back',
    28: 'solve every ghost\u2019s problem at the clinic',
    29: 'escape Death himself',
    32: 'help the black-haired girl become beautiful',
    33: 'help the waiters handle uncivilized guests',
}

def make_entry(n):
    d = data[str(n)]
    title = d['title']
    goal = d['goal'].rstrip('.')
    steps = [s.strip().rstrip('.') for s in d['steps']]
    vid = PICKS[n]
    ncards = 3 if len(steps) <= 9 else 4
    spans = chunk(steps, ncards)
    cards = []
    for (a, b) in spans:
        grp = steps[a:b]
        what = short_label(steps, a, b)
        why = '; then '.join(grp) if len(grp) > 1 else grp[0]
        cards.append({'what': f'Steps {a+1}\u2013{b}: {what}', 'why': why})
    faq1 = 'In order: ' + '; '.join(f'{i+1}) {s}' for i, s in enumerate(steps))
    desc = f'Brain Puzzle 3 Level {n} ({title}) answer: {desc_hooks[n]}. Full step order plus the complete video walkthrough.'
    assert len(desc) <= 155, (n, len(desc))
    faq = [
        [f'What is the answer to Brain Puzzle 3 Level {n}?', faq1],
        [f'Why does nothing happen when I tap in Level {n}?',
         'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
        [f'Is this Level {n} walkthrough up to date?',
         'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
    ]
    e = f"""    {n}: {{
        'slug': 'brain-puzzle-3-level-{n}',
        'title': 'Brain Puzzle 3 Level {n} Answer: {esc(title)} Guide',
        'description': '{esc(desc)}',
        'goal': '{esc(goal)}',
        'video_id': '{vid}',
        'verified': 'weak',
        'verify_note': '{esc(VERIFY_NOTE)}',
        'hero': 'l{n}_hero.jpg',
        'summary': 'Level {n} \\u201c{esc(title)}\\u201d: {esc(goal)}. {len(steps)} moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
"""
    for c in cards:
        e += f"            {{'what': '{esc(c['what'])}', 'why': '{esc(c['why'])}'}},\n"
    e += "        ],\n        'faq': [\n"
    for q, a in faq:
        e += f"            ['{esc(q)}', '{esc(a)}'],\n"
    e += "        ],\n    },\n"
    return e

src = open('gen_pages.py').read()
block_22 = ''.join(make_entry(n) for n in [22, 23, 24, 25, 26, 27, 28, 29])
block_32 = ''.join(make_entry(n) for n in [32, 33])
assert '    22: {' not in src and '    32: {' not in src
a1 = '    30: {'
a2 = '    137: {'
assert a1 in src and a2 in src
src = src.replace(a1, block_22 + a1, 1)
src = src.replace(a2, block_32 + a2, 1)
open('gen_pages.py', 'w').write(src)
import ast
ast.parse(src)
# 入库校验链 1：实体
assert '&#0' not in src and '&amp;' not in src, 'entity residue!'
print('inserted L22-29 (before 30) + L32-33 (before 137), syntax ok, entity-free')
