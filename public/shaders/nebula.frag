void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 flow = uv * 3.0;
  float cloud = 0.0;
  for (int index = 0; index < 5; index++) {
    float layer = float(index) + 1.0;
    flow += vec2(sin(flow.y * 1.6 + iTime * 0.2), cos(flow.x * 1.4 - iTime * 0.17)) * (0.32 + iAudio.x * 0.06);
    cloud += sin(flow.x * layer + iAudio.y * 0.3) * cos(flow.y * layer) / layer;
  }
  vec3 color = 0.5 + 0.5 * cos(vec3(0.0, 2.3, 4.4) + cloud * 1.8 + iAudio.z * 0.3);
  fragColor = vec4(color * (0.45 + 0.3 * sin(cloud) + iAudio.w * 0.15), 1.0);
}