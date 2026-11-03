"use client";

import { useEffect, useRef, useState } from "react";
import { buildFragmentSource } from "../lib/shader-config.mjs";

export interface ShaderEntry { title: string; speed: number; file?: string; source?: string }

const vertex = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";

export default function ShaderVisual({ shader, paused, revision }: { shader: ShaderEntry; paused: boolean; revision: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const timeline = useRef({ key: "", elapsed: 0 });
  const pausedRef = useRef(paused);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  pausedRef.current = paused;

  useEffect(() => {
    setSource("");
    setError("");
    if (shader.source) { setSource(shader.source); return; }
    const controller = new AbortController();
    fetch(shader.file!, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("missing");
      setSource(await response.text());
    }).catch(() => { if (!controller.signal.aborted) setError("Shader file unavailable."); });
    return () => controller.abort();
  }, [shader.file, shader.source]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;
    const gl = canvas.getContext("webgl");
    if (!gl) { setError("WebGL is not available in this browser."); return; }
    const compile = (type: number, code: string) => {
      const object = gl.createShader(type)!;
      gl.shaderSource(object, code);
      gl.compileShader(object);
      if (!gl.getShaderParameter(object, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(object) || "Shader compile failed");
      return object;
    };
    const program = gl.createProgram()!;
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, buildFragmentSource(source)));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Shader link failed");
    } catch (failure) {
      setError(`Shader error: ${(failure as Error).message.split("\n")[0]}`);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "iResolution");
    const time = gl.getUniformLocation(program, "iTime");
    const mouse = gl.getUniformLocation(program, "iMouse");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const key = `${shader.file || shader.source}:${revision}`;
    if (timeline.current.key !== key) timeline.current = { key, elapsed: 0 };
    let frame = 0;
    let previous = 0;
    const draw = (timestamp: number) => {
      if (!pausedRef.current && !reduced.matches) timeline.current.elapsed += previous ? Math.min(timestamp - previous, 50) / 1000 * shader.speed : 0;
      previous = timestamp;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform3f(resolution, canvas.width, canvas.height, 1);
      gl.uniform1f(time, timeline.current.elapsed);
      gl.uniform4f(mouse, pointer.current.x * canvas.width, (1 - pointer.current.y) * canvas.height, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [source, revision, shader.speed, shader.file]);

  return <>
    <canvas ref={canvasRef} width={960} height={340} aria-label={`Shader visual: ${shader.title}`} onPointerMove={event => {
      const bounds = event.currentTarget.getBoundingClientRect();
      pointer.current = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    }} />
    {error && <p className="shader-error" role="status">{error}</p>}
  </>;
}
