-- 1. Elimina la vecchia policy (che bloccava l'accesso perché l'owner era vuoto)
DROP POLICY IF EXISTS "Gli utenti possono leggere i propri file" ON storage.objects;

-- 2. Crea la nuova policy che controlla l'accesso in base alla cartella (workspaceId)
CREATE POLICY "Lettura file del workspace"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documenti' 
    AND split_part(name, '/', 1) IN (
      SELECT workspace_id::text FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );
