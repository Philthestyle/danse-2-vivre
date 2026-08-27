import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { createFaq, deleteFaq } from "./actions";

export const metadata: Metadata = {
  title: "FAQ · Admin",
  robots: { index: false, follow: false },
};

interface Faq {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
}

export default async function AdminFaqPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("faq")
    .select("id, question, answer, order_index, is_active")
    .order("order_index");
  const items: Faq[] = (data ?? []) as Faq[];

  return (
    <div>
      <PageHeader
        eyebrow="Contenu"
        title="FAQ"
        description="Questions / réponses affichées sur la page d'accueil."
      />

      <form action={createFaq} className="card mb-8 space-y-3 p-5">
        <div>
          <label htmlFor="question" className="label">Question</label>
          <input id="question" name="question" required className="field" />
        </div>
        <div>
          <label htmlFor="answer" className="label">Réponse</label>
          <textarea id="answer" name="answer" required className="field min-h-24" />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="order_index" className="label">Ordre</label>
            <input
              id="order_index"
              name="order_index"
              type="number"
              min={0}
              defaultValue={items.length + 1}
              className="field w-24"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4" />
            Publier
          </label>
          <button type="submit" className="btn-primary ml-auto">
            Ajouter
          </button>
        </div>
      </form>

      <DataTable
        rows={items}
        empty="Aucune entrée FAQ."
        columns={[
          {
            key: "order_index",
            header: "#",
            className: "w-12 font-mono text-xs",
          },
          { key: "question", header: "Question", render: (r) => <span className="font-medium">{r.question}</span> },
          {
            key: "is_active",
            header: "Publié",
            render: (r) =>
              r.is_active ? (
                <span className="text-success">✓</span>
              ) : (
                <span className="text-muted">—</span>
              ),
            className: "w-20",
          },
        ]}
        actions={(r) => (
          <form action={deleteFaq}>
            <input type="hidden" name="id" value={r.id} />
            <ConfirmSubmit />
          </form>
        )}
      />
    </div>
  );
}
