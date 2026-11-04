void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 grid = uv * 12.0;
  vec2 cell = floor(grid);
  vec2 local = fract(grid) - 0.5;
  float direction = mod(cell.x + cell.y, 2.0);
  float wire = exp(-abs(mix(local.x, local.y, direction)) * 65.0);
  float phase = cell.x * 0.7 + cell.y * 0.9 - iTime * (1.0 + iAudio.x * 0.25);
  float pulse = pow(0.5 + 0.5 * sin(phase), 10.0);
  vec3 color = mix(vec3(0.03, 0.2, 0.15), vec3(0.4 + iAudio.z * 0.2, 1.0, 0.65), pulse);
  fragColor = vec4(color * wire * (0.75 + iAudio.y * 0.2 + iAudio.w * 0.15), 1.0);
}