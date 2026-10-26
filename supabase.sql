-- Dynago: tabela de dados por usuário com segurança por linha (RLS).
-- Cole no Supabase → SQL Editor → New query → Run.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  plan       jsonb not null default '[]'::jsonb,
  hist       jsonb not null default '[]'::jsonb,
  vids       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- Cada usuário só enxerga e altera a própria linha.
create policy "dynago_select_own" on public.user_data for select using (auth.uid() = user_id);
create policy "dynago_insert_own" on public.user_data for insert with check (auth.uid() = user_id);
create policy "dynago_update_own" on public.user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dynago_delete_own" on public.user_data for delete using (auth.uid() = user_id);
