/**
 * GridPaw — Slitherlink Engine
 *
 * Fifth game on puzzle-core. EdgeGrid topology: the puzzle is a lattice of
 * dots; the player draws ONE closed loop along lattice edges. Numbered cells
 * say how many of their four edges belong to the loop.
 *
 * Generation ("scatter & take the boundary"):
 *  1. Random cell set S on a rows×cols board
 *  2. Repair: merge components (union-find), fill holes  → S connected,
 *     complement connected ⇒ the boundary of S is exactly ONE simple loop
 *  3. Loop edges = lattice edges with exactly one side in S
 *  4. Clues = per-cell count of loop edges among its 4 edges
 *  5. Uniqueness via countSolutions (limit 2); retry with new scatter if not unique
 *
 * Edge encoding (shared by UI and solver):
 *   horizontal edges H[r][c]: edge between dots (r,c) and (r,c+1), r∈[0,rows], c∈[0,cols-1]
 *   vertical edges   V[r][c]: edge between dots (r,c) and (r+1,c), r∈[0,rows-1], c∈[0,cols]
 *   index space: H edges first (rows*(cols) of them? no — (rows+1)*cols), then V edges (rows*(cols+1))
 *   edgeCount = (rows+1)*cols + rows*(cols+1)
 *   hIdx(r,c) = r*cols + c                       for r∈[0,rows], c∈[0,cols-1]
 *   vIdx(r,c) = (rows+1)*cols + r*(cols+1) + c   for r∈[0,rows-1], c∈[0,cols]
 */

export interface SlitherPuzzle {
  id: string;
  rows: number;          // cells tall
  cols: number;          // cells wide
  clues: Int8Array;      // rows*cols, -1 = no clue, 0..3 otherwise (we emit full grid)
  solution: Uint8Array;  // per edge 0|1
  loopLen: number;       // solution loop length (edges used)
  difficulty: 'easy' | 'medium' | 'hard';
}

export function hIdx(rows: number, cols: number, r: number, c: number): number { return r * cols + c; }
export function vIdx(rows: number, cols: number, r: number, c: number): number { return (rows + 1) * cols + r * (cols + 1) + c; }
export function edgeCount(rows: number, cols: number): number { return (rows + 1) * cols + rows * (cols + 1); }

// cell -> its 4 edge indices
function cellEdges(rows: number, cols: number, r: number, c: number): number[] {
  return [
    hIdx(rows, cols, r, c),         // top
    hIdx(rows, cols, r + 1, c),     // bottom
    vIdx(rows, cols, r, c),         // left
    vIdx(rows, cols, r, c + 1),     // right
  ];
}

