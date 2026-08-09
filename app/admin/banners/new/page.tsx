import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/scripts";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata = { title: "Tambah Banner — Admin" };

export default async function NewBannerPage() {
  const supabase = await createClient();
  const categories = await getCategories(supabase);

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir admin --banners --new</p>
      <h1 className="text-title text-2xl text-text mb-6">Tambah banner</h1>
      <BannerForm categories={categories} />
    </div>
  );
}
