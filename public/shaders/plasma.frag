void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 m = iMouse.xy / iResolution.xy;
  float v = sin(uv.x * 9.0 + iTime) + sin(uv.y * 11.0 - iTime * 1.3)
          + sin((uv.x + uv.y) * 7.0 + iTime * 0.7 + m.x * 6.0)
          + sin(length(uv) * 14.0 - iTime * 2.0);
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + v * 0.8 + iTime * 0.3);
  fragColor = vec4(col * 0.85, 1.0);
}
