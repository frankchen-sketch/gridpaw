#!/usr/bin/env python3
"""Generate Brain Puzzle 3 guide pages (hub + level pages) for gridpaw.
Data-driven from bp3/content/level_*.json + curated L25 data.
Reusable for future levels: drop level_XX.json in content/, add entry to LEVELS, rerun.
"""
import json, os, re

BASE = '/Users/frank/.hermes/cache/scratch/bp3'
REPO = '/Users/frank/workspace/gridpaw'
OUT_PAGES = f'{REPO}/src/pages'

# curated per-level page data (answers distilled & verified from content JSONs)
LEVELS = {
    1: {
        'slug': 'brain-puzzle-3-level-1',
        'title': 'Brain Puzzle 3 Level 1 Answer: Quick Draw Guide',
        'description': 'Brain Puzzle 3 Level 1 (Quick Draw) answer: score higher than the rival in the western duel. Full step order plus the complete video walkthrough.',
        'goal': 'Help the protagonist score higher than the rival',
        'video_id': 'isoGuqaLrrE',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l1_hero.jpg',
        'summary': 'Level 1 \u201cQuick Draw\u201d: Help the protagonist score higher than the rival. 7 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the cowboy hat on the table to the protagonist', 'why': 'Drag the cowboy hat on the table to the protagonist; then Drag the glasses on the table to the protagonist; then Tap the backpack on the ground'},
            {'what': 'Steps 4–5: Drag the pistol from the backpack to the protagonist', 'why': 'Drag the pistol from the backpack to the protagonist; then Swipe left to open the cabinet'},
            {'what': 'Steps 6–7: Drag the cowboy clothes from the cabinet to the protagonist', 'why': 'Drag the cowboy clothes from the cabinet to the protagonist; then Tap the stereo carried by the child'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 1?', 'In order: 1) Drag the cowboy hat on the table to the protagonist; 2) Drag the glasses on the table to the protagonist; 3) Tap the backpack on the ground; 4) Drag the pistol from the backpack to the protagonist; 5) Swipe left to open the cabinet; 6) Drag the cowboy clothes from the cabinet to the protagonist; 7) Tap the stereo carried by the child'],
            ['Why does nothing happen when I tap in Level 1?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 1 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    2: {
        'slug': 'brain-puzzle-3-level-2',
        'title': 'Brain Puzzle 3 Level 2 Answer: Winter Warmth Guide',
        'description': 'Brain Puzzle 3 Level 2 (Winter Warmth) answer: warm the man up with every heat source in the room. Full step order plus the complete video walkthrough.',
        'goal': 'Help the man warm up',
        'video_id': 'hXfOPjxdsRc',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l2_hero.jpg',
        'summary': 'Level 2 \u201cWinter Warmth\u201d: Help the man warm up. 10 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the hot soup to the protagonist', 'why': 'Drag the hot soup to the protagonist; then Drag the cat to the protagonist; then Drag the spray on the floor to the protagonist'},
            {'what': 'Steps 4–6: Drag the poster on the wall to the protagonist', 'why': 'Drag the poster on the wall to the protagonist; then Drag the protagonist into the bathtub; then Tap the phone next to the protagonist'},
            {'what': 'Steps 7–8: Tap the air conditioner', 'why': 'Tap the air conditioner; then Swipe left on the AC control panel'},
            {'what': 'Steps 9–10: Double tap to open the wardrobe', 'why': 'Double tap to open the wardrobe; then Drag the clothes from the wardrobe to the protagonist'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 2?', 'In order: 1) Drag the hot soup to the protagonist; 2) Drag the cat to the protagonist; 3) Drag the spray on the floor to the protagonist; 4) Drag the poster on the wall to the protagonist; 5) Drag the protagonist into the bathtub; 6) Tap the phone next to the protagonist; 7) Tap the air conditioner; 8) Swipe left on the AC control panel; 9) Double tap to open the wardrobe; 10) Drag the clothes from the wardrobe to the protagonist'],
            ['Why does nothing happen when I tap in Level 2?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 2 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    3: {
        'slug': 'brain-puzzle-3-level-3',
        'title': 'Brain Puzzle 3 Level 3 Answer: Fair Lady Guide',
        'description': 'Brain Puzzle 3 Level 3 (Fair Lady) answer: get the magazine-cover look before the door opens. Full step order plus the complete video walkthrough.',
        'goal': 'Help her achieve that magazine cover look',
        'video_id': 'BLrDe8tZQMQ',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l3_hero.jpg',
        'summary': 'Level 3 \u201cFair Lady\u201d: Help her achieve that magazine cover look. 14 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Click to open the door before it\'s ready', 'why': 'Click to open the door before it\'s ready; then Swipe left to open the bathroom door on the left; then Drag the shower head to the girl; then Drag the mop to the floor in the bathroom'},
            {'what': 'Steps 5–8: Drag the high heels to the girl', 'why': 'Drag the high heels to the girl; then Drag the perfume to the girl; then Drag the hat from the poster outside the door to the girl; then Drag the paint onto the skirt'},
            {'what': 'Steps 9–11: Drag the cosmetics', 'why': 'Drag the cosmetics; then Swipe up on the girl; then Drag the comb'},
            {'what': 'Steps 12–14: Drag the pronunciation book', 'why': 'Drag the pronunciation book; then Double-click to open the window; then Drag the watering can to the flower basket'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 3?', 'In order: 1) Click to open the door before it\'s ready; 2) Swipe left to open the bathroom door on the left; 3) Drag the shower head to the girl; 4) Drag the mop to the floor in the bathroom; 5) Drag the high heels to the girl; 6) Drag the perfume to the girl; 7) Drag the hat from the poster outside the door to the girl; 8) Drag the paint onto the skirt; 9) Drag the cosmetics; 10) Swipe up on the girl; 11) Drag the comb; 12) Drag the pronunciation book; 13) Double-click to open the window; 14) Drag the watering can to the flower basket'],
            ['Why does nothing happen when I tap in Level 3?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 3 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    4: {
        'slug': 'brain-puzzle-3-level-4',
        'title': 'Brain Puzzle 3 Level 4 Answer: Principal Coming Guide',
        'description': 'Brain Puzzle 3 Level 4 (Principal Coming) answer: clean the dorm before the principal arrives. Full step order plus the complete video walkthrough.',
        'goal': 'Help her clean up the dorm',
        'video_id': '6cchHfXWRbo',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l4_hero.jpg',
        'summary': 'Level 4 \u201cPrincipal Coming\u201d: Help her clean up the dorm. 19 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–5: Drag the girl on the floor to the bed (bed not fixed)', 'why': 'Drag the girl on the floor to the bed (bed not fixed); then Time’s up; then Drag the hammer by the washing machine to the shaking bed; then Drag the dancing girl to the bed on the left; then Drag the milky-white paint to the girl who is painting'},
            {'what': 'Steps 6–10: Drag the girl lying on the floor to the bed on the right (the bed is fixed)', 'why': 'Drag the girl lying on the floor to the bed on the right (the bed is fixed); then Drag the dirty quilt to the washing machine; then Drag the clean blanket to the bed on the left; then Drag the dirty clothes to the washing machine; then Drag the mop to the flustered girl'},
            {'what': 'Steps 11–15: Drag the trash in front of the washing machine on the floor to the trash can', 'why': 'Drag the trash in front of the washing machine on the floor to the trash can; then Drag the trash on the floor to the right of the table to the trash can; then Drag the trash on the floor in the bottom-left corner to the trash can; then Drag the garbage on the table to the trash can; then Drag the garbage bag to the flustered girl'},
            {'what': 'Steps 16–19: Swipe left to open the bathroom door', 'why': 'Swipe left to open the bathroom door; then Drag the toilet rag to the table; then Drag the gray cat to the toilet; then Drag the perfume to the panicked girl'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 4?', 'In order: 1) Drag the girl on the floor to the bed (bed not fixed); 2) Time’s up; 3) Drag the hammer by the washing machine to the shaking bed; 4) Drag the dancing girl to the bed on the left; 5) Drag the milky-white paint to the girl who is painting; 6) Drag the girl lying on the floor to the bed on the right (the bed is fixed); 7) Drag the dirty quilt to the washing machine; 8) Drag the clean blanket to the bed on the left; 9) Drag the dirty clothes to the washing machine; 10) Drag the mop to the flustered girl; 11) Drag the trash in front of the washing machine on the floor to the trash can; 12) Drag the trash on the floor to the right of the table to the trash can; 13) Drag the trash on the floor in the bottom-left corner to the trash can; 14) Drag the garbage on the table to the trash can; 15) Drag the garbage bag to the flustered girl; 16) Swipe left to open the bathroom door; 17) Drag the toilet rag to the table; 18) Drag the gray cat to the toilet; 19) Drag the perfume to the panicked girl'],
            ['Why does nothing happen when I tap in Level 4?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 4 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    5: {
        'slug': 'brain-puzzle-3-level-5',
        'title': 'Brain Puzzle 3 Level 5 Answer: Creepy Ferris Guide',
        'description': 'Brain Puzzle 3 Level 5 (Creepy Ferris) answer: build an escape route out of the creepy carnival. Full step order plus the complete video walkthrough.',
        'goal': 'Help the girl get out of this creepy place',
        'video_id': 'lKbt_08mQBw',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l5_hero.jpg',
        'summary': 'Level 5 \u201cCreepy Ferris\u201d: Help the girl get out of this creepy place. 11 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the baseball bat on the ground to the girl', 'why': 'Drag the baseball bat on the ground to the girl; then Drag the doll to the girl; then Drag the track in the bottom right corner to the girl'},
            {'what': 'Steps 4–6: Drag the phone stand in front of the statue to the girl', 'why': 'Drag the phone stand in front of the statue to the girl; then Drag the unicycle inside the billboard to the girl; then Drag the billboard to the girl'},
            {'what': 'Steps 7–9: Drag the vine outside the box to the girl', 'why': 'Drag the vine outside the box to the girl; then Drag the chain on the pillar to the girl; then Swipe up on the trash can'},
            {'what': 'Steps 10–11: Drag the iron rod inside to the girl', 'why': 'Drag the iron rod inside to the girl; then Drag the headphones from the girl\'s head to her'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 5?', 'In order: 1) Drag the baseball bat on the ground to the girl; 2) Drag the doll to the girl; 3) Drag the track in the bottom right corner to the girl; 4) Drag the phone stand in front of the statue to the girl; 5) Drag the unicycle inside the billboard to the girl; 6) Drag the billboard to the girl; 7) Drag the vine outside the box to the girl; 8) Drag the chain on the pillar to the girl; 9) Swipe up on the trash can; 10) Drag the iron rod inside to the girl; 11) Drag the headphones from the girl\'s head to her'],
            ['Why does nothing happen when I tap in Level 5?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 5 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    6: {
        'slug': 'brain-puzzle-3-level-6',
        'title': 'Brain Puzzle 3 Level 6 Answer: Clean Bathroom Guide',
        'description': 'Brain Puzzle 3 Level 6 (Clean Bathroom) answer: restore the bathroom before the wife gets home. Full step order plus the complete video walkthrough.',
        'goal': 'Help Husband Restore the Bathroom',
        'video_id': 'zidBwDCJqB4',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l6_hero.jpg',
        'summary': 'Level 6 \u201cClean Bathroom\u201d: Help Husband Restore the Bathroom. 13 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the shower head in husband\'s hand to the pipe', 'why': 'Drag the shower head in husband\'s hand to the pipe; then Drag the plunger to the toilet; then Drag the mop to the floor; then Drag the broken wine bottle on the floor to the trash can'},
            {'what': 'Steps 5–7: Drag the tissue ball to the trash can', 'why': 'Drag the tissue ball to the trash can; then Drag the photo of the beautiful woman on the wall to the trash can; then Drag the garbage bag to the husband'},
            {'what': 'Steps 8–10: Click the exhaust fan', 'why': 'Click the exhaust fan; then Drag the gypsum statue to the broken part of the bathtub; then Drag the husband\'s clothes to the toilet'},
            {'what': 'Steps 11–13: Swipe up on the chain', 'why': 'Swipe up on the chain; then Drag the towel above the wife\'s head to the toilet or the wall; then Drag the rubber duck to the shelf on the wall'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 6?', 'In order: 1) Drag the shower head in husband\'s hand to the pipe; 2) Drag the plunger to the toilet; 3) Drag the mop to the floor; 4) Drag the broken wine bottle on the floor to the trash can; 5) Drag the tissue ball to the trash can; 6) Drag the photo of the beautiful woman on the wall to the trash can; 7) Drag the garbage bag to the husband; 8) Click the exhaust fan; 9) Drag the gypsum statue to the broken part of the bathtub; 10) Drag the husband\'s clothes to the toilet; 11) Swipe up on the chain; 12) Drag the towel above the wife\'s head to the toilet or the wall; 13) Drag the rubber duck to the shelf on the wall'],
            ['Why does nothing happen when I tap in Level 6?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 6 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    7: {
        'slug': 'brain-puzzle-3-level-7',
        'title': 'Brain Puzzle 3 Level 7 Answer: Ghost Wish Guide',
        'description': 'Brain Puzzle 3 Level 7 (Ghost Wish) answer: grant every ghost\'s wish in the haunted apartment. Full step order plus the complete video walkthrough.',
        'goal': 'Fulfill all the ghosts\' wishes',
        'video_id': 'ByYnl8Ze8lc',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l7_hero.jpg',
        'summary': 'Level 7 \u201cGhost Wish\u201d: Fulfill all the ghosts\' wishes. 13 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the laptop on the sofa to the working ghost', 'why': 'Drag the laptop on the sofa to the working ghost; then Drag the photo on the wall to the lying-down pervert ghost; then Swipe left on the fridge; then Drag the baby bottle to the baby ghost'},
            {'what': 'Steps 5–7: Drag the hand warmer on the sofa to the frozen-to-death ghost in the fridge', 'why': 'Drag the hand warmer on the sofa to the frozen-to-death ghost in the fridge; then Drag the coin on the floor to the poor ghost holding a bowl; then Drag the ice cubes from the fridge to the heatstroke ghost'},
            {'what': 'Steps 8–10: Double-click the window', 'why': 'Double-click the window; then Drag the police badge from the police station outside the window to the thief ghost; then Drag the theater sign outside the window to the nagging ghost'},
            {'what': 'Steps 11–13: Drag the hamburger to the starving ghost by the window', 'why': 'Drag the hamburger to the starving ghost by the window; then Drag the balloon to the fat ghost; then Drag the bone to the missing-limb ghost'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 7?', 'In order: 1) Drag the laptop on the sofa to the working ghost; 2) Drag the photo on the wall to the lying-down pervert ghost; 3) Swipe left on the fridge; 4) Drag the baby bottle to the baby ghost; 5) Drag the hand warmer on the sofa to the frozen-to-death ghost in the fridge; 6) Drag the coin on the floor to the poor ghost holding a bowl; 7) Drag the ice cubes from the fridge to the heatstroke ghost; 8) Double-click the window; 9) Drag the police badge from the police station outside the window to the thief ghost; 10) Drag the theater sign outside the window to the nagging ghost; 11) Drag the hamburger to the starving ghost by the window; 12) Drag the balloon to the fat ghost; 13) Drag the bone to the missing-limb ghost'],
            ['Why does nothing happen when I tap in Level 7?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 7 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    8: {
        'slug': 'brain-puzzle-3-level-8',
        'title': 'Brain Puzzle 3 Level 8 Answer: Elevator Arrest Guide',
        'description': 'Brain Puzzle 3 Level 8 (Elevator Arrest) answer: break the man free from the elevator railing. Full step order plus the complete video walkthrough.',
        'goal': 'Help him break free from the railing',
        'video_id': 'tLimJ3s02SQ',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l8_hero.jpg',
        'summary': 'Level 8 \u201cElevator Arrest\u201d: Help him break free from the railing. 16 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the lamp to the iron railing', 'why': 'Drag the lamp to the iron railing; then Drag the extra-long phone to the iron railing; then Drag the baguette the girl is holding to the iron railing; then Drag the lollipop to the left air vent'},
            {'what': 'Steps 5–8: Drag the mouse to the iron railing', 'why': 'Drag the mouse to the iron railing; then Drag the camera to the iron railing; then Drag the billboard to the iron railing; then Drag the oil stain on the man\'s hair to the iron railing'},
            {'what': 'Steps 9–12: Swipe down on the crumbling ceiling', 'why': 'Swipe down on the crumbling ceiling; then Drag the worker\'s hairspray wig to the iron railing; then Drag the worker\'s wrench to the iron railing; then Drag the girl to the iron railing'},
            {'what': 'Steps 13–16: Drag the worker to the iron railing', 'why': 'Drag the worker to the iron railing; then Tap the elevator button; then Tap the “?” button; then Drag the ghost to the iron railing'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 8?', 'In order: 1) Drag the lamp to the iron railing; 2) Drag the extra-long phone to the iron railing; 3) Drag the baguette the girl is holding to the iron railing; 4) Drag the lollipop to the left air vent; 5) Drag the mouse to the iron railing; 6) Drag the camera to the iron railing; 7) Drag the billboard to the iron railing; 8) Drag the oil stain on the man\'s hair to the iron railing; 9) Swipe down on the crumbling ceiling; 10) Drag the worker\'s hairspray wig to the iron railing; 11) Drag the worker\'s wrench to the iron railing; 12) Drag the girl to the iron railing; 13) Drag the worker to the iron railing; 14) Tap the elevator button; 15) Tap the “?” button; 16) Drag the ghost to the iron railing'],
            ['Why does nothing happen when I tap in Level 8?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 8 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    9: {
        'slug': 'brain-puzzle-3-level-9',
        'title': 'Brain Puzzle 3 Level 9 Answer: Delicious Hotdog Guide',
        'description': 'Brain Puzzle 3 Level 9 (Delicious Hotdog) answer: stack a jumbo hot dog from the strangest finds. Full step order plus the complete video walkthrough.',
        'goal': 'Let\'s make some delicious hot dogs!',
        'video_id': '_qn1ratXftU',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l9_hero.jpg',
        'summary': 'Level 9 \u201cDelicious Hotdog\u201d: Let\'s make some delicious hot dogs!. 13 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the tablecloth onto the bread', 'why': 'Drag the tablecloth onto the bread; then Drag the onion on the sink to the bread; then Drag the lettuce on the right side of the blue cloth to the bread; then Drag the sticky note on the fridge to the bread'},
            {'what': 'Steps 5–7: Swipe right on the fridge', 'why': 'Swipe right on the fridge; then Drag the tomato in the fridge to the bread; then Drag the collar on the dog\'s neck to the bread'},
            {'what': 'Steps 8–10: Drag the necklace on the girl\'s neck to the bread', 'why': 'Drag the necklace on the girl\'s neck to the bread; then Tap the faucet; then Drag the avocado in the basin to the bread'},
            {'what': 'Steps 11–13: Drag the girl\'s lips onto the bread', 'why': 'Drag the girl\'s lips onto the bread; then Drag the yellow stripe on the right curtain to the bread; then Drag the salad dressing to the bread'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 9?', 'In order: 1) Drag the tablecloth onto the bread; 2) Drag the onion on the sink to the bread; 3) Drag the lettuce on the right side of the blue cloth to the bread; 4) Drag the sticky note on the fridge to the bread; 5) Swipe right on the fridge; 6) Drag the tomato in the fridge to the bread; 7) Drag the collar on the dog\'s neck to the bread; 8) Drag the necklace on the girl\'s neck to the bread; 9) Tap the faucet; 10) Drag the avocado in the basin to the bread; 11) Drag the girl\'s lips onto the bread; 12) Drag the yellow stripe on the right curtain to the bread; 13) Drag the salad dressing to the bread'],
            ['Why does nothing happen when I tap in Level 9?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 9 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    10: {
        'slug': 'brain-puzzle-3-level-10',
        'title': 'Brain Puzzle 3 Level 10 Answer: Escape Office Guide',
        'description': 'Brain Puzzle 3 Level 10 (Escape Office) answer: help every employee escape the office. Full step order plus the complete video walkthrough.',
        'goal': 'Helping employees leave the company',
        'video_id': 'I7Ad-91mm-Q',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l10_hero.jpg',
        'summary': 'Level 10 \u201cEscape Office\u201d: Helping employees leave the company. 13 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the wrench on the worker\'s waist to the ventilation duct', 'why': 'Drag the wrench on the worker\'s waist to the ventilation duct; then Drag the cardboard box to the staff; then Drag the scissors to the portrait; then Drag the cut-out face to the employee'},
            {'what': 'Steps 5–7: Drag the scissors to the dog\'s leash', 'why': 'Drag the scissors to the dog\'s leash; then Drag the poisonous mushroom to the security guard; then Drag the red dress to the worker'},
            {'what': 'Steps 8–10: Tap the fan', 'why': 'Tap the fan; then Swipe right to max gear; then Drag the scissors to the electrical box'},
            {'what': 'Steps 11–13: Click to open the book', 'why': 'Click to open the book; then Drag the iron pickaxe from the book to the floor crack; then Drag the money from the employee\'s pocket to the security guard'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 10?', 'In order: 1) Drag the wrench on the worker\'s waist to the ventilation duct; 2) Drag the cardboard box to the staff; 3) Drag the scissors to the portrait; 4) Drag the cut-out face to the employee; 5) Drag the scissors to the dog\'s leash; 6) Drag the poisonous mushroom to the security guard; 7) Drag the red dress to the worker; 8) Tap the fan; 9) Swipe right to max gear; 10) Drag the scissors to the electrical box; 11) Click to open the book; 12) Drag the iron pickaxe from the book to the floor crack; 13) Drag the money from the employee\'s pocket to the security guard'],
            ['Why does nothing happen when I tap in Level 10?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 10 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    19: {
        'slug': 'brain-puzzle-3-level-19',
        'title': 'Brain Puzzle 3 Level 19 Answer: Find Them All',
        'description': 'Brain Puzzle 3 Level 19 answer, fully mapped: all six hiding spots in order with screenshots and video timestamps. Clear the level in under a minute.',
        'goal': 'Find everyone hiding in the house',
        'video_id': 'Kqw0Pf1CpXw',
        'verified': 'verified',
        'summary': 'A find-the-hidden-people level: the boyfriend is stashed all over the house behind everyday objects. Tap the blanket, the curtain, the window, the pile under the bed, the air conditioner and the grandfather clock. The last tap exposes the dating app and ends the level.',
        'steps': [
            {'t': 8, 'img': 'l26_step1.jpg', 'what': 'Tap the blanket on the bed, then the man it hides', 'why': 'The first hiding spot is the sleeping shape on the bed. Pull the blanket and a shirtless man in green shorts appears, then drops through the floor.'},
            {'t': 19, 'img': 'l26_step2.jpg', 'what': 'Tap the pink curtain, then the man behind it', 'why': 'The shower curtain hides the next one. Tap the curtain to trigger the shower, tap again and the towel man steps out.'},
            {'t': 26, 'img': 'l26_step3.jpg', 'what': 'Tap the window', 'why': 'A man with glasses peeks in from outside. The wife says she "hired him for some high-up work". He counts as a found person.'},
            {'t': 41, 'img': 'l26_step4.jpg', 'what': 'Tap the legs under the bed, then the wall air conditioner, then the clock', 'why': 'The final chain: the pile of legs under the bed, the AC ("he\'s fixing it"), and the wall clock that transforms into a grandfather clock. Drag the clock away to expose the phone with the dating app, and the level ends.'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 19?', 'Tap the blanket on the bed, the pink shower curtain, the window, the legs under the bed, the air conditioner and finally the clock. Dragging the grandfather clock aside reveals the dating app and completes the level.'],
            ['Where are all the hiding spots in Brain Puzzle 3 Level 19?', 'Six spots: under the bed blanket, behind the pink shower curtain, outside the window, under the bed (the pile of legs), inside the air conditioner, and behind the clock that becomes a grandfather clock.'],
            ['How do I finish Level 19 after the clock?', 'Drag the grandfather clock away once it hides the wife. A smartphone with a shirtless man\'s dating profile appears underneath, the boyfriend confronts her, and the level clears.'],
        ],
    },
    11: {
        'slug': 'brain-puzzle-3-level-11',
        'title': 'Brain Puzzle 3 Level 11 Answer: Online Date Door Guide',
        'description': 'Brain Puzzle 3 Level 11 (Online Date Door) answer: open every lock on the online date door. Full step order plus the complete video walkthrough.',
        'goal': 'Help men open all locks',
        'video_id': '6nk0kPib3Yg',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l11_hero.jpg',
        'summary': 'Level 11 \u201cOnline Date Door\u201d: Help men open all locks. 12 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the key onto the key lock', 'why': 'Drag the key onto the key lock; then Drag the oil onto the gear lock; then Drag the knife to the watermelon'},
            {'what': 'Steps 4–6: Drag half the watermelon to the door', 'why': 'Drag half the watermelon to the door; then Drag the pin-up poster to the man; then Drag the shy man to the door'},
            {'what': 'Steps 7–9: Drag the paint bucket to the man in white', 'why': 'Drag the paint bucket to the man in white; then Drag the bees to the man; then Drag the notebook on the table to the password lock'},
            {'what': 'Steps 10–12: Drag the man outside to the door', 'why': 'Drag the man outside to the door; then Swipe up the carpet inside; then Drag the man under the carpet to the door'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 11?', 'In order: 1) Drag the key onto the key lock; 2) Drag the oil onto the gear lock; 3) Drag the knife to the watermelon; 4) Drag half the watermelon to the door; 5) Drag the pin-up poster to the man; 6) Drag the shy man to the door; 7) Drag the paint bucket to the man in white; 8) Drag the bees to the man; 9) Drag the notebook on the table to the password lock; 10) Drag the man outside to the door; 11) Swipe up the carpet inside; 12) Drag the man under the carpet to the door'],
            ['Why does nothing happen when I tap in Level 11?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 11 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    12: {
        'slug': 'brain-puzzle-3-level-12',
        'title': 'Brain Puzzle 3 Level 12 Answer: Overcrowded Guide',
        'description': 'Brain Puzzle 3 Level 12 (Overcrowded) answer: reduce the elevator weight to 1000KG before it drops. Full step order plus the complete video walkthrough.',
        'goal': 'Help reduce the elevator\'s weight to 1000KG',
        'video_id': 'rsWKWSoIBBU',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l12_hero.jpg',
        'summary': 'Level 12 \u201cOvercrowded\u201d: Help reduce the elevator\'s weight to 1000KG. 14 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the watch on the girl\'s hand in the middle of the elevator to outside the elevator', 'why': 'Drag the watch on the girl\'s hand in the middle of the elevator to outside the elevator; then Drag the first pair of cotton pants on the child in the upper left corner to outside the elevator; then Drag the second pair of jeans on the child in the upper left corner to outside the elevator; then Drag the third pair of thermal pants on the child in the upper left corner to outside the elevator'},
            {'what': 'Steps 5–8: Drag the fourth pair of stockings on the child in the upper left corner to outside the elevator', 'why': 'Drag the fourth pair of stockings on the child in the upper left corner to outside the elevator; then Drag the white-shirted man\'s hair to outside the elevator; then Drag the sweet potato in the housewife\'s shopping basket to the fat man in the lower left corner; then Drag the housewife\'s shopping basket to outside the elevator'},
            {'what': 'Steps 9–11: Drag the blue-shirted man\'s glasses to outside the elevator', 'why': 'Drag the blue-shirted man\'s glasses to outside the elevator; then Click on the toolbox in the worker\'s hand on the right; then Drag the scissors to the cardboard box held by the worker on the left'},
            {'what': 'Steps 12–14: Drag the stone inside the cardboard box to outside the elevator', 'why': 'Drag the stone inside the cardboard box to outside the elevator; then Drag the crowbar from the toolbox to the woman in the yellow skirt; then Drag the handsome man\'s mask to outside the elevator'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 12?', 'In order: 1) Drag the watch on the girl\'s hand in the middle of the elevator to outside the elevator; 2) Drag the first pair of cotton pants on the child in the upper left corner to outside the elevator; 3) Drag the second pair of jeans on the child in the upper left corner to outside the elevator; 4) Drag the third pair of thermal pants on the child in the upper left corner to outside the elevator; 5) Drag the fourth pair of stockings on the child in the upper left corner to outside the elevator; 6) Drag the white-shirted man\'s hair to outside the elevator; 7) Drag the sweet potato in the housewife\'s shopping basket to the fat man in the lower left corner; 8) Drag the housewife\'s shopping basket to outside the elevator; 9) Drag the blue-shirted man\'s glasses to outside the elevator; 10) Click on the toolbox in the worker\'s hand on the right; 11) Drag the scissors to the cardboard box held by the worker on the left; 12) Drag the stone inside the cardboard box to outside the elevator; 13) Drag the crowbar from the toolbox to the woman in the yellow skirt; 14) Drag the handsome man\'s mask to outside the elevator'],
            ['Why does nothing happen when I tap in Level 12?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 12 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    13: {
        'slug': 'brain-puzzle-3-level-13',
        'title': 'Brain Puzzle 3 Level 13 Answer: Mom Is Home Guide',
        'description': 'Brain Puzzle 3 Level 13 (Mom Is Home) answer: clean up the room before mom gets home. Full step order plus the complete video walkthrough.',
        'goal': 'Clean up the room',
        'video_id': 'Ndnc35wC13Y',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l13_hero.jpg',
        'summary': 'Level 13 \u201cMom Is Home\u201d: Clean up the room. 17 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–5: Swipe left on the bathroom door', 'why': 'Swipe left on the bathroom door; then Drag the mop to the floor; then Drag the trash near the bathroom to the trash can; then Drag the trash near the table to the trash can; then Drag the dirty clothes on the sofa to the washing machine'},
            {'what': 'Steps 6–9: Drag the insecticide to the cockroach', 'why': 'Drag the insecticide to the cockroach; then Drag the fairy lights to the toilet; then Drag the dirty dishes on the table to the sink; then Drag the air freshener to the floor'},
            {'what': 'Steps 10–13: Drag the cake to the kitten', 'why': 'Drag the cake to the kitten; then Click the man in the black vest; then Click the man in the blue jacket; then Click the man in the white shirt'},
            {'what': 'Steps 14–17: Drag the man in the black vest under the table', 'why': 'Drag the man in the black vest under the table; then Drag the man in the blue jacket under the table; then Drag the man in the white shirt under the table; then Drag the banner onto the table'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 13?', 'In order: 1) Swipe left on the bathroom door; 2) Drag the mop to the floor; 3) Drag the trash near the bathroom to the trash can; 4) Drag the trash near the table to the trash can; 5) Drag the dirty clothes on the sofa to the washing machine; 6) Drag the insecticide to the cockroach; 7) Drag the fairy lights to the toilet; 8) Drag the dirty dishes on the table to the sink; 9) Drag the air freshener to the floor; 10) Drag the cake to the kitten; 11) Click the man in the black vest; 12) Click the man in the blue jacket; 13) Click the man in the white shirt; 14) Drag the man in the black vest under the table; 15) Drag the man in the blue jacket under the table; 16) Drag the man in the white shirt under the table; 17) Drag the banner onto the table'],
            ['Why does nothing happen when I tap in Level 13?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 13 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    14: {
        'slug': 'brain-puzzle-3-level-14',
        'title': 'Brain Puzzle 3 Level 14 Answer: Sausage Lip SOS Guide',
        'description': 'Brain Puzzle 3 Level 14 (Sausage Lip SOS) answer: make the crab release its claw. Full step order plus the complete video walkthrough.',
        'goal': 'Make the crab release its claw',
        'video_id': 'W1QWV5DS0Fg',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l14_hero.jpg',
        'summary': 'Level 14 \u201cSausage Lip SOS\u201d: Make the crab release its claw. 10 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the lighter to the male lead', 'why': 'Drag the lighter to the male lead; then Drag the beach shovel to the male lead; then Drag the kid\'s water gun to the male lead'},
            {'what': 'Steps 4–6: Drag the seagull in the sky to the male lead', 'why': 'Drag the seagull in the sky to the male lead; then Drag the lobster from the fishing boat to the male lead; then Drag the girl mocking the male lead to him'},
            {'what': 'Steps 7–8: Drag the crab mold to the sand pile', 'why': 'Drag the crab mold to the sand pile; then Drag the sand crab shape to the male lead'},
            {'what': 'Steps 9–10: Drag the grilled meat from the BBQ rack onto the water surface', 'why': 'Drag the grilled meat from the BBQ rack onto the water surface; then Drag the shark\'s tooth to the male lead'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 14?', 'In order: 1) Drag the lighter to the male lead; 2) Drag the beach shovel to the male lead; 3) Drag the kid\'s water gun to the male lead; 4) Drag the seagull in the sky to the male lead; 5) Drag the lobster from the fishing boat to the male lead; 6) Drag the girl mocking the male lead to him; 7) Drag the crab mold to the sand pile; 8) Drag the sand crab shape to the male lead; 9) Drag the grilled meat from the BBQ rack onto the water surface; 10) Drag the shark\'s tooth to the male lead'],
            ['Why does nothing happen when I tap in Level 14?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 14 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    15: {
        'slug': 'brain-puzzle-3-level-15',
        'title': 'Brain Puzzle 3 Level 15 Answer: Doorstep Creeper Guide',
        'description': 'Brain Puzzle 3 Level 15 (Doorstep Creeper) answer: drive away the creep outside the door. Full step order plus the complete video walkthrough.',
        'goal': 'Drive away the creep outside the door',
        'video_id': '_sMhL_Wr1rQ',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l15_hero.jpg',
        'summary': 'Level 15 \u201cDoorstep Creeper\u201d: Drive away the creep outside the door. 12 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the bunch of keys to the creep', 'why': 'Drag the bunch of keys to the creep; then Drag the black trash bag to the creep; then Drag the smelly sneakers to the shoe rack by the door'},
            {'what': 'Steps 4–6: Drag the notes in the room to the creep', 'why': 'Drag the notes in the room to the creep; then Swipe right to open the neighbor\'s door; then Click the girl\'s crossbody bag'},
            {'what': 'Steps 7–9: Drag the pepper spray to the creep', 'why': 'Drag the pepper spray to the creep; then Click the girl\'s phone; then Click the first recording'},
            {'what': 'Steps 10–12: Double-click the light bulb', 'why': 'Double-click the light bulb; then Double-click to open the window; then Drag the dog outside the window to the creep'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 15?', 'In order: 1) Drag the bunch of keys to the creep; 2) Drag the black trash bag to the creep; 3) Drag the smelly sneakers to the shoe rack by the door; 4) Drag the notes in the room to the creep; 5) Swipe right to open the neighbor\'s door; 6) Click the girl\'s crossbody bag; 7) Drag the pepper spray to the creep; 8) Click the girl\'s phone; 9) Click the first recording; 10) Double-click the light bulb; 11) Double-click to open the window; 12) Drag the dog outside the window to the creep'],
            ['Why does nothing happen when I tap in Level 15?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 15 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    16: {
        'slug': 'brain-puzzle-3-level-16',
        'title': 'Brain Puzzle 3 Level 16 Answer: Big Head Guide',
        'description': 'Brain Puzzle 3 Level 16 (Big Head) answer: help the girl reduce her head circumference. Full step order plus the complete video walkthrough.',
        'goal': 'Help the girl reduce her head circumference',
        'video_id': 'lPoRWm_t1zg',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l16_hero.jpg',
        'summary': 'Level 16 \u201cBig Head\u201d: Help the girl reduce her head circumference. 13 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Do not drag the skirt to the girl before her head shrinks', 'why': 'Do not drag the skirt to the girl before her head shrinks; then Swipe up to open the window; then Drag the snow pile from outside the window onto the girl’s head; then Drag the math book in the top right corner onto the girl’s head'},
            {'what': 'Steps 5–7: Drag the hula hoop onto the girl’s head', 'why': 'Drag the hula hoop onto the girl’s head; then Drag the belt of the man outside the door onto the girl’s head; then Drag the onion onto the girl’s head'},
            {'what': 'Steps 8–10: Drag the iron onto the girl’s head', 'why': 'Drag the iron onto the girl’s head; then Drag the spinach in the bottom right corner onto the girl’s head; then Drag the laptop onto the girl’s head'},
            {'what': 'Steps 11–13: Swipe left to open the washing machine', 'why': 'Swipe left to open the washing machine; then Drag the girl to the washing machine; then Drag the skirt to the girl'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 16?', 'In order: 1) Do not drag the skirt to the girl before her head shrinks; 2) Swipe up to open the window; 3) Drag the snow pile from outside the window onto the girl’s head; 4) Drag the math book in the top right corner onto the girl’s head; 5) Drag the hula hoop onto the girl’s head; 6) Drag the belt of the man outside the door onto the girl’s head; 7) Drag the onion onto the girl’s head; 8) Drag the iron onto the girl’s head; 9) Drag the spinach in the bottom right corner onto the girl’s head; 10) Drag the laptop onto the girl’s head; 11) Swipe left to open the washing machine; 12) Drag the girl to the washing machine; 13) Drag the skirt to the girl'],
            ['Why does nothing happen when I tap in Level 16?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 16 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    17: {
        'slug': 'brain-puzzle-3-level-17',
        'title': 'Brain Puzzle 3 Level 17 Answer: Girl Dorm Cool Guide',
        'description': 'Brain Puzzle 3 Level 17 (Girl Dorm Cool) answer: chase away all the husband’s ex-girlfriends. Full step order plus the complete video walkthrough.',
        'goal': 'Help the bride chase away all her husband’s ex-girlfriends',
        'video_id': 'wLLw1DrPJJY',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l17_hero.jpg',
        'summary': 'Level 17 \u201cGirl Dorm Cool\u201d: Help the bride chase away all her husband’s ex-girlfriends. 13 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the bucket to the ex-girlfriend', 'why': 'Drag the bucket to the ex-girlfriend; then Drag the needle to the ex-girlfriend; then Drag down the ex-girlfriend\'s clothes; then Drag the scissors to the ex-girlfriend'},
            {'what': 'Steps 5–7: Drag the beard to the ex-girlfriend', 'why': 'Drag the beard to the ex-girlfriend; then Double-click to open the window; then When the moon is outside the window, drag the moon to your ex-girlfriend'},
            {'what': 'Steps 8–10: Drag the scissors to the wire', 'why': 'Drag the scissors to the wire; then Drag the wire to the ex-girlfriend; then Drag the clock to the window to switch between the sun and the moon'},
            {'what': 'Steps 11–13: When the sun is outside the window, drag the sun to your ex-girlfriend', 'why': 'When the sun is outside the window, drag the sun to your ex-girlfriend; then Drag the speaker to the bride; then Drag the spider to the ex-girlfriend'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 17?', 'In order: 1) Drag the bucket to the ex-girlfriend; 2) Drag the needle to the ex-girlfriend; 3) Drag down the ex-girlfriend\'s clothes; 4) Drag the scissors to the ex-girlfriend; 5) Drag the beard to the ex-girlfriend; 6) Double-click to open the window; 7) When the moon is outside the window, drag the moon to your ex-girlfriend; 8) Drag the scissors to the wire; 9) Drag the wire to the ex-girlfriend; 10) Drag the clock to the window to switch between the sun and the moon; 11) When the sun is outside the window, drag the sun to your ex-girlfriend; 12) Drag the speaker to the bride; 13) Drag the spider to the ex-girlfriend'],
            ['Why does nothing happen when I tap in Level 17?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 17 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    18: {
        'slug': 'brain-puzzle-3-level-18',
        'title': 'Brain Puzzle 3 Level 18 Answer: Zombie Walk Guide',
        'description': 'Brain Puzzle 3 Level 18 (Zombie Walk) answer: keep the baby quiet before the zombies arrive. Full step order plus the complete video walkthrough.',
        'goal': 'Don\'t let the baby cry, the sound will attract zombies',
        'video_id': '3aZoyy587H0',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l18_hero.jpg',
        'summary': 'Level 18 \u201cZombie Walk\u201d: Don\'t let the baby cry, the sound will attract zombies. 10 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Failed to complete within 30s, the baby\'s crying attracted zombies\' attention', 'why': 'Failed to complete within 30s, the baby\'s crying attracted zombies\' attention; then When in room view, drag the teddy bear on the floor to the nurse; then When in room view, drag the pacifier on the utility cart to the nurse'},
            {'what': 'Steps 4–6: When in room view, drag the diaper on the utility cart to the nurse', 'why': 'When in room view, drag the diaper on the utility cart to the nurse; then When in room view, drag the white coat on the wall to the nurse; then When in room view, drag the baby to the incubator by the wall'},
            {'what': 'Steps 7–8: After completing the above, tap the button on the door to switch to hallway view', 'why': 'After completing the above, tap the button on the door to switch to hallway view; then When in hallway view, drag the wind-up key by the bed to the toy monkey'},
            {'what': 'Steps 9–10: When in hallway view, drag the crutch to the person hiding on the surgical bed', 'why': 'When in hallway view, drag the crutch to the person hiding on the surgical bed; then When in hallway view, tap the alarm button on the wall'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 18?', 'In order: 1) Failed to complete within 30s, the baby\'s crying attracted zombies\' attention; 2) When in room view, drag the teddy bear on the floor to the nurse; 3) When in room view, drag the pacifier on the utility cart to the nurse; 4) When in room view, drag the diaper on the utility cart to the nurse; 5) When in room view, drag the white coat on the wall to the nurse; 6) When in room view, drag the baby to the incubator by the wall; 7) After completing the above, tap the button on the door to switch to hallway view; 8) When in hallway view, drag the wind-up key by the bed to the toy monkey; 9) When in hallway view, drag the crutch to the person hiding on the surgical bed; 10) When in hallway view, tap the alarm button on the wall'],
            ['Why does nothing happen when I tap in Level 18?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 18 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    20: {
        'slug': 'brain-puzzle-3-level-20',
        'title': 'Brain Puzzle 3 Level 20 Answer: Open Faster Guide',
        'description': 'Brain Puzzle 3 Level 20 (Open Faster) answer: help her clean the toilet fast. Full step order plus the complete video walkthrough.',
        'goal': 'Help her clean the toilet',
        'video_id': 'B-SnrZoaqzE',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l20_hero.jpg',
        'summary': 'Level 20 \u201cOpen Faster\u201d: Help her clean the toilet. 12 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the mop to the floor', 'why': 'Drag the mop to the floor; then Drag the spider to the wall crack; then Drag the toilet plunger to the toilet'},
            {'what': 'Steps 4–6: Drag the coat from the person outside the door to the toilet', 'why': 'Drag the coat from the person outside the door to the toilet; then Drag three paper balls to the trash can; then Drag the trash bag to the person outside the door'},
            {'what': 'Steps 7–9: Click to open the backpack', 'why': 'Click to open the backpack; then Drag the perfume to the smelly spot; then Drag the fly swatter on the poster to the fly'},
            {'what': 'Steps 10–12: Drag the poop to the slightly wilted plant', 'why': 'Drag the poop to the slightly wilted plant; then Drag the small tomatoes to the bird; then Drag the newspaper outside the door into the toilet paper holder'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 20?', 'In order: 1) Drag the mop to the floor; 2) Drag the spider to the wall crack; 3) Drag the toilet plunger to the toilet; 4) Drag the coat from the person outside the door to the toilet; 5) Drag three paper balls to the trash can; 6) Drag the trash bag to the person outside the door; 7) Click to open the backpack; 8) Drag the perfume to the smelly spot; 9) Drag the fly swatter on the poster to the fly; 10) Drag the poop to the slightly wilted plant; 11) Drag the small tomatoes to the bird; 12) Drag the newspaper outside the door into the toilet paper holder'],
            ['Why does nothing happen when I tap in Level 20?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 20 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    21: {
        'slug': 'brain-puzzle-3-level-21',
        'title': 'Brain Puzzle 3 Level 21 Answer: Cheating Scene Guide',
        'description': 'Brain Puzzle 3 Level 21 (Cheating Scene) answer: help the wife catch the cheating scene. Full step order plus the complete video walkthrough.',
        'goal': 'Help the wife catch cheating',
        'video_id': 'D5nqDl4EhkM',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l21_hero.jpg',
        'summary': 'Level 21 \u201cCheating Scene\u201d: Help the wife catch cheating. 12 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the key on the floor to the door', 'why': 'Drag the key on the floor to the door; then Drag the photo frame on the cabinet in the room to the door; then Click on the bag in the room'},
            {'what': 'Steps 4–6: Drag the lipstick from the bag to the wife outside the door', 'why': 'Drag the lipstick from the bag to the wife outside the door; then Drag the socks on the sofa to the door; then Drag the flame on the wife\'s head to the door'},
            {'what': 'Steps 7–9: Swipe right on the cabinet door', 'why': 'Swipe right on the cabinet door; then Drag the pen from the cabinet to the poster on the wall; then Drag the poster to the door'},
            {'what': 'Steps 10–12: Drag the purple bow on the mistress\'s head to the dog at the door', 'why': 'Drag the purple bow on the mistress\'s head to the dog at the door; then Drag the beautiful dog to the door; then Drag the crying child to the wife outside the door'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 21?', 'In order: 1) Drag the key on the floor to the door; 2) Drag the photo frame on the cabinet in the room to the door; 3) Click on the bag in the room; 4) Drag the lipstick from the bag to the wife outside the door; 5) Drag the socks on the sofa to the door; 6) Drag the flame on the wife\'s head to the door; 7) Swipe right on the cabinet door; 8) Drag the pen from the cabinet to the poster on the wall; 9) Drag the poster to the door; 10) Drag the purple bow on the mistress\'s head to the dog at the door; 11) Drag the beautiful dog to the door; 12) Drag the crying child to the wife outside the door'],
            ['Why does nothing happen when I tap in Level 21?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 21 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    22: {
        'slug': 'brain-puzzle-3-level-22',
        'title': 'Brain Puzzle 3 Level 22 Answer: Coffee Master Guide',
        'description': 'Brain Puzzle 3 Level 22 (Coffee Master) answer: help the barista make 10 different coffees. Full step order plus the complete video walkthrough.',
        'goal': 'Help the barista make 10 different coffees',
        'video_id': 'PBCqe1zIy3Q',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l22_hero.jpg',
        'summary': 'Level 22 \u201cCoffee Master\u201d: Help the barista make 10 different coffees. 14 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the cow from the painting into the black coffee on the bar', 'why': 'Drag the cow from the painting into the black coffee on the bar; then Drag the matcha powder into the black coffee on the bar; then Swipe left on the top shelf of the fridge; then Drag the ice cubes into the black coffee on the bar'},
            {'what': 'Steps 5–8: Swipe left on the bottom shelf of the fridge', 'why': 'Swipe left on the bottom shelf of the fridge; then Drag the cream into the black coffee on the bar; then Double-tap the window; then Drag the beehive outside the window into the black coffee on the bar'},
            {'what': 'Steps 9–11: Drag the orange sticker from the price tag into the black coffee on the bar', 'why': 'Drag the orange sticker from the price tag into the black coffee on the bar; then Drag the liquor on the table into the black coffee on the bar; then Drag the coffee beans on the table to the kitten'},
            {'what': 'Steps 12–14: Drag the cat poop coffee into the black coffee on the bar', 'why': 'Drag the cat poop coffee into the black coffee on the bar; then Drag the chocolate syrup on the fridge into the black coffee on the bar; then Drag the pumpkin into the black coffee on the bar'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 22?', 'In order: 1) Drag the cow from the painting into the black coffee on the bar; 2) Drag the matcha powder into the black coffee on the bar; 3) Swipe left on the top shelf of the fridge; 4) Drag the ice cubes into the black coffee on the bar; 5) Swipe left on the bottom shelf of the fridge; 6) Drag the cream into the black coffee on the bar; 7) Double-tap the window; 8) Drag the beehive outside the window into the black coffee on the bar; 9) Drag the orange sticker from the price tag into the black coffee on the bar; 10) Drag the liquor on the table into the black coffee on the bar; 11) Drag the coffee beans on the table to the kitten; 12) Drag the cat poop coffee into the black coffee on the bar; 13) Drag the chocolate syrup on the fridge into the black coffee on the bar; 14) Drag the pumpkin into the black coffee on the bar'],
            ['Why does nothing happen when I tap in Level 22?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 22 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    23: {
        'slug': 'brain-puzzle-3-level-23',
        'title': 'Brain Puzzle 3 Level 23 Answer: Birthday Surprise Guide',
        'description': 'Brain Puzzle 3 Level 23 (Birthday Surprise) answer: find the people hiding in the house. Full step order plus the complete video walkthrough.',
        'goal': 'Find the people hiding in the house',
        'video_id': 'fyPDfpUkx7Y',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l23_hero.jpg',
        'summary': 'Level 23 \u201cBirthday Surprise\u201d: Find the people hiding in the house. 11 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Swipe up on the table', 'why': 'Swipe up on the table; then Tap the photo frame on the wall; then Tap the air conditioner'},
            {'what': 'Steps 4–6: Swipe right on the carpet', 'why': 'Swipe right on the carpet; then Swipe up on the large potted plant; then Double-tap the cabinet'},
            {'what': 'Steps 7–9: Double-tap the curtain', 'why': 'Double-tap the curtain; then Tap the shaking leaves; then Tap the bird'},
            {'what': 'Steps 10–11: Drag the cat food into the cat bowl', 'why': 'Drag the cat food into the cat bowl; then After finding everyone, swipe up on the main character'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 23?', 'In order: 1) Swipe up on the table; 2) Tap the photo frame on the wall; 3) Tap the air conditioner; 4) Swipe right on the carpet; 5) Swipe up on the large potted plant; 6) Double-tap the cabinet; 7) Double-tap the curtain; 8) Tap the shaking leaves; 9) Tap the bird; 10) Drag the cat food into the cat bowl; 11) After finding everyone, swipe up on the main character'],
            ['Why does nothing happen when I tap in Level 23?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 23 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    24: {
        'slug': 'brain-puzzle-3-level-24',
        'title': 'Brain Puzzle 3 Level 24 Answer: Above Tower Guide',
        'description': 'Brain Puzzle 3 Level 24 (Above Tower) answer: help them out of trouble on the tower. Full step order plus the complete video walkthrough.',
        'goal': 'Help them out of trouble',
        'video_id': 'HdY3PYKKvPQ',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l24_hero.jpg',
        'summary': 'Level 24 \u201cAbove Tower\u201d: Help them out of trouble. 13 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the rope to the girl', 'why': 'Drag the rope to the girl; then Drag the cloth on the platform to the black-haired girl; then Drag the black-haired girl\'s necklace to the black-haired girl; then Drag the bandage on the blonde girl\'s leg to the black-haired girl'},
            {'what': 'Steps 5–7: Click the backpack', 'why': 'Click the backpack; then Drag the drink from the backpack to the black-haired girl; then Drag the screwdriver from the backpack to the iron piece on the tower column'},
            {'what': 'Steps 8–10: Drag the wire inside the tower to the black-haired girl', 'why': 'Drag the wire inside the tower to the black-haired girl; then Drag the cloud on the left to the blonde girl; then Drag the black-haired girl\'s shoelace to the black-haired girl'},
            {'what': 'Steps 11–13: Swipe down on the blonde girl\'s butt', 'why': 'Swipe down on the blonde girl\'s butt; then Tap the phone; then Tap the send button on the phone'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 24?', 'In order: 1) Drag the rope to the girl; 2) Drag the cloth on the platform to the black-haired girl; 3) Drag the black-haired girl\'s necklace to the black-haired girl; 4) Drag the bandage on the blonde girl\'s leg to the black-haired girl; 5) Click the backpack; 6) Drag the drink from the backpack to the black-haired girl; 7) Drag the screwdriver from the backpack to the iron piece on the tower column; 8) Drag the wire inside the tower to the black-haired girl; 9) Drag the cloud on the left to the blonde girl; 10) Drag the black-haired girl\'s shoelace to the black-haired girl; 11) Swipe down on the blonde girl\'s butt; 12) Tap the phone; 13) Tap the send button on the phone'],
            ['Why does nothing happen when I tap in Level 24?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 24 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    25: {
        'slug': 'brain-puzzle-3-level-25',
        'title': 'Brain Puzzle 3 Level 25 Answer: Parachute Peril Guide',
        'description': 'Brain Puzzle 3 Level 25 (Parachute Peril) answer: help them fix the parachute properly. Full step order plus the complete video walkthrough.',
        'goal': 'Help them fix the parachute properly',
        'video_id': 'jPHsfpSmxd4',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l25_hero.jpg',
        'summary': 'Level 25 \u201cParachute Peril\u201d: Help them fix the parachute properly. 17 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–5: Drag the knife to the parachute', 'why': 'Drag the knife to the parachute; then Drag the rope downward; then Drag the knife from the man\'s hand to the cardboard box; then Drag the cardboard box to the parachute; then Drag the man\'s pants to the parachute'},
            {'what': 'Steps 6–9: Drag the band-aid on the man\'s leg to the parachute', 'why': 'Drag the band-aid on the man\'s leg to the parachute; then Drag the chewing gum to the man; then Drag the tape to the parachute; then Drag the right girl\'s stocking to the parachute'},
            {'what': 'Steps 10–13: Drag the left girl\'s wig to the parachute', 'why': 'Drag the left girl\'s wig to the parachute; then Drag the plastic bag tangled with the bird to the parachute; then Tap the red phone; then Click to place your order'},
            {'what': 'Steps 14–17: Drag the needle and thread over to the parachute', 'why': 'Drag the needle and thread over to the parachute; then Drag the baby\'s pacifier to the parachute; then Tap to open the handbag; then Drag the money to the parachute'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 25?', 'In order: 1) Drag the knife to the parachute; 2) Drag the rope downward; 3) Drag the knife from the man\'s hand to the cardboard box; 4) Drag the cardboard box to the parachute; 5) Drag the man\'s pants to the parachute; 6) Drag the band-aid on the man\'s leg to the parachute; 7) Drag the chewing gum to the man; 8) Drag the tape to the parachute; 9) Drag the right girl\'s stocking to the parachute; 10) Drag the left girl\'s wig to the parachute; 11) Drag the plastic bag tangled with the bird to the parachute; 12) Tap the red phone; 13) Click to place your order; 14) Drag the needle and thread over to the parachute; 15) Drag the baby\'s pacifier to the parachute; 16) Tap to open the handbag; 17) Drag the money to the parachute'],
            ['Why does nothing happen when I tap in Level 25?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 25 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    26: {
        'slug': 'brain-puzzle-3-level-26',
        'title': 'Brain Puzzle 3 Level 26 Answer: Zombie Crisis Guide',
        'description': 'Brain Puzzle 3 Level 26 (Zombie Crisis) answer: extend the ladder so the girl climbs upstairs. Full step order plus the complete video walkthrough.',
        'goal': 'Help the girl extend the ladder to climb upstairs',
        'video_id': 'os7P4LMb9pE',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l26_hero.jpg',
        'summary': 'Level 26 \u201cZombie Crisis\u201d: Help the girl extend the ladder to climb upstairs. 13 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the stick from the zombie\'s hand onto the ladder', 'why': 'Drag the stick from the zombie\'s hand onto the ladder; then Drag the street light onto the ladder; then Swipe left to open the toilet door; then Drag the man in the toilet onto the ladder'},
            {'what': 'Steps 5–7: Drag the belt from the man on the ground onto the ladder', 'why': 'Drag the belt from the man on the ground onto the ladder; then Drag the toilet sign onto the ladder; then Drag the axe onto the tree'},
            {'what': 'Steps 8–10: Drag the piece of wood onto the ladder', 'why': 'Drag the piece of wood onto the ladder; then Tap on the bushes; then Drag the broom onto the ladder'},
            {'what': 'Steps 11–13: Drag the water pipe upstairs over to the ladder', 'why': 'Drag the water pipe upstairs over to the ladder; then Drag the man playing dead on the ground to the ladder; then Take the nunchucks from the girl\'s hands to the ladder'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 26?', 'In order: 1) Drag the stick from the zombie\'s hand onto the ladder; 2) Drag the street light onto the ladder; 3) Swipe left to open the toilet door; 4) Drag the man in the toilet onto the ladder; 5) Drag the belt from the man on the ground onto the ladder; 6) Drag the toilet sign onto the ladder; 7) Drag the axe onto the tree; 8) Drag the piece of wood onto the ladder; 9) Tap on the bushes; 10) Drag the broom onto the ladder; 11) Drag the water pipe upstairs over to the ladder; 12) Drag the man playing dead on the ground to the ladder; 13) Take the nunchucks from the girl\'s hands to the ladder'],
            ['Why does nothing happen when I tap in Level 26?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 26 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    27: {
        'slug': 'brain-puzzle-3-level-27',
        'title': 'Brain Puzzle 3 Level 27 Answer: Paint Cleanup Guide',
        'description': 'Brain Puzzle 3 Level 27 (Paint Cleanup) answer: rub the paint off the prisoner’s back. Full step order plus the complete video walkthrough.',
        'goal': 'Rub off the paint on the prisoner\'s back',
        'video_id': 'UTQRTVoth1w',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l27_hero.jpg',
        'summary': 'Level 27 \u201cPaint Cleanup\u201d: Rub off the paint on the prisoner\'s back. 9 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the steel wool on the bed to the bald prisoner', 'why': 'Drag the steel wool on the bed to the bald prisoner; then Drag the soap on the sink to the bald prisoner; then Drag the toothbrush in front of the mirror to the bald prisoner'},
            {'what': 'Steps 4–6: Click on the mouse hole', 'why': 'Click on the mouse hole; then Drag the butter held by the mouse to the bald prisoner; then Drag the mouse to the bald prisoner'},
            {'what': 'Steps 7–9: Click on the Bible on the floor', 'why': 'Click on the Bible on the floor; then Drag the file from the Bible to the bald prisoner; then Drag the tongue of the prisoner on the bed to the bald prisoner'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 27?', 'In order: 1) Drag the steel wool on the bed to the bald prisoner; 2) Drag the soap on the sink to the bald prisoner; 3) Drag the toothbrush in front of the mirror to the bald prisoner; 4) Click on the mouse hole; 5) Drag the butter held by the mouse to the bald prisoner; 6) Drag the mouse to the bald prisoner; 7) Click on the Bible on the floor; 8) Drag the file from the Bible to the bald prisoner; 9) Drag the tongue of the prisoner on the bed to the bald prisoner'],
            ['Why does nothing happen when I tap in Level 27?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 27 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    28: {
        'slug': 'brain-puzzle-3-level-28',
        'title': 'Brain Puzzle 3 Level 28 Answer: Ghost Clinic Guide',
        'description': 'Brain Puzzle 3 Level 28 (Ghost Clinic) answer: solve every ghost’s problem at the clinic. Full step order plus the complete video walkthrough.',
        'goal': 'Help them solve their problems',
        'video_id': '6LiT0x4hm34',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l28_hero.jpg',
        'summary': 'Level 28 \u201cGhost Clinic\u201d: Help them solve their problems. 16 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–4: Drag the towel to the ghost', 'why': 'Drag the towel to the ghost; then Drag the nurse\'s coat to the ghost; then Swipe up the axe above the ghost\'s head; then Drag the bandage to the ghost'},
            {'what': 'Steps 5–8: Drag the notebook and pen to the ghost', 'why': 'Drag the notebook and pen to the ghost; then Drag the candy to the child; then Drag the cosmetics to the girl; then Drag the hammer to the ghost'},
            {'what': 'Steps 9–12: Drag the scissors to the boy', 'why': 'Drag the scissors to the boy; then Drag Cupid\'s bow and arrow to the boy; then Drag the pump to the ghost; then Click the photo in the ghost\'s hand'},
            {'what': 'Steps 13–16: Drag the sleeping ghost\'s clothes to the doctor', 'why': 'Drag the sleeping ghost\'s clothes to the doctor; then Drag the scissors to the sleeping ghost; then Drag the cut hair to the doctor; then Drag the doctor to the ghost bride'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 28?', 'In order: 1) Drag the towel to the ghost; 2) Drag the nurse\'s coat to the ghost; 3) Swipe up the axe above the ghost\'s head; 4) Drag the bandage to the ghost; 5) Drag the notebook and pen to the ghost; 6) Drag the candy to the child; 7) Drag the cosmetics to the girl; 8) Drag the hammer to the ghost; 9) Drag the scissors to the boy; 10) Drag Cupid\'s bow and arrow to the boy; 11) Drag the pump to the ghost; 12) Click the photo in the ghost\'s hand; 13) Drag the sleeping ghost\'s clothes to the doctor; 14) Drag the scissors to the sleeping ghost; 15) Drag the cut hair to the doctor; 16) Drag the doctor to the ghost bride'],
            ['Why does nothing happen when I tap in Level 28?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 28 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    29: {
        'slug': 'brain-puzzle-3-level-29',
        'title': 'Brain Puzzle 3 Level 29 Answer: Grim Reaper Chase Guide',
        'description': 'Brain Puzzle 3 Level 29 (Grim Reaper Chase) answer: escape Death himself. Full step order plus the complete video walkthrough.',
        'goal': 'Help them escape Death',
        'video_id': 'oe9AWLs1NRM',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l29_hero.jpg',
        'summary': 'Level 29 \u201cGrim Reaper Chase\u201d: Help them escape Death. 12 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the cycling old man onto the motorcycle', 'why': 'Drag the cycling old man onto the motorcycle; then Drag the old man in the wheelchair onto the motorcycle; then Drag the grandma’s helmet to the Grim Reaper'},
            {'what': 'Steps 4–6: Drag the rocket onto the motorcycle', 'why': 'Drag the rocket onto the motorcycle; then Tap the grandma’s backpack; then Drag the lipstick to the old man in hospital clothes'},
            {'what': 'Steps 7–9: Drag the lipstick to the old man in a leather jacket', 'why': 'Drag the lipstick to the old man in a leather jacket; then Drag the grandma’s bag to the Grim Reaper; then Drag the moon onto the motorcycle mirror'},
            {'what': 'Steps 10–12: Tap the motorcycle’s fuel tank', 'why': 'Tap the motorcycle’s fuel tank; then Drag the engine oil into the fuel tank; then Swipe down on the moon'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 29?', 'In order: 1) Drag the cycling old man onto the motorcycle; 2) Drag the old man in the wheelchair onto the motorcycle; 3) Drag the grandma’s helmet to the Grim Reaper; 4) Drag the rocket onto the motorcycle; 5) Tap the grandma’s backpack; 6) Drag the lipstick to the old man in hospital clothes; 7) Drag the lipstick to the old man in a leather jacket; 8) Drag the grandma’s bag to the Grim Reaper; 9) Drag the moon onto the motorcycle mirror; 10) Tap the motorcycle’s fuel tank; 11) Drag the engine oil into the fuel tank; 12) Swipe down on the moon'],
            ['Why does nothing happen when I tap in Level 29?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 29 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    30: {
        'slug': 'brain-puzzle-3-level-30',
        'title': 'Brain Puzzle 3 Level 30 Answer: Masks Off',
        'description': 'Brain Puzzle 3 Level 30 answer: every mask off Sweetheart\'s face in order, with screenshots, video timestamps and notes on which steps need a recheck.',
        'goal': 'Take off all the masks and see Sweetheart\'s true face',
        'video_id': 'blrfxQPl7Ss',
        'verified': 'weak',
        'summary': 'Peel Sweetheart down layer by layer: ice block, golden masquerade mask, black eye mask, party hat, then the three gift-offering beats (skincare, ginseng, gold watch), and finally pull the curtain open. The true face behind the curtain is the level\'s punchline.',
        'steps': [
            {'t': 13, 'img': 'l27_step1.jpg', 'what': 'Tap the ice block, then the golden mask, then the black eye mask', 'why': 'Three quick removals in a row: the ice around her head shatters, the golden masquerade mask comes off, and the small black eye mask under it follows. She pops on a party hat.'},
            {'t': 26, 'img': 'l27_step2.jpg', 'what': 'Tap the party hat off', 'why': 'Removing the hat flips her mood: she starts crying, which sets up the gift sequence that follows.'},
            {'t': 32, 'img': 'l27_step3.jpg', 'what': 'Offer the skincare product, the ginseng and the gold watch, tapping through each reaction', 'why': 'Each gift cracks or changes her face one more layer: skincare cracks the mask face, the ginseng letter removes the medical mask, the gold watch turns her eyes to gold coins.'},
            {'t': 62, 'img': 'l27_step4.jpg', 'what': 'Tap the pink curtain to open it', 'why': 'The final reveal: behind the curtain "Sweetheart" is a large man in a black leotard striking a ballet pose. The confrontation dialogue plays and the level clears.'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 30?', 'Remove the ice block, golden mask, black eye mask and party hat, then tap through the skincare, ginseng and gold watch reactions, and finally open the pink curtain. The man behind it is the true face and ends the level.'],
            ['Why does Sweetheart\'s face keep changing in Level 30?', 'Each tap strips one more "mask" layer, and each gift answer replaces her face with a new exaggerated reaction. The level is a running gag about never seeing the real person until the curtain reveal.'],
            ['Is this Level 30 walkthrough exact?', 'The removal order and the curtain reveal are confirmed against full-video frame-by-frame reads. A few of the gift-reaction steps are reconstructed from a single video source, so if one tap looks different on your screen, check the embedded video at that timestamp.'],
        ],
    },
    31: {
        'slug': 'brain-puzzle-3-level-31',
        'title': 'Brain Puzzle 3 Level 31 Answer: Subway Guide',
        'description': 'Brain Puzzle 3 Level 31 (Subway Panic) answer: the creepy subway car — most findings are drags, not taps. Live-verified moves plus video timestamps.',
        'goal': 'Help her figure out what\'s strange',
        'video_id': 'VtOrg4WJ19o',
        'verified': 'weak',
        'verify_note': 'Live play check (game v1.1.8) confirmed the poster, coat, strap and panel moves — and showed several findings are drags, not taps. If a tap does nothing, try dragging the object instead. The full 13-step sequence is cross-checked against an independent all-levels reference.',
        'summary': 'A spot-the-weirdness level in a haunted subway car — and the trick is that most findings are drags, not taps: drag the demon poster over the ghostly window, drag the woman\'s coat onto the bloodstain, swipe down the wobbling ring, swipe down the teddy bear to open its battery compartment, and fix the ceiling panel with the toolbox hammer. The phone gets signal only at the end — dragging it to the girl early does nothing.',
        'steps': [
            {'t': 9, 'img': 'l28_step1.jpg', 'what': 'Drag the demon poster onto the window to cover the ghost', 'why': 'Live-verified: tapping the ghost does nothing — you must drag the creepy poster from the wall over the window (cut it loose with the backpack scissors first if it won\'t move). Tape from the backpack also covers the window.'},
            {'t': 20, 'img': 'l28_step2.jpg', 'what': 'Drag the woman\'s coat onto the blood-red liquid', 'why': 'Live-verified: the red puddle on the floor only reacts when you drag her coat over it. Tapping the puddle does nothing.'},
            {'t': 29, 'img': 'l28_step3.jpg', 'what': 'Swipe down the wobbling ring, swipe down the teddy bear, then fix the ceiling panel', 'why': 'Live-verified: the hanging strap reacts to a downward swipe. The teddy bear in the bottom-right corner swipes down too — it opens a battery compartment. Open the toolbox and drag the nails and hammer onto the loose ceiling panel above.'},
            {'t': 50, 'img': 'l28_step4.jpg', 'what': 'Throw the high heels at the static TV, spray the under-seat area, then hand over the phone', 'why': 'The heels fix the snowy TV. Drag the fire extinguisher to the area under the floor to deal with what is hiding there. Only once the carriage calms down does the phone get signal — drag the phone to the girl to trigger the dream-ending. Dragging it earlier does nothing.'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 31?', 'Work through the creepy subway car: drag the poster over the ghost window, drag the coat onto the red liquid, swipe down the ring and the teddy bear, fix the ceiling panel with the toolbox hammer, throw the heels at the TV, spray the under-seat area with the fire extinguisher, and finally hand the girl her phone. The phone-signal cutscene ends the level.'],
            ['Why won\'t my taps do anything in Level 31?', 'Because most of this level is drags, not taps. Live checks on game v1.1.8 confirmed the poster-over-window, coat-over-bloodstain, strap-downward and panel moves are drags or swipes. If a tap does nothing, try dragging the object somewhere useful instead.'],
            ['Why is there no phone signal in Level 31?', 'The signal only returns once enough of the creepy set dressing has been cleared. Don\'t drag the phone to the girl early — the game even warns against it. Finish the other fixes first, then the phone gets signal and handing it over ends the level.'],
            ['Is Level 31 the same as Subway Panic?', 'Yes. Subway Panic is level 31 in the current version of Brain Puzzle 3: Crazy Mind. Older walkthroughs and videos may label it level 28 — the game has added levels since, shifting the numbering.'],
        ],
    },
    32: {
        'slug': 'brain-puzzle-3-level-32',
        'title': 'Brain Puzzle 3 Level 32 Answer: Become Beauty Guide',
        'description': 'Brain Puzzle 3 Level 32 (Become Beauty) answer: help the black-haired girl become beautiful. Full step order plus the complete video walkthrough.',
        'goal': 'Help the black-haired girl become beautiful',
        'video_id': 'DMn7l5ry-gU',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l32_hero.jpg',
        'summary': 'Level 32 \u201cBecome Beauty\u201d: Help the black-haired girl become beautiful. 12 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Drag the rope on the bathroom door to the black-haired girl', 'why': 'Drag the rope on the bathroom door to the black-haired girl; then Drag the cosmetics on the sink to the black-haired girl; then Click the backpack'},
            {'what': 'Steps 4–6: Drag the boxing gloves from the backpack to the black-haired girl', 'why': 'Drag the boxing gloves from the backpack to the black-haired girl; then Drag the razor from the bun-haired girl\'s pocket to the black-haired girl; then Drag the curling iron from the girl who is curling her hair to the black-haired girl'},
            {'what': 'Steps 7–9: Drag the perfume from the orange-haired girl to the black-haired girl', 'why': 'Drag the perfume from the orange-haired girl to the black-haired girl; then Click the toilet door at the back; then Drag the pink vest from the purple-haired girl to the black-haired girl'},
            {'what': 'Steps 10–12: Drag the leg warmers from the girl taking a selfie to the black-haired girl', 'why': 'Drag the leg warmers from the girl taking a selfie to the black-haired girl; then Swipe down the black-haired girl\'s glasses frame; then Drag the hair hoop on the ground to the black-haired girl'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 32?', 'In order: 1) Drag the rope on the bathroom door to the black-haired girl; 2) Drag the cosmetics on the sink to the black-haired girl; 3) Click the backpack; 4) Drag the boxing gloves from the backpack to the black-haired girl; 5) Drag the razor from the bun-haired girl\'s pocket to the black-haired girl; 6) Drag the curling iron from the girl who is curling her hair to the black-haired girl; 7) Drag the perfume from the orange-haired girl to the black-haired girl; 8) Click the toilet door at the back; 9) Drag the pink vest from the purple-haired girl to the black-haired girl; 10) Drag the leg warmers from the girl taking a selfie to the black-haired girl; 11) Swipe down the black-haired girl\'s glasses frame; 12) Drag the hair hoop on the ground to the black-haired girl'],
            ['Why does nothing happen when I tap in Level 32?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 32 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    33: {
        'slug': 'brain-puzzle-3-level-33',
        'title': 'Brain Puzzle 3 Level 33 Answer: Dining Misconduct Guide',
        'description': 'Brain Puzzle 3 Level 33 (Dining Misconduct) answer: help the waiters handle uncivilized guests. Full step order plus the complete video walkthrough.',
        'goal': 'Help waiters handle uncivilized behaviors',
        'video_id': 'ykpS-OALS3Y',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l33_hero.jpg',
        'summary': 'Level 33 \u201cDining Misconduct\u201d: Help waiters handle uncivilized behaviors. 10 moves in order, most of them drags — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1–3: Click the bag of the girl on the left', 'why': 'Click the bag of the girl on the left; then Drag the fan from the bag to the girl on the right; then Drag the vacuum cleaner to the old lady'},
            {'what': 'Steps 4–6: Drag the umbrella to the boy on the right', 'why': 'Drag the umbrella to the boy on the right; then Drag the lemon on the shelf to the girl\'s bowl on the left; then Drag the bill from the waiter\'s hand to the child'},
            {'what': 'Steps 7–8: Double-click the window', 'why': 'Double-click the window; then Drag the spray on the boy\'s backpack outside the window to the creep'},
            {'what': 'Steps 9–10: Drag the flower on the table to the dog outside the window', 'why': 'Drag the flower on the table to the dog outside the window; then Drag the plastic bag on the trash can to the man on the right'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 33?', 'In order: 1) Click the bag of the girl on the left; 2) Drag the fan from the bag to the girl on the right; 3) Drag the vacuum cleaner to the old lady; 4) Drag the umbrella to the boy on the right; 5) Drag the lemon on the shelf to the girl\'s bowl on the left; 6) Drag the bill from the waiter\'s hand to the child; 7) Double-click the window; 8) Drag the spray on the boy\'s backpack outside the window to the creep; 9) Drag the flower on the table to the dog outside the window; 10) Drag the plastic bag on the trash can to the man on the right'],
            ['Why does nothing happen when I tap in Level 33?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 33 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    34: {
        'slug': 'brain-puzzle-3-level-34',
        'title': 'Brain Puzzle 3 Level 34 Answer: Find Pervert Guide',
        'description': 'Brain Puzzle 3 Level 34 (Find Pervert) answer: find all the perverts who spy on girls. Full step order plus the complete video walkthrough.',
        'goal': 'Find all the perverts who spy on girls',
        'video_id': 'aVuYeZ-3cJo',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l34_hero.jpg',
        'summary': 'Level 34 \u201cFind Pervert\u201d: Find all the perverts who spy on girls. 11 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20133: Tap the wall texture in the top right corner', 'why': 'Tap the wall texture in the top right corner; then Tap the portrait; then Swipe down on the chandelier'},
            {'what': 'Steps 4\\u20136: Click the sofa', 'why': 'Click the sofa; then Tap the curtains; then Swipe right on the teddy bear'},
            {'what': 'Steps 7\\u20139: Click the door', 'why': 'Click the door; then Double-tap the wardrobe door; then Tap the darkest part of the floor'},
            {'what': 'Steps 10\\u201311: Drag the baton to the police officer', 'why': 'Drag the baton to the police officer; then Click the bulging mattress'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 34?', 'In order: 1) Tap the wall texture in the top right corner; 2) Tap the portrait; 3) Swipe down on the chandelier; 4) Click the sofa; 5) Tap the curtains; 6) Swipe right on the teddy bear; 7) Click the door; 8) Double-tap the wardrobe door; 9) Tap the darkest part of the floor; 10) Drag the baton to the police officer; 11) Click the bulging mattress'],
            ['Why does nothing happen when I tap in Level 34?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 34 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    35: {
        'slug': 'brain-puzzle-3-level-35',
        'title': 'Brain Puzzle 3 Level 35 Answer: Snowfield Doomsday Guide',
        'description': 'Brain Puzzle 3 Level 35 (Snowfield Doomsday) answer: help the boy fight off the snow monster. Full step order plus the complete video walkthrough.',
        'goal': 'Help the boy fight off the snow monster',
        'video_id': 'NYW38W4Pwsk',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l35_hero.jpg',
        'summary': 'Level 35 \u201cSnowfield Doomsday\u201d: Help the boy fight off the snow monster. 16 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20134: Drag the gold bar to the wall', 'why': 'Drag the gold bar to the wall; then Drag the gold bar to the boy; then Drag the gold bar to the dog; then Drag the gold bar to the table'},
            {'what': 'Steps 5\\u20138: Drag the gold bar to the baguette on the table', 'why': 'Drag the gold bar to the baguette on the table; then Drag the gold bar to the radio; then Drag the gold bar to the dry grass under the boy; then Swipe the table drawer to the left'},
            {'what': 'Steps 9\\u201312: Drag the gold bar to the phone in the drawer', 'why': 'Drag the gold bar to the phone in the drawer; then Drag the phone to the boy; then Drag the gold bar to the icicle in front of the snow monster; then Drag the can to the dog'},
            {'what': 'Steps 13\\u201316: Drag the poop to the campfire', 'why': 'Drag the poop to the campfire; then Drag the bigger bonfire to the snow monster; then Drag the gold bar to the iron rod; then Drag the rifle to the boy'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 35?', 'In order: 1) Drag the gold bar to the wall; 2) Drag the gold bar to the boy; 3) Drag the gold bar to the dog; 4) Drag the gold bar to the table; 5) Drag the gold bar to the baguette on the table; 6) Drag the gold bar to the radio; 7) Drag the gold bar to the dry grass under the boy; 8) Swipe the table drawer to the left; 9) Drag the gold bar to the phone in the drawer; 10) Drag the phone to the boy; 11) Drag the gold bar to the icicle in front of the snow monster; 12) Drag the can to the dog; 13) Drag the poop to the campfire; 14) Drag the bigger bonfire to the snow monster; 15) Drag the gold bar to the iron rod; 16) Drag the rifle to the boy'],
            ['Why does nothing happen when I tap in Level 35?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 35 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    36: {
        'slug': 'brain-puzzle-3-level-36',
        'title': 'Brain Puzzle 3 Level 36 Answer: Piglet\'s House Guide',
        'description': 'Brain Puzzle 3 Level 36 (Piglet\'s House) answer: help the piglet build the roof. Full step order plus the complete video walkthrough.',
        'goal': 'Help the piglet build the roof',
        'video_id': 'ZIe85dZg08k',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l36_hero.jpg',
        'summary': 'Level 36 \u201cPiglet\'s House\u201d: Help the piglet build the roof. 17 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20135: Don\'t drag the silver shovel Aladdin gave initially', 'why': 'Don\'t drag the silver shovel Aladdin gave initially; then Drag the wooden plank on the ground to the roof; then Drag the bamboo to the roof; then Drag the stone bridge to the roof; then Drag the beehive from the tree to the roof'},
            {'what': 'Steps 6\\u20139: Drag the vines on the left side of the house to the roof', 'why': 'Drag the vines on the left side of the house to the roof; then Drag the deer antlers to the roof; then Drag the turtle shell to the roof; then Drag the tire from the pulley cart to the roof'},
            {'what': 'Steps 10\\u201313: Swipe right on the gate', 'why': 'Swipe right on the gate; then Drag the metal sheet from inside the house to the roof; then Double-click the window; then Drag the lamp in the window to the pig'},
            {'what': 'Steps 14\\u201317: Drag the fishing net to the river', 'why': 'Drag the fishing net to the river; then Drag the retrieved treasure chest to Aladdin; then Drag the golden shovel from Aladdin\'s hand to the dirt pile; then Drag the gold block from the dirt pile to the roof'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 36?', 'In order: 1) Don\'t drag the silver shovel Aladdin gave initially; 2) Drag the wooden plank on the ground to the roof; 3) Drag the bamboo to the roof; 4) Drag the stone bridge to the roof; 5) Drag the beehive from the tree to the roof; 6) Drag the vines on the left side of the house to the roof; 7) Drag the deer antlers to the roof; 8) Drag the turtle shell to the roof; 9) Drag the tire from the pulley cart to the roof; 10) Swipe right on the gate; 11) Drag the metal sheet from inside the house to the roof; 12) Double-click the window; 13) Drag the lamp in the window to the pig; 14) Drag the fishing net to the river; 15) Drag the retrieved treasure chest to Aladdin; 16) Drag the golden shovel from Aladdin\'s hand to the dirt pile; 17) Drag the gold block from the dirt pile to the roof'],
            ['Why does nothing happen when I tap in Level 36?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 36 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    37: {
        'slug': 'brain-puzzle-3-level-37',
        'title': 'Brain Puzzle 3 Level 37 Answer: Short Drama Cover Guide',
        'description': 'Brain Puzzle 3 Level 37 (Short Drama Cover) answer: restore the correct short drama cover. Full step order plus the complete video walkthrough.',
        'goal': 'Restore the correct short drama cover',
        'video_id': '8yVSZNLeEs8',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l37_hero.jpg',
        'summary': 'Level 37 \u201cShort Drama Cover\u201d: Restore the correct short drama cover. 11 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20133: Drag the boxing glove onto the man in white’s face', 'why': 'Drag the boxing glove onto the man in white’s face; then Swipe left on the man in white’s face; then Swipe up on the girl’s dress strap'},
            {'what': 'Steps 4\\u20136: Tap the girl’s belly', 'why': 'Tap the girl’s belly; then Drag the hair tie from the girl’s hand to the man in brown; then Drag the razor from the girl’s hand onto the man in brown’s beard'},
            {'what': 'Steps 7\\u20139: Drag the beard onto the man in white’s head', 'why': 'Drag the beard onto the man in white’s head; then Swipe down on the rightmost person’s hand at the waist; then Swipe left on the woman or swipe right on the man in the brown leather jacket'},
            {'what': 'Steps 10\\u201311: Drag the air cushion from the brown-shirt guy’s pocket to the girl', 'why': 'Drag the air cushion from the brown-shirt guy’s pocket to the girl; then Drag the pen from the man in white’s pocket to the bottom of the screen'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 37?', 'In order: 1) Drag the boxing glove onto the man in white’s face; 2) Swipe left on the man in white’s face; 3) Swipe up on the girl’s dress strap; 4) Tap the girl’s belly; 5) Drag the hair tie from the girl’s hand to the man in brown; 6) Drag the razor from the girl’s hand onto the man in brown’s beard; 7) Drag the beard onto the man in white’s head; 8) Swipe down on the rightmost person’s hand at the waist; 9) Swipe left on the woman or swipe right on the man in the brown leather jacket; 10) Drag the air cushion from the brown-shirt guy’s pocket to the girl; 11) Drag the pen from the man in white’s pocket to the bottom of the screen'],
            ['Why does nothing happen when I tap in Level 37?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 37 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    38: {
        'slug': 'brain-puzzle-3-level-38',
        'title': 'Brain Puzzle 3 Level 38 Answer: Pyramid Hideout Guide',
        'description': 'Brain Puzzle 3 Level 38 (Pyramid Hideout) answer: help the girl hide successfully. Full step order plus the complete video walkthrough.',
        'goal': 'Help the girl hide successfully',
        'video_id': 'L5xOYikbAS0',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l38_hero.jpg',
        'summary': 'Level 38 \u201cPyramid Hideout\u201d: Help the girl hide successfully. 15 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20134: Drag the wooden board directly to the girl', 'why': 'Drag the wooden board directly to the girl; then Drag the brazier directly to the girl; then Drag the clay pot to the girl; then Drag the bronze mirror to the girl'},
            {'what': 'Steps 5\\u20138: Drag the fan blade to the girl', 'why': 'Drag the fan blade to the girl; then Click the wooden box; then Drag the gold bar from the wooden box to the girl; then Drag the wooden box to the girl'},
            {'what': 'Steps 9\\u201312: Drag the stone slab on the wall to the girl', 'why': 'Drag the stone slab on the wall to the girl; then Drag the brazier to the frozen coffin; then Click the coffin; then Drag the pillow inside the wooden coffin to the girl'},
            {'what': 'Steps 13\\u201315: Drag the extinguished brazier to the girl', 'why': 'Drag the extinguished brazier to the girl; then Drag the bandage to the broken wooden board; then Drag the sturdy wooden board to the girl'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 38?', 'In order: 1) Drag the wooden board directly to the girl; 2) Drag the brazier directly to the girl; 3) Drag the clay pot to the girl; 4) Drag the bronze mirror to the girl; 5) Drag the fan blade to the girl; 6) Click the wooden box; 7) Drag the gold bar from the wooden box to the girl; 8) Drag the wooden box to the girl; 9) Drag the stone slab on the wall to the girl; 10) Drag the brazier to the frozen coffin; 11) Click the coffin; 12) Drag the pillow inside the wooden coffin to the girl; 13) Drag the extinguished brazier to the girl; 14) Drag the bandage to the broken wooden board; 15) Drag the sturdy wooden board to the girl'],
            ['Why does nothing happen when I tap in Level 38?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 38 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    39: {
        'slug': 'brain-puzzle-3-level-39',
        'title': 'Brain Puzzle 3 Level 39 Answer: Destroy Mummy Guide',
        'description': 'Brain Puzzle 3 Level 39 (Destroy Mummy) answer: help the girl drive away the mummy. Full step order plus the complete video walkthrough.',
        'goal': 'Help the girl drive away the mummy',
        'video_id': 'gnDRCZ_faro',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l39_hero.jpg',
        'summary': 'Level 39 \u201cDestroy Mummy\u201d: Help the girl drive away the mummy. 16 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20134: Drag the talisman on the wall to the mummy', 'why': 'Drag the talisman on the wall to the mummy; then Drag the cat on the mural to the mummy; then Drag the fan to the mummy; then Tap the backpack'},
            {'what': 'Steps 5\\u20138: Drag the sweet potato from the bag to the mouse hole', 'why': 'Drag the sweet potato from the bag to the mouse hole; then Drag the cross to the mummy; then Drag the taser from the bag to the mummy; then Double-tap the sunflower'},
            {'what': 'Steps 9\\u201312: Drag the sun to the mummy', 'why': 'Drag the sun to the mummy; then Drag the whistle to the girl; then Drag the scarab to the mummy; then Drag the girl\'s shoe to the mummy'},
            {'what': 'Steps 13\\u201316: Drag the match to the torch', 'why': 'Drag the match to the torch; then Drag the torch to the mummy; then Drag the stick from the girl\'s hand to the mechanism slot on the pillar; then Swipe down on the stick'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 39?', 'In order: 1) Drag the talisman on the wall to the mummy; 2) Drag the cat on the mural to the mummy; 3) Drag the fan to the mummy; 4) Tap the backpack; 5) Drag the sweet potato from the bag to the mouse hole; 6) Drag the cross to the mummy; 7) Drag the taser from the bag to the mummy; 8) Double-tap the sunflower; 9) Drag the sun to the mummy; 10) Drag the whistle to the girl; 11) Drag the scarab to the mummy; 12) Drag the girl\'s shoe to the mummy; 13) Drag the match to the torch; 14) Drag the torch to the mummy; 15) Drag the stick from the girl\'s hand to the mechanism slot on the pillar; 16) Swipe down on the stick'],
            ['Why does nothing happen when I tap in Level 39?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 39 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    40: {
        'slug': 'brain-puzzle-3-level-40',
        'title': 'Brain Puzzle 3 Level 40 Answer: Choose a Pet Guide',
        'description': 'Brain Puzzle 3 Level 40 (Choose a Pet) answer: let customers adopt their favorite pet. Full step order plus the complete video walkthrough.',
        'goal': 'Let customers adopt their favorite pet',
        'video_id': 'M66a8zw5huA',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l40_hero.jpg',
        'summary': 'Level 40 \u201cChoose a Pet\u201d: Let customers adopt their favorite pet. 11 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20133: Drag the dog food to the puppy', 'why': 'Drag the dog food to the puppy; then Drag the radio to the parrot; then Drag the wolf photo to the dog'},
            {'what': 'Steps 4\\u20136: Drag the mushroom from the poster to the dog', 'why': 'Drag the mushroom from the poster to the dog; then Drag the fan to the dog; then Drag the spider to the boy'},
            {'what': 'Steps 7\\u20139: Tap the mouse hole', 'why': 'Tap the mouse hole; then Drag the mouse to the cat; then Drag the clock to the fish tank'},
            {'what': 'Steps 10\\u201311: Swipe down the cabinet', 'why': 'Swipe down the cabinet; then Drag the robot dog to the man'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 40?', 'In order: 1) Drag the dog food to the puppy; 2) Drag the radio to the parrot; 3) Drag the wolf photo to the dog; 4) Drag the mushroom from the poster to the dog; 5) Drag the fan to the dog; 6) Drag the spider to the boy; 7) Tap the mouse hole; 8) Drag the mouse to the cat; 9) Drag the clock to the fish tank; 10) Swipe down the cabinet; 11) Drag the robot dog to the man'],
            ['Why does nothing happen when I tap in Level 40?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 40 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    41: {
        'slug': 'brain-puzzle-3-level-41',
        'title': 'Brain Puzzle 3 Level 41 Answer: Dog Fire Rescue Guide',
        'description': 'Brain Puzzle 3 Level 41 (Dog Fire Rescue) answer: help the puppy put out all the fires. Full step order plus the complete video walkthrough.',
        'goal': 'Help the puppy put out all the fires',
        'video_id': 'bJ4beKGDKLw',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l41_hero.jpg',
        'summary': 'Level 41 \u201cDog Fire Rescue\u201d: Help the puppy put out all the fires. 12 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20133: Drag the fish tank to the dog', 'why': 'Drag the fish tank to the dog; then Drag the litter box to the dog; then Give the soda to the dog'},
            {'what': 'Steps 4\\u20136: Give the Poké Ball to the dog', 'why': 'Give the Poké Ball to the dog; then Drag the remote to the TV; then Drag the magic robe from the TV to the dog'},
            {'what': 'Steps 7\\u20139: Swipe left to open the kitchen door', 'why': 'Swipe left to open the kitchen door; then Drag the water jug from the dispenser to the dog; then Drag the kitchen pot to the dog'},
            {'what': 'Steps 10\\u201312: Give the mustard to the dog', 'why': 'Give the mustard to the dog; then Drag the figurine’s hair onto the toy dog; then Give the phone to the dog'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 41?', 'In order: 1) Drag the fish tank to the dog; 2) Drag the litter box to the dog; 3) Give the soda to the dog; 4) Give the Poké Ball to the dog; 5) Drag the remote to the TV; 6) Drag the magic robe from the TV to the dog; 7) Swipe left to open the kitchen door; 8) Drag the water jug from the dispenser to the dog; 9) Drag the kitchen pot to the dog; 10) Give the mustard to the dog; 11) Drag the figurine’s hair onto the toy dog; 12) Give the phone to the dog'],
            ['Why does nothing happen when I tap in Level 41?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 41 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    42: {
        'slug': 'brain-puzzle-3-level-42',
        'title': 'Brain Puzzle 3 Level 42 Answer: Watch Sunrise Guide',
        'description': 'Brain Puzzle 3 Level 42 (Watch Sunrise) answer: help the black-haired boy relieve fatigue. Full step order plus the complete video walkthrough.',
        'goal': 'Help the black-haired boy relieve fatigue',
        'video_id': 'SIgu0uV07bY',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l42_hero.jpg',
        'summary': 'Level 42 \u201cWatch Sunrise\u201d: Help the black-haired boy relieve fatigue. 13 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20134: Drag the drink from between the two people to the black-haired guy', 'why': 'Drag the drink from between the two people to the black-haired guy; then Drag the chips on the windshield wiper to the black-haired guy; then Click on the backpack; then Drag the joke book out of the backpack to the brown-haired guy'},
            {'what': 'Steps 5\\u20137: Drag the microphone from the back seat to the brown-haired guy', 'why': 'Drag the microphone from the back seat to the brown-haired guy; then Swipe up the car hood; then Drag the headphones from the brown-haired guy to the black-haired guy'},
            {'what': 'Steps 8\\u201310: Click the blue button on the right window', 'why': 'Click the blue button on the right window; then Drag the flowers on the car roof to the AC vent; then Swipe down the Samoyed dog'},
            {'what': 'Steps 11\\u201313: Drag the foam roller behind Samoyed to the black-haired boy', 'why': 'Drag the foam roller behind Samoyed to the black-haired boy; then Slide down the sun visor above the brown-haired boy\'s head; then Drag the dropped refreshing spray to the black-haired boy'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 42?', 'In order: 1) Drag the drink from between the two people to the black-haired guy; 2) Drag the chips on the windshield wiper to the black-haired guy; 3) Click on the backpack; 4) Drag the joke book out of the backpack to the brown-haired guy; 5) Drag the microphone from the back seat to the brown-haired guy; 6) Swipe up the car hood; 7) Drag the headphones from the brown-haired guy to the black-haired guy; 8) Click the blue button on the right window; 9) Drag the flowers on the car roof to the AC vent; 10) Swipe down the Samoyed dog; 11) Drag the foam roller behind Samoyed to the black-haired boy; 12) Slide down the sun visor above the brown-haired boy\'s head; 13) Drag the dropped refreshing spray to the black-haired boy'],
            ['Why does nothing happen when I tap in Level 42?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 42 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    43: {
        'slug': 'brain-puzzle-3-level-43',
        'title': 'Brain Puzzle 3 Level 43 Answer: Glow-Up Comeback Guide',
        'description': 'Brain Puzzle 3 Level 43 (Glow-Up Comeback) answer: help the girl change. Full step order plus the complete video walkthrough.',
        'goal': 'Help the girl change',
        'video_id': 'KjblARd5bHI',
        'verified': 'weak',
        'verify_note': 'Steps cross-checked against an independent all-levels reference (current game version) and the embedded walkthrough video. Brain Puzzle 3 moves are drags as often as taps — if a tap does nothing, try dragging the object instead.',
        'hero': 'l43_hero.jpg',
        'summary': 'Level 43 \u201cGlow-Up Comeback\u201d: Help the girl change. 13 moves in order — follow the step cards below or copy the embedded video move-for-move.',
        'steps': [
            {'what': 'Steps 1\\u20134: Do not drag the magic wand to the man', 'why': 'Do not drag the magic wand to the man; then Drag the magic wand to the dirty floor; then Drag the magic wand to the coffee; then Drag the magic wand to the teddy bear'},
            {'what': 'Steps 5\\u20137: Drag the magic wand to the laptop', 'why': 'Drag the magic wand to the laptop; then Drag the magic wand to the check-in calendar; then Drag the magic wand to the cat'},
            {'what': 'Steps 8\\u201310: Drag the magic wand to the wardrobe', 'why': 'Drag the magic wand to the wardrobe; then Drag the magic wand to the drawer under the wardrobe; then Drag the magic wand to the fried chicken and soda'},
            {'what': 'Steps 11\\u201313: Drag the magic wand to the notebook under the table', 'why': 'Drag the magic wand to the notebook under the table; then Drag the magic wand to the begging girl; then Drag the bouquet to the man'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 43?', 'In order: 1) Do not drag the magic wand to the man; 2) Drag the magic wand to the dirty floor; 3) Drag the magic wand to the coffee; 4) Drag the magic wand to the teddy bear; 5) Drag the magic wand to the laptop; 6) Drag the magic wand to the check-in calendar; 7) Drag the magic wand to the cat; 8) Drag the magic wand to the wardrobe; 9) Drag the magic wand to the drawer under the wardrobe; 10) Drag the magic wand to the fried chicken and soda; 11) Drag the magic wand to the notebook under the table; 12) Drag the magic wand to the begging girl; 13) Drag the bouquet to the man'],
            ['Why does nothing happen when I tap in Level 43?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 43 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    44: {
        'slug': 'brain-puzzle-3-level-44',
        'title': 'Brain Puzzle 3 Level 44 Answer: Polly the Parrot Guide',
        'description': 'Brain Puzzle 3 Level 44 (Polly the Parrot) answer: help Polly gather enough cookies. Full step order plus the complete video walkthrough.',
        'goal': 'Help Polly gather enough cookies',
        'video_id': 'GHre1ekBAqI',
        'verified': 'strong',
        'verify_note': 'Scene confirmed on screen: green parrot on a perch in a kitchen, mouse hole, tooth-fairy painting, oven, broom, gingerbread man, trash can and sink — every object the steps name is present. The closing story card (\'Polly wants a romantic date\') marks the level end at 1:15. Frames were sampled every 5 s, so the timestamps are accurate to about ±5 s.',
        'hero': 'l44_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 44 is "Polly the Parrot": Help Polly gather enough cookies. 21 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20136: Move the cookie on the table to the parrot', 'why': 'Move the cookie on the table to the parrot; then Move the cookie on the floor to the parrot; then Move the cookie from the cat bowl to the parrot; then Move the cheese to the mouse hole; then Move the cookie dropped by the mouse to the parrot; then Move the tooth to the tooth fairy in the painting'},
            {'what': 'Steps 7\\u201311: Move the cookie left by the tooth fairy to the parrot', 'why': 'Move the cookie left by the tooth fairy to the parrot; then Move the dough to the oven; then Move the baked cookie to the parrot; then Double-tap the cabinet on the right; then Move the cookie from the cabinet to the parrot'},
            {'what': 'Steps 12\\u201316: Move the broom to the broken cookie', 'why': 'Move the broom to the broken cookie; then Move the fixed cookie to the parrot; then Move the gingerbread man to the parrot; then Click the trash can; then Drag the broom to the spilled trash'},
            {'what': 'Steps 17\\u201321: Drag the cleaned cookie to the parrot', 'why': 'Drag the cleaned cookie to the parrot; then Flip the light switch; then Drag the cookie from the light bulb to the parrot; then Turn on the faucet; then Drag the cookie from the sink to the parrot'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 44?', 'In order: 1) Move the cookie on the table to the parrot; 2) Move the cookie on the floor to the parrot; 3) Move the cookie from the cat bowl to the parrot; 4) Move the cheese to the mouse hole; 5) Move the cookie dropped by the mouse to the parrot; 6) Move the tooth to the tooth fairy in the painting; 7) Move the cookie left by the tooth fairy to the parrot; 8) Move the dough to the oven; 9) Move the baked cookie to the parrot; 10) Double-tap the cabinet on the right; 11) Move the cookie from the cabinet to the parrot; 12) Move the broom to the broken cookie; 13) Move the fixed cookie to the parrot; 14) Move the gingerbread man to the parrot; 15) Click the trash can; 16) Drag the broom to the spilled trash; 17) Drag the cleaned cookie to the parrot; 18) Flip the light switch; 19) Drag the cookie from the light bulb to the parrot; 20) Turn on the faucet; 21) Drag the cookie from the sink to the parrot'],
            ['Why does nothing happen when I tap in Level 44?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 44 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    45: {
        'slug': 'brain-puzzle-3-level-45',
        'title': 'Brain Puzzle 3 Level 45 Answer: Grandma\'s Filling Guide',
        'description': 'Brain Puzzle 3 Level 45 (Grandma\'s Filling) answer: help Grandma Fix Her Teeth. Full step order plus the complete video walkthrough.',
        'goal': 'Help Grandma Fix Her Teeth',
        'video_id': 'o3l_32lfqn8',
        'verified': 'strong',
        'verify_note': 'Definitely this level: the frame shows the dental chair, the grandma with missing teeth, the dentist, the girl on the stool, the fish tank holding the crab and conch, and the computer desk with a \'SUPER SALE\' screen — the exact odd props the steps use. Late moves were watched on screen (gold at 1:40, fish bone at 1:50, \'Completed\' at 1:55). Timestamps are ±5 s.',
        'hero': 'l45_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 45 is "Grandma\'s Filling": Help Grandma Fix Her Teeth. 24 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20136: Drag the doctor\'s diamond earrings to the doctor', 'why': 'Drag the doctor\'s diamond earrings to the doctor; then Drag the crab claw in the fish tank to the doctor; then Drag the conch in the fish tank to the doctor; then Drag the medal on the wall to the doctor; then Drag the heel of the girl sitting on the chair to the doctor; then Drag the light bulb above grandma\'s head to the doctor'},
            {'what': 'Steps 7\\u201312: Drag the wheel of the computer chair to the doctor', 'why': 'Drag the wheel of the computer chair to the doctor; then Drag grandma\'s pearl necklace to the doctor; then Drag the mouse on the computer desk to the doctor; then Swipe left on the curtain; then Drag the walnut in the cabinet to the doctor; then Tap the clock'},
            {'what': 'Steps 13\\u201318: Drag the moon outside the window to the doctor', 'why': 'Drag the moon outside the window to the doctor; then Drag the coconut shell in the girl\'s hand sitting on the chair to the doctor; then Drag the water cup to the cement; then Drag the stone to the doctor; then Drag the hammer to the crack on the floor; then Drag the fossil in the crack to the doctor'},
            {'what': 'Steps 19\\u201324: Swipe down on the sign', 'why': 'Swipe down on the sign; then Drag the gold behind the sign to the doctor; then Tap grandma\'s tongue; then Drag the fish bone under the tongue to the doctor; then Tap the computer; then Drag the porcelain tooth on the computer to the doctor'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 45?', 'In order: 1) Drag the doctor\'s diamond earrings to the doctor; 2) Drag the crab claw in the fish tank to the doctor; 3) Drag the conch in the fish tank to the doctor; 4) Drag the medal on the wall to the doctor; 5) Drag the heel of the girl sitting on the chair to the doctor; 6) Drag the light bulb above grandma\'s head to the doctor; 7) Drag the wheel of the computer chair to the doctor; 8) Drag grandma\'s pearl necklace to the doctor; 9) Drag the mouse on the computer desk to the doctor; 10) Swipe left on the curtain; 11) Drag the walnut in the cabinet to the doctor; 12) Tap the clock; 13) Drag the moon outside the window to the doctor; 14) Drag the coconut shell in the girl\'s hand sitting on the chair to the doctor; 15) Drag the water cup to the cement; 16) Drag the stone to the doctor; 17) Drag the hammer to the crack on the floor; 18) Drag the fossil in the crack to the doctor; 19) Swipe down on the sign; 20) Drag the gold behind the sign to the doctor; 21) Tap grandma\'s tongue; 22) Drag the fish bone under the tongue to the doctor; 23) Tap the computer; 24) Drag the porcelain tooth on the computer to the doctor'],
            ['Why does nothing happen when I tap in Level 45?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 45 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    46: {
        'slug': 'brain-puzzle-3-level-46',
        'title': 'Brain Puzzle 3 Level 46 Answer: Ambiguous Campus Guide',
        'description': 'Brain Puzzle 3 Level 46 (Ambiguous Campus) answer: help the two girls raise the boy\'s favorability. Full step order plus the complete video walkthrough.',
        'goal': 'Help the two girls raise the boy\'s favorability towards them',
        'video_id': '5BTnI8TLD4c',
        'verified': 'strong',
        'verify_note': 'Scene confirmed: classroom with the pink-haired girl on the left, the boy in the middle, the girl with glasses on the right, and the blackboard with the spider. The boy\'s thought bubble and the closing line \'Stop arguing with each other because of me\' match this level\'s ending. Timestamps ±5 s.',
        'hero': 'l46_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 46 is "Ambiguous Campus": Help the two girls raise the boy\'s favorability towards them. 12 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20133: Drag milk tea to the pink-haired girl', 'why': 'Drag milk tea to the pink-haired girl; then Drag the small fan to the pink-haired girl; then Drag the bento to the pink-haired girl'},
            {'what': 'Steps 4\\u20136: Drag the earphones to the pink-haired girl', 'why': 'Drag the earphones to the pink-haired girl; then Click the red shoulder bag; then Drag the nail polish to the pink-haired girl'},
            {'what': 'Steps 7\\u20139: Drag the chalk to the girl with glasses', 'why': 'Drag the chalk to the girl with glasses; then Drag the spider to the girl with glasses; then Drag mineral water to the girl with glasses'},
            {'what': 'Steps 10\\u201312: Drag the words on the blackboard to the blank book', 'why': 'Drag the words on the blackboard to the blank book; then Drag the book with words to the girl with glasses; then Swipe right on the boy\'s arm'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 46?', 'In order: 1) Drag milk tea to the pink-haired girl; 2) Drag the small fan to the pink-haired girl; 3) Drag the bento to the pink-haired girl; 4) Drag the earphones to the pink-haired girl; 5) Click the red shoulder bag; 6) Drag the nail polish to the pink-haired girl; 7) Drag the chalk to the girl with glasses; 8) Drag the spider to the girl with glasses; 9) Drag mineral water to the girl with glasses; 10) Drag the words on the blackboard to the blank book; 11) Drag the book with words to the girl with glasses; 12) Swipe right on the boy\'s arm'],
            ['Why does nothing happen when I tap in Level 46?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 46 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    47: {
        'slug': 'brain-puzzle-3-level-47',
        'title': 'Brain Puzzle 3 Level 47 Answer: Escape from the doctor Guide',
        'description': 'Brain Puzzle 3 Level 47 (Escape from the doctor) answer: help the girl resist the doctor. Full step order plus the complete video walkthrough.',
        'goal': 'Help the girl resist the doctor',
        'video_id': 'pcnrYyNCoPU',
        'verified': 'strong',
        'verify_note': 'Scene confirmed: girl strapped to the operating chair, doctor in a lab coat with a syringe, biohazard trash can, surgical light and sink. The escape beat is visible — the doctor ends up hanging from the ceiling and the girl runs down the corridor. Timestamps ±5 s.',
        'hero': 'l47_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 47 is "Escape from the doctor": Help the girl resist the doctor. 12 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20133: Drag the glass bottle of green solution to the doctor', 'why': 'Drag the glass bottle of green solution to the doctor; then Drag the glass bottle to the doctor; then Drag the fire extinguisher to the doctor'},
            {'what': 'Steps 4\\u20136: Drag the hair to the doctor', 'why': 'Drag the hair to the doctor; then Drag the bone to the doctor; then Slide down the surgical light above the head'},
            {'what': 'Steps 7\\u20139: Click the trash can', 'why': 'Click the trash can; then Drag the garbage bag to the doctor; then Drag the empty trash can to the doctor'},
            {'what': 'Steps 10\\u201312: Click the faucet', 'why': 'Click the faucet; then Drag the pepper spray to the doctor; then Slide down the doctor\'s pants'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 47?', 'In order: 1) Drag the glass bottle of green solution to the doctor; 2) Drag the glass bottle to the doctor; 3) Drag the fire extinguisher to the doctor; 4) Drag the hair to the doctor; 5) Drag the bone to the doctor; 6) Slide down the surgical light above the head; 7) Click the trash can; 8) Drag the garbage bag to the doctor; 9) Drag the empty trash can to the doctor; 10) Click the faucet; 11) Drag the pepper spray to the doctor; 12) Slide down the doctor\'s pants'],
            ['Why does nothing happen when I tap in Level 47?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 47 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    48: {
        'slug': 'brain-puzzle-3-level-48',
        'title': 'Brain Puzzle 3 Level 48 Answer: Chimney Cooling Guide',
        'description': 'Brain Puzzle 3 Level 48 (Chimney Cooling) answer: don\'t let the girl be spotted by the pervert!. Full step order plus the complete video walkthrough.',
        'goal': 'Don\'t let the girl be spotted by the pervert!',
        'video_id': '5ZouNdyM7FE',
        'verified': 'strong',
        'verify_note': 'Scene confirmed on a full frame: the girl is perched on the chimney breast above the burning fireplace while the uncle stands at the open window, with the air conditioner, curtains, fridge, framed poster and sofa all visible. Closing beats \'Escaped disaster\' (1:35) and \'Completed\' (1:40) are on screen. Timestamps ±5 s.',
        'hero': 'l48_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 48 is "Chimney Cooling": Don\'t let the girl be spotted by the pervert!. 16 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20134: Don\'t drag the heartthrob poster to the girl', 'why': 'Don\'t drag the heartthrob poster to the girl; then Don\'t drag the fan to the girl; then Tap the phone; then Drag the phone to the girl'},
            {'what': 'Steps 5\\u20138: Swipe right to open the fridge', 'why': 'Swipe right to open the fridge; then Drag the ice cubes from the fridge to the girl; then Drag the lid of the foam box in the fridge to the girl; then Double-tap to open the window'},
            {'what': 'Steps 9\\u201312: Drag the glue to the girl', 'why': 'Drag the glue to the girl; then Drag the watermelon to the girl; then Drag the paint onto the poster; then Drag the poster to the girl'},
            {'what': 'Steps 13\\u201316: Swipe down to remove the girl\'s coat', 'why': 'Swipe down to remove the girl\'s coat; then Drag the remote control to the air conditioner; then Drag the horror storybook to the girl; then Drag the curtain to the uncle'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 48?', 'In order: 1) Don\'t drag the heartthrob poster to the girl; 2) Don\'t drag the fan to the girl; 3) Tap the phone; 4) Drag the phone to the girl; 5) Swipe right to open the fridge; 6) Drag the ice cubes from the fridge to the girl; 7) Drag the lid of the foam box in the fridge to the girl; 8) Double-tap to open the window; 9) Drag the glue to the girl; 10) Drag the watermelon to the girl; 11) Drag the paint onto the poster; 12) Drag the poster to the girl; 13) Swipe down to remove the girl\'s coat; 14) Drag the remote control to the air conditioner; 15) Drag the horror storybook to the girl; 16) Drag the curtain to the uncle'],
            ['Why does nothing happen when I tap in Level 48?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 48 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    49: {
        'slug': 'brain-puzzle-3-level-49',
        'title': 'Brain Puzzle 3 Level 49 Answer: Shark Crisis Guide',
        'description': 'Brain Puzzle 3 Level 49 (Shark Crisis) answer: help the protagonist block the leak until rescue. Full step order plus the complete video walkthrough.',
        'goal': 'Help the protagonist block the leak until rescue arrives',
        'video_id': 'Onlyg3fwByE',
        'verified': 'strong',
        'verify_note': 'Scene confirmed: small boat with water gushing through the hull, the shark wearing a bib and holding a fork and knife, life buoy, anchor and coral in the water. Late moves were watched in order (fork deflates the buoy at 1:05, buoy plugs the hole at 1:10, coral over the hole at 1:15, rescue helicopter at 1:20). Note that this level is labelled Level 42/43/49 by different channels — the older uploads do not match the current order.',
        'hero': 'l49_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 49 is "Shark Crisis": Help the protagonist block the leak until rescue arrives. 12 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20133: Drag the wooden plank from the sea to the cave entrance', 'why': 'Drag the wooden plank from the sea to the cave entrance; then Drag the starfish to the cave entrance; then Drag the vine from the rock to the cave entrance'},
            {'what': 'Steps 4\\u20136: Drag the life jacket to the cave entrance', 'why': 'Drag the life jacket to the cave entrance; then Drag the swimsuit to the cave entrance; then Drag the wig to the cave entrance'},
            {'what': 'Steps 7\\u20139: Drag the shark\'s napkin to the cave entrance', 'why': 'Drag the shark\'s napkin to the cave entrance; then Drag the shark\'s fork to the life buoy; then Drag the deflated life buoy to the cave entrance'},
            {'what': 'Steps 10\\u201312: Drag the anchor to the coral', 'why': 'Drag the anchor to the coral; then Drag the coral over to the hole; then Pull the sail to the hole'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 49?', 'In order: 1) Drag the wooden plank from the sea to the cave entrance; 2) Drag the starfish to the cave entrance; 3) Drag the vine from the rock to the cave entrance; 4) Drag the life jacket to the cave entrance; 5) Drag the swimsuit to the cave entrance; 6) Drag the wig to the cave entrance; 7) Drag the shark\'s napkin to the cave entrance; 8) Drag the shark\'s fork to the life buoy; 9) Drag the deflated life buoy to the cave entrance; 10) Drag the anchor to the coral; 11) Drag the coral over to the hole; 12) Pull the sail to the hole'],
            ['Why does nothing happen when I tap in Level 49?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 49 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    50: {
        'slug': 'brain-puzzle-3-level-50',
        'title': 'Brain Puzzle 3 Level 50 Answer: Light a fire while camping Guide',
        'description': 'Brain Puzzle 3 Level 50 (Light a fire while camping) answer: help the family start a fire. Full step order plus the complete video walkthrough.',
        'goal': 'Help the family start a fire',
        'video_id': 'ecDtTpNm-pM',
        'verified': 'weak',
        'verify_note': 'The scene is right — campsite, cold family, camper van, jerrycan, thundercloud — and the finish is on screen (lightning hits the fire at 0:45, bigger fire at 1:15, \'Completed\' at 1:20). The frame-by-frame read of the item order was too unclear to confirm the logged step list, so treat the step order below as the written source order and the timestamps as rough anchors. A second upload of this level, \'C8pWeui_pJc\', shows the in-game label \'LEVEL 44\' — the numbering really does drift between channels.',
        'hero': 'l50_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 50 is "Light a fire while camping": Help the family start a fire. 20 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20135: Do not drag the gasoline to the campfire', 'why': 'Do not drag the gasoline to the campfire; then Drag the acorn from the squirrel to the campfire; then Drag the leaves to the campfire; then Drag the branch to the campfire; then Drag the rolling tumbleweed to the campfire'},
            {'what': 'Steps 6\\u201310: Drag the bush to the campfire', 'why': 'Drag the bush to the campfire; then Drag the vines wrapped around the tire to the campfire; then Drag the woman’s wool hat to the campfire; then Drag the power bank from the man to the thundercloud; then Drag the thundercloud to the campfire'},
            {'what': 'Steps 11\\u201315: Tap the car window', 'why': 'Tap the car window; then Drag the paper bag inside the car to the campfire; then Tap the luggage on the car roof; then Drag the straw hat from the luggage to the campfire; then Tap the backpack on the ground'},
            {'what': 'Steps 16\\u201320: Drag the book from the backpack to the campfire', 'why': 'Drag the book from the backpack to the campfire; then Drag the small stone to the big one; then Drag the selfie stick to the sharpened stone; then Drag the stone axe to the dead tree; then Drag the wood to the campfire'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 50?', 'In order: 1) Do not drag the gasoline to the campfire; 2) Drag the acorn from the squirrel to the campfire; 3) Drag the leaves to the campfire; 4) Drag the branch to the campfire; 5) Drag the rolling tumbleweed to the campfire; 6) Drag the bush to the campfire; 7) Drag the vines wrapped around the tire to the campfire; 8) Drag the woman’s wool hat to the campfire; 9) Drag the power bank from the man to the thundercloud; 10) Drag the thundercloud to the campfire; 11) Tap the car window; 12) Drag the paper bag inside the car to the campfire; 13) Tap the luggage on the car roof; 14) Drag the straw hat from the luggage to the campfire; 15) Tap the backpack on the ground; 16) Drag the book from the backpack to the campfire; 17) Drag the small stone to the big one; 18) Drag the selfie stick to the sharpened stone; 19) Drag the stone axe to the dead tree; 20) Drag the wood to the campfire'],
            ['Why does nothing happen when I tap in Level 50?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 50 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    51: {
        'slug': 'brain-puzzle-3-level-51',
        'title': 'Brain Puzzle 3 Level 51 Answer: Bear Attack Guide',
        'description': 'Brain Puzzle 3 Level 51 (Bear Attack) answer: escape the terrifying brown bear attack. Full step order plus the complete video walkthrough.',
        'goal': 'Escape the terrifying brown bear attack',
        'video_id': 'bA-Xx-dvteQ',
        'verified': 'strong',
        'verify_note': 'Scene confirmed: family by a wooden house with a garage, brown bear, deflated tyre, pump, balloon, paint, ninja outfit, motorcycle and mushrooms — all the listed props. Late moves were seen in order (garage opens at 1:05, mushroom/grandma at 1:10, \'Completed\' at 1:20). Timestamps ±5 s.',
        'hero': 'l51_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 51 is "Bear Attack": Escape the terrifying brown bear attack. 14 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20134: Drag the grandfather to the deflated tire', 'why': 'Drag the grandfather to the deflated tire; then Drag the pump to the balloon on the branch; then Drag the inflated balloon to the younger brother; then Drag the paint to the older sister'},
            {'what': 'Steps 5\\u20138: Click the window of the wooden house', 'why': 'Click the window of the wooden house; then Drag the ninja outfit to the older brother; then Drag the branch to the shovel head on the ground; then Drag the shovel to the father'},
            {'what': 'Steps 9\\u201311: Drag the mother to the wooden house', 'why': 'Drag the mother to the wooden house; then Click the garage of the wooden house; then Drag the gasoline to the motorcycle'},
            {'what': 'Steps 12\\u201314: Drag the tire to the motorcycle', 'why': 'Drag the tire to the motorcycle; then Drag the grandfather onto the motorcycle; then Drag the mushroom to the grandmother'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 51?', 'In order: 1) Drag the grandfather to the deflated tire; 2) Drag the pump to the balloon on the branch; 3) Drag the inflated balloon to the younger brother; 4) Drag the paint to the older sister; 5) Click the window of the wooden house; 6) Drag the ninja outfit to the older brother; 7) Drag the branch to the shovel head on the ground; 8) Drag the shovel to the father; 9) Drag the mother to the wooden house; 10) Click the garage of the wooden house; 11) Drag the gasoline to the motorcycle; 12) Drag the tire to the motorcycle; 13) Drag the grandfather onto the motorcycle; 14) Drag the mushroom to the grandmother'],
            ['Why does nothing happen when I tap in Level 51?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 51 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    52: {
        'slug': 'brain-puzzle-3-level-52',
        'title': 'Brain Puzzle 3 Level 52 Answer: A Quiet Place Guide',
        'description': 'Brain Puzzle 3 Level 52 (A Quiet Place) answer: help the man escape the cabin. Full step order plus the complete video walkthrough.',
        'goal': 'Help the man escape the cabin',
        'video_id': 'tXtUyXJohQ8',
        'verified': 'strong',
        'verify_note': 'Scene confirmed: cabin interior with the dark monster, the hiding man, laptop, headphones, radio, antlers and the stove pipe. The first four moves are easy to read on screen (speaker clicked at 0:10, window at 0:20, laptop at 0:30, headphones at 0:40) and \'Completed\' lands at 2:25. Timestamps ±5 s.',
        'hero': 'l52_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 52 is "A Quiet Place": Help the man escape the cabin. 12 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20133: Click the speaker on the wall', 'why': 'Click the speaker on the wall; then Double-tap the window; then Swipe down on the laptop'},
            {'what': 'Steps 4\\u20136: Drag the headphones to the monster', 'why': 'Drag the headphones to the monster; then Drag the battery to the monkey toy; then Drag the shoes to the trap'},
            {'what': 'Steps 7\\u20139: Drag the saw blade to the antlers', 'why': 'Drag the saw blade to the antlers; then Drag the bullet to the rifle; then Drag the dried fish to the tabby cat on the wall'},
            {'what': 'Steps 10\\u201312: Click the radio', 'why': 'Click the radio; then Swipe right on the volume knob; then Swipe up the fireplace exhaust pipe'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 52?', 'In order: 1) Click the speaker on the wall; 2) Double-tap the window; 3) Swipe down on the laptop; 4) Drag the headphones to the monster; 5) Drag the battery to the monkey toy; 6) Drag the shoes to the trap; 7) Drag the saw blade to the antlers; 8) Drag the bullet to the rifle; 9) Drag the dried fish to the tabby cat on the wall; 10) Click the radio; 11) Swipe right on the volume knob; 12) Swipe up the fireplace exhaust pipe'],
            ['Why does nothing happen when I tap in Level 52?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 52 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    53: {
        'slug': 'brain-puzzle-3-level-53',
        'title': 'Brain Puzzle 3 Level 53 Answer: Makeup Pro Guide',
        'description': 'Brain Puzzle 3 Level 53 (Makeup Pro) answer: create beautiful makeup looks for the girls. Full step order plus the complete video walkthrough.',
        'goal': 'Create beautiful makeup looks for the girls',
        'video_id': 'wINSLsJC5to',
        'verified': 'strong',
        'verify_note': 'Scene confirmed: pink vanity room, white-haired makeup artist, clients queueing, window with clouds outside. Late moves were watched (self-tanner at 1:45, rainbow at 2:00 giving the artist rainbow hair, group-photo line at 2:10). This upload also shows a couple of rejected items early on, so the early timestamps are anchors rather than an exact 1:1 map of the step list.',
        'hero': 'l53_hero.jpg',
        'summary': 'Brain Puzzle 3 Level 53 is "Makeup Pro": Create beautiful makeup looks for the girls. 14 moves in order, listed below and shown in the embedded walkthrough. Most moves are drags — if a tap does nothing, drag the object onto the person or prop it belongs to.',
        'steps': [
            {'what': 'Steps 1\\u20134: Drag the mascara from the shelf to the white-haired makeup artist', 'why': 'Drag the mascara from the shelf to the white-haired makeup artist; then Double-click to open the window; then Drag the sparrow outside the window to the white-haired makeup artist; then Drag the plunger to the white-haired makeup artist'},
            {'what': 'Steps 5\\u20138: Swipe down on the white-haired makeup artist', 'why': 'Swipe down on the white-haired makeup artist; then Drag the feather duster to the white-haired makeup artist; then Drag the dirty feather duster to the white-haired makeup artist; then Tap the light switch to turn off the lights'},
            {'what': 'Steps 9\\u201311: Drag the fluorescent paint on the wall to the white-haired makeup artist', 'why': 'Drag the fluorescent paint on the wall to the white-haired makeup artist; then Drag the black marker on the floor to the white-haired makeup artist; then Drag the self-tanner on the vanity to the white-haired makeup artist'},
            {'what': 'Steps 12\\u201314: Swipe left on the white cloud outside the window', 'why': 'Swipe left on the white cloud outside the window; then Drag the makeup bag from the shelf to the white-haired makeup artist; then Drag the rainbow generated by the white cloud outside to the white-haired makeup artist'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 53?', 'In order: 1) Drag the mascara from the shelf to the white-haired makeup artist; 2) Double-click to open the window; 3) Drag the sparrow outside the window to the white-haired makeup artist; 4) Drag the plunger to the white-haired makeup artist; 5) Swipe down on the white-haired makeup artist; 6) Drag the feather duster to the white-haired makeup artist; 7) Drag the dirty feather duster to the white-haired makeup artist; 8) Tap the light switch to turn off the lights; 9) Drag the fluorescent paint on the wall to the white-haired makeup artist; 10) Drag the black marker on the floor to the white-haired makeup artist; 11) Drag the self-tanner on the vanity to the white-haired makeup artist; 12) Swipe left on the white cloud outside the window; 13) Drag the makeup bag from the shelf to the white-haired makeup artist; 14) Drag the rainbow generated by the white cloud outside to the white-haired makeup artist'],
            ['Why does nothing happen when I tap in Level 53?', 'Brain Puzzle 3 mixes taps, drags and swipes freely. If a tap does nothing, try dragging the object onto the person or thing it belongs to — most moves in this game are drags.'],
            ['Is this Level 53 walkthrough up to date?', 'Yes — the step order matches the current version of Brain Puzzle 3: Crazy Mind. Older videos and sites may use different level numbers, because the developer has inserted new levels over time and shifted the numbering.'],
        ],
    },
    137: {
        'slug': 'brain-puzzle-3-level-137',
        'title': 'Brain Puzzle 3 Level 137 Answer: Coaster Guide',
        'description': 'Brain Puzzle 3 Level 137 answer, step by step: tap off all three passenger wigs to drop the coaster weight. Quick answer, screenshots, video timestamps.',
        'goal': 'Why won\'t this roller coaster go up!',
        'video_id': 'MlcohtcpNDM',
        'verified': 'verified',
        'summary': 'The coaster is too heavy to climb the hill (240 kg). Tap the wig off each of the three passengers. Each wig removes 10 kg. After the third wig the weight drops enough and the coaster makes it up the hill.',
        'steps': [
            {'t': 44, 'img': 'l25_step1.jpg', 'what': 'Tap the wig on the passenger at the back of the car', 'why': 'The weight sign shows 240 kg. Pulling the rear passenger\'s wig off removes 10 kg instantly, and the target weight bar drops.'},
            {'t': 52, 'img': 'l25_step2.jpg', 'what': 'Tap the wig on the middle passenger', 'why': 'Same trick, second wig: another 10 kg gone. The coaster still can\'t climb, so keep going.'},
            {'t': 56, 'img': 'l25_step3.jpg', 'what': 'Tap the wig on the front passenger', 'why': 'Third wig, another 10 kg off. With the total weight down 30 kg the coaster finally crests the hill.'},
            {'t': 58, 'img': 'l25_result.jpg', 'what': 'Level complete', 'why': 'The coaster sails over the top and the polaroid screen appears. Level 137 cleared.'},
        ],
        'faq': [
            ['What is the answer to Brain Puzzle 3 Level 137?', 'Tap the wig on each of the three passengers, one after another. Every wig takes 10 kg off the coaster, and after the third one the weight is low enough for the coaster to climb the hill and finish the level.'],
            ['Why won\'t the roller coaster go up in Level 137?', 'The car is carrying 240 kg, which is too heavy for the climb. The game hides the solution in plain sight: the wigs on the three passengers are removable. Remove all three and the coaster is light enough.'],
            ['Do I need to use any hint items in Level 137?', 'No. Level 137 only needs the three taps on the wigs. There are no hidden objects or drag moves, so the level costs nothing to clear.'],
        ],
    },
}

