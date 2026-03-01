import { RecentlyPlayed } from "@/components/stats/RecentlyPlayed";

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-spotify-subtext text-sm">
          Your recently played tracks, synced every 30 minutes
        </p>
      </div>

      <div className="spotify-card">
        <div className="flex items-center gap-4 px-3 py-2 border-b border-white/5 text-xs text-spotify-subtext uppercase tracking-wider">
          <span className="w-10 shrink-0" />
          <span className="flex-1">Track</span>
          <span className="hidden sm:block">Played at</span>
        </div>
        <RecentlyPlayed />
      </div>
    </div>
  );
}
