void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 z = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 2.6;
  vec2 m = iMouse.xy / iResolution.xy;
  vec2 c = 0.7885 * vec2(cos(iTime * 0.3 + m.x), sin(iTime * 0.3 + m.y));
  float n = 0.0;
  for (int i = 0; i < 64; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 16.0) break;
    n += 1.0;
  }
  float t = n / 64.0;
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 0.6, 1.0) * 6.28 + sqrt(t) * 9.0 + iTime * 0.3);
  fragColor = vec4(n >= 64.0 ? vec3(0.02) : col * (0.5 + 0.5 * sqrt(t)), 1.0);
}
