"use client";

import { signIn } from "@/lib/auth-client";
import { Music2 } from "lucide-react";

export default function LoginPage() {
  const handleSpotifySignIn = () => {
    signIn.social({
      provider: "spotify",
      callbackURL: "/top-tracks",
    });
  };

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SpotiStats</h1>
          </div>
          <p className="text-spotify-subtext text-center text-sm leading-relaxed max-w-xs">
            Discover your top tracks, artists, and genres. Get a deep look into
            your Spotify listening history.
          </p>
        </div>

        {/* Sign-in card */}
        <div className="spotify-card p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
            <p className="text-spotify-subtext text-sm">
              Sign in with your Spotify account to get started
            </p>
          </div>

          <button
            onClick={handleSpotifySignIn}
            className="w-full flex items-center justify-center gap-3 bg-spotify-green hover:bg-[#1ed760] text-black font-bold py-3 px-6 rounded-full transition-colors duration-200 text-sm"
          >
            {/* Spotify logo SVG */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Continue with Spotify
          </button>

          <p className="text-xs text-spotify-subtext text-center">
            We&apos;ll request read-only access to your listening data.
            <br />
            Your data is synced privately and never shared.
          </p>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { emoji: "🎵", label: "Top Tracks" },
            { emoji: "🎤", label: "Top Artists" },
            { emoji: "🎸", label: "Genre Radar" },
          ].map(({ emoji, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-spotify-subtext">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
