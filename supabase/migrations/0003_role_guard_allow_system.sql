-- =============================================================================
-- Patch : tg_guard_role_change autorise le contexte système (service_role)
--
-- Le trigger initial refusait toute modification de `role` sauf si l'appelant
-- est admin. Mais quand le service_role côté serveur (bootstrap, migrations,
-- webhooks) modifie un profil, `auth.uid()` est NULL — le trigger refusait
-- alors la modification. On accepte désormais le contexte système comme
-- source légitime (le service_role bypass déjà RLS de toute façon).
-- =============================================================================

create or replace function public.tg_guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  caller_role user_role;
begin
  if new.role is distinct from old.role then
    -- Contexte système (service_role sans auth.uid) : autorisé.
    if caller is null then
      return new;
    end if;
    select role into caller_role from public.profiles where id = caller;
    if caller_role is null or caller_role <> 'admin' then
      raise exception 'Role change requires admin privileges'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
