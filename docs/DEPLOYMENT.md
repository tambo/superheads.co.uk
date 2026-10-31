# Branch-Based Dreamhost Deployment

## Targets

| Branch | GitHub environment | Domain / home-relative directory | Repository readiness variable |
| --- | --- | --- | --- |
| `develop` | `staging` | `dev.superheads.co.uk` | `SUPERHEADS_STAGING_READY` |
| `main` | `production` | `superheads.co.uk` | `SUPERHEADS_PRODUCTION_READY` |

The workflow in [.github/workflows/deploy-dreamhost.yml](../.github/workflows/deploy-dreamhost.yml) builds and tests each push before uploading a static artifact. Deployment requires the matching repository variable to equal `true`. Keep the staging variable unset until Dreamhost setup is complete. Both variables are initially unset, so publishing this workflow does not replace either site.

Only the two exact domain directories are allowed. The remote check rejects missing directories, root symlinks, unexpected physical paths and nested symlinks other than protected hosting entries. The script does not create a missing hosting directory. It preserves `.well-known/` and `.dh-diag` and uses `rsync --delete` only inside the verified target. It never deploys to Orphism.

## GitHub Configuration

In this repository's Settings > Secrets and variables > Actions, add these repository secrets, or set them separately in each environment:

| Secret | Value to configure privately |
| --- | --- |
| `DREAMHOST_USERNAME` | Same account as the local `sshorphismuser` variable |
| `DREAMHOST_HOST` | Same host as `sshserver` |
| `DREAMHOST_PORT` | Same port as `sshport` |
| `DREAMHOST_SSH_KEY` | Dedicated private deployment key whose public key is authorised on Dreamhost |
| `DREAMHOST_KNOWN_HOSTS` | Verified known-hosts line(s) for that exact SSH host and port |

Secrets in the Orphism repository do not automatically transfer to this repository. Configure them through GitHub's UI, never in committed files or chat. Use a trusted host key from your existing SSH configuration; do not blindly trust a fresh `ssh-keyscan` response. Nonstandard ports require matching `[host]:port` entries.

Create GitHub environments `staging` and `production`. Restrict staging to `develop` and production to `main`. Configure a required reviewer for production where your GitHub plan supports environment protection. The readiness switches prevent initial deployment; once enabled, pushes are deployment requests subject to environment protection. Use pull requests from `develop` into `main` to promote a tested release.

## Dreamhost Setup

Add fully hosted `dev.superheads.co.uk` to the same hosting account, with home-relative web directory `dev.superheads.co.uk` and HTTPS enabled. Wait for DNS and certificate provisioning. Confirm the directory is separate from the production root and is not a symlink. Neither deployment target uses a Next.js base path.

After independently verifying hosting and configuring secrets/environments, set `SUPERHEADS_STAGING_READY=true` under repository Actions variables. Push to `develop`, or manually run the workflow selecting `develop`. Verify HTTPS, root assets, controls and 404 behavior on the dev domain before setting `SUPERHEADS_PRODUCTION_READY=true`. Thereafter pushing/merging to `main` deploys production, subject to its protection rules.

GitHub CLI is unavailable in the current environment; repository secrets, variables and environment protection have not been configured by the agent. End-to-end Actions and staging deployment remain pending those settings and the user's subdomain setup.

## Local Commands

Export the local shell SSH variables when invoking the script. Never print their values.

```bash
npm run build
sshorphismuser="$sshorphismuser" sshserver="$sshserver" sshport="$sshport" \
  bash scripts/deploy.sh preview staging
```

```bash
sshorphismuser="$sshorphismuser" sshserver="$sshserver" sshport="$sshport" \
  SUPERHEADS_DEPLOY_APPROVED=yes bash scripts/deploy.sh apply staging
```

Replace `staging` with `production` only for an authorised production release. Apply defaults to a timestamped remote backup outside the public root, named by target domain. `SUPERHEADS_SKIP_BACKUP=yes` skips it only when explicitly authorised. No backup skip is configured in CI. Do not restore old PHP/ASP/SWF runtime as rollback; use a known-good static build.

## Validation

Deployment unit tests mock SSH and rsync and check target isolation, dry-run behavior, approval, protected entries and missing-target failure. YAML contract tests check branches, gates, artifact configuration and strict host checking. These do not establish that remote GitHub secrets or a Dreamhost subdomain are configured.

The current npm audit reports three moderate findings in the local preview tooling chain (`serve` / `serve-handler` / `minimatch`). No forced downgrade or unrelated dependency rewrite was made; these packages are not deployed to Dreamhost.