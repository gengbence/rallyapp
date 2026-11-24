-- Rally app: kezdeti adatbázis-séma (Supabase / Postgres).
-- Jogosultság: aki a páros (crew) vagy a csapat (team) tagja, az látja és szerkeszti az adatait.

create extension if not exists "pgcrypto";

create type crew_role as enum ('driver', 'codriver', 'service', 'manager');
create type location_kind as enum ('service_park', 'regrouping', 'time_control', 'admin_check', 'scrutineering', 'shakedown', 'stage_start', 'stage_finish', 'other');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  phone text,
  locale text not null default 'hu',
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table team_members (
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role crew_role not null,
  primary key (team_id, user_id)
);

-- Gyorshívó névjegyek (szerviz, csapatfőnök, stb.).
create table team_contacts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  label text not null,
  phone text not null,
  sort_order int not null default 0
);

create table cars (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  make text not null,
  model text not null,
  class text,
  plate text
);

create table crews (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  driver_id uuid references profiles(id),
  codriver_id uuid references profiles(id),
  car_id uuid references cars(id),
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references crews(id) on delete cascade,
  name text not null,
  series text,
  country text,
  starts_on date,
  ends_on date,
  start_number text,
  regulations_path text,        -- Storage: versenykiírás PDF
  ewrc_url text,                -- csak link, adatgyűjtés engedély nélkül nincs
  created_at timestamptz not null default now()
);

create table event_locations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  kind location_kind not null,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  starts_at timestamptz,
  source text not null default 'manual' check (source in ('manual', 'pdf'))
);

create table schedule_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  location_id uuid references event_locations(id) on delete set null,
  remind_minutes_before int,
  done boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'pdf'))
);

create table checklists (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  event_id uuid references events(id) on delete cascade, -- null = sablon
  name text not null
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references checklists(id) on delete cascade,
  label text not null,
  category text,
  checked boolean not null default false,
  sort_order int not null default 0
);

create table stages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  code text not null,            -- pl. SS3
  name text not null,
  length_km numeric(6,2),
  start_lat double precision, start_lng double precision, start_bearing double precision,
  finish_lat double precision, finish_lng double precision, finish_bearing double precision,
  gate_radius_m int not null default 25
);

create table stage_runs (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references stages(id) on delete cascade,
  crew_id uuid not null references crews(id) on delete cascade,
  gps_time_ms int,
  official_time_ms int,
  distance_m int,
  track_path text,               -- Storage: GPS nyomvonal (GeoJSON)
  recorded_at timestamptz not null default now()
);

create table time_cards (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  stage_id uuid references stages(id) on delete set null,
  photo_path text not null,      -- Storage: menetlevél fotó
  taken_at timestamptz not null default now(),
  note text
);

create table tyre_logs (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references cars(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  stage_id uuid references stages(id) on delete set null,
  tyre text,
  ambient_c numeric(4,1),
  fl_cold numeric(4,2), fr_cold numeric(4,2), rl_cold numeric(4,2), rr_cold numeric(4,2),
  fl_hot numeric(4,2),  fr_hot numeric(4,2),  rl_hot numeric(4,2),  rr_hot numeric(4,2),
  note text,
  logged_at timestamptz not null default now()
);

create table setups (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references cars(id) on delete cascade,
  name text not null,
  surface text check (surface in ('gravel', 'tarmac', 'snow', 'mixed')),
  ride_height_f_mm int, ride_height_r_mm int,
  spring_f_nmm int, spring_r_nmm int,
  arb_f text, arb_r text,
  camber_f numeric(4,2), camber_r numeric(4,2),
  toe_f numeric(4,2), toe_r numeric(4,2),
  note text,
  created_at timestamptz not null default now()
);

-- 3 utas gátló: lassú és gyors összenyomás (LS/HS bump) és visszarugózás (rebound), kattintásban.
create table damper_settings (
  setup_id uuid not null references setups(id) on delete cascade,
  corner text not null check (corner in ('FL', 'FR', 'RL', 'RR')),
  ls_bump int, hs_bump int, rebound int,
  primary key (setup_id, corner)
);

-- Offline tudástár: szerkesztett tartalom, mindenki olvashatja.
create table tips (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'hu',
  symptom text not null,
  quick_fix text not null,
  category text
);

-- ---------- Jogosultság (RLS) ----------
create function is_team_member(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid());
$$;

create function crew_team(c uuid) returns uuid language sql stable as $$ select team_id from crews where id = c $$;
create function event_team(e uuid) returns uuid language sql stable as $$ select crew_team(crew_id) from events where id = e $$;

alter table profiles enable row level security;
create policy "saját profil" on profiles for all using (id = auth.uid()) with check (id = auth.uid());

alter table teams enable row level security;
create policy "csapattag olvas" on teams for select using (is_team_member(id) or created_by = auth.uid());
create policy "létrehozó ír" on teams for all using (created_by = auth.uid()) with check (created_by = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['team_members', 'team_contacts', 'cars', 'crews', 'checklists'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "csapattag" on %I for all using (is_team_member(team_id)) with check (is_team_member(team_id))', t);
  end loop;
  foreach t in array array['event_locations', 'schedule_items', 'stages', 'time_cards'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "csapattag" on %I for all using (is_team_member(event_team(event_id))) with check (is_team_member(event_team(event_id)))', t);
  end loop;
end $$;

alter table events enable row level security;
create policy "csapattag" on events for all using (is_team_member(crew_team(crew_id))) with check (is_team_member(crew_team(crew_id)));

alter table checklist_items enable row level security;
create policy "csapattag" on checklist_items for all
  using (is_team_member((select team_id from checklists where id = checklist_id)))
  with check (is_team_member((select team_id from checklists where id = checklist_id)));

alter table stage_runs enable row level security;
create policy "csapattag" on stage_runs for all using (is_team_member(crew_team(crew_id))) with check (is_team_member(crew_team(crew_id)));

alter table tyre_logs enable row level security;
create policy "csapattag" on tyre_logs for all
  using (is_team_member((select team_id from cars where id = car_id)))
  with check (is_team_member((select team_id from cars where id = car_id)));

alter table setups enable row level security;
create policy "csapattag" on setups for all
  using (is_team_member((select team_id from cars where id = car_id)))
  with check (is_team_member((select team_id from cars where id = car_id)));

alter table damper_settings enable row level security;
create policy "csapattag" on damper_settings for all
  using (is_team_member((select c.team_id from setups s join cars c on c.id = s.car_id where s.id = setup_id)))
  with check (is_team_member((select c.team_id from setups s join cars c on c.id = s.car_id where s.id = setup_id)));

alter table tips enable row level security;
create policy "mindenki olvas" on tips for select using (true);
