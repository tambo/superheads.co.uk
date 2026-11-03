export const shaderConfigUrl = "/config/shaders.json";
export const maxShaders = 17;
const maxSourceLength = 20000;

export function parseShaderConfig(data) {
  if (!data || !Array.isArray(data.shaders)) throw new Error("Invalid shader config");
  return data.shaders.slice(0, maxShaders).map((entry, index) => {
    if (!entry || typeof entry !== "object") throw new Error(`Invalid shader ${index + 1}`);
    const title = typeof entry.title === "string" && entry.title.trim() ? entry.title.trim().slice(0, 60) : `Shader ${index + 1}`;
    const hasFile = entry.file !== undefined;
    const hasSource = entry.source !== undefined;
    if (hasFile === hasSource) throw new Error(`Shader "${title}" needs exactly one of file or source`);
    if (hasFile && (typeof entry.file !== "string" || !/^\/shaders\/[a-zA-Z0-9_\-./]+\.(frag|glsl)$/.test(entry.file) || entry.file.includes(".."))) throw new Error(`Invalid shader file for "${title}"`);
    if (hasSource && (typeof entry.source !== "string" || !entry.source.includes("mainImage") || entry.source.length > maxSourceLength)) throw new Error(`Invalid shader source for "${title}"`);
    const speed = Number.isFinite(entry.speed) ? Math.min(10, Math.max(0, entry.speed)) : 1;
    return { title, speed, ...(hasFile ? { file: entry.file } : { source: entry.source }) };
  });
}

export function buildFragmentSource(userSource) {
  return `precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
${userSource}
void main() { vec4 color = vec4(0.0, 0.0, 0.0, 1.0); mainImage(color, gl_FragCoord.xy); gl_FragColor = vec4(color.rgb, 1.0); }`;
}
