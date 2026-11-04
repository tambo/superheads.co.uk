import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState, consoleReducer, randomVisualStep } from "../src/lib/console-state.mjs";

test("visual shuffle never immediately repeats and stays within the 5-10 second interval", () => {
  for (let current = 0; current < 17; current++) {
    for (const value of [0, 0.25, 0.5, 0.999999]) {
      const step = randomVisualStep(current, 17, () => value);
      assert.notEqual(step.slot, current);
      assert(step.slot >= 0 && step.slot < 17);
      assert(step.delay >= 5000 && step.delay <= 10000);
    }
  }
  assert.equal(randomVisualStep(0, 1).slot, 0);
});

test("visual autoplay is off by default and toggles without changing track or visual", () => {
  assert.equal(initialState.autoVisuals, false);
  const enabled = consoleReducer(initialState, { type: "auto-visuals" });
  assert.equal(enabled.autoVisuals, true);
  assert.equal(enabled.slot, initialState.slot);
  assert.equal(enabled.audioIndex, initialState.audioIndex);
  assert.equal(consoleReducer(enabled, { type: "auto-visuals" }).autoVisuals, false);
});