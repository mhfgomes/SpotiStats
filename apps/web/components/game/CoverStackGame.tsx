"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { RotateCcw, Play } from "lucide-react";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiveTopTrack } from "@/lib/spotify-live";

const SIZE = 180;
const HEIGHT = 22;
const TRAVEL = SIZE * 1.3;
const BEST_SCORE_KEY = "spotistats:cover-stack:best";

type Difficulty = "easy" | "normal" | "hard";

const DIFFICULTIES: Record<
  Difficulty,
  { label: string; speed: number; ramp: number; perfectTolerance: number }
> = {
  easy: { label: "Easy", speed: 0.12, ramp: 0.005, perfectTolerance: 9 },
  normal: { label: "Normal", speed: 0.18, ramp: 0.008, perfectTolerance: 5 },
  hard: { label: "Hard", speed: 0.26, ramp: 0.011, perfectTolerance: 3 },
};

// Normal keeps the original key so existing best scores carry over.
function bestScoreKey(difficulty: Difficulty) {
  return difficulty === "normal"
    ? BEST_SCORE_KEY
    : `${BEST_SCORE_KEY}:${difficulty}`;
}

type Axis = "x" | "y";

interface Slab {
  id: number;
  x: number;
  y: number;
  w: number;
  d: number;
  level: number;
  /** Footprint the cover art is stretched over; defaults to the slab itself. */
  art?: { x: number; y: number; w: number; d: number };
}

interface Debris extends Slab {
  axis: Axis;
  direction: 1 | -1;
}

interface Cover {
  imageUrl?: string;
  trackName: string;
  artistName: string;
}

type Phase = "idle" | "playing" | "over";

const FALLBACK_COVERS: Cover[] = [
  { trackName: "Your top tracks", artistName: "SpotiStats" },
];

function SlabView({
  slab,
  cover,
  loading = false,
  className,
}: {
  slab: Slab;
  cover: Cover;
  loading?: boolean;
  className?: string;
}) {
  const image = loading
    ? "linear-gradient(#2a2a2a, #2a2a2a)"
    : cover.imageUrl
      ? `url("${cover.imageUrl}")`
      : "linear-gradient(135deg, #1DB954, #0f5f2d)";
  // Pulse each face rather than the slab: opacity on the 3D container would
  // flatten it.
  const pulse = loading ? " animate-pulse" : "";
  // The cover travels with its slab; once trimmed, the remaining piece keeps
  // showing the matching slice of the artwork.
  const art = slab.art ?? slab;
  const offsetX = slab.x - art.x;
  const offsetY = slab.y - art.y;
  const topStyle = {
    backgroundImage: image,
    backgroundSize: `${art.w}px ${art.d}px`,
    backgroundPosition: `${-offsetX}px ${-offsetY}px`,
    backgroundRepeat: "no-repeat",
  };
  // Sides extrude the cover's edge pixels so each slab reads as a solid block.
  const frontRow = Math.min(Math.max(offsetY + slab.d - 1, 0), art.d - 1);
  const leftColumn = Math.min(Math.max(offsetX, 0), art.w - 1);
  const frontStyle = {
    backgroundImage: `linear-gradient(rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.05)), ${image}`,
    backgroundSize: `100% 100%, ${art.w}px ${art.d * HEIGHT}px`,
    backgroundPosition: `0 0, ${-offsetX}px ${-frontRow * HEIGHT}px`,
    backgroundRepeat: "no-repeat",
  };
  const leftStyle = {
    backgroundImage: `linear-gradient(to right, rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.3)), ${image}`,
    backgroundSize: `100% 100%, ${art.w * HEIGHT}px ${art.d}px`,
    backgroundPosition: `0 0, ${-leftColumn * HEIGHT}px ${-offsetY}px`,
    backgroundRepeat: "no-repeat",
  };

  return (
    <div
      className={`absolute [transform-style:preserve-3d] ${className ?? ""}`}
      style={{
        left: slab.x,
        top: slab.y,
        width: slab.w,
        height: slab.d,
        transform: `translateZ(${slab.level * HEIGHT}px)`,
      }}
    >
      <div
        className={`absolute inset-0 rounded-[4px]${pulse}`}
        style={{
          ...topStyle,
          transform: `translateZ(${HEIGHT}px)`,
          boxShadow:
            "inset 0 0 0 1px rgb(255 255 255 / 0.18), inset 0 0 24px rgb(255 255 255 / 0.06)",
        }}
      />
      {/* Front (+y) face */}
      <div
        className={`absolute left-0 shadow-[inset_0_-1px_0_rgb(255_255_255/0.3)]${pulse}`}
        style={{
          ...frontStyle,
          top: slab.d,
          width: slab.w,
          height: HEIGHT,
          transform: "rotateX(90deg)",
          transformOrigin: "top",
        }}
      />
      {/* Left (-x) face. Built as a rotated wall with transposed content
          because Firefox drops a plain rotateY(-90deg) face. */}
      <div
        className="absolute left-0 top-0"
        style={{
          width: slab.d,
          height: HEIGHT,
          transform: "rotateZ(90deg) rotateX(90deg)",
          transformOrigin: "top left",
        }}
      >
        <div
          className={`absolute left-0 top-0 shadow-[inset_-1px_0_0_rgb(255_255_255/0.25)]${pulse}`}
          style={{
            ...leftStyle,
            width: HEIGHT,
            height: slab.d,
            transform: "matrix(0, 1, 1, 0, 0, 0)",
            transformOrigin: "0 0",
          }}
        />
      </div>
    </div>
  );
}

