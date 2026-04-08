-- Run this in your Supabase SQL editor
create table if not exists calendar_tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  date       text not null,          -- 'YYYY-MM-DD'
  text       text not null,
  done       boolean not null default false,
  position   int not null default 0,
  created_at timestamptz default now()
);

create index if not exists calendar_tasks_user_date on calendar_tasks (user_id, date);

alter table calendar_tasks enable row level security;

create policy "Users manage own calendar tasks"
  on calendar_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
