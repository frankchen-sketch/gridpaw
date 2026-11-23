var GradientEngine = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/lib/puzzle-core/gradient-engine.ts
  var gradient_engine_exports = {};
  __export(gradient_engine_exports, {
    buildTarget: () => buildTarget,
    dailyId: () => dailyId,
    generate: () => generate,
    hint: () => hint,
    isSolved: () => isSolved,
    misplacedCount: () => misplacedCount,
    swap: () => swap
  });
  function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function next() {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function dailyId(d) {
    const date = d || /* @__PURE__ */ new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function buildTarget(size, seed) {
    const rand = mulberry32(seed);
    const hueStart = 12 + Math.floor(rand() * 24);
    const hueEnd = 268 + Math.floor(rand() * 34);
    const lightTop = 74 + Math.floor(rand() * 4);
    const lightBottom = 46 + Math.floor(rand() * 5);
    const sat = 62 + Math.floor(rand() * 10);
    const out = [];
    const span = size === 1 ? 1 : size - 1;
    for (let r = 0; r < size; r++) {
      const light = lightTop + (lightBottom - lightTop) * r / span;
      for (let c = 0; c < size; c++) {
        const hue = hueStart + (hueEnd - hueStart) * c / span;
        out.push(`hsl(${Math.round(hue)} ${sat}% ${Math.round(light)}%)`);
      }
    }
    return out;
  }
  function misplacedRatio(board) {
    let wrong = 0;
    for (let i = 0; i < board.length; i++) if (board[i] !== i) wrong++;
    return wrong / board.length;
  }
  function shuffled(n, rand) {
    const order = [];
    for (let i = 0; i < n; i++) order.push(i);
    for (let attempt = 0; attempt < 40; attempt++) {
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = order[i];
        order[i] = order[j];
        order[j] = tmp;
      }
      if (misplacedRatio(order) >= 0.85) break;
    }
    if (misplacedRatio(order) === 0) {
      order.push(order.shift());
    }
    return order;
  }
  function generate(size, id) {
    const n = Math.max(3, Math.min(6, Math.floor(size) || 5));
    const seed = hash32(id);
    const target = buildTarget(n, seed);
    const board = shuffled(n * n, mulberry32(seed ^ 2654435769));
    return { id, size: n, target, board };
  }
  function isSolved(p, board) {
    const b = board || p.board;
    if (b.length !== p.target.length) return false;
    for (let i = 0; i < b.length; i++) if (b[i] !== i) return false;
    return true;
  }
  function misplacedCount(p, board) {
    const b = board || p.board;
    let wrong = 0;
    for (let i = 0; i < b.length; i++) if (b[i] !== i) wrong++;
    return wrong;
  }
  function hint(p, board) {
    const b = board || p.board;
    for (let i = 0; i < b.length; i++) {
      if (b[i] === i) continue;
      const wanted = i;
      for (let j = 0; j < b.length; j++) {
        if (j === i) continue;
        if (b[j] === wanted && b[i] !== j) return { from: i, to: j };
      }
    }
    const wrong = [];
    for (let i = 0; i < b.length; i++) if (b[i] !== i) wrong.push(i);
    if (wrong.length >= 2) return { from: wrong[0], to: wrong[1] };
    return null;
  }
  function swap(board, a, b) {
    const out = board.slice();
    const tmp = out[a];
    out[a] = out[b];
    out[b] = tmp;
    return out;
  }
  return __toCommonJS(gradient_engine_exports);
})();
