// Precompute meowdoku level data: deterministic seeds → verified unique solutions.
// Engine is the compiled star-battle engine (same one the pages load).
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, '../public/star-battle-engine.js'), 'utf8');
const SB = (new Function(code + '\nreturn StarBattleEngine;'))();

const N = 6, K = 1;
const levels = [];
for (let n = 1; n <= 10; n++) {
  const seed = n; // candidate seeds: level number itself
  let p = null;
  try { p = SB.generate(N, K, 'easy', seed); } catch (e) { p = null; }
  if (!p) { // fallback ladder if a seed ever fails
    for (const s of [1000 + n, 7000 + n * 13, 42000 + n * 101]) {
      try { p = SB.generate(N, K, 'easy', s); if (p) { seedUsed = s; break; } } catch (e) {}
    }
  }
  const cells = [];
  for (let i = 0; i < N * N; i++) if (p.solution[i] === 1) cells.push(`R${((i / N) | 0) + 1}C${(i % N) + 1}`);
  // sanity: uniqueness was proven inside generate (countSolutions===1 before return)
  levels.push({ level: n, seed: p.id.includes(`-${seed}-`) ? seed : null, id: p.id, answer: cells.join(' · '), regions: [...new Set(p.regionOf)].length });
  console.log(`L${n}: seed=${p.id.includes(`-${seed}-`) ? seed : 'FALLBACK:' + p.id} answer=${cells.join(' ')}`);
}
fs.writeFileSync(path.join(__dirname, '../src/data/meowdoku-levels.json'), JSON.stringify(levels, null, 2));console.log('written', levels.length, 'levels');
