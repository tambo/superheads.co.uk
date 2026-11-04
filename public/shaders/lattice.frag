void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float angle = iTime * 0.12 + iAudio.y * 0.12;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv += sin(uv.yx * 4.0 + iTime * 0.3) * (0.05 + iAudio.x * 0.025);
  vec2 cell = abs(fract(uv * 9.0) - 0.5);
  float lines = exp(-min(cell.x, cell.y) * 65.0);
  float nodes = exp(-length(cell) * (45.0 - iAudio.z * 8.0));
  vec3 color = lines * vec3(0.05, 0.45, 0.65) + nodes * vec3(1.0, 0.6, 0.2);
  fragColor = vec4(color * (0.8 + iAudio.w * 0.25), 1.0);
}