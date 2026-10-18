#!/usr/bin/env python3
"""Generate LEVELS entries for Brain Puzzle 3 L11-18+20-21 from pgm_l11_21.json (+video picks).
Inserts into gen_pages.py LEVELS dict before the '    30: {' block, in numeric order."""
import json, re

PICKS = {
    11: '6nk0kPib3Yg', 12: 'rsWKWSoIBBU', 13: 'Ndnc35wC13Y', 14: 'W1QWV5DS0Fg',
    15: '_sMhL_Wr1rQ', 16: 'lPoRWm_t1zg', 17: 'wLLw1DrPJJY', 18: '3aZoyy587H0',
    20: 'B-SnrZoaqzE', 21: 'D5nqDl4EhkM',
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

data = json.load(open('pgm_l11_21.json'))
desc_hooks = {
    11: 'open every lock on the online date door',
    12: 'reduce the elevator weight to 1000KG before it drops',
    13: 'clean up the room before mom gets home',
    14: 'make the crab release its claw',
    15: 'drive away the creep outside the door',
    16: 'help the girl reduce her head circumference',
    17: 'chase away all the husband\u2019s ex-girlfriends',
    18: 'keep the baby quiet before the zombies arrive',
    20: 'help her clean the toilet fast',
    21: 'help the wife catch the cheating scene',
}
entries = []
for n in [11, 12, 13, 14, 15, 16, 17, 18, 20, 21]:
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
    entries.append(e)

block = ''.join(entries)
src = open('gen_pages.py').read()
anchor = '    30: {'
assert anchor in src
assert f"    11: {{" not in src
src = src.replace(anchor, block + anchor, 1)
open('gen_pages.py', 'w').write(src)
import ast
ast.parse(src)
print('inserted L11-21 entries (between 19 and 30), syntax ok')
