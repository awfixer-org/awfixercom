import { shaderConstants, shapeUniforms, shapeFunctions } from "./utils";

export const ditherFragmentShader = `#version 300 es
precision mediump float;

${shaderConstants}
${shapeUniforms}
uniform float u_pxSize;

out vec4 fragColor;

${shapeFunctions}

// 4x4 Bayer dithering matrix
const int bayer4x4[16] = int[16](
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5
);

// 8x8 Bayer dithering matrix for finer detail
const int bayer8x8[64] = int[64](
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue4x4(vec2 uv) {
  ivec2 pos = ivec2(mod(uv, 4.0));
  int index = pos.y * 4 + pos.x;
  return float(bayer4x4[index]) / 16.0;
}

float getBayerValue8x8(vec2 uv) {
  ivec2 pos = ivec2(mod(uv, 8.0));
  int index = pos.y * 8 + pos.x;
  return float(bayer8x8[index]) / 64.0;
}

void main() {
  float pxSize = max(2.0, u_pxSize) * u_pixelRatio;
  
  // Pixelate the UV coordinates
  vec2 pixelUV = gl_FragCoord.xy / pxSize;
  vec2 pixelatedCoord = (floor(pixelUV) + 0.5) * pxSize;
  
  // Normalize to centered coordinates
  vec2 uv = (pixelatedCoord - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  uv /= u_scale;
  
  float time = u_time;
  float shape = getShape(uv, time);
  
  // Get Bayer dithering threshold
  float dither = getBayerValue4x4(pixelUV);
  dither -= 0.5;
  
  // Apply dithering threshold
  float result = step(0.5, shape + dither);
  
  // Mix colors
  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;
  
  vec3 color = fgColor * result;
  float opacity = fgOpacity * result;
  
  color += bgColor * (1.0 - opacity);
  opacity += bgOpacity * (1.0 - opacity);
  
  fragColor = vec4(color, opacity);
}
`;
