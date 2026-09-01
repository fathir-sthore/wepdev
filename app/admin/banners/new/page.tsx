import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/scripts";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata = { title: "Tambah Banner — Admin" };

export default async function NewBannerPage() {
  const supabase = await createClient();
  const categories = await getCategories(supabase);

  return (
    <div>
      <h1 className="text-title text-2xl text-text mb-6">Tambah banner</h1>
      <BannerForm categories={categories} />
    </div>
  );
}
