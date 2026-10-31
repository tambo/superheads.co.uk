import { execFileSync } from "node:child_process";

const minimum = [24, 22, 2];

function getNativeMacArch() {
  try {
    return execFileSync("sysctl", ["-n", "hw.optional.arm64"], { encoding: "utf8" }).trim() === "1" ? "arm64" : "x64";
  } catch {
    return undefined;
  }
}

export function runtimeProblem(options = {}) {
  const version = options.version ?? process.versions.node;
  const arch = options.arch ?? process.arch;
  const platform = options.platform ?? process.platform;
  const nativeMacArch = options.nativeMacArch ?? (platform === process.platform && platform === "darwin" ? getNativeMacArch() : undefined);
  const [major, minor, patch] = version.split(".").map(Number);
  if (arch !== "arm64" && arch !== "x64") return `Superheads requires native ARM64 or x64 Node; current architecture is ${arch}.`;
  if (!["darwin", "linux", "win32"].includes(platform)) return `Superheads requires macOS, Linux, or Windows; current platform is ${platform}.`;
  if (platform === "darwin" && nativeMacArch && arch !== nativeMacArch) return `Use native ${nativeMacArch} Node on this Mac instead of ${arch} under translation.`;
  if (major !== 24 || minor < minimum[1] || (minor === minimum[1] && patch < minimum[2])) {
    return `Superheads requires Node 24.22.2 or newer within Node 24; current version is ${version}.`;
  }
  return null;
}

const problem = runtimeProblem();
if (problem) {
  console.error(problem);
  process.exitCode = 1;
} else {
  console.log(`Superheads runtime OK: Node ${process.versions.node} (${process.arch}, ${process.platform}).`);
}