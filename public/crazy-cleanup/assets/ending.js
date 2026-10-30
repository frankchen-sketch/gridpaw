/* GameEnding — 结算页模板组件（win/lose + 分享三按钮，跨游戏复用）
   用法:
     GameEnding.win({seq, theme, stats:{items,buckets,timeSec,hintsLeft,pliersLeft}, nextSeq, onNext, onRestart, mount})
     GameEnding.lose({seq, onRestart, mount})
   分享: 📋 Copy / 𝕏 Share / 👽 Reddit；每次分享派发 window 事件 'game_share' {detail:{platform,seq}}（GA4 打点挂这里）。 */
(function(){
  function shareText(s){
    return `I cleared Level ${s.seq} (${s.theme}) in Crazy Cleanup — ${s.stats.items} items sorted, ` +
      `${s.stats.buckets} buckets! Can you beat my time (${s.stats.timeSec}s)?`;
  }
  function shareUrl(){
    return location.origin + location.pathname + '?l=' + (new URLSearchParams(location.search).get('l') || 1);
  }
  function fire(platform, seq){
    window.dispatchEvent(new CustomEvent('game_share', {detail:{platform, seq}}));
  }
  function buildShareRow(ov, s){
    const row = document.createElement('div');
    row.className = 'share-row';
    const mk = (label, fn) => {
      const b = document.createElement('button');
      b.className = 'share-btn'; b.textContent = label; b.onclick = fn;
      row.appendChild(b);
    };
    mk('📋 Copy', () => {
      const txt = shareText(s) + ' ' + shareUrl();
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(() => toastOk(ov, 'Copied!'))
        .catch(() => { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toastOk(ov, 'Copied!'); });
      fire('copy', s.seq);
    });
    mk('𝕏 Share', () => {
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText(s)) + '&url=' + encodeURIComponent(shareUrl()), '_blank');
      fire('twitter', s.seq);
    });
    mk('👽 Reddit', () => {
      window.open('https://www.reddit.com/submit?url=' + encodeURIComponent(shareUrl()) + '&title=' + encodeURIComponent(shareText(s)), '_blank');
      fire('reddit', s.seq);
    });
    ov.appendChild(row);
  }
  function toastOk(ov, msg){
    let t = ov.querySelector('.copy-ok');
    if(!t){ t = document.createElement('div'); t.className = 'copy-ok sub'; ov.appendChild(t); }
    t.textContent = msg;
  }
  function statsRow(ov, stats){
    const d = document.createElement('div');
    d.className = 'ov-stats';
    d.innerHTML = `<span><b>${stats.items}</b>items</span><span><b>${stats.buckets}</b>buckets</span>` +
      `<span><b>${stats.timeSec}s</b>time</span><span><b>${stats.hintsLeft}</b>hints left</span>`;
    ov.appendChild(d);
  }

  function win(opt){
    const mount = typeof opt.mount === 'string' ? document.querySelector(opt.mount) : opt.mount;
    if(mount.querySelector('.overlay')) return;
    if(opt.seq && opt.stats) GameProgress.unlock(opt.seq + 1);
    const ov = document.createElement('div');
    ov.className = 'overlay'; ov.id = 'ending';
    ov.innerHTML = `<h2>🎉 Level Clear!</h2><div class="sub">${opt.theme || ''} · all buckets filled</div>`;
    statsRow(ov, opt.stats);
    buildShareRow(ov, {seq: opt.seq, theme: opt.theme, stats: opt.stats});
    const act = document.createElement('div');
    act.className = 'end-actions';
    const next = document.createElement('button');
    next.textContent = '▶ Next Level';
    next.onclick = () => { if(opt.onNext) opt.onNext(); };
    act.appendChild(next);
    const home = document.createElement('button');
    home.className = 'ghost'; home.textContent = 'Home';
    home.onclick = () => { location.href = 'index.html'; };
    act.appendChild(home);
    ov.appendChild(act);
    mount.appendChild(ov);
  }

  function lose(opt){
    const mount = typeof opt.mount === 'string' ? document.querySelector(opt.mount) : opt.mount;
    if(mount.querySelector('.overlay')) return;
    const ov = document.createElement('div');
    ov.className = 'overlay'; ov.id = 'ending';
    ov.innerHTML = `<h2>💥 Tray Full</h2><div class="sub">All 6 slots occupied — you lose</div>` +
      `<div class="end-actions"><button onclick="location.reload()">Restart</button></div>`;
    mount.appendChild(ov);
  }

  window.GameEnding = { win, lose };
})();
