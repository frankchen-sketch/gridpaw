#!/usr/bin/env python3
"""
GSC Sitemap Submission — submit sitemap to Google Search Console

Usage:
  python3 gsc-submit-sitemap.py <domain> [--key <service-account-json>]

Examples:
  python3 gsc-submit-sitemap.py spatialreasoninggame.com
  python3 gsc-submit-sitemap.py meowtrail.org --key ~/.hermes/scripts/meowtrail-seo.json

Requires: google-auth, requests (pip install google-auth requests)
"""

import argparse
import sys
import urllib.parse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description='Submit sitemap to Google Search Console')
    parser.add_argument('domain', help='Domain name (e.g. spatialreasoninggame.com)')
    parser.add_argument('--key', help='Path to service account JSON key file', default=None)
    parser.add_argument('--sitemap', help='Sitemap URL (default: https://<domain>/sitemap.xml)', default=None)
    args = parser.parse_args()

    # Auto-detect key file
    if args.key:
        key_path = Path(args.key)
    else:
        # Look for key in ~/.hermes/scripts/
        hermes_scripts = Path.home() / '.hermes' / 'scripts'
        candidates = list(hermes_scripts.glob(f'*{args.domain.replace(".", "-")}*.json'))
        if not candidates:
            candidates = list(hermes_scripts.glob('*seo*.json'))
        if not candidates:
            print(f'Error: No service account key found. Use --key to specify.')
            print(f'Searched in: {hermes_scripts}')
            sys.exit(1)
        key_path = candidates[0]
        print(f'Using key: {key_path}')

    if not key_path.exists():
        print(f'Error: Key file not found: {key_path}')
        sys.exit(1)

    # Build URLs
    site = urllib.parse.quote(f'sc-domain:{args.domain}', safe='')
    sitemap_url = args.sitemap or f'https://{args.domain}/sitemap.xml'
    feed = urllib.parse.quote(sitemap_url, safe='')

    # Authenticate and submit
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request as AuthRequest
        import requests
    except ImportError as e:
        print(f'Error: Missing dependency. Run: pip install google-auth requests')
        sys.exit(1)

    creds = service_account.Credentials.from_service_account_file(
        str(key_path), scopes=['https://www.googleapis.com/auth/webmasters'])
    creds.refresh(AuthRequest())

    r = requests.put(
        f'https://www.googleapis.com/webmasters/v3/sites/{site}/sitemaps/{feed}',
        headers={'Authorization': f'Bearer {creds.token}'},
        timeout=30)

    print(f'Status: {r.status_code}')
    if r.status_code != 204:
        print(f'Body: {r.text[:500]}')
        sys.exit(1)
    else:
        print(f'Sitemap submitted successfully: {sitemap_url}')

if __name__ == '__main__':
    main()
