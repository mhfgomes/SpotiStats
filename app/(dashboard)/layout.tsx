"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";

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
    if (
      session &&
      spotifyUser === null &&
      !syncTriggered.current
    ) {
      syncTriggered.current = true;
      initUserSync().catch(console.error);
    }
  }, [session, spotifyUser, initUserSync]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
