import { test } from "node:test";
import assert from "node:assert/strict";
import { runtimeProblem } from "../scripts/check-runtime.mjs";

test("runtime policy accepts supported ARM64 Node 24 on macOS and Linux", () => {
  assert.equal(runtimeProblem({ version: "24.22.2", arch: "arm64", platform: "darwin" }), null);
  assert.equal(runtimeProblem({ version: "24.99.0", arch: "arm64", platform: "linux" }), null);
});

test("runtime policy rejects old patches, other majors, x64, and unsupported platforms", () => {
  assert.match(runtimeProblem({ version: "24.22.1", arch: "arm64", platform: "darwin" }), /requires Node/);
  assert.match(runtimeProblem({ version: "25.0.0", arch: "arm64", platform: "darwin" }), /requires Node/);
  assert.match(runtimeProblem({ version: "24.22.2", arch: "x64", platform: "darwin" }), /requires ARM64/);
  assert.match(runtimeProblem({ version: "24.22.2", arch: "arm64", platform: "win32" }), /supports ARM64 macOS and Linux/);
});

test("runtime policy rejects malformed version values", () => {
  assert.match(runtimeProblem({ version: "unknown", arch: "arm64", platform: "darwin" }), /requires Node/);
});