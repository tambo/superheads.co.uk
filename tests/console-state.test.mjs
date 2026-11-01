import { test } from "node:test";
import assert from "node:assert/strict";
import { contexts, primaryContexts, padKeys, initialState, consoleReducer, keyboardAction } from "../src/lib/console-state.mjs";

test("the four AV LAB contexts and top sections reset selection", () => {
  const selected = consoleReducer(initialState, { type: "slot", slot: 5 });
  for (const [index, context] of primaryContexts.entries()) {
    const changed = consoleReducer(selected, keyboardAction(String(index + 1)));
    assert.equal(changed.context, context.id);
    assert.equal(changed.slot, 0);
  }
  const games = consoleReducer(selected, keyboardAction("3"));
  assert.equal(contexts.find(context => context.id === games.context).items.length, 1);
  assert.equal(consoleReducer(games, keyboardAction("d")), games);
  for (const [section, context] of [["av-lab", "lab"], ["community", "cafe"], ["jukebox", "jukebox"]]) {
    const changed = consoleReducer(selected, { type: "section", section });
    assert.equal(changed.context, context);
    assert.equal(changed.slot, 0);
    assert.equal(changed.paused, false);
  }
  assert.equal(consoleReducer(selected, { type: "section", section: "unknown" }), selected);
});

test("all 17 numbered pads have stable keys and pointer/keyboard actions match", () => {
  assert.equal(padKeys.length, 17);
  assert.equal(new Set(padKeys).size, 17);
  for (const [slot, key] of padKeys.entries()) {
    assert.deepEqual(keyboardAction(key.toUpperCase()), { type: "slot", slot });
  }
  for (const [slot, key] of ["q", "w", "e", "r", "t", "y"].entries()) {
    assert.deepEqual(consoleReducer(initialState, keyboardAction(key.toUpperCase())), consoleReducer(initialState, { type: "slot", slot }));
  }
});

test("pause, reset and escape are reversible without changing content", () => {
  const paused = consoleReducer(initialState, keyboardAction(" "));
  assert.equal(paused.paused, true);
  assert.equal(consoleReducer(paused, keyboardAction(" ")).paused, false);
  assert.equal(consoleReducer(paused, keyboardAction("Backspace")).revision, 1);
  assert.equal(consoleReducer({ ...initialState, context: "music" }, keyboardAction("Escape")).context, "lab");
  assert.equal(keyboardAction("Tab"), null);
  assert.equal(consoleReducer(initialState, { type: "slot", slot: -1 }), initialState);
});

test("Music pads, keyboard selection and player transport share catalogue selection", () => {
  const tracks = Array.from({ length: 10 }, (_, index) => ({ title: `Track ${index + 1}`, filename: `${index}.mp3`, source: `https://orphism.co.uk/${index}` }));
  const loaded = consoleReducer(initialState, { type: "catalogue", tracks });
  const music = consoleReducer(loaded, { type: "context", context: "music" });
  const pointer = consoleReducer(music, { type: "slot", slot: 7 });
  assert.deepEqual(pointer, consoleReducer(music, keyboardAction("i")));
  assert.equal(pointer.audioIndex, 7);
  assert.equal(pointer.audioRevision, 1);
  const next = consoleReducer(pointer, { type: "audio-track", slot: 8 });
  assert.equal(next.slot, 8);
  assert.equal(next.audioIndex, 8);
  assert.equal(consoleReducer(next, { type: "slot", slot: 10 }), next);
  const lab = consoleReducer(next, { type: "context", context: "lab" });
  assert.equal(lab.audioIndex, 8);
  assert.equal(consoleReducer(lab, { type: "context", context: "music" }).slot, 8);
});