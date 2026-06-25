create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text not null,
  role text not null check (role in ('owner', 'administrator', 'moderator', 'finance', 'content_editor')),
  invitation_state text not null default 'pending' check (invitation_state in ('pending', 'sent', 'accepted', 'revoked', 'failed', 'expired')),
  invited_by_user_id uuid references public.admin_profiles(user_id) on delete set null,
  invited_user_id uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default now(),
  expires_at timestamptz,
  sent_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_invitations enable row level security;

create policy "owners and admins manage invitations" on public.admin_invitations
  using (public.has_admin_role(array['owner', 'administrator']))
  with check (public.has_admin_role(array['owner', 'administrator']));

create unique index if not exists admin_invitations_active_email_idx
  on public.admin_invitations(lower(email))
  where invitation_state in ('pending', 'sent');

create trigger set_updated_at_admin_invitations
before update on public.admin_invitations
for each row execute function public.set_updated_at();

alter table public.gallery_albums
  add column if not exists archived_at timestamptz;

alter table public.programme_items
  add column if not exists archived_at timestamptz;

alter table public.coordinators
  add column if not exists archived_at timestamptz;

alter table public.team_definitions
  add column if not exists archived_at timestamptz;

create index if not exists tributes_created_at_idx
  on public.tributes(created_at desc);

create index if not exists tributes_status_created_at_idx
  on public.tributes(moderation_status, created_at desc);

create index if not exists media_items_status_created_at_idx
  on public.media_items(moderation_status, created_at desc);

create index if not exists team_registrations_status_team_created_at_idx
  on public.team_registrations(status, primary_team_slug, created_at desc);

create index if not exists donations_verification_method_created_at_idx
  on public.donations(verification_state, donation_method, created_at desc);

create index if not exists audit_log_created_at_idx
  on public.audit_log(created_at desc);
