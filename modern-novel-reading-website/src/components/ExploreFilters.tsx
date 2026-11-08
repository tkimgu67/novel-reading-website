"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { GENRE_NAMES } from "@/lib/genres";

export default function ExploreFilters({ hideGenre = false }: { hideGenre?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const by = sp.get("by") ?? "all";
  const genre = sp.get("genre") ?? "";
  const sort = sp.get("sort") ?? "latest";

  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);

  function update(patch: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v && !(k === "by" && v === "all") && !(k === "sort" && v === "latest")) params.set(k, v);
      else params.delete(k);
    }
    start(() => router.push(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false }));
  }

  // Debounced live search
  useEffect(() => {
    const current = sp.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => update({ q }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="glass sticky top-20 z-30 mb-10 rounded-3xl border border-white/10 p-3 sm:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q });
        }}
        className="flex flex-col gap-3 lg:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sea" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={by === "author" ? "Search by author name…" : by === "title" ? "Search by novel title…" : "Search titles, authors, genres…"}
            className="input !rounded-full !pl-11 !pr-10"
            aria-label="Search novels"
          />
          {pending ? (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-mint" size={16} />
          ) : q ? (
            <button type="button" onClick={() => { setQ(""); update({ q: "" }); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-mist hover:text-white" aria-label="Clear">
              <X size={16} />
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
          <select value={by} onChange={(e) => update({ by: e.target.value })} className="input !rounded-full lg:w-40" aria-label="Search by">
            <option value="all">All fields</option>
            <option value="title">By title</option>
            <option value="author">By author</option>
          </select>
          {!hideGenre && (
            <select value={genre} onChange={(e) => update({ genre: e.target.value })} className="input !rounded-full lg:w-48" aria-label="Genre">
              <option value="">All genres</option>
              {GENRE_NAMES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
          <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="input col-span-2 !rounded-full sm:col-span-1 lg:w-44" aria-label="Sort">
            <option value="latest">Latest</option>
            <option value="popular">Most popular</option>
            <option value="az">Alphabetical A–Z</option>
            <option value="za">Alphabetical Z–A</option>
          </select>
        </div>
      </form>
    </div>
  );
}
