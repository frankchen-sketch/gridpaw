#!/usr/bin/env python3
"""level_complete_N checkpoint 漏斗（GA4 未注册 level 维度，只有硬编码事件名）。"""
import json, time, os, base64, subprocess, tempfile, requests

PROPERTY_ID = "552793510"
KEY_PATH = "~/.config/furriq/ga4-service-account.json"
START, END = "2026-09-17", "today"

def b64(d):
    return base64.urlsafe_b64encode(d).rstrip(b"=").decode()

def access_token(path):
    creds = json.load(open(os.path.expanduser(path)))
    header = b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    now = int(time.time())
    payload = b64(json.dumps({
        "iss": creds["client_email"],
        "scope": "https://www.googleapis.com/auth/analytics.readonly",
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now, "exp": now + 3600,
    }).encode())
    signing_input = f"{header}.{payload}".encode()
    with tempfile.NamedTemporaryFile("w", suffix=".pem", delete=False) as f:
        f.write(creds["private_key"])
        keyfile = f.name
    p = subprocess.run(["openssl", "dgst", "-sha256", "-sign", keyfile],
        input=signing_input, capture_output=True)
    assertion = f"{header}.{payload}.{b64(p.stdout)}"
    r = requests.post("https://oauth2.googleapis.com/token",
        data={"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
              "assertion": assertion}, timeout=20)
    return r.json()["access_token"]

t = access_token(KEY_PATH)
body = {
    "dateRanges": [{"startDate": START, "endDate": END}],
    "dimensions": [{"name": "eventName"}],
    "metrics": [{"name": "eventCount"}, {"name": "totalUsers"}],
    "dimensionFilter": {"filter": {"fieldName": "eventName",
        "stringFilter": {"matchType": "BEGINS_WITH", "value": "level_complete"}}},
    "limit": 30,
}
r = requests.post(
    f"https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY_ID}:runReport",
    headers={"Authorization": f"Bearer {t}"}, json=body, timeout=30)
d = r.json()
if "error" in d:
    print("ERR", d["error"]["message"][:200]); raise SystemExit(1)
pts = []
for row in d.get("rows", []):
    name = row["dimensionValues"][0]["value"]
    lv = int(name.split("_")[-1])
    pts.append((lv, int(row["metricValues"][0]["value"]), int(row["metricValues"][1]["value"])))
pts.sort()
base = pts[0][2] if pts else 1
print(f"{'checkpoint':<12} {'events':>7} {'users':>6} {'vs起点':>8} {'段留存':>8}")
prev = None
for lv, ev, u in pts:
    seg = f"{u/prev*100:7.1f}%" if prev else "     --"
    print(f"L{lv:<11} {ev:>7} {u:>6} {u/base*100:7.1f}% {seg:>8}")
    prev = u
