// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float a = atan(uv.y, uv.x);
  float r = length(uv);
  float seg = 3.14159265 / 6.0;
  a = abs(mod(a, 2.0 * seg) - seg);
  vec2 p = r * (1.0 - iAudio.x * 0.2) * vec2(cos(a), sin(a));
  float v = sin(p.x * 18.0 + iTime) + sin(p.y * 22.0 - iTime * 1.2) + sin(r * 16.0 - iTime * 2.0 - iAudio.x * 3.0) + iAudio.z * 1.2 * sin(r * 60.0 - iTime * 6.0);
  vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + v + iTime * 0.3 + iAudio.y * 1.5);
  fragColor = vec4(col * (1.0 - r * 0.6) * (1.0 + iAudio.w * 0.5), 1.0);
}
