import { test, expect } from "@playwright/test";

const trackNames = ["Dark Horse - 303 Mix ", "Drum & Bass - Delicious Mix", "Feel The Vibration - Big Six Mix", "Minor Axis", "Morrodor 2 vox and 303", "OldSkool - Take 7", "Only Acid Funk", "Phased Return", "Slippers Ready - Genesis Mix", "Ultra Long Wave"];
const catalogue = { folder: "tomaz-sounder", files: trackNames.map(title => ({ title, filename: `${title}.mp3`, type: "audio", proxyUrl: `/audio/audio-proxy.php?${new URLSearchParams({ file: `tomaz-sounder/${title}.mp3` })}` })) };
const audioCatalogueRoute = /https:\/\/(?:dev\.)?orphism\.co\.uk\/audio\/audio-list\.php\?/;
const audioProxyRoute = /https:\/\/(?:dev\.)?orphism\.co\.uk\/audio\/audio-proxy\.php\?/;

test.beforeEach(async ({ page }) => {
  await page.route(audioCatalogueRoute, route => route.fulfill({ json: catalogue }));
  const audio = Buffer.alloc(44 + 8000 * 2 * 30);
  audio.write("RIFF", 0); audio.writeUInt32LE(audio.length - 8, 4); audio.write("WAVEfmt ", 8);
  audio.writeUInt32LE(16, 16); audio.writeUInt16LE(1, 20); audio.writeUInt16LE(1, 22);
  audio.writeUInt32LE(8000, 24); audio.writeUInt32LE(16000, 28); audio.writeUInt16LE(2, 32); audio.writeUInt16LE(16, 34);
  audio.write("data", 36); audio.writeUInt32LE(audio.length - 44, 40);
  await page.route(audioProxyRoute, route => {
    const corsHeaders = { "Access-Control-Allow-Origin": route.request().headers().origin || "http://localhost:3000" };
    const range = route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/);
    if (!range) return route.fulfill({ contentType: "audio/wav", headers: { ...corsHeaders, "Accept-Ranges": "bytes" }, body: audio });
    const start = Number(range[1]);
    const end = range[2] ? Math.min(Number(range[2]), audio.length - 1) : audio.length - 1;
    return route.fulfill({ status: 206, contentType: "audio/wav", headers: { ...corsHeaders, "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${audio.length}` }, body: audio.subarray(start, end + 1) });
  });
});

async function enterLab(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "AV LAB", exact: true }).click();
}

test("first visit plays a control-free intro then opens AV LAB with visual one selected", async ({ page }) => {
  await page.goto("/");
  const intro = page.getByLabel("Superheads introduction");
  await expect(intro).toHaveAttribute("src", "/video/suzanna_intro.mp4");
  await expect(intro).toHaveAttribute("autoplay", "");
  await expect(intro).toHaveAttribute("muted", "");
  await expect(intro).toHaveAttribute("playsinline", "");
  expect(await intro.evaluate(video => (video as HTMLVideoElement).controls)).toBe(false);
  await expect(page.locator(".section-tiles button[aria-pressed=true]")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Context Navigation" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Content controls" })).toHaveCount(0);
  await expect(page.locator(".intro-context-placeholders .intro-placeholder-control")).toHaveCount(4);
  await expect(page.locator(".intro-transport .intro-placeholder-control")).toHaveCount(4);
  await expect(page.locator(".intro-keyboard .intro-placeholder-control")).toHaveCount(26);
  await expect(page.locator(".intro-placeholder-control:not([disabled])")).toHaveCount(0);
  await expect(page.locator(".intro-control-section")).toHaveAttribute("aria-hidden", "true");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(".intro-keyboard .intro-placeholder-control")).toHaveCount(26);
  }

  await intro.evaluate(video => video.dispatchEvent(new Event("ended")));
  await expect(intro).toHaveCount(0);
  await expect(page.locator(".intro-placeholder-control")).toHaveCount(0);
  await expect(page.locator(".section-tiles button[aria-pressed=true]")).toHaveText("AV LAB");
  await expect(page.getByRole("navigation", { name: "Context Navigation" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Content controls" })).toBeVisible();
  await expect(page.locator(".pad-0")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".shader-stage canvas")).toHaveAttribute("aria-label", "Shader visual: Plasma");
});

