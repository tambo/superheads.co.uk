# Agent task: populate the AV Lab Videos section

Repo: tambo/superheads.co.uk, branch `develop` (commit 8f6909d or later). Don't touch the Lab shaders, `public/config/shaders.json` or `src/components/shader-visual.tsx`. Never invent video IDs.

Task: populate the AV Lab Videos section from the YouTube channel @tambo1972 (the user's own channel, not @TamboOfficial).

1. Run `npm install` and `npm run videos:sync`. If `YOUTUBE_API_KEY` is available, set it to get up to 26 videos. Otherwise the RSS feed returns about 15.
2. Check that `public/config/videos.json` has real 11-character IDs and titles, and that every video embeds (no embedding-disabled or private videos). Remove any that fail.
3. Optionally assign a suitable `effect` and `start` per video. The effects are listed in the `effects` array of `videos.json`.
4. Run `node --test tests/*.test.mjs`, `npx tsc --noEmit`, `npm run build` and `npx playwright test`. The Lab test "automatic shader changes hold the outgoing frame…" already fails and is not your concern.
5. Run `npm run dev`, open the Videos section, and confirm the following. Fix any bugs in `src/components/video-visual.tsx`.
   - The videos play muted.
   - The overlay reacts to the Jukebox.
   - QWERTY keys, pause, reset, auto-play and fullscreen work.
6. Commit to `develop` with the trailer `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`, push, and check the staging deploy with `gh run list`. Don't touch `main` unless asked.

See `docs/PROJECT-GUIDE.md` ("AV Lab videos") and `AGENTS.md`.
