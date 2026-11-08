void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float y = -abs(uv.y) - 0.002;
  float z = 0.25 / -y;
  float gx = abs(fract(uv.x * z + 0.5) - 0.5);
  float gz = abs(fract(z + iTime * (0.4 + iAudio.y)) - 0.5);
  float line = max(smoothstep(0.03 * z, 0.0, gx), smoothstep(0.03 * z, 0.0, gz));
  float fade = 1.0 / (1.0 + z * 0.35);
  vec3 col = mix(vec3(1.0, 0.1, 0.8), vec3(0.1, 0.9, 1.0), 0.5 + 0.5 * sin(z * 0.5 + iTime)) * line * fade * (0.5 + iAudio.x * 1.8);
  fragColor = vec4(col, max(col.r, max(col.g, col.b)));
}
