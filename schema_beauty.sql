-- Schema Database "Gestionale Beauty"
-- Basato sul modello "User + Workspace"

create extension if not exists "uuid-ossp";

-- Tabella WORKSPACES
create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  tipo text not null check (tipo in ('singolo', 'salone')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella IMPOSTAZIONI_SALONE
create table public.impostazioni_salone (
  workspace_id uuid references public.workspaces on delete cascade primary key,
  modulo_parrucchieria boolean default true,
  modulo_estetica boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella USERS (Lo Staff, estende auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nome text,
  cognome text,
  qualifica text, -- es. Parrucchiere, Estetista
  specializzazione text,
  colore_agenda text default '#10b981', -- emerald-500
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
  whatsapp text,
  data_nascita date,
  note_allergie text,
  spesa_media numeric(10,2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella SERVIZI (Listino)
create table public.servizi (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces on delete cascade not null,
  nome_servizio text not null,
  categoria text not null check (categoria in ('Taglio e Forma', 'Colore', 'Trattamenti Tecnici', 'Styling & Acconciature', 'Trattamenti Viso', 'Trattamenti Corpo', 'Manicure / Pedicure', 'Altro')),
  settore text not null check (settore in ('parrucchieria', 'estetica')),
  durata_minuti integer not null default 30,
  prezzo numeric(10,2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella APPUNTAMENTI (Ex Eventi Agenda / Fascicoli)
create table public.appuntamenti (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces on delete cascade not null,
  cliente_id uuid references public.clienti on delete cascade not null,
  operatore_id uuid references public.users on delete set null,
  servizio_id uuid references public.servizi on delete set null,
  data_ora_inizio timestamp with time zone not null,
  data_ora_fine timestamp with time zone not null,
  stato text not null check (stato in ('prenotato', 'confermato', 'in_salone', 'completato', 'no_show', 'cancellato')),
  note_formula text, -- Formula colore o note tecniche per questo appuntamento
  foto_prima text, -- Storage path
  foto_dopo text, -- Storage path
  prezzo_finale numeric(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attivazione Row Level Security (RLS) di base per sicurezza
alter table public.workspaces enable row level security;
alter table public.impostazioni_salone enable row level security;
alter table public.users enable row level security;
alter table public.workspace_members enable row level security;
alter table public.clienti enable row level security;
alter table public.servizi enable row level security;
alter table public.appuntamenti enable row level security;
