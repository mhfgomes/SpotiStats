"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { signIn, signOut } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountOverviewCard } from "@/components/account/AccountOverviewCard";
import { SpotifyConnectionCard } from "@/components/account/SpotifyConnectionCard";
import { SessionListCard } from "@/components/account/SessionListCard";
import { DataSummaryCard } from "@/components/account/DataSummaryCard";
import type { FeedbackState } from "@/lib/account";

type ErrorBoundaryProps = {
  children: ReactNode;
  onRetry: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class AccountPageErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="spotify-card overflow-hidden px-5 py-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-3 text-sm font-medium text-white">
              Something went wrong
            </p>
            <p className="mt-1 text-xs text-spotify-subtext">
              Try again, or refresh the page.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AccountCardSkeleton({ tall }: { tall?: boolean }) {
  return (
    <section className="spotify-card overflow-hidden px-5 py-5">
      <div className="flex items-center gap-4">
        <Skeleton className={tall ? "h-16 w-16 rounded-full" : "h-10 w-10 rounded-xl"} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </div>
    </section>
  );
}

function AccountPageContent() {
  const data = useQuery(api.account.getAccountPageData);
  const getSessionLocations = useAction(api.account.getSessionLocations);
  const revokeOtherSessions = useMutation(api.account.revokeOtherSessions);
  const revokeSession = useMutation(api.account.revokeSession);
  const initUserSync = useAction(api.users.initUserSync);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [locationResult, setLocationResult] = useState<{
    key: string;
    locations: Record<string, string | null>;
  } | null>(null);
  const [refreshFeedback, setRefreshFeedback] = useState<FeedbackState>(null);
  const [sessionFeedback, setSessionFeedback] = useState<FeedbackState>(null);

  const sessionIps = Array.from(
    new Set(
      (data?.sessions ?? [])
        .map((session) => session.ipAddressMasked?.trim())
        .filter((ip): ip is string => Boolean(ip))
    )
  );
  const sessionIpsKey = sessionIps.join(",");
  const sessionLocations =
    sessionIps.length === 0 || locationResult?.key !== sessionIpsKey
      ? {}
      : locationResult.locations;
  const isLoadingLocations =
    sessionIps.length > 0 && locationResult?.key !== sessionIpsKey;

  useEffect(() => {
    if (!sessionIpsKey) {
      return;
    }

    let isCancelled = false;
    const key = sessionIpsKey;
    const ips = key.split(",");

    getSessionLocations({
      ips,
    })
      .then((results) => {
        if (isCancelled) return;
        setLocationResult({
          key,
          locations: Object.fromEntries(
            results.map((result) => [result.ip, result.locationLabel])
          ),
        });
      })
      .catch(() => {
        if (isCancelled) return;
        setLocationResult({ key, locations: {} });
      });

    return () => {
      isCancelled = true;
    };
  }, [sessionIpsKey, getSessionLocations]);

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    setRefreshFeedback(null);

    try {
      await initUserSync();
      setRefreshFeedback({
        type: "success",
        message: "Profile sync completed.",
      });
    } catch (error) {
      setRefreshFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Profile sync failed.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReconnect = () => {
    signIn.social({
      provider: "spotify",
      callbackURL: "/account",
    });
  };

  const handleRevokeOtherSessions = async () => {
    setIsRevoking(true);
    setPendingSessionId(null);
    setSessionFeedback(null);

    try {
      const result = await revokeOtherSessions();
      setSessionFeedback({
        type: "success",
        message:
          result.revokedCount === 0
            ? "No other sessions were active."
            : `Signed out ${result.revokedCount} other ${result.revokedCount === 1 ? "session" : "sessions"}.`,
      });
    } catch (error) {
      setSessionFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Session revocation failed.",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRevokeSession = async (sessionId: string, isCurrent: boolean) => {
    setSessionFeedback(null);

    if (isCurrent) {
      setPendingSessionId(sessionId);
      try {
        await signOut();
      } finally {
        setPendingSessionId(null);
      }
      return;
    }

    setPendingSessionId(sessionId);

    try {
      const result = await revokeSession({ sessionId });
      setSessionFeedback({
        type: result.revoked
          ? "success"
          : "error",
        message: result.revoked
          ? "Session signed out."
          : result.currentSession
            ? "Use the current-device sign out for this session."
            : "Session is no longer active.",
      });
    } catch (error) {
      setSessionFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Session revocation failed.",
      });
    } finally {
      setPendingSessionId(null);
    }
  };

  if (data === undefined) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <AccountCardSkeleton tall />
        <AccountCardSkeleton />
        <AccountCardSkeleton />
        <AccountCardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <AccountOverviewCard
        authUser={data.authUser}
        spotifyProfile={data.spotifyProfile}
        canRefreshProfile={data.spotifyAccount.connected}
        isRefreshing={isRefreshing}
        feedback={refreshFeedback}
        onRefreshProfile={handleRefreshProfile}
        onSignOut={() => signOut()}
      />

      <SpotifyConnectionCard
        spotifyAccount={data.spotifyAccount}
        spotifyProfile={data.spotifyProfile}
        isRefreshing={isRefreshing}
        feedback={refreshFeedback}
        onRefreshProfile={handleRefreshProfile}
        onReconnect={handleReconnect}
      />

      <SessionListCard
        sessions={data.sessions}
        isRevoking={isRevoking}
        pendingSessionId={pendingSessionId}
        isLoadingLocations={isLoadingLocations}
        sessionLocations={sessionLocations}
        feedback={sessionFeedback}
        onRevokeOtherSessions={handleRevokeOtherSessions}
        onRevokeSession={handleRevokeSession}
      />

      <DataSummaryCard dataSummary={data.dataSummary} />
    </div>
  );
}

export default function AccountPage() {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <AccountPageErrorBoundary onRetry={() => setRetryKey((value) => value + 1)}>
      <AccountPageContent key={retryKey} />
    </AccountPageErrorBoundary>
  );
}
