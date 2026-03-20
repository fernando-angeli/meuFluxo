alter table workspace_sync_states
    add column if not exists sub_categories_version bigint not null default 1;

update workspace_sync_states
set sub_categories_version = 1
where sub_categories_version is null;
