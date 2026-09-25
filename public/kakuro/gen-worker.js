/* Kakuro generator worker — off-main-thread puzzle generation.
 * The engine is a plain script (globals after export-stripping), so
 * importScripts exposes solveKakuro/generateKakuroPuzzle here. */
importScripts('../kakuro-engine.js?v=fog2');

self.onmessage = function (e) {
  var msg = e.data;
  var p = null;
  var tries = 0;
  while (!p && tries < 6) {
    p = generateKakuroPuzzle({
      rows: msg.rows,
      cols: msg.cols,
      blackProb: msg.blackProb,
      fogBlocks: msg.fogBlocks,
      timeBudgetMs: msg.timeBudgetMs || 8000
    });
    tries++;
  }
  self.postMessage({
    id: msg.id,
    puzzle: p
      ? {
          rows: p.rows,
          cols: p.cols,
          white: p.white,
          rightSum: p.rightSum,
          downSum: p.downSum,
          solution: p.solution,
          fogSplit: p.fogSplit,
          fogAxis: p.fogAxis
        }
      : null
  });
};
