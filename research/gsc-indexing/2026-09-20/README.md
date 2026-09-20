# GridPaw GSC Request Indexing - 2026-09-20 (cron routine)
## Background / Result

Audit script (gridpaw_unindexed.py): 68 sitemap URLs, 67 indexed, 1 unindexed.

**Target**: https://gridpaw.com/community/ — Discovered - currently not indexed
Discovery shown in GSC UI: sitemap sitemap-0.xml + sitemap.xml; referring page https://gridpaw.com/solver/
(Sitemap fix from 09-15 is visibly working: the Discovery panel shows sitemap sources.)

## Submission (ego-browser, task space created-by-name, closed after)

| URL | Result |
|---|---|
| https://gridpaw.com/community/ | OK: 已将网址添加到优先抓取队列中 |

- Quota: 1 submission, 0 quota hits (recording fact only, no speculation).
- Success panel text: "已将网址添加到优先抓取队列中。 多次提交同一网页并不能改变该网页的队列顺序或优先级。"
- Effectiveness is verified by lastCrawlTime on next cron run.

## Evidence files
- community-before.png: page state before click (not indexed + request button)
- community-after.png: success panel after submission

## Technical note for next round (SELECTOR FIXED)
- The "请求编入索引" control is a <div role="button">, NOT a native <button>.
  querySelectorAll('button') matches ZERO elements here (earlier script falsely reported
  NO_VISIBLE_BUTTON while the page was fine). Fixed selector:
  document.querySelectorAll('[role="button"], button, a, [role="link"]') filtered by
  innerText contains 请求编入索引 and offsetWidth>0 && offsetHeight>0, take last visible.
- Task space must be created BY NAME each invocation (does not persist across processes);
  close with task.finish({ keep: [] }); wrap injected scripts in IIFE; no global sleep.
- Direct /inspect URL with inspectionUrl param redirects to overview; must fill the
  top inspect bar to trigger an inspection.
