create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null unique,
  display_name text,
  role text not null default 'administrator' check (role in ('owner', 'admin', 'administrator', 'moderator', 'finance', 'media', 'coordinator', 'content_editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

insert into storage.buckets (id, name, public)
values
  ('memorial-private-submissions', 'memorial-private-submissions', false),
  ('memorial-public-media', 'memorial-public-media', false),
  ('memorial-documents', 'memorial-documents', false)
on conflict (id) do nothing;

insert into public.admin_users (auth_user_id, email, display_name, role, is_active, created_at, updated_at)
select
  ap.user_id,
  lower(coalesce(au.email, 'admin-' || ap.user_id::text || '@example.invalid')),
  ap.display_name,
  ap.role,
  ap.is_active,
  ap.created_at,
  ap.updated_at
from public.admin_profiles ap
left join auth.users au on au.id = ap.user_id
on conflict (email) do update
set
  auth_user_id = excluded.auth_user_id,
  display_name = excluded.display_name,
  role = excluded.role,
  is_active = excluded.is_active,
  updated_at = excluded.updated_at;

create or replace function public.sync_admin_users_from_profiles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_email text;
begin
  if tg_op = 'DELETE' then
    delete from public.admin_users where auth_user_id = old.user_id;
    return old;
  end if;

  select lower(email) into resolved_email
  from auth.users
  where id = new.user_id;

  insert into public.admin_users (auth_user_id, email, display_name, role, is_active, created_at, updated_at)
  values (
    new.user_id,
    coalesce(resolved_email, 'admin-' || new.user_id::text || '@example.invalid'),
    new.display_name,
    new.role,
    new.is_active,
    new.created_at,
    new.updated_at
  )
  on conflict (email) do update
  set
    auth_user_id = excluded.auth_user_id,
    display_name = excluded.display_name,
    role = excluded.role,
    is_active = excluded.is_active,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

drop trigger if exists sync_admin_users_from_profiles on public.admin_profiles;
create trigger sync_admin_users_from_profiles
after insert or update or delete on public.admin_profiles
for each row execute function public.sync_admin_users_from_profiles();

create policy "admin users self read" on public.admin_users
  for select using (auth.uid() = auth_user_id and is_active = true);

create policy "owners and admins manage admin users" on public.admin_users
  for all using (public.has_admin_role(array['owner', 'administrator']))
  with check (public.has_admin_role(array['owner', 'administrator']));

grant select on public.admin_users to authenticated;

create trigger set_updated_at_admin_users
before update on public.admin_users
for each row execute function public.set_updated_at();
