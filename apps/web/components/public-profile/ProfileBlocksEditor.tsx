"use client";

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Headphones,
  LayoutGrid,
  List,
  Mic2,
  Music2,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import {
  BLOCK_TEXT_MAX_LENGTH,
  BLOCK_TITLE_MAX_LENGTH,
  MAX_PROFILE_BLOCKS,
  PROFILE_BLOCK_COUNTS,
  PROFILE_BLOCK_LABELS,
  PROFILE_BLOCK_TYPES,
  PROFILE_TIME_RANGES,
  createProfileBlock,
  isStatsBlock,
  type ProfileBlock,
  type ProfileBlockType,
} from "@/lib/profileBlocks";
import { cn, formatTimeRangeLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BLOCK_ICONS: Record<ProfileBlockType, typeof Music2> = {
  artists: Mic2,
  tracks: Music2,
  genres: BarChart3,
  nowPlaying: Headphones,
  text: Type,
};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-spotify-green/60";

function BlockCard({
  block,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  block: ProfileBlock;
  index: number;
  total: number;
  onChange: (block: ProfileBlock) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const Icon = BLOCK_ICONS[block.type];
  const update = (patch: Partial<ProfileBlock>) => onChange({ ...block, ...patch });

  return (
    <li className="space-y-3 rounded-lg border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-spotify-green" aria-hidden />
        <span className="flex-1 truncate text-sm font-medium text-white">
          {PROFILE_BLOCK_LABELS[block.type]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Move up"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="Move down"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:text-red-400"
          onClick={onRemove}
          aria-label="Remove block"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <input
        value={block.title ?? ""}
        onChange={(event) => update({ title: event.target.value })}
        maxLength={BLOCK_TITLE_MAX_LENGTH}
        placeholder="Title (optional)"
        aria-label="Block title"
        className={inputClassName}
      />

      {isStatsBlock(block.type) && (
        <div className="flex gap-2">
          <Select
            value={block.timeRange ?? "medium_term"}
            onValueChange={(timeRange) => update({ timeRange })}
          >
            <SelectTrigger className="min-w-0 flex-1 [&>span]:truncate" aria-label="Time range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROFILE_TIME_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {formatTimeRangeLabel(range)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(block.count ?? 10)}
            onValueChange={(count) => update({ count: Number(count) })}
          >
            <SelectTrigger className="w-[6.5rem] min-w-0 shrink-0" aria-label="Number of items">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROFILE_BLOCK_COUNTS.map((count) => (
                <SelectItem key={count} value={String(count)}>
                  Top {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(block.type === "artists" || block.type === "tracks") && (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.05] p-1" role="radiogroup" aria-label="Layout">
          {(
            [
              { value: "grid", label: "Grid", icon: LayoutGrid },
              { value: "list", label: "List", icon: List },
            ] as const
          ).map(({ value, label, icon: LayoutIcon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={block.layout === value}
              onClick={() => update({ layout: value })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                block.layout === value
                  ? "bg-white/10 text-white"
                  : "text-spotify-subtext hover:text-white"
              )}
            >
              <LayoutIcon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      )}

      {block.type === "text" && (
        <textarea
          value={block.text ?? ""}
          onChange={(event) => update({ text: event.target.value })}
          maxLength={BLOCK_TEXT_MAX_LENGTH}
          rows={3}
          placeholder="Write something…"
          aria-label="Text"
          className={cn(inputClassName, "resize-none")}
        />
      )}

      {block.type === "nowPlaying" && (
        <p className="text-xs text-spotify-subtext">
          Shows what you&apos;re listening to, live.
        </p>
      )}
    </li>
  );
}

export function ProfileBlocksEditor({
  blocks,
  onChange,
}: {
  blocks: ProfileBlock[];
  onChange: (blocks: ProfileBlock[]) => void;
}) {
  const hasNowPlaying = blocks.some((block) => block.type === "nowPlaying");

  const move = (index: number, direction: -1 | 1) => {
    const next = [...blocks];
    const [block] = next.splice(index, 1);
    next.splice(index + direction, 0, block);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-sm text-spotify-subtext">
          No blocks yet. Add one to choose what visitors see.
        </p>
      ) : (
        <ol className="space-y-2">
          {blocks.map((block, index) => (
            <BlockCard
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              onChange={(updated) =>
                onChange(blocks.map((item) => (item.id === block.id ? updated : item)))
              }
              onMove={(direction) => move(index, direction)}
              onRemove={() => onChange(blocks.filter((item) => item.id !== block.id))}
            />
          ))}
        </ol>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            disabled={blocks.length >= MAX_PROFILE_BLOCKS}
          >
            <Plus className="h-4 w-4" />
            Add block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {PROFILE_BLOCK_TYPES.map((type) => {
            const Icon = BLOCK_ICONS[type];
            return (
              <DropdownMenuItem
                key={type}
                disabled={type === "nowPlaying" && hasNowPlaying}
                onSelect={() => onChange([...blocks, createProfileBlock(type)])}
                className="gap-2.5"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {PROFILE_BLOCK_LABELS[type]}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
