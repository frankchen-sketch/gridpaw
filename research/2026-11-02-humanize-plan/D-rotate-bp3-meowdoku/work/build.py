#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""D 流：rotate-rings / brain-puzzle-3 关卡页 / meowdoku 关卡页 正文 em dash 改写方案构建器。
只读仓库；输出写到本目录 proposed/ 与 changes.patch。"""
import glob, json, os, re, difflib, sys

BASE = '/Users/frank/workspace/gridpaw'
OUT = os.path.join(BASE, 'research/2026-11-02-humanize-plan/D-rotate-bp3-meowdoku')
PROP = os.path.join(OUT, 'proposed')
DASH = '\u2014'

# ---------------------------------------------------------------- bp3 模板句
# 每个模板 2 个变体：A=句号拆开，B=冒号（列表式模板 B 用括号，需过每页 ≤2 预算）
TEMPLATES = [
    ('most of them drags — follow the step cards below or copy the embedded video move-for-move.',
     'most of them drags. Follow the step cards below or copy the embedded video move-for-move.',
     'most of them drags; follow the step cards below or copy the embedded video move-for-move.',
     False),
    ('moves in order — follow the step cards below or copy the embedded video move-for-move.',
     'moves in order. Follow the step cards below or copy the embedded video move-for-move.',
     'moves in order; follow the step cards below or copy the embedded video move-for-move.',
     False),
    ('Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
     'Most moves are drags. If a tap does nothing, drag the object onto the person or prop it belongs to.',
     'Most moves are drags (if a tap does nothing, drag the object onto the person or prop it belongs to).',
     True),
    ('New grid every midnight — light it up.',
     'New grid every midnight. Light it up.',
     'New grid every midnight: light it up.',
     False),
    ('drags as often as taps — if a tap does nothing',
     'drags as often as taps. If a tap does nothing',
     'drags as often as taps: if a tap does nothing',
     False),
    ('</a> — our own free browser puzzle',
     '</a>, our own free browser puzzle',
     '</a>: our own free browser puzzle',
     False),
]

# ------------------------------------------------------- bp3 页面独有句（逐条手写）
BP3_SPECIFIC = {
'src/pages/brain-puzzle-3-level-1/index.astro': [
 ('swing on a left swipe — the two moves the cards describe worst.',
  'swing on a left swipe, the two moves the cards describe worst.'),
],
'src/pages/brain-puzzle-3-level-137/index.astro': [
 ('once the third one has come off — thirty kilos across three passengers is enough and twenty is not.',
  'once the third one has come off. Thirty kilos across three passengers is enough and twenty is not.'),
 ('<li>Rear passenger, then the middle seat, then the front — three taps, ten kilos each.</li>',
  '<li>Rear passenger, then the middle seat, then the front. Three taps, ten kilos each.</li>'),
 ('No hints, no drags, nothing to combine — three taps and the polaroid screen.',
  'No hints, no drags, nothing to combine: three taps and the polaroid screen.'),
],
'src/pages/brain-puzzle-3-level-19/index.astro': [
 ('and the move that finishes the level is a drag — pull it aside and the phone with the dating profile is underneath.',
  'and the move that finishes the level is a drag: pull it aside and the phone with the dating profile is underneath.'),
],
'src/pages/brain-puzzle-3-level-2/index.astro': [
 ('Soup, cat, spray, poster, tub, unit, clothes — the fix is a stack of small inputs rather than one clever idea.',
  'Soup, cat, spray, poster, tub, unit, clothes. The fix is a stack of small inputs rather than one clever idea.'),
 ('then a left swipe on the panel underneath it — two separate gestures on a single appliance.',
  'then a left swipe on the panel underneath it: two separate gestures on a single appliance.'),
],
'src/pages/brain-puzzle-3-level-28/index.astro': [
 ('That builds a habit — find an object, drag it to the ghost — which the level breaks at steps 6, 7 and 9.',
  'That builds a habit (find an object, drag it to the ghost), which the level breaks at steps 6, 7 and 9.'),
],
'src/pages/brain-puzzle-3-level-3/index.astro': [
 ('The door is clicked before it is ready — the instruction says so outright — and a player who treats the door',
  'The door is clicked before it is ready (the instruction says so outright), and a player who treats the door'),
 ('which makes the inconsistency harder to spot — two doors, two cards apart',
  'which makes the inconsistency harder to spot. Two doors, two cards apart'),
],
'src/pages/brain-puzzle-3-level-38/index.astro': [
 ('then back to the girl in step 13 — once as a gift, once as a thaw, once as what is left over.',
  'then back to the girl in step 13 (once as a gift, once as a thaw, once as what is left over).'),
 ('Nothing in the pile hints that a board was broken — the damage shows on the board itself.',
  'Nothing in the pile hints that a board was broken. The damage shows on the board itself.'),
],
'src/pages/brain-puzzle-3-level-34/index.astro': [
 ('The step list uses three words for one action — tap, click and double tap — and then two more for swipes',
  'The step list uses three words for one action (tap, click and double tap), and then two more for swipes'),
],
'src/pages/brain-puzzle-3-level-37/index.astro': [
 ("and the pen starts in the man in white's pocket — but the pen's destination is the bottom of the screen",
  "and the pen starts in the man in white's pocket. But the pen's destination is the bottom of the screen"),
],
'src/pages/brain-puzzle-3-level-40/index.astro': [
 ('Four drags land on the dog and the puppy together — the food, the wolf photo, the mushroom lifted off the poster and the fan — which makes the dog',
  'Four drags land on the dog and the puppy together (the food, the wolf photo, the mushroom lifted off the poster and the fan), which makes the dog'),
 ('three of the eleven moves hand over representations instead of creatures — the level keeps testing',
  'three of the eleven moves hand over representations instead of creatures. The level keeps testing'),
 ('Both breaks sit in the back half of the sequence — the press at step seven, the swipe at step ten — which is why',
  'Both breaks sit in the back half of the sequence (the press at step seven, the swipe at step ten), which is why'),
],
'src/pages/brain-puzzle-3-level-43/index.astro': [
 ('the wand visits eleven targets in a fixed order — dirty floor, coffee,',
  'the wand visits eleven targets in a fixed order (dirty floor, coffee,'),
 ('notebook under the table, begging girl. One object',
  'notebook under the table, begging girl). One object'),
],
'src/pages/brain-puzzle-3-level-44/index.astro': [
 ('trash can and sink — every object the steps name is present.',
  'trash can and sink. Every object the steps name is present.'),
],
'src/pages/brain-puzzle-3-level-45/index.astro': [
 ("and the computer desk with a 'SUPER SALE' screen — the exact odd props the steps use.",
  "and the computer desk with a 'SUPER SALE' screen (the exact odd props the steps use)."),
],
'src/pages/brain-puzzle-3-level-46/index.astro': [
 ('then the book goes to the girl — a chain printed as steps 10 and 11.',
  'then the book goes to the girl, a chain printed as steps 10 and 11.'),
 ("a rightward swipe on the boy's arm — a gesture, not a hand-off.",
  "a rightward swipe on the boy's arm, a gesture, not a hand-off."),
],
'src/pages/brain-puzzle-3-level-47/index.astro': [
 ('The escape beat is visible — the doctor ends up hanging from the ceiling',
  'The escape beat is visible. The doctor ends up hanging from the ceiling'),
 ('so the destination is never the problem — finding the source is.',
  'so the destination is never the problem. Finding the source is.'),
 ('follows him in step 9 — the container becomes the weapon once it has been emptied.',
  'follows him in step 9, and the container becomes the weapon once it has been emptied.'),
 ('The faucet is clicked with nothing to hand over — preparation, not a hit (step 10).',
  'The faucet is clicked with nothing to hand over: preparation, not a hit (step 10).'),
],
'src/pages/brain-puzzle-3-level-49/index.astro': [
 ('labelled Level 42/43/49 by different channels — the older uploads do not match the current order.',
  'labelled Level 42/43/49 by different channels. The older uploads do not match the current order.'),
],
'src/pages/brain-puzzle-3-level-50/index.astro': [
 ('The scene is right — campsite, cold family, camper van, jerrycan, thundercloud — and the finish is on screen',
  'The scene is right (campsite, cold family, camper van, jerrycan, thundercloud), and the finish is on screen'),
 ("shows the in-game label 'LEVEL 44' — the numbering really does drift between channels.",
  "shows the in-game label 'LEVEL 44'. The numbering really does drift between channels."),
],
'src/pages/brain-puzzle-3-level-51/index.astro': [
 ('motorcycle and mushrooms — all the listed props.',
  'motorcycle and mushrooms. All the listed props.'),
],
'src/pages/brain-puzzle-3-level-52/index.astro': [
 ('Copy the opening from the clip — a click, a double tap and a downward swipe in a row',
  'Copy the opening from the clip. A click, a double tap and a downward swipe in a row'),
 ('then its volume knob is swiped right — a part of the thing you just touched',
  'then its volume knob is swiped right (a part of the thing you just touched'),
 ('operate a sub-part. Then the finish',
  'operate a sub-part). Then the finish'),
 ('the cat on the wall — never on the man.',
  'the cat on the wall. Never on the man.'),
],
}

# ------------------------------------------------------------- meowdoku 数据
# (level, field, index) -> (old, new)；field: anchor/close/strategic/trap/step/hint
MD_SPECIFIC = {
 (1, 'anchor', 0): ("both sit in column 6 — so column 6's cat is one of that pair",
                    "both sit in column 6, so column 6's cat is one of that pair"),
 (1, 'step', 1): ('and row 4 empties — R4C1, R4C2, R4C3 and R4C4 are all out.',
                  'and row 4 empties. R4C1, R4C2, R4C3 and R4C4 are all out.'),
 (1, 'close', 0): ('Read the set back — R1C5, R2C1, R3C3, R4C6, R5C4, R6C2 — and every row',
                   'Read the set back (R1C5, R2C1, R3C3, R4C6, R5C4, R6C2), and every row'),
 (1, 'trap', 0): ('R1C5 — where the salmon region cat must live — is dead on arrival.',
                  'R1C5, where the salmon region cat must live, is dead on arrival.'),
 (1, 'hint', 1): ("and both sit in column 6 — so the column's cat is one of that pair",
                  "and both sit in column 6: the column's cat is one of that pair"),
 (2, 'step', 4): ("and R5C5 — row 5's cell outside that column — is out.",
                  "and R5C5, row 5's cell outside that column, is out."),
 (3, 'close', 0): ('none of them in contact — and no step above required you to guess.',
                   'none of them in contact. No step above required you to guess.'),
 (4, 'close', 0): ('Both tests prove a placement the same way — leave the cell empty',
                   'Both tests prove a placement the same way. Leave the cell empty'),
 (4, 'close', 1): ("Two counting steps end the board — R5C4, row 5's only open cell, then R1C5, column 5's only one.",
                   "Two counting steps end the board (R5C4, row 5's only open cell, then R1C5, column 5's only one)."),
 (4, 'trap', 0): ('wiped out in one move — every cell it owns aligns with that spot — same line, or one corner over.',
                  'wiped out in one move: every cell it owns aligns with that spot, same line, or one corner over.'),
 (5, 'anchor', 0): ('and its other cells — R3C4, R3C5, R3C6 — are gone.',
                    'and its other cells (R3C4, R3C5, R3C6) are gone.'),
 (5, 'close', 0): ('That gives R1C2, R2C5, R3C3, R4C1, R5C4, R6C6 — one cat per row',
                   'That gives R1C2, R2C5, R3C3, R4C1, R5C4, R6C6: one cat per row'),
 (5, 'strategic', 0): ('Each contact is a no-touch wall — even the diagonal ones — so a placed cat',
                       'Each contact is a no-touch wall (even the diagonal ones), so a placed cat'),
 (6, 'anchor', 0): ('Eleven cells fail that test in the top three rows — R1C4, R1C6,',
                    'Eleven cells fail that test in the top three rows. R1C4, R1C6,'),
 (6, 'step', 1): ('Columns account for three more — R3C2 would put two cats in column 1',
                  'Columns account for three more. R3C2 would put two cats in column 1'),
 (6, 'step', 2): ("both in row 4 — so row 4's cat is blue",
                  "both in row 4, so row 4's cat is blue"),
 (6, 'hint', 3): ("Salmon's open cells — R1C3, R3C3, R5C3 — all sit in column 3",
                  "Salmon's open cells (R1C3, R3C3, R5C3) all sit in column 3"),
 (6, 'trap', 0): ('Try R5C5 first and the pink region is wiped out in one move — every cell it owns aligns with that spot — same line, or one corner over.',
                  'Try R5C5 first and the pink region is wiped out in one move. Every cell it owns aligns with that spot, same line, or one corner over.'),
 (7, 'anchor', 0): ("sit in column 5 — column 5's cat is green's, so R1C5 and R2C5 are out.",
                    "sit in column 5. Column 5's cat is green's, so R1C5 and R2C5 are out."),
 (7, 'hint', 2): ("both sit in column 5 — so column 5's cat is green's and R1C5, R2C5 are out.",
                  "both sit in column 5, so column 5's cat is green's and R1C5, R2C5 are out."),
 (8, 'step', 2): ('and its four cells outside that column — R5C5, R5C6, R6C5, R6C6 — are out.',
                  'and its four cells outside that column (R5C5, R5C6, R6C5, R6C6) are out.'),
 (8, 'close', 0): ('The finished board reads R1C5, R2C3, R3C6, R4C1, R5C4, R6C2 — one cat per row',
                   'The finished board reads R1C5, R2C3, R3C6, R4C1, R5C4, R6C2. One cat per row'),
 (8, 'hint', 1): ('Cream is three cells — R1C1, R2C3, R3C1 — and R1C1 dies at once',
                  'Cream is three cells (R1C1, R2C3, R3C1), and R1C1 dies at once'),
 (9, 'close', 0): ('Cats on R1C3, R2C6, R3C1, R4C5, R5C2, R6C4 — six of them, one to a row',
                   'Cats on R1C3, R2C6, R3C1, R4C5, R5C2, R6C4. Six of them, one to a row'),
 (9, 'strategic', 0): ('Each contact is a no-touch wall — even the diagonal ones — so a placed cat',
                       'Each contact is a no-touch wall, even the diagonal ones, so a placed cat'),
 (10, 'strategic', 0): ('Each contact is a no-touch wall — even the diagonal ones — so a placed cat',
                        'Each contact is a no-touch wall, even the diagonal ones, so a placed cat'),
 (9, 'hint', 3): ('which is in row 1 and in salmon — both take their cat there',
                  'which is in row 1 and in salmon: both take their cat there'),
 (10, 'step', 1): ("and R6C5 — row 6's cell outside pink — goes with it.",
                   "and R6C5, row 6's cell outside pink, goes with it."),
 (10, 'step', 4): ("pink's cat was already known to be on row 6 — this placement says exactly which cell",
                   "pink's cat was already known to be on row 6: this placement says exactly which cell"),
 (10, 'close', 0): ('four were single cells with only one home left — which is about the mix',
                    'four were single cells with only one home left, which is about the mix'),
 (10, 'trap', 0): ('Try R5C2 first and the lilac region is wiped out in one move — every cell it owns aligns with that spot — same line, or one corner over.',
                   'Try R5C2 first and the lilac region is wiped out in one move: every cell it owns aligns with that spot, same line, or one corner over.'),
 (10, 'hint', 3): ('so R4C5 is the blue cat — and that one placement settles row 4',
                   'so R4C5 is the blue cat. That one placement settles row 4'),
}

RG_PAT = re.compile(r'^(.*) \u2014 (\d+ cells?[^\u2014]*)\.$')
# 每页括号预算（≤2）：非 RG 已经用掉的括号数
PAREN_USED = {1: 1, 2: 0, 3: 0, 4: 1, 5: 2, 6: 1, 7: 0, 8: 2, 9: 0, 10: 1}


def build_bp3():
    files = sorted(glob.glob(os.path.join(BASE, 'src/pages/brain-puzzle-3-level-*/index.astro')))
    written, report = [], []
    for idx, f in enumerate(files):
        rel = os.path.relpath(f, BASE)
        text = open(f, encoding='utf-8').read()
        orig = text
        # 本页独有句先算括号预算（每页新增 ≤2 处）
        parens_used = sum(new.count('(') for _, new in BP3_SPECIFIC.get(rel, []))
        # 模板句：每个模板按文件序号取变体，错开模数让同页手段不雷同
        for t_i, (old, a, b, paren_b) in enumerate(TEMPLATES):
            if old not in text:
                continue
            variant = ((idx // (t_i + 1)) + t_i) % 2
            new = b if variant else a
            if variant and paren_b:
                if parens_used < 2:
                    parens_used += 1
                else:
                    new = a
            assert text.count(old) == 1, (rel, old)
            text = text.replace(old, new)
        # 独有句
        for old, new in BP3_SPECIFIC.get(rel, []):
            assert text.count(old) == 1, (rel, old, text.count(old))
            text = text.replace(old, new)
        if text != orig:
            dst = os.path.join(PROP, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            open(dst, 'w', encoding='utf-8').write(text)
            written.append((rel, orig, text))
    return written


def md_str(lv, field, i=None):
    if field == 'anchor':
        return lv['solve']['anchor']
    if field == 'close':
        return lv['solve']['close']
    if field == 'step':
        return lv['solve']['steps'][i - 1]
    if field == 'strategic':
        return lv['strategic']
    if field == 'trap':
        return lv['trap']
    if field == 'hint':
        return lv['hints'][i - 1]
    raise KeyError(field)


def md_set(lv, field, s, i=None):
    if field == 'anchor':
        lv['solve']['anchor'] = s
    elif field == 'close':
        lv['solve']['close'] = s
    elif field == 'step':
        lv['solve']['steps'][i - 1] = s
    elif field == 'strategic':
        lv['strategic'] = s
    elif field == 'trap':
        lv['trap'] = s
    elif field == 'hint':
        lv['hints'][i - 1] = s
    else:
        raise KeyError(field)


def build_meowdoku():
    p = os.path.join(BASE, 'src/data/meowdoku-levels.json')
    raw = open(p, encoding='utf-8').read()
    levels = json.loads(raw)
    by = {lv['level']: lv for lv in levels}
    # 1) 独有句
    for (n, field, i), (old, new) in MD_SPECIFIC.items():
        s = md_str(by[n], field, i)
        assert s.count(old) == 1, (n, field, i, old)
        md_set(by[n], field, s.replace(old, new), i)
    # 2) regionsGuide「X takes ... — N cells.」：冒号为主，括号补 2 个变体
    for lv in levels:
        n = lv['level']
        budget = 2 - PAREN_USED.get(n, 0)
        hit = 0
        for gi, s in enumerate(lv['regionsGuide']):
            m = RG_PAT.match(s)
            if not m:
                if DASH in s:
                    raise SystemExit('unhandled RG dash L%d: %s' % (n, s))
                continue
            hit += 1
            if budget > 0 and hit % 2 == 0:
                lv['regionsGuide'][gi] = '%s (%s).' % (m.group(1), m.group(2))
                budget -= 1
            else:
                lv['regionsGuide'][gi] = '%s: %s.' % (m.group(1), m.group(2))
        # 剩余 dash 检查
        for field in ('anchor', 'close', 'strategic', 'trap'):
            assert DASH not in md_str(lv, field), (n, field)
        for i in range(1, len(lv['solve']['steps']) + 1):
            assert DASH not in md_str(lv, 'step', i), (n, 'step', i)
        for i in range(1, len(lv['hints']) + 1):
            assert DASH not in md_str(lv, 'hint', i), (n, 'hint', i)
        for s in lv['regionsGuide']:
            assert DASH not in s, (n, s)
    new_raw = json.dumps(levels, ensure_ascii=False, indent=2) + '\n'
    dst = os.path.join(PROP, 'src/data/meowdoku-levels.json')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, 'w', encoding='utf-8').write(new_raw)
    return [('src/data/meowdoku-levels.json', raw, new_raw)]


def make_patch(written):
    chunks = []
    for rel, old, new in sorted(written):
        a = old.splitlines()
        b = new.splitlines()
        diff = list(difflib.unified_diff(a, b, fromfile='a/' + rel, tofile='b/' + rel, lineterm='', n=3))
        if not diff:
            continue
        chunks.append('diff --git a/%s b/%s' % (rel, rel))
        chunks.extend(diff)
    return '\n'.join(chunks) + '\n'


if __name__ == '__main__':
    os.makedirs(PROP, exist_ok=True)
    w1 = build_bp3()
    w2 = build_meowdoku()
    allw = w1 + w2
    patch = make_patch(allw)
    open(os.path.join(OUT, 'changes.patch'), 'w', encoding='utf-8').write(patch)
    print('files written:', len(allw), 'patch lines:', patch.count('\n'))
