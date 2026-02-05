"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ShaderMount } from "./shader-mount";
import {
  plainFragmentShader,
  blurFragmentShader,
  ditherFragmentShader,
  hexToRgba,
} from "./shaders";

type LoaderShape = "sphere" | "swirl" | "ripple";
type LoaderStyle = "plain" | "blur" | "dither";

const sizeConfig = {
  sm: { width: 48, height: 48 },
  default: { width: 80, height: 80 },
  lg: { width: 120, height: 120 },
};

const shapeMap: Record<LoaderShape, number> = {
  sphere: 1,
  swirl: 2,
  ripple: 3,
};

const shaderMap: Record<LoaderStyle, string> = {
  plain: plainFragmentShader,
  blur: blurFragmentShader,
  dither: ditherFragmentShader,
};

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Base shape of the loader */
  shape?: LoaderShape;
  /** Visual style: plain (solid), blur (soft), or dither (pixelated) */
  variant?: LoaderStyle;
  /** Size preset (maps to width/height) */
  size?: keyof typeof sizeConfig;
  /** Custom width (overrides size preset) */
  width?: number;
  /** Custom height (overrides size preset) */
  height?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Primary color */
  color?: string;
  /** Background color */
  colorBack?: string;
}

function Loader({
  shape = "sphere",
  variant = "dither",
  size = "default",
  width,
  height,
  speed = 1,
  color = "#00b3ff",
  colorBack = "transparent",
  className,
  style,
  ...props
}: LoaderProps) {
  const sizeDefaults = sizeConfig[size];
  const resolvedWidth = width ?? sizeDefaults.width;
  const resolvedHeight = height ?? sizeDefaults.height;

  const fragmentShader = shaderMap[variant];
  const shapeValue = shapeMap[shape];

  const uniforms = React.useMemo(
    () => ({
      u_colorFront: hexToRgba(color),
      u_colorBack: hexToRgba(colorBack),
      u_shape: shapeValue,
      u_scale: 0.6,
      u_pxSize: 2, // Pixel size for dithering
    }),
    [color, colorBack, shapeValue]
  );

  return (
    <div
      data-slot="loader"
      className={cn("relative overflow-hidden rounded-full", className)}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
        ...style,
      }}
      {...props}
    >
      <ShaderMount
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        speed={speed}
        width={resolvedWidth}
        height={resolvedHeight}
      />
    </div>
  );
}

export { Loader, sizeConfig };
export type { LoaderProps, LoaderShape, LoaderStyle };
