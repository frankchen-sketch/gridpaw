function getCandidateRects(num, occupied, W, H, validCells) {
  const { row, col, value } = num;
  const candidates = [];
  for (let a = 1; a <= value; a++) {
    if (value % a !== 0) continue;
    const b = value / a;
    for (const [rh, rw] of [[a, b], [b, a]]) {
      if (rh > H || rw > W) continue;
      const topMin = Math.max(0, row - rh + 1);
      const topMax = Math.min(row, H - rh);
      const leftMin = Math.max(0, col - rw + 1);
      const leftMax = Math.min(col, W - rw);
      if (topMin > topMax || leftMin > leftMax) continue;
      for (let top = topMin; top <= topMax; top++) {
        for (let left = leftMin; left <= leftMax; left++) {
          const rect = { top, left, height: rh, width: rw, value };
          if (canPlace(rect, occupied, W, H, validCells)) {
            candidates.push(rect);
          }
        }
      }
    }
  }
  return candidates;
}
function canPlace(rect, occupied, W, H, validCells) {
  if (rect.top < 0 || rect.left < 0) return false;
  if (rect.top + rect.height > H || rect.left + rect.width > W) return false;
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      if (occupied[r][c]) return false;
      if (validCells && !validCells.has(`${r},${c}`)) return false;
    }
  }
  return true;
}
function placeRect(rect, occupied) {
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      occupied[r][c] = true;
    }
  }
}
function removeRect(rect, occupied) {
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      occupied[r][c] = false;
    }
  }
}
function solve(puzzle, maxSolutions = 2) {
  const { width: W, height: H, numbers, validCells } = puzzle;
  const occupied = Array.from({ length: H }, () => Array(W).fill(false));
  const solutions = [];
  const remaining = new Set(numbers.map((_, i) => i));
  if (validCells) {
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (!validCells.has(`${r},${c}`)) {
          occupied[r][c] = true;
        }
      }
    }
  }
  backtrackMRV(numbers, remaining, occupied, [], solutions, W, H, maxSolutions, validCells);
  return solutions;
}
function backtrackMRV(numbers, remaining, occupied, placed, solutions, W, H, maxSolutions, validCells) {
  if (solutions.length >= maxSolutions) return;
  if (remaining.size === 0) {
    if (validCells) {
      for (const key2 of validCells) {
        const [r, c] = key2.split(",").map(Number);
        if (!occupied[r][c]) return;
      }
    } else {
      if (!occupied.every((row) => row.every((cell) => cell))) return;
    }
    const key = placed.map((r) => `${r.top},${r.left},${r.height},${r.width}`).sort().join("|");
    const isDupe = solutions.some((existing) => {
      const ek = existing.map((r) => `${r.top},${r.left},${r.height},${r.width}`).sort().join("|");
      return ek === key;
    });
    if (!isDupe) solutions.push([...placed]);
    return;
  }
  let bestIdx = -1;
  let bestCandidates = [];
  let minOptions = Infinity;
  for (const idx of remaining) {
    const candidates = getCandidateRects(numbers[idx], occupied, W, H, validCells);
    if (candidates.length < minOptions) {
      minOptions = candidates.length;
      bestIdx = idx;
      bestCandidates = candidates;
      if (minOptions === 0) return;
    }
  }
  remaining.delete(bestIdx);
  for (const rect of bestCandidates) {
    placeRect(rect, occupied);
    placed.push(rect);
    backtrackMRV(numbers, remaining, occupied, placed, solutions, W, H, maxSolutions, validCells);
    removeRect(rect, occupied);
    placed.pop();
    if (solutions.length >= maxSolutions) break;
  }
  remaining.add(bestIdx);
}
function mergeSmallRects(rects, _W, _H) {
  const result = [...rects];
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = result.length - 1; i >= 0; i--) {
      const r = result[i];
      if (r.height !== 1 || r.width !== 1) continue;
      const rightIdx = result.findIndex((n, j) => j !== i && n.top === r.top && n.left === r.left + 1 && n.height === 1);
      if (rightIdx >= 0) {
        result[rightIdx].left--;
        result[rightIdx].width++;
        result[rightIdx].value = result[rightIdx].width;
        result.splice(i, 1);
        changed = true;
        break;
      }
      const downIdx = result.findIndex((n, j) => j !== i && n.left === r.left && n.top === r.top + 1 && n.width === 1);
      if (downIdx >= 0) {
        result[downIdx].top--;
        result[downIdx].height++;
        result[downIdx].value = result[downIdx].height;
        result.splice(i, 1);
        changed = true;
        break;
      }
      const leftIdx = result.findIndex((n, j) => j !== i && n.top === r.top && n.left + n.width === r.left && n.height === 1);
      if (leftIdx >= 0) {
        result[leftIdx].width++;
        result[leftIdx].value = result[leftIdx].width;
        result.splice(i, 1);
        changed = true;
        break;
      }
      const topIdx = result.findIndex((n, j) => j !== i && n.left === r.left && n.top + n.height === r.top && n.width === 1);
      if (topIdx >= 0) {
        result[topIdx].height++;
        result[topIdx].value = result[topIdx].height;
        result.splice(i, 1);
        changed = true;
        break;
      }
    }
  }
  return result;
}
function generatePuzzle(W, H) {
  const rects0 = partitionGrid(W, H);
  if (!rects0 || rects0.length === 0) return null;
  const rects = mergeSmallRects(rects0, W, H);
  const numbers = rects.map((rect) => {
    const r = rect.top + Math.floor(Math.random() * rect.height);
    const c = rect.left + Math.floor(Math.random() * rect.width);
    return { row: r, col: c, value: rect.height * rect.width };
  });
  const puzzle = { width: W, height: H, numbers, solutionRects: rects };
  const solutions = solve(puzzle, 2);
  if (solutions.length === 1) {
    return puzzle;
  }
  return null;
}
function partitionGrid(W, H) {
  if (W <= 0 || H <= 0) return null;
  if (W === 1 && H === 1) return [{ top: 0, left: 0, height: 1, width: 1, value: 1 }];
  if (W * H <= 6 && !(W === 1 && H === 1)) {
    return [{ top: 0, left: 0, height: H, width: W, value: W * H }];
  }
  if (W * H <= 10 && W * H > 6 && Math.random() < 0.25) {
    return [{ top: 0, left: 0, height: H, width: W, value: W * H }];
  }
  const splitVertical = W >= H ? Math.random() > 0.3 : Math.random() < 0.3;
  if (splitVertical && W > 1) {
    const cut = 1 + Math.floor(Math.random() * (W - 1));
    const left = partitionGridRects(0, 0, H, cut);
    const right = partitionGridRects(0, cut, H, W - cut);
    if (left && right) return [...left, ...right];
  } else if (H > 1) {
    const cut = 1 + Math.floor(Math.random() * (H - 1));
    const top = partitionGridRects(0, 0, cut, W);
    const bottom = partitionGridRects(cut, 0, H - cut, W);
    if (top && bottom) return [...top, ...bottom];
  }
  return [{ top: 0, left: 0, height: H, width: W, value: W * H }];
}
function partitionGridRects(topOff, leftOff, H, W) {
  if (W <= 0 || H <= 0) return null;
  if (W === 1 && H === 1) return [{ top: topOff, left: leftOff, height: 1, width: 1, value: 1 }];
  if (W * H <= 6) return [{ top: topOff, left: leftOff, height: H, width: W, value: W * H }];
  if (W * H <= 10 && W * H > 6 && Math.random() < 0.25) {
    return [{ top: topOff, left: leftOff, height: H, width: W, value: W * H }];
  }
  const splitVertical = W >= H ? Math.random() > 0.3 : Math.random() < 0.3;
  if (splitVertical && W > 1) {
    const cut = 1 + Math.floor(Math.random() * (W - 1));
    const left = partitionGridRects(topOff, leftOff, H, cut);
    const right = partitionGridRects(topOff, leftOff + cut, H, W - cut);
    if (left && right) return [...left, ...right];
  } else if (H > 1) {
    const cut = 1 + Math.floor(Math.random() * (H - 1));
    const top = partitionGridRects(topOff, leftOff, cut, W);
    const bottom = partitionGridRects(topOff + cut, leftOff, H - cut, W);
    if (top && bottom) return [...top, ...bottom];
  }
  return [{ top: topOff, left: leftOff, height: H, width: W, value: W * H }];
}
function generatePuzzleFast(W, H) {
  const rects0 = partitionGrid(W, H);
  if (!rects0 || rects0.length === 0) return null;
  const rects = mergeSmallRects(rects0, W, H);
  const numbers = rects.map((rect) => {
    const r = rect.top + Math.floor(Math.random() * rect.height);
    const c = rect.left + Math.floor(Math.random() * rect.width);
    return { row: r, col: c, value: rect.height * rect.width };
  });
  return { width: W, height: H, numbers, solutionRects: rects };
}
function generatePuzzleWithRetry(W, H, maxAttempts = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    const puzzle = generatePuzzle(W, H);
    if (puzzle) return puzzle;
  }
  return null;
}
function createSeededRandom(seed) {
  let s = seed | 0;
  return () => {
    s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function dateSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
}
function generateDailyPuzzle(dateStr, size) {
  const seed = dateSeed(dateStr);
  const rng = createSeededRandom(seed);
  const origRandom = Math.random;
  Math.random = rng;
  try {
    if (size > 7) {
      for (let i = 0; i < 50; i++) {
        const puzzle = generatePuzzleFast(size, size);
        if (puzzle) return puzzle;
      }
      return null;
    }
    for (let i = 0; i < 200; i++) {
      const puzzle = generatePuzzle(size, size);
      if (puzzle) return puzzle;
    }
    return null;
  } finally {
    Math.random = origRandom;
  }
}
function validatePlacement(rect, puzzle, occupied) {
  const { width: W, height: H, validCells } = puzzle;
  if (rect.top < 0 || rect.left < 0 || rect.top + rect.height > H || rect.left + rect.width > W) {
    return { valid: false, reason: "Out of bounds" };
  }
  if (validCells) {
    for (let r = rect.top; r < rect.top + rect.height; r++) {
      for (let c = rect.left; c < rect.left + rect.width; c++) {
        if (!validCells.has(`${r},${c}`)) {
          return { valid: false, reason: "Cell not in valid grid area" };
        }
      }
    }
  }
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      if (occupied[r][c]) return { valid: false, reason: "Overlaps existing rectangle" };
    }
  }
  const numsInside = puzzle.numbers.filter(
    (n) => n.row >= rect.top && n.row < rect.top + rect.height && n.col >= rect.left && n.col < rect.left + rect.width
  );
  if (numsInside.length !== 1) {
    return { valid: false, reason: `Contains ${numsInside.length} numbers (need exactly 1)` };
  }
  const area = rect.height * rect.width;
  if (area !== numsInside[0].value) {
    return { valid: false, reason: `Area ${area} \u2260 number ${numsInside[0].value}` };
  }
  return { valid: true };
}
function generateFromLevel(levelDef) {
  const { grid, solutionRects, shapeHintIndices, xRevealMap } = levelDef;
  const { width: W, height: H, validCells } = grid;
  const numbers = solutionRects.map((rect) => {
    const cells = [];
    for (let r = rect.top; r < rect.top + rect.height; r++) {
      for (let c = rect.left; c < rect.left + rect.width; c++) {
        if (!validCells || validCells.has(`${r},${c}`)) {
          cells.push([r, c]);
        }
      }
    }
    const pick = cells[Math.floor(Math.random() * cells.length)];
    return { row: pick[0], col: pick[1], value: rect.height * rect.width };
  });
  const shapeHintSet = new Set(shapeHintIndices ?? []);
  const xRevealIdxMap = xRevealMap ?? {};
  const enhancedNumbers = numbers.map((num, i) => {
    const enhanced = { ...num };
    if (shapeHintSet.has(i)) {
      const rect = solutionRects[i];
      if (rect.height === rect.width) {
        enhanced.shapeHint = { type: "square" };
      } else if (rect.width > rect.height) {
        enhanced.shapeHint = { type: "wide" };
      } else {
        enhanced.shapeHint = { type: "tall" };
      }
    }
    if (i in xRevealIdxMap) {
      enhanced.xReveal = { remaining: xRevealIdxMap[i] };
    }
    return enhanced;
  });
  const puzzle = {
    width: W,
    height: H,
    numbers,
    solutionRects,
    validCells
  };
  return { puzzle, enhancedNumbers };
}
function buildValidCells(ranges) {
  const set = /* @__PURE__ */ new Set();
  for (const [row, cStart, cEnd] of ranges) {
    for (let c = cStart; c <= cEnd; c++) {
      set.add(`${row},${c}`);
    }
  }
  return set;
}
function fullGridCells(W, H) {
  const set = /* @__PURE__ */ new Set();
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      set.add(`${r},${c}`);
    }
  }
  return set;
}
const LEVEL_DEFS = [
  // ── Tutorial Levels ──
  // Tutorial 1: 1×3 horizontal drag
  {
    id: 1,
    label: "Tutorial 1",
    grid: { width: 3, height: 1 },
    solutionRects: [
      { top: 0, left: 0, height: 1, width: 3, value: 3 }
    ],
    isTutorial: true,
    tutorialStep: 1
  },
  // Tutorial 2: 3×1 vertical drag
  {
    id: 2,
    label: "Tutorial 2",
    grid: { width: 1, height: 3 },
    solutionRects: [
      { top: 0, left: 0, height: 3, width: 1, value: 3 }
    ],
    isTutorial: true,
    tutorialStep: 2
  },
  // Tutorial 3: 3×3, 2 numbers, horizontal + vertical combo
  {
    id: 3,
    label: "Tutorial 3",
    grid: { width: 3, height: 3 },
    solutionRects: [
      { top: 0, left: 0, height: 3, width: 1, value: 3 },
      { top: 0, left: 1, height: 1, width: 2, value: 2 },
      { top: 1, left: 1, height: 2, width: 2, value: 4 }
    ],
    isTutorial: true,
    tutorialStep: 3
  },
  // Tutorial 4: 3×3, 3 numbers, full rules
  {
    id: 4,
    label: "Tutorial 4",
    grid: { width: 3, height: 3 },
    solutionRects: [
      { top: 0, left: 0, height: 1, width: 2, value: 2 },
      { top: 0, left: 2, height: 2, width: 1, value: 2 },
      { top: 1, left: 0, height: 2, width: 2, value: 4 },
      { top: 2, left: 2, height: 1, width: 1, value: 1 }
    ],
    isTutorial: true,
    tutorialStep: 4
  },
  // ── Regular Levels ──
  // Level 1: 4×4
  {
    id: 5,
    label: "Level 1",
    grid: { width: 4, height: 4 },
    solutionRects: [
      { top: 0, left: 0, height: 2, width: 2, value: 4 },
      { top: 0, left: 2, height: 1, width: 2, value: 2 },
      { top: 1, left: 2, height: 1, width: 2, value: 2 },
      { top: 2, left: 0, height: 2, width: 1, value: 2 },
      { top: 2, left: 1, height: 1, width: 3, value: 3 },
      { top: 3, left: 1, height: 1, width: 3, value: 3 }
    ]
  },
  // Level 2: 5×4
  {
    id: 6,
    label: "Level 2",
    grid: { width: 5, height: 4 },
    solutionRects: [
      { top: 0, left: 0, height: 2, width: 2, value: 4 },
      { top: 0, left: 2, height: 1, width: 3, value: 3 },
      { top: 1, left: 2, height: 1, width: 3, value: 3 },
      { top: 2, left: 0, height: 2, width: 3, value: 6 },
      { top: 2, left: 3, height: 2, width: 2, value: 4 }
    ]
  },
  // Level 3: Irregular bone shape (6×5, 28 cells)
  {
    id: 7,
    label: "Level 3",
    grid: {
      width: 6,
      height: 5,
      validCells: buildValidCells([
        [0, 0, 5],
        [1, 0, 5],
        // top 6×2 = 12
        [2, 1, 4],
        // middle 4 cells
        [3, 0, 5],
        [4, 0, 5]
        // bottom 6×2 = 12
      ])
    },
    solutionRects: [
      { top: 0, left: 0, height: 1, width: 2, value: 2 },
      { top: 1, left: 0, height: 3, width: 2, value: 6 },
      { top: 4, left: 0, height: 1, width: 2, value: 2 },
      { top: 0, left: 2, height: 5, width: 1, value: 5 },
      { top: 0, left: 3, height: 1, width: 3, value: 3 },
      { top: 1, left: 3, height: 4, width: 1, value: 4 },
      { top: 1, left: 4, height: 4, width: 1, value: 4 },
      { top: 1, left: 5, height: 4, width: 1, value: 4 }
    ]
  },
  // Level 4: 5×5
  {
    id: 8,
    label: "Level 4",
    grid: { width: 5, height: 5 },
    solutionRects: [
      { top: 0, left: 0, height: 5, width: 1, value: 5 },
      { top: 0, left: 1, height: 5, width: 1, value: 5 },
      { top: 0, left: 2, height: 2, width: 3, value: 6 },
      { top: 2, left: 2, height: 3, width: 2, value: 6 },
      { top: 2, left: 4, height: 3, width: 1, value: 3 }
    ]
  },
  // Level 5: 6×5
  {
    id: 9,
    label: "Level 5",
    grid: { width: 6, height: 5 },
    solutionRects: [
      { top: 0, left: 0, height: 1, width: 4, value: 4 },
      { top: 1, left: 0, height: 4, width: 1, value: 4 },
      { top: 1, left: 1, height: 3, width: 3, value: 9 },
      { top: 4, left: 1, height: 1, width: 3, value: 3 },
      { top: 0, left: 4, height: 3, width: 2, value: 6 },
      { top: 3, left: 4, height: 1, width: 2, value: 2 },
      { top: 4, left: 4, height: 1, width: 2, value: 2 }
    ]
  },
  // Level 6: Irregular bone shape (6×6, 32 cells)
  {
    id: 10,
    label: "Level 6",
    grid: {
      width: 6,
      height: 6,
      validCells: buildValidCells([
        [0, 0, 5],
        [1, 0, 5],
        // top 6×2 = 12
        [2, 1, 4],
        [3, 1, 4],
        // middle 4×2 = 8
        [4, 0, 5],
        [5, 0, 5]
        // bottom 6×2 = 12
      ])
    },
    solutionRects: [
      { top: 0, left: 0, height: 1, width: 6, value: 6 },
      { top: 1, left: 0, height: 2, width: 4, value: 8 },
      { top: 3, left: 0, height: 2, width: 3, value: 6 },
      { top: 5, left: 0, height: 1, width: 3, value: 3 },
      { top: 3, left: 3, height: 3, width: 1, value: 3 },
      { top: 1, left: 4, height: 2, width: 2, value: 4 },
      { top: 3, left: 4, height: 2, width: 2, value: 4 },
      { top: 5, left: 4, height: 1, width: 2, value: 2 }
    ]
  },
  // Level 7: 6×6
  {
    id: 11,
    label: "Level 7",
    grid: { width: 6, height: 6 },
    solutionRects: [
      { top: 0, left: 0, height: 6, width: 1, value: 6 },
      { top: 0, left: 1, height: 1, width: 5, value: 5 },
      { top: 1, left: 1, height: 1, width: 4, value: 4 },
      { top: 2, left: 1, height: 1, width: 3, value: 3 },
      { top: 3, left: 1, height: 3, width: 2, value: 6 },
      { top: 3, left: 3, height: 3, width: 1, value: 3 },
      { top: 2, left: 4, height: 4, width: 1, value: 4 },
      { top: 1, left: 5, height: 5, width: 1, value: 5 }
    ]
  },
  // Level 8: 7×6
  {
    id: 12,
    label: "Level 8",
    grid: { width: 7, height: 6 },
    solutionRects: [
      { top: 0, left: 0, height: 1, width: 5, value: 5 },
      { top: 0, left: 5, height: 1, width: 2, value: 2 },
      { top: 1, left: 0, height: 4, width: 1, value: 4 },
      { top: 1, left: 1, height: 4, width: 2, value: 8 },
      { top: 5, left: 0, height: 1, width: 3, value: 3 },
      { top: 1, left: 3, height: 3, width: 1, value: 3 },
      { top: 1, left: 4, height: 3, width: 2, value: 6 },
      { top: 1, left: 6, height: 3, width: 1, value: 3 },
      { top: 4, left: 3, height: 2, width: 4, value: 8 }
    ]
  },
  // Level 9: 7×7
  {
    id: 13,
    label: "Level 9",
    grid: { width: 7, height: 7 },
    solutionRects: [
      { top: 0, left: 0, height: 2, width: 2, value: 4 },
      { top: 0, left: 2, height: 1, width: 3, value: 3 },
      { top: 0, left: 5, height: 2, width: 2, value: 4 },
      { top: 1, left: 2, height: 2, width: 1, value: 2 },
      { top: 1, left: 3, height: 1, width: 2, value: 2 },
      { top: 2, left: 0, height: 2, width: 2, value: 4 },
      { top: 2, left: 3, height: 1, width: 4, value: 4 },
      { top: 3, left: 2, height: 2, width: 2, value: 4 },
      { top: 3, left: 4, height: 1, width: 3, value: 3 },
      { top: 4, left: 0, height: 3, width: 2, value: 6 },
      { top: 4, left: 4, height: 2, width: 3, value: 6 },
      { top: 5, left: 2, height: 2, width: 2, value: 4 },
      { top: 6, left: 4, height: 1, width: 3, value: 3 }
    ]
  },
  // Level 10: 7×8 — HARD
  {
    id: 14,
    label: "Level 10",
    grid: { width: 8, height: 7 },
    solutionRects: [
      { top: 0, left: 0, height: 2, width: 3, value: 6 },
      { top: 2, left: 0, height: 3, width: 1, value: 3 },
      { top: 2, left: 1, height: 3, width: 2, value: 6 },
      { top: 0, left: 3, height: 2, width: 3, value: 6 },
      { top: 0, left: 6, height: 2, width: 1, value: 2 },
      { top: 2, left: 3, height: 1, width: 4, value: 4 },
      { top: 3, left: 3, height: 1, width: 4, value: 4 },
      { top: 4, left: 3, height: 1, width: 4, value: 4 },
      { top: 0, left: 7, height: 5, width: 1, value: 5 },
      { top: 5, left: 0, height: 2, width: 3, value: 6 },
      { top: 5, left: 3, height: 2, width: 2, value: 4 },
      { top: 5, left: 5, height: 2, width: 3, value: 6 }
    ],
    isHard: true
  },
  // Level 11: 8×8
  {
    id: 15,
    label: "Level 11",
    grid: { width: 8, height: 8 },
    solutionRects: [
      { top: 0, left: 0, height: 1, width: 7, value: 7 },
      { top: 0, left: 7, height: 1, width: 1, value: 1 },
      { top: 1, left: 0, height: 1, width: 4, value: 4 },
      { top: 1, left: 4, height: 1, width: 4, value: 4 },
      { top: 2, left: 0, height: 2, width: 2, value: 4 },
      { top: 4, left: 0, height: 2, width: 2, value: 4 },
      { top: 2, left: 2, height: 1, width: 5, value: 5 },
      { top: 3, left: 2, height: 1, width: 5, value: 5 },
      { top: 2, left: 7, height: 2, width: 1, value: 2 },
      { top: 4, left: 2, height: 2, width: 1, value: 2 },
      { top: 4, left: 3, height: 2, width: 3, value: 6 },
      { top: 4, left: 6, height: 2, width: 1, value: 2 },
      { top: 4, left: 7, height: 2, width: 1, value: 2 },
      { top: 6, left: 0, height: 1, width: 4, value: 4 },
      { top: 7, left: 0, height: 1, width: 4, value: 4 },
      { top: 6, left: 4, height: 1, width: 4, value: 4 },
      { top: 7, left: 4, height: 1, width: 4, value: 4 }
    ]
  },
  // Level 12: 6×6 — HARD + ShapeHints
  {
    id: 16,
    label: "Level 12",
    grid: { width: 6, height: 6 },
    solutionRects: [
      { top: 0, left: 0, height: 5, width: 1, value: 5 },
      { top: 0, left: 1, height: 5, width: 1, value: 5 },
      { top: 5, left: 0, height: 1, width: 2, value: 2 },
      { top: 0, left: 2, height: 4, width: 1, value: 4 },
      { top: 0, left: 3, height: 3, width: 3, value: 9 },
      { top: 3, left: 3, height: 1, width: 3, value: 3 },
      { top: 4, left: 2, height: 1, width: 4, value: 4 },
      { top: 5, left: 2, height: 1, width: 4, value: 4 }
    ],
    shapeHintIndices: [0, 2, 7, 8, 10],
    isHard: true
  },
  // Level 13: 7×7 + ShapeHints
  {
    id: 17,
    label: "Level 13",
    grid: { width: 7, height: 7 },
    solutionRects: [
      { top: 0, left: 0, height: 2, width: 2, value: 4 },
      { top: 0, left: 2, height: 1, width: 3, value: 3 },
      { top: 0, left: 5, height: 2, width: 2, value: 4 },
      { top: 1, left: 2, height: 2, width: 2, value: 4 },
      { top: 1, left: 4, height: 1, width: 1, value: 1 },
      { top: 2, left: 0, height: 1, width: 2, value: 2 },
      { top: 2, left: 4, height: 2, width: 3, value: 6 },
      { top: 3, left: 0, height: 2, width: 4, value: 8 },
      { top: 4, left: 4, height: 1, width: 3, value: 3 },
      { top: 5, left: 0, height: 2, width: 3, value: 6 },
      { top: 5, left: 3, height: 1, width: 4, value: 4 },
      { top: 6, left: 3, height: 1, width: 4, value: 4 }
    ],
    shapeHintIndices: [0, 3, 6, 9]
  },
  // Level 14: 9×9 — HARD + ShapeHints
  {
    id: 18,
    label: "Level 14",
    grid: { width: 9, height: 9 },
    solutionRects: [
      { top: 0, left: 0, height: 2, width: 1, value: 2 },
      { top: 0, left: 1, height: 1, width: 4, value: 4 },
      { top: 1, left: 1, height: 1, width: 4, value: 4 },
      { top: 0, left: 5, height: 2, width: 3, value: 6 },
      { top: 0, left: 8, height: 2, width: 1, value: 2 },
      { top: 2, left: 0, height: 3, width: 2, value: 6 },
      { top: 2, left: 2, height: 3, width: 1, value: 3 },
      { top: 5, left: 0, height: 2, width: 3, value: 6 },
      { top: 2, left: 3, height: 3, width: 2, value: 6 },
      { top: 5, left: 3, height: 2, width: 2, value: 4 },
      { top: 2, left: 5, height: 5, width: 1, value: 5 },
      { top: 2, left: 6, height: 2, width: 3, value: 6 },
      { top: 4, left: 6, height: 2, width: 3, value: 6 },
      { top: 6, left: 6, height: 1, width: 3, value: 3 },
      { top: 7, left: 0, height: 2, width: 3, value: 6 },
      { top: 7, left: 3, height: 2, width: 1, value: 2 },
      { top: 7, left: 4, height: 1, width: 4, value: 4 },
      { top: 8, left: 4, height: 1, width: 4, value: 4 },
      { top: 7, left: 8, height: 2, width: 1, value: 2 }
    ],
    shapeHintIndices: [3, 5, 9, 10, 17],
    isHard: true
  },
  // Level 15: Irregular cat shape (6×6, 28 cells)
  {
    id: 19,
    label: "Level 15",
    grid: {
      width: 6,
      height: 6,
      validCells: buildValidCells([
        [0, 1, 1],
        [0, 4, 4],
        // ears (2 cells)
        [1, 0, 5],
        // head (6 cells)
        [2, 0, 5],
        // face (6 cells)
        [3, 0, 5],
        // body (6 cells)
        [4, 1, 4],
        // body (4 cells)
        [5, 1, 4]
        // legs (4 cells)
      ])
    },
    solutionRects: [
      // ears
      { top: 0, left: 1, height: 1, width: 1, value: 1 },
      { top: 0, left: 4, height: 1, width: 1, value: 1 },
      // head row
      { top: 1, left: 0, height: 1, width: 2, value: 2 },
      { top: 1, left: 2, height: 1, width: 2, value: 2 },
      { top: 1, left: 4, height: 1, width: 2, value: 2 },
      // face row
      { top: 2, left: 0, height: 1, width: 3, value: 3 },
      { top: 2, left: 3, height: 1, width: 3, value: 3 },
      // body row
      { top: 3, left: 0, height: 1, width: 2, value: 2 },
      { top: 3, left: 2, height: 2, width: 2, value: 4 },
      { top: 3, left: 4, height: 1, width: 2, value: 2 },
      // lower body
      { top: 4, left: 1, height: 2, width: 1, value: 2 },
      { top: 4, left: 4, height: 1, width: 1, value: 1 },
      // legs
      { top: 5, left: 2, height: 1, width: 2, value: 2 },
      { top: 5, left: 4, height: 1, width: 1, value: 1 }
    ]
  },
  // Level 16: 5×6 + XReveal
  {
    id: 20,
    label: "Level 16",
    grid: { width: 6, height: 5 },
    solutionRects: [
      { top: 0, left: 0, height: 5, width: 1, value: 5 },
      { top: 0, left: 1, height: 2, width: 3, value: 6 },
      { top: 2, left: 1, height: 1, width: 3, value: 3 },
      { top: 0, left: 4, height: 3, width: 2, value: 6 },
      { top: 3, left: 1, height: 2, width: 1, value: 2 },
      { top: 3, left: 2, height: 2, width: 4, value: 8 }
    ],
    xRevealMap: { 0: 1, 1: 2, 2: 1 }
  },
  // Level 17: 7×7 + XReveal
  {
    id: 21,
    label: "Level 17",
    grid: { width: 7, height: 7 },
    solutionRects: [
      { top: 0, left: 0, height: 4, width: 1, value: 4 },
      { top: 4, left: 0, height: 3, width: 1, value: 3 },
      { top: 0, left: 1, height: 5, width: 1, value: 5 },
      { top: 5, left: 1, height: 2, width: 1, value: 2 },
      { top: 0, left: 2, height: 1, width: 4, value: 4 },
      { top: 1, left: 2, height: 1, width: 4, value: 4 },
      { top: 2, left: 2, height: 2, width: 2, value: 4 },
      { top: 4, left: 2, height: 3, width: 2, value: 6 },
      { top: 2, left: 4, height: 5, width: 1, value: 5 },
      { top: 2, left: 5, height: 5, width: 1, value: 5 },
      { top: 0, left: 6, height: 1, width: 1, value: 1 },
      { top: 1, left: 6, height: 6, width: 1, value: 6 }
    ],
    xRevealMap: { 0: 1, 1: 2, 3: 1, 4: 2 }
  },
  // Level 18: 8×8 + XReveal
  {
    id: 22,
    label: "Level 18",
    grid: { width: 8, height: 8 },
    solutionRects: [
      { top: 0, left: 0, height: 2, width: 2, value: 4 },
      { top: 0, left: 2, height: 2, width: 3, value: 6 },
      { top: 0, left: 5, height: 2, width: 1, value: 2 },
      { top: 0, left: 6, height: 2, width: 2, value: 4 },
      { top: 2, left: 0, height: 1, width: 4, value: 4 },
      { top: 2, left: 4, height: 1, width: 4, value: 4 },
      { top: 3, left: 0, height: 1, width: 5, value: 5 },
      { top: 3, left: 5, height: 1, width: 3, value: 3 },
      { top: 4, left: 0, height: 3, width: 3, value: 9 },
      { top: 4, left: 3, height: 3, width: 1, value: 3 },
      { top: 4, left: 4, height: 3, width: 2, value: 6 },
      { top: 4, left: 6, height: 3, width: 2, value: 6 },
      { top: 7, left: 0, height: 1, width: 8, value: 8 }
    ],
    xRevealMap: { 1: 2, 5: 1, 8: 1, 11: 2 }
  },
  // Level 19: 9×9 — HARD + XReveal
  {
    id: 23,
    label: "Level 19",
    grid: { width: 9, height: 9 },
    solutionRects: [
      { top: 0, left: 0, height: 2, width: 3, value: 6 },
      { top: 0, left: 3, height: 2, width: 1, value: 2 },
      { top: 0, left: 4, height: 2, width: 3, value: 6 },
      { top: 2, left: 0, height: 5, width: 1, value: 5 },
      { top: 2, left: 1, height: 5, width: 1, value: 5 },
      { top: 7, left: 0, height: 1, width: 2, value: 2 },
      { top: 2, left: 2, height: 6, width: 1, value: 6 },
      { top: 8, left: 0, height: 1, width: 3, value: 3 },
      { top: 2, left: 3, height: 4, width: 1, value: 4 },
      { top: 2, left: 4, height: 4, width: 1, value: 4 },
      { top: 6, left: 3, height: 2, width: 2, value: 4 },
      { top: 8, left: 3, height: 1, width: 2, value: 2 },
      { top: 2, left: 5, height: 2, width: 2, value: 4 },
      { top: 4, left: 5, height: 1, width: 2, value: 2 },
      { top: 5, left: 5, height: 4, width: 1, value: 4 },
      { top: 5, left: 6, height: 4, width: 1, value: 4 },
      { top: 0, left: 7, height: 3, width: 1, value: 3 },
      { top: 3, left: 7, height: 4, width: 1, value: 4 },
      { top: 7, left: 7, height: 2, width: 1, value: 2 },
      { top: 0, left: 8, height: 6, width: 1, value: 6 },
      { top: 6, left: 8, height: 2, width: 1, value: 2 },
      { top: 8, left: 8, height: 1, width: 1, value: 1 }
    ],
    xRevealMap: { 0: 2, 3: 1, 7: 2, 8: 1, 13: 3 },
    isHard: true
  }
];
