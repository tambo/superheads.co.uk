"use client";

import { useEffect, useRef, useState } from "react";
import { buildFragmentSource } from "../lib/shader-config.mjs";
import { audioLevels, simulatedLevels } from "../lib/audio-levels.mjs";

export interface ShaderEntry { title: string; speed: number; playAudio?: boolean; file?: string; source?: string }

const vertex = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";

export default function ShaderVisual({ shader, paused, revision, crossfade = false }: { shader: ShaderEntry; paused: boolean; revision: number; crossfade?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outgoingRef = useRef<HTMLImageElement>(null);
  const fadeRef = useRef<Animation | null>(null);
  const hasFrame = useRef(false);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const timeline = useRef({ key: "", elapsed: 0 });
  const pausedRef = useRef(paused);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  pausedRef.current = paused;

  useEffect(() => {
    if (crossfade) return;
    fadeRef.current?.cancel();
    if (outgoingRef.current) outgoingRef.current.hidden = true;
  }, [crossfade]);

  useEffect(() => {
    const outgoing = outgoingRef.current;
    fadeRef.current?.cancel();
    if (outgoing) {
      outgoing.hidden = true;
      if (crossfade && hasFrame.current && canvasRef.current && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        outgoing.src = canvasRef.current.toDataURL();
        outgoing.hidden = false;
      }
    }
    setSource("");
    setError("");
    if (shader.source) { setSource(shader.source); return; }
    const controller = new AbortController();
    fetch(shader.file!, { signal: controller.signal, cache: "no-cache" }).then(async response => {
      if (!response.ok) throw new Error("missing");
      setSource(await response.text());
    }).catch(() => { if (!controller.signal.aborted) setError("Shader file unavailable."); });
    return () => controller.abort();
  }, [shader.file, shader.source]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
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
    const audio = gl.getUniformLocation(program, "iAudio");
    // Render at the displayed size so fullscreen fills the screen sharply, within a pixel budget.
    const fit = () => {
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      let width = Math.max(2, Math.round(bounds.width * scale));
      let height = Math.max(2, Math.round(bounds.height * scale));
      const shrink = Math.min(1, Math.sqrt(1600000 / (width * height)));
      width = Math.round(width * shrink);
      height = Math.round(height * shrink);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    };
    fit();
    const resizer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    resizer?.observe(canvas);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const key = `${shader.file || shader.source}:${revision}`;
    if (timeline.current.key !== key) timeline.current = { key, elapsed: 0 };
    let frame = 0;
    let previous = 0;
    let firstFrame = true;
    const draw = (timestamp: number) => {
      if (!pausedRef.current && !reduced.matches) timeline.current.elapsed += previous ? Math.min(timestamp - previous, 50) / 1000 * shader.speed : 0;
      previous = timestamp;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform3f(resolution, canvas.width, canvas.height, 1);
      gl.uniform1f(time, timeline.current.elapsed);
      gl.uniform4f(mouse, pointer.current.x * canvas.width, (1 - pointer.current.y) * canvas.height, 0, 0);
      const levels = audioLevels.live ? audioLevels : audioLevels.playing ? simulatedLevels(timestamp / 1000) : null;
      gl.uniform4f(audio, levels?.bass ?? 0, levels?.mid ?? 0, levels?.treble ?? 0, levels?.level ?? 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      hasFrame.current = true;
      if (firstFrame) {
        firstFrame = false;
        const outgoing = outgoingRef.current;
        if (outgoing && !outgoing.hidden) {
          const fade = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced.matches ? 0 : 1200, easing: "ease-in-out", fill: "forwards" });
          fadeRef.current = fade;
          fade.onfinish = () => { outgoing.hidden = true; };
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      resizer?.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [source, revision, shader.speed]);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const stopFade = () => {
      if (!reduced.matches) return;
      fadeRef.current?.cancel();
      if (outgoingRef.current) outgoingRef.current.hidden = true;
    };
    reduced.addEventListener("change", stopFade);
    return () => { reduced.removeEventListener("change", stopFade); fadeRef.current?.cancel(); };
  }, []);

  return <div className="shader-stage">
    <canvas ref={canvasRef} width={960} height={340} aria-label={`Shader visual: ${shader.title}`} onPointerMove={event => {
      const bounds = event.currentTarget.getBoundingClientRect();
      pointer.current = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    }} />
    <img ref={outgoingRef} className="shader-outgoing" alt="" aria-hidden="true" hidden />
    {error && <p className="shader-error" role="status">{error}</p>}
  </div>;
}
