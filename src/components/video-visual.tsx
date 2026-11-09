"use client";

import { useEffect, useRef, useState } from "react";
import { buildOverlaySource, videoFilterStyle } from "../lib/video-config.mjs";
import { audioLevels, simulatedLevels } from "../lib/audio-levels.mjs";

export interface VideoEffect { name: string; file: string; blend: string; speed: number; filter: Record<string, number> }
export interface VideoEntry { id: string; title: string; start: number; effect: VideoEffect }

interface YouTubePlayer {
  loadVideoById(options: { videoId: string; startSeconds?: number }): void;
  playVideo(): void; pauseVideo(): void; mute(): void; unMute(): void; destroy(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
}
interface YouTubeEvent { target: YouTubePlayer; data?: number }
type YouTubeApi = { Player: new (element: HTMLElement, options: Record<string, unknown>) => YouTubePlayer };

const vertex = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";
const apiLoadTimeout = 15_000;
const playbackTimeout = 15_000;
let apiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  const host = window as Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      let settled = false;
      const finish = (api?: YouTubeApi) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (api?.Player) resolve(api);
        else { apiPromise = null; script.remove(); reject(new Error("YouTube unavailable")); }
      };
      const timer = window.setTimeout(() => finish(), apiLoadTimeout);
      const previousReady = host.onYouTubeIframeAPIReady;
      host.onYouTubeIframeAPIReady = () => {
        try { previousReady?.(); } finally { finish(host.YT); }
      };
      const script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]') || document.createElement("script");
      if (!script.isConnected) {
        script.src = "https://www.youtube.com/iframe_api";
        document.head.append(script);
      }
      script.addEventListener("error", () => finish(), { once: true });
    });
  }
  return apiPromise;
}

function youtubeErrorMessage(code?: number) {
  if (code === 100) return "This video is private or unavailable.";
  if (code === 101 || code === 150) return "The owner does not allow this video to play in embedded players.";
  if (code === 153) return "YouTube did not receive referrer identity for this site (error 153).";
  return "This video could not be played here.";
}

