#!/usr/bin/env node
/**
 * Crée un compte admin. Utilise le service_role — server-only.
 *
 * Usage :
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/bootstrap-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!URL || !SRK || !EMAIL || !PASSWORD) {
  console.error(
    "Manque : NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ADMIN_EMAIL / ADMIN_PASSWORD"
  );
  process.exit(1);
}

const admin = createClient(URL, SRK, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Cherche si l'email existe déjà
const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1000 });
let userId = existing.users.find((u) => u.email === EMAIL)?.id;

if (userId) {
  console.log(`▸ Compte existe déjà (${userId}), mise à jour du password + role`);
  await admin.auth.admin.updateUserById(userId, {
    password: PASSWORD,
    email_confirm: true,
  });
} else {
  const { data: created, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: "Faustin", last_name: "" },
  });
  if (error) {
    console.error("createUser failed:", error.message);
    process.exit(1);
  }
  userId = created.user.id;
  console.log(`▸ Auth user créé: ${userId}`);
}

const { error: updErr } = await admin
  .from("profiles")
  .update({ role: "admin", first_name: "Faustin", last_name: "" })
  .eq("id", userId);
if (updErr) {
  console.error("profile update failed:", updErr.message);
  process.exit(1);
}

console.log(`\n✓ Admin prêt`);
console.log(`  email    : ${EMAIL}`);
console.log(`  userId   : ${userId}`);
console.log(`  role     : admin`);
