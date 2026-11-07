import { readFileSync, writeFileSync } from "node:fs";
import { extractChannelId, mergeVideos, normaliseHandle, parseFeed } from "../src/lib/youtube-feed.mjs";

const configPath = new URL("../public/config/videos.json", import.meta.url);
const config = JSON.parse(readFileSync(configPath, "utf8"));
const handle = normaliseHandle(process.argv[2] || config.channel?.handle);
const headers = { "User-Agent": "Mozilla/5.0 (compatible; superheads-sync)", "Accept-Language": "en", Cookie: "CONSENT=YES+1; SOCS=CAI" };

async function get(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response;
}

async function viaApi(key) {
  const channel = await (await get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${handle}&key=${key}`)).json();
  const uploads = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("Channel not found via API");
  const list = await (await get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=26&playlistId=${uploads}&key=${key}`)).json();
  return list.items.map(item => ({ id: item.snippet.resourceId.videoId, title: item.snippet.title }));
}

async function viaFeed() {
  const channelId = extractChannelId(await (await get(`https://www.youtube.com/@${handle}`)).text());
  if (!channelId) throw new Error("Could not find the channel ID for this handle");
  return parseFeed(await (await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)).text());
}

const fetched = process.env.YOUTUBE_API_KEY ? await viaApi(process.env.YOUTUBE_API_KEY) : await viaFeed();
if (!fetched.length) throw new Error("No videos found; leaving config unchanged");
config.channel = { ...config.channel, handle: `@${handle}` };
config.videos = mergeVideos(config.videos, fetched);
writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
console.log(`Synced ${config.videos.length} videos from @${handle}${process.env.YOUTUBE_API_KEY ? " (API)" : " (feed, latest 15 at most)"}.`);
