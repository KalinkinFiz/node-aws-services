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
  ('primer1', 'desc1', 3),
  ('primer2', 'desc2', 6),
  ('primer3', 'dexc3', 5);

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