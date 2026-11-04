void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  float rings = pow(0.5 + 0.5 * cos(radius * 65.0 - iTime * 3.0 - iAudio.x * 1.5), 14.0);
  float sweep = pow(0.5 + 0.5 * cos(angle - iTime * 0.6), 24.0);
  float petals = 0.5 + 0.5 * cos(angle * 7.0 + radius * 9.0 + iAudio.y * 0.8);
  vec3 color = mix(vec3(0.02, 0.5, 0.65), vec3(0.9, 0.85, 0.2), petals);
  color *= (rings * 0.4 + sweep * exp(-radius) + iAudio.z * rings * 0.2);
  fragColor = vec4(color * (0.8 + iAudio.w * 0.2), 1.0);
}