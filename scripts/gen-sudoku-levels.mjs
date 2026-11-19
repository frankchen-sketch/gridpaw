#!/usr/bin/env node
/**
 * 构建期预生成大格数独关卡（契约 docs/sudoku-cluster-contract.md 第四节）
 *
 * 产出 src/data/sudoku-levels.json，格式：
 *   { "<route>": [ { id, size, blockW, blockH, symbols, givens, solution, difficulty }, ... ] }
 *   6 个路由 × 12 盘（easy / medium / hard / expert 各 3 盘）。
 *
 * 为什么放构建期：16×16 / 25×25 的「唯一解」生成在浏览器里是秒级开销，
 * 玩家点开页面不该等；与 meowdoku 的静态 levels.json 同一套路——构建期算一次，页面直接读。
 *
 * 引擎未落地时（卡1 的 src/lib/puzzle-core/sudoku-engine.ts 与本卡并行开发）：
 * 打印「引擎未就绪，跳过生成」并 exit 0，不阻断构建。
 *
 * 用法：
 *   node scripts/gen-sudoku-levels.mjs
 *   node scripts/gen-sudoku-levels.mjs --only=/hexadoku/         # 只跑一页，调试用
 *   node scripts/gen-sudoku-levels.mjs --engine=scratch/x.ts     # 换引擎跑（卡1 验收入口）
 *   node scripts/gen-sudoku-levels.mjs --out=scratch/x.json      # 换输出路径，不碰 src/data
 *
 * 种子由 route+difficulty+序号 稳定哈希得出：引擎不变则输出逐字节不变，
 * 重复 build 不会产生脏 diff（这份 json 可以入库，也可只作为构建物）。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_ENGINE = 'src/lib/puzzle-core/sudoku-engine.ts';
const DEFAULT_OUT = 'src/data/sudoku-levels.json';

// ── 页面清单（与契约第二节的表逐行对应）────────────────────────────────────
// size / blockW / blockH 必须与页面自己调 SudokuEngine.generate() 的参数一致，
// 否则静态盘与运行时盘的符号集对不上。
// sudoku-with-letters 用 9×3×3：页面 SudokuPlay 传的是 size=9 + letterMode=true，
// 字母 A–I 由页面把 1..9 映射显示，不改引擎符号表（引擎 9×9 原生就是 1..9）。
const PAGES = [
  { route: '/16x16-sudoku/', size: 16, blockW: 4, blockH: 4, timeBudgetMs: 8000 },
  { route: '/mega-sudoku/', size: 16, blockW: 4, blockH: 4, timeBudgetMs: 8000 },
  { route: '/hexadoku/', size: 16, blockW: 4, blockH: 4, timeBudgetMs: 8000 },
  { route: '/12x12-sudoku/', size: 12, blockW: 4, blockH: 3, timeBudgetMs: 4000 },
  { route: '/25x25-sudoku/', size: 25, blockW: 5, blockH: 5, timeBudgetMs: 15000 },
  { route: '/sudoku-with-letters/', size: 9, blockW: 3, blockH: 3, timeBudgetMs: 4000 },
];

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];
const PER_DIFFICULTY = 3;

// 契约第一节的固定符号集；引擎没返回 symbols 时兜底
function defaultSymbols(size) {
  const digits = '123456789ABCDEFGHIJKLMNOP';
  if (size === 16) return [...'0123456789ABCDEF'];
  if (size === 25) return [...digits.slice(0, 25)];
  return [...digits.slice(0, size)];
}

// ── CLI ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const argOf = (name, fallback) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const eq = hit.indexOf('=');
  return eq === -1 ? true : hit.slice(eq + 1);
};
const abs = (p) => (isAbsolute(p) ? p : resolve(ROOT, p));

const enginePath = abs(argOf('engine', DEFAULT_ENGINE));
const outArg = argOf('out', null);
const outPath = abs(outArg ?? DEFAULT_OUT);
const only = argOf('only', null);
const verbose = Boolean(argOf('verbose', false));

// --only 只用于调试：不给 --out 就会把完整 json 覆盖成单页，直接拦住
if (only && !outArg) {
  console.error('[sudoku-levels] --only 必须同时给 --out=<文件>，否则会把完整关卡表覆盖成单页。');
  process.exit(1);
}

// ── 引擎加载 ─────────────────────────────────────────────────────────────
// 两条路：优先 esbuild（能处理 TS 语法 + 相对 import，仓库里 astro 依赖已带），
// 退路是 Node 原生 TS 剥离（Node ≥ 22.18 默认开启，只能处理「可擦除语法」）。
async function loadEsbuild() {
  const tried = [];
  const candidates = ['esbuild'];
  const pnpmDir = resolve(ROOT, 'node_modules/.pnpm');
  if (existsSync(pnpmDir)) {
    for (const name of readdirSync(pnpmDir).filter((n) => n.startsWith('esbuild@')).sort().reverse()) {
      candidates.push(resolve(pnpmDir, name, 'node_modules/esbuild/lib/main.js'));
    }
  }
  for (const c of candidates) {
    try {
      const mod = await import(c.startsWith('/') ? pathToFileURL(c).href : c);
      const esbuild = mod.default ?? mod;
      if (typeof esbuild?.build === 'function') return esbuild;
    } catch (err) {
      tried.push(`${c}: ${err.message}`);
    }
  }
  if (verbose) console.log('[sudoku-levels] esbuild 不可用，走 Node 原生 TS 剥离\n  ' + tried.join('\n  '));
  return null;
}

async function loadEngine(file) {
  const esbuild = await loadEsbuild();
  if (esbuild) {
    // bundle 成单文件后走 data: URL import，不落临时文件
    const result = await esbuild.build({
      entryPoints: [file],
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'es2020',
      write: false,
      logLevel: 'silent',
    });
    const code = result.outputFiles?.[0]?.text;
    if (!code) throw new Error('esbuild 没有产出代码');
    return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  }
  return import(pathToFileURL(file).href);
}

// ── 数据规整 ─────────────────────────────────────────────────────────────
const toInt = (v) => (typeof v === 'number' ? v : Number(v));

function normalizeGivens(raw, size) {
  const total = size * size;
  if (!raw) return [];
  // 形态 A：[[idx, val], ...]（契约）
  if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
    return raw.map(([i, v]) => [toInt(i), toInt(v)]).sort((a, b) => a[0] - b[0]);
  }
  // 形态 B：长度 size*size 的阵列，空格 = -1 / 0 / null
  if (raw.length === total) {
    const out = [];
    for (let i = 0; i < total; i++) {
      const v = toInt(raw[i]);
      if (v >= 1 && v <= size) out.push([i, v]);
    }
    return out;
  }
  throw new Error(`givens 形态不认识（length=${raw.length}, 期望 ${total} 或 [idx,val][]）`);
}

function normalizePuzzle(raw, page, difficulty) {
  if (!raw || typeof raw !== 'object') throw new Error('generate() 返回空值');
  const { size, route } = page;
  if (toInt(raw.size) !== size) throw new Error(`size=${raw.size}，期望 ${size}`);
  const solution = Array.from(raw.solution ?? []).map(toInt);
  if (solution.length !== size * size) throw new Error(`solution 长度 ${solution.length}，期望 ${size * size}`);
  for (let i = 0; i < solution.length; i++) {
    if (!(solution[i] >= 1 && solution[i] <= size)) throw new Error(`solution[${i}]=${solution[i]} 越界`);
  }
  const givens = normalizeGivens(raw.givens, size);
  if (givens.length === 0) throw new Error('givens 为空');
  for (const [i, v] of givens) {
    if (!(i >= 0 && i < size * size)) throw new Error(`givens 索引 ${i} 越界`);
    if (solution[i] !== v) throw new Error(`givens[${i}]=${v} 与 solution 不一致`);
  }
  let symbols = Array.isArray(raw.symbols) ? raw.symbols.map(String) : defaultSymbols(size);
  if (symbols.length !== size) throw new Error(`symbols 长度 ${symbols.length}，期望 ${size}`);
  return {
    id: String(raw.id ?? `sudoku-${size}-${difficulty}-${route}`),
    size,
    blockW: page.blockW,
    blockH: page.blockH,
    symbols,
    givens,
    solution,
    difficulty,
  };
}

// 稳定种子：同一 route/difficulty/序号 → 同一盘，重复 build 输出不变
function seedOf(route, difficulty, n) {
  const s = `${route}#${difficulty}#${n}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 2147483647) || 1;
}

// 每个盘一行，外层按路由缩进：diff 时一眼能看出「哪一页第几盘变了」，也不至于把 20 万字符压成一行
function serialize(levels) {
  const blocks = Object.entries(levels).map(([route, boards]) => {
    const rows = boards.map((b) => '    ' + JSON.stringify(b)).join(',\n');
    return `  ${JSON.stringify(route)}: [\n${rows}\n  ]`;
  });
  return '{\n' + blocks.join(',\n') + '\n}\n';
}
// ── 主流程 ───────────────────────────────────────────────────────────────
async function main() {
  if (only && !PAGES.some((p) => p.route === only)) {
    console.error(`[sudoku-levels] --only=${only} 不在页面清单里：${PAGES.map((p) => p.route).join(' ')}`);
    process.exit(1);
  }

  if (!existsSync(enginePath)) {
    console.log(
      `[sudoku-levels] 引擎未就绪，跳过生成：${enginePath.replace(ROOT + '/', '')} 不存在。\n` +
        '  卡1（feat/sudoku-engine）落地后重跑本脚本即生效，构建不会因此中断。\n' +
        `  注意合并顺序：页面若 import ${DEFAULT_OUT}，要先合引擎卡再合页面卡，否则 astro build 解析不到该文件。`
    );
    process.exit(0);
  }

  let mod;
  try {
    mod = await loadEngine(enginePath);
  } catch (err) {
    console.error(`[sudoku-levels] 引擎加载失败：${err.message}`);
    console.error('  若是 TS 语法超出「可擦除」范围（enum / namespace / 参数属性），需 esbuild；本机没装依赖时先在仓库根跑 pnpm install。');
    process.exit(1);
  }
  const generate = mod.generate ?? mod.default?.generate;
  if (typeof generate !== 'function') {
    console.error('[sudoku-levels] 引擎没有导出 generate()，检查契约第一节的函数签名');
    process.exit(1);
  }

  const pages = only ? PAGES.filter((p) => p.route === only) : PAGES;
  const levels = {};
  const failures = [];
  const t0 = Date.now();

  for (const page of pages) {
    const tp = Date.now();
    levels[page.route] = [];
    for (const difficulty of DIFFICULTIES) {
      for (let n = 1; n <= PER_DIFFICULTY; n++) {
        const baseSeed = seedOf(page.route, difficulty, n);
        let puzzle = null;
        let lastErr = null;
        // 同一档最多试 3 个种子：引擎内部已做唯一解重试，这里只兜底偶发的生成失败
        for (let attempt = 0; attempt < 3 && !puzzle; attempt++) {
          try {
            const raw = generate(page.size, page.blockW, page.blockH, difficulty, baseSeed + attempt * 1013, page.timeBudgetMs);
            const settled = raw && typeof raw.then === 'function' ? await raw : raw;
            puzzle = normalizePuzzle(settled, page, difficulty);
          } catch (err) {
            lastErr = err;
          }
        }
        if (puzzle) levels[page.route].push(puzzle);
        else failures.push(`${page.route} ${difficulty} #${n}（seed ${baseSeed}）：${lastErr?.message ?? '未知错误'}`);
      }
    }
    const boards = levels[page.route];
    const givens = boards.map((b) => b.givens.length);
    console.log(
      `[sudoku-levels] ${page.route.padEnd(22)} ${page.size}×${page.size} ${boards.length} 盘` +
        (givens.length ? ` givens ${Math.min(...givens)}-${Math.max(...givens)}` : '') +
        ` ${((Date.now() - tp) / 1000).toFixed(1)}s`
    );
  }

  if (failures.length) {
    console.error(`\n[sudoku-levels] ✗ ${failures.length} 盘生成失败，未写文件（半成品 json 会静默上线，所以整体失败）：`);
    for (const f of failures) console.error('  - ' + f);
    console.error('  先单独复现：node scripts/gen-sudoku-levels.mjs --only=<route>');
    process.exit(1);
  }

  const json = serialize(levels);
  const before = existsSync(outPath) ? readFileSync(outPath, 'utf8') : null;
  if (before === json) {
    console.log(`[sudoku-levels] 无变化：${outPath.replace(ROOT + '/', '')}（${(json.length / 1024).toFixed(0)} KB，${((Date.now() - t0) / 1000).toFixed(1)}s）`);
    return;
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, json);
  const total = Object.values(levels).reduce((n, b) => n + b.length, 0);
  console.log(
    `[sudoku-levels] ✓ 写入 ${outPath.replace(ROOT + '/', '')}：${Object.keys(levels).length} 页 / ${total} 盘 / ` +
      `${(json.length / 1024).toFixed(0)} KB / ${((Date.now() - t0) / 1000).toFixed(1)}s`
  );
}

await main();
