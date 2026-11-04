float lightEllipse(vec2 point, vec2 center, vec2 radius) {
  return (length((point - center) / radius) - 1.0) * min(radius.x, radius.y);
}

float lightLimb(vec2 point, vec2 start, vec2 end, float radius) {
  vec2 offset = point - start;
  vec2 direction = end - start;
  float position = clamp(dot(offset, direction) / dot(direction, direction), 0.0, 1.0);
  return length(offset - direction * position) - radius;
}

float lightBody(vec2 point) {
  vec2 mirrored = vec2(abs(point.x), point.y);
  float body = lightEllipse(point, vec2(0.0, 0.025), vec2(0.106, 0.175));
  body = min(body, lightEllipse(point, vec2(0.0, -0.145), vec2(0.123, 0.073)));
  body = min(body, lightLimb(point, vec2(0.0, 0.16), vec2(0.0, 0.235), 0.025));
  body = min(body, lightEllipse(point, vec2(0.0, 0.282), vec2(0.064, 0.082)));
  body = min(body, lightLimb(mirrored, vec2(0.06, 0.155), vec2(0.125, 0.11), 0.032));
  body = min(body, lightLimb(mirrored, vec2(0.125, 0.11), vec2(0.172, -0.035), 0.024));
  body = min(body, lightLimb(mirrored, vec2(0.172, -0.035), vec2(0.221, -0.16), 0.019));
  body = min(body, lightEllipse(mirrored, vec2(0.222, -0.172), vec2(0.031, 0.015)));
  body = min(body, lightLimb(mirrored, vec2(0.055, -0.145), vec2(0.225, -0.225), 0.042));
  body = min(body, lightLimb(mirrored, vec2(0.225, -0.225), vec2(0.035, -0.285), 0.03));
  body = min(body, lightEllipse(mirrored, vec2(0.05, -0.28), vec2(0.065, 0.022)));
  return body;
}

vec3 lightSpectrum(float position) {
  return 0.55 + 0.45 * cos(vec3(0.0, 2.1, 4.2) + position);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 point = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float bass = sqrt(clamp(iAudio.x, 0.0, 1.0));
  float mids = sqrt(clamp(iAudio.y, 0.0, 1.0));
  float highs = sqrt(clamp(iAudio.z, 0.0, 1.0));
  float energy = sqrt(clamp(iAudio.w, 0.0, 1.0));
  float breath = sin(iTime * 0.9) * 0.025 + bass * 0.09;
  point.y -= 0.01;
  vec2 flow = point * (3.3 - bass * 0.65);
  for (int layer = 0; layer < 4; layer++) {
    float depth = float(layer) + 1.0;
    flow += vec2(sin(flow.y * 1.4 + iTime * 0.45 + depth + mids * 1.5), cos(flow.x * 1.3 - iTime * 0.38 + depth - bass)) * (0.32 + energy * 0.24) / sqrt(depth);
  }
  float plasma = sin(flow.x * 2.4 + iTime * 0.4) + cos(flow.y * 2.7 - iTime * 0.5) + sin(length(flow) * 2.0 - iTime * 0.6 + bass * 2.0);
  vec3 plasmaColor = lightSpectrum(plasma * 1.3 + iTime * 0.2 + mids * 1.2);
  float currents = pow(0.5 + 0.5 * sin(plasma * 4.0 + highs * 2.0), 5.0);
  vec2 bodyPoint = point / (1.12 + breath);
  float distanceToBody = lightBody(bodyPoint);
  float inside = 1.0 - smoothstep(-0.002, 0.003, distanceToBody);
  vec3 spectrum = lightSpectrum(bodyPoint.y * 10.0 - iTime * 0.4 + mids * 1.2);
  float outline = exp(-abs(distanceToBody) * 170.0);
  float radiance = exp(-max(distanceToBody, 0.0) * 20.0);
  vec3 color = plasmaColor * (0.16 + currents * 0.24 + energy * 0.14);
  color *= 1.0 - inside * 0.7;
  color += spectrum * (outline * 1.25 + radiance * 0.12);
  color += inside * lightSpectrum(plasma * 1.7 - bodyPoint.y * 8.0 + iTime * 0.6) * (0.35 + currents * 0.7 + bass * 0.3);

  float meridians = pow(0.5 + 0.5 * cos(bodyPoint.x * 210.0 + sin(bodyPoint.y * 24.0 - iTime) * 1.8), 12.0);
  float filaments = pow(0.5 + 0.5 * sin(bodyPoint.y * 180.0 + sin(bodyPoint.x * 35.0) * 2.0 + iTime * 1.3), 18.0);
  color += inside * spectrum * (0.12 + meridians * 0.35 + filaments * (0.2 + highs * 0.4));

  float chestMask = (1.0 - smoothstep(0.07, 0.115, abs(bodyPoint.x))) * smoothstep(-0.105, -0.075, bodyPoint.y) * (1.0 - smoothstep(0.125, 0.16, bodyPoint.y));
  float ribs = pow(0.5 + 0.5 * cos((bodyPoint.y + abs(bodyPoint.x) * 0.48) * 185.0), 16.0);
  color += inside * chestMask * ribs * vec3(0.2, 0.75, 0.85) * (0.8 + mids * 0.5);
  float spine = exp(-abs(bodyPoint.x) * 550.0) * smoothstep(-0.2, -0.15, bodyPoint.y) * (1.0 - smoothstep(0.23, 0.27, bodyPoint.y));
  color += spine * vec3(0.55, 0.8, 1.0) * (0.9 + mids * 0.7);

  for (int index = 0; index < 7; index++) {
    float level = float(index);
    vec2 center = vec2(0.0, -0.155 + level * 0.078);
    float radius = length(bodyPoint - center);
    vec3 energyColor = lightSpectrum(0.4 - level * 0.9);
    float pulse = 1.0 + 0.3 * sin(iTime * 1.8 - level) + bass * 0.8;
    color += energyColor * exp(-radius * 65.0) * pulse;
    color += energyColor * exp(-abs(radius - 0.022 - bass * 0.014) * 250.0) * 0.3;
  }

  vec2 eyes = vec2(abs(bodyPoint.x) - 0.023, bodyPoint.y - 0.292);
  color += vec3(0.55, 0.85, 1.0) * exp(-length(eyes * vec2(0.6, 1.8)) * 550.0) * 0.45;
  float auraRadius = length((point - vec2(0.0, 0.035)) / vec2(0.31, 0.43));
  float aura = exp(-abs(auraRadius - 1.0 - breath * 2.0) * 18.0);
  color += lightSpectrum(point.y * 6.0 + iTime * 0.3 + mids) * aura * (0.35 + energy * 0.4);

  for (int index = 0; index < 2; index++) {
    float side = float(index) * 2.0 - 1.0;
    vec2 echoPoint = (point - vec2(side * 0.43, -0.025)) / 0.78;
    float echo = exp(-abs(lightBody(echoPoint)) * 190.0);
    float echoInside = 1.0 - smoothstep(-0.002, 0.004, lightBody(echoPoint));
    color += lightSpectrum(echoPoint.y * 8.0 + side + iTime * 0.3 + plasma * 0.5) * (echo * 0.4 + echoInside * (0.12 + currents * 0.22));
  }
  color *= 0.95 + energy * 0.3;
  fragColor = vec4(1.0 - exp(-color * 1.5), 1.0);
}