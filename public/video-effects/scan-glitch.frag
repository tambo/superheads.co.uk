float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float lines = 0.5 + 0.5 * sin(uv.y * iResolution.y * 1.2);
  float band = exp(-pow((fract(uv.y - iTime * 0.1) - 0.5) * 8.0, 2.0));
  float row = floor(uv.y * 30.0) + floor(iTime * 12.0);
  float glitch = step(0.97 - iAudio.z * 0.2, hash(row)) * step(0.3, hash(row + 7.0));
  vec3 col = vec3(lines * 0.12) + band * vec3(0.25, 0.55, 1.0) * (0.25 + iAudio.y);
  col += glitch * mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 0.0, 0.8), step(0.5, hash(row + 3.0))) * (0.4 + iAudio.z);
  fragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
