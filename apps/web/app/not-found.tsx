"use client";

import Link from "next/link";
import { Music2, Home, BarChart2 } from "lucide-react";

/* ─── Equalizer bar heights (60 bars, varied pattern) ─── */
const BAR_H = [
  8,20,32,12,40,16,28,8,36,20,14,30,
  8,24,38,12,20,32,8,18,28,36,10,22,
  16,30,8,26,14,34,20,8,28,16,38,12,
  24,8,32,18,28,10,36,20,14,30,8,22,
  34,16,10,28,8,36,24,14,30,8,20,32,
];
const DURATIONS = [0.8,0.6,1.0,0.7,0.9,0.5,1.1,0.8,0.65,0.9,0.75,1.0];
const DELAYS    = [0,0.1,0.2,0.3,0.1,0.4,0.05,0.25,0.35,0.15,0.45,0.2];

const GROOVE_RADII = [88,78,68,58,48,38];

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&display=swap');

        .nf { font-family: 'Figtree', sans-serif; }

        /* ── Vinyl spin ── */
        @keyframes vinyl-spin {
          to { transform: rotate(360deg); }
        }
        .vinyl-disc {
          animation: vinyl-spin 5s linear infinite;
          transform-origin: center;
        }

        /* ── Glow pulse ── */
        @keyframes glow-pulse {
          0%,100% { filter: drop-shadow(0 0 18px rgba(29,185,84,.30)); }
          50%      { filter: drop-shadow(0 0 42px rgba(29,185,84,.60)); }
        }
        .vinyl-wrap {
          animation: glow-pulse 3s ease-in-out infinite;
          display: inline-block;
        }

        /* ── Scratch glitch ── */
        @keyframes scratch-appear {
          0%,88%,100% { opacity: 0; }
          90%          { opacity: .55; }
          91%          { opacity: 0; }
          93%          { opacity: .35; }
          94%          { opacity: 0; }
        }
        .vinyl-scratch { animation: scratch-appear 9s ease-in-out infinite; }

        /* ── 404 text glitch ── */
        @keyframes txt-glitch {
          0%,91%,100% { transform:translate(0);   filter:none; }
          92%          { transform:translate(-3px,1px);  filter:hue-rotate(60deg) brightness(1.4); }
          93%          { transform:translate(3px,-1px); filter:hue-rotate(-60deg); }
          95%          { transform:translate(-1px,2px);  filter:brightness(1.6); }
          96%          { transform:translate(0);   filter:none; }
          98%          { transform:translate(2px,-2px); filter:hue-rotate(40deg); }
        }
        .glitch { animation: txt-glitch 7s ease-in-out infinite; }

        /* ── Floating notes ── */
        @keyframes float-note {
          0%   { opacity:0; transform:translateY(0)   rotate(0deg); }
          10%  { opacity:.4; }
          90%  { opacity:.1; }
          100% { opacity:0; transform:translateY(-100px) rotate(18deg); }
        }
        .n1{animation:float-note 5.0s ease-in-out infinite 0.0s;}
        .n2{animation:float-note 7.0s ease-in-out infinite 1.5s;}
        .n3{animation:float-note 6.0s ease-in-out infinite 3.0s;}
        .n4{animation:float-note 8.0s ease-in-out infinite 0.8s;}
        .n5{animation:float-note 5.5s ease-in-out infinite 2.2s;}
        .n6{animation:float-note 7.5s ease-in-out infinite 4.0s;}
        .n7{animation:float-note 6.5s ease-in-out infinite 1.0s;}

        /* ── Entrance ── */
        @keyframes fade-up {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .fu1{animation:fade-up .65s ease both .05s; opacity:0;}
        .fu2{animation:fade-up .65s ease both .20s; opacity:0;}
        .fu3{animation:fade-up .65s ease both .35s; opacity:0;}
        .fu4{animation:fade-up .65s ease both .50s; opacity:0;}
        .fu5{animation:fade-up .65s ease both .65s; opacity:0;}
        .fu6{animation:fade-up .65s ease both .80s; opacity:0;}

        /* ── Button states ── */
        .btn-green {
          background:#1DB954; color:#000;
          transition: background 200ms, transform 150ms, box-shadow 200ms;
        }
        .btn-green:hover {
          background:#1ed760;
          transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(29,185,84,.40);
        }
        .btn-ghost {
          border:1px solid rgba(255,255,255,.15); color:#fff;
          transition: border-color 200ms, background 200ms, transform 150ms;
        }
        .btn-ghost:hover {
          border-color:rgba(255,255,255,.32);
          background:rgba(255,255,255,.07);
          transform:translateY(-2px);
        }
      `}</style>

      <main className="nf bg-[#121212] text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none px-6">

        {/* ── Background radial glow ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 50% at 50% 52%, rgba(29,185,84,.07) 0%, transparent 70%)",
          }}
        />

        {/* ── Subtle grid overlay ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 75%)",
          }}
        />

        {/* ── Floating music notes ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="n1 absolute text-[#1DB954]/35 text-2xl" style={{ left: "10%",  bottom: "22%" }}>♪</span>
          <span className="n2 absolute text-[#1DB954]/20 text-3xl" style={{ left: "22%",  bottom: "16%" }}>♫</span>
          <span className="n3 absolute text-[#1DB954]/25 text-xl"  style={{ left: "72%",  bottom: "24%" }}>♩</span>
          <span className="n4 absolute text-[#1DB954]/20 text-2xl" style={{ right: "12%", bottom: "19%" }}>♪</span>
          <span className="n5 absolute text-[#1DB954]/15 text-4xl" style={{ left: "4%",   bottom: "32%" }}>♬</span>
          <span className="n6 absolute text-[#1DB954]/20 text-xl"  style={{ right: "6%",  bottom: "36%" }}>♫</span>
          <span className="n7 absolute text-[#1DB954]/18 text-2xl" style={{ left: "52%",  bottom: "12%" }}>♪</span>
        </div>

        {/* ── Nav ── */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-10 py-5 z-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Music2 className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base tracking-tight">SpotiStats</span>
          </Link>
        </nav>

        {/* ── Main content ── */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">

          {/* Vinyl record */}
          <div className="fu1 vinyl-wrap mb-7">
            <svg
              width="180"
              height="180"
              viewBox="0 0 200 200"
              className="vinyl-disc"
              aria-hidden
            >
              <defs>
                <radialGradient id="nf-disc" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#1a1a1a" />
                  <stop offset="100%" stopColor="#0a0a0a" />
                </radialGradient>
                <radialGradient id="nf-sheen" cx="32%" cy="32%" r="60%">
                  <stop offset="0%"   stopColor="rgba(255,255,255,.09)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <radialGradient id="nf-label" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#222" />
                  <stop offset="100%" stopColor="#111" />
                </radialGradient>
              </defs>

              {/* Outer disc */}
              <circle cx="100" cy="100" r="98" fill="url(#nf-disc)" />

              {/* Groove rings */}
              {GROOVE_RADII.map((r, i) => (
                <circle
                  key={i}
                  cx="100" cy="100" r={r}
                  fill="none"
                  stroke="rgba(255,255,255,.04)"
                  strokeWidth="1"
                />
              ))}

              {/* Sheen */}
              <circle cx="100" cy="100" r="98" fill="url(#nf-sheen)" />

              {/* Center label */}
              <circle cx="100" cy="100" r="27" fill="url(#nf-label)" />
              <circle cx="100" cy="100" r="27" fill="none" stroke="#1DB954" strokeWidth="1.5" strokeOpacity=".55" />

              {/* Label text */}
              <text
                x="100" y="94"
                textAnchor="middle"
                fill="#1DB954"
                fontSize="6.5"
                fontFamily="Figtree, sans-serif"
                fontWeight="700"
                letterSpacing="2"
              >
                SPOTISTATS
              </text>
              <text
                x="100" y="106"
                textAnchor="middle"
                fill="rgba(255,255,255,.45)"
                fontSize="5.5"
                fontFamily="Figtree, sans-serif"
              >
                NOT FOUND
              </text>

              {/* Spindle hole */}
              <circle cx="100" cy="100" r="4" fill="#121212" />

              {/* Occasional scratch */}
              <line
                x1="28" y1="65" x2="168" y2="135"
                stroke="rgba(255,255,255,.7)"
                strokeWidth=".6"
                className="vinyl-scratch"
              />

              {/* Rim */}
              <circle cx="100" cy="100" r="98" fill="none" stroke="rgba(29,185,84,.18)" strokeWidth="2" />
            </svg>
          </div>

          {/* Badge */}
          <div className="fu2 inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/22 rounded-full px-3.5 py-1.5 text-[#1DB954] text-xs font-semibold mb-5 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full animate-pulse" />
            Error 404
          </div>

          {/* Giant 404 */}
          <h1
            className="fu3 glitch font-black tracking-tighter leading-none mb-3"
            style={{
              fontSize: "clamp(5rem, 18vw, 8rem)",
              background:
                "linear-gradient(170deg, #ffffff 20%, rgba(255,255,255,.55) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </h1>

          {/* Heading */}
          <h2 className="fu4 text-xl md:text-2xl font-semibold text-white mb-3">
            Track Not Found
          </h2>

          {/* Body */}
          <p className="fu4 text-[#B3B3B3] text-sm leading-relaxed mb-8 max-w-xs">
            This page has been removed from your playlist — or maybe it never
            existed. Let&apos;s get you back to the music.
          </p>

          {/* CTAs */}
          <div className="fu5 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="btn-green flex items-center gap-2 justify-center px-6 py-3 rounded-full text-sm font-semibold"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/top-tracks"
              className="btn-ghost flex items-center gap-2 justify-center px-6 py-3 rounded-full text-sm font-semibold"
            >
              <BarChart2 className="w-4 h-4" />
              Open Dashboard
            </Link>
          </div>
        </div>

        {/* ── Equalizer bars (bottom decoration) ── */}
        <div
          aria-hidden
          className="fu6 absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          <div
            className="flex items-end justify-center gap-[3px]"
            style={{ height: 52, paddingBottom: 0 }}
          >
            {BAR_H.map((h, i) => {
              const idx   = i % 12;
              const edge  = Math.sin((i / BAR_H.length) * Math.PI); // fade at edges
              const opac  = 0.12 + edge * 0.28;
              return (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: h,
                    borderRadius: 2,
                    background: "#1DB954",
                    opacity: opac,
                    alignSelf: "flex-end",
                    animation: `eq-bar-anim-${idx} ${DURATIONS[idx]}s ease-in-out infinite ${DELAYS[idx]}s`,
                  }}
                />
              );
            })}
          </div>
          {/* Inject eq keyframes for each of the 12 patterns */}
          <style>{`
            @keyframes eq-bar-anim-0  { 0%,100%{height:8px}  50%{height:32px} }
            @keyframes eq-bar-anim-1  { 0%,100%{height:20px} 50%{height:8px}  }
            @keyframes eq-bar-anim-2  { 0%,100%{height:14px} 50%{height:40px} }
            @keyframes eq-bar-anim-3  { 0%,100%{height:24px} 50%{height:10px} }
            @keyframes eq-bar-anim-4  { 0%,100%{height:10px} 50%{height:36px} }
            @keyframes eq-bar-anim-5  { 0%,100%{height:30px} 50%{height:8px}  }
            @keyframes eq-bar-anim-6  { 0%,100%{height:16px} 50%{height:28px} }
            @keyframes eq-bar-anim-7  { 0%,100%{height:8px}  50%{height:20px} }
            @keyframes eq-bar-anim-8  { 0%,100%{height:22px} 50%{height:40px} }
            @keyframes eq-bar-anim-9  { 0%,100%{height:12px} 50%{height:18px} }
            @keyframes eq-bar-anim-10 { 0%,100%{height:28px} 50%{height:8px}  }
            @keyframes eq-bar-anim-11 { 0%,100%{height:8px}   50%{height:34px} }
          `}</style>
        </div>

      </main>
    </>
  );
}
