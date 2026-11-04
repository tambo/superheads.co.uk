export const contexts = [
  { id: "music", label: "Music", description: "from the album: a senseless act of beauty", items: ["The Crunch", "Junglator", "Lapsadaisical", "Trance Sexuality", "Rise & Shine", "Boogie Oogie"] },
  { id: "videos", label: "Videos", description: "Moving images from the original Superheads collection.", items: ["The Crunch", "Junglator", "Lapsadaisical", "Trance Sexuality", "Rise & Shine", "Boogie Oogie"] },
  { id: "games", label: "Games", description: "The original digital playground.", items: ["Spak Invaders"] },
  { id: "lab", label: "AV Lab", description: "The AV LAB: Our audio-visual playground", items: ["Interference", "Signal", "Orbit", "Interference II", "Signal II", "Orbit II"] },
  { id: "cafe", label: "SoftFood Cafe", description: "", items: ["SoftFood Cafe"] },
  { id: "modern", label: "Twat Modern", description: "", items: ["Twat Modern"] },
  { id: "jukebox", label: "Jukebox", description: "", items: ["Jukebox"] },
];

export const primaryContexts = contexts.slice(0, 4);
export const sections = [
  { id: "av-lab", label: "AV LAB", context: "lab", submenu: ["music", "videos", "games", "lab"] },
  { id: "community", label: "Community", context: "cafe", submenu: ["cafe", "modern"] },
  { id: "jukebox", label: "Jukebox", context: "jukebox", submenu: [] },
];
export const padKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j"];
export const initialState = { context: "lab", slot: 0, paused: false, revision: 0, musicTracks: [], audioIndex: 0, audioRevision: 0, labCount: null, autoVisuals: false, manualVisualRevision: 0, automaticVisual: false };

export function randomVisualStep(current, count, random = Math.random) {
  const choice = Math.floor(random() * Math.max(0, count - 1));
  return { slot: count > 1 ? choice >= current ? choice + 1 : choice : current, delay: 5000 + Math.floor(random() * 5001) };
}

export function consoleReducer(state, action) {
  if (action.type === "auto-visuals") return { ...state, autoVisuals: !state.autoVisuals };
  if (action.type === "catalogue" && Array.isArray(action.tracks)) {
    return { ...state, musicTracks: action.tracks.slice(0, 17), slot: state.context === "music" ? 0 : state.slot, audioIndex: 0 };
  }
  if (action.type === "lab-items" && Number.isInteger(action.count) && action.count >= 0) {
    return { ...state, labCount: action.count, slot: state.context === "lab" ? 0 : state.slot };
  }
  if (action.type === "audio-track" && Number.isInteger(action.slot) && action.slot >= 0 && action.slot < state.musicTracks.length) {
    return { ...state, audioIndex: action.slot, audioRevision: state.audioRevision + 1, slot: state.context === "music" ? action.slot : state.slot };
  }
  if (action.type === "section") {
    const section = sections.find(section => section.id === action.section);
    return section ? { ...state, context: section.context, slot: 0, paused: false } : state;
  }
  if (action.type === "context" && contexts.some(context => context.id === action.context)) {
    return { ...state, context: action.context, slot: action.context === "music" ? state.audioIndex : 0, paused: false };
  }
  const context = contexts.find(context => context.id === state.context);
  const itemCount = state.context === "music" ? state.musicTracks.length : state.context === "lab" && state.labCount !== null ? state.labCount : context.items.length;
  if (action.type === "slot" && Number.isInteger(action.slot) && action.slot >= 0 && action.slot < itemCount) {
    return state.context === "music" ? { ...state, slot: action.slot, audioIndex: action.slot, audioRevision: state.audioRevision + 1 } : { ...state, slot: action.slot, paused: false, automaticVisual: action.automatic === true, manualVisualRevision: state.manualVisualRevision + (state.context === "lab" && !action.automatic ? 1 : 0) };
  }
  if (action.type === "pause") return { ...state, paused: !state.paused };
  if (action.type === "reset") return { ...state, revision: state.revision + 1, paused: false };
  return state;
}

export function keyboardAction(key) {
  const lower = key.toLowerCase();
  const slot = padKeys.indexOf(lower);
  if (slot >= 0) return { type: "slot", slot };
  if (/^[1-4]$/.test(key)) return { type: "context", context: primaryContexts[Number(key) - 1].id };
  if (key === " ") return { type: "pause" };
  if (key === "Backspace") return { type: "reset" };
  if (key === "Escape") return { type: "context", context: "lab" };
  return null;
}