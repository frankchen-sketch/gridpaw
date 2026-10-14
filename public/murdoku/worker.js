/* Murdoku generator worker — off-main-thread puzzle generation.
 * 6×6 generation takes ~470ms per attempt plus 1–2s of retries (57% unique
 * per call), which would block the main thread and freeze the UI — so 6×6
 * always goes through here. The engine is an IIFE bundle
 * (global MurdokuEngine from /murdoku-engine.js), importScripts exposes
 * generatePuzzle here. The puzzle object carries BigInt masks
 * (standMask/atTableMask/...) — structured clone handles BigInt natively.
 */
importScripts('/murdoku-engine.js');

self.onmessage = function (e) {
  var msg = e.data;
  var N = msg.N;
  var p = null;
  var tries = 0;
  while (!p && tries < 40) {
    try { p = MurdokuEngine.generatePuzzle(N, msg.seed + tries * 7919); } catch (err) { /* null layout attempt */ }
    tries++;
  }
  self.postMessage({
    id: msg.id,
    puzzle: p
      ? {
          N: p.N,
          seed: p.seed,
          attempt: p.attempt,
          layout: p.layout,
          clues: p.clues,
          placement: p.placement
        }
      : null
  });
};
