// 徽章目录 + SVG 图标（设计稿 hermes-mobile/static/previews/gridpaw-badges-comments.html v1 逐字落地）
// 扁平 SVG 零外部图片依赖（「禁手绘猫 emoji」红线）；三组 11 枚全部派生自 gp_event 已有埋点，零新打点。
// game = 徽章归属组：'shikaku' 阶梯 / 'murdoku' 破案档案 / 'streak' 每日连击（无游戏卡角）。
// 数组顺序 = 组内档位升序（GameHub 卡角取「组内最后一枚已获得」= 最高档）。

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'mythic';

export interface BadgeDef {
  id: string;
  name: string;
  how: string;
  tier: BadgeTier;
  game: 'shikaku' | 'murdoku' | 'streak';
  svg: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'rookie-paw',
    name: 'Rookie Paw',
    how: 'Reach level 5',
    tier: 'bronze',
    game: 'shikaku',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#F3E3D3"/><circle cx="36" cy="36" r="26" fill="none" stroke="#B87333" stroke-width="2.5"/><g fill="#B87333"><ellipse cx="36" cy="44" rx="11" ry="9"/><ellipse cx="22" cy="32" rx="5" ry="6.5"/><ellipse cx="32" cy="25" rx="5" ry="6.5"/><ellipse cx="42" cy="25" rx="5" ry="6.5"/><ellipse cx="51" cy="32" rx="5" ry="6.5"/></g></svg>',
  },
  {
    id: 'detective',
    name: 'Detective',
    how: 'Reach level 10',
    tier: 'silver',
    game: 'shikaku',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#EAEEF3"/><circle cx="36" cy="36" r="26" fill="none" stroke="#94A3B8" stroke-width="2.5"/><g stroke="#64748B" stroke-width="4" fill="none" stroke-linecap="round"><circle cx="33" cy="33" r="12"/><line x1="42" y1="42" x2="54" y2="54"/></g></svg>',
  },
  {
    id: 'chief-detective',
    name: 'Chief Detective',
    how: 'Reach level 20',
    tier: 'gold',
    game: 'shikaku',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#FBEED8"/><circle cx="36" cy="36" r="26" fill="none" stroke="#D97706" stroke-width="2.5"/><path d="M36 18 L51 24 V37 C51 47 44 53 36 56 C28 53 21 47 21 37 V24 Z" fill="none" stroke="#D97706" stroke-width="3.5" stroke-linejoin="round"/><path d="M30 37 L35 42 L44 30" fill="none" stroke="#D97706" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    id: 'mastermind',
    name: 'Mastermind',
    how: 'Reach level 35',
    tier: 'mythic',
    game: 'shikaku',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#F6E7F0"/><circle cx="36" cy="36" r="26" fill="none" stroke="#A3447E" stroke-width="2.5"/><path d="M36 16 L40.7 30.4 H55.7 L43.7 39.2 L48.3 53.6 L36 44.9 L23.7 53.6 L28.3 39.2 L16.3 30.4 H31.3 Z" fill="none" stroke="#A3447E" stroke-width="3" stroke-linejoin="round"/></svg>',
  },
  {
    id: 'first-case-closed',
    name: 'First Case Closed',
    how: 'Close your first case',
    tier: 'bronze',
    game: 'murdoku',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#F3E3D3"/><circle cx="36" cy="36" r="26" fill="none" stroke="#B87333" stroke-width="2.5"/><rect x="24" y="26" width="24" height="20" rx="2.5" fill="none" stroke="#B87333" stroke-width="3"/><line x1="24" y1="32" x2="48" y2="32" stroke="#B87333" stroke-width="2.5"/><path d="M41 42 l3 3 l6 -7" fill="none" stroke="#B87333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    id: 'serial-solver',
    name: 'Serial Solver',
    how: 'Close 3 cases',
    tier: 'silver',
    game: 'murdoku',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#EAEEF3"/><circle cx="36" cy="36" r="26" fill="none" stroke="#94A3B8" stroke-width="2.5"/><g fill="none" stroke="#64748B" stroke-width="3" stroke-linejoin="round"><rect x="22" y="40" width="22" height="8" rx="2"/><rect x="25" y="32" width="22" height="8" rx="2"/><rect x="28" y="24" width="22" height="8" rx="2"/></g></svg>',
  },
  {
    id: 'six-six-cracked',
    name: '6×6 Cracked',
    how: 'Crack a 6×6 case',
    tier: 'gold',
    game: 'murdoku',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#FBEED8"/><circle cx="36" cy="36" r="26" fill="none" stroke="#D97706" stroke-width="2.5"/><g fill="none" stroke="#D97706" stroke-width="2.5"><rect x="20" y="20" width="32" height="32" rx="4"/><line x1="30.6" y1="20" x2="30.6" y2="52"/><line x1="41.3" y1="20" x2="41.3" y2="52"/><line x1="20" y1="30.6" x2="52" y2="30.6"/><line x1="20" y1="41.3" x2="52" y2="41.3"/></g><circle cx="25.3" cy="25.3" r="2.6" fill="#D97706"/><circle cx="46.6" cy="46.6" r="2.6" fill="#D97706"/></svg>',
  },
  {
    id: 'private-eye',
    name: 'Private Eye',
    how: 'Close 10 cases',
    tier: 'mythic',
    game: 'murdoku',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#F6E7F0"/><circle cx="36" cy="36" r="26" fill="none" stroke="#A3447E" stroke-width="2.5"/><text x="36" y="44" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="26" fill="#A3447E">10</text></svg>',
  },
  {
    id: 'warm-up',
    name: 'Warm-Up',
    how: '3-day daily streak',
    tier: 'bronze',
    game: 'streak',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#F3E3D3"/><circle cx="36" cy="36" r="26" fill="none" stroke="#B87333" stroke-width="2.5"/><path d="M36 20 C42 28 46 32 46 40 A10 10 0 0 1 26 40 C26 32 30 28 36 20 Z" fill="none" stroke="#B87333" stroke-width="3" stroke-linejoin="round"/><text x="36" y="47" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="14" fill="#B87333">3</text></svg>',
  },
  {
    id: 'streak-keeper',
    name: 'Streak Keeper',
    how: '7-day daily streak',
    tier: 'silver',
    game: 'streak',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#EAEEF3"/><circle cx="36" cy="36" r="26" fill="none" stroke="#94A3B8" stroke-width="2.5"/><path d="M36 18 C43 27 48 31 48 40 A12 12 0 0 1 24 40 C24 31 29 27 36 18 Z" fill="none" stroke="#64748B" stroke-width="3" stroke-linejoin="round"/><text x="36" y="48" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="14" fill="#64748B">7</text></svg>',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    how: '14-day daily streak',
    tier: 'gold',
    game: 'streak',
    svg: '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#FBEED8"/><circle cx="36" cy="36" r="26" fill="none" stroke="#D97706" stroke-width="2.5"/><path d="M36 16 C44 26 50 31 50 41 A14 14 0 0 1 22 41 C22 31 28 26 36 16 Z" fill="none" stroke="#D97706" stroke-width="3" stroke-linejoin="round"/><text x="36" y="49" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="14" fill="#D97706">14</text></svg>',
  },
];

export const BADGE_BY_ID: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b])
);
