import Link from "next/link";
import { redirect } from "next/navigation";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PreviewNotice } from "@/components/PreviewNotice";

const adminSections = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/professeurs", label: "Professeurs" },
  { href: "/admin/villes", label: "Villes" },
  { href: "/admin/cours", label: "Cours & calendrier" },
  { href: "/admin/groupes", label: "Groupes" },
  { href: "/admin/adherents", label: "Adhérents" },
  { href: "/admin/adhesions", label: "Adhésions" },
  { href: "/admin/actualites", label: "Actualités" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/faq", label: "FAQ" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (IS_STATIC_PREVIEW) return <PreviewNotice area="Administration" />;

  // Double check en plus du middleware (defense in depth).
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="container-page py-12">
      <div className="grid gap-8 md:grid-cols-[240px,1fr]">
        <aside>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Administration
          </p>
          <nav aria-label="Sections d'administration">
            <ul className="space-y-1">
              {adminSections.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-elevated"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
