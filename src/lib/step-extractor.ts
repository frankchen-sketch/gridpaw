/**
 * MeowTrail — Step Extractor
 *
 * From an empty board, applies human-readable推理 steps to reach the unique solution.
 * Each step records WHY the move was made (not backtracking, just logical deduction).
 *
 * Rules:
 * 1. number_full:   Number cell has N cats around → mark remaining neighbors X
 * 2. need_equals_space: Number cell needs N more cats, only N empty neighbors → place cats
 * 3. only_lit:      Unlit white cell can only be lit from one position → place cat there
 * 4. elimination:   Assume placement → contradiction → must do the opposite (advanced)
 */

import { illuminate, countCatsAround } from './akari-engine';
import type { Grid, Solution } from './akari-engine';

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export interface Step {
  no: number;
  type: 'place' | 'markX';
  cell: [number, number];
  reason: 'number_full' | 'need_equals_space' | 'only_lit' | 'elimination';
  text: string;
  skill: 'basic' | 'advanced';
}

export interface StepResult {
  steps: Step[];
  eliminationCount: number;
}

// =============================================================================
// Helpers
// =============================================================================

function isWhite(grid: Grid, r: number, c: number): boolean {
  const size = grid.length;
  if (r < 0 || r >= size || c < 0 || c >= size) return false;
  return grid[r][c] === 9;
}

function cloneBool(a: boolean[][]): boolean[][] {
  return a.map(r => [...r]);
}

function isComplete(cur: Solution, solution: Solution, size: number): boolean {
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (cur[r][c] !== solution[r][c]) return false;
  return true;
}

function countEmptyNeighbors(grid: Grid, cur: Solution, marked: boolean[][], r: number, c: number): number {
  const size = grid.length;
  let count = 0;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9 && !cur[nr][nc] && !marked[nr][nc]) {
      count++;
    }
  }
  return count;
}

function hasCatConflict(cur: Solution, grid: Grid, size: number, r: number, c: number): boolean {
  for (const [dr, dc] of DIRS) {
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
      if (cur[nr][nc]) return true;
      nr += dr; nc += dc;
    }
  }
  return false;
}

// =============================================================================
// Contradiction detection (silent propagation — no step recording)
// =============================================================================

function propagateSilent(grid: Grid, cur: Solution, marked: boolean[][], size: number): 'ok' | 'contradiction' {
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 200) {
    changed = false;
    iterations++;

    // Check for contradictions
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] < 0 || grid[r][c] > 4) continue;
        const n = grid[r][c];
        const cnt = countCatsAround(grid, cur, r, c);
        if (cnt > n) return 'contradiction';
        const empties = countEmptyNeighbors(grid, cur, marked, r, c);
        const need = n - cnt;
        if (need > 0 && empties < need) return 'contradiction';
      }
    }

    // Check cat conflicts
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (cur[r][c] && hasCatConflict(cur, grid, size, r, c)) return 'contradiction';
      }
    }

    // Check unlit cells with no possible lighter
    const lit = illuminate(grid, cur, size);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== 9 || cur[r][c] || marked[r][c] || lit[r][c]) continue;
        let canLight = false;
        for (const [dr, dc] of DIRS) {
          let nr = r + dr, nc = c + dc;
          while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
            if (!cur[nr][nc] && !marked[nr][nc]) { canLight = true; break; }
            nr += dr; nc += dc;
          }
          if (canLight) break;
        }
        if (!canLight) return 'contradiction';
      }
    }

    // Silent propagation rules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] < 0 || grid[r][c] > 4) continue;
        const n = grid[r][c];
        const cnt = countCatsAround(grid, cur, r, c);
        const empties: [number, number][] = [];
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9 && !cur[nr][nc] && !marked[nr][nc]) {
            empties.push([nr, nc]);
          }
        }
        const need = n - cnt;
        if (need === 0 && empties.length > 0) {
          for (const [nr, nc] of empties) { marked[nr][nc] = true; changed = true; }
        } else if (need > 0 && empties.length === need) {
          for (const [nr, nc] of empties) { cur[nr][nc] = true; changed = true; }
        }
      }
    }
  }
  return 'ok';
}

// =============================================================================
// Main extraction
// =============================================================================

