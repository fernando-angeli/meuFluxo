CREATE INDEX IF NOT EXISTS idx_planned_entries_status_due_date
    ON planned_entries (status, due_date);

CREATE INDEX IF NOT EXISTS idx_planned_entries_due_date
    ON planned_entries (due_date);
