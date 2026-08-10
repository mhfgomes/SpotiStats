"use client";

import { Suspense, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PreviewResult =
  | { status: "ok"; url: string }
  | { status: "error"; message: string };

const previewPromises = new Map<string, Promise<PreviewResult>>();

function loadPreview(src: string): Promise<PreviewResult> {
  const cached = previewPromises.get(src);
  if (cached) return cached;

  const promise = fetch(src)
    .then(async (res) => {
      if (!res.ok) {
        return {
          status: "error" as const,
          message: `Preview failed (${res.status})`,
        };
      }
      const blob = await res.blob();
      return { status: "ok" as const, url: URL.createObjectURL(blob) };
    })
    .catch(() => ({
      status: "error" as const,
      message: "Preview failed to load",
    }));

  previewPromises.set(src, promise);
  return promise;
}

function PreviewSkeleton({
  aspectRatio,
  className,
}: {
  aspectRatio: string;
  className?: string;
}) {
  return (
    <Skeleton
      className={cn(
        "w-full rounded-xl border border-white/8 bg-white/10",
        className
      )}
      style={{ aspectRatio }}
    />
  );
}

function CardPreviewImage({
  src,
  alt,
  aspectRatio,
  className,
}: {
  src: string;
  alt: string;
  aspectRatio: string;
  className?: string;
}) {
  const result = use(loadPreview(src));

  if (result.status === "error") {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-xl border border-white/8 bg-black/20 text-sm text-muted-foreground",
          className
        )}
        style={{ aspectRatio }}
      >
        {result.message}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/8 bg-black/20",
        className
      )}
      style={{ aspectRatio }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={result.url}
        alt={alt}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

interface CardPreviewProps {
  src: string;
  alt: string;
  aspectRatio: string;
  className?: string;
}

export function CardPreview({
  src,
  alt,
  aspectRatio,
  className,
}: CardPreviewProps) {
  return (
    <Suspense
      fallback={<PreviewSkeleton aspectRatio={aspectRatio} className={className} />}
    >
      <CardPreviewImage
        src={src}
        alt={alt}
        aspectRatio={aspectRatio}
        className={className}
      />
    </Suspense>
  );
}
