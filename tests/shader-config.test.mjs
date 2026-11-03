import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseShaderConfig, buildFragmentSource } from "../src/lib/shader-config.mjs";
import { consoleReducer, initialState } from "../src/lib/console-state.mjs";

test("shipped config parses and files exist", () => {
  const shaders = parseShaderConfig(JSON.parse(readFileSync("public/config/shaders.json", "utf8")));
  assert.ok(shaders.length >= 3);
  for (const shader of shaders) assert.ok(readFileSync(`public${shader.file}`, "utf8").includes("mainImage"));
});

test("rejects unsafe or malformed entries", () => {
  assert.throws(() => parseShaderConfig({}));
  assert.throws(() => parseShaderConfig({ shaders: [{ file: "/shaders/../x.frag" }] }));
  assert.throws(() => parseShaderConfig({ shaders: [{ file: "https://evil.example/a.frag" }] }));
  assert.throws(() => parseShaderConfig({ shaders: [{ file: "/shaders/a.frag", source: "mainImage" }] }));
  assert.throws(() => parseShaderConfig({ shaders: [{ title: "x" }] }));
});

test("defaults, clamping and 17 entry cap", () => {
  const [one] = parseShaderConfig({ shaders: [{ source: "void mainImage(out vec4 c, in vec2 f){c=vec4(1.);}", speed: 99 }] });
  assert.equal(one.title, "Shader 1");
  assert.equal(one.speed, 10);
  const many = parseShaderConfig({ shaders: Array.from({ length: 30 }, () => ({ source: "mainImage" })) });
  assert.equal(many.length, 17);
  assert.match(buildFragmentSource("X"), /mainImage\(color/);
});

test("lab item count drives slot selection", () => {
  const state = consoleReducer(initialState, { type: "lab-items", count: 3 });
  assert.equal(consoleReducer(state, { type: "slot", slot: 2 }).slot, 2);
  assert.equal(consoleReducer(state, { type: "slot", slot: 3 }).slot, 0);
});
