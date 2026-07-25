import Link from "next/link";
import * as Icons from "lucide-react";
import { Box } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Database } from "@/types/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

function CategoryIcon({ name }: { name: string | null }) {
  const Icon = (name && (Icons as any)[toPascalCase(name)]) || Box;
  return <Icon size={20} className="text-accent" />;
}

function toPascalCase(kebab: string) {
  return kebab
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="font-mono text-lg text-text mb-4">Browse by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/search?category=${cat.id}`}>
            <Card className="p-4 flex flex-col items-center gap-2 text-center hover:border-accent/50 transition-colors">
              <CategoryIcon name={cat.icon} />
              <span className="font-data text-xs text-text">{cat.name}</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
