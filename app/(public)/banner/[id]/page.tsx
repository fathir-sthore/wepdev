import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBannerById } from "@/lib/queries/banners";
import { publicStorageUrl } from "@/lib/storage";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const banner = await getBannerById(supabase, id);
  return { title: banner ? `${banner.title} — Fathir Sthore` : "Banner — Fathir Sthore" };
}

export default async function BannerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const banner = await getBannerById(supabase, id);

  if (!banner || banner.status !== "published") notFound();

  const image = publicStorageUrl("banners", banner.image_path);
  let category: { name: string } | null = null;
  if (banner.category_id) {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("id", banner.category_id)
      .maybeSingle();
    category = data;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft size={14} />
          kembali
        </Button>
      </Link>

      <div className="relative aspect-video rounded-lg overflow-hidden border border-line bg-panel2 mb-6">
        {image ? (
          <Image src={image} alt={banner.title} fill className="object-cover" priority />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(0,240,255,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(112,0,255,0.2), transparent 45%), linear-gradient(160deg, #090A0F 0%, #12141D 60%, #1A1D2B 100%)",
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-3 mb-3 font-data text-xs text-muted">
        <span>{new Date(banner.created_at).toLocaleDateString("id-ID")}</span>
        {category && (
          <>
            <span>·</span>
            <span className="text-signal">{category.name}</span>
          </>
        )}
      </div>

      {banner.subtitle && (
        <p className="font-data text-xs uppercase tracking-widest text-signal mb-2">
          {banner.subtitle}
        </p>
      )}
      <h1 className="font-mono text-2xl md:text-3xl text-text mb-4">{banner.title}</h1>

      {banner.description && (
        <p className="text-sm text-muted whitespace-pre-line leading-relaxed">
          {banner.description}
        </p>
      )}

      {banner.link_url && (
        <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-6">
          <Button>buka tautan</Button>
        </a>
      )}
    </div>
  );
}
