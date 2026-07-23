-- Adds real, per-user scheduling preferences to replace the static
-- Schedule page. Run once in the Supabase SQL Editor.

alter table public.profiles add column if not exists auto_post_default boolean not null default false;
alter table public.profiles add column if not exists default_post_time text;
alter table public.profiles add column if not exists recurring_slots jsonb not null default '[]'::jsonb;
