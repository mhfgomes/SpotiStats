"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/8 bg-black/20",
        className
      )}
      style={{ aspectRatio }}
    >
      {!isLoaded && (
        <Skeleton
          className="absolute inset-0 h-full w-full rounded-none"
          aria-hidden
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
      <span className="sr-only" aria-live="polite">
        {isLoaded ? alt : "Loading preview"}
      </span>
    </div>
  );
}
