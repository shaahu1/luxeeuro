-- Run once in Supabase → SQL Editor
-- Fixes Delivered / In-transit / Order Placed / Canceled status updates

alter table public.orders drop constraint if exists orders_status_check;

do $$
declare
  r record;
begin
  for r in (
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.orders'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  ) loop
    execute format('alter table public.orders drop constraint %I', r.conname);
  end loop;
end $$;

update public.orders set status = 'order_placed'
where status in ('pending', 'confirmed') or status is null or status = '';

update public.orders set status = 'in_transit' where status = 'shipped';
update public.orders set status = 'canceled' where status in ('cancelled');

update public.orders set status = 'order_placed'
where status not in ('order_placed', 'in_transit', 'delivered', 'canceled');

alter table public.orders alter column status set default 'order_placed';

alter table public.orders
  add constraint orders_status_check
  check (status in ('order_placed', 'in_transit', 'delivered', 'canceled'));
