/* GridPaw install prompt — shared by all game pages (gp-badges.js pattern).
 * Owns: beforeinstallprompt capture, entry-point wiring ([data-gp-install] + injected header icon),
 * mobile in-flow banner rhythm (2nd visit+, 14d snooze), iOS/generic guide, GA4 events.
 * Events are GA4-only on purpose (direct gtag, no gpTrack/D1 forwarding): the install funnel
 * does not need D1 and this avoids FUNNEL_EVENTS whitelist sync. GA4 blockers lose only these.
 * Never runs in: ?embed=1 (third-party embeds), standalone (already installed). */
(function () {
  'use strict';
  // CSS FIRST — hides [data-gp-install] mounts on every browser and every page variant
  // (embed pages included, where the script bails below) until the install logic reveals them.
  var css = document.createElement('style');
  css.textContent =
    '[data-gp-install]{display:none!important}' +
    'html.gp-installable [data-gp-install]{display:inline-flex!important;cursor:pointer}' +
    '@media (max-width:768px){html.gp-installable [data-gp-install]{display:none!important}}' + // mobile uses banner
    '.gp-hdr-install{width:34px;height:34px;border-radius:8px;background:#FFF0D4;border:1.5px solid #D97706;' +
    'display:inline-flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;margin-left:8px;flex-shrink:0}' +
    '@media (max-width:768px){.gp-hdr-install{width:30px;height:30px;font-size:13px;margin-left:4px}}' +
    '.gp-install-banner{margin:14px 16px 0;background:#fff;border:2px solid #D97706;border-radius:12px;' +
    'padding:14px 16px;box-shadow:0 2px 10px rgba(217,119,6,.14);font-family:inherit}' +
    '.gp-install-banner .gp-bt{font-size:14.5px;font-weight:800;color:#3A2F28}' +
    '.gp-install-banner .gp-bd{font-size:12px;color:#9C8B7B;margin:4px 0 10px;line-height:1.45}' +
    '.gp-install-banner .gp-brow{display:flex;gap:10px;align-items:center}' +
    '.gp-install-banner .gp-bi{background:#D97706;color:#fff;border:none;border-radius:9px;padding:9px 18px;' +
    'font-size:13px;font-weight:800;cursor:pointer}' +
    '.gp-install-banner .gp-bno{background:none;border:none;font-size:12px;color:#9C8B7B;cursor:pointer;text-decoration:underline}' +
    '.gp-ios-ov{position:fixed;inset:0;background:rgba(58,47,40,.55);z-index:99999;display:flex;' +
    'align-items:flex-end;justify-content:center;padding:16px}' +
    '.gp-ios-card{background:#FFFBF5;border-radius:16px;max-width:380px;width:100%;padding:22px 20px;text-align:left}' +
    '.gp-ios-card h3{font-size:16px;margin-bottom:10px;color:#3A2F28}' +
    '.gp-ios-card ol{margin:0 0 14px 18px;font-size:13.5px;line-height:1.7;color:#3A2F28}' +
    '.gp-ios-card .gp-iocl{background:#D97706;color:#fff;border:none;border-radius:9px;padding:9px 20px;' +
    'font-size:13px;font-weight:800;cursor:pointer;width:100%}';
  document.head.appendChild(css);

  if (new URLSearchParams(location.search).get('embed')) return;
  try {
    if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;
  } catch (e) { /* old browser — continue */ }
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  if (/(^|\.)pages\.dev$/.test(location.hostname)) return;
  // Demo pages (kakuro/nonogram/nurikabe/pictomino) have no SEOHead — register here.
  // register() is idempotent: on Astro pages SEOHead already registered, this is a no-op.
  if (!navigator.serviceWorker.controller) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
  var LS_VIEWS = 'gp_inst_views';
  var LS_SNOOZE = 'gp_inst_snooze';
  var LS_DONE = 'gp_inst_done';
  var COOLDOWN_MS = 14 * 24 * 3600 * 1000;
  var deferred = null;
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function track(ev, params) {
    if (typeof window.gtag === 'function') window.gtag('event', ev, params || {});
    if (window.gpTrack) window.gpTrack(ev, params || {}); // D1 funnel (whitelisted 2026-10-29, both funnel-track.ts and 4× gp-track.js)
    if (typeof window.clarity === 'function') window.clarity('event', ev);
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ── visit counter (first visit must never see the banner) ──
  lsSet(LS_VIEWS, String((parseInt(lsGet(LS_VIEWS) || '0', 10) || 0) + 1));

  // ── wire static mount buttons (toolbar icon on desktop, Play Anywhere on akari) ──
  function wireMounts() {
    var els = document.querySelectorAll('[data-gp-install]');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        if (el.__gpWired) return;
        el.__gpWired = true;
        el.addEventListener('click', function (ev) {
          ev.preventDefault();
          promptInstall(el.getAttribute('data-gp-from') || 'toolbar');
        });
      })(els[i]);
    }
  }

  // ── header icon (Astro pages only — demo pages have no site nav) ──
  function injectHeaderIcon() {
    if (document.querySelector('.gp-hdr-install')) return;
    var nav = document.querySelector('header .nav') || document.querySelector('header nav') ||
      document.querySelector('.gp-nav-right') || document.querySelector('header');
    if (!nav) return;
    var b = document.createElement('button');
    b.className = 'gp-hdr-install';
    b.title = 'Install app';
    b.setAttribute('aria-label', 'Install app');
    b.textContent = '📥';
    b.addEventListener('click', function () { promptInstall('header'); });
    nav.appendChild(b);
  }

  // ── mobile in-flow banner ──
  function maybeBanner() {
    if (lsGet(LS_DONE) === '1') return;
    if (window.innerWidth > 768) return;
    if (!deferred && !iOS) return;
    if (document.querySelector('.gp-install-banner')) return;
    var views = parseInt(lsGet(LS_VIEWS) || '0', 10) || 0;
    var snooze = parseInt(lsGet(LS_SNOOZE) || '0', 10) || 0;
    if (views < 2) return;
    if (Date.now() - snooze < COOLDOWN_MS) return;

    var anchor = null;
    var sels = ['.board-wrap', '.game-area', '.game-frame', '#app', '.board', '.topbar', 'main'];
    for (var i = 0; i < sels.length; i++) {
      anchor = document.querySelector(sels[i]);
      if (anchor) break;
    }
    var banner = document.createElement('div');
    banner.className = 'gp-install-banner';
    banner.innerHTML =
      '<div class="gp-bt">📥 Add GridPaw to your home screen</div>' +
      '<div class="gp-bd">Daily puzzles as an app — works offline, your streaks stay on your device.</div>' +
      '<div class="gp-brow"><button class="gp-bi">Install</button>' +
      '<button class="gp-bno">Maybe later</button></div>';
    banner.querySelector('.gp-bi').addEventListener('click', function () {
      banner.remove();
      promptInstall('banner');
    });
    banner.querySelector('.gp-bno').addEventListener('click', function () {
      banner.remove();
      lsSet(LS_SNOOZE, String(Date.now()));
      track('install_dismissed', { from: 'banner', snoozed: '1' });
    });
    if (anchor && anchor.parentElement) {
      anchor.parentElement.insertBefore(banner, anchor.nextSibling);
    } else {
      document.body.appendChild(banner);
    }
    track('install_prompt_shown', { from: 'banner' });
  }

  // ── prompts & guides ──
  function promptInstall(from) {
    track('install_clicked', { from: from });
    if (deferred) {
      var choice = deferred.prompt();
      if (choice && choice.then) {
        choice.then(function () { return deferred.userChoice; }).then(handleChoice).catch(function () {});
      } else if (deferred.userChoice && deferred.userChoice.then) {
        deferred.userChoice.then(handleChoice);
      }
      function handleChoice(c) {
        var outcome = c && c.outcome;
        if (outcome === 'accepted') {
          lsSet(LS_DONE, '1');
          track('install_accepted', { from: from });
        } else {
          lsSet(LS_SNOOZE, String(Date.now()));
          track('install_dismissed', { from: from });
        }
        deferred = null;
      }
    } else if (iOS) {
      showGuide(
        'Add to Home Screen',
        '<li>Tap the <b>Share</b> button <span style="font-size:16px">⬆️</span> in Safari&apos;s toolbar</li>' +
        '<li>Scroll and tap <b>Add to Home Screen</b></li>' +
        '<li>Tap <b>Add</b> — GridPaw joins your home screen</li>'
      );
    } else {
      showGuide(
        'Install GridPaw',
        '<li>Open your browser&apos;s menu <b>⋯</b> or <b>⋮</b></li>' +
        '<li>Choose <b>Install app</b> / <b>Add to Home screen</b></li>'
      );
    }
  }

  function showGuide(title, stepsHtml) {
    var ov = document.createElement('div');
    ov.className = 'gp-ios-ov';
    ov.innerHTML =
      '<div class="gp-ios-card"><h3>' + title + '</h3><ol>' + stepsHtml + '</ol>' +
      '<button class="gp-iocl">Got it</button></div>';
    ov.querySelector('.gp-iocl').addEventListener('click', function () { ov.remove(); });
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
  }

  // ── lifecycle ──
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    document.documentElement.classList.add('gp-installable');
    wireMounts();
    injectHeaderIcon();
    maybeBanner();
  });

  window.addEventListener('appinstalled', function () {
    lsSet(LS_DONE, '1');
    track('appinstalled');
    var b = document.querySelector('.gp-install-banner');
    if (b) b.remove();
    document.documentElement.classList.remove('gp-installable');
  });

  // if the prompt event fired before this script executed, recover on load
  if (document.readyState === 'complete') {
    wireMounts();
  } else {
    window.addEventListener('load', wireMounts);
  }
})();
