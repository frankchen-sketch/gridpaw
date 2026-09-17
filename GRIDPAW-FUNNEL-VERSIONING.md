# GridPaw 打点 + 版本归因漏斗实施文档

> 目标读者：接手 gridpaw 的实施 agent。照本文 P0 → P1 → P2 顺序做，不要跳期。
> 来源：furriq（cat-breed-clarity-app，TanStack Start + CF Workers + D1）2026-09-17/18 已落地的「自建打点 + 版本归因漏斗」方案（哥飞方法论），本文是它的**跨站适配指引**，不是照抄。
> 核对基准：furriq `HANDOFF.md`「自建漏斗 + 版本归因已上线」条目（commit `be29e5b` + `171b992`）；gridpaw 工作区 HEAD `299fa4c`（2026-09-18 实测 `git rev-parse --short HEAD`）。
> 口径纪律：本文涉及的数字都标了来源。凡标「未验证」的，动手前先自己验一遍再说。

---

## 1. 目标与架构总览

### 1.1 要解决什么问题

看板上的「改版效果」原本只有 GA4/GSC/Clarity/PostHog 四个外部口径，它们回答不了**「这次改动到底有没有让转化变好」**——因为没有一条数据把「谁的转化」和「哪一版代码服务了他」连起来。而且这个问题会被**流量构成**污染：一版恰好吃了搜索引擎流量、另一版恰好吃了一波社媒流量，转化率差异可能全是流量质量差异，跟代码无关（这就是「版本行会撒谎」）。

自建漏斗的做法：**在自家 D1 里落事件 + 每个事件带版本 key（git build id）+ 按访客首次到访版本归因**，用一张自己完全掌控的表回答版本对比，并且每行附上流量构成注脚。

### 1.2 furriq 参照实现 vs gridpaw 目标形态

| 维度 | furriq（已上线，参照） | gridpaw（本文目标） |
|---|---|---|
| 框架 | TanStack Start（SSR）+ CF Workers | Astro 5 静态输出 + CF Pages + Pages Functions |
| 版本注入 | `vite.config.ts` 的 `define: { __APP_BUILD__ }`（客户端 + SSR 同时注入） | 构建期生成文件 + Astro `define:vars`（functions 侧拿不到 vite define） |
| 上报端点 | `/api/events` Route（TanStack server route） | `functions/api/events.ts`（Pages Functions，`onRequestPost`） |
| 访客 id | 服务端签发 `guest_id` cookie（`getOrCreateGuestId`） | Functions 自管 `gp_gid` cookie（现有 `_lib.ts` 已有 `getCookie`/`json`，只需补签发） |
| 版本注册表 | `config` 表 key `funnel_builds`（读 JSON → 改 → 写回） | 新建 `gp_build` 表（`INSERT OR IGNORE`，天然并发安全） |
| 事件表 | `cat_breed_event`（Drizzle migration 0007 加 `build_id` 列） | 新建 `gp_event` 表（无 Drizzle，纯 SQL migration，一次建全） |
| 管理页 | `/admin/funnel`（TanStack 路由 + RBAC `admin.*` 权限） | 静态页 `/admin/funnel/` + Functions `/api/funnel?token=`（gridpaw 无登录后台体系） |
| 末阶段「付费」 | `order` 表 `status='paid'` join user | 无付费 → 用 `daily_progress.user_id`（真登录用户数）等价替代 |
| D1 库 | `cat-breed-clarity-db`（专用） | 复用 `meowtrail-users`（binding `meowtrail_users`，与 meowtrail 共库 → 表名必须 `gp_` 前缀） |
| 采集开关 | `CLIENT_EVENT_INGESTION_ENABLED` | 同名同义，gridpaw 建议 `FUNNEL_EVENT_INGESTION_ENABLED`（避免与已有配置混淆） |

### 1.3 五个必须在动手前定下的设计决策

1. **build id 走「构建期生成文件」，不依赖 `vite.define`**
   furriq 曾踩到的坑：`vite define` 在 dev 的 SSR 管线不生效。gridpaw 更极端——Astro 的 `<script is:inline>` 内联脚本**根本不经过 Vite 打包**（本仓库 `AGENTS.md` 已写明：引擎必须用 `is:inline` 加载），而游戏埋点 `track()` 全在这些内联脚本里。所以 gridpaw 用 `scripts/gen-build-info.mjs` 生成 `src/lib/app-build.generated.ts`，frontmatter 直接 `import`，再由 `<script define:vars={{ buildId }}>` 传进内联脚本。dev 下允许 build id 为空（反正只有生产域上报）。

2. **版本归属由客户端上报，不由 Functions 判定**
   `wrangler pages deploy dist` 是**直接上传本地构建产物**，没有 Cloudflare 构建环境，拿不到 `CF_PAGES_COMMIT_SHA` 之类的平台注入变量；Pages Functions 由 wrangler 用 esbuild 打包，也不经过 vite。所以 ingest 端点接收 payload 里的 `buildId`（长度/字符集校验即可，这不是安全边界）。副作用是**语义正确**：上报的是「渲染这份 HTML 的版本」，CDN 缓存里的旧页面会继续报旧 id——这正是我们想要的归因。

3. **`-dirty` 后缀必须保留**
   furriq 的设计：仓库有未提交改动时 build id 变 `<sha>-dirty`。gridpaw 的 `pnpm run deploy` 是 `wrangler pages deploy dist --commit-dirty=true`（部署本地 dist，可能不对应任何 commit），所以 `-dirty` 在这里**更能说明问题**——看到 `-dirty` 就知道线上跑的代码没有对应提交，别拿它和干净提交做 A/B 结论。

4. **事件名一律复用现有埋点名，不造第二套**
   gridpaw 现有 `track()` 已埋了 22 类事件（见 §1.4 对账表）。自建漏斗的阶段 = 这些埋点名的一个子集，**逐字一致**。新增**只有 `visit` 一个**（PostHog 侧没有版本语义的到达事件，不能用）。

5. **gridpaw 的第一层 `visit` 必须做 bot 过滤 + 记 UA**
   furriq 没这个问题，gridpaw 有：`STATUS.md` 实测「无品牌新站 Direct 占七成，其中**约 50% 会话来自云机房 IP**（Council Bluffs、Boardman、Ashburn…），特征是 0–31s、零 referrer」，Clarity 独立佐证「真人会话 27 / 机器人 52」。照抄 furriq 的话，版本漏斗第一层会被机房流量灌水几倍，版本之间毫无可比性。P0 至少要在 `visit` 的 metadata 里记 `ua` 与 `isLikelyBot`，并在归因 SQL 里可过滤（宁可先记后滤，也别先滤后无据）。

### 1.4 事件名对账表（动手前必须看）

**源码埋点实测**（`grep track('…' src/ --include=*.astro --include=*.ts`，2026-09-18，HEAD `299fa4c`）：

