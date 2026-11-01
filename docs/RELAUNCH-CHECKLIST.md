# Superheads Relaunch Checklist

Use this as a manually reviewed release gate, not evidence that a release has occurred. All implementation and relaunch gates are initially pending. Mark an item complete only with dated evidence in the verification log below. See [PROJECT-GUIDE.md](PROJECT-GUIDE.md) and [ASSET-PROVENANCE.md](ASSET-PROVENANCE.md).

## Archive And Safety

- [ ] Confirm the archive remains read-only and the 179 original top-level entries are retained under `archive/legacy-site`.
- [ ] Verify `archive/` is gitignored and not staged/tracked before any commit; do not commit the 25,015 archived files or publish them wholesale.
- [ ] Create a separate archive backup and verify it against `archive/inventory.json`; record counts, sizes, hashes and mismatch results without sensitive backup paths.
- [ ] Confirm no legacy PHP/ASP/SWF or archived scripts were executed, including the suspicious obfuscated PHP entry point.
- [ ] Review selected assets and derived vectors for active content, external references, private data and rights; complete exact source/destination/hash mappings.
- [ ] Verify public assets and exported output exclude the archive, secrets, private files, server configurations and legacy executable content.

## Identity And Content

- [ ] Compare the restoration against `archive/legacy-site/_export/home`: black/charcoal interface, home graphics, historical text and visual hierarchy retained.
- [ ] Verify three square top-right sections: AV LAB, Community, Jukebox. Check AV LAB submenus Music/Videos/Games/Lab, Community submenus SoftFood Cafe/Twat Modern, no Jukebox submenu, and no About Us/Contact/Info buttons.
- [ ] Review historical context; no fabricated active services, clients, events, integrations or availability claims.
- [ ] Confirm Portfolio case studies are explicitly historical and grounded in archived evidence.
- [ ] Keep media migration pending unless separately completed and tested; do not imply unavailable playback or games are functional.

## Application Verification

- [x] Verify the user's Orphism allowlist update and live Superheads catalogue fetch, range streaming, Music-pad selection and actual MP3 play/pause on staging and production (2026-11-01). Localhost remains blocked; Safari/Firefox untested.
- [ ] Record the selected current stable Next.js version; confirm TypeScript and App Router.
- [ ] Verify `output: 'export'`, `trailingSlash: true`, and `images: { unoptimized: true }`; root deployment with no subdirectory prefix.
- [ ] Confirm no API routes, Server Actions, SSR, request-time backend or runtime PHP/ASP/SWF is required.
- [ ] Run focused behavior checks, type/lint checks available in the implementation, and a successful production static build; record exact commands and results.
- [ ] Serve only `out/` for release verification; test direct nested-route loads, trailing-slash routes, refresh, navigation, missing-page behavior and root asset URLs.
- [ ] Check artwork references retain original numeric filenames under `public/artwork/home/`; review optional additional `logo.gif`.
- [ ] Check desktop and mobile layouts against reference evidence, with no text overlaps, clipping or broken images.
- [ ] Verify keyboard navigation, visible focus, readable contrast, accessible controls and reduced-motion behavior where applicable.
- [ ] Test browser-local favourites: save/remove, persistence after reload, empty state and unavailable/corrupt storage; no implied server sync.
- [ ] Test AV Lab shape gallery filters, reset and empty-result state without a Flash dependency.
- [ ] Check browser console/network errors and explicitly record any untested feature or unsupported legacy behavior.

## Manual Release Gate

Branch workflow and target-isolation checks are implemented; follow [DEPLOYMENT.md](DEPLOYMENT.md) before enabling repository readiness variables. Dev subdomain setup, GitHub secrets/protection and end-to-end Actions verification remain pending. Readiness gates are not evidence of a verified staging release.

- [ ] Have the main agent complete README and deployment implementation separately; review them without copying unrelated site settings.
- [ ] Independently verify Superheads-only staging and production targets on the shared Dreamhost account; use only `sshorphismuser`, `sshserver`, `sshport` variable names in committed instructions.
- [ ] Record eventual `develop` staging and `main` production environment setup; do not assume those environments or remote repositories already exist.
- [ ] Review a deployment dry run: generated static `out/` contents only, correct Superheads root target, `.well-known/` preserved, no archive/source/secrets.
- [ ] Confirm rollback uses a known-good static release and does not restore legacy runtime or overwrite `.well-known/`.
- [ ] Obtain explicit human release authorisation and use a manual gate; no autonomous actual deployment, Git commits, pushes or remote creation.
- [ ] After authorised staging deployment, verify HTTPS, direct routes, root assets, identity and browser interactions on the actual staging domain.
- [ ] Obtain explicit production authorisation after staging review, then verify production and record the release outcome and remaining media migration work.

