#!/usr/bin/env node
// check-indexnow-key.mjs — fail loudly if the IndexNow key file is missing from public/
//
// WHY: public/<key>.txt is deliberately NOT committed (this repo is public, and the
// IndexNow security model relies on the key being unguessable while its file is served).
// Consequence: a fresh clone has no key file, and `wrangler pages deploy dist` would
// silently ship a site that fails IndexNow verification.
//
// This turns that silent failure into a loud one at build time.
//
// Restore the key on a new machine by writing public/<key>.txt containing exactly <key>,
// where <key> is any 8-128 char hex string registered with Bing Webmaster — or copy the
// file from a machine that already has it. Run with SKIP_INDEXNOW_CHECK=1 to bypass.

import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.SKIP_INDEXNOW_CHECK === '1') {
  console.log('[check-indexnow-key] skipped (SKIP_INDEXNOW_CHECK=1)');
  process.exit(0);
}

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const pub = join(repoRoot, 'public');

let found = null;
for (const f of readdirSync(pub)) {
  if (!f.endsWith('.txt')) continue;
  const body = readFileSync(join(pub, f), 'utf8').trim();
  if (body && body === basename(f, '.txt')) { found = f; break; }
}

if (found) {
  console.log(`[check-indexnow-key] ok — public/${found}`);
  process.exit(0);
}

console.error(`
[check-indexnow-key] FAILED — no IndexNow key file in public/

Expected a file named public/<key>.txt whose content is exactly <key>
(e.g. public/a1b2c3....txt containing "a1b2c3..."). This file is gitignored
on purpose, so a fresh clone does not have it.

To fix, on this machine:
  1. Take the key from a machine that already has public/<key>.txt, or
     generate a new one: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
  2. Write it to public/<that-key>.txt (content = the key, no newline issues)
  3. Re-register/verify the key in Bing Webmaster if you generated a new one

To build without IndexNow: SKIP_INDEXNOW_CHECK=1 pnpm run build
`);
process.exit(1);