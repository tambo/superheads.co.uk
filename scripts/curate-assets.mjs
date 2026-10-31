import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DOMParser } from "@xmldom/xmldom";

const source = "archive/legacy-site/_export/home/shapes";
const destination = "public/artwork/home";
const selected = ["4", "11", "18", "23", "47", "54", "56", "66", "70", "136", "191"];
const allowedElements = new Set(["svg", "g", "path", "defs", "linearGradient", "radialGradient", "stop", "clipPath", "rect", "circle", "ellipse", "polygon", "polyline", "line"]);
const records = [];

for (const identifier of selected) {
  const sourcePath = `${source}/${identifier}.svg`;
  const content = fs.readFileSync(sourcePath, "utf8");
  if (/<!DOCTYPE|<!ENTITY/i.test(content)) throw new Error(`Unsafe XML: ${sourcePath}`);
  const document = new DOMParser({ errorHandler: { warning: () => {}, error: (message) => { throw new Error(message); }, fatalError: (message) => { throw new Error(message); } } }).parseFromString(content, "image/svg+xml");
  for (const element of Array.from(document.getElementsByTagName("*"))) {
    if (!allowedElements.has(element.tagName)) throw new Error(`Unapproved element: ${element.tagName}`);
    for (const attribute of Array.from(element.attributes)) {
      if (/^on/i.test(attribute.name) || /^(href|xlink:href|style)$/i.test(attribute.name)) throw new Error(`Unapproved attribute: ${attribute.name}`);
      if (/url\(/i.test(attribute.value) && !/^url\(#[\w-]+\)$/.test(attribute.value)) throw new Error(`External reference: ${sourcePath}`);
    }
  }
  fs.mkdirSync(destination, { recursive: true });
  const target = `${destination}/${identifier}.svg`;
  fs.copyFileSync(sourcePath, target);
  records.push({ source: sourcePath, destination: target, sha256: crypto.createHash("sha256").update(content).digest("hex"), transformation: "None; reviewed vector copied byte-for-byte", rights: "User-supplied original site export; publication clearance pending owner confirmation" });
}
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/asset-provenance.json", `${JSON.stringify(records, null, 2)}\n`);
console.log(`Curated ${records.length} reviewed SVGs from the home export only.`);