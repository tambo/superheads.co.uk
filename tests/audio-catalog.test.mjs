import { test } from "node:test";
import assert from "node:assert/strict";
import { audioOrigin, audioCatalogueUrl, parseAudioCatalogue, formatAudioTime } from "../src/lib/audio-catalog.mjs";

const file = { filename: "Drum & Bass.mp3", title: "Drum & Bass ", type: "audio", proxyUrl: "/audio/audio-proxy.php?file=tomaz-sounder%2FDrum%20%26%20Bass.mp3" };
test("localhost uses staging for both catalogue and streams while deployed sites retain production", () => {
  const origin = audioOrigin("localhost");
  assert.equal(origin, "https://dev.orphism.co.uk");
  assert.equal(audioCatalogueUrl(origin), "https://dev.orphism.co.uk/audio/audio-list.php?folder=tomaz-sounder");
  const tracks = parseAudioCatalogue({ folder: "tomaz-sounder", files: [file] }, origin);
  assert.equal(new URL(tracks[0].source).origin, origin);
  for (const hostname of ["superheads.co.uk", "dev.superheads.co.uk", "other.test", ""]) assert.equal(audioOrigin(hostname), "https://orphism.co.uk");
  assert.throws(() => parseAudioCatalogue({ folder: "tomaz-sounder", files: [file] }, "https://other.test"));
});
test("artist catalogue retains PHP streaming URLs and audio-only pad order", () => {
  const tracks = parseAudioCatalogue({ folder: "tomaz-sounder", files: [file, { type: "video" }] });
  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].title, "Drum & Bass");
  assert.equal(new URL(tracks[0].source).origin, "https://orphism.co.uk");
  assert.equal(parseAudioCatalogue({ folder: "tomaz-sounder", files: Array(20).fill(file) }).length, 17);
});
test("artist catalogue rejects foreign sources and traversal", () => {
  assert.throws(() => parseAudioCatalogue({ folder: "other", files: [] }));
  for (const invalid of [{ ...file, proxyUrl: "https://other.test/audio/audio-proxy.php" }, { ...file, filename: "../test.mp3" }]) {
    assert.throws(() => parseAudioCatalogue({ folder: "tomaz-sounder", files: [invalid] }));
  }
});
test("audio time handles unloaded media and normal durations", () => {
  assert.equal(formatAudioTime(NaN), "0:00");
  assert.equal(formatAudioTime(125.9), "2:05");
});