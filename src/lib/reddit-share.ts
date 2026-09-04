/**
 * Reddit share helper with html2canvas board screenshot
 * 
 * Requires html2canvas to be loaded (CDN or npm):
 *   <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
 * 
 * Usage:
 *   import { shareToReddit, captureBoardToClipboard } from '/lib/reddit-share.js';
 *   shareToReddit({ subreddit: 'meowtrail', text: 'I solved it!', boardElId: 'puzzle-grid' });
 */

declare global {
  interface Window {
    html2canvas: (el: HTMLElement, opts?: any) => Promise<HTMLCanvasElement>;
  }
}

interface RedditShareOptions {
  /** Subreddit name (without r/) */
  subreddit: string;
  /** Post title / share text */
  text: string;
  /** URL to include in the post */
  url?: string;
  /** ID of the board element to screenshot (optional) */
  boardElId?: string;
  /** Background color for the screenshot */
  bgColor?: string;
  /** Callback after successful clipboard copy of screenshot */
  onScreenshotCopied?: () => void;
  /** Callback after opening Reddit */
  onOpened?: () => void;
}

/**
 * Capture the game board as an image and copy to clipboard
 * Useful for Reddit paste (users can Ctrl+V the image into the post)
 */
export async function captureBoardToClipboard(
  boardElId: string,
  bgColor: string = '#FFF8F0'
): Promise<boolean> {
  try {
    const boardEl = document.getElementById(boardElId);
    if (!boardEl || typeof window.html2canvas === 'undefined') return false;
    
    const canvas = await window.html2canvas(boardEl, { backgroundColor: bgColor, scale: 2 });
    
    return new Promise((resolve) => {
      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) { resolve(false); return; }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          resolve(true);
        } catch (e) {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (e) {
    return false;
  }
}

/**
 * Open Reddit submission page with pre-filled title and URL
 * Optionally captures the board screenshot to clipboard first
 */
export async function shareToReddit(options: RedditShareOptions): Promise<void> {
  const {
    subreddit,
    text,
    url = `https://${window.location.hostname}`,
    boardElId,
    bgColor,
    onScreenshotCopied,
    onOpened,
  } = options;

  // Capture board screenshot if element ID provided
  if (boardElId) {
    const copied = await captureBoardToClipboard(boardElId, bgColor);
    if (copied && onScreenshotCopied) onScreenshotCopied();
  }

  // Build Reddit URL
  const redditUrl = `https://www.reddit.com/r/${subreddit}/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
  
  window.open(redditUrl, '_blank', 'noopener');
  if (onOpened) onOpened();
}

/**
 * Inline version for use in <script is:inline> blocks
 * Copy these functions into your inline script when you can't use ES modules
 */
export const redditShareInline = `
async function captureBoardToClipboard(boardElId, bgColor) {
  try {
    var boardEl = document.getElementById(boardElId);
    if (!boardEl || typeof html2canvas === 'undefined') return false;
    var canvas = await html2canvas(boardEl, { backgroundColor: bgColor || '#FFF8F0', scale: 2 });
    return new Promise(function(resolve) {
      canvas.toBlob(async function(blob) {
        if (!blob) { resolve(false); return; }
        try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); resolve(true); }
        catch(e) { resolve(false); }
      }, 'image/png');
    });
  } catch(e) { return false; }
}

async function shareToReddit(subreddit, text, url, boardElId, bgColor) {
  if (boardElId) await captureBoardToClipboard(boardElId, bgColor);
  var redditUrl = 'https://www.reddit.com/r/' + subreddit + '/submit?url=' + encodeURIComponent(url || window.location.href) + '&title=' + encodeURIComponent(text);
  window.open(redditUrl, '_blank', 'noopener');
}
`;
