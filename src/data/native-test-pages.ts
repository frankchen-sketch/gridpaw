// Native Banner 格式对账实验（2026-11-16 起）—— 法老要求验「去掉 iframe 收益更高」。
//
// 2026-11-16 第二轮（法老指令）：不做全量内页覆盖，**只挑主要流量页**做，先看 2-3 天。
//   旧方案 66 页铺开已撤（那 66 页全部回到 300x250 iframe），因为铺太散信噪比差、
//   而且 native 的投诉风险面要尽量小。
//   本清单 = GA4 近 7 天 PV 排行里「带正文位」的页，取前 8 名：
//     1,782 PV/7d ≈ 255 PV/天（8 页合计 2,683 PV/7d ≈ 383 PV/天）
//   另有两页流量更高但无正文位（/brain-puzzle-3-answers 450、/the-loop-past-answers 362 中
//   至少有正文位，已含在清单里），所以清单以实际带 InContentAd 的页为准。
//
// 判定口径：Adsterra 后台「按 unit」CPM —— Native unit 31317669 vs Banner unit 31836413，
// 同窗口对比（两个单元在本站不重叠，unit 级天然分账）。
// ⚠ 31317669 在 11-16 之前是 **Inactive**（后台状态），RESUBMIT 后才 Active ——
//   这解释了 11-16 之前 native 0 曝光。任何「native 不填充」的结论必须先查这个状态。
//
// 回滚 = 把本数组清空（InContentAd 自动全站回到 iframe）。别删文件本身。

export const NATIVE_TEST_PATHS = new Set<string>([
  '/brain-puzzle-3-answers',      // 450 PV/7d
  '/the-loop-past-answers',       // 362
  '/brain-puzzle-3-level-33',     // 360
  '/brain-puzzle-3-level-45',     // 344
  '/brain-puzzle-3-level-42',     // 321
  '/brain-puzzle-3-level-36',     // 300
  '/brain-puzzle-3-level-17',     // 278
  '/brain-puzzle-3-level-16',     // 268
]);
