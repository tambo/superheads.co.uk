"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, Pause, Play, SkipBack, SkipForward, Square, Volume2 } from "lucide-react";
import { artist, formatAudioTime } from "../lib/audio-catalog.mjs";

export interface AudioTrack { filename: string; title: string; source: string }

export default function AudioPlayer({ tracks, index, revision, loading, error, onSelect, onRetry }: {
  tracks: AudioTrack[]; index: number; revision: number; loading: boolean; error: string;
  onSelect: (index: number) => void; onRetry: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackError, setPlaybackError] = useState("");
  const track = tracks[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;
    setElapsed(0);
    setDuration(0);
    setPlaybackError("");
    audio.load();
    if (track && revision > 0) audio.play().catch(error => {
      if (!cancelled && error.name !== "AbortError") setPlaybackError("Playback unavailable. Press play to retry.");
    });
    return () => { cancelled = true; };
  }, [track?.source, revision]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    setPlaybackError("");
    if (!audio.paused) audio.pause();
    else audio.play().catch(() => setPlaybackError("Playback unavailable. Check streaming access."));
  };

  return <section className="audio-player" aria-label="Tomaz Sounder audio player">
    <header className="audio-player-heading">
      <img src="/artwork/home/4.svg" width="145" height="27" alt="superheads" />
      <h2><ArrowDownRight aria-hidden="true" />JUKEBOX</h2>
    </header>
    <div className="audio-now-playing">
      <strong>{track?.title || (loading ? "Loading tracks..." : "Tracks unavailable")}</strong>
      <span>{artist.title}</span>
      <output aria-label="Playback time">{formatAudioTime(elapsed)} / {formatAudioTime(duration)}</output>
    </div>
    <input className="audio-seek" type="range" aria-label="Seek track" min="0" max={duration || 0} step="0.1" value={Math.min(elapsed, duration || 0)} disabled={!duration} onChange={event => {
      if (audioRef.current) audioRef.current.currentTime = Number(event.target.value);
      setElapsed(Number(event.target.value));
    }} />
    <div className="audio-player-controls">
      <div className="audio-transport">
        <button aria-label="Previous track" title="Previous track" disabled={tracks.length < 2} onClick={() => onSelect((index + tracks.length - 1) % tracks.length)}><SkipBack /></button>
        <button aria-label="Stop audio" title="Stop audio" disabled={!track} onClick={() => {
          const audio = audioRef.current;
          if (audio) { audio.pause(); audio.currentTime = 0; }
          setElapsed(0);
        }}><Square /></button>
        <button className="audio-play" aria-label={playing ? "Pause audio" : "Play audio"} title={playing ? "Pause audio" : "Play audio"} disabled={!track} onClick={togglePlay}>{playing ? <Pause /> : <Play />}</button>
        <button aria-label="Next track" title="Next track" disabled={tracks.length < 2} onClick={() => onSelect((index + 1) % tracks.length)}><SkipForward /></button>
      </div>
      <label className="audio-volume"><Volume2 aria-hidden="true" /><input type="range" aria-label="Audio volume" min="0" max="1" step="0.01" value={volume} onChange={event => {
        const value = Number(event.target.value);
        setVolume(value);
        if (audioRef.current) audioRef.current.volume = value;
      }} /></label>
    </div>
    {(error || playbackError) && <div className="audio-error" role="status"><span>{playbackError || error}</span>{error && <button onClick={onRetry}>Retry</button>}</div>}
    <audio ref={audioRef} src={track?.source} preload="none" onLoadedMetadata={event => {
      setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
      event.currentTarget.volume = volume;
    }} onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setPlaybackError("Streaming unavailable for this site.")} onEnded={() => {
      if (index < tracks.length - 1) onSelect(index + 1);
      else { setPlaying(false); setElapsed(0); }
    }} />
  </section>;
}