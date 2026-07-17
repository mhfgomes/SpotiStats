"use client";

import { useState } from "react";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecapDownloadButtonProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export function RecapDownloadButton({ cardRef }: RecapDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!cardRef.current || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // 2x for retina
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `spotistats-recap-${new Date().getFullYear()}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error("Failed to generate recap image:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate the PNG. Try refreshing and downloading again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        className="h-11 rounded-xl px-5"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download PNG
          </>
        )}
      </Button>
      {error ? (
        <p
          className="flex max-w-sm items-start gap-1.5 text-xs text-rose-300"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
