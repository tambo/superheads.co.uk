// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float s = sin(iTime * 0.4); float c = cos(iTime * 0.4);
  uv = mat2(c, -s, s, c) * uv;
  float space = 1.0 - smoothstep(0.15, 0.85, iAudio.w);
  float bass = iAudio.x * (0.15 + 0.35 * space);
  float mid = iAudio.y * (0.15 + 0.35 * space);
  uv *= 1.0 + (0.5 + bass * 0.2) * sin(length(uv) * 6.0 - iTime - bass * 0.8);
  vec2 g = floor(uv * 8.0 + iTime * 0.5);
  float k = mod(g.x + g.y, 2.0);
  vec3 col = mix(vec3(0.05, 0.07, 0.08), 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + g.x * 0.3 + g.y * 0.2 + iTime * 0.5 + mid * 0.8), k);
  fragColor = vec4(col * (1.0 + iAudio.w * 0.12), 1.0);
}
