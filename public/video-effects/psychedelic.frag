void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  uv *= 1.0 - iAudio.x * 0.2 * exp(-length(uv) * 2.0);
  float t = iTime + iAudio.y * 1.5;
  float v = sin(uv.x * (8.0 + iAudio.y * 5.0) + t) + sin(uv.y * 10.0 - t * 1.3)
          + sin((uv.x + uv.y) * 6.0 + t * 0.7) + sin(length(uv) * (12.0 + iAudio.x * 10.0) - t * 2.0 - iAudio.x * 4.0);
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + v * 0.8 + iTime * 0.3 + iAudio.x * 2.0);
  fragColor = vec4(col * (0.25 + iAudio.w * 0.6 + iAudio.x * 0.3), 1.0);
}
