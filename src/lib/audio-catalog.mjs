export const artist = {
  title: "Tomaz Sounder",
  excerpt: "House, Techno, Drum & Bass",
  audioFolder: "tomaz-sounder",
  origin: "https://orphism.co.uk",
  source: "https://orphism.co.uk/artists/tomaz-sounder/",
};

export const catalogueUrl = `${artist.origin}/audio/audio-list.php?folder=${artist.audioFolder}`;

export function audioOrigin(hostname = "") {
  return hostname === "localhost" ? "https://dev.orphism.co.uk" : artist.origin;
}

export function audioCatalogueUrl(origin = artist.origin) {
  return `${origin}/audio/audio-list.php?folder=${artist.audioFolder}`;
}

export function parseAudioCatalogue(data, origin = artist.origin) {
  if (![artist.origin, "https://dev.orphism.co.uk"].includes(origin)) throw new Error("Invalid audio origin");
  if (!data || data.folder !== artist.audioFolder || !Array.isArray(data.files)) throw new Error("Invalid artist catalogue");
  return data.files.filter(file => file.type === "audio").map(file => {
    if (typeof file.filename !== "string" || !/^[a-zA-Z0-9 _\-.&]+\.(mp3|wav|ogg|m4a)$/i.test(file.filename) || file.filename.includes("..")) throw new Error("Invalid audio filename");
    const source = new URL(file.proxyUrl, origin);
    if (source.origin !== origin || source.pathname !== "/audio/audio-proxy.php" || source.searchParams.get("file") !== `${artist.audioFolder}/${file.filename}`) throw new Error("Invalid streaming URL");
    return { filename: file.filename, title: typeof file.title === "string" ? file.title.trim() : file.filename, source: source.href };
  }).slice(0, 17);
}

export function formatAudioTime(seconds) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}