| 埋点名 | 源码出现次数 | 触发位置示例 |
|---|---|---|
| `game_start` | 11 | `src/pages/index.astro:1607`、akari 各页、pictomino |
| `level_up` | 10 | `index.astro` 通关（`nextBtn` 点击）、akari 各页 |
| `hint_click` | 10 | `index.astro:1238` |
| `first_move` | 10 | `index.astro:973` |
| `level_complete_<N>` | 9 | `index.astro:1226`，N ∈ {1,3,5,10,20}，**动态名**（里程碑） |
| `puzzle_reset` | 8 | — |
| `share_reddit` / `share_copy` / `daily_challenge_click` | 各 3 | `index.astro:1363` / `1329` / `1292-1293` |
| `daily_start` / `daily_solved` / `share_twitter` | 各 2 | `index.astro:1289` / `1109` |
| `community_click` / `sign_in_click` / `sign_in_prompt_shown` / `game_over` / `hint_blocked` / `puzzle_skip` / `tool_start` / `auth_error` | 各 1 | `index.astro:1299` 等 |
| `tool_action` | 2 | — |
| pictomino 副作用（`public/pictomino/*.html`）：`level_up` 6 / `puzzle_complete` 6 / `game_start` 4 / `community_click` 4 | | 纯静态 HTML，走 `public/analytics.js` |

**看板侧已入库实测**（`data/metrics.db` → `posthog_daily where site='gridpaw'`，90 天窗口，最新 `event_date=2026-09-17`）：

```
game_start 105 | hint_click 64 | first_move 17 | daily_start 13 | daily_solved 8
level_completed 3 | hint_blocked 2 | daily_challenge_click 2 | share_twitter 1 | share_reddit 1
```

**两处必须对账的差异**（不是我猜的，是上面两组数据的直接对照）：

- ⚠️ 看板 `scripts/aggregate.py` 的 `FUNNEL_STEP_DEFS["gridpaw"]` 目前是 `game_start / first_move / **level_completed** / daily_solved / **community_click** / share_reddit`。其中 `level_completed` 在 gridpaw 源码里**不存在**这个埋点名（源码是 `level_up` 和 `level_complete_<N>`），而采集层 `build_metrics.py:1427-1435` 只会把 `game_started` 归一成 `game_start`、并按 `level_up.level` 属性换算成 `level_complete_<N>`；`community_click` 在 90 天 posthog 数据里 0 条（源码也只 1 处埋点）。这两个名字如果照搬进自建漏斗，第 3/5 步会**静默为 0**——与 `aggregate.py` 注释里记的 2026-09-18 教训（首步曾写 `game_started`，静默丢掉整层漏斗）同源。
- ✅ 同名可直接用的：`game_start`、`first_move`、`daily_solved`、`share_reddit`。

**P0 推荐阶段（真实埋点名 + 有量）**：

| 序 | 阶段 key | 埋点名（逐字） | 对照看板 def | 处置 |
|---|---|---|---|---|
| 1 | `visit` | `visit`（**P0 新增**） | — | 自建独有 |
| 2 | `start` | `game_start` | `game_start` | 一致 |
| 3 | `move` | `first_move` | `first_move` | 一致 |
| 4 | `solve` | `level_up` | `level_completed` ⚠️ | 建议把看板 def 改成 `level_up`（最稳、有全量），或自建侧用 `level_complete_1` |
| 5 | `hint` | `hint_click` | `community_click` ⚠️ | 建议把看板 def 改成 `hint_click`（`community_click` 无数据） |
| 6 | `share` | `share_reddit` + `share_copy` | `share_reddit` | 自建侧两事件合并为一阶段即可 |
| 7 | `signin` | join `daily_progress.user_id` | — | 等价 furriq 的 `paid` 列 |

> 如果产品判断更认可另一组路径（`game_start → level_up → daily_start → daily_challenge_click → hint_click → share_copy`），它们**同样都是真实埋点名**，可以用——但**必须同时改三处**（`scripts/aggregate.py` 的 `FUNNEL_STEP_DEFS`、`js/tab-growth.js` 的 `GR_FUNNEL_DEFS`、`cron-dashboard/DATA_SOURCES.md` 对应小节；后两处注释已写明「三处同步」）。三处不同步 = 看板与自建漏斗各说各话，比没有更糟。

---

## 2. 分期实施计划

| 期 | 交付 | 判据（DoD） |
|---|---|---|
| **P0** | 埋点 + `gp_event`/`gp_build` 表 + 版本注册 + 归因 SQL + `/admin/funnel/` 页 | 线上实测：visit 落库带非空 `build_id`；`gp_build` 有当前 sha 行；admin 页能按版本列出 7 个阶段；未带 token 访问 `403` |
| **P1** | 每版本**流量构成注脚**（utm → referrer host → organic/direct） | admin 表每行显示前 5 个来源 `source ×n`，并带口径文案；SQL 抽出的 traffic 与 D1 直查一致 |
| **P2** | cron-dashboard 看板接入（每站一段 buildfunnel） | `CRON_DASH_SAMPLES=1 python3 scripts/build_metrics.py` 通过；`dashboard_data.json.buildfunnel` 含 gridpaw；`grBuildFunnelBlock('gridpaw')` 渲染出表格 |

**不要做的事**（furriq 已验证无收益）：不按天切版本对比（版本对比是全历史归因，切天只会把样本切碎）；不在 P0 做 alias/身份合并；不给事件加「第二套业务名」。

---

## 3. P0 任务清单（文件级）

### 3.1 新建/改动文件一览

| # | 文件（gridpaw 路径） | 动作 | 要点 |
|---|---|---|---|
| 1 | `scripts/gen-build-info.mjs` | 新增 | 生成 `src/lib/app-build.generated.ts`（sha + `-dirty`） |
| 2 | `package.json` | 改 `build` 脚本 | 在 `astro build` 之前插入 `node scripts/gen-build-info.mjs` |
| 3 | `.gitignore` | 加一行 | `src/lib/app-build.generated.ts`（生成物不入库） |
| 4 | `src/lib/funnel-track.ts` | 新增 | 事件白名单 + `trackFunnel()` + `trackVisit()`（sessionStorage 去重、bot 标记） |
| 5 | `src/components/SEOHead.astro` | 改 | frontmatter `import { APP_BUILD }`；现有 `define:vars` 脚本加 `buildId`；生产域守卫内发 `visit` |
| 6 | `migrations/0001_gp_funnel.sql` | 新增 | `gp_event` + `gp_build` 建表（`IF NOT EXISTS`，可重跑） |
| 7 | `functions/api/events.ts` | 新增 | POST 收事件：开关 → 限流 → session → 白名单/限额 → 写表 → 首 visit 注册版本 → 签发 `gp_gid` |
| 8 | `functions/api/funnel.ts` | 新增 | GET 归因数据（token 保护）：stage / signin / traffic / lastvisit 四段 |
| 9 | `functions/api/_lib.ts` | 改 | `Env` 接口补 `FUNNEL_EVENT_INGESTION_ENABLED?: string`、`FUNNEL_ADMIN_TOKEN?: string`（两个新端点都从 `env` 读，不加会 TS 报错） |
| 9b | `functions/api/_funnel-sql.ts` | 新增（可选） | 把 SQL 常量与事件白名单抽出，events 与 funnel 共用 |
| 10 | `src/pages/admin/funnel.astro` | 新增 | 静态管理页：token 输入 + 版本选择器 + 对比表 + 流量注脚 |
| 11 | `astro.config.mjs` | 改 | sitemap `filter` 排除 `/admin/`（**否则进 sitemap**） |
| 12 | `public/_headers` | 新增 | `/admin/*` → `X-Robots-Tag: noindex` |
| 13 | `wrangler.toml` | 改 | `[vars]` 加 `FUNNEL_EVENT_INGESTION_ENABLED = "true"`（**只在这一处定义**） |
| 14 | `HANDOFF`/`STATUS.md` | 改 | 落地后写现役事实（AGENTS.md 治理：状态进 STATUS，不进 AGENTS.md） |

