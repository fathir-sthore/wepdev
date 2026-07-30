"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import {
  detectLanguageFromFilename,
  detectLanguageFromContent,
  LANGUAGE_LABELS,
  type DetectedLanguage,
} from "@/lib/detect-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

type SnippetRow = Database["public"]["Tables"]["code_snippets"]["Row"];

const fileInputClass =
  "block w-full text-xs font-data text-muted file:mr-3 file:rounded-md file:border-0 file:bg-panel2 file:px-3 file:py-2 file:text-xs file:font-data file:text-text hover:file:bg-line";

export function SnippetForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData?: SnippetRow;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [fileName, setFileName] = useState(initialData?.file_name ?? "");
  const [language, setLanguage] = useState<DetectedLanguage>(
    (initialData?.language as DetectedLanguage) ?? "javascript"
  );
  const [languageTouched, setLanguageTouched] = useState(isEdit);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleContentChange(value: string) {
    setContent(value);
    if (!languageTouched) setLanguage(detectLanguageFromContent(value));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent(text);
    setFileName(file.name);
    const detected = detectLanguageFromFilename(file.name);
    setLanguage(detected ?? detectLanguageFromContent(text));
    setLanguageTouched(true);
    if (!title) handleTitleChange(file.name.replace(/\.[^.]+$/, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("kode gak boleh kosong");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        id: initialData?.id ?? crypto.randomUUID(),
        user_id: userId,
        slug: slug || slugify(title),
        title,
        description: description || null,
        language,
        content,
        file_name: fileName || null,
      };

      const { error: upsertError } = await supabase.from("code_snippets").upsert(payload);
      if (upsertError) throw new Error(upsertError.message);

      router.push(`/code/${payload.slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "gagal menyimpan kode");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <Label htmlFor="title">Nama kode / fitur</Label>
        <Input id="title" required value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="misal: Validasi nomor WhatsApp" />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          required
          value={slug}
          onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }}
        />
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="jelasin fungsi kode ini, cara pakainya, dll"
          className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-data text-text"
        />
      </div>

      <div>
        <Label htmlFor="file">Upload file (opsional — .js .py .json .dart .sh .html)</Label>
        <input
          id="file"
          type="file"
          accept=".js,.mjs,.cjs,.py,.json,.dart,.sh,.bash,.html,.htm"
          onChange={handleFile}
          className={fileInputClass}
        />
        <p className="font-data text-[11px] text-muted mt-1">atau langsung tempel/ketik kodenya di bawah</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="content">Kode</Label>
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value as DetectedLanguage); setLanguageTouched(true); }}
            className="h-7 rounded-md border border-line bg-panel2 px-2 text-xs font-data text-text"
          >
            {Object.entries(LANGUAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <textarea
          id="content"
          required
          rows={16}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="tempel atau ketik kode di sini..."
          className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-xs font-data text-text"
          spellCheck={false}
        />
        <p className="font-data text-[11px] text-muted mt-1">
          bahasa terdeteksi otomatis: <span className="text-accent">{LANGUAGE_LABELS[language]}</span> — bisa diganti manual lewat dropdown di atas.
        </p>
      </div>

      {error && <p className="font-data text-xs text-danger">error: {error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "menyimpan..." : isEdit ? "simpan perubahan" : "publish kode"}
      </Button>
    </form>
  );
}
