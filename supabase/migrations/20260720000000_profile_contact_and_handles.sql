-- Adds: brand logo, contact info for messaging-bot linking (phone/Telegram),
-- and real per-platform handle/profile URL fields on connections.
-- Run once in the Supabase SQL Editor.

alter table public.profiles add column if not exists logo_url text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists telegram_username text;

alter table public.platform_connections add column if not exists handle text;
alter table public.platform_connections add column if not exists profile_url text;
