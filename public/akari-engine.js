const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(9));
}
function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}
function cloneSolution(sol) {
  return sol.map((row) => [...row]);
}
function countCatsAround(grid, solution, r, c) {
  const size = grid.length;
  let count = 0;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && solution[nr][nc]) count++;
  }
  return count;
}
function illuminate(grid, solution, size) {
  const lit = Array.from({ length: size }, () => Array(size).fill(false));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!solution[r][c]) continue;
      lit[r][c] = true;
      for (const [dr, dc] of DIRS) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
          lit[nr][nc] = true;
          nr += dr;
          nc += dc;
        }
      }
    }
  }
  return lit;
}
function checkViolations(grid, solution, size) {
  const violations = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] >= 0) {
        const count = countCatsAround(grid, solution, r, c);
        if (count > grid[r][c]) {
          violations.push({ type: "number_excess", row: r, col: c, number: grid[r][c] });
        }
      }
    }
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!solution[r][c]) continue;
      for (const [dr, dc] of DIRS) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
          if (solution[nr][nc]) {
            violations.push({ type: "cat_conflict", row: r, col: c, row2: nr, col2: nc });
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
    }
  }
  return violations;
}
function countLit(grid, solution, size) {
  const litGrid = illuminate(grid, solution, size);
  let litCount = 0, total = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 9) {
        total++;
        if (litGrid[r][c]) litCount++;
      }
    }
  }
  return { lit: litCount, total };
}
function checkWin(grid, solution, size) {
  const { lit, total } = countLit(grid, solution, size);
  if (lit !== total) return false;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] >= 0 && grid[r][c] <= 4 && countCatsAround(grid, solution, r, c) !== grid[r][c]) return false;
    }
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!solution[r][c]) continue;
      for (const [dr, dc] of DIRS) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
          if (solution[nr][nc]) return false;
          nr += dr;
          nc += dc;
        }
      }
    }
  }
  return true;
}
function solve(grid, size, maxCount = 2) {
  let found = 0;
  let bestSolution = null;
  let maxDepth = 0;
  const sol = new Array(size * size).fill(false);
  const blk = new Array(size * size).fill(false);
  const idx = (r, c) => r * size + c;
  const stack = [];
  function save() {
    stack.push({ s: [...sol], b: [...blk] });
  }
  function restore() {
    const snap = stack.pop();
    for (let i = 0; i < size * size; i++) {
      sol[i] = snap.s[i];
      blk[i] = snap.b[i];
    }
  }
  function countCats(r, c) {
    let n = 0;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && sol[idx(nr, nc)]) n++;
    }
    return n;
  }
  function computeLit() {
    const lit = new Array(size * size).fill(false);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const i = idx(r, c);
        if (!sol[i]) continue;
        lit[i] = true;
        for (const [dr, dc] of DIRS) {
          let nr = r + dr, nc = c + dc;
          while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
            lit[idx(nr, nc)] = true;
            nr += dr;
            nc += dc;
          }
        }
      }
    }
    return lit;
  }
  function propagate() {
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] < 0 || grid[r][c] > 4) continue;
          const needed = grid[r][c] - countCats(r, c);
          if (needed < 0) return false;
          const avail = [];
          for (const [dr, dc] of DIRS) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
              const ni = idx(nr, nc);
              if (!sol[ni] && !blk[ni]) avail.push(ni);
            }
          }
          if (needed === 0 && avail.length > 0) {
            for (const i of avail) {
              blk[i] = true;
              changed = true;
            }
          } else if (avail.length < needed) {
            return false;
          } else if (needed > 0 && avail.length === needed) {
            for (const i of avail) {
              sol[i] = true;
              changed = true;
            }
          }
        }
      }
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!sol[idx(r, c)]) continue;
          for (const [dr, dc] of DIRS) {
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 9) {
              const ni = idx(nr, nc);
              if (sol[ni]) return false;
              if (!blk[ni]) {
                blk[ni] = true;
                changed = true;
              }
              nr += dr;
              nc += dc;
            }
          }
        }
      }
    }
    return true;
  }
  function backtrack(depth) {
    if (found >= maxCount) return;
    if (depth > maxDepth) maxDepth = depth;
    save();
    if (!propagate()) {
      restore();
      return;
    }
    const lit = computeLit();
    let allLit = true;
    for (let i = 0; i < size * size; i++) {
      if (grid[Math.floor(i / size)][i % size] === 9 && !lit[i]) {
        allLit = false;
        break;
      }
    }
    if (allLit) {
      let ok = true;
      for (let r = 0; r < size && ok; r++) {
        for (let c = 0; c < size && ok; c++) {
          if (grid[r][c] >= 0 && grid[r][c] <= 4 && countCats(r, c) !== grid[r][c]) ok = false;
        }
      }
      if (ok) {
        found++;
        if (!bestSolution) {
          bestSolution = Array.from(
            { length: size },
            (_, r) => Array.from({ length: size }, (_2, c) => sol[idx(r, c)])
          );
        }
      }
      restore();
      return;
    }
    let bestI = -1, bestScore = Infinity;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const i = idx(r, c);
        if (grid[r][c] !== 9 || sol[i] || blk[i]) continue;
        const isLit = lit[i];
        let adjNums = 0;
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] >= 0) adjNums++;
        }
        const score = (isLit ? 1e3 : 0) + adjNums;
        if (score < bestScore) {
          bestScore = score;
          bestI = i;
        }
      }
    }
    if (bestI === -1) {
      restore();
      return;
    }
    const savedState = { sol: [...sol], blk: [...blk] };
    sol[bestI] = true;
    backtrack(depth + 1);
    for (let i = 0; i < size * size; i++) {
      sol[i] = savedState.sol[i];
      blk[i] = savedState.blk[i];
    }
    if (found >= maxCount) {
      restore();
      return;
    }
    blk[bestI] = true;
    backtrack(depth + 1);
    restore();
  }
  sol.fill(false);
  blk.fill(false);
  stack.length = 0;
  backtrack(0);
  return { count: found, solution: bestSolution, backtrackDepth: maxDepth };
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function generatePuzzle(size) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const result = _tryGenerate(size);
    if (result) return result;
  }
  return _makeSimplePuzzle(size);
}
function _tryGenerate(size) {
  const grid = createEmptyGrid(size);
  const blackPct = size <= 7 ? 0.22 : size <= 10 ? 0.28 : 0.34;
  const targetBlack = Math.floor(size * size * blackPct);
  const allCells = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) allCells.push([r, c]);
  shuffle(allCells);
  let blackPlaced = 0;
  for (const [r, c] of allCells) {
    if (blackPlaced >= targetBlack) break;
    let adjBlack = 0;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] !== 9) adjBlack++;
    }
    if (adjBlack <= 2 || Math.random() < 0.3) {
      grid[r][c] = -1;
      blackPlaced++;
    }
  }
  let result = solve(grid, size, 2);
  if (result.count === 0 || !result.solution) return null;
  let solution = result.solution;
  if (result.count > 1) {
    const blackCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === -1) blackCells.push([r, c]);
      }
    }
    shuffle(blackCells);
    for (const [r, c] of blackCells) {
      grid[r][c] = countCatsAround(grid, solution, r, c);
      const check = solve(grid, size, 2);
      if (check.count === 0) {
        grid[r][c] = -1;
      } else {
        if (check.solution) solution = check.solution;
        if (check.count === 1) break;
      }
    }
    result = solve(grid, size, 2);
    if (result.count !== 1 || !result.solution) return null;
    solution = result.solution;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === -1 && Math.random() < 0.8) {
        grid[r][c] = countCatsAround(grid, solution, r, c);
      }
    }
  }
  result = solve(grid, size, 2);
  if (result.count !== 1 || !result.solution) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] >= 0 && grid[r][c] <= 4) {
          const saved = grid[r][c];
          grid[r][c] = -1;
          const check = solve(grid, size, 2);
          if (check.count !== 1) grid[r][c] = saved;
        }
      }
    }
    result = solve(grid, size, 2);
    if (result.count !== 1 || !result.solution) return null;
    solution = result.solution;
  }
  const numbered = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] >= 0 && grid[r][c] <= 4) numbered.push([r, c]);
    }
  }
  shuffle(numbered);
  for (const [r, c] of numbered) {
    const saved = grid[r][c];
    grid[r][c] = -1;
    const check = solve(grid, size, 2);
    if (check.count !== 1) grid[r][c] = saved;
  }
  const final = solve(grid, size, 2);
  if (final.count !== 1 || !final.solution) return null;
  const depth = final.backtrackDepth;
  let difficulty;
  if (depth <= size) difficulty = "easy";
  else if (depth <= size * 3) difficulty = "medium";
  else difficulty = "hard";
  if (depth > size * 10) return null;
  return {
    id: `cat-puzzle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    size,
    grid,
    solution: final.solution,
    difficulty,
    backtrackDepth: depth
  };
}
function _makeSimplePuzzle(size) {
  const grid = createEmptyGrid(size);
  const solution = Array.from({ length: size }, () => Array(size).fill(false));
  for (let r = 0; r < size; r += 2) {
    for (let c = r % 4 === 0 ? 0 : 2; c < size; c += 4) {
      solution[r][c] = true;
    }
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!solution[r][c]) continue;
      for (const [dr, dc] of DIRS) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (solution[nr][nc]) solution[nr][nc] = false;
          nr += dr;
          nc += dc;
        }
      }
    }
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!solution[r][c] && Math.random() < 0.2) {
        grid[r][c] = countCatsAround(grid, solution, r, c);
      }
    }
  }
  const result = solve(grid, size, 2);
  if (result.count >= 1 && result.solution) {
    return {
      id: `cat-puzzle-simple-${Date.now()}`,
      size,
      grid,
      solution: result.solution,
      difficulty: "easy",
      backtrackDepth: result.backtrackDepth
    };
  }
  const g2 = createEmptyGrid(size);
  const s2 = Array.from({ length: size }, () => Array(size).fill(false));
  s2[0][0] = true;
  return {
    id: `cat-puzzle-minimal-${Date.now()}`,
    size,
    grid: g2,
    solution: s2,
    difficulty: "easy",
    backtrackDepth: 0
  };
}
function getHint(grid, solution, playerSolution, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (solution[r][c] && !playerSolution[r][c] && grid[r][c] === 9) return [r, c];
    }
  }
  return null;
}
