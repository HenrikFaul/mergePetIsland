-- ── Merge Pets Island · Supabase schema ───────────────────────────────────
-- Cloud save, quests, IAP receipts, ad events and friends. RLS locks every
-- row to its owner; service_role (edge functions) bypasses for grants.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Pet Lover',
  country_code text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "self" on public.profiles;
create policy "self" on public.profiles for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.island_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coins bigint not null default 0,
  gems int not null default 0,
  biomes_unlocked text[] not null default array['grass'],
  pet_album jsonb not null default '{}'::jsonb,   -- {species: highest_level_seen}
  grid_state jsonb not null default '[]'::jsonb,  -- entities array
  owned_decorations text[] not null default '{}',
  last_seen_at timestamptz not null default now(),
  daily_streak int not null default 0,
  last_daily_claim date,
  updated_at timestamptz not null default now()
);
alter table public.island_state enable row level security;
drop policy if exists "self" on public.island_state;
create policy "self" on public.island_state for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.quests (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  quest_key text not null,
  progress int not null default 0,
  target int not null,
  reward jsonb not null,
  claimed boolean not null default false,
  unique (user_id, date, quest_key)
);
alter table public.quests enable row level security;
drop policy if exists "self" on public.quests;
create policy "self" on public.quests for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.iap_receipts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id),
  product_id text not null,
  store text not null,
  receipt text not null,
  state text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.iap_receipts enable row level security;
drop policy if exists "self r" on public.iap_receipts;
drop policy if exists "self i" on public.iap_receipts;
create policy "self r" on public.iap_receipts for select to authenticated
  using (auth.uid() = user_id);
create policy "self i" on public.iap_receipts for insert to authenticated
  with check (auth.uid() = user_id);

create table if not exists public.ad_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id),
  placement text not null,
  network text not null,
  state text not null,
  reward_payload jsonb,
  created_at timestamptz not null default now()
);
alter table public.ad_events enable row level security;
drop policy if exists "self i" on public.ad_events;
create policy "self i" on public.ad_events for insert to authenticated
  with check (auth.uid() = user_id);

create table if not exists public.friends (
  user_a uuid not null references auth.users(id),
  user_b uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (user_a, user_b)
);
alter table public.friends enable row level security;
drop policy if exists "involved" on public.friends;
drop policy if exists "self insert" on public.friends;
create policy "involved" on public.friends for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);
create policy "self insert" on public.friends for insert to authenticated
  with check (auth.uid() = user_a);

-- Auto-provision profile + island_state on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  insert into public.island_state (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
