import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const helper = join(root, 'scripts/setup-mac.sh');
const launcher = join(root, 'Setup Superheads.command');
const source = readFileSync(helper, 'utf8');
const launcherSource = readFileSync(launcher, 'utf8');

function runReadOnly(target, argument) {
  const home = mkdtempSync(join(tmpdir(), 'superheads-setup-'));
  try {
    const result = spawnSync('/bin/bash', [target, argument], {
      cwd: tmpdir(),
      env: { ...process.env, HOME: home },
      encoding: 'utf8',
      timeout: 15000,
    });
    assert.ifError(result.error);
    assert.equal(existsSync(join(home, '.ssh')), false);
    assert.equal(existsSync(join(home, '.gitconfig')), false);
    assert.equal(existsSync(join(home, '.zshrc')), false);
    return result;
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

test('helper and Finder launcher have valid Bash syntax', () => {
  for (const target of [helper, launcher]) {
    const result = spawnSync('/bin/bash', ['-n', target], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
});

test('help works outside the repo without changing the user home', () => {
  for (const target of [helper, launcher]) {
    const result = runReadOnly(target, '--help');
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /--check: read-only prerequisites/);
    assert.match(result.stdout, /24\.22\.2/);
  }
});

test('check reports prerequisites and terminates without guided actions', () => {
  for (const target of [helper, launcher]) {
    const result = runReadOnly(target, '--check');
    assert.ok([0, 1].includes(result.status), result.stderr);
    assert.match(result.stdout, /Superheads prerequisite report \(no changes\)/);
    assert.doesNotMatch(result.stdout, /\[y\/N\]|Setup finished/);
  }
});

test('noninteractive guided invocation and unknown options are refused', () => {
  const result = spawnSync('/bin/bash', [helper], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /requires an interactive terminal/);
  assert.equal(runReadOnly(helper, '--unknown').status, 2);
});

test('mutation paths occur only after read-only mode exits and readiness gates', () => {
  const checkExit = source.indexOf('if [[ "$mode" == check ]]');
  const firstBrowser = source.indexOf('    open "https://nodejs.org');
  const readyExit = source.indexOf('Finish the prerequisites');
  const keyCreation = source.indexOf('    ssh-keygen -t ed25519');
  assert.ok(checkExit > 0 && firstBrowser > checkExit);
  assert.ok(readyExit > checkExit && keyCreation > readyExit);
  assert.match(source, /if confirm 'Install project dependencies now\?/);
  assert.match(source, /if confirm 'Download the Playwright Chromium/);
  assert.match(source, /confirm 'Install the recommended GitHub Copilot Chat/);
  assert.match(source, /if \[\[ -f package-lock\.json \]\]; then\s+npm ci\s+else/);
  assert.match(source, /"\$ROOT\/node_modules\/\.bin\/playwright" install chromium/);
  assert.doesNotMatch(source, /\bnpx\b|\bsudo\s+\w|curl\s|git (init|clone|push|config)\s|>>|tee\s|set -x/);
});

test('keys, architecture and launcher preserve the safety contract', () => {
  assert.match(source, /-e "\$KEY" \|\| -L "\$KEY" \|\| -e "\$KEY\.pub" \|\| -L "\$KEY\.pub"/);
  assert.match(source, /ssh-keygen -t ed25519 -f "\$KEY" -C 'superheads-github'/);
  assert.doesNotMatch(source, /ssh-keygen[^\n]* -N|pbcopy < "\$KEY"/);
  assert.match(source, /pbcopy < "\$KEY\.pub"/);
  assert.match(source, /"\$created_key" == 1 && -f "\$KEY\.pub"/);
  assert.match(source, /sysctl\.proc_translated/);
  assert.match(source, /process\.arch === process\.argv\[2\]/);
  assert.match(source, /major === pinMajor/);
  assert.match(launcherSource, /cd -- "\$\(dirname -- "\$0"\)"/);
  assert.match(launcherSource, /\/bin\/bash scripts\/setup-mac\.sh "\$@"/);
  assert.equal(readFileSync(join(root, '.node-version'), 'utf8').trim(), '24.22.2');
  const extensions = JSON.parse(readFileSync(join(root, '.vscode/extensions.json'), 'utf8'));
  assert.deepEqual(extensions.recommendations, ['GitHub.copilot-chat']);
});

test('launcher is executable and every local guide link resolves', () => {
  for (const target of [helper, launcher]) {
    assert.ok(statSync(target).mode & 0o111, `${target} needs executable permissions`);
  }
  const guideUrl = new URL('../docs/MAC-SETUP.md', import.meta.url);
  const guide = readFileSync(guideUrl, 'utf8');
  const links = [...guide.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)];
  assert.ok(links.length > 10);
  for (const [, destination] of links) {
    if (/^https?:/.test(destination)) continue;
    assert.ok(existsSync(new URL(destination, guideUrl)), `Missing guide link: ${destination}`);
  }
});