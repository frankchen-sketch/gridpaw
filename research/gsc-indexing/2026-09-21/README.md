# GridPaw GSC Request Indexing - 2026-09-21 (cron routine)

## Background / Result

Audit script (gridpaw_unindexed.py): 68 sitemap URLs, 67 indexed, 1 unindexed.

**Target**: https://gridpaw.com/community/ - "Google 无法识别此网址" (URL unknown) at 09:30.

## Script fix (blocker from previous runs)

gridpaw_unindexed.py line 22 pointed the service-account key at the OLD machine path
/Users/frankchen/.hermes/scripts/furriq-daily-brief-e15ace04af1c.json (the 09-18
run died with FileNotFoundError for exactly this reason). Fixed in place with sed to
/Users/frank/.hermes/scripts/... - script only, no site files touched.

## Submission (ego-browser, task space "gridpaw-request-indexing" by name, closed after)

| URL | Result |
|---|---|
| https://gridpaw.com/community/ | OK: 已将网址添加到优先抓取队列 |

- 1 submission, 0 quota hits (recording fact only, no speculation).
- Selector note: filled the top inspect bar via fillInput(css aria-label input) + Enter,
  waited 12s, clicked last visible element whose innerText == 请求编入索引 (8 matches,
  all visible), success panel confirmed by text poll.

## API verification (09:49, ~16 min after submission)

- coverageState: Discovered - currently not indexed (was URL unknown before submit)
- lastCrawlTime: None - NOT yet confirmed crawled; pending until next run
- sitemap: now lists sitemap-0.xml + sitemap.xml (was [no sitemap] before)

> Note: the coverage flip (unknown -> discovered) moves in lockstep with the sitemap
> field appearing - per discipline this is GSC reconciliation, reported as fact, not
> as a win/regression signal. Pending determination rests on lastCrawlTime.

## Status

- Indexed 67 / not indexed 1 / query errors 0
- Still waiting: https://gridpaw.com/community/ (first recheck next run)

## Evidence files
- community-request-indexing.png: success state after submission

- Final recheck 09:57 (24 min after submit): still Discovered, lastCrawlTime: None.
- Verdict: submission accepted by UI, crawl NOT yet confirmed. Next cron rechecks first.
