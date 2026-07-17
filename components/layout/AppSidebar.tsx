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
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const exploreNavItems = [
  { href: "/top-tracks", icon: Music2, label: "Top Tracks" },
  { href: "/top-artists", icon: Mic2, label: "Top Artists" },
  { href: "/top-genres", icon: BarChart3, label: "Top Genres" },
  { href: "/history", icon: History, label: "History" },
  { href: "/taste-profile", icon: Radio, label: "Taste Profile" },
];

const shareNavItems = [
  { href: "/stats-card/recap", icon: CreditCard, label: "Recap Card" },
];

const statsCardItems = [
  { href: "/stats-card/classic", icon: LayoutTemplate, label: "Classic" },
  { href: "/stats-card/tracks", icon: ListMusic, label: "Tracks" },
  { href: "/stats-card/artists", icon: Users, label: "Artists" },
  { href: "/stats-card/compact", icon: Square, label: "Compact" },
  { href: "/stats-card/now-playing", icon: Headphones, label: "Now Playing" },
];

function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">
      {children}
    </p>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const isStatsCardSection =
    pathname.startsWith("/stats-card") && pathname !== "/stats-card/recap";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-white/5 bg-spotify-dark">
      {/* Logo */}
      <div className="flex h-[73px] items-center gap-2 border-b border-white/5 px-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spotify-green">
          <Music2 className="h-4 w-4 text-black" aria-hidden="true" />
        </div>
        <span className="text-base font-bold tracking-tight">SpotiStats</span>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-3"
        aria-label="Main"
      >
        <NavSectionLabel>Explore</NavSectionLabel>
        {exploreNavItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", isActive && "active")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}

        <NavSectionLabel>Share</NavSectionLabel>
        {shareNavItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", isActive && "active")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}

        {/* Stats Card section */}
        <div className="pt-1">
          <Link
            href="/stats-card"
            className={cn(
              "sidebar-link",
              isStatsCardSection && "active"
            )}
            aria-current={pathname === "/stats-card/classic" ? "page" : undefined}
          >
            <ImageIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">Stats Cards</span>
          </Link>
          <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
            {statsCardItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-spotify-subtext hover:bg-white/5 hover:text-white"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/5 px-3 py-3">
        <Link
          href="/account"
          className={cn("sidebar-link", pathname === "/account" && "active")}
          aria-current={pathname === "/account" ? "page" : undefined}
        >
          <User className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">Account</span>
        </Link>
      </div>
    </aside>
  );
}
