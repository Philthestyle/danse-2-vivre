"use client";

import { useState } from "react";

type Category = "news" | "gallery" | "teacher" | "avatar";

interface PresignResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
}

/**
 * Composant d'upload S3 :
 *   1) POST /api/s3/presign avec category + filename + contentType + size
 *   2) POST direct S3 avec les fields renvoyés
 *   3) Callback onUploaded avec la key S3 (à stocker en base côté serveur)
 *
 * Les credentials AWS ne quittent jamais le serveur. Le presign expire en 5 min.
 */
export function Uploader({
  category,
  onUploaded,
  hiddenName,
}: {
  category: Category;
  onUploaded?: (key: string) => void;
  /** Si fourni, écrit la key dans un input hidden pour submit dans un formulaire parent. */
  hiddenName?: string;
}) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "uploading"; progress: number }
    | { status: "done"; key: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setState({ status: "uploading", progress: 0 });

      const presign = await fetch("/api/s3/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          filename: file.name,
          contentType: file.type,
          contentLength: file.size,
        }),
      });
      if (!presign.ok) {
        const err = await presign.json().catch(() => ({}));
        throw new Error(err.error ?? "presign_failed");
      }
      const { url, fields, key } = (await presign.json()) as PresignResponse;

      const form = new FormData();
      for (const [k, v] of Object.entries(fields)) form.append(k, v);
      form.append("file", file);

      const up = await fetch(url, { method: "POST", body: form });
      if (!up.ok) throw new Error("s3_upload_failed");

      setState({ status: "done", key });
      onUploaded?.(key);
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
            ✓ Fichier envoyé · <code className="font-mono text-xs">{state.key}</code>
          </p>
          {hiddenName && <input type="hidden" name={hiddenName} value={state.key} />}
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
