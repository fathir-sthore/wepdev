"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resizeImagePreserveAspect } from "@/lib/image-crop";
import { publicStorageUrl } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import type { Database } from "@/types/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type BannerRow = Database["public"]["Tables"]["banners"]["Row"];

const fileInputClass =
  "block w-full text-xs font-data text-muted file:mr-3 file:rounded-md file:border-0 file:bg-panel2 file:px-3 file:py-2 file:text-xs file:font-data file:text-text hover:file:bg-line";

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export function BannerForm({
  categories,
  initialData,
}: {
  categories: Category[];
  initialData?: BannerRow;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [linkUrl, setLinkUrl] = useState(initialData?.link_url ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [startDate, setStartDate] = useState(toDateInputValue(initialData?.start_date ?? null));
  const [endDate, setEndDate] = useState(toDateInputValue(initialData?.end_date ?? null));
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order?.toString() ?? "0");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.image_path ? publicStorageUrl("banners", initialData.image_path) : null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const bannerId = initialData?.id ?? crypto.randomUUID();
      let imagePath = initialData?.image_path ?? null;

      if (imageFile) {
        const blob = await resizeImagePreserveAspect(imageFile, 1600);
        const path = `${bannerId}/banner.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("banners")
          .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
        if (uploadError) throw new Error(uploadError.message);
        imagePath = path;
      }

      const payload = {
        id: bannerId,
        title,
        subtitle: subtitle || null,
        description: description || null,
        image_path: imagePath,
        link_url: linkUrl || null,
        category_id: categoryId || null,
        status,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        sort_order: parseInt(sortOrder, 10) || 0,
      };

      const { error: upsertError } = await supabase.from("banners").upsert(payload);
      if (upsertError) throw new Error(upsertError.message);

      router.push(`/${ADMIN_BASE_PATH}/banners`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "gagal menyimpan banner");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <Label htmlFor="title">Judul</Label>
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="subtitle">Sub judul</Label>
        <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="description">Deskripsi lengkap</Label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-data text-text"
        />
      </div>

      <div>
        <Label htmlFor="image">Gambar banner (JPG/PNG/GIF)</Label>
        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleImageChange}
          className={fileInputClass}
        />
        {previewUrl && (
          <img src={previewUrl} alt="preview" className="mt-3 rounded-md border border-line max-h-40 object-cover" />
        )}
        <p className="font-data text-[11px] text-muted mt-1">otomatis di-crop dan diresize.</p>
      </div>

      <div>
        <Label htmlFor="link_url">Link tujuan (opsional)</Label>
        <Input id="link_url" type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="category">Kategori (opsional)</Label>
        <select
          id="category"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 w-full rounded-md border border-line bg-panel2 px-3 text-sm font-data text-text"
        >
          <option value="">tidak ada</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Tanggal mulai (opsional)</Label>
          <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="end_date">Tanggal berakhir (opsional)</Label>
          <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sort_order">Urutan tampil</Label>
          <Input id="sort_order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="h-10 w-full rounded-md border border-line bg-panel2 px-3 text-sm font-data text-text"
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </div>
      </div>

      {error && <p className="font-data text-xs text-danger">error: {error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "menyimpan..." : isEdit ? "simpan perubahan" : "buat banner"}
      </Button>
    </form>
  );
}
