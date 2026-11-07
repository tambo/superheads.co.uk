float hash(float n) { return fract(sin(n * 91.345) * 47453.5453); }
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float bars = 48.0;
  float id = floor(uv.x * bars);
  float fx = fract(uv.x * bars);
  float pos = id / bars;
  float band = pos < 0.33 ? iAudio.x : (pos < 0.66 ? iAudio.y : iAudio.z);
  float h = 0.03 + band * (0.25 + 0.4 * hash(id + floor(iTime * 8.0)));
  float edge = min(uv.y, 1.0 - uv.y);
  float bar = step(edge, h) * step(0.15, fx) * step(fx, 0.85);
  vec3 col = (0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + pos * 5.0 + iTime * 0.4)) * bar * 0.9;
  fragColor = vec4(col, bar * 0.9);
}
