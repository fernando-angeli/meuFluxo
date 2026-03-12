alter table users
    add column if not exists enabled boolean not null default true;
