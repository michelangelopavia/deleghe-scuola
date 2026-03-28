# Setup e Deployment - Autorizzazioni Scuola

## ✅ Problema risolti

### 1. **better-sqlite3 non installabile su Windows**
- **Soluzione**: Sostituito con `sqlite3` che ha pre-built binaries per Windows
- **File creato**: `server/db-wrapper.js` - wrapper che fornisce API simile a better-sqlite3 ma con sqlite3
- **Vantaggi**: Funziona in locale su Windows e in produzione su Railway

### 2. **concurrently non trovato**
- **Status**: ✅ Già presente in `devDependencies`
- **Uso**: `npm run dev` lancia server + client in parallelo

### 3. **Deploy su Railway fallisce**
- **Soluzione**: Aggiornato `nixpacks.toml` e `railway.json` con configurazione corretta
- **Build tools aggiunti**: Python, GCC (necessari per compilare sqlite3)

---

## 🚀 Avvio in locale

### Prerequisiti
- **Node.js >= 18** (scarica da https://nodejs.org/)
- **npm** (incluso con Node.js)

### Installazione dipendenze

```bash
# Dalla cartella autorizzazioni-scuola/
npm install                    # Installa dipendenze backend
cd client && npm install       # Installa dipendenze frontend
cd ..                          # Torna alla cartella principale
```

### Avvio server + client
```bash
npm run dev
```

Questo comando start:
- **Backend (server)** sulla porta **3001** (Express + SQLite)
- **Frontend (client)** sulla porta **3000** (React dev server)

Il client automaticamente proxypasserà le richieste API a `http://localhost:3001` (vedi `client/package.json: "proxy"`)

### Accesso all'app
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:3001/api/delegati

---

## 🏗️ Struttura del progetto

```
autorizzazioni-scuola/
├── server/
│   ├── index.js              # Express backend, API routes, PDF generation
│   ├── db-wrapper.js         # Wrapper sqlite3 (async API)
│   └── database.db           # SQLite database (creato automaticamente)
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── components/
│       │   ├── GeneraPDF.js
│       │   └── GestisciDelegati.js
│       └── ...
├── package.json              # Scripts: dev, build, install-all
├── nixpacks.toml             # Config per build su Railway
├── railway.json              # Config deploy su Railway
└── README.md
```

---

## 🛢️ Database

Il database SQLite viene creato automaticamente all'avvio del server se non esiste.

### Tabelle create
1. **delegati** - Gestore dei delegati autorizzati
2. **classi** - Classi scolastiche

### Posizione file database
- **Locale**: `server/database.db`
- **Railway**: Definito da variabile `DB_PATH` environment

---

## 🚢 Deployment su Railway

### Prerequisiti
1. Account Railway (https://railway.app)
2. GitHub repo collegato a Railway
3. Varaabili di ambiente configurate

### Configurazione Railway

Il deployment usa **Nixpacks** per il build. La configurazione è in:
- `nixpacks.toml` - Fasi di build (setup, install, build, deploy)
- `railway.json` - URL schema + start command

### Build process automatico
```
1. Setup: Installa Node.js 20, Python 3, GCC (per sqlite3)
2. Install: npm run install-all (root + client)
3. Build: npm run build (build React)
4. Start: npm start (avvia server Node.js in produzione)
```

### Start su Railway
Il comando di start serve:
- **API backend** sulla porta `$PORT` (Railway assegna porta automatica)
- **Frontend build** servito come static files

### Variabili di ambiente consigliate
```env
NODE_ENV=production
PORT=3001                # Opzionale (Railway assegna automatica)
DB_PATH=/tmp/data.db     # TODO: configurare persistent volume per prod
```

**⚠️ Nota importante**: Il database su Railway attualmente è locale (in `/tmp`). Per produzione, configurare un persistent volume o database esterno (PostgreSQL).

---

## 📝 API Endpoints

### GET /api/delegati
Recupera lisada tutti i delegati
```bash
curl http://localhost:3001/api/delegati
```

### GET /api/delegati/:id
Recupera un delegato specifico

### POST /api/delegati
Crea un nuovo delegato
```bash
curl -X POST http://localhost:3001/api/delegati \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mario",
    "cognome": "Rossi",
    "nato_a": "Palermo",
    "data_nascita": "1980-01-15",
    "residente_a": "Palermo",
    "indirizzo": "Via Roma",
    "numero_civico": "123",
    "doc_numero": "AB12345678",
    "doc_rilasciato_da": "Questura di Palermo",
    "doc_data": "2020-03-10"
  }'
```

### PUT /api/delegati/:id
Aggiorna un delegato

### DELETE /api/delegati/:id
Elimina un delegato

### POST /api/genera-pdf
Genera PDF di autorizzazione al prelievo
```bash
curl -X POST http://localhost:3001/api/genera-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "genitore_nome": "Anna",
    "genitore_cognome": "Bianchi",
    "alunno_nome": "Luca",
    "alunno_cognome": "Bianchi",
    "alunno_nato_a": "Palermo",
    "alunno_data_nascita": "2015-06-20",
    "alunno_classe": "3A",
    "alunno_scuola": "primaria",
    "delegato_id": "<UUID-delegato>",
    "autorizza_recapiti": true,
    "data_modulo": "2026-03-28"
  }'
```

---

## 🔄 Script npm

```bash
npm start              # Produzione: server Node.js
npm run dev           # Sviluppo: server + client con nodemon/HMR
npm run build         # Produzione: build React per deployment
npm run install-all   # Installa root + client dipendenze
```

---

## 🐛 Troubleshooting

### Errore: "Cannot find module sqlite3"
```bash
# Soluzone: reinstalla dipendenze
rm -r node_modules package-lock.json
npm install
```

### Errore: "Port 3001 already in use"
```bash
# Trova il processo sulla porta 3001 e kill it
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

### Server non connette al database
- Verificare che `server/database.db` possa essere creato nel server/
- Verificare permessi sulla folder

### Build su Railway fallisce
- Verificare che nixpacks.toml sia presente
- Verificare package.json scripts
- Controllare Railway logs: `railway logs`

---

## 📦 Dipendenze principali

### Backend
- **express** - Web framework
- **sqlite3** - Database (sostituisce better-sqlite3)
- **pdfkit** - PDF generation
- **cors** - CORS middleware
- **uuid** - ID generation
- **nodemon** (dev) - Auto-reload server

### Frontend
- **react** - UI framework
- **react-scripts** - Build tools
- **react-dom** - React DOM rendering

---

## 🔐 Sicurezza & Note

1. **Database in memoria**: Attualmente locale. Per produzione, usare database persistente
2. **CORS**: Configurato per dev. Aggiungere whitelist per produzione
3. **PDF**: Generati lato server con dati client
4. **Validazione**: Implementare validazione client + server per dati sensibili

---

## ✅ Checklist Pre-Deployment

- [ ] Testare `npm run dev` in locale con dati di test
- [ ] Testare generazione PDF
- [ ] Aggiornare README.md con istruzioni utenti
- [ ] Configurare persistent volume su Railway per database
- [ ] Aggiungere environment variables su Railway
- [ ] Testare deploy su Railway
- [ ] Verificare CORS whitelist per produzione
- [ ] Aggiungere HTTPS (Railway lo fa automatico)

---

## 📞 Supporto

Per problemi: Controllare Railway logs e console browser (F12)

