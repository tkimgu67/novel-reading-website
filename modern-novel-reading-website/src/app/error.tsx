"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-24 text-center">
      <div className="text-6xl">📖💫</div>
      <h1 className="mt-6 font-display text-3xl font-bold">A page slipped out of the book</h1>
      <p className="mt-3 text-mist">Something went wrong while loading this page. Please try again in a moment.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-ghost">Go home</Link>
      </div>
    </div>
  );
}
