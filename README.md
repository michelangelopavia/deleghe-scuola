# Autorizzazioni Prelievo Alunni
### Istituto Valdese La Noce · Palermo

Strumento per generare automaticamente i moduli di autorizzazione al prelievo degli alunni, compilati con i dati dei delegati salvati in precedenza.

---

## Come funziona

1. **Sezione Delegati** → aggiungi una volta sola i dati anagrafici delle persone delegate (altri genitori, nonni, ecc.)
2. **Sezione Genera modulo** → scegli il delegato, inserisci i dati del tuo figlio/a, scarica il PDF già compilato
3. **Stampa, firma e consegna** in segreteria

---

## Deploy su Railway (5 minuti)

### Prerequisiti
- Account [GitHub](https://github.com)
- Account [Railway](https://railway.app) (gratuito)

### Passaggi

**1. Crea il repository su GitHub**
```bash
cd autorizzazioni-scuola
git init
git add .
git commit -m "primo commit"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/autorizzazioni-scuola.git
git push -u origin main
```

**2. Deploy su Railway**
1. Vai su [railway.app](https://railway.app) e accedi con GitHub
2. Clicca **"New Project"** → **"Deploy from GitHub repo"**
3. Seleziona il repository `autorizzazioni-scuola`
4. Railway detecta automaticamente la configurazione e fa il deploy
5. Vai su **Settings → Networking → Generate Domain** per ottenere il tuo URL pubblico

**3. Variabili d'ambiente (opzionale)**
In Railway → Variables, puoi aggiungere:
- `DB_PATH` → percorso personalizzato per il database (default: `./server/database.db`)

### URL finale
Otterrai un URL tipo: `https://autorizzazioni-scuola-production.up.railway.app`

Condividilo con i genitori della classe via WhatsApp! 🎉

---

## Sviluppo locale

```bash
# Installa dipendenze
npm run install-all

# Avvia in modalità sviluppo (backend :3001 + frontend :3000)
npm run dev
```

---

## Stack tecnico
- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **PDF**: PDFKit
- **Hosting**: Railway (gratuito)

---

*Strumento non ufficiale sviluppato a supporto delle famiglie.*
