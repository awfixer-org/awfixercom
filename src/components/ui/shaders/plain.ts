import { shaderConstants, shapeUniforms, shapeFunctions } from "./utils";

export const plainFragmentShader = `#version 300 es
precision mediump float;

${shaderConstants}
${shapeUniforms}

out vec4 fragColor;

${shapeFunctions}

// Gaussian-like blur by sampling shape at multiple offsets
float blurredShape(vec2 uv, float time, float blurSize) {
  float sum = 0.0;
  float totalWeight = 0.0;
  
  // 9-tap blur kernel
  for (float x = -1.0; x <= 1.0; x += 1.0) {
    for (float y = -1.0; y <= 1.0; y += 1.0) {
      vec2 offset = vec2(x, y) * blurSize;
      float weight = 1.0 - length(vec2(x, y)) * 0.3;
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
  
  // Multi-pass blur for smoother result
  float blurAmount = 0.03;
  float shape1 = blurredShape(uv, time, blurAmount);
  float shape2 = blurredShape(uv, time, blurAmount * 2.0);
  float shape3 = blurredShape(uv, time, blurAmount * 3.0);
  
  // Combine blur passes with different weights for glow effect
  float shape = shape1 * 0.5 + shape2 * 0.3 + shape3 * 0.2;
  
  // Add extra glow falloff
  float glow = pow(shape, 0.8);
  
  // Add inner brightness
  float core = getShape(uv, time);
  float finalShape = mix(glow, core, 0.4);
  
  // Soft edges
  finalShape = smoothstep(0.0, 0.5, finalShape);
  
  // Mix colors with glow
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
