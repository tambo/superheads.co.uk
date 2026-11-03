void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float x = uv.x * 6.0;
  vec3 col = vec3(0.0, 0.01, 0.03) + 0.04 * uv.y;
  for (int i = 0; i < 4; i++) {
    float f = float(i);
    float y = 0.55 + 0.12 * sin(x + iTime * 0.5 + f * 1.7) + 0.06 * sin(x * 2.3 - iTime * 0.7 + f);
    float d = (uv.y - y) / (0.12 + 0.05 * f);
    float glow = exp(-d * d) * (d > 0.0 ? 1.0 : 0.6);
    col += glow * (0.5 + 0.5 * cos(vec3(2.0, 0.0, 1.0) * 1.2 + f * 1.1 + iTime * 0.2)) * 0.55;
  }
  fragColor = vec4(col, 1.0);
}
