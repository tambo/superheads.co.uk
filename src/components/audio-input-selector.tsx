"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Check, ChevronDown, Mic } from "lucide-react";
import { audioLevels, bandLevels, smoothLevels } from "../lib/audio-levels.mjs";

interface AudioInputDevice {
  deviceId: string;
  label: string;
}

interface AudioInputSelectorProps {
  onActiveChange: (active: boolean) => void;
}

export default function AudioInputSelector({ onActiveChange }: AudioInputSelectorProps) {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<AudioInputDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [error, setError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef(0);

  const enumerateDevices = async () => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.enumerateDevices) {
      setError("Audio input selection is not supported in this browser.");
      return;
    }
    try {
      const inputs = (await mediaDevices.enumerateDevices()).filter(device => device.kind === "audioinput");
      setDevices(inputs.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Audio input ${index + 1}`,
      })));
      setPermissionNeeded(inputs.length === 0 || inputs.every(device => !device.label));
      setError("");
    } catch {
      setError("Could not list audio inputs.");
    }
  };

  const stopCapture = (notify = true) => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    contextRef.current?.close().catch(() => {});
    contextRef.current = null;
    setSelectedDevice("");
    audioLevels.inputActive = false;
    audioLevels.live = false;
    audioLevels.bass = audioLevels.mid = audioLevels.treble = audioLevels.level = 0;
    if (notify) onActiveChange(false);
  };

  useEffect(() => {
    if (!open) return;
    void enumerateDevices();
    const mediaDevices = navigator.mediaDevices;
    mediaDevices?.addEventListener?.("devicechange", enumerateDevices);
    return () => mediaDevices?.removeEventListener?.("devicechange", enumerateDevices);
  }, [open]);

  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach(track => track.stop());
    contextRef.current?.close().catch(() => {});
    audioLevels.inputActive = false;
    audioLevels.live = false;
    audioLevels.bass = audioLevels.mid = audioLevels.treble = audioLevels.level = 0;
    onActiveChange(false);
  }, [onActiveChange]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getTracks().forEach(track => track.stop());
      await enumerateDevices();
    } catch {
      setError("Microphone permission was denied or unavailable.");
    }
  };

  const selectDevice = async (device: AudioInputDevice) => {
    setError("");
    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    try {
      const audio: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      };
      if (device.deviceId) audio.deviceId = { exact: device.deviceId };
      stream = await navigator.mediaDevices.getUserMedia({ audio, video: false });
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) throw new Error("Web Audio API unavailable");
      context = new AudioContextClass();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      context.createMediaStreamSource(stream).connect(analyser);
      await context.resume();

      stopCapture(false);
      streamRef.current = stream;
      contextRef.current = context;
      setSelectedDevice(device.deviceId);
      audioLevels.inputActive = true;
      onActiveChange(true);

      const bins = new Uint8Array(analyser.frequencyBinCount);
      let levels = { bass: 0, mid: 0, treble: 0, level: 0 };
      const sample = () => {
        if (!audioLevels.inputActive || streamRef.current !== stream) return;
        analyser.getByteFrequencyData(bins);
        levels = smoothLevels(levels, bandLevels(bins));
        Object.assign(audioLevels, levels, { live: true });
        frameRef.current = requestAnimationFrame(sample);
      };
      frameRef.current = requestAnimationFrame(sample);
      stream.getAudioTracks().forEach(track => track.addEventListener("ended", () => {
        if (streamRef.current === stream) stopCapture();
      }, { once: true }));
      setOpen(false);
    } catch {
      stream?.getTracks().forEach(track => track.stop());
      context?.close().catch(() => {});
      setError("Could not start this audio input. Check microphone permission and try again.");
    }
  };

  const activeLabel = devices.find(device => device.deviceId === selectedDevice)?.label;

  return <div className="audio-input-selector">
    <button className="audio-input-toggle" type="button" aria-label={selectedDevice ? `Audio input: ${activeLabel || "selected"}` : "Select audio input"} aria-expanded={open} aria-controls="audio-input-list" aria-pressed={Boolean(selectedDevice)} title={selectedDevice ? `Visual input: ${activeLabel || "microphone"}` : "Select an audio input for Lab visuals"} onClick={() => setOpen(value => !value)} onKeyDown={event => {
      if (event.key === "Escape" && open) setOpen(false);
    }}>
      {selectedDevice ? <AudioLines aria-hidden="true" /> : <Mic aria-hidden="true" />}
      <ChevronDown aria-hidden="true" />
    </button>
    {open && <div id="audio-input-list" className="audio-input-menu" role="group" aria-label="Audio input devices">
      <p className="audio-input-note">Input drives visuals only; audio is not played here.</p>
      {selectedDevice && <button className="audio-input-option" type="button" onClick={() => { stopCapture(); setOpen(false); }}>
        <span>None</span>
        <span className="audio-input-state">Stop input</span>
      </button>}
      {devices.map((device, index) => <button key={device.deviceId || `input-${index}`} className="audio-input-option" type="button" aria-pressed={device.deviceId === selectedDevice} onClick={() => void selectDevice(device)}>
        <span className="audio-input-name">{device.label}</span>
        {device.deviceId === selectedDevice && <Check className="audio-input-check" aria-label="Selected" />}
      </button>)}
      {permissionNeeded && <button className="audio-input-permission" type="button" onClick={() => void requestPermission()}>Allow microphone access</button>}
      {!devices.length && !permissionNeeded && !error && <p className="audio-input-note">No audio inputs found.</p>}
      {error && <p className="audio-input-error" role="status">{error}</p>}
    </div>}
  </div>;
}
