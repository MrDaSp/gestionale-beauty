-- Creazione del bucket per i documenti
insert into storage.buckets (id, name, public)
values ('documenti', 'documenti', false)
on conflict (id) do nothing;

-- RLS per Storage
-- Permetti l'inserimento di file (UPLOAD)
create policy "Gli utenti possono caricare file"
  on storage.objects for insert
  with check ( bucket_id = 'documenti' and auth.uid() = owner );

-- Permetti la lettura dei file
create policy "Gli utenti possono leggere i propri file"
  on storage.objects for select
  using ( bucket_id = 'documenti' and auth.uid() = owner );
