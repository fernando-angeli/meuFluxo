alter table accounts
    add column if not exists initial_balance_date date;

update accounts
set initial_balance_date = coalesce(initial_balance_date, cast(created_at as date), current_date);

alter table accounts
    alter column initial_balance_date set not null;
