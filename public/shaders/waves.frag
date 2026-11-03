void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec3 col = vec3(0.01, 0.02, 0.04);
  for (int i = 0; i < 12; i++) {
    float f = float(i);
    float y = 0.5 + 0.28 * sin(uv.x * (3.0 + f * 0.4) + iTime * (0.6 + f * 0.08) + f) * sin(uv.x * 1.5 - iTime * 0.3 + f * 0.7);
    float d = abs(uv.y - y);
    col += (0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + f * 0.5 + iTime * 0.2)) * 0.004 / (d + 0.004);
  }
  fragColor = vec4(col * 0.8, 1.0);
}
