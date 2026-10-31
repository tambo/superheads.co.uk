import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { renderBoard, updateTask, validateBoard } from "../scripts/work-board.mjs";

const board = () => JSON.parse(fs.readFileSync("data/work-items.json", "utf8"));
test("claims reject second owners and don't mutate input", () => {
  const original = board();
  const claimed = updateTask(original, "claim", "SH-005", "collaborator");
  assert.equal(original.tasks.find(task => task.id === "SH-005").owner, null);
  assert.equal(claimed.tasks.find(task => task.id === "SH-005").owner, "collaborator");
  assert.throws(() => updateTask(claimed, "claim", "SH-005", "tambo"), /reserved/);
  assert.throws(() => updateTask(claimed, "release", "SH-005", "tambo"), /Only/);
});
test("dependency and review gates and owner release", () => {
  assert.throws(() => updateTask(board(), "claim", "SH-009", "collaborator"), /Dependencies/);
  const claimed = updateTask(board(), "claim", "SH-005", "collaborator");
  assert.throws(() => updateTask(claimed, "done", "SH-005", "collaborator"), /review/);
  const review = updateTask(claimed, "review", "SH-005", "collaborator", "PR ready");
  const done = updateTask(review, "done", "SH-005", "collaborator");
  assert.equal(done.tasks.find(task => task.id === "SH-005").status, "done");
  const released = updateTask(claimed, "release", "SH-005", "collaborator");
  assert.equal(released.tasks.find(task => task.id === "SH-005").owner, null);
});
test("board and actor validation rejects malformed updates", () => {
  validateBoard(board());
  assert.throws(() => updateTask(board(), "claim", "SH-005", "../invalid"));
  assert.throws(() => updateTask(board(), "claim", "SH-005", "collaborator", "note\ncommand"));
  assert(renderBoard(board()).includes("local copy may be stale"));
});