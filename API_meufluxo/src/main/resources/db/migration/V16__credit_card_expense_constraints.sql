alter table credit_card_expenses
    alter column invoice_id set not null;

alter table credit_card_expenses
    alter column installment_count set not null;

alter table credit_card_expenses
    alter column installment_number set not null;

alter table credit_card_expenses
    add constraint credit_card_expenses_amount_check check (amount > 0);

alter table credit_card_expenses
    add constraint credit_card_expenses_installment_count_check check (installment_count >= 1);

alter table credit_card_expenses
    add constraint credit_card_expenses_installment_number_check check (installment_number >= 1);
