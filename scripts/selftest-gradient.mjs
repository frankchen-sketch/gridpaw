#!/usr/bin/env node
/**
 * Gradient (Huepaw) engine self-test.
 *
 * Guards the three promises the /huepaw/ page makes to the player:
 *   1. a generated board is never already solved;
 *   2. the daily board id/size follow the local-midnight rule and the
 *      [3,5,4,5,4,5,4] weekday map quoted in the FAQ;
 *   3. a hint always advances the board by at least one locked tile.
 *
 * Point 3 is the regression that motivated the rewrite: the first version
 * returned "the first cell whose colour lives elsewhere", which on 3 of 6,000
 * generated boards (and on the constructed board [3,2,1,0]) was a no-op.
 *
 * Reads the published bundle in public/gradient-engine.js, so it must run
 * after `node scripts/bundle-engine.mjs` — same contract as the other
 * public-reading suites in scripts/.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bundle = readFileSync(join(root, 'public/gradient-engine.js'), 'utf8');

const sandbox = {};
const fn = new Function(`${bundle}\nreturn GradientEngine;`);
const E = fn.call(sandbox);
if (!E || typeof E.generate !== 'function') {
  console.error('✗ gradient: bundle did not expose GradientEngine (rebuild with scripts/bundle-engine.mjs)');
  process.exit(1);
}

let failures = 0;
function check(name, cond, detail) {
  if (cond) return;
  failures++;
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

/* 1. determinism ---------------------------------------------------------- */
const a = JSON.stringify(E.generate(5, '2026-11-23'));
const b = JSON.stringify(E.generate(5, '2026-11-23'));
check('determinism', a === b, 'same id must produce the same board');
const gA = E.generate(5, '2026-11-23');
const gB = E.generate(5, '2026-11-24');
check('different ids differ',
  JSON.stringify(gA.board) !== JSON.stringify(gB.board) || JSON.stringify(gA.target) !== JSON.stringify(gB.target),
  'two different date ids produced an identical board and palette');

/* 2. never solved on generate -------------------------------------------- */
let solvedOnLoad = 0;
for (let i = 0; i < 6000; i++) {
  const p = E.generate(3 + (i % 3), `board-${i}`);
  if (E.isSolved(p)) solvedOnLoad++;
}
check('not solved on load', solvedOnLoad === 0, `${solvedOnLoad}/6000 boards were already solved`);

/* 3. hint strictly advances (the 6,000-board regression) ------------------ */
let noopHints = 0;
let nullHints = 0;
for (let i = 0; i < 6000; i++) {
  const p = E.generate(3 + (i % 3), `hint-${i}`);
  const before = E.misplacedCount(p);
  const h = E.hint(p, p.board);
  if (!h) {
    nullHints++;
    continue;
  }
  const after = E.misplacedCount(p, E.swap(p.board, h.from, h.to));
  if (!(after < before)) noopHints++;
}
check('hint advances board', noopHints === 0, `${noopHints}/6000 hints did not reduce the misplaced count`);
check('hint never null on a live board', nullHints === 0, `${nullHints}/6000 hints returned null`);

/* 4. the constructed board that used to fail: [3,2,1,0] ------------------- */
const constructed = {
  id: 'constructed',
  size: 2,
  target: ['c0', 'c1', 'c2', 'c3'],
  board: [3, 2, 1, 0],
};
const ch = E.hint(constructed, constructed.board);
check('constructed [3,2,1,0] hint exists', !!ch, 'expected a swappable pair');
if (ch) {
  const after = E.misplacedCount(constructed, E.swap(constructed.board, ch.from, ch.to));
  check(
    'constructed [3,2,1,0] hint advances',
    after < E.misplacedCount(constructed, constructed.board),
    `swap ${ch.from}<->${ch.to} left ${after} misplaced`
  );
}

/* 5. locked tiles are never proposed, and cannot be swapped --------------- */
const lockedP = { id: 'locked', size: 3, target: ['a', 'b', 'c', 'd'], board: [0, 2, 1, 3] };
const lh = E.hint(lockedP, lockedP.board);
check('hint skips locked cells', !!lh && lh.from !== 0 && lh.to !== 0 && lh.from !== 3 && lh.to !== 3, lh ? `got ${lh.from}<->${lh.to}` : 'null');
const blocked = E.swap(lockedP.board, 0, 1);
check('swap rejects locked cell', blocked.join(',') === '0,2,1,3', `board became ${blocked.join(',')}`);
check('isLocked reads home cells', E.isLocked(lockedP.board, 0) === true && E.isLocked(lockedP.board, 1) === false);

/* 6. daily size map: Sun..Sat = [3,5,4,5,4,5,4] --------------------------- */
const week = [];
for (let d = 22; d <= 28; d++) week.push(E.dailySize(new Date(2026, 10, d, 12, 0)));
check('daily size map', week.join(',') === '3,5,4,5,4,5,4', `got ${week.join(',')}`);

/* 7. daily id rolls over at LOCAL midnight ------------------------------- */
const lateNight = E.dailyId(new Date(2026, 10, 23, 23, 30));
const afterMidnight = E.dailyId(new Date(2026, 10, 24, 0, 30));
check('dailyId local date', lateNight === '2026-11-23' && afterMidnight === '2026-11-24', `got ${lateNight} / ${afterMidnight}`);

/* 8. isSolved 必须拒收截短/空棋板 --------------------------------------- */
const p3 = E.generate(3, 'trunc-check');
check('isSolved rejects short boards',
  E.isSolved(p3, [0, 1]) === false && E.isSolved(p3, []) === false &&
  E.isSolved(p3, p3.board) === false && E.isSolved(p3, p3.target.map((_, i) => i)) === true,
  'truncated or empty board was reported as solved');

if (failures) {
  console.error(`✗ gradient: ${failures} failure(s)`);
  process.exit(1);
}
console.log('✓ gradient: 6,000 boards — no pre-solved board, every hint strictly advances, locks respected, size map + local rollover correct');
