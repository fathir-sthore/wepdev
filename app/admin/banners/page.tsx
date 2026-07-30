import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { AdminBannersTable } from "@/components/admin/banners-table";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";

export const metadata = { title: "Banners — Admin" };

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-data text-xs text-signal mb-2">$ fathir admin --banners</p>
          <h1 className="font-mono text-2xl text-text">Banners</h1>
        </div>
        <Link href={`/${ADMIN_BASE_PATH}/banners/new`}>
          <Button>tambah banner</Button>
        </Link>
      </div>

      <AdminBannersTable banners={banners ?? []} />
    </div>
  );
}
