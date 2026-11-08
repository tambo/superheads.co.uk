void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float v = 0.0;
  for (int i = 0; i < 5; i++) {
    float f = float(i) + 1.0;
    vec2 c = vec2(0.7 * sin(iTime * 0.25 * f + f * 2.0), 0.4 * cos(iTime * 0.2 * f + f));
    v += (0.08 + iAudio.x * 0.1) / (length(uv - c) + 0.12);
  }
  vec3 col = (0.5 + 0.5 * cos(vec3(0.0, 0.8, 1.6) + v * 1.2 + iTime * 0.2)) * smoothstep(0.2, 1.4, v) * (0.5 + iAudio.w);
  fragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
