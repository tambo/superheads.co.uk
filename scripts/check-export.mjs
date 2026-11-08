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
assert(fs.existsSync("out/video/suzanna_intro.mp4"), "Intro video must be included in the static export");
assert(html.includes("/video/suzanna_intro.mp4") && html.includes("Superheads introduction"));
assert(!html.includes("Context Navigation") && !html.includes("Content controls"), "Navigation and content controls must wait until the intro ends");
assert(!html.includes('aria-pressed="true"'), "No navigation or content item should be selected on first visit");
console.log(`PASS: static homepage and ${files.length} output files; no legacy runtime or archive.`);