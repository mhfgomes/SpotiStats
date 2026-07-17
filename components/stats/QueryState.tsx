"use client";

import { Music2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryStateProps {
  title: string;
  description?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  actionLabel?: string;
}

export function QueryErrorState({
  title,
  description,
  onRetry,
  isRetrying = false,
  actionLabel = "Try again",
}: QueryStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-5 py-16 text-center"
      role="alert"
    >
      <p className="text-sm text-spotify-subtext">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-xs text-spotify-subtext/80">{description}</p>
      ) : null}
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 rounded-full"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Retrying…" : actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function QueryEmptyState({
  title,
  description,
  onRetry,
  actionLabel = "Refresh",
}: QueryStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
        <Music2 className="h-4 w-4 text-spotify-subtext" aria-hidden="true" />
      </div>
      <p className="text-sm text-spotify-subtext">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-xs text-spotify-subtext/80">{description}</p>
      ) : null}
      {onRetry ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-4 rounded-full"
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
