import type { Metadata } from "next";
import { CategoryGrid, PageHeader } from "@/components/Sections";
import { getGenreCounts } from "@/lib/queries";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const counts = await getGenreCounts();
  return (
    <>
      <PageHeader eyebrow="Genres" title="Novel Categories" subtitle="From sweeping romances to spine-chilling horror — pick a world and dive in." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CategoryGrid counts={counts} />
      </div>
    </>
  );
}