### 3.2 build id 注入（#1–#3）

`scripts/gen-build-info.mjs`：

```js
// 生成 src/lib/app-build.generated.ts —— Astro 静态站没有 SSR 运行时，
// 版本 key 必须在构建期定下，且要能进 <script is:inline>（内联脚本不过 Vite）。
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const sh = (cmd, fallback = '') => {
  try { return execSync(cmd, { encoding: 'utf8' }).trim(); } catch { return fallback; }
};
const hash = sh('git rev-parse --short HEAD');
const message = sh('git log -1 --pretty=%s').slice(0, 160);
const committedAt = sh('git log -1 --pretty=%cI');
// --untracked-files=no 是关键：否则未提交的新文件也会把版本标成 dirty，dirty 失去区分度
const dirty = sh('git status --porcelain --untracked-files=no').length > 0;
const id = hash ? (dirty ? `${hash}-dirty` : hash) : '';
writeFileSync(
  'src/lib/app-build.generated.ts',
  `// AUTO-GENERATED by scripts/gen-build-info.mjs — 不要手改，不要提交\n` +
  `export const APP_BUILD = ${JSON.stringify({ id, hash, message, committedAt })} as const;\n`
);
console.log(`[build-info] ${id || '(empty)'} ${message}`);
```

`package.json`：`"build": "node scripts/check-indexnow-key.mjs && node scripts/gen-build-info.mjs && node scripts/bundle-engine.mjs && astro build && node scripts/fix-sitemap.mjs"`

注意：脚本里先算 dirty、再写文件——所以生成物自己不会污染 dirty 判定；仍然建议 gitignore（`dist/` 已在 ignore 列表里，同样逻辑）。

### 3.3 建表 migration（#6）

```sql
-- migrations/0001_gp_funnel.sql  幂等：可重复执行
-- 复用 meowtrail-users 库（binding meowtrail_users），表名一律 gp_ 前缀，别碰 meowtrail 的表
CREATE TABLE IF NOT EXISTS gp_event (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT,                 -- 登录用户（mt_session 解出的 uid）；访客为空串
  guest_id TEXT NOT NULL,       -- gp_gid cookie 值
  event_name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  build_id TEXT,                -- 客户端上报的版本 key（''/NULL = 版本化之前的历史数据）
  metadata TEXT,                -- JSON 字符串（含 attribution / referrerHost / ua / isLikelyBot）
  created_at INTEGER NOT NULL   -- ms epoch，便于窗口函数按时间排序
);
CREATE INDEX IF NOT EXISTS idx_gp_event_build    ON gp_event (build_id, created_at);
CREATE INDEX IF NOT EXISTS idx_gp_event_name     ON gp_event (event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_gp_event_visitor  ON gp_event (guest_id, created_at);
CREATE INDEX IF NOT EXISTS idx_gp_event_user     ON gp_event (user_id, created_at);

-- 版本注册表：一行一版本，INSERT OR IGNORE 保证并发安全（furriq 用的是 config JSON 读改写，gridpaw 无 config 表，改表更简单）
CREATE TABLE IF NOT EXISTS gp_build (
  build_id TEXT PRIMARY KEY NOT NULL,
  commit_message TEXT,
  committed_at TEXT,
  first_seen_at TEXT NOT NULL   -- 首次服务到 visit 的时间（只在首次注册时写入）
);
```

应用（注意坑 #2：`--file --json` 不回结果，需要看结果必须 `--command` 单语句）：

```bash
wrangler d1 execute meowtrail-users --remote --file=migrations/0001_gp_funnel.sql
wrangler d1 execute meowtrail-users --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'gp_%'"
```

`created_at` 用 ms epoch（与 furriq 的 `julianday` 默认值等效但更好读）；写入时由 Functions 显式给 `Date.now()`，不依赖 D1 默认值。

### 3.4 客户端埋点（#4–#5）

`src/lib/funnel-track.ts` 要点（关键在**别在这里造事件名**）：

```ts
import { APP_BUILD } from './app-build.generated';

// 白名单 = 现有埋点名（§1.4 实测清单）+ visit。新增业务事件时先加到这里再加埋点，
// 顺序错了会导致 400，而不是静默丢弃。
export const FUNNEL_EVENTS = new Set([
  'visit',
  'game_start', 'first_move', 'level_up', 'level_complete_1', 'level_complete_3',
  'level_complete_5', 'level_complete_10', 'level_complete_20',
  'hint_click', 'hint_blocked', 'puzzle_reset', 'puzzle_skip', 'game_over',
  'daily_start', 'daily_solved', 'daily_challenge_click',
  'share_reddit', 'share_copy', 'share_twitter', 'community_click',
  'sign_in_prompt_shown', 'sign_in_click', 'tool_start', 'tool_action',
]);

// 只有生产域上报（与本仓库既有铁律一致：dev/预览域静默，避免污染）
const PROD = /(^|\.)gridpaw\.com$/;
const UTM_SAFE = new Set(['reddit', 'twitter', 'x', 'google', 'bing', 'pinterest', 'facebook', 'hn', 'newsletter']);

export function buildAttribution(search: string) {
  const p = new URLSearchParams(search);
  const out: Record<string, string | boolean> = {};
  const src = p.get('utm_source')?.trim().toLowerCase() || '';
  if (UTM_SAFE.has(src)) out.utmSource = src;      // 白名单防注入（furriq 同策略）
  if (p.has('utm_campaign')) out.utmCampaignPresent = true;
  return out;
}

export function referrerHost(): string {
  if (!document.referrer) return '';
  try { return new URL(document.referrer).host; } catch { return ''; }
}

// 轻度 bot 标记：gridpaw 有约一半会话来自机房（见 STATUS.md），先记后滤
function looksLikeBot() {
  const ua = navigator.userAgent || '';
  return !ua || /bot|crawl|spider|headless|python|curl|wget|monitor/i.test(ua);
}

export function send(payload: unknown) {
  return fetch('/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export function trackFunnel(eventName: string, metadata: Record<string, unknown> = {}) {
  if (!PROD.test(location.hostname)) return;
  if (!FUNNEL_EVENTS.has(eventName)) return;
  send({ events: [{ eventName, source: 'web', buildId: APP_BUILD.id, metadata }] });
}

// 每页每会话一条 visit；归因原料必须齐（utmSource + referrerHost），否则三级兜底退化成 organic/direct
export function trackVisit(path: string) {
  if (!PROD.test(location.hostname)) return;
  const key = `gp_visit_logged:${path}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  const firstSeen = localStorage.getItem('gp_first_visit_at');
  if (!firstSeen) localStorage.setItem('gp_first_visit_at', new Date().toISOString());
  trackFunnel('visit', {
    path,
    referrerHost: referrerHost(),
    attribution: buildAttribution(location.search),   // 键名固定 attribution，跨站 SQL 才可复用
    returning: Boolean(firstSeen),
    ua: navigator.userAgent.slice(0, 200),
    isLikelyBot: looksLikeBot(),
    browserLanguage: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  });
}
```

`src/components/SEOHead.astro`（45/46 个页面都用它，一处接入即全站覆盖；剩下那 1 个页面单独补）：

```astro
---
import { APP_BUILD } from '../lib/app-build.generated';
// …
---
<script define:vars={{ buildId: APP_BUILD.id }}>
  // … 现有 GA4/Clarity/PostHog 守卫与初始化不动 …
  // 在同一个生产域守卫内部追加（守在外面的语句 dev 不会执行到）：
  if (buildId) {
    var key = 'gp_visit_logged:' + location.pathname;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      fetch('/api/events', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ events: [{ eventName: 'visit', source: 'web', buildId: buildId,
          metadata: { path: location.pathname, referrerHost: (function(){try{return document.referrer?new URL(document.referrer).host:''}catch(e){return ''}})(),
            attribution: {}, returning: !!localStorage.getItem('gp_first_visit_at'),
            ua: (navigator.userAgent||'').slice(0,200), isLikelyBot: false } }] })
      }).catch(function(){});
    }
  }
</script>
```

> 为什么不用 `vite.define`：`src/pages/**` 里大量埋点写在 `<script is:inline>` 里（本仓库 `AGENTS.md` 明写「Astro 内联 script 不被 Vite 打包」），define 替换进去会被原样输出成 `__GP_BUILD__` 字面量。`define:vars` 是 Astro 编译期把 frontmatter 变量序列化进内联脚本，是这里唯一可靠的通路。

### 3.5 上报端点（#7）

`functions/api/events.ts` 骨架（复用现有 `_lib.ts` 的 `getCookie` / `json` / `verifySessionValue`，签名已核对：`json(data, status=200, headers={})`）：

```ts
import { Env, json, getCookie, verifySessionValue } from './_lib';
import { FUNNEL_EVENTS, GUEST_COOKIE } from './_funnel-sql';

const MAX_BODY = 32 * 1024;      // furriq 同款：单请求 32KB
const MAX_EVENTS = 5;            // 单请求最多 5 条
const MAX_META = 4096;           // 单条 metadata 上限

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if ((env.FUNNEL_EVENT_INGESTION_ENABLED ?? 'false') !== 'true') return json({ ok: true });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'too_large' }, 413);

  const sid = getCookie(request, 'mt_session');
  const userId = sid ? (await verifySessionValue(env.OAUTH_STATE_SECRET, sid)) ?? '' : '';
  let guestId = getCookie(request, GUEST_COOKIE) ?? '';
  const isNewGuest = !guestId;
  if (isNewGuest) guestId = crypto.randomUUID();

  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ error: 'bad_json' }, 400); }
  const list = Array.isArray(body?.events) ? body.events.slice(0, MAX_EVENTS) : [body];

  const now = Date.now();
  const stmt = env.meowtrail_users.prepare(
    `INSERT INTO gp_event (id, user_id, guest_id, event_name, source, build_id, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const batch = [];
  for (const e of list) {
    const name = typeof e?.eventName === 'string' ? e.eventName : '';
    if (!FUNNEL_EVENTS.has(name)) return json({ error: 'unsupported_event' }, 400);
    const meta = e?.metadata && typeof e.metadata === 'object' ? e.metadata : null;
    if (meta && JSON.stringify(meta).length > MAX_META) return json({ error: 'metadata_too_large' }, 400);
    const buildId = typeof e?.buildId === 'string' ? e.buildId.slice(0, 64) : '';
    batch.push(stmt.bind(crypto.randomUUID(), userId, guestId, name,
      typeof e?.source === 'string' ? e.source.slice(0, 40) : 'web',
      buildId || null, meta ? JSON.stringify(meta) : null, now));
    if (name === 'visit' && buildId) {
      // 版本注册：只在首次 visit 时发生；INSERT OR IGNORE 天生幂等（对比 furriq 的 config JSON 读改写）
      batch.push(env.meowtrail_users.prepare(
        `INSERT OR IGNORE INTO gp_build (build_id, commit_message, committed_at, first_seen_at)
         VALUES (?, ?, ?, ?)`
      ).bind(buildId, String(e?.commitMessage ?? '').slice(0, 160),
             String(e?.committedAt ?? '').slice(0, 40), new Date(now).toISOString()));
    }
  }
  if (batch.length) await env.meowtrail_users.batch(batch);

  return json({ ok: true }, 200, isNewGuest
    ? { 'Set-Cookie': `${GUEST_COOKIE}=${guestId}; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly` }
    : {});
};
```

两点提醒：
- **commitMessage/committedAt 由客户端一并发**（`APP_BUILD.message`），因为 Functions 侧不知道自己的版本（见 §1.3 决策 2）。服务端可后补覆写（比如从 `gp_build` 已有行保留原值），但别指望服务端凭空知道。
- `.batch()` 里放的是 `prepare().bind()` 的语句，D1 支持；**`.all()` 只接受单条语句**（多语句会报错，与 CLI `--file` 语义不同，见坑 #14）。

### 3.6 归因端点（#8）

`functions/api/funnel.ts`：token 保护 + 四段 SQL + 组装（结构与 furriq `src/routes/api/admin/funnel.ts` 一致，便于看板与 admin 页共用）。

```ts
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!env.FUNNEL_ADMIN_TOKEN || token !== env.FUNNEL_ADMIN_TOKEN) {
    return json({ error: 'forbidden' }, 403);   // 生产建议再套一层 CF Access
  }
  const q = (sql: string) => env.meowtrail_users.prepare(sql).all();
  const [stage, signin, traffic, lastVisit] = await Promise.all([
    q(STAGE_SQL), q(SIGNIN_SQL), q(TRAFFIC_SQL), q(LAST_VISIT_SQL),
  ]);
  // …组装成 { rows: [{buildId, visit, start, move, solve, hint, share, signin, traffic[]}] }
  // builds 元数据来自 gp_build，live = 最近 24h 有 visit（无则 fallback 最近 first_seen_at）
};
```

P0 的 `token` 是够用的最低门槛；P1/P2 建议换成 Cloudflare Access（Zero Trust）保护 `gridpaw.com/admin/*`，`token` 只留给 cron 采集读端点。

### 3.7 管理页（#10–#12）

- `src/pages/admin/funnel.astro`：静态页 + 客户端 `fetch('/api/funnel?token=…')`，token 存 `localStorage`（P0 够用）。UI 对齐 furriq `src/routes/admin/funnel.tsx`：顶部版本选择器（含 `live` badge）→ 对比表（阶段列 + `→阶段` 转化率列）→ 每行流量构成注脚（P1）。
- **必须排除出 sitemap**：`astro.config.mjs` 的 sitemap `filter` 目前只排 `exactExcludes` 里的几个固定页，新页会自动被收录 → 加 `if (page.includes('/admin/')) return false;`。
- `public/_headers`（本仓库当前**没有**这个文件）：新增

```
/admin/*
  X-Robots-Tag: noindex, nofollow
```
- 页面内再加 `<meta name="robots" content="noindex">`，双保险。

### 3.8 环境变量（#13）

`wrangler.toml`：

```toml
[vars]
FUNNEL_EVENT_INGESTION_ENABLED = "true"
```

- `FUNNEL_ADMIN_TOKEN` **不要写进 wrangler.toml**（生产 secrets 走 `wrangler pages secret put FUNNEL_ADMIN_TOKEN` 或 Dashboard）。
- 这个布尔开关**只在一个地方定义**。furriq 踩过的坑：同名变量在顶层与 production 段各写一份，后定义的那份 `false` 会压掉顶层 `true`，表现为「代码全对但 visit 一条都不入库」。Pages 项目里额外的同名 Dashboard 变量是否覆盖 `wrangler.toml` —— **未验证**，所以策略定为：Dashboard 不要重复设同名变量，改完用 §6 的线上实测验收（而不是读配置文件自证）。

---

## 4. P1：流量构成注脚

### 4.1 为什么这期不是「锦上添花」

版本对比表最危险的失效模式不是数据错，而是**结论错**：一版吃了搜索引擎流量、一版吃了社媒流量，转化率差异是流量质量差，不是代码差。所以每个版本行必须带上它自己的流量构成，让读表的人**先看构成、再看转化**。furriq 上线这批时，第一版还是「版本行会撒谎」的状态，注脚是紧跟着补的。

### 4.2 SQL（与 furriq 逐字同构，只换表名）

```sql
WITH first_visit AS (
  SELECT COALESCE(NULLIF(user_id, ''), guest_id) AS visitor,
         build_id,
         COALESCE(
           NULLIF(json_extract(metadata, '$.attribution.utmSource'), ''),
           NULLIF(json_extract(metadata, '$.referrerHost'), ''),
           'organic/direct'
         ) AS src,
         ROW_NUMBER() OVER (
           PARTITION BY COALESCE(NULLIF(user_id, ''), guest_id)
           ORDER BY created_at ASC, id ASC
         ) AS rn
  FROM gp_event
  WHERE event_name = 'visit'
)
SELECT COALESCE(build_id, '') AS build_id, src, COUNT(*) AS n
FROM first_visit
WHERE rn = 1                 -- 只统计首次到访那一次，回访不重归因
GROUP BY build_id, src
ORDER BY n DESC
```

### 4.3 前端

- admin 页：`row.traffic.slice(0, 5).map(s => \`${s.source} ×${s.n}\`).join(' · ')`，放在版本名下方小字（furriq `funnel.tsx` 就是这个形态）。
- 表尾口径文案（照抄 furriq 措辞的意图，不要改口径）：

> 每版本一行 = 归因到该版本的**全部访客**（按其首次到访版本，不随回访改变）。两版本转化率有差异时先看流量构成行——构成明显不同（如一边全 google、一边全 reddit）时差异可能是流量质量而非代码。live = 最近 24h 有流量的版本；`-dirty` 后缀 = 部署时工作区有未提交改动（须与干净提交区分）。

### 4.4 P1 可选项（按需，不必一次做完）

- **pictomino 子站接入**：`public/pictomino/*.html` 是纯静态 HTML，不走 Astro 编译。做法：`scripts/gen-build-info.mjs` 顺手写一个 `public/build-id.js`（`window.__GP_BUILD__='299fa4c-dirty'`），在 `public/analytics.js` 里读它并上报 `visit`（analytics.js 已有生产域守卫，直接复用）。注意 `public/*.js` 会进 dist，不需要额外构建步骤。
- **身份合并**：登录用户与登录前访客是两个 key（见坑 #12），需要时再加 `gp_identity(guest_id, user_id)` 表做 alias。
- **CF Access 保护 `/admin/*`**，替代明文 token。

---

## 5. P2：cron-dashboard 看板接入

参照物（已上线，照它做，别自创形状）：
- `cron-dashboard/DATA_SOURCES.md` 末尾「buildfunnel 段（furriq 改版效果·版本归因，2026-09-18 新增）」
- `cron-dashboard/scripts/build_metrics.py` 的 `fetch_furriq_build_funnel()`（约 1703 行）与 `SCHEMA` 里的 `furriq_build_funnel` 表（约 244 行）
- `cron-dashboard/scripts/aggregate.py` 的 `aggregate_build_funnel(conn)`（约 318 行）
- `cron-dashboard/js/tab-growth.js` 的 `grBuildFunnelBlock(site)`（约 139 行）

### 5.1 文件级任务

| # | 文件 | 动作 | 要点 |
|---|---|---|---|
| 1 | `scripts/build_metrics.py` | `SCHEMA` 加 `gridpaw_build_funnel` | 与 `furriq_build_funnel` 同构（PK `snapshot_date, build_id`） |
| 2 | 同上 | 新增 `fetch_gridpaw_build_funnel(conn, paths)` | 复制 `fetch_furriq_build_funnel` 改表名/库名/事件名，见 §5.2 |
| 3 | 同上 | `resolve_paths()` 加 `"gridpaw_build_sample"` | samples 模式读 `samples/gridpaw-build-funnel-sample.json` |
| 4 | 同上 | `main()` | DROP TABLE 列表加新表；调用 + 打印（`gridpaw-build-funnel: N 个版本 -> …`） |
| 5 | `scripts/aggregate.py` | `aggregate_build_funnel(conn, site="furriq")` | 参数化表名与 `buildfunnel` 段形状 |
| 6 | 同上 | 汇总处 | `data["buildfunnel"] = {"furriq": …, "gridpaw": …}` |
| 7 | `js/tab-growth.js` | `bf = (DATA.buildfunnel||{})[site] \|\| DATA.buildfunnel \|\| {}` | **旧形状兜底**，furriq 视图零改动；去掉 `if(site!=="furriq")return ""` |
| 8 | 同上 | 阶段列参数化 | 新常量 `GR_BUILD_FUNNEL_STAGES = {furriq:[…], gridpaw:[…]}`，表头/取值都从它来 |
| 9 | `samples/gridpaw-build-funnel-sample.json` | 新增 | 模拟两次 `wrangler --json` 输出（tag 行 + `gp_build` 行），供 `CRON_DASH_SAMPLES=1` 验证 |
| 10 | `DATA_SOURCES.md` | 改 buildfunnel 段 | 标题改「每站一节」，加 gridpaw 小节（采集函数/表名/口径差异） |

### 5.2 采集函数要点（gridpaw 版）

```python
wrangler = os.path.expanduser("~/.local/bin/wrangler")   # 2026-09-18 实测：4.124.0，全局安装
# gridpaw 未在 package.json 声明 wrangler；若日后加 devDependency，改指 gridpaw/node_modules/.bin/wrangler
[wrangler, "d1", "execute", "meowtrail-users", "--remote", "--json", "--command", sql]
```

- SQL 用**一条 UNION ALL**（同构 `tag/build_id/k/n` 四列）拉 stage / signin / traffic / lastvisit，再加一条拉 `gp_build`（**共 2 次 subprocess**，与 furriq 相同）。原因见坑 #2：`--file --json` 不回查询结果。
- `live` 判定：`now_ms - lastvisit <= 24h` → live；一条都没有则 fallback `max(first_seen_at)` 的版本（夜间无流量）。
- 排序：`''`（版本化之前）恒最后 → live 置顶 → `committed_at` 新→旧（`aggregate_build_funnel` 里已有该排序逻辑，参数化即可）。
- 失败处理照 furriq：未登录/超时/非 JSON → 打印警告 `return 0`，**不阻断其他数据源**。

---

## 6. 验收清单（P0/P1 逐条实测，缺一条不算完成）

> 纪律：状态类断言必须有工具证据。下面每条都给了可执行命令，跑完把输出贴进交付说明。

### 6.1 构建期

1. `pnpm run build` → exit 0；控制台出现 `[build-info] <sha>[-dirty] <commit message>`。
2. `grep -c "<sha>" dist/index.html` → ≥ 1（证明 build id 真的进了静态产物；若是 0，说明 `define:vars` 没接上，回 §3.4）。
3. `git status --porcelain` → 生成物 `src/lib/app-build.generated.ts` 未出现在未跟踪列表（已 gitignore）。

### 6.2 上报链路（部署后，生产域实测）

```bash
# 1) ingest 可达 + 签发 guest cookie
curl -si -X POST https://gridpaw.com/api/events \
  -H 'content-type: application/json' \
  -d '{"events":[{"eventName":"visit","source":"web","buildId":"<sha>","metadata":{"path":"/"}}]}' \
  | head -20      # 期望 200 + Set-Cookie: gp_gid=…

# 2) 白名单真的生效（应 400，不是静默吞）
curl -si -X POST https://gridpaw.com/api/events -H 'content-type: application/json' \
  -d '{"events":[{"eventName":"my_new_event","buildId":"<sha>"}]}' | head -5

# 3) 归因端点未带 token 应 403
curl -si "https://gridpaw.com/api/funnel" | head -5
```

### 6.3 D1 直查（单语句，`--command`）

```bash
wrangler d1 execute meowtrail-users --remote \
  --command="SELECT event_name, COALESCE(build_id,'(null)') b, COUNT(*) n FROM gp_event GROUP BY 1,2 ORDER BY n DESC LIMIT 20"
# 期望：visit 行的 b 非 (null)；game_start 等业务事件随玩家行为增长

wrangler d1 execute meowtrail-users --remote \
  --command="SELECT build_id, commit_message, first_seen_at FROM gp_build ORDER BY first_seen_at DESC LIMIT 10"
# 期望：有当前 sha 行，commit_message = 部署时 HEAD 的提交说明
```

### 6.4 归因正确性（三层对账，P2 前必须做）

1. D1 直查（上面的 SQL）→ 得到每版本每阶段的 visitor 数。
2. `cron-dashboard` 侧：`python3 scripts/build_metrics.py` 后
   `sqlite3 cron-dashboard/data/metrics.db "SELECT * FROM gridpaw_build_funnel"`。
3. `dashboard_data.json` 的 `buildfunnel.gridpaw`。
4. 三者同一 `snapshot` 下数字**逐版本逐阶段相等**；admin 页显示的数字与第 1 步相等（同一份 SQL，若不等先看 admin 页有没有额外过滤）。
5. 手动抽样一个访客（`gp_event` 里挑一个 `gp_gid`）复核：他的 visit `build_id` 是否等于其首行 visit 的 build_id，后续事件是否被归到同一版本。

### 6.5 samples 链路（无网/无登录态也能验）

```bash
cd ~/workspace/cron-dashboard && CRON_DASH_SAMPLES=1 python3 scripts/build_metrics.py
# 期望输出含：gridpaw-build-funnel: N 个版本 -> gridpaw_build_funnel（快照 …）
```

### 6.6 展示层截图

- admin 页 `/admin/funnel/?token=…`：版本选择器 + 对比表 + 流量注脚（P1）。
- 看板：gridpaw 视图「产品漏斗」之后出现「改版效果 · 版本归因」块。
- 截图/视口一律走 ego-browser（本仓库 `AGENTS.md`「浏览器操作」红线，禁止内置 `browser_exec`）。

### 6.7 上线后 48h 的读表纪律（重要）

- **样本量**：gridpaw 全站 14 天 GA4 只有 231 session（`STATUS.md` 实测）。单版本 `visit` 在两位数以内时，版本之间的转化率差异**是噪声**，禁止据此下「改版有效/无效」结论。
- **先看构成再看转化**：新版 `visit` 若明显低于历史日均，先查是不是发布后 CDN 还在供旧 HTML（旧 build id 继续上报）——这是预期行为，不是丢数。
- **bot 污染**：`visit` 里会混机房流量（本仓库 `STATUS.md`：约一半会话来自云机房 IP）。读版本对比前先按 `json_extract(metadata,'$.isLikelyBot')` 出个比例；比例 >30% 时结论只能用于定性。
- **别按天切**：版本对比是全历史归因（furriq 实测过，切天只会把样本切碎）。

---

## 7. 坑清单（每一条都有出处，别凭感觉跳过）

### 来自 furriq 已踩过的（前 7 条）

1. **改动必须打在源文件，不能打生成物。**
   furriq 的真源是 `schema.sqlite.ts` 等，`src/config/db/schema.ts` 是 `.gitignore` 的生成文件——改在生成物上，下次 build 重新生成就丢。gridpaw 的对位物是：`public/puzzle-engine.js` / `public/akari-engine.js`（由 `src/lib/*-engine.ts` 经 `scripts/bundle-engine.mjs` 编译）、`dist/`、以及本文新增的 `src/lib/app-build.generated.ts`。**规则：改 `src/`，跑构建重新生成；生成物一律 gitignore，永远不手改。**

2. **`wrangler d1 execute --file --json` 不返回查询结果**（只返回执行统计）。
   要看结果必须 `--command` + **单条语句**；多条数据合成一条 `UNION ALL`，且各分支列同构（furriq 用 `tag/build_id/k/n` 四列承载 stage / paid / traffic / lastvisit 四类数据）。照着做，别试图让 CLI 一次回多个结果集——那会让你以为「没数据」，其实是「没输出」。

3. **环境变量双处定义会互相压。**
   furriq：`CLIENT_EVENT_INGESTION_ENABLED` 在 `wrangler.jsonc` 顶层和 production 段各一份，生产段 `false` 压掉顶层 `true`，表现为「代码全对但 visit 一条不入库」。gridpaw 对策：**只写 `wrangler.toml [vars]` 一处**，Dashboard 不重复设同名变量，改完以线上实测为准（§6.2）。附带一个已知事实：`wrangler.jsonc` 是 JSONC，**重复 key 不报错**（语法合法），所以这类错误不会在构建期暴露。（Pages 项目里 Dashboard 变量与 `wrangler.toml` 同名时谁优先 —— **未验证**，所以走「不重复定义」路线规避。）

4. **`vite define` 在 dev 的 SSR 管线不生效。**
   furriq：dev 下 `build_id` 为空属正常，生产 build 才有值。gridpaw 更硬：Astro 的 `<script is:inline>` 压根不过 Vite。**所以 gridpaw 用构建期生成文件 + `define:vars`（§3.2 / §3.4），不要在这条上试错。**

5. **`visit` 事件必须带 `metadata.attribution.utmSource` 与 `metadata.referrerHost`。**
   这两个字段是流量三级兜底（utm → referrer host → organic/direct）的**唯一原料**。少任何一个，全部流量会落成 `organic/direct`，P1 注脚直接失去意义（看起来「正常」但没有解释力，比报错更危险）。键名固定为 `attribution` / `referrerHost`（跨站 SQL 复用同一份，改键名等于把两站的 SQL 拆开维护）。

6. **访客归因到「首次到访」的版本（`rn = 1`），回访不重归因。**
   同一个 guest 换了新版页面后继续用，仍算在首访版本账上——这是刻意的：否则老访客的后续行为会把新版数字虚高，A/B 结论反过来。**这条口径不要「顺手优化」**，改它等于重写历史数据。

7. **live 判定 = 最近 24h 有 `visit`；夜间无流量时 fallback 最近注册的 `first_seen_at`。**
   纯按 24h 判，凌晨看板会出现「没有 live 版本」的空态；纯按最新注册判，回滚后仍显示新版本 live。

### gridpaw 特有的（8–15，实测发现，实施时必须处理）

8. **Astro 内联脚本不受 `vite.define` 影响**（本仓库 `AGENTS.md` 明写）。把 `__GP_BUILD__` 写进 `is:inline` 脚本，产物里会原样出现字面量。通路只有 `define:vars` 或构建期生成文件。

9. **新页面会被 sitemap 自动收录。** `astro.config.mjs` 的 sitemap `filter` 只有一份固定 `exactExcludes` 名单，新建 `/admin/funnel/` 会立刻进 `sitemap-0.xml`（进而进 GSC）。必须显式 `if (page.includes('/admin/')) return false;` + `noindex` + `_headers` 三重收口。

10. **`pnpm run deploy` 是直接上传本地 `dist/`**（`wrangler pages deploy dist --commit-dirty=true`），不走 Cloudflare 构建，因此**没有** `CF_PAGES_COMMIT_SHA` 之类的平台注入变量可用；build id 必须在本地构建期算出来。反过来这也是 `-dirty` 后缀在 gridpaw **比 furriq 更必要**的原因：线上跑的可能是工作区里未提交的代码，`299fa4c` 和 `299fa4c-dirty` 是两种东西，别混在一列里比转化。

11. **CF Pages 边缘缓存会让旧 HTML 继续上报旧 build id。** 发布后短时间内新旧版本共存是**预期**，不是丢数（`STATUS.md` 记过 IndexNow key 在 asset 层被边缘缓存、Purge 无效的案例）。读表时先看版本分布，别假设流量已 100% 切到新版本。

12. **guest / user 双 key 会把同一个人拆成两行。** 访客 key = `COALESCE(NULLIF(user_id,''), guest_id)`：登录前的事件只带 `gp_gid`，登录后的带 `user_id`（`mt_session` 解出的 uid）。所以「访客 → 登录」的转化会表现为两个不同的 visitor，`signin` 阶段数字会偏低。furriq 同此口径。P0 **接受这个边界**，别为了它上复杂的 identity graph；需要时 P1 加 `gp_identity(guest_id, user_id)` alias 表。

13. **看板阶段名必须与埋点名逐字对账。** 实测差异（§1.4）：`FUNNEL_STEP_DEFS["gridpaw"]` 里的 `level_completed` 在源码中不存在该埋点名（源码是 `level_up` / `level_complete_<N>`），`community_click` 在 90 天 posthog 数据里 0 条。采信之前先跑一遍分组查询核对；名字对不上不会报错，只会静默把某一层变成 0（`aggregate.py` 里已记录 2026-09-18 的同类事故）。

14. **D1 的两套 SQL 语义别搞混。** Pages Functions 里 `env.DB.prepare(sql).all()` **只接受单条语句**（多语句报错）；CLI `wrangler d1 execute --file` 可以多语句但**不回结果**。所以：Functions 侧把 4 条查询拆成 4 次 `prepare().all()`（`Promise.all` 并发，本文 §3.6 就是这么写的）；看板采集侧合成一条 UNION ALL 走 `--command`。

15. **`meowtrail-users` 是与 meowtrail 共用的 D1 库**（binding `meowtrail_users`，`database_id 80cc8484-…`，与 `~/workspace/meowtrail/wrangler.toml` 同一个）。所以：新表一律 `gp_` 前缀、migration 全部 `IF NOT EXISTS` 可重跑、**不要动 `daily_progress` / `level_progress` 等既有表结构**（`daily_progress` 只读 join 用于 `signin` 阶段统计）。想彻底解耦就另建 `gridpaw-events` 库，但要同步 `wrangler.toml` 的 binding 与 cron 采集里的库名——P0 不建议，成本大于收益。

---

## 8. 附录 A：furriq 参照代码片段（改写成 gridpaw 版时对照）

> 只摘关键片段，不给整文件。路径为 furriq 仓库内路径，行号是 2026-09-18 的实测位置。

**A1. build id 注入（`vite.config.ts:54-96`）**

```ts
function resolveAppBuild() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const message = execSync('git log -1 --pretty=%s', { encoding: 'utf8' }).trim().slice(0, 160);
    const committedAt = execSync('git log -1 --pretty=%cI', { encoding: 'utf8' }).trim();
    let dirty = false;
    try {
      dirty = execSync('git status --porcelain --untracked-files=no', { encoding: 'utf8' }).trim().length > 0;
    } catch { /* 状态检查是尽力而为，hash 本身才是关键 */ }
    return { hash, id: dirty ? `${hash}-dirty` : hash, message, committedAt };
  } catch { return { id: '', hash: '', message: '', committedAt: '' }; }
}
// define: { __APP_BUILD__: JSON.stringify(appBuild) }
```

配合 `src/lib/app-build.ts` 的**未定义兜底**（gridpaw 生成文件方案天然不需要，但 dev/CI 缺文件时要能降级）：

```ts
export function getAppBuild(): AppBuildInfo {
  if (typeof __APP_BUILD__ === 'undefined') return EMPTY_BUILD;  // dev / 无值 → ''，不抛错
  return __APP_BUILD__;
}
```

**A2. 版本注册（`src/modules/cat-breed/funnel.ts:37-53`，furriq 形态；gridpaw 改表）**

```ts
export async function registerFunnelBuild(build) {
  if (!build.id) return;
  try {
    const builds = await getFunnelBuilds();
    if (builds[build.id]) return;                    // 已注册直接返回
    builds[build.id] = { message: build.message, committedAt: build.committedAt, firstSeenAt: new Date().toISOString() };
    await saveConfigs({ [FUNNEL_BUILDS_CONFIG_KEY]: JSON.stringify(builds) });  // ← gridpaw 换 INSERT OR IGNORE
  } catch (error) { console.warn('[funnel] failed to register build', error); }  // 尽力而为，不打断事件落库
}
```

gridpaw 版（更简单，因为共用库没有 config 表）：`INSERT OR IGNORE INTO gp_build (build_id, commit_message, committed_at, first_seen_at) VALUES (…, …)`——并发安全、无需读写往返。

**A3. 归因核心 SQL（`src/routes/api/admin/funnel.ts:40-119`）** —— §3.6 / §4.2 的 gridpaw 版就是它换表名：

```ts
const VISITOR_KEY = sql`COALESCE(NULLIF(user_id, ''), guest_id)`;