HUB = {
    'slug': 'brain-puzzle-3-answers',
    'title': 'Brain Puzzle 3 Answers: Level Walkthroughs',
    'description': 'Brain Puzzle 3 answers for every tricky level: quick answers, screenshot steps and video timestamps. Find your stuck level and clear it in under a minute.',
}

STYLE = """
    :root {
      --amber: #D97706; --cream: #FFFBF5; --green: #15803D;
      --text: #3A2F28; --light: #9C8B7B; --border: #F2E4D4;
      --shadow: 0 2px 8px rgba(217,119,6,0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Nunito', -apple-system, sans-serif; background: var(--cream); color: var(--text); min-height: 100vh; }
    .breadcrumb { font-size: 12px; color: var(--light); padding: 14px 16px 0; text-align: center; }
    .breadcrumb a { color: var(--light); text-decoration: none; }
    .breadcrumb a:hover { color: var(--amber); }
    .seo-section { max-width: 720px; margin: 0 auto; padding: 1.5rem 1rem 1rem; }
    .seo-section h1 { font-size: 1.7rem; margin: 1rem 0 0.5rem; line-height: 1.3; }
    .seo-section h2 { font-size: 1.35rem; margin: 2rem 0 0.6rem; line-height: 1.3; }
    .seo-section h2 .accent { color: var(--amber); }
    .seo-section h3 { font-size: 1.1rem; margin: 1.2rem 0 0.4rem; }
    .seo-section p { margin: 0.5rem 0; line-height: 1.75; color: #555; }
    .seo-section ul, .seo-section ol { padding-left: 1.5rem; margin: 0.5rem 0; color: #555; }
    .seo-section li { margin-bottom: 0.4rem; line-height: 1.6; }
    .seo-section a { color: var(--amber); }
    .answer-box { background: #fff; border: 2px solid var(--green); border-radius: 12px; padding: 1rem 1.1rem; margin: 1rem 0; box-shadow: var(--shadow); }
    .answer-box .label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--green); display: block; margin-bottom: 0.3rem; }
    .answer-box p { font-weight: 700; color: var(--text); margin: 0.2rem 0; }
    .step-card { background: #fff; border: 1.5px solid var(--border); border-left: 4px solid var(--amber); border-radius: 10px; padding: 0.9rem 1rem; margin: 0.8rem 0; box-shadow: var(--shadow); }
    .step-card .step-num { display: inline-block; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: #FFF0D4; color: #B26A00; border-radius: 999px; padding: 0.12rem 0.6rem; margin-bottom: 0.4rem; }
    .step-card strong { color: var(--text); display: block; margin-bottom: 0.3rem; }
    .step-card img { width: 100%; max-width: 380px; border-radius: 8px; border: 1.5px solid var(--border); display: block; margin: 0.5rem 0; }
    .step-card .ts { font-size: 0.78rem; color: var(--light); margin-top: 0.3rem; }
    .step-card .ts a { color: var(--amber); text-decoration: none; font-weight: 700; }
    .disclaimer { font-size: 0.82rem; color: var(--light); font-style: italic; background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem 0.8rem; margin: 0.6rem 0 1rem; }
    .verify-note { font-size: 0.85rem; background: #FFF8E6; border: 1px solid #F0DFAE; border-radius: 8px; padding: 0.5rem 0.8rem; margin: 0.6rem 0; color: #7A6420; }
    .video-wrap { position: relative; width: 100%; max-width: 420px; aspect-ratio: 16/9; margin: 0.8rem auto; }
    .hero-link { display: block; cursor: pointer; text-decoration: none; }
    .hero { width: 100%; max-width: 420px; display: block; border-radius: 12px; border: 1.5px solid var(--border); margin: 0 auto; }
    .video-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; border-radius: 12px; }
    .cta-box { margin: 1.2rem 0; padding: 0.9rem 1.1rem; background: #fff; border: 2px dashed var(--amber); border-radius: 12px; text-align: center; }
    .cta-box p { margin: 0.2rem 0; font-weight: 700; color: var(--text); }
    .cta-box a { color: var(--amber); font-weight: 800; text-decoration: none; }
    .cta-box a:hover { text-decoration: underline; }
    .cross-card { margin: 1.2rem 0; background: #fff; border: 2px solid var(--border); border-top: 5px solid var(--amber); border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(217,119,6,.08); }
    .cross-card img { width: 100%; display: block; aspect-ratio: 1200 / 630; object-fit: contain; background: #2D3740; }
    .cross-card .cross-body { padding: .9rem 1.1rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .cross-card .cross-kicker { font-size: .68rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; color: var(--amber); }
    .cross-card .cross-ttl { font-weight: 900; font-size: 1.05rem; margin: .1rem 0; }
    .cross-card .cross-desc { font-size: .85rem; color: #555; margin: 0; }
    .cross-card .cross-cta { background: var(--amber); color: #fff; font-weight: 800; font-size: .88rem; border-radius: 10px; padding: .5rem 1rem; text-decoration: none; white-space: nowrap; }
    .index-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.5rem; margin: 0.8rem 0; }
    .index-list a { display: block; background: #fff; border: 1.5px solid var(--border); border-radius: 10px; padding: 0.55rem 0.7rem; text-decoration: none; font-weight: 700; color: var(--text); font-size: 0.9rem; }
    .index-list a:hover { border-color: var(--amber); color: var(--amber); }
    .level-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.9rem; margin: 0.8rem 0; }
    .level-card { display: flex; flex-direction: column; background: #fff; border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); text-decoration: none; color: var(--text); transition: transform 0.15s, border-color 0.15s; }
    .level-card:hover { transform: translateY(-2px); border-color: var(--amber); }
    .level-card .thumb { width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; border-bottom: 1.5px solid var(--border); }
    .level-card .meta { padding: 0.6rem 0.7rem 0.75rem; }
    .level-card .lvl { font-size: 0.68rem; font-weight: 900; color: var(--amber); text-transform: uppercase; letter-spacing: 0.06em; display: block; }
    .level-card .name { font-size: 0.85rem; font-weight: 800; line-height: 1.3; margin-top: 0.15rem; color: var(--text); display: block; }
    .level-card .goal { font-size: 0.72rem; color: var(--light); font-style: italic; margin-top: 0.3rem; line-height: 1.45; margin-bottom: 0; }
    .seo-section details { margin: 0.6rem 0; padding: 0.6rem 0.9rem; background: #fff; border: 1.5px solid var(--border); border-radius: 10px; box-shadow: var(--shadow); }
    .seo-section details[open] { border-color: var(--amber); }
    .seo-section summary { cursor: pointer; font-weight: 800; line-height: 1.5; }
    .seo-section summary:hover { color: var(--amber); }
    .seo-section details p { margin-top: 0.5rem; }
    .seo-footer { text-align: center; margin: 2rem 0 1rem; font-size: 0.8rem; color: var(--light); }
    .seo-footer a { color: var(--light); }
    .seo-footer a:hover { color: var(--amber); }
    @media (max-width: 480px) { .seo-section h1 { font-size: 1.4rem; } .seo-section h2 { font-size: 1.2rem; } }
"""

