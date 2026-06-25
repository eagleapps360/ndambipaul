create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('owner', 'administrator', 'moderator', 'finance', 'content_editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.admin_profiles
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.has_admin_role(roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() = any(roles), false);
$$;

alter table public.site_settings
  add column if not exists birth_date text,
  add column if not exists passing_date text,
  add column if not exists memorial_weekend text,
  add column if not exists hero_message text,
  add column if not exists biography_introduction text,
  add column if not exists venue_information jsonb not null default '{}'::jsonb,
  add column if not exists public_family_contacts jsonb not null default '{}'::jsonb,
  add column if not exists whatsapp_share_text text,
  add column if not exists mobile_money_settings jsonb not null default '{}'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists open_graph_image text,
  add column if not exists livestream_fallback_message text;

update public.site_settings
set
  hero_message = coalesce(hero_message, hero_copy),
  venue_information = case when venue_information = '{}'::jsonb then venue_details else venue_information end,
  seo_title = coalesce(seo_title, memorial_name),
  seo_description = coalesce(seo_description, subtitle),
  public_family_contacts = case when public_family_contacts = '{}'::jsonb then family_contacts else public_family_contacts end
where true;

alter table public.biography_sections
  add column if not exists display_order int not null default 0,
  add column if not exists publication_state text not null default 'published' check (publication_state in ('draft', 'published', 'archived'));

update public.biography_sections
set display_order = sort_order
where display_order = 0 and sort_order is not null;

alter table public.timeline_entries
  add column if not exists date_label text,
  add column if not exists year int,
  add column if not exists description text,
  add column if not exists image_reference text,
  add column if not exists display_order int not null default 0,
  add column if not exists publication_state text not null default 'published' check (publication_state in ('draft', 'published', 'archived'));

update public.timeline_entries
set
  date_label = coalesce(date_label, year_label),
  description = coalesce(description, detail),
  display_order = sort_order
where true;

alter table public.tributes
  add column if not exists contributor_name text,
  add column if not exists relationship_category text,
  add column if not exists tribute_message text,
  add column if not exists private_email text,
  add column if not exists private_phone text,
  add column if not exists profile_media_id uuid,
  add column if not exists moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected', 'archived')),
  add column if not exists featured boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists rejection_reason text,
  add column if not exists archived_at timestamptz,
  add column if not exists submission_reference text unique;

update public.tributes
set
  contributor_name = coalesce(contributor_name, name),
  relationship_category = coalesce(relationship_category, category),
  tribute_message = coalesce(tribute_message, message),
  moderation_status = case
    when moderation_status is null and status in ('pending', 'approved', 'rejected', 'archived') then status
    else coalesce(moderation_status, 'pending')
  end,
  published_at = coalesce(published_at, approved_at),
  private_email = coalesce(private_email, private_contact->>'email'),
  private_phone = coalesce(private_phone, private_contact->>'phone')
where true;

create index if not exists tributes_moderation_status_idx on public.tributes(moderation_status);
create unique index if not exists tributes_submission_reference_idx on public.tributes(submission_reference) where submission_reference is not null;

alter table public.media_items
  add column if not exists tribute_id uuid references public.tributes(id) on delete set null,
  add column if not exists gallery_album_slug text,
  add column if not exists gallery_album_title text,
  add column if not exists media_category text,
  add column if not exists storage_bucket text,
  add column if not exists original_storage_path text,
  add column if not exists thumbnail_storage_path text,
  add column if not exists poster_storage_path text,
  add column if not exists media_type text check (media_type in ('image', 'video', 'document')),
  add column if not exists mime_type text,
  add column if not exists extension text,
  add column if not exists file_size bigint,
  add column if not exists width int,
  add column if not exists height int,
  add column if not exists duration_seconds numeric(10,2),
  add column if not exists alt_text text,
  add column if not exists contributor_name text,
  add column if not exists moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected', 'archived')),
  add column if not exists featured boolean not null default false,
  add column if not exists display_order int not null default 0,
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

update public.media_items
set
  gallery_album_slug = coalesce(gallery_album_slug, album_slug),
  original_storage_path = coalesce(original_storage_path, storage_path),
  poster_storage_path = coalesce(poster_storage_path, poster_path),
  media_type = coalesce(media_type, media_kind),
  contributor_name = coalesce(contributor_name, contributor),
  moderation_status = case
    when moderation_status is null and status in ('pending', 'approved', 'rejected', 'archived') then status
    else coalesce(moderation_status, 'pending')
  end
where true;

create index if not exists media_items_moderation_status_idx on public.media_items(moderation_status);
create index if not exists media_items_tribute_idx on public.media_items(tribute_id);

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery_albums enable row level security;

alter table public.programme_events
  add column if not exists event_type text not null default 'Other',
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists timezone text not null default 'Africa/Douala',
  add column if not exists address text,
  add column if not exists map_url text,
  add column if not exists pdf_storage_bucket text,
  add column if not exists pdf_storage_path text,
  add column if not exists publication_state text not null default 'published' check (publication_state in ('draft', 'published', 'archived'));

update public.programme_events
set
  start_time = coalesce(start_time, starts_at),
  end_time = coalesce(end_time, ends_at)
where true;

alter table public.programme_items
  add column if not exists display_order int not null default 0,
  add column if not exists notes text;

update public.programme_items
set display_order = sort_order
where display_order = 0 and sort_order is not null;

alter table public.livestreams
  add column if not exists event_id uuid references public.programme_events(id) on delete set null,
  add column if not exists event_slug text,
  add column if not exists scheduled_start timestamptz,
  add column if not exists actual_start timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists external_url text,
  add column if not exists backup_message text,
  add column if not exists poster_url text,
  add column if not exists publication_state text not null default 'published' check (publication_state in ('draft', 'published', 'archived'));

alter table public.livestreams
  drop constraint if exists livestreams_status_check;

alter table public.livestreams
  add constraint livestreams_status_check
  check (status in ('scheduled', 'live', 'ended', 'cancelled'));

update public.livestreams
set
  scheduled_start = coalesce(scheduled_start, starts_at),
  end_time = coalesce(end_time, ends_at),
  external_url = coalesce(external_url, backup_url)
where true;

create table if not exists public.coordinators (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  department_slug text not null,
  department_description text,
  department_order int not null default 0,
  name text not null,
  role_title text,
  photo_url text,
  private_phone text,
  private_email text,
  public_phone text,
  public_email text,
  public_phone_flag boolean not null default false,
  public_email_flag boolean not null default false,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coordinators enable row level security;

create table if not exists public.team_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  coordinator_name text,
  capacity int,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_definitions enable row level security;

alter table public.team_registrations
  add column if not exists applicant_name text,
  add column if not exists primary_team_slug text,
  add column if not exists secondary_team_slug text,
  add column if not exists private_admin_notes text,
  add column if not exists contacted_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists submission_reference text unique;

update public.team_registrations
set
  applicant_name = coalesce(applicant_name, full_name),
  primary_team_slug = coalesce(primary_team_slug, preferred_team),
  secondary_team_slug = coalesce(secondary_team_slug, secondary_team),
  private_admin_notes = coalesce(private_admin_notes, admin_notes)
where true;

alter table public.team_registrations
  add constraint team_registrations_primary_team_fk
  foreign key (primary_team_slug) references public.team_definitions(slug) on delete set null;

alter table public.team_registrations
  add constraint team_registrations_secondary_team_fk
  foreign key (secondary_team_slug) references public.team_definitions(slug) on delete set null;

alter table public.donations
  add column if not exists donor_phone text,
  add column if not exists donor_email text,
  add column if not exists anonymous_public_display boolean not null default false,
  add column if not exists donation_method text,
  add column if not exists item_description text,
  add column if not exists transaction_reference text,
  add column if not exists donor_submission_status text not null default 'submitted' check (donor_submission_status in ('submitted', 'withdrawn', 'cancelled')),
  add column if not exists provider_payment_status text not null default 'pending' check (provider_payment_status in ('pending', 'paid', 'failed', 'expired', 'not_applicable')),
  add column if not exists verification_state text not null default 'unverified' check (verification_state in ('unverified', 'verified', 'rejected')),
  add column if not exists internal_status text not null default 'pending' check (internal_status in ('pending', 'completed', 'declined', 'archived')),
  add column if not exists provider_name text,
  add column if not exists sent_at timestamptz,
  add column if not exists private_notes text;

update public.donations
set
  donation_method = coalesce(donation_method, method),
  anonymous_public_display = coalesce(anonymous_public_display, is_anonymous),
  item_description = coalesce(item_description, item_name),
  transaction_reference = coalesce(transaction_reference, receipt_reference),
  donor_phone = coalesce(donor_phone, donor_contact->>'phone'),
  donor_email = coalesce(donor_email, donor_contact->>'email'),
  internal_status = case
    when status = 'completed' then 'completed'
    when status = 'archived' then 'archived'
    else coalesce(internal_status, 'pending')
  end
where true;

create table if not exists public.donation_payment_events (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid references public.donations(id) on delete set null,
  stripe_event_id text not null unique,
  stripe_event_type text not null,
  payload_json jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.donation_payment_events enable row level security;

alter table public.audit_log
  add column if not exists previous_value jsonb,
  add column if not exists new_value jsonb,
  add column if not exists ip_address text,
  add column if not exists user_agent text;

create index if not exists audit_log_entity_idx on public.audit_log(entity_type, entity_id);

create or replace view public.public_site_settings
as
select
  id,
  memorial_name,
  subtitle,
  birth_date,
  passing_date,
  memorial_weekend,
  hero_heading,
  hero_message,
  biography_introduction,
  venue_information,
  public_family_contacts,
  whatsapp_share_text,
  social_links,
  mobile_money_settings,
  seo_title,
  seo_description,
  open_graph_image,
  livestream_fallback_message,
  created_at,
  updated_at
from public.site_settings
limit 1;

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
  profile_media_id
from public.tributes
where moderation_status = 'approved'
  and archived_at is null
  and published_at is not null;

create or replace view public.public_media_gallery
as
select
  m.id,
  m.tribute_id,
  m.gallery_album_slug,
  coalesce(a.title, m.gallery_album_title, m.gallery_album_slug) as gallery_album_title,
  m.media_category,
  m.media_type,
  m.mime_type,
  m.file_size,
  m.caption,
  m.alt_text,
  m.contributor_name,
  m.featured,
  m.display_order,
  m.published_at,
  m.created_at,
  m.storage_bucket,
  case when m.storage_bucket is not null and m.original_storage_path is not null then 'private:' || m.storage_bucket || ':' || m.original_storage_path else null end as original_url,
  case when m.storage_bucket is not null and m.thumbnail_storage_path is not null then 'private:' || m.storage_bucket || ':' || m.thumbnail_storage_path else null end as thumbnail_url,
  case when m.storage_bucket is not null and m.poster_storage_path is not null then 'private:' || m.storage_bucket || ':' || m.poster_storage_path else null end as poster_url
from public.media_items m
left join public.gallery_albums a on a.slug = m.gallery_album_slug
where m.moderation_status = 'approved'
  and m.archived_at is null
  and m.published_at is not null;

create or replace view public.public_programme_events
as
select
  id,
  slug,
  title,
  event_type,
  start_time,
  end_time,
  timezone,
  venue,
  address,
  description,
  map_url,
  pdf_url,
  case when pdf_storage_bucket is not null and pdf_storage_path is not null then 'private:' || pdf_storage_bucket || ':' || pdf_storage_path else pdf_url end as pdf_signed_url
from public.programme_events
where publication_state = 'published';

create or replace view public.public_programme_items
as
select
  id,
  programme_event_id,
  label,
  display_order
from public.programme_items;

create or replace view public.public_livestreams
as
select
  l.id,
  l.slug,
  l.title,
  l.event_slug,
  l.status,
  l.platform,
  l.embed_url,
  l.external_url,
  l.scheduled_start,
  l.actual_start,
  l.end_time,
  l.recording_url,
  l.backup_message,
  l.poster_url
from public.livestreams l
where l.publication_state = 'published';

create or replace view public.public_coordinators
as
select
  id as contact_id,
  department,
  department_slug,
  department_description,
  department_order,
  name,
  role_title,
  photo_url,
  case when public_phone_flag then public_phone else null end as public_phone,
  case when public_email_flag then public_email else null end as public_email,
  display_order
from public.coordinators
where is_active = true;

drop policy if exists "public can read approved tributes" on public.tributes;
drop policy if exists "public can read approved media" on public.media_items;
drop policy if exists "public can read programme" on public.programme_events;
drop policy if exists "public can read programme items" on public.programme_items;
drop policy if exists "public can read livestreams" on public.livestreams;
drop policy if exists "public can read coordinator groups" on public.coordinator_groups;
drop policy if exists "public can read public coordinator contacts" on public.coordinator_contacts;
drop policy if exists "public can insert tribute submissions" on public.tributes;
drop policy if exists "public can insert team registrations" on public.team_registrations;
drop policy if exists "public can insert pending donations" on public.donations;

create policy "admin profiles self read" on public.admin_profiles
  for select using (auth.uid() = user_id and is_active = true);

create policy "owners and admins manage admin profiles" on public.admin_profiles
  for all using (public.has_admin_role(array['owner', 'administrator']))
  with check (public.has_admin_role(array['owner', 'administrator']));

create policy "content editors read settings" on public.site_settings
  for select using (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "content editors update settings" on public.site_settings
  for update using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "content editors manage biography" on public.biography_sections
  for all using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "content editors manage timeline" on public.timeline_entries
  for all using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "moderators manage tributes" on public.tributes
  for all using (public.has_admin_role(array['owner', 'administrator', 'moderator']))
  with check (public.has_admin_role(array['owner', 'administrator', 'moderator']));

create policy "moderators manage media" on public.media_items
  for all using (public.has_admin_role(array['owner', 'administrator', 'moderator']))
  with check (public.has_admin_role(array['owner', 'administrator', 'moderator']));

create policy "content editors manage gallery albums" on public.gallery_albums
  for all using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "content editors manage programme" on public.programme_events
  for all using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "content editors manage programme items" on public.programme_items
  for all using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "content editors manage livestreams" on public.livestreams
  for all using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "content editors manage coordinators" on public.coordinators
  for all using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "content editors manage teams" on public.team_definitions
  for all using (public.has_admin_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor']));

create policy "team and moderation admins read registrations" on public.team_registrations
  for select using (public.has_admin_role(array['owner', 'administrator', 'content_editor', 'moderator']));

create policy "team and moderation admins manage registrations" on public.team_registrations
  for update using (public.has_admin_role(array['owner', 'administrator', 'content_editor', 'moderator']))
  with check (public.has_admin_role(array['owner', 'administrator', 'content_editor', 'moderator']));

create policy "finance admins manage donations" on public.donations
  for all using (public.has_admin_role(array['owner', 'administrator', 'finance']))
  with check (public.has_admin_role(array['owner', 'administrator', 'finance']));

create policy "finance admins read payment events" on public.donation_payment_events
  for select using (public.has_admin_role(array['owner', 'administrator', 'finance']));

create policy "admins read audit log" on public.audit_log
  for select using (public.is_active_admin());

create policy "admins insert audit log" on public.audit_log
  for insert with check (public.is_active_admin());

create policy "public read active teams" on public.team_definitions
  for select using (is_active = true);

grant select on public.public_site_settings to anon, authenticated;
grant select on public.public_tributes to anon, authenticated;
grant select on public.public_media_gallery to anon, authenticated;
grant select on public.public_programme_events to anon, authenticated;
grant select on public.public_programme_items to anon, authenticated;
grant select on public.public_livestreams to anon, authenticated;
grant select on public.public_coordinators to anon, authenticated;

create policy "admin storage read private submissions" on storage.objects
  for select using (
    bucket_id in ('memorial-private-submissions', 'memorial-documents')
    and public.is_active_admin()
  );

create policy "admin storage read public media" on storage.objects
  for select using (
    bucket_id = 'memorial-public-media'
    and public.is_active_admin()
  );

create trigger set_updated_at_admin_profiles
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_site_settings
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger set_updated_at_biography_sections
before update on public.biography_sections
for each row execute function public.set_updated_at();

create trigger set_updated_at_timeline_entries
before update on public.timeline_entries
for each row execute function public.set_updated_at();

create trigger set_updated_at_tributes
before update on public.tributes
for each row execute function public.set_updated_at();

create trigger set_updated_at_media_items
before update on public.media_items
for each row execute function public.set_updated_at();

create trigger set_updated_at_gallery_albums
before update on public.gallery_albums
for each row execute function public.set_updated_at();

create trigger set_updated_at_programme_events
before update on public.programme_events
for each row execute function public.set_updated_at();

create trigger set_updated_at_livestreams
before update on public.livestreams
for each row execute function public.set_updated_at();

create trigger set_updated_at_coordinators
before update on public.coordinators
for each row execute function public.set_updated_at();

create trigger set_updated_at_team_definitions
before update on public.team_definitions
for each row execute function public.set_updated_at();

create trigger set_updated_at_team_registrations
before update on public.team_registrations
for each row execute function public.set_updated_at();

create trigger set_updated_at_donations
before update on public.donations
for each row execute function public.set_updated_at();
