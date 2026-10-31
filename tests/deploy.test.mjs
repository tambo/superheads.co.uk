import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

function deploy(mode, environment, extra = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "superheads-deploy-"));
  try {
    for (const executable of ["ssh", "rsync"]) {
      const destination = path.join(directory, executable);
      fs.copyFileSync(`tests/fixtures/${executable}`, destination);
      fs.chmodSync(destination, 0o700);
    }
    const log = path.join(directory, "calls");
    const result = spawnSync("bash", ["scripts/deploy.sh", mode, environment], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, sshorphismuser: "testuser", sshserver: "host.invalid", sshport: "22", DEPLOY_TEST_LOG: log, SUPERHEADS_DEPLOY_APPROVED: "yes", SUPERHEADS_SKIP_BACKUP: "yes", ...extra },
    });
    return { ...result, calls: fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "" };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test("deployment routes staging and production to isolated allowlisted roots", () => {
  for (const [environment, domain] of [["staging", "dev.superheads.co.uk"], ["production", "superheads.co.uk"]]) {
    const result = deploy("preview", environment);
    assert.equal(result.status, 0, result.stderr);
    assert(result.calls.includes(`sh -s -- ${domain}`));
    assert(result.calls.includes(`testuser@host.invalid:${domain}/`));
    assert(result.calls.includes("--dry-run"));
    assert(result.calls.includes("--exclude=.well-known/"));
    assert(result.calls.includes("--exclude=.dh-diag"));
    assert(result.calls.includes("StrictHostKeyChecking=yes"));
  }
});

test("apply removes dry-run only with approval; invalid targets fail before SSH", () => {
  const applied = deploy("apply", "staging");
  assert.equal(applied.status, 0, applied.stderr);
  assert(!applied.calls.includes("--dry-run"));
  const refused = deploy("apply", "production", { SUPERHEADS_DEPLOY_APPROVED: "" });
  assert.notEqual(refused.status, 0);
  assert(!refused.calls.includes("--delete"));
  const invalid = deploy("apply", "../orphism.co.uk");
  assert.notEqual(invalid.status, 0);
  assert.equal(invalid.calls, "");
  const missing = deploy("apply", "staging", { DEPLOY_TEST_SSH_EXIT: "1" });
  assert.notEqual(missing.status, 0);
  assert(!missing.calls.includes("--delete"));
});