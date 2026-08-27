import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PreviewNotice } from "@/components/PreviewNotice";

export const metadata: Metadata = {
  title: "Messagerie",
  robots: { index: false, follow: false },
};

export default async function MessagingPage() {
  if (IS_STATIC_PREVIEW) return <PreviewNotice area="Messagerie" />;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/messagerie");

  // Récupère les conversations autorisées (RLS filtre automatiquement).
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, kind, group:course_groups(name, course:courses(title))")
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Discussions
        </p>
        <h1 className="mt-2 text-5xl">Messagerie</h1>
        <p className="mt-3 text-muted">
          Les conversations de vos cours et vos échanges avec les professeurs.
        </p>
      </header>

      <div className="mt-10">
        {!conversations || conversations.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-lg">Aucune conversation pour le moment.</p>
            <p className="mt-2 text-muted">
              Vos discussions apparaîtront ici dès que vous rejoindrez un groupe ou
              contacterez un professeur.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {conversations.map((c) => {
              type G = { name: string; course?: { title: string } | { title: string }[] };
              const rawGroup = c.group as unknown as G | G[] | null | undefined;
              const group: G | undefined = Array.isArray(rawGroup) ? rawGroup[0] : rawGroup ?? undefined;
              const course = Array.isArray(group?.course) ? group?.course[0] : group?.course;
              const label =
                c.kind === "group"
                  ? course?.title ?? group?.name ?? "Groupe"
                  : "Message privé";
              return (
                <li key={c.id}>
                  <Link
                    href={`/messagerie/${c.id}`}
                    className="card block p-5 hover:border-primary"
                  >
                    <p className="font-medium">{label}</p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                      {c.kind === "group" ? "Groupe de cours" : "Conversation privée"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
