#!/usr/bin/env python3
"""Targeted crawl: newest N pages for specific sites -> crawl-<date>/<site>.jsonl (append-safe rewrite)."""
import argparse, datetime, html, json, os, re, subprocess, time

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36'
ap = argparse.ArgumentParser()
ap.add_argument('--dir', required=True)
ap.add_argument('--date', default=datetime.date.today().isoformat())
ap.add_argument('--sites', required=True, help='comma separated site names')
ap.add_argument('-n', type=int, default=5)
ap.add_argument('--timeout', type=int, default=15)
a = ap.parse_args()
MON, TODAY, N = os.path.expanduser(a.dir), a.date, a.n
OUT = f'{MON}/crawl-{TODAY}'
os.makedirs(OUT, exist_ok=True)


def fetch(u, timeout):
    r = subprocess.run(['curl', '-sL', '-A', UA, '--max-time', str(timeout), '-w', '\n__HTTP__%{http_code}', u],
                       capture_output=True, text=True)
    body, _, code = r.stdout.rpartition('__HTTP__')
    return body, code.strip()


def meta(body, attr):
    m = re.search(rf'<meta[^>]+(?:property|name)="{attr}"[^>]+content="([^"]*)"', body, re.I) or \
        re.search(rf'<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="{attr}"', body, re.I)
    return html.unescape(m.group(1)).strip() if m else None


def title(body):
    m = re.search(r'<title[^>]*>(.*?)</title>', body, re.S | re.I)
    return html.unescape(m.group(1)).strip() if m else None


base = sorted(d for d in os.listdir(MON) if d.startswith('baseline-'))[-1]
for name in a.sites.split(','):
    name = name.strip()
    tsv = f'{MON}/{base}/{name}.tsv'
    rows = []
    for line in open(tsv):
        if '\t' not in line:
            continue
        m, _, u = line.rstrip('\n').partition('\t')
        rows.append((m, u))
    rows.sort(key=lambda r: r[0] or '', reverse=True)
    picked, seen = [], set()
    for m, u in rows:
        if u in seen:
            continue
        seen.add(u); picked.append((m, u))
        if len(picked) >= N:
            break
    path = f'{OUT}/{name}.jsonl'
    ok = 0
    with open(path, 'w') as out:
        for m, u in picked:
            body, code = fetch(u, a.timeout)
            t = title(body) if body else None
            rec = {'url': u, 'lastmod': m, 'http': code, 'title': t,
                   'desc': meta(body, 'description') if body else None,
                   'published': meta(body, 'article:published_time') if body else None,
                   'modified': meta(body, 'article:modified_time') if body else None}
            out.write(json.dumps(rec, ensure_ascii=False) + '\n')
            out.flush()
            if code == '200' and t:
                ok += 1
            time.sleep(0.2)
    print(f'{name}: crawled {len(picked)}, 200+title {ok}', flush=True)
print('DONE')
