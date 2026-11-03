// iAudio = (bass, mid, treble, overall), each 0..1
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float n(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec2 p = vec2(uv.x * 4.0 * iResolution.x / iResolution.y, uv.y * 3.0 - iTime * 1.5 + iAudio.y * 0.5);
  float v = n(p) * 0.6 + n(p * 2.0 + 3.0) * 0.3 + n(p * 4.0 - 7.0) * 0.1;
  float heat = clamp(v * (1.25 - uv.y) * (1.6 + iAudio.x * 0.9) - uv.y * 0.3, 0.0, 1.0);
  vec3 col = vec3(heat * 1.6, heat * heat * (1.1 + iAudio.z * 0.5), heat * heat * heat * 0.6);
  fragColor = vec4(col, 1.0);
}
