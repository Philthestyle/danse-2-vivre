-- =============================================================================
-- Danse 2 Vivre — schéma initial (Jalon 2)
-- Cf. brief §14 (tables), §15 (RLS), §10 (rôles).
-- Migrations ordonnées, rejouables, versionnées.
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Types énumérés (contrôlés)
-- -----------------------------------------------------------------------------
create type user_role as enum ('member', 'teacher', 'admin');
create type membership_pack as enum ('classique', 'village');
create type membership_status as enum ('pending', 'active', 'expired', 'cancelled');
create type news_status as enum ('draft', 'published');
create type conversation_kind as enum ('group', 'private');
create type group_mode as enum ('normal', 'announcement_only');

-- -----------------------------------------------------------------------------
-- Cities (référentiel villes actives)
-- -----------------------------------------------------------------------------
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Profiles (extension de auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  role user_role not null default 'member',
  pack membership_pack,
  city_id uuid references public.cities(id) on delete set null,
  avatar_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_city_idx on public.profiles(city_id);

-- -----------------------------------------------------------------------------
-- Teachers (profil public associé à un profile role=teacher)
-- -----------------------------------------------------------------------------
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique,
  speciality text not null,
  photo_key text,
  bio text,
  started_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index teachers_slug_idx on public.teachers(slug);

-- Table de jointure teacher <-> cities
create table public.teacher_cities (
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  primary key (teacher_id, city_id)
);

-- -----------------------------------------------------------------------------
-- Courses
-- -----------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  city_id uuid references public.cities(id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  recurrence jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_time_valid check (ends_at > starts_at)
);

create index courses_teacher_idx on public.courses(teacher_id);
create index courses_starts_idx on public.courses(starts_at);

-- -----------------------------------------------------------------------------
-- Course groups + membres
-- -----------------------------------------------------------------------------
create table public.course_groups (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  mode group_mode not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index course_groups_course_idx on public.course_groups(course_id);

create table public.group_members (
  group_id uuid not null references public.course_groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);

-- -----------------------------------------------------------------------------
-- Conversations & messages (Realtime)
-- -----------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind conversation_kind not null,
  group_id uuid references public.course_groups(id) on delete cascade,
  member_a uuid references public.profiles(id) on delete cascade,
  member_b uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Contrainte structurelle :
  --   group   → group_id renseigné, members null
  --   private → members renseignés, group_id null, jamais deux membres
  constraint conversations_shape check (
    (kind = 'group' and group_id is not null and member_a is null and member_b is null)
    or
    (kind = 'private' and group_id is null and member_a is not null and member_b is not null and member_a <> member_b)
  )
);

-- Contrainte forte : conv privée member↔member interdite (brief §13)
-- Cette fonction est utilisée en policy INSERT.
create or replace function public.private_conversation_is_allowed(a uuid, b uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles pa
    join public.profiles pb on pb.id = b
    where pa.id = a
      and (
        (pa.role = 'member' and pb.role in ('teacher', 'admin'))
        or
        (pa.role in ('teacher', 'admin') and pb.role = 'member')
        or
        (pa.role in ('teacher', 'admin') and pb.role in ('teacher', 'admin'))
      )
  );
$$;

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index messages_conv_created_idx on public.messages(conversation_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Memberships (Mon adhésion — Phase 1 sans paiement)
-- -----------------------------------------------------------------------------
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  pack membership_pack not null,
  city_id uuid references public.cities(id) on delete set null,
  status membership_status not null default 'pending',
  starts_on date,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index memberships_profile_idx on public.memberships(profile_id);
create index memberships_status_idx on public.memberships(status);

-- -----------------------------------------------------------------------------
-- Payments (structure préparatoire seulement — Phase 2)
-- -----------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  amount_cents integer,
  currency text default 'eur',
  status text not null default 'pending',
  stripe_reference text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- News (actualités)
-- -----------------------------------------------------------------------------
create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  image_key text,
  author_id uuid references public.profiles(id) on delete set null,
  status news_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_status_published_idx on public.news(status, published_at desc);
create index news_slug_idx on public.news(slug);

-- -----------------------------------------------------------------------------
-- Gallery
-- -----------------------------------------------------------------------------
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  media_key text not null,
  order_index integer not null default 0,
  taken_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gallery_active_order_idx on public.gallery(is_active, order_index);

-- -----------------------------------------------------------------------------
-- FAQ
-- -----------------------------------------------------------------------------
create table public.faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Trigger : updated_at auto
-- -----------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'cities','profiles','teachers','courses','course_groups',
    'memberships','news','gallery','faq'
  ]) loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at();', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Trigger : empêcher la promotion de rôle par l'utilisateur lui-même
-- -----------------------------------------------------------------------------
create or replace function public.tg_guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller_role user_role;
begin
  if new.role is distinct from old.role then
    select role into caller_role from public.profiles where id = auth.uid();
    if caller_role is null or caller_role <> 'admin' then
      raise exception 'Role change requires admin privileges'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_role_change
  before update on public.profiles
  for each row execute function public.tg_guard_role_change();

-- -----------------------------------------------------------------------------
-- Trigger : à la création d'un auth.users, créer un profile "member" par défaut
-- -----------------------------------------------------------------------------
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, role, pack, city_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    'member',
    nullif(new.raw_user_meta_data->>'pack', '')::membership_pack,
    (nullif(new.raw_user_meta_data->>'city_id', ''))::uuid
  );

  -- Adhésion initiale "pending", sans prix (Phase 1)
  if new.raw_user_meta_data ? 'pack' then
    insert into public.memberships (profile_id, pack, city_id, status)
    values (
      new.id,
      (new.raw_user_meta_data->>'pack')::membership_pack,
      (nullif(new.raw_user_meta_data->>'city_id', ''))::uuid,
      'pending'
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();
