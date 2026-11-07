#!/usr/bin/env python3
"""Shorten every English Brain Puzzle 3 level title to fit inside ~60 characters.

GSC query data for BP3 keeps the same shape across levels: "brain puzzle 3 level N"
and "brain puzzle 3 <goal sentence>" are the two query families, while the
": Crazy Mind ... Guide" filler in the old titles pushed 118 of 137 titles past 60
characters, so Google cut them mid-phrase (worst: 76 chars).

New pattern: "Brain Puzzle 3 Level {n} Answer: {scene}"
- "Answer" stays because the query intent is answers, not "walkthrough"
- scene name stays because it is what a player recognises on the level map
- "Crazy Mind" moves to the meta description and the body (still indexed, no title cost)
- long scene names are trimmed at a word boundary so nothing is cut mid-word

Idempotent: re-running only rewrites titles that still carry the old filler.
"""
import glob
import json
import re

MAX = 60
PAGES = 'src/pages/brain-puzzle-3-level-*/index.astro'
PATTERN = 'Brain Puzzle 3 Level {n} Answer: {name}'


def build(n, name):
    t = PATTERN.format(n=n, name=name)
    if len(t) <= MAX:
        return t
    keep = MAX - len(PATTERN.format(n=n, name=''))
    words, out = name.split(), ''
    for w in words:
        cand = (out + ' ' + w).strip()
        if len(cand) > keep:
            break
        out = cand
    return PATTERN.format(n=n, name=out or words[0][:keep])


def main():
    rows, changed, too_long = [], 0, []
    for f in sorted(glob.glob(PAGES), key=lambda p: int(re.search(r'level-(\d+)', p).group(1))):
        n = int(re.search(r'level-(\d+)', f).group(1))
        s = open(f).read()
        m = re.search(r'const title = (".*?");', s)
        cur = json.loads(m.group(1))
        nm = re.search(r'Answer: (.*?)(?: Guide)?$', cur)
        if not nm:
            too_long.append((n, cur, 'no name found'))
            continue
        new = build(n, nm.group(1).strip())
        rows.append((n, len(cur), len(new), new))
        if len(new) > MAX:
            too_long.append((n, new, len(new)))
        if new != cur:
            s = s.replace(f'const title = {m.group(1)};', f'const title = {json.dumps(new, ensure_ascii=False)};', 1)
            open(f, 'w').write(s)
            changed += 1
    rows.sort(key=lambda r: -r[2])
    print(f'titles checked {len(rows)} | rewritten {changed} | over {MAX} chars {len(too_long)}')
    print('longest after:', [(r[0], r[2]) for r in rows[:5]])
    print('sample:', [(r[0], r[3]) for r in rows if r[0] in (1, 50, 69, 114, 136, 137)])
    # duplicate check
    seen = {}
    for n, _, _, t in rows:
        seen.setdefault(t, []).append(n)
    dups = {t: v for t, v in seen.items() if len(v) > 1}
    print('duplicate titles:', dups)
    if too_long:
        print('PROBLEMS:', too_long[:5])


if __name__ == '__main__':
    main()
