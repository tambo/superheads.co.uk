#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mode="${1:-preview}"
environment="${2:-production}"
if [[ "$mode" != preview && "$mode" != apply ]]; then
  printf 'Usage: bash scripts/deploy.sh preview|apply [production|staging]\n' >&2
  exit 1
fi
case "$environment" in
  production) target_name=superheads.co.uk ;;
  staging) target_name=dev.superheads.co.uk ;;
  *) printf 'Unknown Superheads deployment environment.\n' >&2; exit 1 ;;
esac
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
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -p "$sshport" "$remote" "sh -s -- $target_name" <<'REMOTE'
set -eu
target="$HOME/$1"
test -d "$target"
test ! -L "$target"
test "$(cd "$target" && pwd -P)" = "$target"
test -z "$(find "$target" -type l ! -path "$target/.dh-diag" ! -path "$target/.well-known/*" -print -quit)"
printf 'Verified Superheads-only deployment target.\n'
REMOTE

flags=(--checksum --dry-run)
if [[ "$mode" == apply ]]; then
  [[ "${SUPERHEADS_DEPLOY_APPROVED:-}" == yes ]] || { printf 'Apply requires explicit approval: SUPERHEADS_DEPLOY_APPROVED=yes\n' >&2; exit 1; }
  if [[ "${SUPERHEADS_SKIP_BACKUP:-}" == yes ]]; then
    printf 'Backup skipped at explicit user request; using their existing backup.\n'
  else
    ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -p "$sshport" "$remote" "sh -s -- $target_name" <<'REMOTE'
set -eu
umask 077
target="$HOME/$1"
parent="$HOME/.superheads-backups"
test ! -L "$parent"
mkdir -p "$parent"
backup="$parent/$1-pre-static-$(date -u +%Y%m%dT%H%M%SZ)"
test ! -e "$backup"
cp -a "$target" "$backup"
diff -qr "$target" "$backup" >/dev/null
printf 'Existing server tree backed up and verified outside the public root.\n'
REMOTE
  fi
  flags=(--checksum)
fi

rsync -az --delete --itemize-changes "${flags[@]}" \
  --exclude='.well-known/' --exclude='.dh-diag' \
  -e "$transport" out/ "$remote:$target_name/"
printf 'Superheads %s %s completed.\n' "$environment" "$mode"