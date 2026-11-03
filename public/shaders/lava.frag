void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 m = iMouse.xy / iResolution.xy;
  float v = 0.0;
  for (int i = 0; i < 5; i++) {
    float f = float(i) + 1.0;
    vec2 c = 0.45 * vec2(sin(iTime * 0.4 * f + f * 2.0), cos(iTime * 0.3 * f + f));
    v += 0.16 / (length(uv - c) + 0.05);
  }
  v += 0.2 / (length(uv - (m - 0.5) * vec2(1.8, 1.0)) + 0.05);
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 0.6, 1.2) + v * 1.6 + iTime * 0.2);
  fragColor = vec4(col * smoothstep(0.1, 0.9, v), 1.0);
}
