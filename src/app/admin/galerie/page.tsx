import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { Uploader } from "@/components/features/Uploader";
import { createGalleryItem, deleteGalleryItem } from "./actions";

export const metadata: Metadata = {
  title: "Galerie · Admin",
  robots: { index: false, follow: false },
};

interface Media {
  id: string;
  title: string;
  media_key: string;
  order_index: number;
  is_active: boolean;
}

export default async function AdminGalleryPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery")
    .select("id, title, media_key, order_index, is_active")
    .order("order_index");
  const items: Media[] = (data ?? []) as Media[];

  return (
    <div>
      <PageHeader
        eyebrow="Médias"
        title="Galerie"
        description="Photos de la vie de l'association affichées sur la page d'accueil."
      />

      <details className="card mb-8 p-5">
        <summary className="cursor-pointer text-lg font-semibold">
          Nouvelle photo
        </summary>
        <form action={createGalleryItem} className="mt-4 space-y-3">
          <div>
            <label htmlFor="title" className="label">Titre</label>
            <input id="title" name="title" required className="field" />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" name="description" className="field" rows={2} />
          </div>
          <div>
            <label className="label">Média (image)</label>
            <Uploader category="gallery" hiddenName="media_key" />
          </div>
          <div className="flex items-end justify-between gap-3">
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
              Visible
            </label>
            <button type="submit" className="btn-primary ml-auto">Ajouter</button>
          </div>
        </form>
      </details>

      <DataTable
        rows={items}
        empty="La galerie est vide."
        columns={[
          { key: "order_index", header: "#", className: "w-12 font-mono text-xs" },
          { key: "title", header: "Titre" },
          {
            key: "media_key",
            header: "Clé S3",
            render: (m) => (
              <code className="font-mono text-xs text-muted">{m.media_key}</code>
            ),
          },
          {
            key: "is_active",
            header: "Visible",
            className: "w-24",
            render: (m) =>
              m.is_active ? (
                <span className="text-success">✓</span>
              ) : (
                <span className="text-muted">—</span>
              ),
          },
        ]}
        actions={(m) => (
          <form action={deleteGalleryItem}>
            <input type="hidden" name="id" value={m.id} />
            <ConfirmSubmit />
          </form>
        )}
      />
    </div>
  );
}
