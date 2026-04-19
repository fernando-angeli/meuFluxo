ALTER TABLE accounts
    ADD COLUMN bank_code integer,
    ADD COLUMN bank_name varchar(255),
    ADD COLUMN agency varchar(100),
    ADD COLUMN account_number varchar(100),
    ADD COLUMN overdraft_limit numeric(15,2);

CREATE INDEX idx_accounts_bank_code ON accounts(bank_code);
