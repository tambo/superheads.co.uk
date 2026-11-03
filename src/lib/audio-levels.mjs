// Shared, non-reactive store written by the audio player and read per frame by shaders.
export const audioLevels = { playing: false, live: false, bass: 0, mid: 0, treble: 0, level: 0 };

export function bandLevels(bins) {
  const average = (from, to) => {
    let total = 0;
    const end = Math.min(to, bins.length);
    for (let index = from; index < end; index++) total += bins[index];
    return end > from ? total / (end - from) / 255 : 0;
  };
  const shape = value => Math.min(1, Math.pow(value, 1.6) * 1.6);
  return { bass: shape(average(0, 4)), mid: shape(average(4, 24)), treble: shape(average(24, 96)), level: shape(average(0, 96)) };
}

export function smoothLevels(previous, next, attack = 0.6, decay = 0.12) {
  const follow = (from, to) => from + (to - from) * (to > from ? attack : decay);
  return { bass: follow(previous.bass, next.bass), mid: follow(previous.mid, next.mid), treble: follow(previous.treble, next.treble), level: follow(previous.level, next.level) };
}

// Used when the stream cannot be analysed (no CORS): a steady pulse so the visual still reacts to playback.
export function simulatedLevels(seconds) {
  const beat = Math.pow(Math.max(0, Math.sin(seconds * Math.PI * 2 * 2)), 4);
  return { bass: beat * 0.8, mid: 0.4 + 0.2 * Math.sin(seconds * 1.7), treble: 0.3 + 0.2 * Math.sin(seconds * 5.3), level: 0.3 + beat * 0.4 };
}
