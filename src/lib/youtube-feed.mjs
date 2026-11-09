const decodeEntities = text => text.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[entity.toLowerCase()];
  if (named) return named;
  const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
  return Number.isFinite(code) ? String.fromCodePoint(code) : "";
});

export function normaliseHandle(handle) {
  const value = String(handle || "").trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9._-]{3,30}$/.test(value)) throw new Error("Invalid YouTube handle");
  return value;
}

export function extractChannelId(html) {
  const match = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/) || html.match(/"externalId":"(UC[\w-]{22})"/) || html.match(/channel_id=(UC[\w-]{22})/);
  return match ? match[1] : null;
}

export function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, entry]) => ({
    id: entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1],
    title: decodeEntities(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").trim(),
  })).filter(video => video.id);
}

// The curated list is never rewritten; fetched videos that are not already curated are returned for manual review.
export function findCandidates(existing, fetched) {
  const known = new Set((existing || []).map(video => video.id));
  const seen = new Set();
  return fetched.filter(video => !known.has(video.id) && !seen.has(video.id) && seen.add(video.id));
}
