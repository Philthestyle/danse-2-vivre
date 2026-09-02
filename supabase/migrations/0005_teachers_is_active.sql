-- Ajoute is_active aux teachers pour permettre l'activation/désactivation
-- sans supprimer le prof (préserver historique cours/messages).

alter table public.teachers
  add column if not exists is_active boolean not null default true;

create index if not exists teachers_active_idx on public.teachers(is_active);

-- Met à jour la policy public read : seuls les profs actifs sont visibles
-- (les admins voient tout).
drop policy if exists "teachers_public_read" on public.teachers;

create policy "teachers_public_read"
  on public.teachers for select
  using (is_active or public.is_admin());
