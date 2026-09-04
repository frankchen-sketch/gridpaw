/**
 * Daily Challenge Framework
 * 
 * Provides: date-based seed generation, streak tracking, badge system, localStorage persistence
 * 
 * Usage:
 *   import { DailyChallenge } from '/lib/daily-challenge.js';
 *   const dc = new DailyChallenge('meowtrail');
 *   const seed = dc.getDailySeed();
 *   const state = dc.loadState();
 *   dc.saveState(true, 120); // solved in 120 seconds
 *   const badge = dc.getBadge(state.streak);
 */

export interface DailyState {
  date: string;
  streak: number;
  bestStreak: number;
  solved: boolean;
  bestTime: number | null;
  lastPlayedDate?: string;
}

export interface Badge {
  emoji: string;
  label: string;
  color: string;
}

export class DailyChallenge {
  private storageKey: string;

  /**
   * @param siteId - Unique site identifier for localStorage key (e.g. 'meowtrail', 'meowblock')
   */
  constructor(siteId: string) {
    this.storageKey = `${siteId}-daily`;
  }

  /** Get today's date string (YYYY-MM-DD) */
  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  /** Get yesterday's date string (YYYY-MM-DD) */
  getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  /** Generate a deterministic seed based on today's date */
  getDailySeed(): number {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  }

  /** Create a seeded random number generator */
  seededRandom(seed: number): () => number {
    let s = seed;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /** Load daily state from localStorage, handling streak continuity */
  loadState(): DailyState | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const d = JSON.parse(raw);
      const today = this.getToday();

      // Already loaded today
      if (d.date === today) return d;

      // Check if streak continues (played yesterday)
      const yesterday = this.getYesterday();
      const lastDate = d.lastPlayedDate || d.date;
      if (lastDate === yesterday) {
        return { date: today, streak: d.streak, bestStreak: d.bestStreak, solved: false, bestTime: d.bestTime };
      }

      // Streak broken
      return { date: today, streak: 0, bestStreak: d.bestStreak, solved: false, bestTime: d.bestTime };
    } catch {
      return null;
    }
  }

  /** Save state after solving (updates streak, best time) */
  saveState(solved: boolean, time?: number): DailyState {
    const today = this.getToday();
    let st = this.loadState() || { date: today, streak: 0, bestStreak: 0, bestTime: null };

    if (solved && !st.solved) {
      st.streak += 1;
      st.bestStreak = Math.max(st.bestStreak, st.streak);
      st.solved = true;
      if (time && (!st.bestTime || time < st.bestTime)) {
        st.bestTime = time;
      }
    }

    st.lastPlayedDate = today;
    st.date = today;
    localStorage.setItem(this.storageKey, JSON.stringify(st));
    return st;
  }

  /** Get badge based on streak count */
  getBadge(streak: number): Badge | null {
    if (streak >= 30) return { emoji: '👑', label: 'Cat Royalty', color: '#FFD700' };
    if (streak >= 14) return { emoji: '💎', label: 'Diamond Paw', color: '#00BCD4' };
    if (streak >= 7) return { emoji: '🌟', label: 'Star Cat', color: '#FF9800' };
    if (streak >= 3) return { emoji: '🔥', label: 'On Fire', color: '#E8956A' };
    return null;
  }

  /** Format seconds to MM:SS */
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  }

  /** Check if today's challenge is already solved */
  isSolvedToday(): boolean {
    const state = this.loadState();
    return state ? state.solved : false;
  }
}

/**
 * Inline version for use in <script is:inline> blocks
 * Copy this class into your inline script when you can't use ES modules
 */
export const dailyChallengeInline = `
var DailyChallenge = (function() {
  function DailyChallenge(siteId) { this.storageKey = siteId + '-daily'; }
  DailyChallenge.prototype.getToday = function() { return new Date().toISOString().split('T')[0]; };
  DailyChallenge.prototype.getYesterday = function() { var d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; };
  DailyChallenge.prototype.getDailySeed = function() { var t = new Date(); return t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate(); };
  DailyChallenge.prototype.seededRandom = function(seed) { var s = seed; return function() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
  DailyChallenge.prototype.loadState = function() {
    var raw = localStorage.getItem(this.storageKey); if (!raw) return null;
    try {
      var d = JSON.parse(raw); var today = this.getToday();
      if (d.date === today) return d;
      var yesterday = this.getYesterday(); var lastDate = d.lastPlayedDate || d.date;
      if (lastDate === yesterday) return { date: today, streak: d.streak, bestStreak: d.bestStreak, solved: false, bestTime: d.bestTime };
      return { date: today, streak: 0, bestStreak: d.bestStreak, solved: false, bestTime: d.bestTime };
    } catch(e) { return null; }
  };
  DailyChallenge.prototype.saveState = function(solved, time) {
    var today = this.getToday(); var st = this.loadState() || { date: today, streak: 0, bestStreak: 0, bestTime: null };
    if (solved && !st.solved) { st.streak += 1; st.bestStreak = Math.max(st.bestStreak, st.streak); st.solved = true; if (time && (!st.bestTime || time < st.bestTime)) st.bestTime = time; }
    st.lastPlayedDate = today; st.date = today; localStorage.setItem(this.storageKey, JSON.stringify(st)); return st;
  };
  DailyChallenge.prototype.getBadge = function(streak) {
    if (streak >= 30) return { emoji: '👑', label: 'Cat Royalty', color: '#FFD700' };
    if (streak >= 14) return { emoji: '💎', label: 'Diamond Paw', color: '#00BCD4' };
    if (streak >= 7) return { emoji: '🌟', label: 'Star Cat', color: '#FF9800' };
    if (streak >= 3) return { emoji: '🔥', label: 'On Fire', color: '#E8956A' };
    return null;
  };
  DailyChallenge.prototype.formatTime = function(s) { return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); };
  DailyChallenge.prototype.isSolvedToday = function() { var st = this.loadState(); return st ? st.solved : false; };
  return DailyChallenge;
})();
`;
