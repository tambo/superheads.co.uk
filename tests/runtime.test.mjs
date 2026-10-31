import { test } from "node:test";
import assert from "node:assert/strict";
import { runtimeProblem } from "../scripts/check-runtime.mjs";

test("runtime policy accepts Node 24 on native ARM64 and x64 hosts", () => {
  assert.equal(runtimeProblem({ version: "24.22.2", arch: "arm64", platform: "darwin" }), null);
  assert.equal(runtimeProblem({ version: "24.99.0", arch: "arm64", platform: "linux" }), null);
  assert.equal(runtimeProblem({ version: "24.22.2", arch: "x64", platform: "darwin", nativeMacArch: "x64" }), null);
  assert.equal(runtimeProblem({ version: "24.22.2", arch: "x64", platform: "linux" }), null);
  assert.equal(runtimeProblem({ version: "24.22.2", arch: "x64", platform: "win32" }), null);
});

test("runtime policy rejects old patches, other majors, unsupported architectures and platforms", () => {
  assert.match(runtimeProblem({ version: "24.22.1", arch: "arm64", platform: "darwin" }), /requires Node/);
  assert.match(runtimeProblem({ version: "25.0.0", arch: "arm64", platform: "darwin" }), /requires Node/);
  assert.match(runtimeProblem({ version: "24.22.2", arch: "ia32", platform: "win32" }), /requires native ARM64 or x64/);
  assert.match(runtimeProblem({ version: "24.22.2", arch: "arm64", platform: "freebsd" }), /requires macOS, Linux, or Windows/);
});

test("runtime policy prefers native architecture on Apple Silicon but permits x64 Intel Macs", () => {
  assert.equal(runtimeProblem({ version: "24.22.2", arch: "arm64", platform: "darwin", nativeMacArch: "arm64" }), null);
  assert.match(runtimeProblem({ version: "24.22.2", arch: "x64", platform: "darwin", nativeMacArch: "arm64" }), /Use native arm64 Node/);
  assert.equal(runtimeProblem({ version: "24.22.2", arch: "x64", platform: "darwin", nativeMacArch: "x64" }), null);
});

test("runtime policy rejects malformed version values", () => {
  assert.match(runtimeProblem({ version: "unknown", arch: "arm64", platform: "darwin" }), /requires Node/);
});