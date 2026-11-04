-- Run this once: Supabase dashboard > SQL Editor > New query > paste > Run

create table public.contacts (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) <= 150 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message    text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Security: visitors may only INSERT. Nobody can read, edit or delete through the website.
alter table public.contacts enable row level security;
create policy "visitors can send a message" on public.contacts
  for insert to anon with check (true);
grant insert on public.contacts to anon;

-- Tiny function used by the keep-alive job so the free project does not pause
create or replace function public.ping() returns text language sql as $$ select 'ok' $$;
grant execute on function public.ping() to anon;

-- View your messages any time (Table Editor, or run this):
-- select * from public.contacts order by created_at desc;