const FIRST_VISIT_CTE = sql`
  WITH first_visit AS (
    SELECT ${VISITOR_KEY} AS visitor, build_id,
           COALESCE(
             NULLIF(json_extract(metadata, '$.attribution.utmSource'), ''),
             NULLIF(json_extract(metadata, '$.referrerHost'), ''),
             'organic/direct'
           ) AS src,
           ROW_NUMBER() OVER (PARTITION BY ${VISITOR_KEY} ORDER BY created_at ASC, id ASC) AS rn
    FROM cat_breed_event WHERE event_name = 'visit'
  )`;

// 阶段投影：多事件 → 单阶段（gridpaw 照此把 game_start/first_move/level_up/hint_click/share_reddit 映射成 stage key）
const stageRowsQuery = sql`
  ${FIRST_VISIT_CTE},
  attributed AS (SELECT visitor, COALESCE(build_id, '') AS first_build FROM first_visit WHERE rn = 1),
  stages AS (
    SELECT ${VISITOR_KEY} AS visitor,
      CASE
        WHEN event_name = 'visit' THEN 'visit'
        WHEN event_name IN ('photo_upload','photo_local_analysis','multi_photo_local_analysis') THEN 'photo'
        WHEN event_name = 'generation_success' THEN 'report'
        WHEN event_name = 'signup_ui_success' THEN 'signup'
      END AS stage
    FROM cat_breed_event WHERE event_name IN (…白名单…)
  )
  SELECT a.first_build AS build_id, s.stage AS stage, COUNT(DISTINCT s.visitor) AS n
  FROM stages s JOIN attributed a ON a.visitor = s.visitor
  WHERE s.stage IS NOT NULL GROUP BY a.first_build, s.stage`;

