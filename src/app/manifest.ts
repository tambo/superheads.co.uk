import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Superheads",
    short_name: "Superheads",
    start_url: "/",
    display: "fullscreen",
    orientation: "any",
    background_color: "#000000",
    theme_color: "#000000",
  };
}
