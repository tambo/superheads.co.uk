import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { buildFragmentSource, parseShaderConfig } from "../../src/lib/shader-config.mjs";

const shaders: { title: string; file: string }[] = parseShaderConfig(JSON.parse(readFileSync("public/config/shaders.json", "utf8")));

test("alphabet keys select every added visual and brackets toggle fullscreen and auto-play", async ({ page }) => {
  await page.route("**/audio/audio-list.php?*", route => route.fulfill({ json: { folder: "tomaz-sounder", files: [] } }));
  await page.goto("/");
  await page.getByRole("button", { name: "AV LAB", exact: true }).click();
  await expect(page.locator(".pad-25")).toBeEnabled();
  for (const [offset, key] of "klzxcvbnm".split("").entries()) {
    await page.keyboard.press(key);
    await expect(page.locator(`.pad-${offset + 17}`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("canvas")).toHaveAttribute("aria-label", `Shader visual: ${shaders[offset + 17].title}`);
  }
  const toggle = page.getByRole("button", { name: "Auto-play visuals", exact: true });
  await page.keyboard.press("]");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("]");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("slider", { name: "Audio volume" }).focus();
  await page.keyboard.press("]");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.focus();
  await page.keyboard.press("[");
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await page.keyboard.press("[");
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await page.getByRole("button", { name: "GAMES", exact: true }).click();
  await page.keyboard.press("]");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("bracket fullscreen toggle also exits the CSS fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", { value: undefined, configurable: true });
    Object.defineProperty(Element.prototype, "webkitRequestFullscreen", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "AV LAB", exact: true }).click();
  await expect(page.locator(".pad-25")).toBeEnabled();
  await page.keyboard.press("[");
  await expect(page.locator(".display")).toHaveClass(/pseudo-fullscreen/);
  await page.keyboard.press("[");
  await expect(page.locator(".display")).not.toHaveClass(/pseudo-fullscreen/);
});

test("all 26 shader programs render nonblank pixels and respond to audio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "AV LAB", exact: true }).click();
  const sources = shaders.map(shader => ({ title: shader.title, source: buildFragmentSource(readFileSync(`public${shader.file}`, "utf8")) }));
  const results = await page.evaluate(entries => {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 64;
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })!;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Compile failed");
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, "attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const results = entries.map(entry => {
      const fragment = compile(gl.FRAGMENT_SHADER, entry.source);
      const program = gl.createProgram()!;
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(entry.title + ": link failed");
      gl.useProgram(program);
      const position = gl.getAttribLocation(program, "p");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.viewport(0, 0, 96, 64);
      gl.uniform3f(gl.getUniformLocation(program, "iResolution"), 96, 64, 1);
      gl.uniform1f(gl.getUniformLocation(program, "iTime"), 2.5);
      gl.uniform4f(gl.getUniformLocation(program, "iMouse"), 48, 32, 0, 0);
      const draw = (level: number) => {
        gl.uniform4f(gl.getUniformLocation(program, "iAudio"), level, level * 0.7, level * 0.4, level * 0.8);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        const pixels = new Uint8Array(96 * 64 * 4);
        gl.readPixels(0, 0, 96, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return pixels;
      };
      const silent = draw(0);
      const quiet = draw(0.08);
      const active = draw(0.7);
      const colors = new Set(Array.from(active).filter((_, index) => index % 4 !== 3)).size;
      const difference = active.reduce((sum, value, index) => sum + Math.abs(value - silent[index]), 0);
      const quietDifference = quiet.reduce((sum, value, index) => sum + Math.abs(value - silent[index]), 0) / (96 * 64 * 3);
      let illuminated = 0;
      for (let index = 0; index < silent.length; index += 4) {
        if (Math.max(silent[index], silent[index + 1], silent[index + 2]) > 50) illuminated++;
      }
      gl.deleteProgram(program);
      gl.deleteShader(fragment);
      return { title: entry.title, colors, difference, quietDifference, coverage: illuminated / (96 * 64) };
    });
    gl.deleteShader(vertex);
    gl.deleteBuffer(buffer);
    return results;
  }, sources);
  expect(results).toHaveLength(26);
  for (const result of results) {
    expect(result.colors, result.title).toBeGreaterThan(10);
    expect(result.difference, result.title).toBeGreaterThan(100);
    if (result.title === "Body of Light") {
      expect(result.coverage).toBeGreaterThan(0.85);
      expect(result.quietDifference).toBeGreaterThan(5);
    }
  }
});