"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Heart } from "lucide-react";
import { toggleLibraryAction } from "@/lib/actions";

export default function BookmarkButton({
  novelId,
  initial = false,
  kind = "bookmark",
  variant = "icon",
  chapterNumber,
  className = "",
}: {
  novelId: number;
  initial?: boolean;
  kind?: "bookmark" | "favorite";
  variant?: "icon" | "full";
  chapterNumber?: number;
  className?: string;
}) {
  const [active, setActive] = useState(initial);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const Icon = kind === "favorite" ? Heart : Bookmark;

  function click(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      const prev = active;
      setActive(!prev);
      const res = await toggleLibraryAction(novelId, kind, chapterNumber ?? null);
      if (res && "error" in res) {
        setActive(prev);
        if (res.error === "login") router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      setActive(!!res?.active);
      setToast(res?.active ? (kind === "favorite" ? "Added to favorites" : "Saved to library") : "Removed");
      setTimeout(() => setToast(null), 1600);
      router.refresh();
    });
  }

  const label = kind === "favorite" ? (active ? "Favorited" : "Favorite") : active ? "Bookmarked" : "Bookmark";

  return (
    <span className="relative inline-flex">
      {variant === "icon" ? (
        <button
          onClick={click}
          disabled={pending}
          aria-label={label}
          title={label}
          className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition hover:scale-110 ${
            active ? "border-sea bg-sea text-ink" : "border-white/20 bg-ink/60 text-white hover:border-mint hover:text-mint"
          } ${className}`}
        >
          <Icon size={16} fill={active ? "currentColor" : "none"} />
        </button>
      ) : (
        <button
          onClick={click}
          disabled={pending}
          className={`${active ? "btn-ghost !border-sea !text-mint" : "btn-ghost"} ${className}`}
        >
          <Icon size={18} fill={active ? "currentColor" : "none"} /> {label}
        </button>
      )}
      {toast && (
        <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 animate-fade-up whitespace-nowrap rounded-full bg-sea px-3 py-1 text-xs font-semibold text-ink">
          {toast}
        </span>
      )}
    </span>
  );
}
