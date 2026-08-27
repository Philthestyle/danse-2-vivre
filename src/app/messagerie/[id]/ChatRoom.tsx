"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";

interface Message {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
}

export function ChatRoom({
  conversationId,
  currentUserId,
  canWrite,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  canWrite: boolean;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [messages]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("body") ?? "").trim();
    if (!body) return;
    if (body.length > 4000) {
      setError("Message trop long (4000 max).");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      author_id: currentUserId,
      body,
    });
    setPending(false);
    if (err) {
      // RLS bloquera si announcement_only pour un member — l'UI l'empêche déjà mais defense in depth.
      setError("Envoi impossible. Vérifiez vos droits.");
      return;
    }
    form.reset();
  }

  return (
    <div className="card flex h-[65vh] flex-col overflow-hidden">
      <div ref={feedRef} className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-muted">Aucun message pour l'instant.</p>
        )}
        {messages.map((m) => {
          const mine = m.author_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "bg-primary text-primary-fg rounded-br-sm"
                    : "bg-elevated rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-1 text-[10px] opacity-70 ${
                    mine ? "text-right" : ""
                  }`}
                >
                  {formatDateTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {canWrite ? (
        <form
          onSubmit={onSubmit}
          className="flex items-end gap-2 border-t border-border bg-elevated/40 p-3"
        >
          <label htmlFor="body" className="sr-only">
            Nouveau message
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={2}
            maxLength={4000}
            placeholder="Écrire un message…"
            className="field min-h-[52px] resize-none flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).form?.requestSubmit();
              }
            }}
          />
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "…" : "Envoyer"}
          </button>
        </form>
      ) : (
        <div className="border-t border-border bg-elevated/40 p-4 text-center text-sm text-muted">
          Mode annonces — vous pouvez lire les messages du professeur et de l'administration.
        </div>
      )}

      {error && (
        <p role="alert" className="border-t border-border bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
