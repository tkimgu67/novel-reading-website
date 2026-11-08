"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  List,
  Minus,
  Moon,
  Plus,
  Settings2,
  Sun,
  Coffee,
  X,
  Home,
} from "lucide-react";
import { saveProgressAction, toggleLibraryAction } from "@/lib/actions";
import { LogoMark } from "./Logo";

type Theme = "dark" | "light" | "sepia";
type Settings = { size: number; theme: Theme; font: "serif" | "sans"; leading: number; width: "narrow" | "normal" | "wide" };

const DEFAULTS: Settings = { size: 20, theme: "dark", font: "serif", leading: 1.9, width: "normal" };

const THEMES: Record<Theme, { bg: string; text: string; muted: string; bar: string; border: string; card: string }> = {
  dark: { bg: "#080B0B", text: "#E4ECEC", muted: "#8FA0A0", bar: "rgba(8,11,11,0.85)", border: "rgba(255,255,255,0.07)", card: "#111818" },
  light: { bg: "#FBFAF7", text: "#1B2323", muted: "#5F6B6B", bar: "rgba(251,250,247,0.88)", border: "rgba(0,0,0,0.08)", card: "#FFFFFF" },
  sepia: { bg: "#F3EAD7", text: "#3A2F22", muted: "#7A6A55", bar: "rgba(243,234,215,0.9)", border: "rgba(58,47,34,0.12)", card: "#EFE3CB" },
};

const WIDTHS = { narrow: "36rem", normal: "44rem", wide: "54rem" };

