# Credenziali Master & Infrastruttura Contabo

## VPS Contabo
- **IP:** 86.48.3.76
- **SSH Port:** 22
- **Dominio Principale Test:** kallos.dani-sys.it

## Report Porte Occupate su Contabo
- **22:** SSH (Accesso al server)
- **80 / 443:** Nginx (Web Server per i vari domini, tra cui kallos.dani-sys.it)
- **5432:** PostgreSQL (Database Server, contiene già un database doxen_db)
- **3000:** Node.js (dani-sys-api - API della Dashboard Pagamenti)
- **3001:** Next.js Server (Probabilmente frontend di Doxen o altro progetto)
- **3002:** Next.js Server (Un altro progetto)
- **4000:** Docker (Il nostro nuovo Kallos Web)
- **8000, 8001, 8002, 8003:** Python3 (API Python per GeoRilievo, Kervio o simili)
- **8085:** Nginx (Servizio alternativo/Pannello)

> **Nota Strategica per i prossimi progetti:**
> Utilizzare le porte `4001, 4002, 4003`, ecc., in modo da lasciare libere le 300x ed avere una divisione chiara!

## Credenziali Twilio
- Le credenziali Twilio fornite precedentemente per l'integrazione WhatsApp/SMS devono essere inserite nell'ambiente `webapp/.env`. Attualmente il `.env` richiede `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, e `TWILIO_PHONE_NUMBER`.

## Email Verification & Servizi Doxen (SMTP)
Queste credenziali sono state attivate in `webapp/.env` per gestire il recupero password e la verifica email di Kallos. Saranno il punto di partenza anche per pulire il programma **Doxen** su `doxen.dani-sys.it`.
- **Server:** smtps.aruba.it
- **Porta:** 465
- **Utente:** admin@dani-sys.it
- **Password:** Kakaroth5$

> **Nota per il futuro allineamento (Doxen & API):** Le varie API contenute nella cartella "Documenti/api" andranno strutturate in modo coerente dopo aver terminato i test su Kallos, evitando sovrapposizioni di porte!

