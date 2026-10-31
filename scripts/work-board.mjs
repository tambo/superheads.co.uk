import fs from "node:fs";
import { pathToFileURL } from "node:url";

export const statuses = ["todo", "in-progress", "blocked", "review", "done"];

export function validateBoard(board) {
  if (!Array.isArray(board.tasks)) throw new Error("Missing task list");
  const identifiers = new Set();
  for (const task of board.tasks) {
    if (!/^SH-\d{3}$/.test(task.id) || identifiers.has(task.id)) throw new Error("Invalid or duplicate task identifier");
    identifiers.add(task.id);
    if (!statuses.includes(task.status) || !task.title || !task.acceptance || !Array.isArray(task.dependsOn)) throw new Error(`Invalid task: ${task.id}`);
    if (task.owner !== null && !/^[a-zA-Z0-9-]{1,39}$/.test(task.owner)) throw new Error("Invalid owner");
    if (["in-progress", "blocked", "review"].includes(task.status) && !task.owner) throw new Error("Active tasks require an owner");
  }
  for (const task of board.tasks) for (const dependency of task.dependsOn) {
    if (!identifiers.has(dependency) || dependency === task.id) throw new Error("Unknown or self dependency");
  }
}

export function updateTask(board, action, identifier, actor, note = "", timestamp = new Date().toISOString()) {
  validateBoard(board);
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(actor)) throw new Error("Invalid GitHub actor");
  if (note.length > 1000 || /[\r\n\x00-\x08]/.test(note)) throw new Error("Use a short single-line non-sensitive note");
  const result = structuredClone(board);
  const task = result.tasks.find(item => item.id === identifier);
  if (!task) throw new Error("Unknown task");
  if (action === "claim") {
    if (task.status !== "todo" || task.owner !== null) throw new Error(`Already reserved: ${task.id} (${task.owner || task.status})`);
    const incomplete = task.dependsOn.filter(id => result.tasks.find(item => item.id === id).status !== "done");
    if (incomplete.length) throw new Error(`Dependencies incomplete: ${incomplete.join(", ")}`);
    task.owner = actor;
    task.status = "in-progress";
  } else {
    if (task.owner !== actor) throw new Error(`Only ${task.owner || "the owner"} can update this task`);
    if (!["in-progress", "blocked", "review"].includes(task.status)) throw new Error("Task is not active");
    if (action === "release") { task.status = "todo"; task.owner = null; }
    else if (action === "block") task.status = "blocked";
    else if (action === "resume") task.status = "in-progress";
    else if (action === "review") task.status = "review";
    else if (action === "done" && task.status === "review") { task.status = "done"; task.owner = null; }
    else if (action !== "note") throw new Error("Unknown action or task must enter review before done");
  }
  task.note = note || task.note;
  task.updatedAt = timestamp;
  validateBoard(result);
  return result;
}

export function renderBoard(board) {
  validateBoard(board);
  const escape = value => String(value ?? "Unclaimed").replaceAll("|", "\\|").replaceAll("\n", " ");
  const content = `# Shared Work Board\n\nGenerated from [data/work-items.json](../data/work-items.json). Do not edit this generated table.\n\nReview the latest copy on GitHub's develop branch; local or main-branch copies may be stale. Automated work claims are paused by the user. Check active owners and coordinate conversationally before overlapping work. See [COLLABORATION.md](COLLABORATION.md).\n\n| ID | Priority | Task | Status | Owner | Dependencies | Updated |\n| --- | --- | --- | --- | --- | --- | --- |\n${board.tasks.map(task => `| ${task.id} | ${task.priority} | ${escape(task.title)} | ${task.status} | ${escape(task.owner)} | ${task.dependsOn.join(", ") || "None"} | ${task.updatedAt} |`).join("\n")}\n\n## Acceptance And Handoff\n\n${board.tasks.map(task => `### ${task.id}: ${task.title}\n\n${task.acceptance}\n\n${task.note}\n`).join("\n")}\n`;
  return `${content.trimEnd()}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = "data/work-items.json";
  const board = JSON.parse(fs.readFileSync(file, "utf8"));
  const action = process.argv[2] || "check";
  let result = board;
  if (!["check", "render"].includes(action)) result = updateTask(board, action, process.env.TASK_ID, process.env.TASK_ACTOR, process.env.TASK_NOTE);
  if (action === "check") {
    if (fs.readFileSync("docs/TODO.md", "utf8") !== renderBoard(board)) throw new Error("Work board is stale; run node scripts/work-board.mjs render");
  } else {
    if (action !== "render") fs.writeFileSync(file, `${JSON.stringify(result, null, 2)}\n`);
    fs.writeFileSync("docs/TODO.md", renderBoard(result));
  }
  console.log("Work board validated.");
}