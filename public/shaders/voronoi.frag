vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 6.0;
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  float d1 = 8.0; float d2 = 8.0; float id = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 h = hash2(i + g);
      vec2 o = 0.5 + 0.5 * sin(iTime * 0.8 + 6.2831 * h);
      float d = length(g + o - f);
      if (d < d1) { d2 = d1; d1 = d; id = h.x; } else if (d < d2) { d2 = d; }
    }
  }
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + id * 6.28 + iTime * 0.2);
  col *= 0.35 + 0.65 * smoothstep(0.0, 0.6, d1);
  col += smoothstep(0.08, 0.0, d2 - d1) * 0.5;
  fragColor = vec4(col, 1.0);
}
