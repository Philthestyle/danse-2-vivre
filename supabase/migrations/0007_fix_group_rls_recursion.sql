-- =============================================================================
-- Fix retour Allan #2 : "création groupe" échoue avec React #441.
-- Root cause : PostgreSQL 42P17 "infinite recursion detected in policy for
-- relation course_groups". Les policies SELECT de course_groups et
-- group_members se référencent mutuellement, l'évaluation planner boucle.
--
-- Fix : encapsuler les sous-requêtes cross-table dans des fonctions
-- SECURITY DEFINER, qui bypass RLS et cassent la récursion.
-- =============================================================================

create or replace function public.is_member_of_group(g_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = g_id and gm.profile_id = auth.uid()
  );
$$;

create or replace function public.owns_group(g_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_groups g
    join public.courses c on c.id = g.course_id
    where g.id = g_id and public.owns_teacher(c.teacher_id)
  );
$$;

drop policy if exists "course_groups_read_members_or_staff" on public.course_groups;
create policy "course_groups_read_members_or_staff"
  on public.course_groups for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = course_groups.course_id
        and public.owns_teacher(c.teacher_id)
    )
    or public.is_member_of_group(course_groups.id)
  );

drop policy if exists "group_members_read_self_or_staff" on public.group_members;
create policy "group_members_read_self_or_staff"
  on public.group_members for select
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or public.owns_group(group_members.group_id)
  );

drop policy if exists "group_members_owner_or_admin_write" on public.group_members;
create policy "group_members_owner_or_admin_write"
  on public.group_members for all
  using (
    public.is_admin()
    or public.owns_group(group_members.group_id)
  )
  with check (
    public.is_admin()
    or public.owns_group(group_members.group_id)
  );
