# Adsterra Banner 160x600 — gridpaw.com

- Ad Unit: **31688449**（Banner 160x600_1，2026-10-12 建，Active）
- 用途：桌面 ≥1200px 侧栏 sticky 位（SideAd.astro），左右各一容器共用此单元代码
- 现有 Native Banner（31317669）未动

## 广告代码（fixed 侧栏容器内）

```html
<script type="text/javascript">
	atOptions = {
		'key' : '309484c05af1066efb6f321317c94311',
		'format' : 'iframe',
		'height' : 600,
		'width' : 160,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highrevenueformat.com/309484c05af1066efb6f321317c94311/invoke.js"></script>
```

## 部署坑位记录

- 后台按钮文本渲染为「Ad Unit」（非大写 AD UNIT），DOM 精确匹配会 miss，用行内坐标/含前后缀匹配
- 单元创建后 ~3 分钟激活（"Activation in progress" 提示）
- invoke.js 域名不同：Banner 走 highrevenueformat.com（Native 走 profitableratecpmnetwork.com），两者都是 Adsterra 官方域名
