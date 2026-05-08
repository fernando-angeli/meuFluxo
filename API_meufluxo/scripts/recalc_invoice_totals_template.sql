WITH inv AS (
    SELECT cci.id AS invoice_id,
           cc.workspace_id
    FROM credit_card_invoices cci
    JOIN credit_cards cc ON cc.id = cci.credit_card_id
    WHERE cci.id = __INVID__
),
billed AS (
    SELECT coalesce(sum(e.amount), 0) AS v
    FROM credit_card_expenses e
    WHERE e.invoice_id = (SELECT invoice_id FROM inv)
      AND e.active = true
      AND e.status = 'OPEN'
),
purchases AS (
    SELECT coalesce(sum(
        CASE
            WHEN e.installment_group_id IS NULL THEN e.amount
            WHEN e.installment_number = 1 THEN (
                SELECT coalesce(sum(e2.amount), 0)
                FROM credit_card_expenses e2
                WHERE e2.installment_group_id = e.installment_group_id
                  AND e2.workspace_id = (SELECT workspace_id FROM inv)
                  AND e2.active = true
                  AND e2.status = 'OPEN'
            )
            ELSE 0::numeric
        END
    ), 0) AS v
    FROM credit_card_expenses e
    WHERE e.invoice_id = (SELECT invoice_id FROM inv)
      AND e.workspace_id = (SELECT workspace_id FROM inv)
      AND e.active = true
      AND e.status = 'OPEN'
),
paid AS (
    SELECT coalesce(sum(p.amount), 0) AS v
    FROM credit_card_invoice_payments p
    WHERE p.invoice_id = (SELECT invoice_id FROM inv)
      AND p.active = true
),
calc AS (
    SELECT (SELECT invoice_id FROM inv) AS invoice_id,
           (SELECT v FROM purchases) AS purchases_amt,
           (SELECT v FROM paid) AS paid_amt,
           (SELECT v FROM billed)
               + coalesce(cci.previous_balance, 0)
               + coalesce(cci.revolving_interest, 0)
               + coalesce(cci.late_fee, 0)
               + coalesce(cci.other_charges, 0) AS total_amt,
           greatest(
               0::numeric,
               (SELECT v FROM billed)
                   + coalesce(cci.previous_balance, 0)
                   + coalesce(cci.revolving_interest, 0)
                   + coalesce(cci.late_fee, 0)
                   + coalesce(cci.other_charges, 0)
                   - (SELECT v FROM paid)
           ) AS rem_amt,
           cci.due_date
    FROM credit_card_invoices cci
    WHERE cci.id = (SELECT invoice_id FROM inv)
)
UPDATE credit_card_invoices cci
SET purchases_amount = c.purchases_amt,
    paid_amount      = c.paid_amt,
    total_amount     = c.total_amt,
    remaining_amount = c.rem_amt,
    status           = CASE
                           WHEN c.rem_amt = 0 THEN 'PAID'
                           WHEN c.paid_amt > 0 THEN 'PARTIALLY_PAID'
                           WHEN c.due_date IS NOT NULL AND c.due_date < CURRENT_DATE THEN 'OVERDUE'
                           ELSE 'OPEN' END,
    updated_at       = now()
FROM calc c
WHERE cci.id = c.invoice_id;
