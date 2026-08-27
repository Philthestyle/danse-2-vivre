-- =============================================================================
-- Danse 2 Vivre — Row Level Security
-- Cf. brief §15. RLS activée sur toutes les tables privées ou modifiables.
-- Ne JAMAIS désactiver pour contourner un problème de dev.
-- =============================================================================

-- Helper : renvoie true si le user courant est admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper : renvoie true si le user courant est teacher ou admin
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  );
$$;

-- Helper : renvoie true si le user courant possède le teacher_id donné
create or replace function public.owns_teacher(t_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teachers
    where id = t_id and profile_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- Cities : lecture publique (actives), écriture admin
-- -----------------------------------------------------------------------------
alter table public.cities enable row level security;

create policy "cities_public_read"
  on public.cities for select
  using (is_active or public.is_admin());

create policy "cities_admin_write"
  on public.cities for all
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Profiles : chacun lit/modifie le sien ; admin voit tout
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_self_read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_self_update"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Insert géré par trigger tg_handle_new_user (security definer), pas de policy INSERT user.
create policy "profiles_admin_insert"
  on public.profiles for insert
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Teachers : lecture publique, écriture admin uniquement
-- -----------------------------------------------------------------------------
alter table public.teachers enable row level security;

create policy "teachers_public_read"
  on public.teachers for select using (true);

create policy "teachers_admin_write"
  on public.teachers for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.teacher_cities enable row level security;

create policy "teacher_cities_public_read"
  on public.teacher_cities for select using (true);

create policy "teacher_cities_admin_write"
  on public.teacher_cities for all
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Courses : lecture publique. Update/delete = teacher propriétaire OU admin.
-- -----------------------------------------------------------------------------
alter table public.courses enable row level security;

create policy "courses_public_read"
  on public.courses for select using (true);

create policy "courses_owner_or_admin_write"
  on public.courses for all
  using (public.owns_teacher(teacher_id) or public.is_admin())
  with check (public.owns_teacher(teacher_id) or public.is_admin());

-- -----------------------------------------------------------------------------
-- Course groups & membres
-- -----------------------------------------------------------------------------
alter table public.course_groups enable row level security;

create policy "course_groups_read_members_or_staff"
  on public.course_groups for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = course_groups.course_id
        and public.owns_teacher(c.teacher_id)
    )
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = course_groups.id
        and gm.profile_id = auth.uid()
    )
  );

create policy "course_groups_owner_or_admin_write"
  on public.course_groups for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = course_groups.course_id
        and public.owns_teacher(c.teacher_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = course_groups.course_id
        and public.owns_teacher(c.teacher_id)
    )
  );

alter table public.group_members enable row level security;

create policy "group_members_read_self_or_staff"
  on public.group_members for select
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.course_groups g
      join public.courses c on c.id = g.course_id
      where g.id = group_members.group_id
        and public.owns_teacher(c.teacher_id)
    )
  );

create policy "group_members_owner_or_admin_write"
  on public.group_members for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.course_groups g
      join public.courses c on c.id = g.course_id
      where g.id = group_members.group_id
        and public.owns_teacher(c.teacher_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.course_groups g
      join public.courses c on c.id = g.course_id
      where g.id = group_members.group_id
        and public.owns_teacher(c.teacher_id)
    )
  );

-- -----------------------------------------------------------------------------
-- Conversations : uniquement membres et staff
-- -----------------------------------------------------------------------------
alter table public.conversations enable row level security;

create policy "conversations_read_members"
  on public.conversations for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversations.id and cm.profile_id = auth.uid()
    )
    or (kind = 'private' and (member_a = auth.uid() or member_b = auth.uid()))
  );

-- Insert conv privée : membre ↔ prof/admin uniquement (brief §13)
create policy "conversations_private_insert_allowed"
  on public.conversations for insert
  with check (
    kind = 'group'
    or (
      kind = 'private'
      and (auth.uid() = member_a or auth.uid() = member_b)
      and public.private_conversation_is_allowed(member_a, member_b)
    )
  );

create policy "conversations_admin_delete"
  on public.conversations for delete using (public.is_admin());

-- -----------------------------------------------------------------------------
-- conversation_members
-- -----------------------------------------------------------------------------
alter table public.conversation_members enable row level security;

create policy "conversation_members_read_self_or_staff"
  on public.conversation_members for select
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id
        and cm.profile_id = auth.uid()
    )
  );

create policy "conversation_members_staff_write"
  on public.conversation_members for all
  using (public.is_staff() or public.is_admin())
  with check (public.is_staff() or public.is_admin());

-- -----------------------------------------------------------------------------
-- Messages : lecture par membres, écriture selon mode (announcement_only)
-- -----------------------------------------------------------------------------
alter table public.messages enable row level security;

create policy "messages_read_members"
  on public.messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.profile_id = auth.uid()
    )
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.kind = 'private'
        and (c.member_a = auth.uid() or c.member_b = auth.uid())
    )
  );

create policy "messages_insert_conditional"
  on public.messages for insert
  with check (
    author_id = auth.uid()
    and (
      -- Conversation privée : les deux parties peuvent écrire
      exists (
        select 1 from public.conversations c
        where c.id = messages.conversation_id
          and c.kind = 'private'
          and (c.member_a = auth.uid() or c.member_b = auth.uid())
      )
      -- Conversation de groupe : membre + (mode normal ou role staff)
      or exists (
        select 1
        from public.conversations c
        join public.course_groups g on g.id = c.group_id
        join public.conversation_members cm on cm.conversation_id = c.id
        where c.id = messages.conversation_id
          and c.kind = 'group'
          and cm.profile_id = auth.uid()
          and (g.mode = 'normal' or public.is_staff())
      )
    )
  );

-- -----------------------------------------------------------------------------
-- Memberships : le membre lit la sienne ; admin gère tout
-- -----------------------------------------------------------------------------
alter table public.memberships enable row level security;

create policy "memberships_self_read"
  on public.memberships for select
  using (profile_id = auth.uid() or public.is_admin());

create policy "memberships_admin_write"
  on public.memberships for all
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Payments (structure préparatoire, aucune insertion Phase 1)
-- -----------------------------------------------------------------------------
alter table public.payments enable row level security;

create policy "payments_self_read"
  on public.payments for select
  using (
    exists (
      select 1 from public.memberships m
      where m.id = payments.membership_id and m.profile_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "payments_admin_write"
  on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- News : lecture publique = published ; drafts = admin
-- -----------------------------------------------------------------------------
alter table public.news enable row level security;

create policy "news_public_published"
  on public.news for select
  using (status = 'published' or public.is_admin());

create policy "news_admin_write"
  on public.news for all
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Gallery
-- -----------------------------------------------------------------------------
alter table public.gallery enable row level security;

create policy "gallery_public_active"
  on public.gallery for select
  using (is_active or public.is_admin());

create policy "gallery_admin_write"
  on public.gallery for all
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- FAQ
-- -----------------------------------------------------------------------------
alter table public.faq enable row level security;

create policy "faq_public_active"
  on public.faq for select
  using (is_active or public.is_admin());

create policy "faq_admin_write"
  on public.faq for all
  using (public.is_admin()) with check (public.is_admin());
