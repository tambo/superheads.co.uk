#!/bin/bash
set -eu

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
PIN="$(<"$ROOT/.node-version")"
GUIDE="$ROOT/docs/MAC-SETUP.md"
KEY="$HOME/.ssh/id_ed25519_superheads_github"

help() {
  printf 'Superheads Mac setup\n\n'
  printf 'Usage: bash scripts/setup-mac.sh [--help | --check]\n'
  printf 'No arguments: guided, opt-in setup in an interactive terminal.\n'
  printf '%s\n' '--help: show this help; no changes.' '--check: read-only prerequisites; no installs, browser, keys or configuration changes.'
  printf 'Guide: %s\nNode baseline: %s (native Node 24, this version or newer).\n' "$GUIDE" "$PIN"
}

case "${1:-}" in
  --help|-h) help; exit 0 ;;
  --check) [[ $# -eq 1 ]] || { help; exit 2; }; mode=check ;;
  '') [[ $# -eq 0 ]] || { help; exit 2; }; mode=guided ;;
  *) help; exit 2 ;;
esac

confirm() {
  local answer
  printf '\n%s [y/N] ' "$1"
  read -r answer || return 1
  [[ "$answer" == y || "$answer" == Y || "$answer" == yes || "$answer" == YES ]]
}

if [[ "$mode" == guided && ! -t 0 ]]; then
  printf 'Guided setup requires an interactive terminal. Use --check for a read-only report.\n' >&2
  exit 2
fi

os="$(uname -s)"
machine="$(uname -m)"
native="$machine"
translated=0
if [[ "$os" == Darwin ]]; then
  translated="$(sysctl -in sysctl.proc_translated 2>/dev/null || printf '0')"
  if [[ "$translated" == 1 ]] || [[ "$(sysctl -n hw.optional.arm64 2>/dev/null || printf '0')" == 1 ]]; then
    native=arm64
  fi
fi
case "$native" in
  arm64) node_arch=arm64 ;;
  x86_64) node_arch=x64 ;;
  *) node_arch=unsupported ;;
esac

ready=1
printf 'Superheads prerequisite report (no changes)\n'
printf 'System: %s; terminal: %s; native: %s\n' "$os" "$machine" "$native"
if [[ "$os" != Darwin ]]; then
  printf 'This guided installer supports macOS only.\n'
  ready=0
fi
if [[ "$translated" == 1 ]]; then
  printf 'Rosetta detected. Quit Terminal/VS Code, disable Open using Rosetta in Finder Get Info, and reopen natively.\n'
  ready=0
fi
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  if node -e 'const [major, minor, patch] = process.versions.node.split(".").map(Number); const [pinMajor, pinMinor, pinPatch] = process.argv[1].split(".").map(Number); process.exit(major === pinMajor && (minor > pinMinor || (minor === pinMinor && patch >= pinPatch)) && process.arch === process.argv[2] ? 0 : 1)' "$PIN" "$node_arch"; then
    printf 'Node: suitable native Node 24 (%s).\n' "$(node --version)"
  else
    printf 'Node: unsuitable version or architecture. Need native Node %s or newer within 24.x (%s).\n' "$PIN" "$node_arch"
    ready=0
  fi
else
  printf 'Node/npm: missing.\n'
  ready=0
fi
git_ready=0
if [[ "$os" == Darwin ]] && xcode-select -p >/dev/null 2>&1 && command -v git >/dev/null 2>&1 && git --version >/dev/null 2>&1; then
  git_ready=1
  printf 'Git and Apple command-line tools: available.\n'
else
  printf 'Git/Apple command-line tools: missing. Install manually using xcode-select --install in Terminal.\n'
  ready=0
fi
code_cli=''
if command -v code >/dev/null 2>&1; then
  code_cli="$(command -v code)"
elif [[ -x '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code' ]]; then
  code_cli='/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
elif [[ -x "$HOME/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" ]]; then
  code_cli="$HOME/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
