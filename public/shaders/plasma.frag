// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 m = iMouse.xy / iResolution.xy;
  uv *= 1.0 - iAudio.x * 0.2 * exp(-length(uv) * 2.0);
  float v = sin(uv.x * (9.0 + iAudio.y * 5.0) + iTime) + sin(uv.y * 11.0 - iTime * 1.3)
          + sin((uv.x + uv.y) * 7.0 + iTime * 0.7 + m.x * 6.0)
          + sin(length(uv) * (14.0 + iAudio.x * 10.0) - iTime * 2.0 - iAudio.x * 4.0)
          + iAudio.z * 0.7 * sin(uv.x * 40.0 + uv.y * 36.0 + iTime * 6.0);
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + v * 0.8 + iTime * 0.3 + iAudio.x * 2.0);
  fragColor = vec4(col * (0.85 + iAudio.w * 0.3 + iAudio.x * 0.2), 1.0);
}
