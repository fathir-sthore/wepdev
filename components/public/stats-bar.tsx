import { formatCount } from "@/lib/storage";

export function StatsBar({
  totalScripts,
  totalDownloads,
  totalUsers,
  totalCode,
}: {
  totalScripts: number;
  totalDownloads: number;
  totalUsers: number;
  totalCode: number;
}) {
  const stats = [
    { label: "scripts", value: formatCount(totalScripts) },
    { label: "users", value: formatCount(totalUsers) },
    { label: "downloads", value: formatCount(totalDownloads) },
    { label: "code", value: formatCount(totalCode) },
  ];

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-stat text-xl text-accent">{s.value}</p>
            <p className="text-xs text-muted">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
