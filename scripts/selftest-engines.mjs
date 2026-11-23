#!/usr/bin/env node
/**
 * Runs the engine self-tests — the ones that guard puzzle geometry, solvability
 * and the "edge model is live" properties. Until 2026-11-19 nothing called them:
 * five files in scripts/ that no build, deploy or hook referenced, which is the
 * same rot that let furriq's verify-production-surface go four months unrun.
 *
 * Two tiers because the cost differs by three orders of magnitude (measured
 * 2026-11-19 on the mini):
 *
 *   fast  nonogram   49ms | akari     154ms   → safe on every build
 *   slow  kakuro  173000ms | nurikabe 31000ms | tracks 20000ms → deploy only
 *
 * kakuro is slow by construction (it generates puzzles against an 8s budget per
 * attempt), so it belongs at the deploy gate, not in the dev loop.
 *
 * Usage:
 *   node scripts/selftest-engines.mjs           # fast tier (build)
 *   node scripts/selftest-engines.mjs --all     # all five (deploy gate)
 *   node scripts/selftest-engines.mjs --slow    # slow tier only
 *
 * Note: selftest-{kakuro,nonogram,nurikabe}.mjs read the *published* bundles in
 * public/*.js, so they must run after `bundle-engine.mjs`. akari/tracks bundle
 * from src/ with esbuild and pin `esbuild@0.25.12` in the pnpm store — if that
 * path disappears after a dependency bump, the runner says so instead of dying
 * with an opaque module-not-found.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const FAST = [
  { file: 'selftest-nonogram.mjs', name: 'nonogram', reads: 'public' },
  { file: 'akari-room-selftest.mjs', name: 'akari', reads: 'src' },
  { file: 'selftest-gradient.mjs', name: 'gradient', reads: 'public' },
];

const SLOW = [
  { file: 'selftest-kakuro.mjs', name: 'kakuro', reads: 'public' },
  { file: 'selftest-nurikabe.mjs', name: 'nurikabe', reads: 'public' },
  { file: 'selftest-tracks.mjs', name: 'tracks', reads: 'src' },
];

const EBS_BUILD = join(
  root,
  'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js'
);

const args = new Set(process.argv.slice(2));
const wantAll = args.has('--all');
const onlySlow = args.has('--slow');
const onlyFast = args.has('--fast') || (!wantAll && !onlySlow);

const suite = wantAll ? [...FAST, ...SLOW] : onlySlow ? SLOW : FAST;
if (!wantAll && !onlySlow && !onlyFast) {
  console.error('selftest-engines: unknown flag');
  process.exit(2);
}

console.log(
  `selftest-engines: ${suite.length} suite(s) — ${suite.map((s) => s.name).join(', ')}`
);

let failed = 0;
for (const { file, name, reads } of suite) {
  const script = join(root, 'scripts', file);
  if (!existsSync(script)) {
    console.error(`✗ ${name}: ${file} missing`);
    failed++;
    continue;
  }
  if (reads === 'src' && !existsSync(EBS_BUILD)) {
    console.error(
      `✗ ${name}: esbuild pin not found (${EBS_BUILD}).\n` +
        '  This suite imports esbuild@0.25.12 by exact pnpm path; a dependency\n' +
        '  bump moved it. Re-pin in scripts/' + file + ' or load esbuild by name.'
    );
    failed++;
    continue;
  }
  const started = Date.now();
  try {
    execFileSync(process.execPath, [script], { cwd: root, stdio: 'inherit' });
    console.log(`✓ ${name} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  } catch {
    console.error(`✗ ${name} FAILED (${((Date.now() - started) / 1000).toFixed(1)}s)`);
    failed++;
  }
}

if (failed) {
  console.error(`selftest-engines: ${failed} suite(s) failed`);
  process.exit(1);
}
console.log(`selftest-engines: all ${suite.length} suite(s) green`);
