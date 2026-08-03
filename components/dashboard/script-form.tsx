"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import { sha256File } from "@/lib/checksum";
import { resizeImagePreserveAspect } from "@/lib/image-crop";
import { uploadFileToR2 } from "@/lib/r2/upload-client";
import { resolveScriptSubfolder } from "@/lib/r2/paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type ScriptRow = Database["public"]["Tables"]["scripts"]["Row"];

const fileInputClass =
  "block w-full text-xs font-data text-muted file:mr-3 file:rounded-md file:border-0 file:bg-panel2 file:px-3 file:py-2 file:text-xs file:font-data file:text-text hover:file:bg-line";

export function ScriptForm({
  userId,
  categories,
  initialData,
}: {
  userId: string;
  categories: Category[];
  initialData?: ScriptRow & { tags: string[] };
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [shortDescription, setShortDescription] = useState(initialData?.short_description ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [version, setVersion] = useState(initialData?.version ?? "1.0.0");
  const [language, setLanguage] = useState(initialData?.programming_language ?? "");
  const [framework, setFramework] = useState(initialData?.framework ?? "");
  const [license, setLicense] = useState(initialData?.license ?? "MIT");
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url ?? "");
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url ?? "");
  const [changelog, setChangelog] = useState(initialData?.changelog ?? "");
  const [isPremium, setIsPremium] = useState(initialData?.is_premium ?? false);
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "0");
  const [passwordZip, setPasswordZip] = useState(initialData?.password_zip ?? "");
  const [stock, setStock] = useState((initialData?.stock ?? 0).toString());
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join(", ") ?? "");

  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const categorySlug = categories.find((c) => c.id === categoryId)?.slug ?? null;
      const scriptSubfolder = resolveScriptSubfolder(categorySlug, language);

      let filePath = initialData?.file_path ?? null;
      let fileSizeBytes = initialData?.file_size_bytes ?? null;
      let checksum = initialData?.checksum_sha256 ?? null;

      if (scriptFile) {
        setProgress("hashing script file...");
        checksum = await sha256File(scriptFile);
        setProgress("uploading script file (0%)...");
        const { key } = await uploadFileToR2(scriptFile, `scripts/${scriptSubfolder}`, (pct) =>
          setProgress(`uploading script file (${pct}%)...`)
        );
        filePath = key;
        fileSizeBytes = scriptFile.size;
      }
      if (!isEdit && !scriptFile) {
        throw new Error("script file is required");
      }

      let thumbnailPath = initialData?.thumbnail_path ?? null;
      if (thumbnailFile) {
        setProgress("uploading thumbnail...");
        const resized = await resizeImagePreserveAspect(thumbnailFile, 1600);
        const resizedFile = new File([resized], "thumbnail.jpg", { type: "image/jpeg" });
        const { key } = await uploadFileToR2(resizedFile, "images/thumbnails");
        thumbnailPath = key;
      }

      let screenshotPaths = initialData?.screenshot_paths ?? [];
      if (screenshotFiles.length > 0) {
        setProgress("uploading screenshots...");
        screenshotPaths = await Promise.all(
          screenshotFiles.map(async (f, i) => {
            const resized = await resizeImagePreserveAspect(f, 1600);
            const resizedFile = new File([resized], `screenshot-${i}.jpg`, { type: "image/jpeg" });
            const { key } = await uploadFileToR2(resizedFile, "images/screenshots");
            return key;
          })
        );
      }

      let documentationPath = initialData?.documentation_path ?? null;
      if (docFile) {
        setProgress("uploading documentation...");
        const { key } = await uploadFileToR2(docFile, "documents");
        documentationPath = key;
      }

      setProgress("saving script details...");

      const payload = {
        id: initialData?.id ?? crypto.randomUUID(),
        developer_id: userId,
        slug: slug || slugify(title),
        title,
        short_description: shortDescription,
        description,
        category_id: categoryId || null,
        version,
        programming_language: language || null,
        framework: framework || null,
        license: license || null,
        file_path: filePath,
        file_size_bytes: fileSizeBytes,
        checksum_sha256: checksum,
        password_zip: passwordZip || null,
        thumbnail_path: thumbnailPath,
        screenshot_paths: screenshotPaths,
        documentation_path: documentationPath,
        github_url: githubUrl || null,
        website_url: websiteUrl || null,
        video_url: videoUrl || null,
        changelog: changelog || null,
        is_premium: isPremium,
        price: isPremium ? parseFloat(price) || 0 : 0,
        stock: isPremium && parseInt(stock, 10) > 0 ? parseInt(stock, 10) : null,
        status,
        published_at: status === "published" ? new Date().toISOString() : initialData?.published_at ?? null,
      };

      const { error: upsertError } = await supabase.from("scripts").upsert(payload);
      if (upsertError) throw new Error(upsertError.message);

      const scriptId = payload.id;

      // Replace tags: parse comma-separated input, upsert each tag, relink.
      const tagNames = [...new Set(
        tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      )];

      if (tagNames.length > 0) {
        const tagRows = tagNames.map((name) => ({ name, slug: slugify(name) }));
        const { data: upsertedTags, error: tagError } = await supabase
          .from("tags")
          .upsert(tagRows, { onConflict: "slug" })
          .select("id");
        if (tagError) throw new Error(tagError.message);

        await supabase.from("script_tags").delete().eq("script_id", scriptId);
        if (upsertedTags && upsertedTags.length > 0) {
          await supabase.from("script_tags").insert(
            upsertedTags.map((t) => ({ script_id: scriptId, tag_id: t.id }))
          );
        }
      } else {
        await supabase.from("script_tags").delete().eq("script_id", scriptId);
      }

      router.push("/dashboard/scripts");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "something went wrong");
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <section className="space-y-4">
        <h2 className="font-mono text-sm text-signal">basic info</h2>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={title} onChange={(e) => handleTitleChange(e.target.value)} />
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
          <Label htmlFor="short_description">Short description</Label>
          <Input
            id="short_description"
            required
            maxLength={160}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="shown on cards and search results"
          />
        </div>
        <div>
          <Label htmlFor="description">Full description</Label>
          <textarea
            id="description"
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-data text-text"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-md border border-line bg-panel2 px-3 text-sm font-data text-text"
          >
            <option value="">no category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="telegram, bot, mongodb" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="version">Version</Label>
          <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="license">License</Label>
          <Input id="license" value={license} onChange={(e) => setLicense(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="language">Programming language</Label>
          <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="JavaScript" />
        </div>
        <div>
          <Label htmlFor="framework">Framework</Label>
          <Input id="framework" value={framework} onChange={(e) => setFramework(e.target.value)} placeholder="Telegraf" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-sm text-signal">links</h2>
        <div>
          <Label htmlFor="github">GitHub URL</Label>
          <Input id="github" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="website">Website URL</Label>
          <Input id="website" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="video">Video tutorial URL</Label>
          <Input id="video" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="changelog">Changelog</Label>
          <textarea
            id="changelog"
            rows={3}
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-data text-text"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-sm text-signal">files</h2>
        <div>
          <Label htmlFor="script_file">
            Script file (.zip .7z .rar .js .ts .json .html .css .php .py .java .c .cpp .dart .yaml .xml .sql .txt) {isEdit && "— leave empty to keep current file"}
          </Label>
          <input
            id="script_file"
            type="file"
            accept=".zip,.7z,.rar,.js,.ts,.json,.html,.css,.php,.py,.java,.c,.cpp,.dart,.yaml,.yml,.xml,.sql,.txt"
            onChange={(e) => setScriptFile(e.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
        </div>
        <div>
          <Label htmlFor="thumbnail">Thumbnail image</Label>
          <input
            id="thumbnail"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
        </div>
        <div>
          <Label htmlFor="screenshots">Screenshots (multiple)</Label>
          <input
            id="screenshots"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
            multiple
            onChange={(e) => setScreenshotFiles(Array.from(e.target.files ?? []))}
            className={fileInputClass}
          />
        </div>
        <div>
          <Label htmlFor="docs">Documentation file (optional, PDF)</Label>
          <input
            id="docs"
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
        </div>
        <div>
          <Label htmlFor="password_zip">ZIP password (optional)</Label>
          <Input id="password_zip" value={passwordZip} onChange={(e) => setPasswordZip(e.target.value)} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-sm text-signal">pricing &amp; status</h2>
        <label className="flex items-center gap-2 font-data text-xs text-text">
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
          this is a premium (paid) script
        </label>
        {isPremium && (
          <div>
            <Label htmlFor="price">Price (IDR)</Label>
            <Input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        )}
        {isPremium && (
          <div>
            <Label htmlFor="stock">Stok (0 = tidak terbatas)</Label>
            <Input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
            <p className="font-data text-[11px] text-muted mt-1">
              stok berkurang otomatis tiap pembelian berhasil. 0 = tidak ada batas.
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 w-full rounded-md border border-line bg-panel2 px-3 text-sm font-data text-text"
          >
            <option value="draft">draft (not publicly visible)</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
      </section>

      {error && <p className="font-data text-xs text-danger">error: {error}</p>}
      {progress && !error && <p className="font-data text-xs text-signal">{progress}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "saving..." : isEdit ? "save changes" : "upload script"}
      </Button>
    </form>
  );
}
