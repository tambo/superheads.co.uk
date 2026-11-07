void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.y;
  vec2 grid = uv * 40.0;
  vec2 cell = fract(grid) - 0.5;
  vec2 id = floor(grid);
  float wave = 0.5 + 0.5 * sin(id.x * 0.4 + id.y * 0.3 + iTime * 2.0);
  float radius = (0.08 + 0.4 * iAudio.w) * (0.4 + 0.6 * wave) + iAudio.z * 0.08;
  float dot = smoothstep(radius, radius - 0.08, length(cell));
  vec3 col = (0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + id.x * 0.08 + iTime * 0.4)) * dot;
  fragColor = vec4(col, dot);
}
