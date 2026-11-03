void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = length(uv) + 0.001;
  float a = atan(uv.y, uv.x);
  float depth = 0.25 / r + iTime;
  float bands = step(0.5, fract(depth * 2.0)) * 0.6 + 0.2;
  float spokes = 0.5 + 0.5 * sin(a * 8.0 + depth * 3.0);
  vec3 col = mix(vec3(1.0, 0.8, 0.0), vec3(0.5, 0.62, 0.66), spokes) * bands;
  fragColor = vec4(col * smoothstep(0.0, 0.25, r), 1.0);
}
