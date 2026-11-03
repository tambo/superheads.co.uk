// iAudio = (bass, mid, treble, overall), each 0..1
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = length(uv) * (1.0 - iAudio.x * 0.15) + 0.001;
  float a = atan(uv.y, uv.x);
  float depth = 0.25 / r + iTime + iAudio.y * 0.8;
  float bands = step(0.5, fract(depth * 2.0)) * 0.6 + 0.2 + iAudio.x * 0.3;
  float spokes = 0.5 + 0.5 * sin(a * 8.0 + depth * 3.0);
  vec3 col = mix(vec3(1.0, 0.8, 0.0), vec3(0.5, 0.62, 0.66), spokes) * bands;
  fragColor = vec4(col * smoothstep(0.0, 0.25, r) * (1.0 + iAudio.w * 0.5 + iAudio.z * 0.2 * sin(a * 24.0 + iTime * 8.0)), 1.0);
}
