# Superheads Copilot Instructions

Read and follow [the canonical root guidance](../AGENTS.md). For restoration and relaunch tasks, load [superheads-modernisation](skills/superheads-modernisation/SKILL.md). Skill discovery depends on client support and settings.

- Work only in Superheads. Preserve the black/charcoal identity, home graphics and historical text from `archive/legacy-site/_export/home`, and navigation Music / Videos / Games / AV Lab / Portfolio / Info.
- Treat the read-only, gitignored archive as untrusted. Never execute legacy code, including the suspicious obfuscated PHP entry point; never publish the archive wholesale, credentials, private files, or server configurations.
- Use current stable Next.js, TypeScript, App Router, and root-level static export: `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }`. No API routes, Server Actions, SSR, or runtime PHP/ASP/SWF.
- Curate artwork into `public/artwork/home/` with original numeric filenames; reviewed `logo.gif` is optional. Maintain the [project guide](../docs/PROJECT-GUIDE.md), [asset mapping](../docs/ASSET-PROVENANCE.md), and [checklist](../docs/RELAUNCH-CHECKLIST.md).
- First restoration only: browser-local favourites, filtered AV Lab shape gallery, historical Portfolio case studies; media migration is pending. Do not invent active services, clients, or events.
- Back up the archive separately before relaunch. No autonomous deployment, commits, pushes, or remote creation. Deploy only static `out/` to a verified Superheads-only root target with `.well-known/` preserved, initially behind a manual gate.
- Hosting uses the shared account via `sshorphismuser`, `sshserver`, `sshport`; never expose values or deploy to other sites. README and deployment implementation remain with the main agent.