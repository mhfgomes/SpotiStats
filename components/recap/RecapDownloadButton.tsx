"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecapDownloadButtonProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export function RecapDownloadButton({ cardRef }: RecapDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || isGenerating) return;

    setIsGenerating(true);
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
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className="h-11 rounded-xl px-5"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download PNG
        </>
      )}
    </Button>
  );
}
