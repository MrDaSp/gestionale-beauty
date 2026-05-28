-- Creazione Tabella Eventi Agenda
create table public.eventi_agenda (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces on delete cascade not null,
  fascicolo_id uuid references public.fascicoli on delete cascade, -- Opzionale (obbligatorio per Scadenze, nullo per appuntamenti generici)
  titolo text not null,
  tipo text not null check (tipo in ('appuntamento', 'scadenza', 'udienza')),
  data_ora timestamp with time zone not null,
  promemoria_email boolean default false,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attivazione Sicurezza (RLS)
alter table public.eventi_agenda enable row level security;

-- Policy di Lettura: l'utente vede solo gli eventi del proprio studio
create policy "Gli utenti possono leggere gli eventi del proprio workspace"
  on public.eventi_agenda for select
  using ( workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()) );

-- Policy di Scrittura: l'utente può inserire eventi per il proprio studio
create policy "Gli utenti possono inserire eventi nel proprio workspace"
  on public.eventi_agenda for insert
  with check ( workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()) );

-- Policy di Cancellazione
create policy "Gli utenti possono cancellare gli eventi del proprio workspace"
  on public.eventi_agenda for delete
  using ( workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()) );
