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
      <h1 className="text-title text-2xl text-text mb-6">Edit banner</h1>
      <BannerForm categories={categories} initialData={banner} />
    </div>
  );
}
