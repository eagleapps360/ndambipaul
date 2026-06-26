create extension if not exists pgcrypto;

alter table public.tributes
  add column if not exists normalized_email text,
  add column if not exists profile_image_bucket text,
  add column if not exists profile_image_path text,
  add column if not exists profile_image_position text not null default '50% 50%',
  add column if not exists edit_version integer not null default 1;

update public.tributes
set
  normalized_email = lower(trim(coalesce(private_email, private_contact->>'email', ''))),
  profile_image_position = coalesce(nullif(profile_image_position, ''), '50% 50%')
where true;

create index if not exists tributes_normalized_email_idx on public.tributes(normalized_email);

create table if not exists public.tribute_media (
  id uuid primary key default gen_random_uuid(),
  tribute_id uuid not null references public.tributes(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  media_type text not null default 'image' check (media_type in ('image')),
  alt_text text,
  caption text,
  object_position text not null default '50% 50%',
  sort_order integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  is_profile boolean not null default false,
  approved_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tribute_media_tribute_sort_idx on public.tribute_media(tribute_id, sort_order);
create index if not exists tribute_media_status_idx on public.tribute_media(status);

create table if not exists public.tribute_edit_tokens (
  id uuid primary key default gen_random_uuid(),
  tribute_id uuid not null references public.tributes(id) on delete cascade,
  email_hash text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tribute_edit_tokens_expires_idx on public.tribute_edit_tokens(expires_at);

create table if not exists public.tribute_revisions (
  id uuid primary key default gen_random_uuid(),
  tribute_id uuid not null references public.tributes(id) on delete cascade,
  submitted_by_type text not null default 'contributor' check (submitted_by_type in ('contributor', 'admin')),
  proposed_name text,
  proposed_relationship text,
  proposed_location text,
  proposed_message text,
  proposed_profile_image_bucket text,
  proposed_profile_image_path text,
  proposed_profile_image_position text not null default '50% 50%',
  version_number integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tribute_revisions_tribute_status_idx on public.tribute_revisions(tribute_id, status);

create table if not exists public.tribute_revision_media (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.tribute_revisions(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  media_type text not null default 'image' check (media_type in ('image')),
  alt_text text,
  caption text,
  object_position text not null default '50% 50%',
  sort_order integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tribute_revision_media_revision_idx on public.tribute_revision_media(revision_id, sort_order);

alter table public.tribute_media enable row level security;
alter table public.tribute_edit_tokens enable row level security;
alter table public.tribute_revisions enable row level security;
alter table public.tribute_revision_media enable row level security;

drop policy if exists "public can read approved tribute media" on public.tribute_media;
create policy "public can read approved tribute media" on public.tribute_media
  for select using (status = 'approved' and archived_at is null);

drop policy if exists "admins manage tribute media" on public.tribute_media;
create policy "admins manage tribute media" on public.tribute_media
  for all using (public.has_admin_role(array['owner', 'administrator', 'moderator']))
  with check (public.has_admin_role(array['owner', 'administrator', 'moderator']));

drop policy if exists "admins manage tribute revisions" on public.tribute_revisions;
create policy "admins manage tribute revisions" on public.tribute_revisions
  for all using (public.has_admin_role(array['owner', 'administrator', 'moderator']))
  with check (public.has_admin_role(array['owner', 'administrator', 'moderator']));

drop policy if exists "admins manage tribute revision media" on public.tribute_revision_media;
create policy "admins manage tribute revision media" on public.tribute_revision_media
  for all using (public.has_admin_role(array['owner', 'administrator', 'moderator']))
  with check (public.has_admin_role(array['owner', 'administrator', 'moderator']));

drop policy if exists "admins manage tribute edit tokens" on public.tribute_edit_tokens;
create policy "admins manage tribute edit tokens" on public.tribute_edit_tokens
  for all using (public.has_admin_role(array['owner', 'administrator', 'moderator']))
  with check (public.has_admin_role(array['owner', 'administrator', 'moderator']));

create or replace view public.public_tributes
as
select
  id,
  slug,
  contributor_name,
  relationship,
  relationship_category,
  location,
  tribute_message,
  featured,
  published_at,
  created_at,
  profile_media_id,
  case
    when profile_image_bucket is not null and profile_image_path is not null then 'private:' || profile_image_bucket || ':' || profile_image_path
    else null
  end as profile_media_url,
  profile_image_position,
  edit_version
from public.tributes
where moderation_status = 'approved'
  and archived_at is null
  and published_at is not null;
