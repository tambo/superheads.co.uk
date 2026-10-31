#!/bin/bash
set -eu
cd -- "$(dirname -- "$0")"
result=0
/bin/bash scripts/setup-mac.sh "$@" || result=$?
if [[ $# -eq 0 && -t 0 ]]; then
  printf '\nPress Return to close this setup window. '
  read -r answer || true
fi
exit "$result"