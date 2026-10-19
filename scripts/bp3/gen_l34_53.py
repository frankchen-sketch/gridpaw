#!/usr/bin/env python3
"""Generate LEVELS entries for Brain Puzzle 3 L34-43 (pgm_l34_43.json, weak-verified batch)
and L44-53 (pgm_l44_53.json, 9 strong + L50 weak, summaries/verify_notes from vision pass).
Inserts 34-53 before '    137: {' (hub numeric order). Modeled on gen_l22_33.py."""
import json, re

VERIFY_NOTE_WEAK = ('Steps cross-checked against an independent all-levels reference (current game version) '
                    'and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — '
                    'if a tap does nothing, try dragging the object instead.')

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

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

def make_desc(n, title, goal):
    g = goal.rstrip('.').strip()
    g = g[0].lower() + g[1:] if g else g
    tail = '. Full step order plus the complete video walkthrough.'
    head = f'Brain Puzzle 3 Level {n} ({title}) answer: '
    desc = head + g + tail
    if len(desc) > 155:  # goal 太长就截，保住关键词骨架
        room = 155 - len(head) - len(tail) - 1
        g = g[:room].rsplit(' ', 1)[0]
        desc = head + g + tail
    assert len(desc) <= 155, (n, len(desc), desc)
    return desc

data_a = json.load(open('pgm_l34_43.json'))
data_b = json.load(open('pgm_l44_53.json'))

def make_entry(n):
    d = data_a[str(n)] if str(n) in data_a else data_b[str(n)]
    from_b = str(n) in data_b
    title = d['title']
    goal = d['goal'].rstrip('.')
    steps = [s.strip().rstrip('.') for s in d['steps']]
    vid = d['video_id']
    verified = d.get('verified', 'weak')
    if from_b:
        verify_note = d.get('verify_note') or VERIFY_NOTE_WEAK
        summary = esc(d['summary'])
    else:
        verify_note = VERIFY_NOTE_WEAK
        summary = f'Level {n} \\u201c{esc(title)}\\u201d: {esc(goal)}. {len(steps)} moves in order — follow the step cards below or copy the embedded video move-for-move.'
    desc = make_desc(n, title, goal)
    ncards = 3 if len(steps) <= 9 else 4
    spans = chunk(steps, ncards)
    cards = []
    for (a, b) in spans:
        grp = steps[a:b]
        what = short_label(steps, a, b)
        why = '; then '.join(grp) if len(grp) > 1 else grp[0]
        cards.append({'what': f'Steps {a+1}\\u2013{b}: {what}', 'why': why})
    faq1 = 'In order: ' + '; '.join(f'{i+1}) {s}' for i, s in enumerate(steps))
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
        'verified': '{verified}',
        'verify_note': '{esc(verify_note)}',
        'hero': 'l{n}_hero.jpg',
        'summary': '{summary}',
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
block = ''.join(make_entry(n) for n in range(34, 54))
assert '    34: {' not in src and '    44: {' not in src
anchor = '    137: {'
assert anchor in src
src = src.replace(anchor, block + anchor, 1)
open('gen_pages.py', 'w').write(src)
import ast
ast.parse(src)
assert '&#0' not in src and '&amp;' not in src, 'entity residue!'
print('inserted L34-53 (before 137), syntax ok, entity-free')
