// Google AdSense 单一真源 —— client、每个广告位的 unit id、上线开关。
//
// 为什么单独一个文件：AdSense 的 slot id 要在「后台建 unit」和「代码里挂位」之间保持一致，
// 且 pentomino 静态站（public/pictomino/gp-ads.js，无 Astro 组件层）要照抄同一份常量。
// 改这里 = 改那边那份 JS 的副本（那文件头已注明）。
//
// 上线方式（重要）：
//   SLOT 留空 = 该位直接不渲染（连 ins 标签都不出），所以「拿到一个 unit id 就能单独开一个位」。
//   ADSENSE_LOADER = 全站注入 pagead2 脚本的总闸；位全空时自动不开（省 100KB）。

export const ADSENSE_CLIENT = 'ca-pub-5225990079437405';

// 后台 → 广告 → 按广告单元 → 新建。尺寸必须与代码里的位一致，否则 AdSense 拒绝或变形。
// 命名建议：gridpaw-<位置>-<尺寸>
export const ADSENSE_SLOTS = {
  // 桌面 ≥1350 左右侧栏（落在 840px 内容列之外的 gutter，29 页 elementFromPoint 实测零命中）
  left: '', // 160×600  gridpaw-left-160x600
  right: '', // 160×600  gridpaw-right-160x600
  // 平板 768–1349 底部 sticky（fixed，body 预留 100px；play surface 永不出）
  sticky: '', // 728×90   gridpaw-sticky-728x90
  // 手机 <768 顶部（插在 header 之后、棋盘之上；play surface 永不出）
  top: '', // 320×50   gridpaw-top-320x50
  // 手机正文底部第二信息流（零预留高度，未填充整块 0 高）
  mobilefoot: '', // 300×250  gridpaw-mobilefoot-300x250
  // 正文内 300×250（攻略/内容页，视频或正文中段）
  incontent: '', // 300×250  gridpaw-incontent-300x250
} as const;

export type AdPosition = keyof typeof ADSENSE_SLOTS;

/**
 * 自动广告（Auto ads，后台「广告 → 按网站 → 自动广告」）总开关。
 *
 * 2026-11-20 法老拍板：先让 Google 自己找位置，用它的数据当基线，再决定要不要收回控制权改手动位。
 * 后台配置口径（写死在这里，别漂）：只留页内横幅 + 上限 6 + 最小间距 1000px，
 * 重叠式（锚定/侧栏/穿插）全关、意向驱动关、多重广告关、优化现有广告关。
 *
 * 开这个开关 = 内容页会加载 adsbygoogle.js（play surface 与永零页仍不加载，见 src/lib/ad-policy.ts）。
 * 手动位（ADSENSE_SLOTS）保持空串即可单独关掉手动位，两者互不牵连。
 */
export const ADSENSE_AUTO = true;

/** 是否注入 loader 脚本：开了自动广告，或至少一个手动位有 unit id */
export const ADSENSE_LOADER = ADSENSE_AUTO || Object.values(ADSENSE_SLOTS).some(Boolean);

/** AdSense 广告位接管（Adsterra 已 2026-11-17 全站撤除，两套不共存） */
export const ADSENSE_ENABLED = true;

/** 该位是否已配好（配好才渲染 ins） */
export function slotFor(pos: AdPosition): string {
  return ADSENSE_SLOTS[pos];
}
