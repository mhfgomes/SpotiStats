"use client";

import { signIn } from "@/lib/auth-client";
import { BarChart3, Mic2, Music2 } from "lucide-react";

const SpotifyLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const features = [
  { icon: Music2, label: "Top Tracks" },
  { icon: Mic2, label: "Top Artists" },
  { icon: BarChart3, label: "Genre Radar" },
];

export default function LoginPage() {
  const handleSpotifySignIn = () => {
    signIn.social({
      provider: "spotify",
      callbackURL: "/top-tracks",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-spotify-black">
      <div className="w-full max-w-md px-6">
        <div className="mb-12 flex flex-col items-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-spotify-green">
              <Music2 className="h-6 w-6 text-black" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SpotiStats</h1>
          </div>
          <p className="max-w-xs text-center text-sm leading-relaxed text-spotify-subtext">
            Discover your top tracks, artists, and genres. Get a deep look into
            your Spotify listening history.
          </p>
        </div>

        <div className="spotify-card flex flex-col items-center gap-6 p-8">
          <div className="text-center">
            <h2 className="mb-1 text-xl font-semibold">Sign in to continue</h2>
            <p className="text-sm text-spotify-subtext">
              Connect your Spotify account to open your dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={handleSpotifySignIn}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-spotify-green px-6 py-3 text-sm font-bold text-black transition-colors duration-200 hover:bg-[#1ed760] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-black"
          >
            <SpotifyLogo />
            Continue with Spotify
          </button>

          <p className="text-center text-xs text-spotify-subtext">
            We&apos;ll request read-only access to your listening data.
            <br />
            Your data is synced privately and never shared.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1DB954]/10">
                <Icon className="h-[18px] w-[18px] text-spotify-green" aria-hidden="true" />
              </div>
              <span className="text-xs text-spotify-subtext">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
