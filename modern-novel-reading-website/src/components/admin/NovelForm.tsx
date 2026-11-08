"use client";

import { useActionState, useRef, useState } from "react";
import { ImagePlus, Loader2, Save, Trash2, UploadCloud } from "lucide-react";
import { createNovelAction, updateNovelAction, type FormState } from "@/lib/actions";
import { GENRE_NAMES } from "@/lib/genres";
import Cover from "../Cover";

type NovelInput = {
  id?: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl: string | null;
  published: boolean;
  featured: boolean;
};

const EMPTY: NovelInput = { title: "", author: "", genre: "", description: "", coverUrl: null, published: true, featured: false };

export default function NovelForm({ novel }: { novel?: NovelInput }) {
  const initial = novel ?? EMPTY;
  const isEdit = !!initial.id;
  const [state, action, pending] = useActionState<FormState, FormData>(isEdit ? updateNovelAction : createNovelAction, undefined);
  const [cover, setCover] = useState<string>(initial.coverUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [desc, setDesc] = useState(initial.description);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploadError(null);
    if (!file.type.startsWith("image/")) return setUploadError("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return setUploadError("Image must be smaller than 5 MB.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCover(data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[300px_1fr]">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="coverUrl" value={cover} />

      {/* Cover */}
      <div>
        <p className="mb-2 text-sm font-medium text-mist">Cover image</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
          onClick={() => fileRef.current?.click()}
          className={`group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition ${
            drag ? "border-mint bg-sea/10" : "border-white/15 hover:border-sea"
          }`}
        >
          {cover ? (
            <>
              <Cover src={cover} title={title || "Cover"} className="h-full w-full" />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/70 opacity-0 transition group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 text-sm font-semibold"><ImagePlus size={18} /> Replace cover</span>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-mist">
              <UploadCloud size={40} className="text-sea" />
              <p className="text-sm font-medium text-white">Drop an image or click to upload</p>
              <p className="text-xs">JPG, PNG, WEBP · up to 5 MB · 3:4 ratio recommended</p>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/80">
              <Loader2 className="animate-spin text-mint" size={32} />
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        {uploadError && <p className="mt-2 text-sm text-red-300">{uploadError}</p>}
        <input
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="…or paste an image URL"
          className="input mt-3 !py-2 text-sm"
        />
        {cover && (
          <button type="button" onClick={() => setCover("")} className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-300 hover:underline">
            <Trash2 size={12} /> Remove cover
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="grid content-start gap-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-mist" htmlFor="title">Novel title *</label>
          <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="input font-display text-xl" placeholder="e.g. Crown of Ashes" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-mist" htmlFor="author">Author name *</label>
            <input id="author" name="author" defaultValue={initial.author} required maxLength={120} className="input" placeholder="Author" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-mist" htmlFor="genre">Category *</label>
            <select id="genre" name="genre" defaultValue={initial.genre} required className="input">
              <option value="" disabled>Select a category</option>
              {GENRE_NAMES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 flex justify-between text-sm font-medium text-mist" htmlFor="description">
            <span>Description *</span><span className="text-xs text-mist/60">{desc.length} characters</span>
          </label>
          <textarea id="description" name="description" value={desc} onChange={(e) => setDesc(e.target.value)} required rows={8} className="input resize-y leading-relaxed" placeholder="Write a captivating synopsis for readers…" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 p-4 transition hover:border-sea/50">
            <input type="checkbox" name="published" defaultChecked={initial.published} className="mt-1 h-4 w-4 accent-[#20B2AA]" />
            <span><span className="block font-medium">Published</span><span className="text-xs text-mist">Visible to all readers on the public site.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 p-4 transition hover:border-sea/50">
            <input type="checkbox" name="featured" defaultChecked={initial.featured} className="mt-1 h-4 w-4 accent-[#20B2AA]" />
            <span><span className="block font-medium">Featured</span><span className="text-xs text-mist">Showcase in the homepage Featured section.</span></span>
          </label>
        </div>
        {state?.error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.error}</p>}
        {state?.ok && <p className="rounded-xl border border-sea/30 bg-sea/10 px-4 py-3 text-sm text-mint">{state.ok}</p>}
        <div className="flex flex-wrap gap-3">
          <button disabled={pending || uploading} className="btn-primary">
            {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEdit ? "Save changes" : "Create novel"}
          </button>
        </div>
      </div>
    </form>
  );
}
