#!/usr/bin/env python3
"""Verify the alternate-scene claim for each level.

Each new page may say "a newer build puts scene X at level N". That claim is only
safe if some recording actually labels it that way, so we search YouTube for
"brain puzzle 3 level N <scene>" and keep the alt block only when a title carries
both the number and the scene (or its goal words).
"""
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ytq  # noqa: E402

PLAN = os.path.join(HERE, 'data', 'level_plan_2026-11-08.json')
OUT = os.path.join(HERE, 'data', 'alt_verify.json')
STOP = set('a an the to of on in from into onto at with and or your you his her their'.split())


def words(s):
    return {w for w in re.findall(r"[a-z']+", (s or '').lower()) if w not in STOP and len(w) > 2}


def main():
    plan = json.load(open(PLAN))['levels']
    done = json.load(open(OUT)) if os.path.exists(OUT) else {}
    todo = [k for k, d in plan.items() if d.get('alt') and k not in done]
    print('to verify:', len(todo), 'done:', len(done))
    for i, k in enumerate(todo, 1):
        d = plan[k]
        n, alt = d['n'], d['alt']
        name_w, goal_w = words(alt['name']), words(alt['goal'])
        res = ytq.search(f'brain puzzle 3 level {n} {alt["name"]}', sort='', limit=20)
        hit = None
        for r in res:
            t = (r['title'] or '').lower()
            if 'brain puzzle' not in t:
                continue
            has_num = re.search(rf'\blevel\s*{n}\b', t) or re.search(rf'\blvl\s*{n}\b', t)
            tw = words(t)
            name_ok = len(name_w & tw) >= max(1, len(name_w) - 1)
            goal_ok = len(goal_w & tw) >= 2
            if has_num and (name_ok or goal_ok):
                hit = {'id': r['id'], 'title': r['title'], 'pub': r['pub']}
                break
        done[k] = hit or {'id': None}
        if i % 15 == 0:
            json.dump(done, open(OUT, 'w'), ensure_ascii=False, indent=1)
            print(' ...', i)
        time.sleep(0.4)
    json.dump(done, open(OUT, 'w'), ensure_ascii=False, indent=1)
    ok = sum(1 for v in done.values() if v.get('id'))
    print(f'verified alt blocks: {ok}/{len(done)}')


if __name__ == '__main__':
    main()