export default function VideoVisual({ video, paused, revision, muted, overlayEnabled }: { video: VideoEntry; paused: boolean; revision: number; muted: boolean; overlayEnabled: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const readyRef = useRef(false);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const timeline = useRef({ key: "", elapsed: 0 });
  const pausedRef = useRef(paused);
  const mutedRef = useRef(muted);
  const videoRef = useRef(video);
  const [source, setSource] = useState("");
  const [failed, setFailed] = useState("");
  const [playbackState, setPlaybackState] = useState<"loading" | "playing" | "paused" | "buffering" | "failed">("loading");
  const [playerAttempt, setPlayerAttempt] = useState(0);
  pausedRef.current = paused;
  mutedRef.current = muted;
  videoRef.current = video;

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(api => {
      if (cancelled || !hostRef.current) return;
      const initialVideo = videoRef.current;
      const target = document.createElement("iframe");
      target.title = `YouTube video: ${initialVideo.title}`;
      target.width = "100%";
      target.height = "100%";
      target.referrerPolicy = "strict-origin-when-cross-origin";
      target.allow = "autoplay; encrypted-media; picture-in-picture; web-share";
      target.allowFullscreen = true;
      const playerUrl = new URL(`/embed/${encodeURIComponent(initialVideo.id)}`, "https://www.youtube-nocookie.com");
      playerUrl.searchParams.set("enablejsapi", "1");
      playerUrl.searchParams.set("origin", window.location.origin);
      playerUrl.searchParams.set("autoplay", "1");
      playerUrl.searchParams.set("mute", mutedRef.current ? "1" : "0");
      playerUrl.searchParams.set("controls", "0");
      playerUrl.searchParams.set("disablekb", "1");
      playerUrl.searchParams.set("fs", "0");
      playerUrl.searchParams.set("rel", "0");
      playerUrl.searchParams.set("modestbranding", "1");
      playerUrl.searchParams.set("playsinline", "1");
      playerUrl.searchParams.set("iv_load_policy", "3");
      if (initialVideo.start > 0) playerUrl.searchParams.set("start", String(initialVideo.start));
      target.src = playerUrl.toString();
      hostRef.current.replaceChildren(target);
      playerRef.current = new api.Player(target, {
        events: {
          onReady: (event: YouTubeEvent) => {
            if (cancelled) return;
            if (mutedRef.current) event.target.mute(); else event.target.unMute();
            readyRef.current = true;
            if (videoRef.current.id !== initialVideo.id || videoRef.current.start !== initialVideo.start) {
              event.target.loadVideoById({ videoId: videoRef.current.id, startSeconds: videoRef.current.start });
            }
            if (pausedRef.current) { setPlaybackState("paused"); event.target.pauseVideo(); }
            else setPlaybackState("loading");
          },
          onStateChange: (event: YouTubeEvent) => {
            if (cancelled) return;
            if (event.data === 1) { setPlaybackState("playing"); setFailed(""); }
            else if (event.data === 2) {
              if (pausedRef.current) setPlaybackState("paused");
              else {
                setPlaybackState("failed");
                setFailed("YouTube paused before playback started. Select Retry to start the video.");
              }
            }
            else if (event.data === 3) setPlaybackState("buffering");
            if (event.data === 0) { event.target.seekTo(videoRef.current.start, true); event.target.playVideo(); }
          },
          onAutoplayBlocked: () => {
            if (cancelled) return;
            setPlaybackState("failed");
            setFailed("Your browser blocked automatic playback. Select Retry to start the video.");
          },
          onError: (event: YouTubeEvent) => {
            if (cancelled) return;
            setPlaybackState("failed");
            setFailed(youtubeErrorMessage(event.data));
          },
        },
      });
    }).catch(() => {
      if (cancelled) return;
      setPlaybackState("failed");
      setFailed("YouTube could not be reached. Check the connection and retry.");
    });
    return () => { cancelled = true; readyRef.current = false; playerRef.current?.destroy(); playerRef.current = null; };
  }, [playerAttempt]);

  useEffect(() => {
    if (playbackState !== "loading" && playbackState !== "buffering") return;
    const timer = window.setTimeout(() => {
      setPlaybackState("failed");
      setFailed("YouTube is taking too long to start this video. Check the connection or open it on YouTube.");
    }, playbackTimeout);
    return () => window.clearTimeout(timer);
  }, [playbackState, video.id, playerAttempt]);

  useEffect(() => {
    setFailed("");
    setPlaybackState("loading");
    const player = playerRef.current;
    if (!readyRef.current || !player) return;
    player.loadVideoById({ videoId: video.id, startSeconds: video.start });
    if (mutedRef.current) player.mute(); else player.unMute();
    if (pausedRef.current) { player.pauseVideo(); setPlaybackState("paused"); }
  }, [video.id, video.start]);

  useEffect(() => {
    const player = playerRef.current;
    if (!readyRef.current || !player) return;
    if (muted) player.mute(); else player.unMute();
  }, [muted]);

  useEffect(() => {
    const player = playerRef.current;
    if (!readyRef.current || !player) return;
    if (paused) { player.pauseVideo(); setPlaybackState("paused"); }
    else { setPlaybackState("loading"); if (mutedRef.current) player.mute(); else player.unMute(); player.playVideo(); }
  }, [paused]);

  const firstRevision = useRef(revision);
  useEffect(() => {
    const player = playerRef.current;
    if (revision === firstRevision.current || !readyRef.current || !player) return;
    setPlaybackState("loading");
    player.seekTo(videoRef.current.start, true);
    player.playVideo();
  }, [revision]);

  const retryPlayback = () => {
    setFailed("");
    setPlaybackState("loading");
    const player = playerRef.current;
    if (readyRef.current && player) {
      if (mutedRef.current) player.mute(); else player.unMute();
      player.loadVideoById({ videoId: video.id, startSeconds: video.start });
      player.playVideo();
    } else setPlayerAttempt(value => value + 1);
  };

  useEffect(() => {
    if (!overlayEnabled) { setSource(""); return; }
    setSource("");
    const controller = new AbortController();
    fetch(video.effect.file, { signal: controller.signal, cache: "no-cache" }).then(async response => {
      if (!response.ok) throw new Error("missing");
      setSource(await response.text());
    }).catch(() => {});
    return () => controller.abort();
  }, [overlayEnabled, video.effect.file]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (!overlayEnabled) { frame.style.filter = ""; frame.style.transform = ""; return; }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let handle = 0;
    const apply = (timestamp: number) => {
      if (pausedRef.current) { handle = requestAnimationFrame(apply); return; }
      const levels = reduced.matches ? { bass: 0, mid: 0, treble: 0, level: 0 } : audioLevels.live ? audioLevels : audioLevels.playing ? simulatedLevels(timestamp / 1000) : { bass: 0, mid: 0, treble: 0, level: 0 };
      const style = videoFilterStyle(levels, video.effect.filter);
      frame.style.filter = style.filter;
      frame.style.transform = style.transform;
      handle = requestAnimationFrame(apply);
    };
    handle = requestAnimationFrame(apply);
    return () => { cancelAnimationFrame(handle); frame.style.filter = ""; frame.style.transform = ""; };
  }, [overlayEnabled, video.effect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!overlayEnabled || !canvas || !source) return;
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
      const levels = reduced.matches ? null : audioLevels.live ? audioLevels : audioLevels.playing ? simulatedLevels(timestamp / 1000) : null;
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
  }, [overlayEnabled, source, revision, video.effect.speed, video.effect.file]);

  return <div className="video-stage" aria-busy={playbackState === "loading" || playbackState === "buffering"} data-playback-state={playbackState}>
    <div className="video-frame" ref={frameRef}><div ref={hostRef} className="video-host" /></div>
    {overlayEnabled && <canvas ref={canvasRef} className="video-overlay" style={{ mixBlendMode: video.effect.blend as React.CSSProperties["mixBlendMode"] }} width={960} height={340} aria-label={`Video visual: ${video.title} with ${video.effect.name}`} onPointerMove={event => {
      const bounds = event.currentTarget.getBoundingClientRect();
      pointer.current = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    }} />}
    {failed && <div className="video-message" role="status"><span>{failed}</span><button type="button" aria-label="Retry video" onClick={retryPlayback}>Retry</button><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">Open on YouTube</a></div>}
  </div>;
}