const SHUFFLED_LENGTH = 240;

function uniqueAlbumCovers(tracks: LiveTopTrack[]): Cover[] {
  const seen = new Set<string>();
  const covers: Cover[] = [];
  for (const track of tracks) {
    if (!track.albumImageUrl || seen.has(track.albumImageUrl)) continue;
    seen.add(track.albumImageUrl);
    covers.push({
      imageUrl: track.albumImageUrl,
      trackName: track.trackName,
      artistName: track.artistNames.join(", "),
    });
  }
  return covers.length > 0 ? covers : FALLBACK_COVERS;
}

/**
 * Random cover order that uses every album once before reshuffling and never
 * puts the same album on two adjacent layers.
 */
function shuffledOrder(count: number): number[] {
  const order: number[] = [];
  while (order.length < SHUFFLED_LENGTH) {
    const round = Array.from({ length: count }, (_, index) => index);
    for (let i = round.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [round[i], round[j]] = [round[j], round[i]];
    }
    if (count > 1 && round[0] === order[order.length - 1]) {
      [round[0], round[1]] = [round[1], round[0]];
    }
    order.push(...round);
  }
  return order;
}

const BEST_SCORE_EVENT = "cover-stack-best";

function readBestScore(difficulty: Difficulty) {
  return Number(window.localStorage.getItem(bestScoreKey(difficulty))) || 0;
}

function subscribeBestScore(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(BEST_SCORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(BEST_SCORE_EVENT, onChange);
  };
}

