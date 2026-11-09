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

Fresh visit: the interface opens directly in AV LAB/Lab with visual 1 selected. The former intro video (`suzanna_intro.mp4`) was removed because it loaded slowly.

### Interface Vocabulary

Use these names in task briefs, reviews, tests, and handoffs so people can identify the same control groups:

| Name | Location and contents |
| --- | --- |
| Section Navigation | Upper-right square AV LAB, Community, and Jukebox buttons. The Jukebox section tile is navigation, not the audio player. |
| Context Navigation | Choices for the active section, such as Music, Videos, Games, and Lab. |
| Main Display | Central widescreen content viewport for text, visual studies, shaders, or videos. |
| Display Transport | Controls immediately below Main Display: play/pause, restart, fullscreen, and auto-play; Videos also has Video Audio Source Toggle and Shader Overlay Toggle. |
| Keyboard Content Bank | Bottom QWERTY pad rows used to select the current context's content. Also called the Pad Bank in CSS and tests. |
| Jukebox Audio Player | Compact Tomaz Sounder player in the header, including the Playlist Toggle, Playlist Dropdown, Now Playing display, seek slider, audio transport, and volume slider. |
| Destination Panel | Map artwork and greeting ticker. |

When referring to the video-only controls, use **Video Audio Source Toggle** for switching between video sound and Jukebox sound, and **Shader Overlay Toggle** for enabling/disabling the effect. Do not call the Jukebox section tile the player or playlist.

The Lab's **Audio Input Selector** lets a user grant microphone permission and select an audio-input device to drive shader levels. It is off by default and captures only after a user gesture. The MediaStream connects to an `AnalyserNode` without connecting to `AudioContext.destination`, so microphone audio is not played by Superheads. Device labels may be unavailable until permission is granted; denial and unsupported browsers show an explicit status. Deselecting the input or leaving Lab stops all media tracks and closes its AudioContext. Browser tests mock devices and verify the stream is not routed to output; real device permission and microphone signal quality remain browser/device-specific checks.

### Full Lab Keyboard

Release status (2026-11-04): the user approved the full local preview below, including the 1.2-second crossfade, 26-key layout, bracket shortcuts and revised plasma Body of Light. Application commit `fecdf47` was pushed to develop, deployed and smoke-tested on staging, then promoted to main and deployed with the identical static build. Both previous site trees were backed up and verified; `.well-known/` and `.dh-diag` were preserved. Staging and production serve the matching HTML and all 26 shader files. Real Chromium checks confirmed B selects Body of Light, actual MP3 playback, both bracket toggles, an automatic crossfade and paused audio remaining paused. Production's 11 referenced assets and 404 response passed. All 34 unit tests, 18 browser tests and static build passed before release. This release status supersedes local-only/pending statements in the preview notes below; Safari/Firefox remain unverified.

Local expansion on 2026-11-04: Lab now has 26 square letter pads in three staggered QWERTY rows (`QWERTYUIOP`, `ASDFGHJKL`, `ZXCVBNM`), including at 320px. The first 17 mappings are preserved. Added K: Prism, L: Silk Ribbons, Z: Gyroid, X: Radar Bloom, C: Nebula, V: Luminous Lattice, B: Body of Light, N: Circuit Flow, M: Eclipse. Each new shader uses bass, mid, treble and overall audio levels with restrained modulation and continues time-based movement without audio. These are newly authored GLSL visuals, not reconstructed historical media. The shader configuration cap is 26; other contexts retain their existing 17-pad layout and Music catalogue limit.

Visual 24/B was revised locally from Petal Engine to Body of Light after the user found it too similar to Mandala (14). Its original procedural composition is a seated luminous human silhouette, translucent ribs, spine, flowing meridians, seven energy points, aura and companion figures. Following feedback about dark space and weak reaction, a full-frame domain-warped plasma field and brighter plasma-filled body were added. Square-root-shaped audio bands reveal quieter signals: bass expands the figure and plasma flow, mids shift colour and flow, treble accents filaments, and overall level increases radiance. The baseline keeps moving without audio. GPU regression checks require over 85% illuminated frame coverage in silence and a measurable response at 0.08 audio input. It uses broad luminous-body/meditative imagery, with no copied painting, image texture or artist shader source. Mandala and the remaining mappings are unchanged. Local review only.

