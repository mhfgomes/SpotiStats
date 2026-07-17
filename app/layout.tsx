import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/layout/ConvexClientProvider";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpotiStats — Your Spotify Listening Stats",
  description:
    "Dive deep into your Spotify listening history. Top tracks, top artists, genre breakdown, taste profile, and yearly recap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${figtree.variable}`}>
      <body className={`${figtree.className} bg-spotify-black text-white antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
