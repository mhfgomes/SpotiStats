"use client";

import { useEffect } from "react";
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
  { href: "/top-tracks",    icon: Music2,    label: "Top Tracks" },
  { href: "/top-artists",   icon: Mic2,      label: "Top Artists" },
  { href: "/top-genres",    icon: BarChart3, label: "Top Genres" },
  { href: "/history",       icon: History,   label: "History" },
  { href: "/taste-profile", icon: Radio,     label: "Taste Profile" },
];

const statsCardItems = [
  { href: "/stats-card/classic",     icon: LayoutTemplate, label: "Classic" },
  { href: "/stats-card/tracks",      icon: ListMusic,      label: "Tracks" },
  { href: "/stats-card/artists",     icon: Users,          label: "Artists" },
  { href: "/stats-card/compact",     icon: Square,         label: "Compact" },
  { href: "/stats-card/now-playing", icon: Headphones,     label: "Now Playing" },
  { href: "/stats-card/recap",       icon: CreditCard,     label: "Recap Card" },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const isStatsCard = pathname.startsWith("/stats-card");

  // Close the mobile drawer after navigating to another page
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/5 bg-spotify-dark transition-transform duration-200 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-[73px] items-center gap-2 border-b border-white/5 px-6">
          <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center shrink-0">
            <Music2 className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-base tracking-tight">SpotiStats</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ml-auto rounded-lg p-1.5 text-spotify-subtext transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {mainNavItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", pathname === href && "active")}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}

          {/* Stats Card section */}
          <div className="pt-2">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                isStatsCard
                  ? "text-white"
                  : "text-spotify-subtext"
              )}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Stats Card</span>
            </div>
            <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
              {statsCardItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    pathname === href
                      ? "bg-white/10 text-white"
                      : "text-spotify-subtext hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
