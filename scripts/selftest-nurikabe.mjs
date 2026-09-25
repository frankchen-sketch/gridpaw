#!/usr/bin/env node
/**
 * Nurikabe engine self-test.
 *
 * Verifies:
 *  1. Propagation soundness — feeding a complete valid solution into
 *     propagateNurikabe never fails (no unsound deductions).
 *  2. Tutorials — all 4 seeded tutorial levels generate and are unique.
 *  3. Generation — all three difficulty tiers produce unique, structurally
 *     valid puzzles that pass the win check.
 *  4. Determinism — same seed ⇒ same puzzle (daily mode requirement).
 *  5. Diversity — different seeds ⇒ different solutions.
 */
import { readFileSync } from 'fs';

const code = readFileSync('./public/nurikabe-engine.js', 'utf-8');
const E = new Function(
  code +
    '\nreturn { solveNurikabe, generateNurikabePuzzle, generateNurikabeTutorial, NURIKABE_TUTORIALS, NURIKABE_DIFFICULTIES, checkNurikabeWin, cluesMatchSolution, propagateNurikabe, CELL_SEA, CELL_ISLAND };'
)();

let failures = 0;
const ok = (cond, label) => {
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + label);
  if (!cond) failures++;
};

// ── 1. propagation soundness on complete solutions ──────────────────────────
{
  const d = E.NURIKABE_DIFFICULTIES.hard;
  let sound = true;
  for (let n = 0; n < 5; n++) {
    const p = E.generateNurikabePuzzle({ rows: d.rows, cols: d.cols, seed: 9000 + n, timeBudgetMs: 30000 });
    if (!p) continue;
    const st = p.solution.map((v) => (v === E.CELL_ISLAND ? E.CELL_ISLAND : E.CELL_SEA));
    const pr = E.propagateNurikabe({ rows: p.rows, cols: p.cols, clues: p.clues }, st);
    if (pr.failed) sound = false;
  }
  ok(sound, 'propagation accepts complete valid solutions (soundness)');
}

// ── 2. tutorials ─────────────────────────────────────────────────────────────
for (const t of E.NURIKABE_TUTORIALS) {
  const t0 = Date.now();
  const p = E.generateNurikabeTutorial(t);
  if (!p) { ok(false, `tutorial "${t.title}" generates`); continue; }
  const r = E.solveNurikabe(p, 2);
  const fast = Date.now() - t0 < 15000;
  ok(r.count === 1 && fast, `tutorial "${t.title}" unique (${p.rows}x${p.cols}, ${Date.now() - t0}ms)`);
}

// ── 3. generation per tier ───────────────────────────────────────────────────
for (const key of ['easy', 'medium', 'hard']) {
  const d = E.NURIKABE_DIFFICULTIES[key];
  for (let n = 0; n < 3; n++) {
    const t0 = Date.now();
    const p = E.generateNurikabePuzzle({ rows: d.rows, cols: d.cols, seed: 500 + n * 131, timeBudgetMs: 60000 });
    if (!p) { ok(false, `${key} ${d.rows}x${d.cols} #${n} generates`); continue; }
    const r = E.solveNurikabe(p, 2);
    const valid = E.cluesMatchSolution({ rows: p.rows, cols: p.cols, clues: p.clues, solution: p.solution, name: 'x' });
    const win = E.checkNurikabeWin(p, p.solution.map((v) => (v === E.CELL_ISLAND ? E.CELL_ISLAND : E.CELL_SEA)));
    ok(r.count === 1 && valid && win, `${key} ${d.rows}x${d.cols} #${n} unique+valid+win (${Date.now() - t0}ms, ${p.clues.length} clues)`);
  }
}

// ── 4. seed determinism (daily mode) ────────────────────────────────────────
{
  let same = true;
  for (let n = 0; n < 8; n++) {
    const seed = 777000 + n * 17;
    const a = E.generateNurikabePuzzle({ rows: 6, cols: 6, seed, timeBudgetMs: 30000 });
    const b = E.generateNurikabePuzzle({ rows: 6, cols: 6, seed, timeBudgetMs: 30000 });
    if (!a || !b) { same = false; break; }
    const sa = a.solution.join(','), sb = b.solution.join(',');
    if (sa !== sb || JSON.stringify(a.clues) !== JSON.stringify(b.clues)) same = false;
  }
  ok(same, 'same seed ⇒ identical puzzle (daily determinism)');
}

// ── 5. seed diversity ────────────────────────────────────────────────────────
{
  const sols = new Set();
  for (let n = 0; n < 10; n++) {
    const p = E.generateNurikabePuzzle({ rows: 6, cols: 6, seed: 31337 + n * 7, timeBudgetMs: 30000 });
    if (p) sols.add(p.solution.join(','));
  }
  ok(sols.size >= 9, 'different seeds ⇒ different solutions (' + sols.size + '/10 distinct)');
}

console.log(failures === 0 ? '\nALL PASS ✅' : `\n${failures} FAILURE(S) ❌`);
process.exit(failures === 0 ? 0 : 1);
