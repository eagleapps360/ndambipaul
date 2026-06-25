alter table public.site_settings
  add column if not exists homepage_biography_excerpt text,
  add column if not exists public_website_url text,
  add column if not exists default_timezone text not null default 'Africa/Douala',
  add column if not exists donation_instructions text,
  add column if not exists footer_message text,
  add column if not exists family_whatsapp_contact text;

alter table public.biography_sections
  add column if not exists summary text,
  add column if not exists body_format text not null default 'markdown' check (body_format in ('markdown', 'plaintext')),
  add column if not exists linked_media_id uuid references public.media_items(id) on delete set null;

alter table public.tributes
  add column if not exists consent_confirmed boolean not null default false,
  add column if not exists public_preview_override text;

alter table public.media_items
  add column if not exists title text,
  add column if not exists file_name text,
  add column if not exists upload_context text,
  add column if not exists thumbnail_pending boolean not null default false;

alter table public.gallery_albums
  add column if not exists cover_media_id uuid references public.media_items(id) on delete set null,
  add column if not exists is_published boolean not null default false;

alter table public.programme_events
  add column if not exists livestream_id uuid references public.livestreams(id) on delete set null;

alter table public.programme_items
  add column if not exists time_label text,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists participant_name text;

alter table public.livestreams
  add column if not exists backup_url text,
  add column if not exists manual_status_override text check (manual_status_override in ('scheduled', 'live', 'ended', 'cancelled'));

alter table public.coordinators
  add column if not exists department_id uuid,
  add column if not exists department_active boolean not null default true;

alter table public.team_definitions
  add column if not exists public_signup_available boolean not null default true;

alter table public.team_registrations
  add column if not exists status_note text;

alter table public.donations
  add column if not exists in_kind_delivery_state text check (in_kind_delivery_state in ('offered', 'scheduled', 'received', 'declined')),
  add column if not exists manual_override_reason text,
  add column if not exists acknowledgement_sent_at timestamptz;

alter table public.admin_profiles
  add column if not exists invited_at timestamptz,
  add column if not exists last_sign_in_at timestamptz;

insert into public.team_definitions (name, slug, description, is_active, public_signup_available, display_order)
values
  ('Ushering', 'ushering', 'Ushering support team.', true, true, 1),
  ('Protocol', 'protocol', 'Protocol support team.', true, true, 2),
  ('Security', 'security', 'Security support team.', true, true, 3),
  ('Hospitality', 'hospitality', 'Hospitality support team.', true, true, 4),
  ('Transport and Logistics', 'transport-and-logistics', 'Transport and logistics support team.', true, true, 5),
  ('Media and Livestream', 'media-and-livestream', 'Media and livestream support team.', true, true, 6),
  ('Photography and Video', 'photography-and-video', 'Photography and video support team.', true, true, 7),
  ('Medical and First Aid', 'medical-and-first-aid', 'Medical and first aid support team.', true, true, 8),
  ('Choir and Worship', 'choir-and-worship', 'Choir and worship support team.', true, true, 9),
  ('Venue Setup and Cleaning', 'venue-setup-and-cleaning', 'Venue setup and cleaning support team.', true, true, 10),
  ('Traditional and Family Protocol', 'traditional-and-family-protocol', 'Traditional and family protocol support team.', true, true, 11),
  ('Donations and Finance', 'donations-and-finance', 'Donations and finance support team.', true, true, 12),
  ('Other', 'other', 'Other support team.', true, true, 13)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  public_signup_available = excluded.public_signup_available;
