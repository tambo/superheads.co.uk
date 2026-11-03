// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 3.0;
  for (int i = 1; i < 6; i++) {
    float f = float(i);
    p += (0.6 + iAudio.x * 0.5) / f * vec2(sin(p.y * f + iTime * 0.8 + f), cos(p.x * f - iTime * 0.6 + f * 1.5));
  }
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + p.x * 1.2 + p.y * 0.8 + iTime * 0.4 + iAudio.z * 2.0);
  fragColor = vec4(col * (0.9 + iAudio.w * 0.35), 1.0);
}
