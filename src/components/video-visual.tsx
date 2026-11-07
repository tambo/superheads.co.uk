"use client";

import { useEffect, useRef, useState } from "react";
import { buildOverlaySource, videoFilterStyle } from "../lib/video-config.mjs";
import { audioLevels, simulatedLevels } from "../lib/audio-levels.mjs";

export interface VideoEffect { name: string; file: string; blend: string; speed: number; filter: Record<string, number> }
export interface VideoEntry { id: string; title: string; start: number; effect: VideoEffect }

interface YouTubePlayer {
  loadVideoById(options: { videoId: string; startSeconds?: number }): void;
  playVideo(): void; pauseVideo(): void; mute(): void; destroy(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
}
interface YouTubeEvent { target: YouTubePlayer; data: number }
type YouTubeApi = { Player: new (element: HTMLElement, options: Record<string, unknown>) => YouTubePlayer };

const vertex = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";
let apiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  const host = window as Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
  if (host.YT?.Player) return Promise.resolve(host.YT);
  apiPromise ??= new Promise((resolve, reject) => {
    host.onYouTubeIframeAPIReady = () => resolve(host.YT!);
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => { apiPromise = null; reject(new Error("YouTube unavailable")); };
    document.head.append(script);
  });
  return apiPromise;
}

export default function VideoVisual({ video, paused, revision }: { video: VideoEntry; paused: boolean; revision: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const readyRef = useRef(false);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const timeline = useRef({ key: "", elapsed: 0 });
  const pausedRef = useRef(paused);
  const videoRef = useRef(video);
  const [source, setSource] = useState("");
  const [failed, setFailed] = useState("");
  pausedRef.current = paused;
  videoRef.current = video;

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(api => {
      if (cancelled || !hostRef.current) return;
      const target = document.createElement("div");
      hostRef.current.replaceChildren(target);
      playerRef.current = new api.Player(target, {
        host: "https://www.youtube-nocookie.com",
        videoId: videoRef.current.id,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, mute: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, start: videoRef.current.start, origin: window.location.origin },
        events: {
          onReady: (event: YouTubeEvent) => {
            event.target.mute();
            readyRef.current = true;
            if (pausedRef.current) event.target.pauseVideo(); else event.target.playVideo();
          },
          onStateChange: (event: YouTubeEvent) => {
            if (event.data === 0) { event.target.seekTo(videoRef.current.start, true); event.target.playVideo(); }
          },
          onError: () => setFailed("This video cannot be played here. It may block embedding or be unavailable."),
        },
      });
    }).catch(() => setFailed("YouTube could not be reached."));
    return () => { cancelled = true; readyRef.current = false; playerRef.current?.destroy(); playerRef.current = null; };
  }, []);

  useEffect(() => {
    setFailed("");
    const player = playerRef.current;
    if (!readyRef.current || !player) return;
    player.loadVideoById({ videoId: video.id, startSeconds: video.start });
    player.mute();
    if (pausedRef.current) player.pauseVideo();
  }, [video.id, video.start]);

  useEffect(() => {
    const player = playerRef.current;
    if (!readyRef.current || !player) return;
    if (paused) player.pauseVideo(); else player.playVideo();
  }, [paused]);

  const firstRevision = useRef(revision);
  useEffect(() => {
    const player = playerRef.current;
    if (revision === firstRevision.current || !readyRef.current || !player) return;
    player.seekTo(videoRef.current.start, true);
    player.playVideo();
  }, [revision]);

  useEffect(() => {
    setSource("");
    const controller = new AbortController();
    fetch(video.effect.file, { signal: controller.signal, cache: "no-cache" }).then(async response => {
      if (!response.ok) throw new Error("missing");
      setSource(await response.text());
    }).catch(() => {});
    return () => controller.abort();
  }, [video.effect.file]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let handle = 0;
    const apply = (timestamp: number) => {
      const levels = reduced.matches ? { bass: 0, mid: 0, treble: 0, level: 0 } : audioLevels.live ? audioLevels : audioLevels.playing ? simulatedLevels(timestamp / 1000) : { bass: 0, mid: 0, treble: 0, level: 0 };
      const style = videoFilterStyle(levels, video.effect.filter);
      frame.style.filter = style.filter;
      frame.style.transform = style.transform;
      handle = requestAnimationFrame(apply);
    };
    handle = requestAnimationFrame(apply);
    return () => { cancelAnimationFrame(handle); frame.style.filter = ""; frame.style.transform = ""; };
  }, [video.effect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true });
    if (!gl) return;
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
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, buildOverlaySource(source)));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Shader link failed");
    } catch { return; }
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
    const key = `${video.effect.file}:${revision}`;
    if (timeline.current.key !== key) timeline.current = { key, elapsed: 0 };
    let handle = 0;
    let previous = 0;
    const draw = (timestamp: number) => {
      if (!pausedRef.current && !reduced.matches) timeline.current.elapsed += previous ? Math.min(timestamp - previous, 50) / 1000 * video.effect.speed : 0;
      previous = timestamp;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform3f(resolution, canvas.width, canvas.height, 1);
      gl.uniform1f(time, timeline.current.elapsed);
      gl.uniform4f(mouse, pointer.current.x * canvas.width, (1 - pointer.current.y) * canvas.height, 0, 0);
      const levels = audioLevels.live ? audioLevels : audioLevels.playing ? simulatedLevels(timestamp / 1000) : null;
      gl.uniform4f(audio, levels?.bass ?? 0, levels?.mid ?? 0, levels?.treble ?? 0, levels?.level ?? 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      handle = requestAnimationFrame(draw);
    };
    handle = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(handle);
      resizer?.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [source, revision, video.effect.speed, video.effect.file]);

  return <div className="video-stage">
    <div className="video-frame" ref={frameRef}><div ref={hostRef} className="video-host" /></div>
    <canvas ref={canvasRef} className="video-overlay" style={{ mixBlendMode: video.effect.blend as React.CSSProperties["mixBlendMode"] }} width={960} height={340} aria-label={`Video visual: ${video.title} with ${video.effect.name}`} onPointerMove={event => {
      const bounds = event.currentTarget.getBoundingClientRect();
      pointer.current = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    }} />
    {failed && <p className="video-message" role="status">{failed} <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">Open on YouTube</a></p>}
  </div>;
}
