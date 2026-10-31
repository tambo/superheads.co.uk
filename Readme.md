# Superheads

Screenshot-led restoration of the original Flash interface as a static Next.js media console. Original files are preserved privately under `archive/legacy-site`; screenshots and recording remain private references in `archive/screenshots`.

Read [the project guide](docs/PROJECT-GUIDE.md) for design decisions and controls, [AGENTS.md](AGENTS.md) for shared agent rules, and [the modernisation skill](.github/skills/superheads-modernisation/SKILL.md) for the restoration workflow.

## Local Development

Requires Node.js >=20.9.0. Dependencies are pinned through the lockfile.

```bash
npm ci
npm run dev -- --port 3100
```

## Static Verification

```bash
npm run build
npm test
npm run typecheck
npx playwright install chromium
npm run test:e2e
npm run serve
```

Static build output is `out/`; serving it uses port 3100. No Node runtime is needed on the hosting server. Original exported artwork is already curated into public assets; the optional `npm run assets:curate` command requires the local private archive.

## Branch Deployments

The production prototype is live and source is tracked on GitHub. Branch deployment is now implemented: `develop` targets `dev.superheads.co.uk`, and `main` targets `superheads.co.uk`. Builds and tests run automatically; initial deploys are gated by repository readiness variables. Configure the new repository's SSH secrets and environment protection before enabling either gate. See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for the exact setup and Dreamhost requirements. This status supersedes the original setup-only notes below.

Current AV Lab visuals are new studies, not recovered legacy animations. Music/video/game entries, historical portfolio details, favourites and legacy tools remain pending. No deployment, commits or remote creation has occurred. See [the relaunch checklist](docs/RELAUNCH-CHECKLIST.md) for manual release gates. Deployment commands are reserved but their scripts and verified targets are not yet configured.I want you to create a skill to help me modernise and relaunch the superheads.co.uk the files currently at /Volumes/LaCie/dev/projects/superheads.co.uk are a download of the existing site files. I'd like you to move everything there into an archive folder before starting the modernisation process, and then begin updating the site with modern design and functionality. The orignal site was built in flash and I want to retain the design and some of the cool graphics that it had. I've already had another agent export the swf content to the _export folder and the assets are ready to be integrated into the modernised site. I want the modernised site to maintain the visual identity of the original while being fully functional with modern web standards. I also want to base the new site on the same approach used in my site for orphism.co.uk at /Volumes/LaCie/dev/projects/orphism.co.uk which is a nextJS staticly generated site which allows for simple hosting, deploymnet and maintenance. I also want to ensure that the modernised site is responsive and works well across different devices and screen sizes. I would like all skills and agents to automatically follow these guidelines and best practices, as well as maintain the guide for me and other developer partners in this location so that everyone involved has a clear understanding of the process and standards to follow. I also want this to be tracke as a git repository and handled in much the same way as orphism.co.uk using the same hosting and SSH transfers etc.