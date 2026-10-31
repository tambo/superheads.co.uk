export const contexts = [
  { id: "music", label: "Music", description: "from the album: a senseless act of beauty", items: ["The Crunch", "Junglator", "Lapsadaisical", "Trance Sexuality", "Rise & Shine", "Boogie Oogie"] },
  { id: "videos", label: "Videos", description: "Moving images from the original Superheads collection.", items: ["The Crunch", "Junglator", "Lapsadaisical", "Trance Sexuality", "Rise & Shine", "Boogie Oogie"] },
  { id: "games", label: "Games", description: "The original digital playground.", items: ["Spak Invaders"] },
  { id: "lab", label: "AV Lab", description: "The AV LAB: Our audio-visual playground", items: ["Interference", "Signal", "Orbit", "Interference II", "Signal II", "Orbit II"] },
  { id: "portfolio", label: "Portfolio", description: "Historical projects from the original site.", items: ["onStar", "Oddbins", "Natural Remedies", "The Angel Declaration"] },
  { id: "info", label: "Info", description: "departing non-stop to all digital destinations", items: ["About Us", "Contact", "Restoration"] },
  { id: "tools", label: "Tools", description: "Tools for a digital life", items: ["Favourites", "Address Book", "Chat"] },
  { id: "tv", label: "TV", description: "Superheads TV", items: ["Superheads TV"] },
];

export const padKeys = ["q", "w", "e", "a", "s", "d"];
export const initialState = { context: "lab", slot: 0, paused: false, revision: 0 };

export function consoleReducer(state, action) {
  if (action.type === "context" && contexts.some(context => context.id === action.context)) {
    return { ...state, context: action.context, slot: 0, paused: false };
  }
  const context = contexts.find(context => context.id === state.context);
  if (action.type === "slot" && Number.isInteger(action.slot) && action.slot >= 0 && action.slot < context.items.length) {
    return { ...state, slot: action.slot, paused: false };
  }
  if (action.type === "pause") return { ...state, paused: !state.paused };
  if (action.type === "reset") return { ...state, revision: state.revision + 1, paused: false };
  return state;
}

export function keyboardAction(key) {
  const lower = key.toLowerCase();
  const slot = padKeys.indexOf(lower);
  if (slot >= 0) return { type: "slot", slot };
  if (/^[1-6]$/.test(key)) return { type: "context", context: contexts[Number(key) - 1].id };
  if (key === " ") return { type: "pause" };
  if (lower === "r") return { type: "reset" };
  if (key === "Escape") return { type: "context", context: "lab" };
  return null;
}