/**
 * Room Sort 可玩引擎（原生 JS，无依赖）
 * 数据：/room-sort/index.json + /room-sort/levels/{N}.json（由 scripts/export-roomsort-play.mjs 生成）
 * 美术：/amochiroom/art/i/{fn}、level.bg
 *
 * 规则常量取自 APK 解包（research/amochiroom/EXPORT-SCHEMA.md）：
 *   ORDER_OPEN=2 开局同时开放的箱子数
 *   BUFFER_OPEN=5 / BUFFER_SLOTS=7 缓冲格
 * 遮挡交给 DOM hit-test（items 数组顺序即绘制顺序，后画的在上层）。
 */
(function () {
  'use strict';

  var ORDER_OPEN = 2;
  var ORDER_SLOTS = 3;
  var BUFFER_OPEN = 5;
  var BUFFER_SLOTS = 7;
  var ART = '/amochiroom/art/i/';
  var ANIM_MS = 260;

  var S = null;
  var ui = {};
  var indexCache = null;

  function q(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------- 状态裁定（迭代式，不用递归） ---------------- */

  // 把「箱子装满 → 从缓冲吸同类 → 补下一个箱子」跑成一个不动点循环。
  // 递归写法在「补上来的箱子正好被缓冲填满」时会重复进入，这里改成 while(changed)。
  function settle() {
    if (!S) return;
    var guard = 0;
    var changed = true;
    while (changed && guard++ < 200) {
      changed = false;

      // 1) 任何已装满的箱子标记完成
      for (var i = 0; i < S.boxes.length; i++) {
        var b = S.boxes[i];
        if (!b.done && b.left <= 0) {
          b.done = true;
          changed = true;
        }
      }

      // 2) 已开放且未完成的箱子，把缓冲里同类的吸进来
      for (var n = 0; n < S.open.length; n++) {
        var k = S.open[n];
        var bx = S.boxes[k];
        if (bx.done || bx.left <= 0) continue;
        for (var m = S.buffer.length - 1; m >= 0; m--) {
          if (bx.left > 0 && S.buffer[m].type === bx.type) {
            S.buffer.splice(m, 1);
            bx.left -= 1;
            changed = true;
          }
        }
      }

      // 3) 清掉已完成的开放位，按顺序补满 ORDER_OPEN
      var kept = [];
      for (var p = 0; p < S.open.length; p++) {
        if (!S.boxes[S.open[p]].done) kept.push(S.open[p]);
      }
      if (kept.length !== S.open.length) {
        S.open = kept;
        changed = true;
      }
      while (S.open.length < ORDER_OPEN) {
        var nx = -1;
        for (var z = 0; z < S.boxes.length; z++) {
          if (!S.boxes[z].done && S.open.indexOf(z) === -1) {
            nx = z;
            break;
          }
        }
        if (nx === -1) break;
        S.open.push(nx);
        changed = true;
      }
    }
  }

  function remainingItems() {
    var n = 0;
    for (var i = 0; i < S.boxes.length; i++) {
      if (!S.boxes[i].done) n += Math.max(0, S.boxes[i].left);
    }
    return n;
  }

  function findOpenBoxFor(type) {
    for (var n = 0; n < S.open.length; n++) {
      var k = S.open[n];
      var b = S.boxes[k];
      if (!b.done && b.left > 0 && b.type === type) return k;
    }
    return -1;
  }

  function canStillPlace() {
    for (var i = 0; i < S.items.length; i++) {
      var it = S.items[i];
      if (it.taken) continue;
      if (findOpenBoxFor(it.type) !== -1) return true;
    }
    return false;
  }

  function judge() {
    if (!S || S.over) return;
    if (remainingItems() <= 0) {
      S.over = 'win';
      var t = S.startedAt ? fmtTime(Date.now() - S.startedAt) : '—';
      stopTimer();
      paintHintBtn();
      setStatus('win', 'Room cleared — all ' + S.boxes.length + ' boxes filled in ' + t + '. 🎉');
      return;
    }
    if (S.buffer.length >= BUFFER_OPEN && !canStillPlace()) {
      S.over = 'fail';
      stopTimer();
      paintHintBtn();
      setStatus(
        'fail',
        'Dead end: the buffer is full and no open box wants anything left in the room.',
      );
    }
  }

  function setStatus(kind, text) {
    ui.status.hidden = false;
    ui.status.className = 'rs-status rs-status--' + kind;
    ui.status.textContent = text;
  }

  /* ---------------- 渲染 ---------------- */

  function paintRoom() {
    var d = S.data;
    ui.room.style.aspectRatio = d.bgW + ' / ' + d.bgH;
    ui.room.style.setProperty('--rs-ar', (d.bgW / d.bgH).toFixed(4));
    ui.room.style.backgroundImage = 'url(' + d.bg + ')';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < S.items.length; i++) {
      var it = S.items[i];
      if (it.taken) continue;
      var img = document.createElement('img');
      // 坐标公式照抄 src/pages/amochiroom/[slug].astro:281-300
      var left = ((d.bgW / 2 + it.x) / d.bgW) * 100;
      var top = ((d.bgH / 2 - it.y) / d.bgH) * 100;
      var wPct = (it.w / d.bgW) * 100;
      img.className = 'rs-item';
      img.src = ART + it.fn;
      img.alt = '';
      img.draggable = false;
      img.dataset.i = String(i);
      img.dataset.t = String(it.type);
      img.style.left = left.toFixed(2) + '%';
      img.style.top = top.toFixed(2) + '%';
      img.style.width = wPct.toFixed(2) + '%';
      img.style.height = 'auto';
      img.style.transform =
        'translate(-50%,-50%) rotate(' + -it.ang + 'deg) scale(' + it.fx + ',' + it.fy + ')';
      frag.appendChild(img);
    }
    ui.room.innerHTML = '';
    ui.room.appendChild(frag);
  }

  function paintBoxes() {
    var frag = document.createDocumentFragment();
    for (var slot = 0; slot < ORDER_SLOTS; slot++) {
      var k = S.open[slot];
      var card = document.createElement('div');
      card.className = 'rs-box';
      if (k === undefined) {
        card.className += ' rs-box--empty';
        card.innerHTML = '<span class="rs-box-name">—</span>';
      } else {
        var b = S.boxes[k];
        card.dataset.type = String(b.type);
        var done = b.count - b.left;
        card.innerHTML =
          '<span class="rs-box-name">' +
          esc(b.name) +
          '</span>' +
          '<span class="rs-box-count"><b>' +
          done +
          '</b> / ' +
          b.count +
          '</span>' +
          '<span class="rs-box-bar"><i style="width:' +
          (b.count ? (done / b.count) * 100 : 0) +
          '%"></i></span>' +
          '<span class="rs-box-thumbs">' +
          (b.thumbs || [])
            .slice(0, 3)
            .map(function (t) {
              return '<img src="' + ART + t + '" alt="" loading="lazy">';
            })
            .join('') +
          '</span>';
      }
      frag.appendChild(card);
    }
    ui.boxes.innerHTML = '';
    ui.boxes.appendChild(frag);
  }

  function paintBuffer() {
    var html = '';
    for (var i = 0; i < BUFFER_SLOTS; i++) {
      var isOpen = i < BUFFER_OPEN;
      var b = S.buffer[i];
      if (!isOpen) {
        html += '<span class="rs-slot rs-slot--locked" aria-hidden="true"></span>';
      } else if (b) {
        html +=
          '<span class="rs-slot rs-slot--used"><img src="' + ART + b.fn + '" alt="parked item"></span>';
      } else {
        html += '<span class="rs-slot"></span>';
      }
    }
    ui.buffer.innerHTML = html;
    ui.bufferCount.textContent = S.buffer.length + '/' + BUFFER_OPEN;
  }

  function render() {
    paintRoom();
    paintBoxes();
    paintBuffer();
  }

  /* ---------------- 交互 ---------------- */

  function tap(e) {
    var img = e.target && e.target.closest ? e.target.closest('.rs-item') : null;
    if (!img || !S || S.over) return;
    var i = Number(img.dataset.i);
    var it = S.items[i];
    if (!it || it.taken) return;

    var k = findOpenBoxFor(it.type);
    if (k !== -1) {
      startTimer();
      it.taken = true;
      S.boxes[k].left -= 1;
      img.classList.add('rs-item--gone');
      settle();
      finishTap();
    } else {
      if (S.buffer.length >= BUFFER_OPEN) {
        // 缓冲满时点击被拒；但如果此刻已经无处可放，就是真死局 —— 必须当场判负，
        // 否则玩家会卡在一个永远点不动的状态里（judge() 只在成功点击后跑，够不到这里）。
        if (!canStillPlace()) {
          S.over = 'fail';
          stopTimer();
          paintHintBtn();
          setStatus(
            'fail',
            'Dead end: the buffer is full and no open box wants anything left in the room.',
          );
        } else {
          setStatus('warn', 'Buffer is full — you can only tap items an open box wants right now.');
        }
        return;
      }
      startTimer();
      it.taken = true;
      S.buffer.push({ fn: it.fn, type: it.type });
      img.classList.add('rs-item--gone');
      settle();
      finishTap();
    }
  }

  function finishTap() {
    setTimeout(function () {
      render();
      judge();
    }, ANIM_MS);
  }

  /* ---------------- Hint / 计时 ---------------- */

  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function paintTimer() {
    if (!ui.timer) return;
    ui.timer.textContent = '⏱ ' + fmtTime(S ? S.elapsedMs : 0);
  }

  function startTimer() {
    if (!S || S.startedAt) return;
    S.startedAt = Date.now();
    S.timerId = setInterval(function () {
      if (!S || !S.startedAt) return;
      S.elapsedMs = Date.now() - S.startedAt;
      paintTimer();
    }, 250);
  }

  function stopTimer() {
    if (!S) return;
    if (S.startedAt) S.elapsedMs = Date.now() - S.startedAt;
    if (S.timerId) {
      clearInterval(S.timerId);
      S.timerId = 0;
    }
    paintTimer();
  }

  function paintHintBtn() {
    if (!ui.hintBtn) return;
    var left = S ? S.hints : 0;
    ui.hintBtn.textContent = 'Hint (' + left + ')';
    ui.hintBtn.disabled = !S || left <= 0 || !!S.over;
  }

  function hint() {
    if (!S || S.over || S.hints <= 0) return;
    var target = null;
    for (var i = 0; i < S.items.length; i++) {
      var it = S.items[i];
      if (!it.taken && findOpenBoxFor(it.type) !== -1) {
        target = it;
        break;
      }
    }
    if (!target) {
      setStatus('warn', 'Nothing to hint right now — check the buffer and the open boxes.');
      return;
    }
    S.hints -= 1;
    paintHintBtn();
    var el = ui.room.querySelector('.rs-item[data-i="' + target.i + '"]');
    if (el) {
      el.classList.add('rs-item--hint');
      setTimeout(function () {
        el.classList.remove('rs-item--hint');
      }, 2200);
    }
  }

  /* ---------------- 装载 ---------------- */

  function resetState(data) {
    var boxes = data.boxes
      .slice()
      .sort(function (a, b) {
        return a.queue - b.queue;
      })
      .map(function (b) {
        return {
          name: b.name,
          type: b.type,
          count: b.count,
          left: b.count,
          queue: b.queue,
          thumbs: b.thumbs || [],
          done: false,
        };
      });

    var items = data.items.map(function (it, i) {
      return {
        i: i,
        fn: it[0],
        x: it[1],
        y: it[2],
        fx: it[3],
        fy: it[4],
        ang: it[5],
        w: it[6],
        h: it[7],
        type: it[8],
        taken: false,
      };
    });

    if (S && S.timerId) clearInterval(S.timerId);
    S = {
      data: data,
      boxes: boxes,
      items: items,
      open: [],
      buffer: [],
      over: null,
      hints: 3,
      startedAt: 0,
      elapsedMs: 0,
      timerId: 0,
    };

    for (var n = 0; n < boxes.length && S.open.length < ORDER_OPEN; n++) {
      S.open.push(n);
    }
    settle();

    ui.status.hidden = true;
    ui.status.className = 'rs-status';
    ui.status.textContent = '';
    ui.title.textContent = 'Level ' + data.level + ' · ' + data.name;
    paintTimer();
    paintHintBtn();
  }

  function load(level) {
    return fetch('/room-sort/levels/' + level + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        resetState(data);
        render();
        try {
          localStorage.setItem('rs:last', String(level));
        } catch (e) {}
        if (ui.picker) ui.picker.value = String(level);
        try {
          var u = new URL(location.href);
          u.searchParams.set('level', String(level));
          history.replaceState(null, '', u);
        } catch (e) {}
      })
      .catch(function (err) {
        setStatus('fail', 'Could not load level ' + level + ' (' + err.message + ').');
      });
  }

  function loadIndex() {
    if (indexCache) return Promise.resolve(indexCache);
    return fetch('/room-sort/index.json')
      .then(function (r) {
        return r.json();
      })
      .then(function (list) {
        indexCache = list;
        return list;
      });
  }

  function buildPicker() {
    return loadIndex().then(function (list) {
      ui.picker.innerHTML = list
        .map(function (l) {
          return (
            // 不带 difficulty 后缀：手机上 375px 宽会把 "(middle)" 截掉，
            // 而当前关的名字和难度在上面的 rsLevelTitle 里已经有了。
            '<option value="' +
            l.level +
            '">Level ' +
            l.level +
            ' — ' +
            esc(l.name) +
            '</option>'
          );
        })
        .join('');
      ui.picker.addEventListener('change', function () {
        load(Number(ui.picker.value));
      });

      var params = new URLSearchParams(location.search);
      var want = Number(params.get('level')) || 0;
      if (!want) {
        try {
          want = Number(localStorage.getItem('rs:last')) || 0;
        } catch (e) {}
      }
      var exists = list.some(function (l) {
        return l.level === want;
      });
      if (!want || !exists) want = list[0].level;
      return want;
    });
  }

  function init() {
    ui.room = q('rsRoom');
    ui.boxes = q('rsBoxes');
    ui.buffer = q('rsBuffer');
    ui.bufferCount = q('rsBufferCount');
    ui.status = q('rsStatus');
    ui.picker = q('rsPicker');
    ui.title = q('rsLevelTitle');
    ui.hintBtn = q('rsHint');
    ui.timer = q('rsTimer');
    if (!ui.room || !ui.picker) return Promise.resolve();
    ui.room.addEventListener('click', tap);
    if (ui.hintBtn) ui.hintBtn.addEventListener('click', hint);
    return buildPicker().then(load);
  }

  window.RoomSort = {
    init: init,
    load: load,
    restart: function () {
      if (S) load(S.data.level);
    },
    // 测试用：返回当前状态快照（不暴露内部对象）
    snapshot: function () {
      if (!S) return null;
      return {
        level: S.data.level,
        over: S.over,
        open: S.open.slice(),
        buffer: S.buffer.length,
        remaining: remainingItems(),
        boxesDone: S.boxes.filter(function (b) {
          return b.done;
        }).length,
        boxesTotal: S.boxes.length,
        itemsLeft: S.items.filter(function (i) {
          return !i.taken;
        }).length,
      };
    },
  };
})();
