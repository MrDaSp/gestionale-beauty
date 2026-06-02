-- SQL Script per eliminare definitivamente i residui di Dikast
-- Esegui questo script nel SQL Editor di Supabase per pulire il database

-- Elimina le vecchie tabelle (con CASCADE per rimuovere le foreign keys collegate)
DROP TABLE IF EXISTS public.documenti CASCADE;
DROP TABLE IF EXISTS public.eventi_agenda CASCADE;
DROP TABLE IF EXISTS public.fascicoli CASCADE;

-- Rimuovi il bucket storage 'documenti' (se permesso tramite SQL, altrimenti elimina da Dashboard Supabase -> Storage)
DELETE FROM storage.buckets WHERE id = 'documenti';

-- Ricordati di eseguire schema_beauty.sql se non l'hai già fatto per creare le nuove tabelle!
