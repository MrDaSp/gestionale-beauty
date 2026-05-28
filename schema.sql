-- Schema Database "Gestionale Avvocati"
-- Basato sul modello "User + Workspace"

create extension if not exists "uuid-ossp";

-- Tabella WORKSPACES
create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  tipo text not null check (tipo in ('singolo', 'studio')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella USERS (estende auth.users di Supabase)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nome text,
  cognome text,
  foro text,
  numero_albo text,
  partita_iva text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella WORKSPACE_MEMBERS
create table public.workspace_members (
  user_id uuid references public.users on delete cascade,
  workspace_id uuid references public.workspaces on delete cascade,
  ruolo text not null check (ruolo in ('owner', 'collaborator')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, workspace_id)
);

-- Tabella CLIENTI
create table public.clienti (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces on delete cascade not null,
  nome text not null,
  cognome text not null,
  codice_fiscale text,
  email text,
  telefono text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella FASCICOLI
create table public.fascicoli (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces on delete cascade not null,
  cliente_id uuid references public.clienti on delete cascade not null,
  titolo text not null,
  numero_pratica text,
  stato text not null check (stato in ('aperto', 'archiviato')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella DOCUMENTI
create table public.documenti (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces on delete cascade not null,
  fascicolo_id uuid references public.fascicoli on delete cascade, -- nullable (se sta in Inbox)
  caricato_da uuid references public.users on delete set null,
  nome_file text not null,
  tipo_documento text,
  storage_path text not null,
  stato text not null check (stato in ('inbox', 'archiviato')),
  data_documento timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella TIMELINE_EVENTS
create table public.timeline_events (
  id uuid primary key default uuid_generate_v4(),
  fascicolo_id uuid references public.fascicoli on delete cascade not null,
  tipo text not null,
  descrizione text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attivazione Row Level Security (RLS) di base per sicurezza
alter table public.workspaces enable row level security;
alter table public.users enable row level security;
alter table public.workspace_members enable row level security;
alter table public.clienti enable row level security;
alter table public.fascicoli enable row level security;
alter table public.documenti enable row level security;
alter table public.timeline_events enable row level security;
