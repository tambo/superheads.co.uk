void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  float edge = 0.23 + iAudio.x * 0.025;
  float corona = exp(-abs(radius - edge) * (25.0 - iAudio.y * 5.0));
  float rays = 0.65 + 0.35 * sin(angle * 22.0 + iTime * 0.7 + sin(angle * 9.0 - iTime));
  float disc = smoothstep(edge - 0.01, edge + 0.01, radius);
  vec3 color = mix(vec3(1.0, 0.2, 0.02), vec3(0.2, 0.65, 1.0), 0.5 + 0.5 * sin(angle + iTime * 0.2 + iAudio.z * 0.4));
  fragColor = vec4(color * corona * rays * disc * (1.0 + iAudio.w * 0.2), 1.0);
}