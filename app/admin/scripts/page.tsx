import { createClient } from "@/lib/supabase/server";
import { getAllScriptsAdmin } from "@/lib/queries/admin";
import { AdminScriptsTable } from "@/components/admin/scripts-table";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { Pagination } from "@/components/public/pagination";

export const metadata = { title: "Manage scripts — Admin" };

type Props = { searchParams: Promise<{ status?: string; page?: string }> };

export default async function AdminScriptsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { scripts, total, page, pageSize } = await getAllScriptsAdmin(supabase, {
    status: params.status as "draft" | "published" | "archived" | undefined,
    page: params.page ? parseInt(params.page, 10) : 1,
  });

  const statuses = ["", "draft", "published", "archived"];

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir admin --scripts</p>
      <h1 className="text-title text-2xl text-text mb-6">Manage scripts</h1>

      <div className="flex gap-2 mb-6">
        {statuses.map((s) => (
          <a
            key={s || "all"}
            href={s ? `/${ADMIN_BASE_PATH}/scripts?status=${s}` : `/${ADMIN_BASE_PATH}/scripts`}
            className={`rounded-md border px-3 py-1 font-data text-xs ${
              (params.status ?? "") === s
                ? "border-accent text-accent"
                : "border-line text-muted hover:text-text"
            }`}
          >
            {s || "all"}
          </a>
        ))}
      </div>

      <p className="font-data text-xs text-muted mb-4">{total} script(s)</p>

      {scripts.length === 0 ? (
        <p className="font-data text-sm text-muted">no scripts found.</p>
      ) : (
        <AdminScriptsTable scripts={scripts} />
      )}

      <Pagination
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        buildHref={(p) => `/${ADMIN_BASE_PATH}/scripts?${params.status ? `status=${params.status}&` : ""}page=${p}`}
      />
    </div>
  );
}
