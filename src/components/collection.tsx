"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Maximize, Pause, Play, RotateCcw } from "lucide-react";
import { contexts, initialState, consoleReducer, keyboardAction, padKeys } from "../lib/console-state.mjs";

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
  const [fullscreenError, setFullscreenError] = useState("");
  const displayRef = useRef<HTMLDivElement>(null);
  const context = contexts.find(item => item.id === state.context)!;
  const selected = context.items[state.slot];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
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
  }, [state.context]);

  const changeContext = (identifier: string) => {
    dispatch({ type: "context", context: identifier });
  };

  return <main className="console">
    <a className="skip" href="#control-bank">Skip to content controls</a>
    <header className="identity">
      <h1><img src="/artwork/home/4.svg" alt="superheads" width="145" height="27" /></h1>
      <p>departing non-stop to all digital destinations</p>
    </header>
    <aside className="destination" aria-label="Gig-a-bites">
      <strong>GIG-A-BITES</strong><ArrowUpRight aria-hidden="true" />
      <img src="/artwork/home/18.svg" width="299" height="143" alt="Original Superheads world map" />
      <span className="map-marker" />
    </aside>
    <section className="screen-section" aria-label="Main display">
      <div className="display" ref={displayRef}>
        {state.context === "lab" ? <Visual slot={state.slot} paused={state.paused} revision={state.revision} /> : <div className="display-copy">
          <span className="eyebrow">{context.label}</span>
          <h2>{selected}</h2>
          <p>{state.context === "tools" ? "The original tools included favourites, an address book and chat. These services have not been restored." : state.context === "tv" ? "Superheads TV was an original channel concept. No stream is available in this restoration." : state.context === "info" ? selected === "Contact" ? "Original contact: info@superheads.co.uk. Current availability is unverified." : "An interface restoration of the original Superheads digital playground. Legacy media migration remains pending." : state.context === "portfolio" ? "A historical project listed in the original homepage. Detailed case-study restoration is pending." : "Original collection entry. Legacy playback is not yet restored."}</p>
        </div>}
      </div>
      <div className="transport">
        <span aria-live="polite">{selected}{state.context === "lab" && <small> / visual study</small>}</span>
        <div>
          <button aria-label={state.paused ? "Play visual" : "Pause visual"} title="Play / pause (Space)" disabled={state.context !== "lab"} onClick={() => dispatch({ type: "pause" })}>{state.paused ? <Play /> : <Pause />}</button>
          <button aria-label="Restart visual" title="Restart (R)" disabled={state.context !== "lab"} onClick={() => dispatch({ type: "reset" })}><RotateCcw /></button>
          <button aria-label="Fullscreen display" title="Fullscreen display" onClick={async () => {
            try {
              if (!displayRef.current?.requestFullscreen) throw new Error("Unavailable");
              await displayRef.current.requestFullscreen();
              setFullscreenError("");
            } catch { setFullscreenError("Fullscreen is unavailable in this browser."); }
          }}><Maximize /></button>
        </div>
      </div>
      {fullscreenError && <p role="status">{fullscreenError}</p>}
    </section>
    <aside className="navigation">
      <div className="context-tiles">
        {[{ id: "lab", label: "AV Lab" }, { id: "tools", label: "Tools" }, { id: "tv", label: "TV" }].map(item => <button key={item.id} aria-pressed={state.context === item.id} onClick={() => changeContext(item.id)}><ArrowUpRight aria-hidden="true" /><span>{item.label.toUpperCase()}</span></button>)}
      </div>
      <p className="context-description">{context.description}</p>
      <nav aria-label="Content contexts">
        {contexts.slice(0, 6).map((item, index) => <button key={item.id} aria-pressed={state.context === item.id} aria-keyshortcuts={String(index + 1)} title={`${item.label} (${index + 1})`} onClick={() => changeContext(item.id)}><ArrowDownRight aria-hidden="true" /><span>{item.label.toUpperCase()}</span></button>)}
      </nav>
    </aside>
    <section className="control-section" id="control-bank" aria-label="Content controls">
      <div className="bank-heading"><h2>{context.label.toUpperCase()}</h2><span>{selected.toUpperCase()}</span></div>
      <div className="pad-bank">
        {Array.from({ length: 6 }, (_, slot) => <button key={slot} className={`pad pad-${slot}`} disabled={!context.items[slot]} aria-pressed={state.slot === slot} aria-keyshortcuts={padKeys[slot].toUpperCase()} title={context.items[slot] ? `${context.items[slot]} (${padKeys[slot].toUpperCase()})` : "Empty pad"} onClick={() => dispatch({ type: "slot", slot })}><kbd>{padKeys[slot].toUpperCase()}</kbd><span>{context.items[slot] || ""}</span></button>)}
      </div>
      <p className="album">from the album:<br /><em>a senseless act of beauty</em></p>
    </section>
  </main>;
}