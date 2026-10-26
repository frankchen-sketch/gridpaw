/* GridPaw Hall-of-Fame banner（2026-10-26 campaign，slogan 主导版 v2）
 * 挂载：SEOHead 全站 <script is:inline src="/hof-banner.js"> —— 无依赖、自退役：
 *  - campaign 窗口：上线 → 2026-10-30 00:00 CST，之后 no-op（下次构建可整段移除本文件）
 *  - body.embed-mode（?embed=1）不出；找不到 header 锚点不出；用户关闭后整个 campaign 不再出
 *  - 数据：/api/leaderboard shikaku 当日最快 + akari streak Top1（服务端已带下限防线，只引真解）
 *  - 文案 4 条随机轮换，2 条不依赖数据（榜单空/接口挂也能上）；champion 只做证据 chip
 */
(function () {
  'use strict';
  var CAMPAIGN_END = Date.parse('2026-10-30T00:00:00+08:00');
  if (Date.now() > CAMPAIGN_END) return;
  try { if (window.self !== window.top) return; } catch (e) { return; } // iframe 内不出
  if (/[?&]embed=1/.test(location.search)) return; // 嵌入模式不出（body.embed-mode 是事后加的，参数先行）
  if (document.documentElement.hasAttribute('data-hof')) return; // 防双份
  document.documentElement.setAttribute('data-hof', '1');

  var NAME_CAP = 16;
  function cap(s) { s = String(s || ''); return s.length > NAME_CAP ? s.slice(0, NAME_CAP - 1) + '…' : s; }
  function fmt(ms) {
    if (ms == null || !isFinite(ms)) return '';
    var s = Math.round(ms / 1000);
    return s < 60 ? (Math.round(ms / 100) / 10).toFixed(1) + 's'
                  : Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function fetchJSON(url, timeoutMs) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, timeoutMs || 4000);
    return fetch(url, { signal: ctrl.signal, credentials: 'same-origin' })
      .then(function (r) { clearTimeout(t); return r.ok ? r.json() : null; })
      .catch(function () { clearTimeout(t); return null; });
  }
  function track(ev, extra) {
    try { if (typeof window.gpTrack === 'function') window.gpTrack(ev, extra || {}); } catch (e) {}
  }

  function render(data) {
    var d = data || {};
    var fastest = d.fastest && d.fastest.timeMs ? d.fastest : null;   // {name, timeMs, guest}
    var streakTop = d.streak && d.streak.streak > 1 ? d.streak : null; // {name, streak, guest}（streak=1 不值得宣传）

    // 文案库：variant → {main, sub, chips 用不用数据}
    var variants = [];
    if (fastest) variants.push({
      id: 'beat-time',
      main: 'Solve it faster than <b>' + fmt(fastest.timeMs) + '</b> — and tomorrow, all of GridPaw knows your name.',
      sub: "Today's board is open. No downloads. No sign-up to try."
    });
    if (streakTop) variants.push({
      id: 'streak-taunt',
      main: '<b>' + cap(streakTop.name) + '</b> is on a <b>' + streakTop.streak + '-day streak</b>. Not stopping. Are you?',
      sub: 'Beat the streak, take the crown.'
    });
    variants.push({ id: 'beginner', main: 'Every champion was once a beginner. <b>Today\'s board is open.</b>', sub: 'No downloads. No sign-up to try.' });
    variants.push({ id: 'paws', main: 'Fastest paws on the grid. <b>Any name could be next — even yours.</b>', sub: "Today's board is open." });

    var pick = variants[Math.floor(Math.random() * variants.length)];

    var el = document.createElement('aside');
    el.className = 'hof-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Hall of Fame — daily leaderboard challenge');
    // chips：用户名是用户可控数据 → 全 DOM API + textContent（skill 教训：禁 innerHTML 拼用户数据）
    var chipFrag = document.createDocumentFragment();
    function chip(icon, name, tail) {
      var s = document.createElement('span'); s.className = 'hof-chip';
      s.append(icon + ' ');
      var b = document.createElement('b'); b.textContent = cap(name); s.append(b);
      s.append(' · ' + tail);
      return s;
    }
    if (fastest) chipFrag.append(chip('🥇', fastest.name, fmt(fastest.timeMs)));
    if (streakTop) chipFrag.append(chip('⚡', streakTop.name, streakTop.streak + '-day streak'));
    el.innerHTML =
      '<div class="hof-inner">' +
        '<span class="hof-trophy" aria-hidden="true">🏆</span>' +
        '<div class="hof-copy"><div class="hof-main">' + pick.main + '</div><div class="hof-sub">' + pick.sub + '</div></div>' +
        '<div class="hof-right">' +
          '<a class="hof-cta" href="/leaderboard/">Take the challenge →</a>' +
          '<button class="hof-x" type="button" aria-label="Dismiss banner">✕</button>' +
        '</div>' +
      '</div>';
    var right = el.querySelector('.hof-right');
    right.insertBefore(chipFrag, right.firstChild);

    el.querySelector('.hof-cta').addEventListener('click', function () { track('hof_cta', { variant: pick.id }); });
    el.querySelector('.hof-x').addEventListener('click', function () {
      try { localStorage.setItem('gp_hof_dismissed', '1'); } catch (e) {}
      el.remove();
      track('hof_dismiss', { variant: pick.id });
    });

    var anchor = document.querySelector('.site-header') || document.querySelector('.gp-nav');
    if (!anchor || document.querySelector('.hof-banner')) return;
    anchor.insertAdjacentElement('afterend', el);
    var css = document.createElement('style');
    css.textContent =
      '.hof-banner{background:#FDF6EF;border-bottom:1px solid #EADCC8}' +
      '.hof-inner{max-width:1080px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}' +
      '.hof-trophy{font-size:22px;line-height:1}' +
      '.hof-main{font-size:15.5px;font-weight:700;color:#5C4033;line-height:1.35}.hof-main b{color:#A94E2B}' +
      '.hof-sub{font-size:12.5px;color:#8b7d6f;margin-top:2px}' +
      '.hof-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}' +
      '.hof-chip{background:rgba(169,78,43,.08);border-radius:999px;padding:3px 10px;font-size:12.5px;color:#5C4033;white-space:nowrap}' +
      '.hof-chip b{font-weight:650}' +
      '.hof-cta{background:#A94E2B;color:#fff;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap}' +
      '.hof-cta:hover{background:#8F3F20;color:#fff}' +
      '.hof-x{background:none;border:none;color:#8b7d6f;font-size:14px;cursor:pointer;padding:2px 6px;border-radius:6px}' +
      '@media(max-width:640px){.hof-inner{padding:8px 12px}.hof-main{font-size:13.5px}.hof-right{margin-left:34px}.hof-cta{padding:5px 10px;font-size:12px}}';
    document.head.appendChild(css);
    track('hof_view', { variant: pick.id });
  }

  function init() {
    if (document.body && document.body.classList.contains('embed-mode')) return;
    if (!document.querySelector('.site-header') && !document.querySelector('.gp-nav')) return; // 无头部页不出（help 等）
    try { if (localStorage.getItem('gp_hof_dismissed') === '1') return; } catch (e) {}
    Promise.all([
      fetchJSON('/api/leaderboard?game=shikaku&date=' + new Date().toISOString().slice(0, 10) + '&_=' + Date.now()),
      fetchJSON('/api/leaderboard?game=akari&type=streak'),
      fetchJSON('/api/leaderboard?game=shikaku&type=streak')
    ]).then(function (rs) {
      var daily = rs[0] && rs[0].entries && rs[0].entries[0] ? rs[0].entries[0] : null;
      var streaks = [rs[1], rs[2]].map(function (r) { return r && r.entries && r.entries[0] ? r.entries[0] : null; })
        .filter(function (e) { return e && e.streak >= 2; })
        .sort(function (a, b) { return b.streak - a.streak; });
      render({ fastest: daily, streak: streaks[0] || null });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
