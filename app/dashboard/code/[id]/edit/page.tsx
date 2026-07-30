import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SnippetForm } from "@/components/code/snippet-form";

export const metadata = { title: "Edit Kode — Dashboard" };

export default async function EditSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: snippet } = await supabase
    .from("code_snippets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!snippet) notFound();

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir code --edit {snippet.slug}</p>
      <h1 className="font-mono text-2xl text-text mb-6">Edit kode</h1>
      <SnippetForm userId={user!.id} initialData={snippet} />
    </div>
  );
}
