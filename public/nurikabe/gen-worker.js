/* Nurikabe generator worker — off-main-thread puzzle generation.
 * The engine is a plain script (top-level const/function — export-stripped by
 * the build), so importScripts exposes generateNurikabePuzzle here. Medium 7×7
 * and Hard 9×9 generation can take seconds; running it here keeps the demo UI
 * (and the generation spinner) responsive.
 *
 * Mirrors public/kakuro/gen-worker.js — same protocol: the demo posts
 * { id, rows, cols, seed, timeBudgetMs, name }, we reply { id, puzzle|null }. */
importScripts('../nurikabe-engine.js?v=3');

self.onmessage = function (e) {
  var msg = e.data;
  var p = null;
  var tries = 0;
  while (!p && tries < 6) {
    p = generateNurikabePuzzle({
      rows: msg.rows,
      cols: msg.cols,
      seed: msg.seed,
      timeBudgetMs: msg.timeBudgetMs || 20000,
      name: msg.name
    });
    tries++;
  }
  self.postMessage({
    id: msg.id,
    puzzle: p
      ? {
          rows: p.rows,
          cols: p.cols,
          clues: p.clues,
          solution: p.solution,
          name: p.name,
          daily: p.daily
        }
      : null
  });
};