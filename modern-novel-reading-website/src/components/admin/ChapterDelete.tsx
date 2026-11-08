"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteChapterAction } from "@/lib/actions";

export default function ChapterDelete({ id, label }: { id: number; label: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      disabled={pending}
      title="Delete chapter"
      onClick={() => {
        if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
        start(async () => {
          await deleteChapterAction(id);
          router.refresh();
        });
      }}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-mist transition hover:border-red-400 hover:text-red-300"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
