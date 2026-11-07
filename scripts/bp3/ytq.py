"""Tiny YouTube search helper: returns video titles/dates for a query."""
import json, subprocess, urllib.parse

PROXY = "http://127.0.0.1:7880"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")


def search(q, sort='CAI%3D', limit=20):
    url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(q)
    if sort:
        url += '&sp=' + sort
    raw = subprocess.run(['curl', '-sL', '-x', PROXY, '-A', UA, '--max-time', '40', url],
                         capture_output=True, text=True).stdout
    i = raw.find('ytInitialData')
    if i < 0:
        return []
    j = raw.find('{', i)
    try:
        data, _ = json.JSONDecoder().raw_decode(raw[j:])
    except Exception:
        return []
    out = []

    def walk(o):
        if isinstance(o, dict):
            if 'videoRenderer' in o:
                v = o['videoRenderer']
                out.append({
                    'id': v.get('videoId'),
                    'title': ''.join(r.get('text', '') for r in v.get('title', {}).get('runs', [])),
                    'pub': v.get('publishedTimeText', {}).get('simpleText', ''),
                    'ch': ''.join(r.get('text', '') for r in v.get('ownerText', {}).get('runs', [])),
                })
            for x in o.values():
                walk(x)
        elif isinstance(o, list):
            for x in o:
                walk(x)

    walk(data)
    return out[:limit]


if __name__ == '__main__':
    import sys
    for q in sys.argv[1:]:
        print('=' * 8, q)
        for r in search(q):
            print(f"  [{r['pub']}] {r['title'][:85]} | {r['ch']} | {r['id']}")