export function extractSteps(grid: Grid, solution: Solution, size: number): StepResult {
  const cur: Solution = Array.from({ length: size }, () => Array(size).fill(false));
  const marked: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const steps: Step[] = [];
  let stepNo = 0;
  let eliminationCount = 0;

  function addStep(type: Step['type'], cell: [number, number], reason: Step['reason'], text: string, skill: Step['skill']) {
    stepNo++;
    steps.push({ no: stepNo, type, cell, reason, text, skill });
  }

  while (!isComplete(cur, solution, size) && steps.length < size * size * 2) {
    let changed = true;

    // === Phase 1: Constraint propagation ===
    while (changed) {
      changed = false;

      // Rule 1: number_full → mark X
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] < 0 || grid[r][c] > 4) continue;
          const n = grid[r][c];
          const cnt = countCatsAround(grid, cur, r, c);
          if (cnt === n) {
            for (const [dr, dc] of DIRS) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9 && !cur[nr][nc] && !marked[nr][nc]) {
                marked[nr][nc] = true;
                addStep('markX', [nr, nc], 'number_full',
                  `The number ${n} at row ${r + 1}, col ${c + 1} already has ${n} cat(s) around it — mark (${nr + 1},${nc + 1}) as X.`,
                  'basic');
                changed = true;
              }
            }
          }
        }
      }

      // Rule 2: need_equals_space → place cats
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] < 0 || grid[r][c] > 4) continue;
          const n = grid[r][c];
          const cnt = countCatsAround(grid, cur, r, c);
          const empties: [number, number][] = [];
          for (const [dr, dc] of DIRS) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9 && !cur[nr][nc] && !marked[nr][nc]) {
              empties.push([nr, nc]);
            }
          }
          const need = n - cnt;
          if (need > 0 && empties.length === need) {
            for (const [nr, nc] of empties) {
              cur[nr][nc] = true;
              addStep('place', [nr, nc], 'need_equals_space',
                `The number ${n} at row ${r + 1}, col ${c + 1} needs ${need} more cat(s) and only ${need} empty neighbor(s) remain — place a cat at (${nr + 1},${nc + 1}).`,
                'basic');
              changed = true;
            }
          }
        }
      }

      // Rule 3: only_lit → place cat
      const lit = illuminate(grid, cur, size);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] !== 9 || cur[r][c] || marked[r][c] || lit[r][c]) continue;
          // Find positions that can light this cell
          const candidates: [number, number][] = [];
          for (const [dr, dc] of DIRS) {
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
              if (!cur[nr][nc] && !marked[nr][nc] && !hasCatConflict(cur, grid, size, nr, nc)) {
                candidates.push([nr, nc]);
              }
              nr += dr; nc += dc;
            }
          }
          // Self is also a candidate
          if (!hasCatConflict(cur, grid, size, r, c)) {
            candidates.push([r, c]);
          }
          // Deduplicate
          const unique = [...new Set(candidates.map(([a, b]) => `${a},${b}`))].map(s => s.split(',').map(Number) as [number, number]);

          if (unique.length === 1) {
            const [nr, nc] = unique[0];
            cur[nr][nc] = true;
            addStep('place', [nr, nc], 'only_lit',
              `The cell at row ${r + 1}, col ${c + 1} can only be lit from one position — place a cat at (${nr + 1},${nc + 1}).`,
              'basic');
            changed = true;
          }
        }
      }
    }

    if (isComplete(cur, solution, size)) break;

    // === Phase 2: Elimination (advanced) ===
    const found = tryElimination(grid, solution, cur, marked, size, steps, stepNo, addStep);
    if (found) {
      eliminationCount++;
      continue;
    }

    // === Phase 3: Fallback — shouldn't happen with unique-solution puzzles ===
    // Find the first cell that differs from solution and fill it
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== 9) continue;
        if (cur[r][c] !== solution[r][c] && !marked[r][c]) {
          if (solution[r][c]) {
            cur[r][c] = true;
            addStep('place', [r, c], 'elimination',
              `By elimination, a cat must go at (${r + 1},${c + 1}) — this is the only placement consistent with all constraints.`,
              'advanced');
          } else {
            marked[r][c] = true;
            addStep('markX', [r, c], 'elimination',
              `By elimination, (${r + 1},${c + 1}) cannot hold a cat — marking it X.`,
              'advanced');
          }
          break;
        }
      }
      if (steps.length > stepNo) break;
    }
  }

  return { steps, eliminationCount };
}

// =============================================================================
// Elimination: assume + contradiction
// =============================================================================

function tryElimination(
  grid: Grid, solution: Solution, cur: Solution, marked: boolean[][], size: number,
  steps: Step[], _stepNo: number,
  addStep: (type: Step['type'], cell: [number, number], reason: Step['reason'], text: string, skill: Step['skill']) => void
): boolean {
  // Collect candidate cells (unresolved white cells)
  const candidates: [number, number][] = [];
  const lit = illuminate(grid, cur, size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 9 && !cur[r][c] && !marked[r][c]) {
        candidates.push([r, c]);
      }
    }
  }

  // Sort by constraint tightness (more adjacent numbered cells = higher priority)
  candidates.sort((a, b) => {
    const scoreA = DIRS.filter(([dr, dc]) => {
      const nr = a[0] + dr, nc = a[1] + dc;
      return nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] >= 0;
    }).length;
    const scoreB = DIRS.filter(([dr, dc]) => {
      const nr = b[0] + dr, nc = b[1] + dc;
      return nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] >= 0;
    }).length;
    return scoreB - scoreA;
  });

  for (const [r, c] of candidates) {
    // Test A: place cat at (r,c) → contradiction? → must be X
    if (!hasCatConflict(cur, grid, size, r, c)) {
      const curA = cloneBool(cur);
      const markedA = cloneBool(marked);
      curA[r][c] = true;
      if (propagateSilent(grid, curA, markedA, size) === 'contradiction') {
        marked[r][c] = true;
        addStep('markX', [r, c], 'elimination',
          `If we place a cat at (${r + 1},${c + 1}), it leads to a contradiction — so (${r + 1},${c + 1}) must be marked X.`,
          'advanced');
        return true;
      }
    }

    // Test B: mark X at (r,c) → contradiction? → must place cat
    const curB = cloneBool(cur);
    const markedB = cloneBool(marked);
    markedB[r][c] = true;
    if (propagateSilent(grid, curB, markedB, size) === 'contradiction') {
      cur[r][c] = true;
      addStep('place', [r, c], 'elimination',
        `If we leave (${r + 1},${c + 1}) empty, it leads to a contradiction — so (${r + 1},${c + 1}) must contain a cat.`,
        'advanced');
      return true;
    }
  }

  return false;
}
