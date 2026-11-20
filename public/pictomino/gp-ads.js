/* Pictomino 侧栏广告（2026-11-20 AdSense 版）——public/ 下纯静态页专用。
 *
 * 为什么单独一份：pictomino 是 public/pictomino/*.html 静态站，没有 Astro 组件层，
 * 用不了 src/components/SideAd.astro。**src/lib/adsense.ts 才是唯一真源**——client、
 * slot id、尺寸、闸门规则任何一项变了，这里必须同步改（改一处 = 改两处）。
 * （同理 SideAd.astro 是布局约定真源：≥1350 桌面侧栏、落在 840px 内容列之外。）
 *
 * 口径与全站一致（play surface）：**只开 ≥1350 桌面侧栏**，手机/平板/顶部位/sticky/
 * 正文位一个都不出。另外两条纪律：
 *   ① 只在正文列两侧真的留出 ≥170px 空档时才挂（pictomino 各页内容宽度不一，别硬套 840）；
 *   ② 未填充时连 "Advertisement" 标签都不露（AdSense 填充率高，但没填就不露）。
 *
 * 不挂这文件的 pictomino 页：animal-puzzles / cat-breeds / daily-puzzle / easy / hard /
 * privacy —— 那 6 页正文里明写 "no ads / no ads interrupting the game"，是已发布的承诺，
 * 要挂得先改文案，没动。
 */
(function () {
  var ADSTERRA_OFF = true; // 2026-11-17 法老撤除（全站零广告，验 Adsterra 是否伤排名）
  var CLIENT = 'ca-pub-5225990079437405';
  // ⚠ 与 src/lib/adsense.ts 的 ADSENSE_SLOTS 保持一致；留空 = 该位不出
  var SLOTS = { left: '', right: '' };

  var any = (SLOTS.left ? 1 : 0) + (SLOTS.right ? 1 : 0);
  if (ADSTERRA_OFF && !any) return;
  if (window.__gpPictoAds) return;
  window.__gpPictoAds = 1;

  // ── 闸门 ────────────────────────────────────────────────
  // 内嵌模式 / 已购去广告 / 视口不够宽 → 直接不出
  try {
    if (new URLSearchParams(location.search).has('embed')) return;
    if (localStorage.getItem('gp_ads_free')) return;
  } catch (e) {}
  if (window.innerWidth < 1350) return;

  // ── 正文列两侧够不够空 ──────────────────────────────────
  function gutters() {
    var sels = ['main', '.container', '.game-wrap', '#app', '.wrap'];
    var box = null;
    for (var i = 0; i < sels.length; i++) {
      var el = document.querySelector(sels[i]);
      if (!el) continue;
      var r = el.getBoundingClientRect();
      if (r.width > 200 && r.height > 200) { box = r; break; }
    }
    if (!box) return null;
    var left = box.left, right = window.innerWidth - box.right;
    if (left < 170 || right < 170) return null;
    return { left: Math.round(left - 168), right: Math.round(right - 168) };
  }

  // ── DOM + 样式 ──────────────────────────────────────────
  var CSS = '.gp-picto-ad{position:fixed;top:50%;transform:translateY(-50%);width:160px;z-index:30}' +
    '.gp-picto-ad__label{display:none;font-size:10px;line-height:14px;letter-spacing:.06em;' +
    'text-transform:uppercase;color:#9A8B72;text-align:center}' +
    '.gp-picto-ad.is-filled>.gp-picto-ad__label{display:block}' +
    '.gp-picto-ad__slot{background:none}';

  function make(side, x) {
    var box = document.createElement('div');
    box.className = 'gp-picto-ad gp-picto-ad--' + side;
    box.style.cssText = (side === 'left' ? 'left:' : 'right:') + x + 'px';
    var label = document.createElement('span');
    label.className = 'gp-picto-ad__label';
    label.textContent = 'Advertisement';
    var slot;
    if (SLOTS[side]) {
      slot = document.createElement('ins');
      slot.className = 'adsbygoogle';
      slot.style.cssText = 'display:inline-block;width:160px;height:600px';
      slot.setAttribute('data-ad-client', CLIENT);
      slot.setAttribute('data-ad-slot', SLOTS[side]);
      slot.setAttribute('data-full-width-responsive', 'false');
    } else {
      slot = document.createElement('div');
      slot.className = 'gp-picto-ad__slot';
    }
    slot.setAttribute('data-gp-picto', side);
    box.appendChild(label);
    box.appendChild(slot);
    document.body.appendChild(box);
    return slot;
  }

  function mark(el) {
    var box = el.parentNode;
    if (box && el.getAttribute('data-ad-status') === 'filled') box.classList.add('is-filled');
  }

  function watch(el) {
    mark(el);
    if (typeof MutationObserver !== 'function') return;
    var mo = new MutationObserver(function () {
      if (el.getAttribute('data-ad-status') === 'filled') { mark(el); mo.disconnect(); }
    });
    mo.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });
  }

  function start() {
    var g = gutters();
    if (!g) return;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    window.adsbygoogle = window.adsbygoogle || [];
    var els = [];
    if (SLOTS.left) els.push(make('left', g.left));
    if (SLOTS.right) els.push(make('right', g.right));
    for (var i = 0; i < els.length; i++) {
      watch(els[i]);
      window.adsbygoogle.push({});
    }
  }

  start();
})();
