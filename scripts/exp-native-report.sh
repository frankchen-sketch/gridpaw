#!/usr/bin/env bash
# Native 格式实验读数：拉 gridpaw 两个单元的 per-placement / per-date 统计（后台口径，GMT+8）。
# 用法：bash scripts/exp-native-report.sh [YYYY-MM-DD] [YYYY-MM-DD]
#   缺省 = 最近 3 天（含今天）
# 依赖：ego-browser 已登录 Adsterra（Default profile）。登录态失效时脚本会在 title 处报未登录。
set -euo pipefail

START="${1:-$(date -v-3d +%Y-%m-%d 2>/dev/null || date -d '3 days ago' +%Y-%m-%d)}"
END="${2:-$(date +%Y-%m-%d)}"

echo "窗口: ${START} → ${END}（GMT+8, zone=gridpaw.com 6063560）"

ego-browser nodejs <<EOF
const t = await taskSpace("adsterra-native-exp");
const page = t.page("p1");
if ((await page.title()).indexOf("Statistics") === -1) {
  await page.goto("https://beta.publishers.adsterra.com/stats", { timeout: 60000 });
  await page.waitForTimeout(5000);
}
const out = await page.evaluate(async () => {
  const q = (gb) => "/api/stats/paginated?start_date=${START}&finish_date=${END}&zone=6063560&group_by=" + gb +
    "&timezone=GMT%2B08%3A00&limit=50&page=1&sorting_field=name&sorting_order=desc";
  const [pl, dt] = await Promise.all([
    fetch(q(8)).then((r) => r.json()),
    fetch(q(13)).then((r) => r.json()),
  ]);
  return { pl: pl.data, dt: dt.data };
});
const want = ["31317669", "31836413", "31688449", "32144309", "32144316", "32303990"];
console.log("PLACEMENT（unit | imp | CPM | net）");
for (const it of out.pl.items) {
  const tag = want.some((k) => it.name.includes(k));
  const fmt = (v) => (v === null || v === undefined ? "-" : String(v));
  console.log(
    (tag ? "  * " : "    ") + it.name + " | " + fmt(it.impressions) + " | \$" +
    Number(it.cpm || 0).toFixed(3) + " | \$" + Number(it.net || 0).toFixed(2)
  );
}
const get = (id) => out.pl.items.find((i) => i.name.includes(id)) || {};
const n = get("31317669"), b = get("31836413");
if (n.impressions && b.impressions) {
  console.log("RATIO: Native/banner CPM = " + (n.cpm / (b.cpm || 1)).toFixed(2) + "x");
} else {
  console.log("RATIO: 缺一边曝光（native " + (n.impressions || 0) + " imp / banner " + (b.impressions || 0) + " imp）——实验还没吃到流量或未上线");
}
console.log("BY DATE:");
for (const it of out.dt.items) {
  console.log("  " + it.name + " | " + it.impressions + " imp | \$" + Number(it.cpm || 0).toFixed(3) + " | \$" + Number(it.net || 0).toFixed(2));
}
EOF