test("Music pads drive the PHP audio player and transport controls", async ({ page }) => {
  await page.goto("/");
  await enterLab(page);
  await expect(page.locator("audio")).toHaveAttribute("crossorigin", "anonymous");
  await page.getByRole("button", { name: "MUSIC", exact: true }).click();
  await expect(page.locator(".pad-9")).toBeEnabled();
  await expect(page.locator(".pad-10")).toBeDisabled();
  await page.locator(".pad-1").click();
  await expect(page.locator(".audio-now-playing strong")).toHaveText(trackNames[1]);
  await expect(page.getByRole("button", { name: "Pause audio", exact: true })).toBeVisible();
  expect(new URL(await page.locator("audio").getAttribute("src") || "").searchParams.get("file")).toBe(`tomaz-sounder/${trackNames[1]}.mp3`);
  await page.getByRole("button", { name: "Pause audio", exact: true }).click();
  await expect(page.getByRole("button", { name: "Play audio", exact: true })).toBeVisible();
  await page.getByRole("slider", { name: "Seek track" }).fill("4");
  await expect.poll(() => page.locator("audio").evaluate((element: HTMLAudioElement) => element.currentTime)).toBeCloseTo(4, 0);
  await page.getByRole("button", { name: "Next track", exact: true }).click();
  await expect(page.locator(".pad-2")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("p");
  await expect(page.locator(".audio-now-playing strong")).toHaveText(trackNames[9]);
  await page.getByRole("button", { name: "Stop audio", exact: true }).click();
  expect(await page.locator("audio").evaluate((element: HTMLAudioElement) => element.currentTime)).toBe(0);
  await page.getByRole("slider", { name: "Audio volume" }).fill("0.4");
  expect(await page.locator("audio").evaluate((element: HTMLAudioElement) => element.volume)).toBe(0.4);
  await page.getByRole("button", { name: "LAB", exact: true }).click();
  await page.getByRole("button", { name: "MUSIC", exact: true }).click();
  await expect(page.locator(".pad-9")).toHaveAttribute("aria-pressed", "true");
});

test("audio player dropdown lists, scrolls and selects available tracks", async ({ page }) => {
  await page.goto("/");
  const player = page.locator(".audio-player");
  const collapsedHeight = await player.evaluate(element => element.getBoundingClientRect().height);
  const toggle = page.getByRole("button", { name: "Show playlist" });
  await expect(toggle).toBeEnabled();
  await toggle.click();
  await expect(page.getByRole("button", { name: "Hide playlist" })).toHaveAttribute("aria-expanded", "true");
  const playlist = page.getByRole("navigation", { name: "Available audio tracks" });
  await expect(playlist.getByRole("button")).toHaveCount(trackNames.length);
  await expect(playlist.locator(".audio-playlist-artist").first()).toContainText("Tomaz Sounder");
  expect(await playlist.locator(".audio-playlist-artist").first().evaluate(element => getComputedStyle(element).textAlign)).toBe("right");
  expect(await playlist.evaluate(element => getComputedStyle(element).position)).toBe("absolute");
  expect(await player.evaluate(element => element.getBoundingClientRect().height)).toBe(collapsedHeight);
  expect(await playlist.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await playlist.getByRole("button", { name: "4. Minor Axis" }).click();
  await expect(page.locator(".audio-now-playing strong")).toHaveText(trackNames[3]);
  await expect(page.getByRole("button", { name: "Show playlist" })).toHaveAttribute("aria-expanded", "false");
  expect(new URL(await page.locator("audio").getAttribute("src") || "").searchParams.get("file")).toBe(`tomaz-sounder/${trackNames[3]}.mp3`);
  await page.getByRole("button", { name: "Show playlist" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Show playlist" })).toHaveAttribute("aria-expanded", "false");
});

test("visual auto-play changes randomly after 5-10 seconds and respects pause, off and context", async ({ page }) => {
  await page.goto("/");
  await enterLab(page);
  const toggle = page.getByRole("button", { name: "Auto-play visuals", exact: true });
  await expect(toggle).toBeEnabled();
  await expect(page.locator("canvas")).toHaveAttribute("aria-label", "Shader visual: Plasma");
  await page.clock.install();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.clock.fastForward(4999);
  await expect(page.locator(".pad-0")).toHaveAttribute("aria-pressed", "true");
  await page.clock.fastForward(5001);
  await expect(page.locator(".pad-0")).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Pause visual", exact: true }).click();
  const paused = await page.locator(".bank-heading > span").textContent();
  await page.clock.fastForward(20000);
  await expect(page.locator(".bank-heading > span")).toHaveText(paused!);
  await page.getByRole("button", { name: "Play visual", exact: true }).click();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.clock.fastForward(20000);
  await expect(page.locator(".bank-heading > span")).toHaveText(paused!);
  await toggle.click();
  await page.getByRole("button", { name: "GAMES", exact: true }).click();
  await expect(toggle).toBeDisabled();
  await page.clock.fastForward(20000);
  await expect(page.locator(".display-copy h2")).toHaveText("Spak Invaders");
});

test("automatic visuals preserve paused and stopped audio while manual visual selection restarts it", async ({ page }) => {
  await page.goto("/");
  await enterLab(page);
  await page.locator(".pad-1").click();
  await expect(page.getByRole("button", { name: "Pause audio", exact: true })).toBeVisible();
  await page.clock.install();
  await page.getByRole("button", { name: "Auto-play visuals", exact: true }).click();
  await page.getByRole("button", { name: "Pause audio", exact: true }).click();
  await page.clock.runFor(1);
  await page.clock.fastForward(9999);
  await expect(page.locator(".pad-1")).toHaveAttribute("aria-pressed", "false");
  expect(await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
  await page.locator(".pad-2").click();
  await expect(page.getByRole("button", { name: "Pause audio", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Stop audio", exact: true }).click();
  await page.clock.fastForward(20000);
  expect(await page.locator("audio").evaluate((audio: HTMLAudioElement) => ({ paused: audio.paused, time: audio.currentTime }))).toEqual({ paused: true, time: 0 });
  await page.locator(".pad[aria-pressed=true]").click();
  await expect(page.getByRole("button", { name: "Pause audio", exact: true })).toBeVisible();
});

test("automatic video changes never restart stopped Jukebox audio", async ({ page }) => {
  await page.route(/youtube(-nocookie)?\.com/, route => route.abort());
  await page.route("**/config/videos.json", route => route.fulfill({ json: {
    effects: [{ name: "Beat Rings", file: "/video-effects/beat-rings.frag", blend: "screen" }],
    videos: [{ id: "aaaaaaaaaaa", title: "First" }, { id: "bbbbbbbbbbb", title: "Second" }, { id: "ccccccccccc", title: "Third" }],
  } }));
  await page.goto("/");
  await enterLab(page);
  await page.getByRole("button", { name: "VIDEOS", exact: true }).click();
  await page.getByRole("button", { name: "Audio source: video" }).click();
  await expect(page.getByRole("button", { name: "Pause audio", exact: true })).toBeVisible();

  await page.clock.install();
  const autoPlay = page.getByRole("button", { name: "Auto-play visuals", exact: true });
  await autoPlay.click();
  await expect(autoPlay).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(1);
  await page.getByRole("button", { name: "Stop audio", exact: true }).click();
  await page.clock.fastForward(20000);

  expect(await page.locator("audio").evaluate((audio: HTMLAudioElement) => ({ paused: audio.paused, time: audio.currentTime }))).toEqual({ paused: true, time: 0 });
  await expect(page.getByRole("button", { name: "Play audio", exact: true })).toBeVisible();
  await expect(autoPlay).toHaveAttribute("aria-pressed", "true");
});

test("automatic shader changes hold the outgoing frame then dissolve into the ready shader", async ({ page }) => {
  let releaseShader: () => void = () => {};
  const ready = new Promise<void>(resolve => { releaseShader = resolve; });
  await page.goto("/");
  await enterLab(page);
  await expect(page.locator("canvas")).toHaveAttribute("aria-label", "Shader visual: Plasma");
  await expect.poll(() => page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL().length)).toBeGreaterThan(10000);
  await page.route("**/shaders/*.frag", async route => { await ready; await route.continue(); });
  await page.clock.install();
  const autoPlay = page.getByRole("button", { name: "Auto-play visuals", exact: true });
  await autoPlay.click();
  await expect(autoPlay).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(1);
  await page.clock.fastForward(10_001);
  await expect(page.locator(".pad[aria-pressed=true]")).not.toHaveClass(/pad-0/);
  const outgoing = page.locator(".shader-outgoing");
  await expect(outgoing).toBeVisible();
  await expect(outgoing).toHaveAttribute("src", /^data:image\/png/);
  expect(await outgoing.evaluate(element => element.getAnimations().length)).toBe(0);
  releaseShader();
  await expect.poll(() => page.locator(".shader-stage canvas").evaluate((canvas: HTMLCanvasElement) => canvas.getContext("webgl") !== null)).toBe(true);
  await page.clock.runFor(100);
  await expect.poll(() => outgoing.evaluate(element => element.getAnimations().length)).toBe(1);
  const opacity = await outgoing.evaluate(element => {
    const fade = element.getAnimations()[0];
    fade.pause();
    fade.currentTime = 600;
    return Number(getComputedStyle(element).opacity);
  });
  expect(opacity).toBeGreaterThan(0.35);
  expect(opacity).toBeLessThan(0.65);
  await outgoing.evaluate(element => element.getAnimations()[0].finish());
  await expect(outgoing).toBeHidden();
  await page.locator(".pad-15").click();
  await expect(outgoing).toBeHidden();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.fastForward(10000);
  await expect(outgoing).toBeHidden();
});

test("Checker Warp on pad 16 renders and remains animated", async ({ page }) => {
  await page.goto("/");
  await enterLab(page);
  await expect(page.locator(".pad-15")).toHaveAccessibleName(/Checker Warp/);
  await page.locator(".pad-15").click();
  await expect(page.locator("canvas")).toHaveAttribute("aria-label", "Shader visual: Checker Warp");
  await expect(page.locator(".shader-error")).toHaveCount(0);
  const pixels = () => page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  const first = await pixels();
  await expect.poll(pixels).not.toBe(first);
});

test("unavailable PHP catalogue disables Music pads and supports retry", async ({ page }) => {
  await page.route(audioCatalogueRoute, route => route.abort());
  await page.goto("/");
  await enterLab(page);
  await page.getByRole("button", { name: "MUSIC", exact: true }).click();
  const trackDisplay = page.locator(".audio-now-playing");
  const message = trackDisplay.locator(".audio-track-message");
  await expect(message).toContainText("Track catalogue unavailable");
  await expect(message.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(trackDisplay.getByLabel("Playback time")).toBeVisible();
  await expect(trackDisplay).toHaveCSS("height", "61px");
  await expect(message).toHaveCSS("overflow-y", "auto");
  await expect(page.locator(".audio-error")).toHaveCount(0);
  await expect(page.locator(".pad-0")).toBeDisabled();
  await expect(page.locator(".audio-play")).toBeDisabled();
  await page.route(audioCatalogueRoute, route => route.fulfill({ json: catalogue }));
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".pad-9")).toBeEnabled();
});

test("greeting ticker spans the map box and stops automatically for reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const ticker = page.getByRole("marquee", { name: "Greetings groovers ... welcome to the relaunch ... superheads still going after 25 years..." });
  await expect(ticker).toBeVisible();
  const track = page.locator(".ticker-track");
  const position = () => track.evaluate(element => getComputedStyle(element).transform);
  const first = await position();
  await expect.poll(position).not.toBe(first);
  const box = await page.locator(".destination").boundingBox();
  const header = await page.locator(".ticker-header").boundingBox();
  expect(header!.x + header!.width).toBeLessThan(box!.x + box!.width);
  expect(header!.width).toBeCloseTo(box!.width - 32, 0);
  await expect(page.locator(".destination button, .destination > svg")).toHaveCount(0);
  const arrow = page.locator(".map-arrow");
  await expect(arrow).toHaveAttribute("src", "/artwork/home/191.svg");
  expect(await arrow.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth === 69 && image.naturalHeight === 69)).toBe(true);
  const arrowBox = await arrow.boundingBox();
  expect(arrowBox!.width / box!.width).toBeCloseTo(0.185 * 0.75, 2);
  expect(arrowBox!.height).toBeCloseTo(arrowBox!.width, 0);
  const tickerBox = await ticker.boundingBox();
  expect(tickerBox!.x + tickerBox!.width).toBeLessThan(arrowBox!.x);
  await expect(page.getByText("GIG-A-BITES", { exact: true })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(track).toHaveCSS("animation-name", "none");
  const frozen = await position();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await position()).toBe(frozen);
  expect(await ticker.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test("three sections switch their submenus and retain shared keyboard and pointer state", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByLabel("Superheads introduction")).toHaveAttribute("src", "/video/suzanna_intro.mp4");
  await expect(page.locator(".section-tiles button[aria-pressed=true]")).toHaveCount(0);
  await expect(page.locator(".pad[aria-pressed=true]")).toHaveCount(0);
  await enterLab(page);
  await expect(page.locator(".context-tiles button")).toHaveCount(4);
  await expect(page.locator(".pad")).toHaveCount(26);
  await expect(page.locator(".section-tiles button")).toHaveText(["AV LAB", "COMMUNITY", "JUKEBOX"]);
  await expect(page.locator(".section-tiles button").first()).toHaveCSS("font-family", '"Helvetica Neue", Helvetica, sans-serif');
  await expect(page.locator(".context-tiles button")).toHaveText(["MUSIC", "VIDEOS", "GAMES", "LAB"]);
  await expect(page.getByRole("navigation", { name: "Information" })).toHaveCount(0);
  for (const pad of await page.locator(".pad").all()) {
    await expect(pad).toHaveText(/^\d+[A-Z]$/);
  }
  await page.keyboard.press("w");
  await expect(page.locator(".pad-1")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("3");
  await expect(page.locator(".bank-heading h2")).toHaveText("GAMES");
  await expect(page.locator(".display-copy h2")).toHaveText("Spak Invaders");
  await expect(page.locator(".pad-1")).toBeDisabled();
  await page.getByRole("button", { name: "MUSIC", exact: true }).click();
  await page.locator(".pad-5").click();
  await expect(page.locator(".display-copy h2")).toHaveText("OldSkool - Take 7");
  await page.keyboard.press("Escape");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "COMMUNITY", exact: true }).click();
  await expect(page.locator(".context-tiles button")).toHaveText(["SOFTFOOD CAFE", "TWAT MODERN"]);
  await page.getByRole("button", { name: "TWAT MODERN", exact: true }).click();
  await expect(page.locator(".display-copy h2")).toHaveText("Twat Modern");
  await page.getByRole("button", { name: "JUKEBOX", exact: true }).click();
  await expect(page.locator(".context-tiles button")).toHaveCount(0);
  await expect(page.locator(".display-copy h2")).toHaveText("Jukebox");
  await page.getByRole("button", { name: "AV LAB", exact: true }).click();
  await expect(page.locator(".context-tiles button")).toHaveCount(4);
  await page.getByRole("button", { name: "VIDEOS", exact: true }).click();
  await expect(page.locator(".bank-heading h2")).toHaveText("VIDEOS");
  await page.keyboard.press("j");
  await expect(page.locator(".pad-16")).toBeDisabled();
  expect(errors).toEqual([]);
});

test("visual moves, pauses at its current frame and responds to pointer", async ({ page }) => {
  await page.goto("/");
  await enterLab(page);
  const pixels = () => page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  const first = await pixels();
  await expect.poll(pixels).not.toBe(first);
  await page.locator(".display").click();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Play visual", exact: true })).toBeVisible();
  const frozen = await pixels();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await pixels()).toBe(frozen);
  await page.keyboard.press("w");
  await page.locator("canvas").hover({ position: { x: 30, y: 30 } });
  expect(await pixels()).not.toBe(frozen);
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
  test(`layout and assets at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await enterLab(page);
    await expect(page.locator("canvas")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const wordmark = page.getByRole("heading", { level: 1, name: "superheads" }).locator("img");
    await expect(wordmark).toHaveAttribute("src", "/artwork/home/4.svg");
    await expect(wordmark).toHaveAttribute("width", "145");
    await expect(wordmark).toHaveAttribute("height", "27");
    expect(await wordmark.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)).toBe(true);
    const pad = await page.locator(".pad-0").boundingBox();
    const padBank = await page.locator(".pad-bank").boundingBox();
    const display = await page.locator(".display").boundingBox();
    expect(pad).not.toBeNull();
    expect(padBank).not.toBeNull();
    expect(display).not.toBeNull();
    expect(pad!.width).toBeLessThanOrEqual(viewport.width > 900 ? 80 : viewport.width > 640 ? 90 : 58);
    expect(pad!.width).toBeGreaterThanOrEqual(viewport.width > 640 ? 48 : 23);
    expect(pad!.height).toBeCloseTo(pad!.width, 0);
    await expect(page.locator(".lab-keyboard .pad-row")).toHaveCount(3);
    for (const [row, letters] of ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].entries()) {
      const buttons = page.locator(".lab-keyboard .pad-row").nth(row).locator(".pad");
      await expect(buttons.locator("span")).toHaveText(letters.split(""));
      const boxes = await buttons.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().y));
      expect(Math.max(...boxes) - Math.min(...boxes)).toBeLessThan(1);
    }
    expect(await page.locator(".pad").evaluateAll(buttons => buttons.every(button => button.scrollWidth <= button.clientWidth))).toBe(true);
    expect(padBank!.width / display!.width).toBeGreaterThan(0.72);
    const player = await page.locator(".audio-player").boundingBox();
    expect(player!.width).toBeLessThanOrEqual(viewport.width);
    expect(await page.locator(".audio-player").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    if (viewport.width > 900) {
      const map = await page.locator(".destination").boundingBox();
      expect(player!.x + player!.width).toBeLessThan(map!.x);
      expect(player!.y + player!.height).toBeLessThanOrEqual(map!.y + map!.height + 1);
    }
    const sectionRow = await page.locator(".section-tiles").boundingBox();
    const column = await page.locator(".navigation").boundingBox();
    expect(sectionRow!.width).toBeCloseTo(column!.width, 0);
    for (const button of await page.locator(".section-tiles button").all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeCloseTo(box!.height, 0);
      expect(await button.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    if (viewport.width >= 901) {
      const nav = await page.locator(".context-tiles").boundingBox();
      const navButton = await page.locator(".context-tiles button").first().boundingBox();
      expect(nav).not.toBeNull();
      expect(navButton).not.toBeNull();
      expect(navButton!.width / nav!.width).toBeLessThanOrEqual(0.72);
      expect(navButton!.height).toBeLessThanOrEqual(30);
    }
    const variation = await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const copy = document.createElement("canvas");
      copy.width = canvas.width;
      copy.height = canvas.height;
      const copyContext = copy.getContext("2d")!;
      copyContext.drawImage(canvas, 0, 0);
      const pixels = copyContext.getImageData(0, 0, canvas.width, canvas.height).data;
      return new Set(Array.from(pixels).filter((_, index) => index % 4 === 0)).size;
    });
    expect(variation).toBeGreaterThan(20);
    await page.screenshot({ path: `test-results/console-${viewport.width}.png`, fullPage: true });
  });
}

test("reduced motion is static and native button Space activation is preserved", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await enterLab(page);
  await expect(page.locator(".ticker-track")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".ticker-toggle")).toBeHidden();
  expect(await page.locator(".greeting-ticker").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  const first = await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(first);
  await page.getByRole("button", { name: "MUSIC", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".bank-heading h2")).toHaveText("MUSIC");
});

test("fullscreen falls back to a CSS mode where the Fullscreen API is missing (iPhone Safari)", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", { value: undefined, configurable: true });
    Object.defineProperty(Element.prototype, "webkitRequestFullscreen", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await enterLab(page);
  await page.getByRole("button", { name: "Fullscreen display" }).click();
  const display = page.locator(".display");
  await expect(display).toHaveClass(/pseudo-fullscreen/);
  const box = await display.boundingBox();
  const size = page.viewportSize()!;
  expect(box).toMatchObject({ x: 0, y: 0, width: size.width, height: size.height });
  await page.keyboard.press("Escape");
  await expect(display).not.toHaveClass(/pseudo-fullscreen/);
  await page.getByRole("button", { name: "Fullscreen display" }).click();
  await page.getByRole("button", { name: "Exit fullscreen" }).click();
  await expect(display).not.toHaveClass(/pseudo-fullscreen/);
});

test("shader canvas fills a landscape phone screen in fullscreen", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", { value: undefined, configurable: true });
    Object.defineProperty(Element.prototype, "webkitRequestFullscreen", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await enterLab(page);
  await page.getByRole("button", { name: "Fullscreen display" }).click();
  const canvas = page.locator(".display canvas");
  await expect.poll(async () => {
    const box = await canvas.boundingBox();
    const buffer = await canvas.evaluate(element => ({ width: (element as HTMLCanvasElement).width, height: (element as HTMLCanvasElement).height }));
    return { box, ratio: Math.abs(buffer.width / buffer.height - 844 / 390) < 0.02 };
  }).toMatchObject({ box: { x: 0, y: 0, width: 844, height: 390 }, ratio: true });
});

test("Videos section defaults to video audio, keeps shader off, and supports QWERTY keys", async ({ page }) => {
  await page.route(/youtube(-nocookie)?\.com/, route => route.abort());
  await page.route("**/config/videos.json", route => route.fulfill({ json: {
    effects: [{ name: "Beat Rings", file: "/video-effects/beat-rings.frag", blend: "screen" }, { name: "Neon Grid", file: "/video-effects/neon-grid.frag", blend: "screen" }],
    videos: [{ id: "aaaaaaaaaaa", title: "First" }, { id: "bbbbbbbbbbb", title: "Second" }, { id: "ccccccccccc", title: "Third" }],
  } }));
  await page.goto("/");
  await enterLab(page);
  await page.getByRole("button", { name: "VIDEOS", exact: true }).click();
  await expect(page.locator(".audio-now-playing strong")).toContainText("Dark Horse - 303 Mix");
  const audioSourceToggle = page.getByRole("button", { name: "Audio source: video" });
  await expect(audioSourceToggle).toHaveAttribute("aria-pressed", "false");
  await expect(audioSourceToggle).toHaveAttribute("aria-keyshortcuts", "'");
  await expect(audioSourceToggle).toHaveAttribute("title", /toggle with '/);
  await expect(page.locator(".audio-play")).toBeDisabled();
  const shaderToggle = page.getByRole("button", { name: "Shader overlay" });
  await expect(shaderToggle).toHaveAttribute("aria-pressed", "false");
  await expect(shaderToggle).toBeDisabled();
  await expect(shaderToggle).toHaveAttribute("aria-keyshortcuts", "\\");
  await expect(shaderToggle).toHaveAttribute("title", "Shader overlay - " + "\\" + " - select Jukebox audio to enable");
  await expect(page.locator(".video-overlay")).toHaveCount(0);
  await page.keyboard.press("\\");
  await expect(shaderToggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".video-overlay")).toHaveCount(0);
  await page.keyboard.press("'");
  await expect(page.getByRole("button", { name: "Audio source: Jukebox" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Pause audio", exact: true })).toBeVisible();
  await expect(shaderToggle).toBeEnabled();
  await expect(shaderToggle).toHaveAttribute("title", "Toggle shader overlay - " + "\\");
  await page.keyboard.press("\\");
  await expect(shaderToggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".video-overlay")).toBeVisible();
  await page.keyboard.press("'");
  await expect(page.getByRole("button", { name: "Audio source: video" })).toHaveAttribute("aria-pressed", "false");
  await expect(shaderToggle).toBeDisabled();
  await expect(shaderToggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".video-overlay")).toHaveCount(0);
  await expect(page.locator(".audio-play")).toBeDisabled();
  await expect.poll(() => page.locator("audio").evaluate(audio => (audio as HTMLAudioElement).paused)).toBe(true);
  await page.keyboard.press("'");
  await expect(page.getByRole("button", { name: "Audio source: Jukebox" })).toHaveAttribute("aria-pressed", "true");
  await expect(shaderToggle).toBeEnabled();
  await expect(shaderToggle).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("\\");
  await expect(shaderToggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".video-overlay")).toBeVisible();
  await page.keyboard.press("\\");
  await expect(page.locator(".video-overlay")).toHaveCount(0);
  await expect(page.locator(".pad-bank .pad:not([disabled])")).toHaveCount(3);
  await page.keyboard.press("w");
  await expect(page.locator("[aria-live=polite]").filter({ hasText: "Neon Grid" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause visual" })).toBeEnabled();
  await page.setViewportSize({ width: 320, height: 720 });
  expect(await page.locator(".transport").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test("video player sends referrer identity and reports stalled playback with a retry", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    const stats = { playCalls: 0, loadCalls: 0, muteCalls: 0, unMuteCalls: 0 };
    class FakePlayer {
      constructor(_iframe: HTMLElement, options: { events: { onReady: (event: { target: FakePlayer }) => void } }) {
        window.setTimeout(() => options.events.onReady({ target: this }), 0);
      }
      mute() { stats.muteCalls += 1; }
      unMute() { stats.unMuteCalls += 1; }
      playVideo() { stats.playCalls += 1; }
      pauseVideo() {}
      loadVideoById() { stats.loadCalls += 1; }
      seekTo() {}
      destroy() {}
    }
    Object.assign(window, { __videoMockStats: stats });
    Object.defineProperty(window, "YT", { value: { Player: FakePlayer }, configurable: true });
  });
  await page.route(/youtube(-nocookie)?\.com/, route => route.abort());
  await page.route("**/config/videos.json", route => route.fulfill({ json: {
    effects: [{ name: "Beat Rings", file: "/video-effects/beat-rings.frag", blend: "screen" }],
    videos: [{ id: "aaaaaaaaaaa", title: "First" }],
  } }));
  await page.goto("/");
  await enterLab(page);
  await page.getByRole("button", { name: "VIDEOS", exact: true }).click();

  const iframe = page.locator(".video-host iframe");
  await expect(iframe).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  const iframeUrl = new URL((await iframe.getAttribute("src"))!);
  expect(iframeUrl.searchParams.get("origin")).toBe("http://localhost:3000");
  expect(iframeUrl.searchParams.get("mute")).toBe("0");
  expect(iframeUrl.searchParams.get("autoplay")).toBe("1");
  await page.clock.runFor(1);
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __videoMockStats: { unMuteCalls: number } }).__videoMockStats.unMuteCalls)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Audio source: video" }).click();
  await expect(page.getByRole("button", { name: "Audio source: Jukebox" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __videoMockStats: { muteCalls: number } }).__videoMockStats.muteCalls)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Audio source: Jukebox" }).click();
  await expect(page.getByRole("button", { name: "Audio source: video" })).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __videoMockStats: { unMuteCalls: number } }).__videoMockStats.unMuteCalls)).toBeGreaterThan(1);
  await page.clock.fastForward(15_000);
  await expect(page.locator(".video-message")).toContainText("taking too long to start");

  await page.getByRole("button", { name: "Retry video" }).click();
  const calls = await page.evaluate(() => (window as unknown as Window & { __videoMockStats: { playCalls: number; loadCalls: number } }).__videoMockStats);
  expect(calls).toMatchObject({ playCalls: 1, loadCalls: 1 });
});
