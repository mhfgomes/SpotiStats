"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Check, Eye, Play, RotateCcw, X } from "lucide-react";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";
import type { LiveTopTrack } from "@/lib/spotify-live";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const ROUNDS = 10;
const OPTION_COUNT = 4;
const CANVAS_SIZE = 320;
// Pixel grid per reveal stage; the last stage shows the full cover.
const STAGES = [5, 9, 14, 22, 36, 0];
const STAGE_POINTS = [100, 80, 60, 40, 25, 10];
const STAGE_MS = 2800;
const BEST_SCORE_KEY = "spotistats:pixel-reveal:best";
const BEST_SCORE_EVENT = "pixel-reveal-best";

interface Album {
  imageUrl: string;
  albumName: string;
  artistName: string;
}

interface Round {
  answer: Album;
  options: Album[];
}

type Phase = "idle" | "playing" | "over";

function uniqueAlbums(tracks: LiveTopTrack[]): Album[] {
  const seen = new Set<string>();
  const albums: Album[] = [];
  for (const track of tracks) {
    // Singles and EPs share the track's name, which makes them a giveaway.
    if (track.albumType !== "album") continue;
    if (!track.albumImageUrl || seen.has(track.albumImageUrl)) continue;
    seen.add(track.albumImageUrl);
    albums.push({
      imageUrl: track.albumImageUrl,
      albumName: track.albumName,
      artistName: track.artistNames.join(", "),
    });
  }
  return albums;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildRounds(albums: Album[]): Round[] {
  return shuffle(albums)
    .slice(0, ROUNDS)
    .map((answer) => ({
      answer,
      options: shuffle([
        answer,
        ...shuffle(albums.filter((album) => album !== answer)).slice(
          0,
          OPTION_COUNT - 1
        ),
      ]),
    }));
}

function readBestScore() {
  return Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
}

function subscribeBestScore(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(BEST_SCORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(BEST_SCORE_EVENT, onChange);
  };
}

function PixelatedCover({ src, pixels }: { src: string; pixels: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const next = new Image();
    next.onload = () => setImage(next);
    next.src = src;
    return () => {
      next.onload = null;
    };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.imageSmoothingEnabled = false;
    context.fillStyle = "#181818";
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (!image || image.src !== new URL(src, window.location.href).href) return;

    if (pixels === 0) {
      context.imageSmoothingEnabled = true;
      context.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      return;
    }
    // Downscale onto a tiny grid, then blow it back up without smoothing.
    context.drawImage(image, 0, 0, pixels, pixels);
    context.drawImage(
      canvas,
      0,
      0,
      pixels,
      pixels,
      0,
      0,
      CANVAS_SIZE,
      CANVAS_SIZE
    );
  }, [image, pixels, src]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="h-full w-full"
      aria-label="Pixelated album cover"
    />
  );
}

const FAN_TILTS = [-14, -7, 0, 7, 14];
const FAN_LIFTS = [18, 6, 0, 6, 18];
// Each tile loops from blocky to sharp and back, offset from its neighbours.
const FAN_CYCLE = [5, 9, 14, 22, 36, 0, 0, 36, 22, 14, 9, 5];
const FAN_TICK_MS = 420;

function CoverFan({ children }: { children: (index: number) => React.ReactNode }) {
  return (
    <div className="relative flex h-44 items-end justify-center sm:h-52">
      {FAN_TILTS.map((tilt, index) => (
        <div
          key={index}
          className={cn(
            "relative -mx-3 aspect-square w-24 overflow-hidden rounded-lg border border-white/10 shadow-[0_12px_30px_rgb(0_0_0/0.5)] sm:-mx-4 sm:w-32",
            index === 2 ? "z-10" : index === 1 || index === 3 ? "z-[5]" : "z-0"
          )}
          style={{
            transform: `translateY(${-FAN_LIFTS[index]}px) rotate(${tilt}deg)`,
          }}
        >
          {children(index)}
        </div>
      ))}
    </div>
  );
}

