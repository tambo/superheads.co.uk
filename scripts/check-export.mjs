import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const files = walk("out");
assert(fs.existsSync("out/index.html"));
assert(fs.existsSync("out/.htaccess"), "Static Apache configuration must be present");
assert(files.every(file => !/\.(php|asp|swf|fla|mov)$/i.test(file) && !file.includes("archive/")));
const html = fs.readFileSync("out/index.html", "utf8");
for (const asset of ["4.svg", "18.svg"]) assert(fs.existsSync(`out/artwork/home/${asset}`));
assert(html.includes("Content contexts") && html.includes("Content controls"));
console.log(`PASS: static homepage and ${files.length} output files; no legacy runtime or archive.`);