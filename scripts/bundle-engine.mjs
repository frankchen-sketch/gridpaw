/**
 * Post-build: compile puzzle-engine.ts to standalone JS for <script is:inline> loading.
 * Modeled after meowtrail's bundle-engine.mjs.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';

const esbuildPath = resolve('./node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js');
const esbuild = await import(esbuildPath);

const src = readFileSync(resolve('./src/lib/puzzle-engine.ts'), 'utf-8');
const result = esbuild.transformSync(src, {
  loader: 'ts',
  format: 'esm',
  target: 'es2020',
});

// Remove export keywords (make functions global for <script src> loading)
let code = result.code.replace(/^export /gm, '');
// Remove orphaned export block: { \n  fn1,\n  fn2\n};
code = code.replace(/^\{\n(?:\s+\w+,?\n)+\};?\s*$/gm, '');

writeFileSync(resolve('./public/puzzle-engine.js'), code);
console.log('[bundle-engine] Compiled puzzle-engine.ts → public/puzzle-engine.js (' + code.length + ' chars)');

// Copy to dist if it exists
const distFile = resolve('./dist/puzzle-engine.js');
if (existsSync(resolve('./dist'))) {
  copyFileSync(resolve('./public/puzzle-engine.js'), distFile);
  console.log('[bundle-engine] Copied to dist/puzzle-engine.js');
}
