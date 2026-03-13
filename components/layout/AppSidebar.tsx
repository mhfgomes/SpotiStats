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
  LogOut,
  LayoutTemplate,
  ListMusic,
  Users,
  Square,
  Headphones,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";
import Image from "next/image";

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

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isStatsCard = pathname.startsWith("/stats-card");

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-spotify-dark flex flex-col z-30 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2 border-b border-white/5">
        <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center shrink-0">
          <Music2 className="w-4 h-4 text-black" />
        </div>
        <span className="font-bold text-base tracking-tight">SpotiStats</span>
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

      {/* User + Sign Out */}
      <div className="px-3 py-4 border-t border-white/5">
        {session?.user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={32}
                height={32}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-spotify-card flex items-center justify-center shrink-0">
                <span className="text-xs font-bold">
                  {session.user.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-spotify-subtext truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="sidebar-link w-full text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
