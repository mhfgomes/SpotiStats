"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { RecapCard } from "@/components/recap/RecapCard";
import { RecapDownloadButton } from "@/components/recap/RecapDownloadButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { THEME_SWATCHES } from "@/lib/themes";
import type { CardThemeKey } from "@/lib/themes";

export default function RecapCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [themeKey, setThemeKey] = useState<CardThemeKey>("ocean");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-spotify-subtext">
          Your Spotify stats from the last 4 weeks in a downloadable 400 × 600 card
        </p>
      </div>

      <div className="flex items-start gap-6 max-lg:flex-col">
        <aside className="w-72 shrink-0 max-lg:w-full">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Theme</CardTitle>
              <CardDescription>Pick the card finish before exporting.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={themeKey}
                onValueChange={(value) => setThemeKey(value as CardThemeKey)}
                className="grid grid-cols-3 gap-2"
              >
                {THEME_SWATCHES.map((swatch) => (
                  <Label
                    key={swatch.id}
                    htmlFor={`recap-theme-${swatch.id}`}
                    className="cursor-pointer"
                  >
                    <RadioGroupItem
                      id={`recap-theme-${swatch.id}`}
                      value={swatch.id}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "rounded-xl border border-white/8 bg-white/[0.03] p-2 transition-all hover:border-white/15 hover:bg-white/[0.06]",
                        themeKey === swatch.id &&
                          "border-primary/70 bg-primary/10 ring-1 ring-primary/40"
                      )}
                    >
                      <div
                        className="relative h-10 w-full overflow-hidden rounded-lg border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${swatch.bg1} 0%, ${swatch.bg2} 100%)`,
                        }}
                      >
                        <div
                          className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full"
                          style={{ background: swatch.dot }}
                        />
                        {themeKey === swatch.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Check className="h-4 w-4 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-center text-[11px] font-medium leading-none",
                          themeKey === swatch.id ? "text-white" : "text-muted-foreground"
                        )}
                      >
                        {swatch.label}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </aside>

        <div className="flex flex-1 flex-col items-center gap-6">
          <Card className="w-full max-w-[432px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle>Preview</CardTitle>
              <CardDescription>400 × 600 export canvas</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="overflow-hidden rounded-2xl border border-white/8 shadow-card-glow">
                <RecapCard cardRef={cardRef} themeKey={themeKey} />
              </div>
            </CardContent>
          </Card>
          <RecapDownloadButton cardRef={cardRef} />
        </div>
      </div>
    </div>
  );
}
