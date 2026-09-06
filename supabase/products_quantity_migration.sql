-- Run once in Supabase → SQL Editor
-- Adds product stock quantity + RPC so cart can adjust stock (including guests)

alter table public.products
  add column if not exists quantity integer;

update public.products
set quantity = 10
where quantity is null;

alter table public.products
  alter column quantity set default 0;

alter table public.products
  alter column quantity set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_quantity_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_quantity_check check (quantity >= 0);
  end if;
end $$;

create or replace function public.adjust_product_quantity(
  p_product_id text,
  p_delta integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_qty integer;
begin
  if p_product_id is null or length(trim(p_product_id)) = 0 then
    return null;
  end if;

  update public.products
  set quantity = quantity + p_delta
  where id::text = p_product_id
    and quantity + p_delta >= 0
  returning quantity into new_qty;

  if new_qty is null then
    raise exception 'Insufficient stock or product not found (%).', p_product_id;
  end if;

  return new_qty;
end;
$$;

revoke all on function public.adjust_product_quantity(text, integer) from public;
grant execute on function public.adjust_product_quantity(text, integer) to anon, authenticated;
