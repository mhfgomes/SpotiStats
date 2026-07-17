"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const spotifyUser = useQuery(api.users.getSpotifyUser);
  const initUserSync = useAction(api.users.initUserSync);
  const syncTriggered = useRef(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Trigger initial sync when logged in but spotifyUsers row doesn't exist yet
  useEffect(() => {
    if (session && spotifyUser === null && !syncTriggered.current) {
      syncTriggered.current = true;
      initUserSync().catch(console.error);
    }
  }, [session, spotifyUser, initUserSync]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-spotify-black">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-spotify-green border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!session) return null;

  return <DashboardShell>{children}</DashboardShell>;
}
