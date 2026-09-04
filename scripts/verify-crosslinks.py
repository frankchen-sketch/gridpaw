#!/usr/bin/env python3
"""
Verify cross-links between game sites are working.

Usage:
  python3 verify-crosslinks.py [--fix]

Reads site-network.json and checks that each crossLink is actually present
in the deployed site's HTML. Reports missing or nofollow links.
"""

import json
import sys
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional

KIT_DIR = Path(__file__).parent.parent
NETWORK_FILE = KIT_DIR / 'site-network.json'

def fetch_html(url: str) -> Optional[str]:
    """Fetch HTML from URL, return None on error."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; link-checker/1.0)'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except (urllib.error.URLError, urllib.error.HTTPError, Exception) as e:
        return None

def check_link(html: str, target_domain: str) -> dict:
    """Check if a link to target_domain exists in HTML and is dofollow."""
    # Look for href containing the target domain
    import re
    pattern = rf'href=["\']https?://(?:www\.)?{re.escape(target_domain)}[/"]'
    matches = re.findall(pattern, html)
    
    if not matches:
        return {'found': False, 'dofollow': None}
    
    # Check if any match has rel="nofollow" nearby
    for match in re.finditer(pattern, html):
        # Look for rel="nofollow" within 200 chars before the match
        start = max(0, match.start() - 200)
        context = html[start:match.end()]
        if 'nofollow' in context:
            return {'found': True, 'dofollow': False}
    
    return {'found': True, 'dofollow': True}

def main():
    if not NETWORK_FILE.exists():
        print(f'Error: {NETWORK_FILE} not found')
        sys.exit(1)
    
    with open(NETWORK_FILE) as f:
        network = json.load(f)
    
    sites = {s['id']: s for s in network['sites']}
    results = []
    
    print('🔍 Checking cross-links...\n')
    
    for link in network['crossLinks']:
        from_site = sites.get(link['from'])
        to_site = sites.get(link['to'])
        
        if not from_site or not to_site:
            results.append({
                'link': link,
                'status': 'ERROR',
                'message': f"Site not found: {link['from']} or {link['to']}"
            })
            continue
        
        from_domain = from_site['domain']
        to_domain = to_site['domain']
        
        print(f'  Checking {from_domain} → {to_domain}...', end=' ', flush=True)
        
        html = fetch_html(f'https://{from_domain}/')
        if html is None:
            print('❌ Failed to fetch')
            results.append({
                'link': link,
                'status': 'ERROR',
                'message': f'Failed to fetch https://{from_domain}/'
            })
            continue
        
        result = check_link(html, to_domain)
        
        if not result['found']:
            print('❌ Missing')
            results.append({
                'link': link,
                'status': 'MISSING',
                'message': f'No link to {to_domain} found on {from_domain}'
            })
        elif not result['dofollow']:
            print('⚠️  nofollow')
            results.append({
                'link': link,
                'status': 'NOFOLLOW',
                'message': f'Link to {to_domain} on {from_domain} is nofollow'
            })
        else:
            print('✅')
            results.append({
                'link': link,
                'status': 'OK',
                'message': f'Link to {to_domain} found on {from_domain} (dofollow)'
            })
    
    # Summary
    print('\n' + '='*60)
    ok = sum(1 for r in results if r['status'] == 'OK')
    missing = sum(1 for r in results if r['status'] == 'MISSING')
    nofollow = sum(1 for r in results if r['status'] == 'NOFOLLOW')
    errors = sum(1 for r in results if r['status'] == 'ERROR')
    
    print(f'✅ OK: {ok}')
    if missing: print(f'❌ Missing: {missing}')
    if nofollow: print(f'⚠️  Nofollow: {nofollow}')
    if errors: print(f'🔴 Errors: {errors}')
    
    if missing or nofollow or errors:
        print('\nIssues found:')
        for r in results:
            if r['status'] != 'OK':
                print(f'  - {r["message"]}')
        sys.exit(1)
    else:
        print('\nAll cross-links verified! 🎉')

if __name__ == '__main__':
    main()
