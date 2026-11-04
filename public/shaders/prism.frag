void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float phase = iTime * 0.22 + iAudio.y * 0.2;
  vec3 color = vec3(0.015, 0.02, 0.04);
  for (int index = 0; index < 6; index++) {
    float angle = float(index) * 1.0472 + phase;
    float band = abs(dot(uv, vec2(cos(angle), sin(angle))) - 0.22 * sin(phase + float(index)));
    float light = exp(-band * (30.0 - iAudio.x * 8.0));
    color += light * (0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + float(index) + iAudio.z * 0.3));
  }
  fragColor = vec4(color * (0.65 + iAudio.w * 0.2), 1.0);
}