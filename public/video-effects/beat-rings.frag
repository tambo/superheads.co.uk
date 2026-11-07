// Premultiplied RGBA overlay. iAudio = (bass, mid, treble, overall)
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = length(uv);
  float ring = 0.0;
  for (int i = 0; i < 4; i++) {
    float f = float(i);
    float radius = fract(iTime * 0.25 + f * 0.25);
    ring += smoothstep(0.012 + 0.03 * iAudio.x, 0.0, abs(r - radius * 0.95)) * (1.0 - radius);
  }
  vec3 col = (0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + iTime * 0.5 + r * 4.0)) * ring * (0.35 + iAudio.x * 1.6);
  col += vec3(1.0, 0.5, 0.2) * exp(-r * 3.0) * iAudio.x * 0.6;
  fragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
