import { createClient } from "@/lib/supabase/server";
import { getAllUsers } from "@/lib/queries/admin";
import { AdminUsersTable } from "@/components/admin/users-table";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { Pagination } from "@/components/public/pagination";

export const metadata = { title: "Users — Admin" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { users, total, page, pageSize } = await getAllUsers(supabase, {
    page: params.page ? parseInt(params.page, 10) : 1,
  });

  return (
    <div>
      <h1 className="text-title text-2xl text-text mb-6">Users</h1>
      <p className="font-data text-xs text-muted mb-4">{total} user(s)</p>

      <AdminUsersTable users={users} currentUserId={user!.id} />

      <Pagination page={page} totalPages={Math.ceil(total / pageSize)} buildHref={(p) => `/${ADMIN_BASE_PATH}/users?page=${p}`} />
    </div>
  );
}
