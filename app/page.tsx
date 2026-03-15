"use client";

import { signIn } from "@/lib/auth-client";
import { Music2, BarChart2, Users, Clock, Download, Headphones, Layers, Radio } from "lucide-react";

const SpotifyLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const features = [
  { icon: Music2,    title: "Top Tracks",         description: "See which songs have been on repeat — ranked by listening time across 4 weeks, 6 months, or all time." },
  { icon: Users,     title: "Top Artists",         description: "Discover which artists dominate your library and watch how your taste shifts over time." },
  { icon: Radio,     title: "Genre Breakdown",     description: "A radar chart that reveals your musical DNA — how much pop, indie, electronic, and more you actually stream." },
  { icon: Clock,     title: "Listening History",   description: "A full timeline of your recently played tracks with smart deduplication and timestamps." },
  { icon: Layers,    title: "Taste Profile",       description: "Your musical personality across 6 dimensions: energy, danceability, acousticness, valence, and more." },
  { icon: Download,  title: "Recap Card",          description: "A beautiful shareable image of your year in music. Download it as PNG and show off your taste." },
];

export default function HomePage() {
  const handleSignIn = () =>
    signIn.social({ provider: "spotify", callbackURL: "/top-tracks" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');
        .ss { font-family: 'Figtree', sans-serif; }
        @keyframes ss-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .ss-u1 { animation: ss-up .6s ease both .05s; opacity:0; }
        .ss-u2 { animation: ss-up .6s ease both .18s; opacity:0; }
        .ss-u3 { animation: ss-up .6s ease both .32s; opacity:0; }
        .ss-card { transition: border-color .2s ease, transform .2s ease; }
        .ss-card:hover { border-color: rgba(29,185,84,.3) !important; transform: translateY(-3px); }
      `}</style>

      <main className="ss bg-[#121212] text-white min-h-screen">

        {/* NAV */}
        <nav className="flex items-center justify-between px-6 md:px-10 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
              <Music2 className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base tracking-tight">SpotiStats</span>
          </div>
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 border border-white/15 hover:border-white/30 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors duration-200"
          >
            <SpotifyLogo />
            Sign in
          </button>
        </nav>

        {/* HERO */}
        <section className="max-w-3xl mx-auto px-6 md:px-10 pt-20 pb-28 text-center">
          <div className="ss-u1 inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full px-3.5 py-1.5 text-[#1DB954] text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full animate-pulse" />
            Your Spotify data, beautifully visualized
          </div>
          <h1 className="ss-u2 text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
            Understand your<br />
            <span className="text-[#1DB954]">music taste</span>
          </h1>
          <p className="ss-u3 text-white/45 text-lg leading-relaxed max-w-lg mx-auto mb-10">
            Top tracks, top artists, genre breakdown, taste radar, listening history — all in one clean dashboard.
          </p>
          <div className="ss-u3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleSignIn}
              className="flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] active:scale-[.98] text-black font-bold py-3.5 px-7 rounded-full transition-all duration-150 text-sm"
            >
              <SpotifyLogo />
              Connect with Spotify
            </button>
            <span className="text-white/25 text-sm">Free · Read-only access</span>
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-t border-white/6 py-20 px-6 md:px-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-10 text-center">What&apos;s inside</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="ss-card bg-[#1a1a1a] border border-white/6 rounded-2xl p-6">
                    <div className="w-9 h-9 bg-[#1DB954]/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-4.5 h-4.5 text-[#1DB954]" style={{ width: 18, height: 18 }} />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
                    <p className="text-white/38 text-sm leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 px-6 md:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-12">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: "1", icon: SpotifyLogo, title: "Connect",  desc: "Sign in with Spotify. We only request read-only access to your listening data." },
                { n: "2", icon: Headphones,  title: "Sync",     desc: "We pull your top tracks, artists, and play history directly from the Spotify API." },
                { n: "3", icon: BarChart2,   title: "Explore",  desc: "Browse your personalized dashboard, switch time ranges, and download your recap card." },
              ].map(({ n, icon: Icon, title, desc }) => (
                <div key={n} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/8 border border-[#1DB954]/15 flex items-center justify-center mb-4 relative">
                    <div className="text-[#1DB954]"><Icon /></div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1DB954] rounded-full text-black text-[10px] font-bold flex items-center justify-center">{n}</span>
                  </div>
                  <div className="font-semibold text-white text-sm mb-1.5">{title}</div>
                  <p className="text-white/35 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/6 py-20 px-6 md:px-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to dive in?</h2>
          <p className="text-white/35 text-sm mb-8">Connect your Spotify account and explore your listening data.</p>
          <button
            onClick={handleSignIn}
            className="inline-flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] active:scale-[.98] text-black font-bold py-3.5 px-8 rounded-full transition-all duration-150 text-sm"
          >
            <SpotifyLogo />
            Get Started - It&apos;s Free
          </button>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/6 py-6 px-6 md:px-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#1DB954] rounded-full flex items-center justify-center">
                <Music2 className="w-2.5 h-2.5 text-black" />
              </div>
              <span className="text-sm font-semibold text-white/50">SpotiStats</span>
            </div>
            <p className="text-white/25 text-xs">Made with ♥ using Spotify API · Not affiliated with Spotify AB</p>
          </div>
        </footer>

      </main>
    </>
  );
}
