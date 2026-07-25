import { formatCount } from "@/lib/storage";

export function StatsBar({
  totalScripts,
  totalDownloads,
}: {
  totalScripts: number;
  totalDownloads: number;
}) {
  const stats = [
    { label: "scripts", value: formatCount(totalScripts) },
    { label: "downloads", value: formatCount(totalDownloads) },
    { label: "uptime", value: "99.9%" },
  ];

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-mono text-2xl text-accent">{s.value}</p>
            <p className="font-data text-xs text-muted uppercase tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
