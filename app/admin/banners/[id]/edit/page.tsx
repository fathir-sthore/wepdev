import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/scripts";
import { getBannerById } from "@/lib/queries/banners";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata = { title: "Edit Banner — Admin" };

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [banner, categories] = await Promise.all([
    getBannerById(supabase, id),
    getCategories(supabase),
  ]);

  if (!banner) notFound();

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir admin --banners --edit</p>
      <h1 className="font-mono text-2xl text-text mb-6">Edit banner</h1>
      <BannerForm categories={categories} initialData={banner} />
    </div>
  );
}
