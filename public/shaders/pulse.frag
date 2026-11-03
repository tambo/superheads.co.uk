// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 m = iMouse.xy / iResolution.xy;
  float bass = iAudio.x;
  float mid = iAudio.y;
  float treble = iAudio.z;
  float r = length(uv);
  uv *= 1.0 - bass * 0.25 * exp(-r * 2.0);
  float t = iTime + mid * 1.5;
  float v = sin(uv.x * (9.0 + mid * 6.0) + t)
          + sin(uv.y * 11.0 - t * 1.3)
          + sin((uv.x + uv.y) * 7.0 + t * 0.7 + m.x * 6.0)
          + sin(length(uv) * (14.0 + bass * 10.0) - t * 2.0 - bass * 4.0);
  v += treble * 0.7 * sin(uv.x * 40.0 + uv.y * 36.0 + iTime * 6.0);
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + v * 0.8 + iTime * 0.3 + bass * 2.0);
  col *= 0.6 + 0.6 * iAudio.w + bass * 0.35;
  fragColor = vec4(col, 1.0);
}
