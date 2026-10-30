/* Crazy Cleanup — engine v1（从 L47 试玩原型重构为数据驱动）
   依赖: window.__PACK（packs/level-XX.js 提供）、GameNav、GameEnding。
   机制契约（tidy-sort-game-mechanics）: 逐像素被压 15%、像素级拾取、hint/钳各×3 不补、
   tray 6/6 满判负唯一出口、隐藏 tab 用 setTimeout 不用 rAF。 */
(function(){
'use strict';
const scene = document.getElementById('scene');
const rack = document.getElementById('rack');
const stashrow = document.getElementById('stashrow');
let ITEMS = [], BUCKETS = [], FN = {}, SPR = {}, CFG = {};
let alive, openQ, opened, done, have, pliers, forceMode, busy, collected, stash, stashOpen, adRunning, hints;
let SEQ = 1, THEME = '', startTime = 0;
let firstMoved = false;
const els = [];
const TOTAL = () => BUCKETS.reduce((s, b) => s + b.need, 0);
function ccTrack(ev, meta){
  // 站内漏斗打点（gp-track.js 白名单事件；本地/非生产域名静默跳过）
  try { if (typeof window.gpTrack === 'function') window.gpTrack(ev, Object.assign({ game: 'crazy-cleanup', level: 'cc-' + SEQ }, meta || {})); } catch(e) {}
}

/* ---- 拾取缓冲：像素级命中 ---- */
const pickCv = document.createElement('canvas');
const pickCtx = pickCv.getContext('2d', {willReadFrequently: true});
const maskOk = [], maskCv = [];
function buildMask(i){
  const it = ITEMS[i], el = els[i];
  const w = Math.max(1, Math.round(it.w / 100 * scene.clientWidth));
  const h = Math.max(1, Math.round(it.h / 100 * scene.clientHeight));
  const m = document.createElement('canvas'); m.width = w; m.height = h;
  const mc = m.getContext('2d');
  mc.translate(w / 2, h / 2); mc.rotate((it.a || 0) * Math.PI / 180); mc.scale(it.sx, it.sy);
  mc.drawImage(el, -w / 2, -h / 2, w, h);
  mc.setTransform(1, 0, 0, 1, 0, 0);
  mc.globalCompositeOperation = 'source-in';
  mc.fillStyle = `rgb(${(i + 1) >> 8},${(i + 1) & 255},0)`;
  mc.fillRect(0, 0, w, h);
  maskCv[i] = m; maskOk[i] = true;
}
function redrawPick(){
  pickCv.width = scene.clientWidth; pickCv.height = scene.clientHeight;
  let pending = false;
  for(let i = 0; i < ITEMS.length; i++){
    if(!alive[i]) continue;
    if(!maskOk[i]){
      if(els[i].complete){ try{ buildMask(i); }catch(e){ maskOk[i] = true; maskCv[i] = null; } }
      else { pending = true; continue; }
    }
    if(!maskCv[i]) continue;
    const it = ITEMS[i];
    pickCtx.drawImage(maskCv[i], it.left / 100 * scene.clientWidth - maskCv[i].width / 2,
                                 it.top / 100 * scene.clientHeight - maskCv[i].height / 2);
  }
  if(pending) setTimeout(redrawPick, 60);
}
scene.addEventListener('click', e => {
  if(busy || adRunning || document.getElementById('ending')) return;
  const r = scene.getBoundingClientRect();
  const px = Math.floor(e.clientX - r.left), py = Math.floor(e.clientY - r.top);
  if(px < 0 || py < 0 || px >= pickCv.width || py >= pickCv.height) return;
  const d = pickCtx.getImageData(px, py, 1, 1).data;
  if(d[3] < 10) return;
  const i = (d[0] << 8 | d[1]) - 1;
  if(i >= 0 && i < ITEMS.length && alive[i]) tap(i, els[i]);
});

function init(pack){
  SEQ = pack.seq; THEME = pack.themeEn || 'Classic';
  SPR = pack.sprites; ITEMS = pack.items; BUCKETS = pack.buckets; CFG = pack.config || {};
  FN = {}; BUCKETS.forEach(b => FN[b.fam] = b.name);
  document.getElementById('hdr').querySelector('b').textContent = `🧹 Level ${SEQ} · ${THEME}`;
  const bg = scene.querySelector('img.bg');
  bg.src = pack.bg;
  scene.querySelectorAll('.it').forEach(e => e.remove());
  els.length = 0; maskOk.length = 0; maskCv.length = 0;
  ITEMS.forEach((it, i) => {
    const el = document.createElement('img');
    el.src = 'data:image/webp;base64,' + SPR[it.t];
    el.className = 'it';
    el.style.left = it.left + '%'; el.style.top = it.top + '%';
    el.style.width = it.w + '%'; el.style.height = it.h + '%';
    el.style.transform = `translate(-50%,-50%) rotate(${it.a}deg) scale(${it.sx},${it.sy})`;
    el.style.zIndex = 10 + i;
    els.push(el);
    scene.appendChild(el);
  });
  alive = ITEMS.map(() => true);
  openQ = []; opened = new Set(); done = new Set(); have = {};
  pliers = CFG.pliers || 3; forceMode = false; busy = false; collected = 0; adRunning = false;
  hints = CFG.hints || 3;
  stash = new Array(CFG.tray || 6).fill(null);
  stashOpen = stash.map(() => true);
  startTime = Date.now();
  openNext(); openNext();   // 原版双桶并行（大类去重由 openNext 内部保证）
  document.getElementById('pcount').textContent = '×' + pliers;
  document.getElementById('hcount').textContent = '×' + hints;
  renderRack(); renderStash(); prog();
  redrawPick();
  GameNav.render('#nav', {
    brand: '🧹 Crazy Cleanup', current: SEQ, theme: THEME,
    levels: window.__LEVELS || []
  });
  firstMoved = false;
  ccTrack('game_start');
}

function prog(){
  document.getElementById('prog').textContent = `Bucket ${Math.min(done.size + 1, BUCKETS.length)}/${BUCKETS.length} · Collected ${collected}/${TOTAL()}`;
}
function toast(m){
  const t = document.getElementById('toast');
  t.textContent = m; t.style.opacity = 1;
  clearTimeout(t._h); t._h = setTimeout(() => t.style.opacity = 0, 1800);
}
function openBucketDOM(b, cls){
  const d = document.createElement('div');
  d.className = 'bucket in ' + cls;
  d.innerHTML = `<div class="bbody"></div><div class="brim"></div>
    <div class="cnt">0/${b.need}</div><div class="ok">✅</div>
    <div class="bcat">${b.cat}</div>`;
  return d;
}
function renderRack(){
  rack.innerHTML = '';
  openQ.forEach((idx, k) => {
    const b = BUCKETS[idx];
    const d = openBucketDOM(b, k === 0 ? 'open1' : 'open2b');
    d.querySelector('.cnt').textContent = `${have[idx] || 0}/${b.need}`;
    rack.appendChild(d);
  });
}
function slotEl(idx){
  const s = document.createElement('div');
  s.className = 'slot';
  const it = stash[idx];
  if(it) s.innerHTML = `<img src="data:image/webp;base64,${SPR[it.t]}">`;
  return s;
}
function renderStash(){
  [...stashrow.querySelectorAll('.slot')].forEach(e => e.remove());
  for(let i = 0; i < stash.length; i++) stashrow.appendChild(slotEl(i));
}
function freeSlot(){ for(let i = 0; i < stash.length; i++) if(!stash[i] && stashOpen[i]) return i; return -1; }
function fly(el, targetRect, cb){
  busy = true;
  const r1 = el.getBoundingClientRect();
  const fl = document.createElement('img');
  fl.id = 'fly'; fl.src = el.src;
  Object.assign(fl.style, {left: r1.left + r1.width / 2 - 22 + 'px', top: r1.top + r1.height / 2 - 22 + 'px', width: '44px', height: '44px'});
  document.body.appendChild(fl);
  el.remove();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    Object.assign(fl.style, {left: targetRect.left + targetRect.width / 2 - 16 + 'px', top: targetRect.top + targetRect.height / 2 - 16 + 'px', width: '32px', height: '32px'});
  }));
  setTimeout(() => { fl.remove(); busy = false; cb(); }, 420);
}
function bucketRect(idx){
  const d = rack.querySelectorAll('.bucket')[openQ.indexOf(idx)];
  return d ? d.getBoundingClientRect() : rack.getBoundingClientRect();
}
function slotRect(idx){
  const s = stashrow.querySelectorAll('.slot')[idx];
  return s ? s.getBoundingClientRect() : stashrow.getBoundingClientRect();
}
/* ---- 核心交互 ---- */
function openNext(){
  const used = new Set(openQ.map(i => BUCKETS[i].cat));
  const cand = BUCKETS.map((b, i) => i)
    .filter(i => !done.has(i) && !openQ.includes(i) && !used.has(BUCKETS[i].cat));
  if(!cand.length) return;
  const ni = cand[Math.floor(Math.random() * cand.length)];
  openQ.push(ni);
  renderRack();
  returnStashFor(BUCKETS[ni].cat);   // 原版行为：同家族闲置件飞回
}
function collectArrive(i, idx){
  alive[i] = false; collected++;
  if(!firstMoved){ firstMoved = true; ccTrack('first_move'); }
  const idxKey = openQ[idx];
  have[idxKey] = (have[idxKey] || 0) + 1;
  const b = BUCKETS[idxKey];
  const d = rack.querySelectorAll('.bucket')[idx];
  d.querySelector('.cnt').textContent = `${have[idxKey]}/${b.need}`;
  d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop');
  prog(); redrawPick();
  if(have[idxKey] >= b.need) completeBucket(idx);   // 同步结算（✅ 动画由 .done 过渡承担）
}
function completeBucket(idx){
  const idxKey = openQ[idx];
  done.add(idxKey); openQ.splice(idx, 1);
  const d = rack.querySelectorAll('.bucket')[idx];
  if(d){ d.querySelector('.ok').style.opacity = 1; d.classList.add('done'); }
  toast(`Bucket done: ${FN[BUCKETS[idxKey].fam]} ✅`);
  renderRack(); prog();
  if(done.size >= BUCKETS.length) return winGame();
  openNext();
}
function stashArrive(i, idx){
  stash[idx] = {t: ITEMS[i].t, f: ITEMS[i].f, i: i};
  const s = stashrow.querySelectorAll('.slot')[idx];
  if(s){ s.innerHTML = `<img src="data:image/webp;base64,${SPR[ITEMS[i].t]}">`; s.classList.add('pulse'); }
  alive[i] = false; redrawPick();
  if(stash.filter(Boolean).length >= stash.length) setTimeout(loseGame, 500);
}
function returnStashFor(cat){
  // 开新桶时：闲置里「同家族可收」的件放回场上（原版行为）
  for(let i = 0; i < stash.length; i++){
    const s = stash[i];
    if(!s) continue;
    if(openQ.some(k => BUCKETS[k].fam === s.f && BUCKETS[k].cat === cat)){
      stash[i] = null;
      alive[s.i] = true;
      scene.appendChild(els[s.i]);
      const slot = stashrow.querySelectorAll('.slot')[i];
      if(slot) slot.innerHTML = '';
      redrawPick();
      return s.i;
    }
  }
  return -1;
}
function tap(i, el){
  const it = ITEMS[i];
  const famIdx = openQ.findIndex(k => BUCKETS[k].fam === it.f);   // 位置，collectArrive/completeBucket 均按 openQ 位置索引
  const buried = it.b && it.b.some(j => alive[j]);
  if(famIdx !== undefined && !buried){
    fly(el, bucketRect(famIdx), () => collectArrive(i, famIdx));
  }
  else if(famIdx === undefined){
    const idx = freeSlot();
    if(idx < 0) return;
    fly(el, slotRect(idx), () => stashArrive(i, idx));
    toast(`No ${FN[it.f]} bucket yet — parked in tray`);
  }
  else {
    // 被压：钳子模式强制搬走，否则抖动 + toast
    if(forceMode && pliers > 0){
      pliers--; document.getElementById('pcount').textContent = '×' + pliers;
      const idx = freeSlot();
      fly(el, slotRect(idx), () => stashArrive(i, idx));
      if(!pliers) forceMode = false, document.getElementById('pliers').classList.remove('armed');
      return;
    }
    el.classList.remove('deny'); void el.offsetWidth; el.classList.add('deny');
    toast('Buried under something — clear the top first');
  }
}
/* ---- hint：高亮一件当前可收的物品（×3 不补，答不上来不消耗） ---- */
function useHint(){
  if(busy || adRunning || document.getElementById('ending')) return;
  if(hints <= 0){ toast('No hints left — study the board'); ccTrack('hint_blocked', {why: 'exhausted'}); return; }
  const fams = new Set(openQ.map(i => BUCKETS[i].fam));
  const cands = [];
  ITEMS.forEach((it, i) => {
    if(alive[i] && fams.has(it.f) && (!it.b || !it.b.some(j => alive[j]))) cands.push(i);
  });
  if(!cands.length){
    const names = [...new Set(openQ.map(i => FN[BUCKETS[i].fam]))].join(', ');
    toast(`All ${names} items are buried — use 🔧 Pliers`);
    ccTrack('hint_blocked', {why: 'all-buried'});
    return;   // 答不上来就不烧提示
  }
  hints--; document.getElementById('hcount').textContent = '×' + hints;
  ccTrack('hint_click');
  const pick = cands[Math.floor(Math.random() * cands.length)];
  const el = els[pick];
  el.classList.remove('hintGlow'); void el.offsetWidth;
  el.classList.add('hintGlow');
  setTimeout(() => el.classList.remove('hintGlow'), 2600);
  toast(`💡 Try this: ${FN[ITEMS[pick].f]}`);
}
/* ---- 胜负：交 ending 模板 ---- */
function ccReportWin(){
  // 站内集成（gridpaw）：level_up 打点用 'cc-N' 命名空间（badge 派生端 distinct 计数，
  // 不进全局 maxLevel 数值线——与 murdoku '4x4'/'6x6' 同构）；成绩 POST /api/leaderboard。
  try {
    if (typeof window.gpTrack === 'function') window.gpTrack('level_up', { level: 'cc-' + SEQ, game: 'crazy-cleanup' });
  } catch(e) {}
  var anon = null;
  try { if (typeof window.gpAnonId === 'function') anon = window.gpAnonId(); } catch(e) {}
  if (!anon) return; // gp-track 未加载（本地预览）或身份链全断：不提交成绩
  try {
    fetch('/api/leaderboard', { method: 'POST', headers: {'content-type':'application/json'}, keepalive: true,
      body: JSON.stringify({ game: 'crazy-cleanup', date: new Date().toISOString().slice(0,10), timeMs: Date.now() - startTime, anonId: anon })
    }).catch(function(){});
  } catch(e) {}
}
function winGame(){
  try {
    try { ccReportWin(); } catch(e) {}
    GameEnding.win({
      seq: SEQ, theme: THEME, mount: scene,
      stats: {items: TOTAL(), buckets: BUCKETS.length, timeSec: Math.round((Date.now() - startTime) / 1000), hintsLeft: hints, pliersLeft: pliers},
      onNext: () => location.href = 'game.html?l=' + Math.min(SEQ + 1, (window.__LEVELS || []).length || SEQ)
    });
  } catch(e) { window.__ENDING_ERR = String(e && e.message || e); throw e; }
}
function loseGame(){
  ccTrack('game_over', {why: 'tray-full'});
  try { GameEnding.lose({seq: SEQ, mount: scene}); }
  catch(e) { window.__ENDING_ERR = String(e && e.message || e); throw e; }
}
function stuckCheck(){
  // 开放桶家族全被压且无空闲动作时给提示（不自动消耗任何资源）
  const fams = new Set(openQ.map(i => BUCKETS[i].fam));
  const any = ITEMS.some((it, i) => alive[i] && fams.has(it.f) && (!it.b || !it.b.some(j => alive[j])));
  if(!any) toast('Open buckets all buried — dig or use 🔧 Pliers');
}
/* ---- 工具按钮 ---- */
document.getElementById('reset').onclick = () => { ccTrack('puzzle_reset'); location.reload(); };
document.getElementById('hintbtn').onclick = useHint;
document.getElementById('pliers').onclick = function(){
  if(pliers > 0){
    forceMode = !forceMode;
    this.classList.toggle('armed', forceMode);
    if(forceMode) toast('Tap any item to move it out instantly');
  } else {
    toast('No pliers left — they don\'t refill in this build');
  }
};
window.Engine = {init};
// 分享三钮（ending.js dispatch window 'game_share'）→ 漏斗打点 share_copy/share_twitter/share_reddit
window.addEventListener('game_share', function(e){
  var d = e.detail || {};
  if(d.platform && ('share_' + d.platform).indexOf('undefined') === -1) ccTrack('share_' + d.platform, {seq: d.seq});
});
// 验收/调试暴露口（只读为主，hints/pliers 可写以便测试）
window.DBG = {
  get ITEMS(){return ITEMS}, get alive(){return alive}, get openQ(){return openQ},
  get BUCKETS(){return BUCKETS}, get hints(){return hints}, set hints(v){hints=v},
  get pliers(){return pliers}, set pliers(v){pliers=v},
  get stash(){return stash}, get els(){return els}, get done(){return done},
  get have(){return have}, get scene(){return scene}, get CFG(){return CFG},
  get busy(){return busy}, get collected(){return collected},
  // 测试动词（绕过 fly 动画直呼到达回调）
  forceCollect(i){ collectArrive(i, openQ.findIndex(k => BUCKETS[k].fam === ITEMS[i].f)); },
  forceStash(i){ stashArrive(i, stash.findIndex(s => !s)); },

};
})();

