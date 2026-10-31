import { test, expect } from "@playwright/test";

test("keyboard and pointer change the shared display and control bank", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.keyboard.press("w");
  await expect(page.locator(".pad-1")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("3");
  await expect(page.locator(".bank-heading h2")).toHaveText("GAMES");
  await expect(page.locator(".display-copy h2")).toHaveText("Spak Invaders");
  await expect(page.locator(".pad-1")).toBeDisabled();
  await page.getByRole("button", { name: "MUSIC", exact: true }).click();
  await page.locator(".pad-5").click();
  await expect(page.locator(".display-copy h2")).toHaveText("Boogie Oogie");
  await page.keyboard.press("Escape");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "TOOLS", exact: true }).click();
  await expect(page.locator(".bank-heading h2")).toHaveText("TOOLS");
  await page.keyboard.press("w");
  await expect(page.locator(".display-copy h2")).toHaveText("Address Book");
  await page.getByRole("button", { name: "TV", exact: true }).click();
  await expect(page.locator(".pad-1")).toBeDisabled();
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
    expect(await page.locator(".identity img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
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
  const first = await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(first);
  await page.getByRole("button", { name: "MUSIC", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".bank-heading h2")).toHaveText("MUSIC");
});