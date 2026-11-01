# Superheads Asset Provenance

## Source Baseline

Primary visual evidence: `archive/legacy-site/_export/home`. All 179 original top-level entries were relocated under `archive/legacy-site`; 25,015 files were SHA256-verified against the archived baseline recorded in `archive/inventory.json`. This document records that supplied baseline, not a new verification or a rights clearance.

Original exports and inventory are read-only evidence. Keep the archive gitignored, outside public output, and backed up separately before relaunch. A suspicious obfuscated PHP entry point exists in the legacy material. Never execute archived content or copy private files, credentials, server configurations or legacy runtime files into the restored site.

## Curation Rules

1. Select only artwork necessary for the restoration. Review file type and content without executing legacy code or serving the archive.
2. For vectors, inspect scripts, event handlers, embedded objects, external URLs and other active content. Sanitise or convert only a derived copy when necessary; keep originals untouched.
3. Place reviewed home artwork in `public/artwork/home/`, retaining its original numeric filename. Use only the home export until scope is explicitly expanded. Avoid anonymous renaming that breaks traceability.
4. Record the exact source path relative to the repository, destination, source SHA256, any derived SHA256, transformation and review evidence. Match source hashes to inventory where available.
5. Record known authorship and publication rights, including unresolved rights. Archive possession is not proof of permission. Do not publish unresolved assets.
6. Check actual public output: no whole-archive copy, active legacy content, private metadata, secrets or server configuration. Re-review mappings when assets change.

## Asset Mapping

Exact source, destination, SHA256 and transformation records for eleven derived assets are stored in [the asset manifest](../data/asset-provenance.json). The curation script parses XML, allows only passive vector elements and rejects event handlers, href/style attributes, entities and external resource references. Copies are byte-for-byte; the archive remains untouched. Current UI uses `4.svg` as the exact original wordmark and `18.svg` as the world map; remaining reviewed shapes are reserved for later home-only curation. The system-font wordmark experiment was rejected because it changed the original typeface, kerning and proportions. Owner publication clearance remains pending, so this is a local prototype, not a release.

Screenshot and recording paths under `archive/screenshots` remain gitignored and are not copied into public output. They inform composition and transitions only. AV Lab canvas studies are newly authored code using no extracted video frames and no legacy execution; they must not be described as restored originals.

| Exact source path | Public destination | Source SHA256 | Derived SHA256 | Transformation | Authorship / rights | Safety review and date | Publication status |
| --- | --- | --- | --- | --- | --- | --- | --- |

Numeric artwork destinations must retain the source basename. Use the actual hash values from inspection, not placeholders represented as completed verification. Record the reason when an inspected candidate is rejected.

## Historical Content And Media

Audio access release verification on 2026-11-01 supersedes the earlier blocked status below: the user's Orphism update permits Superheads staging and production catalogue CORS and 206 range streams. Real `Minor Axis` MP3 playback, Music-pad selection and play/pause passed in Chromium without mocks on both deployed domains. Audio is still streamed from Orphism; no recordings or private reference images were copied into Superheads output. Localhost remains blocked.

Audio-player reference added on 2026-11-01: the private screenshot `archive/screenshots/Screenshot 2026-10-31 at 23.19.05.png` informs player composition and charcoal/orange styling only; it is not published. The player uses the existing reviewed `4.svg` wordmark and newly authored HTML/CSS with Lucide transport icons. No player artwork or audio was copied from the archive. Modern metadata is sourced from Orphism's `_artists/tomaz-sounder.md` and its public `audio-list.php?folder=tomaz-sounder` response (ten audio entries observed). Audio remains hosted and streamed through Orphism's existing PHP proxy. Browser playback tests use generated media, not copies of the artist's recordings. Live cross-origin permission remains blocked and requires an authorised server update; no rights clearance or deployment is implied by this integration.

Map-arrow verification on 2026-11-01: `public/artwork/home/191.svg` is byte-for-byte identical to `archive/legacy-site/_export/home/shapes/191.svg` (`cmp` passed). SHA256 is `2e44802c955983ee739c57b715f437858d9bc8827e518cfdbb89c75785b60199`, matching the existing manifest. The 69-by-69 vector retains its hollow block-arrow path, `fill="none"` and `stroke="#5b5b5b"`; no recolouring or redraw was applied. The map box renders this existing curated asset using screenshot-relative size and inset. Publication rights status remains unchanged.

Track the source of historical text and case studies alongside artwork. Preserve wording and historical context; distinguish editorial clarification from original copy. Do not invent active clients, services, events, availability or working playback.

| Source path / section | Restored page / section | Editorial changes and rationale | Historical context / rights review | Status |
| --- | --- | --- | --- | --- |

Media migration is pending. Music, video and game files require separate format, safety, rights and browser-compatibility review before publication. SWF is evidence only, never a runtime dependency.

Home-export text references used in the prototype: `texts/7.txt` (tagline), `texts/21.txt` (album title), `texts/31.txt` through `texts/45.txt` (collection labels), `texts/92.txt` (Spak Invaders), `texts/121.txt` through `texts/127.txt` (historical portfolio names), `texts/149.txt` (AV Lab description), `texts/169.txt` through `texts/178.txt` (tools and TV), and `texts/193.txt` through `texts/209.txt` (Info labels and historical contact). Display copy explaining unavailable functionality is new editorial text; original service and playback claims have not been carried forward as current facts.

## Separate Backup Record

Backup completion is pending. Keep backup location details private when sensitive; do not commit credentials or sensitive absolute paths.

| Date | Non-sensitive backup reference | Inventory verification method | Verified count / result | Reviewer |
| --- | --- | --- | --- | --- |

Verify the separate backup against `archive/inventory.json`, including recorded sizes and SHA256 hashes, and report missing or mismatched files. The original 25,015-file verification does not establish that a later backup is complete. Link the completed evidence from [the relaunch checklist](RELAUNCH-CHECKLIST.md).
