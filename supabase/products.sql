-- Run this in Supabase → SQL Editor
-- Project: vbdijffbcrshtifrvvdd

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null,
  description text not null default '',
  category text not null,
  price_lkr integer not null check (price_lkr >= 0),
  market_price_lkr integer not null check (market_price_lkr >= 0),
  image text not null,
  is_new boolean not null default false,
  featured boolean not null default false,
  origin text not null default 'Italy',
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);

alter table public.products enable row level security;

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products for select
  using (true);

drop policy if exists "Authenticated insert products" on public.products;
create policy "Authenticated insert products"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated update products" on public.products;
create policy "Authenticated update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated delete products" on public.products;
create policy "Authenticated delete products"
  on public.products for delete
  to authenticated
  using (true);
