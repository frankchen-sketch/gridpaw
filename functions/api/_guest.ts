// 游客上榜（2026-10-22）：无登录的 anonId 成绩 + 确定性猫名
// 身份口径：anonId 与徽章/漏斗一致（anon-[0-9a-fA-F-]{6,70}，见 funnel-track.ts getAnonId）；
// game_results.user_id 存 'guest:<anonId>'，前缀保证永不与真实 users.id 撞。
// 猫名从 anonId FNV-1a 确定性派生——同一游客跨会话永远同名，无需建表。

export const GUEST_PREFIX = 'guest:';
export const ANON_ID_RE = /^anon-[0-9a-fA-F-]{6,70}$/;

const CAT_NAMES = [
  'Whiskers', 'Mochi', 'Tofu', 'Nori', 'Miso', 'Biscuit', 'Pixel', 'Waffle',
  'Peanut', 'Noodle', 'Sesame', 'Matcha', 'Pudding', 'Pickle', 'Bubbles', 'Cinnamon',
  'Pumpkin', 'Ginger', 'Clover', 'Marble', 'Zigzag', 'Domino', 'Puzzle', 'Socks',
];

export function isValidAnonId(a: unknown): a is string {
  return typeof a === 'string' && ANON_ID_RE.test(a);
}

export function isGuestUid(uid: string): boolean {
  return typeof uid === 'string' && uid.startsWith(GUEST_PREFIX);
}

// FNV-1a 32 位：h ^= byte; h *= 16777619（Math.imul 保 32 位）
export function guestName(anonId: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < anonId.length; i++) {
    h ^= anonId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const name = CAT_NAMES[h % CAT_NAMES.length];
  const num = 10 + ((h >>> 8) % 90); // 10-99
  return `${name} #${num}`;
}

// 从存储 uid 还原展示名：游客 → 猫名；登录 → 数据库名（缺省 Anonymous Cat）
export function displayNameFor(uid: string, dbName: string | null): { name: string; guest: boolean } {
  if (isGuestUid(uid)) return { name: guestName(uid.slice(GUEST_PREFIX.length)), guest: true };
  return { name: dbName || 'Anonymous Cat', guest: false };
}
