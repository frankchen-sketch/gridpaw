/* GridPaw 全站 leaderboard 客户端（共享）
 * 用法：
 *   <script is:inline src="/leaderboard.js"></script>
 *   胜利时： GPLeaderboard.submit('<game>', timeMs)   — 未登录静默跳过
 *   面板：   GPLeaderboard.mount('<game>', document.getElementById('gp-lb'))
 */
(function () {
  'use strict';
  var GAME_RE = /^[a-z-]+$/;
  var GAMES = ['shikaku', 'akari', 'kenken', 'binary', 'hashi', 'slitherlink', 'star-battle', 'kakuro', 'nonogram', 'nurikabe'];
  function validGame(g) { return typeof g === 'string' && GAME_RE.test(g) && GAMES.indexOf(g) !== -1; }

  function fetchJSON(url) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal, credentials: 'same-origin' }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error('http_' + r.status);
      return r.json();
    }, function (e) { clearTimeout(t); throw e; });
  }

  function fmt(ms) {
    var s = Math.round(ms / 1000);
    var m = Math.floor(s / 60);
    return m + ':' + ('0' + (s % 60)).slice(-2);
  }

  var GPLeaderboard = {
    /** 胜利上报：未登录（me 无 user）静默跳过；失败静默 — 不挡游戏 */
    submit: function (game, timeMs) {
      if (!validGame(game) || !Number.isFinite(timeMs)) return Promise.resolve({ skipped: true });
      return fetchJSON('/api/auth/me').then(function (me) {
        if (!me || !me.user) return { skipped: true };
        return fetch('/api/leaderboard', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game: game, timeMs: Math.round(timeMs) })
        }).then(function (r) { return { ok: r.ok }; }).catch(function () { return { ok: false }; });
      }).catch(function () { return { skipped: true }; });
    },

    /** 渲染当日榜到容器。未登录/无数据时给引导文案 */
    mount: function (game, container) {
      if (!container || !validGame(game)) return Promise.resolve();
      container.innerHTML = '<div style="padding:12px;color:#8b7d6f;font-size:.85rem">Loading leaderboard…</div>';
      var today = new Date().toISOString().slice(0, 10);
      return fetchJSON('/api/leaderboard?game=' + encodeURIComponent(game) + '&date=' + today).then(function (data) {
        var rows = data.entries || [];
        var html = '<div class="gp-lb-head">🏆 Today\'s ' + game.charAt(0).toUpperCase() + game.slice(1) + ' Leaderboard <span class="gp-lb-date">' + data.date + '</span></div>';
        if (!rows.length) {
          html += '<div class="gp-lb-empty">No times yet today. Solve the daily puzzle and be the first on the board!<br><a href="/api/auth/login" class="gp-lb-login">Sign in with Google to appear here</a></div>';
        } else {
          html += '<ol class="gp-lb-list">';
          for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            html += '<li class="gp-lb-row' + (i < 3 ? ' gp-lb-top' : '') + '"><span class="gp-lb-rank">' + (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : r.rank) + '</span><span class="gp-lb-name"></span><span class="gp-lb-time">' + fmt(r.timeMs) + '</span></li>';
          }
          html += '</ol><div class="gp-lb-foot"><a href="/api/auth/login" class="gp-lb-login">Sign in with Google to compete</a></div>';
        }
        container.innerHTML = html;
        // DOM API 填名字（skill：不用 innerHTML 拼用户数据）
        var nameSpans = container.querySelectorAll('.gp-lb-name');
        for (var j = 0; j < nameSpans.length; j++) nameSpans[j].textContent = rows[j].name;
      }).catch(function () {
        container.innerHTML = '<div class="gp-lb-empty">Leaderboard unavailable right now.</div>';
      });
    }
  };

  window.GPLeaderboard = GPLeaderboard;

  var css = document.createElement('style');
  css.textContent = '.gp-lb-head{font-weight:800;color:#5C4033;margin-bottom:8px}.gp-lb-date{font-weight:600;color:#9a8a7c;font-size:.8em;margin-left:6px}' +
    '.gp-lb-list{list-style:none;padding:0;margin:0 0 6px}.gp-lb-row{display:flex;gap:8px;align-items:center;padding:6px 8px;border-bottom:1px solid #eadcc8;font-size:.9rem}' +
    '.gp-lb-top{background:#fdf6ef;border-radius:6px}.gp-lb-rank{width:26px;text-align:center}.gp-lb-name{flex:1;font-weight:700;color:#5C4033;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.gp-lb-time{font-variant-numeric:tabular-nums;color:#217119;font-weight:700}.gp-lb-empty{padding:10px;color:#8b7d6f;font-size:.85rem;line-height:1.6}' +
    '.gp-lb-login{display:inline-block;margin-top:6px;padding:6px 14px;background:#A94E2B;color:#fff;border-radius:8px;font-weight:700;font-size:.85rem;text-decoration:none}.gp-lb-login:hover{background:#8F3F20;color:#fff}' +
    '.gp-lb-foot{padding-top:4px}';
  document.head.appendChild(css);
})();
