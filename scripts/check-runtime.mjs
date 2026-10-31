const minimum = [24, 22, 2];

export function runtimeProblem({ version = process.versions.node, arch = process.arch, platform = process.platform } = {}) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (arch !== "arm64") return `Superheads requires ARM64 Node; current architecture is ${arch}.`;
  if (platform !== "darwin" && platform !== "linux") return `Superheads supports ARM64 macOS and Linux; current platform is ${platform}.`;
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