// ── Loop generation via connected, hole-free cell set ───────────────────────
export function makeLoop(rows: number, cols: number, rng: () => number, minLen: number): Uint8Array | null {
  const N = rows * cols;
  let s = new Uint8Array(N);
  for (let i = 0; i < N; i++) s[i] = rng() < 0.5 ? 1 : 0;

  // repair to connectivity: keep largest component, BFS-attach others via shortest cell bridges
  const compOf = new Int32Array(N).fill(-1);
  let comps: number[][] = [];
  for (let i = 0; i < N; i++) {
    if (!s[i] || compOf[i] >= 0) continue;
    const comp: number[] = [];
    const stack = [i];
    compOf[i] = comps.length;
    while (stack.length) {
      const v = stack.pop()!;
      comp.push(v);
      const r = (v / cols) | 0, c = v % cols;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const u = nr * cols + nc;
        if (s[u] && compOf[u] < 0) { compOf[u] = compOf[i]; stack.push(u); }
      }
    }
    comps.push(comp);
  }
  if (comps.length > 1) {
    // largest comp stays; attach each smaller comp by turning on the cell path to it (simple: union by turning a random cell of the comp's neighbors on and re-flood — cheap approach: just enable the comp and its 1-cell neighborhoods until merged)
    const keep = comps.reduce((a, b) => (b.length > a.length ? b : a));
    const keepSet = new Set(keep);
    for (const comp of comps) {
      if (comp === keep) continue;
      for (const v of comp) s[v] = 1;
      // bridge cells between this comp and keepSet: turn on orthogonal neighbors of comp cells adjacent to keepSet
      for (const v of comp) {
        const r = (v / cols) | 0, c = v % cols;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const u = nr * cols + nc;
          if (keepSet.has(u)) { s[v] = 1; break; }
        }
      }
    }
    // re-flood: everything is one comp now IF bridges worked; simple check
    s = s; // (verified below via boundary check; scatter retry handles failures)
  }

  // fill holes: any zero-region not touching the outer border becomes 1
  const outside = new Uint8Array(N);
  const stack: number[] = [];
  for (let c = 0; c < cols; c++) { if (!s[c]) { outside[c] = 1; stack.push(c); } const b = (rows - 1) * cols + c; if (!s[b]) { outside[b] = 1; stack.push(b); } }
  for (let r = 0; r < rows; r++) { const l = r * cols; if (!s[l]) { outside[l] = 1; stack.push(l); } const rr = r * cols + cols - 1; if (!s[rr]) { outside[rr] = 1; stack.push(rr); } }
  while (stack.length) {
    const v = stack.pop()!;
    const r = (v / cols) | 0, c = v % cols;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const u = nr * cols + nc;
      if (!s[u] && !outside[u]) { outside[u] = 1; stack.push(u); }
    }
  }
  for (let i = 0; i < N; i++) if (!s[i] && !outside[i]) s[i] = 1; // hole → fill

  // after repairs re-check S connectivity (bridge step may have failed on isolated comps)
  {
    const seen = new Uint8Array(N);
    const start = s.findIndex(x => x === 1);
    if (start < 0) return null;
    const st = [start];
    seen[start] = 1;
    let cnt = 1;
    while (st.length) {
      const v = st.pop()!;
      const r = (v / cols) | 0, c = v % cols;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const u = nr * cols + nc;
        if (s[u] && !seen[u]) { seen[u] = 1; cnt++; st.push(u); }
      }
    }
    let total = 0;
    for (let i = 0; i < N; i++) total += s[i];
    if (cnt !== total) return null; // disconnected — retry scatter
  }

  // boundary edges: edge with exactly one side in S
  const sol = new Uint8Array(edgeCount(rows, cols));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const inS = s[r * cols + c];
      // top edge: side above is outside the grid (treated as not-in-S)
      const above = r > 0 ? s[(r - 1) * cols + c] : 0;
      if (inS !== above) sol[hIdx(rows, cols, r, c)] = 1;
      const left = c > 0 ? s[r * cols + c - 1] : 0;
      if (inS !== left) sol[vIdx(rows, cols, r, c)] = 1;
      if (c === cols - 1 && inS !== 0) sol[vIdx(rows, cols, r, c + 1)] = 1;
      if (r === rows - 1 && inS !== 0) sol[hIdx(rows, cols, r + 1, c)] = 1;
    }
  }
  // NOTE: right/bottom edges between two in-S cells are not boundary — covered:
  // vertical edge (r, c+1) for c<cols-1 handled when processing cell (r, c+1) left side.
  let len = 0;
  for (let i = 0; i < sol.length; i++) len += sol[i];
  if (len < minLen) return null;
  // sanity: every vertex has degree 0 or 2
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      let d = 0;
      if (c < cols) d += sol[hIdx(rows, cols, r, c)];
      if (c > 0) d += sol[hIdx(rows, cols, r, c - 1)];
      if (r < rows) d += sol[vIdx(rows, cols, r, c)];
      if (r > 0) d += sol[vIdx(rows, cols, r - 1, c)];
      if (d !== 0 && d !== 2) return null;
    }
  }
  return sol;
}

