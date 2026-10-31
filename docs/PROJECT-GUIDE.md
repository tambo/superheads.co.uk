# Superheads Project Guide

## Goal

Relaunch Superheads as a recognisable, accessible static site while preserving the original identity. The first application is a focused restoration, not a full legacy migration. [AGENTS.md](../AGENTS.md) is the canonical agent guidance; [the skill](../.github/skills/superheads-modernisation/SKILL.md) provides the execution workflow.

## Evidence And Identity

The primary interface reference is `archive/legacy-site/_export/home`. Preserve its home graphics, black/charcoal interface, historical text, and navigation in this order: Music, Videos, Games, AV Lab, Portfolio, Info. Responsive layouts and accessible interactions may modernise the presentation without replacing its character.

The user-supplied `archive/screenshots/Screenshot 2026-10-30 at 23.50.02.png` controls layout decisions. The 38.845-second recording `archive/screenshots/Screen Recording 2026-10-30 at 23.55.38.mov` was sampled as read-only video evidence. It shows in-display loading and content transitions, not a conventional multipage website. Some other captures include unrelated desktop material and are not publication assets.

The interface is a media console: an approximately 2.835:1 main display, a right-hand context menu, and a bottom keyboard-shaped pad bank. Right-hand and top-level context changes replace the pad bank and reset selection; pads replace the display content. Black, thin grey outlines, orange arrows, yellow selections, the original vector wordmark and world map establish the identity. Mobile rearranges these controls without turning them into a landing page.

All 179 original top-level entries were moved into `archive/legacy-site`. The supplied baseline records 25,015 SHA256-verified files with `archive/inventory.json`. Keep the original exports read-only. This guidance task has not repeated archive verification.

The archive is untrusted: a suspicious obfuscated PHP entry point was discovered. Never run archived PHP, ASP, SWF, scripts or server configuration, and never expose the archive through a web root. Inspect files as data. Keep it gitignored and back it up separately before relaunch.

## First Restoration

| Area | Initial contract | Limitation |
| --- | --- | --- |
| Home | Restore original graphics, visual hierarchy and historical copy | Curated assets only; no wholesale archive publication |
| Navigation | Music, Videos, Games, AV Lab, Portfolio, Info | Do not imply every historical integration is available |
| Favourites | Browser-local saved choices with accessible controls | No account, server persistence or cross-device sync; handle storage failures |
| AV Lab | Six pads select three newly authored visual studies and colour variants | Not original restored animations; shape gallery/filtering still pending |
| Portfolio | Historical case studies based on source evidence | Do not imply current clients, services or endorsements |
| Music / Videos / Games | Preserve identity and accurate historical context | Media migration remains pending; verify availability before enabling experiences |
| Info | Preserve historical text with clear temporal context | No fabricated active services, events or contact promises |

## Technical Contract

- Framework: Next.js 16.4.3, React 19.3.1, TypeScript and App Router; versions selected from the registry during setup. Node.js >=20.9.0.
- Static build: `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }`.
- Deployment: domain root, static `out/` contents only; no subdirectory base path.
- No API routes, Server Actions, SSR, request-time backend or runtime PHP/ASP/SWF. Build-time rendering and browser-local interactions are allowed.
- Reviewed vector artwork goes to `public/artwork/home/` with original numeric filenames. Only `archive/legacy-site/_export/home` is in content scope; screenshots and recording are additional private reference evidence. Track exact mappings in [ASSET-PROVENANCE.md](ASSET-PROVENANCE.md).
- Do not copy secrets, private data, server configurations, legacy executables or the archive into public output.

## Hosting And Release

Use the same Dreamhost account as Orphism only through local SSH environment variables `sshorphismuser`, `sshserver`, and `sshport`. Never include their values in source or documentation. Account sharing does not permit sharing deployment targets or configuration.

Superheads-only target paths must be independently verified before any release. The eventual environment model is `develop` for staging and `main` for production; it is not configured by this guidance. Initially use a manually gated deployment. Deploy only generated `out/` contents, preserving `.well-known/`. Never autonomously deploy or create commits, remotes or remote repositories. Local Git initialisation is authorised.

The app and gitignore are now implemented. Local Git has no commits or remotes. Deployment scripts and remote targets are not configured; no deployment has occurred. The package currently reserves deployment commands for that future work and they must not be treated as usable release tooling.

## Console Controls

