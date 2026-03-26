"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown, LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_TITLES: Record<string, string> = {
  "/top-tracks": "Top Tracks",
  "/top-artists": "Top Artists",
  "/top-genres": "Top Genres",
  "/history": "Listening History",
  "/taste-profile": "Taste Profile",
  "/recap": "Year in Music",
  "/stats-card/classic":     "Classic Card",
  "/stats-card/tracks":      "Tracks Card",
  "/stats-card/artists":     "Artists Card",
  "/stats-card/compact":     "Compact Card",
  "/stats-card/now-playing": "Now Playing Banner",
  "/stats-card/recap":       "Recap Card",
};

export function TopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = PAGE_TITLES[pathname] ?? "SpotiStats";

  return (
    <header className="sticky top-0 z-20 flex h-[73px] items-center justify-between border-b border-white/5 bg-spotify-black/80 px-6 backdrop-blur">
      <h1 className="text-lg font-bold">{title}</h1>
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-1.5 text-left transition-colors hover:border-white/15 hover:bg-white/[0.05]">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={30}
                  height={30}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-spotify-card shrink-0">
                  <span className="text-xs font-bold">
                    {session.user.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{session.user.name}</p>
                <p className="truncate text-[11px] text-spotify-subtext">
                  {session.user.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-spotify-subtext" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut()}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </header>
  );
}
