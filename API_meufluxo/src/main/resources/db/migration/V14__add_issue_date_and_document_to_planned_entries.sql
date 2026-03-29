alter table planned_entries
    add column if not exists issue_date date;

alter table planned_entries
    add column if not exists document varchar(255);

create index if not exists idx_planned_entries_workspace_direction_issue_date
    on planned_entries(workspace_id, direction, issue_date);

create index if not exists idx_planned_entries_workspace_direction_document
    on planned_entries(workspace_id, direction, document);
