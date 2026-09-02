import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateFaq } from "../../actions";

export const metadata: Metadata = {
  title: "Modifier FAQ · Admin",
  robots: { index: false, follow: false },
};

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (IS_STATIC_PREVIEW) return null;
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: faq } = await supabase
    .from("faq")
    .select("id, question, answer, order_index, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!faq) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Contenu"
        title="Modifier une question"
        description="Édition d'une entrée FAQ."
      />

      <div className="mb-4">
        <Link href="/admin/faq" className="text-sm text-muted hover:text-fg">
          ← Retour à la liste
        </Link>
      </div>

      <form action={updateFaq} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={faq.id} />

        <div>
          <label htmlFor="question" className="label">Question</label>
          <input
            id="question"
            name="question"
            required
            defaultValue={faq.question}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="answer" className="label">Réponse</label>
          <textarea
            id="answer"
            name="answer"
            required
            defaultValue={faq.answer}
            className="field min-h-32"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="order_index" className="label">Ordre</label>
            <input
              id="order_index"
              name="order_index"
              type="number"
              min={0}
              defaultValue={faq.order_index}
              className="field w-24"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={faq.is_active}
              className="h-4 w-4"
            />
            Publier
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">Enregistrer</button>
          <Link href="/admin/faq" className="btn-ghost">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