`[` toggles fullscreen through the same action as its icon, supporting native and CSS fallback modes; `]` toggles visual auto-play while Lab is selected and its shader list is ready. Held-key repetition, modifier shortcuts and text/form inputs remain excluded. Tooltips and `aria-keyshortcuts` expose the bindings. The approved 1.2-second automatic dissolve and audio pause/stop override remain unchanged.

Verified locally: 34 unit tests, static build with TypeScript and 18 browser tests passed. All 26 programs compiled and produced nonblank WebGL pixels with a measured pixel difference between zero and active audio inputs. Desktop/390px/320px checks preserve exactly three letter rows, square keys and no horizontal overflow. Real localhost checks confirmed all nine new selections and both bracket toggles. No commits, pushes or deployment for this expansion or the pending crossfade.

### Lab Visual Auto-Play

Local crossfade preview (2026-11-04, not committed or deployed): automatic selections hold a snapshot of the outgoing frame while the next shader loads and compiles, then dissolve it over the new animation for 1.2 seconds with ease-in-out timing. Only one WebGL shader runs at a time; the outgoing image is static during the dissolve. Manual selections remain immediate. Reduced motion skips the transition, including when enabled mid-fade. Animation cleanup runs on interruption/unmount. Audio pause/stop behaviour is unchanged. Static build, 34 unit tests and 15 browser tests passed; real-time localhost midpoint captures at 1440/390px confirmed opacity 0.5, no shader errors and no horizontal overflow. User review of duration and appearance remains pending.

Audio pause/stop override (2026-11-04): timer-driven visual changes never request audio playback. Audio stays paused or stopped while visuals continue cycling. Explicit manual visual selection (including reselecting the current pad) can start audio again, as can the player's Play control. Automatic and manual selections are tracked separately and covered by native-audio browser regression tests.

Updated on 2026-11-04: Checker Warp (pad 16) uses lower bass/mid distortion and brightness gain. Overall audio level reduces the modulation further during intense passages, preserving the underlying timed warp and giving quieter passages more relative movement. This adjustment is local to Checker Warp; other shader/audio gains are unchanged. Listening-based tuning remains subjective.

The shuffle icon beside fullscreen toggles visual auto-play, off by default. While enabled in Lab, it chooses a different loaded shader every randomly selected 5-10 seconds without immediate repeats. Visual pause and leaving Lab cancel the pending timer; returning/resuming starts a fresh interval. Manual pad selection restarts the interval, switching the toggle off keeps the selected visual, and the audio track is not shuffled. Timer cleanup also runs on unmount. The enabled button has a yellow pressed state and an accessible toggle label.

Release verification on 2026-11-04: 34 unit tests, TypeScript/static export and 14 Chromium browser tests passed, including timer boundaries, nonrepeating selection, pause/off/context cancellation, audio pause/stop preservation and animated Checker Warp rendering. Desktop/mobile screenshots at 1440/390px show no horizontal overflow or shader errors. Changes were committed in `d0abd08` and `de9213f`, with existing main merge history preserved in `8a45a82`. The identical tested build was deployed to staging then production with verified backups and protected hosting entries preserved. Both domains match the release HTML and Checker Warp source; live Chromium checks confirmed real audio playback, automatic shuffle preserving pause/stop, and manual pad selection resuming playback.

### Tomaz Sounder Audio

Local playback fix (2026-11-01): when opened at `http://localhost:3000`, both catalogue and stream URLs use `https://dev.orphism.co.uk`. Other hosts retain the production audio origin. Native audio uses anonymous CORS so the browser sends its actual Origin; staging rejects Referer-only localhost media requests. Real localhost `Minor Axis` MP3 playback and pause passed in Chromium without mocks. Use localhost rather than 127.0.0.1, which is not permitted by the existing Orphism staging configuration. No remote permissions or deployment were changed for this fix.

The screenshot `archive/screenshots/Screenshot 2026-10-31 at 23.19.05.png` guides the compact charcoal/orange player next to the map. This is newly implemented HTML/CSS and native audio, not an embedded Flash player or an exact reconstruction of its artwork. It has previous/next, play/pause, stop, seeking, volume and elapsed/duration controls. Historical LO/HI bandwidth controls are not fabricated because the catalogue does not provide alternative bitrate sources.

