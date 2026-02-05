export const shaderConstants = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;

export const shapeUniforms = `
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_shape; // 1=sphere, 2=swirl, 3=ripple
uniform float u_scale;
`;

// Shape functions - all shapes expect normalized UV coordinates centered at origin
export const shapeFunctions = `
// Sphere - 3D lit sphere with rotating light source
float sphereShape(vec2 uv, float time) {
  uv *= 2.0;
  float d = 1.0 - pow(length(uv), 2.0);
  vec3 pos = vec3(uv, sqrt(max(0.0, d)));
  vec3 lightPos = normalize(vec3(cos(3.0 * time), 0.8, sin(2.5 * time)));
  float shape = 0.5 + 0.5 * dot(lightPos, pos);
  return shape * step(0.0, d);
}

// Swirl - spiral vortex pattern
float swirlShape(vec2 uv, float time) {
  float l = length(uv);
  float angle = 6.0 * atan(uv.y, uv.x) + 8.0 * time;
  float twist = 1.2;
  float offset = 1.0 / pow(max(l, 1e-6), twist) + angle / TWO_PI;
  float mid = smoothstep(0.0, 1.0, pow(l, twist));
  return mix(0.0, fract(offset), mid);
}

// Ripple - concentric expanding waves
float rippleShape(vec2 uv, float time) {
  float dist = length(uv);
  float waves = sin(pow(dist, 1.7) * 7.0 - 6.0 * time) * 0.5 + 0.5;
  return waves;
}

// Get shape value based on u_shape uniform
float getShape(vec2 uv, float time) {
  if (u_shape < 1.5) {
    return sphereShape(uv, time);
  } else if (u_shape < 2.5) {
    return swirlShape(uv, time);
  } else {
    return rippleShape(uv, time);
  }
}
`;

// Helper to convert hex color to RGBA array
export function hexToRgba(hex: string): [number, number, number, number] {
  // Handle transparent
  if (hex === "transparent" || hex === "") {
    return [0, 0, 0, 0];
  }
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
      1.0,
    ];
  }
  return [0, 0, 0, 0];
}
