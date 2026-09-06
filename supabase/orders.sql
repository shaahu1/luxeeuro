-- Run this in Supabase → SQL Editor
-- Project: vbdijffbcrshtifrvvdd

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users (id) on delete set null,
  customer_email text,
  customer_name text,
  status text not null default 'order_placed'
    check (status in ('order_placed', 'in_transit', 'delivered', 'canceled')),
  total_lkr integer not null check (total_lkr >= 0),
  item_count integer not null check (item_count >= 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text,
  product_slug text not null,
  product_name text not null,
  product_brand text not null,
  unit_price_lkr integer not null check (unit_price_lkr >= 0),
  quantity integer not null check (quantity > 0),
  line_total_lkr integer not null check (line_total_lkr >= 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Anyone can place an order (guest or signed-in)
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Anyone can create order items" on public.order_items;
create policy "Anyone can create order items"
  on public.order_items for insert
  with check (true);

-- Users can read their own orders; authenticated can read all (admin panel)
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "Users read order items" on public.order_items;
create policy "Users read order items"
  on public.order_items for select
  to authenticated
  using (true);

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);
