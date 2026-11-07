import test from "node:test";
import assert from "node:assert/strict";
import { parseVideoConfig, videoFilterStyle, buildOverlaySource } from "../src/lib/video-config.mjs";
import { parseFeed, mergeVideos } from "../src/lib/youtube-feed.mjs";

const effects = [{ name: "A", file: "/video-effects/a.frag" }, { name: "B", file: "/video-effects/b.frag", blend: "difference" }];

test("videos get round-robin effects and defaults", () => {
  const { videos } = parseVideoConfig({ effects, videos: [{ id: "abcdefghijk", title: "One" }, { id: "abcdefghijl", title: "Two" }] });
  assert.equal(videos[0].effect.name, "A");
  assert.equal(videos[1].effect.blend, "difference");
  assert.equal(videos[0].effect.blend, "screen");
});

test("unknown effects are rejected", () => {
  assert.throws(() => parseVideoConfig({ effects, videos: [{ id: "abcdefghijk", title: "x", effect: "Nope" }] }));
});

test("filter style responds to audio", () => {
  const quiet = videoFilterStyle({ bass: 0, mid: 0, treble: 0, level: 0 }, { scale: 0.1 });
  const loud = videoFilterStyle({ bass: 1, mid: 1, treble: 1, level: 1 }, { scale: 0.1 });
  assert.notEqual(quiet.transform, loud.transform);
  assert.match(loud.transform, /translate/);
});

test("overlay source declares audio uniforms", () => {
  assert.match(buildOverlaySource("void mainImage(out vec4 c, in vec2 f){ c = vec4(0.); }"), /iAudio/);
});

test("feed parsing and merge keep manual fields", () => {
  const xml = "<feed><entry><yt:videoId>abcdefghijk</yt:videoId><title>Hello</title></entry></feed>";
  const fetched = parseFeed(xml);
  assert.equal(fetched[0].id, "abcdefghijk");
  const merged = mergeVideos([{ id: "abcdefghijk", title: "Custom", effect: "B" }], fetched);
  assert.equal(merged[0].title, "Custom");
  assert.equal(merged[0].effect, "B");
});
