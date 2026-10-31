#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mode="${1:-preview}"
if [[ "$mode" != preview && "$mode" != apply ]]; then
  printf 'Usage: bash scripts/deploy.sh preview|apply\n' >&2
  exit 1
fi
: "${sshorphismuser:?Configure the SSH user in your local shell}"
: "${sshserver:?Configure the SSH host in your local shell}"
: "${sshport:?Configure the SSH port in your local shell}"
[[ "$sshport" =~ ^[0-9]+$ ]] || exit 1
[[ "$sshorphismuser" =~ ^[a-zA-Z0-9_-]+$ ]] || exit 1
[[ "$sshserver" =~ ^[a-zA-Z0-9.-]+$ ]] || exit 1

node scripts/check-export.mjs
[[ -f out/.htaccess ]] || { printf 'Build is missing static Apache configuration.\n' >&2; exit 1; }
remote="$sshorphismuser@$sshserver"
transport="ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -p $sshport"
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -p "$sshport" "$remote" 'set -eu; target="$HOME/superheads.co.uk"; test -d "$target"; test ! -L "$target"; test "$(cd "$target" && pwd -P)" = "$HOME/superheads.co.uk"; test -z "$(find "$target" -type l ! -path "$target/.dh-diag" ! -path "$target/.well-known/*" -print -quit)"; printf "Verified Superheads-only deployment target.\n"'

flags=(--checksum --dry-run)
if [[ "$mode" == apply ]]; then
  [[ "${SUPERHEADS_DEPLOY_APPROVED:-}" == yes ]] || { printf 'Apply requires explicit approval: SUPERHEADS_DEPLOY_APPROVED=yes\n' >&2; exit 1; }
  if [[ "${SUPERHEADS_SKIP_BACKUP:-}" == yes ]]; then
    printf 'Backup skipped at explicit user request; using their existing backup.\n'
  else
    ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -p "$sshport" "$remote" 'set -eu; umask 077; target="$HOME/superheads.co.uk"; parent="$HOME/.superheads-backups"; test ! -L "$parent"; mkdir -p "$parent"; backup="$parent/pre-static-$(date -u +%Y%m%dT%H%M%SZ)"; test ! -e "$backup"; cp -a "$target" "$backup"; diff -qr "$target" "$backup" >/dev/null; printf "Existing server tree backed up and verified outside the public root.\n"'
  fi
  flags=(--checksum)
fi

rsync -az --delete --itemize-changes "${flags[@]}" \
  --exclude='.well-known/' --exclude='.dh-diag' \
  -e "$transport" out/ "$remote:superheads.co.uk/"
printf 'Superheads %s completed.\n' "$mode"