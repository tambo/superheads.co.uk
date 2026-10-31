# Superheads On Your Mac

This guide sets up your own Mac and accounts for editing Superheads. You do not need hosting access. Nothing here copies another person's credentials, SSH keys, shell configuration or VS Code profile.

## Start Here

1. Create or sign into [your own GitHub account](https://github.com/login). Ask the maintainer to invite that account to [the Superheads repository](https://github.com/tambo/superheads.co.uk), then accept the invitation in GitHub. An SSH key alone does not grant repository access.
2. If you already cloned the repository, open its folder in Finder. Otherwise, after accepting the invite, use GitHub's **Code > Download ZIP**, unzip it, and open the extracted folder. A ZIP can bootstrap setup, but is not a Git checkout: do not run `git init` on it. Clone a fresh folder using your own key below before making changes you intend to submit.
3. Open [Setup Superheads.command](../Setup%20Superheads.command) from Finder by double-clicking it. It runs from its own folder, even if your Terminal was elsewhere. The helper asks before opening pages, creating a key, installing dependencies, downloading Chromium or installing an extension. Return alone means **No**. It does not automatically start the site.
4. If macOS blocks the downloaded launcher, review [Apple's guidance](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unknown-developer-mh40616/mac) and use the specific blocked-item approval in Privacy & Security only for a copy you trust. Do not disable Gatekeeper or remove quarantine recursively. ZIPs may lose executable permissions; use the Terminal fallback below.

In Terminal, type `cd ` (including the space), drag the extracted repository folder from Finder into Terminal, and press Return. Then run:

```bash
bash scripts/setup-mac.sh
```

For a report that changes nothing:

```bash
bash scripts/setup-mac.sh --check
```

Exit 0 means native Node and Git prerequisites are ready; exit 1 means something is missing or unsuitable. VS Code is reported but is not required for this check. `--help` is also read-only. Guided setup requires an interactive terminal; never pipe passwords into it or run it with shell tracing (`bash -x`). The helper does not write logs, but your terminal and any recording software may retain displayed output.

## Install The Tools

- **Node:** The checked-in baseline is **22.23.4**, verified against the npm registry on 2026-10-31. Existing native Node 22 versions at or above that baseline are accepted; other majors are not accepted by this helper. CI uses Node 22. Download the signed macOS installer from the [official Node 22.23.4 page](https://nodejs.org/en/download/archive/v22.23.4), install it yourself, then reopen Terminal. The official macOS .pkg supports Apple Silicon and Intel; Node must run as `arm64` on Apple Silicon and `x64` on Intel. Do not use an Intel-only binary under Rosetta on Apple Silicon. A version manager you already use may read [.node-version](../.node-version); the helper does not install one or change your PATH. Future security updates should be reviewed by maintainers.
- **Rosetta:** If reported, quit Terminal and VS Code. In Finder, select each app, choose Get Info and clear **Open using Rosetta**, if present. Reopen and rerun the check. If the wrong Node still appears, review your existing version manager/PATH rather than deleting installations blindly. The helper checks the actual runtime architecture, not just the Mac model.
- **Git:** Install Apple's Command Line Tools yourself with the command below, complete Apple's dialog, and rerun setup. The helper neither triggers this installation nor uses `sudo`.
- **VS Code:** Download it from [Microsoft's official page](https://code.visualstudio.com/download), choosing Apple Silicon or Intel for your Mac, and drag it into Applications. Open it once. Optionally use its Command Palette and **Shell Command: Install 'code' command in PATH**. The helper also recognises standard Applications locations without changing PATH.

```bash
xcode-select --install
```

The Node installer or Apple dialog may ask for administrator approval. Enter passwords only in the operating system's own dialog, never in Copilot chat. If your Mac is managed and installation is blocked, contact its administrator.

## Your Own GitHub Key

The helper optionally creates `~/.ssh/id_ed25519_superheads_github`, a dedicated Ed25519 key. Choose a passphrase when `ssh-keygen` asks directly in Terminal. It never prints the private key or overwrites an existing key or SSH configuration. Existing entries are left alone; if their ownership is uncertain, decline and have the maintainer help select a different path manually. Never copy someone else's key, and never delete an existing key merely to rerun setup.

With a separate opt-in, the helper copies **only** the `.pub` public key created during that run to your clipboard and opens [GitHub SSH keys](https://github.com/settings/keys). Select **New SSH key**, give it a recognisable title, choose **Authentication Key**, paste and save. On reruns it does not reuse or copy existing key entries. If you previously created this key yourself and need to register it, first verify ownership, then manually copy only its `.pub` file. Replace the clipboard afterwards by copying ordinary text. Your private file (without `.pub`) and passphrase must stay on your Mac. GitHub passwords, recovery codes and tokens must also never be pasted into chat.

Test this dedicated identity, independent of existing SSH configuration:

```bash
ssh -F /dev/null -o IdentitiesOnly=yes \
  -i "$HOME/.ssh/id_ed25519_superheads_github" -T git@github.com
```

On first contact, compare the host fingerprint with [GitHub's official fingerprints](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints) before accepting it. Do not bypass host-key checking. A successful test says **Hi YOUR-USERNAME! You've successfully authenticated...** and normally exits with status 1 because GitHub provides no interactive shell. If it names the wrong account, stop and review the public key registration. `Permission denied (publickey)` means the key is not accepted; check the path and your GitHub key settings. SSH may prompt for your passphrase directly.

## Clone And Verify Access

After accepting the invite and registering your key, open Terminal and clone into a **new, empty location**. This command creates a `superheads.co.uk` folder in your home folder; if that name exists already, pick another destination. Do not clone over the ZIP or an existing checkout.

```bash
cd "$HOME"
GIT_SSH_COMMAND='ssh -F /dev/null -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519_superheads_github' \
  git clone git@github.com:tambo/superheads.co.uk.git superheads.co.uk
cd superheads.co.uk
git remote -v
GIT_SSH_COMMAND='ssh -F /dev/null -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519_superheads_github' \
  git ls-remote origin HEAD
```

Verify `origin` is the Superheads repository. `git ls-remote` is read-only and confirms access; authentication success alone does not prove the invitation was accepted. These commands choose your dedicated key without changing your existing SSH configuration. Use the same `GIT_SSH_COMMAND` prefix for future fetch/push commands unless you have deliberately configured that identity yourself. The helper does not change remotes, initialise Git or fetch/push anything. A private-repository ZIP requires access too; do not circulate private archives.

Run setup again **inside this clone** and open this folder alone in VS Code via **File > Open Folder**. Open [this guide](MAC-SETUP.md) from the Explorer and choose **Open Preview** to follow its clickable links.

Review your Git identity without changing it:

```bash
git config --get user.name
git config --get user.email
```

Missing values exit with status 1. If needed, intentionally set your own identity **locally in this clone**, replacing the example values. Use your GitHub-provided private commit email from [email settings](https://github.com/settings/emails) when appropriate:

```bash
git config --local user.name "Your Name"
git config --local user.email "YOUR-GITHUB-COMMIT-EMAIL"
```

The helper never sets these values or overwrites global Git settings. Agree a branch/review process with the maintainer before submitting changes. No onboarding command commits, pushes or deploys.

## VS Code And Copilot

The folder recommends GitHub Copilot Chat through [.vscode/extensions.json](../.vscode/extensions.json). Accept the recommendation yourself or opt into the helper's extension install. Built-in JavaScript/TypeScript support is already included in VS Code. Sign into **your own GitHub account** in VS Code and activate an eligible Copilot plan or assigned organisational seat; see [Copilot plans](https://github.com/features/copilot/plans). Availability, usage limits, models and organisation policy depend on your account. No exact model or settings parity is promised.

For comparable project context, open only Superheads, keep [AGENTS.md](../AGENTS.md), [.github/copilot-instructions.md](../.github/copilot-instructions.md) and [the project skill](../.github/skills/superheads-modernisation/SKILL.md) available, and enable supported instruction/skill discovery in your own client. Verify Copilot can explain the project's static-only and archive-safety rules before trusting changes. The author's private custom agent, global settings, account sessions and other workspace folders are not included or copied. Sign into Settings Sync only with your own account if you choose to use it.

Trust this workspace only after reviewing its source. Installing npm dependencies can execute third-party lifecycle scripts; `npm ci` replaces `node_modules`. The helper asks first, uses the lockfile when present, and otherwise offers `npm install` (which creates a lockfile). A failed install stops setup; resolve its reported error before retrying. Chromium is a separate opt-in download using the locally installed Playwright, not an unpinned `npx` fetch.

## Work Locally

After opting into dependencies, use VS Code's **Terminal > New Terminal** in the clone:

```bash
npm run dev
```

Open the localhost URL printed by Next.js (normally [http://localhost:3000](http://localhost:3000)); stop the server with Control-C. These are local checks, not deploy commands:

```bash
npm test
npm run typecheck
npm run build
```

After opting into Playwright Chromium:

```bash
npm run test:e2e
```

Never serve or execute `archive/`. The checked-in application and curated public assets are enough for ordinary editing; the private legacy archive is not part of a clone/ZIP from GitHub. Preserve the static export contract and consult [PROJECT-GUIDE.md](PROJECT-GUIDE.md). Deployment follows [DEPLOYMENT.md](DEPLOYMENT.md): CI handles authorised releases with maintainer-managed gates and secrets. Pushing a release branch can trigger deployment, so follow the agreed review process.

## Optional Hosting Access

Dreamhost access is **not required** to edit, run tests or use Copilot. Do not ask for another person's shared hosting password, private SSH key or shell variables. If a maintainer explicitly needs you to manage hosting, they must arrange your own least-privilege hosting account scoped to verified Superheads-only targets, confirm the available restrictions with the provider, and provision access separately. If that isolation is unavailable, leave hosting with maintainers and CI.

Only after that agreement, create a **different** key manually, for example with `ssh-keygen -t ed25519 -f "$HOME/.ssh/id_ed25519_superheads_dreamhost"`, first checking that neither that path nor its `.pub` exists. Choose a passphrase; give only the public key to the maintainer through an approved channel. They supply the verified host, port and account privately and independently verify host fingerprints. No Dreamhost commands, credentials, deployment gates or hosting configuration are installed by this onboarding helper.

## Verification Record

Design decision (2026-10-31): guided official installers, explicit opt-in for mutations, native Node 22 baseline matching CI, dedicated user-owned GitHub identity, and no automated configuration overwrite. Download pages and GitHub sign-in stay in the user's browser; secret prompts stay in their terminal. Existing key paths are never intentionally overwritten. Treat the repository and npm lifecycle scripts as code requiring review, not as a security sandbox.

Automated coverage lives in [tests/setup-mac.test.mjs](../tests/setup-mac.test.mjs): shell syntax, read-only help/check, noninteractive refusal, safety guards and checked-in contracts. It does not execute the interactive installer. Real Finder/Gatekeeper behavior, manual pkg/Apple installs, key creation, clipboard/browser actions, GitHub invitations and authentication, extension installation and Copilot licensing need verification on the friend's Mac.