// ── Uniqueness solver (cell-ordered DFS + vertex-completeness pruning) ──────
export function countSolutions(puzzle: SlitherPuzzle, limit = 2): { count: number; first: Uint8Array | null } {
  const { rows, cols, clues } = puzzle;
  const E = edgeCount(rows, cols);
  const sol = new Int8Array(E).fill(-1); // -1 undecided, 0/1 decided
  const vdeg = new Int16Array((rows + 1) * (cols + 1));
  let count = 0;
  let first: Uint8Array | null = null;

  const cellTop = (r: number, c: number) => hIdx(rows, cols, r, c);
  const cellBottom = (r: number, c: number) => hIdx(rows, cols, r + 1, c);
  const cellLeft = (r: number, c: number) => vIdx(rows, cols, r, c);
  const cellRight = (r: number, c: number) => vIdx(rows, cols, r, c + 1);

  // combos: for each clue value, list of 4-bit masks (bit order: top,bottom,left,right)
  const combosFor = (clue: number): number[] => {
    const out: number[] = [];
    for (let m = 0; m < 16; m++) {
      let bits = 0;
      for (let b = 0; b < 4; b++) if (m & (1 << b)) bits++;
      if (bits === clue) out.push(m);
    }
    return out;
  };

  // apply a cell's combo: PHASE 1 pure consistency check (no side effects),
  // PHASE 2 assign; on any failure state is fully restored.
  const applyCell = (r: number, c: number, mask: number): { introduced: number[] } | null => {
    const eIdx = [cellTop(r, c), cellBottom(r, c), cellLeft(r, c), cellRight(r, c)];
    // phase 1: all already-decided edges must match the mask
    for (let b = 0; b < 4; b++) {
      const want = (mask >> b) & 1;
      const ei = eIdx[b];
      if (sol[ei] !== -1 && sol[ei] !== want) return null;
    }
    // phase 2: assign undecided edges (track every edge we introduce)
    const introduced: number[] = [];
    for (let b = 0; b < 4; b++) {
      const want = (mask >> b) & 1;
      const ei = eIdx[b];
      if (sol[ei] === -1) { sol[ei] = want; introduced.push(ei); }
    }
    // vertex degree updates (4 corners of the cell) — ONLY for edges valued 1
    const verts = [r * (cols + 1) + c, r * (cols + 1) + c + 1, (r + 1) * (cols + 1) + c, (r + 1) * (cols + 1) + c + 1];
    let degreeFailed = false;
    for (const ei of introduced) {
      if (sol[ei] !== 1) continue;
      if (ei < (rows + 1) * cols) { const rr = (ei / cols) | 0, cc = ei % cols; vdeg[rr * (cols + 1) + cc]++; vdeg[rr * (cols + 1) + cc + 1]++; }
      else { const i2 = ei - (rows + 1) * cols; const rr = (i2 / (cols + 1)) | 0, cc = i2 % (cols + 1); vdeg[rr * (cols + 1) + cc]++; vdeg[(rr + 1) * (cols + 1) + cc]++; }
    }
    for (const v of verts) if (vdeg[v] > 2) { degreeFailed = true; break; }
    if (degreeFailed) {
      for (const ei of introduced) {
        if (sol[ei] !== 1) { sol[ei] = -1; continue; }
        if (ei < (rows + 1) * cols) { const rr = (ei / cols) | 0, cc = ei % cols; vdeg[rr * (cols + 1) + cc]--; vdeg[rr * (cols + 1) + cc + 1]--; }
        else { const i2 = ei - (rows + 1) * cols; const rr = (i2 / (cols + 1)) | 0, cc = i2 % (cols + 1); vdeg[rr * (cols + 1) + cc]--; vdeg[(rr + 1) * (cols + 1) + cc]--; }
        sol[ei] = -1;
      }
      return null;
    }
    return { introduced };
  };

  const undoCell = (applied: { introduced: number[] } | null, r: number, c: number, mask: number) => {
    if (!applied) return;
    const eIdx = [cellTop(r, c), cellBottom(r, c), cellLeft(r, c), cellRight(r, c)];
    const introducedSet = new Set(applied.introduced);
    for (const ei of applied.introduced) {
      if (sol[ei] !== 1) { if (introducedSet.has(ei)) sol[ei] = -1; continue; }
      if (ei < (rows + 1) * cols) { const rr = (ei / cols) | 0, cc = ei % cols; vdeg[rr * (cols + 1) + cc]--; vdeg[rr * (cols + 1) + cc + 1]--; }
      else { const i2 = ei - (rows + 1) * cols; const rr = (i2 / (cols + 1)) | 0, cc = i2 % (cols + 1); vdeg[rr * (cols + 1) + cc]--; vdeg[(rr + 1) * (cols + 1) + cc]--; }
    }
    for (let b = 0; b < 4; b++) {
      const ei = eIdx[b];
      if (introducedSet.has(ei)) sol[ei] = -1;
    }
  };

  // final: all edges decided, vertex degrees ∈ {0,2}, single loop (connected)
  const finalize = (): boolean => {
    for (let v = 0; v < vdeg.length; v++) if (vdeg[v] !== 0 && vdeg[v] !== 2) return false;
    // connectivity of used edges
    const par = new Map<number, number>();
    const find = (x: number): number => {
      if (!par.has(x)) par.set(x, x);
      let r = x;
      while (par.get(r) !== r) r = par.get(r)!;
      par.set(x, r);
      return r;
    };
    let firstDot = -1;
    let usedAny = false;
    for (let ei = 0; ei < E; ei++) {
      if (sol[ei] !== 1) continue;
      usedAny = true;
      let a: number, b: number;
      if (ei < (rows + 1) * cols) { const r = (ei / cols) | 0, c = ei % cols; a = r * (cols + 1) + c; b = r * (cols + 1) + c + 1; }
      else { const i2 = ei - (rows + 1) * cols; const r = (i2 / (cols + 1)) | 0, c = i2 % (cols + 1); a = r * (cols + 1) + c; b = (r + 1) * (cols + 1) + c; }
      const ra = find(a), rb = find(b);
      if (ra !== rb) par.set(ra, rb);
      if (firstDot < 0) firstDot = a;
    }
    if (!usedAny) return false;
    const root = find(firstDot);
    for (let ei = 0; ei < E; ei++) {
      if (sol[ei] !== 1) continue;
      let a: number, b: number;
      if (ei < (rows + 1) * cols) { const r = (ei / cols) | 0, c = ei % cols; a = r * (cols + 1) + c; b = r * (cols + 1) + c + 1; }
      else { const i2 = ei - (rows + 1) * cols; const r = (i2 / (cols + 1)) | 0, c = i2 % (cols + 1); a = r * (cols + 1) + c; b = (r + 1) * (cols + 1) + c; }
      if (find(a) !== root || find(b) !== root) return false;
    }
    return true;
  };

  // DFS over cells in row-major order
  const cellCombos: number[][] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cellCombos.push(combosFor(clues[r * cols + c]));

  const rec = (ci: number): boolean => {
    if (count >= limit) return true;
    if (ci === rows * cols) {
      if (finalize()) {
        count++;
        if (count === 1) first = Uint8Array.from(sol, x => (x === 1 ? 1 : 0));
      }
      return count >= limit;
    }
    const r = (ci / cols) | 0, c = ci % cols;
    for (const mask of cellCombos[ci]) {
      const applied = applyCell(r, c, mask);
      if (!applied) continue;
      // vertex (r,c) completeness: its 4 edges belong to cells (r-1,c-1),(r-1,c),(r,c-1),(r,c) — all decided now
      const v = r * (cols + 1) + c;
      if (vdeg[v] !== 0 && vdeg[v] !== 2) { undoCell(applied, r, c, mask); continue; }
      // corner vertices on right/bottom edges get checked at their own cells
      rec(ci + 1);
      undoCell(applied, r, c, mask);
      if (count >= limit) return true;
    }
    return false;
  };

  rec(0);
  return { count, first };
}

