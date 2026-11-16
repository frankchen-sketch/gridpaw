// Native Banner 格式对账实验（2026-11-16 → 约 11-19）—— 法老要求验「去掉 iframe 收益更高」。
//
// 分组来源：GA4 近 7 天 pagePath PV 排行，en 的 BP3 关卡页按 PV 降序**交替**分成两组
// （交替而非按量切，是为了让两组的「页面质量」匹配，避免高流量页全落一边造成 CPM 混淆）。
//   test 组 66 页 4,785 PV/7d ≈ 684 PV/天  ← 本清单，InContentAd 改走 NativeAd（无 iframe）
//   control 组 66 页 4,629 PV/7d ≈ 661 PV/天 ← 保持 300×250 iframe
// 判定口径：Adsterra 后台「按 unit」CPM —— Native unit 31317669 vs Banner unit 31836413
// 同一窗口对比（两个单元在本站不重叠，见 InContentAd 的分支），unit 级天然分账。
//
// 回滚 = 把本数组清空（InContentAd 自动全站回到 iframe）。别删文件本身，保留实验记录价值。

export const NATIVE_TEST_PATHS = new Set<string>([
  '/brain-puzzle-3-level-1', '/brain-puzzle-3-level-10', '/brain-puzzle-3-level-101', '/brain-puzzle-3-level-104',
  '/brain-puzzle-3-level-107', '/brain-puzzle-3-level-108', '/brain-puzzle-3-level-113', '/brain-puzzle-3-level-114',
  '/brain-puzzle-3-level-115', '/brain-puzzle-3-level-117', '/brain-puzzle-3-level-118', '/brain-puzzle-3-level-12',
  '/brain-puzzle-3-level-121', '/brain-puzzle-3-level-123', '/brain-puzzle-3-level-124', '/brain-puzzle-3-level-125',
  '/brain-puzzle-3-level-13', '/brain-puzzle-3-level-132', '/brain-puzzle-3-level-134', '/brain-puzzle-3-level-14',
  '/brain-puzzle-3-level-17', '/brain-puzzle-3-level-2', '/brain-puzzle-3-level-20', '/brain-puzzle-3-level-23',
  '/brain-puzzle-3-level-24', '/brain-puzzle-3-level-26', '/brain-puzzle-3-level-27', '/brain-puzzle-3-level-28',
  '/brain-puzzle-3-level-29', '/brain-puzzle-3-level-32', '/brain-puzzle-3-level-33', '/brain-puzzle-3-level-34',
  '/brain-puzzle-3-level-38', '/brain-puzzle-3-level-39', '/brain-puzzle-3-level-42', '/brain-puzzle-3-level-48',
  '/brain-puzzle-3-level-49', '/brain-puzzle-3-level-50', '/brain-puzzle-3-level-51', '/brain-puzzle-3-level-53',
  '/brain-puzzle-3-level-54', '/brain-puzzle-3-level-56', '/brain-puzzle-3-level-57', '/brain-puzzle-3-level-58',
  '/brain-puzzle-3-level-60', '/brain-puzzle-3-level-61', '/brain-puzzle-3-level-62', '/brain-puzzle-3-level-67',
  '/brain-puzzle-3-level-68', '/brain-puzzle-3-level-69', '/brain-puzzle-3-level-70', '/brain-puzzle-3-level-71',
  '/brain-puzzle-3-level-72', '/brain-puzzle-3-level-73', '/brain-puzzle-3-level-74', '/brain-puzzle-3-level-75',
  '/brain-puzzle-3-level-79', '/brain-puzzle-3-level-8', '/brain-puzzle-3-level-80', '/brain-puzzle-3-level-81',
  '/brain-puzzle-3-level-84', '/brain-puzzle-3-level-85', '/brain-puzzle-3-level-92', '/brain-puzzle-3-level-95',
  '/brain-puzzle-3-level-97', '/brain-puzzle-3-level-99',
]);
