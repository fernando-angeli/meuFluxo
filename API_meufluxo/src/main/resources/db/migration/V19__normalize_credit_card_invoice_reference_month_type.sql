-- Normaliza o tipo de reference_month para integer em bases legadas
-- onde a coluna ainda esteja como varchar/text.
do
$$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'credit_card_invoices'
          and column_name = 'reference_month'
          and data_type in ('character varying', 'character', 'text')
    ) then
        alter table credit_card_invoices
            alter column reference_month type integer
            using (
                case
                    when reference_month ~ '^[0-9]{4}-[0-9]{2}$' then split_part(reference_month, '-', 2)::integer
                    when reference_month ~ '^[0-9]{1,2}$' then reference_month::integer
                    else null
                end
            );
    end if;
end
$$;

update credit_card_invoices
set reference_month = extract(month from coalesce(due_date, closing_date, current_date))::integer
where reference_month is null;

alter table credit_card_invoices
    alter column reference_month set not null;
