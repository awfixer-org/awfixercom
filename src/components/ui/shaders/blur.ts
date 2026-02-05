import { shaderConstants, shapeUniforms, shapeFunctions } from "./utils";

export const blurFragmentShader = `#version 300 es
precision mediump float;

${shaderConstants}
${shapeUniforms}

out vec4 fragColor;

${shapeFunctions}

// Heavy blur sampling for diffuse effect
float heavyBlur(vec2 uv, float time, float blurSize) {
  float sum = 0.0;
  float totalWeight = 0.0;
  
  // 25-tap blur kernel for heavier blur
  for (float x = -2.0; x <= 2.0; x += 1.0) {
    for (float y = -2.0; y <= 2.0; y += 1.0) {
      vec2 offset = vec2(x, y) * blurSize;
      float dist = length(vec2(x, y));
      float weight = exp(-dist * dist * 0.15); // Gaussian falloff
      sum += getShape(uv + offset, time) * weight;
      totalWeight += weight;
    }
  }
  
  return sum / totalWeight;
}

void main() {
  // Normalize coordinates to [-0.5, 0.5] centered
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  uv /= u_scale;
  
  float time = u_time;
  float dist = length(uv * 2.0);
  
  // Multiple heavy blur passes for completely diffuse result
  float blurAmount = 0.05;
  float shape1 = heavyBlur(uv, time, blurAmount);
  float shape2 = heavyBlur(uv, time, blurAmount * 2.5);
  float shape3 = heavyBlur(uv, time, blurAmount * 4.0);
  float shape4 = heavyBlur(uv, time, blurAmount * 6.0);
  
  // Combine blur passes - heavily weighted toward outer blur
  float shape = shape1 * 0.25 + shape2 * 0.3 + shape3 * 0.25 + shape4 * 0.2;
  
  // Very soft power curve for foggy appearance
  // Boost intensity for swirl/ripple to fill more space
  float powerCurve = (u_shape < 1.5) ? 0.6 : 0.5;
  float foggy = pow(shape, powerCurve);
  
  // Apply shape-specific edge handling
  float edgeFade = 1.0;
  if (u_shape < 1.5) {
    // Sphere: soft radial fade for diffuse edges
    edgeFade = 1.0 - smoothstep(0.5, 1.0, dist * 0.65);
  } else if (u_shape < 2.5) {
    // Swirl: extend to fill same circle as plain/dither
    edgeFade = 1.0 - smoothstep(0.95, 1.05, dist);
  } else {
    // Ripple: extend to fill same circle as plain/dither
    edgeFade = 1.0 - smoothstep(0.95, 1.05, dist);
  }
  foggy *= edgeFade;
  
  // Extra soft smoothstep for diffuse edges
  float finalShape = smoothstep(0.0, 0.8, foggy);
  
  // Mix colors
  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a * finalShape;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;
  
  vec3 color = fgColor * finalShape;
  float opacity = fgOpacity;
  
  color += bgColor * (1.0 - opacity);
  opacity += bgOpacity * (1.0 - opacity);
  
  fragColor = vec4(color, opacity);
}
`;
