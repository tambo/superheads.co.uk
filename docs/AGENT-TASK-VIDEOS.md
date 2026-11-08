# Agent task: populate the AV Lab Videos section

Repo: tambo/superheads.co.uk, branch `develop` (commit 8f6909d or later). Don't touch the Lab shaders, `public/config/shaders.json` or `src/components/shader-visual.tsx`. Never invent video IDs.

Task: populate the AV Lab Videos section from the YouTube channel @tambo1972 (the user's own channel, not @TamboOfficial).

Playlist curation: `public/config/videos.json` is intentionally hand-curated by the user. Preserve manual removals and selections; do not restore omitted channel videos or treat a smaller list as a failure. Tests must validate schema and behavior using independent fixtures, not a fixed production video ID list or count.

1. Run `npm install` and `npm run videos:sync`. If `YOUTUBE_API_KEY` is available, set it to get up to 26 videos. Otherwise the RSS feed returns about 15.
2. Check that `public/config/videos.json` has real 11-character IDs and titles, and that every video embeds (no embedding-disabled or private videos). Remove any that fail.
3. Optionally assign a suitable `effect` and `start` per video. The effects are listed in the `effects` array of `videos.json`.
4. Run `node --test tests/*.test.mjs`, `npx tsc --noEmit`, `npm run build` and `npx playwright test`. The Lab test "automatic shader changes hold the outgoing frame…" already fails and is not your concern.
5. Run `npm run dev -- --port 3000` and open exactly `http://localhost:3000` (stop an older Superheads preview on port 3000 if needed). The audio service allowlists this origin. Open the Videos section and confirm the following. Fix any bugs in `src/components/video-visual.tsx`.
   - Video audio is the default; the audio-source control switches to Jukebox audio and mutes the video.
   - Shader overlays are available only with Jukebox audio selected. Switching to video audio turns the overlay off and disables its toggle.
   - QWERTY keys, pause, reset, auto-play and fullscreen work.
6. Keep work on a private feature branch based on the latest `origin/develop`; rebase that branch when `origin/develop` advances. Do not work directly on `develop` or `main`, or commit/push/deploy without explicit user authorization. Integrate reviewed work into `develop`, verify staging, and promote to production-only `main` only after a separate explicit authorization.

See `docs/PROJECT-GUIDE.md` ("AV Lab videos") and `AGENTS.md`.
