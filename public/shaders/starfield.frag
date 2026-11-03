float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  vec2 m = (iMouse.xy / iResolution.xy - 0.5) * 0.3;
  vec3 col = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float f = float(i);
    float z = fract(iTime * 0.12 + f * 0.25);
    float scale = mix(18.0, 1.0, z);
    vec2 p = (uv - m) * scale + f * 17.3;
    vec2 id = floor(p);
    vec2 g = fract(p) - 0.5;
    vec2 off = (vec2(h(id), h(id + 9.1)) - 0.5) * 0.6;
    float d = length(g - off);
    float star = smoothstep(0.22, 0.0, d) * smoothstep(0.0, 0.2, z) * smoothstep(1.0, 0.7, z);
    col += 1.6 * star * (0.6 + 0.4 * cos(vec3(0.0, 2.0, 4.0) + h(id) * 6.28));
  }
  fragColor = vec4(col + vec3(0.0, 0.0, 0.02), 1.0);
}
