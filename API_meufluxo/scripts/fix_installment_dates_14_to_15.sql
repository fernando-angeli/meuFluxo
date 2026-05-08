-- Ajusta parcelas seguintes (dia 14 -> 15) nos mesmos installment_group_id da correção 15/12/2025,
-- realoca invoice_id pela regra CreditCardInvoiceCalculationService (closing_day do cartão),
-- depois rode recalc para cada fatura do cartão afetado (executar separadamente ou via script).

BEGIN;

WITH target_groups AS (
    SELECT DISTINCT installment_group_id AS gid
    FROM credit_card_expenses
    WHERE credit_card_id = 1
      AND invoice_id = 11
      AND purchase_date = DATE '2025-12-15'
      AND installment_group_id IS NOT NULL
)
UPDATE credit_card_expenses e
SET purchase_date = e.purchase_date + INTERVAL '1 day',
    updated_at    = now()
WHERE e.installment_group_id IN (SELECT gid FROM target_groups)
  AND e.active = true
  AND EXTRACT(DAY FROM e.purchase_date) = 14;

WITH target_groups AS (
    SELECT DISTINCT installment_group_id AS gid
    FROM credit_card_expenses
    WHERE credit_card_id = 1
      AND invoice_id = 11
      AND purchase_date = DATE '2025-12-15'
      AND installment_group_id IS NOT NULL
),
to_fix AS (
    SELECT e.id,
           e.credit_card_id,
           e.purchase_date,
           cc.closing_day
    FROM credit_card_expenses e
    JOIN credit_cards cc ON cc.id = e.credit_card_id
    WHERE e.installment_group_id IN (SELECT gid FROM target_groups)
      AND e.active = true
),
ref AS (
    SELECT tf.id,
           tf.credit_card_id,
           CASE
               WHEN EXTRACT(DAY FROM tf.purchase_date)::int <= tf.closing_day
                   THEN DATE_TRUNC('month', tf.purchase_date::timestamp)
               ELSE DATE_TRUNC('month', tf.purchase_date::timestamp) + INTERVAL '1 month'
               END AS ref_month
    FROM to_fix tf
),
inv_map AS (
    SELECT r.id AS expense_id,
           cci.id AS new_invoice_id
    FROM ref r
    JOIN credit_card_invoices cci
         ON cci.credit_card_id = r.credit_card_id
             AND cci.reference_year = EXTRACT(YEAR FROM r.ref_month)::int
             AND cci.reference_month = EXTRACT(MONTH FROM r.ref_month)::int
)
UPDATE credit_card_expenses e
SET invoice_id = m.new_invoice_id,
    updated_at = now()
FROM inv_map m
WHERE e.id = m.expense_id;

COMMIT;