function PixelRevealSkeleton() {
  return (
    <div
      className="flex flex-col items-center gap-6 text-center"
      aria-busy="true"
      aria-label="Loading your albums"
    >
      <CoverFan>
        {() => <Skeleton className="h-full w-full rounded-none" />}
      </CoverFan>
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-10 w-72 sm:h-12 sm:w-96" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-11 w-44 rounded-full" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

function PixelRevealIntro({
  albums,
  best,
  onStart,
}: {
  albums: Album[];
  best: number;
  onStart: () => void;
}) {
  const [tick, setTick] = useState(0);
  const canPlay = albums.length >= OPTION_COUNT;

  useEffect(() => {
    const timer = window.setInterval(
      () => setTick((current) => current + 1),
      FAN_TICK_MS
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <CoverFan>
        {(index) => {
          const album = albums[index % Math.max(albums.length, 1)];
          if (!album) return <div className="h-full w-full bg-white/5" />;
          return (
            <PixelatedCover
              src={album.imageUrl}
              pixels={FAN_CYCLE[(tick + index * 2) % FAN_CYCLE.length]}
            />
          );
        }}
      </CoverFan>

      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Album <span className="text-spotify-green">Pixel</span> Reveal
        </h2>
        <p className="text-sm text-spotify-subtext sm:text-base">
          You&apos;ve played them on repeat. But could you spot them in 25 pixels?
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-xs text-white/80">
        {[`${ROUNDS} rounds`, `${OPTION_COUNT} choices`, `Up to ${STAGE_POINTS[0]} pts each`].map(
          (label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
            >
              {label}
            </span>
          )
        )}
      </div>

      {canPlay ? (
        <button
          type="button"
          onClick={onStart}
          className="flex items-center gap-2 rounded-full bg-spotify-green px-6 py-3 text-sm font-bold text-black shadow-[0_0_30px_rgb(29_185_84/0.35)] transition-transform hover:scale-105"
        >
          Start revealing <Play className="h-4 w-4" />
        </button>
      ) : (
        <p className="max-w-xs text-sm text-spotify-subtext">
          You need at least four different full albums in your top tracks to
          play. Go listen to some albums front to back!
        </p>
      )}

      <p className="text-xs text-spotify-subtext">
        {best > 0 ? (
          <>
            Your best: <span className="text-white">{best}</span>
          </>
        ) : (
          "No best score yet. Set the bar."
        )}
      </p>
    </div>
  );
}

export function PixelRevealGame() {
  const { data, isLoading } = useSpotifyTopData("medium_term");
  const albums = useMemo(
    () => (data ? uniqueAlbums(data.tracks) : []),
    [data]
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [picked, setPicked] = useState<Album | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const best = useSyncExternalStore(subscribeBestScore, readBestScore, () => 0);

  const round = rounds[roundIndex];
  const answered = picked !== null;
  const isLastRound = roundIndex === rounds.length - 1;

  // Sharpen the cover over time until the player answers.
  useEffect(() => {
    if (phase !== "playing" || answered) return;
    const timer = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, STAGES.length - 1));
    }, STAGE_MS);
    return () => window.clearInterval(timer);
  }, [answered, phase, roundIndex]);

  const start = useCallback(() => {
    setRounds(buildRounds(albums));
    setRoundIndex(0);
    setStage(0);
    setPicked(null);
    setScore(0);
    setCorrectCount(0);
    setPhase("playing");
  }, [albums]);

  const pick = (album: Album) => {
    if (!round || answered) return;
    setPicked(album);
    const correct = album === round.answer;
    const points = correct ? STAGE_POINTS[stage] : 0;
    setLastPoints(points);
    setStage(STAGES.length - 1);
    if (correct) {
      setScore((current) => current + points);
      setCorrectCount((current) => current + 1);
    }
  };

  const next = () => {
    if (isLastRound) {
      setPhase("over");
      if (score > readBestScore()) {
        window.localStorage.setItem(BEST_SCORE_KEY, String(score));
        window.dispatchEvent(new Event(BEST_SCORE_EVENT));
      }
      return;
    }
    setRoundIndex((current) => current + 1);
    setStage(0);
    setPicked(null);
  };

  const revealMore = () => {
    setStage((current) => Math.min(current + 1, STAGES.length - 1));
  };

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      <div
        className={cn(
          "flex items-center justify-end gap-6 text-sm text-spotify-subtext",
          phase === "idle" && "invisible"
        )}
      >
        {phase === "playing" && (
          <span>
            Round{" "}
            <span className="text-white">
              {roundIndex + 1}/{rounds.length}
            </span>
          </span>
        )}
        <span>
          Score <span className="text-white">{score}</span>
        </span>
        <span>
          Best <span className="text-white">{Math.max(best, score)}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        {phase === "playing" && round ? (
          <>
            <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-xl border border-white/10 shadow-[0_0_40px_rgb(29_185_84/0.15)]">
              <PixelatedCover
                src={round.answer.imageUrl}
                pixels={STAGES[stage]}
              />
              {!answered && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                  <div
                    key={`${roundIndex}-${stage}`}
                    className="h-full bg-spotify-green"
                    style={{
                      animation:
                        stage < STAGES.length - 1
                          ? `pixel-reveal-timer ${STAGE_MS}ms linear forwards`
                          : undefined,
                    }}
                  />
                </div>
              )}
            </div>
            <style>{`
              @keyframes pixel-reveal-timer {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>

            <div className="flex items-center gap-3 text-sm text-spotify-subtext">
              {answered ? (
                <span
                  className={cn(
                    "font-medium",
                    lastPoints > 0 ? "text-spotify-green" : "text-red-400"
                  )}
                >
                  {lastPoints > 0
                    ? `Correct! +${lastPoints}`
                    : `It was ${round.answer.albumName}`}
                </span>
              ) : (
                <>
                  <span>
                    Worth{" "}
                    <span className="text-white">{STAGE_POINTS[stage]}</span>{" "}
                    points
                  </span>
                  {stage < STAGES.length - 1 && (
                    <button
                      type="button"
                      onClick={revealMore}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-white transition-colors hover:bg-white/10"
                    >
                      Reveal more <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
              {round.options.map((album) => {
                const isAnswer = album === round.answer;
                const isPicked = album === picked;
                return (
                  <button
                    key={album.imageUrl}
                    type="button"
                    disabled={answered}
                    onClick={() => pick(album)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                      !answered &&
                        "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                      answered &&
                        isAnswer &&
                        "border-spotify-green/60 bg-spotify-green/15",
                      answered &&
                        isPicked &&
                        !isAnswer &&
                        "border-red-400/60 bg-red-400/15",
                      answered &&
                        !isAnswer &&
                        !isPicked &&
                        "border-white/5 bg-white/[0.02] opacity-50"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">
                        {album.albumName}
                      </span>
                      <span className="block truncate text-xs text-spotify-subtext">
                        {album.artistName}
                      </span>
                    </span>
                    {answered && isAnswer && (
                      <Check className="h-4 w-4 shrink-0 text-spotify-green" />
                    )}
                    {answered && isPicked && !isAnswer && (
                      <X className="h-4 w-4 shrink-0 text-red-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {answered && (
              <button
                type="button"
                onClick={next}
                className="rounded-full bg-spotify-green px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                {isLastRound ? "See results" : "Next cover"}
              </button>
            )}
          </>
        ) : phase === "over" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-4xl font-black text-white">{score}</p>
            <p className="text-sm text-spotify-subtext">
              You recognised {correctCount} of {rounds.length} covers.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/15"
            >
              Play again <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        ) : isLoading ? (
          <PixelRevealSkeleton />
        ) : (
          <PixelRevealIntro albums={albums} best={best} onStart={start} />
        )}
      </div>
    </div>
  );
}