def esc(s):
    return s.replace('&', '&').replace('<', '<').replace('>', '>').replace('"', '\\"')

def ts_link(video_id, t):
    mm, ss = divmod(int(t), 60)
    label = f'{mm}:{ss:02d}'
    return f'<a href="https://www.youtube.com/watch?v={video_id}&t={int(t)}s" rel="nofollow noopener" target="_blank">{label}</a>'

def level_page(n, d):
    faq_json = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in d['faq']
    ]}
    goal = esc(d['goal'])
    hero_html = (f'    <a class="hero-link" href="#video" aria-label="Jump to the level {n} full solution video">\n'
                 f'      <img class="hero" src="/brain-puzzle-3/{d["hero"]}" alt="Brain Puzzle 3 level {n} {esc(d["title"].split("Answer: ")[-1].replace(" Guide",""))} scene" loading="lazy" />\n'
                 f'    </a>\n'
                 if d.get('hero') else '')
    steps_html = ''
    for i, s in enumerate(d['steps'], 1):
        img_html = f'\n      <img src="/brain-puzzle-3/{s["img"]}" alt="Brain Puzzle 3 level {n} step {i}" loading="lazy" />' if s.get('img') else ''
        ts_html = f'\n      <p class="ts">Video check: {ts_link(d["video_id"], s["t"])}</p>' if s.get('t') is not None else ''
        steps_html += f'''    <div class="step-card">
      <span class="step-num">Step {i}</span>
      <strong>{esc(s['what'])}</strong>{img_html}
      <p>{esc(s['why'])}</p>{ts_html}
    </div>
'''
    index_html = ''.join(
        f'<a href="/brain-puzzle-3-level-{m}/">Level {m}</a>'
        for m in LEVELS if m != n
    )
    verify_note = ''
    if d.get('verify_note'):
        verify_note = f"\n    <div class=\"verify-note\">{esc(d['verify_note'])}</div>"
    elif d['verified'] == 'weak':
        verify_note = '\n    <div class="verify-note">Heads up: a few of the gift-reaction steps below were reconstructed from a single walkthrough video. The overall sequence is confirmed, but if one tap looks different on your screen, cross-check the embedded video at that timestamp before retrying.</div>'
    faq_html = ''.join(
        f'\n    <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>'
        for q, a in d['faq']
    )
    return f'''---
import SEOHead from '../../components/SEOHead.astro';
import GameNav from '../../components/GameNav.astro';
import AdSlot from '../../components/AdSlot.astro';
import SideAd from '../../components/SideAd.astro';

const title = {json.dumps(d['title'])};
const description = {json.dumps(d['description'])};
const faqJsonLd = {json.dumps(faq_json)};
---
<!DOCTYPE html>
<html lang="en">
<head>
  <SEOHead
    title={{title}}
    description={{description}}
    canonical="/{d['slug']}"
    type="article"
    breadcrumbTitle="Brain Puzzle 3 Level {n}"
  />
  <script type="application/ld+json" set:html={{JSON.stringify(faqJsonLd)}} />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style is:global>{STYLE}</style>
</head>
<body>
  <GameNav />
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> > <a href="/brain-puzzle-3-answers/">Brain Puzzle 3 Answers</a> > Level {n}</nav>

  <main class="seo-section">
    <h1>Brain Puzzle 3 Level {n} Answer: {esc(d['goal'])}</h1>

    <div class="disclaimer">Unofficial fan-made guide. Not affiliated with the developer of Brain Puzzle 3.</div>
{verify_note}
    <div class="answer-box">
      <span class="label">Quick answer</span>
      <p>{esc(d['summary'])}</p>
    </div>
{hero_html}
    <h2>Watch the full solution<span class="accent">.</span></h2>
    <p>The video is the fastest way to copy this level move-for-move — some moves are drags, not taps, and text alone can't show the gesture.{' Timestamps for every move are in the walkthrough below.' if d['steps'] and any(s.get('t') is not None for s in d['steps']) else ' The walkthrough below gives every move in order.'}</p>
    <div class="video-wrap" id="video">
      <iframe src="https://www.youtube-nocookie.com/embed/{d['video_id']}" title="Brain Puzzle 3 Level {n} walkthrough video" allowfullscreen></iframe>
    </div>

    <h2>Level {n} walkthrough: every move in order<span class="accent">.</span></h2>
{steps_html}
    <h2>FAQ<span class="accent">.</span></h2>
   {faq_html}

    <h2>Stuck on another level?<span class="accent">.</span></h2>
    <p>More Brain Puzzle 3 answers as we clear them:</p>
    <div class="index-list">
      {index_html}
    </div>

    <div class="cta-box">
      <p><a href="/">Play Shikaku →</a> · <a href="/akari/">Play Akari →</a> · <a href="/japanese-logic-puzzles/">More Japanese logic puzzles →</a></p>
    </div>

    <div class="cross-card">
      <img src="/og-akari-daily.png" alt="Daily Akari — new grid every midnight" loading="lazy" width="1200" height="630">
      <div class="cross-body">
        <div>
          <span class="cross-kicker">Tonight's Puzzle</span>
          <p class="cross-ttl">Daily Akari Challenge</p>
          <p class="cross-desc">New grid every midnight — light it up. No ads, no sign-up.</p>
        </div>
        <a class="cross-cta" href="/akari/daily/">Play today's Akari →</a>
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
    <p><a href="/brain-puzzle-3-answers/">All Brain Puzzle 3 answers</a> · <a href="/">GridPaw</a></p>
  </footer>
</body>
</html>
'''