export function hintLookup(puzzle: SlitherPuzzle, edgeIdx: number): number {
  return puzzle.solution[edgeIdx];
}

export function validate(puzzle: SlitherPuzzle, edges: Uint8Array): { ok: boolean; errors: string[] } {
  const { rows, cols, clues } = puzzle;
  const errors: string[] = [];
  // degrees
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      let d = 0;
      if (c < cols) d += edges[hIdx(rows, cols, r, c)];
      if (c > 0) d += edges[hIdx(rows, cols, r, c - 1)];
      if (r < rows) d += edges[vIdx(rows, cols, r, c)];
      if (r > 0) d += edges[vIdx(rows, cols, r - 1, c)];
      if (d !== 0 && d !== 2) errors.push(`Vertex (${r},${c}) has degree ${d}`);
    }
  }
  // clues
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ci = r * cols + c;
      if (clues[ci] < 0) continue;
      const sum = cellEdges(rows, cols, r, c).reduce((a, ei) => a + edges[ei], 0);
      if (sum !== clues[ci]) errors.push(`Cell (${r},${c}) has ${sum} loop edges, needs ${clues[ci]}`);
    }
  }
  // single loop: all used edges connected
  const E = edgeCount(rows, cols);
  const used: number[] = [];
  for (let i = 0; i < E; i++) if (edges[i]) used.push(i);
  if (!used.length) errors.push('Loop is empty');
  else {
    const dot = (ei: number): [number, number] => {
      if (ei < (rows + 1) * cols) { const r = (ei / cols) | 0, c = ei % cols; return [r, c]; }
      const i2 = ei - (rows + 1) * cols;
      return [(i2 / (cols + 1)) | 0, i2 % (cols + 1)];
    };
    const id = (r: number, c: number) => r * (cols + 1) + c;
    const par = new Map<number, number>();
    const find = (x: number): number => {
      if (!par.has(x)) par.set(x, x);
      let r = x;
      while (par.get(r) !== r) r = par.get(r)!;
      par.set(x, r);
      return r;
    };
    for (const ei of used) {
      const [r, c] = dot(ei);
      let b: [number, number];
      if (ei < (rows + 1) * cols) b = [r, c + 1];
      else b = [r + 1, c];
      const ra = find(id(r, c)), rb = find(id(b[0], b[1]));
      if (ra !== rb) par.set(ra, rb);
    }
    const [r0, c0] = dot(used[0]);
    const root = find(id(r0, c0));
    for (const ei of used) {
      const [r, c] = dot(ei);
      if (find(id(r, c)) !== root) { errors.push('Loop is not connected (multiple loops)'); break; }
    }
  }
  return { ok: errors.length === 0, errors };
}

