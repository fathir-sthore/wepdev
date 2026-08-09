import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/scripts";
import { ScriptForm } from "@/components/dashboard/script-form";

export const metadata = { title: "Upload script — Dashboard" };

export default async function NewScriptPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const categories = await getCategories(supabase);

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir scripts --upload</p>
      <h1 className="text-title text-2xl text-text mb-6">Upload a new script</h1>
      <ScriptForm userId={user!.id} categories={categories} />
    </div>
  );
}
