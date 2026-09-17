// GET /api/funnel?token=… —— 版本归因数据（见 GRIDPAW-FUNNEL-VERSIONING.md §3.6）
// 四段 SQL 并发查询（D1 .all() 只接受单条语句，见坑 #14），组装成每版本一行的漏斗。
// P0 用 token 保护；P1/P2 建议 /admin/* 换 CF Access，token 只留给 cron 采集。
import type { Env } from './_lib';
import { json } from './_lib';
import { STAGE_SQL, SIGNIN_SQL, TRAFFIC_SQL, LAST_VISIT_SQL, BUILDS_SQL } from './_funnel-sql';

interface StageRow { build_id: string; stage: string; n: number }
interface CountRow { build_id: string; n: number }
interface TrafficRow { build_id: string; src: string; n: number }
interface LastVisitRow { build_id: string; last_visit_ms: number }
interface BuildRow { build_id: string; commit_message: string | null; committed_at: string | null; first_seen_at: string }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!env.FUNNEL_ADMIN_TOKEN || token !== env.FUNNEL_ADMIN_TOKEN) {
    return json({ error: 'forbidden' }, 403);
  }

  const q = (sql: string) => env.meowtrail_users.prepare(sql).all();
  let stage, signin, traffic, lastVisit, builds;
  try {
    [stage, signin, traffic, lastVisit, builds] = await Promise.all([
      q(STAGE_SQL), q(SIGNIN_SQL), q(TRAFFIC_SQL), q(LAST_VISIT_SQL), q(BUILDS_SQL),
    ]);
  } catch (e) {
    return json({ error: 'query_failed', detail: String(e) }, 500);
  }

  const buildMeta = new Map<string, BuildRow>();
  for (const b of (builds.results as unknown as BuildRow[])) buildMeta.set(b.build_id, b);

  // 每版本的各阶段 visitor 数
  const stageMap = new Map<string, Record<string, number>>();
  for (const r of (stage.results as unknown as StageRow[])) {
    const row = stageMap.get(r.build_id) ?? {};
    row[r.stage] = r.n;
    stageMap.set(r.build_id, row);
  }
  const signinMap = new Map<string, number>();
  for (const r of (signin.results as unknown as CountRow[])) signinMap.set(r.build_id, r.n);
  const trafficMap = new Map<string, { source: string; n: number }[]>();
  for (const r of (traffic.results as unknown as TrafficRow[])) {
    const list = trafficMap.get(r.build_id) ?? [];
    list.push({ source: r.src, n: r.n });
    trafficMap.set(r.build_id, list);
  }
  const lastVisitMap = new Map<string, number>();
  for (const r of (lastVisit.results as unknown as LastVisitRow[])) lastVisitMap.set(r.build_id, r.last_visit_ms);

  // live 判定：最近 24h 有 visit；全无则 fallback 最近注册的版本（夜间无流量空态，坑 #7）
  const nowMs = Date.now();
  const fresh = new Set<string>();
  for (const [bid, ms] of lastVisitMap) {
    if (nowMs - Number(ms || 0) <= 24 * 3600 * 1000) fresh.add(bid);
  }
  let liveFallback = '';
  if (fresh.size === 0 && buildMeta.size > 0) {
    let best = '';
    for (const [bid, b] of buildMeta) {
      if (!best || (b.first_seen_at ?? '') > (buildMeta.get(best)?.first_seen_at ?? '')) best = bid;
    }
    liveFallback = best;
  }

  const STAGES = ['visit', 'start', 'move', 'solve', 'hint', 'share', 'signin'];
  const allBuildIds = new Set<string>([
    ...stageMap.keys(), ...signinMap.keys(), ...trafficMap.keys(),
  ]);
  // 版本化之前的访客（build_id 为空串）也占一行，便于看「升级前基线」
  const rows = Array.from(allBuildIds).map((bid) => {
    const meta = buildMeta.get(bid);
    const stages = stageMap.get(bid) ?? {};
    return {
      buildId: bid,
      commitMessage: meta?.commit_message ?? '',
      committedAt: meta?.committed_at ?? '',
      firstSeenAt: meta?.first_seen_at ?? '',
      live: fresh.has(bid) || (fresh.size === 0 && bid === liveFallback),
      stages: STAGES.map((s) => ({ stage: s, n: stages[s] ?? 0 })),
      signin: signinMap.get(bid) ?? 0,
      traffic: trafficMap.get(bid) ?? [],
    };
  });
  // 排序：''（版本化之前）恒最后 → live 置顶 → committed_at 新→旧
  rows.sort((a, b) => {
    if ((a.buildId === '') !== (b.buildId === '')) return a.buildId === '' ? 1 : -1;
    if (a.live !== b.live) return a.live ? -1 : 1;
    return (b.committedAt || '').localeCompare(a.committedAt || '');
  });

  return json({ now: new Date(nowMs).toISOString(), stages: STAGES, rows });
};
