-- Ajuste Receita
INSERT INTO categories (name, movement_type, active, created_at, updated_at)
VALUES ('Ajuste de saldo (Receita)', 'INCOME', true, now(), now());

-- Ajuste Despesa
INSERT INTO categories (name, movement_type, active, created_at, updated_at)
VALUES ('Ajuste de saldo (Despesa)', 'EXPENSE', true, now(), now());
