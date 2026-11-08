import NovelForm from "@/components/admin/NovelForm";
import { requireAdmin } from "@/lib/auth";

export default async function NewNovelPage() {
  await requireAdmin();
  return (
    <div className="rounded-3xl border border-white/5 bg-coal p-6 sm:p-8">
      <h1 className="mb-1 font-display text-3xl font-bold">Add a New Novel</h1>
      <p className="mb-8 text-sm text-mist">Fill in the details below. You can add chapters right after creating the novel.</p>
      <NovelForm />
    </div>
  );
}
