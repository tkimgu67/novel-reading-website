"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, Loader2, Maximize2, Minimize2, PenLine, Save, Sparkles, FilePlus2, ArrowLeft } from "lucide-react";
import { saveChapterAction, type FormState } from "@/lib/actions";

export default function ChapterEditor({
  novelId,
  novelTitle,
  chapter,
  suggestedNumber,
}: {
  novelId: number;
  novelTitle: string;
  chapter?: { id: number; number: number; title: string; content: string };
  suggestedNumber: number;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveChapterAction, undefined);
  const draftKey = `hnw:draft:${novelId}:${chapter?.id ?? "new"}`;
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [content, setContent] = useState(chapter?.content ?? "");
  const [number, setNumber] = useState<number>(chapter?.number ?? suggestedNumber);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [full, setFull] = useState(false);
  const [restored, setRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // restore local draft
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (d && (d.content !== (chapter?.content ?? "") || d.title !== (chapter?.title ?? "")) && d.content) {
        setTitle(d.title);
        setContent(d.content);
        setRestored(true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autosave local draft
  useEffect(() => {
    const t = setTimeout(() => {
      if (!content && !title) return;
      localStorage.setItem(draftKey, JSON.stringify({ title, content }));
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 800);
    return () => clearTimeout(t);
  }, [title, content, draftKey]);

  // clear draft when server save redirects (pending -> unmount); also Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const paragraphs = content.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);

  function cleanUp() {
    // Normalise pasted text: unify line breaks, trim spaces, collapse 3+ blank lines, smart quotes & dashes.
    setContent((c) =>
      c
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/ {2,}/g, " ")
        .replace(/--/g, "—")
        .trim(),
    );
  }

  return (
    <form
      ref={formRef}
      action={(fd) => {
        localStorage.removeItem(draftKey);
        return action(fd);
      }}
      className={full ? "fixed inset-0 z-[90] overflow-y-auto bg-ink p-4 sm:p-8" : ""}
    >
      <input type="hidden" name="novelId" value={novelId} />
      {chapter && <input type="hidden" name="chapterId" value={chapter.id} />}

      <div className={`mx-auto ${full ? "max-w-4xl" : ""}`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href={`/admin/novels/${novelId}`} className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-mint">
              <ArrowLeft size={14} /> {novelTitle}
            </Link>
            <h1 className="mt-1 font-display text-3xl font-bold">{chapter ? `Edit Chapter ${chapter.number}` : "Write a New Chapter"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-white/10 p-1">
              <button type="button" onClick={() => setMode("write")} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm ${mode === "write" ? "bg-sea text-ink" : "text-mist"}`}>
                <PenLine size={14} /> Write
              </button>
              <button type="button" onClick={() => setMode("preview")} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm ${mode === "preview" ? "bg-sea text-ink" : "text-mist"}`}>
                <Eye size={14} /> Preview
              </button>
            </div>
            <button type="button" onClick={() => setFull((f) => !f)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mist hover:border-sea hover:text-mint" title="Focus mode">
              {full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {restored && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Restored an unsaved draft from this browser.
            <button
              type="button"
              className="underline"
              onClick={() => {
                setTitle(chapter?.title ?? "");
                setContent(chapter?.content ?? "");
                localStorage.removeItem(draftKey);
                setRestored(false);
              }}
            >
              Discard draft
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <div>
            <label className="mb-2 block text-sm text-mist" htmlFor="number">Chapter #</label>
            <input id="number" name="number" type="number" min={1} value={number} onChange={(e) => setNumber(Number(e.target.value))} className="input text-center font-semibold" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-mist" htmlFor="title">Chapter title</label>
            <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className="input font-display text-lg" placeholder="e.g. The Night the Sky Burned" />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-[#0c1212] focus-within:border-sea">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5 text-xs text-mist">
            <span>{words.toLocaleString()} words · {paragraphs.length} paragraphs · ~{Math.max(1, Math.round(words / 220))} min read</span>
            <div className="flex items-center gap-3">
              {savedAt && <span className="text-mist/60">Draft autosaved {savedAt}</span>}
              <button type="button" onClick={cleanUp} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 hover:border-sea hover:text-mint" title="Clean up pasted formatting">
                <Sparkles size={12} /> Tidy text
              </button>
            </div>
          </div>
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className={`${mode === "write" ? "block" : "hidden"} min-h-[55vh] w-full resize-y bg-transparent p-6 font-read text-lg leading-[1.9] text-white outline-none placeholder:text-mist/40`}
            placeholder={"Write or paste your chapter here…\n\nSeparate paragraphs with a blank line."}
          />
          {mode === "preview" && (
            <div className="min-h-[55vh] p-6 sm:p-10">
              <div className="mx-auto max-w-2xl font-read text-lg leading-[1.9] text-[#E4ECEC]">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-sea">Chapter {number}</p>
                <h2 className="mb-10 mt-2 text-center font-display text-3xl font-bold">{title || "Untitled chapter"}</h2>
                {paragraphs.length ? paragraphs.map((p, i) => <p key={i} className="mb-5" style={{ textIndent: i ? "1.5em" : 0 }}>{p}</p>) : <p className="text-center text-mist">Nothing to preview yet.</p>}
              </div>
            </div>
          )}
        </div>

        {state?.error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.error}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button name="intent" value="save" disabled={pending} className="btn-primary">
            {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {chapter ? "Save chapter" : "Publish chapter"}
          </button>
          {!chapter && (
            <button name="intent" value="another" disabled={pending} className="btn-ghost">
              <FilePlus2 size={18} /> Publish & write next
            </button>
          )}
          <span className="text-xs text-mist/60">Tip: Ctrl/⌘ + S to save · chapters go live instantly for published novels</span>
        </div>
      </div>
    </form>
  );
}