Artist metadata comes from Orphism's `_artists/tomaz-sounder.md`: title `Tomaz Sounder`, excerpt `House, Techno, Drum & Bass`, audio folder `tomaz-sounder`. Superheads reads `https://orphism.co.uk/audio/audio-list.php?folder=tomaz-sounder` in the browser and uses that response's existing `/audio/audio-proxy.php` URLs, resolved on Orphism. Only audio entries are mapped in catalogue order to the 17 Music pads. Pointer and keyboard selection start the same track; player transport updates the pad selection while Music is open. Leaving Music preserves playback; returning restores its selected pad. No new PHP, API route, audio-file copy or authentication token is introduced in Superheads.

Live access rechecked on 2026-11-01 after the user deployed Orphism updates: `https://superheads.co.uk` and `https://dev.superheads.co.uk` receive exact-origin catalogue CORS permission and 206 byte-range stream responses. Localhost still receives no catalogue CORS permission and 403 streams, so the local player retains its unavailable/retry state. Do not add wildcard CORS, forge headers, weaken filename/range validation or deploy PHP to Superheads. No Orphism files or remote configuration were changed by this agent.

Validation: 24 unit tests, TypeScript and static build passed. Ten browser tests exercise native playback with generated WAV range responses, catalogue failure/retry and 1440/390/320px layouts. During the 2026-11-01 release, headless Chromium sessions without mocks on staging and production selected Music pad 4, played the real `Minor Axis` MP3 (340.987479 seconds), observed advancing playback with no media error, and verified play/pause. Safari/Firefox remain unverified.

The map-box heading is a looping ticker with the default message `Greetings groovers ... welcome to the relaunch ... superheads still going after 25 years...`. The original hollow arrow uses the unchanged reviewed `191.svg`, with its original grey stroke and no fill; its size and inset follow the screenshot proportions. The header spans the inner width while reserving text clearance beside the arrow. There is no manual pause button. Reduced motion automatically stops scrolling and displays the message statically with wrapping; the map uses the remaining space below. Static build (including TypeScript) and eight Chromium browser tests passed on 2026-11-01, including exact arrow source/dimensions, ticker separation and live reduced-motion changes. The map box remains hidden on the existing small-screen layout.

Top-level section labels are uppercase in heavy Helvetica Neue (weight 900), with Helvetica/sans-serif fallbacks. The exported `fonts/50_Akzidenz Grotesk BE Super.ttf` appears closer to the original heavy lettering, but webfont redistribution clearance is not recorded; it has not been copied or embedded. The system-font choice is not a claim of exact typeface reproduction. Static build and seven Chromium browser tests passed for this typography update on 2026-11-01.

The Lab content bank has 26 square pads in three QWERTY rows; other contexts retain 17 pads. Each face shows only its index and assigned keyboard key; accessible labels identify content and empty slots are disabled. Three square top-right buttons span the column: AV LAB, Community, Jukebox. AV LAB shows Music, Videos, Games and Lab; Community shows SoftFood Cafe and Twat Modern; Jukebox has no submenu. About Us, Contact and Info buttons are removed. Community services and Jukebox playback remain unrestored.

## Technical Contract

