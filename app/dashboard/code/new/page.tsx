import { createClient } from "@/lib/supabase/server";
import { SnippetForm } from "@/components/code/snippet-form";

export const metadata = { title: "Upload Kode — Dashboard" };

export default async function NewSnippetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-title text-2xl text-text mb-6">Upload kode baru</h1>
      <SnippetForm userId={user!.id} />
    </div>
  );
}
