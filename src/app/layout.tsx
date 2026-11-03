import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Superheads | All Digital Destinations",
  description: "The Superheads collection: music, moving images, games and experiments from the original digital playground.",
  metadataBase: new URL("https://superheads.co.uk"),
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Superheads" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { viewportFit: "cover", themeColor: "#000000" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}