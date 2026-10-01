/* GridPaw 带图分享（navigator.share files 方案）
 * 依赖：页面需先加载 html2canvas（CDN defer）
 * 用法：
 *   GPShare.shareWithImage({
 *     boardEl: document.getElementById('...'),
 *     filename: 'gridpaw-<game>.png',
 *     text: shareText(),
 *     url: 'https://gridpaw.com/<game>/',
 *     fallback: function () {}   // 系统面板不可用时走（如 X/Reddit intent 弹窗）
 *   }).then(function (shared) { ... });   // shared=true 系统面板完成（含用户取消）, false=走了 fallback
 */
(function () {
  'use strict';

  function toFile(canvas, filename) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        if (!blob) return resolve(null);
        try { resolve(new File([blob], filename, { type: 'image/png' })); }
        catch (e) { resolve(null); }
      }, 'image/png');
    });
  }

  var GPShare = {
    /** 棋盘 DOM → PNG File；任何失败返回 null，不抛 */
    boardFile: function (boardEl, filename, backgroundColor) {
      if (!boardEl || typeof html2canvas === 'undefined') return Promise.resolve(null);
      return html2canvas(boardEl, { backgroundColor: backgroundColor || '#f8f6ef', scale: 2, logging: false })
        .then(function (canvas) { return toFile(canvas, filename); })
        .catch(function () { return null; });
    },

    /**
     * 优先系统分享面板（可带图；移动端/Windows Chrome/Safari 支持）。
     * canShare 不通过或用户取消(非主动)时执行 fallback。用户滑动取消(AbortError)视为已处理。
     */
    shareWithImage: function (opts) {
      var fallback = opts.fallback || function () {};
      if (!navigator.share || !navigator.canShare) { fallback(); return Promise.resolve(false); }
      return GPShare.boardFile(opts.boardEl, opts.filename, opts.backgroundColor).then(function (file) {
        var payload = file
          ? { files: [file], text: opts.text || '', url: opts.url }
          : { text: opts.text || '', url: opts.url };
        if (!file || !navigator.canShare(payload)) { fallback(); return Promise.resolve(false); }
        return navigator.share(payload).then(function () {
          return true;
        }).catch(function (e) {
          if (e && e.name === 'AbortError') return true; // 用户主动关闭面板，不弹 fallback
          fallback();
          return false;
        });
      });
    }
  };

  window.GPShare = GPShare;
})();
