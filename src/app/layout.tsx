import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Superheads | All Digital Destinations",
  description: "The Superheads collection: music, moving images, games and experiments from the original digital playground.",
  metadataBase: new URL("https://superheads.co.uk"),
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}