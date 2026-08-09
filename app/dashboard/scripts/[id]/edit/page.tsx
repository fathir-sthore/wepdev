import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/scripts";
import { getMyScriptById } from "@/lib/queries/developer";
import { ScriptForm } from "@/components/dashboard/script-form";

export const metadata = { title: "Edit script — Dashboard" };

export default async function EditScriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [script, categories] = await Promise.all([
    getMyScriptById(supabase, id, user!.id),
    getCategories(supabase),
  ]);

  if (!script) notFound();

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir scripts --edit {script.slug}</p>
      <h1 className="text-title text-2xl text-text mb-6">Edit script</h1>
      <ScriptForm userId={user!.id} categories={categories} initialData={script} />
    </div>
  );
}
