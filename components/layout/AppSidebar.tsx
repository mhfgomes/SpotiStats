"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Music2,
  Mic2,
  BarChart3,
  History,
  Radio,
  ImageIcon,
  LayoutTemplate,
  ListMusic,
  Users,
  Square,
  Headphones,
  CreditCard,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/top-tracks", icon: Music2, label: "Top Tracks" },
  { href: "/top-artists", icon: Mic2, label: "Top Artists" },
  { href: "/top-genres", icon: BarChart3, label: "Top Genres" },
  { href: "/history", icon: History, label: "History" },
  { href: "/taste-profile", icon: Radio, label: "Taste Profile" },
];

const statsCardItems = [
  { href: "/stats-card/classic", icon: LayoutTemplate, label: "Classic" },
  { href: "/stats-card/tracks", icon: ListMusic, label: "Tracks" },
  { href: "/stats-card/artists", icon: Users, label: "Artists" },
  { href: "/stats-card/compact", icon: Square, label: "Compact" },
  { href: "/stats-card/now-playing", icon: Headphones, label: "Now Playing" },
  { href: "/stats-card/recap", icon: CreditCard, label: "Recap Card" },
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const isStatsCard = pathname.startsWith("/stats-card");

  return (
    <aside
      id="app-sidebar"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/5 bg-spotify-dark transition-transform duration-200 ease-out",
        "md:translate-x-0 md:z-30",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-[73px] items-center justify-between gap-2 border-b border-white/5 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spotify-green">
            <Music2 className="h-4 w-4 text-black" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-tight">SpotiStats</span>
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-spotify-subtext transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green md:hidden"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Main"
      >
        {mainNavItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", isActive && "active")}
              aria-current={isActive ? "page" : undefined}
              onClick={onMobileClose}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}

        {/* Stats Card section */}
        <div className="pt-2">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              isStatsCard ? "text-white" : "text-spotify-subtext"
            )}
          >
            <ImageIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Stats Card</span>
          </div>
          <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
            {statsCardItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-spotify-subtext hover:bg-white/5 hover:text-white"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onMobileClose}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
