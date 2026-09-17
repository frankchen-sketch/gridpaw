// 漏斗共用常量：事件白名单 + 归因 SQL（events.ts 与 funnel.ts 共用）
// 事件名必须与现有 track() 埋点逐字一致（见 GRIDPAW-FUNNEL-VERSIONING.md §1.4 对账表），
// 新增业务事件时先加白名单再加埋点，顺序错了会 400 而不是静默丢弃。

// 用数组 + indexOf（本仓库 functions 无 tsc/lib 配置，避免 Set 泛型的 lint 假阳性）
export const FUNNEL_EVENT_LIST: string[] = [
  'visit',
  'game_start', 'first_move', 'level_up', 'level_complete_1', 'level_complete_3',
  'level_complete_5', 'level_complete_10', 'level_complete_20',
  'hint_click', 'hint_blocked', 'puzzle_reset', 'puzzle_skip', 'game_over',
  'daily_start', 'daily_solved', 'daily_challenge_click',
  'share_reddit', 'share_copy', 'share_twitter', 'community_click',
  'sign_in_prompt_shown', 'sign_in_click', 'tool_start', 'tool_action',
];

export function isFunnelEvent(name: string): boolean {
  return FUNNEL_EVENT_LIST.indexOf(name) !== -1;
}

export const GUEST_COOKIE = 'gp_gid';

// 访客 key：登录用户按 user_id 归并，未登录按 guest_id（坑 #12：登录前后是两个 key，P0 接受）
const VISITOR_KEY = `COALESCE(NULLIF(user_id, ''), guest_id)`;

// 首访 CTE：每个访客只按其**首次到访**的版本归因，回访不重归因（坑 #6，口径不要顺手优化）
const FIRST_VISIT_CTE = `
  WITH first_visit AS (
    SELECT ${VISITOR_KEY} AS visitor,
           build_id,
           COALESCE(
             NULLIF(json_extract(metadata, '$.attribution.utmSource'), ''),
             NULLIF(json_extract(metadata, '$.referrerHost'), ''),
             'organic/direct'
           ) AS src,
           ROW_NUMBER() OVER (PARTITION BY ${VISITOR_KEY} ORDER BY created_at ASC, id ASC) AS rn
    FROM gp_event
    WHERE event_name = 'visit'
  ),
  attributed AS (
    SELECT visitor, COALESCE(build_id, '') AS first_build FROM first_visit WHERE rn = 1
  )`;

// 阶段统计：多事件 → 单阶段。阶段 key 与看板/管理页逐字对齐（visit/start/move/solve/hint/share）
export const STAGE_SQL = `
  ${FIRST_VISIT_CTE},
  stages AS (
    SELECT ${VISITOR_KEY} AS visitor,
      CASE
        WHEN event_name = 'visit' THEN 'visit'
        WHEN event_name = 'game_start' THEN 'start'
        WHEN event_name = 'first_move' THEN 'move'
        WHEN event_name = 'level_up' THEN 'solve'
        WHEN event_name = 'hint_click' THEN 'hint'
        WHEN event_name IN ('share_reddit', 'share_copy') THEN 'share'
      END AS stage
    FROM gp_event
    WHERE event_name IN ('visit', 'game_start', 'first_move', 'level_up', 'hint_click', 'share_reddit', 'share_copy')
  )
  SELECT a.first_build AS build_id, s.stage AS stage, COUNT(DISTINCT s.visitor) AS n
  FROM stages s JOIN attributed a ON a.visitor = s.visitor
  WHERE s.stage IS NOT NULL
  GROUP BY a.first_build, s.stage`;

// 末阶段「signin」：等价 furriq 的 paid 列 —— 真登录用户数（daily_progress 只读 join，不动表结构）
export const SIGNIN_SQL = `
  ${FIRST_VISIT_CTE}
  SELECT a.first_build AS build_id, COUNT(DISTINCT dp.user_id) AS n
  FROM daily_progress dp JOIN attributed a ON a.visitor = dp.user_id
  GROUP BY a.first_build`;

// P1 流量构成：每版本每来源的首次到访访客数
export const TRAFFIC_SQL = `
  ${FIRST_VISIT_CTE}
  SELECT COALESCE(build_id, '') AS build_id, src, COUNT(*) AS n
  FROM first_visit
  WHERE rn = 1
  GROUP BY build_id, src
  ORDER BY n DESC`;

// live 判定原料：每版本最近一次 visit 时间（ms epoch）
export const LAST_VISIT_SQL = `
  SELECT COALESCE(build_id, '') AS build_id, MAX(created_at) AS last_visit_ms
  FROM gp_event
  WHERE event_name = 'visit' AND build_id IS NOT NULL
  GROUP BY build_id`;

// 版本注册表全量（commit 元数据 + first_seen_at，供 fallback live 与排序）
export const BUILDS_SQL = `
  SELECT build_id, commit_message, committed_at, first_seen_at FROM gp_build`;
