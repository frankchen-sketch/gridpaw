function getCandidateRects(num, occupied, W, H) {
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
          if (canPlace(rect, occupied, W, H)) {
            candidates.push(rect);
          }
        }
      }
    }
  }
  return candidates;
}
function canPlace(rect, occupied, W, H) {
  if (rect.top < 0 || rect.left < 0) return false;
  if (rect.top + rect.height > H || rect.left + rect.width > W) return false;
  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      if (occupied[r][c]) return false;
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
  const { width: W, height: H, numbers } = puzzle;
  const occupied = Array.from({ length: H }, () => Array(W).fill(false));
  const solutions = [];
  const remaining = new Set(numbers.map((_, i) => i));
  backtrackMRV(numbers, remaining, occupied, [], solutions, W, H, maxSolutions);
  return solutions;
}
function backtrackMRV(numbers, remaining, occupied, placed, solutions, W, H, maxSolutions) {
  if (solutions.length >= maxSolutions) return;
  if (remaining.size === 0) {
    if (occupied.every((row) => row.every((cell) => cell))) {
      const key = placed.map((r) => `${r.top},${r.left},${r.height},${r.width}`).sort().join("|");
      const isDupe = solutions.some((existing) => {
        const ek = existing.map((r) => `${r.top},${r.left},${r.height},${r.width}`).sort().join("|");
        return ek === key;
      });
      if (!isDupe) solutions.push([...placed]);
    }
    return;
  }
  let bestIdx = -1;
  let bestCandidates = [];
  let minOptions = Infinity;
  for (const idx of remaining) {
    const candidates = getCandidateRects(numbers[idx], occupied, W, H);
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
    backtrackMRV(numbers, remaining, occupied, placed, solutions, W, H, maxSolutions);
    removeRect(rect, occupied);
    placed.pop();
    if (solutions.length >= maxSolutions) break;
  }
  remaining.add(bestIdx);
}
function generatePuzzle(W, H) {
  const rects = partitionGrid(W, H);
  if (!rects || rects.length === 0) return null;
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
  if (W * H <= 6) {
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
  const rects = partitionGrid(W, H);
  if (!rects || rects.length === 0) return null;
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
  const { width: W, height: H } = puzzle;
  if (rect.top < 0 || rect.left < 0 || rect.top + rect.height > H || rect.left + rect.width > W) {
    return { valid: false, reason: "Out of bounds" };
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
