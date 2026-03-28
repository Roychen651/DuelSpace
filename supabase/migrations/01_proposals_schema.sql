-- ─────────────────────────────────────────────────────────────────────────────
-- DealSpace — proposals table + RLS
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Proposal status enum
create type proposal_status as enum (
  'draft',
  'sent',
  'viewed',
  'accepted',
  'rejected'
);

-- Main proposals table
create table if not exists proposals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  client_name   text not null default '',
  client_email  text,
  project_title text not null default '',
  cover_image   text,                   -- public URL (Supabase Storage)
  description   text,

  -- Pricing
  base_price    numeric(12, 2) not null default 0,
  currency      text not null default 'ILS',

  -- Dynamic add-ons — array of objects:
  -- [{ id, label, description, price, enabled }]
  add_ons       jsonb not null default '[]'::jsonb,

  -- Lifecycle
  status        proposal_status not null default 'draft',
  expires_at    timestamptz,
  public_token  text unique default encode(gen_random_bytes(16), 'hex'),

  -- Analytics (updated by edge function / client on view)
  view_count    integer not null default 0,
  last_viewed_at timestamptz,
  time_spent_seconds integer not null default 0,

  -- Timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger proposals_updated_at
  before update on proposals
  for each row execute function update_updated_at();

-- Index for fast per-user queries (the only pattern we use)
create index proposals_user_id_idx on proposals(user_id);
create index proposals_status_idx on proposals(status);
create index proposals_public_token_idx on proposals(public_token);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table proposals enable row level security;

-- Users can SELECT only their own proposals
create policy "owner_select" on proposals
  for select using (auth.uid() = user_id);

-- Users can INSERT only rows with their own user_id
create policy "owner_insert" on proposals
  for insert with check (auth.uid() = user_id);

-- Users can UPDATE only their own rows
create policy "owner_update" on proposals
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can DELETE only their own rows
create policy "owner_delete" on proposals
  for delete using (auth.uid() = user_id);

-- Public read via share token (no auth needed — for client-facing Deal Room)
create policy "public_token_select" on proposals
  for select using (public_token is not null);

-- ─── delete_user_account RPC (called by useAuthStore.deleteAccount) ───────────
create or replace function delete_user_account()
returns void language plpgsql security definer as $$
begin
  -- proposals cascade-delete via FK, but be explicit
  delete from proposals where user_id = auth.uid();
  -- Delete auth user (requires service role in prod — use admin API instead)
  delete from auth.users where id = auth.uid();
end;
$$;
