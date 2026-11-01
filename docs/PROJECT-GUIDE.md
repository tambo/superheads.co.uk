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

## Console Controls

### Tomaz Sounder Audio

The screenshot `archive/screenshots/Screenshot 2026-10-31 at 23.19.05.png` guides the compact charcoal/orange player next to the map. This is newly implemented HTML/CSS and native audio, not an embedded Flash player or an exact reconstruction of its artwork. It has previous/next, play/pause, stop, seeking, volume and elapsed/duration controls. Historical LO/HI bandwidth controls are not fabricated because the catalogue does not provide alternative bitrate sources.

Artist metadata comes from Orphism's `_artists/tomaz-sounder.md`: title `Tomaz Sounder`, excerpt `House, Techno, Drum & Bass`, audio folder `tomaz-sounder`. Superheads reads `https://orphism.co.uk/audio/audio-list.php?folder=tomaz-sounder` in the browser and uses that response's existing `/audio/audio-proxy.php` URLs, resolved on Orphism. Only audio entries are mapped in catalogue order to the 17 Music pads. Pointer and keyboard selection start the same track; player transport updates the pad selection while Music is open. Leaving Music preserves playback; returning restores its selected pad. No new PHP, API route, audio-file copy or authentication token is introduced in Superheads.

Live access rechecked on 2026-11-01 after the user deployed Orphism updates: `https://superheads.co.uk` and `https://dev.superheads.co.uk` receive exact-origin catalogue CORS permission and 206 byte-range stream responses. Localhost still receives no catalogue CORS permission and 403 streams, so the local player retains its unavailable/retry state. Do not add wildcard CORS, forge headers, weaken filename/range validation or deploy PHP to Superheads. No Orphism files or remote configuration were changed by this agent.

Validation: 24 unit tests, TypeScript and static build passed. Browser tests exercise actual native media playback using generated WAV byte-range responses and mocked copies of the ten verified Tomaz Sounder catalogue entries, plus catalogue failure/retry and 1440/390/320px layouts. Production/staging catalogue and range access now pass read-only HTTP checks; real browser MP3 playback is checked separately during release. Safari/Firefox remain unverified.

The map-box heading is a looping ticker with the default message `Greetings groovers ... welcome to the relaunch ... superheads still going after 25 years...`. The original hollow arrow uses the unchanged reviewed `191.svg`, with its original grey stroke and no fill; its size and inset follow the screenshot proportions. The header spans the inner width while reserving text clearance beside the arrow. There is no manual pause button. Reduced motion automatically stops scrolling and displays the message statically with wrapping; the map uses the remaining space below. Static build (including TypeScript) and eight Chromium browser tests passed on 2026-11-01, including exact arrow source/dimensions, ticker separation and live reduced-motion changes. The map box remains hidden on the existing small-screen layout.

Top-level section labels are uppercase in heavy Helvetica Neue (weight 900), with Helvetica/sans-serif fallbacks. The exported `fonts/50_Akzidenz Grotesk BE Super.ttf` appears closer to the original heavy lettering, but webfont redistribution clearance is not recorded; it has not been copied or embedded. The system-font choice is not a claim of exact typeface reproduction. Static build and seven Chromium browser tests passed for this typography update on 2026-11-01.

The bottom content bank has 17 square pads in a staggered 10+7 desktop arrangement. Each face shows only its index and assigned keyboard key; accessible labels identify content and empty slots are disabled. Three square top-right buttons span the column: AV LAB, Community, Jukebox. AV LAB shows Music, Videos, Games and Lab; Community shows SoftFood Cafe and Twat Modern; Jukebox has no submenu. About Us, Contact and Info buttons are removed. Mobile reflows the keys and navigation without horizontal overflow. Community services and Jukebox playback remain unrestored.

## Technical Contract

- Framework: Next.js 16.4.3, React 19.3.1, TypeScript and App Router; versions selected from the registry during setup. Runtime: Node.js >=24.22.2 <25 on macOS, Linux and Windows, with native ARM64 or x64. `.node-version`, npm lifecycle checks and CI enforce the Node version; CI uses standard x64 Ubuntu.
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
| Q / W / E / R / T / Y / U / I / O / P / A / S / D / F / G / H / J | Select the corresponding numbered pad; empty slots remain disabled |
| 1 / 2 / 3 / 4 | Music / Videos / Games / AV Lab |
| Space | Pause/resume an AV Lab study; focused native buttons retain Space activation |
| Backspace | Restart the visual study |
| Escape | Return to AV Lab |
| Pointer | Click the same controls; move over a study to change its composition |

Empty pads are disabled. Held key repetition, text-entry fields and modifier shortcuts are excluded. System reduced-motion preference freezes automatic animation. Play/pause, restart and fullscreen have labelled icon buttons and tooltips; fullscreen uses the native (or webkit-prefixed) Fullscreen API and, where unavailable (iPhone Safari), a CSS full-viewport fallback with an Exit button and Escape support. The fallback is verified only in emulated Chromium, not on a real iPhone. No sounds, videos, games, account services or external contact availability are fabricated.

