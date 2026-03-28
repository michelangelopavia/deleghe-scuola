# Amministrazione - Gestisci Delegati

## 🔐 Accesso Piano Admin

La sezione di amministrazione è **protetta da password** ed è accessibile tramite link separato.

### **URL di Accesso:**
```
http://localhost:3000/?admin=1     ← In sviluppo
https://autorizzazioni-scuola.railway.app/?admin=1  ← In produzione
```

### **Password:**
```
MichelangeloPavia15
```

---

## 📋 Cosa Puoi Fare nell'Amministrazione

Una volta loggato, hai accesso a **GestisciDelegati** dove puoi:

✅ **Visualizzare** - Lista completa di tutti i delegati registrati  
✅ **Aggiungere** - Nuovo delegato manualmente  
✅ **Modificare** - Dati di un delegato esistente  
✅ **Eliminare** - Rimuovere un delegato dalla lista  

---

## 🚀 Flusso di Utilizzo

### **Scenario 1: Aggiungere un delegato manualmente**
1. Vai a `http://localhost:3000/?admin=1`
2. Inserisci password: `MichelangeloPavia15`
3. Click "Aggiungi delegato"
4. Compila form e salva

### **Scenario 2: Modificare dati di un delegato**
1. Accedi a `?admin=1`
2. Trova il delegato nella lista
3. Click su "Modifica" o sul nome
4. Aggiorna i dati e salva

### **Scenario 3: Eliminare un delegato (errore di registrazione)**
1. Accedi a `?admin=1`
2. Trova il delegato nella lista
3. Click "Elimina"
4. Conferma eliminazione

---

## 💻 Implementazione Tecnica

### **File Interessati:**
- `client/src/App.js` - Login logic, protezione password
- `client/src/components/GestisciDelegati.js` - Interfaccia admin

### **Sicurezza:**
- **Password**: Memorizzata come costante nel codice React
- **Sessione**: Usa `sessionStorage` - la sessione si chiude quando chiudi il browser
- **Live**: In produzione su Railway, accesso via HTTPS (crittografato)

### **Login Flow:**
1. URL contiene `?admin=1`
2. Se non ancora loggato → mostra form password
3. Se password corretta → salva in sessionStorage e mostra GestisciDelegati
4. Click "🚪 Esci" → rimuove sessionStorage e chiede password di nuovo

---

## 🔒 Note di Sicurezza

### **Fattori di Protezione:**
- ✅ **Password**: Chiunque senza password non può accedere
- ✅ **Sessione**: Disconnessione automatica quando chiudi il browser
- ✅ **HTTPS**: Railway usa HTTPS in produzione (crittografico)

### **Limitazioni Attuali:**
- ⚠️ Password in testo nella app (non è uno schema di sicurezza enterprise)
- ⚠️ Non c'è log delle azioni (chi ha eliminato cosa/quando)
- ⚠️ Non c'è 2FA (autenticazione a due fattori)

### **Se Vuoi Aumentare la Sicurezza:**
- [ ] Aggiungere log di audit (traccia eliminazioni)
- [ ] Email di notifica quando delegati vengono aggiunti/eliminati
- [ ] Cambio password periodico
- [ ] Sistema di auth più robusto (JWT token, database users)

---

## 🔑 Gestione Password

### **Dove Cambiarla:**
La password è hardcoded in [client/src/App.js](client/src/App.js#L6):
```javascript
const ADMIN_PASSWORD = 'MichelangeloPavia15';
```

Per cambiarla:
1. Apri il file
2. Sostituisci `'MichelangeloPavia15'` con la nuova password
3. Salva e rebuild (se su Railway: push a GitHub per rebuild automatico)

### **Suggerimento:**
Scegli una password:
- Facile da ricordare (è per uso personale)
- Diversa da password di email/bank
- Lunga almeno 8 caratteri

---

## 📱 Accesso da Mobile

Puoi accedere dall'admin link anche da smartphone:
```
Copia il link: http://localhost:3000/?admin=1
Condividi via QR code o email
```

Funziona perfettamente su mobile!

---

## ❓ Domande Frequenti

**D: Cosa succede se dimentico la password?**  
R: La password è nel codice. Puoi leggerla in App.js oppure contattare lo sviluppatore.

**D: La sessione admin quanto dura?**  
R: Fino a quando il browser è aperto. Se chiudi il browser, devi re-inserire la password.

**D: Posso dare accesso admin a qualcun altro?**  
R: Sì, condividigli il link `?admin=1` e la password.

**D: È sicuro su Railway?**  
R: Sì, la connessione è HTTPS crittografata. Non scambiare password via chat.
