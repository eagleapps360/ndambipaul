alter table public.tributes
  alter column category set default 'general';

update public.tributes
set category = 'general'
where category is null;

alter table public.tributes
  alter column category set not null;
