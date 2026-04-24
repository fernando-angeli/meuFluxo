-- Permite lançamento sem subcategoria (alinhado ao front e à API pública).
alter table credit_card_expenses
    alter column subcategory_id drop not null;
