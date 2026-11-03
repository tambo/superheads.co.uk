void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float s = sin(iTime * 0.4); float c = cos(iTime * 0.4);
  uv = mat2(c, -s, s, c) * uv;
  uv *= 1.0 + 0.5 * sin(length(uv) * 6.0 - iTime);
  vec2 g = floor(uv * 8.0 + iTime * 0.5);
  float k = mod(g.x + g.y, 2.0);
  vec3 col = mix(vec3(0.05, 0.07, 0.08), 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + g.x * 0.3 + g.y * 0.2 + iTime * 0.5), k);
  fragColor = vec4(col, 1.0);
}
