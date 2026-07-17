"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardPreviewImageProps {
  src: string;
  alt: string;
  aspectRatio: string;
  previewKey: number;
  onRetry: () => void;
}

export function CardPreviewImage({
  src,
  alt,
  aspectRatio,
  previewKey,
  onRetry,
}: CardPreviewImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src, previewKey]);

  if (failed) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-10 text-center"
        style={{ aspectRatio }}
        role="alert"
      >
        <AlertCircle className="h-5 w-5 text-rose-300" aria-hidden="true" />
        <div>
          <p className="text-sm text-spotify-subtext">Preview failed to load.</p>
          <p className="mt-1 text-xs text-spotify-subtext/80">
            Check that your site URL is configured, then try again.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry preview
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-black/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${src}-${previewKey}`}
        src={src}
        alt={alt}
        className="w-full"
        style={{ aspectRatio }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
