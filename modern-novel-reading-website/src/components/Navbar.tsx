"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookMarked, LayoutDashboard, LogOut, Menu, Search, User, X } from "lucide-react";
import Logo from "./Logo";
import { logoutAction } from "@/lib/actions";

type NavUser = { name: string; role: string } | null;

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore Novels" },
  { href: "/categories", label: "Categories" },
  { href: "/latest", label: "Latest Updates" },
  { href: "/about", label: "About Us" },
];

export default function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  if (pathname?.startsWith("/read/")) return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open ? "glass border-b border-white/5 py-3" : "bg-transparent py-5"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(l.href) ? "text-mint" : "text-mist hover:text-white"
                  }`}
                >
                  {l.label}
                  {isActive(l.href) && <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-sea to-transparent" />}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mist transition hover:border-sea hover:text-mint"
              aria-label="Search novels"
            >
              <Search size={18} />
            </button>
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-4 text-sm transition hover:border-sea"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sea to-mint font-bold text-ink">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-28 truncate">{user.name}</span>
                </button>
                {menuOpen && (
                  <div className="glass absolute right-0 mt-2 w-56 animate-fade-up overflow-hidden rounded-2xl border border-white/10 p-2 shadow-2xl">
                    {user.role === "admin" && (
                      <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mint hover:bg-white/5">
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <Link href="/library" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/5">
                      <BookMarked size={16} /> My Library
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/5">
                      <User size={16} /> Profile
                    </Link>
                    <form action={logoutAction}>
                      <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-300 hover:bg-white/5">
                        <LogOut size={16} /> Log out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-mist transition hover:text-white">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary !px-5 !py-2 text-sm">
                  Sign Up
                </Link>
              </div>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mist lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="mx-auto max-w-7xl animate-fade-up px-4 pb-4 pt-3 sm:px-6 lg:hidden">
            <ul className="grid gap-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`block rounded-xl px-4 py-3 text-base ${isActive(l.href) ? "bg-sea/10 text-mint" : "text-mist hover:bg-white/5"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-2 border-t border-white/5 pt-3">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin" className="rounded-xl px-4 py-3 text-mint hover:bg-white/5">Admin Dashboard</Link>
                  )}
                  <Link href="/library" className="rounded-xl px-4 py-3 hover:bg-white/5">My Library</Link>
                  <Link href="/profile" className="rounded-xl px-4 py-3 hover:bg-white/5">Profile</Link>
                  <form action={logoutAction}>
                    <button className="w-full rounded-xl px-4 py-3 text-left text-red-300 hover:bg-white/5">Log out</button>
                  </form>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className="btn-ghost">Login</Link>
                  <Link href="/signup" className="btn-primary">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/80 px-4 pt-28 backdrop-blur-md" onClick={() => setSearchOpen(false)}>
          <form onSubmit={submitSearch} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl animate-fade-up">
            <div className="flex items-center gap-3 rounded-2xl border border-sea/40 bg-coal p-2 pl-5 shadow-[0_0_60px_-15px_rgba(32,178,170,0.6)]">
              <Search className="text-sea" size={22} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, author or genre…"
                className="flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-mist/50"
              />
              <button className="btn-primary !py-2.5">Search</button>
            </div>
            <p className="mt-3 text-center text-sm text-mist/70">Press Esc to close · Ctrl/⌘ + K to open anywhere</p>
          </form>
        </div>
      )}
    </>
  );
}
