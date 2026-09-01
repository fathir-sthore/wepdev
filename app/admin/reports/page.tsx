import { createClient } from "@/lib/supabase/server";
import { getAllReports } from "@/lib/queries/admin";
import { AdminReportsTable } from "@/components/admin/reports-table";

export const metadata = { title: "Reports — Admin" };

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const reports = await getAllReports(supabase);

  return (
    <div>
      <h1 className="text-title text-2xl text-text mb-6">Reports</h1>
      <AdminReportsTable reports={reports} />
    </div>
  );
}
