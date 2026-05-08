-- Remove duplicate workspaces that share the same case-insensitive name (e.g. repeated dev seed),
-- re-point all known FKs to the surviving row (lowest id), then enforce uniqueness on lower(name).

DO
$$
    DECLARE
        grp record;
        dup_id bigint;
        keeper_id bigint;
    BEGIN
        FOR grp IN
            SELECT lower(trim(w.name)) AS nkey, min(w.id) AS keep_id
            FROM workspaces w
            GROUP BY lower(trim(w.name))
            HAVING count(*) > 1
            LOOP
                keeper_id := grp.keep_id;
                FOR dup_id IN
                    SELECT w.id
                    FROM workspaces w
                    WHERE lower(trim(w.name)) = grp.nkey
                      AND w.id <> keeper_id
                    LOOP
                        DELETE FROM workspace_users wu
                        WHERE wu.workspace_id = dup_id
                          AND EXISTS (SELECT 1
                                        FROM workspace_users w2
                                        WHERE w2.workspace_id = keeper_id
                                          AND w2.user_id = wu.user_id);

                        UPDATE workspace_users SET workspace_id = keeper_id WHERE workspace_id = dup_id;

                        UPDATE user_preferences SET active_workspace_id = keeper_id WHERE active_workspace_id = dup_id;

                        DELETE FROM workspace_sync_states WHERE workspace_id = dup_id;

                        UPDATE planned_entries SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE holidays SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE cash_movements SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE categories SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE sub_categories SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE accounts SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE credit_card_invoice_payments SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE credit_card_expenses SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE credit_card_transactions SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE invoices SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE financial_projections SET workspace_id = keeper_id WHERE workspace_id = dup_id;
                        UPDATE credit_cards SET workspace_id = keeper_id WHERE workspace_id = dup_id;

                        DELETE FROM workspaces WHERE id = dup_id;
                    END LOOP;
            END LOOP;
    END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uk_workspaces_name_lower ON workspaces (lower(trim(name)));
