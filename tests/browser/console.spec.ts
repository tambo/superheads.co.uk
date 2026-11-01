import { test, expect } from "@playwright/test";

const trackNames = ["Dark Horse - 303 Mix ", "Drum & Bass - Delicious Mix", "Feel The Vibration - Big Six Mix", "Minor Axis", "Morrodor 2 vox and 303", "OldSkool - Take 7", "Only Acid Funk", "Phased Return", "Slippers Ready - Genesis Mix", "Ultra Long Wave"];
const catalogue = { folder: "tomaz-sounder", files: trackNames.map(title => ({ title, filename: `${title}.mp3`, type: "audio", proxyUrl: `/audio/audio-proxy.php?${new URLSearchParams({ file: `tomaz-sounder/${title}.mp3` })}` })) };

test.beforeEach(async ({ page }) => {
  await page.route("https://orphism.co.uk/audio/audio-list.php?*", route => route.fulfill({ json: catalogue }));
  const audio = Buffer.alloc(44 + 8000 * 2 * 30);
  audio.write("RIFF", 0); audio.writeUInt32LE(audio.length - 8, 4); audio.write("WAVEfmt ", 8);
  audio.writeUInt32LE(16, 16); audio.writeUInt16LE(1, 20); audio.writeUInt16LE(1, 22);
  audio.writeUInt32LE(8000, 24); audio.writeUInt32LE(16000, 28); audio.writeUInt16LE(2, 32); audio.writeUInt16LE(16, 34);
  audio.write("data", 36); audio.writeUInt32LE(audio.length - 44, 40);
  await page.route("https://orphism.co.uk/audio/audio-proxy.php?*", route => {
    const corsHeaders = { "Access-Control-Allow-Origin": route.request().headers().origin || "http://127.0.0.1:3100" };
    const range = route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/);
    if (!range) return route.fulfill({ contentType: "audio/wav", headers: { ...corsHeaders, "Accept-Ranges": "bytes" }, body: audio });
    const start = Number(range[1]);
    const end = range[2] ? Math.min(Number(range[2]), audio.length - 1) : audio.length - 1;
    return route.fulfill({ status: 206, contentType: "audio/wav", headers: { ...corsHeaders, "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${audio.length}` }, body: audio.subarray(start, end + 1) });
  });
});

test("Music pads drive the PHP audio player and transport controls", async ({ page }) => {
  await page.goto("/");
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

test("unavailable PHP catalogue disables Music pads and supports retry", async ({ page }) => {
  await page.route("https://orphism.co.uk/audio/audio-list.php?*", route => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "MUSIC", exact: true }).click();
  await expect(page.locator(".audio-error")).toContainText("Track catalogue unavailable");
  await expect(page.locator(".pad-0")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Play audio", exact: true })).toBeDisabled();
  await page.route("https://orphism.co.uk/audio/audio-list.php?*", route => route.fulfill({ json: catalogue }));
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
  await expect(page.locator(".context-tiles button")).toHaveCount(4);
  await expect(page.locator(".pad")).toHaveCount(17);
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
  const pixels = () => page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  const first = await pixels();
  await expect.poll(pixels).not.toBe(first);
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
    expect(pad!.width).toBeGreaterThanOrEqual(48);
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
      const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      return new Set(Array.from(pixels).filter((_, index) => index % 4 === 0)).size;
    });
    expect(variation).toBeGreaterThan(20);
    await page.screenshot({ path: `test-results/console-${viewport.width}.png`, fullPage: true });
  });
}

test("reduced motion is static and native button Space activation is preserved", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
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
