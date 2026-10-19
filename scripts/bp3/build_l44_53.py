#!/usr/bin/env python3
"""Build pgm_l44_53.json: steps from pgm_all.html + video picks verified by frame review.

Video picks come from the DeadLox Gaming "Level 44-53" walkthrough series. Number labels in
YouTube titles can drift (the same scene is labelled 39/40/41/44 by different channels), so each
pick was checked against the scene: named objects from the step list had to be visible on screen
before the video was accepted.
"""
import json, re, html

SRC = 'pgm_all.html'
RAW = '_l44_53_raw.json'

CROP = (158, 0, 395, 360)  # kept for reference only; hero images are full 540x360 frames

VERIFY = {
    44: dict(video='GHre1ekBAqI', verified='strong',
             note=("Scene confirmed on screen: green parrot on a perch in a kitchen, mouse hole, "
                   "tooth-fairy painting, oven, broom, gingerbread man, trash can and sink — every "
                   "object the steps name is present. The closing story card ('Polly wants a romantic "
                   "date') marks the level end at 1:15. Frames were sampled every 5 s, so the "
                   "timestamps are accurate to about ±5 s."),
             stamps=[(None, 12, "Main kitchen scene appears — parrot, cookies, mouse hole, tooth-fairy painting"),
                     (None, 45, "Mid-level: parrot carrying cookies back to the perch"),
                     (None, 70, "Cabinet/door open with the stored cookie inside"),
                     (None, 75, "End-of-level story card ('Polly wants a romantic date')")]),
    45: dict(video='o3l_32lfqn8', verified='strong',
             note=("Definitely this level: the frame shows the dental chair, the grandma with missing "
                   "teeth, the dentist, the girl on the stool, the fish tank holding the crab and conch, "
                   "and the computer desk with a 'SUPER SALE' screen — the exact odd props the steps "
                   "use. Late moves were watched on screen (gold at 1:40, fish bone at 1:50, 'Completed' "
                   "at 1:55). Timestamps are ±5 s."),
             stamps=[(None, 5, "Dental clinic opens — grandma in the chair, 'Open your mouth!'"),
                     (20, 100, "Gold from behind the sign goes into grandma's mouth"),
                     (22, 110, "Fish bone pulled from under her tongue"),
                     (None, 113, "'Completed' banner")]),
    46: dict(video='5BTnI8TLD4c', verified='strong',
             note=("Scene confirmed: classroom with the pink-haired girl on the left, the boy in the "
                   "middle, the girl with glasses on the right, and the blackboard with the spider. The "
                   "boy's thought bubble and the closing line 'Stop arguing with each other because of "
                   "me' match this level's ending. Timestamps ±5 s."),
             stamps=[(None, 5, "Classroom opens — pink-haired girl, boy, girl with glasses, blackboard"),
                     (11, 100, "'Silly, let me teach you this question' — the filled-in book delivered"),
                     (None, 103, "'Completed' banner with the whole class gathered round the boy")]),
    47: dict(video='pcnrYyNCoPU', verified='strong',
             note=("Scene confirmed: girl strapped to the operating chair, doctor in a lab coat with a "
                   "syringe, biohazard trash can, surgical light and sink. The escape beat is visible — "
                   "the doctor ends up hanging from the ceiling and the girl runs down the corridor. "
                   "Timestamps ±5 s."),
             stamps=[(None, 5, "Girl wakes strapped to the chair, doctor approaches"),
                     (None, 60, "Doctor hangs from the ceiling, girl free of the straps"),
                     (None, 65, "Girl runs down the corridor — level over")]),
    48: dict(video='5ZouNdyM7FE', verified='strong',
             note=("Scene confirmed on a full frame: the girl is perched on the chimney breast above the "
                   "burning fireplace while the uncle stands at the open window, with the air conditioner, "
                   "curtains, fridge, framed poster and sofa all visible. Closing beats 'Escaped disaster' "
                   "(1:35) and 'Completed' (1:40) are on screen. Timestamps ±5 s."),
             stamps=[(None, 40, "Girl hiding on the chimney breast, uncle at the open window, AC and fridge"),
                     (None, 95, "'Escaped disaster' — the fire is out"),
                     (None, 97, "'Completed' banner")]),
    49: dict(video='Onlyg3fwByE', verified='strong',
             note=("Scene confirmed: small boat with water gushing through the hull, the shark wearing a "
                   "bib and holding a fork and knife, life buoy, anchor and coral in the water. Late moves "
                   "were watched in order (fork deflates the buoy at 1:05, buoy plugs the hole at 1:10, "
                   "coral over the hole at 1:15, rescue helicopter at 1:20). Note that this level is "
                   "labelled Level 42/43/49 by different channels — the older uploads do not match the "
                   "current order."),
             stamps=[(1, 20, "Plank over the leak — 'The wooden board should still block it for a while'"),
                     (8, 65, "Shark's fork punctures the life buoy"),
                     (9, 70, "Deflated buoy plugs the hole; anchor hooked onto the coral"),
                     (11, 75, "Coral dragged over the hole"),
                     (None, 80, "Rescue helicopter arrives — 'I'm over here!'")]),
    50: dict(video='ecDtTpNm-pM', verified='weak',
             note=("The scene is right — campsite, cold family, camper van, jerrycan, thundercloud — and "
                   "the finish is on screen (lightning hits the fire at 0:45, bigger fire at 1:15, "
                   "'Completed' at 1:20). The frame-by-frame read of the item order was too unclear to "
                   "confirm the logged step list, so treat the step order below as the written source "
                   "order and the timestamps as rough anchors. A second upload of this level, "
                   "'C8pWeui_pJc', shows the in-game label 'LEVEL 44' — the numbering really does drift "
                   "between channels."),
             stamps=[(None, 5, "Campsite: family shivering around a small fire, camper van and jerrycan"),
                     (10, 45, "Lightning from the thundercloud hits the campfire"),
                     (None, 75, "Fire visibly bigger — 'The fire is bigger now'"),
                     (None, 77, "'Completed' screen")]),
    51: dict(video='bA-Xx-dvteQ', verified='strong',
             note=("Scene confirmed: family by a wooden house with a garage, brown bear, deflated tyre, "
                   "pump, balloon, paint, ninja outfit, motorcycle and mushrooms — all the listed props. "
                   "Late moves were seen in order (garage opens at 1:05, mushroom/grandma at 1:10, "
                   "'Completed' at 1:20). Timestamps ±5 s."),
             stamps=[(3, 15, "Inflated balloon handed to the younger brother"),
                     (6, 30, "Older brother in the ninja outfit"),
                     (10, 65, "Garage opens, motorcycle revealed"),
                     (14, 70, "Mushroom to grandma — the bear ends up in a flower crown"),
                     (None, 78, "'Completed' screen")]),
    52: dict(video='tXtUyXJohQ8', verified='strong',
             note=("Scene confirmed: cabin interior with the dark monster, the hiding man, laptop, "
                   "headphones, radio, antlers and the stove pipe. The first four moves are easy to read "
                   "on screen (speaker clicked at 0:10, window at 0:20, laptop at 0:30, headphones at "
                   "0:40) and 'Completed' lands at 2:25. Timestamps ±5 s."),
             stamps=[(1, 10, "Speaker on the wall clicked off"),
                     (2, 20, "Window double-tapped open"),
                     (3, 30, "Laptop swiped down, screen off"),
                     (4, 40, "Headphones put on the monster"),
                     (None, 138, "Monster stands over the fallen man"),
                     (None, 143, "'Completed' screen")]),
    53: dict(video='wINSLsJC5to', verified='strong',
             note=("Scene confirmed: pink vanity room, white-haired makeup artist, clients queueing, "
                   "window with clouds outside. Late moves were watched (self-tanner at 1:45, rainbow at "
                   "2:00 giving the artist rainbow hair, group-photo line at 2:10). This upload also "
                   "shows a couple of rejected items early on, so the early timestamps are anchors "
                   "rather than an exact 1:1 map of the step list."),
             stamps=[(11, 105, "Self-tanner applied to the second client"),
                     (14, 120, "Rainbow dragged in — artist ends with rainbow hair ('Gotta have my own signature style')"),
                     (None, 130, "'Ladies, if you're happy, let's take a group photo!' — level over")]),
}