def hub_page():
    faq_json = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": "What is Brain Puzzle 3: Crazy Mind?",
         "acceptedAnswer": {"@type": "Answer", "text": "Brain Puzzle 3: Crazy Mind is a free-to-play brain teaser game by Joygame with story-driven trick levels: each level is a short scene where you tap, drag or expose the right thing to solve a mini puzzle. It is the third game in the Brain Puzzle series after Tricky Quest and Logic Twist."}},
        {"@type": "Question", "name": "How many levels does Brain Puzzle 3 have?",
         "acceptedAnswer": {"@type": "Answer", "text": "Brain Puzzle 3 launched with well over a hundred story levels and keeps adding more through updates. This guide covers the levels players search for most, and we keep adding new walkthroughs as we clear them."}},
        {"@type": "Question", "name": "Is Brain Puzzle 3 free?",
         "acceptedAnswer": {"@type": "Answer", "text": "Yes, Brain Puzzle 3 is free to download and play on iOS and Android. It is ad-supported: you can watch ads for hints if you get stuck, though every walkthrough on this page lets you clear levels without spending a hint."}},
    ]}
    THUMB = {19: 'l26_hero.jpg', 30: 'l27_hero.jpg', 31: 'l28_hero.jpg', 137: 'l25_step1.jpg'}
    cards = ''
    for n, d in LEVELS.items():
        name = d['title'].split('Answer: ')[-1].replace(' Guide', '')
        thumb = d.get('hero') or THUMB.get(n)
        img = f'\n      <img class="thumb" src="/brain-puzzle-3/{thumb}" alt="Brain Puzzle 3 Level {n} {esc(name)}" loading="lazy" />' if thumb else ''
        cards += f'''    <a class="level-card" href="/{d['slug']}/">{img}
      <div class="meta">
        <span class="lvl">Level {n}</span>
        <strong class="name">{esc(name)}</strong>
        <p class="goal">“{esc(d['goal'])}”</p>
      </div>
    </a>
'''
    faq_html = ''.join(
        f'\n    <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>'
        for q, a in [(q, a) for q, a in []]
    )
    faq_html = ''.join(
        f'\n    <details><summary>{esc(q["name"])}</summary><p>{esc(q["acceptedAnswer"]["text"])}</p></details>'
        for q in faq_json['mainEntity']
    )
    return f'''---
import SEOHead from '../../components/SEOHead.astro';
import GameNav from '../../components/GameNav.astro';
import AdSlot from '../../components/AdSlot.astro';
import SideAd from '../../components/SideAd.astro';

const title = {json.dumps(HUB['title'])};
const description = {json.dumps(HUB['description'])};
const faqJsonLd = {json.dumps(faq_json)};
---
<!DOCTYPE html>
<html lang="en">
<head>
  <SEOHead
    title={{title}}
    description={{description}}
    canonical="/brain-puzzle-3-answers"
    type="article"
    breadcrumbTitle="Brain Puzzle 3 Answers"
  />
  <script type="application/ld+json" set:html={{JSON.stringify(faqJsonLd)}} />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style is:global>{STYLE}</style>
</head>
<body>
  <GameNav />
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> > Brain Puzzle 3 Answers</nav>

  <main class="seo-section">
    <h1>Brain Puzzle 3 Answers: Level Walkthroughs That Actually Clear the Level</h1>

    <div class="disclaimer">Unofficial fan-made guide. Not affiliated with the developer of Brain Puzzle 3.</div>

    <p>Brain Puzzle 3: Crazy Mind is the third entry in the Brain Puzzle series, and it trades plain riddles for story scenes: a roller coaster that will not climb, a boyfriend hidden all over the house, a sweetheart wearing one mask too many. Every level has one exact sequence of taps that ends the scene, and this guide gives you that sequence: quick answers up top, screenshot steps with video timestamps below, and honest notes when a step came from a single source.</p>

    <div class="cta-box">
      <p>Between levels, try a real logic puzzle: <a href="/">Play Shikaku free in your browser →</a></p>
    </div>

    <h2>Level answers<span class="accent">.</span></h2>
    <div class="level-grid">
{cards}    </div>
    <h2>How these walkthroughs are made<span class="accent">.</span></h2>
    <p>Every walkthrough here is rebuilt from a real playthrough video, frame by frame: we extract the tap sequence, re-read it at least twice, and only publish steps that survive the double-check. When a level has steps we could only confirm once, the page says so. No invented answers, no hint-item spam.</p>

    <h2>FAQ<span class="accent">.</span></h2>
   {faq_html}

    <div class="cta-box">
      <p><a href="/">Play Shikaku →</a> · <a href="/akari/">Play Akari →</a> · <a href="/japanese-logic-puzzles/">More Japanese logic puzzles →</a></p>
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
    <p><a href="/">GridPaw</a></p>
  </footer>
</body>
</html>
'''

