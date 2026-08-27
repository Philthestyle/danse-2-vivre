#!/usr/bin/env node
/**
 * Bootstrap des 5 professeurs initiaux dans Supabase.
 *
 * Pipeline par prof :
 *   1) auth.admin.createUser (service_role) → crée l'auth user + trigger auto-crée le profile
 *   2) UPDATE profile role = 'teacher' (bypass RLS via service_role)
 *   3) INSERT teachers ligne (slug, speciality, started_at, bio)
 *
 * Sortie : mapping firstName → { userId, profileId, teacherId, slug }
 *
 * Usage :
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/bootstrap-teachers.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SRK) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(URL, SRK, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEACHERS = [
  {
    firstName: "Paolo",
    slug: "paolo",
    speciality: "Salsa & Bachata",
    bio: "Passionné de danses latines, Paolo transmet la joie et l'énergie de la scène.",
    startedAt: "2019-09-01",
  },
  {
    firstName: "Benjy",
    slug: "benjy",
    speciality: "Hip-Hop",
    bio: "Benjy amène le hip-hop dans les villages avec exigence, humour et bienveillance.",
    startedAt: "2020-01-15",
  },
  {
    firstName: "Hugo",
    slug: "hugo",
    speciality: "Contemporain",
    bio: "Chorégraphe et danseur, Hugo explore la matière et l'émotion du geste contemporain.",
    startedAt: "2018-10-05",
  },
  {
    firstName: "Sophie",
    slug: "sophie",
    speciality: "Classique & Modern Jazz",
    bio: "Formée au conservatoire, Sophie enseigne la rigueur du classique et la liberté du modern jazz.",
    startedAt: "2017-09-01",
  },
  {
    firstName: "Tisoda",
    slug: "tisoda",
    speciality: "Afro & Danses urbaines",
    bio: "Tisoda fait vibrer les danses africaines et urbaines dans une même énergie.",
    startedAt: "2021-02-10",
  },
];

const results = [];

for (const t of TEACHERS) {
  console.log(`\n▸ ${t.firstName}`);

  // 1) auth user (email plausible + mot de passe temporaire aléatoire)
  const email = `${t.slug}@d2v.local`;
  const password = randomBytes(24).toString("base64url");

  const { data: existing } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  const already = existing.users.find((u) => u.email === email);

  let userId;
  if (already) {
    userId = already.id;
    console.log(`  · auth user existe déjà: ${userId}`);
  } else {
    const { data: created, error: err } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: t.firstName,
        last_name: "",
      },
    });
    if (err) {
      console.error(`  ✗ createUser failed: ${err.message}`);
      continue;
    }
    userId = created.user.id;
    console.log(`  ✓ auth user: ${userId}`);
  }

  // 2) Update profile → role=teacher (trigger a déjà créé un profile role=member)
  const { error: updErr } = await admin
    .from("profiles")
    .update({ role: "teacher", first_name: t.firstName, last_name: "" })
    .eq("id", userId);
  if (updErr) {
    console.error(`  ✗ profile update failed: ${updErr.message}`);
    continue;
  }
  console.log(`  ✓ profile role=teacher`);

  // 3) teachers row (upsert on slug)
  const { data: teacherRow, error: tErr } = await admin
    .from("teachers")
    .upsert(
      {
        profile_id: userId,
        slug: t.slug,
        speciality: t.speciality,
        bio: t.bio,
        started_at: t.startedAt,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();
  if (tErr) {
    console.error(`  ✗ teachers upsert failed: ${tErr.message}`);
    continue;
  }
  console.log(`  ✓ teacher: ${teacherRow.id}`);

  results.push({
    firstName: t.firstName,
    slug: t.slug,
    userId,
    teacherId: teacherRow.id,
    email,
  });
}

console.log("\n\n=== MAPPING ===\n");
for (const r of results) {
  console.log(`${r.firstName.padEnd(8)} teacherId=${r.teacherId}  authId=${r.userId}  slug=${r.slug}`);
}
console.log(
  "\nJSON:\n" +
    JSON.stringify(
      Object.fromEntries(results.map((r) => [r.firstName, r.teacherId])),
      null,
      2
    )
);
