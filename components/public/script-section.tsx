import Link from "next/link";
import { ScriptCard } from "@/components/public/script-card";
import type { ScriptWithRelations } from "@/lib/queries/scripts";

export function ScriptSection({
  title,
  scripts,
  viewAllHref,
}: {
  title: string;
  scripts: ScriptWithRelations[];
  viewAllHref: string;
}) {
  if (scripts.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-lg text-text">{title}</h2>
        <Link href={viewAllHref} className="font-data text-xs text-accent hover:underline">
          view all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scripts.map((script) => (
          <ScriptCard key={script.id} script={script} />
        ))}
      </div>
    </section>
  );
}