// 末阶段「付费」= 产品表 join 用户表（gridpaw 用 daily_progress 替代 order）
const paidRowsQuery = sql`
  ${FIRST_VISIT_CTE},
  attributed AS (SELECT visitor, COALESCE(build_id, '') AS first_build FROM first_visit WHERE rn = 1)
  SELECT a.first_build AS build_id, COUNT(DISTINCT o.user_id) AS n
  FROM \`order\` o JOIN attributed a ON a.visitor = o.user_id
  WHERE o.status = 'paid' GROUP BY a.first_build`;
```

**A4. 上报端点（`src/routes/api/events.ts`）** 的限额与顺序，gridpaw 照抄：

```
开关未开 → 直接 200 返回（静默，不报错）
→ 限流（furriq: 同 IP 1s 一次）
→ session 解析 → guest id 签发 → 体积上限（请求 32KB / 单条 metadata 4096 / 一次最多 5 条）
→ 事件名白名单校验（白名单外直接 400，不静默丢）
→ 落库 → visit 时注册版本 → Set-Cookie 回写 guest id
```

**A5. 看板采集（`cron-dashboard/scripts/build_metrics.py:1703-1884`）**

- 两条 subprocess：一条 UNION ALL（`tag/build_id/k/n`）+ 一条 `SELECT value FROM config WHERE name='funnel_builds'`。
- live 计算（照抄语义）：

```python
now_ms = int(time.time() * 1000)
fresh_ids = {r["build_id"] for r in last_visit
             if now_ms - int(r["last_visit_ms"] or 0) <= 24 * 3600 * 1000}
