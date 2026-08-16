'use client';

import { useEffect, useRef } from 'react';

interface GhostOrbProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  children?: React.ReactNode;
  radius?: number;
  turbulence?: number;
  noiseScale?: number;
  flowSpeed?: number;
  octaves?: number;
  roughness?: number;
  lacunarity?: number;
  steps?: number;
  stride?: number;
  zoom?: number;
  maskRadius?: number;
  maskFeather?: number;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  rimStrength?: number;
  rimPower?: number;
  specularColorA?: string;
  specularColorB?: string;
  specularStrength?: number;
  specularSharpness?: number;
  glowStrength?: number;
  glowFalloff?: number;
  gamma?: number;
  brightness?: number;
  opacity?: number;
  backgroundColor?: string;
  cursorInteraction?: boolean;
  cursorLight?: number;
  adaptiveQuality?: boolean;
  targetFps?: number;
  dpr?: number;
  paused?: boolean;
}

const VERTEX_SRC = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uRadius;
uniform float uTurbulence;
uniform float uNoiseScale;
uniform float uFlowSpeed;
uniform int uOctaves;
uniform float uRoughness;
uniform float uLacunarity;
uniform int uSteps;
uniform float uStride;
uniform float uZoom;
uniform float uMaskRadius;
uniform float uMaskFeather;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uRimStrength;
uniform float uRimPower;
uniform vec3 uSpecColorA;
uniform vec3 uSpecColorB;
uniform float uSpecStrength;
uniform float uSpecSharpness;
uniform float uGlowStrength;
uniform float uGlowFalloff;
uniform float uGamma;
uniform float uBrightness;
uniform float uOpacity;
uniform vec4 uBgColor;
uniform vec2 uPointer;
uniform float uCursorLight;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float valueNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z
  ) * 2.0 - 1.0;
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uOctaves) break;
    sum += amp * valueNoise(p * freq);
    freq *= uLacunarity;
    amp *= uRoughness;
  }
  return sum;
}

