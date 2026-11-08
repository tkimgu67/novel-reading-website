"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, FilePlus2, Loader2, Pencil, Star, Trash2 } from "lucide-react";
import { deleteNovelAction, toggleNovelFlagAction } from "@/lib/actions";

export function FlagToggle({ id, flag, value }: { id: number; flag: "published" | "featured"; value: boolean }) {
  const [on, setOn] = useState(value);
  const [pending, start] = useTransition();
  const router = useRouter();
  const label = flag === "published" ? (on ? "Published" : "Draft") : on ? "Featured" : "Not featured";
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOn(!on);
          const r = await toggleNovelFlagAction(id, flag);
          if (r && "error" in r) setOn(on);
          router.refresh();
        })
      }
      title={`Click to ${flag === "published" ? (on ? "unpublish" : "publish") : on ? "unfeature" : "feature"}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
        on
          ? flag === "published"
            ? "border-sea/50 bg-sea/15 text-mint"
            : "border-amber-400/40 bg-amber-400/10 text-amber-200"
          : "border-white/10 text-mist hover:border-white/30"
      }`}
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : flag === "published" ? (on ? <Eye size={12} /> : <EyeOff size={12} />) : <Star size={12} fill={on ? "currentColor" : "none"} />}
      {label}
    </button>
  );
}

export function RowActions({ id, title }: { id: number; title: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const btn = "grid h-9 w-9 place-items-center rounded-full border border-white/10 text-mist transition hover:border-sea hover:text-mint";
  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/novels/${id}/chapters/new`} className={btn} title="Add chapter"><FilePlus2 size={16} /></Link>
      <Link href={`/admin/novels/${id}`} className={btn} title="Edit novel"><Pencil size={16} /></Link>
      <button
        disabled={pending}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-mist transition hover:border-red-400 hover:text-red-300"
        title="Delete novel"
        onClick={() => {
          if (!confirm(`Delete "${title}" and all of its chapters? This cannot be undone.`)) return;
          start(async () => {
            await deleteNovelAction(id);
            router.push("/admin");
            router.refresh();
          });
        }}
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}
