#!/usr/bin/env node
// Stamps dist/sw.js CACHE_VERSION with the git short hash (+ -dirty) — same identity as
// gen-build-info.mjs. Runs AFTER astro build, BEFORE fix-sitemap. Edits dist only, never public/.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const target = 'dist/sw.js';
const MARKER = "const CACHE_VERSION = 'dev';";

let src;
try {
  src = readFileSync(target, 'utf8');
} catch {
  console.error('stamp-sw: FAIL — dist/sw.js not found (astro build ran?)');
  process.exit(1);
}
if (!src.includes(MARKER)) {
  console.error('stamp-sw: FAIL — CACHE_VERSION marker not found in dist/sw.js (file changed upstream?)');
  process.exit(1);
}
const hash = execSync('git rev-parse --short HEAD').toString().trim();
const dirty = execSync('git status --porcelain').toString().trim().length > 0;
const version = dirty ? `${hash}-dirty` : hash;
writeFileSync(target, src.replace(MARKER, `const CACHE_VERSION = '${version}';`));
console.log(`stamp-sw: CACHE_VERSION='${version}'`);
