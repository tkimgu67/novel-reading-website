import { PageHeader } from "./Sections";

export default function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string }[] }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} subtitle={`Last updated ${updated}`} />
      <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
        {sections.map((s, i) => (
          <section key={i} className="rounded-3xl border border-white/5 bg-coal p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-mint">{i + 1}. {s.h}</h2>
            <p className="mt-3 leading-relaxed text-mist">{s.p}</p>
          </section>
        ))}
      </div>
    </>
  );
}
