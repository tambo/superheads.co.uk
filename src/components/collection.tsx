"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { ArrowDownRight, Maximize, Minimize, Pause, Play, RotateCcw } from "lucide-react";
import { contexts, sections, initialState, consoleReducer, keyboardAction, padKeys } from "../lib/console-state.mjs";
import AudioPlayer, { type AudioTrack } from "./audio-player";
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
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState("");
  const [catalogueAttempt, setCatalogueAttempt] = useState(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const context = contexts.find(item => item.id === state.context)!;
  const items = state.context === "music" ? state.musicTracks.map((track: AudioTrack) => track.title) : context.items;
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
    if (!pseudoFullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [pseudoFullscreen]);

  const enterFullscreen = async () => {
    const element = displayRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    try {
      if (element?.requestFullscreen) await element.requestFullscreen();
      else if (element?.webkitRequestFullscreen) element.webkitRequestFullscreen();
      else setPseudoFullscreen(true);
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
      if (!action || (action.type === "pause" && state.context !== "lab")) return;
      event.preventDefault();
      dispatch(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.context, pseudoFullscreen]);

  const changeContext = (identifier: string) => {
    dispatch({ type: "context", context: identifier });
  };

  return <main className="console">
    <a className="skip" href="#control-bank">Skip to content controls</a>
    <header className="identity">
      <div className="identity-copy">
      <h1><img src="/artwork/home/4.svg" alt="superheads" width="145" height="27" /></h1>
      <p>departing non-stop to all digital destinations</p>
      </div>
      <AudioPlayer tracks={state.musicTracks} index={state.audioIndex} revision={state.audioRevision} loading={catalogueLoading} error={catalogueError} onSelect={slot => dispatch({ type: "audio-track", slot })} onRetry={() => setCatalogueAttempt(value => value + 1)} />
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
    <section className="screen-section" aria-label="Main display">
      <div className={pseudoFullscreen ? "display pseudo-fullscreen" : "display"} ref={displayRef}>
        {pseudoFullscreen && <button className="exit-fullscreen" aria-label="Exit fullscreen" title="Exit fullscreen (Escape)" onClick={() => setPseudoFullscreen(false)}><Minimize /></button>}
        {state.context === "lab" ? <Visual slot={state.slot} paused={state.paused} revision={state.revision} /> : <div className="display-copy">
          <span className="eyebrow">{context.label}</span>
          <h2>{selected}</h2>
          <p>{state.context === "music" ? artist.excerpt : section.id === "community" ? "The original community service has not been restored." : "Original collection entry. Legacy playback is not yet restored."}</p>
        </div>}
      </div>
      <div className="transport">
        <span aria-live="polite">{selected}{state.context === "lab" && <small> / visual study</small>}</span>
        <div>
          <button aria-label={state.paused ? "Play visual" : "Pause visual"} title="Play / pause (Space)" disabled={state.context !== "lab"} onClick={() => dispatch({ type: "pause" })}>{state.paused ? <Play /> : <Pause />}</button>
          <button aria-label="Restart visual" aria-keyshortcuts="Backspace" title="Restart (Backspace)" disabled={state.context !== "lab"} onClick={() => dispatch({ type: "reset" })}><RotateCcw /></button>
          <button aria-label="Fullscreen display" title="Fullscreen display" onClick={enterFullscreen}><Maximize /></button>
        </div>
      </div>
    </section>
    <aside className="navigation">
      <nav className="section-tiles" aria-label="Main sections">
        {sections.map(item => <button key={item.id} aria-pressed={section.id === item.id} onClick={() => dispatch({ type: "section", section: item.id })}>{item.label.toUpperCase()}</button>)}
      </nav>
      <p className="context-description">{context.description}</p>
      <nav className="context-tiles" aria-label="Content contexts">
        {section.submenu.map(identifier => {
          const item = contexts.find(context => context.id === identifier)!;
          return <button key={item.id} aria-pressed={state.context === item.id} onClick={() => changeContext(item.id)}><ArrowDownRight aria-hidden="true" /><span>{item.id === "lab" ? "LAB" : item.label.toUpperCase()}</span></button>;
        })}
      </nav>
    </aside>
    <section className="control-section" id="control-bank" aria-label="Content controls">
      <div className="bank-heading"><h2>{context.label.toUpperCase()}</h2><span>{selected.toUpperCase()}</span></div>
      <div className="pad-bank" aria-label="Keyboard content pads">
        <div className="pad-row pad-row-top">{Array.from({ length: 10 }, (_, slot) => renderPad(slot))}</div>
        <div className="pad-row pad-row-bottom">{Array.from({ length: 7 }, (_, index) => renderPad(index + 10))}</div>
      </div>
      <p className="album">{state.context === "music" ? "artist:" : "from the album:"}<br /><em>{state.context === "music" ? artist.title : "a senseless act of beauty"}</em></p>
    </section>
  </main>;
}