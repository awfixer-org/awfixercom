"use client";

import * as React from "react";
import { vertexShaderSource } from "./shaders";

interface ShaderMountProps {
  fragmentShader: string;
  uniforms: Record<string, number | number[]>;
  speed?: number;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "Shader compile error:",
      gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  // Clean up shaders after linking
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

export function ShaderMount({
  fragmentShader,
  uniforms,
  speed = 1,
  width,
  height,
  className,
  style,
}: ShaderMountProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const glRef = React.useRef<WebGL2RenderingContext | null>(null);
  const programRef = React.useRef<WebGLProgram | null>(null);
  const uniformLocationsRef = React.useRef<
    Record<string, WebGLUniformLocation | null>
  >({});
  const rafRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number>(performance.now());
  const currentSpeedRef = React.useRef<number>(speed);

  // Update speed ref when prop changes
  React.useEffect(() => {
    currentSpeedRef.current = speed;
  }, [speed]);

  // Initialize WebGL
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });

    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    glRef.current = gl;

    // Create program
    const program = createProgram(gl, vertexShaderSource, fragmentShader);
    if (!program) return;

    programRef.current = program;

    // Setup position attribute
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const locations: Record<string, WebGLUniformLocation | null> = {
      u_time: gl.getUniformLocation(program, "u_time"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_pixelRatio: gl.getUniformLocation(program, "u_pixelRatio"),
    };

    Object.keys(uniforms).forEach((key) => {
      locations[key] = gl.getUniformLocation(program, key);
    });

    uniformLocationsRef.current = locations;

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (gl && program) {
        gl.deleteProgram(program);
      }
    };
  }, [fragmentShader]);

  // Render loop
  React.useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const locations = uniformLocationsRef.current;

    if (!gl || !program) return;

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const canvasWidth = width * pixelRatio;
    const canvasHeight = height * pixelRatio;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    gl.viewport(0, 0, canvasWidth, canvasHeight);

    let lastTime = performance.now();
    let accumulatedTime = 0;

    const render = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      accumulatedTime += deltaTime * currentSpeedRef.current * 0.001;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      // Set built-in uniforms
      if (locations.u_time) {
        gl.uniform1f(locations.u_time, accumulatedTime);
      }
      if (locations.u_resolution) {
        gl.uniform2f(locations.u_resolution, canvasWidth, canvasHeight);
      }
      if (locations.u_pixelRatio) {
        gl.uniform1f(locations.u_pixelRatio, pixelRatio);
      }

      // Set custom uniforms
      Object.entries(uniforms).forEach(([key, value]) => {
        const location = locations[key];
        if (!location) return;

        if (Array.isArray(value)) {
          switch (value.length) {
            case 2:
              gl.uniform2fv(location, value);
              break;
            case 3:
              gl.uniform3fv(location, value);
              break;
            case 4:
              gl.uniform4fv(location, value);
              break;
          }
        } else {
          gl.uniform1f(location, value);
        }
      });

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [uniforms, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width,
        height,
        ...style,
      }}
    />
  );
}