SUMMARY_TAIL = (" Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.")


def main():
    raw = json.load(open(RAW, encoding='utf-8'))
    h = open(SRC, encoding='utf-8').read()
    parts = re.split(r'<h3>(\d+)\.\s*([^<]*)</h3>', h)
    levels = {int(parts[i]): (html.unescape(parts[i + 1]).strip(), parts[i + 2])
              for i in range(1, len(parts), 3)}

    out = {}
    for n in range(44, 54):
        src_name, body = levels[n]
        goal = re.search(r'<p class="bp3-goal">(.*?)</p>', body, re.S)
        assert goal, n
        goal_txt = html.unescape(re.sub(r'<[^>]+>', '', goal.group(1))).strip()
        goal_txt = re.sub(r'^Goal:\s*', '', goal_txt).strip()
        steps = [html.unescape(re.sub(r'<[^>]+>', '', m)).strip()
                 for m in re.findall(r'<span class="bp3-hint-text">(.*?)</span>', body, re.S)]

        # cross-check with the raw extraction so nothing is silently dropped
        assert raw[str(n)]['name'] == src_name, (n, raw[str(n)]['name'], src_name)
        assert raw[str(n)]['steps'] == steps, n
        assert len(steps) >= 10, (n, len(steps))

        v = VERIFY[n]
        stamps = [{'step': s, 't': f'{sec // 60}:{sec % 60:02d}', 'sec': sec, 'label': lab}
                  for s, sec, lab in v['stamps']]
        out[str(n)] = {
            'name': src_name,
            'title': src_name,
            'goal': goal_txt,
            'video_id': v['video'],
            'verified': v['verified'],
            'verify_note': v['note'],
            'timestamps': stamps,
            'hero': f'l{n}_hero.jpg',
            'summary': (f'Brain Puzzle 3 Level {n} is "{src_name}": {goal_txt.rstrip(".")}. '
                        f'{len(steps)} moves in order, listed below and shown in the embedded walkthrough.'
                        f'{SUMMARY_TAIL}'),
            'steps': steps,
        }

    assert len(out) == 10
    json.dump(out, open('pgm_l44_53.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