fi
if [[ -n "$code_cli" ]]; then
  printf 'VS Code: available.\n'
else
  printf 'VS Code: not found in PATH or standard Applications folders (optional for checks).\n'
fi
if [[ "$git_ready" == 1 && -d "$ROOT/.git" ]] && git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf 'Git checkout: present. Review identity and origin manually using the guide.\n'
else
  printf 'No ordinary Git checkout detected (possibly a ZIP). Do not git init; follow the guide to clone after accepting the invite.\n'
fi
if [[ "$mode" == check ]]; then
  [[ "$ready" == 1 ]] && exit 0
  exit 1
fi
[[ "$os" == Darwin ]] || exit 1
printf '\nNo sudo, shell edits, Git configuration edits or deployment are performed.\n'
printf 'Passphrases stay in your terminal; no setup log is written. Guide: %s\n' "$GUIDE"
if confirm 'Open the checked-in Mac guide in your default app?'; then
  open "$GUIDE"
fi
if [[ "$ready" != 1 ]]; then
  if confirm "Open the official Node $PIN download page? Install its signed macOS .pkg manually, then reopen Terminal"; then
    open "https://nodejs.org/en/download/archive/v$PIN"
  fi
fi
if [[ -z "$code_cli" ]] && confirm 'Open the official VS Code download page?'; then
  open 'https://code.visualstudio.com/download'
fi
if [[ "$ready" != 1 ]]; then
  printf '\nFinish the prerequisites, reopen Terminal natively, then rerun setup. Nothing has been installed by this helper.\n'
  exit 1
fi

if confirm 'Set up your own dedicated Superheads GitHub SSH key (optional)?'; then
  created_key=0
  if [[ -e "$KEY" || -L "$KEY" || -e "$KEY.pub" || -L "$KEY.pub" ]]; then
    printf 'An entry already exists at the dedicated key path; it is untouched. Review it using the guide.\n'
  elif command -v ssh-keygen >/dev/null 2>&1; then
    if [[ -L "$HOME/.ssh" ]]; then
      printf 'Refusing to create a key inside a symlinked .ssh directory. Review manually.\n' >&2
      exit 1
    fi
    if [[ ! -d "$HOME/.ssh" ]]; then
      (umask 077; mkdir "$HOME/.ssh")
    fi
    printf 'Choose a passphrase at the ssh-keygen prompts. Do not paste it into chat.\n'
    ssh-keygen -t ed25519 -f "$KEY" -C 'superheads-github'
    created_key=1
  fi
  if [[ "$created_key" == 1 && -f "$KEY.pub" && ! -L "$KEY.pub" ]] && confirm 'Copy ONLY the public key to the clipboard and open GitHub SSH key settings?'; then
    pbcopy < "$KEY.pub"
    open 'https://github.com/settings/keys'
    printf 'Add a New SSH key, paste the clipboard, and save it in your own GitHub account.\n'
  fi
fi

if confirm 'Install project dependencies now? npm may execute dependency lifecycle scripts; npm ci replaces node_modules'; then
  cd -- "$ROOT"
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    printf 'No lockfile: npm install will create one for review.\n'
    npm install
  fi
fi
if [[ -x "$ROOT/node_modules/.bin/playwright" ]]; then
  if confirm 'Download the Playwright Chromium browser for local browser tests?'; then
    "$ROOT/node_modules/.bin/playwright" install chromium
  fi
else
  printf 'Playwright not installed; browser download skipped. Rerun after installing dependencies.\n'
fi
if [[ -n "$code_cli" ]] && confirm 'Install the recommended GitHub Copilot Chat extension in your VS Code profile?'; then
  "$code_cli" --install-extension GitHub.copilot-chat
fi
if [[ -n "$code_cli" ]] && confirm 'Open only this Superheads folder in VS Code?'; then
  "$code_cli" --new-window "$ROOT"
fi
printf '\nSetup finished. Follow the guide for your GitHub invite, SSH authentication, Git identity, Copilot sign-in and local development.\n'