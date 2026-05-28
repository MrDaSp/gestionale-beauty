-- RLS Policies per la Fase 2: Clienti, Fascicoli, Documenti

-- Helper per semplificare: l'utente può fare tutto nel workspace a cui appartiene
-- In un caso reale più complesso ci sarebbero policy distinte per select, insert, update, delete

-- Clienti
create policy "Accesso ai clienti del proprio workspace"
  on public.clienti for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()))
  with check (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

-- Fascicoli
create policy "Accesso ai fascicoli del proprio workspace"
  on public.fascicoli for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()))
  with check (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

-- Documenti
create policy "Accesso ai documenti del proprio workspace"
  on public.documenti for all
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()))
  with check (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

-- Storage: Policy per il bucket "documenti"
-- (Richiede l'estensione o la sintassi specifica di Supabase Storage, di solito da UI, ma lo mettiamo come reference)
-- create policy "Accesso storage" on storage.objects for all using (bucket_id = 'documenti' and (auth.uid() = owner));
