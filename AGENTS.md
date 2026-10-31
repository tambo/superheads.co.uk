# Superheads Project Guidance

This is the canonical project-wide, always-on guidance for agents working in this repository. Apply it only to `superheads.co.uk`; this is not the Orphism site or another workspace project. Supporting clients can discover this root file and the project skill, but discovery and obedience depend on the agent and its configuration. These documents are guidance, not a security enforcement mechanism.

## Read First

- Before substantial work, review [COLLABORATION.md](docs/COLLABORATION.md) and the latest `origin/develop` [work board](docs/TODO.md). Automated work claims are paused by user request; do not open claim workflows or block explicitly requested work on a claim. Check active ownership and coordinate with the human before overlapping work. Update the roadmap manually by agreement and preserve newer remote board changes when merging.
- Use [the modernisation skill](.github/skills/superheads-modernisation/SKILL.md) for restoration, relaunch, archive inspection, asset selection, or implementation work.
- Keep [the project guide](docs/PROJECT-GUIDE.md), [asset provenance](docs/ASSET-PROVENANCE.md), and [relaunch checklist](docs/RELAUNCH-CHECKLIST.md) current with relevant changes.
- The first application is a focused restoration, not a complete migration of every legacy feature.

## Identity And Scope

- The primary interface reference is `archive/legacy-site/_export/home`. Retain its home graphics, original historical text, and black/charcoal identity.
- Use the user-supplied `archive/screenshots/Screenshot 2026-10-30 at 23.50.02.png` as the primary layout reference and the recording in that folder as transition evidence. Do not infer complete layouts from isolated exports. Screenshots are private reference material, not public assets.
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

- Use the current stable Next.js release at implementation time, TypeScript, and App Router. Record the chosen version in the project guide.
- Configure static export with `output: 'export'`, `trailingSlash: true`, and `images: { unoptimized: true }`. Deploy at the domain root, without a subdirectory base path.
- No API routes, Server Actions, SSR, request-time server logic, or runtime PHP, ASP, or SWF. Build-time static rendering is allowed. Use client-side browser APIs only where needed.
- Recreate interactions with modern accessible HTML, CSS, and TypeScript. Never embed Flash or silently imply unsupported legacy features work.
- Verify static output, routes, asset references, desktop/mobile layout, keyboard access, and browser-local state. Report untested behavior honestly.

## Git And Deployment Boundaries

- Local Git initialisation is authorised. Do not create commits, remotes, remote repositories, or push without an explicit request.
- Branch deployments are implemented in the workflow: `develop` targets `dev.superheads.co.uk`, `main` targets `superheads.co.uk`. Follow [deployment guidance](docs/DEPLOYMENT.md). Repository readiness variables gate initial activation; staging hosting, GitHub secrets and environment protection require configuration and verification. Never enable those gates or perform extra deployments without authorisation.
- The hosting account is shared with Orphism, but targets must be Superheads-only. Refer to SSH environment variables `sshorphismuser`, `sshserver`, and `sshport`; never record their values or copy another site's deployment settings.
- Only the generated static `out/` contents may be deployed to the separately verified Superheads target. Preserve `.well-known/`; exclude the archive, source, secrets, and legacy server files.
- Maintain application, documentation and deployment checks together when their contracts change.
