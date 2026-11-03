void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float v = 0.0;
  for (int i = 0; i < 6; i++) {
    float f = float(i);
    float a = iTime * 0.25 + f * 1.0472;
    v += sin(dot(uv, vec2(cos(a), sin(a))) * (20.0 + f * 3.0) + iTime * (1.0 + f * 0.2));
  }
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 1.0, 2.0) + v * 0.5 + iTime * 0.2);
  fragColor = vec4(col * (0.4 + 0.6 * smoothstep(-6.0, 6.0, v)), 1.0);
}
