void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec3 color = vec3(0.015, 0.025, 0.035);
  for (int index = 0; index < 7; index++) {
    float offset = float(index) * 0.19;
    float wave = sin(uv.x * 3.0 + iTime * 0.5 + offset * 4.0) * (0.22 + iAudio.x * 0.1);
    wave += cos(uv.x * 5.0 - iTime * 0.3 + offset) * (0.07 + iAudio.y * 0.04);
    float ribbon = exp(-abs(uv.y - wave - offset + 0.57) * 65.0);
    color += ribbon * (0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + offset * 5.0 + iAudio.z * 0.4));
  }
  fragColor = vec4(color * (0.8 + iAudio.w * 0.2), 1.0);
}