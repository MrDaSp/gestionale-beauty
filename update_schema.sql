-- Update Schema: Aggiunta Agenda Legale

-- Tabella AGENDA_EVENTS
create table public.agenda_events (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces on delete cascade not null,
  fascicolo_id uuid references public.fascicoli on delete cascade not null,
  titolo text not null,
  tipo text not null check (tipo in ('udienza', 'scadenza', 'appuntamento')),
  data_evento timestamp with time zone not null,
  stato text default 'programmato' check (stato in ('programmato', 'completato', 'annullato')),
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attivazione Row Level Security (RLS)
alter table public.agenda_events enable row level security;
