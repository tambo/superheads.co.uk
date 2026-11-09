"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { ArrowDownRight, Maximize, Minimize, Music2, Pause, Play, RotateCcw, Shuffle, Sparkles, Volume2 } from "lucide-react";
import { contexts, sections, initialState, consoleReducer, keyboardAction, padKeys, randomVisualStep } from "../lib/console-state.mjs";
import AudioPlayer, { type AudioTrack } from "./audio-player";
import AudioInputSelector from "./audio-input-selector";
import ShaderVisual, { type ShaderEntry } from "./shader-visual";
import VideoVisual, { type VideoEntry } from "./video-visual";
import { videoConfigUrl, parseVideoConfig } from "../lib/video-config.mjs";
import { audioLevels } from "../lib/audio-levels.mjs";
import { shaderConfigUrl, parseShaderConfig } from "../lib/shader-config.mjs";
import { artist, audioOrigin, audioCatalogueUrl, parseAudioCatalogue } from "../lib/audio-catalog.mjs";

const greetingMessage = "Greetings groovers ... welcome to the relaunch ... superheads still going after 25 years...";

function Visual({ slot, paused, revision }: { slot: number; paused: boolean; revision: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const timeline = useRef({ slot, revision, elapsed: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const drawing = canvas.getContext("2d");
    if (!drawing) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    if (timeline.current.slot !== slot || timeline.current.revision !== revision) timeline.current = { slot, revision, elapsed: 0 };
    let previous = 0;
    const draw = (timestamp: number) => {
      if (!paused && !reduced.matches) timeline.current.elapsed += previous ? Math.min(timestamp - previous, 50) / 1000 : 0;
      previous = timestamp;
      const width = canvas.width;
      const height = canvas.height;
      drawing.fillStyle = "#030505";
      drawing.fillRect(0, 0, width, height);
      const time = timeline.current.elapsed * 0.22 + revision * 0.7;
      if (slot % 3 === 0) {
        const cell = 9;
        for (let row = 0; row < height / cell; row++) {
          for (let column = 0; column < width / cell; column++) {
            const horizontal = (column * cell - width / 2) / height;
            const vertical = (row * cell - height / 2) / height;
            const wave = Math.sin(horizontal * 32 + time + pointer.current.x) * Math.cos(vertical * 28 - time) + Math.cos((Math.abs(horizontal) + Math.abs(vertical)) * 35 + time * 2);
            const light = Math.max(8, Math.min(94, 52 + wave * 24));
            drawing.fillStyle = `hsl(${slot > 2 ? 42 : 205} 18% ${light}%)`;
            drawing.fillRect(column * cell, row * cell, cell, cell);
          }
        }
      } else {
        drawing.save();
        drawing.translate(width * pointer.current.x, height * pointer.current.y);
        for (let index = 0; index < 50; index++) {
          drawing.rotate(slot % 3 === 1 ? 0.09 : 0.17);
          drawing.strokeStyle = index % 4 === 0 ? "#ffcc00" : index % 3 === 0 ? "#ff8a00" : "#819da9";
          drawing.lineWidth = 1.5;
          const size = 12 + index * 7 + Math.sin(time + index * 0.1) * 12;
          drawing.beginPath();
          if (slot % 3 === 1) drawing.rect(-size / 2, -size / 2, size, size);
          else drawing.ellipse(0, 0, size, size * 0.35, time, 0, Math.PI * 2);
          drawing.stroke();
        }
        drawing.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [slot, paused, revision]);

  return <canvas ref={canvasRef} width={960} height={340} aria-label="Interactive visual study" onPointerMove={event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
  }} />;
}

export default function Collection() {
  const [state, dispatch] = useReducer(consoleReducer, initialState);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [videoAudioSource, setVideoAudioSource] = useState<"video" | "jukebox">("video");
  const [videoShaderEnabled, setVideoShaderEnabled] = useState(false);
  const [audioInputActive, setAudioInputActive] = useState(false);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState("");
  const [catalogueAttempt, setCatalogueAttempt] = useState(0);
  const [shaders, setShaders] = useState<ShaderEntry[]>([]);
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const displayRef = useRef<HTMLDivElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const videoAudioButtonRef = useRef<HTMLButtonElement>(null);
  const videoOverlayButtonRef = useRef<HTMLButtonElement>(null);
  const context = contexts.find(item => item.id === state.context)!;
  const items = state.context === "music" ? state.musicTracks.map((track: AudioTrack) => track.title) : state.context === "lab" && shaders.length ? shaders.map(shader => shader.title) : state.context === "videos" ? videos.map(video => video.title) : context.items;
  const visualContext = state.context === "lab" || state.context === "videos";
  const visualCount = state.context === "videos" ? videos.length : shaders.length;
  const videoUsesJukebox = state.context === "videos" && videoAudioSource === "jukebox";
  const videoShaderActive = videoUsesJukebox && videoShaderEnabled;
  const suspendJukebox = state.context === "videos" && videoAudioSource === "video";
  const selected = items[state.slot] || (state.context === "music" ? "Tomaz Sounder" : context.label);
  const section = sections.find(item => item.context === state.context || item.submenu.includes(state.context))!;
  const renderPad = (slot: number) => <button key={slot} className={`pad pad-${slot}`} disabled={!items[slot]} aria-pressed={Boolean(items[slot]) && state.slot === slot} aria-keyshortcuts={padKeys[slot].toUpperCase()} aria-label={items[slot] ? `${slot + 1}, ${padKeys[slot].toUpperCase()}: ${items[slot]}` : `${slot + 1}, ${padKeys[slot].toUpperCase()}: empty`} title={`${slot + 1} / ${padKeys[slot].toUpperCase()}${items[slot] ? `: ${items[slot]}` : ""}`} onClick={() => dispatch({ type: "slot", slot })}><small>{slot + 1}</small><span>{padKeys[slot].toUpperCase()}</span></button>;

  useEffect(() => {
    const controller = new AbortController();
    setCatalogueLoading(true);
    setCatalogueError("");
    const origin = audioOrigin(window.location.hostname);
    fetch(audioCatalogueUrl(origin), { signal: controller.signal }).then(async response => {
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new Error("Catalogue unavailable");
      const tracks = parseAudioCatalogue(await response.json(), origin);
      if (!tracks.length) throw new Error("No audio tracks");
      dispatch({ type: "catalogue", tracks });
    }).catch(() => {
      if (!controller.signal.aborted) setCatalogueError("Track catalogue unavailable. Streaming access needs to allow this site.");
    }).finally(() => { if (!controller.signal.aborted) setCatalogueLoading(false); });
    return () => controller.abort();
  }, [catalogueAttempt]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(shaderConfigUrl, { signal: controller.signal, cache: "no-cache" }).then(async response => {
      if (!response.ok) throw new Error("Shader config unavailable");
      const parsed: ShaderEntry[] = parseShaderConfig(await response.json());
      if (!parsed.length) throw new Error("No shaders");
      setShaders(parsed);
      dispatch({ type: "lab-items", count: parsed.length });
    }).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(videoConfigUrl, { signal: controller.signal, cache: "no-cache" }).then(async response => {
      if (!response.ok) throw new Error("Video config unavailable");
      const parsed: VideoEntry[] = parseVideoConfig(await response.json()).videos;
      setVideos(parsed);
      dispatch({ type: "video-items", count: parsed.length });
    }).catch(() => {});
    return () => controller.abort();
  }, []);

  const wantsAudio = ((state.context === "lab" && Boolean(shaders[state.slot]?.playAudio)) || (videoUsesJukebox && videos.length > 0));
  useEffect(() => {
    if (!state.autoVisuals || state.paused || !visualContext || visualCount < 2) return;
    const next = randomVisualStep(state.slot, visualCount);
    const timer = window.setTimeout(() => dispatch({ type: "slot", slot: next.slot, automatic: true }), next.delay);
    return () => window.clearTimeout(timer);
  }, [state.autoVisuals, state.paused, state.context, state.slot, visualCount]);

  useEffect(() => {
    if (!state.automaticVisual && !audioInputActive && wantsAudio && state.musicTracks.length && !audioLevels.playing) dispatch({ type: "audio-track", slot: state.audioIndex });
  }, [wantsAudio, videoUsesJukebox, state.automaticVisual, state.manualVisualRevision, state.musicTracks.length]);

  useEffect(() => {
    const release = () => { if (!document.fullscreenElement) screen.orientation?.unlock?.(); };
    document.addEventListener("fullscreenchange", release);
    return () => document.removeEventListener("fullscreenchange", release);
  }, []);

  useEffect(() => {
    if (!pseudoFullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [pseudoFullscreen]);

  const enterFullscreen = async () => {
    if (pseudoFullscreen) { setPseudoFullscreen(false); return; }
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    const element = displayRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const fullscreenDocument = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
    if (fullscreenDocument.webkitFullscreenElement) { fullscreenDocument.webkitExitFullscreen?.(); return; }
    try {
      if (element?.requestFullscreen) await element.requestFullscreen({ navigationUI: "hide" });
      else if (element?.webkitRequestFullscreen) element.webkitRequestFullscreen();
      else { setPseudoFullscreen(true); return; }
      (screen.orientation as ScreenOrientation & { lock?: (orientation: string) => Promise<void> } | undefined)?.lock?.("landscape").catch(() => {});
    } catch { setPseudoFullscreen(true); }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && pseudoFullscreen) {
        event.preventDefault();
        setPseudoFullscreen(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || target?.closest("input, textarea, select, [contenteditable='true'], [role='textbox']")) return;
      if (event.key === " " && target?.closest("button, a")) return;
      const action = keyboardAction(event.key);
      if (!action || (action.type === "pause" && !visualContext)) return;
      if (action.type === "auto-visuals" && (!visualContext || visualCount < 2)) return;
      if ((action.type === "video-audio" || action.type === "video-overlay") && state.context !== "videos") return;
      event.preventDefault();
      if (action.type === "fullscreen") fullscreenButtonRef.current?.click();
      else if (action.type === "video-audio") videoAudioButtonRef.current?.click();
      else if (action.type === "video-overlay") videoOverlayButtonRef.current?.click();
      else dispatch(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.context, pseudoFullscreen, visualCount, visualContext]);

  return <main className="console">
    <a className="skip" href="#control-bank">Skip to content controls</a>
    <header className="identity">
      <div className="identity-copy">
      <h1><img src="/artwork/home/4.svg" alt="superheads" width="145" height="27" /></h1>
      <p>departing non-stop to all digital destinations</p>
      </div>
      <AudioPlayer tracks={state.musicTracks} index={state.audioIndex} revision={state.audioRevision} loading={catalogueLoading} error={catalogueError} suspended={suspendJukebox} onSelect={slot => dispatch({ type: "audio-track", slot })} onRetry={() => setCatalogueAttempt(value => value + 1)} />
    </header>
    <aside className="destination" aria-label="Gig-a-bites">
      <img className="map-arrow" src="/artwork/home/191.svg" width="69" height="69" alt="" aria-hidden="true" />
      <div className="ticker-header">
        <div className="greeting-ticker" role="marquee" aria-label={greetingMessage}>
          <div className="ticker-track" aria-hidden="true">
            <span>{greetingMessage}</span><span>{greetingMessage}</span>
          </div>
        </div>
      </div>
      <img src="/artwork/home/18.svg" width="299" height="143" alt="Original Superheads world map" />
      <span className="map-marker" />
    </aside>
    <section className="screen-section" id="main-display" aria-label="Main display">
      <div className={pseudoFullscreen ? "display pseudo-fullscreen" : "display"} ref={displayRef}>
        {pseudoFullscreen && <button className="exit-fullscreen" aria-label="Exit fullscreen" title="Exit fullscreen - Escape" onClick={() => setPseudoFullscreen(false)}><Minimize /></button>}
            {state.context === "videos" && videos.length ? <VideoVisual video={videos[state.slot] || videos[0]} paused={state.paused} revision={state.revision} muted={videoUsesJukebox} overlayEnabled={videoShaderActive} /> : state.context === "lab" && shaders.length ? <ShaderVisual shader={shaders[state.slot] || shaders[0]} paused={state.paused} revision={state.revision} crossfade={state.automaticVisual} /> : state.context === "lab" ? <Visual slot={state.slot} paused={state.paused} revision={state.revision} /> : <div className="display-copy">
          <span className="eyebrow">{context.label}</span>
          <h2>{selected}</h2>
          <p>{state.context === "music" ? artist.excerpt : state.context === "videos" ? "No videos are configured yet. Run the YouTube sync to fill this section." : section.id === "community" ? "The original community service has not been restored." : "Original collection entry. Legacy playback is not yet restored."}</p>
        </div>}
      </div>
      <div className="transport">
        <span aria-live="polite">{selected}{state.context === "lab" && <small>{shaders.length ? " / shader" : " / visual study"}</small>}{state.context === "videos" && videos.length > 0 && <small> / {videos[state.slot]?.effect.name}</small>}</span>
        <div>
          <button aria-label={state.paused ? "Play visual" : "Pause visual"} title="Play / pause - Space" disabled={!visualContext || (state.context === "videos" && !videos.length)} onClick={() => dispatch({ type: "pause" })}>{state.paused ? <Play /> : <Pause />}</button>
          <button aria-label="Restart visual" aria-keyshortcuts="Backspace" title="Restart - Backspace" disabled={!visualContext || (state.context === "videos" && !videos.length)} onClick={() => dispatch({ type: "reset" })}><RotateCcw /></button>
          <button ref={fullscreenButtonRef} aria-label="Fullscreen display" aria-keyshortcuts="[" title="Toggle fullscreen - [" onClick={enterFullscreen}><Maximize /></button>
          <button aria-label="Auto-play visuals" aria-keyshortcuts="]" aria-pressed={state.autoVisuals} title="Auto-play visuals - ] - random change every 5-10 seconds" disabled={!visualContext || visualCount < 2} onClick={() => dispatch({ type: "auto-visuals" })}><Shuffle /></button>
          {state.context === "lab" && <AudioInputSelector onActiveChange={setAudioInputActive} />}
          {state.context === "videos" && videos.length > 0 && <>
            <button ref={videoAudioButtonRef} aria-label={videoAudioSource === "video" ? "Audio source: video" : "Audio source: Jukebox"} aria-keyshortcuts={"'"} aria-pressed={videoUsesJukebox} title={`Audio source: ${videoAudioSource} - toggle with '`} onClick={() => {
              const nextSource = videoAudioSource === "video" ? "jukebox" : "video";
              setVideoAudioSource(nextSource);
              if (nextSource === "jukebox") dispatch({ type: "manual-audio-source" });
              if (nextSource === "video") setVideoShaderEnabled(false);
            }}>{videoUsesJukebox ? <Music2 /> : <Volume2 />}</button>
            <button ref={videoOverlayButtonRef} aria-label="Shader overlay" aria-keyshortcuts={"\\"} aria-pressed={videoShaderActive} title={videoUsesJukebox ? "Toggle shader overlay - \\" : "Shader overlay - \\ - select Jukebox audio to enable"} disabled={!videoUsesJukebox} onClick={() => setVideoShaderEnabled(value => !value)}><Sparkles /></button>
          </>}
        </div>
      </div>
    </section>
    <aside className="navigation">
      <nav className="section-tiles" aria-label="Main sections">
        {sections.map(item => <button key={item.id} aria-pressed={section.id === item.id} onClick={() => dispatch({ type: "section", section: item.id })}>{item.label.toUpperCase()}</button>)}
      </nav>
      <p className="context-description">{context.description}</p>
      <nav className="context-tiles" aria-label="Context Navigation">
        {section.submenu.map(identifier => {
          const item = contexts.find(context => context.id === identifier)!;
          return <button key={item.id} aria-pressed={state.context === item.id} onClick={() => dispatch({ type: "context", context: item.id })}><ArrowDownRight aria-hidden="true" /><span>{item.id === "lab" ? "LAB" : item.label.toUpperCase()}</span></button>;
        })}
      </nav>
    </aside>
      <section className="control-section" id="control-bank" aria-label="Content controls">
      <div className="bank-heading"><h2>{context.label.toUpperCase()}</h2><span>{selected.toUpperCase()}</span></div>
      <div className={visualContext ? "pad-bank lab-keyboard" : "pad-bank"} aria-label="Keyboard content pads">
        <div className="pad-row pad-row-top">{Array.from({ length: 10 }, (_, slot) => renderPad(slot))}</div>
        <div className="pad-row pad-row-bottom">{Array.from({ length: visualContext ? 9 : 7 }, (_, index) => renderPad(index + 10))}</div>
        {visualContext && <div className="pad-row pad-row-third">{Array.from({ length: 7 }, (_, index) => renderPad(index + 19))}</div>}
      </div>
      <p className="album">{state.context === "music" ? "artist:" : "from the album:"}<br /><em>{state.context === "music" ? artist.title : "a senseless act of beauty"}</em></p>
    </section>
  </main>;
}