-- Creazione delle policy RLS (Row Level Security) mancanti

-- Policy per la tabella USERS
create policy "Gli utenti possono vedere il proprio profilo"
  on public.users for select
  using (auth.uid() = id);

create policy "Gli utenti possono aggiornare il proprio profilo"
  on public.users for update
  using (auth.uid() = id);

-- Policy per la tabella WORKSPACE_MEMBERS
create policy "Gli utenti vedono a quali workspace appartengono"
  on public.workspace_members for select
  using (auth.uid() = user_id);

-- Policy per la tabella WORKSPACES
create policy "Gli utenti vedono i dettagli del proprio workspace"
  on public.workspaces for select
  using (
    id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );
