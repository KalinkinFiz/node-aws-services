create extension if not exists "uuid-ossp";

drop table if exists products cascade;

create table products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  price integer
);

drop table if exists stocks;

create table stocks (
  id serial primary key,
  product_id uuid unique not null,
  count integer,
  foreign key(product_id) references products(id)
);

insert into products (title, description, price) values
  ('ProductOne', 'Short Product Description1', 2.4),
  ('ProductNew', 'Short Product Description2', 10),
  ('ProductTop', 'Short Product Description3', 23),
  ('ProductTitle', 'Short Product Description4', 15),
  ('Product', 'Short Product Description5', 15),
  ('ProductTest', 'Short Product Description6', 15),
  ('Product2', 'Short Product Description7', 23),
  ('ProductName', 'Short Product Description8', 15);

with stock as (
  select
    generate_series(1, count(*)) row_num,
    round(random() * 10) count
  from products
),
product as (
  select
    id,
    row_number() over (
      order by id
    ) row_num
  from products
)
insert into stocks (product_id, count)
select p.id, s.count
from stock s
join product p on p.row_num=s.row_num;