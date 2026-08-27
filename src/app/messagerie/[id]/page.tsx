import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PreviewNotice } from "@/components/PreviewNotice";
import { ChatRoom } from "./ChatRoom";

export const metadata: Metadata = {
  title: "Conversation",
  robots: { index: false, follow: false },
};

// En mode static export, un dummy param est nécessaire (Next 15 refuse un array vide).
// La page rend <PreviewNotice /> car IS_STATIC_PREVIEW = true.
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ id: "preview" }];
}

interface Conversation {
  id: string;
  kind: "group" | "private";
  group_id: string | null;
  member_a: string | null;
  member_b: string | null;
}

interface Message {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (IS_STATIC_PREVIEW) return <PreviewNotice area="Messagerie" />;

  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/connexion?next=/messagerie/${id}`);

  const { data: conversation } = (await supabase
    .from("conversations")
    .select("id, kind, group_id, member_a, member_b")
    .eq("id", id)
    .maybeSingle()) as { data: Conversation | null };

  if (!conversation) notFound();

  // RLS a déjà filtré : si l'utilisateur n'a pas accès, la ligne n'est pas visible.
  let mode: "normal" | "announcement_only" = "normal";
  let title = "Conversation";

  if (conversation.kind === "group" && conversation.group_id) {
    const { data: group } = await supabase
      .from("course_groups")
      .select("name, mode, course:courses(title)")
      .eq("id", conversation.group_id)
      .maybeSingle();
    if (group) {
      const course = Array.isArray(group.course) ? group.course[0] : group.course;
      mode = group.mode as "normal" | "announcement_only";
      title = course?.title ? `${course.title} — ${group.name}` : group.name;
    }
  } else if (conversation.kind === "private") {
    const otherId =
      conversation.member_a === user.id ? conversation.member_b : conversation.member_a;
    if (otherId) {
      const { data: other } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", otherId)
        .maybeSingle();
      title = other ? `${other.first_name} ${other.last_name}` : "Conversation privée";
    }
  }

  // Vérifie si le user courant peut écrire
  let canWrite = true;
  if (conversation.kind === "group" && mode === "announcement_only") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    canWrite = profile?.role === "teacher" || profile?.role === "admin";
  }

  const { data: initialMessages } = await supabase
    .from("messages")
    .select("id, body, author_id, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <div className="container-page py-8">
      <Link href="/messagerie" className="text-sm text-muted hover:text-primary">
        ← Toutes les conversations
      </Link>
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{title}</h1>
        {mode === "announcement_only" && (
          <span className="rounded-pill bg-accent/20 px-3 py-1 text-xs">
            Mode annonces — lecture seule pour les adhérents
          </span>
        )}
      </div>

      <ChatRoom
        conversationId={id}
        currentUserId={user.id}
        canWrite={canWrite}
        initialMessages={(initialMessages ?? []) as Message[]}
      />
    </div>
  );
}
