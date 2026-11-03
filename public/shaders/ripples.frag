// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 m = (iMouse.xy / iResolution.xy - 0.5) * vec2(iResolution.x / iResolution.y, 1.0);
  float k = 1.0 + iAudio.x * 0.5;
  float v = sin(length(uv - vec2(-0.5, 0.2)) * 30.0 - iTime * 3.0 - iAudio.x * 3.0) * k
          + sin(length(uv - vec2(0.5, -0.2)) * 26.0 - iTime * 2.5 - iAudio.y * 3.0) * k
          + sin(length(uv - m) * 34.0 - iTime * 3.5 - iAudio.z * 3.0) * k;
  vec3 col = 0.5 + 0.5 * cos(vec3(3.5, 2.0, 0.5) + v * 0.9 + iTime * 0.2);
  fragColor = vec4(col * (0.9 + iAudio.w * 0.35), 1.0);
}
