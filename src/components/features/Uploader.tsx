"use client";

import { useState } from "react";

type Category = "news" | "gallery" | "teacher" | "avatar";

interface SignResponse {
  uploadUrl: string;
  publicUrl: string;
  path: string;
}

/**
 * Composant d'upload Supabase Storage :
 *   1) POST /api/s3/presign avec category + filename + contentType + size
 *   2) PUT direct vers Supabase Storage avec le signed URL
 *   3) Callback onUploaded avec la publicUrl (stockée telle quelle en base)
 *
 * Le service_role ne quitte jamais le serveur. Le signed URL expire.
 */
export function Uploader({
  category,
  onUploaded,
  hiddenName,
}: {
  category: Category;
  onUploaded?: (url: string) => void;
  /** Si fourni, écrit la publicUrl dans un input hidden pour submit dans un formulaire parent. */
  hiddenName?: string;
}) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "uploading" }
    | { status: "done"; url: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setState({ status: "uploading" });

      const sign = await fetch("/api/s3/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          filename: file.name,
          contentType: file.type,
          contentLength: file.size,
        }),
      });
      if (!sign.ok) {
        const err = await sign.json().catch(() => ({}));
        throw new Error(err.error ?? "sign_failed");
      }
      const { uploadUrl, publicUrl } = (await sign.json()) as SignResponse;

      const up = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!up.ok) throw new Error("upload_failed");

      setState({ status: "done", url: publicUrl });
      onUploaded?.(publicUrl);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "upload_failed",
      });
    }
  }

  return (
    <div>
      <label className="btn-outline inline-flex cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          disabled={state.status === "uploading"}
          className="sr-only"
        />
        {state.status === "uploading" ? "Envoi…" : "Choisir un fichier"}
      </label>

      {state.status === "done" && (
        <>
          <p className="mt-2 text-sm text-success">
            ✓ Fichier envoyé
          </p>
          {hiddenName && <input type="hidden" name={hiddenName} value={state.url} />}
        </>
      )}
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-danger">
          Erreur : {state.message}
        </p>
      )}
    </div>
  );
}
