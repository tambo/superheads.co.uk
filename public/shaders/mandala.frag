// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float petals = sin(a * 8.0 + iTime * 0.6 + iAudio.y * 2.0) * (0.5 + iAudio.x * 0.4) + 0.5;
  float rings = sin(r * (40.0 + iAudio.x * 12.0) - iTime * 2.0 - iAudio.x * 3.0 + petals * 4.0);
  float v = rings * 0.5 + 0.5;
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + a * 2.0 + r * 8.0 - iTime * 0.5);
  fragColor = vec4(col * v * (1.0 - r * 0.8) * (1.0 + iAudio.w * 0.5), 1.0);
}
