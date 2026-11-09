export const videoConfigUrl = "/config/videos.json";
export const maxVideos = 26;
const maxEffects = 26;
const blends = ["normal", "screen", "overlay", "multiply", "difference", "color-dodge", "hard-light", "soft-light", "lighten", "exclusion", "hue", "color", "saturation", "luminosity"];
const filterLimits = { hue: 180, saturate: 3, contrast: 1, brightness: 1, scale: 0.3 };

function parseFilter(filter) {
  const result = {};
  for (const [key, limit] of Object.entries(filterLimits)) {
    const value = filter && Number.isFinite(filter[key]) ? filter[key] : 0;
    result[key] = Math.min(limit, Math.max(-limit, value));
  }
  return result;
}

export function parseVideoConfig(data) {
  if (!data || !Array.isArray(data.effects) || !Array.isArray(data.videos)) throw new Error("Invalid video config");
  const effects = data.effects.slice(0, maxEffects).map((entry, index) => {
    if (!entry || typeof entry !== "object") throw new Error(`Invalid effect ${index + 1}`);
    const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim().slice(0, 40) : `Effect ${index + 1}`;
    if (typeof entry.file !== "string" || !/^\/video-effects\/[a-zA-Z0-9_\-.]+\.(frag|glsl)$/.test(entry.file) || entry.file.includes("..")) throw new Error(`Invalid effect file for "${name}"`);
    const blend = entry.blend === undefined ? "screen" : entry.blend;
    if (!blends.includes(blend)) throw new Error(`Invalid blend for "${name}"`);
    const speed = Number.isFinite(entry.speed) ? Math.min(10, Math.max(0, entry.speed)) : 1;
    return { name, file: entry.file, blend, speed, filter: parseFilter(entry.filter) };
  });
  if (!effects.length) throw new Error("No effects");
  const videos = data.videos.slice(0, maxVideos).map((entry, index) => {
    if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(entry.id)) throw new Error(`Invalid video ${index + 1}`);
    const title = typeof entry.title === "string" && entry.title.trim() ? entry.title.trim().slice(0, 60) : `Video ${index + 1}`;
    const effect = entry.effect === undefined ? effects[index % effects.length] : effects.find(item => item.name === entry.effect);
    if (!effect) throw new Error(`Unknown effect "${entry.effect}" for "${title}"`);
    const start = Number.isFinite(entry.start) ? Math.max(0, Math.floor(entry.start)) : 0;
    return { id: entry.id, title, start, effect };
  });
  return { effects, videos };
}

// Overlay shaders output premultiplied RGBA so the canvas can be blended over the video.
export function buildOverlaySource(userSource) {
  return `precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform vec4 iAudio;
${userSource}
void main() { vec4 color = vec4(0.0); mainImage(color, gl_FragCoord.xy); color = clamp(color, 0.0, 1.0); gl_FragColor = vec4(min(color.rgb, color.a), color.a); }`;
}

// Maps audio levels to CSS filter and scale amounts for the video layer. Each filter value is the extra applied at level 1.
export function videoFilterStyle(levels, filter = {}) {
  const { hue = 0, saturate = 0, contrast = 0, brightness = 0, scale = 0 } = filter;
  return {
    filter: `hue-rotate(${(levels.mid * hue).toFixed(1)}deg) saturate(${(1 + levels.level * saturate).toFixed(3)}) contrast(${(1 + levels.bass * contrast).toFixed(3)}) brightness(${(1 + levels.bass * brightness).toFixed(3)})`,
    transform: `scale(${(1 + levels.bass * scale).toFixed(4)})`,
  };
}
