# Superheads Project Guidance

This is the canonical project-wide, always-on guidance for agents working in this repository. Apply it only to `superheads.co.uk`; this is not the Orphism site or another workspace project. Supporting clients can discover this root file and the project skill, but discovery and obedience depend on the agent and its configuration. These documents are guidance, not a security enforcement mechanism.

## Read First

- **Branch workflow:** `main` is production-only and is never the active coding worktree. Fetch `origin/develop`, then create a task branch/worktree from it for every change. Do not edit directly on `main` or `develop`. Submit completed work to `develop` by pull request; promote verified `develop` to `main` through a separate reviewed pull request only after staging checks and explicit release approval. If the opened worktree is `main`, stop editing and create a feature worktree from current `origin/develop` first. Leave unrelated dirty worktrees untouched.
- Before substantial work, review [COLLABORATION.md](docs/COLLABORATION.md) and the latest `origin/develop` [work board](docs/TODO.md). Automated work claims are paused by user request; do not open claim workflows or block explicitly requested work on a claim. Check active ownership and coordinate with the human before overlapping work. Update the roadmap manually by agreement and preserve newer remote board changes when merging.
- Use [the modernisation skill](.github/skills/superheads-modernisation/SKILL.md) for restoration, relaunch, archive inspection, asset selection, or implementation work.
- Keep [the project guide](docs/PROJECT-GUIDE.md), [asset provenance](docs/ASSET-PROVENANCE.md), and [relaunch checklist](docs/RELAUNCH-CHECKLIST.md) current with relevant changes.
- The first application is a focused restoration, not a complete migration of every legacy feature.

## Identity And Scope

- The primary interface reference is `archive/legacy-site/_export/home`. Retain its home graphics, original historical text, and black/charcoal identity.
- Use the user-supplied `archive/screenshots/Screenshot 2026-10-30 at 23.50.02.png` as the primary layout reference and the recording in that folder as transition evidence. Do not infer complete layouts from isolated exports. Screenshots are private reference material, not public assets.
- **Visual fidelity is a requirement, not a suggestion.** Before changing visible UI, inspect the exact supplied screenshot/reference and original home export at the relevant state and viewport. Preserve original artwork, typography, font face, glyph shapes, kerning, proportions, alignment, spacing, colors and composition. Use the exact reviewed asset whenever one exists; do not redraw a logo or replace an image with text/CSS, a substitute font, approximation or generic component styling. Add visual regression checks against the reference where practical. If exact reproduction is not possible with available, approved assets or evidence, do not implement a visual approximation: explain the specific limitation, offer clear options and ask the user which trade-off they approve before changing the design.
- Preserve the widescreen display, bottom keyboard-shaped content bank and right-hand layered context navigation. Mouse clicks and keyboard controls must dispatch the same selection behavior; context changes reset the bank. Record and test shortcut mappings, native keyboard focus and reduced motion.
- Preserve navigation labels and order: Music, Videos, Games, AV Lab, Portfolio, Info. Adapt layout responsively without replacing the identity with a generic template.
- Distinguish historical material from present availability. Never fabricate active services, clients, events, playable media, or working legacy integrations.
- The current first prototype is the screenshot-led media console with newly authored AV Lab visual studies. These are not reconstructed original animations. Browser-local favourites, shape filtering, detailed Portfolio case studies and original media migration remain pending until explicitly completed and verified.

## Archive And Security

- All 179 original top-level entries were moved into `archive/legacy-site`; 25,015 files were SHA256-verified. `archive/inventory.json` records the baseline. This is a recorded verification, not a claim that every future copy is verified.
- Treat original exports and the entire archive as read-only, untrusted evidence. A suspicious obfuscated PHP entry point was discovered. Never execute it or any legacy PHP, ASP, SWF, script, installer, or server configuration.
- Inspect source as data using read-only tools. Do not serve the archive as a web root or install dependencies from it.
- Keep the archive gitignored and outside the public build. Never copy it wholesale into `public/` or `out/`. Do not copy private files, credentials, server configs, or executable legacy content.
- Current scope is exclusively `archive/legacy-site/_export/home`; ignore all other legacy content unless the user expands scope. Curate reviewed vector artwork into `public/artwork/home/`, retaining original numeric filenames. Record every selected asset and transformation before publishing it.
- Preserve a separate archive backup and verify it before relaunch. Git is not the archive backup.

## Implementation Contract

- Runtime: Node.js `>=24.22.2 <25` on macOS, Linux and Windows with supported ARM64 or x64 binaries. Prefer the host-native architecture (ARM64 on Apple Silicon, x64 on Intel Macs and standard GitHub Ubuntu runners). Enforce the version through `.node-version`, `engines.node`, `.npmrc` and the npm runtime preflight. Never require Apple Silicon or ARM-only CI. DreamHost serves the exported static files and does not need Node installed.

- Use the current stable Next.js release at implementation time, TypeScript, and App Router. Record the chosen version in the project guide.
- Configure static export with `output: 'export'`, `trailingSlash: true`, and `images: { unoptimized: true }`. Deploy at the domain root, without a subdirectory base path.
- No API routes, Server Actions, SSR, request-time server logic, or runtime PHP, ASP, or SWF. Build-time static rendering is allowed. Use client-side browser APIs only where needed.
- Recreate interactions with modern accessible HTML, CSS, and TypeScript. Never embed Flash or silently imply unsupported legacy features work.
- Verify static output, routes, asset references, desktop/mobile layout, keyboard access, and browser-local state. Report untested behavior honestly.

## Git And Deployment Boundaries

- `main` is production-only: never use it as an active development worktree or edit it directly. Start each task from the latest `origin/develop` in a dedicated feature branch/worktree, then use a PR into `develop`. Promote tested staging changes from `develop` to `main` only through a separate reviewed PR after explicit release approval. Never commit directly to `main` or `develop`, force-push, or overwrite another worktree's changes.
- Local Git initialisation is authorised. Do not create commits, remotes, remote repositories, or push without an explicit request.
- Branch deployments are implemented in the workflow: `develop` targets `dev.superheads.co.uk`, `main` targets `superheads.co.uk`. Follow [deployment guidance](docs/DEPLOYMENT.md). Repository readiness variables gate initial activation; staging hosting, GitHub secrets and environment protection require configuration and verification. Never enable those gates or perform extra deployments without authorisation.
- The hosting account is shared with Orphism, but targets must be Superheads-only. Refer to SSH environment variables `sshorphismuser`, `sshserver`, and `sshport`; never record their values or copy another site's deployment settings.
- Only the generated static `out/` contents may be deployed to the separately verified Superheads target. Preserve `.well-known/`; exclude the archive, source, secrets, and legacy server files.
- Maintain application, documentation and deployment checks together when their contracts change.
