/**
 * Generate new puzzles and append to puzzles.json — saves incrementally.
 * Usage: node scripts/generate-puzzles.mjs
 * 
 * Generates 40 new puzzles:
 * - 10 easy (7×7)
 * - 15 medium (10×10)
 * - 15 hard (12×12)
 * (14×14 skipped — engine too slow for large grids, daily handles it at runtime)
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import vm from 'vm';

const engineCode = readFileSync(resolve('./public/akari-engine.js'), 'utf-8');
const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(engineCode, sandbox);

const { generatePuzzle } = sandbox;

const puzzlesPath = resolve('./src/data/puzzles.json');
const existing = JSON.parse(readFileSync(puzzlesPath, 'utf-8'));
const lastNum = Math.max(...existing.map(p => parseInt(p.id.split('-')[1])));

console.log(`Existing puzzles: ${existing.length}, last ID: puzzle-${String(lastNum).padStart(3, '0')}`);

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function extractSteps(grid, solution, size) {
  const steps = [];
  const playerGrid = Array.from({ length: size }, () => Array(size).fill(false));
  const marked = Array.from({ length: size }, () => Array(size).fill(false));
  let stepNo = 0;

  for (let iter = 0; iter < 100; iter++) {
    let found = false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] < 0) continue;
        if (grid[r][c] === 9) continue;
        const num = grid[r][c];
        let catCount = 0;
        let emptyNeighbors = [];
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (playerGrid[nr][nc]) catCount++;
            else if (grid[nr][nc] === 9 && !marked[nr][nc]) emptyNeighbors.push([nr, nc]);
          }
        }
        if (catCount === num && emptyNeighbors.length > 0) {
          for (const [nr, nc] of emptyNeighbors) {
            marked[nr][nc] = true;
            stepNo++;
            steps.push({ no: stepNo, type: 'markX', cell: [nr, nc], reason: 'number_full', text: `Number ${num} at (${r+1},${c+1}) is full — mark (${nr+1},${nc+1}) as X.`, skill: 'basic' });
          }
          found = true;
        }
        if (catCount < num && emptyNeighbors.length === num - catCount) {
          for (const [nr, nc] of emptyNeighbors) {
            if (!playerGrid[nr][nc]) {
              playerGrid[nr][nc] = true;
              stepNo++;
              steps.push({ no: stepNo, type: 'place', cell: [nr, nc], reason: 'need_equals_space', text: `Number ${num} at (${r+1},${c+1}) needs ${num - catCount} more — place cat at (${nr+1},${nc+1}).`, skill: 'basic' });
            }
          }
          found = true;
        }
      }
    }
    if (!found) break;
  }
  return { steps, eliminationCount: 0 };
}

const newPuzzles = [];
const maxAttempts = 5;

const config = [
  // 10 easy (7×7)
  ...Array(10).fill({ size: 7, difficulty: 'easy' }),
  // 15 medium (10×10)
  ...Array(15).fill({ size: 10, difficulty: 'medium' }),
  // 15 hard (12×12)
  ...Array(15).fill({ size: 12, difficulty: 'hard' }),
];

let totalAdded = 0;
for (let i = 0; i < config.length; i++) {
  const { size, difficulty } = config[i];
  const num = lastNum + totalAdded + 1;
  const id = `puzzle-${String(num).padStart(3, '0')}`;
  
  let success = false;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    process.stdout.write(`Generating ${id} (${size}×${size}, ${difficulty}) attempt ${attempt + 1}... `);
    const puzzle = generatePuzzle(size);
    
    if (difficulty === 'hard' && puzzle.difficulty === 'easy') {
      console.log(`❌ engine returned ${puzzle.difficulty}, retrying`);
      continue;
    }
    
    let cats = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (puzzle.solution[r][c]) cats++;
      }
    }
    
    const { steps, eliminationCount } = extractSteps(puzzle.grid, puzzle.solution, size);
    
    newPuzzles.push({
      id, size, difficulty,
      grid: puzzle.grid, solution: puzzle.solution,
      cats, steps, eliminationCount
    });
    
    console.log(`✅ ${id}: ${cats} cats, ${steps.length} steps (engine: ${puzzle.difficulty})`);
    totalAdded++;
    success = true;
    break;
  }
  
  if (!success) {
    console.log(`❌ ${id}: failed after ${maxAttempts} attempts`);
  }
  
  // Save every 10 puzzles to avoid total loss on timeout
  if (totalAdded % 10 === 0 && totalAdded > 0) {
    const partial = [...existing, ...newPuzzles];
    writeFileSync(puzzlesPath, JSON.stringify(partial, null, 2));
    console.log(`  [checkpoint saved: ${partial.length} total]`);
  }
}

const allPuzzles = [...existing, ...newPuzzles];
writeFileSync(puzzlesPath, JSON.stringify(allPuzzles, null, 2));
console.log(`\n✅ Total puzzles: ${allPuzzles.length} (added ${newPuzzles.length})`);