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

test("playAudio flag is parsed and audio levels are derived from frequency bins", async () => {
  const { bandLevels, smoothLevels, simulatedLevels } = await import("../src/lib/audio-levels.mjs");
  const [on, off] = parseShaderConfig({ shaders: [{ source: "mainImage", playAudio: true }, { source: "mainImage", playAudio: "yes" }] });
  assert.equal(on.playAudio, true);
  assert.equal(off.playAudio, false);
  const loudBass = bandLevels(Uint8Array.from({ length: 128 }, (_, index) => (index < 4 ? 255 : 0)));
  assert.ok(loudBass.bass > 0.9 && loudBass.treble === 0);
  assert.deepEqual(bandLevels(new Uint8Array(128)), { bass: 0, mid: 0, treble: 0, level: 0 });
  const rising = smoothLevels({ bass: 0, mid: 0, treble: 0, level: 0 }, { bass: 1, mid: 0, treble: 0, level: 0 });
  assert.ok(rising.bass > 0 && rising.bass < 1);
  const simulated = simulatedLevels(0.1);
  assert.ok(Object.values(simulated).every(value => value >= 0 && value <= 1));
});
