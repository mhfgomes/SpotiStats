import { TasteRadar } from "@/components/stats/TasteRadar";

export default function TasteProfilePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-spotify-subtext text-sm">
          Based on your top artists&apos; genres over the past 6 months
        </p>
      </div>

      <div className="spotify-card p-6">
        <TasteRadar />
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            axis: "Energy",
            desc: "How energetic and danceable your music is",
          },
          {
            axis: "Acoustic",
            desc: "Preference for acoustic and unplugged sounds",
          },
          {
            axis: "Mood",
            desc: "Soul, jazz, R&B — emotional depth in your picks",
          },
          {
            axis: "Experimental",
            desc: "Avant-garde, psychedelic, and unconventional sounds",
          },
          {
            axis: "Mainstream",
            desc: "How much pop and chart music you listen to",
          },
          {
            axis: "Underground",
            desc: "Indie, alternative, and niche genre affinity",
          },
        ].map(({ axis, desc }) => (
          <div
            key={axis}
            className="spotify-card p-4"
          >
            <p className="text-sm font-semibold text-spotify-green">{axis}</p>
            <p className="text-xs text-spotify-subtext mt-1">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