## Verification And Maintenance

Use [RELAUNCH-CHECKLIST.md](RELAUNCH-CHECKLIST.md) as the release gate. Record actual test commands and results, asset provenance, known gaps and scope changes as implementation progresses. Test static route output, root assets, mobile/desktop fidelity, keyboard navigation, favourites storage behavior and gallery filters. A historical hash baseline does not replace verification of the separate backup or new derived assets.

## Decision And Change Record

Navigation update on 2026-11-01: implemented the three square sections and section-specific submenus, removed Info links, and verified selection reset and 4/2/0 submenu counts. Typecheck, 20 unit tests, static export and seven Chromium browser tests passed; square dimensions and full-column fit checked at 1440/390/320px. No deployment or legacy-service restoration.

Console spacing update on 2026-10-31, in `feat/console-spacing` based on `origin/develop`: four collection controls beneath AV LAB, three individually selectable lower Info links and 17 numbered/key-only pads. Focused state tests, TypeScript, static export and seven Chromium tests passed, including screenshots at 1440/390/320px. This is a local preview, not a deployment or a claim of pixel-identical reconstruction. Workspace inspection does not require permission; archives remain read-only data. Future coding uses develop-based feature worktrees, with main reserved for production.

Collaboration setup added on 2026-10-31: [MAC-SETUP.md](MAC-SETUP.md) and the clickable launcher guide a collaborator through native Node 24, Git, VS Code, her own GitHub SSH key and Copilot sign-in. Installations are opt-in; no shared keys or global profile copying. The [shared roadmap](TODO.md) remains available, but its automated claim workflow is paused at the user's request; people and agents should check active owners and coordinate conversationally. Revisit automation later if simultaneous work makes it useful again. A fresh-Mac run remains unverified.

Branch deployment implementation added on 2026-10-31: `develop` -> `dev.superheads.co.uk`, `main` -> `superheads.co.uk`, with build/test gates and separate environment readiness variables. See [DEPLOYMENT.md](DEPLOYMENT.md). GitHub secrets, environment protection and staging DNS/TLS are external setup. Node 24 staging was deployed directly from `develop` commit `9d767d3` after the GitHub build passed; Actions deploy skipped because its readiness variable remains unset. Live output and assets verified.

GitHub repository: `git@github.com:tambo/superheads.co.uk.git`, configured as `origin` at the user's request on 2026-10-31. The initial source publication uses `main`; private archive and screenshots, dependencies, build output and local environment files remain excluded. GitHub publishing does not itself deploy the site; no automatic deployment workflow is configured. This supersedes earlier statements that repository remotes and commits are pending.

Production prototype is live at `https://superheads.co.uk/` as of 2026-10-31. The user explicitly requested cleaning the remote root and using their existing backup without creating another. The guarded deploy preserves `.well-known/` and `.dh-diag`, transfers only `out/`, and requires explicit approval. Backup skip is opt-in through `SUPERHEADS_SKIP_BACKUP=yes`; default deployments retain their backup step. HTTPS output, referenced assets, 404 behavior and live keyboard controls were verified. Original media restoration, staging configuration and Git commits/remotes remain pending. This release status supersedes earlier setup-only statements above.

| Date | Decision or change | Evidence / status |
| --- | --- | --- |
| 2026-10-30 | Establish canonical root guidance, concise Copilot pointer, project skill and human release records | Guidance only; no application or deployment implementation |
| 2026-10-30 | Retain static-first, identity-led restoration and read-only untrusted archive boundaries | User requirements; application version, asset selection and media migration remain pending |
| 2026-10-31 | Implement screenshot-led console and equivalent mouse/keyboard input | 3 state tests, TypeScript, static build/export check and 6 Chromium browser tests passed |
| 2026-10-31 | Check desktop/mobile rendering and motion | Screenshots at 1440/390/320px, original wordmark rendering, canvas pixel variation, animation, pause and reduced-motion checks passed; Safari and Firefox remain untested |
| 2026-10-31 | Enforce exact visual fidelity for UI changes | Restored the original `/artwork/home/4.svg` wordmark; browser tests assert source and dimensions at desktop/mobile sizes. Agent guidance now requires exact-reference comparison and user approval before any approximation. |
| 2026-10-31 | Align local and CI runtime with Node 24 | Set baseline to 24.22.2; full Node 24 build/test validation pending |
| 2026-10-31 | Pause automated work claims | Removed the GitHub claim action and mandatory claim instructions per user request; revisit later if needed |
| 2026-10-31 | Enforce Node 24.22.2 across supported platforms | `fnm` project pin, engine range, strict npm preflight/lifecycle checks, native-architecture Mac helper, standard Ubuntu CI; runtime regression tests added |

Add a dated entry for each relevant implementation or scope change; do not mark planned work as completed.