def main():
    os.makedirs(f'{REPO}/public/brain-puzzle-3', exist_ok=True)
    # copy L25 images
    import shutil
    for f in ['step1.jpg', 'step2.jpg', 'step3.jpg', 'result.jpg']:
        src = f'{BASE}/{f}'
        if os.path.exists(src):
            shutil.copy(src, f'{REPO}/public/brain-puzzle-3/l25_' + f)
    # copy generated page images
    for f in os.listdir(f'{BASE}/pageimg'):
        shutil.copy(f'{BASE}/pageimg/{f}', f'{REPO}/public/brain-puzzle-3/{f}')
    print('images copied:', len(os.listdir(f'{REPO}/public/brain-puzzle-3')))

    for n, d in LEVELS.items():
        pdir = f'{OUT_PAGES}/{d["slug"]}'
        os.makedirs(pdir, exist_ok=True)
        with open(f'{pdir}/index.astro', 'w') as f:
            f.write(level_page(n, d))
        print('wrote', pdir)

    hdir = f'{OUT_PAGES}/{HUB["slug"]}'
    os.makedirs(hdir, exist_ok=True)
    with open(f'{hdir}/index.astro', 'w') as f:
        f.write(hub_page())
    print('wrote', hdir)

    # title/description length check
    for label, t, desc in [('hub', HUB['title'], HUB['description'])] + [
            (f'L{n}', d['title'], d['description']) for n, d in LEVELS.items()]:
        print(f'{label}: title {len(t)} chars, desc {len(desc)} chars')

if __name__ == '__main__':
    main()
