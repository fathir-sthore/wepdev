"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cropAndResizeImage } from "@/lib/image-crop";
import { publicStorageUrl } from "@/lib/storage";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fileInputClass =
  "block w-full text-xs font-data text-muted file:mr-3 file:rounded-md file:border-0 file:bg-panel2 file:px-3 file:py-2 file:text-xs file:font-data file:text-text hover:file:bg-line";

export function AvatarUploader({
  userId,
  username,
  currentUrl,
}: {
  userId: string;
  username: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const blob = await cropAndResizeImage(file);
      setPendingBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setError("gagal memproses gambar, coba file lain");
    }
  }

  async function handleUrlPreview() {
    if (!urlInput.trim()) return;
    setError(null);
    try {
      const blob = await cropAndResizeImage(urlInput.trim());
      setPendingBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setError("gagal ambil gambar dari URL itu (mungkin diblokir CORS) — coba upload file langsung");
    }
  }

  async function handleSave() {
    if (!pendingBlob) return;
    setLoading(true);
    setError(null);

    const path = `${userId}/avatar-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, pendingBlob, { upsert: true, contentType: "image/jpeg" });

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    const publicUrl = publicStorageUrl("avatars", path);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPendingBlob(null);
    setPreviewUrl(null);
    setUrlInput("");
    router.refresh();
  }

  return (
    <div className="flex items-start gap-4">
      <Avatar
        src={previewUrl ?? currentUrl}
        alt={username}
        fallback={username}
        size={72}
      />
      <div className="flex-1 space-y-3">
        <div>
          <Label htmlFor="avatar_file">Upload file (JPG/PNG/GIF)</Label>
          <input
            id="avatar_file"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFile}
            className={fileInputClass}
          />
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="avatar_url">atau tempel URL gambar</Label>
            <Input
              id="avatar_url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleUrlPreview}>
            preview
          </Button>
        </div>

        {error && <p className="font-data text-xs text-danger">{error}</p>}

        {pendingBlob && (
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleSave} disabled={loading}>
              {loading ? "menyimpan..." : "simpan foto"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setPendingBlob(null); setPreviewUrl(null); }}
            >
              batal
            </Button>
          </div>
        )}
        <p className="font-data text-[11px] text-muted">
          otomatis di-crop persegi dan diresize ke 512×512.
        </p>
      </div>
    </div>
  );
}
