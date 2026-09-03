#!/usr/bin/env node
/**
 * Crée (ou vérifie) le bucket public `media` dans Supabase Storage.
 * Idempotent : safe à relancer.
 *
 * Usage : `node scripts/setup-storage-bucket.mjs` (depuis la racine, avec
 * les vars du .env.local exportées ou via `dotenv`).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Charge .env.local à la main (pas de dépendance à dotenv)
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SRK) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const BUCKET = "media";
const admin = createClient(SUPABASE_URL, SRK, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing } = await admin.storage.getBucket(BUCKET);
if (existing) {
  console.log(`✓ Bucket "${BUCKET}" existe déjà (public=${existing.public}).`);
  if (!existing.public) {
    const { error } = await admin.storage.updateBucket(BUCKET, { public: true });
    if (error) throw error;
    console.log(`✓ Bucket "${BUCKET}" passé en public.`);
  }
  process.exit(0);
}

const { error } = await admin.storage.createBucket(BUCKET, {
  public: true,
  fileSizeLimit: Number(process.env.S3_MAX_UPLOAD_BYTES ?? 10 * 1024 * 1024),
  allowedMimeTypes: (process.env.S3_ALLOWED_MIME ?? "image/jpeg,image/png,image/webp")
    .split(",")
    .map((m) => m.trim()),
});
if (error) {
  console.error("createBucket failed:", error);
  process.exit(1);
}
console.log(`✓ Bucket "${BUCKET}" créé (public, MIME whitelist appliquée).`);
