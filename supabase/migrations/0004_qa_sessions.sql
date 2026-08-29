-- =============================================================================
-- Danse 2 Vivre — QA Sessions
-- Table de persistance multi-testeurs pour l'outil QA (/qa/).
-- Chaque testeur (Allan, Faustin, autres) a UNE ligne unique keyée sur son
-- pseudo. Aucune auth requise — c'est un outil interne obscur, données non
-- sensibles (statuts de test).
-- =============================================================================

create table if not exists public.qa_sessions (
  tester_name text primary key,
  flows jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists qa_sessions_updated_at_idx
  on public.qa_sessions (updated_at desc);

alter table public.qa_sessions enable row level security;

-- Politique permissive : n'importe quel client anon peut lire/écrire ses lignes.
-- Justification : l'URL est privée, la donnée est un tableau de statuts de QA
-- (aucun secret, aucun PII). Le seul risque est qu'un testeur écrase la session
-- d'un autre — mitigé par le fait que chacun choisit un pseudo unique.
drop policy if exists qa_sessions_anon_read on public.qa_sessions;
create policy qa_sessions_anon_read
  on public.qa_sessions for select
  to anon, authenticated
  using (true);

drop policy if exists qa_sessions_anon_upsert on public.qa_sessions;
create policy qa_sessions_anon_upsert
  on public.qa_sessions for insert
  to anon, authenticated
  with check (true);

drop policy if exists qa_sessions_anon_update on public.qa_sessions;
create policy qa_sessions_anon_update
  on public.qa_sessions for update
  to anon, authenticated
  using (true)
  with check (true);

-- updated_at auto
create or replace function public.set_qa_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists qa_sessions_touch on public.qa_sessions;
create trigger qa_sessions_touch
  before update on public.qa_sessions
  for each row execute function public.set_qa_sessions_updated_at();
