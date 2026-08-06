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
import { useSidebar } from "@/components/layout/sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

function NavSectionLabel({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  if (collapsed) return null;
  return (
    <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">
      {children}
    </p>
  );
}

function SidebarNavLink({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
  ariaCurrent,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  ariaCurrent?: "page";
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        "sidebar-link",
        isActive && "active",
        collapsed && "justify-center px-0"
      )}
      aria-current={ariaCurrent}
      aria-label={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebar();
  const isStatsCardSection =
    pathname.startsWith("/stats-card") && pathname !== "/stats-card/recap";

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/5 bg-spotify-dark transition-[width] duration-200 ease-out",
          collapsed ? "w-16" : "w-60"
        )}
        data-collapsed={collapsed || undefined}
      >
        {/* Logo / collapse toggle */}
        <div
          className={cn(
            "flex h-[73px] items-center border-b border-white/5",
            collapsed ? "justify-center px-2" : "gap-2 px-6"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spotify-green transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-dark"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
              >
                <Music2 className="h-4 w-4 text-black" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight">SpotiStats</span>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 space-y-1 overflow-y-auto overflow-x-hidden py-3",
            collapsed ? "px-2" : "px-3"
          )}
          aria-label="Main"
        >
          <NavSectionLabel collapsed={collapsed}>Explore</NavSectionLabel>
          {exploreNavItems.map(({ href, icon, label }) => {
            const isActive = pathname === href;
            return (
              <SidebarNavLink
                key={href}
                href={href}
                icon={icon}
                label={label}
                isActive={isActive}
                collapsed={collapsed}
                ariaCurrent={isActive ? "page" : undefined}
              />
            );
          })}

          <NavSectionLabel collapsed={collapsed}>Share</NavSectionLabel>
          {shareNavItems.map(({ href, icon, label }) => {
            const isActive = pathname === href;
            return (
              <SidebarNavLink
                key={href}
                href={href}
                icon={icon}
                label={label}
                isActive={isActive}
                collapsed={collapsed}
                ariaCurrent={isActive ? "page" : undefined}
              />
            );
          })}

          {/* Stats Card section */}
          <div className={cn(!collapsed && "pt-1")}>
            <SidebarNavLink
              href="/stats-card"
              icon={ImageIcon}
              label="Stats Cards"
              isActive={isStatsCardSection}
              collapsed={collapsed}
              ariaCurrent={
                pathname === "/stats-card/classic" ? "page" : undefined
              }
            />
            {!collapsed && (
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
                      <Icon
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div
          className={cn(
            "border-t border-white/5 py-3",
            collapsed ? "px-2" : "px-3"
          )}
        >
          <SidebarNavLink
            href="/account"
            icon={User}
            label="Account"
            isActive={pathname === "/account"}
            collapsed={collapsed}
            ariaCurrent={pathname === "/account" ? "page" : undefined}
          />
        </div>
      </aside>
    </TooltipProvider>
  );
}
