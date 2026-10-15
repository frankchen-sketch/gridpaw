#!/usr/bin/env bash
# trends_plugin.sh — 哥飞 SEO Agent 插件（ego Chrome）取谷歌趋势数据
# 用法: trends_plugin.sh "cat game, puzzle game" [range] [geo] [outfile]
#   range: today 12-m | today 3-m | today 1-m | now 7-d | today 5-y（默认 today 1-m）
#   geo:   两位国家码，默认 US
# 输出: 插件原始 JSON（data.keyword/points/top/rising）写到 outfile 或 stdout
# 特性: 零 webcafe 积分；走 ego 真浏览器，谷歌侧与手动访问无异
set -euo pipefail
WORDS="${1:?用法: trends_plugin.sh \"词1, 词2\" [range] [geo] [outfile]}"
RANGE="${2:-today 1-m}"
GEO="${3:-US}"
OUT="${4:-}"

printf '%s' "$WORDS" > /tmp/trends_words.txt; printf '%s' "$RANGE" > /tmp/trends_range.txt; printf '%s' "$GEO" > /tmp/trends_geo.txt; printf '%s' "$OUT" > /tmp/trends_out.txt
ego-browser nodejs -e '
const fs = await import("node:fs/promises");
const rd = async f => (await fs.readFile(f, "utf8")).trim();
const [words, range, geo, out] = await Promise.all(["/tmp/trends_words.txt", "/tmp/trends_range.txt", "/tmp/trends_geo.txt", "/tmp/trends_out.txt"].map(rd));
const task = await taskSpace("trends-plugin-scan");
let p;
try { p = task.page("p1"); } catch { p = null; }
if (!p) p = await task.newPage();
await p.goto("chrome-extension://aiijgdgindaagddpghocoggkkojdnbjg/sidepanel/sidepanel.html");
await p.waitForSelector("#word", { state: "visible" });
await p.fill("#word", words);
await p.selectOption("#range", range);
await p.fill("#geo", geo);
await p.click("#trendsGo");
let raw = "";
for (let i = 0; i < 30; i++) {           // 最多 150s
  await p.waitForTimeout(5000);
  raw = await p.evaluate(() => {
    const pre = document.querySelector("#results pre");
    const st = document.getElementById("trendsStatus");
    return pre ? pre.textContent : (st && !st.hidden ? "STATUS:" + st.textContent : "");
  }).catch(() => "");
  if (raw.startsWith("{")) break;
  if (raw.startsWith("STATUS:") && /限流|人机验证|验证|频繁|失败|取不到/.test(raw)) {
    console.error("PLUGIN_BLOCKED:", raw); process.exit(3);
  }
}
if (!raw.startsWith("{")) { console.error("TIMEOUT_OR_ERROR:", raw.slice(0, 200)); process.exit(2); }
const d = JSON.parse(raw);
if (!d.ok || !d.data) { console.error("BAD_RESULT:", raw.slice(0, 200)); process.exit(2); }
const payload = JSON.stringify(d.data, null, 1);
if (out) { await fs.writeFile(out, payload); console.log("WROTE", out, payload.length, "bytes"); }
else console.log(payload);
' "$WORDS" "$RANGE" "$GEO" "$OUT"
