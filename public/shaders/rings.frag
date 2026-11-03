void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 m = (iMouse.xy / iResolution.xy - 0.5) * vec2(iResolution.x / iResolution.y, 1.0);
  float d = length(uv - m);
  float ring = 0.5 + 0.5 * sin(d * 40.0 - iTime * 4.0);
  vec3 col = mix(vec3(0.01, 0.02, 0.02), vec3(1.0, 0.54, 0.0), pow(ring, 6.0)) / (1.0 + d * 2.0);
  fragColor = vec4(col, 1.0);
}
