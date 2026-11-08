import type { Metadata } from "next";
import Link from "next/link";
import { BookHeart, Feather, Globe2, HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/Sections";

export const metadata: Metadata = { title: "About Us" };

const VALUES = [
  { icon: BookHeart, title: "Free, forever", text: "Every published chapter on HeyNovelWorld is free to read. No paywalls, no coins, no tricks." },
  { icon: Feather, title: "Curated with care", text: "Each novel is personally selected, edited and published by our editorial team." },
  { icon: Globe2, title: "Read anywhere", text: "A reader designed for phones, tablets and desktops — with your progress synced everywhere." },
  { icon: HeartHandshake, title: "Reader-first", text: "Comfortable typography, light & dark modes and zero distractions. Just you and the story." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Our story" title="About HeyNovelWorld" subtitle="Every Story Has a World. Discover Yours." />
      <div className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5 font-read text-lg leading-relaxed text-mist">
            <p>
              HeyNovelWorld was born from a simple belief: <span className="text-white">great stories should be open to everyone</span>. Whether
              you&apos;re commuting, winding down before sleep or stealing a few minutes between classes, a beautiful world should be one tap away.
            </p>
            <p>
              We publish novels across romance, fantasy, horror, mystery, science fiction and more — each one crafted for a calm, immersive reading
              experience. New chapters appear the moment they&apos;re published, and your place in every story is always saved.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-sea/20 bg-gradient-to-br from-coal to-ink p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sea/25 blur-[90px]" />
            <p className="relative font-display text-3xl italic leading-snug text-white">&ldquo;A reader lives a thousand lives before he dies. The man who never reads lives only one.&rdquo;</p>
            <p className="relative mt-4 text-mint">— George R.R. Martin</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-3xl border border-white/5 bg-coal p-6 transition hover:-translate-y-1 hover:border-sea/40">
              <v.icon className="text-sea" size={28} />
              <h3 className="mt-4 font-display text-xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-mist">{v.text}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/explore" className="btn-primary">Start exploring</Link>
          <Link href="/contact" className="btn-ghost">Contact us</Link>
        </div>
      </div>
    </>
  );
}
