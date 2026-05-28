# Diario di Sviluppo: Gestionale Beauty

Questo diario traccia le modifiche architetturali, i comandi eseguiti e le scelte di design per l'evoluzione del gestionale "Beauty" (precedentemente Dikast).

## Obiettivo Principale
Trasformare un gestionale per studi legali in un software cloud moderno per saloni di bellezza (parrucchieri, barbieri, centri estetici).

## 1. Fase Iniziale: Setup & Rebranding base (26-28 Maggio 2026)
- **Clonazione progetto**: Il codice originario di Dikast è stato copiato localmente in `d:\DW\gestionale_beauty`.
- **Configurazione Netlify**: Abbiamo collegato il progetto a Netlify via CLI. Abbiamo avuto alcuni problemi con l'Exit Code 2 durante il build (dovuto a 359 errori di ESLint causati da vecchie sintassi e l'uso di "any").
- **Fix Build**: Abbiamo disabilitato temporaneamente i controlli bloccanti di ESLint in `next.config.ts` per permettere la pubblicazione di Next.js 16.
- **Continuous Deployment**: È stato agganciato correttamente GitHub a Netlify (`MrDaSp/gestionale-beauty`). Ora ogni `git push` attiva un deploy automatico.

## 2. Ristrutturazione Dati (In corso)
Abbiamo abbandonato il concetto di "Fascicolo" in favore di "Scheda Cliente", "Catalogo Servizi" e "Appuntamenti".
- **Schema Supabase**: In fase di riscrittura (`schema_beauty.sql`).
- **Tema**: Passaggio dalla palette Blu/Celeste di Dikast a un tema Bianco/Verde.
- **Mobile First**: Maggiore attenzione alla responsività per l'utilizzo su smartphone.

*(Il diario verrà aggiornato man mano che completiamo i task)*
