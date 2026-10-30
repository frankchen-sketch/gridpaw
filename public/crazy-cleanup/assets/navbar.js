/* GameNav — 导航栏模板组件（跨游戏复用）
   用法: GameNav.render('#nav', {brand, game:'cc', current:seq|null, levels:[{seq,themeEn,...}], onNavigate})
   约定: 进度存 localStorage 'cc_progress'（当前游戏）; 模板不含任何玩法逻辑。 */
(function(){
  const PROG_KEY = 'cc_progress';
  window.GameProgress = {
    get(){ return Math.max(1, parseInt(localStorage.getItem(PROG_KEY)) || 1); },
    unlock(seq){ if(seq > this.get()) localStorage.setItem(PROG_KEY, seq); }
  };

  function render(el, cfg){
    el = typeof el === 'string' ? document.querySelector(el) : el;
    const unlocked = GameProgress.get();
    el.innerHTML = `
      <div class="gn">
        <span class="gn-brand">${cfg.brand}</span>
        ${cfg.current ? `<span class="gn-level">Level ${cfg.current}${cfg.theme ? ' · ' + cfg.theme : ''}</span>` : ''}
        <span class="gn-spacer"></span>
        <button class="gn-btn" data-nav="home">🏠 Home</button>
        <button class="gn-btn" data-nav="grid">☰ Levels</button>
      </div>
      <div class="gn-grid" style="display:none"></div>`;
    el.querySelector('[data-nav="home"]').onclick = () => { location.href = 'index.html'; };
    const grid = el.querySelector('.gn-grid');
    el.querySelector('[data-nav="grid"]').onclick = () => {
      grid.style.display = grid.style.display === 'none' ? 'grid' : 'none';
    };
    document.addEventListener('click', e => {
      if(!el.contains(e.target)) grid.style.display = 'none';
    });
    grid.innerHTML = '';
    (cfg.levels || []).forEach(lv => {
      const locked = lv.seq > unlocked;
      const d = document.createElement('div');
      d.className = 'gn-cell' + (lv.seq === cfg.current ? ' cur' : '') + (locked ? ' locked' : '');
      d.innerHTML = `<b>${locked ? '🔒' : lv.seq}</b><small>${lv.themeEn || 'Level'} · ${lv.items}p</small>`;
      d.onclick = () => {
        if(locked) return;
        grid.style.display = 'none';
        if(cfg.onNavigate) cfg.onNavigate(lv.seq); else location.href = `game.html?l=${lv.seq}`;
      };
      grid.appendChild(d);
    });
  }
  window.GameNav = { render };
})();
