import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="font-display text-8xl font-extrabold text-gradient">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">This story doesn&apos;t exist… yet</h1>
      <p className="mt-3 text-mist">The page or novel you&apos;re looking for may have been moved or unpublished.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/explore" className="btn-primary">Explore Novels</Link>
        <Link href="/" className="btn-ghost">Go home</Link>
      </div>
    </div>
  );
}