live_fallback = max(builds.items(), key=lambda kv: kv[1].get("firstSeenAt") or "")[0] if builds and not fresh_ids else None
```

- 聚合排序（`aggregate.py:358-362`）：`before versioning 最后 → live 置顶 → committed_at 新→旧`。

**A6. 看板渲染（`cron-dashboard/js/tab-growth.js:139-168`）** 的表结构与表尾口径文案，P2 直接复用，只把 `if(site!=="furriq")return ""` 与硬编码列名参数化。

---

## 9. 附录 B：建议的落地顺序（切成可验证的小步）

| 步 | 内容 | 验完再进下一步的依据 |
|---|---|---|
| 1 | §3.2 build id 生成 + `.gitignore` + build 脚本串联 | §6.1 三条全过（尤其 `dist/index.html` 里搜得到 sha） |
| 2 | §3.3 migration 建表 + 推到 remote D1 | `sqlite_master` 查到 `gp_event`/`gp_build` |
| 3 | §3.5 ingest 端点（先只支持 `visit`） | §6.2 第 1 条 + §6.3 看到 visit 带 build_id |
| 4 | §3.4 客户端埋点接全站（SEOHead） | 生产域访问一页 → D1 里出现带 build_id 的 visit；dev 域不产生记录 |
| 5 | §3.6/§3.7 归因端点 + admin 页 | §6.3/§6.4 数字一致 |
| 6 | 业务事件接进漏斗（`trackFunnel` 包裹既有 `track()` 调用点） | 阶段数字随真实操作增长；白名单外事件返回 400 |
| 7 | §4 P1 流量注脚 | §6.4 加上 traffic 维度仍一致 |
| 8 | §5 P2 看板接入 | §6.5 samples + 看板渲染截图 |

**每步落地后要写的状态**（本仓库治理规则）：状态进 `STATUS.md`（现役事实 + 实测证据），进度进 `HANDOFF`/`CHANGELOG` 类文件，**不要进 `AGENTS.md`**（`~/workspace/AGENTS.md`「AGENTS.md 内容治理」总纲），坑进对应 skill 的 pitfalls 节。

**关于回流 furriq 的两条改进（可选，别顺手改）**：

1. `gp_build` 表 + `INSERT OR IGNORE` 替掉 furriq 的 `config` JSON 读改写——更简单也更抗并发。回流需改 `funnel.ts` / `events.ts` / 归因 SQL 三处 + 迁移，属独立批次，别混在 gridpaw 的活里。
2. gridpaw 的「构建期生成文件注入 build id」比 furriq 的 `vite define` 更稳（不受 dev SSR 语义影响）。同样属独立批次。