export function CoverStackGame() {
  const { data, isLoading } = useSpotifyTopData("short_term");
  const covers = useMemo<Cover[]>(
    () =>
      data && data.tracks.length > 0 ? uniqueAlbumCovers(data.tracks) : FALLBACK_COVERS,
    [data]
  );
  const [order, setOrder] = useState<number[]>([]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [stack, setStack] = useState<Slab[]>(() => [
    { id: 0, x: 0, y: 0, w: SIZE, d: SIZE, level: 0 },
  ]);
  const [moving, setMoving] = useState<(Slab & { axis: Axis }) | null>(null);
  const [debris, setDebris] = useState<Debris[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [perfect, setPerfect] = useState<{
    id: number;
    slab: Slab;
    combo: number;
    points: number;
  } | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const settings = DIFFICULTIES[difficulty];
  const best = useSyncExternalStore(
    subscribeBestScore,
    () => readBestScore(difficulty),
    () => 0
  );

  const offsetRef = useRef(-TRAVEL);
  const directionRef = useRef(1);
  const idRef = useRef(1);

  const coverForLevel = useCallback(
    (level: number) => {
      const index = order.length > 0 ? order[level % order.length] : level;
      return covers[index % covers.length];
    },
    [covers, order]
  );

  const spawn = useCallback((top: Slab) => {
    const level = top.level + 1;
    const axis: Axis = level % 2 === 0 ? "x" : "y";
    offsetRef.current = -TRAVEL;
    directionRef.current = 1;
    setMoving({
      ...top,
      id: idRef.current++,
      level,
      axis,
      art: undefined,
      [axis]: top[axis] - TRAVEL,
    });
  }, []);

  const start = useCallback(() => {
    const base: Slab = {
      id: idRef.current++,
      x: 0,
      y: 0,
      w: SIZE,
      d: SIZE,
      level: 0,
    };
    setOrder(shuffledOrder(covers.length));
    setStack([base]);
    setDebris([]);
    setPerfect(null);
    setScore(0);
    setCombo(0);
    setPhase("playing");
    spawn(base);
  }, [covers.length, spawn]);

  // Slide the active slab back and forth, speeding up as the stack grows.
  useEffect(() => {
    if (phase !== "playing" || !moving) return;
    let frame = 0;
    let last = performance.now();
    const speed = settings.speed + Math.min(moving.level, 40) * settings.ramp;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 32);
      last = now;
      let next = offsetRef.current + directionRef.current * speed * dt;
      if (next > TRAVEL) {
        next = TRAVEL;
        directionRef.current = -1;
      } else if (next < -TRAVEL) {
        next = -TRAVEL;
        directionRef.current = 1;
      }
      offsetRef.current = next;
      setMoving((current) => {
        if (!current) return current;
        const top = stack[stack.length - 1];
        return { ...current, [current.axis]: top[current.axis] + next };
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Restart the loop only when a new slab spawns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, moving?.id]);

  const finish = useCallback(
    (finalScore: number) => {
      setPhase("over");
      setMoving(null);
      if (finalScore > readBestScore(difficulty)) {
        window.localStorage.setItem(
          bestScoreKey(difficulty),
          String(finalScore)
        );
        window.dispatchEvent(new Event(BEST_SCORE_EVENT));
      }
    },
    [difficulty]
  );

  const drop = useCallback(() => {
    if (phase !== "playing" || !moving) return;
    const top = stack[stack.length - 1];
    const axis = moving.axis;
    const sizeKey = axis === "x" ? "w" : "d";
    const delta = moving[axis] - top[axis];
    const overlap = top[sizeKey] - Math.abs(delta);

    if (overlap <= 0) {
      setDebris((items) => [
        ...items,
        { ...moving, axis, direction: delta > 0 ? 1 : -1 },
      ]);
      finish(score);
      return;
    }

    let placed: Slab;
    let nextCombo = 0;
    const art = { x: moving.x, y: moving.y, w: moving.w, d: moving.d };
    if (Math.abs(delta) <= settings.perfectTolerance) {
      placed = { ...moving, x: top.x, y: top.y };
      nextCombo = combo + 1;
    } else {
      placed = {
        ...moving,
        art,
        [axis]: Math.max(moving[axis], top[axis]),
        [sizeKey]: overlap,
      };
      const cutStart = delta > 0 ? top[axis] + top[sizeKey] : moving[axis];
      setDebris((items) => [
        ...items.slice(-6),
        {
          ...moving,
          art,
          id: idRef.current++,
          [axis]: cutStart,
          [sizeKey]: Math.abs(delta),
          axis,
          direction: delta > 0 ? 1 : -1,
        },
      ]);
    }

    const nextScore = score + 10 + nextCombo * 5;
    setCombo(nextCombo);
    if (nextCombo > 0) {
      setPerfect({
        id: idRef.current++,
        slab: placed,
        combo: nextCombo,
        points: nextScore - score,
      });
    }
    setScore(nextScore);
    setStack((items) => [...items, placed]);
    spawn(placed);
  }, [combo, finish, moving, phase, score, settings, spawn, stack]);

  const handleAction = useCallback(() => {
    if (phase === "playing") drop();
    else if (!isLoading) start();
  }, [drop, isLoading, phase, start]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "Enter") return;
      if (event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      handleAction();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAction]);

  const layers = stack.length - 1;
  const topSlab = moving ?? stack[stack.length - 1];
  const visible = stack.slice(-14);
  // Keep the top of the stack centered as it grows.
  const cameraOffset = topSlab.level * HEIGHT * 0.5;

  return (
    <div className="relative flex h-[calc(100vh-9rem)] min-h-[32rem] flex-col">
      <style>{`
        @keyframes cover-stack-fall {
          to { transform: translate3d(var(--fx), var(--fy), -600px); opacity: 0; }
        }
        @keyframes cover-stack-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes cover-stack-perfect {
          0% { transform: translate(-50%, 8px) scale(0.6); opacity: 0; }
          20% { transform: translate(-50%, 0) scale(1.12); opacity: 1; }
          35% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -36px) scale(1); opacity: 0; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-spotify-subtext">
        <div
          role="radiogroup"
          aria-label="Difficulty"
          className="flex rounded-full border border-white/10 bg-white/5 p-1"
        >
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={difficulty === level}
              disabled={phase === "playing"}
              onClick={() => {
                setDifficulty(level);
                if (phase === "over") setPhase("idle");
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                difficulty === level
                  ? "bg-spotify-green text-black"
                  : "text-spotify-subtext hover:text-white disabled:hover:text-spotify-subtext"
              }`}
            >
              {DIFFICULTIES[level].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <span>
            <span className="text-white">{layers}</span> layers
          </span>
          <span>
            Score <span className="text-white">{score}</span>
          </span>
          <span>
            Best <span className="text-white">{Math.max(best, score)}</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        onPointerDown={(event) => {
          if (event.button === 0) handleAction();
        }}
        onClick={(event) => event.preventDefault()}
        className="relative flex-1 cursor-pointer select-none overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,rgb(255_255_255/0.07),transparent_65%)] outline-none"
        aria-label={phase === "playing" ? "Drop cover" : "Start game"}
        tabIndex={-1}
      >
        <div
          className="absolute left-1/2 top-[55%] transition-transform duration-300 ease-out"
          style={{ transform: `translateY(${cameraOffset}px)` }}
        >
          <div
            className="relative [transform-style:preserve-3d]"
            style={{
              width: SIZE,
              height: SIZE,
              marginLeft: -SIZE / 2,
              marginTop: -SIZE / 2,
              transform: "rotateX(58deg) rotateZ(-45deg)",
            }}
          >
            <div
              className="absolute rounded-xl bg-black/40 blur-xl"
              style={{
                inset: -20,
                transform: `translateZ(${(visible[0]?.level ?? 0) * HEIGHT - 2}px)`,
              }}
            />
            {visible.map((slab) => (
              <SlabView
                key={slab.id}
                slab={slab}
                cover={coverForLevel(slab.level)}
                loading={isLoading}
              />
            ))}
            {moving && (
              <SlabView slab={moving} cover={coverForLevel(moving.level)} />
            )}
            {debris.map((piece) => (
              <div
                key={piece.id}
                className="absolute inset-0 [transform-style:preserve-3d]"
                style={
                  {
                    "--fx": piece.axis === "x" ? `${piece.direction * 60}px` : "0px",
                    "--fy": piece.axis === "y" ? `${piece.direction * 60}px` : "0px",
                    animation: "cover-stack-fall 900ms ease-in forwards",
                  } as React.CSSProperties
                }
              >
                <SlabView slab={piece} cover={coverForLevel(piece.level)} />
              </div>
            ))}
            {perfect && (
              <div
                key={perfect.id}
                className="pointer-events-none absolute"
                style={{
                  left: perfect.slab.x,
                  top: perfect.slab.y,
                  width: perfect.slab.w,
                  height: perfect.slab.d,
                  transform: `translateZ(${(perfect.slab.level + 1) * HEIGHT + 1}px)`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-md border-2 border-white/90"
                  style={{
                    boxShadow: "0 0 24px #1DB954, inset 0 0 16px #1DB954",
                    animation: "cover-stack-ring 650ms ease-out forwards",
                  }}
                />
              </div>
            )}
          </div>
        </div>
        {perfect && (
          <div
            key={perfect.id}
            className="pointer-events-none absolute left-1/2 top-[18%] whitespace-nowrap text-center"
            style={{ animation: "cover-stack-perfect 1100ms ease-out forwards" }}
          >
            <span className="text-2xl font-black uppercase tracking-wider text-spotify-green drop-shadow-[0_0_12px_rgb(29_185_84/0.6)]">
              Perfect{perfect.combo > 1 ? ` ×${perfect.combo}` : "!"}
            </span>
            <span className="ml-2 text-sm font-semibold text-white/80">
              +{perfect.points}
            </span>
          </div>
        )}
      </button>

      <div className="flex min-h-[7rem] flex-col items-center gap-3 pb-4 text-center">
        {phase === "playing" && moving && (
          <p className="text-sm text-spotify-subtext">
            <span className="text-white">{coverForLevel(moving.level).trackName}</span>
            {" · "}
            {coverForLevel(moving.level).artistName}
            {combo > 1 && (
              <span className="ml-2 text-spotify-green">Perfect ×{combo}</span>
            )}
          </p>
        )}
        {phase === "idle" && isLoading && (
          <div
            className="flex flex-col items-center gap-3"
            aria-busy="true"
            aria-label="Loading your covers"
          >
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        )}
        {phase === "idle" && !isLoading && (
          <>
            <p className="text-sm text-spotify-subtext">
              Stack your top album covers. Click or press Space to drop.
            </p>
            <button
              type="button"
              onClick={start}
              className="flex items-center gap-2 rounded-full bg-spotify-green px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              Start stacking <Play className="h-4 w-4" />
            </button>
          </>
        )}
        {phase === "over" && (
          <>
            <p className="text-sm text-white">
              Stacked {layers} {layers === 1 ? "cover" : "covers"}.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={start}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/15"
              >
                Stack again <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