export default function Reader({
  novel,
  chapter,
  chapters,
  prev,
  next,
  loggedIn,
  bookmarkChapter,
  savedPercent,
}: {
  novel: { id: number; slug: string; title: string; author: string };
  chapter: { number: number; title: string; content: string; updatedAt: string };
  chapters: { number: number; title: string }[];
  prev: number | null;
  next: number | null;
  loggedIn: boolean;
  bookmarkChapter: number | null;
  savedPercent: number | null;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [barVisible, setBarVisible] = useState(true);
  const [panel, setPanel] = useState<null | "settings" | "chapters">(null);
  const [bookmarked, setBookmarked] = useState(bookmarkChapter === chapter.number);
  const [toast, setToast] = useState<string | null>(null);
  const [, start] = useTransition();
  const lastY = useRef(0);
  const progressRef = useRef(0);
  const lastSaved = useRef(0);

  const t = THEMES[settings.theme];

  // Load settings
  useEffect(() => {
    try {
      const s = localStorage.getItem("hnw:reader");
      if (s) setSettings({ ...DEFAULTS, ...JSON.parse(s) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("hnw:reader", JSON.stringify(settings));
  }, [settings, loaded]);

  useEffect(() => setBookmarked(bookmarkChapter === chapter.number), [bookmarkChapter, chapter.number]);

  const persist = useCallback(
    (pct: number) => {
      try {
        localStorage.setItem(`hnw:last:${novel.slug}`, JSON.stringify({ chapter: chapter.number, percent: pct, at: Date.now() }));
      } catch {}
      if (loggedIn) saveProgressAction(novel.id, chapter.number, pct).catch(() => {});
      lastSaved.current = Date.now();
    },
    [loggedIn, novel.id, novel.slug, chapter.number],
  );

  // Restore scroll position & mark chapter as current
  useEffect(() => {
    let pct = savedPercent;
    if (pct == null) {
      try {
        const v = JSON.parse(localStorage.getItem(`hnw:last:${novel.slug}`) || "null");
        if (v && v.chapter === chapter.number) pct = v.percent;
      } catch {}
    }
    const raf = requestAnimationFrame(() => {
      if (pct && pct > 2 && pct < 98) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: (pct / 100) * max, behavior: "instant" as ScrollBehavior });
        setToast(`Resumed where you left off (${pct}%)`);
        setTimeout(() => setToast(null), 2200);
      } else {
        window.scrollTo({ top: 0 });
      }
      persist(pct ?? 0);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.number, novel.slug]);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 100;
      setProgress(pct);
      progressRef.current = pct;
      setBarVisible(y < lastY.current || y < 80 || pct > 97);
      lastY.current = y;
      if (Date.now() - lastSaved.current > 4000) persist(Math.round(pct));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const onHide = () => persist(Math.round(progressRef.current));
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onHide);
      persist(Math.round(progressRef.current));
    };
  }, [persist]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && prev) router.push(`/read/${novel.slug}/${prev}`);
      if (e.key === "ArrowRight" && next) router.push(`/read/${novel.slug}/${next}`);
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, novel.slug, router]);

  // Prefetch neighbours for instant navigation
  useEffect(() => {
    if (next) router.prefetch(`/read/${novel.slug}/${next}`);
    if (prev) router.prefetch(`/read/${novel.slug}/${prev}`);
  }, [next, prev, novel.slug, router]);

  function toggleBookmark() {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/read/${novel.slug}/${chapter.number}`)}`);
      return;
    }
    start(async () => {
      const res = await toggleLibraryAction(novel.id, "bookmark", chapter.number);
      if (res && "active" in res) {
        setBookmarked(!!res.active);
        setToast(res.active ? `Bookmarked Chapter ${chapter.number}` : "Bookmark removed");
        setTimeout(() => setToast(null), 1800);
      }
    });
  }

  const goto = (n: number) => router.push(`/read/${novel.slug}/${n}`);
  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  const paragraphs = chapter.content.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);
  const words = chapter.content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  const minutesLeft = Math.max(0, Math.ceil(minutes * (1 - progress / 100)));

  const iconBtn = "grid h-10 w-10 place-items-center rounded-full transition hover:scale-105";

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: "100vh", transition: "background .4s, color .4s" }}>
      {/* progress */}
      <div className="fixed inset-x-0 top-0 z-[70] h-1" style={{ background: t.border }}>
        <div className="h-full bg-gradient-to-r from-sea to-mint transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* top bar */}
      <header
        className="fixed inset-x-0 top-1 z-[60] transition-transform duration-300"
        style={{ transform: barVisible || panel ? "translateY(0)" : "translateY(-120%)", background: t.bar, backdropFilter: "blur(14px)", borderBottom: `1px solid ${t.border}` }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:px-6">
          <Link href={`/novel/${novel.slug}`} className={iconBtn} style={{ color: t.text }} aria-label="Back to novel">
            <ArrowLeft size={20} />
          </Link>
          <Link href="/" className="hidden sm:block" aria-label="Home"><LogoMark className="h-8 w-8" /></Link>
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-sm font-semibold">{novel.title}</p>
            <p className="truncate text-xs" style={{ color: t.muted }}>Chapter {chapter.number} · {chapter.title}</p>
          </div>
          <span className="hidden text-xs sm:block" style={{ color: t.muted }}>{Math.round(progress)}% · {minutesLeft} min left</span>
          <button onClick={() => setPanel(panel === "chapters" ? null : "chapters")} className={iconBtn} style={{ color: t.text }} aria-label="Chapters">
            <List size={20} />
          </button>
          <button onClick={toggleBookmark} className={iconBtn} style={{ color: bookmarked ? "#20B2AA" : t.text }} aria-label="Bookmark chapter" title="Bookmark this chapter">
            <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button onClick={() => setPanel(panel === "settings" ? null : "settings")} className={iconBtn} style={{ color: t.text }} aria-label="Reading settings">
            <Settings2 size={20} />
          </button>
        </div>
      </header>

      {/* panels */}
      {panel && <div className="fixed inset-0 z-[55]" onClick={() => setPanel(null)} />}
      {panel === "settings" && (
        <div className="fixed right-3 top-20 z-[65] w-[min(22rem,calc(100vw-1.5rem))] animate-fade-up rounded-3xl p-5 shadow-2xl sm:right-6" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold">Reading Settings</p>
            <button onClick={() => setPanel(null)} aria-label="Close"><X size={18} /></button>
          </div>
          <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: t.muted }}>Theme</p>
          <div className="mb-5 grid grid-cols-3 gap-2">
            {([
              { k: "dark", label: "Dark", Icon: Moon, sw: "#080B0B" },
              { k: "light", label: "Light", Icon: Sun, sw: "#FBFAF7" },
              { k: "sepia", label: "Sepia", Icon: Coffee, sw: "#F3EAD7" },
            ] as const).map(({ k, label, Icon, sw }) => (
              <button
                key={k}
                onClick={() => set({ theme: k })}
                className="flex flex-col items-center gap-1.5 rounded-2xl p-3 text-xs transition"
                style={{ border: `2px solid ${settings.theme === k ? "#20B2AA" : t.border}` }}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: sw, color: k === "dark" ? "#8DE5D6" : "#3A2F22", border: `1px solid ${t.border}` }}>
                  <Icon size={14} />
                </span>
                {label}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: t.muted }}>Font size · {settings.size}px</p>
          <div className="mb-5 flex items-center gap-3">
            <button onClick={() => set({ size: Math.max(14, settings.size - 1) })} className="grid h-10 w-10 place-items-center rounded-full" style={{ border: `1px solid ${t.border}` }} aria-label="Decrease font size"><Minus size={16} /></button>
            <input type="range" min={14} max={30} value={settings.size} onChange={(e) => set({ size: Number(e.target.value) })} className="flex-1 accent-[#20B2AA]" aria-label="Font size" />
            <button onClick={() => set({ size: Math.min(30, settings.size + 1) })} className="grid h-10 w-10 place-items-center rounded-full" style={{ border: `1px solid ${t.border}` }} aria-label="Increase font size"><Plus size={16} /></button>
          </div>
          <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: t.muted }}>Typeface</p>
          <div className="mb-5 grid grid-cols-2 gap-2">
            {(["serif", "sans"] as const).map((f) => (
              <button key={f} onClick={() => set({ font: f })} className={`rounded-xl py-2 text-sm ${f === "serif" ? "font-read" : "font-sans"}`} style={{ border: `2px solid ${settings.font === f ? "#20B2AA" : t.border}` }}>
                {f === "serif" ? "Serif" : "Sans-serif"}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: t.muted }}>Line spacing</p>
          <div className="mb-5 grid grid-cols-3 gap-2">
            {[1.6, 1.9, 2.2].map((l) => (
              <button key={l} onClick={() => set({ leading: l })} className="rounded-xl py-2 text-sm" style={{ border: `2px solid ${settings.leading === l ? "#20B2AA" : t.border}` }}>
                {l === 1.6 ? "Compact" : l === 1.9 ? "Comfort" : "Airy"}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: t.muted }}>Page width</p>
          <div className="grid grid-cols-3 gap-2">
            {(["narrow", "normal", "wide"] as const).map((w) => (
              <button key={w} onClick={() => set({ width: w })} className="rounded-xl py-2 text-sm capitalize" style={{ border: `2px solid ${settings.width === w ? "#20B2AA" : t.border}` }}>
                {w}
              </button>
            ))}
          </div>
          <button onClick={() => setSettings(DEFAULTS)} className="mt-5 w-full text-xs underline" style={{ color: t.muted }}>Reset to defaults</button>
        </div>
      )}
      {panel === "chapters" && (
        <div className="fixed right-3 top-20 z-[65] flex max-h-[70vh] w-[min(24rem,calc(100vw-1.5rem))] animate-fade-up flex-col overflow-hidden rounded-3xl shadow-2xl sm:right-6" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <div className="flex items-center justify-between p-5 pb-3">
            <p className="font-semibold">Chapters ({chapters.length})</p>
            <button onClick={() => setPanel(null)} aria-label="Close"><X size={18} /></button>
          </div>
          <ul className="overflow-y-auto px-2 pb-3">
            {chapters.map((c) => (
              <li key={c.number}>
                <Link
                  href={`/read/${novel.slug}/${c.number}`}
                  onClick={() => setPanel(null)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:opacity-80"
                  style={c.number === chapter.number ? { background: "rgba(32,178,170,0.15)", color: settings.theme === "dark" ? "#8DE5D6" : "#137a74" } : undefined}
                >
                  <span className="w-8 shrink-0 font-semibold" style={{ color: "#20B2AA" }}>{c.number}</span>
                  <span className="truncate">{c.title}</span>
                  {bookmarkChapter === c.number && <Bookmark size={14} className="ml-auto shrink-0" fill="currentColor" style={{ color: "#20B2AA" }} />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* content */}
      <article className="mx-auto px-5 pb-16 pt-28 sm:px-8" style={{ maxWidth: WIDTHS[settings.width] }}>
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#20B2AA" }}>Chapter {chapter.number}</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{chapter.title}</h1>
          <p className="mt-3 text-sm" style={{ color: t.muted }}>{novel.title} · {novel.author} · {minutes} min read</p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-sea to-transparent" />
        </div>
        <div
          className={settings.font === "serif" ? "font-read" : "font-sans"}
          style={{ fontSize: `${settings.size}px`, lineHeight: settings.leading }}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-[1.15em]" style={{ textIndent: i === 0 ? 0 : "1.5em" }}>
              {i === 0 ? (
                <>
                  <span className="float-left mr-2 font-display text-[3.4em] font-bold leading-[0.85]" style={{ color: "#20B2AA" }}>{p.charAt(0)}</span>
                  {p.slice(1)}
                </>
              ) : (
                p
              )}
            </p>
          ))}
        </div>

        <div className="mt-16 text-center text-2xl tracking-[1em]" style={{ color: t.muted }}>✦✦✦</div>

        {/* bottom nav */}
        <nav className="mt-12 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => prev && goto(prev)}
              disabled={!prev}
              className="flex items-center justify-center gap-2 rounded-2xl px-4 py-4 font-semibold transition enabled:hover:-translate-y-0.5 disabled:opacity-40"
              style={{ border: `1px solid ${t.border}`, background: t.card }}
            >
              <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span> Chapter
            </button>
            <button
              onClick={() => next && goto(next)}
              disabled={!next}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sea to-[#1a938c] px-4 py-4 font-semibold text-[#041312] shadow-[0_10px_30px_-10px_rgba(32,178,170,0.7)] transition enabled:hover:-translate-y-0.5 disabled:opacity-40"
            >
              {next ? <>Next <span className="hidden sm:inline">Chapter</span> <ChevronRight size={18} /></> : "You're all caught up!"}
            </button>
          </div>
          <select
            value={chapter.number}
            onChange={(e) => goto(Number(e.target.value))}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
            style={{ border: `1px solid ${t.border}`, background: t.card, color: t.text }}
            aria-label="Select chapter"
          >
            {chapters.map((c) => (
              <option key={c.number} value={c.number}>Chapter {c.number}: {c.title}</option>
            ))}
          </select>
          {!next && (
            <div className="rounded-2xl p-6 text-center" style={{ border: `1px solid ${t.border}`, background: t.card }}>
              <p className="font-display text-xl font-semibold">You&apos;ve reached the latest chapter</p>
              <p className="mt-2 text-sm" style={{ color: t.muted }}>New chapters appear here automatically when they&apos;re published.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link href={`/novel/${novel.slug}`} className="btn-ghost !py-2 text-sm" style={{ color: t.text }}>Novel details</Link>
                <Link href="/explore" className="btn-primary !py-2 text-sm">Find another story</Link>
              </div>
            </div>
          )}
          <div className="flex justify-center gap-6 pt-4 text-sm" style={{ color: t.muted }}>
            <Link href="/" className="inline-flex items-center gap-1.5 hover:underline"><Home size={14} /> Home</Link>
            <Link href={`/novel/${novel.slug}#chapters`} className="inline-flex items-center gap-1.5 hover:underline"><List size={14} /> All chapters</Link>
            {loggedIn && <Link href="/library" className="inline-flex items-center gap-1.5 hover:underline"><Bookmark size={14} /> Library</Link>}
          </div>
          <p className="text-center text-xs" style={{ color: t.muted }}>Tip: use ← → arrow keys to switch chapters</p>
        </nav>
      </article>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 animate-fade-up rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-ink shadow-xl">{toast}</div>
      )}
    </div>
  );
}
