/* Pictomino 侧栏广告（2026-11-16）——public/ 下纯静态页专用。
 *
 * 为什么单独一份：pictomino 是 public/pictomino/*.html 静态站，没有 Astro 组件层，
 * 用不了 src/components/SideAd.astro。**SideAd.astro 才是唯一真源**——key、尺寸、
 * 闸门名单、标签规则任何一项变了，这里必须同步改（改一处 = 改两处）。
 *
 * 口径与全站一致（play surface）：**只开 ≥1350 桌面侧栏**，手机/平板/顶部位/sticky/
 * 正文位一个都不出。另外两条纪律：
 *   ① 只在正文列两侧真的留出 ≥170px 空档时才挂（pictomino 各页内容宽度不一，别硬套 840）；
 *   ② 未填充时连 "Advertisement" 标签都不露（填充率约 56%，不给用户看孤零零的标签）。
 *
 * 不挂这文件的 pictomino 页：animal-puzzles / cat-breeds / daily-puzzle / easy / hard /
 * privacy —— 那 6 页正文里明写 "no ads / no ads interrupting the game"，是已发布的承诺，
 * 要挂得先改文案，没动。
 */
(function () {
  // ⚠️ 2026-11-17 法老撤除（全站零广告）：验证 Adsterra 是否伤排名。
  //    SideAd.astro / InContentAd.astro 的 ADSTERRA_OFF 同步为 true；恢复时三处一起改回 false。
  var ADSTERRA_OFF = true;
  if (ADSTERRA_OFF) return;
  if (window.__gpPictoAds) return;
  window.__gpPictoAds = 1;

  var KEYS = { left: '309484c05af1066efb6f321317c94311', right: '9f1d682930273a58cd2e02f0cee94cc0' };
  var DIMS = { left: [160, 600], right: [160, 300] };
  var BASE = 'https://bauval.org/22/';

  // ── 闸门 ────────────────────────────────────────────────
  // 内嵌模式 / 已购去广告 / 视口不够宽 → 直接不出
  try {
    if (new URLSearchParams(location.search).has('embed')) return;
    if (localStorage.getItem('gp_ads_free')) return;
  } catch (e) {}
  if (window.innerWidth < 1350) return;

  // geo + bot 闸：与 AdGate.astro 同一份名单（CN/HK + 爬虫 UA），fail-open
  function gate() {
    return new Promise(function (resolve) {
      var BOT = /bot|crawl|spider|headless|python|curl|wget|monitor/i;
      var BLOCKED = { CN: 1, HK: 1 };
      var done = false;
      var fin = function (allow) { if (!done) { done = true; resolve(allow); } };
      setTimeout(function () { fin(true); }, 2000);
      if (BOT.test(navigator.userAgent || '')) return fin(false);
      fetch('/api/geo', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (g) { fin(!(g && g.country && BLOCKED[g.country])); })
        .catch(function () { fin(true); });
    });
  }

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
    var slot = document.createElement('div');
    slot.className = 'gp-picto-ad__slot';
    slot.setAttribute('data-gp-picto', side);
    slot.style.width = DIMS[side][0] + 'px';
    slot.style.height = DIMS[side][1] + 'px';
    box.appendChild(label);
    box.appendChild(slot);
    document.body.appendChild(box);
    return slot;
  }

  function mark(slot, final) {
    // 只控制标签：盒子本身 fixed 且无背景，未填充时肉眼就是一片空 gutter，
    // 不 display:none（否则慢网下 3.5s 后才到的创意会被永久藏掉，白丢曝光）。
    var box = slot.parentNode;
    if (box && slot.querySelector('iframe')) box.classList.add('is-filled');
  }

  var chain = Promise.resolve();
  function fill(side, slot) {
    chain = chain.then(function () {
      return new Promise(function (resolve) {
        window.atOptions = { key: KEYS[side], format: 'iframe', height: DIMS[side][1], width: DIMS[side][0], params: {} };
        var s = document.createElement('script');
        s.src = BASE + KEYS[side];
        s.async = false;
        s.setAttribute('data-cfasync', 'false');
        s.addEventListener('load', resolve);
        s.addEventListener('error', resolve);
        slot.appendChild(s);
        setTimeout(function () { mark(slot, false); }, 1200);
        setTimeout(function () { mark(slot, true); }, 3500);
      });
    });
  }

  function start() {
    var g = gutters();
    if (!g) return;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    fill('left', make('left', g.left));
    fill('right', make('right', g.right));
  }

  gate().then(function (allow) { if (allow) start(); });
})();
