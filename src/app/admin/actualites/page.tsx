import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { Uploader } from "@/components/features/Uploader";
import { formatDate } from "@/lib/utils";
import { createNews, deleteNews, togglePublishForm } from "./actions";

export const metadata: Metadata = {
  title: "Actualités · Admin",
  robots: { index: false, follow: false },
};

interface News {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
}

export default async function AdminNewsPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("id, slug, title, status, published_at, created_at")
    .order("created_at", { ascending: false });
  const news: News[] = (data ?? []) as News[];

  return (
    <div>
      <PageHeader
        eyebrow="Journal"
        title="Actualités"
        description="Rédaction et publication du magazine Danse 2 Vivre."
      />

      <details className="card mb-8 p-5">
        <summary className="cursor-pointer text-lg font-semibold">
          Nouvel article
        </summary>
        <form action={createNews} className="mt-4 space-y-3">
          <div>
            <label htmlFor="title" className="label">Titre</label>
            <input id="title" name="title" required className="field" />
          </div>
          <div>
            <label htmlFor="slug" className="label">Slug (optionnel — généré depuis le titre)</label>
            <input id="slug" name="slug" pattern="[a-z0-9-]+" className="field" />
          </div>
          <div>
            <label htmlFor="excerpt" className="label">Résumé</label>
            <textarea id="excerpt" name="excerpt" className="field" rows={2} />
          </div>
          <div>
            <label htmlFor="content" className="label">Contenu</label>
            <textarea id="content" name="content" required className="field" rows={8} />
          </div>
          <div>
            <label className="label">Image</label>
            <Uploader category="news" hiddenName="image_key" />
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <label htmlFor="status" className="label">Statut</label>
              <select id="status" name="status" className="field w-40" defaultValue="draft">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Créer</button>
          </div>
        </form>
      </details>

      <DataTable
        rows={news}
        empty="Aucune actualité pour le moment."
        columns={[
          {
            key: "title",
            header: "Titre",
            render: (n) => (
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-muted font-mono">/{n.slug}</p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Statut",
            className: "w-32",
            render: (n) => (
              <span
                className={`rounded-pill px-3 py-1 text-xs ${
                  n.status === "published"
                    ? "bg-success/15 text-success"
                    : "bg-elevated text-muted"
                }`}
              >
                {n.status === "published" ? "Publié" : "Brouillon"}
              </span>
            ),
          },
          {
            key: "published_at",
            header: "Publication",
            className: "w-40",
            render: (n) =>
              n.published_at ? (
                <span className="text-sm">{formatDate(n.published_at)}</span>
              ) : (
                <span className="text-sm text-muted">—</span>
              ),
          },
        ]}
        actions={(n) => (
          <>
            <form action={togglePublishForm}>
              <input type="hidden" name="id" value={n.id} />
              <input
                type="hidden"
                name="next"
                value={n.status === "published" ? "draft" : "published"}
              />
              <button type="submit" className="btn-ghost text-primary">
                {n.status === "published" ? "Dépublier" : "Publier"}
              </button>
            </form>
            <form action={deleteNews}>
              <input type="hidden" name="id" value={n.id} />
              <ConfirmSubmit />
            </form>
          </>
        )}
      />
    </div>
  );
}
