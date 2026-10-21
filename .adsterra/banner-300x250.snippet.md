# Adsterra Banner 300x250 — gridpaw.com（正文内）

- Ad Unit: **31836413**（Banner 300x250_1，2026-10-21 建，Active）
- 用途：BP3 关卡页 + hub 正文内位（InContentAd.astro），视频正下方 / hub 的 level-grid 后
- 格式：iframe Banner（**非 invoke 动态格式**，同 SideAd 安全口径；Reddit 投诉后 invoke 类全站红线）

## 广告代码（官方 GET CODE，2026-10-21 API 实取）

```html
<script>
  atOptions = {
    'key' : 'c3072bbbf851bb748d0bc833da23e21e',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/c3072bbbf851bb748d0bc833da23e21e"></script>
```

## 坑位记录

- **invoke 域会轮换**：160x600 当年拿的是 `highrevenueformat.com/<key>/invoke.js`，本次 API 对两个 Banner 单元都返回 `bauval.org/22/<key>`——以同源 API `GET /api/placements/<site_id>/extended` 的 `data[].codes[0].code` 为准（data 是数组，每个 unit 一项，别只读 data[0]）
- **同页双单元必须串行**：atOptions 是全局变量，InContentAd（300x250）与 SideAd（160x600）同页并存时经 `window.__gpAdChain` promise 链排队（set → append → 等 load），否则先注入的 iframe 会拿到后注入的尺寸
- 后台「Create Ad Unit」弹窗会**锁定站点已有格式**（显示为 disabled+勾选），只能新增格式/尺寸；GET CODE 按钮对自动化点击无响应（老坑），代码走 API 拿
