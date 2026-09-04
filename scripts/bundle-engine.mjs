/**
 * Post-build: compile puzzle engines to standalone JS for <script is:inline> loading.
 * Compiles both Shikaku (puzzle-engine.ts) and Akari (akari-engine.ts).
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';

const esbuildPath = resolve('./node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js');
const esbuild = await import(esbuildPath);

function compileEngine(srcPath, outName) {
  const src = readFileSync(resolve(srcPath), 'utf-8');
  const result = esbuild.transformSync(src, {
    loader: 'ts',
    format: 'esm',
    target: 'es2020',
  });

  let code = result.code.replace(/^export /gm, '');
  code = code.replace(/^\{\n(?:\s+\w+,?\n)+\};?\s*$/gm, '');

  const publicFile = resolve('./public/' + outName);
  writeFileSync(publicFile, code);
  console.log('[bundle-engine] ' + srcPath + ' -> public/' + outName + ' (' + code.length + ' chars)');

  const distFile = resolve('./dist/' + outName);
  if (existsSync(resolve('./dist'))) {
    copyFileSync(publicFile, distFile);
    console.log('[bundle-engine] Copied to dist/' + outName);
  }
}

compileEngine('./src/lib/puzzle-engine.ts', 'puzzle-engine.js');
compileEngine('./src/lib/akari-engine.ts', 'akari-engine.js');
