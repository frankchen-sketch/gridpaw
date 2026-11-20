#!/bin/sh
# Cloudflare credentials from the workspace-wide secret files.
#
# Source this before any wrangler call that needs more than the OAuth login:
#   . ./scripts/cf-auth.sh
#
# Why a script instead of a token in .env.production: wrangler only loads `.env`,
# never `.env.production`, so a token written there is invisible to it and the
# deploy silently uses the OAuth login. The OAuth scopes here omit zone settings
# and DNS, so those calls fail with 9109/403 even though the token would work.
#
# No-op when the variables are already exported, so an explicit override wins.
# POSIX sh on purpose: npm scripts run under sh, where `pipefail` does not exist.

TOKEN_FILE="${CLOUDFLARE_TOKEN_FILE:-$HOME/.hermes/secrets/cloudflare-api-token}"
ACCOUNT_FILE="${CLOUDFLARE_ACCOUNT_FILE:-$HOME/.hermes/secrets/cloudflare-account-id}"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ -f "$TOKEN_FILE" ]; then
  CLOUDFLARE_API_TOKEN="$(tr -d '\r\n' < "$TOKEN_FILE")"
  export CLOUDFLARE_API_TOKEN
fi

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ] && [ -f "$ACCOUNT_FILE" ]; then
  CLOUDFLARE_ACCOUNT_ID="$(tr -d '\r\n' < "$ACCOUNT_FILE")"
  export CLOUDFLARE_ACCOUNT_ID
fi