// ── Generate ────────────────────────────────────────────────────────────────
export function generate(rows: number, cols: number, difficulty: SlitherPuzzle['difficulty'], seed = Date.now()): SlitherPuzzle {
  let s = (seed >>> 0) || 1;
  const rng = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  const minLen = difficulty === 'easy' ? Math.max(10, ((rows + cols))) : difficulty === 'medium' ? Math.max(16, ((rows + cols) * 3) / 2) : Math.max(22, rows + cols * 2);

  for (let attempt = 0; attempt < 300; attempt++) {
    const sol = makeLoop(rows, cols, rng, minLen);
    if (!sol) continue;
    // clues: full grid
    const clues = new Int8Array(rows * cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sum = cellEdges(rows, cols, r, c).reduce((a, ei) => a + sol[ei], 0);
        clues[r * cols + c] = sum;
      }
    }
    const puzzle: SlitherPuzzle = {
      id: `slither-${rows}x${cols}-${difficulty}-${seed}-${attempt}`,
      rows, cols, clues, solution: sol, loopLen: sol.reduce((a, v) => a + v, 0), difficulty,
    };
    const check = countSolutions(puzzle);
    if (check.count === 1) return puzzle;
  }
  throw new Error(`slither gen failed: ${rows}x${cols} ${difficulty} seed=${seed}`);
}
