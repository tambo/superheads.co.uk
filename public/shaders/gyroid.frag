void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec3 point = vec3(uv * (7.0 + iAudio.x * 0.7), iTime * 0.4);
  point.xy += vec2(sin(point.z), cos(point.z)) * 0.4;
  float field = dot(sin(point), cos(point.yzx));
  float surface = exp(-abs(field - iAudio.y * 0.3) * 5.0);
  float contour = 0.5 + 0.5 * sin(field * 8.0 + iTime + iAudio.z);
  vec3 color = mix(vec3(0.02, 0.08, 0.1), vec3(0.95, 0.4, 0.15), contour);
  fragColor = vec4(color * surface * (0.8 + iAudio.w * 0.2), 1.0);
}