void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float r = length(uv * vec2(0.8, 1.0));
  float alpha = smoothstep(0.25, 1.0, r * (1.15 - iAudio.x * 0.45)) * 0.85;
  vec3 tint = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + iTime * 0.4);
  fragColor = vec4(tint * 0.3 * alpha * (0.5 + iAudio.w * 1.5), alpha);
}