float map(vec3 p) {
  float d = length(p) - uRadius;
  vec3 flow = p * uNoiseScale + vec3(0.0, 0.0, uTime * uFlowSpeed);
  d += fbm(flow) * uTurbulence;
  return d;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;
  uv /= max(uZoom, 0.0001);

  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(uv, -1.5));

  float t = 0.0;
  bool hit = false;
  float minDist = 1e5;
  vec3 pos = ro;
  for (int i = 0; i < 128; i++) {
    if (i >= uSteps) break;
    pos = ro + rd * t;
    float d = map(pos);
    minDist = min(minDist, d);
    if (d < 0.001) { hit = true; break; }
    t += d * uStride;
    if (t > 10.0) break;
  }

  vec3 lightDir1 = normalize(vec3(0.6, 0.5, 0.6) + vec3(uPointer * uCursorLight, 0.0));
  vec3 lightDir2 = normalize(vec3(-0.6, -0.3, 0.4));

  vec3 color = vec3(0.0);
  float alpha = 0.0;

  if (hit) {
    vec3 n = calcNormal(pos);
    vec3 viewDir = normalize(ro - pos);

    float diff1 = max(dot(n, lightDir1), 0.0);
    float diff2 = max(dot(n, lightDir2), 0.0);

    vec3 base = uColorC * 0.3;
    base += uColorA * diff1 * 0.6;
    base += uColorB * diff2 * 0.6;

    float rim = pow(1.0 - max(dot(n, viewDir), 0.0), uRimPower) * uRimStrength;
    base += mix(uColorA, uColorB, 0.5) * rim;

    vec3 h1 = normalize(lightDir1 + viewDir);
    vec3 h2 = normalize(lightDir2 + viewDir);
    float spec1 = pow(max(dot(n, h1), 0.0), uSpecSharpness) * uSpecStrength;
    float spec2 = pow(max(dot(n, h2), 0.0), uSpecSharpness) * uSpecStrength;
    base += uSpecColorA * spec1 + uSpecColorB * spec2;

    color = base;
    alpha = 1.0;
  }

  float glow = exp(-max(minDist, 0.0) * uGlowFalloff) * uGlowStrength;
  vec3 glowColor = mix(uColorA, uColorB, 0.5) * glow;
  color += glowColor * (1.0 - alpha);
  alpha = max(alpha, glow);

  float distFromCenter = length(vUv - 0.5) * 2.0;
  float mask = 1.0 - smoothstep(uMaskRadius - uMaskFeather, uMaskRadius + uMaskFeather, distFromCenter);
  alpha *= mask;

  color = pow(max(color, 0.0), vec3(1.0 / uGamma)) * uBrightness;

  vec3 composited = mix(uBgColor.rgb, color, alpha);
  float outAlpha = mix(alpha, 1.0, uBgColor.a) * uOpacity;

  fragColor = vec4(composited, outAlpha);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const int = parseInt(full, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

/**
 * Ghostly raymarched orb wrapped in drifting smoke. Original WebGL2 shader
 * implementation (sphere SDF + fbm noise displacement) -- not a copy of any
 * paid/proprietary component, built to achieve an equivalent visual.
 */
export function GhostOrb({
  width = '100%',
  height = '100%',
  className = '',
  children,
  radius = 0.35,
  turbulence = 0.3,
  noiseScale = 1,
  flowSpeed = 0.3,
  octaves = 3,
  roughness = 0.5,
  lacunarity = 2,
  steps = 32,
  stride = 1,
  zoom = 1,
  maskRadius = 1,
  maskFeather = 0.02,
  colorA = '#4da6ff',
  colorB = '#9959ff',
  colorC = '#6680ff',
  rimStrength = 0.75,
  rimPower = 3,
  specularColorA = '#669fff',
  specularColorB = '#998fff',
  specularStrength = 1,
  specularSharpness = 12,
  glowStrength = 1,
  glowFalloff = 32,
  gamma = 1.25,
  brightness = 1,
  opacity = 1,
  backgroundColor = '#0a0a0a',
  cursorInteraction = true,
  cursorLight = 0.35,
  adaptiveQuality = true,
  targetFps = 60,
  dpr = 2,
  paused = false,
}: GhostOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, target: { x: 0, y: 0 } });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Below the `lg` breakpoint the caller hides the canvas with `hidden lg:block`.
    // Context creation is cheap and left unconditional, but the render loop below
    // checks this on every frame and skips drawing (without tearing anything down)
    // so a resize back above the breakpoint resumes automatically -- a one-time
    // check at mount would wrongly stay skipped forever after such a resize.
    const desktopMql = window.matchMedia('(min-width: 1024px)');

    // preserveDrawingBuffer: without it, some engines are free to clear the
    // backbuffer right after compositing a frame -- fine for the live page
    // (the loop redraws every rAF before the next paint), but it means any
    // read/capture that lands between "present" and "next draw" (a headless
    // screenshot tool, readPixels from outside the loop) can catch a blank
    // buffer. Reproduced against this project's dev server.
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) return; // graceful no-op if WebGL2 isn't available

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('GhostOrb: program link error', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      resolution: u('uResolution'),
      time: u('uTime'),
      radius: u('uRadius'),
      turbulence: u('uTurbulence'),
      noiseScale: u('uNoiseScale'),
      flowSpeed: u('uFlowSpeed'),
      octaves: u('uOctaves'),
      roughness: u('uRoughness'),
      lacunarity: u('uLacunarity'),
      steps: u('uSteps'),
      stride: u('uStride'),
      zoom: u('uZoom'),
      maskRadius: u('uMaskRadius'),
      maskFeather: u('uMaskFeather'),
      colorA: u('uColorA'),
      colorB: u('uColorB'),
      colorC: u('uColorC'),
      rimStrength: u('uRimStrength'),
      rimPower: u('uRimPower'),
      specA: u('uSpecColorA'),
      specB: u('uSpecColorB'),
      specStrength: u('uSpecStrength'),
      specSharpness: u('uSpecSharpness'),
      glowStrength: u('uGlowStrength'),
      glowFalloff: u('uGlowFalloff'),
      gamma: u('uGamma'),
      brightness: u('uBrightness'),
      opacity: u('uOpacity'),
      bgColor: u('uBgColor'),
      pointer: u('uPointer'),
      cursorLight: u('uCursorLight'),
    };

    const [ca0, ca1, ca2] = hexToRgb(colorA);
    const [cb0, cb1, cb2] = hexToRgb(colorB);
    const [cc0, cc1, cc2] = hexToRgb(colorC);
    const [sa0, sa1, sa2] = hexToRgb(specularColorA);
    const [sb0, sb1, sb2] = hexToRgb(specularColorB);
    const isTransparentBg = backgroundColor === 'transparent';
    const [bg0, bg1, bg2] = isTransparentBg ? [0, 0, 0] : hexToRgb(backgroundColor);

    gl.uniform1f(uniforms.radius, radius);
    gl.uniform1f(uniforms.turbulence, turbulence);
    gl.uniform1f(uniforms.noiseScale, noiseScale);
    gl.uniform1f(uniforms.flowSpeed, flowSpeed);
    gl.uniform1i(uniforms.octaves, octaves);
    gl.uniform1f(uniforms.roughness, roughness);
    gl.uniform1f(uniforms.lacunarity, lacunarity);
    gl.uniform1i(uniforms.steps, steps);
    gl.uniform1f(uniforms.stride, stride);
    gl.uniform1f(uniforms.zoom, zoom);
    gl.uniform1f(uniforms.maskRadius, maskRadius);
    gl.uniform1f(uniforms.maskFeather, maskFeather);
    gl.uniform3f(uniforms.colorA, ca0, ca1, ca2);
    gl.uniform3f(uniforms.colorB, cb0, cb1, cb2);
    gl.uniform3f(uniforms.colorC, cc0, cc1, cc2);
    gl.uniform1f(uniforms.rimStrength, rimStrength);
    gl.uniform1f(uniforms.rimPower, rimPower);
    gl.uniform3f(uniforms.specA, sa0, sa1, sa2);
    gl.uniform3f(uniforms.specB, sb0, sb1, sb2);
    gl.uniform1f(uniforms.specStrength, specularStrength);
    gl.uniform1f(uniforms.specSharpness, specularSharpness);
    gl.uniform1f(uniforms.glowStrength, glowStrength);
    gl.uniform1f(uniforms.glowFalloff, glowFalloff);
    gl.uniform1f(uniforms.gamma, gamma);
    gl.uniform1f(uniforms.brightness, brightness);
    gl.uniform1f(uniforms.opacity, opacity);
    gl.uniform4f(uniforms.bgColor, bg0, bg1, bg2, isTransparentBg ? 0 : 1);
    gl.uniform1f(uniforms.cursorLight, cursorLight);

    const maxDpr = Math.min(dpr, window.devicePixelRatio || 1);
    let qualityScale = 1;
    let lastFrameTime = performance.now();
    let fpsAccum = 0;
    let fpsSamples = 0;
    let lastQualityCheck = performance.now();

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * maxDpr * qualityScale));
      const h = Math.max(1, Math.round(rect.height * maxDpr * qualityScale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function onPointerMove(e: PointerEvent) {
      if (!cursorInteraction || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.target.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }
    if (cursorInteraction) window.addEventListener('pointermove', onPointerMove);

    let raf = 0;
    let startTime = performance.now();
    let elapsed = 0;

    function frame(now: number) {
      const dt = now - lastFrameTime;
      lastFrameTime = now;

      if (!desktopMql.matches) {
        raf = requestAnimationFrame(frame);
        return;
      }

      if (!pausedRef.current && !reduceMotion) {
        elapsed += dt / 1000;
      }

      if (adaptiveQuality) {
        fpsAccum += 1000 / Math.max(dt, 1);
        fpsSamples += 1;
        if (now - lastQualityCheck > 800) {
          const avgFps = fpsAccum / Math.max(fpsSamples, 1);
          if (avgFps < targetFps * 0.85 && qualityScale > 0.5) {
            qualityScale = Math.max(0.5, qualityScale - 0.1);
            resize();
          } else if (avgFps > targetFps * 0.97 && qualityScale < 1) {
            qualityScale = Math.min(1, qualityScale + 0.05);
            resize();
          }
          fpsAccum = 0;
          fpsSamples = 0;
          lastQualityCheck = now;
        }
      }

      pointerRef.current.x += (pointerRef.current.target.x - pointerRef.current.x) * 0.08;
      pointerRef.current.y += (pointerRef.current.target.y - pointerRef.current.y) * 0.08;

      gl!.uniform2f(uniforms.resolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uniforms.time, elapsed);
      gl!.uniform2f(uniforms.pointer, pointerRef.current.x, pointerRef.current.y);

      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    void startTime;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (cursorInteraction) window.removeEventListener('pointermove', onPointerMove);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
    // Re-running this effect on every prop change would recompile shaders needlessly;
    // GhostOrb is a decorative background, not an interactive control surface.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}