- Framework: Next.js 16.4.3, React 19.3.1, TypeScript and App Router; versions selected from the registry during setup. Runtime: Node.js >=20.9.0 (any newer version accepted; CI uses the current Node LTS; 24.22.2 is only the setup-helper default) on macOS, Linux and Windows, with native ARM64 or x64. `.node-version`, npm lifecycle checks and CI enforce the Node version; CI uses standard x64 Ubuntu.
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
| ' | In Videos, switch between video and Jukebox audio |
| `\` | In Videos, toggle the shader overlay |
| Pointer | Click the same controls; move over a study to change its composition |

Empty pads are disabled. Held key repetition, text-entry fields and modifier shortcuts are excluded. System reduced-motion preference freezes automatic animation. Play/pause, restart and fullscreen have labelled icon buttons and tooltips; fullscreen uses the native (or webkit-prefixed) Fullscreen API and, where unavailable (iPhone Safari), a CSS full-viewport fallback with an Exit button and Escape support. The fallback is verified only in emulated Chromium, not on a real iPhone. No sounds, videos, games, account services or external contact availability are fabricated.

## Verification And Maintenance

Use [RELAUNCH-CHECKLIST.md](RELAUNCH-CHECKLIST.md) as the release gate. Record actual test commands and results, asset provenance, known gaps and scope changes as implementation progresses. Test static route output, root assets, mobile/desktop fidelity, keyboard navigation, favourites storage behavior and gallery filters. A historical hash baseline does not replace verification of the separate backup or new derived assets.

## Decision And Change Record

Release on 2026-11-01: user authorised pushing the current develop work to staging and live after updating Orphism audio access. Feature commit `85b8363` was pushed to develop, deployed to staging using the guarded static script, verified, then fast-forwarded to main and deployed to production using the same `out/` build. Both deployments made and verified backups of their previous public trees outside the web roots and preserved `.well-known/` and `.dh-diag`. HTTPS HTML matches the local build on both domains; all 11 referenced assets and 404 behavior passed. Real Tomaz Sounder catalogue loading, Music-pad track selection and MP3 play/pause passed in Chromium on both domains. These were direct authorised deployments; GitHub Actions results are not asserted here. The unrelated dirty local main checkout was left unchanged.

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

## AV Lab Shader Player

The AV Lab display renders WebGL fragment shaders listed in `public/config/shaders.json` (max 17, one per pad). Each entry has `title`, either `file` (a `/shaders/*.frag` path) or inline `source`, and optional `speed`. Shaders use Shadertoy-style `mainImage` with `iResolution`, `iTime` and `iMouse`. The config is fetched at runtime, so edits on the server need no rebuild. If it is missing or invalid, the original canvas studies remain as the fallback. Play/pause, restart, reduced motion and fullscreen behave as for the studies. Bundled shaders are newly authored.

AV Lab shader playlist now ships 17 newly authored shaders (all pads used, all audio-reactive via iAudio and starting the audio player when selected): Plasma, Tunnel, Pulse Plasma, Lava, Warp, Kaleidoscope, Ripples, Aurora, Metaballs, Interference, Voronoi, Fire, Starfield, Mandala, Waves, Checker Warp and Julia. All compile in headless Chromium (software WebGL).

Fullscreen: the display uses the Fullscreen API where available (hiding navigation UI and requesting landscape orientation lock where supported), otherwise a CSS fixed overlay (iPhone Safari cannot hide its toolbar for non-video content). The shader canvas renders at the displayed size (capped at about 1.6M pixels). Adding the site to the iOS Home Screen or installing it as an app launches it without browser chrome (`manifest.webmanifest`, `appleWebApp`, `viewport-fit=cover`). No app icons have been added.

## AV Lab videos

The Videos section plays YouTube videos with their own audio by default. The display transport can switch to Tomaz Sounder Jukebox audio, which mutes the video and enables the optional WebGL shader overlay. The overlay is off by default and is disabled whenever video audio is selected; browsers cannot expose audio from the cross-origin YouTube iframe for analysis. Videos use the same controls and QWERTY pads as the Lab. The intro and YouTube player fill Main Display width without stretching: height follows the source/player aspect ratio and is centered vertically, so excess height is cropped evenly at top and bottom. Configure it in `public/config/videos.json`: `effects` (shader file in `public/video-effects/`, CSS `blend`, `filter` amounts) and `videos` (11-character YouTube `id`, `title`, optional `effect` and `start`; maximum 26).

The shipped `videos` list is intentionally curated by the user. Preserve manual removals and selections; fewer entries than the channel feed is expected and must not fail validation. Tests should use independent fixtures and validate schema/behavior, never a fixed shipped video ID list or count. Refresh candidates from `channel.handle` with `npm run videos:sync` (uses `YOUTUBE_API_KEY` if set, otherwise the channel RSS feed, which lists about 15 latest videos) or the manually triggered "Sync YouTube videos" workflow. Sync never edits `public/config/videos.json`: it writes new, uncurated videos to `youtube-candidates.json` (gitignored locally; a workflow artifact in CI). Review candidates and add chosen ones through a feature-branch pull request; keep manual titles, effects, start times and order.

Limits: browsers cannot read pixels from a YouTube iframe, so effects are layered over and filtered on the video rather than warping it. Videos that disallow embedding show a message with a link. No video IDs are shipped until the sync is run.
