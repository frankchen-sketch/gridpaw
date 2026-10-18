#!/usr/bin/env python3
"""Generate LEVELS entries for Brain Puzzle 3 L1-10 from pgm_l1_10.json (+video picks).
Inserts into gen_pages.py LEVELS dict before the '    19: {' block, in order 1..10."""
import json, re

PICKS = {
    1: 'isoGuqaLrrE', 2: 'hXfOPjxdsRc', 3: 'BLrDe8tZQMQ', 4: '6cchHfXWRbo',
    5: 'lKbt_08mQBw', 6: 'zidBwDCJqB4', 7: 'ByYnl8Ze8lc', 8: 'tLimJ3s02SQ',
    9: '_qn1ratXftU', 10: 'I7Ad-91mm-Q',
}
# 每关的分组数（按步数定）
VERIFY_NOTE = ('Steps cross-checked against an independent all-levels reference (current game version) '
               'and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — '
               'if a tap does nothing, try dragging the object instead.')

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def chunk(lst, k):
    n = len(lst)
    base = n // k
    rem = n % k
    out = []
    i = 0
    for c in range(k):
        size = base + (1 if c < rem else 0)
        out.append((i, i + size))
        i += size
    return out

def short_label(steps, a, b):
    """卡片标题 = 首个动作短句"""
    first = steps[a].rstrip('.')
    return first[0].upper() + first[1:]

data = json.load(open('pgm_l1_10.json'))
entries = []
for n in range(1, 11):
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
    entries = entries or []
    desc_hooks = {
        1: 'score higher than the rival in the western duel',
        2: 'warm the man up with every heat source in the room',
        3: 'get the magazine-cover look before the door opens',
        4: 'clean the dorm before the principal arrives',
        5: 'build an escape route out of the creepy carnival',
        6: 'restore the bathroom before the wife gets home',
        7: 'grant every ghost\'s wish in the haunted apartment',
        8: 'break the man free from the elevator railing',
        9: 'stack a jumbo hot dog from the strangest finds',
        10: 'help every employee escape the office',
    }
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
anchor = '    19: {'
assert anchor in src
src = src.replace(anchor, block + anchor, 1)
open('gen_pages.py', 'w').write(src)
import ast
ast.parse(src)
print('inserted L1-10 entries, syntax ok')
