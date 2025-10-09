-- Users Reflections for there prayers
create table reflections (
  id uuid primary key default gen_random_uuid(),
  prayer_id uuid references prayers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note text,
  type text,
  embedding_id text, -- reference to Pinecone if needed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on reflections (prayer_id);

-- Users Prayers 
create table prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text,
  is_answered boolean default false,
  is_archived boolean default false,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
create index on prayers (user_id);
create index on prayers (created_at);

-- Keeps track of prayers that have been sent out as a reminder
create table reminder_logs (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid references reminders(id) on delete cascade,
  prayer_id uuid references prayers(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  sent_at timestamptz default now(),
  channel text,
  status text, -- 'sent', 'failed', 'snoozed', etc.
  metadata jsonb
);

-- Reminders for each prayer 
create table reminders (
  id uuid primary key default gen_random_uuid(),
  prayer_id uuid references prayers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  recurrence_type text not null, -- single/daily/weekly/custom_cron
  time_of_day time,
  days_of_week int[], -- array of weekdays (0=Sunday ... 6=Saturday)
  start_date date,
  end_date date,
  occurrence_count int,
  timezone text,
  is_active boolean default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  channel text, -- e.g. 'email', 'push'
  destination jsonb, -- e.g. { "email": "user@example.com" }
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on reminders (user_id);
create index on reminders (next_run_at);