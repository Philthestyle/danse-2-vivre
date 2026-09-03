import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { Uploader } from "@/components/features/Uploader";
import { updateNews } from "../../actions";

export const metadata: Metadata = {
  title: "Modifier actualité · Admin",
  robots: { index: false, follow: false },
};

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (IS_STATIC_PREVIEW) return null;
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: news } = await supabase
    .from("news")
    .select("id, slug, title, excerpt, content, image_key, status")
    .eq("id", id)
    .maybeSingle();

  if (!news) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Journal"
        title={`Modifier « ${news.title} »`}
        description="Modification de l'article. Le slug change l'URL publique."
      />

      <div className="mb-4">
        <Link href="/admin/actualites" className="text-sm text-muted hover:text-fg">
          ← Retour à la liste
        </Link>
      </div>

      <form action={updateNews} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={news.id} />

        <div>
          <label htmlFor="title" className="label">Titre</label>
          <input id="title" name="title" required defaultValue={news.title} className="field" />
        </div>

        <div>
          <label htmlFor="slug" className="label">Slug (URL publique)</label>
          <input
            id="slug"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={news.slug}
            className="field"
          />
          <p className="mt-1 text-xs text-muted">
            URL publique : <code>/actualites/{news.slug}</code>
          </p>
        </div>

        <div>
          <label htmlFor="excerpt" className="label">Résumé</label>
          <textarea
            id="excerpt"
            name="excerpt"
            className="field"
            rows={2}
            defaultValue={news.excerpt ?? ""}
          />
        </div>

        <div>
          <label htmlFor="content" className="label">Contenu</label>
          <textarea
            id="content"
            name="content"
            required
            className="field"
            rows={10}
            defaultValue={news.content}
          />
        </div>

        <div>
          <label className="label">Image (laisser vide pour conserver)</label>
          <Uploader category="news" hiddenName="image_key" />
          {news.image_key && (
            <p className="mt-1 text-xs text-muted break-all">
              Image actuelle : <code>{news.image_key}</code>
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <label htmlFor="status" className="label">Statut</label>
            <select
              id="status"
              name="status"
              className="field w-40"
              defaultValue={news.status}
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/actualites" className="btn-ghost">Annuler</Link>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </div>
      </form>
    </div>
  );
}