## Verification Log

| Date | Gate / scope | Exact check or evidence reference | Outcome | Remaining gaps |
| --- | --- | --- | --- | --- |
| 2026-11-01 | Authorised staging and production console/audio release | `npm test`; `npm run build`; `npm run test:e2e`; guarded deploy preview/apply for staging then production; HTTPS comparison and Chromium playback without mocks | Release commit `85b8363` pushed to develop, then main after staging verification; 24 unit/10 browser tests passed; verified backups made for both targets; protected hosting entries preserved; HTML matches build, 11 assets and 404 checks pass on both domains; Music pad 4 plays real `Minor Axis` MP3 and play/pause works | Localhost audio still denied by Orphism; Safari/Firefox untested; no assertion about Actions results or original-media migration |
| 2026-11-01 | Section navigation | `npm run typecheck`; `npm test`; `npm run build`; `npm run test:e2e` | 20 unit tests and 7 Chromium tests passed; three square buttons span the column at 1440/390/320px; submenus switch 4/2/0; Info links absent | Local preview only; Community services and Jukebox playback unrestored; Safari/Firefox untested |
| 2026-10-31 | Console spacing feature worktree | `node --test tests/console-state.test.mjs`; `npm run typecheck`; `npm run build`; `npm run test:e2e` | 3 focused state tests and 7 browser tests passed; 35 static output files exclude archive/runtime; screenshots inspected at 1440/390/320px | Local-only changes; exact reference fidelity and real Safari/Firefox remain unverified; no deployment |
| 2026-10-31 | Console input | `npm test` | 3 focused state tests passed | Original media integration pending |
| 2026-10-31 | Types and static output | `npm run typecheck`; `npm run build` | Passed; homepage plus 34 export files, no archive or legacy runtime in output | No remote release verification |
| 2026-10-31 | Browser console and responsive layout | `npm run test:e2e` | 6 Chromium tests passed: input, context reset, motion/pause, 1440/390/320px, assets, reduced motion and native Space behavior | Safari/Firefox, full legacy media, favourites and gallery filters untested/unimplemented |
| 2026-10-31 | Dependency audit | `npm install` audit | Zero reported vulnerabilities after updating prototype tooling | Future dependency updates need repeat audit |
| 2026-10-31 | Node 24 staging release | Node `v24.22.2`; `npm run build`; `npm test`; `npm run typecheck`; `npm run test:e2e`; guarded `scripts/deploy.sh apply staging` | Build passed; 16 unit tests and 7 browser tests passed; staging deployed from `develop` commit `9d767d3`; existing backup used, no new copy made | GitHub build succeeded but its deploy job was skipped because `SUPERHEADS_STAGING_READY` is unset; upload was performed directly after target verification |
| 2026-10-31 | Live staging smoke checks | HTTPS fetch comparison, asset fetches, 404 and browser keyboard controls at `https://dev.superheads.co.uk/` | Homepage matches local static output; all 10 referenced assets return 200; 404 and Games/AV Lab keyboard navigation passed | Real-device Safari still untested; configure readiness gate only after owners agree CI deployment is ready |
| 2026-10-31 | Authorised production replacement | `scripts/deploy.sh apply` with explicit approval and backup skip | Removed 5,426 obsolete entries and uploaded static output to the verified Superheads root; `.well-known/` and `.dh-diag` preserved | User reports an existing backup; it was not independently verified and no new backup was created |
| 2026-10-31 | Live production verification | HTTPS fetch comparison and browser keyboard checks at `https://superheads.co.uk/` | Homepage matches local output; 10 referenced assets return 200; missing page returns 404; keyboard pad/context switching and nonblank canvas passed | Original media and tools remain unrestored; staging was not used for this explicitly requested direct production release |

Keep the log factual. Documentation checks do not satisfy application, backup, staging or production gates. Leave unchecked items visible at handoff.
