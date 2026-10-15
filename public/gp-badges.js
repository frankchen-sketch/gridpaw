// GPBadges — 徽章客户端运行时：fetch /api/badges + localStorage 秒显 + 异步对账
// 由 BadgeUnlock.astro（三处 winOverlay）/ GameHub.astro（卡角）/ changelog 徽章墙引入。
//
// 两个集合：
//   acknowledged（gp_badges_v1）= 上次胜利弹层「已确认看过」的徽章 id——只在 win()/next() 推进；
//   boot 对账只派发 gp:badges 给墙/卡角，不推进 acknowledged——历史挣的徽章在本会话第一次
//   胜利弹层补显示，刚挣的（Murdoku level_up 在弹层前 POST）重试后立即显示。
// Shikaku/Akari 的 level_up 挂在 Next 点击（弹层关闭瞬间才 POST）→ next() 把新徽章存
// pending 队列（连同确认），下次胜利弹层补显示。
(function () {
  if (window.GPBadges) return;

  var KEY = 'gp_badges_v1';          // acknowledged：已确认看过的徽章 id 列表
  var PENDING = 'gp_badge_pending_v1'; // 待下次弹层补显示的 [{id,tier}]
  var TIER_ORDER = { bronze: 0, silver: 1, gold: 2, mythic: 3 };

  function readLS(k) {
    try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
  }
  function writeLS(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 存储被拒，降级 */ }
  }
  function acknowledged() { return readLS(KEY) || []; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function idsOf(list) {
    return (list || []).map(function (b) { return b.id; });
  }
  // 访客键：现网身份链 = funnel-track 存的 localStorage gp_anon_id（events.ts 每请求采纳它，
  // gp_gid cookie 实际不会被设置）。只读不新建——没跑过 funnel 的访客没有事件，也就没有徽章。
  function visitorQuery() {
    try {
      var a = localStorage.getItem('gp_anon_id');
      if (a && /^anon-[0-9a-fA-F-]{6,70}$/.test(a)) return '?anonId=' + encodeURIComponent(a);
    } catch (e) { /* 存储被拒，降级 cookie */ }
    return '';
  }
  function fetchBadges() {
    return fetch('/api/badges' + visitorQuery(), { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  function notify(d) {
    try { document.dispatchEvent(new CustomEvent('gp:badges', { detail: d })); } catch (e) { /* 旧浏览器降级 */ }
  }
  // 页面加载对账：只刷墙/卡角（gp:badges 事件），不推进 acknowledged
  function refresh() {
    return fetchBadges().then(function (d) { if (d) notify(d); return d; });
  }

  // 胜利弹层：POST 打点有落库延迟 → 最多 4 次重试对账；新徽章显示最高档一枚
  function win() {
    var prevIds = acknowledged();
    var fresh = null;
    var attempts = 0;
    function attempt() {
      attempts++;
      return fetchBadges().then(function (d) {
        fresh = d;
        var hasNew = fresh && fresh.badges.some(function (b) { return prevIds.indexOf(b.id) === -1; });
        if (hasNew || attempts >= 4) return;
        return sleep(600).then(attempt);
      });
    }
    return attempt().then(function () {
      var newOnes = fresh ? fresh.badges.filter(function (b) { return prevIds.indexOf(b.id) === -1; }) : [];
      var all = dedupe(newOnes.concat(readLS(PENDING) || []));
      writeLS(PENDING, []);
      if (fresh) writeLS(KEY, idsOf(fresh.badges)); // 本次弹层已确认
      if (all.length) {
        var best = all[0];
        for (var i = 1; i < all.length; i++) {
          if ((TIER_ORDER[all[i].tier] || 0) > (TIER_ORDER[best.tier] || 0)) best = all[i];
        }
        reveal(best.id);
      }
      return all.map(function (b) { return b.id; });
    });
  }

  function dedupe(list) {
    var seen = {};
    return list.filter(function (b) { if (seen[b.id]) return false; seen[b.id] = true; return true; });
  }

  // Next 点击（Shikaku/Akari：level_up 在此才 POST，弹层同时关闭）→ 新徽章进 pending + 确认，下次弹层补显示
  function next() {
    var prevIds = acknowledged();
    return fetchBadges().then(function (d) {
      if (!d || !d.badges) return [];
      var newOnes = d.badges.filter(function (b) { return prevIds.indexOf(b.id) === -1; });
      if (newOnes.length) writeLS(PENDING, dedupe((readLS(PENDING) || []).concat(newOnes)));
      writeLS(KEY, idsOf(d.badges)); // 新徽章交给 pending 负责展示，这里确认防重复
      return idsOf(newOnes);
    });
  }

  function reveal(id) {
    var rows = document.querySelectorAll('[data-gp-unlock-id="' + id + '"]');
    for (var i = 0; i < rows.length; i++) {
      rows[i].hidden = false;
      var box = rows[i].closest('[data-gp-unlock]');
      if (box) box.hidden = false;
    }
  }

  // 徽章墙：已获得去 locked 灰显；未登录显示被动续存提示行（勿弹窗）
  function wireWall() {
    document.addEventListener('gp:badges', function (e) {
      var d = e.detail || {};
      var earned = idsOf(d.badges);
      var cards = document.querySelectorAll('[data-gp-badge-wall] [data-badge-id]');
      for (var i = 0; i < cards.length; i++) {
        if (earned.indexOf(cards[i].getAttribute('data-badge-id')) !== -1) {
          cards[i].classList.remove('gp-wall-locked');
        }
      }
      var line = document.querySelector('[data-gp-signin-line]');
      if (line && d.signedIn === false) line.hidden = false;
    });
  }

  window.GPBadges = { refresh: refresh, win: win, next: next };

  function boot() {
    if (window.GPBadges._booted) return;
    window.GPBadges._booted = true;
    wireWall();
    refresh();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
