/* GridPaw Nonogram Solver — two-color (black & white) line solver + limited search.
 * Pure client-side. Exposes window.NonogramSolver in the browser, module.exports under Node.
 *
 * Architecture:
 *   parseClueLine — clue text -> int[] (validated)
 *   deduceLine    — placement enumeration for one line (pure; 20k-trial cross-checked)
 *   solve         — dirty-queue propagation + MRV backtracking, multi-solution detection */
(function () {
  'use strict';

  /* Parse one clue line like "2 1 3" / "2,1,3" / "0" into [2,1,3] / [].
   * Returns { clues: [...] } or { error: '...' }. */
  function parseClueLine(text, lineLen) {
    var t = (text || '').trim().toLowerCase();
    if (t === '' || t === '0' || t === '-') return { clues: [] };
    var parts = t.split(/[^0-9]+/).filter(function (s) { return s.length > 0; });
    var clues = [];
    for (var i = 0; i < parts.length; i++) {
      var n = parseInt(parts[i], 10);
      if (isNaN(n) || n < 0) return { error: 'invalid number "' + parts[i] + '"' };
      if (n === 0) return { error: '0 can only be used alone to mark an empty line' };
      clues.push(n);
    }
    var total = 0;
    for (var j = 0; j < clues.length; j++) total += clues[j];
    var minLen = total + Math.max(clues.length - 1, 0);
    if (minLen > lineLen) {
      return { error: 'clues need at least ' + minLen + ' cells but the line is only ' + lineLen };
    }
    return { clues: clues };
  }

  /* Line deduction: given clues and current cell states (-1 unknown, 0 empty, 1 filled),
   * enumerate every placement consistent with the knowns.
   * Returns { canFill:[bool], canEmpty:[bool] } or null on contradiction. */
  function deduceLine(clues, cells) {
    var n = cells.length;
    var canFill = new Array(n);
    var canEmpty = new Array(n);
    var i;
    for (i = 0; i < n; i++) { canFill[i] = false; canEmpty[i] = false; }
    var k = clues.length;
    var any = false;
    var assign = new Array(n);

    function leaf(pos) {
      var j;
      for (j = pos; j < n; j++) if (cells[j] === 1) return;
      for (j = pos; j < n; j++) assign[j] = 0;
      for (j = 0; j < n; j++) {
        if (assign[j] === 1) canFill[j] = true; else canEmpty[j] = true;
      }
      any = true;
    }

    function rec(bi, pos) {
      if (bi === k) { leaf(pos); return; }
      var total = 0, m;
      for (m = bi; m < k; m++) total += clues[m];
      total += (k - 1 - bi); /* separators */
      var maxStart = n - total;
      var len = clues[bi];
      var s, j, ok;
      for (s = pos; s <= maxStart; s++) {
        ok = true;
        for (j = pos; j < s; j++) { if (cells[j] === 1) { ok = false; break; } }
        if (!ok) continue;
        for (j = s; j < s + len; j++) { if (cells[j] === 0) { ok = false; break; } }
        if (!ok) continue;
        for (j = pos; j < s; j++) assign[j] = 0;
        for (j = s; j < s + len; j++) assign[j] = 1;
        if (s + len < n) {
          if (cells[s + len] === 1) continue; /* separator must be empty — reject if known filled */
          assign[s + len] = 0;
        }
        rec(bi + 1, s + len + 1);
      }
    }

    if (k === 0) {
      for (i = 0; i < n; i++) if (cells[i] === 1) return null;
      for (i = 0; i < n; i++) canEmpty[i] = true;
      return { canFill: canFill, canEmpty: canEmpty };
    }
    rec(0, 0);
    if (!any) return null;
    return { canFill: canFill, canEmpty: canEmpty };
  }

  /* Full solve. rowClues[R], colClues[C]; each entry an array of ints.
   * Returns { status, grid?, multiple?, guessed?, reason? }
   *   status: 'solved' | 'contradiction' | 'timeout'
   *   grid: R×C of 0/1 (0 = white/empty, 1 = black/filled)
   *   multiple: true if a second distinct solution exists
   *   guessed: true if pure line logic stalled and search was needed */
  function solve(rowClues, colClues) {
    var R = rowClues.length, C = colClues.length;
    var g = [];
    var r, c;
    for (r = 0; r < R; r++) { g.push([]); for (c = 0; c < C; c++) g[r].push(-1); }
    var nodes = 0, NODE_CAP = 2000000;
    var deadline = Date.now() + 5000; /* wall-clock guard: pathological clue sets stop honestly */
    var timedOut = false;
    var sols = [];
    var rowUnknown = new Array(R), colUnknown = new Array(C);
    for (r = 0; r < R; r++) rowUnknown[r] = C;
    for (c = 0; c < C; c++) colUnknown[c] = R;
    var rowDirty = [], colDirty = [];
    for (r = 0; r < R; r++) rowDirty.push(true);
    for (c = 0; c < C; c++) colDirty.push(true);

    function setCell(i, j, v) {
      g[i][j] = v;
      rowUnknown[i]--; colUnknown[j]--;
    }

    /* Dirty-queue propagation: only re-derive lines that (may have) changed.
     * One full rows+cols sweep per wave; a wave that sets nothing ends the loop. */
    function propagate() {
      var guard = true;
      var i, j, i2, res, line;
      while (guard) {
        guard = false;
        for (i = 0; i < R; i++) {
          if (!rowDirty[i]) continue;
          rowDirty[i] = false;
          res = deduceLine(rowClues[i], g[i]);
          if (!res) return false;
          for (j = 0; j < C; j++) {
            if (g[i][j] !== -1) continue;
            if (!res.canFill[j] && !res.canEmpty[j]) return false;
            if (!res.canEmpty[j]) { setCell(i, j, 1); colDirty[j] = true; guard = true; }
            else if (!res.canFill[j]) { setCell(i, j, 0); colDirty[j] = true; guard = true; }
          }
        }
        for (j = 0; j < C; j++) {
          if (!colDirty[j]) continue;
          colDirty[j] = false;
          line = [];
          for (i2 = 0; i2 < R; i2++) line.push(g[i2][j]);
          res = deduceLine(colClues[j], line);
          if (!res) return false;
          for (i2 = 0; i2 < R; i2++) {
            if (g[i2][j] !== -1) continue;
            if (!res.canFill[i2] && !res.canEmpty[i2]) return false;
            if (!res.canEmpty[i2]) { setCell(i2, j, 1); rowDirty[i2] = true; guard = true; }
            else if (!res.canFill[i2]) { setCell(i2, j, 0); rowDirty[i2] = true; guard = true; }
          }
        }
      }
      return true;
    }

    /* MRV-ish: pick the unknown cell whose row+col hold the fewest unknowns together —
     * the most constrained intersection fails (or forces) fastest. */
    function findUnknown() {
      var best = null, bestScore = Infinity, score;
      var i, j;
      for (i = 0; i < R; i++) {
        if (rowUnknown[i] === 0) continue;
        for (j = 0; j < C; j++) {
          if (g[i][j] !== -1) continue;
          score = rowUnknown[i] + colUnknown[j];
          if (score < bestScore) { bestScore = score; best = [i, j]; }
        }
      }
      return best;
    }

    function search() {
      if (sols.length >= 2) return;
      if (++nodes > NODE_CAP || ((nodes & 31) === 0 && Date.now() > deadline)) { timedOut = true; return; }
      var t = findUnknown();
      if (!t) { sols.push(g.map(function (row) { return row.slice(); })); return; }
      var v, snap;
      for (v = 1; v >= 0; v--) {
        snap = g.map(function (row) { return row.slice(); });
        var ru = rowUnknown.slice(), cu = colUnknown.slice();
        var rd = rowDirty.slice(), cd = colDirty.slice();
        setCell(t[0], t[1], v);
        rowDirty[t[0]] = true; colDirty[t[1]] = true;
        if (propagate()) search();
        g = snap; rowUnknown = ru; colUnknown = cu; rowDirty = rd; colDirty = cd;
        if (timedOut || sols.length >= 2) return;
      }
    }

    if (!propagate()) return { status: 'contradiction' };
    if (!findUnknown()) return { status: 'solved', grid: g, multiple: false, guessed: false };
    search();
    if (timedOut) return { status: 'timeout' };
    if (sols.length === 0) return { status: 'contradiction' };
    return {
      status: 'solved',
      grid: sols[0],
      multiple: sols.length > 1,
      guessed: true
    };
  }

  var api = { parseClueLine: parseClueLine, deduceLine: deduceLine, solve: solve };
  if (typeof window !== 'undefined') window.NonogramSolver = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
