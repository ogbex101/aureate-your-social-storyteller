-- Aureate Phase 2 schema: profiles, platform connections, assets, posts,
-- team membership, and approval requests. Run once in the Supabase SQL
-- Editor (or via `supabase db push`) against a fresh project.

create extension if not exists pgcrypto;

-- 1. profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null default 'individual' check (account_type in ('individual', 'organization')),
  brand_name text not null default '',
  tone_words text[] not null default '{}',
  writing_sample text not null default '',
  content_pillars jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: owner select" on public.profiles;
create policy "profiles: owner select" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles: owner insert" on public.profiles;
create policy "profiles: owner insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles: owner update" on public.profiles;
create policy "profiles: owner update" on public.profiles for update using (auth.uid() = id);

-- 2. platform_connections ----------------------------------------------------
create table if not exists public.platform_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook', 'linkedin', 'tiktok', 'x', 'pinterest', 'youtube', 'threads')),
  status text not null default 'disconnected' check (status in ('connected', 'disconnected')),
  access_token text,
  refresh_token text,
  connected_at timestamptz,
  unique (user_id, platform)
);

alter table public.platform_connections enable row level security;

drop policy if exists "platform_connections: owner all" on public.platform_connections;
create policy "platform_connections: owner all" on public.platform_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. assets -------------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_type text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.assets enable row level security;

drop policy if exists "assets: owner all" on public.assets;
create policy "assets: owner all" on public.assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. posts ----------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  platform text not null check (platform in ('instagram', 'facebook', 'linkedin', 'tiktok', 'x', 'pinterest', 'youtube', 'threads')),
  caption text not null default '',
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'scheduled', 'posted', 'failed')),
  auto_post boolean not null default true,
  scheduled_time timestamptz,
  engagement jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "posts: owner all" on public.posts;
create policy "posts: owner all" on public.posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists posts_user_scheduled_idx on public.posts (user_id, scheduled_time);

-- 5. team_members ------------------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  name text,
  role text not null check (role in ('drafter', 'approver')),
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

drop policy if exists "team_members: owner or member select" on public.team_members;
create policy "team_members: owner or member select" on public.team_members
  for select using (auth.uid() = owner_id or auth.uid() = user_id);
drop policy if exists "team_members: owner insert" on public.team_members;
create policy "team_members: owner insert" on public.team_members
  for insert with check (auth.uid() = owner_id);
drop policy if exists "team_members: owner update" on public.team_members;
create policy "team_members: owner update" on public.team_members
  for update using (auth.uid() = owner_id);
drop policy if exists "team_members: owner delete" on public.team_members;
create policy "team_members: owner delete" on public.team_members
  for delete using (auth.uid() = owner_id);

-- 6. approval_requests ---------------------------------------------------
create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  approver_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.approval_requests enable row level security;

drop policy if exists "approval_requests: participants select" on public.approval_requests;
create policy "approval_requests: participants select" on public.approval_requests
  for select using (auth.uid() = requested_by or auth.uid() = approver_id);
drop policy if exists "approval_requests: requester insert" on public.approval_requests;
create policy "approval_requests: requester insert" on public.approval_requests
  for insert with check (auth.uid() = requested_by);
drop policy if exists "approval_requests: participants update" on public.approval_requests;
create policy "approval_requests: participants update" on public.approval_requests
  for update using (auth.uid() = requested_by or auth.uid() = approver_id);
