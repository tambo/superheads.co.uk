import { test } from "node:test";
import assert from "node:assert/strict";
import { contexts, initialState, consoleReducer, keyboardAction } from "../src/lib/console-state.mjs";

test("right-hand contexts change the pad bank and reset selection", () => {
  const selected = consoleReducer(initialState, { type: "slot", slot: 5 });
  const games = consoleReducer(selected, keyboardAction("3"));
  assert.equal(games.context, "games");
  assert.equal(games.slot, 0);
  assert.equal(contexts.find(context => context.id === games.context).items.length, 1);
  assert.equal(consoleReducer(games, keyboardAction("d")), games);
});

test("mouse pad actions and keyboard pad actions have identical results", () => {
  for (const [slot, key] of ["q", "w", "e", "a", "s", "d"].entries()) {
    assert.deepEqual(consoleReducer(initialState, keyboardAction(key.toUpperCase())), consoleReducer(initialState, { type: "slot", slot }));
  }
});

test("pause, reset and escape are reversible without changing content", () => {
  const paused = consoleReducer(initialState, keyboardAction(" "));
  assert.equal(paused.paused, true);
  assert.equal(consoleReducer(paused, keyboardAction(" ")).paused, false);
  assert.equal(consoleReducer(paused, keyboardAction("r")).revision, 1);
  assert.equal(consoleReducer({ ...initialState, context: "music" }, keyboardAction("Escape")).context, "lab");
  assert.equal(keyboardAction("Tab"), null);
  assert.equal(consoleReducer(initialState, { type: "slot", slot: -1 }), initialState);
});