export type Genre = {
  name: string;
  slug: string;
  emoji: string;
  blurb: string;
  gradient: string;
};

export const GENRES: Genre[] = [
  { name: "Romance", slug: "romance", emoji: "💞", blurb: "Love stories that linger", gradient: "from-rose-500/30 to-teal-500/10" },
  { name: "Fantasy", slug: "fantasy", emoji: "🐉", blurb: "Magic, myths & kingdoms", gradient: "from-violet-500/30 to-teal-500/10" },
  { name: "Horror", slug: "horror", emoji: "🕯️", blurb: "Things that go bump", gradient: "from-red-700/30 to-black/10" },
  { name: "Mystery", slug: "mystery", emoji: "🔍", blurb: "Clues, secrets & twists", gradient: "from-indigo-500/30 to-teal-500/10" },
  { name: "Thriller", slug: "thriller", emoji: "⚡", blurb: "Heart-pounding suspense", gradient: "from-amber-500/30 to-teal-500/10" },
  { name: "Adventure", slug: "adventure", emoji: "🧭", blurb: "Journeys into the unknown", gradient: "from-emerald-500/30 to-teal-500/10" },
  { name: "Comedy", slug: "comedy", emoji: "😄", blurb: "Laughter on every page", gradient: "from-yellow-400/30 to-teal-500/10" },
  { name: "Drama", slug: "drama", emoji: "🎭", blurb: "Lives in full color", gradient: "from-fuchsia-500/30 to-teal-500/10" },
  { name: "Science Fiction", slug: "science-fiction", emoji: "🚀", blurb: "Futures & far galaxies", gradient: "from-cyan-500/30 to-teal-500/10" },
  { name: "Historical Fiction", slug: "historical-fiction", emoji: "🏛️", blurb: "Echoes of the past", gradient: "from-orange-600/30 to-teal-500/10" },
  { name: "Emotional Stories", slug: "emotional-stories", emoji: "🌧️", blurb: "Stories that touch hearts", gradient: "from-sky-500/30 to-teal-500/10" },
];

export const GENRE_NAMES = GENRES.map((g) => g.name);

export function genreBySlug(slug: string) {
  return GENRES.find((g) => g.slug === slug);
}

export function genreSlug(name: string) {
  return GENRES.find((g) => g.name === name)?.slug ?? slugify(name);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180);
}
