/** Probe: which step of star-battle generation is slow */
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
const esbuild = await import(pathToFileURL(resolve(process.cwd() + '/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js')));
const tmp = mkdtempSync(join(tmpdir(), 'sb-probe-'));
const outfile = join(tmp, 'engine.mjs');
await esbuild.build({
  entryPoints: [join(process.cwd(), 'src/lib/puzzle-core/star-battle-engine.ts')],
  bundle: true, format: 'esm', target: 'es2020', outfile,
});
const eng = await import(pathToFileURL(outfile).href);

for (const [size, K] of [[7, 2], [8, 2], [10, 3]]) {
  const t0 = performance.now();
  let layoutOk = 0, regionOk = 0, regionFail = 0;
  for (let k = 0; k < 5; k++) {
    let s = (4100 + size * 71 + k * 11) >>> 0;
    const rng = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    const stars = eng.makeStarLayout(size, K, rng);
    if (!stars) { console.log(`${size}x${size}x${K} #${k}: layout FAIL`); continue; }
    layoutOk++;
    const t1 = performance.now();
    const regions = eng.makeRegions(size, K, stars, rng);
    if (regions) regionOk++; else regionFail++;
    if (k === 0) console.log(`  ${size}x${size}x${K} #0: layout ${(t1 - t0).toFixed(0)}ms, regions ${(performance.now() - t1).toFixed(0)}ms`);
  }
  console.log(`${size}x${size}x${K}: layout ${layoutOk}/5, regions ok=${regionOk} fail=${regionFail}, total ${(performance.now() - t0).toFixed(0)}ms`);
}