| Input | Action |
| --- | --- |
| Q / W / E / A / S / D | Select one of the six context-sensitive pads |
| 1 / 2 / 3 / 4 / 5 / 6 | Music / Videos / Games / AV Lab / Portfolio / Info |
| Space | Pause/resume an AV Lab study; focused native buttons retain Space activation |
| R | Restart the visual study |
| Escape | Return to AV Lab |
| Pointer | Click the same controls; move over a study to change its composition |

Empty pads are disabled. Held key repetition, text-entry fields and modifier shortcuts are excluded. System reduced-motion preference freezes automatic animation. Play/pause, restart and fullscreen have labelled icon buttons and tooltips; fullscreen uses the native (or webkit-prefixed) Fullscreen API and, where unavailable (iPhone Safari), a CSS full-viewport fallback with an Exit button and Escape support. The fallback is verified only in emulated Chromium, not on a real iPhone. No sounds, videos, games, account services or external contact availability are fabricated.

## Verification And Maintenance

Use [RELAUNCH-CHECKLIST.md](RELAUNCH-CHECKLIST.md) as the release gate. Record actual test commands and results, asset provenance, known gaps and scope changes as implementation progresses. Test static route output, root assets, mobile/desktop fidelity, keyboard navigation, favourites storage behavior and gallery filters. A historical hash baseline does not replace verification of the separate backup or new derived assets.

## Decision And Change Record

Collaboration setup added on 2026-10-31: [MAC-SETUP.md](MAC-SETUP.md) and the clickable launcher guide a collaborator through native Node 24, Git, VS Code, her own GitHub SSH key and Copilot sign-in. Installations are opt-in; no shared keys or global profile copying. The [shared roadmap](TODO.md) remains available, but its automated claim workflow is paused at the user's request; people and agents should check active owners and coordinate conversationally. Revisit automation later if simultaneous work makes it useful again. A fresh-Mac run remains unverified.

Branch deployment implementation added on 2026-10-31: `develop` -> `dev.superheads.co.uk`, `main` -> `superheads.co.uk`, with build/test gates and separate environment readiness variables. See [DEPLOYMENT.md](DEPLOYMENT.md). GitHub secrets, environment protection and staging DNS/TLS provisioning remain external setup steps; earlier statements that no workflow exists are superseded. No remote deployment was performed during this setup.

GitHub repository: `git@github.com:tambo/superheads.co.uk.git`, configured as `origin` at the user's request on 2026-10-31. The initial source publication uses `main`; private archive and screenshots, dependencies, build output and local environment files remain excluded. GitHub publishing does not itself deploy the site; no automatic deployment workflow is configured. This supersedes earlier statements that repository remotes and commits are pending.

Production prototype is live at `https://superheads.co.uk/` as of 2026-10-31. The user explicitly requested cleaning the remote root and using their existing backup without creating another. The guarded deploy preserves `.well-known/` and `.dh-diag`, transfers only `out/`, and requires explicit approval. Backup skip is opt-in through `SUPERHEADS_SKIP_BACKUP=yes`; default deployments retain their backup step. HTTPS output, referenced assets, 404 behavior and live keyboard controls were verified. Original media restoration, staging configuration and Git commits/remotes remain pending. This release status supersedes earlier setup-only statements above.

| Date | Decision or change | Evidence / status |
| --- | --- | --- |
| 2026-10-30 | Establish canonical root guidance, concise Copilot pointer, project skill and human release records | Guidance only; no application or deployment implementation |
| 2026-10-30 | Retain static-first, identity-led restoration and read-only untrusted archive boundaries | User requirements; application version, asset selection and media migration remain pending |
| 2026-10-31 | Implement screenshot-led console and equivalent mouse/keyboard input | 3 state tests, TypeScript, static build/export check and 6 Chromium browser tests passed |
| 2026-10-31 | Check desktop/mobile rendering and motion | Screenshots at 1440/390/320px, original wordmark rendering, canvas pixel variation, animation, pause and reduced-motion checks passed; Safari and Firefox remain untested |
| 2026-10-31 | Align local and CI runtime with Node 24 | Set baseline to 24.22.2; full Node 24 build/test validation pending |
| 2026-10-31 | Pause automated work claims | Removed the GitHub claim action and mandatory claim instructions per user request; revisit later if needed |

Add a dated entry for each relevant implementation or scope change; do not mark planned work as completed.
