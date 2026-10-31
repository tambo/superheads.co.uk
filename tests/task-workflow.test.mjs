import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import YAML from "yaml";
import { renderBoard } from "../scripts/work-board.mjs";

test("shared board matches JSON and workflow serializes non-force remote updates", () => {
  assert.equal(fs.readFileSync("docs/TODO.md", "utf8"), renderBoard(JSON.parse(fs.readFileSync("data/work-items.json", "utf8"))));
  const workflow = YAML.parse(fs.readFileSync(".github/workflows/manage-work-board.yml", "utf8"));
  assert(workflow.on.workflow_dispatch.inputs.action.options.includes("claim"));
  assert.equal(workflow.permissions.contents, "write");
  assert.equal(workflow.concurrency["cancel-in-progress"], false);
  assert.equal(workflow.jobs.update.steps[0].with.ref, "develop");
  const step = workflow.jobs.update.steps.at(-1);
  assert.equal(step.env.TASK_ACTOR, "${{ github.actor }}");
  assert(step.run.includes("git pull --ff-only origin develop"));
  assert(step.run.includes("git push origin HEAD:develop"));
  assert(!step.run.includes("--force"));
});