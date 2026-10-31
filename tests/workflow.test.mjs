import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import YAML from "yaml";

test("workflow builds both branches and gates isolated deployment environments", () => {
  const source = fs.readFileSync(".github/workflows/deploy-dreamhost.yml", "utf8");
  const document = YAML.parseDocument(source, { uniqueKeys: true });
  assert.deepEqual(document.errors, []);
  const workflow = document.toJS();
  assert.deepEqual(workflow.on.push.branches, ["develop", "main"]);
  assert.equal(workflow.jobs.build.steps.find(step => step.uses?.startsWith("actions/setup-node@")).with["node-version"], "24");
  assert.equal(workflow.jobs.deploy.steps.find(step => step.uses?.startsWith("actions/setup-node@")).with["node-version"], "24");
  assert.equal(workflow.permissions.contents, "read");
  assert.equal(workflow.jobs.deploy.needs, "build");
  assert(workflow.jobs.deploy.if.includes("vars.SUPERHEADS_STAGING_READY == 'true'"));
  assert(workflow.jobs.deploy.if.includes("vars.SUPERHEADS_PRODUCTION_READY == 'true'"));
  assert.equal(workflow.jobs.deploy.concurrency["cancel-in-progress"], false);
  const upload = workflow.jobs.build.steps.find(step => step.uses?.startsWith("actions/upload-artifact@"));
  assert.equal(upload.with["include-hidden-files"], true);
  const deployment = workflow.jobs.deploy.steps.at(-1);
  assert(deployment.run.includes('preview "$DEPLOY_ENVIRONMENT"'));
  assert(deployment.run.includes('apply "$DEPLOY_ENVIRONMENT"'));
  assert(source.includes("secrets.DREAMHOST_KNOWN_HOSTS"));
  assert(!source.includes("StrictHostKeyChecking=no"));
});