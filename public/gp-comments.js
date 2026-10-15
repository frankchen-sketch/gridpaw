// GPComments — 侦探留言墙客户端运行时（设计稿 gridpaw-badges-comments.html ④C）
// 由 DetectiveWall.astro（murdoku / shikaku）引入。职责：
//   1. fetch GET /api/comments?game=X → 渲染已审核评论 + gp_event 自动行（首字母头像 + 相对时间）
//   2. 评论框默认收起；展开时才加载 Turnstile widget（siteKey 来自 GET 响应，key 不进前端构建）
//   3. POST /api/comments → pending 提示；错误码映射成人话（not_played / captcha_failed / rate_limited）
// 安全：所有用户内容走 textContent/DOM API，不拼 innerHTML（无 Markdown 渲染，纯文本墙）。
(function () {
  if (window.GPComments) return;

  function visitorQuery() {
    try {
      var a = localStorage.getItem('gp_anon_id');
      if (a && /^anon-[0-9a-fA-F-]{6,70}$/.test(a)) return '&anonId=' + encodeURIComponent(a);
    } catch (e) { /* 存储被拒，降级 cookie */ }
    return '';
  }

  function relTime(ms) {
    var s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
    if (s < 60) return 'just now';
    var m = Math.floor(s / 60);
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    var d = Math.floor(h / 24);
    return d + 'd ago';
  }

  // 一行墙 = 首字母头像 + meta（名字 · 时间 [+ 徽章 chip]）+ 正文
  function row(item, opts) {
    var li = document.createElement('div');
    li.className = 'gpw-row' + (opts && opts.auto ? ' gpw-auto' : '');

    var av = document.createElement('span');
    av.className = 'gpw-avatar';
    av.setAttribute('aria-hidden', 'true');
    av.textContent = item.initial || '?';
    li.appendChild(av);

    var body = document.createElement('div');
    body.className = 'gpw-body';

    var meta = document.createElement('div');
    meta.className = 'gpw-meta';
    var name = document.createElement('b');
    name.textContent = item.name;
    meta.appendChild(name);
    meta.appendChild(document.createTextNode(' · ' + relTime(item.at)));
    (item.badges || []).forEach(function (b) {
      var chip = document.createElement('span');
      chip.className = 'gpw-chip';
      chip.textContent = b.label;
      chip.title = b.id;
      meta.appendChild(chip);
    });
    if (opts && opts.auto) {
      var tag = document.createElement('span');
      tag.className = 'gpw-autotag';
      tag.textContent = 'auto';
      meta.appendChild(tag);
    }
    body.appendChild(meta);

    var txt = document.createElement('div');
    txt.className = 'gpw-txt';
    txt.textContent = item.text;
    body.appendChild(txt);

    li.appendChild(body);
    return li;
  }

  function errMsg(code, data) {
    if (code === 403 && data && data.error === 'not_played') {
      return 'The wall is for detectives — solve a case or a puzzle first, then come back.';
    }
    if (code === 403) return 'Verification failed — please try again.';
    if (code === 429) return 'Too many notes today (max 2 per day) — come back tomorrow.';
    if (code === 413 || code === 400) return 'That note could not be accepted (keep it 2–500 characters).';
    if (code === 503) return 'Commenting is not open yet — check back soon.';
    return 'Something went wrong — please try again.';
  }

  function boot() {
    var root = document.querySelector('[data-gp-wall]');
    if (!root || root._booted) return;
    root._booted = true;
    var game = root.getAttribute('data-game');
    var listEl = root.querySelector('[data-gpw-list]');
    var formEl = root.querySelector('[data-gpw-form]');
    var openBtn = root.querySelector('[data-gpw-open]');
    var boxEl = root.querySelector('[data-gpw-box]');
    var ta = root.querySelector('[data-gpw-text]');
    var submitBtn = root.querySelector('[data-gpw-submit]');
    var msgEl = root.querySelector('[data-gpw-msg]');
    var captchaEl = root.querySelector('[data-gpw-captcha]');
    var counterEl = root.querySelector('[data-gpw-count]');
    var siteKey = null;
    var widgetId = null;
    var captchReady = false;

    function say(text, isErr) {
      if (!msgEl) return;
      msgEl.textContent = text;
      msgEl.className = 'gpw-msg' + (isErr ? ' gpw-msg-err' : '');
      msgEl.hidden = false;
    }

    function renderWall(data) {
      if (!listEl) return;
      listEl.textContent = '';
      (data.comments || []).forEach(function (c) { listEl.appendChild(row(c)); });
      (data.auto || []).forEach(function (a) { listEl.appendChild(row(a, { auto: true })); });
      if (!(data.comments || []).length && !(data.auto || []).length) {
        var empty = document.createElement('div');
        empty.className = 'gpw-empty';
        empty.textContent = 'The case files are empty — be the first detective to leave a note.';
        listEl.appendChild(empty);
      }
    }

    fetch('/api/comments?game=' + encodeURIComponent(game) + visitorQuery(), { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) { if (listEl) listEl.textContent = ''; return; }
        siteKey = d.siteKey || null;
        renderWall(d);
        // 没玩过（近 7 天无 level_up/game_over）也照常展开——服务端闸门会用文案解释
      })
      .catch(function () { /* 墙降级为空，不挡游戏 */ });

    // 展开时才加载 Turnstile（设计稿 ⑤：widget 只在评论框展开时渲染）
    function loadCaptcha() {
      if (!siteKey || captchReady || !captchaEl) return Promise.resolve();
      captchReady = true;
      return new Promise(function (resolve) {
        var s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.onload = function () {
          try {
            widgetId = window.turnstile.render(captchaEl, { sitekey: siteKey, theme: 'light' });
          } catch (e) { /* 渲染失败 → 提交时服务端会拦 */ }
          resolve();
        };
        s.onerror = function () { resolve(); };
        document.head.appendChild(s);
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', function () {
        openBtn.hidden = true;
        if (formEl) formEl.hidden = false;
        loadCaptcha();
        if (ta) ta.focus();
      });
    }

    function refreshCount() {
      if (!counterEl || !ta) return;
      var n = ta.value.length;
      counterEl.textContent = n + '/500';
      counterEl.className = 'gpw-count' + (n > 500 ? ' gpw-count-over' : '');
    }
    if (ta) ta.addEventListener('input', refreshCount);

    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        if (!ta) return;
        var text = ta.value.trim();
        if (text.length < 2 || text.length > 500) { say('Keep your note between 2 and 500 characters.', true); return; }
        submitBtn.disabled = true;
        var token = '';
        try {
          if (widgetId !== null && window.turnstile) token = window.turnstile.getResponse(widgetId) || '';
        } catch (e) { /* widget 未就绪 */ }
        var body = { game: game, text: text, token: token };
        try {
          var a = localStorage.getItem('gp_anon_id');
          if (a) body.anonId = a;
        } catch (e) { /* 降级 cookie */ }
        fetch('/api/comments', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(body),
        })
          .then(function (r) { return r.json().then(function (d) { return { status: r.status, data: d }; }); })
          .then(function (res) {
            submitBtn.disabled = false;
            if (res.status === 200 || (res.data && res.data.ok)) {
              ta.value = '';
              refreshCount();
              if (boxEl) boxEl.hidden = true;
              if (openBtn) { openBtn.hidden = false; openBtn.textContent = '✅ Note sent for review'; }
              say('Sent! Your note appears once a moderator approves it (usually within a day).');
              return;
            }
            if (res.data && res.data.error === 'captcha_failed' && widgetId !== null && window.turnstile) {
              try { window.turnstile.reset(widgetId); } catch (e) { /* noop */ }
            }
            say(errMsg(res.status, res.data), true);
          })
          .catch(function () {
            submitBtn.disabled = false;
            say('Network hiccup — please try again.', true);
          });
      });
    }
  }

  window.GPComments = { boot: boot };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
