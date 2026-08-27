#!/usr/bin/env node
/**
 * Update teachers.photo_key = "teachers/<slug>.png" pour les 5 profs bootstrappés.
 * Les photos sont servies depuis /public/images/teachers/<slug>.png (assets statiques).
 * Plus tard, quand AWS sera configuré, on migrera vers S3 et le helper de rendu
 * détectera le format S3 automatiquement.
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SRK) {
  console.error("Missing env");
  process.exit(1);
}
const admin = createClient(URL, SRK, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const slugs = ["paolo", "benjy", "hugo", "sophie", "tisoda"];
for (const slug of slugs) {
  const { error } = await admin
    .from("teachers")
    .update({ photo_key: `teachers/${slug}.png` })
    .eq("slug", slug);
  console.log(error ? `✗ ${slug}: ${error.message}` : `✓ ${slug} → teachers/${slug}.png`);
}
