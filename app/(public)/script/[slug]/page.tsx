import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Github, Globe, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getScriptBySlug, getReviews } from "@/lib/queries/scripts";
import { publicStorageUrl, formatFileSize, formatCount } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/public/rating-stars";
import { BuyOrDownloadButton } from "@/components/public/buy-or-download-button";
import { hasCompletedPurchase } from "@/lib/payments/entitlement";
import { FavoriteButton } from "@/components/public/favorite-button";
import { ShareButtons } from "@/components/public/share-buttons";
import { ReportDialog } from "@/components/public/report-dialog";
import { ReviewForm } from "@/components/public/review-form";
import { ReviewList } from "@/components/public/review-list";
import { ViewTracker } from "@/components/public/view-tracker";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const script = await getScriptBySlug(supabase, slug);
  if (!script) return { title: "Script not found — Fathir Sthore" };
  return {
    title: `${script.title} — Fathir Sthore`,
    description: script.short_description,
    openGraph: {
      title: script.title,
      description: script.short_description,
      images: script.thumbnail_path
        ? [publicStorageUrl("thumbnails", script.thumbnail_path)!]
        : [],
    },
  };
}

export default async function ScriptDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const script = await getScriptBySlug(supabase, slug);

  if (!script) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileRole = user
    ? (await supabase.from("profiles").select("role").eq("id", user.id).single()).data?.role
    : null;
  const isOwnerOrAdmin = !!user && (user.id === script.developer_id || profileRole === "admin");

  const [reviews, favoriteRow, entitled] = await Promise.all([
    getReviews(supabase, script.id),
    user
      ? supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("script_id", script.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    !script.is_premium || isOwnerOrAdmin
      ? Promise.resolve(true)
      : hasCompletedPurchase(supabase, user!.id, script.id),
  ]);

  const thumbnail = publicStorageUrl("thumbnails", script.thumbnail_path);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: script.title,
    description: script.short_description,
    applicationCategory: script.category?.name ?? "DeveloperApplication",
    operatingSystem: script.programming_language ?? "Cross-platform",
    image: thumbnail ?? undefined,
    offers: {
      "@type": "Offer",
      price: script.is_premium ? script.price : 0,
      priceCurrency: "IDR",
    },
    ...(script.rating_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: script.rating_avg,
            ratingCount: script.rating_count,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker scriptId={script.id} />

      <p className="font-data text-xs text-muted mb-4">
        <Link href="/" className="hover:text-accent">home</Link>
        {" / "}
        <Link href="/search" className="hover:text-accent">browse</Link>
        {script.category && (
          <>
            {" / "}
            <Link href={`/search?category=${script.category.id}`} className="hover:text-accent">
              {script.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-text">{script.title}</span>
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-line bg-panel2">
            {thumbnail ? (
              <Image src={thumbnail} alt={script.title} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center font-data text-xs text-muted">
                no preview
              </div>
            )}
          </div>

          {script.screenshot_paths.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {script.screenshot_paths.map((path) => (
                <div key={path} className="relative aspect-video rounded-md overflow-hidden border border-line">
                  <Image
                    src={publicStorageUrl("screenshots", path)!}
                    alt={script.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <h1 className="text-title text-2xl text-text mb-2">{script.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={script.rating_avg} count={script.rating_count} />
              {script.developer && (
                <span className="font-data text-xs text-muted">
                  by @{script.developer.username}
                </span>
              )}
            </div>
            <p className="text-sm text-text whitespace-pre-line">{script.description}</p>
          </div>

          {script.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {script.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-3 py-1 font-data text-[11px] text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {script.video_url && (
            <a
              href={script.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-data text-xs text-accent hover:underline"
            >
              <PlayCircle size={14} /> watch video tutorial
            </a>
          )}

          {script.changelog && (
            <Card>
              <CardContent>
                <h2 className="text-title text-sm text-text mb-2">Changelog</h2>
                <p className="text-xs text-muted whitespace-pre-line">{script.changelog}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-title text-lg text-text mb-4">
              Reviews ({script.rating_count})
            </h2>
            <div className="mb-6">
              <ReviewForm scriptId={script.id} userId={user?.id ?? null} />
            </div>
            <ReviewList reviews={reviews} />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3">
              <BuyOrDownloadButton
                scriptId={script.id}
                scriptTitle={script.title}
                price={script.price}
                userId={user?.id ?? null}
                entitled={entitled}
                redirectTo={`/script/${script.slug}`}
                stock={script.stock}
                passwordProtected={!!script.password_zip}
              />
              <FavoriteButton
                scriptId={script.id}
                userId={user?.id ?? null}
                initialFavorited={!!favoriteRow.data}
                redirectTo={`/script/${script.slug}`}
              />
              <ShareButtons title={script.title} />
              <div className="pt-2 border-t border-line">
                <ReportDialog scriptId={script.id} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 font-data text-xs">
              <Row label="version" value={script.version} />
              <Row label="language" value={script.programming_language ?? "—"} />
              <Row label="framework" value={script.framework ?? "—"} />
              <Row label="size" value={formatFileSize(script.file_size_bytes)} />
              <Row label="license" value={script.license ?? "—"} />
              <Row label="downloads" value={formatCount(script.download_count)} />
              <Row label="views" value={formatCount(script.view_count)} />
              <Row
                label="updated"
                value={new Date(script.updated_at).toLocaleDateString()}
              />
              {script.checksum_sha256 && (
                <div>
                  <p className="text-muted">sha256</p>
                  <p className="text-text break-all">{script.checksum_sha256}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {(script.github_url || script.website_url) && (
            <Card>
              <CardContent className="space-y-2">
                {script.github_url && (
                  <a
                    href={script.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-data text-xs text-muted hover:text-accent"
                  >
                    <Github size={14} /> source / github
                  </a>
                )}
                {script.website_url && (
                  <a
                    href={script.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-data text-xs text-muted hover:text-accent"
                  >
                    <Globe size={14} /> official website
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
