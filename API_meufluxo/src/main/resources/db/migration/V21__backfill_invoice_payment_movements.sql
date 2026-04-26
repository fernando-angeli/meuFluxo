-- Ensure invoice-payment movements exist and are linked.
-- Also backfills historical payments without movement_id.

-- 1) Create technical category per workspace when missing.
insert into categories (
    workspace_id,
    name,
    description,
    movement_type,
    active,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
select
    w.id,
    'Pagamento de fatura de cartao',
    'Categoria tecnica para pagamento de faturas de cartao.',
    'EXPENSE',
    true,
    now(),
    now(),
    1,
    1
from workspaces w
where not exists (
    select 1
    from categories c
    where c.workspace_id = w.id
      and lower(c.name) = lower('Pagamento de fatura de cartao')
);

-- 2) Create default subcategory for the technical category.
insert into sub_categories (
    workspace_id,
    category_id,
    name,
    description,
    active,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
select
    c.workspace_id,
    c.id,
    'Geral',
    'Subcategoria tecnica para pagamento de faturas de cartao.',
    true,
    now(),
    now(),
    1,
    1
from categories c
where lower(c.name) = lower('Pagamento de fatura de cartao')
  and c.movement_type = 'EXPENSE'
  and not exists (
      select 1
      from sub_categories s
      where s.workspace_id = c.workspace_id
        and s.category_id = c.id
        and lower(s.name) = lower('Geral')
  );

-- 3) Backfill cash_movements and link movement_id on payments.
with payments_to_fix as (
    select
        p.id as payment_id,
        p.workspace_id,
        p.invoice_id,
        p.account_id,
        p.payment_date,
        p.amount,
        p.notes,
        p.created_by_user_id,
        p.updated_by_user_id,
        sc.id as subcategory_id,
        i.reference_month,
        i.reference_year
    from credit_card_invoice_payments p
    join credit_card_invoices i
      on i.id = p.invoice_id
    join categories c
      on c.workspace_id = p.workspace_id
     and lower(c.name) = lower('Pagamento de fatura de cartao')
     and c.movement_type = 'EXPENSE'
    join sub_categories sc
      on sc.workspace_id = c.workspace_id
     and sc.category_id = c.id
     and lower(sc.name) = lower('Geral')
    where p.movement_id is null
      and p.active = true
),
inserted_movements as (
    insert into cash_movements (
        workspace_id,
        account_id,
        subcategory_id,
        credit_card_invoice_id,
        amount,
        movement_type,
        payment_method,
        occurred_at,
        reference_month,
        description,
        notes,
        active,
        created_at,
        updated_at,
        created_by_user_id,
        updated_by_user_id
    )
    select
        f.workspace_id,
        f.account_id,
        f.subcategory_id,
        f.invoice_id,
        f.amount,
        'EXPENSE',
        'INVOICE_CREDIT_CARD',
        f.payment_date,
        date_trunc('month', f.payment_date)::date,
        'Pagamento fatura '
            || lpad(coalesce(f.reference_month, 0)::text, 2, '0')
            || '/'
            || coalesce(f.reference_year, 0)::text
            || ' (#P'
            || f.payment_id::text
            || ')',
        f.notes,
        true,
        now(),
        now(),
        coalesce(f.created_by_user_id, 1),
        coalesce(f.updated_by_user_id, 1)
    from payments_to_fix f
    returning id, account_id, amount, description
),
updated_payments as (
    update credit_card_invoice_payments p
    set movement_id = m.id
    from inserted_movements m
    where p.movement_id is null
      and m.description like ('% (#P' || p.id::text || ')')
    returning p.id
),
account_adjustments as (
    select account_id, sum(amount) as total_amount
    from inserted_movements
    group by account_id
)
update accounts a
set current_balance = coalesce(a.current_balance, a.initial_balance, 0) - adj.total_amount,
    balance_updated_at = now()
from account_adjustments adj
where a.id = adj.account_id;
