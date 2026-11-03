// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float v = 0.0;
  for (int i = 0; i < 7; i++) {
    float f = float(i) + 1.0;
    vec2 c = (1.0 + iAudio.y * 0.5) * vec2(sin(iTime * 0.5 + f * 1.3) * 0.6, cos(iTime * 0.4 * (1.0 + f * 0.15) + f * 2.1) * 0.35);
    v += 0.012 * (1.0 + iAudio.x * 1.8) / dot(uv - c, uv - c);
  }
  float edge = smoothstep(0.9, 1.0, v) - smoothstep(1.0, 1.15, v);
  vec3 col = mix(vec3(0.02, 0.03, 0.05), 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + min(v, 3.0) * 0.8 + iTime * 0.3 + iAudio.z * 2.0), smoothstep(0.9, 1.0, v));
  fragColor = vec4(col + edge * 0.6, 1.0);
}
