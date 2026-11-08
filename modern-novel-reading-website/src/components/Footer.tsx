import Link from "next/link";
import Logo from "./Logo";
import { GENRES } from "@/lib/genres";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore Novels" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-coal/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sea/60 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo size="lg" />
          <p className="mt-5 max-w-sm font-display text-xl italic text-mint/90">&ldquo;Every Story Has a World. Discover Yours.&rdquo;</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
            HeyNovelWorld is a home for unforgettable stories. Every published chapter is free to read — forever.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-sea">Explore</h4>
          <ul className="grid gap-2.5">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-mist transition hover:pl-1 hover:text-mint">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-sea">Genres</h4>
          <ul className="flex flex-wrap gap-2">
            {GENRES.slice(0, 8).map((g) => (
              <li key={g.slug}>
                <Link href={`/categories/${g.slug}`} className="inline-block rounded-full border border-white/10 px-3 py-1 text-xs text-mist transition hover:border-sea hover:text-mint">
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-sm text-mist/70">© 2026 HeyNovelWorld. All Rights Reserved.</div>
    </footer>
  );
}
