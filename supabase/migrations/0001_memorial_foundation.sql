create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  memorial_name text not null,
  subtitle text not null,
  hero_heading text not null,
  hero_copy text not null,
  memorial_dates jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  venue_details jsonb not null default '{}'::jsonb,
  donation_details jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  family_contacts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biography_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  year_label text not null,
  title text not null,
  detail text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tributes (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  category text not null,
  relationship text not null,
  name text not null,
  location text,
  message text not null,
  private_contact jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tributes_status_idx on public.tributes(status);

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  album_slug text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  media_kind text not null check (media_kind in ('image', 'video')),
  storage_path text not null,
  poster_path text,
  caption text,
  contributor text,
  taken_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_items_status_idx on public.media_items(status);

create table if not exists public.programme_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text not null,
  description text not null,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programme_items (
  id uuid primary key default gen_random_uuid(),
  programme_event_id uuid not null references public.programme_events(id) on delete cascade,
  sort_order int not null default 0,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.livestreams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended')),
  platform text not null,
  embed_url text,
  backup_url text,
  recording_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coordinator_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coordinator_contacts (
  id uuid primary key default gen_random_uuid(),
  coordinator_group_id uuid not null references public.coordinator_groups(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_registrations (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'contacted', 'declined', 'completed')),
  full_name text not null,
  phone text not null,
  email text,
  preferred_team text not null,
  secondary_team text,
  availability text,
  location text,
  experience text,
  notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  method text not null check (method in ('cash', 'kind', 'mobile-money', 'card')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'received', 'archived')),
  donor_name text not null,
  acknowledgement_preference text not null default 'public',
  is_anonymous boolean not null default false,
  amount numeric(12,2),
  currency text,
  item_name text,
  quantity text,
  estimated_value numeric(12,2),
  donor_contact jsonb not null default '{}'::jsonb,
  finance_notes text,
  collector text,
  received_at timestamptz,
  receipt_reference text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists donations_status_idx on public.donations(status);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text not null,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.biography_sections enable row level security;
alter table public.timeline_entries enable row level security;
alter table public.tributes enable row level security;
alter table public.media_items enable row level security;
alter table public.programme_events enable row level security;
alter table public.programme_items enable row level security;
alter table public.livestreams enable row level security;
alter table public.coordinator_groups enable row level security;
alter table public.coordinator_contacts enable row level security;
alter table public.team_registrations enable row level security;
alter table public.donations enable row level security;
alter table public.audit_log enable row level security;

create policy "public can read approved tributes" on public.tributes
  for select using (status = 'approved');

create policy "public can read approved media" on public.media_items
  for select using (status = 'approved');

create policy "public can read programme" on public.programme_events
  for select using (true);

create policy "public can read programme items" on public.programme_items
  for select using (true);

create policy "public can read livestreams" on public.livestreams
  for select using (true);

create policy "public can read coordinator groups" on public.coordinator_groups
  for select using (true);

create policy "public can read public coordinator contacts" on public.coordinator_contacts
  for select using (is_public = true);

create policy "public can insert tribute submissions" on public.tributes
  for insert with check (status = 'pending');

create policy "public can insert team registrations" on public.team_registrations
  for insert with check (status = 'pending');

create policy "public can insert pending donations" on public.donations
  for insert with check (status = 'pending');
