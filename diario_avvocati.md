# 📒 Diario Avvocati — Gestionale Legale Cloud

> Diario di sviluppo del progetto. Ogni decisione, milestone, idea e nota viene tracciata qui.

---

## 📅 26 Maggio 2026 — Giorno 1: Kickoff

### 🎯 Visione del Prodotto
**"L'avvocato deve poter ricevere un documento ovunque si trovi e archiviarlo nel fascicolo corretto in meno di 10 secondi."**

### 💡 Origine dell'idea
- Nasce dall'esperienza reale quotidiana dell'avvocato
- Il problema centrale: **la dispersione dei documenti** tra WhatsApp, email, PEC, foto, scansioni
- Non è "un'altra agenda per avvocati" — è un **sistema operativo della pratica legale**

### 📋 Documenti di riferimento
- `fase iniziale.txt` — Documento dettagliato con visione prodotto, architettura, fasi MVP
- `Idea.pdf` — Schema visuale della struttura (immagine)

### 🏗️ Decisioni architetturali prese
1. **Web App / PWA** = centro operativo dello studio e web app installabile su mobile, per validare il prodotto minimizzando costi di sviluppo (no app nativa iniziale).
2. **Inbox (Quick Capture)** = area di "parcheggio" per l'upload rapido da mobile, la classificazione vera e propria può avvenire in un secondo momento.
3. **Cloud-first e SaaS Moderno** = un unico database centralizzato basato sul modello **User + Workspace**. Un utente nasce singolo ma può espandersi a studio invitando collaboratori (solo due ruoli MVP: Owner, Collaborator).
4. **Design moderno (Light Mode focus)** = ispirato a Notion/Linear, pulito e professionale. Dark Mode posticipata in fasi successive.
5. **Sicurezza First** = Crittografia, audit log e segregazione dati (RLS) come feature fondante per la fiducia degli avvocati.

### 📦 Fasi concordate
| Fase | Contenuto | Stato |
|------|-----------|-------|
| **FASE 1 (MVP Focus)** | Login/Workspace, Clienti, Fascicoli, Inbox (Upload rapido), Timeline Automatica, Ricerca metadati | 🔜 Da sviluppare |
| **FASE 2** | Agenda avanzata, Udienze, Scadenze, Parcelle, PEC, OCR, AI classificazione | ⏳ Futura |
| **FASE 3** | AI riassunti, AI timeline automatica, PCT, Dettatura vocale, Assistente legale | ⏳ Futura |

### ✅ Azioni di oggi
- [x] Analisi requisiti da `fase iniziale.txt`
- [x] Revisione approfondita con Feedback PM (Modello SaaS, MVP ultra-focalizzato, Sicurezza)
- [x] Creazione e aggiornamento `diario_avvocati.md`
- [x] Creazione workflow/implementation plan dettagliato
- [ ] Scelta stack tecnologico definitivo (Next.js + Supabase proposto)

---

## 📝 Note e Idee Aperte

### Funzionalità "killer" da non dimenticare
1. **Share Extension mobile** — Condividi da WhatsApp → seleziona cliente → salva. 10 secondi.
2. **OCR/AI sui documenti** — Suggerimento automatico di cliente, tipo documento, data
3. **Ricerca globale** — "contratto locazione Rossi" → trova tutto
4. **Timeline della pratica** — Cronologia automatica di ogni evento nel fascicolo
5. **PEC integration** — Prima semplice (inoltro), poi diretta (Aruba, Legalmail, ecc.)

### Domande aperte
- [ ] Nome del prodotto?
- [ ] Hosting: quale provider cloud? (AWS, Google Cloud, Azure, Vercel?)
- [ ] Gestione multi-studio: un avvocato singolo o anche studi associati?
- [ ] Piano pricing: freemium? abbonamento? trial?
- [ ] Compliance GDPR: serve DPO? Dove i server (EU obbligatorio)?

---

## 📅 26-27 Maggio 2026 — L'Integrazione Suprema (Fase 8)

### 🤖 Bot Telegram & Inbound Email (La Rivoluzione dell'Upload)
- **Il Problema:** Anche aprendo la Web App dal cellulare, l'upload di PDF/foto richiede comunque 3-4 tap di troppo per un avvocato in tribunale.
- **La Soluzione:** Sfruttare **Telegram** come "ponte" diretto con il database di Dikast.
- **Workflow Realizzato:**
  1. L'utente manda un file PDF (es. "Sentenza.pdf") o una foto al Bot Telegram `@DikastBot`.
  2. Il Bot riconosce l'utente (tramite un codice segreto di "pairing" generato dall'app).
  3. Il Bot salva *immediatamente* il file nel cloud Storage e inserisce il record nella tabella `documents` assegnandolo alla "Quick Inbox" dell'utente.
  4. Il Bot risponde su Telegram con una tastiera inline (pulsanti) chiedendo: "In quale fascicolo lo metto?". Mostra la lista dei fascicoli aperti dell'utente.
  5. Con un solo tap su Telegram, il documento viene spostato dalla Inbox al Fascicolo corretto!

### 📧 Gestione Email Automatizzate (Inbound Parse)
- Abbiamo progettato l'estensione naturale del Bot: le **Email**.
- L'utente potrà inoltrare le email dei colleghi a `inbox-suoid@dikast.app` (o simile).
- **Architettura Scelta:** 
  - Inizialmente testato SendGrid, ma scartato immediatamente per i filtri antifrode troppo aggressivi (account bannato al secondo 0).
  - Passaggio definitivo a **Resend.com**.
  - **Funzionamento:** Resend riceverà l'email via MX Record, separerà gli allegati (PDF, Word, Immagini) e invierà un Webhook al nostro server Next.js. Il server salverà i file e *sveglierà il Bot Telegram* inviando una notifica push all'avvocato: "Hai appena inoltrato una mail con 3 allegati. Dove li metto?".

### ✅ Azioni Eseguite
- [x] Configurazione Supabase Auth & Storage
- [x] Creazione Webhook Telegram (`/api/telegram/webhook`)
- [x] Implementazione Pairing (Account linking Telegram-Dikast)
- [x] Gestione Ricezione Documenti/Foto via Telegram
- [x] Generazione Tastiera Inline per Assegnazione Rapida ai Fascicoli
- [ ] Configurazione Resend Inbound Parse e Webhook

---

*Ultimo aggiornamento: 27 Maggio 2026*
